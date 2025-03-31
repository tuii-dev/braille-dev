"use server";

import prisma from "@jptr/braille-prisma/prisma";
import { MimeType } from "@jptr/braille-prisma";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { getS3UploadSignedUrl } from "@/lib/getS3UploadSignedUrl";

async function getTenantId() {
  const { user } = await getCurrentSessionUser();
  if (user && user.tenants.length > 0) {
    const tenantId = user.tenants[0].id;
    return tenantId;
  }
}

type SearchType = "all" | "adjacent";

type WorkspaceDocumentFetchParams = {
  params: any;
  page: number;
  pageSize: number;
  search: string;
  from: string;
  to: string;
  uploader: string;
  searchType: SearchType;
  currentDocumentId?: string;
}

export async function fetchWorkspaceDocuments({
  params,
  page,
  pageSize,
  search,
  from,
  to,
  uploader,
  searchType,
  currentDocumentId,
}: WorkspaceDocumentFetchParams) {
  if (searchType === "adjacent") {
    if (!currentDocumentId) {
      throw new Error("currentDocumentId is required for adjacent search");
    }
    return fetchAdjacentWorkspaceDocuments(
      params,
      currentDocumentId,
      search,
      from,
      to,
      uploader,
    );
  }

  return fetchWorkspace(params, page, pageSize, search, from, to, uploader);
}

export async function fetchAdjacentWorkspaceDocuments(
  params: any,
  currentDocumentId: string,
  search: string,
  from: string,
  to: string,
  uploader: string,
) {
  const tenantId = await getTenantId();
  const _search = search ? search : "";

  const workspace = await prisma.workspace.findFirst({
    where: {
      id: params.id,
      tenantId,
    },
    include: {
      documents: {
        where: {
          ...(from && to
            ? {
                createdAt: {
                  gte: from,
                  lte: to,
                },
              }
            : {}),
          ...(_search
            ? {
                document: {
                  name: { contains: _search, mode: "insensitive" },
                },
              }
            : {}),
          ...(uploader ? { createdById: uploader } : {}),
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          document: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!workspace) {
    return { prev: null, next: null };
  }

  const documents = workspace.documents;
  const currentIndex = documents.findIndex(
    (doc) => doc.id === currentDocumentId,
  );

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  const prev =
    currentIndex < documents.length - 1 ? documents[currentIndex + 1] : null;
  const next = currentIndex > 0 ? documents[currentIndex - 1] : null;

  return {
    prev: prev ? { id: prev.id, tenantId, document: prev.document } : null,
    next: next ? { id: next.id, tenantId, document: next.document } : null,
  };
}

export async function fetchWorkspace(
  params: any,
  page: number,
  pageSize: number,
  search: string,
  from: string,
  to: string,
  uploader: string,
) {
  const _search = search ? search : "";
  const tenantId = await getTenantId();
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: params.id,
      tenantId,
    },
    include: {
      documents: {
        where: {
          ...(from && to
            ? {
                createdAt: {
                  gte: from,
                  lte: to,
                },
              }
            : {}),
          ...(_search
            ? {
                document: {
                  name: { contains: _search, mode: "insensitive" },
                },
              }
            : {}),
          ...(uploader ? { createdById: uploader } : {}),
        },
        take: pageSize,
        skip: (page - 1) * pageSize,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          createdBy: true,
          dataExtractionJobs: {
            include: {
              actionExecutions: {
                take: 1,
                orderBy: {
                  executedAt: "desc",
                },
                include: {
                  outputs: {
                    where: {
                      name: "$link",
                    },
                  },
                },
              },
            },
            where: {
              tenantId,
            },
            take: 1,
            orderBy: {
              createdAt: "desc",
            },
          },
          document: {
            include: {
              files: {
                where: {
                  type: MimeType.PNG,
                },
                orderBy: {
                  idx: "asc",
                },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  const docCount = await prisma.workspaceDocument.count({
    where: {
      workspaceId: workspace?.id,
      ...(from && to
        ? {
            createdAt: {
              gte: from,
              lte: to,
            },
          }
        : {}),
      ...(_search
        ? {
            document: {
              name: { contains: _search, mode: "insensitive" },
            },
          }
        : {}),
      ...(uploader ? { createdById: uploader } : {}),
    },
  });

  const workspaceUsers = await prisma.user.findMany({
    where: {
      workspaceDocument: {
        some: {
          workspaceId: workspace?.id,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const documentsWithThumbnails = workspace?.documents.map((doc) => ({
    ...doc,
    thumbnail: doc.document.files[0]?.key
      ? getS3UploadSignedUrl(
          `https://${process.env.UPLOADS_HOSTNAME}/${doc.document.files[0].key}`,
        )
      : null,
  }));

  return {
    workspace: workspace
      ? {
          ...workspace,
          documents: documentsWithThumbnails,
        }
      : null,
    docCount: docCount,
    workspaceUsers: workspaceUsers,
  } as const;
}
