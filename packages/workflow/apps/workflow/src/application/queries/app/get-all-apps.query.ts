/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  QueryHandler,
  type IQuery,
  type IQueryHandler,
} from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { AppDto } from '../../../../../../libs/common/src/shared/event-sourcing/application/dtos/app/app.dto';
import { UtilsService } from '@app/common/services';
import { AppRepository } from '@app/common/shared/event-sourcing/application/repositories';

export class GetAllAppsQuery implements IQuery {
  constructor(public readonly tenantId: string) {}
}

@QueryHandler(GetAllAppsQuery)
export class GetAllAppsQueryHandler implements IQueryHandler {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly appRepository: AppRepository,
    @InjectPinoLogger(GetAllAppsQueryHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(query: GetAllAppsQuery): Promise<AppDto[]> {
    this.logger.info(`Reading all apps`);
    const [tenantId, _] = await this.utilsService.validateTenant(
      query.tenantId,
    );

    const apps = await this.appRepository.getAll(tenantId.value);

    return apps.map((app) => app.toDto());
  }
}
