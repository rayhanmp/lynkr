import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { urls } from '../db/schema';
import { eq } from 'drizzle-orm';

const schema = z.object({
  id: z.number().int().positive(),
  newSlug: z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/),
});

export default async function updateSlugRoute(app: FastifyInstance) {
  app.patch('/update-slug', async (req: FastifyRequest, reply: FastifyReply) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid input' });
    }
    const { id, newSlug } = parsed.data;
    try {
      const result = await db.update(urls)
        .set({ slug: newSlug })
        .where(eq(urls.id, id));
      if (result.rowCount === 0) {
        return reply.code(404).send({ error: 'URL not found' });
      }
      return reply.send({ success: true, newSlug });
    } catch (err: any) {
      if (err.code === '23505') {
        return reply.code(409).send({ error: 'Slug already exists' });
      }
      return reply.code(500).send({ error: 'Database update failed' });
    }
  });
}
