import { NextRequest, NextResponse } from "next/server";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { tenantId } = await getCurrentSessionUser();
    const formData = await request.formData();
    const workspaceId = formData.get("workspaceId") as string;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID is required" },
        { status: 400 }
      );
    }

    // Get current preferences from cookies
    const cookieStore = cookies();
    const preferencesStr = cookieStore.get("workspace-state")?.value;
    const preferences = preferencesStr
      ? JSON.parse(preferencesStr)
      : { state: { hiddenIds: [] } };

    // Remove the workspace ID from hidden IDs
    preferences.state.hiddenIds = (preferences.state.hiddenIds || []).filter(
      (id: string) => id !== workspaceId
    );

    // Update the cookie with new preferences
    cookieStore.set("workspace-state", JSON.stringify(preferences), {
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unhiding workspace:", error);
    return NextResponse.json(
      { error: "Failed to unhide workspace" },
      { status: 500 }
    );
  }
}
