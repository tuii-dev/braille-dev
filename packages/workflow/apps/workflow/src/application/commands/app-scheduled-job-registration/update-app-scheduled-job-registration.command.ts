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
import { AppScheduledJobRegistrationId } from '../../../domain/models/app-scheduled-job-registration/app-scheduled-job-registration-id';
import { AppScheduledJobRegistrationNotFoundException } from '../../../domain/exceptions/app-scheduled-job-registration-not-found.exception';
import { AppScheduledJobRegistrationRepository } from '@app/application/repositories/app-scheduled-job-registration/app-scheduled-job-registration.repository';

export class UpdateAppScheduledJobRegistrationCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly workspaceId: string,
    public readonly jobId: string,
    public readonly jobDto: AppScheduledJobRegistrationDto,
    public readonly appId?: string,
  ) {}
}

@Injectable()
@CommandHandler(UpdateAppScheduledJobRegistrationCommand)
export class UpdateAppScheduledJobRegistrationCommandHandler
  implements ICommandHandler
{
  constructor(
    private readonly appScheduledJobRegistrationRepository: AppScheduledJobRegistrationRepository,
    private readonly utilsService: UtilsService,
    @InjectPinoLogger(UpdateAppScheduledJobRegistrationCommandHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(
    command: UpdateAppScheduledJobRegistrationCommand,
  ): Promise<AppScheduledJobRegistrationDto> {
    this.logger.info(
      `Updating app scheduled job registration: ${command.jobId}, ${command.jobDto.name}`,
    );

    const [tenantId, _] = await this.utilsService.validateTenant(
      command.tenantId,
    );

    const [workspaceId, __] = await this.utilsService.validateWorkspace(
      tenantId.value,
      command.workspaceId,
    );

    if (command.appId) {
      const [appId, __] = await this.utilsService.validateApp(
        tenantId.value,
        command.appId,
      );
    }

    const jobId = AppScheduledJobRegistrationId.from(command.jobId);

    let job = await this.appScheduledJobRegistrationRepository.getById(
      tenantId.value,
      jobId,
      workspaceId.value,
      command.appId,
    );

    if (!job) {
      throw AppScheduledJobRegistrationNotFoundException.withId(jobId);
    }

    job = job.update({
      name: command.jobDto.name,
      type: command.jobDto.type,
      schedulingType: command.jobDto.schedulingType,
      cronSchedule: command.jobDto.cronSchedule,
      metadata: command.jobDto.metadata,
      workspaceId: command.jobDto.workspaceId ?? command.workspaceId,
      appId: command.jobDto.appId ?? command.appId,
    });

    await this.appScheduledJobRegistrationRepository.save(tenantId.value, job);

    return job.toDto();
  }
}
