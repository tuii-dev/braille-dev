/* eslint-disable @typescript-eslint/no-unused-vars */
import { AppDto } from '@app/common/shared/event-sourcing/application/dtos/app/app.dto';
import { AppRepository } from '@app/common/shared/event-sourcing/application/repositories/app/app.repository';
import { AppId } from '@app/common/shared/event-sourcing/domain/models/app/app-id';
import { App } from '@app/common/shared/event-sourcing/domain/models/app/app.aggregate';
import { UtilsService } from '@app/common/services/utils/utils.service';
import { Injectable } from '@nestjs/common';
import {
  CommandHandler,
  type ICommand,
  type ICommandHandler,
} from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

export class CreateAppCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly appDto: AppDto,
  ) {}
}

@Injectable()
@CommandHandler(CreateAppCommand)
export class CreateAppCommandHandler implements ICommandHandler {
  constructor(
    private readonly appRepository: AppRepository,
    private readonly utilsService: UtilsService,
    @InjectPinoLogger(CreateAppCommandHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: CreateAppCommand): Promise<AppDto> {
    this.logger.info(`Creating app: ${command.appDto.name}`);

    const [tenantId, _] = await this.utilsService.validateTenant(
      command.tenantId,
    );

    const appId = AppId.generate();

    const app = App.create({
      appId,
      tenantId: tenantId.value,
      name: command.appDto.name,
      description: command.appDto.description,
    });

    await this.appRepository.save(tenantId.value, app);

    return app.toDto();
  }
}
