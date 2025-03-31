import { test as base } from "@playwright/test";
import { generateSessionCookie } from "@auth0/nextjs-auth0/testing";

import { getURL } from "./utils/getUrl";
import prisma from "./prisma";
import { User } from "./models/user";
import { Tenant } from "./models/tenant";
import { faker } from "@faker-js/faker";

type Fixtures = {
  cleanDB: () => Promise<void>;
  tenant: Tenant;
  email: string;
  systemAdmin: User;
};

const cleanDB = async (tenantId?: string) => {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== "_prisma_migrations")
    .map((name) => `"public"."${name}"`)
    .join(", ");

  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
};

export const test = base.extend<Fixtures>({
  tenant: [
    async ({ page }, use) => {
      const tenant = await Tenant.create(page, "tenant-id");
      await use(tenant);
    },
    { scope: "test", auto: true },
  ],
  cleanDB: async ({}, use) => {
    await use(async () => await cleanDB());
  },
  systemAdmin: async ({ page }, use) => {
    const user = await User.create(
      page,
      undefined,
      faker.internet.email({ firstName: faker.string.uuid() }),
    );
    await user.promoteToSystemAdmin();
    await use(user);
  },
});

export { expect } from "@playwright/test";
