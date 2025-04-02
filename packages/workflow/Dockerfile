FROM node:20-alpine AS base

FROM base AS prune

RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app

RUN yarn global add turbo@1.13.4
COPY . .
RUN turbo prune @jptr/braille-workflow --docker

# INSTALLER
FROM base AS installer
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=prune /app/out/json/ .
COPY --from=prune /app/out/yarn.lock ./yarn.lock

# Install core dependencies first
# RUN YARN_ENABLE_INLINE_BUILDS=1 yarn install

# Add missing microservice transports + swagger
# @nestjs/microservices requires specific transport 
# dependencies even if unused, and Turborepo's pruning 
# is too aggressive. We need to inject these dependencies 
# directly in the Dockerfile without needing to modify the 
# local monorepo
RUN cd packages/workflow && \
    yarn add @grpc/grpc-js @grpc/proto-loader kafkajs mqtt nats amqplib amqp-connection-manager @nestjs/swagger

# Rebuild dependencies
RUN YARN_ENABLE_INLINE_BUILDS=1 yarn install

# BUILDER
COPY --from=prune /app/out/full/ .
RUN yarn turbo run build --filter=@jptr/braille-workflow...

# RUNNER
FROM base AS runner
RUN apk add --no-cache libc6-compat
RUN apk update
# RUN apk add --no-cache bash inotify-tools imagemagick graphicsmagick ghostscript
WORKDIR /app
ENV NODE_ENV=production

COPY --from=installer /app/ .

EXPOSE 3000
WORKDIR /app/packages/workflow
CMD LANGCHAIN_CALLBACKS_BACKGROUND=true yarn start:prod