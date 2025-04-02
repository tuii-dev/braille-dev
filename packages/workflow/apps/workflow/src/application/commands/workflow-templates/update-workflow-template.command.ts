/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  CommandHandler,
  type ICommand,
  type ICommandHandler,
} from '@ocoda/event-sourcing';
import { WorkflowTemplateNotFoundException } from 'apps/workflow/src/domain/exceptions';
import { WorkflowTemplateId } from 'apps/workflow/src/domain/models';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { WorkflowTemplateDto } from '../../dtos/workflow-template/workflow-template.dto';
import { IWorkflowDataResolver } from '../../interfaces/workflow-data-resolver.interface';
import { IWorkflowStep } from '../../interfaces/workflow-step.interface';
import { WorkflowTemplateRepository } from '../../repositories';
import { UtilsService } from '@app/common/services';

export class UpdateWorkflowTemplateCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly templateId: string,
    public readonly workspaceId?: string,
    public readonly appId?: string,
    public readonly nodes?: IWorkflowStep[],
    public readonly name?: string,
    public readonly description?: string,
    public readonly inputSchemaDependency?: string,
    public readonly outputSchemaDependency?: string,
    public readonly outputResolvers?: IWorkflowDataResolver[],
    public readonly callbackUrl?: string,
  ) {}
}

@CommandHandler(UpdateWorkflowTemplateCommand)
export class UpdateWorkflowTemplateCommandHandler implements ICommandHandler {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly workflowTemplateRepository: WorkflowTemplateRepository,
    @InjectPinoLogger(UpdateWorkflowTemplateCommandHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(
    command: UpdateWorkflowTemplateCommand,
  ): Promise<WorkflowTemplateDto> {
    this.utilsService.validateUuid(command.templateId);

    const [tenantId, _] = await this.utilsService.validateTenant(
      command.tenantId,
    );

    if (command.workspaceId) {
      const [workspaceId, ___] = await this.utilsService.validateWorkspace(
        tenantId.value,
        command.workspaceId,
      );
    }

    if (command.appId) {
      const [appId, __] = await this.utilsService.validateApp(
        tenantId.value,
        command.appId,
      );
    }

    const templateId = WorkflowTemplateId.from(command.templateId);
    this.logger.info(
      `Creating workflow template ID: ${templateId.value} for tenant: ${command.name}`,
    );

    const template = await this.workflowTemplateRepository.getById(
      tenantId.value,
      templateId,
      command.workspaceId,
      command.appId,
    );

    if (!template) {
      throw WorkflowTemplateNotFoundException.withId(templateId);
    }

    template.update({
      workspaceId: command.workspaceId,
      appId: command.appId,
      name: command.name,
      description: command.description,
      nodes: command.nodes,
      inputSchemaDependency: command.inputSchemaDependency,
      outputSchemaDependency: command.outputSchemaDependency,
      outputResolvers: command.outputResolvers,
      callbackUrl: command.callbackUrl,
    });

    template.templateId = templateId;

    await this.workflowTemplateRepository.save(tenantId.value, template);

    return template.toDto();
  }
}
