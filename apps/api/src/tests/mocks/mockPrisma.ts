import { vi } from 'vitest';

export function createPrismaMock() {
  return {
    port: { findFirst: vi.fn() },
    equipmentType: { findUnique: vi.fn() },
    rateRequest: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), findMany: vi.fn() },
    rateRequestResponse: { deleteMany: vi.fn(), create: vi.fn() },
    lineQuote: { create: vi.fn(), updateMany: vi.fn(), count: vi.fn() },
    bookingRequest: { update: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() },
  };
}
