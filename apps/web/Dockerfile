FROM node:18-alpine AS base
WORKDIR /app
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN corepack enable && pnpm install --frozen-lockfile
COPY apps/web ./apps/web
COPY prisma ./prisma
RUN pnpm --filter web build

FROM nginx:1.25-alpine
COPY --from=base /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
