FROM node:22-alpine AS base

FROM base AS prune

RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app

RUN yarn global add turbo@1.13.4
COPY . .
RUN turbo prune @jptr/braille-application --docker

# INSTALLER
FROM base AS installer
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY .gitignore .gitignore
COPY --from=prune /app/out/json/ .
COPY --from=prune /app/out/yarn.lock ./yarn.lock
RUN YARN_ENABLE_INLINE_BUILDS=1 yarn install

# Rebuild the source code only when needed
# FROM base AS builder
# WORKDIR /app
# COPY --from=installer /app/node_modules ./node_modules

COPY --from=prune /app/out/full/ .
RUN yarn turbo run build --filter=@jptr/braille-application...

# If using npm comment out above and use below instead
# RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=installer --chown=nextjs:nodejs /app/packages/application/.next/standalone ./
WORKDIR /app/packages/application
COPY --from=installer --chown=nextjs:nodejs /app/packages/application/public ./public
COPY --from=installer --chown=nextjs:nodejs /app/packages/application/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
WORKDIR /app/packages/application

CMD ["node", "server.js"]