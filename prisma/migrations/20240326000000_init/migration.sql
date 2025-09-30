-- Prisma migration for initial freight pricing schema
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SBU_HEAD', 'SALES', 'CSE', 'PRICING', 'MGMT');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "CustomerApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "RateStatus" AS ENUM ('ACTIVE', 'EXPIRED');
CREATE TYPE "RateRequestMode" AS ENUM ('SEA', 'AIR');
CREATE TYPE "RateRequestType" AS ENUM ('FCL', 'LCL');
CREATE TYPE "DoorOption" AS ENUM ('DOOR', 'CY');
CREATE TYPE "DetentionFreeTime" AS ENUM ('D7', 'D14', 'D21', 'OTHER');
CREATE TYPE "RateRequestStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED');
CREATE TYPE "BookingRequestStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');
CREATE TYPE "RateSource" AS ENUM ('PREDEFINED', 'REQUEST');
CREATE TYPE "ItineraryType" AS ENUM ('SP', 'CSE');
CREATE TYPE "ItineraryStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');
CREATE TYPE "ActivityType" AS ENUM ('VISIT', 'CALL', 'MEETING');
CREATE TYPE "NotificationChannel" AS ENUM ('SYSTEM', 'EMAIL', 'SMS');
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

CREATE TABLE "Sbu" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "headUserId" TEXT
);

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "phone" TEXT,
  "role" "UserRole" NOT NULL,
  "password" TEXT NOT NULL,
  "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "sbuId" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Customer" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "approvalStatus" "CustomerApprovalStatus" NOT NULL DEFAULT 'PENDING',
  "createdById" TEXT NOT NULL,
  "approvedById" TEXT,
  "approvedAt" TIMESTAMPTZ,
  "contacts" JSONB
);

CREATE TABLE "TradeLane" (
  "id" TEXT PRIMARY KEY,
  "region" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT UNIQUE NOT NULL
);

CREATE TABLE "Port" (
  "id" TEXT PRIMARY KEY,
  "unlocode" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "country" TEXT NOT NULL
);

CREATE TABLE "ShippingLine" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "code" TEXT UNIQUE NOT NULL
);

CREATE TABLE "EquipmentType" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "isReefer" BOOLEAN NOT NULL DEFAULT FALSE,
  "isFlatRackOpenTop" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE "PricingTeamAssignment" (
  "id" TEXT PRIMARY KEY,
  "tradeLaneId" TEXT NOT NULL,
  "userId" TEXT NOT NULL
);

CREATE TABLE "PredefinedRate" (
  "id" TEXT PRIMARY KEY,
  "tradeLaneId" TEXT NOT NULL,
  "polId" TEXT NOT NULL,
  "podId" TEXT NOT NULL,
  "service" TEXT NOT NULL,
  "equipTypeId" TEXT NOT NULL,
  "isLcl" BOOLEAN NOT NULL DEFAULT FALSE,
  "validFrom" TIMESTAMPTZ NOT NULL,
  "validTo" TIMESTAMPTZ NOT NULL,
  "status" "RateStatus" NOT NULL DEFAULT 'ACTIVE',
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "shippingLineId" TEXT
);

CREATE TABLE "RateRequest" (
  "id" TEXT PRIMARY KEY,
  "refNo" TEXT UNIQUE NOT NULL,
  "mode" "RateRequestMode" NOT NULL,
  "type" "RateRequestType" NOT NULL,
  "polId" TEXT NOT NULL,
  "podId" TEXT NOT NULL,
  "doorOrCy" "DoorOption" NOT NULL,
  "usZip" TEXT,
  "preferredLineId" TEXT,
  "equipTypeId" TEXT NOT NULL,
  "reeferTemp" TEXT,
  "palletCount" INTEGER,
  "palletDims" TEXT,
  "hsCode" TEXT,
  "weightTons" DOUBLE PRECISION,
  "incoterm" TEXT,
  "marketRate" DOUBLE PRECISION,
  "specialInstructions" TEXT,
  "cargoReadyDate" TIMESTAMPTZ,
  "vesselRequired" BOOLEAN NOT NULL DEFAULT FALSE,
  "detentionFreeTime" "DetentionFreeTime" NOT NULL,
  "salespersonId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "status" "RateRequestStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "vesselDetails" JSONB,
  "processedPercent" DOUBLE PRECISION NOT NULL DEFAULT 0
);

CREATE TABLE "RateRequestResponse" (
  "id" TEXT PRIMARY KEY,
  "rateRequestId" TEXT NOT NULL,
  "lineNo" INTEGER NOT NULL,
  "requestedLineId" TEXT,
  "requestedEquipTypeId" TEXT,
  "vesselName" TEXT,
  "eta" TIMESTAMPTZ,
  "etd" TIMESTAMPTZ,
  "fclCutoff" TIMESTAMPTZ,
  "docCutoff" TIMESTAMPTZ,
  "validTo" TIMESTAMPTZ NOT NULL,
  "chargesJson" JSONB NOT NULL
);

CREATE TABLE "LineQuote" (
  "id" TEXT PRIMARY KEY,
  "rateRequestId" TEXT NOT NULL,
  "lineId" TEXT NOT NULL,
  "termsJson" JSONB NOT NULL,
  "validTo" TIMESTAMPTZ NOT NULL,
  "selected" BOOLEAN NOT NULL DEFAULT FALSE,
  "equipmentId" TEXT
);

CREATE TABLE "BookingRequest" (
  "id" TEXT PRIMARY KEY,
  "raisedByUserId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "rateSource" "RateSource" NOT NULL,
  "linkId" TEXT NOT NULL,
  "status" "BookingRequestStatus" NOT NULL DEFAULT 'PENDING',
  "cancelReason" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "RoDocument" (
  "id" TEXT PRIMARY KEY,
  "bookingRequestId" TEXT NOT NULL,
  "number" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "receivedAt" TIMESTAMPTZ NOT NULL
);

CREATE TABLE "Job" (
  "id" TEXT PRIMARY KEY,
  "bookingRequestId" TEXT NOT NULL,
  "erpJobNo" TEXT NOT NULL,
  "openedByUserId" TEXT NOT NULL,
  "openedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "JobCompletion" (
  "id" TEXT PRIMARY KEY,
  "jobId" TEXT NOT NULL,
  "cseUserId" TEXT NOT NULL,
  "details" JSONB NOT NULL,
  "completedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Itinerary" (
  "id" TEXT PRIMARY KEY,
  "ownerUserId" TEXT NOT NULL,
  "type" "ItineraryType" NOT NULL,
  "weekStart" TIMESTAMPTZ NOT NULL,
  "status" "ItineraryStatus" NOT NULL DEFAULT 'DRAFT',
  "approverId" TEXT,
  "approveNote" TEXT,
  "submittedAt" TIMESTAMPTZ,
  "decidedAt" TIMESTAMPTZ
);

CREATE TABLE "ItineraryItem" (
  "id" TEXT PRIMARY KEY,
  "itineraryId" TEXT NOT NULL,
  "date" TIMESTAMPTZ NOT NULL,
  "customerId" TEXT,
  "leadId" TEXT,
  "purpose" TEXT NOT NULL,
  "plannedTime" TEXT,
  "location" TEXT,
  "notes" TEXT
);

CREATE TABLE "SalesActivity" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "customerId" TEXT,
  "leadId" TEXT,
  "type" "ActivityType" NOT NULL,
  "date" TIMESTAMPTZ NOT NULL,
  "notes" TEXT,
  "outcome" TEXT,
  "nextActionDate" TIMESTAMPTZ
);

CREATE TABLE "Lead" (
  "id" TEXT PRIMARY KEY,
  "companyName" TEXT NOT NULL,
  "contact" TEXT,
  "stage" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "source" TEXT
);

CREATE TABLE "Notification" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "channel" "NotificationChannel" NOT NULL,
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
  "meta" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "AuditEvent" (
  "id" TEXT PRIMARY KEY,
  "actorId" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "payload" JSONB,
  "ts" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "Sbu" ADD CONSTRAINT "Sbu_headUserId_fkey" FOREIGN KEY ("headUserId") REFERENCES "User"("id") ON DELETE SET NULL;
ALTER TABLE "User" ADD CONSTRAINT "User_sbuId_fkey" FOREIGN KEY ("sbuId") REFERENCES "Sbu"("id") ON DELETE SET NULL;
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT;
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL;
ALTER TABLE "PricingTeamAssignment" ADD CONSTRAINT "PricingTeamAssignment_tradeLaneId_fkey" FOREIGN KEY ("tradeLaneId") REFERENCES "TradeLane"("id") ON DELETE CASCADE;
ALTER TABLE "PricingTeamAssignment" ADD CONSTRAINT "PricingTeamAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "PredefinedRate" ADD CONSTRAINT "PredefinedRate_tradeLaneId_fkey" FOREIGN KEY ("tradeLaneId") REFERENCES "TradeLane"("id") ON DELETE CASCADE;
ALTER TABLE "PredefinedRate" ADD CONSTRAINT "PredefinedRate_polId_fkey" FOREIGN KEY ("polId") REFERENCES "Port"("id") ON DELETE CASCADE;
ALTER TABLE "PredefinedRate" ADD CONSTRAINT "PredefinedRate_podId_fkey" FOREIGN KEY ("podId") REFERENCES "Port"("id") ON DELETE CASCADE;
ALTER TABLE "PredefinedRate" ADD CONSTRAINT "PredefinedRate_equipTypeId_fkey" FOREIGN KEY ("equipTypeId") REFERENCES "EquipmentType"("id") ON DELETE CASCADE;
ALTER TABLE "PredefinedRate" ADD CONSTRAINT "PredefinedRate_shippingLineId_fkey" FOREIGN KEY ("shippingLineId") REFERENCES "ShippingLine"("id") ON DELETE SET NULL;
ALTER TABLE "RateRequest" ADD CONSTRAINT "RateRequest_polId_fkey" FOREIGN KEY ("polId") REFERENCES "Port"("id") ON DELETE RESTRICT;
ALTER TABLE "RateRequest" ADD CONSTRAINT "RateRequest_podId_fkey" FOREIGN KEY ("podId") REFERENCES "Port"("id") ON DELETE RESTRICT;
ALTER TABLE "RateRequest" ADD CONSTRAINT "RateRequest_preferredLineId_fkey" FOREIGN KEY ("preferredLineId") REFERENCES "ShippingLine"("id") ON DELETE SET NULL;
ALTER TABLE "RateRequest" ADD CONSTRAINT "RateRequest_equipTypeId_fkey" FOREIGN KEY ("equipTypeId") REFERENCES "EquipmentType"("id") ON DELETE RESTRICT;
ALTER TABLE "RateRequest" ADD CONSTRAINT "RateRequest_salespersonId_fkey" FOREIGN KEY ("salespersonId") REFERENCES "User"("id") ON DELETE RESTRICT;
ALTER TABLE "RateRequest" ADD CONSTRAINT "RateRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT;
ALTER TABLE "RateRequestResponse" ADD CONSTRAINT "RateRequestResponse_rateRequestId_fkey" FOREIGN KEY ("rateRequestId") REFERENCES "RateRequest"("id") ON DELETE CASCADE;
ALTER TABLE "RateRequestResponse" ADD CONSTRAINT "RateRequestResponse_requestedLineId_fkey" FOREIGN KEY ("requestedLineId") REFERENCES "ShippingLine"("id") ON DELETE SET NULL;
ALTER TABLE "RateRequestResponse" ADD CONSTRAINT "RateRequestResponse_requestedEquipTypeId_fkey" FOREIGN KEY ("requestedEquipTypeId") REFERENCES "EquipmentType"("id") ON DELETE SET NULL;
ALTER TABLE "LineQuote" ADD CONSTRAINT "LineQuote_rateRequestId_fkey" FOREIGN KEY ("rateRequestId") REFERENCES "RateRequest"("id") ON DELETE CASCADE;
ALTER TABLE "LineQuote" ADD CONSTRAINT "LineQuote_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "ShippingLine"("id") ON DELETE CASCADE;
ALTER TABLE "LineQuote" ADD CONSTRAINT "LineQuote_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "EquipmentType"("id") ON DELETE SET NULL;
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_raisedByUserId_fkey" FOREIGN KEY ("raisedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT;
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT;
ALTER TABLE "RoDocument" ADD CONSTRAINT "RoDocument_bookingRequestId_fkey" FOREIGN KEY ("bookingRequestId") REFERENCES "BookingRequest"("id") ON DELETE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT "Job_bookingRequestId_fkey" FOREIGN KEY ("bookingRequestId") REFERENCES "BookingRequest"("id") ON DELETE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT "Job_openedByUserId_fkey" FOREIGN KEY ("openedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT;
ALTER TABLE "JobCompletion" ADD CONSTRAINT "JobCompletion_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE;
ALTER TABLE "JobCompletion" ADD CONSTRAINT "JobCompletion_cseUserId_fkey" FOREIGN KEY ("cseUserId") REFERENCES "User"("id") ON DELETE RESTRICT;
ALTER TABLE "Itinerary" ADD CONSTRAINT "Itinerary_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Itinerary" ADD CONSTRAINT "Itinerary_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE SET NULL;
ALTER TABLE "ItineraryItem" ADD CONSTRAINT "ItineraryItem_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary"("id") ON DELETE CASCADE;
ALTER TABLE "ItineraryItem" ADD CONSTRAINT "ItineraryItem_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL;
ALTER TABLE "ItineraryItem" ADD CONSTRAINT "ItineraryItem_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL;
ALTER TABLE "SalesActivity" ADD CONSTRAINT "SalesActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "SalesActivity" ADD CONSTRAINT "SalesActivity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL;
ALTER TABLE "SalesActivity" ADD CONSTRAINT "SalesActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE;

CREATE INDEX "idx_rate_request_status" ON "RateRequest" ("status");
CREATE INDEX "idx_rate_request_salesperson" ON "RateRequest" ("salespersonId");
CREATE INDEX "idx_rate_request_customer" ON "RateRequest" ("customerId");
CREATE INDEX "idx_booking_customer" ON "BookingRequest" ("customerId");
CREATE INDEX "idx_itinerary_owner" ON "Itinerary" ("ownerUserId");
CREATE INDEX "idx_itinerary_week" ON "Itinerary" ("weekStart");
CREATE INDEX "idx_sales_activity_user" ON "SalesActivity" ("userId");
CREATE INDEX "idx_notification_user" ON "Notification" ("userId");
