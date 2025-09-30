import { ItineraryStatus, ItineraryType, Prisma } from '@prisma/client';
import createError from 'http-errors';
import { prisma } from '../../lib/prisma';

export class ItineraryService {
  list() {
    return prisma.itinerary.findMany({ include: { items: true } });
  }

  create(ownerUserId: string, data: Omit<Prisma.ItineraryCreateInput, 'owner'>) {
    return prisma.itinerary.create({
      data: {
        ...data,
        owner: { connect: { id: ownerUserId } },
      },
    });
  }

  async submit(id: string) {
    return prisma.itinerary.update({
      where: { id },
      data: { status: ItineraryStatus.SUBMITTED, submittedAt: new Date() },
    });
  }

  async approve(id: string, approverId: string, note?: string) {
    const itinerary = await prisma.itinerary.findUnique({ where: { id } });
    if (!itinerary) {
      throw createError(404, 'Itinerary not found');
    }
    return prisma.itinerary.update({
      where: { id },
      data: {
        status: ItineraryStatus.APPROVED,
        approver: { connect: { id: approverId } },
        approveNote: note,
        decidedAt: new Date(),
      },
    });
  }

  async reject(id: string, approverId: string, note: string) {
    if (!note) {
      throw createError(400, 'Rejection note required');
    }
    return prisma.itinerary.update({
      where: { id },
      data: {
        status: ItineraryStatus.REJECTED,
        approver: { connect: { id: approverId } },
        approveNote: note,
        decidedAt: new Date(),
      },
    });
  }

  async addItem(itineraryId: string, payload: Prisma.ItineraryItemCreateInput) {
    return prisma.itineraryItem.create({
      data: {
        ...payload,
        itinerary: { connect: { id: itineraryId } },
      },
    });
  }

  async removeItem(id: string) {
    return prisma.itineraryItem.delete({ where: { id } });
  }

  ensureType(value: string): ItineraryType {
    if (!Object.values(ItineraryType).includes(value as ItineraryType)) {
      throw createError(400, 'Invalid itinerary type');
    }
    return value as ItineraryType;
  }
}

export const itineraryService = new ItineraryService();
