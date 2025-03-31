import { Injectable, Logger } from '@nestjs/common';
import { Message } from '@aws-sdk/client-sqs';
import { SqsConsumerEventHandler, SqsMessageHandler } from '@ssut/nestjs-sqs';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

import { ActionExecution, TaskStatus } from '@jptr/braille-prisma';

import { prisma } from '../prisma';
import { ApplicationsService } from '../applications/applications.service';
import { ActionExecutionError } from '@jptr/braille-integrations';

@Injectable()
export class ExecutionsService {
  private readonly logger = new Logger(ExecutionsService.name);

  constructor(
    private applicationsService: ApplicationsService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  private async setActionExecutionStatus(
    tenantId: string,
    actionExecutionId: string,
    status: TaskStatus,
    errors?: ActionExecutionError[],
    log?: string,
  ) {
    const actionExecution = await prisma.$transaction(async ($tx) => {
      if (errors?.length) {
        await $tx.actionExecutionError.createMany({
          data: errors.map(({ userMessage }) => ({
            tenantId,
            actionExecutionId,
            userMessage,
            log,
          })),
        });
      }

      return await $tx.actionExecution.update({
        where: {
          tenantId,
          id: actionExecutionId,
        },
        include: {
          dataExtractJob: {
            include: {
              data: true,
              modelVersion: {
                include: {
                  model: true,
                  appVersionModelVersion: {
                    include: {
                      appVersion: {
                        include: {
                          app: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        data: {
          status,
        },
      });
    });

    /**
     * Notify that the action is now executing
     */
    await this.redis.publish(
      `${tenantId}:${actionExecutionId}`,
      JSON.stringify({
        subject: 'actionExecution',
        action: status.toLocaleLowerCase(),
        actionExecutionId,
        tenantId,
      }),
    );

    return actionExecution;
  }

  notifyUpdate(actionExecution: ActionExecution) {
    try {
      return this.redis.publish(
        `${actionExecution.tenantId}:${actionExecution.id}`,
        JSON.stringify({
          subject: 'actionExecution',
          action: 'started',
          actionExecutionId: actionExecution.id,
          tenantId: actionExecution.tenantId,
        }),
      );
    } catch (err) {
      this.logger.error('FAILED TO PUBLISH MESSAGE TO REDIS');
      this.logger.error(err);
    }
  }

  @SqsMessageHandler('ACTION_EXECUTION_QUEUE')
  public async handleMessage(message: Message) {
    if (!message.Body) {
      throw new Error('No message body');
    }
    const body = JSON.parse(message.Body);
    const { actionExecutionId, tenantId } = JSON.parse(body.Message);

    const actionExecution = await this.setActionExecutionStatus(
      tenantId,
      actionExecutionId,
      TaskStatus.RUNNING,
    );

    try {
      const job = actionExecution.dataExtractJob;

      if (!job.modelVersion.appVersionModelVersion) {
        throw new Error('Invalid job type');
      }

      const modelVersion =
        actionExecution.dataExtractJob.modelVersion.appVersionModelVersion;

      if (!modelVersion) {
        throw new Error('App entity model version is missing!');
      }

      const appId = modelVersion.appVersion?.appId;

      if (!appId) {
        throw new Error('App ID is missing!');
      }

      const modelName = actionExecution.dataExtractJob.modelVersion.model.name;

      if (!modelName) {
        throw new Error('Model name is missing!');
      }

      const { errors, log } = await this.applicationsService.performAction(
        tenantId,
        appId,
        modelName,
        actionExecution,
      );

      if (errors) {
        return await this.setActionExecutionStatus(
          tenantId,
          actionExecutionId,
          TaskStatus.FAILED,
          errors,
          log,
        );
      }

      await this.setActionExecutionStatus(
        tenantId,
        actionExecutionId,
        TaskStatus.FINISHED,
      );
    } catch (err) {
      await this.setActionExecutionStatus(
        tenantId,
        actionExecutionId,
        TaskStatus.FAILED,
      );
      throw err;
    }

    console.log(actionExecution);
  }

  @SqsConsumerEventHandler('ACTION_EXECUTION_QUEUE', 'processing_error')
  public onError(error: Error, message: Message) {
    // report errors here
    console.log(error, message);
  }
}
