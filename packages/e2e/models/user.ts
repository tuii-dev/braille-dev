import { Page } from "@playwright/test";
import { generateSessionCookie } from "@auth0/nextjs-auth0/testing";
import { faker } from "@faker-js/faker";

import prisma from "../prisma";

import { getURL } from "../utils/getUrl";

export class User {
  private isSystemAdmin = false;

  private constructor(
    private page: Page,
    public id: string,
    public email: string,
  ) {}

  static async create(
    page: Page,
    tenantId?: string,
    email?: string,
    admin = false,
  ) {
    const user = await prisma.user.create({
      data: {
        email:
          email ?? faker.internet.email({ firstName: faker.string.uuid() }),
        tenants: tenantId
          ? {
              connect: {
                id: tenantId,
              },
            }
          : undefined,
        userTenantRoles: {
          createMany: {
            data:
              admin && tenantId
                ? {
                    role: "ADMIN",
                    tenantId,
                  }
                : [],
          },
        },
      },
    });

    return new User(page, user.id, user.email);
  }

  async promoteToSystemAdmin() {
    if (!this.isSystemAdmin) {
      await prisma.userSystemRole.create({
        data: {
          role: "ADMIN",
          userId: this.id,
        },
      });

      this.isSystemAdmin = true;
    }
  }

  async login() {
    const cookie = await generateSessionCookie(
      {
        accessToken: `some-access-token:${this.email}`,
        user: { email: this.email },
      },
      {
        secret: "auth0-secret",
      },
    );

    await this.page.context().addCookies([
      {
        url: getURL(),
        name: "appSession",
        value: cookie,
        httpOnly: true,
      },
    ]);
  }
}
