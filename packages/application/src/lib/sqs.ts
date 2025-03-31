import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

export const sqs = new SQSClient({
  region: process.env.AWS_REGION,
});

export const sendBootstrapMessage = async (
  tenantId: string,
  applicationId: string,
) => {
  const command = new SendMessageCommand({
    MessageBody: JSON.stringify({
      tenantId,
      applicationId,
    }),
    QueueUrl: process.env.INGESTION_SPAWNER_QUEUE!,
  });

  await sqs.send(command);
};

export { SendMessageCommand };
