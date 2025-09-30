FROM node:18-alpine AS base
WORKDIR /app
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN corepack enable && pnpm install --frozen-lockfile
COPY prisma ./prisma
COPY apps/api ./apps/api
RUN pnpm --filter api build

FROM node:18-alpine
WORKDIR /app
COPY --from=base /app ./
ENV NODE_ENV=production
CMD ["pnpm", "--filter", "api", "start"]
