import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { users } from '../db/schema';
import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import rateLimit from '@fastify/rate-limit';
import { nanoid } from 'nanoid';


const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name is too long'),
  email: z.string().email().max(255).pipe(z.string().transform(val => val.trim().toLowerCase())),
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
    
    const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id, // Using Argon2id variant
        memoryCost: 2 ** 16, // 64 MiB
        timeCost: 2, // Number of iterations
        parallelism: 1, // Degree of parallelism
      });
    const baseUsername = email.split('@')[0].slice(0, 10);

    const MAX_ATTEMPTS = 10;
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const username = `${baseUsername}${nanoid(4)}`;
        try {
        const [user] = await db.insert(users).values({
            fullname: name,
            username,
            email,
            passwordHash,
        }).returning();

        const safeUser = {
            username: user.username,
            email: user.email,
            name: user.fullname,
        };

        app.log.info('User registered successfully');
        return reply.code(201).send({
            message: 'User registered successfully',
            user: safeUser
        });
        } catch (err: any) {      
            // Check for unique constraint violation
            if (err.cause?.code === '23505') {
                const detail = err.cause.detail;
                if (detail?.includes('(email)')) {
                    return reply.code(409).send({ error: 'Email already registered' });
                }
                if (detail?.includes('(username)')) {
                    app.log.info('Username collision, retrying... - Attempt ' + (i + 1));
                    continue;
                }
            }
            app.log.warn({ err }, 'Failed to register user');
            return reply.code(500).send({ error: 'Failed to register user' });
    }
  }
  app.log.error('Failed to generate a unique username after multiple attempts');
  return reply.code(500).send({ error: 'Failed to generate a unique username after multiple attempts' });
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
    const emailSchema = z.object({
        email: z.string().email().max(255).pipe(z.string().transform(val => val.trim().toLowerCase()))
      });

    const parsed = emailSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid email' });
    }
    
    const { email } = parsed.data;
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    });
    
    req.log.info({
        ip: req.ip,
        email: email.replace(/(?<=.).(?=[^@]*?@)/g, '*'),
        status: existingUser ? 'unavailable' : 'available'
      }, 'Email availability check');

    return reply.send({ 
      status: existingUser ? 'unavailable' : 'available',
    });
    
  });
} 