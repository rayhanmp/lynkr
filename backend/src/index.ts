import Fastify from 'fastify';
import shortenRoute from './routes/shorten';
import redirectRoute from './routes/redirect';

const app = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty'
    }
  }
});

app.log.info('Registering routes');
app.register(shortenRoute);
app.register(redirectRoute);

app.listen({ port: 3000 }, () => {
  console.log('Lynkr running on http://localhost:3000');
});