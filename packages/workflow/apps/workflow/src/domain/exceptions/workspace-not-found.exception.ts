import { DomainException } from '@ocoda/event-sourcing';
import { WorkspaceId } from '../../../../../libs/common/src/shared/event-sourcing/domain/models/workspace/workspace-id';

export class WorkspaceNotFoundException extends DomainException {
  static withId(id: WorkspaceId): WorkspaceNotFoundException {
    return new WorkspaceNotFoundException('Workspace not found', id);
  }
}
