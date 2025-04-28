/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// metrics.service.ts

const { MetricBatch, MetricClient, GaugeMetric } =
  require('@newrelic/telemetry-sdk').telemetry.metrics;

import { Mutex } from 'async-mutex';
import { RedisService } from '@app/common/services';
import { MetricType } from '@app/common/shared/enums/metric-types';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class WorkflowMetricsService implements OnModuleInit {
  private metricClient;
  private gaugeReportingInterval = 15000;
  private counterReportingInterval = 15000;
  private durationReportingInterval = 15000;
  private ONE_HOUR_SECONDS = 3600;

  // Gauge values
  private runningWorkflows = 0;
  private runningWorkflowSteps = 0;

  // Counter values
  private totalWorkflowsStarted = 0;
  private totalWorkflowsCompleted = 0;
  private totalWorkflowsFailed = 0;
  private totalWorkflowStepsStarted = 0;
  private totalWorkflowStepsCompleted = 0;
  private totalWorkflowStepsFailed = 0;

  // Mutexes for gauge values
  private runningWorkflowsMutex = new Mutex();
  private runningWorkflowStepsMutex = new Mutex();

  // Mutexes for counter values
  private totalWorkflowsStartedMutex = new Mutex();
  private totalWorkflowsCompletedMutex = new Mutex();
  private totalWorkflowsFailedMutex = new Mutex();

  private totalWorkflowStepsStartedMutex = new Mutex();
  private totalWorkflowStepsCompletedMutex = new Mutex();
  private totalWorkflowStepsFailedMutex = new Mutex();

  // Failure tracking
  private failedExecutionIds: string[] = [];
  private failedNodeIds: string[] = [];

  constructor(
    private readonly redisService: RedisService,
    @InjectPinoLogger(WorkflowMetricsService.name)
    private readonly logger: PinoLogger,
  ) {}

  async onModuleInit() {
    await this.init();
  }

  async init() {
    this.metricClient = new MetricClient({
      apiKey: '8a63de61035daa7a9eb920456926f29cFFFFNRAL',
    });

    // Testing only
    await this.persistRunningWorkflows();
    await this.persistRunningWorkflowSteps();

    const runningWorkflows = await this.redisService.getValue(
      MetricType.RUNNING_WORKFLOWS_REDIS_KEY,
    );
    this.runningWorkflows = runningWorkflows
      ? parseInt(runningWorkflows, 10)
      : 0;
    const runningWorkflowSteps = await this.redisService.getValue(
      MetricType.RUNNING_WORKFLOW_STEPS_REDIS_KEY,
    );
    this.runningWorkflowSteps = runningWorkflowSteps
      ? parseInt(runningWorkflowSteps, 10)
      : 0;

    this.startGaugeReporting();
    this.startCounterReporting();
    this.startCompleteCounterReporting();
    this.startFailedCounterReporting();
    this.startDurationReporting();
  }

  async updateRunningWorkflows(
    updater: (current: number) => number,
  ): Promise<number> {
    await this.runningWorkflowsMutex.runExclusive(async () => {
      this.runningWorkflows = updater(this.runningWorkflows);
      await this.persistRunningWorkflows();
    });
    return this.runningWorkflows;
  }

  // Example: safely update runningWorkflowSteps
  async updateRunningWorkflowSteps(
    updater: (current: number) => number,
  ): Promise<number> {
    await this.runningWorkflowStepsMutex.runExclusive(async () => {
      this.runningWorkflowSteps = updater(this.runningWorkflowSteps);
      await this.persistRunningWorkflowSteps();
    });
    return this.runningWorkflowSteps;
  }

  private async persistRunningWorkflows() {
    try {
      this.logger.info(`Setting running workflows to ${this.runningWorkflows}`);
      await this.redisService.setValue(
        MetricType.RUNNING_WORKFLOWS_REDIS_KEY,
        this.runningWorkflows.toString(),
      );
    } catch (error) {
      this.logger.error(
        `Failed to set running workflows to ${this.runningWorkflows}`,
        error,
      );
    }

    return this.runningWorkflows;
  }

  private async persistRunningWorkflowSteps() {
    try {
      await this.redisService.setValue(
        MetricType.RUNNING_WORKFLOW_STEPS_REDIS_KEY,
        this.runningWorkflowSteps.toString(),
      );
    } catch (error) {
      this.logger.error(
        `Failed to set running workflow steps to ${this.runningWorkflowSteps}`,
        error,
      );
    }

    return this.runningWorkflowSteps;
  }

  private async persistWorkflowDuration(duration: number) {
    try {
      await this.redisService.lpush(
        MetricType.WORKFLOW_DURATIONS_REDIS_KEY,
        duration.toString(),
      );
      await this.redisService.ltrim(
        MetricType.WORKFLOW_DURATIONS_REDIS_KEY,
        0,
        99,
      );
    } catch (error) {
      this.logger.error(
        `Failed to set workflow duration to ${duration}`,
        error,
      );
    }
  }

  private async persistWorkflowStepDuration(duration: number) {
    try {
      await this.redisService.lpush(
        MetricType.WORKFLOW_STEP_DURATIONS_REDIS_KEY,
        duration.toString(),
      );
      await this.redisService.ltrim(
        MetricType.WORKFLOW_STEP_DURATIONS_REDIS_KEY,
        0,
        99,
      );
    } catch (error) {
      this.logger.error(
        `Failed to set workflow step duration to ${duration}`,
        error,
      );
    }
  }

  async updateTotalWorkflowsStarted(
    updater: (current: number) => number,
    runPersistence: boolean = true,
  ): Promise<number> {
    await this.totalWorkflowsStartedMutex.runExclusive(async () => {
      this.totalWorkflowsStarted = updater(this.totalWorkflowsStarted);
      this.logger.info(
        `Setting total workflows started to ${this.totalWorkflowsStarted}`,
      );
      if (runPersistence) {
        await this.persistOneHourCounterMetric(
          MetricType.TOTAL_WORKFLOWS_STARTED,
          this.totalWorkflowsStarted,
        );
      }
    });
    return this.totalWorkflowsStarted;
  }

  async updateTotalWorkflowsCompleted(
    updater: (current: number) => number,
    runPersistence: boolean = true,
  ): Promise<number> {
    await this.totalWorkflowsCompletedMutex.runExclusive(async () => {
      this.totalWorkflowsCompleted = updater(this.totalWorkflowsCompleted);
      this.logger.info(
        `Setting total workflows completed to ${this.totalWorkflowsCompleted}`,
      );
      if (runPersistence) {
        await this.persistOneHourCounterMetric(
          MetricType.TOTAL_WORKFLOWS_COMPLETED,
          this.totalWorkflowsCompleted,
        );
      }
    });

    return this.totalWorkflowsCompleted;
  }

  async updateTotalWorkflowsFailed(
    updater: (current: number) => number,
    runPersistence: boolean = true,
  ): Promise<number> {
    await this.totalWorkflowsFailedMutex.runExclusive(async () => {
      this.totalWorkflowsFailed = updater(this.totalWorkflowsFailed);

      if (runPersistence) {
        await this.persistOneHourCounterMetric(
          MetricType.TOTAL_WORKFLOWS_FAILED,
          this.totalWorkflowsFailed,
        );
      }
    });
    return this.totalWorkflowsFailed;
  }

  async updateTotalWorkflowStepsStarted(
    updater: (current: number) => number,
    runPersistence: boolean = true,
  ): Promise<number> {
    await this.totalWorkflowStepsStartedMutex.runExclusive(async () => {
      this.totalWorkflowStepsStarted = updater(this.totalWorkflowStepsStarted);

      if (runPersistence) {
        await this.persistOneHourCounterMetric(
          MetricType.TOTAL_WORKFLOW_STEPS_STARTED,
          this.totalWorkflowStepsStarted,
        );
      }
    });
    return this.totalWorkflowStepsStarted;
  }

  async updateTotalWorkflowStepsCompleted(
    updater: (current: number) => number,
    runPersistence: boolean = true,
  ): Promise<number> {
    await this.totalWorkflowStepsCompletedMutex.runExclusive(async () => {
      this.totalWorkflowStepsCompleted = updater(
        this.totalWorkflowStepsCompleted,
      );

      if (runPersistence) {
        await this.persistOneHourCounterMetric(
          MetricType.TOTAL_WORKFLOW_STEPS_COMPLETED,
          this.totalWorkflowStepsCompleted,
        );
      }
    });
    return this.totalWorkflowStepsCompleted;
  }

  async updateTotalWorkflowStepsFailed(
    updater: (current: number) => number,
    runPersistence: boolean = true,
  ): Promise<number> {
    await this.totalWorkflowStepsFailedMutex.runExclusive(async () => {
      this.totalWorkflowStepsFailed = updater(this.totalWorkflowStepsFailed);

      if (runPersistence) {
        await this.persistOneHourCounterMetric(
          MetricType.TOTAL_WORKFLOW_STEPS_FAILED,
          this.totalWorkflowStepsFailed,
        );
      }
    });
    return this.totalWorkflowStepsFailed;
  }

  async persistOneHourCounterMetric(key: string, value: number) {
    try {
      const now = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
      this.logger.info(`Persisting counter metric ${key} to ${value}`);
      await this.redisService.zadd(key, now, value.toString());
    } catch (error) {
      this.logger.error(
        `Failed to set counter metric ${key} to ${value}`,
        error,
      );
    }
  }

  private startGaugeReporting() {
    setInterval(() => {
      // Call and handle the async function, but don't make the callback itself async
      this.reportGauges().catch((err) => {
        this.logger.error('Error in gauge reporting interval', err);
      });
    }, this.gaugeReportingInterval);
  }

  private async reportGauges() {
    // Lock both values for reading
    let workflows: number;
    let steps: number;

    // Acquire both locks in a fixed order to avoid deadlocks
    await this.runningWorkflowsMutex.runExclusive(async () => {
      await this.runningWorkflowStepsMutex.runExclusive(() => {
        workflows = this.runningWorkflows;
        steps = this.runningWorkflowSteps;
      });
    });

    // Now, outside the lock, create and send metrics
    const workflowGauge = new GaugeMetric(
      MetricType.TOTAL_WORKFLOWS_RUNNING,
      workflows!,
    );
    const workflowStepGauge = new GaugeMetric(
      MetricType.TOTAL_WORKFLOW_STEPS_RUNNING,
      steps!,
    );
    this.sendMetrics(
      [workflowGauge, workflowStepGauge],
      this.gaugeReportingInterval,
    );
  }

  private async getOneHourCounters(key: string) {
    const now = Math.floor(Date.now() / 1000);
    const cutoff = now - this.ONE_HOUR_SECONDS;
    // Remove only entries OLDER than the window
    await this.redisService.zremrangebyscore(key, 0, cutoff - 1);
    return await this.redisService.zcount(key, cutoff, now);
  }

  private startCounterReporting() {
    setInterval(() => {
      // Call and handle the async function, but don't make the callback itself async
      this.reportStartCounters()
        .then(() => {
          this.logger.info('Counter reporting interval completed');
        })
        .catch((err) => {
          this.logger.error('Error in counter reporting interval', err);
        });
    }, this.counterReportingInterval);
  }

  private async reportStartCounters() {
    // Lock both values for reading
    let workflows: number = 0;
    let steps: number = 0;

    const now = Math.floor(Date.now() / 1000);
    const cutoff = now - this.ONE_HOUR_SECONDS;

    // Acquire both locks in a fixed order to avoid deadlocks
    await this.totalWorkflowsStartedMutex.runExclusive(async () => {
      await this.totalWorkflowStepsStartedMutex.runExclusive(async () => {
        workflows = await this.getOneHourCounters(
          MetricType.TOTAL_WORKFLOWS_STARTED,
        );
        steps = await this.getOneHourCounters(
          MetricType.TOTAL_WORKFLOW_STEPS_STARTED,
        );
      });
    });

    this.logger.info(
      `Reporting start counters: workflows=${workflows}, steps=${steps}`,
    );

    await this.updateTotalWorkflowsStarted((_) => workflows, false);
    await this.updateTotalWorkflowStepsStarted((_) => steps, false);

    // Now, outside the lock, create and send metrics
    const workflowCounter = new GaugeMetric(
      MetricType.TOTAL_WORKFLOWS_STARTED,
      workflows,
    );
    const workflowStepCounter = new GaugeMetric(
      MetricType.TOTAL_WORKFLOW_STEPS_STARTED,
      steps,
    );

    this.sendMetrics(
      [workflowCounter, workflowStepCounter],
      this.counterReportingInterval,
    );
  }

  private startCompleteCounterReporting() {
    setInterval(() => {
      // Call and handle the async function, but don't make the callback itself async
      this.reportCompleteCounters()
        .then(() => {
          this.logger.info('Complete counter reporting interval completed');
        })
        .catch((err) => {
          this.logger.error(
            'Error in complete counter reporting interval',
            err,
          );
        });
    }, this.counterReportingInterval);
  }

  private async reportCompleteCounters() {
    // Lock both values for reading
    let workflows: number = 0;
    let steps: number = 0;

    // Acquire both locks in a fixed order to avoid deadlocks
    await this.totalWorkflowsCompletedMutex.runExclusive(async () => {
      await this.totalWorkflowStepsCompletedMutex.runExclusive(async () => {
        workflows = await this.getOneHourCounters(
          MetricType.TOTAL_WORKFLOWS_COMPLETED,
        );
        steps = await this.getOneHourCounters(
          MetricType.TOTAL_WORKFLOW_STEPS_COMPLETED,
        );
      });
    });

    this.logger.info(
      `Reporting complete counters: workflows=${workflows}, steps=${steps}`,
    );

    await this.updateTotalWorkflowsCompleted((_) => workflows, false);
    await this.updateTotalWorkflowStepsCompleted((_) => steps, false);

    // Now, outside the lock, create and send metrics
    const workflowCounter = new GaugeMetric(
      MetricType.TOTAL_WORKFLOWS_COMPLETED,
      workflows,
    );
    const workflowStepCounter = new GaugeMetric(
      MetricType.TOTAL_WORKFLOW_STEPS_COMPLETED,
      steps,
    );

    this.sendMetrics(
      [workflowCounter, workflowStepCounter],
      this.counterReportingInterval,
    );
  }

  private startFailedCounterReporting() {
    setInterval(() => {
      // Call and handle the async function, but don't make the callback itself async
      this.reportFailedCounters()
        .then(() => {
          this.logger.info('Failed counter reporting interval completed');
        })
        .catch((err) => {
          this.logger.error('Error in failed counter reporting interval', err);
        });
    }, this.counterReportingInterval);
  }

  private async reportFailedCounters() {
    // Lock both values for reading
    let workflows: number = 0;
    let steps: number = 0;

    // Acquire both locks in a fixed order to avoid deadlocks
    await this.totalWorkflowsFailedMutex.runExclusive(async () => {
      await this.totalWorkflowStepsFailedMutex.runExclusive(async () => {
        workflows = await this.getOneHourCounters(
          MetricType.TOTAL_WORKFLOWS_FAILED,
        );
        steps = await this.getOneHourCounters(
          MetricType.TOTAL_WORKFLOW_STEPS_FAILED,
        );
      });
    });

    this.logger.info(
      `Reporting failed counters: workflows=${workflows}, steps=${steps}`,
    );

    await this.updateTotalWorkflowsFailed((_) => workflows, false);
    await this.updateTotalWorkflowStepsFailed((_) => steps, false);

    // Now, outside the lock, create and send metrics
    const workflowCounter = new GaugeMetric(
      MetricType.TOTAL_WORKFLOWS_FAILED,
      workflows,
    );
    const workflowStepCounter = new GaugeMetric(
      MetricType.TOTAL_WORKFLOW_STEPS_FAILED,
      steps,
    );
    // if (workflows > 0) {
    //   for (let i = 0; i < workflows; i++) {
    //     workflowCounter.record();
    //   }
    // }
    // if (steps > 0) {
    //   for (let i = 0; i < steps; i++) {
    //     workflowStepCounter.record();
    //   }
    // }
    this.sendMetrics(
      [workflowCounter, workflowStepCounter],
      this.counterReportingInterval,
    );
  }

  private startDurationReporting() {
    setInterval(() => {
      // Call and handle the async function, but don't make the callback itself async
      this.reportDurations()
        .then(() => {
          this.logger.info('Duration reporting interval completed');
        })
        .catch((err) => {
          this.logger.error('Error in duration reporting interval', err);
        })
        .finally(() => {
          this.logger.info('Duration reporting interval completed');
        });
    }, this.durationReportingInterval);
  }

  private async reportDurations() {
    this.logger.info('Reporting durations');
    // Lock both values for reading
    const durations = (
      await this.redisService.lrange(
        MetricType.WORKFLOW_DURATIONS_REDIS_KEY,
        0,
        99,
      )
    ).map(Number);

    const stepDurations = (
      await this.redisService.lrange(
        MetricType.WORKFLOW_STEP_DURATIONS_REDIS_KEY,
        0,
        99,
      )
    ).map(Number);

    this.logger.info(`Found ${durations.length} workflow durations`);
    this.logger.info(`Found ${stepDurations.length} workflow step durations`);

    const BUCKETS = [
      1,
      3,
      5,
      10,
      15,
      30,
      60,
      120,
      180,
      240,
      300,
      360,
      420,
      480,
      720,
      1440,
      Infinity,
    ];

    let bucketCounts = BUCKETS.map(() => 0);
    for (const duration of durations) {
      for (let i = 0; i < BUCKETS.length; i++) {
        if (duration <= BUCKETS[i]) {
          bucketCounts[i]++;
          break;
        }
      }
    }

    this.logger.info(`Workflow bucket counts: ${JSON.stringify(bucketCounts)}`);

    let timestamp = Date.now();
    let metrics: any[] = [];

    for (let i = 0; i < BUCKETS.length; i++) {
      const metric = new GaugeMetric(
        MetricType.WORKFLOW_DURATION_BUCKET,
        bucketCounts[i],
        { le: BUCKETS[i].toString() },
        timestamp,
      );
      metrics = [...metrics, metric];
    }

    this.logger.info(`Sending workflow duration metrics: ${metrics.length}`);
    this.logger.info(
      `Sending workflow step duration metrics: ${JSON.stringify(metrics)}`,
    );

    this.sendMetrics(metrics, this.durationReportingInterval);

    bucketCounts = BUCKETS.map(() => 0);
    for (const stepDuration of stepDurations) {
      for (let i = 0; i < BUCKETS.length; i++) {
        if (stepDuration <= BUCKETS[i]) {
          bucketCounts[i]++;
          break;
        }
      }
    }

    this.logger.info(
      `Workflow step bucket counts: ${JSON.stringify(bucketCounts)}`,
    );

    timestamp = Date.now();
    metrics = [];

    for (let i = 0; i < BUCKETS.length; i++) {
      const metric = new GaugeMetric(
        MetricType.WORKFLOW_STEP_DURATION_BUCKET,
        bucketCounts[i],
        { le: BUCKETS[i].toString() },
        timestamp,
      );
      metrics = [...metrics, metric];
    }

    this.logger.info(
      `Sending workflow step duration metrics: ${metrics.length}`,
    );
    this.logger.info(
      `Sending workflow step duration metrics: ${JSON.stringify(metrics)}`,
    );
    this.sendMetrics(metrics, this.durationReportingInterval);
  }

  private getCaller() {
    // Get the stack trace
    const stack = new Error().stack;
    let caller = 'unknown';

    if (stack) {
      // The stack trace is a string, split it into lines
      const stackLines = stack.split('\n');
      // stackLines[0] is 'Error', stackLines[1] is this function, stackLines[2] is the caller
      if (stackLines.length >= 3) {
        // Example line: "    at WorkflowMetricsService.incrementTotalWorkflowsStartedCounter (.../metrics.service.ts:112:23)"
        const match = stackLines[2].match(/at\s+(.*)\s+\(/);
        if (match) {
          caller = match[1];
        }
      }
    }

    return caller;
  }

  private sendMetrics(metrics: any[], interval: number) {
    const caller = this.getCaller();
    const batch = new MetricBatch(
      { environment: 'development' },
      Date.now(),
      interval,
    );
    metrics.forEach((metric) => batch.addMetric(metric));

    this.logger.info(`${caller}: Sending metrics ${batch.getBatchSize()}`);
    this.metricClient.send(batch, (err, res) => {
      if (err) {
        this.logger.error(`${caller}: Failed to send metrics`, err);
      } else {
        this.logger.info(
          `${caller}: Metric batch returned: ${res?.statusCode}`,
        );
      }
    });
  }

  // Workflow Level
  async incrementTotalWorkflowsStartedCounter() {
    const runningWorkflows = await this.updateRunningWorkflows(
      (current) => current + 1,
    );
    const batchCount = await this.updateTotalWorkflowsStarted(
      (current) => current + 1,
      true,
    );

    return { runningWorkflows, batchCount };
  }

  async incrementTotalWorkflowsCompletedCounter() {
    const runningWorkflows = await this.updateRunningWorkflows(
      (current) => current - 1,
    );
    const batchCount = await this.updateTotalWorkflowsCompleted(
      (current) => current + 1,
      true,
    );

    return { runningWorkflows, batchCount };
  }

  async incrementTotalWorkflowsFailedCounter(executionId: string) {
    if (this.failedExecutionIds.includes(executionId)) {
      return;
    }
    this.failedExecutionIds.push(executionId);

    this.logger.info('Incrementing total workflows failed counter');
    const runningWorkflows = await this.updateRunningWorkflows(
      (current) => current - 1,
    );
    const batchCount = await this.updateTotalWorkflowsFailed(
      (current) => current + 1,
      true,
    );

    return { runningWorkflows, batchCount };
  }

  async recordWorkflowCompletionDuration(
    updateCounters: boolean = true,
    startDate?: number,
    endDate?: number,
  ) {
    if (!startDate || !endDate) {
      return;
    }
    if (updateCounters) {
      await this.incrementTotalWorkflowsCompletedCounter();
    }
    const durationMinutes = (endDate - startDate) / 60000;

    await this.persistWorkflowDuration(durationMinutes);
    this.logger.info('Workflow completion duration', {
      durationMinutes,
    });
  }

  // Workflow Step Level
  async incrementTotalWorkflowStepStartedCounter(actionType: string) {
    const runningWorkflowSteps = await this.updateRunningWorkflowSteps(
      (current) => current + 1,
    );
    const batchCount = await this.updateTotalWorkflowStepsStarted(
      (current) => current + 1,
      true,
    );

    return { runningWorkflowSteps, batchCount };
  }

  async incrementTotalWorkflowStepCompletedCounter(actionType: string) {
    const runningWorkflowSteps = await this.updateRunningWorkflowSteps(
      (current) => current - 1,
    );
    const batchCount = await this.updateTotalWorkflowStepsCompleted(
      (current) => current + 1,
      true,
    );

    return { runningWorkflowSteps, batchCount };
  }

  async incrementTotalWorkflowStepFailedCounter(
    actionType: string,
    executionId: string,
    nodeId: string,
  ) {
    if (this.failedNodeIds.includes(`${executionId}-${nodeId}`)) {
      return;
    }
    this.failedNodeIds.push(`${executionId}-${nodeId}`);
    const runningWorkflowSteps = await this.updateRunningWorkflowSteps(
      (current) => current - 1,
    );
    const batchCount = await this.updateTotalWorkflowStepsFailed(
      (current) => current + 1,
      true,
    );

    return { runningWorkflowSteps, batchCount };
  }

  async recordWorkflowStepCompletionDuration(
    updateCounters: boolean = true,
    actionType: string,
    startDate?: number,
    endDate?: number,
  ) {
    if (!startDate || !endDate) {
      return;
    }
    if (updateCounters) {
      await this.incrementTotalWorkflowStepCompletedCounter(actionType);
    }
    const durationMinutes = (endDate - startDate) / 60000;

    await this.persistWorkflowStepDuration(durationMinutes);
    this.logger.info('Workflow step completion duration', {
      durationMinutes,
    });
  }
}
