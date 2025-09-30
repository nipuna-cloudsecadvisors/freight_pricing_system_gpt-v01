import { Router } from 'express';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { bookingService } from './booking.service';

export const bookingRouter = Router();

bookingRouter.get('/', authenticate(UserRole.SALES, UserRole.CSE, UserRole.ADMIN), async (_req, res, next) => {
  try {
    const data = await bookingService.list();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

const createSchema = z.object({
  id: z.string().optional(),
  raisedByUserId: z.string(),
  customerId: z.string(),
  rateSource: z.string(),
  linkId: z.string(),
});

bookingRouter.post('/', authenticate(UserRole.SALES, UserRole.ADMIN), async (req, res, next) => {
  try {
    const parsed = createSchema.parse(req.body);
    const rateSource = bookingService.ensureRateSource(parsed.rateSource);
    const result = await bookingService.create({ ...parsed, rateSource });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

bookingRouter.post('/:id/confirm', authenticate(UserRole.CSE, UserRole.SALES, UserRole.ADMIN), async (req, res, next) => {
  try {
    const result = await bookingService.confirm(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

bookingRouter.post('/:id/cancel', authenticate(UserRole.SALES, UserRole.ADMIN), async (req, res, next) => {
  try {
    const schema = z.object({ reason: z.string().min(1) });
    const { reason } = schema.parse(req.body);
    const result = await bookingService.cancel(req.params.id, reason);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

bookingRouter.post('/:id/ro', authenticate(UserRole.CSE, UserRole.ADMIN), async (req, res, next) => {
  try {
    const schema = z.object({ number: z.string(), fileUrl: z.string().url(), receivedAt: z.coerce.date() });
    const parsed = schema.parse(req.body);
    const result = await bookingService.attachRo(req.params.id, parsed as never);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

bookingRouter.post('/:id/open-erp-job', authenticate(UserRole.CSE, UserRole.ADMIN), async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({ erpJobNo: z.string().min(3) });
    const { erpJobNo } = schema.parse(req.body);
    const result = await bookingService.openJob(req.params.id, erpJobNo, req.user?.id ?? 'system');
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

bookingRouter.post('/jobs/:id/complete', authenticate(UserRole.CSE, UserRole.ADMIN), async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({ details: z.record(z.any()) });
    const { details } = schema.parse(req.body);
    const result = await bookingService.completeJob(req.params.id, req.user?.id ?? 'system', details);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});
