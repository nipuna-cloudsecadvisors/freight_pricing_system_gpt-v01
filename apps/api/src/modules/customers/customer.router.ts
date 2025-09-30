import { Router } from 'express';
import { z } from 'zod';
import { CustomerApprovalStatus, UserRole } from '@prisma/client';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { customerService } from './customer.service';

export const customerRouter = Router();

customerRouter.get('/', authenticate(UserRole.ADMIN, UserRole.SALES, UserRole.CSE), async (_req, res, next) => {
  try {
    const data = await customerService.list();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

customerRouter.post('/', authenticate(UserRole.SALES, UserRole.ADMIN), async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({ name: z.string().min(3), contacts: z.any().optional() });
    const parsed = schema.parse(req.body);
    const result = await customerService.create(parsed as never, req.user?.id ?? 'system');
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

customerRouter.post('/:id/approve', authenticate(UserRole.ADMIN), async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({ status: z.nativeEnum(CustomerApprovalStatus) });
    const { status } = schema.parse(req.body);
    const result = await customerService.approve(req.params.id, req.user?.id ?? 'system', status);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
