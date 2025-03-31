import { S3Client } from '@aws-sdk/client-s3';
import { SNSClient } from '@aws-sdk/client-sns';

export const s3 = new S3Client({
  forcePathStyle: true,
  region: process.env.AWS_REGION,
});

export const sns = new SNSClient({
  region: process.env.AWS_REGION,
});
