"use server";

import { z } from "zod";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import prisma from "@/lib/prisma";
import getCurrentAdminUser from "@/lib/getAdminUser";
import { revalidatePath } from "next/cache";

const updateWorkspaceSchema = z.object({
  name: z.string({
    invalid_type_error: "Invalid Name",
  }),
  description: z.string().optional(),
  workspaceId: z.string(),
  color: z.string().optional(),
});

const EMPTY_SCHEMA = {
  type: "object",
  properties: {},
};

export const updateWorkspace = async (formData: FormData) => {
  await getCurrentAdminUser();

  const form = updateWorkspaceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    workspaceId: formData.get("workspaceId"),
    color: formData.get("color"),
  });

  if (!form.success) {
    return {
      errors: form.error.flatten().fieldErrors,
    };
  }

  await prisma.workspace.update({
    where: {
      id: form.data.workspaceId,
    },
    data: {
      name: form.data.name,
      description: form.data.description,
      color: form.data.color,
    },
  });

  revalidatePath(`/workspaces/${form.data.workspaceId}`);
};

const createWorkspaceModelSchema = z.object({
  workspaceId: z.string(),
});

export const createWorkspaceModel = async (formData: FormData) => {
  const { user } = await getCurrentAdminUser();

  const form = createWorkspaceModelSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
  });

  if (!form.success) {
    return {
      errors: form.error.flatten().fieldErrors,
    };
  }

  const workspace = await prisma.workspace.findUniqueOrThrow({
    where: {
      id: form.data.workspaceId,
    },
  });

  await prisma.workspaceModel.create({
    data: {
      workspace: { connect: { id: form.data.workspaceId } },
      model: {
        create: {
          name: "Custom Model",
          tenantId: workspace.tenantId,
          versions: {
            create: {
              schema: {
                create: {
                  schema: EMPTY_SCHEMA,
                },
              },
              tenant: {
                connect: {
                  id: workspace.tenantId,
                },
              },
            },
          },
        },
      },
      tenant: {
        connect: {
          id: workspace.tenantId,
        },
      },
    },
  });
};

const updateConnectionsSchema = z.object({
  workspaceId: z.string(),
  entityModels: z.array(z.string()),
});

export const updateWorkspaceModelConnections = async (formData: FormData) => {
  const { tenantId } = await getCurrentSessionUser();
  const entries = [...formData.entries()];

  const entityModels = entries.reduce<string[]>((acc, [key, modelId]) => {
    if (key === "entity_model" && typeof modelId === "string") {
      return [...acc, modelId];
    }
    return acc;
  }, []);

  const form = updateConnectionsSchema.safeParse({
    entityModels,
    workspaceId: formData.get("workspaceId"),
  });

  if (!form.success) {
    return {
      errors: form.error.flatten().fieldErrors,
    };
  }

  const workspaceId = form.data.workspaceId;

  await prisma.$transaction(async (tx) => {
    await tx.workspaceModel.deleteMany({
      where: {
        tenantId,
        workspaceId: form.data.workspaceId,
        NOT: {
          modelId: {
            in: form.data.entityModels,
          },
        },
      },
    });

    const existingConnections = await tx.workspaceModel.findMany({
      where: {
        tenantId,
        workspaceId,
      },
    });

    const newConnections = form.data.entityModels.filter((modelId) => {
      return !existingConnections.some(
        (connection) => connection.modelId === modelId,
      );
    });

    return tx.workspaceModel.createMany({
      data: newConnections.map((modelId) => ({
        tenantId,
        workspaceId,
        modelId,
      })),
    });
  });
};
