import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { users } from '../db/schema';
import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import rateLimit from '@fastify/rate-limit';


const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(64, 'Password is too long'),
});

export default async function authRoute(app: FastifyInstance) {
  await app.register(rateLimit, {
    max: 50,
    timeWindow: '5 minute', 
    keyGenerator: (request) => {
      return `${request.ip}-${request.url}`;
    },
    errorResponseBuilder: (request, context) => {
      return {
        code: 429,
        error: 'Too Many Requests',
        message: `Rate limit exceeded, please try again later`,
        date: Date.now(),
        expiresIn: context.after
      }
    }
  });

  app.post('/api/register', async (req: FastifyRequest, reply: FastifyReply) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid input', details: parsed.error.format() });
    }

    const { name, email, password } = parsed.data;

    try {
      // Check if email already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email)
      });

      if (existingUser) {
        return reply.code(409).send({ error: 'Email already registered' });
      }

      // Generate username from email (you might want to make this more sophisticated)
      const username = email.split('@')[0];

      // Hash password with Argon2
      const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id, // Using Argon2id variant
        memoryCost: 2 ** 16, // 64 MiB
        timeCost: 3, // Number of iterations
        parallelism: 1, // Degree of parallelism
      });

      // Create user
      const [user] = await db.insert(users).values({
        fullname: name,
        username,
        email,
        passwordHash,
      }).returning();

      // Remove sensitive data before sending response
      const { passwordHash: _, ...userWithoutPassword } = user;

      return reply.code(201).send({
        message: 'User registered successfully',
        user: userWithoutPassword
      });
    } catch (err: any) {
      app.log.error({ err }, 'Error during user registration');
      return reply.code(500).send({ error: 'Failed to register user' });
    }
  });

  app.post('/api/check-email', {
    config: {
      rateLimit: {
        max: 50,
        timeWindow: '1 minute',
        skipOnError: true,
        errorResponseBuilder: (request, context) => {
          return {
            code: 429,
            error: 'Too Many Requests',
            message: 'Too many requests, please try again later',
            date: Date.now(),
          }
        }
      }
    }
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const emailSchema = z.object({ email: z.string().email() });
    const parsed = emailSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid email' });
    }

    const { email } = parsed.data;
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    return reply.send({ 
      status: existingUser ? 'unavailable' : 'available',
    });
  });
} 