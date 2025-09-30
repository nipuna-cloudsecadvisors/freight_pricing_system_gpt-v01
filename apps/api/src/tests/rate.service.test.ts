import { describe, it, expect, beforeEach, vi } from 'vitest';
import { rateService } from '../modules/rates/rate.service';
import { prisma } from '../lib/prisma';

vi.mock('../lib/prisma', () => {
  const mockPort = { findFirst: vi.fn() };
  const mockEquipment = { findUnique: vi.fn() };
  const mockRateRequest = { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() };
  const mockResponses = { deleteMany: vi.fn(), create: vi.fn() };
  const mockLineQuotes = { create: vi.fn(), updateMany: vi.fn(), count: vi.fn() };
  return {
    prisma: {
      port: mockPort,
      equipmentType: mockEquipment,
      rateRequest: mockRateRequest,
      rateRequestResponse: mockResponses,
      lineQuote: mockLineQuotes,
    },
  };
});

vi.mock('../queue', () => ({ dispatchNotification: vi.fn() }));

const mockedPrisma = prisma as unknown as {
  port: { findFirst: ReturnType<typeof vi.fn> };
  equipmentType: { findUnique: ReturnType<typeof vi.fn> };
  rateRequest: { create: ReturnType<typeof vi.fn>; findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
  rateRequestResponse: { deleteMany: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
  lineQuote: { create: ReturnType<typeof vi.fn>; updateMany: ReturnType<typeof vi.fn>; count: ReturnType<typeof vi.fn> };
};

describe('RateService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('defaults POL to Colombo for sea exports', async () => {
    mockedPrisma.port.findFirst.mockResolvedValueOnce({ id: 'colombo' });
    mockedPrisma.equipmentType.findUnique.mockResolvedValueOnce({ id: 'dry', isFlatRackOpenTop: false });
    mockedPrisma.rateRequest.create.mockResolvedValueOnce({ id: 'req', refNo: 'RR-1' });

    await rateService.createRateRequest({
      mode: 'SEA',
      type: 'FCL',
      polId: '',
      podId: 'pod',
      doorOrCy: 'CY',
      equipTypeId: 'dry',
      detentionFreeTime: 'D7',
      salespersonId: 'sales',
      customerId: 'cust',
    } as never);

    expect(mockedPrisma.rateRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ polId: 'colombo' }),
      }),
    );
  });

  it('requires vessel fields when vesselRequired is true', async () => {
    mockedPrisma.rateRequest.findUnique.mockResolvedValueOnce({
      id: 'req',
      refNo: 'RR-1',
      preferredLineId: 'line',
    });

    await expect(
      rateService.respondToRateRequest(
        'req',
        'user',
        [
          {
            validTo: new Date(),
            chargesJson: {},
          },
        ],
        true,
      ),
    ).rejects.toThrowError('Vessel details required');
  });

  it('enforces single selected line quote', async () => {
    mockedPrisma.lineQuote.updateMany.mockResolvedValueOnce({ count: 1 });
    mockedPrisma.lineQuote.create.mockResolvedValueOnce({ id: 'quote', selected: true });
    mockedPrisma.lineQuote.count.mockResolvedValueOnce(2);

    await expect(
      rateService.createLineQuote('req', {
        lineId: 'line',
        termsJson: {},
        validTo: new Date(),
        selected: true,
      } as never),
    ).rejects.toThrowError('Only one selected quote allowed');
  });
});
