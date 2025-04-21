// metrics.service.ts
import { Injectable } from '@nestjs/common';
import { metrics, ValueType } from '@opentelemetry/api';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class WorkflowMetricsService {
  private meter = metrics.getMeter('braille-workflow');

  // Workflow Level
  private totalWorkflowsStartedCounter = this.meter.createCounter(
    'total_workflows_started',
    {
      description: 'Total workflows started',
      valueType: ValueType.INT,
    },
  );

  private totalWorkflowsCompletedCounter = this.meter.createCounter(
    'total_workflows_completed',
    {
      description: 'Total workflows completed',
      valueType: ValueType.INT,
    },
  );

  private runningWorkflowsGauge = this.meter.createGauge(
    'total_workflows_running',
    {
      description: 'Total workflows running',
      valueType: ValueType.INT,
    },
  );

  private totalWorkflowsFailedCounter = this.meter.createCounter(
    'total_workflows_failed',
    {
      description: 'Total workflows failed',
      valueType: ValueType.INT,
    },
  );

  private workflowCompletionHistogram = this.meter.createHistogram(
    'workflow_completion_histogram',
    {
      description: 'Workflow completion histogram',
      valueType: ValueType.DOUBLE,
    },
  );

  // Workflow Step Level
  private totalWorkflowStepStartedCounter = this.meter.createCounter(
    'total_workflow_step_started',
    {
      description: 'Total workflow step started',
      valueType: ValueType.INT,
    },
  );

  private totalWorkflowStepCompletedCounter = this.meter.createCounter(
    'total_workflow_step_completed',
    {
      description: 'Total workflow step completed',
      valueType: ValueType.INT,
    },
  );

  private runningWorkflowStepsGauge = this.meter.createGauge(
    'total_workflow_steps_running',
    {
      description: 'Total workflow steps running',
      valueType: ValueType.INT,
    },
  );

  private totalWorkflowStepFailedCounter = this.meter.createCounter(
    'total_workflow_step_failed',
    {
      description: 'Total workflow step failed',
      valueType: ValueType.INT,
    },
  );

  private workflowStepCompletionHistogram = this.meter.createHistogram(
    'workflow_step_completion_histogram',
    {
      description: 'Workflow step completion histogram',
      valueType: ValueType.DOUBLE,
    },
  );

  constructor(
    @InjectPinoLogger(WorkflowMetricsService.name)
    private readonly logger: PinoLogger,
  ) {}

  // Workflow Level
  incrementTotalWorkflowsStartedCounter() {
    this.totalWorkflowsStartedCounter.add(1);
    this.runningWorkflowsGauge.record(1);
  }

  incrementTotalWorkflowsCompletedCounter() {
    this.totalWorkflowsCompletedCounter.add(1);
    this.runningWorkflowsGauge.record(-1);
  }

  incrementTotalWorkflowsFailedCounter() {
    this.totalWorkflowsFailedCounter.add(1);
    this.runningWorkflowsGauge.record(-1);
  }

  recordWorkflowCompletionDuration(startDate?: number, endDate?: number) {
    this.totalWorkflowsCompletedCounter.add(1);
    this.runningWorkflowsGauge.record(-1);

    if (!startDate || !endDate) {
      return;
    }

    const durationMinutes = (endDate - startDate) / 60000;
    this.workflowCompletionHistogram.record(durationMinutes);
  }

  // Workflow Step Level
  incrementTotalWorkflowStepStartedCounter(actionType: string) {
    this.totalWorkflowStepStartedCounter.add(1, { actionType });
    this.runningWorkflowStepsGauge.record(1);
  }

  incrementTotalWorkflowStepCompletedCounter(actionType: string) {
    this.totalWorkflowStepCompletedCounter.add(1, { actionType });
    this.runningWorkflowStepsGauge.record(-1);
  }

  incrementTotalWorkflowStepFailedCounter(actionType: string) {
    this.totalWorkflowStepFailedCounter.add(1, { actionType });
    this.runningWorkflowStepsGauge.record(-1);
  }

  recordWorkflowStepCompletionDuration(
    actionType: string,
    startDate?: number,
    endDate?: number,
  ) {
    this.totalWorkflowStepCompletedCounter.add(1, { actionType });
    this.runningWorkflowStepsGauge.record(-1);

    if (!startDate || !endDate) {
      return;
    }

    const durationMinutes = (endDate - startDate) / 60000;
    this.workflowStepCompletionHistogram.record(durationMinutes);
  }
}
