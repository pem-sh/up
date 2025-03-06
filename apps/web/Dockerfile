FROM node:20-alpine AS base
 
FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat

WORKDIR /app
# Enable corepack and prepare pnpm
RUN npm install -g corepack turbo@^2
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY . .
 
# Generate a partial monorepo with a pruned lockfile for a target workspace.
# Assuming "web" is the name entered in the project's package.json: { name: "web" }
RUN turbo prune @up/www --docker
 
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
 
COPY --from=builder /app/out/json/ .

RUN npm install -g corepack turbo@^2
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile
 
# Build the project
COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build
 
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
 
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
 
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
 
CMD node apps/web/server.js