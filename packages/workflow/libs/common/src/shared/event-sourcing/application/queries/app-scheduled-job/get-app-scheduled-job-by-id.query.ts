/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  QueryHandler,
  type IQuery,
  type IQueryHandler,
} from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { AppScheduledJobRepository } from '../../repositories/app-scheduled-job/app-scheduled-job.repository';
import { AppScheduledJobDto } from '../../dtos/app-scheduled-job/app-scheduled-job.dto';
import { AppScheduledJobId } from '../../../domain/models/app-scheduled-job/app-scheduled-job-id';
import { AppScheduledJobNotFoundException } from '../../../domain/exceptions/app-scheduled-job-not-found.exception';
import { UtilsService } from '@app/common/services';

export class GetAppScheduledJobById implements IQuery {
  constructor(
    public readonly tenantId: string,
    public readonly jobId: string,
    public readonly workspaceId?: string,
  ) {}
}

@QueryHandler(GetAppScheduledJobById)
export class GetAppScheduledJobByIdHandler implements IQueryHandler {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly jobRepository: AppScheduledJobRepository,
    @InjectPinoLogger(GetAppScheduledJobByIdHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(query: GetAppScheduledJobById): Promise<AppScheduledJobDto> {
    const jobId = AppScheduledJobId.from(query.jobId);
    this.logger.info(`Reading app scheduled job ID: ${jobId.value}`);

    const [tenantId, _] = await this.utilsService.validateTenant(
      query.tenantId,
    );

    if (query.workspaceId) {
      const [workspaceId, __] = await this.utilsService.validateWorkspace(
        tenantId.value,
        query.workspaceId,
      );
    }

    const job = await this.jobRepository.getById(
      tenantId.value,
      jobId,
      query.workspaceId,
    );

    if (!job) {
      throw AppScheduledJobNotFoundException.withId(jobId);
    }

    return job.toDto();
  }
}
