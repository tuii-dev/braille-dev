"use server";

import { S3Client } from "@aws-sdk/client-s3";
import { MimeType } from "@jptr/braille-prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import prisma from "@/lib/prisma";
import { Upload } from "@aws-sdk/lib-storage";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

type ExtensionMap = Record<MimeType, string>;

const EXTENSION_MAP: ExtensionMap = {
  [MimeType.PDF]: "pdf",
  [MimeType.PNG]: "png",
  [MimeType.JPEG]: "jpg",
};

const getType = (mimeType: string): MimeType => {
  switch (mimeType) {
    case "image/jpg":
    case "image/jpeg":
      return MimeType.JPEG;
    case "image/png":
      return MimeType.PNG;
    case "application/pdf":
      return MimeType.PDF;
    default:
      throw new Error(`Unsupported mimeType: ${mimeType}`);
  }
};

const getExtension = (mimeType: string): string => {
  return EXTENSION_MAP[getType(mimeType)];
};

export async function updateDocumentsToWorkspace(
  workspaceId: string,
  formData: FormData,
) {
  const { user, tenantId } = await getCurrentSessionUser();
  const files: File[] = [];

  formData.forEach((value) => {
    if (value instanceof File) {
      files.push(value);
    }
  });

  if (files.length > 50) {
    throw new Error("Maximum number of files of 50 exceeded");
  }

  const s3 = new S3Client({
    region: process.env.AWS_DEFAULT_REGION,
    forcePathStyle: true,
  });

  const uploads = files.map(async (file) => {
    const type = getType(file.type);
    const key = `${uuidv4()}.${getExtension(file.type)}`;

    return await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.findUniqueOrThrow({
        where: {
          id: workspaceId,
          tenantId,
        },
        include: {
          models: {
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

      const workspaceDocument = await tx.workspaceDocument.create({
        include: {
          workspace: true,
          dataExtractionJobs: true,
        },
        data: {
          tenant: {
            connect: {
              id: tenantId,
            },
          },
          createdBy: {
            connect: {
              id: user.id,
            },
          },
          workspace: {
            connect: {
              id: workspaceId,
            },
          },
          document: {
            create: {
              name: file.name,
              createdById: user.id,
              tenantId,
              files: {
                createMany: {
                  data: [
                    {
                      tenantId,
                      key,
                      type,
                    },
                  ],
                },
              },
            },
          },
        },
      });

      await tx.dataExtractionJob.createMany({
        data: workspace.models.reduce<
          Array<{
            tenantId: string;
            documentId: string;
            workspaceDocumentId: string;
            modelVersionId: string;
          }>
        >((acc, workspaceModel) => {
          const [version] = workspaceModel.model.versions;

          if (!version) {
            return acc;
          }

          return [
            ...acc,
            {
              tenantId,
              documentId: workspaceDocument.documentId,
              workspaceDocumentId: workspaceDocument.id,
              modelVersionId: version.id,
            },
          ];
        }, []),
      });

      const upload = new Upload({
        client: s3,
        params: {
          Bucket: process.env.S3_UPLOAD_BUCKET,
          Body: file.stream() as any,
          Key: key,
          ContentType: file.type,
        },
      });

      await upload.done();

      return { workspace, document: workspaceDocument };
    });
  });

  const documents = await Promise.all(uploads);

  const last = documents[documents.length - 1];

  if (last) {
    redirect(`/workspaces/${last.workspace.id}/${last.document.id}`);
    // send an event to trigger the job
  }
}
