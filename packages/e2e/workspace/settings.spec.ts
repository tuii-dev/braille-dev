import { FieldDataTypeEnum } from "@jptr/braille-prisma";

import { test, expect } from "../test";
import { ModelEditor } from "../models/model-editor";
import { getURL } from "../utils/getUrl";
import prisma from "../prisma";

test.describe("an admin", () => {
  let workspaceId: string;

  test.beforeEach(async ({ tenant }) => {
    const admin = await tenant.createAdmin();
    await admin.login();
    const workspace = await tenant.createWorkspace({ name: "Workspace" });
    workspaceId = workspace.id;
  });

  test("can update workspace name", async ({ page, tenant }) => {
    await test.step("Navigate to workspace settings", async () => {
      await page.goto(getURL(`/workspaces/${workspaceId}`));
      await page.getByRole("link", { name: /Workspace Settings/ }).click();
    });

    await test.step("Complete workspace details form", async () => {
      await page
        .getByRole("textbox", { name: /Display Name/ })
        .fill("New Name");
      await page
        .getByRole("textbox", { name: /Description/ })
        .fill("Workspace description");
      await page.getByRole("button", { name: /Save/ }).click();
    });

    await test.step("Validate update", async () => {
      await expect(
        page.getByRole("navigation").getByRole("link", { name: "New Name" }),
      ).toBeInViewport();

      expect(
        await prisma.workspace.findFirst({
          where: {
            tenantId: tenant.id,
          },
        }),
      ).toStrictEqual(
        expect.objectContaining({
          id: workspaceId,
          name: "New Name",
          color: "#1d4ed8",
          slug: "workspace",
          description: "Workspace description",
          tenantId: tenant.id,
          archived: false,
        }),
      );
    });
  });

  test("can create custom parameters", async ({ page, tenant }) => {
    await page.goto(getURL(`/workspaces/${workspaceId}/settings/parameters`));

    await page.getByRole("button", { name: /Create new parameters/ }).click();

    await expect(page.getByTestId("model-edit-grid")).toBeInViewport();

    const editor = ModelEditor.from(page);

    await editor.addField({
      label: "Invoice Number",
      description: "The unique identifier of the invoice",
      type: FieldDataTypeEnum.STRING,
      systemName: "invoice_number",
    });

    const { model } = await prisma.workspaceModel.findFirstOrThrow({
      include: {
        model: {
          include: {
            versions: {
              include: {
                schema: true,
              },
            },
          },
        },
      },
      where: {
        workspaceId,
        tenantId: tenant.id,
      },
    });

    expect(model).toStrictEqual(
      expect.objectContaining({
        name: "Workspace Data Model",
        archived: false,
        versions: [
          expect.objectContaining({
            tenantId: tenant.id,
            schema: expect.objectContaining({
              tenantId: tenant.id,
              schema: {
                properties: {},
                type: "object",
              },
            }),
          }),
          expect.objectContaining({
            tenantId: tenant.id,
            schema: expect.objectContaining({
              tenantId: tenant.id,
              schema: {
                properties: {
                  invoice_number: {
                    description: "The unique identifier of the invoice",
                    title: "Invoice Number",
                    type: "string",
                  },
                },
                type: "object",
              },
            }),
          }),
        ],
        tenantId: tenant.id,
      }),
    );
  });

  test.describe("can archive a workspace", () => {
    let workspaceId: string;

    test.beforeEach(async ({ tenant }) => {
      const admin = await tenant.createAdmin();
      await admin.login();
      const workspace = await tenant.createWorkspace({
        name: "Workspace to Archive",
      });
      workspaceId = workspace.id;
    });

    test("can successfully archive the workspace", async ({ page, tenant }) => {
      await test.step("Navigate to workspace settings", async () => {
        await page.goto(getURL(`/workspaces/${workspaceId}`));
        await page.getByRole("link", { name: /Workspace Settings/ }).click();
      });

      await test.step("Archive the workspace", async () => {
        await page.getByRole("button", { name: /Archive Workspace/ }).click();
        await page.getByRole("button", { name: /Confirm/ }).click();
      });

      await page.waitForTimeout(2000);

      await test.step("Validate workspace is archived", async () => {
        const archivedWorkspace = await prisma.workspace.findFirst({
          where: {
            id: workspaceId,
            tenantId: tenant.id,
            archived: true,
          },
        });

        expect(archivedWorkspace).not.toBeNull();
        expect(archivedWorkspace).toStrictEqual(
          expect.objectContaining({
            id: workspaceId,
            name: "Workspace to Archive",
            archived: true,
          }),
        );
      });

      // await test.step("Verify archived workspace is not accessible", async () => {
      //   await page.goto(getURL(`/workspaces/${workspaceId}`));
      //   await expect(
      //     page.getByRole("heading", { name: /Page not found/ }),
      //   ).toBeInViewport();
      // });
    });
  });
});

test.describe("a user", () => {
  const workspaceName = "Workspace";
  let workspaceId: string;

  test.beforeEach(async ({ tenant }) => {
    const user = await tenant.createUser();
    await user.login();
    const workspace = await tenant.createWorkspace({ name: workspaceName });
    workspaceId = workspace.id;
  });

  test("cannot navigate to settings", async ({ page }) => {
    await page.goto(getURL(`/workspaces/${workspaceId}/settings`));

    await expect(
      page.getByRole("heading", { name: /Page not found/ }),
    ).toBeInViewport();
  });

  test("cannot see settings button in workspace", async ({ page }) => {
    await page.goto(getURL(`/workspaces/${workspaceId}`));

    await expect(
      page.getByRole("navigation").getByRole("link", { name: "Workspace" }),
    ).toBeInViewport();

    await expect(
      page.getByRole("link", { name: /Workspace Settings/ }),
    ).not.toBeAttached();
  });
});
