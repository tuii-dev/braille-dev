"use server";

import { MODEL_SCHEMA_VALIDATOR } from "@jptr/braille-integrations";
import { Operation, applyOperation } from "fast-json-patch";
import { JSONSchema7 } from "json-schema";

import prisma from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import getCurrentAdminUser from "@/lib/getAdminUser";

export const getModelVersionSchema = async (modelId: string) => {
  const { tenantId } = await getCurrentSessionUser();

  const [current] = await prisma.modelVersion.findMany({
    where: {
      modelId,
      tenantId,
    },
    include: {
      schema: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 1,
  });

  return current.schema.schema as JSONSchema7;
};

/**
 * Update a node in a definition
 */
export const createNewModelVersion = async (
  modelId: string,
  patches: Operation[],
) => {
  const { tenantId } = await getCurrentAdminUser();

  return prisma.$transaction(async (tx) => {
    const current = await tx.modelVersion.findFirst({
      where: {
        modelId,
        tenantId,
      },
      include: {
        schema: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const schema = patches.reduce(
      (acc, patch) => applyOperation(acc, patch, true).newDocument,
      current ? current.schema.schema! : {},
    );

    const result = await MODEL_SCHEMA_VALIDATOR.safeParseAsync(schema);

    if (result.error) {
      console.error(result.error);
      return [{ error: result.error.errors[0].message }] as const;
    }

    const nextVersion = await tx.modelVersion.create({
      include: {
        schema: true,
      },
      data: {
        model: {
          connect: { id: modelId },
        },
        tenant: {
          connect: {
            id: tenantId,
          },
        },
        schema: {
          create: {
            tenantId,
            schema,
          },
        },
      },
    });

    return [, nextVersion.schema.schema as JSONSchema7] as const;
  });
};
