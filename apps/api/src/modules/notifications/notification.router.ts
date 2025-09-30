import { Router } from 'express';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { notificationService } from './notification.service';
import { UserRole } from '@prisma/client';

export const notificationRouter = Router();

notificationRouter.get('/', authenticate(UserRole.SALES, UserRole.PRICING, UserRole.CSE, UserRole.SBU_HEAD, UserRole.MGMT, UserRole.ADMIN), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.id ?? 'system';
    const data = await notificationService.list(userId);
    res.json(data);
  } catch (error) {
    next(error);
  }
});
