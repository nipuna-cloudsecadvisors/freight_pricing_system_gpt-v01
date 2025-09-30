import { addDays } from 'date-fns';
import {
  DetentionFreeTime,
  LineQuote,
  Prisma,
  RateRequest,
  RateRequestStatus,
  RateRequestType,
  RateStatus,
  UserRole,
} from '@prisma/client';
import createError from 'http-errors';
import { prisma } from '../../lib/prisma';
import { dispatchNotification } from '../../queue';
import { calculateProcessedPercentage } from '../../utils/rate-helpers';

export class RateService {
  async listRateRequests() {
    return prisma.rateRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRateRequest(id: string) {
    return prisma.rateRequest.findUnique({
      where: { id },
      include: { responses: true, lineQuotes: true },
    });
  }

  async listPredefinedRates(params: {
    region?: string;
    pol?: string;
    pod?: string;
    service?: string;
    equip?: string;
    status?: RateStatus;
  }) {
    return prisma.predefinedRate.findMany({
      where: {
        tradeLane: params.region ? { region: params.region } : undefined,
        polId: params.pol,
        podId: params.pod,
        service: params.service,
        equipTypeId: params.equip,
        status: params.status,
      },
      include: {
        tradeLane: true,
        pol: true,
        pod: true,
        equipment: true,
      },
    });
  }

  async createPredefinedRate(data: Prisma.PredefinedRateCreateInput) {
    const now = new Date();
    const status = data.validTo < now ? RateStatus.EXPIRED : RateStatus.ACTIVE;
    return prisma.predefinedRate.create({
      data: {
        ...data,
        status,
      },
    });
  }

  async requestUpdate(rateId: string, requesterId: string) {
    const rate = await prisma.predefinedRate.findUnique({ where: { id: rateId } });
    if (!rate) {
      throw createError(404, 'Rate not found');
    }
    const assignments = await prisma.pricingTeamAssignment.findMany({
      where: { tradeLaneId: rate.tradeLaneId },
      include: { user: true },
    });
    await Promise.all(
      assignments.map((assignment) =>
        dispatchNotification({
          type: 'email',
          payload: {
            to: assignment.user.email,
            subject: 'Rate update requested',
            html: `<p>Rate ${rate.id} requires update by ${requesterId}</p>`,
          },
        }),
      ),
    );
    return { requested: true };
  }

  private async ensureColomboPort(): Promise<string> {
    const colombo = await prisma.port.findFirst({
      where: {
        OR: [{ unlocode: 'LKCMB' }, { name: { contains: 'Colombo', mode: 'insensitive' } }],
      },
    });
    if (!colombo) {
      throw createError(400, 'Colombo port not configured');
    }
    return colombo.id;
  }

  private generateRef(): string {
    return `RR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }

  async createRateRequest(data: Prisma.RateRequestUncheckedCreateInput): Promise<RateRequest> {
    let polId = data.polId;
    if (data.mode === 'SEA' && !polId) {
      polId = await this.ensureColomboPort();
    }

    const equipment = await prisma.equipmentType.findUnique({ where: { id: data.equipTypeId } });
    if (!equipment) {
      throw createError(400, 'Invalid equipment type');
    }

    if (equipment.isFlatRackOpenTop) {
      if (!data.palletCount || !data.palletDims) {
        throw createError(400, 'Pallet count and dimensions required for flat rack/open top');
      }
    }

    const refNo = data.refNo ?? this.generateRef();

    const request = await prisma.rateRequest.create({
      data: {
        ...data,
        polId,
        refNo,
        status: RateRequestStatus.PENDING,
      },
    });

    await dispatchNotification({
      type: 'email',
      payload: {
        to: 'pricing-team@example.com',
        subject: `New rate request ${refNo}`,
        html: '<p>New rate request submitted.</p>',
      },
    });

    return request;
  }

  async respondToRateRequest(
    rateRequestId: string,
    responderId: string,
    responses: Array<{
      requestedLineId?: string;
      requestedEquipTypeId?: string;
      vesselName?: string;
      eta?: Date;
      etd?: Date;
      fclCutoff?: Date;
      docCutoff?: Date;
      validTo: Date;
      chargesJson: Prisma.InputJsonValue;
    }>,
    vesselRequired: boolean,
  ) {
    const request = await prisma.rateRequest.findUnique({ where: { id: rateRequestId } });
    if (!request) {
      throw createError(404, 'Rate request not found');
    }

    if (vesselRequired) {
      const missing = responses.some((resp) => !resp.vesselName || !resp.eta || !resp.etd);
      if (missing) {
        throw createError(400, 'Vessel details required');
      }
    }

    await prisma.rateRequestResponse.deleteMany({ where: { rateRequestId } });

    let lineNo = 1;
    for (const resp of responses) {
      await prisma.rateRequestResponse.create({
        data: {
          rateRequestId,
          lineNo: lineNo++,
          requestedLineId: resp.requestedLineId,
          requestedEquipTypeId: resp.requestedEquipTypeId,
          vesselName: resp.vesselName,
          eta: resp.eta,
          etd: resp.etd,
          fclCutoff: resp.fclCutoff,
          docCutoff: resp.docCutoff,
          validTo: resp.validTo,
          chargesJson: resp.chargesJson,
        },
      });
    }

    const processedPercent = calculateProcessedPercentage(
      request.preferredLineId,
      responses.length,
      responses.length,
    );

    await prisma.rateRequest.update({
      where: { id: rateRequestId },
      data: {
        status: RateRequestStatus.PROCESSING,
        processedPercent,
      },
    });

    await dispatchNotification({
      type: 'sms',
      payload: {
        to: responderId,
        message: `Rate request ${request.refNo} updated`,
      },
    });
  }

  async createLineQuote(
    rateRequestId: string,
    data: Prisma.LineQuoteUncheckedCreateInput,
  ): Promise<LineQuote> {
    if (data.selected) {
      await prisma.lineQuote.updateMany({
        where: { rateRequestId },
        data: { selected: false },
      });
    }

    const quote = await prisma.lineQuote.create({
      data: {
        ...data,
        rateRequestId,
      },
    });

    const selectedCount = await prisma.lineQuote.count({
      where: { rateRequestId, selected: true },
    });

    if (selectedCount > 1) {
      throw createError(400, 'Only one selected quote allowed');
    }

    return quote;
  }

  async completeRateRequest(id: string) {
    return prisma.rateRequest.update({
      where: { id },
      data: {
        status: RateRequestStatus.COMPLETED,
      },
    });
  }

  async rejectRateRequest(id: string, remark: string) {
    if (!remark) {
      throw createError(400, 'Remark is required');
    }
    return prisma.rateRequest.update({
      where: { id },
      data: { status: RateRequestStatus.REJECTED, specialInstructions: remark },
    });
  }

  async defaultValidity(type: RateRequestType): Promise<Date> {
    const days = type === RateRequestType.LCL ? 7 : 14;
    return addDays(new Date(), days);
  }

  async ensureDetentionFreeTime(value: DetentionFreeTime | '7' | '14' | '21' | 'Other') {
    switch (value) {
      case '7':
        return DetentionFreeTime.D7;
      case '14':
        return DetentionFreeTime.D14;
      case '21':
        return DetentionFreeTime.D21;
      case 'Other':
        return DetentionFreeTime.OTHER;
      default:
        return value;
    }
  }

  ensureRole(role: UserRole, allowed: UserRole[]) {
    if (!allowed.includes(role)) {
      throw createError(403, 'Forbidden');
    }
  }
}

export const rateService = new RateService();
