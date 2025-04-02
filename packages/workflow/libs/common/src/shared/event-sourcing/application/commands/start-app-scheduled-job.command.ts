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
import { AppScheduledJobRepository } from '../repositories/app-scheduled-job/app-scheduled-job.repository';
import { AppScheduledJobDto } from '../dtos/app-scheduled-job/app-scheduled-job.dto';
import { AppScheduledJobId } from '../../domain/models/app-scheduled-job/app-scheduled-job-id';
import { AppScheduledJob } from '../../domain/models/app-scheduled-job/app-scheduled-job.aggregate';
import { AppScheduledJobRegistrationCreatedEvent } from '../../domain/events/app-scheduled-job-registration/app-scheduled-job-registration-created.event';

export class StartAppScheduledJobCommand implements ICommand {
  constructor(
    public readonly bridgeEvent: AppScheduledJobRegistrationCreatedEvent,
  ) {}
}

@Injectable()
@CommandHandler(StartAppScheduledJobCommand)
export class StartAppScheduledJobCommandHandler implements ICommandHandler {
  constructor(
    private readonly appScheduledJobRepository: AppScheduledJobRepository,
    private readonly utilsService: UtilsService,
    @InjectPinoLogger(StartAppScheduledJobCommandHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(
    command: StartAppScheduledJobCommand,
  ): Promise<AppScheduledJobDto> {
    const event = command.bridgeEvent;
    this.logger.info(`Creating app scheduled job: ${event.id} - ${event.name}`);

    const [tenantId, _] = await this.utilsService.validateTenant(
      event.tenantId,
    );

    const [workspaceId, __] = await this.utilsService.validateWorkspace(
      tenantId.value,
      event.workspaceId,
    );

    if (event.appId) {
      const [appId, __] = await this.utilsService.validateApp(
        tenantId.value,
        event.appId,
      );
    }

    const jobId = AppScheduledJobId.generate();

    const job = AppScheduledJob.start({
      id: jobId,
      tenantId: event.tenantId,
      workspaceId: event.workspaceId,
      registrationId: event.id,
      name: event.name,
      type: event.type,
      schedulingType: event.schedulingType,
      cronSchedule: event.cronSchedule,
      metadata: event.metadata,
      appId: event.appId,
    });

    await this.appScheduledJobRepository.save(tenantId.value, job);

    return job.toDto();
  }
}
