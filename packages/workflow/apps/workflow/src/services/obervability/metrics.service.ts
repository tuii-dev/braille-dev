// metrics.service.ts
import { Injectable } from '@nestjs/common';
import { metrics, ValueType } from '@opentelemetry/api';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { WorkflowStartedCounterArgs } from './attributes/common-workflow-args.interface';

@Injectable()
export class WorkflowMetricsService {
  private meter = metrics.getMeter('braille-workflow');
  private totalWorkflowsStartedCounter = this.meter.createCounter(
    'total_workflows_started',
    {
      description: 'Total workflows started',
      valueType: ValueType.INT,
    },
  );

  constructor(
    @InjectPinoLogger(WorkflowMetricsService.name)
    private readonly logger: PinoLogger,
  ) {}

  incrementTotalWorkflowsStartedCounter({
    tenantId,
    workflowTemplateId,
  }: WorkflowStartedCounterArgs) {
    this.totalWorkflowsStartedCounter.add(1, {
      tenantId,
      workflowTemplateId,
    });
  }
}
