#!/bin/bash

aws dynamodb list-tables --endpoint-url http://dynamodb:8000 --region us-east-1

# Delete tables if they already exist (idempotency)
aws dynamodb delete-table --table-name events --endpoint-url http://dynamodb:8000 --region us-east-1 2>/dev/null || true
aws dynamodb delete-table --table-name snapshots --endpoint-url http://dynamodb:8000 --region us-east-1 2>/dev/null || true

# Create events table
aws dynamodb create-table \
  --endpoint-url http://dynamodb:8000 \
  --table-name events \
  --attribute-definitions \
      AttributeName=eventDate,AttributeType=S \
      AttributeName=eventId,AttributeType=S \
      AttributeName=aggregateId,AttributeType=S \
      AttributeName=version,AttributeType=N \
  --key-schema AttributeName=eventDate,KeyType=HASH AttributeName=eventId,KeyType=RANGE \
  --global-secondary-indexes '[
    {
      "IndexName": "eventIdIndex",
      "KeySchema": [
        {"AttributeName": "eventDate", "KeyType": "HASH"},
        {"AttributeName": "eventId", "KeyType": "RANGE"}
      ],
      "Projection": {"ProjectionType": "ALL"},
      "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}
    },
    {
      "IndexName": "aggregate_id_index",
      "KeySchema": [
        {"AttributeName": "aggregateId", "KeyType": "HASH"},
        {"AttributeName": "version", "KeyType": "RANGE"}
      ],
      "Projection": {"ProjectionType": "ALL"},
      "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}
    }
  ]' \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Create snapshots table
aws dynamodb create-table \
  --endpoint-url http://dynamodb:8000 \
  --table-name snapshots \
  --attribute-definitions \
      AttributeName=aggregateName,AttributeType=S \
      AttributeName=latest,AttributeType=S \
      AttributeName=aggregateId,AttributeType=S \
      AttributeName=version,AttributeType=N \
  --key-schema AttributeName=aggregateName,KeyType=HASH AttributeName=latest,KeyType=RANGE \
  --global-secondary-indexes '[
    {
      "IndexName": "aggregate_index",
      "KeySchema": [
        {"AttributeName": "aggregateName", "KeyType": "HASH"},
        {"AttributeName": "latest", "KeyType": "RANGE"}
      ],
      "Projection": {"ProjectionType": "ALL"},
      "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}
    },
    {
      "IndexName": "aggregate_id_index",
      "KeySchema": [
        {"AttributeName": "aggregateId", "KeyType": "HASH"},
        {"AttributeName": "version", "KeyType": "RANGE"}
      ],
      "Projection": {"ProjectionType": "ALL"},
      "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}
    }
  ]' \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

  aws dynamodb list-tables --endpoint-url http://dynamodb:8000 --region us-east-1