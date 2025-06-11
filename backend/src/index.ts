import Fastify from 'fastify';
import { db } from './db';
import { urls } from './db/schema';
import { eq } from 'drizzle-orm';
import shortenRoute from './routes/shorten';

const app = Fastify();

app.register(shortenRoute);

app.get('/:slug', async (req, reply) => {
    const { slug } = req.params as { slug: string };
  
    const result = await db.select().from(urls).where(eq(urls.slug, slug));
    if (!result.length) return reply.code(404).send({ error: 'Not found' });
  
    return reply.redirect(result[0].targetUrl);
  });

app.listen({ port: 3000 }, () => {
  console.log('Lynkr running on http://localhost:3000');
});