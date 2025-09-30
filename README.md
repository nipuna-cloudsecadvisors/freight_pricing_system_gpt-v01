# Freight Pricing & Activity System (Export Only)

This monorepo hosts a simplified yet production-ready freight pricing and activity management platform for Sri Lankan forwarders focusing on export operations (Sea & Air). The stack favours a familiar **React + Express (Node.js)** approach combined with PostgreSQL and Prisma to keep development approachable while meeting the requested domain features.

## Repository structure

```
.
├─ apps/
│  ├─ api/        # Express + Prisma API service
│  └─ web/        # React (Vite) frontend
├─ prisma/        # Shared Prisma schema & migrations
├─ docker-compose.yml
├─ pnpm-workspace.yaml
└─ README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 8+
- [Docker](https://www.docker.com/) & Docker Compose

## Environment variables

Copy `.env.example` to `.env` and adjust as needed. Required variables:

```
# Shared
DATABASE_URL=postgresql://postgres:postgres@db:5432/freight
REDIS_URL=redis://redis:6379
JWT_SECRET=replace-me
REFRESH_TOKEN_SECRET=replace-me
SMTP_HOST=mailhog
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMS_GATEWAY_API_KEY=dummy
``` 

Frontend specific variables reside in `apps/web/.env.example` (copied to `.env` inside the same folder) and include the API base URL.

## Getting started (local dev)

```bash
pnpm install --no-frozen-lockfile
pnpm prisma:generate
pnpm dev:api      # start Express API on http://localhost:4000
pnpm dev:web      # start React app on http://localhost:5173
```

To initialise the database with seed data:

```bash
pnpm prisma:seed
```

> The Prisma CLI is executed from the root using the shared schema (see `package.json` scripts such as `pnpm prisma:migrate`).

## Docker Compose

The provided Compose stack spins up the API, web frontend, PostgreSQL, Redis, and a background worker responsible for notifications.

```bash
docker compose up --build
```

Once running:

- Web UI: http://localhost:8080
- API: http://localhost:4000 (proxied via Nginx for the web app)
- pgAdmin (optional) can be added by extending the compose file.

## Testing & linting

- `pnpm lint` – ESLint for all packages
- `pnpm test` – Vitest unit + integration tests (API service focused)

## Key functionality (overview)

- Pre-defined rate management with validity colour coding and update requests.
- Rate request workflow (FCL/LCL) covering procurement, pricing responses, and notifications.
- Booking hand-off, RO tracking, ERP job creation, and CSE completion logging.
- Itinerary planning for Sales & CSE users with SBU Head approvals.
- Sales activity logging and reporting dashboards with export-to-JPEG.
- Unified notification inbox backed by email/SMS providers via BullMQ (Redis).
- Admin panel for users, roles, customer approvals, and system configuration.

Refer to `apps/api/README.md` and `apps/web/README.md` for module-specific notes.

## Production deployment

For a step-by-step deployment walkthrough tailored to Ubuntu 24.04 virtual machines—including installing Docker, preparing the
environment, running migrations, and operating the stack—see [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).
