'use server'

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import prisma from "@/lib/prisma";

export type WorkspaceData = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    documents: number;
  };
}

export async function getWorkspaceData(): Promise<{ workspaces: WorkspaceData[]; pinnedIds: string[] }> {
  const { tenantId, user } = await getCurrentSessionUser();

  // Get user preferences from database
  const preferences = await prisma.userPreferences.findFirst({
    where: {
      userId: user.id,
    },
    select: {
      pinnedWorkspaces: true,
      lastModifiedAt: true,
      lastUsedWorkspaceId: true
    }
  });

  const pinnedIds = preferences?.pinnedWorkspaces || [];

  // Get all workspaces with document count
  const workspaces = await prisma.workspace.findMany({
    where: {
      tenantId,
      archived: false,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          documents: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  }) as unknown as WorkspaceData[];

  return {
    workspaces,
    pinnedIds
  };
}

export type Activity = {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  workspaceId?: string;
}

export async function getRecentActivity(): Promise<Activity[]> {
  const { tenantId } = await getCurrentSessionUser();

  // Get workspace activities with more details
  const workspaceActivities = await prisma.workspace.findMany({
    where: {
      tenantId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 10, // Increased to show more activities
    select: {
      id: true,
      name: true,
      color: true,
      description: true,
      archived: true,
      updatedAt: true,
      createdAt: true,
      _count: {
        select: {
          documents: true
        }
      }
    },
  });

  // Transform workspace data into activities
  const activities: Activity[] = [];

  for (const workspace of workspaceActivities) {
    // Check if this is a new workspace (created in last 24 hours)
    if (isWithinLastDay(workspace.createdAt)) {
      activities.push({
        id: `workspace-created-${workspace.id}`,
        type: "workspace_created",
        description: `Workspace "${workspace.name}" was created`,
        createdAt: workspace.createdAt.toISOString(),
        workspaceId: workspace.id,
      });
    }

    // Archive/Unarchive activity
    if (workspace.archived) {
      activities.push({
        id: `workspace-archived-${workspace.id}`,
        type: "workspace_archived",
        description: `Workspace "${workspace.name}" was archived`,
        createdAt: workspace.updatedAt.toISOString(),
        workspaceId: workspace.id,
      });
    }

    // Check for attribute updates (name, color, description)
    if (workspace.updatedAt > workspace.createdAt) {
      activities.push({
        id: `workspace-updated-${workspace.id}`,
        type: "workspace_updated",
        description: `Workspace "${workspace.name}" was updated`,
        createdAt: workspace.updatedAt.toISOString(),
        workspaceId: workspace.id,
      });
    }

    // Document count activity
    if (workspace._count.documents > 0) {
      activities.push({
        id: `workspace-documents-${workspace.id}`,
        type: "workspace_documents",
        description: `${workspace._count.documents} documents in "${workspace.name}"`,
        createdAt: workspace.updatedAt.toISOString(),
        workspaceId: workspace.id,
      });
    }
  }

  // Sort by most recent first and limit to 5 most recent activities
  return activities
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
}

// Helper function to check if a date is within the last 24 hours
function isWithinLastDay(date: Date): boolean {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  return date >= oneDayAgo;
}
