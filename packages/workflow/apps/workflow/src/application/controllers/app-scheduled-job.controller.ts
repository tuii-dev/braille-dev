import { AppScheduledJobDto } from '@app/common/shared/event-sourcing/application/dtos/app-scheduled-job/app-scheduled-job.dto';
import { GetAllAppScheduledJobsQuery } from '@app/common/shared/event-sourcing/application/queries/app-scheduled-job/get-all-app-scheduled-jobs.query';
import { GetAppScheduledJobById } from '@app/common/shared/event-sourcing/application/queries/app-scheduled-job/get-app-scheduled-job-by-id.query';
import { Controller, Get, Param, Header } from '@nestjs/common';
import { QueryBus } from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Controller('tenants/:tenantId/workspaces/:workspaceId/jobs/scheduled')
export class AppScheduledJobController {
  constructor(
    private readonly queryBus: QueryBus,
    @InjectPinoLogger(AppScheduledJobController.name)
    private readonly logger: PinoLogger,
  ) {}

  @Get()
  @Header('Content-Type', 'application/json')
  getAllScheduledJobs(
    @Param('tenantId') tenantId: string,
    @Param('workspaceId') workspaceId: string,
  ): Promise<AppScheduledJobDto[]> {
    return this.queryBus.execute(
      new GetAllAppScheduledJobsQuery(tenantId, workspaceId),
    );
  }

  @Get(':jobId')
  @Header('Content-Type', 'application/json')
  async getApp(
    @Param('tenantId') tenantId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('jobId') jobId: string,
  ): Promise<AppScheduledJobDto> {
    return this.queryBus.execute(
      new GetAppScheduledJobById(tenantId, jobId, workspaceId),
    );
  }
}
