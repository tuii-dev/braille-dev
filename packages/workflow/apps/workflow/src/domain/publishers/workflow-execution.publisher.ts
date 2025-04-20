import {
  EventEnvelope,
  EventPublisher,
  IEvent,
  type IEventPublisher,
} from '@ocoda/event-sourcing';
import { InjectPinoLogger } from 'nestjs-pino/InjectPinoLogger';
import { PinoLogger } from 'nestjs-pino/PinoLogger';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { SnsClientService } from '@app/common/services/aws/sns-client.service';
import { AwsTopicType } from '@app/common/shared/enums/aws-topic-type';
import { WorkflowExecutionStartedEvent } from '../events/workflow-executions/workflow-execution-started.event';
import { WorkflowExecutionProjectionService } from '@app/services/workflow-execution-projection.service';
import {
  WorkflowExecutionCompletedEvent,
  WorkflowExecutionFailedEvent,
  WorkflowExecutionParentNodeUpdatedEvent,
  WorkflowExecutionStepCompletedEvent,
  WorkflowExecutionStepFailedEvent,
  WorkflowExecutionStepStartedEvent,
  WorkflowTemplateCreatedEvent,
  WorkflowTemplateDeletedEvent,
  WorkflowTemplateUpdatedEvent,
} from '../events';

@EventPublisher()
export class WorkflowExecutionPublisher implements IEventPublisher {
  constructor(
    private readonly snsClientService: SnsClientService,
    private readonly workflowExecutionProjectionService: WorkflowExecutionProjectionService,
    @Inject('REDIS_CLIENT') private readonly client: ClientProxy,
    @InjectPinoLogger(WorkflowExecutionPublisher.name)
    private readonly logger: PinoLogger,
  ) {}
  async publish(envelope: EventEnvelope<IEvent>): Promise<boolean> {
    this.logger.info('Publishing WorkflowExecution Event to Redis');
    this.logger.info(JSON.stringify(envelope));

    return this.manageEvent(envelope);
  }

  private async manageEvent(envelope: EventEnvelope<IEvent>): Promise<boolean> {
    this.logger.info(`Managing envelope ${JSON.stringify(envelope)}`);
    this.logger.info('Publishing WorkflowExecution Event to Redis');

    let ok = false;
    try {
      await lastValueFrom(this.client.emit(envelope.event, envelope.payload));
      ok = true;
    } catch (error) {
      this.logger.error(`Error emitting event ${envelope.event}:`, error);
      ok = false;
    }
    if (ok) {
      this.logger.info(`Published event ${envelope.event} to Redis`);
      switch (envelope.event) {
        case 'app-scheduled-job-registration-created':
          ok = await this.publishToSns(
            envelope,
            AwsTopicType.AWS_JOB1_TOPIC_ARN,
          );
          break;
        case 'workflow-template-created':
          ok = await this.createWorkflowTemplateProjection(envelope);
          break;
        case 'workflow-template-updated':
          ok = await this.updateWorkflowTemplateProjection(envelope);
          break;
        case 'workflow-template-deleted':
          ok = await this.deleteWorkflowTemplateProjection(envelope);
          break;
        case 'workflow-execution-started':
          ok = await this.createWorkflowExecutionProjection(envelope);
          break;
        case 'workflow-execution-completed':
          ok = await this.completeWorkflowExecutionProjection(envelope);
          break;
        case 'workflow-execution-failed':
          ok = await this.failWorkflowExecutionProjection(envelope);
          break;
        case 'workflow-execution-step-started':
          ok = await this.updateStepForStartProjection(envelope);
          break;
        case 'workflow-execution-step-completed':
          ok = await this.updateStepForCompletionProjection(envelope);
          break;
        case 'workflow-execution-step-failed':
          ok = await this.updateStepForFailedProjection(envelope);
          break;
        case 'workflow-execution-parent-node-updated':
          ok = await this.updateParentNodeProjection(envelope);
          break;
        default:
          this.logger.info(
            'Event payload is not configured for further event publication.',
          );
          break;
      }
    } else {
      this.logger.error(`Failed to publish event ${envelope.event} to Redis`);
    }

    return ok;
  }

  private async publishToSns(
    envelope: EventEnvelope<IEvent>,
    topicType: AwsTopicType,
  ): Promise<boolean> {
    this.logger.info(`Publishing ${envelope.event} event to SNS`);
    return await this.snsClientService.publish(topicType, envelope.payload);
  }

  private async createWorkflowTemplateProjection(
    envelope: EventEnvelope<IEvent>,
  ) {
    this.logger.info('Creating workflow template projection');
    return await this.workflowExecutionProjectionService.createWorkflowTemplateProjection(
      envelope.payload as WorkflowTemplateCreatedEvent,
    );
  }

  private async updateWorkflowTemplateProjection(
    envelope: EventEnvelope<IEvent>,
  ) {
    this.logger.info('Updating workflow template projection');
    return await this.workflowExecutionProjectionService.updateWorkflowTemplateProjection(
      envelope.payload as WorkflowTemplateUpdatedEvent,
    );
  }

  private async deleteWorkflowTemplateProjection(
    envelope: EventEnvelope<IEvent>,
  ) {
    this.logger.info('Deleting workflow template projection');
    return await this.workflowExecutionProjectionService.deleteWorkflowTemplateProjection(
      envelope.payload as WorkflowTemplateDeletedEvent,
    );
  }

  private async createWorkflowExecutionProjection(
    envelope: EventEnvelope<IEvent>,
  ) {
    this.logger.info('Creating workflow execution projection');
    return await this.workflowExecutionProjectionService.createWorkflowExecutionProjection(
      envelope.payload as WorkflowExecutionStartedEvent,
    );
  }

  private async completeWorkflowExecutionProjection(
    envelope: EventEnvelope<IEvent>,
  ) {
    this.logger.info('Completing workflow execution projection');
    return await this.workflowExecutionProjectionService.completeWorkflowExecutionProjection(
      envelope.payload as WorkflowExecutionCompletedEvent,
    );
  }

  private async failWorkflowExecutionProjection(
    envelope: EventEnvelope<IEvent>,
  ) {
    this.logger.info('Failing workflow execution projection');
    return await this.workflowExecutionProjectionService.failWorkflowExecutionProjection(
      envelope.payload as WorkflowExecutionFailedEvent,
    );
  }

  private async updateStepForStartProjection(envelope: EventEnvelope<IEvent>) {
    this.logger.info('Updating workflow execution start step projection');
    const event = envelope.payload as WorkflowExecutionStepStartedEvent;
    if (event.isFirstNode) {
      return await this.workflowExecutionProjectionService.updateStepForStartProjectionDelayed(
        event,
      );
    } else {
      return await this.workflowExecutionProjectionService.updateStepForStartProjection(
        event,
      );
    }
  }

  private async updateStepForCompletionProjection(
    envelope: EventEnvelope<IEvent>,
  ) {
    this.logger.info('Updating workflow execution complete step projection');
    return await this.workflowExecutionProjectionService.updateStepForCompletionProjection(
      envelope.payload as WorkflowExecutionStepCompletedEvent,
    );
  }

  private async updateStepForFailedProjection(envelope: EventEnvelope<IEvent>) {
    this.logger.info('Updating workflow execution failed step projection');
    return await this.workflowExecutionProjectionService.updateStepForFailedProjection(
      envelope.payload as WorkflowExecutionStepFailedEvent,
    );
  }

  private async updateParentNodeProjection(envelope: EventEnvelope<IEvent>) {
    this.logger.info('Updating workflow execution parent node projection');
    return await this.workflowExecutionProjectionService.updateParentNodeProjection(
      envelope.payload as WorkflowExecutionParentNodeUpdatedEvent,
    );
  }
}
