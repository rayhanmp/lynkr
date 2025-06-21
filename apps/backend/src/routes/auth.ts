import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { registerSchema, loginSchema, emailSchema, type RegisterData, type LoginData, type EmailData } from '@lynkr/shared';
import { db } from '../db';
import { users } from '../db/schema';
import * as argon2 from 'argon2';
import { eq, and } from 'drizzle-orm';
import rateLimit from '@fastify/rate-limit';
import { nanoid } from 'nanoid';
import { Session, createSession, validateSessionToken, deleteSession, sessionExpiresInSeconds, createVerificationToken, sendVerificationEmail } from '../utils/authUtil';
import { createHash } from 'crypto';
import redis from '../services/redis';

// Declare module to add session and validatedBody to FastifyRequest
declare module 'fastify' {
  interface FastifyRequest {
    session?: Session;
    validatedBody?: any;
  }
}


async function validateRegisterInput(req: FastifyRequest, reply: FastifyReply) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.code(400).send({ error: 'Invalid input', details: parsed.error.format() });
  }
  req.validatedBody = parsed.data;
}

async function validateLoginInput(req: FastifyRequest, reply: FastifyReply) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.code(400).send({ error: 'Invalid input' });
  }
  req.validatedBody = parsed.data;
}

export async function validateSession(req: FastifyRequest, reply: FastifyReply) {
  const token = req.cookies.session_token;
  if (!token) {
    req.log.info('No session token found');
    return reply.code(401).send({ error: 'Unauthorized' });
  }
  
  const session = await validateSessionToken(token);
  if (!session) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
  
  req.session = session;
}

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

  app.post('/api/register', {
    preHandler: validateRegisterInput
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { name, email, password } = req.validatedBody!;
    
    const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id, // Using Argon2id variant
        memoryCost: 2 ** 16, // 64 MiB
        timeCost: 2, // Number of iterations
        parallelism: 1, // Degree of parallelism
      });
    const baseUsername = email.split('@')[0].slice(0, 10);

    const MAX_USERNAME_RETRIES_ATTEMPTS = 10;
    for (let i = 0; i < MAX_USERNAME_RETRIES_ATTEMPTS; i++) {
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
        const verificationToken = await createVerificationToken(user.id);
        const resend = await sendVerificationEmail(user.email, verificationToken);
        app.log.info(resend);
        app.log.info('Verification email sent to ' + user.email);
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

  const user = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (!user) {
    return reply.code(401).send({ error: 'Invalid credentials' });
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

  app.post('/api/login', {
    preHandler: validateLoginInput
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = req.validatedBody!;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (!user) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const passwordMatch = await argon2.verify(user.passwordHash, password);

    if (!passwordMatch) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const session = await createSession(user.id);

    reply.setCookie('session_token', session.token, {
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: sessionExpiresInSeconds,
      });
      
    return reply.code(200).send({ message: 'Logged in' });
  });

    app.post('/api/logout', {
      config: {
        rateLimit: {
          max: 20,
          timeWindow: '1 minute'
        }
      }
    }, async (req: FastifyRequest, reply: FastifyReply) => {
        const token = req.cookies.session_token;
        if (token) {
          const sessionId = token.split(":")[0];
          await deleteSession(sessionId);
          reply.clearCookie('session_token');
        }
        return reply.code(200).send({ message: 'Logged out' });
      });

    app.get('/api/me', {
      preHandler: validateSession
    }, async (req: FastifyRequest, reply: FastifyReply) => {
        const user = await db.query.users.findFirst({
            where: eq(users.id, req.session!.userId)
        });
        if (!user) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }
        const safeUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.fullname,
            isVerified: user.isVerified,
        };
    
        return reply.code(200).send({ user: safeUser });
    });

    app.get('/api/verify', async (req: FastifyRequest, reply: FastifyReply) => {

      const { token } = req.query as { token: string };
      const hashedToken = createHash('sha256').update(token, 'utf8').digest('hex');

      const userId = await redis.get(`verify:${hashedToken}`);
      if (!userId) {
        req.log.info({ ip: req.ip, ua: req.headers['user-agent'] }, 'Invalid token');
        return reply.redirect('/login?verify=invalid');
      }
      
      // Delete the token after successful retrieval to prevent reuse
      await redis.del(`verify:${hashedToken}`);

      const { rowCount } = await db
        .update(users)
        .set({ isVerified: true, verifiedAt: new Date() })
        .where(and(eq(users.id, userId), eq(users.isVerified, false)));

      req.log.info(
        { userId, rowCount, ip: req.ip },
        rowCount ? 'Email verified' : 'Email already verified'
      );
      
      return reply.redirect('/login?verify=success');

    });
} 