import type { Type } from '@nestjs/common';
import type {
  ICommandHandler,
  IEventSubscriber,
  IQueryHandler,
  SnapshotRepository,
} from '@ocoda/event-sourcing';

import {
  // Workflow Templates
  CreateWorkflowTemplateCommandHandler,
  UpdateWorkflowTemplateCommandHandler,

  // Workflow Executions
  RunWorkflowCommandHandler,
  RunWorkflowStepCommandHandler,
  NotifyWorkflowStepCompletedCommandHandler,
  NotifyWorkflowStepFailedCommandHandler,
  ManageWorkflowCompletionCommandHandler,
  UpdateParentWorkflowExecutionNodeCommandHandler,

  // Tenants
  CreateTenantCommandHandler,
  UpdateTenantCommandHandler,

  // Apps
  CreateAppCommandHandler,
  UpdateAppCommandHandler,

  // Workspaces
  CreateWorkspaceCommandHandler,
  UpdateWorkspaceCommandHandler,
} from './application/commands';

import {
  CreateAppScheduledJobRegistrationCommandHandler,
  UpdateAppScheduledJobRegistrationCommandHandler,
  DeleteAppScheduledJobRegistrationCommandHandler,
  PauseAppScheduledJobRegistrationCommandHandler,
  ResumeAppScheduledJobRegistrationCommandHandler,
} from './application/commands';

import {
  // Apps
  GetAllAppsQueryHandler,
  GetAppQueryByIdHandler,

  // Tenants
  GetTenantByIdQueryHandler,
  GetAllTenantsQueryHandler,

  // Workspaces
  GetAllWorkspacesQueryHandler,
  GetWorkspaceByIdQueryHandler,

  // Workflow Templates
  GetAllWorkflowTemplatesQueryHandler,
  GetWorkflowTemplateByIdQueryHandler,

  // Workflow Executions
  GetWorkflowExecutionByIdQueryHandler,
  GetAllWorkflowExecutionsQueryHandler,
} from './application/queries';

import {
  GetAllAppScheduledJobRegistrationsQueryHandler,
  GetAppScheduledJobRegistrationByIdHandler,
} from './application/queries';

import {
  GetAllAppScheduledJobsQueryHandler,
  GetAppScheduledJobByIdHandler,
} from '@app/common/shared/event-sourcing/application/queries';

import {
  WorkflowTemplateRepository,
  WorkflowExecutionRepository,
  AppScheduledJobRegistrationRepository,
} from './application/repositories';

import {
  TenantRepository,
  AppRepository,
  WorkspaceRepository,
} from '@app/common/shared/event-sourcing/application/repositories';

import { AppScheduledJobRepository } from '@app/common/shared/event-sourcing/application/repositories/app-scheduled-job/app-scheduled-job.repository';

import {
  // Workflow Templates
  WorkflowTemplateCreatedEvent,
  WorkflowTemplateUpdatedEvent,
  WorkflowTemplateDeletedEvent,

  // Workflow Executions
  WorkflowExecutionStartedEvent,
  WorkflowExecutionStepStartedEvent,
  WorkflowExecutionStepCompletedEvent,
  WorkflowExecutionCompletedEvent,
  WorkflowExecutionStepFailedEvent,
  WorkflowExecutionParentNodeUpdatedEvent,
  WorkflowExecutionFailedEvent,
} from './domain/events';

import {
  AppScheduledJobRegistrationCreatedEvent,
  AppScheduledJobRegistrationUpdatedEvent,
  AppScheduledJobRegistrationPausedEvent,
  AppScheduledJobRegistrationResumedEvent,
  AppScheduledJobRegistrationDeletedEvent,

  // Tenants
  TenantCreatedEvent,
  TenantUpdatedEvent,

  // Apps
  AppCreatedEvent,
  AppUpdatedEvent,

  // Workspaces
  WorkspaceCreatedEvent,
  WorkspaceUpdatedEvent,
} from '@app/common/shared/event-sourcing/domain/events';

import {
  WorkflowExecutionCompletedEventSubscriber,
  WorkflowExecutionStepCompletedEventSubscriber,
  WorkflowExecutionStepFailedEventSubscriber,
  WorkflowExecutionStartedEventSubscriber,
} from './domain/events';

import {
  AppScheduledJobRegistrationSnapshotRepository,
  WorkflowTemplateSnapshotRepository,
} from './domain/models';

import {
  TenantSnapshotRepository,
  AppSnapshotRepository,
  WorkspaceSnapshotRepository,
  AppScheduledJobSnapshotRepository,
} from '@app/common/shared/event-sourcing/domain/models';

import {
  AppScheduledJobEventBridgeController,
  AppScheduledJobController,
  AppScheduledJobRegistrationController,
  WorkflowTemplateController,
  WorkflowExecutionController,
  TenantController,
  AppController,
  WorkspaceController,
} from './application/controllers';

import { WorkflowExecutionPublisher } from './domain/publishers';

import {
  GraphService,
  SchemaDependencyService,
  WorkflowExecutionProjectionService,
} from './services';
import {
  UtilsService,
  HttpService,
  SnsClientService,
  RedisService,
} from '@app/common/services';

import { WorkflowExecutionSnapshotRepository } from './domain/models/workflow-executions/workflow-execution.snapshot-repository';
import { HealthCheckController } from './application/controllers/health-check.controller';

export const CommandHandlers: Type<ICommandHandler>[] = [
  // Workflow Templates
  CreateWorkflowTemplateCommandHandler,
  UpdateWorkflowTemplateCommandHandler,

  // Workflow Executions
  RunWorkflowCommandHandler,
  RunWorkflowStepCommandHandler,
  NotifyWorkflowStepCompletedCommandHandler,
  NotifyWorkflowStepFailedCommandHandler,
  ManageWorkflowCompletionCommandHandler,
  UpdateParentWorkflowExecutionNodeCommandHandler,

  // Tenants
  CreateTenantCommandHandler,
  UpdateTenantCommandHandler,

  // Apps
  CreateAppCommandHandler,
  UpdateAppCommandHandler,

  // Workspaces
  CreateWorkspaceCommandHandler,
  UpdateWorkspaceCommandHandler,
  GetAllWorkspacesQueryHandler,

  // App Scheduled Job Registrations
  CreateAppScheduledJobRegistrationCommandHandler,
  UpdateAppScheduledJobRegistrationCommandHandler,
  DeleteAppScheduledJobRegistrationCommandHandler,
  PauseAppScheduledJobRegistrationCommandHandler,
  ResumeAppScheduledJobRegistrationCommandHandler,
];

export const QueryHandlers: Type<IQueryHandler>[] = [
  // Tenants
  GetTenantByIdQueryHandler,
  GetAllTenantsQueryHandler,

  // Apps
  GetAllAppsQueryHandler,
  GetAppQueryByIdHandler,

  // Workspaces
  GetAllWorkspacesQueryHandler,
  GetWorkspaceByIdQueryHandler,

  // Workflow Templates
  GetAllWorkflowTemplatesQueryHandler,
  GetWorkflowTemplateByIdQueryHandler,

  // Workflow Executions
  GetWorkflowExecutionByIdQueryHandler,
  GetAllWorkflowExecutionsQueryHandler,

  // App Scheduled Job Registrations
  GetAllAppScheduledJobRegistrationsQueryHandler,
  GetAppScheduledJobRegistrationByIdHandler,

  // App Scheduled Jobs
  GetAllAppScheduledJobsQueryHandler,
  GetAppScheduledJobByIdHandler,
];

export const SnapshotRepositories: Type<SnapshotRepository>[] = [
  WorkflowTemplateSnapshotRepository,
  WorkflowExecutionSnapshotRepository,
  TenantSnapshotRepository,
  AppSnapshotRepository,
  WorkspaceSnapshotRepository,
  AppScheduledJobRegistrationSnapshotRepository,
  AppScheduledJobSnapshotRepository,
];

// export const EventPublishers = [CustomEventPublisher];

export const EventSubscribers: Type<IEventSubscriber>[] = [
  WorkflowExecutionCompletedEventSubscriber,
  WorkflowExecutionStepCompletedEventSubscriber,
  WorkflowExecutionStepFailedEventSubscriber,
  WorkflowExecutionStartedEventSubscriber,
];

export const EventPublishers = [WorkflowExecutionPublisher];

export const Events = [
  // Workflow Templates
  WorkflowTemplateCreatedEvent,
  WorkflowTemplateUpdatedEvent,
  WorkflowTemplateDeletedEvent,

  // Workflow Executions
  WorkflowExecutionStartedEvent,
  WorkflowExecutionStepStartedEvent,
  WorkflowExecutionStepCompletedEvent,
  WorkflowExecutionCompletedEvent,
  WorkflowExecutionStepFailedEvent,
  WorkflowExecutionParentNodeUpdatedEvent,
  WorkflowExecutionFailedEvent,

  // Tenants
  TenantCreatedEvent,
  TenantUpdatedEvent,

  // Apps
  AppCreatedEvent,
  AppUpdatedEvent,

  // Workspaces
  WorkspaceCreatedEvent,
  WorkspaceUpdatedEvent,

  // App Scheduled Trigger Registrations
  AppScheduledJobRegistrationCreatedEvent,
  AppScheduledJobRegistrationUpdatedEvent,
  AppScheduledJobRegistrationPausedEvent,
  AppScheduledJobRegistrationResumedEvent,
  AppScheduledJobRegistrationDeletedEvent,
];

export const AggregateRepositories = [
  WorkflowTemplateRepository,
  WorkflowExecutionRepository,
  TenantRepository,
  AppRepository,
  WorkspaceRepository,
  AppScheduledJobRegistrationRepository,
  AppScheduledJobRepository,
];

export const Controllers = [
  WorkflowTemplateController,
  WorkflowExecutionController,
  TenantController,
  AppController,
  WorkspaceController,
  AppScheduledJobController,
  AppScheduledJobRegistrationController,
  AppScheduledJobEventBridgeController,
  HealthCheckController,
];

export const Services = [
  UtilsService,
  GraphService,
  SchemaDependencyService,
  WorkflowExecutionProjectionService,
  HttpService,
  SnsClientService,
  RedisService,
];
