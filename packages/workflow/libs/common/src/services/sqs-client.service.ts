/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import {
  DeleteMessageCommand,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { AwsQueueUrlType } from '../shared/enums/aws-queue-url-type';

@Injectable()
export class SqsClientService {
  private sqs: SQSClient;
  constructor(
    private readonly configService: ConfigService,
    @InjectPinoLogger(SqsClientService.name)
    private readonly logger: PinoLogger,
  ) {
    this.sqs = new SQSClient({
      region: this.configService.get('AWS_REGION'),
    });
  }

  async send(message: any, queueUrl: AwsQueueUrlType): Promise<void> {
    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(message),
    });
    await this.sqs.send(command);
  }

  async delete(
    receiptHandle: string,
    queueUrl: AwsQueueUrlType,
  ): Promise<void> {
    this.logger.info(
      `Deleting message: ${receiptHandle} from queue: ${queueUrl}`,
    );
    const command = new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    });
    await this.sqs.send(command);
  }
}
