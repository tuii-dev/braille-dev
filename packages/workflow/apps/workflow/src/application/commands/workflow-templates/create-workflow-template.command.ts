/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CommandHandler,
  type ICommand,
  type ICommandHandler,
} from '@ocoda/event-sourcing';
import {
  WorkflowTemplateId,
  WorkflowTemplate,
} from 'apps/workflow/src/domain/models';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { WorkflowTemplateDto } from '../../dtos/workflow-template/workflow-template.dto';
import { IWorkflowDataResolver } from '../../interfaces/workflow-data-resolver.interface';
import { IWorkflowStep } from '../../interfaces/workflow-step.interface';
import { WorkflowTemplateRepository } from '../../repositories';
import { UtilsService } from '@app/common/services';

export class CreateWorkflowTemplateCommand implements ICommand {
  constructor({
    tenantId,
    workspaceId,
    appId,
    nodes,
    name,
    description,
    inputSchemaDependency,
    outputSchemaDependency,
    outputResolvers,
    callbackUrl,
  }: {
    tenantId: string;
    workspaceId?: string;
    appId?: string;
    nodes: IWorkflowStep[];
    name?: string;
    description?: string;
    inputSchemaDependency?: string;
    outputSchemaDependency?: string;
    outputResolvers?: IWorkflowDataResolver[];
    callbackUrl?: string;
  }) {
    this.tenantId = tenantId;
    this.workspaceId = workspaceId;
    this.appId = appId;
    this.name = name;
    this.description = description;
    this.nodes = nodes;
    this.inputSchemaDependency = inputSchemaDependency;
    this.outputSchemaDependency = outputSchemaDependency;
    this.outputResolvers = outputResolvers;
    this.callbackUrl = callbackUrl;
  }

  readonly tenantId: string;
  readonly workspaceId?: string;
  readonly appId?: string;
  readonly name?: string;
  readonly description?: string;
  readonly nodes: IWorkflowStep[];
  readonly inputSchemaDependency?: string;
  readonly outputSchemaDependency?: string;
  readonly outputResolvers?: IWorkflowDataResolver[];
  readonly callbackUrl?: string;
}

@CommandHandler(CreateWorkflowTemplateCommand)
export class CreateWorkflowTemplateCommandHandler implements ICommandHandler {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly workflowTemplateRepository: WorkflowTemplateRepository,
    @InjectPinoLogger(CreateWorkflowTemplateCommandHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(
    command: CreateWorkflowTemplateCommand,
  ): Promise<WorkflowTemplateDto> {
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

    const templateId = WorkflowTemplateId.generate();
    this.logger.info(
      `Creating workflow template ID: ${templateId.value} for tenant: ${command.name}`,
    );

    const workflowTemplate = WorkflowTemplate.create({
      templateId,
      tenantId: tenantId.value,
      workspaceId: command.workspaceId,
      appId: command.appId,
      name: command.name,
      description: command.description,
      nodes: command.nodes ?? [],
      inputSchemaDependency: command.inputSchemaDependency,
      outputSchemaDependency: command.outputSchemaDependency,
      outputResolvers: command.outputResolvers,
      callbackUrl: command.callbackUrl,
    });

    await this.workflowTemplateRepository.save(
      tenantId.value,
      workflowTemplate,
    );

    return workflowTemplate.toDto();
  }
}
