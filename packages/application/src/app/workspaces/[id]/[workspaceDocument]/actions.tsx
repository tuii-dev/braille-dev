"use server";

import { cache } from "react";
import { JSONSchema7 } from "json-schema";
import { trace } from "@opentelemetry/api";

import prisma from "@/lib/prisma";
import { EntityModel } from "@/lib/model/entities";
import { Prisma } from "@jptr/braille-prisma";
import { getS3UploadSignedUrl } from "@/lib/getS3UploadSignedUrl";

const withTracing = <T extends (...args: any) => any>(
  fn: T,
): ((...args: Parameters<T>) => ReturnType<T>) => {
  return (...args: Parameters<T>) =>
    trace
      .getTracer("braille-application")
      .startActiveSpan(fn.name, async (span) => {
        try {
          return await fn(...args);
        } finally {
          span.end();
        }
      }) as any;
};

export const getWorkspaceDocument = withTracing(
  cache(async function getWorkspaceDocument(
    tenantId: string,
    workspaceDocumentId: string,
  ) {
    const workspaceDocument = await prisma.workspaceDocument.findUnique({
      relationLoadStrategy: "join",
      where: {
        id: workspaceDocumentId,
        tenantId,
      },
      include: {
        workspace: true,
        dataExtractionJobs: {
          where: {
            tenantId,
          },
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            data: true,
            actionExecutions: {
              take: 1,
              orderBy: {
                executedAt: "desc",
              },
              include: {
                outputs: true,
                errors: true,
              },
            },
            modelVersion: {
              include: {
                schema: true,
                model: true,
                appVersionModelVersion: {
                  include: {
                    appVersion: {
                      include: {
                        app: {
                          include: {
                            entityModels: {
                              include: {
                                model: true,
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
            document: {
              include: {
                files: {
                  orderBy: {
                    idx: "asc",
                  },
                },
              },
            },
          },
        },
        document: {
          include: {
            createdBy: true,
            files: {
              orderBy: {
                idx: "asc",
              },
            },
          },
        },
      },
    });

    if (!workspaceDocument) {
      return null;
    }

    const pdfFile = workspaceDocument.document.files.find(
      (file) => file.type === "PDF",
    );

    const thumbnailFile = workspaceDocument.document.files.find(
      (file) => file.type === "PNG",
    );

    const thumbnail = thumbnailFile
      ? getS3UploadSignedUrl(
          `https://${process.env.UPLOADS_HOSTNAME}/${thumbnailFile.key}`,
        )
      : null;

    const pdf = pdfFile
      ? getS3UploadSignedUrl(
          `https://${process.env.UPLOADS_HOSTNAME}/${pdfFile.key}`,
        )
      : null;

    return {
      workspaceDocument,
      thumbnail,
      pdf,
    };
  }),
);

const getEntityView = withTracing(
  async (
    jobJson: any,
    modelVersionSchema: any,
    entityModelIds: {},
    appSchema: Prisma.JsonValue | undefined,
    tenantId: string,
  ) => {
    return new EntityModel(
      jobJson,
      modelVersionSchema as any as JSONSchema7,
      entityModelIds,
      appSchema as any,
    ).loadEntities(tenantId);
  },
);

export const getWorkspaceDocumentWithEntityView = withTracing(
  cache(async function getWorkspaceDocumentWithEntityView(
    tenantId: string,
    workspaceDocumentId: string,
  ) {
    const document = (await getWorkspaceDocument(tenantId, workspaceDocumentId))
      ?.workspaceDocument;

    if (!document) {
      return null;
    }

    const [job] = document.dataExtractionJobs;

    if (!job) {
      return null;
    }

    const appSchema =
      job.modelVersion.appVersionModelVersion?.appVersion?.schema;

    const entityModelIds =
      job.modelVersion.appVersionModelVersion?.appVersion?.app?.entityModels.reduce(
        (acc, cur) => {
          if (!cur.model.name) {
            return acc;
          }

          return {
            ...acc,
            [cur.model.name]: cur.model.id,
          };
        },
        {},
      ) ?? {};

    const entityModel = (
      await getEntityView(
        job.data?.json,
        job.modelVersion.schema.schema,
        entityModelIds,
        appSchema,
        tenantId,
      )
    ).toJSON();

    return {
      ...entityModel,
      id: job.data?.id,
    };
  }),
);
