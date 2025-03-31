import { cache } from "react";
import prisma from "@/lib/prisma";
import { getCurrentSessionUser } from "./getCurrentSessionUser";

export const getTenantWorkspaces = cache(async (tenantId: string) => {
  // Get all non-archived workspaces
  const workspaces = await prisma.workspace.findMany({
    where: {
      tenantId,
      archived: false,
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  return workspaces;
});
