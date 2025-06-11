import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { urls } from '../db/schema';
import { nanoid } from 'nanoid';
import { config } from '../config/config';

const schema = z.object({
  url: z.string().url(),
  customSlug: z.string().min(1).regex(/^[a-zA-Z0-9_-]+$/).max(64).optional(),
});

export default async function shortenRoute(app: FastifyInstance) {
  app.post('/shorten', async (req: FastifyRequest, reply: FastifyReply) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid input' });
    }

    const { url, customSlug } = parsed.data;
    const normalisedUrl = new URL(url.trim()).href.replace(/\/+$/, '');
    const baseUrl = config.BASE_URL;

    if (customSlug) {
        try {
            await db.insert(urls).values({ slug: customSlug, targetUrl: normalisedUrl });
            return reply.send({ shortUrl: `${baseUrl}/${customSlug}` });
          } catch (err: any) {
            if (err.code === '23505') {
              return reply.code(409).send({ error: 'Slug already exists' });
            }
            return reply.code(500).send({ error: 'Database insert failed' });
          }} 
    else {
        let attempts = 0;
        while (attempts < config.MAX_COLLISION_RETRIES) {
            const generatedSlug = nanoid(config.GENERATED_SLUG_LENGTH);
            try {
                await db.insert(urls).values({ slug: generatedSlug, targetUrl: normalisedUrl });
                app.log.info({ generatedSlug }, 'Slug generated successfully');
                return reply.send({ shortUrl: `${baseUrl}/${generatedSlug}` });
            } catch (err: any) {
                if (err.code === '23505') {
                    attempts++;
                    app.log.warn({ err, attempts }, 'Slug collision detected');
                } else {
                    app.log.error({ err }, 'Unexpected error during slug generation');
                    throw err;
                }
            }
        }
        app.log.error({ attempts }, 'Failed to generate unique slug after maximum retries');
        return reply.code(500).send({ error: 'Failed to generate unique slug after maximum retries' });
    }
  });
}
