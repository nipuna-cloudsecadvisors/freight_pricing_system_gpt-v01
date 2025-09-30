import { Router } from 'express';
import { z } from 'zod';
import {
  DetentionFreeTime,
  RateRequestMode,
  RateRequestStatus,
  RateRequestType,
  RateStatus,
  UserRole,
} from '@prisma/client';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { rateService } from './rate.service';

const rateRouter = Router();

const rateFiltersSchema = z.object({
  region: z.string().optional(),
  pol: z.string().optional(),
  pod: z.string().optional(),
  service: z.string().optional(),
  equip: z.string().optional(),
  status: z.nativeEnum(RateStatus).optional(),
});

rateRouter.get(
  '/requests',
  authenticate(UserRole.SALES, UserRole.PRICING, UserRole.ADMIN, UserRole.SBU_HEAD),
  async (_req, res, next) => {
    try {
      const data = await rateService.listRateRequests();
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
);

rateRouter.get(
  '/requests/:id',
  authenticate(UserRole.SALES, UserRole.PRICING, UserRole.ADMIN, UserRole.SBU_HEAD),
  async (req, res, next) => {
    try {
      const data = await rateService.getRateRequest(req.params.id);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
);

rateRouter.get(
  '/predefined',
  authenticate(UserRole.SALES, UserRole.PRICING, UserRole.ADMIN, UserRole.MGMT, UserRole.SBU_HEAD),
  async (req, res, next) => {
    try {
      const filters = rateFiltersSchema.parse(req.query);
      const data = await rateService.listPredefinedRates(filters);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
);

const detentionSchema = z.union([
  z.nativeEnum(DetentionFreeTime),
  z.enum(['7', '14', '21', 'Other']),
]);

const createRateSchema = z.object({
  mode: z.nativeEnum(RateRequestMode),
  type: z.nativeEnum(RateRequestType),
  polId: z.string().optional(),
  podId: z.string(),
  doorOrCy: z.enum(['DOOR', 'CY']),
  usZip: z.string().optional(),
  preferredLineId: z.string().optional().nullable(),
  equipTypeId: z.string(),
  reeferTemp: z.string().optional(),
  palletCount: z.number().int().optional(),
  palletDims: z.string().optional(),
  hsCode: z.string().optional(),
  weightTons: z.number().optional(),
  incoterm: z.string().optional(),
  marketRate: z.number().optional(),
  specialInstructions: z.string().optional(),
  cargoReadyDate: z.coerce.date().optional(),
  vesselRequired: z.boolean().default(false),
  detentionFreeTime: detentionSchema,
  salespersonId: z.string(),
  customerId: z.string(),
});

rateRouter.post(
  '/requests',
  authenticate(UserRole.SALES, UserRole.ADMIN),
  async (req: AuthRequest, res, next) => {
    try {
      const parsed = createRateSchema.parse(req.body);
      const detention = await rateService.ensureDetentionFreeTime(parsed.detentionFreeTime);
      const request = await rateService.createRateRequest({
        ...parsed,
        detentionFreeTime: detention,
        status: RateRequestStatus.PENDING,
      } as never);
      res.status(201).json(request);
    } catch (error) {
      next(error);
    }
  },
);

const responseSchema = z.object({
  responses: z
    .array(
      z.object({
        requestedLineId: z.string().optional(),
        requestedEquipTypeId: z.string().optional(),
        vesselName: z.string().optional(),
        eta: z.coerce.date().optional(),
        etd: z.coerce.date().optional(),
        fclCutoff: z.coerce.date().optional(),
        docCutoff: z.coerce.date().optional(),
        validTo: z.coerce.date(),
        chargesJson: z.any(),
      }),
    )
    .min(1),
  vesselRequired: z.boolean().optional(),
});

rateRouter.post(
  '/requests/:id/respond',
  authenticate(UserRole.PRICING, UserRole.ADMIN),
  async (req: AuthRequest, res, next) => {
    try {
      const parsed = responseSchema.parse(req.body);
      await rateService.respondToRateRequest(
        req.params.id,
        req.user?.id ?? 'system',
        parsed.responses,
        parsed.vesselRequired ?? false,
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

const lineQuoteSchema = z.object({
  lineId: z.string(),
  validTo: z.coerce.date(),
  termsJson: z.any(),
  selected: z.boolean().optional(),
  equipmentId: z.string().optional(),
});

rateRouter.post(
  '/requests/:id/line-quotes',
  authenticate(UserRole.PRICING, UserRole.ADMIN),
  async (req, res, next) => {
    try {
      const parsed = lineQuoteSchema.parse(req.body);
      const quote = await rateService.createLineQuote(req.params.id, parsed as never);
      res.status(201).json(quote);
    } catch (error) {
      next(error);
    }
  },
);

rateRouter.post(
  '/requests/:id/complete',
  authenticate(UserRole.PRICING, UserRole.ADMIN),
  async (req, res, next) => {
    try {
      const result = await rateService.completeRateRequest(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

rateRouter.post(
  '/requests/:id/reject',
  authenticate(UserRole.PRICING, UserRole.ADMIN),
  async (req, res, next) => {
    try {
      const schema = z.object({ remark: z.string().min(1) });
      const { remark } = schema.parse(req.body);
      const result = await rateService.rejectRateRequest(req.params.id, remark);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

rateRouter.post(
  '/predefined',
  authenticate(UserRole.PRICING, UserRole.ADMIN),
  async (req, res, next) => {
    try {
      const schema = z.object({
        tradeLaneId: z.string(),
        polId: z.string(),
        podId: z.string(),
        service: z.string(),
        equipTypeId: z.string(),
        isLcl: z.boolean().optional(),
        validFrom: z.coerce.date(),
        validTo: z.coerce.date(),
        notes: z.string().optional(),
        shippingLineId: z.string().optional(),
      });
      const parsed = schema.parse(req.body);
      const result = await rateService.createPredefinedRate(parsed as never);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);

rateRouter.post(
  '/predefined/:id/request-update',
  authenticate(UserRole.SALES, UserRole.ADMIN),
  async (req: AuthRequest, res, next) => {
    try {
      const data = await rateService.requestUpdate(req.params.id, req.user?.id ?? 'system');
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
);

export { rateRouter };
