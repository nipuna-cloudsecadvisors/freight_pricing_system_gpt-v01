import { Router } from 'express';
import { z } from 'zod';
import { ItineraryStatus, ItineraryType, UserRole } from '@prisma/client';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { itineraryService } from './itinerary.service';

export const itineraryRouter = Router();

itineraryRouter.get('/', authenticate(UserRole.SALES, UserRole.CSE, UserRole.SBU_HEAD), async (_req, res, next) => {
  try {
    const data = await itineraryService.list();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

const baseSchema = z.object({
  type: z.nativeEnum(ItineraryType),
  weekStart: z.coerce.date(),
});

itineraryRouter.post('/', authenticate(UserRole.SALES, UserRole.CSE), async (req: AuthRequest, res, next) => {
  try {
    const parsed = baseSchema.parse(req.body);
    const result = await itineraryService.create(req.user?.id ?? 'system', {
      ...parsed,
      status: ItineraryStatus.DRAFT,
    } as never);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

itineraryRouter.post('/:id/submit', authenticate(UserRole.SALES, UserRole.CSE), async (req, res, next) => {
  try {
    const result = await itineraryService.submit(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

itineraryRouter.post('/:id/approve', authenticate(UserRole.SBU_HEAD), async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({ note: z.string().optional() });
    const { note } = schema.parse(req.body);
    const result = await itineraryService.approve(req.params.id, req.user?.id ?? 'system', note);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

itineraryRouter.post('/:id/reject', authenticate(UserRole.SBU_HEAD), async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({ note: z.string().min(1) });
    const { note } = schema.parse(req.body);
    const result = await itineraryService.reject(req.params.id, req.user?.id ?? 'system', note);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

const itemSchema = z.object({
  date: z.coerce.date(),
  customerId: z.string().optional(),
  leadId: z.string().optional(),
  purpose: z.string().min(3),
  plannedTime: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

itineraryRouter.post('/:id/items', authenticate(UserRole.SALES, UserRole.CSE), async (req, res, next) => {
  try {
    const parsed = itemSchema.parse(req.body);
    const result = await itineraryService.addItem(req.params.id, parsed as never);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

itineraryRouter.delete('/items/:id', authenticate(UserRole.SALES, UserRole.CSE), async (req, res, next) => {
  try {
    const result = await itineraryService.removeItem(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
