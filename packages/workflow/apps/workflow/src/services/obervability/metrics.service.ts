// metrics.service.ts
import { Injectable } from '@nestjs/common';
import { metrics } from '@opentelemetry/api';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class WorkflowMetricsService {
  private meter = metrics.getMeter('braille-workflow');
  private totalWorkflowsStartedCounter = this.meter.createCounter(
    'total_workflows_started',
    {
      description: 'Total workflows started',
      valueType: 1, // 1 = INT (from ValueType.INT)
    },
  );

  constructor(
    @InjectPinoLogger(WorkflowMetricsService.name)
    private readonly logger: PinoLogger,
  ) {}

  incrementTotalWorkflowsStartedCounter() {
    this.totalWorkflowsStartedCounter.add(1);
  }
}
