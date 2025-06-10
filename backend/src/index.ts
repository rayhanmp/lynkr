import Fastify from 'fastify';

const app = Fastify();

app.get('/health', async () => {
  return { status: 'ok' };
});

app.listen({ port: 3000 }, () => {
  console.log('Lynkr running on http://localhost:3000');
});
