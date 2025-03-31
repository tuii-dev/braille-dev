"use server";

import { getCurrentSuperAdmin } from "@/lib/getCurrentSessionUser";
import { sendBootstrapMessage } from "@/lib/sqs";
import prisma from "@/lib/prisma";

export const bootstrapApp = async (appId: string, tenantId: string) => {
  await getCurrentSuperAdmin();

  await prisma.appConnection.findFirstOrThrow({
    where: {
      tenantId,
      appId,
    },
  });

  await sendBootstrapMessage(tenantId, appId);
};
