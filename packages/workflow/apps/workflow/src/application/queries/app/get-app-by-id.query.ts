/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  QueryHandler,
  type IQuery,
  type IQueryHandler,
} from '@ocoda/event-sourcing';
import { AppNotFoundException } from 'apps/workflow/src/domain/exceptions/app-not-found.exception';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { AppDto } from '../../../../../../libs/common/src/shared/event-sourcing/application/dtos/app/app.dto';
import { UtilsService } from '@app/common/services';
import { AppRepository } from '@app/common/shared/event-sourcing/application/repositories';
import { AppId } from '@app/common/shared/event-sourcing/domain/models';

export class GetAppQueryById implements IQuery {
  constructor(
    public readonly tenantId: string,
    public readonly appId: string,
  ) {}
}

@QueryHandler(GetAppQueryById)
export class GetAppQueryByIdHandler implements IQueryHandler {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly appRepository: AppRepository,
    @InjectPinoLogger(GetAppQueryByIdHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(query: GetAppQueryById): Promise<AppDto> {
    const appId = AppId.from(query.appId);
    this.logger.info(`Reading app ID: ${appId.value}`);

    const [tenantId, _] = await this.utilsService.validateTenant(
      query.tenantId,
    );

    const app = await this.appRepository.getById(tenantId.value, appId);

    if (!app) {
      throw AppNotFoundException.withId(appId);
    }

    return app.toDto();
  }
}
