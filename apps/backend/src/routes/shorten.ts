import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createLinkSchema, type CreateLinkData } from '@lynkr/shared';
import { db } from '../db';
import { urls } from '../db/schema';
import { nanoid } from 'nanoid';
import { config } from '../config/config';
import bcrypt from 'bcrypt';

export default async function shortenRoute(app: FastifyInstance) {
  app.post('/shorten', async (req: FastifyRequest, reply: FastifyReply) => {
    const parsed = createLinkSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid input' });
    }

    const { url, customSlug, userId, passwordProtected, password } = parsed.data;
    const normalisedUrl = new URL(url.trim()).href.replace(/\/+$/, '');
    const baseUrl = config.BASE_URL;
    
    // Hash password if provided
    let passwordHash: string | undefined;
    if (passwordProtected && password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    if (customSlug) {
        try {
            await db.insert(urls).values({ 
              slug: customSlug, 
              targetUrl: normalisedUrl,
              userId,
              passwordProtected,
              passwordHash
            });
            return reply.send({ shortUrl: `${baseUrl}/${customSlug}` });
          } catch (err: any) {
            if (err.cause?.code === '23505') {
              return reply.code(409).send({ error: 'Slug already exists' });
            }
            return reply.code(500).send({ error: 'Database insert failed' });
          }} 
    else {
        let attempts = 0;
        while (attempts < config.MAX_COLLISION_RETRIES) {
            const generatedSlug = nanoid(config.GENERATED_SLUG_LENGTH);
            try {
                await db.insert(urls).values({ 
                  slug: generatedSlug, 
                  targetUrl: normalisedUrl,
                  userId,
                  passwordProtected,
                  passwordHash
                });
                app.log.info({ generatedSlug }, 'Slug generated successfully');
                return reply.send({ shortUrl: `${baseUrl}/${generatedSlug}` });
            } catch (err: any) {
                if (err.cause?.code === '23505') {
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
