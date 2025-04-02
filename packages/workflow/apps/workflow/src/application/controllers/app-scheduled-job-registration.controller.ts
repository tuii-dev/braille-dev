/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Param,
  Header,
  Body,
  Post,
  Delete,
  Put,
  BadRequestException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { AppScheduledJobRegistrationDto } from '@app/application/dtos/app-scheduled-job-registration/app-scheduled-job-registration.dto';
import { GetAllAppScheduledJobRegistrationsQuery } from '../queries/app-scheduled-job-registration/get-all-app-scheduled-job-registrations.query';
import { GetAppScheduledJobRegistrationById } from '../queries/app-scheduled-job-registration/get-app-scheduled-job-registration-by-id.query';
import { CreateAppScheduledJobRegistrationCommand } from '../commands/app-scheduled-job-registration/create-app-scheduled-job-registration.command';
import {
  DeleteAppScheduledJobRegistrationCommand,
  PauseAppScheduledJobRegistrationCommand,
  ResumeAppScheduledJobRegistrationCommand,
  UpdateAppScheduledJobRegistrationCommand,
} from '../commands';

@Controller('tenants/:tenantId/workspaces/:workspaceId/jobs/registration')
export class AppScheduledJobRegistrationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @InjectPinoLogger(AppScheduledJobRegistrationController.name)
    private readonly logger: PinoLogger,
  ) {}

  @Get()
  @Header('Content-Type', 'application/json')
  getAllScheduledJobs(
    @Param('tenantId') tenantId: string,
    @Param('workspaceId') workspaceId: string,
  ): Promise<AppScheduledJobRegistrationDto[]> {
    return this.queryBus.execute(
      new GetAllAppScheduledJobRegistrationsQuery(tenantId, workspaceId),
    );
  }

  @Get(':jobId')
  @Header('Content-Type', 'application/json')
  async getApp(
    @Param('tenantId') tenantId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('jobId') jobId: string,
  ): Promise<AppScheduledJobRegistrationDto> {
    return this.queryBus.execute(
      new GetAppScheduledJobRegistrationById(tenantId, jobId, workspaceId),
    );
  }

  @Post()
  async createScheduledJob(
    @Param('tenantId') tenantId: string,
    @Param('workspaceId') workspaceId: string,
    @Body()
    body: AppScheduledJobRegistrationDto,
  ): Promise<AppScheduledJobRegistrationDto> {
    const reqDto = {
      ...body,
      tenantId,
      workspaceId,
    } as AppScheduledJobRegistrationDto;

    if (reqDto.type && reqDto.cronSchedule) {
      const command = new CreateAppScheduledJobRegistrationCommand(
        tenantId,
        workspaceId,
        reqDto,
      );
      const dto: AppScheduledJobRegistrationDto =
        await this.commandBus.execute<CreateAppScheduledJobRegistrationCommand>(
          command,
        );
      return dto;
    } else {
      throw new BadRequestException('Invalid type or cron schedule');
    }
  }

  @Put(':jobId')
  async updateScheduledJob(
    @Param('tenantId') tenantId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('jobId') jobId: string,
    @Body()
    body: AppScheduledJobRegistrationDto,
  ): Promise<AppScheduledJobRegistrationDto> {
    const reqDto = {
      ...body,
      id: jobId,
      tenantId,
      workspaceId,
    } as AppScheduledJobRegistrationDto;
    if (reqDto.type && reqDto.cronSchedule) {
      const command = new UpdateAppScheduledJobRegistrationCommand(
        tenantId,
        workspaceId,
        jobId,
        reqDto,
      );
      const dto: AppScheduledJobRegistrationDto =
        await this.commandBus.execute<UpdateAppScheduledJobRegistrationCommand>(
          command,
        );
      return dto;
    } else {
      throw new BadRequestException('Invalid type or cron schedule');
    }
  }

  @Delete(':jobId')
  async deleteScheduledJob(
    @Param('tenantId') tenantId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('jobId') jobId: string,
  ): Promise<AppScheduledJobRegistrationDto> {
    const command = new DeleteAppScheduledJobRegistrationCommand(
      tenantId,
      workspaceId,
      jobId,
    );
    const dto: AppScheduledJobRegistrationDto =
      await this.commandBus.execute<DeleteAppScheduledJobRegistrationCommand>(
        command,
      );
    return dto;
  }

  @Post(':jobId/pause')
  async pauseScheduledJob(
    @Param('tenantId') tenantId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('jobId') jobId: string,
  ): Promise<AppScheduledJobRegistrationDto> {
    const command = new PauseAppScheduledJobRegistrationCommand(
      tenantId,
      workspaceId,
      jobId,
    );

    const dto: AppScheduledJobRegistrationDto =
      await this.commandBus.execute<PauseAppScheduledJobRegistrationCommand>(
        command,
      );
    return dto;
  }

  @Post(':jobId/resume')
  async resumeScheduledJob(
    @Param('tenantId') tenantId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('jobId') jobId: string,
  ): Promise<AppScheduledJobRegistrationDto> {
    const command = new ResumeAppScheduledJobRegistrationCommand(
      tenantId,
      workspaceId,
      jobId,
    );
    const dto: AppScheduledJobRegistrationDto =
      await this.commandBus.execute<ResumeAppScheduledJobRegistrationCommand>(
        command,
      );
    return dto;
  }
}
