import { cache } from "react";
import { getSession } from "@auth0/nextjs-auth0";
import { getCurrentUser } from "./getCurrentUser";
import prisma from "./prisma";

export const getUserPreferences = cache(async () => {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const user = await getCurrentUser(session);
  if (!user) {
    throw new Error("User not found");
  }

  const preferences = await prisma.userPreferences.findUnique({
    where: {
      userId: user.id
    }
  });

  return {
    pinnedWorkspaces: preferences?.pinnedWorkspaces || [],
    lastUsedWorkspaceId: preferences?.lastUsedWorkspaceId || null,
    lastModifiedAt: preferences?.lastModifiedAt || new Date(),
    id: preferences?.id || crypto.randomUUID(),
    userId: user.id
  };
});
