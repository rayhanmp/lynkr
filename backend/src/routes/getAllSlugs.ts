import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db';
import { urls } from '../db/schema';

export default async function getAllSlugsRoute(app: FastifyInstance) {
  app.get('/slugs', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const allSlugs = await db.select({
        id: urls.id,
        slug: urls.slug,
        targetUrl: urls.targetUrl,
        isActive: urls.isActive,
        createdAt: urls.createdAt,
        updatedAt: urls.updatedAt
      }).from(urls);

      return reply.send({ 
        success: true,
        count: allSlugs.length,
        slugs: allSlugs 
      });
    } catch (error) {
      app.log.error({ error }, 'Failed to fetch slugs');
      return reply.code(500).send({ 
        success: false,
        error: 'Failed to fetch slugs' 
      });
    }
  });
} 