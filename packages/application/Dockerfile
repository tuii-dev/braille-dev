FROM node:22-alpine AS base

FROM base AS builder

RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app

# Enable corepack and install correct yarn version
RUN corepack enable
RUN corepack prepare yarn@4.0.2 --activate

# Copy root workspace files first
COPY package.json .
COPY turbo.json .
COPY yarn.lock .
COPY .gitignore .

# Copy the application package
COPY packages/application ./packages/application

# Install dependencies and build
RUN yarn install
RUN yarn turbo run build --filter=@jptr/braille-application...

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/packages/application/.next/standalone ./
WORKDIR /app/packages/application
COPY --from=builder /app/packages/application/public ./public
COPY --from=builder /app/packages/application/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
WORKDIR /app/packages/application

CMD ["node", "server.js"]