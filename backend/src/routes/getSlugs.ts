import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db';
import { urls } from '../db/schema';
import { eq } from 'drizzle-orm';

export default async function getSlugsRoute(app: FastifyInstance) {
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
  
  app.get('/slugs/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = req.params;
    const slug = await db.select().from(urls).where(eq(urls.id, parseInt(id, 10)));
    if (!slug) {
      return reply.code(404).send({ error: 'Slug not found' });
    }
    return reply.send({ success: true, slug });
  });
} 