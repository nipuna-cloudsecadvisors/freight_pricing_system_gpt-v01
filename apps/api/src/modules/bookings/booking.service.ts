import { BookingRequestStatus, Prisma, RateSource } from '@prisma/client';
import createError from 'http-errors';
import { prisma } from '../../lib/prisma';

export class BookingService {
  async create(data: Prisma.BookingRequestUncheckedCreateInput) {
    return prisma.bookingRequest.create({ data });
  }

  async confirm(id: string) {
    const booking = await prisma.bookingRequest.findUnique({ where: { id } });
    if (!booking) {
      throw createError(404, 'Booking not found');
    }
    return prisma.bookingRequest.update({
      where: { id },
      data: { status: BookingRequestStatus.CONFIRMED },
    });
  }

  async cancel(id: string, reason: string) {
    if (!reason) {
      throw createError(400, 'Cancel reason required');
    }
    return prisma.bookingRequest.update({
      where: { id },
      data: { status: BookingRequestStatus.CANCELLED, cancelReason: reason },
    });
  }

  async attachRo(id: string, payload: Prisma.RoDocumentCreateInput) {
    return prisma.roDocument.create({
      data: {
        ...payload,
        bookingRequest: { connect: { id } },
      },
    });
  }

  async openJob(id: string, erpJobNo: string, openedByUserId: string) {
    return prisma.job.create({
      data: {
        bookingRequestId: id,
        erpJobNo,
        openedByUserId,
      },
    });
  }

  async completeJob(jobId: string, cseUserId: string, details: Prisma.JsonObject) {
    return prisma.jobCompletion.create({
      data: {
        job: { connect: { id: jobId } },
        cseUserId,
        details,
      },
    });
  }

  async list() {
    return prisma.bookingRequest.findMany({ include: { roDocuments: true } });
  }

  ensureRateSource(value: string): RateSource {
    if (!Object.values(RateSource).includes(value as RateSource)) {
      throw createError(400, 'Invalid rate source');
    }
    return value as RateSource;
  }
}

export const bookingService = new BookingService();
