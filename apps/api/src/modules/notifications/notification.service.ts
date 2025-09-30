import { prisma } from '../../lib/prisma';

export class NotificationService {
  list(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const notificationService = new NotificationService();
