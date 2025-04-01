FROM node:20-alpine AS base

FROM base AS prune

RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app

RUN yarn global add turbo@1.13.4
# Copy root workspace files first
COPY package.json .
COPY turbo.json .
COPY yarn.lock .
# Then copy the worker package
COPY packages/worker ./packages/worker
RUN turbo prune "@jptr/braille-worker" --docker --scope="@jptr/braille-worker" --no-deps

# INSTALLER
FROM base AS installer
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=prune /app/out/json/ .
COPY --from=prune /app/out/yarn.lock ./yarn.lock
RUN YARN_ENABLE_INLINE_BUILDS=1  yarn install

# BUILDER
COPY --from=prune /app/out/full/ .
RUN yarn turbo run build --filter=@jptr/braille-worker...

# RUNNER
FROM base AS runner
RUN apk add --no-cache libc6-compat
RUN apk update
RUN apk add --no-cache bash inotify-tools imagemagick graphicsmagick ghostscript
WORKDIR /app
ENV NODE_ENV=production

COPY --from=installer /app/ .

EXPOSE 9000
WORKDIR /app/packages/worker
CMD LANGCHAIN_CALLBACKS_BACKGROUND=true yarn start:prod