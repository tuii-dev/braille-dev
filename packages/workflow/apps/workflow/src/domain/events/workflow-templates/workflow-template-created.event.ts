import { Event, type IEvent } from '@ocoda/event-sourcing';
import { IWorkflowStep } from '@app/application/interfaces/workflow-step.interface';
import { IWorkflowDataResolver } from '@app/application/interfaces/workflow-data-resolver.interface';

@Event('workflow-template-created')
export class WorkflowTemplateCreatedEvent implements IEvent {
  constructor(
    public readonly templateId: string,
    public readonly tenantId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly nodes: IWorkflowStep[],
    public readonly created: number,
    public readonly workspaceId?: string,
    public readonly appId?: string,
    public readonly callbackUrl?: string,
    public readonly inputSchemaDependency?: string,
    public readonly outputSchemaDependency?: string,
    public readonly outputResolvers?: IWorkflowDataResolver[],
  ) {}
}
