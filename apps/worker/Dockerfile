FROM node:20-slim

WORKDIR /app

RUN npm install -g corepack turbo@^2
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY . .

RUN turbo prune @up/worker --docker
RUN pnpm install --frozen-lockfile

RUN npm install -g tsx
ENV NODE_ENV=production

CMD ["npx", "tsx", "apps/worker/src/index.ts"]
