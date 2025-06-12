import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db';
import { urls } from '../db/schema';
import { eq } from 'drizzle-orm';
import redis from '../services/redis';

export default async function redirectRoute(app: FastifyInstance) {
  app.get('/:slug', async (req: FastifyRequest, reply: FastifyReply) => {
    const { slug } = req.params as { slug: string };
    const cached = await redis.get(`slug:${slug}`);
    if (cached) {
      return reply.redirect(cached);
    }
    const result = await db.select().from(urls).where(eq(urls.slug, slug));
    if (!result.length) return reply.code(404).send({ error: 'Not found' });

    redis.set(`slug:${slug}`, result[0].targetUrl).catch(err => {
      app.log.warn({ err }, 'Failed to cache slug');
    });

    return reply.redirect(result[0].targetUrl);
  });
}
