import { Queue } from 'bullmq';
import { appConfig } from '../config/env';
import { ConsoleEmailProvider, ConsoleSmsProvider, EmailPayload, SmsPayload } from './providers';

type NotificationJob =
  | { type: 'email'; payload: EmailPayload }
  | { type: 'sms'; payload: SmsPayload };

const connection = { connection: appConfig.redisUrl } as unknown as {
  connection: string;
};

export const notificationQueue = new Queue<NotificationJob>('notifications', connection);

const emailProvider = new ConsoleEmailProvider();
const smsProvider = new ConsoleSmsProvider();

export async function dispatchNotification(job: NotificationJob): Promise<void> {
  await notificationQueue.add(job.type, job, { removeOnComplete: true });
  switch (job.type) {
    case 'email':
      await emailProvider.send(job.payload);
      break;
    case 'sms':
      await smsProvider.send(job.payload);
      break;
    default:
      break;
  }
}
