FROM node:20-alpine AS base

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

# Copy the worker package
COPY packages/worker ./packages/worker

# Install dependencies and build
RUN yarn install
RUN yarn turbo run build --filter=@jptr/braille-worker...

# RUNNER
FROM base AS runner
RUN apk add --no-cache libc6-compat
RUN apk update
RUN apk add --no-cache bash inotify-tools imagemagick graphicsmagick ghostscript

WORKDIR /app
ENV NODE_ENV=production

# Copy built application
COPY --from=builder /app/packages/worker/dist ./dist
COPY --from=builder /app/packages/worker/package.json .
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 9000
CMD ["node", "dist/main"]