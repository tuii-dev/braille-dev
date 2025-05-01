#!/bin/sh
echo "=== WORKFLOW CONTAINER STARTING ==="
echo "Container environment: $NODE_ENV, $BRAILLE_ENV"
echo "AWS Region: $AWS_REGION"
echo "Database URL format: ${POSTGRES_PRISMA_URL%%@*}@*****"
echo "Redis host: $REDIS_HOST"
echo "DynamoDB host: $DYNAMODB_ENDPOINT"

echo "Checking Postgres connectivity..."
# Extract host and port from POSTGRES_PRISMA_URL using pure shell
PG_HOST=$(echo $POSTGRES_PRISMA_URL | sed -E 's|.*@([^:/]+)(:[0-9]+)?/.*|\1|')
PG_PORT=$(echo $POSTGRES_PRISMA_URL | sed -E 's|.*:([0-9]+)/.*|\1|')
if [ -z "$PG_PORT" ]; then PG_PORT=5432; fi

echo "Attempting to connect to PostgreSQL at $PG_HOST:$PG_PORT"
if nc -z -v -w2 $PG_HOST $PG_PORT 2>/dev/null; then
  echo "✓ PostgreSQL reachable"
else
  echo "✗ PostgreSQL unreachable"
fi

echo "Checking Redis connectivity..."
if [ -z "$REDIS_HOST" ]; then
  echo "✗ Redis host not specified in REDIS_HOST environment variable"
else
  if nc -z -v -w2 $REDIS_HOST 6379 2>/dev/null; then
    echo "✓ Redis reachable at $REDIS_HOST:6379"
    echo "Testing Redis PING..."
    if redis-cli -h $REDIS_HOST PING 2>/dev/null | grep -q PONG; then
      echo "✓ Redis PING successful"
    else
      echo "✗ Redis PING failed"
    fi
  else
    echo "✗ Redis unreachable at $REDIS_HOST:6379"
  fi
fi

if [ -n "$AWS_REGION" ]; then
  echo "Testing DynamoDB connectivity..."
  echo "Note: Full DynamoDB checks skipped in diagnostic script, will be checked by application."
  echo "AWS Region configured: $AWS_REGION"
  
else
  echo "AWS_REGION not set, skipping DynamoDB checks"
fi

echo "Starting PM2 runtime..."
exec yarn run start:prod
