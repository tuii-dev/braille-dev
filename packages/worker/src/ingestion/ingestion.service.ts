import { Injectable, Logger } from '@nestjs/common';
import _ from 'lodash';
import { PublishBatchCommand } from '@aws-sdk/client-sns';
import { Message } from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import {
  SqsConsumerEventHandler,
  SqsMessageHandler,
  SqsService,
} from '@ssut/nestjs-sqs';

import { prisma } from '../prisma';
import { sns } from '../worker/aws';

import { ApplicationsService } from '../applications/applications.service';
import { Traceable } from '@amplication/opentelemetry-nestjs';

@Traceable()
@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly sqsService: SqsService,
    private applicationsService: ApplicationsService,
    private configService: ConfigService,
  ) {}

  @SqsMessageHandler('INGESTION_TASK_QUEUE', false)
  public async handleIngestionTask(message: Message) {
    if (!message.Body) {
      throw new Error('No message body');
    }

    const { tenantId, appId, modelId, modelName, modelVersionId } = JSON.parse(
      message.Body,
    );

    await this.ingest(tenantId, appId, modelId, modelName, modelVersionId);
  }

  @SqsConsumerEventHandler('INGESTION_TASK_QUEUE', 'processing_error')
  public onIngestionTaskError(error: Error, message: Message) {
    // report errors here
    this.logger.error('ERROR OCCURRED PROCESSING INGESTION_TASK_QUEUE');
    this.logger.error(error);
    this.logger.error(message);
  }

  getTargetConnection(message: Message) {
    if (!message.Body) {
      throw new Error('No message body');
    }

    try {
      const parsed = JSON.parse(message.Body);

      if (parsed && typeof parsed === 'object') {
        return parsed as { tenantId: string; applicationId: string };
      }
    } catch {}

    return null;
  }

  @SqsMessageHandler('INGESTION_SPAWNER_QUEUE', false)
  public async handleIngestionSpawnerTask(message: Message) {
    if (!message.Body) {
      throw new Error('No message body');
    }

    const target = this.getTargetConnection(message);

    if (target) {
      this.logger.log(
        `TARGET CONNECTION tenantId:${target.tenantId} appId:${target.applicationId}`,
      );
    } else {
      this.logger.log(
        `SPAWNING FOR ALL CONNECTIONS SINCE NO TARGET CONNECTION`,
      );
    }

    const appConnections = await prisma.appConnection.findMany({
      ...(target
        ? {
            where: {
              tenantId: target?.tenantId,
              appId: target?.applicationId,
            },
          }
        : {}),
      include: {
        app: {
          include: {
            versions: {
              take: 1,
              orderBy: {
                createdAt: 'desc',
              },
              include: {
                modelVersions: {
                  include: {
                    modelVersion: {
                      include: {
                        model: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const messages = appConnections.reduce(
      (acc, config) => [
        ...acc,
        ...config.app.versions[0].modelVersions.map((version) => {
          const messageId = crypto
            .createHash('md5')
            .update(`${config.tenantId}:${version.modelVersion.model.id}`)
            .digest('hex');

          return {
            messageId,
            tenantId: config.tenantId,
            appId: config.appId,
            appVersionId: config.app.versions[0].id,
            modelId: version.modelVersion.model.id,
            modelName: version.modelVersion.model.name,
            modelVersionId: version.modelVersion.id,
          };
        }),
      ],
      [],
    );

    const chunked = _.chunk(messages, 10);

    for (const chunk of chunked) {
      await this.sqsService.send(
        'INGESTION_TASK_QUEUE',
        chunk.map((message) => ({
          id: message.messageId,
          body: message,
        })),
      );
    }

    this.logger.log(
      `SUCCESSFULLY SPAWNED ${messages.length} INGESTION TASK(S)`,
    );
  }

  @SqsConsumerEventHandler('INGESTION_SPAWNER_QUEUE', 'processing_error')
  public onIngestionSpawnError(error: Error, message: Message) {
    // report errors here
    console.error(
      'ERROR OCCURRED PROCESSING INGESTION_SPAWNER_QUEUE',
      error,
      message,
    );
  }

  async ingestPage({
    tenantId,
    appId,
    modelId,
    modelVersionId,
    entityModelName,
    page,
  }: {
    tenantId: string;
    appId: string;
    modelId: string;
    modelVersionId: string;
    entityModelName: string;
    page: number;
  }) {
    const result = await this.applicationsService.performAction(
      tenantId,
      appId,
      // TODO USE ID INSTEAD
      entityModelName,
      'list',
      page,
    );

    if (result && 'entities' in result && result.entities) {
      const entities = result.entities;

      const saved = await Promise.all(
        entities.map(async (entity: any) => {
          const entityId = `${tenantId}:${modelId}:${entity.Id}`;

          return prisma.entity.upsert({
            where: {
              id: entityId,
            },
            update: {
              data: entity,
              modelVersionId,
            },
            create: {
              id: entityId,
              tenantId,
              data: entity,
              appId,
              modelId,
              modelVersionId,
            },
          });
        }),
      );

      const chunked = _.chunk(saved, 10);

      for (const chunk of chunked) {
        const snsCommand = new PublishBatchCommand({
          TopicArn: this.configService.get<string>('ENTITIES_TOPIC_ARN'),
          PublishBatchRequestEntries: chunk.map((entity) => ({
            Id: crypto.createHash('md5').update(entity.id).digest('hex'),
            Message: JSON.stringify({
              event: 'entity:ingested',
              subject: 'entity',
              action: 'ingested',
              entityId: entity.id,
              tenantId,
            }),
            MessageAttributes: {
              event: {
                DataType: 'String',
                StringValue: 'entity:ingested',
              },
            },
          })),
        });

        await sns.send(snsCommand);
      }

      this.logger.log(
        `SUCCESSFUL INGESTION TASK: ${JSON.stringify({
          tenantId,
          appId,
          modelId,
          entityModelName,
          page,
        })}`,
      );
    }

    return result;
  }

  async ingest(
    tenantId: string,
    appId: string,
    modelId: string,
    entityModelName: string,
    modelVersionId: string,
  ) {
    // const appConnection = await prisma.appConnection.findFirstOrThrow({
    //   where: {
    //     tenantId,
    //     appId,
    //   },
    //   include: {
    //     app: {
    //       include: {
    //         entityModels: {
    //           include: {
    //             model: {
    //               include: {
    //                 versions: {
    //                   include: {
    //                     schema: true,
    //                   },
    //                   take: 1,
    //                   orderBy: {
    //                     createdAt: 'desc',
    //                   },
    //                 },
    //               },
    //             },
    //           },
    //           where: {
    //             model: {
    //               id: modelId,
    //             },
    //           },
    //           take: 1,
    //         },
    //       },
    //     },
    //     settings: true,
    //     oauthTokenset: true,
    //   },
    // });

    // const entityModel = appConnection.app.entityModels[0];

    // if (!entityModel) {
    //   throw new Error('No entityModel found');
    // }

    // const currentVersion = entityModel.model.versions[0];

    // if (!currentVersion) {
    //   throw new Error('No model version found');
    // }

    // const versionSchema = currentVersion.schema.schema;

    let page: number | null | undefined = 1;

    while (page) {
      const { entities } = await this.ingestPage({
        tenantId,
        appId,
        modelId,
        modelVersionId,
        entityModelName,
        page,
      });

      page = entities?.length ? page + 1 : null;
    }
  }
}
