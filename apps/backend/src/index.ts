import Fastify from 'fastify';
import shortenRoute from './routes/shorten';
import redirectRoute from './routes/redirect';
import updateSlugRoute from './routes/updateSlug';
import getSlugsRoute from './routes/getSlugs';
import authRoute from './routes/auth';
import fastifyCookie from '@fastify/cookie';

const app = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty'
    }
  }
});

// Register CORS to allow frontend requests
app.register(import('@fastify/cors'), {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: true
});

app.log.info('Registering routes');
app.register(fastifyCookie);
app.register(shortenRoute);
app.register(redirectRoute);
app.register(updateSlugRoute);
app.register(getSlugsRoute);
app.register(authRoute);

app.listen({ port: 3000 }, () => {
  console.log('Lynkr running on http://localhost:3000');
});