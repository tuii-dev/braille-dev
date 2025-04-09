#!/bin/bash

set -e

function log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Set AWS region
AWS_REGION="ca-central-1"

log "Starting AWS resource cleanup..."

# S3 Bucket
BUCKET_NAME="braille-services-dev-braille-uploads-travis"
log "Deleting S3 bucket: $BUCKET_NAME"
aws s3 rm "s3://$BUCKET_NAME" --recursive || true
aws s3api delete-bucket --bucket "$BUCKET_NAME" --region "$AWS_REGION" || true

# Service Discovery Namespace
log "Deleting Service Discovery HTTP Namespace"
NAMESPACE_ID=$(aws servicediscovery list-namespaces --region "$AWS_REGION" --query "Namespaces[?Name=='private.braille'].Id" --output text)
if [ ! -z "$NAMESPACE_ID" ]; then
    aws servicediscovery delete-namespace --id "$NAMESPACE_ID" --region "$AWS_REGION" || true
fi

# Route53 Records
ZONE_ID=$(aws route53 list-hosted-zones-by-name --dns-name "keeperofthewatchfire.com." --query "HostedZones[0].Id" --output text)
if [ ! -z "$ZONE_ID" ]; then
    log "Deleting Route53 CAA record"
    aws route53 change-resource-record-sets --hosted-zone-id "$ZONE_ID" --change-batch '{
        "Changes": [{
            "Action": "DELETE",
            "ResourceRecordSet": {
                "Name": "keeperofthewatchfire.com.",
                "Type": "CAA",
                "TTL": 300,
                "ResourceRecords": [
                    {"Value": "0 issue \"letsencrypt.org\""}
                ]
            }
        }]
    }' --region "$AWS_REGION" || true
fi

# CloudFront Resources
log "Deleting CloudFront resources"
# Origin Access Control
OAC_ID=$(aws cloudfront list-origin-access-controls --query "OriginAccessControlList.Items[?Name=='braille-documents-oac'].Id" --output text --region "$AWS_REGION")
if [ ! -z "$OAC_ID" ]; then
    aws cloudfront delete-origin-access-control --id "$OAC_ID" --region "$AWS_REGION" || true
fi

# Public Key
PUBLIC_KEY_ID=$(aws cloudfront list-public-keys --query "PublicKeyList.Items[?Name=='cloudfront-key'].Id" --output text --region "$AWS_REGION")
if [ ! -z "$PUBLIC_KEY_ID" ]; then
    aws cloudfront delete-public-key --id "$PUBLIC_KEY_ID" --region "$AWS_REGION" || true
fi

# Response Headers Policy
POLICY_ID=$(aws cloudfront list-response-headers-policies --query "ResponseHeadersPolicyList.Items[?Name=='braille-services-dev_uploads_bucket_dist_response_headers_policy'].Id" --output text --region "$AWS_REGION")
if [ ! -z "$POLICY_ID" ]; then
    aws cloudfront delete-response-headers-policy --id "$POLICY_ID" --region "$AWS_REGION" || true
fi

# Secrets Manager
SECRET_NAME="braille-services-dev--api-db-password"
log "Deleting Secrets Manager secret: $SECRET_NAME"
aws secretsmanager delete-secret --secret-id "$SECRET_NAME" --force-delete-without-recovery --region "$AWS_REGION" || true

# RDS Subnet Group
DB_SUBNET_GROUP="braille-db"
log "Deleting RDS DB Subnet Group: $DB_SUBNET_GROUP"
aws rds delete-db-subnet-group --db-subnet-group-name "$DB_SUBNET_GROUP" --region "$AWS_REGION" || true

# ElastiCache Subnet Group
CACHE_SUBNET_GROUP="braille-services-dev-elasticache-subnet-group"
log "Deleting ElastiCache Subnet Group: $CACHE_SUBNET_GROUP"
aws elasticache delete-cache-subnet-group --cache-subnet-group-name "$CACHE_SUBNET_GROUP" --region "$AWS_REGION" || true

log "AWS resource cleanup complete"
