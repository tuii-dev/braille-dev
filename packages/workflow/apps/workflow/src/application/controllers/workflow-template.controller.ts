import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import {
  CreateWorkflowTemplateCommand,
  UpdateWorkflowTemplateCommand,
} from '../commands';

import {
  GetAllWorkflowTemplatesQuery,
  GetWorkflowTemplateByIdQuery,
} from '../queries';

import { WorkflowTemplateDto } from '../dtos/workflow-template/workflow-template.dto';

@Controller()
export class WorkflowTemplateController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    @InjectPinoLogger(WorkflowTemplateController.name)
    private readonly logger: PinoLogger,
  ) {}

  @Get([
    'tenants/:tenantId/templates',
    'tenants/:tenantId/workspaces/:workspaceId/templates',
    'tenants/:tenantId/workspaces/:workspaceId/apps/:appId/templates',
  ])
  @Header('Content-Type', 'application/json')
  async getWorkflowTemplates(
    @Param('tenantId') tenantId: string,
    @Param('workspaceId') workspaceId?: string,
    @Param('appId') appId?: string,
  ): Promise<WorkflowTemplateDto[]> {
    return this.queryBus.execute(
      new GetAllWorkflowTemplatesQuery({ tenantId, workspaceId, appId }),
    );
  }

  @Get([
    'tenants/:tenantId/templates/:templateId',
    'tenants/:tenantId/workspaces/:workspaceId/templates/:templateId',
    'tenants/:tenantId/workspaces/:workspaceId/apps/:appId/templates/:templateId',
  ])
  @Header('Content-Type', 'application/json')
  async getWorkflowTemplate(
    @Param('tenantId') tenantId: string,
    @Param('templateId') templateId: string,
    @Param('workspaceId') workspaceId?: string,
    @Param('appId') appId?: string,
  ): Promise<WorkflowTemplateDto> {
    return this.queryBus.execute(
      new GetWorkflowTemplateByIdQuery({
        templateId,
        tenantId,
        workspaceId,
        appId,
      }),
    );
  }

  @Post([
    'tenants/:tenantId/templates',
    'tenants/:tenantId/workspaces/:workspaceId/templates',
    'tenants/:tenantId/workspaces/:workspaceId/apps/:appId/templates',
  ])
  async createWorkflowTemplate(
    @Param('tenantId') tenantId: string,
    @Body() body: WorkflowTemplateDto,
    @Param('workspaceId') workspaceId?: string,
    @Param('appId') appId?: string,
  ): Promise<WorkflowTemplateDto> {
    return this.commandBus.execute(
      new CreateWorkflowTemplateCommand({
        tenantId,
        workspaceId,
        appId,
        name: body.name,
        description: body.description,
        nodes: body.nodes,
        inputSchemaDependency: body.inputSchemaDependency,
        outputSchemaDependency: body.outputSchemaDependency,
        outputResolvers: body.outputResolvers,
        callbackUrl: body.callbackUrl,
      }),
    );
  }

  @Put([
    'tenants/:tenantId/templates/:templateId',
    'tenants/:tenantId/workspaces/:workspaceId/templates/:templateId',
    'tenants/:tenantId/workspaces/:workspaceId/apps/:appId/templates/:templateId',
  ])
  async updateWorkflowTemplate(
    @Param('tenantId') tenantId: string,
    @Param('templateId') templateId: string,
    @Body()
    body: WorkflowTemplateDto,
    @Param('workspaceId') workspaceId?: string,
    @Param('appId') appId?: string,
  ): Promise<WorkflowTemplateDto> {
    return this.commandBus.execute(
      new UpdateWorkflowTemplateCommand(
        tenantId,
        templateId,
        workspaceId,
        appId,
        body.nodes,
        body.name,
        body.description,
        body.inputSchemaDependency,
        body.outputSchemaDependency,
        body.outputResolvers,
        body.callbackUrl,
      ),
    );
  }
}
