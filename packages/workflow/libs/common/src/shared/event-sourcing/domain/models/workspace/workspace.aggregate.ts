import { Aggregate, AggregateRoot, EventHandler } from '@ocoda/event-sourcing';

import { PinoLogger } from 'nestjs-pino';
import { WorkspaceId } from './workspace-id';
import { WorkspaceCreatedEvent } from '@app/common/shared/event-sourcing/domain/events/workspace/workspace-created.event';
import { WorkspaceUpdatedEvent } from '@app/common/shared/event-sourcing/domain/events/workspace/workspace-updated.event';
import { WorkspaceDto } from '@app/common/shared/event-sourcing/application/dtos/workspace/workspace.dto';

@Aggregate({ streamName: 'workspace' })
export class Workspace extends AggregateRoot {
  private static logger: PinoLogger;

  public static setLogger(logger: PinoLogger) {
    Workspace.logger = logger;
  }

  public id: WorkspaceId;
  public tenantId: string;
  public appId?: string;
  public name?: string;
  public description?: string;
  public created?: Date;
  public updated?: Date;

  public static create({
    workspaceId,
    tenantId,
    name,
    description,
  }: {
    workspaceId: WorkspaceId;
    tenantId: string;
    name?: string;
    description?: string;
  }): Workspace {
    Workspace.logger.info(
      `Creating workspace with id: ${workspaceId.value}, name: ${name}`,
    );
    const workspace = new Workspace();

    workspace.applyEvent(
      new WorkspaceCreatedEvent(
        workspaceId.value,
        tenantId,
        name,
        description,
        new Date(),
      ),
    );
    return workspace;
  }

  public update({
    name,
    description,
  }: {
    name?: string;
    description?: string;
  }): Workspace {
    Workspace.logger.info(`Updating workspace with name: ${name}`);

    this.applyEvent(new WorkspaceUpdatedEvent(name, description, new Date()));
    return this;
  }

  toDto(): WorkspaceDto {
    return WorkspaceDto.from(this);
  }

  @EventHandler(WorkspaceCreatedEvent)
  private onWorkspaceCreated(event: WorkspaceCreatedEvent) {
    this.id = WorkspaceId.from(event.workspaceId);
    this.tenantId = event.tenantId;
    this.name = event.name;
    this.description = event.description;
    this.created = event.created ?? new Date();
  }

  @EventHandler(WorkspaceUpdatedEvent)
  private onWorkspaceUpdated(event: WorkspaceUpdatedEvent) {
    this.name = event.name ?? this.name;
    this.description = event.description ?? this.description;
    this.updated = event.updated ?? this.updated;
  }
}
