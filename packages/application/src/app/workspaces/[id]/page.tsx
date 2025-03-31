import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";

export default async function Page(params: any) {
  const { tenantId } = await getCurrentSessionUser();

  const workspace = await prisma.workspace.findFirst({
    relationLoadStrategy: "join",
    where: {
      id: params.id,
      tenantId,
    },
  });

  if (!workspace) {
    return redirect("/workspaces");
  }

  return null;
}
