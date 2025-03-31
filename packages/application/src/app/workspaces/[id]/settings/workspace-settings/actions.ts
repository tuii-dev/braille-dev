"use server";

import getCurrentAdminUser from "@/lib/getAdminUser";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { redirect } from "next/navigation";

export const fetchAvailableModels = async () => {
  const { tenantId } = await getCurrentAdminUser();

  const tenantModels = prisma.model.findMany({
    include: {
      versions: {
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    where: {
      tenantId,
    },
  });

  const connectedAppModels = prisma.model.findMany({
    include: {
      appEntityModel: {
        include: {
          app: true,
        },
      },
      versions: {
        include: {
          appVersionModelVersion: {
            include: {
              appVersion: {
                include: {
                  app: true,
                },
              },
            },
          },
        },
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    where: {
      appEntityModel: {
        app: {
          connections: {
            some: {
              tenantId,
            },
          },
        },
      },
    },
  });

  const result = await prisma.$transaction([tenantModels, connectedAppModels]);

  return result.flat();
};

export const connectWorkspaceModel = async (
  workspaceId: string,
  formData: FormData,
) => {
  const { tenantId } = await getCurrentAdminUser();

  await prisma.$transaction(async (tx) => {
    await tx.workspaceModel.deleteMany({
      where: {
        tenantId,
        workspaceId,
      },
    });

    const model = await tx.model.findFirstOrThrow({
      where: {
        OR: [
          { tenantId: null, id: formData.get("modelId") as string },
          { tenantId, id: formData.get("modelId") as string },
        ],
      },
    });

    return tx.workspaceModel.create({
      data: {
        tenantId,
        workspaceId,
        modelId: model.id,
      },
    });
  });
};

export const createNewWorkspaceModel = async (workspaceId: string) => {
  const { tenantId } = await getCurrentAdminUser();

  await prisma.$transaction(async (tx) => {
    await tx.workspaceModel.deleteMany({
      where: {
        tenantId,
        workspaceId,
      },
    });

    const workspace = await tx.workspace.findFirstOrThrow({
      where: {
        id: workspaceId,
      },
    });

    return tx.workspaceModel.create({
      data: {
        tenant: {
          connect: {
            id: tenantId,
          },
        },
        workspace: {
          connect: {
            id: workspaceId,
          },
        },
        model: {
          create: {
            name: `${workspace.name} Data Model`,
            tenantId,
            versions: {
              create: {
                tenant: {
                  connect: {
                    id: tenantId,
                  },
                },
                schema: {
                  create: {
                    tenantId: tenantId,
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
      },
    });
  });

  revalidatePath(`/workspaces/${workspaceId}/settings/parameters`);
};

/**
 * Toggles the `archived` state of a workspace to `true`.
 * @param workspaceId - The ID of the workspace to archive.
 * @returns Success or error response.
 */
export async function archiveWorkspace(workspaceId: string) {
  try {
    const { isAdmin } = await getCurrentSessionUser();

    if (!isAdmin) {
      return {
        errors: {
          form: ["You must be an admin to archive a workspace."],
        },
      };
    }

    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { archived: true },
    });
  } catch (error) {
    console.error("Failed to archive workspace:", error);
    return {
      errors: {
        form: ["An error occurred while trying to archive the workspace."],
      },
    };
  }
  redirect(`/workspaces/`);
}
