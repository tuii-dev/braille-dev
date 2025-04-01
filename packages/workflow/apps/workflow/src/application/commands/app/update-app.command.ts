/* eslint-disable @typescript-eslint/no-unused-vars */
import { AppDto } from '@app/common/shared/event-sourcing/application/dtos/app/app.dto';
import { AppRepository } from '@app/common/shared/event-sourcing/application/repositories/app/app.repository';
import { AppNotFoundException } from '@app/domain/exceptions/app-not-found.exception';
import { AppId } from '@app/common/shared/event-sourcing/domain/models/app/app-id';
import { UtilsService } from '@app/common/services/utils.service';
import { Injectable } from '@nestjs/common';
import {
  CommandHandler,
  type ICommand,
  type ICommandHandler,
} from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

export class UpdateAppCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly appDto: AppDto,
  ) {}
}

@Injectable()
@CommandHandler(UpdateAppCommand)
export class UpdateAppCommandHandler implements ICommandHandler {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly appRepository: AppRepository,
    @InjectPinoLogger(UpdateAppCommandHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: UpdateAppCommand): Promise<AppDto> {
    this.logger.info(`Creating app ID: ${command.appDto.id}`);

    const [tenantId, _] = await this.utilsService.validateTenant(
      command.tenantId,
    );

    const appId = AppId.from(command.appDto.id);
    const app = await this.appRepository.getById(tenantId.value, appId);

    if (!app) {
      throw AppNotFoundException.withId(appId);
    }

    app.update({
      name: command.appDto.name,
      description: command.appDto.description,
    });

    await this.appRepository.save(tenantId.value, app);

    return app.toDto();
  }
}
