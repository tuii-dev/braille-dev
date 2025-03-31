import { faker } from "@faker-js/faker";

import { getURL } from "../utils/getUrl";
import { test, expect } from "../test";
import prisma from "../prisma";

test.describe("tenant management", () => {
  test("can create a tenant", async ({ page, systemAdmin }) => {
    await systemAdmin.login();

    await page.goto(getURL(`/admin/tenants`));

    await expect(page.getByRole("heading", { name: "Tenants" })).toBeVisible();

    await page.getByRole("button", { name: "Create Tenant" }).click();

    const tenantName = faker.company.name();
    const adminUser = {
      email: faker.internet.email(),
      name: faker.person.fullName(),
    };

    await page.getByRole("textbox", { name: "Tenant Name" }).fill(tenantName);

    await page
      .getByRole("textbox", { name: "Email Address" })
      .fill(adminUser.email);

    await page
      .getByRole("textbox", { name: "Name", exact: true })
      .fill(adminUser.name);

    await page.getByRole("button", { name: "Create", exact: true }).click();

    // await prisma.tenant.findFirstOrThrow({
    //   where: { name: tenantName },
    //   include: { users: true },
    // });
  });

  test("cannot be accessed by general tenant admin", async ({
    page,
    tenant,
  }) => {
    const admin = await tenant.createAdmin();
    await admin.login();

    await page.goto(getURL(`/admin/tenants`));

    await expect(
      page.getByRole("heading", { name: "Page not found" }),
    ).toBeVisible();
  });
});
