import { createServer } from 'http';
import { createApp } from './app';
import { appConfig } from './config/env';
import { prisma } from './lib/prisma';

async function bootstrap() {
  await prisma.$connect();
  const app = createApp();
  const server = createServer(app);
  server.listen(appConfig.port, () => {
    // eslint-disable-next-line no-console
    console.info(`API listening on http://localhost:${appConfig.port}`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start API', err);
  process.exit(1);
});
