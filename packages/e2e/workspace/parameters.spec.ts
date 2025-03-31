import { FieldDataTypeEnum, FieldDataTypeEnumType } from "@jptr/braille-prisma";

import { test, expect } from "../test";
import { ModelEditor } from "../models/model-editor";
import { getURL } from "../utils/getUrl";
import prisma from "../prisma";

test.describe.skip("custom parameters", async () => {
  let workspaceId: string;

  test.beforeEach(async ({ tenant }) => {
    const admin = await tenant.createAdmin();
    await admin.login();

    const workspace = await tenant.createWorkspace({ name: "Workspace" });
    workspaceId = workspace.id;
    await prisma.workspaceModel.create({
      data: {
        workspace: {
          connect: {
            id: workspace.id,
          },
        },
        model: {
          create: {
            name: "Workspace Data Model",
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
                      properties: {},
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
  });

  test("can create all parameter types", async ({ page, tenant }) => {
    await page.goto(getURL(`/workspaces/${workspaceId}/settings/parameters`));

    const editor = ModelEditor.from(page);
    await expect(editor.modelEditGrid).toBeInViewport();

    const fields: [
      FieldDataTypeEnumType,
      { label: string; description: string; systemName: string },
    ][] = [
      [
        FieldDataTypeEnum.STRING,
        {
          label: "Invoice Number",
          description: "The unique identifier of the invoice",
          systemName: "invoice_number",
        },
      ],
      [
        FieldDataTypeEnum.DATE,
        {
          label: "Invoice Due Date",
          description: "The due date of the invoice",
          systemName: "due_date",
        },
      ],
      [
        FieldDataTypeEnum.CURRENCY,
        {
          label: "Invoice Total Amount",
          description: "The total amount of the invoice",
          systemName: "total",
        },
      ],
      [
        FieldDataTypeEnum.OBJECT,
        {
          label: "Invoice Vendor",
          description: "The vendor who issued the invoice",
          systemName: "vendor",
        },
      ],
      [
        FieldDataTypeEnum.ARRAY,
        {
          label: "Invoice Items",
          description: "The items on the invoice",
          systemName: "items",
        },
      ],
    ];

    for (const [type, field] of fields) {
      await test.step(`can create ${type} field`, async () => {
        // Add the field
        await editor.addField({
          ...field,
          type,
        });

        // Verify the field was added successfully
        const fieldRow = editor.modelEditGrid.getByRole('row', { name: field.label });
        await expect(fieldRow).toBeVisible();
        await expect(fieldRow.getByText(field.label)).toBeVisible();
        await expect(fieldRow.getByText(field.description)).toBeVisible();
      });
    }

    const { model } = await prisma.workspaceModel.findFirstOrThrow({
      include: {
        model: {
          include: {
            versions: {
              include: {
                schema: true,
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
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
                properties: {
                  due_date: {
                    description: "The due date of the invoice",
                    title: "Invoice Due Date",
                    format: "date",
                    type: "string",
                  },
                  invoice_number: {
                    description: "The unique identifier of the invoice",
                    title: "Invoice Number",
                    type: "string",
                  },
                  total: {
                    description: "The total amount of the invoice",
                    title: "Invoice Total Amount",
                    type: "object",
                    properties: {
                      currency: {
                        enum: ["AUD", "USD"],
                        type: "string",
                      },
                      value: {
                        type: "number",
                      },
                    },
                  },
                  vendor: {
                    description: "The vendor who issued the invoice",
                    title: "Invoice Vendor",
                    type: "object",
                    properties: {},
                  },
                  items: {
                    description: "The items on the invoice",
                    title: "Invoice Items",
                    type: "array",
                    items: {
                      properties: {},
                      type: "object",
                    },
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

  test.describe("validation", async () => {
    test("insert", async ({ page }) => {});
  });
});
