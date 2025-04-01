/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  type EventEnvelope,
  EventSubscriber,
  type IEventSubscriber,
} from '@ocoda/event-sourcing';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WorkflowExecutionCompletedEvent } from './workflow-execution-completed.event';

@EventSubscriber(WorkflowExecutionCompletedEvent)
export class WorkflowExecutionCompletedEventSubscriber
  implements IEventSubscriber
{
  constructor(
    private eventEmitter: EventEmitter2,
    @InjectPinoLogger(WorkflowExecutionCompletedEventSubscriber.name)
    private readonly logger: PinoLogger,
  ) {}

  handle({ payload }: EventEnvelope<WorkflowExecutionCompletedEvent>) {
    this.logger.info(
      `Running WorkflowExecutionCompletedEventSubscriber: ${JSON.stringify(
        payload,
      )}`,
    );

    const event = payload as WorkflowExecutionCompletedEvent;
    // Check if the completed node is the last node in the event
  }
}
