import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";

export async function GET() {
  try {
    const { user } = await getCurrentSessionUser();
    if (!user) {
      console.error(
        `❌ [${new Date().toISOString()}] GET /api/users/preferences: No user found`,
      );
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user preferences from the database
    const preferences = await prisma.userPreferences.findUnique({
      where: {
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        pinnedWorkspaces: preferences?.pinnedWorkspaces || [],
        lastUsedWorkspaceId: preferences?.lastUsedWorkspaceId || null,
        lastModifiedAt: preferences?.lastModifiedAt || new Date(),
      },
    });
  } catch (error) {
    console.error(
      `❌ [${new Date().toISOString()}] GET /api/users/preferences: Error:`,
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { user } = await getCurrentSessionUser();
    if (!user) {
      console.error(
        `❌ [${new Date().toISOString()}] PATCH /api/users/preferences: No user found`,
      );
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { pinnedWorkspaces, lastUsedWorkspaceId } = body;

    if (pinnedWorkspaces && !Array.isArray(pinnedWorkspaces)) {
      console.error(
        `❌ [${new Date().toISOString()}] PATCH /api/users/preferences: Invalid pinnedWorkspaces data`,
        {
          received: pinnedWorkspaces,
        },
      );
      return NextResponse.json(
        { error: "Invalid pinnedWorkspaces data" },
        { status: 400 },
      );
    }

    const updateData = {
      ...(pinnedWorkspaces !== undefined && { pinnedWorkspaces }),
      ...(lastUsedWorkspaceId !== undefined && { lastUsedWorkspaceId }),
      lastModifiedAt: new Date(),
    };

    const updated = await prisma.userPreferences.upsert({
      where: {
        userId: user.id,
      },
      create: {
        userId: user.id,
        ...updateData,
      },
      update: updateData,
    });
    return NextResponse.json({
      success: true,
      data: {
        pinnedWorkspaces: updated.pinnedWorkspaces,
        lastUsedWorkspaceId: updated.lastUsedWorkspaceId,
        lastModifiedAt: updated.lastModifiedAt,
      },
    });
  } catch (error) {
    console.error(
      `❌ [${new Date().toISOString()}] PATCH /api/users/preferences: Error:`,
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
