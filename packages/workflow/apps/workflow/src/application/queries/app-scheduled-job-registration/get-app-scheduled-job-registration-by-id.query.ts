/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  QueryHandler,
  type IQuery,
  type IQueryHandler,
} from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { AppScheduledJobRegistrationRepository } from '../../repositories/app-scheduled-job-registration/app-scheduled-job-registration.repository';
import { AppScheduledJobRegistrationDto } from '../../dtos/app-scheduled-job-registration/app-scheduled-job-registration.dto';
import { AppScheduledJobRegistrationId } from '../../../domain/models/app-scheduled-job-registration/app-scheduled-job-registration-id';
import { AppScheduledJobRegistrationNotFoundException } from '../../../domain/exceptions/app-scheduled-job-registration-not-found.exception';
import { UtilsService } from '@app/common/services';

export class GetAppScheduledJobRegistrationById implements IQuery {
  constructor(
    public readonly tenantId: string,
    public readonly jobId: string,
    public readonly workspaceId?: string,
    public readonly appId?: string,
  ) {}
}

@QueryHandler(GetAppScheduledJobRegistrationById)
export class GetAppScheduledJobRegistrationByIdHandler
  implements IQueryHandler
{
  constructor(
    private readonly utilsService: UtilsService,
    private readonly jobRepository: AppScheduledJobRegistrationRepository,
    @InjectPinoLogger(GetAppScheduledJobRegistrationByIdHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(
    query: GetAppScheduledJobRegistrationById,
  ): Promise<AppScheduledJobRegistrationDto> {
    const jobId = AppScheduledJobRegistrationId.from(query.jobId);
    this.logger.info(
      `Reading app scheduled job registration ID: ${jobId.value}`,
    );

    const [tenantId, _] = await this.utilsService.validateTenant(
      query.tenantId,
    );

    if (query.workspaceId) {
      const [workspaceId, __] = await this.utilsService.validateWorkspace(
        tenantId.value,
        query.workspaceId,
      );
    }

    if (query.appId) {
      const [appId, __] = await this.utilsService.validateApp(
        tenantId.value,
        query.appId,
      );
    }

    const job = await this.jobRepository.getById(
      tenantId.value,
      jobId,
      query.workspaceId,
      query.appId,
    );

    if (!job) {
      throw AppScheduledJobRegistrationNotFoundException.withId(jobId);
    }

    return job.toDto();
  }
}
