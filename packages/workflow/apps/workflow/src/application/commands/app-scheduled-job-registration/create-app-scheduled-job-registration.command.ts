/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { UtilsService } from '@app/common/services/utils.service';
import { Injectable } from '@nestjs/common';
import {
  CommandHandler,
  type ICommand,
  type ICommandHandler,
} from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { AppScheduledJobRegistrationDto } from '../../dtos/app-scheduled-job-registration/app-scheduled-job-registration.dto';
import { AppScheduledJobRegistration } from '../../../domain/models/app-scheduled-job-registration/app-scheduled-job-registration.aggregate';
import { AppScheduledJobRegistrationId } from '../../../domain/models/app-scheduled-job-registration/app-scheduled-job-registration-id';
import { AppScheduledJobRegistrationRepository } from '@app/application/repositories/app-scheduled-job-registration/app-scheduled-job-registration.repository';

export class CreateAppScheduledJobRegistrationCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly workspaceId: string,
    public readonly jobDto: AppScheduledJobRegistrationDto,
  ) {}
}

@Injectable()
@CommandHandler(CreateAppScheduledJobRegistrationCommand)
export class CreateAppScheduledJobRegistrationCommandHandler
  implements ICommandHandler
{
  constructor(
    private readonly appScheduledJobRegistrationRepository: AppScheduledJobRegistrationRepository,
    private readonly utilsService: UtilsService,
    @InjectPinoLogger(CreateAppScheduledJobRegistrationCommandHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(
    command: CreateAppScheduledJobRegistrationCommand,
  ): Promise<AppScheduledJobRegistrationDto> {
    this.logger.info(
      `Creating app scheduled job registration: ${command.jobDto.name}`,
    );

    const [tenantId, _] = await this.utilsService.validateTenant(
      command.tenantId,
    );

    const [workspaceId, __] = await this.utilsService.validateWorkspace(
      tenantId.value,
      command.workspaceId,
    );

    const jobId = AppScheduledJobRegistrationId.generate();

    const job = AppScheduledJobRegistration.create({
      id: jobId,
      tenantId: command.tenantId,
      workspaceId: command.workspaceId,
      name: command.jobDto.name ?? '',
      type: command.jobDto.type!,
      schedulingType: command.jobDto.schedulingType ?? 'TIMEOUT',
      cronSchedule: command.jobDto.cronSchedule!,
      metadata: command.jobDto.metadata || '',
      runImmediately: command.jobDto.runImmediately ?? false,
    });

    await this.appScheduledJobRegistrationRepository.save(tenantId.value, job);

    return job.toDto();
  }
}
