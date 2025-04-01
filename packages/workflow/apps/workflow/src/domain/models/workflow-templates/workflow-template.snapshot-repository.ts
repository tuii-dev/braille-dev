/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  type ISnapshot,
  Snapshot,
  SnapshotRepository,
} from '@ocoda/event-sourcing';
import { WorkflowTemplate } from './workflow-template.aggregate';
import { WorkflowTemplateId } from './workflow-template-id';

@Snapshot(WorkflowTemplate, { name: 'workflowTemplate', interval: 5 })
export class WorkflowTemplateSnapshotRepository extends SnapshotRepository<WorkflowTemplate> {
  serialize({
    templateId,
    tenantId,
    appId,
    workspaceId,
    name,
    description,
    callbackUrl,
    nodes,
    inputSchemaDependency,
    outputSchemaDependency,
    outputResolvers,
    created,
    updated,
    deleted,
    deletedAt,
  }: WorkflowTemplate): ISnapshot<WorkflowTemplate> {
    return {
      templateId: templateId.value,
      tenantId,
      appId,
      workspaceId,
      name,
      description,
      callbackUrl,
      nodes,
      inputSchemaDependency,
      outputSchemaDependency,
      outputResolvers,
      created,
      updated,
      deleted,
      deletedAt,
    };
  }
  deserialize({
    templateId,
    tenantId,
    appId,
    workspaceId,
    name,
    description,
    callbackUrl,
    nodes,
    inputSchemaDependency,
    outputSchemaDependency,
    outputResolvers,
    created,
    updated,
    deleted,
    deletedAt,
  }: ISnapshot<WorkflowTemplate>): WorkflowTemplate {
    const workflowTemplate = new WorkflowTemplate();
    workflowTemplate.templateId = WorkflowTemplateId.from(templateId as string);
    workflowTemplate.tenantId = tenantId;
    workflowTemplate.appId = appId;
    workflowTemplate.workspaceId = workspaceId;
    workflowTemplate.name = name;
    workflowTemplate.description = description;
    workflowTemplate.callbackUrl = callbackUrl;
    workflowTemplate.nodes = nodes;
    workflowTemplate.inputSchemaDependency = inputSchemaDependency;
    workflowTemplate.outputSchemaDependency = outputSchemaDependency;
    workflowTemplate.outputResolvers = outputResolvers;
    workflowTemplate.created = created;
    workflowTemplate.updated = updated;
    workflowTemplate.deleted = deleted;
    workflowTemplate.deletedAt = deletedAt;

    return workflowTemplate;
  }
}
