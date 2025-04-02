import { Aggregate, AggregateRoot, EventHandler } from '@ocoda/event-sourcing';

import { PinoLogger } from 'nestjs-pino';
import { AppId } from './app-id';
import { AppCreatedEvent } from '@app/common/shared/event-sourcing/domain/events/app/app-created.event';
import { AppUpdatedEvent } from '@app/common/shared/event-sourcing/domain/events/app/app-updated.event';
import { AppDto } from '@app/common/shared/event-sourcing/application/dtos/app/app.dto';

@Aggregate({ streamName: 'app' })
export class App extends AggregateRoot {
  private static logger: PinoLogger;

  public static setLogger(logger: PinoLogger) {
    App.logger = logger;
  }

  public id: AppId;
  public tenantId: string;
  public name?: string;
  public description?: string;
  public created?: Date;
  public updated?: Date;

  public static create({
    appId,
    tenantId,
    name,
    description,
  }: {
    appId: AppId;
    tenantId: string;
    name?: string;
    description?: string;
  }): App {
    App.logger.info(`Creating app with id: ${appId.value}, name: ${name}`);
    const app = new App();

    app.applyEvent(
      new AppCreatedEvent(appId.value, tenantId, name, description, new Date()),
    );
    return app;
  }

  public update({
    name,
    description,
  }: {
    name?: string;
    description?: string;
  }): App {
    App.logger.info(`Updating app with name: ${name}`);

    this.applyEvent(new AppUpdatedEvent(name, description, new Date()));
    return this;
  }

  toDto(): AppDto {
    return AppDto.from(this);
  }

  @EventHandler(AppCreatedEvent)
  private onAppCreated(event: AppCreatedEvent) {
    this.id = AppId.from(event.appId);
    this.tenantId = event.tenantId;
    this.name = event.name;
    this.description = event.description;
    this.created = event.created ?? new Date();
  }

  @EventHandler(AppUpdatedEvent)
  private onAppUpdated(event: AppUpdatedEvent) {
    this.name = event.name ?? this.name;
    this.description = event.description ?? this.description;
    this.updated = event.updated ?? this.updated;
  }
}
