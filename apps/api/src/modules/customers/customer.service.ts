import { CustomerApprovalStatus, Prisma } from '@prisma/client';
import createError from 'http-errors';
import { prisma } from '../../lib/prisma';

export class CustomerService {
  list() {
    return prisma.customer.findMany({ include: { rateRequests: true } });
  }

  async create(data: Prisma.CustomerCreateInput, createdById: string) {
    return prisma.customer.create({
      data: {
        ...data,
        createdBy: { connect: { id: createdById } },
      },
    });
  }

  async approve(id: string, approverId: string, status: CustomerApprovalStatus) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw createError(404, 'Customer not found');
    }
    return prisma.customer.update({
      where: { id },
      data: {
        approvalStatus: status,
        approvedBy: { connect: { id: approverId } },
        approvedAt: new Date(),
      },
    });
  }
}

export const customerService = new CustomerService();
