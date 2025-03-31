import { test, expect } from "../test";
import { getURL } from "../utils/getUrl";
import prisma from "../prisma";

test.describe("data view", async () => {
  let workspaceId: string;
  let documentId: string;

  test.beforeEach(async ({ tenant }) => {
    const user = await tenant.createAdmin();
    await user.login();
    const workspace = await tenant.createWorkspace({ name: "Workspace" });
    workspaceId = workspace.id;

    const primitiveSchemas = {
      string: {
        type: "string",
        title: "String Type",
      },
      number: {
        type: "number",
        title: "Number Type",
      },
      boolean: {
        type: "boolean",
        title: "Boolean Type",
      },
      date: {
        type: "string",
        format: "date",
        title: "Date Type",
      },
      enum: {
        type: "string",
        title: "Enum Type",
        enum: ["Option 1", "Option 2"],
      },
    };

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
            name: "Document",
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
                      title: "Document",
                      properties: {
                        ...primitiveSchemas,
                        object: {
                          title: "Object Type",
                          properties: primitiveSchemas,
                        },
                        collection: {
                          title: "Collection Type",
                          items: {
                            type: "object",
                            properties: primitiveSchemas,
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
            name: "Document",
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

    documentId = workspaceDocument.documentId;

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
            json: {
              string: "string",
              number: 123,
              boolean: true,
              date: "2021-01-01",
              enum: "Option 1",
              object: {
                string: "string",
                number: 123,
                boolean: true,
                date: "2021-01-01",
                enum: "Option 1",
              },
              collection: [
                {
                  string: "string",
                  number: 123,
                  boolean: true,
                  date: "2021-01-01",
                  enum: "Option 1",
                },
                {
                  string: "string",
                  number: 123,
                  boolean: true,
                  date: "2021-01-01",
                  enum: "Option 2",
                },
              ],
            },
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

  test("can render all data types", async ({ page }) => {
    await page.goto(getURL(`/workspaces/${workspaceId}/${documentId}`));

    // await expect(
    //   page
    //     .getByTestId("workspace-document")
    //     .getByRole("table")
    //     .first()
    //     .getByRole("cell"),
    // ).toBeVisible();

    // STRING
    // NUMBER
    // BOOLEAN
    // DATE
    // CURRENCY
    // ENUM
    // OBJECT
    // COLLECTION
  });

  test("can edit all data types", async () => {
    // STRING
    // NUMBER
    // BOOLEAN
    // DATE
    // CURRENCY
    // ENUM
    // OBJECT
    // COLLECTION
  });
});
