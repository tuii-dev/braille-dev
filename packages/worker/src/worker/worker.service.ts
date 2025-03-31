import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Message } from '@aws-sdk/client-sqs';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SqsConsumerEventHandler, SqsMessageHandler } from '@ssut/nestjs-sqs';
import { PublishCommand } from '@aws-sdk/client-sns';
import { PrismaClient, MimeType } from '@jptr/braille-prisma';
import { Upload } from '@aws-sdk/lib-storage';
import { PassThrough } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import https from 'https';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { fromBase64 } from 'pdf2pic';
import { s3, sns } from './aws';

const prisma = new PrismaClient();

type Record = {
  eventVersion: string;
  eventSource: string;
  awsRegion: string;
  eventTime: string;
  eventName: string;
  userIdentity: { principalId: string };
  requestParameters: { sourceIPAddress: string };
  responseElements: {
    'x-amz-request-id': string;
    'x-amz-id-2': string;
  };
  s3: {
    s3SchemaVersion: string;
    configurationId: string;
    bucket: {
      name: string;
      ownerIdentity: { principalId: string };
      arn: string;
    };
    ownerIdentity: { principalId: string };
    arn: string;
    object: { key: string; size: number; eTag: string; sequencer: string };
  };
};

@Injectable()
export class WorkerService {
  constructor(
    private configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  public async convertPDFViaPDFCo(records: { key: string; bucket: string }[]) {
    for (const record of records) {
      if (/\.pdf$/.test(record.key)) {
        const command = new GetObjectCommand({
          Key: record.key,
          Bucket: record.bucket,
        });

        const url = await getSignedUrl(s3, command, { expiresIn: 300 });

        const apiKey = this.configService.get<string>('PDF_CO_API_KEY');

        if (!apiKey) {
          throw new Error('PDF CO API KEY not configured');
        }

        const requestUrl = `${this.configService.get<string>(
          'PDF_CO_API_ENDPOINT',
        )}/v1/pdf/convert/to/png`;

        const headers = new Headers({
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        });

        const body = JSON.stringify({
          url,
          profiles: JSON.stringify({ WEBPQuality: 100 }),
          async: true,
        });

        const response = await fetch(requestUrl, {
          body,
          method: 'POST',
          headers,
        }).then((res) => res.json());

        if (response.error) {
          throw new Error(`PDF CO RETURNED ERROR ${JSON.stringify(response)}`);
        }

        const snsCommand = new PublishCommand({
          Message: JSON.stringify({
            jobId: response.jobId,
            documentKey: record.key,
          }),
          TopicArn: this.configService.get<string>('PDFCO_JOB_TOPIC_ARN'),
        });

        await sns.send(snsCommand);
      }
    }
  }

  async convertPDFViaPDF2Pic(records: { key: string; bucket: string }[]) {
    for (const record of records) {
      const command = new GetObjectCommand({
        Key: record.key,
        Bucket: record.bucket,
      });

      const response = await s3.send(command);

      if (!response.Body) {
        throw new Error('No response body');
      }

      const result = await fromBase64(
        await response.Body.transformToString('base64'),
        {
          density: 300,
          format: 'png',
          width: 2000,
          height: 2000,
          preserveAspectRatio: true,
        },
      ).bulk(-1, { responseType: 'buffer' });

      const { documentId, tenantId } = await prisma.$transaction(async (tx) => {
        const file = await tx.file.findUniqueOrThrow({
          where: {
            key: record.key,
          },
          include: {
            document: true,
          },
        });

        if (!file.document) {
          throw new Error('Could not find document for file');
        }

        await Promise.all(
          result.map(async (buffer, index) => {
            if (!file.document) {
              throw new Error('Could not find document for file');
            }
            const extension = 'png';
            const key = `${uuidv4()}.${extension}`;

            const upload = new Upload({
              client: s3,
              params: {
                Bucket: this.configService.get<string>('S3_UPLOAD_BUCKET'),
                Body: buffer.buffer,
                Key: key,
                ContentType: extension,
              },
            });

            await upload.done();

            return tx.file.create({
              data: {
                key,
                tenantId: file.document.tenantId,
                documentId: file.document.id,
                type: MimeType.PNG,
                idx: index,
              },
            });
          }),
        );

        return {
          documentId: file.document.id,
          tenantId: file.document.tenantId,
        };
      });

      await sns.send(
        new PublishCommand({
          TopicArn: this.configService.get<string>('DOCUMENTS_TOPIC_ARN'),
          Message: JSON.stringify({
            event: 'document:images:prepared',
            subject: 'document',
            action: 'updated',
            documentId,
            tenantId,
          }),
          MessageAttributes: {
            event: {
              DataType: 'String',
              StringValue: 'document:images:prepared',
            },
          },
        }),
      );

      await this.redis.publish(
        `${tenantId}:${documentId}`,
        JSON.stringify({
          subject: 'document',
          action: 'updated',
          documentId,
          tenantId,
        }),
      );
    }
  }

  @SqsMessageHandler('HANDLE_S3_PDF_QUEUE', false)
  public async handleMessage(message: Message) {
    if (!message.Body) {
      throw new Error('No message body');
    }
    const body = JSON.parse(message.Body);
    if (body.Event === 's3:TestEvent') {
      return;
    }

    const records: Record[] = body.Records;
    if (!records) {
      throw new Error('Records not found in message body');
    }

    if (this.configService.get<string>('LOCAL_PDF_CONVERSION') === 'true') {
      return this.convertPDFViaPDF2Pic(
        records.map((record) => ({
          key: record.s3.object.key,
          bucket: record.s3.bucket.name,
        })),
      );
    }

    return this.convertPDFViaPDFCo(
      records.map((record) => ({
        key: record.s3.object.key,
        bucket: record.s3.bucket.name,
      })),
    );
  }

  @SqsConsumerEventHandler('HANDLE_S3_PDF_QUEUE', 'processing_error')
  public onProcessingError(error: Error, message: Message) {
    // report errors here
    console.error(
      'ERROR OCCURRED PROCESSING HANDLE_S3_PDF_QUEUE',
      error,
      message,
    );
  }

  @SqsMessageHandler('PDFCO_RETRIEVE_QUEUE', false)
  public async handlePDFRetrievalMessage(message: Message) {
    if (!message.Body) {
      throw new Error('No message body');
    }

    const body = JSON.parse(message.Body);
    const { jobId, documentKey } = JSON.parse(body.Message);
    const apiKey = this.configService.get<string>('PDF_CO_API_KEY');

    if (!apiKey) {
      throw new Error('PDF CO API KEY not configured');
    }

    const response = await fetch(
      `${this.configService.get<string>('PDF_CO_API_ENDPOINT')}/v1/job/check`,
      {
        body: JSON.stringify({
          jobId,
        }),
        method: 'POST',
        headers: new Headers({
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        }),
      },
    ).then((res) => res.json());

    if (response.status !== 'success') {
      throw new Error(`PDFCO job unsuccessful ${JSON.stringify(response)}`);
    }

    const urls = await fetch(response.url).then((res) => res.json());

    const file = await prisma.file.findUnique({
      where: {
        key: documentKey,
      },
      include: {
        document: {
          select: {
            tenantId: true,
            id: true,
          },
        },
      },
    });

    if (!file) {
      throw new Error(`Could not find file for documentKey: ${documentKey}`);
    }

    const document = file.document;

    if (!document) {
      throw new Error(`Could not find document for file: ${file.id}`);
    }

    const documentId = file.documentId;
    const tenantId = file.tenantId;

    const promises = urls.map(async (url: string, index: number) => {
      const passthrough = new PassThrough();
      const extension = 'png';
      const key = `${uuidv4()}.${extension}`;

      const upload = new Upload({
        client: s3,
        params: {
          Bucket: this.configService.get<string>('S3_UPLOAD_BUCKET'),
          Body: passthrough,
          Key: key,
          ContentType: extension,
        },
      });

      return prisma.$transaction(async (tx) => {
        https.get(url, function (response) {
          response.pipe(passthrough);
        });

        await upload.done();

        return await tx.file.create({
          data: {
            key,
            tenantId: document.tenantId,
            documentId: document.id,
            type: MimeType.PNG,
            idx: index,
          },
        });
      });
    });

    await Promise.all(promises);

    await sns.send(
      new PublishCommand({
        TopicArn: this.configService.get<string>('DOCUMENTS_TOPIC_ARN'),
        Message: JSON.stringify({
          event: 'document:images:prepared',
          subject: 'document',
          action: 'updated',
          documentId: document.id,
          tenantId: document.tenantId,
        }),
        MessageAttributes: {
          event: {
            DataType: 'String',
            StringValue: 'document:images:prepared',
          },
        },
      }),
    );

    await this.redis.publish(
      `${tenantId}:${documentId}`,
      JSON.stringify({
        subject: 'document',
        action: 'updated',
        documentId: document.id,
        tenantId: document.tenantId,
      }),
    );

    // {
    //   Type: 'Notification',
    //   MessageId: '6d75f6d6-caf8-5de0-8bee-ab2f086f2a2a',
    //   TopicArn: 'arn:aws:sns:ap-southeast-2:337704890535:braille-services-dev-uploads-topic',
    //   Message: '{"jobId":"K2FEB26Q5UPMU8RT6L1XJARN9VUPPPNF--102-600","documentKey":"c51e9de7-316d-410a-a6db-c21fa7dd6a30.pdf"}',
    //   Timestamp: '2023-12-18T03:45:27.581Z',
    //   SignatureVersion: '1',
    //   Signature: 'We68cmw4LS1TuZkr/0XRwdcAl+DlzA/lDnYIUozrRHHITI9DS06gsJfvXH0Ur20IBnjg+mOEzYUfX/bQMGSe+ClL1DYWpu8yxOyRMvnjf+z210fa6hsgjUXo1yqkGVZJFCpJk+sgAGnWWRv7pQeAbSW2cq5ziTAQrUESNUiGF39jeOUdrJff1Ddnu/QT3P7eGEfcnLqXox/Hh9jMH+3tl7NjojqBiaUsSOllhIZZT9zZw7ucpuZInxCNLbl+OWbRnj6FmKF079NomfKSSjoPTsdw0RjRY5cMQEHXPtURhpEZCHUQ9qhRxMbH486VY8poQMN5B79TImnXJGUJY2s2JQ==',
    //   SigningCertURL: 'https://sns.ap-southeast-2.amazonaws.com/SimpleNotificationService-01d088a6f77103d0fe307c0069e40ed6.pem',
    //   UnsubscribeURL: 'https://sns.ap-southeast-2.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:ap-southeast-2:337704890535:braille-services-dev-uploads-topic:d21771eb-cc2e-460a-b945-03cf17788fc7'
    // }
  }

  @SqsConsumerEventHandler('PDFCO_RETRIEVE_QUEUE', 'processing_error')
  public onPDFRetrievalProcessingError(error: Error, message: Message) {
    // report errors here
    console.log(error, message);
  }
}
