"use server";

import { Operation, applyOperation } from "fast-json-patch";
import Ajv from "ajv";
import addFormats from "ajv-formats";

import { optimiseSchema } from "@jptr/braille-integrations";
import { ActionType, Prisma, TaskStatus } from "@jptr/braille-prisma";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import prisma from "@/lib/prisma";
import { sns, PublishCommand } from "@/lib/sns";
import { sqs, SendMessageCommand } from "@/lib/sqs";

export const rerunJob = async (jobId: string, formData: FormData) => {
  const { tenantId } = await getCurrentSessionUser();

  const job = await prisma.dataExtractionJob.findUniqueOrThrow({
    where: {
      id: jobId,
      tenantId,
      status: {
        in: [TaskStatus.FINISHED, TaskStatus.FAILED],
      },
    },
    include: {
      workspaceDocument: true,
      document: true,
      actionExecutions: {
        where: {
          status: {
            notIn: [TaskStatus.FINISHED, TaskStatus.FAILED],
          },
        },
      },
      modelVersion: {
        include: {
          model: {
            include: {
              versions: {
                take: 1,
                orderBy: {
                  createdAt: "desc",
                },
              },
            },
          },
        },
      },
    },
  });

  if (job.actionExecutions.length) {
    throw new Error("Cannot re-run job while action is in progress");
  }

  const prompt = (formData.get("prompt") as string)?.trim();

  const newJob = await prisma.dataExtractionJob.create({
    data: {
      status: TaskStatus.PENDING,
      documentId: job.documentId,
      workspaceDocumentId: job.workspaceDocumentId,
      modelVersionId: job.modelVersion.model.versions[0].id,
      tenantId,
      customPrompts: {
        createMany: {
          data: [prompt].filter(Boolean).map((prompt) => ({
            prompt,
            tenantId,
          })),
        },
      },
    },
  });

  const command = new SendMessageCommand({
    MessageBody: JSON.stringify({
      jobId: newJob.id,
      tenantId: newJob.tenantId,
      documentId: newJob.documentId,
    }),
    QueueUrl: process.env.STRUCTURED_DATA_JOB_QUEUE!,
  });

  await sqs.send(command);
};

export const executeAction = async (jobId: string) => {
  const { user, tenantId } = await getCurrentSessionUser();

  const actionExecution = await prisma.$transaction(async (tx) => {
    const data = await tx.data.findFirstOrThrow({
      where: { dataExtractionJob: { id: jobId }, tenantId },
      include: {
        modelVersion: {
          include: {
            schema: true,
          },
        },
      },
    });

    if (!data.modelVersion.schema.schema) {
      throw new Error("Schema not found");
    }

    if (!ajv.validate(data.modelVersion.schema.schema as any, data.json)) {
      console.error(ajv.errors);
      console.error(ajv.errorsText);
      throw new Error("Data is not in valid state to execute action");
    }

    return await tx.actionExecution.create({
      data: {
        type: ActionType.CREATE,
        status: TaskStatus.PENDING,
        dataExtractionJobId: jobId,
        executedById: user.id,
        tenantId,
      },
    });
  });

  await sns.send(
    new PublishCommand({
      Message: JSON.stringify({
        actionExecutionId: actionExecution.id,
        tenantId,
      }),
      TopicArn: process.env.ACTION_EXECUTION_TOPIC_ARN,
    }),
  );
};

const ajv = new Ajv({ useDefaults: "empty", coerceTypes: true });
ajv.addKeyword("x-primary-key");
ajv.addVocabulary([
  "x-braille-ui",
  "x-entity",
  "x-braille-order",
  "x-foreign-key",
]);
addFormats(ajv);

export const updateExtractedData = async (id: string, patch: Operation) => {
  const { tenantId } = await getCurrentSessionUser();

  return prisma.$transaction(async (tx) => {
    const data = await tx.data.findFirstOrThrow({
      where: { id, tenantId },
      include: {
        modelVersion: {
          include: {
            schema: true,
          },
        },
      },
    });

    if (!data.modelVersion.schema.schema) {
      throw new Error("Schema not found");
    }

    const updated = applyOperation<Prisma.InputJsonValue>(
      data.json ?? {},
      patch,
      true,
    );

    if (!updated) {
      throw new Error("Invalid patch operation");
    }

    const optimisedSchema = optimiseSchema(
      data.modelVersion.schema.schema as any,
    );

    if (!ajv.validate(optimisedSchema, updated.newDocument)) {
      return {
        errors: ajv.errors,
      };
    }

    return tx.data.update({
      where: {
        id,
        tenantId,
      },
      data: {
        json: updated.newDocument,
      },
    });
  });
};
