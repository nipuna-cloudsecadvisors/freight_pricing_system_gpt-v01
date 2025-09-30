import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { authenticate } from '../../middleware/auth';
import { UserRole } from '@prisma/client';

export const masterRouter = Router();

masterRouter.get('/ports', authenticate(UserRole.ADMIN, UserRole.SALES, UserRole.PRICING, UserRole.CSE), async (_req, res, next) => {
  try {
    const ports = await prisma.port.findMany();
    res.json(ports);
  } catch (error) {
    next(error);
  }
});

masterRouter.post('/ports', authenticate(UserRole.ADMIN), async (req, res, next) => {
  try {
    const schema = z.object({ unlocode: z.string(), name: z.string(), country: z.string() });
    const parsed = schema.parse(req.body);
    const result = await prisma.port.create({ data: parsed });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

masterRouter.get('/trade-lanes', authenticate(UserRole.ADMIN, UserRole.PRICING, UserRole.SALES), async (_req, res, next) => {
  try {
    const lanes = await prisma.tradeLane.findMany();
    res.json(lanes);
  } catch (error) {
    next(error);
  }
});

masterRouter.post('/trade-lanes', authenticate(UserRole.ADMIN), async (req, res, next) => {
  try {
    const schema = z.object({ region: z.string(), name: z.string(), code: z.string() });
    const parsed = schema.parse(req.body);
    const lane = await prisma.tradeLane.create({ data: parsed });
    res.status(201).json(lane);
  } catch (error) {
    next(error);
  }
});

masterRouter.get('/equipment-types', authenticate(UserRole.ADMIN, UserRole.PRICING, UserRole.SALES), async (_req, res, next) => {
  try {
    const data = await prisma.equipmentType.findMany();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

masterRouter.post('/equipment-types', authenticate(UserRole.ADMIN), async (req, res, next) => {
  try {
    const schema = z.object({ name: z.string(), isReefer: z.boolean().optional(), isFlatRackOpenTop: z.boolean().optional() });
    const parsed = schema.parse(req.body);
    const result = await prisma.equipmentType.create({ data: parsed });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

masterRouter.get('/shipping-lines', authenticate(UserRole.ADMIN, UserRole.PRICING, UserRole.SALES), async (_req, res, next) => {
  try {
    const data = await prisma.shippingLine.findMany();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

masterRouter.post('/shipping-lines', authenticate(UserRole.ADMIN), async (req, res, next) => {
  try {
    const schema = z.object({ name: z.string(), code: z.string() });
    const parsed = schema.parse(req.body);
    const result = await prisma.shippingLine.create({ data: parsed });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});
