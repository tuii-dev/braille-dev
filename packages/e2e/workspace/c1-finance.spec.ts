import { test, expect } from "../test";
import { getURL } from "../utils/getUrl";
import prisma from "../prisma";

import { brokerDataSchema, primaryApplicantSchema } from "./c1-finance.fixture";

test.describe("custom parameters", async () => {
  let workspaceId: string;

  test.beforeEach(async ({ tenant }) => {
    const user = await tenant.createAdmin();
    await user.login();
    const workspace = await tenant.createWorkspace({ name: "Workspace" });
    workspaceId = workspace.id;

    const workspaceModel = await prisma.workspaceModel.create({
      include: {
        model: {
          include: {
            versions: true,
          },
        },
      },
      data: {
        workspace: {
          connect: {
            id: workspace.id,
          },
        },
        model: {
          create: {
            name: "C1 Finance Data Model",
            tenant: {
              connect: {
                id: tenant.id,
              },
            },
            versions: {
              create: {
                tenant: {
                  connect: {
                    id: tenant.id,
                  },
                },
                schema: {
                  create: {
                    tenant: {
                      connect: {
                        id: tenant.id,
                      },
                    },
                    schema: {
                      type: "object",
                      title: "C1 Finance Data Model",
                      properties: {
                        broker_data: brokerDataSchema,
                        primary_applicant: primaryApplicantSchema,
                        secondary_applicant: {
                          type: "object",
                          title: "Secondary Applicant",
                          properties: {
                            first_name: {
                              type: "string",
                              title: "First Name",
                            },
                            last_name: {
                              type: "string",
                              title: "Last Name",
                            },
                            date_of_birth: {
                              type: "string",
                              format: "date",
                              title: "Date of Birth",
                            },
                          },
                        },
                        assessment: {
                          type: "object",
                          title: "Assessment",
                          properties: {
                            incomme_from_broker_app: {
                              type: "number",
                              title: "Total Income",
                            },
                            outgoings_from_broker_app: {
                              type: "number",
                              title: "Total Outgoings",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        tenant: {
          connect: {
            id: tenant.id,
          },
        },
      },
    });

    const workspaceDocument = await prisma.workspaceDocument.create({
      data: {
        workspace: {
          connect: {
            id: workspace.id,
          },
        },
        tenant: {
          connect: { id: tenant.id },
        },
        createdBy: {
          connect: { id: user.id },
        },
        document: {
          create: {
            name: "C1 Finance Data Model",
            tenant: {
              connect: {
                id: tenant.id,
              },
            },
            createdBy: {
              connect: { id: user.id },
            },
          },
        },
      },
    });

    const modelVersionId = workspaceModel.model.versions[0].id;

    await prisma.dataExtractionJob.create({
      data: {
        workspaceDocument: {
          connect: { id: workspaceDocument.id },
        },
        document: {
          connect: {
            id: workspaceDocument.documentId,
          },
        },
        modelVersion: {
          connect: {
            id: modelVersionId,
          },
        },
        status: "FINISHED",
        data: {
          create: {
            json: {},
            tenantId: tenant.id,
            modelVersionId,
          },
        },
        tenant: {
          connect: {
            id: tenant.id,
          },
        },
      },
    });
  });

  test("can render complex document data", async ({ page }) => {
    await page.goto(getURL(`/workspaces/${workspaceId}`));

    const cell = page.getByRole("cell", { name: "C1 Finance Data Model" });
    await expect(cell).toBeInViewport();

    await cell.getByRole("link").click();

    await expect(
      page.getByRole("table", { name: "Assessment" }),
    ).toBeInViewport();
  });
});
