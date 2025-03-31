import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { tenantId } = await getCurrentSessionUser();
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 10;

    // Get workspace activities
    const workspaceActivities = await prisma.workspace.findMany({
      where: {
        tenantId,
        archived: false,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit,
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Transform workspace data into activities
    const activities = workspaceActivities.map((workspace) => ({
      id: `workspace-${workspace.id}`,
      type: "workspace",
      description: `Workspace "${workspace.name}" was updated`,
      createdAt: workspace.updatedAt,
      workspaceId: workspace.id,
    }));

    // Sort activities by date
    activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}
