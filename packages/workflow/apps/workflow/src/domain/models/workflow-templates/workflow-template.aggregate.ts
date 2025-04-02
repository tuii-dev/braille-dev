import { Aggregate, AggregateRoot, EventHandler } from '@ocoda/event-sourcing';

import {
  WorkflowTemplateCreatedEvent,
  WorkflowTemplateDeletedEvent,
  WorkflowTemplateUpdatedEvent,
} from '../../events';

import { PinoLogger } from 'nestjs-pino';
import { IWorkflowStep } from '@app/application/interfaces/workflow-step.interface';
import { WorkflowTemplateId } from './workflow-template-id';
import { WorkflowTemplateDto } from '@app/application/dtos/workflow-template/workflow-template.dto';
import { IWorkflowDataResolver } from '@app/application/interfaces/workflow-data-resolver.interface';

@Aggregate({ streamName: 'workflow-template' })
export class WorkflowTemplate extends AggregateRoot {
  private static logger: PinoLogger;

  public static setLogger(logger: PinoLogger) {
    WorkflowTemplate.logger = logger;
  }

  public templateId: WorkflowTemplateId;
  public tenantId: string;
  public workspaceId?: string;
  public appId?: string;
  public name?: string;
  public description?: string;
  public callbackUrl?: string;
  public nodes?: IWorkflowStep[];
  public inputSchemaDependency?: string;
  public outputSchemaDependency?: string;
  public outputResolvers?: IWorkflowDataResolver[];
  public created?: number;
  public updated?: number;
  public deleted?: boolean;
  public deletedAt?: number;

  public static create({
    templateId,
    tenantId,
    workspaceId,
    appId,
    name,
    description,
    nodes,
    inputSchemaDependency,
    outputSchemaDependency,
    callbackUrl,
    outputResolvers,
  }: {
    templateId: WorkflowTemplateId;
    tenantId: string;
    workspaceId?: string;
    appId?: string;
    name?: string;
    description?: string;
    nodes?: IWorkflowStep[];
    inputSchemaDependency?: string;
    outputSchemaDependency?: string;
    callbackUrl?: string;
    outputResolvers?: IWorkflowDataResolver[];
  }) {
    WorkflowTemplate.logger?.info('Creating new workflow template', {
      templateId: templateId.value,
    });

    const workflowTemplate = new WorkflowTemplate();
    workflowTemplate.applyEvent(
      new WorkflowTemplateCreatedEvent(
        templateId.value,
        tenantId,
        name ?? '',
        description ?? '',
        nodes ?? [],
        new Date().getTime(),
        workspaceId,
        appId,
        callbackUrl,
        inputSchemaDependency,
        outputSchemaDependency,
        outputResolvers,
      ),
    );

    return workflowTemplate;
  }

  public update({
    workspaceId,
    appId,
    name,
    description,
    nodes,
    callbackUrl,
    inputSchemaDependency,
    outputSchemaDependency,
    outputResolvers,
  }: {
    workspaceId?: string;
    appId?: string;
    name?: string;
    description?: string;
    nodes?: IWorkflowStep[];
    callbackUrl?: string;
    inputSchemaDependency?: string;
    outputSchemaDependency?: string;
    outputResolvers?: IWorkflowDataResolver[];
  }) {
    WorkflowTemplate.logger?.info('Updating workflow template', {
      templateId: this.templateId,
    });

    this.applyEvent(
      new WorkflowTemplateUpdatedEvent(
        this.templateId.value,
        this.tenantId,
        name ?? '',
        description ?? '',
        nodes ?? [],
        new Date().getTime(),
        workspaceId ?? this.workspaceId,
        appId ?? this.appId,
        callbackUrl,
        inputSchemaDependency,
        outputSchemaDependency,
        outputResolvers,
      ),
    );

    return this;
  }

  public delete() {
    WorkflowTemplate.logger?.info('Deleting workflow template', {
      templateId: this.templateId,
    });

    this.applyEvent(
      new WorkflowTemplateDeletedEvent(
        this.templateId.value,
        this.tenantId,
        new Date().getTime(),
      ),
    );

    return this;
  }

  public toDto(): WorkflowTemplateDto {
    return WorkflowTemplateDto.from(this);
  }

  @EventHandler(WorkflowTemplateCreatedEvent)
  onWorkflowTemplateCreatedEvent(event: WorkflowTemplateCreatedEvent) {
    WorkflowTemplate.logger?.info(
      'Processing WorkflowTemplateCreatedEvent in WorkflowTemplate aggregate',
      {
        templateId: event.templateId,
      },
    );
    this.templateId = WorkflowTemplateId.from(event.templateId);
    this.tenantId = event.tenantId;
    this.workspaceId = event.workspaceId;
    this.appId = event.appId;
    this.name = event.name;
    this.description = event.description;
    this.nodes = event.nodes ?? [];
    this.inputSchemaDependency = event.inputSchemaDependency;
    this.outputSchemaDependency = event.outputSchemaDependency;
    this.outputResolvers = event.outputResolvers;
    this.callbackUrl = event.callbackUrl;
    this.created = event.created;
    this.deleted = false;
  }

  @EventHandler(WorkflowTemplateUpdatedEvent)
  onWorkflowTemplateUpdatedEvent(event: WorkflowTemplateUpdatedEvent) {
    WorkflowTemplate.logger?.info(
      'Processing WorkflowTemplateUpdatedEvent in WorkflowTemplate aggregate',
      {
        templateId: this.templateId.value,
      },
    );
    this.name = event.name ?? this.name;
    this.description = event.description ?? this.description;
    this.nodes = event.nodes ?? this.nodes ?? [];
    this.inputSchemaDependency =
      event.inputSchemaDependency ?? this.inputSchemaDependency;
    this.outputSchemaDependency =
      event.outputSchemaDependency ?? this.outputSchemaDependency;
    this.outputResolvers = event.outputResolvers ?? this.outputResolvers;
    this.updated = event.updated ?? this.updated;
    this.workspaceId = event.workspaceId ?? this.workspaceId;
    this.appId = event.appId ?? this.appId;
    this.callbackUrl = event.callbackUrl ?? this.callbackUrl;
  }

  @EventHandler(WorkflowTemplateDeletedEvent)
  onWorkflowTemplateDeletedEvent(event: WorkflowTemplateDeletedEvent) {
    WorkflowTemplate.logger?.info(
      'Processing WorkflowTemplateDeletedEvent in WorkflowTemplate aggregate',
      {
        templateId: this.templateId,
      },
    );
    this.deleted = true;
    this.deletedAt = event.deletedAt ?? this.deletedAt;
  }
}
