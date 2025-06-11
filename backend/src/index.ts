import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { db } from './db';
import { urls } from './db/schema';
import { eq } from 'drizzle-orm';
import shortenRoute from './routes/shorten';
import IORedis from 'ioredis';

const app = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty'
    }
  }
});

app.register(shortenRoute);
const redis = new IORedis(6432, '127.0.0.1');



app.get('/:slug', async (req: FastifyRequest, reply: FastifyReply) => {
    const { slug } = req.params as { slug: string };
    const cached = await redis.get(`slug:${slug}`);
    if (cached) {
        return reply.redirect(cached);
    }
    const result = await db.select().from(urls).where(eq(urls.slug, slug));
    if (!result.length) return reply.code(404).send({ error: 'Not found' });
  
    await redis.set(`slug:${slug}`, result[0].targetUrl);
    return reply.redirect(result[0].targetUrl);
  });

app.listen({ port: 3000 }, () => {
  console.log('Lynkr running on http://localhost:3000');
});