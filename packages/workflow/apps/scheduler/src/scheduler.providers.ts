/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { Type } from '@nestjs/common';
import type {
  IEventSubscriber,
  SnapshotRepository,
} from '@ocoda/event-sourcing';

import {
  // App Scheduled Trigger Registrations
  AppScheduledJobRegistrationCreatedEvent,
  AppScheduledJobRegistrationUpdatedEvent,
  AppScheduledJobRegistrationPausedEvent,
  AppScheduledJobRegistrationResumedEvent,
  AppScheduledJobRegistrationDeletedEvent,

  // App Scheduled Job Events
  AppScheduledJobCompletedEvent,
  AppScheduledJobFailedEvent,
  AppScheduledJobStartedEvent,
} from '@app/common/shared/event-sourcing/domain/events';

import { StartAppScheduledJobCommandHandler } from '@app/common/shared/event-sourcing/application/commands';

import { SchedulerPublisher } from '@app/common/shared/event-sourcing/domain/publishers';

import {
  AppScheduledJobRepository,
  AppRepository,
  TenantRepository,
  WorkspaceRepository,
} from '@app/common/shared/event-sourcing/application/repositories';
import {
  AppScheduledJobSnapshotRepository,
  AppSnapshotRepository,
  TenantSnapshotRepository,
  WorkspaceSnapshotRepository,
} from '@app/common/shared/event-sourcing/domain/models';

import { AppScheduledJobRegistrationEventBridgeController } from '@app/common/shared/event-sourcing/application/controllers/app-scheduled-job-registration.event-bridge.controller';
import {
  UtilsService,
  HttpService,
  SqsClientService,
  RedisService,
  MessageDeduplicationService,
} from '@app/common/services';
import { SchedulerService } from './services/scheduler.service';

export const SnapshotRepositories: Type<SnapshotRepository>[] = [
  AppScheduledJobSnapshotRepository,
  AppSnapshotRepository,
  TenantSnapshotRepository,
  WorkspaceSnapshotRepository,
];

export const AggregateRepositories = [
  AppScheduledJobRepository,
  AppRepository,
  TenantRepository,
  WorkspaceRepository,
];

export const Events = [
  // App Scheduled Trigger Registrations
  AppScheduledJobRegistrationCreatedEvent,
  AppScheduledJobRegistrationUpdatedEvent,
  AppScheduledJobRegistrationPausedEvent,
  AppScheduledJobRegistrationResumedEvent,
  AppScheduledJobRegistrationDeletedEvent,

  // App Scheduled Jobs
  AppScheduledJobCompletedEvent,
  AppScheduledJobFailedEvent,
  AppScheduledJobStartedEvent,
];

export const EventSubscribers: Type<IEventSubscriber>[] = [];

export const EventPublishers = [SchedulerPublisher];

export const CommandHandlers = [StartAppScheduledJobCommandHandler];

export const Services = [
  HttpService,
  UtilsService,
  SqsClientService,
  RedisService,
  MessageDeduplicationService,
  SchedulerService,
];
export const Controllers = [AppScheduledJobRegistrationEventBridgeController];
