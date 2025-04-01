/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  QueryHandler,
  type IQuery,
  type IQueryHandler,
} from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { AppScheduledJobRepository } from '../../repositories/app-scheduled-job/app-scheduled-job.repository';
import { AppScheduledJobDto } from '../../dtos/app-scheduled-job/app-scheduled-job.dto';
import { UtilsService } from '@app/common/services';

export class GetAllAppScheduledJobsQuery implements IQuery {
  constructor(
    public readonly tenantId: string,
    public readonly workspaceId: string,
  ) {}
}

@QueryHandler(GetAllAppScheduledJobsQuery)
export class GetAllAppScheduledJobsQueryHandler implements IQueryHandler {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly appJobRepository: AppScheduledJobRepository,
    @InjectPinoLogger(GetAllAppScheduledJobsQueryHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(
    query: GetAllAppScheduledJobsQuery,
  ): Promise<AppScheduledJobDto[]> {
    this.logger.info(`Reading all app scheduled jobs`);
    const [tenantId, _] = await this.utilsService.validateTenant(
      query.tenantId,
    );

    const [workspaceId, __] = await this.utilsService.validateWorkspace(
      tenantId.value,
      query.workspaceId,
    );

    const jobs = await this.appJobRepository.getAll(
      tenantId.value,
      workspaceId.value,
    );

    return jobs.map((job) => job.toDto());
  }
}
