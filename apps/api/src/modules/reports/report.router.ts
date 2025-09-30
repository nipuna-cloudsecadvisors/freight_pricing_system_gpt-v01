import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { reportService } from './report.service';
import { UserRole } from '@prisma/client';

export const reportRouter = Router();

reportRouter.get('/response-time', authenticate(UserRole.MGMT, UserRole.SBU_HEAD, UserRole.ADMIN), async (_req, res, next) => {
  try {
    const data = await reportService.responseTime();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

reportRouter.get('/top-sps', authenticate(UserRole.MGMT, UserRole.SBU_HEAD, UserRole.ADMIN), async (_req, res, next) => {
  try {
    const data = await reportService.topSales();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

reportRouter.get('/status-cards', authenticate(UserRole.MGMT, UserRole.SBU_HEAD, UserRole.ADMIN, UserRole.PRICING), async (_req, res, next) => {
  try {
    const data = await reportService.statusCards();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

reportRouter.get('/dashboard/export-jpeg', authenticate(UserRole.MGMT, UserRole.SBU_HEAD, UserRole.ADMIN), async (_req, res) => {
  const placeholder = Buffer.from('export-jpeg-placeholder');
  res.setHeader('Content-Type', 'image/jpeg');
  res.send(placeholder);
});
