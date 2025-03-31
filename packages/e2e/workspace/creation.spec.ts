import { test, expect } from "../test";
import prisma from "../prisma";
import { getURL } from "../utils/getUrl";
// import { templates } from "../../application/src/app/workspaces/templates";

test.describe("an admin", async () => {
  test.beforeEach(async ({ tenant }) => {
    const admin = await tenant.createAdmin();
    await admin.login();
  });

  test("can create workspaces with workspace-settings", async ({
    page,
    tenant,
  }) => {
    await page.goto(getURL("/workspaces/"));
    const input = page.getByRole("textbox");

    await page
      .getByRole("button", { name: /Create Workspace/i, exact: true })
      .click();
    await expect(input).toBeAttached();

    await expect(page.getByText(/select a template/i)).toBeVisible();

    await input.fill("resume");
    await input.press("Enter");

    await page.getByRole("button", { name: /Resume/i }).click();
    await expect(input).toBeAttached();

    await page.getByRole("button", { name: /Next/i }).click();
    await expect(input).toBeAttached();

    await expect(page.getByRole("button", { name: /Back/i })).toBeVisible();

    await expect(
      page.getByRole("heading", { name: /Customize your Workspace/i }),
    ).toBeVisible();

    await page.getByRole("textbox", { name: /workspace name/i }).click();

    await input.fill("Resume Extractor");

    await page.getByRole("button", { name: /Next/i }).click();
    await expect(input).toBeAttached();

    await expect(
      page.getByRole("heading", { name: /workspace context/i }),
    ).toBeVisible();

    await page.getByRole("textbox", { name: /job description/i }).click();

    await input.fill(
      "Office assistant for a building and construction company specialising in contract management, project management and customer selections.",
    );

    await page.getByRole("button", { name: /Next/i }).click();

    await page.getByRole("button", { name: /go to workspace/i }).click();

    //create second workspace from the tab button

    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(
      page
        .getByRole("navigation")
        .getByRole("link", { name: /Resume Extractor/i }),
    ).toBeVisible();
    await page
      .getByRole("navigation")
      .getByRole("button", { name: /New Workspace/i })
      .click();

    await expect(page.getByText(/select a template/i)).toBeVisible();

    await input.fill("resume");
    await input.press("Enter");

    await page.getByRole("button", { name: /Resume/i }).click();
    await expect(input).toBeAttached();

    await page.getByRole("button", { name: /Next/i }).click();
    await expect(input).toBeAttached();

    await expect(page.getByRole("button", { name: /Back/i })).toBeVisible();

    await expect(
      page.getByRole("heading", { name: /Customize your Workspace/i }),
    ).toBeVisible();

    await page.getByRole("textbox", { name: /workspace name/i }).click();

    await input.fill("Resume Extractor 2");

    await page.getByRole("button", { name: /Next/i }).click();
    await expect(input).toBeAttached();

    await expect(
      page.getByRole("heading", { name: /workspace context/i }),
    ).toBeVisible();

    await page.getByRole("textbox", { name: /job description/i }).click();

    await input.fill(
      "Office assistant for a building and construction company specialising in contract management, project management and customer selections.",
    );

    await page.getByRole("button", { name: /Next/i }).click();

    await page.getByRole("button", { name: /go to workspace/i }).click();

    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(
      page.getByRole("navigation").getByRole("link", {
        name: /Resume Extractor 2/i,
      }),
    ).toHaveText("Resume Extractor 2");

    // create workspace from the 'create from blank button'

    const workspaces = await prisma.workspace.findMany({
      where: {
        tenantId: tenant.id,
      },
    });

    expect(workspaces).toStrictEqual([
      expect.objectContaining({
        name: "Resume Extractor",
        color: null,
        slug: "resume-extractor",
        tenantId: tenant.id,
      }),
      expect.objectContaining({
        name: "Resume Extractor 2",
        color: null,
        slug: "resume-extractor-2",
        tenantId: tenant.id,
      }),
    ]);
  });
});

test.describe("a user", () => {
  test.beforeEach(async ({ tenant }) => {
    const user = await tenant.createUser();
    await user.login();
    await tenant.createWorkspace({ name: "Workspace 1" });
  });

  test("cannot create a new workspace", async ({ page }) => {
    await page.goto(getURL("/workspaces/"));

    await expect(
      page.getByRole("navigation").getByRole("link", {
        name: "Dashboard",
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: "Create Workspace",
      }),
    ).not.toBeAttached();
  });
});
