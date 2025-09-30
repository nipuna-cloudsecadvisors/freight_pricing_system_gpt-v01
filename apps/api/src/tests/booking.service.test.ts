import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bookingService } from '../modules/bookings/booking.service';
import { createPrismaMock } from './mocks/mockPrisma';

const mockedPrisma = createPrismaMock();
vi.mock('../lib/prisma', () => ({ prisma: mockedPrisma }));

describe('BookingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires cancel reason when cancelling booking', async () => {
    await expect(bookingService.cancel('id', '')).rejects.toThrowError('Cancel reason required');
  });
});
