import { prisma } from '../../lib/prisma';

export class ReportService {
  async responseTime() {
    const requests = await prisma.rateRequest.findMany({
      include: { responses: true },
    });
    const durations = requests
      .filter((req) => req.responses.length > 0)
      .map((req) => {
        const firstResponse = req.responses[0];
        return (firstResponse.validTo.getTime() - req.createdAt.getTime()) / 3600000;
      });
    const avg = durations.length ? durations.reduce((acc, cur) => acc + cur, 0) / durations.length : 0;
    return { averageHours: Number(avg.toFixed(2)) };
  }

  async topSales() {
    const grouped = await prisma.rateRequest.groupBy({
      by: ['salespersonId'],
      _count: true,
      orderBy: { _count: { salespersonId: 'desc' } },
      take: 10,
    });
    const users = await prisma.user.findMany({
      where: { id: { in: grouped.map((g) => g.salespersonId) } },
    });
    return grouped.map((item) => ({
      salespersonId: item.salespersonId,
      count: item._count,
      name: users.find((u) => u.id === item.salespersonId)?.name ?? 'Unknown',
    }));
  }

  async statusCards() {
    const counts = await prisma.rateRequest.groupBy({
      by: ['status'],
      _count: true,
    });
    return counts.map((item) => ({ status: item.status, count: item._count }));
  }
}

export const reportService = new ReportService();
