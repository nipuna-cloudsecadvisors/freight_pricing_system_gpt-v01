import { PrismaClient, UserRole, UserStatus, CustomerApprovalStatus, RateRequestMode, RateRequestType, DoorOption, DetentionFreeTime, RateRequestStatus, RateSource, ItineraryType, ItineraryStatus } from '@prisma/client';
import { addDays, startOfWeek } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  const [sbu] = await prisma.sbu.upsert({
    where: { id: 'sbu-default' },
    update: {},
    create: {
      id: 'sbu-default',
      name: 'Sri Lanka Exports',
    },
  }).then((s) => [s]);

  const users = await prisma.$transaction([
    prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        name: 'System Admin',
        email: 'admin@example.com',
        password: '$2b$10$T2yZ2Yt2g9J1aPp9D7N6kOScySkkKQ0YOq6T6B1P7l3YzXK2lOClK',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        sbuId: sbu.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'sales@example.com' },
      update: {},
      create: {
        name: 'Sales Person',
        email: 'sales@example.com',
        password: '$2b$10$T2yZ2Yt2g9J1aPp9D7N6kOScySkkKQ0YOq6T6B1P7l3YzXK2lOClK',
        role: UserRole.SALES,
        status: UserStatus.ACTIVE,
        sbuId: sbu.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'pricing@example.com' },
      update: {},
      create: {
        name: 'Pricing Lead',
        email: 'pricing@example.com',
        password: '$2b$10$T2yZ2Yt2g9J1aPp9D7N6kOScySkkKQ0YOq6T6B1P7l3YzXK2lOClK',
        role: UserRole.PRICING,
        status: UserStatus.ACTIVE,
        sbuId: sbu.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'cse@example.com' },
      update: {},
      create: {
        name: 'CSE User',
        email: 'cse@example.com',
        password: '$2b$10$T2yZ2Yt2g9J1aPp9D7N6kOScySkkKQ0YOq6T6B1P7l3YzXK2lOClK',
        role: UserRole.CSE,
        status: UserStatus.ACTIVE,
        sbuId: sbu.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'sbuhead@example.com' },
      update: {},
      create: {
        name: 'SBU Head',
        email: 'sbuhead@example.com',
        password: '$2b$10$T2yZ2Yt2g9J1aPp9D7N6kOScySkkKQ0YOq6T6B1P7l3YzXK2lOClK',
        role: UserRole.SBU_HEAD,
        status: UserStatus.ACTIVE,
        sbuId: sbu.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'mgmt@example.com' },
      update: {},
      create: {
        name: 'Top Management',
        email: 'mgmt@example.com',
        password: '$2b$10$T2yZ2Yt2g9J1aPp9D7N6kOScySkkKQ0YOq6T6B1P7l3YzXK2lOClK',
        role: UserRole.MGMT,
        status: UserStatus.ACTIVE,
        sbuId: sbu.id,
      },
    }),
  ]);

  const [colombo, dubai, london] = await prisma.$transaction([
    prisma.port.upsert({
      where: { unlocode: 'LKCMB' },
      update: {},
      create: {
        unlocode: 'LKCMB',
        name: 'Colombo',
        country: 'Sri Lanka',
      },
    }),
    prisma.port.upsert({
      where: { unlocode: 'AEDXB' },
      update: {},
      create: {
        unlocode: 'AEDXB',
        name: 'Jebel Ali',
        country: 'UAE',
      },
    }),
    prisma.port.upsert({
      where: { unlocode: 'GBLON' },
      update: {},
      create: {
        unlocode: 'GBLON',
        name: 'London',
        country: 'United Kingdom',
      },
    }),
  ]);

  const equipment = await prisma.$transaction([
    prisma.equipmentType.upsert({
      where: { id: 'dry-20' },
      update: {},
      create: {
        id: 'dry-20',
        name: '20ft Dry',
      },
    }),
    prisma.equipmentType.upsert({
      where: { id: 'dry-40' },
      update: {},
      create: {
        id: 'dry-40',
        name: '40ft Dry',
      },
    }),
    prisma.equipmentType.upsert({
      where: { id: 'reefer-40' },
      update: {},
      create: {
        id: 'reefer-40',
        name: '40ft Reefer',
        isReefer: true,
      },
    }),
    prisma.equipmentType.upsert({
      where: { id: 'flat-40' },
      update: {},
      create: {
        id: 'flat-40',
        name: '40ft Flat Rack',
        isFlatRackOpenTop: true,
      },
    }),
  ]);

  const [lineOne, lineTwo] = await prisma.$transaction([
    prisma.shippingLine.upsert({
      where: { code: 'MAEU' },
      update: {},
      create: { name: 'Maersk', code: 'MAEU' },
    }),
    prisma.shippingLine.upsert({
      where: { code: 'EMCU' },
      update: {},
      create: { name: 'Evergreen', code: 'EMCU' },
    }),
  ]);

  const tradeLanes = await prisma.$transaction([
    prisma.tradeLane.upsert({
      where: { code: 'ME-SEA' },
      update: {},
      create: { code: 'ME-SEA', name: 'Middle East', region: 'ME' },
    }),
    prisma.tradeLane.upsert({
      where: { code: 'EU-SEA' },
      update: {},
      create: { code: 'EU-SEA', name: 'Europe', region: 'EU' },
    }),
  ]);

  await prisma.pricingTeamAssignment.upsert({
    where: { id: 'assign-1' },
    update: {},
    create: {
      id: 'assign-1',
      tradeLaneId: tradeLanes[0].id,
      userId: users[2].id,
    },
  });

  await prisma.customer.upsert({
    where: { id: 'cust-1' },
    update: {},
    create: {
      id: 'cust-1',
      name: 'ABC Exports',
      approvalStatus: CustomerApprovalStatus.APPROVED,
      createdById: users[0].id,
      approvedById: users[0].id,
      approvedAt: now,
    },
  });

  await prisma.predefinedRate.upsert({
    where: { id: 'rate-1' },
    update: {},
    create: {
      id: 'rate-1',
      tradeLaneId: tradeLanes[0].id,
      polId: colombo.id,
      podId: dubai.id,
      service: 'Weekly',
      equipTypeId: equipment[0].id,
      validFrom: now,
      validTo: addDays(now, 14),
      shippingLineId: lineOne.id,
    },
  });

  await prisma.rateRequest.upsert({
    where: { refNo: 'RR-0001' },
    update: {},
    create: {
      refNo: 'RR-0001',
      mode: RateRequestMode.SEA,
      type: RateRequestType.FCL,
      polId: colombo.id,
      podId: london.id,
      doorOrCy: DoorOption.CY,
      detentionFreeTime: DetentionFreeTime.D7,
      salespersonId: users[1].id,
      customerId: 'cust-1',
      equipTypeId: equipment[1].id,
      status: RateRequestStatus.PENDING,
    },
  });

  await prisma.bookingRequest.upsert({
    where: { id: 'book-1' },
    update: {},
    create: {
      id: 'book-1',
      raisedByUserId: users[1].id,
      customerId: 'cust-1',
      rateSource: RateSource.REQUEST,
      linkId: 'RR-0001',
    },
  });

  await prisma.itinerary.upsert({
    where: { id: 'itin-1' },
    update: {},
    create: {
      id: 'itin-1',
      ownerUserId: users[1].id,
      type: ItineraryType.SP,
      weekStart: startOfWeek(now, { weekStartsOn: 1 }),
      status: 'SUBMITTED',
      approverId: users[4].id,
      submittedAt: now,
    },
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
