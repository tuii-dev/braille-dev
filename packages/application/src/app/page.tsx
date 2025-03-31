import { headers } from "next/headers";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import prisma from "@/lib/prisma";
import { Redirect } from "./client";

export default async function Home() {
  headers();
  const { tenantId } = await getCurrentSessionUser();

  const workspace = await prisma.workspace.findFirst({
    where: {
      tenantId,
    },
  });

  if (!workspace) {
    return <Redirect to={`/workspaces/`} />;
  }

  return <Redirect to={`/workspaces/${workspace.id}`} />;
}
