import { notFound } from "next/navigation";

import { getCurrentSessionUser } from "./getCurrentSessionUser";

export default async function getCurrentAdminUser() {
  const { user, isAdmin, tenantId } = await getCurrentSessionUser();

  if (!isAdmin) {
    return notFound();
  }

  return { user, tenantId, isAdmin };
}
