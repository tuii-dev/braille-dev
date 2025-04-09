#!/bin/bash

set -e

function log() {
    echo "----------------------------------------"
    echo "$1"
    echo "----------------------------------------"
}

# Set AWS region
AWS_REGION="ca-central-1"

log "EC2 Instances"
aws ec2 describe-instances \
    --region $AWS_REGION \
    --query 'Reservations[*].Instances[*].[InstanceId,State.Name,Tags[?Key==`Name`].Value|[0]]' \
    --output table

log "S3 Buckets"
aws s3api list-buckets \
    --query 'Buckets[*].[Name,CreationDate]' \
    --output table

log "RDS Instances"
aws rds describe-db-instances \
    --region $AWS_REGION \
    --query 'DBInstances[*].[DBInstanceIdentifier,Engine,DBInstanceStatus]' \
    --output table

log "CloudFront Distributions"
aws cloudfront list-distributions \
    --query 'DistributionList.Items[*].[Id,DomainName,Status]' \
    --output table

log "ElastiCache Clusters"
aws elasticache describe-cache-clusters \
    --region $AWS_REGION \
    --query 'CacheClusters[*].[CacheClusterId,Engine,CacheClusterStatus]' \
    --output table

log "ECS Clusters"
aws ecs list-clusters \
    --region $AWS_REGION \
    --query 'clusterArns[]' \
    --output table

log "Lambda Functions"
aws lambda list-functions \
    --region $AWS_REGION \
    --query 'Functions[*].[FunctionName,Runtime,LastModified]' \
    --output table

log "API Gateway APIs"
aws apigateway get-rest-apis \
    --region $AWS_REGION \
    --query 'items[*].[name,id,createdDate]' \
    --output table

log "Secrets Manager Secrets"
aws secretsmanager list-secrets \
    --region $AWS_REGION \
    --query 'SecretList[*].[Name,LastChangedDate]' \
    --output table

log "Route53 Hosted Zones"
aws route53 list-hosted-zones \
    --query 'HostedZones[*].[Name,Id]' \
    --output table

log "Service Discovery Namespaces"
aws servicediscovery list-namespaces \
    --region $AWS_REGION \
    --query 'Namespaces[*].[Name,Id,Type]' \
    --output table

log "CloudFront Origin Access Controls"
aws cloudfront list-origin-access-controls \
    --query 'OriginAccessControlList.Items[*].[Name,Id]' \
    --output table

log "CloudFront Public Keys"
aws cloudfront list-public-keys \
    --query 'PublicKeyList.Items[*].[Name,Id]' \
    --output table

log "DB Subnet Groups"
aws rds describe-db-subnet-groups \
    --region $AWS_REGION \
    --query 'DBSubnetGroups[*].[DBSubnetGroupName,VpcId]' \
    --output table

log "ElastiCache Subnet Groups"
aws elasticache describe-cache-subnet-groups \
    --region $AWS_REGION \
    --query 'CacheSubnetGroups[*].[CacheSubnetGroupName,VpcId]' \
    --output table
