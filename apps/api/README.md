# API Service

This Express + Prisma service provides the REST API for the freight pricing & activity system. The implementation embraces a modular architecture with feature folders (rates, bookings, itineraries, etc.) and Zod-powered DTO validation.

## Development scripts

```bash
pnpm install
pnpm dev     # start local API
pnpm test    # run unit & e2e tests via Vitest
pnpm lint    # static analysis
```

## Environment variables

The API reads configuration from the root `.env` file. Key variables:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET` / `REFRESH_TOKEN_SECRET`
- `SMTP_*`
- `SMS_GATEWAY_API_KEY`

## Architecture highlights

- Thin routers delegating to service classes located under `src/modules/**`.
- Repository pattern encapsulating Prisma access in `src/repositories`.
- Unified error handling middleware + request logging (Morgan).
- Auth middleware verifying JWTs and enforcing role-based access control.
- BullMQ queues for email/SMS notifications processed by `src/worker.ts`.
- Seed script populates master data for ports, equipment, trade lanes, and sample users.

## Testing strategy

Vitest covers domain helpers (`processedPercent`, date validity) and API invariants using supertest with an in-memory SQLite DB via Prisma. End-to-end tests focus on:

1. Sea export defaults POL to Colombo.
2. Vessel fields enforced when `vesselRequired=true`.
3. Enforcing a single selected line quote.
4. Booking cancellation requires a reason.

Run `pnpm test` to execute all suites.
