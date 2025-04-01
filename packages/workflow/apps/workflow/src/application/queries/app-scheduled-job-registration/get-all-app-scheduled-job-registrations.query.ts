/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  QueryHandler,
  type IQuery,
  type IQueryHandler,
} from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { AppScheduledJobRegistrationRepository } from '../../repositories/app-scheduled-job-registration/app-scheduled-job-registration.repository';
import { AppScheduledJobRegistrationDto } from '../../dtos/app-scheduled-job-registration/app-scheduled-job-registration.dto';
import { UtilsService } from '@app/common/services';

export class GetAllAppScheduledJobRegistrationsQuery implements IQuery {
  constructor(
    public readonly tenantId: string,
    public readonly workspaceId: string,
    public readonly appId?: string,
  ) {}
}

@QueryHandler(GetAllAppScheduledJobRegistrationsQuery)
export class GetAllAppScheduledJobRegistrationsQueryHandler
  implements IQueryHandler
{
  constructor(
    private readonly utilsService: UtilsService,
    private readonly appJobRepository: AppScheduledJobRegistrationRepository,
    @InjectPinoLogger(GetAllAppScheduledJobRegistrationsQueryHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(
    query: GetAllAppScheduledJobRegistrationsQuery,
  ): Promise<AppScheduledJobRegistrationDto[]> {
    this.logger.info(`Reading all app scheduled job registrations`);
    const [tenantId, _] = await this.utilsService.validateTenant(
      query.tenantId,
    );

    const [workspaceId, __] = await this.utilsService.validateWorkspace(
      tenantId.value,
      query.workspaceId,
    );

    if (query.appId) {
      const [appId, __] = await this.utilsService.validateApp(
        tenantId.value,
        query.appId,
      );
    }

    const jobs = await this.appJobRepository.getAll(
      tenantId.value,
      workspaceId.value,
      query.appId,
    );

    return jobs.map((job) => job.toDto());
  }
}
