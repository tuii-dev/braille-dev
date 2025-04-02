/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { AppRepository } from '@app/common/shared/event-sourcing/application/repositories/app/app.repository';
import { TenantRepository } from '@app/common/shared/event-sourcing/application/repositories/tenant/tenant.repository';
import { WorkspaceRepository } from '@app/common/shared/event-sourcing/application/repositories/workspaces/workspace.repository';
import { AppId } from '@app/common/shared/event-sourcing/domain/models/app/app-id';
import { App } from '@app/common/shared/event-sourcing/domain/models/app/app.aggregate';
import { TenantId } from '@app/common/shared/event-sourcing/domain/models/tenant/tenant-id';
import { Tenant } from '@app/common/shared/event-sourcing/domain/models/tenant/tenant.aggregate';
import { WorkspaceId } from '@app/common/shared/event-sourcing/domain/models/workspace/workspace-id';
import { Workspace } from '@app/common/shared/event-sourcing/domain/models/workspace/workspace.aggregate';
import {
  InvalidTenantException,
  InvalidUuidException,
} from '@app/domain/exceptions';
import { InvalidAppException } from '@app/domain/exceptions/invalid-app.exception';
import { InvalidWorkspaceException } from '@app/domain/exceptions/invalid-workspace.exception';

import { Injectable } from '@nestjs/common';
import { validate as uuidValidate } from 'uuid';

@Injectable()
export class UtilsService {
  constructor(
    private tenantRepository: TenantRepository,
    private appRepository: AppRepository,
    private workspaceRepository: WorkspaceRepository,
  ) {}

  ping(): string {
    return new Date().toISOString();
  }
  validateUuid(uuid: string, throwOnFailure = true): boolean {
    if (!uuidValidate(uuid)) {
      if (throwOnFailure) {
        throw InvalidUuidException.because(
          `Specified UUID is not valid: ${uuid}`,
        );
      } else {
        return false;
      }
    }
    return true;
  }

  async validateTenant(uuid: string): Promise<[TenantId, Tenant]> {
    this.validateUuid(uuid);

    const tenantId = TenantId.from(uuid);
    const tenant = await this.tenantRepository.getById(tenantId);

    if (!tenant) {
      throw InvalidTenantException.because(
        `Tenant ID: ${tenantId.value} not found`,
      );
    }
    return [tenantId, tenant];
  }

  async validateApp(tenantId: string, uuid: string): Promise<[AppId, App]> {
    this.validateUuid(uuid);

    const appId = AppId.from(uuid);
    const app = await this.appRepository.getById(tenantId, appId);

    if (!app) {
      throw InvalidAppException.because(`App ID: ${appId.value} not found`);
    }
    return [appId, app];
  }

  async validateWorkspace(
    tenantId: string,
    uuid: string,
  ): Promise<[WorkspaceId, Workspace]> {
    this.validateUuid(uuid);

    const workspaceId = WorkspaceId.from(uuid);
    const workspace = await this.workspaceRepository.getById(
      tenantId,
      workspaceId,
    );

    if (!workspace) {
      throw InvalidWorkspaceException.because(
        `Workspace ID: ${workspaceId.value} not found`,
      );
    }
    return [workspaceId, workspace];
  }
}
