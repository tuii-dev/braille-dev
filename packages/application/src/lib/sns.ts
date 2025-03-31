import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

export const sns = new SNSClient({
  region: process.env.AWS_REGION,
});

export { PublishCommand };
