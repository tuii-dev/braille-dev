import { Event, type IEvent } from '@ocoda/event-sourcing';

@Event('workflow-template-deleted')
export class WorkflowTemplateDeletedEvent implements IEvent {
  constructor(
    public readonly templateId: string,
    public readonly tenantId: string,
    public readonly deletedAt: number,
  ) {}
}
