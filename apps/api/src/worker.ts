import { Worker } from 'bullmq';
import { appConfig } from './config/env';
import { ConsoleEmailProvider, ConsoleSmsProvider } from './queue/providers';

const emailProvider = new ConsoleEmailProvider();
const smsProvider = new ConsoleSmsProvider();

type NotificationJob =
  | { type: 'email'; payload: { to: string; subject: string; html: string } }
  | { type: 'sms'; payload: { to: string; message: string } };

const worker = new Worker<NotificationJob>(
  'notifications',
  async (job) => {
    if (job.data.type === 'email') {
      await emailProvider.send(job.data.payload);
    }
    if (job.data.type === 'sms') {
      await smsProvider.send(job.data.payload);
    }
  },
  { connection: { host: appConfig.redisUrl } as unknown as { host: string } },
);

worker.on('ready', () => {
  // eslint-disable-next-line no-console
  console.info('Notification worker ready');
});

worker.on('failed', (job, err) => {
  // eslint-disable-next-line no-console
  console.error('Notification worker failed', job?.id, err);
});
