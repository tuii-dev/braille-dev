import { Page } from "@playwright/test";

import prisma from "../prisma";
import { User } from "./user";
import { Workspace } from "./workspace";

export class Tenant {
  private constructor(
    private page: Page,
    public id: string,
    public name: string,
  ) {}

  static async create(page: Page, name: string) {
    const tenant = await prisma.tenant.create({
      data: {
        name,
      },
    });

    return new Tenant(page, tenant.id, tenant.name);
  }

  createUser({ email }: { email?: string } = {}) {
    return User.create(this.page, this.id, email);
  }

  createAdmin({ email }: { email?: string } = {}) {
    return User.create(this.page, this.id, email, true);
  }

  createWorkspace({ name }: { name: string }) {
    return Workspace.create({ tenantId: this.id, name });
  }
}
