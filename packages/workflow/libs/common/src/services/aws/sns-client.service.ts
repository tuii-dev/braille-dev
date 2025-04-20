/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { AwsTopicType } from '../../shared/enums/aws-topic-type';

@Injectable()
export class SnsClientService {
  private sns: SNSClient;
  constructor(
    private readonly configService: ConfigService,
    @InjectPinoLogger(SnsClientService.name)
    private readonly logger: PinoLogger,
  ) {
    this.sns = new SNSClient({
      region: this.configService.get('AWS_REGION'),
    });
  }

  async publish(topic: AwsTopicType, message: any): Promise<boolean> {
    this.logger.info(`Publishing message to SNS topic: ${topic}`);
    try {
      const command = new PublishCommand({
        TopicArn: topic,
        Message: JSON.stringify(message),
      });
      await this.sns.send(command);
      this.logger.info(`Successfully published message to SNS topic: ${topic}`);
      return true;
    } catch (error) {
      this.logger.info(`Failed to publish message to SNS topic: ${topic}`);
      this.logger.error(error);
      return false;
    }
  }
}
