import { cache } from "react";

import { getSession } from "@auth0/nextjs-auth0";
import { notFound } from "next/navigation";

import { SystemRole, TenantRole } from "@jptr/braille-prisma";

import { getCurrentUser } from "./getCurrentUser";

const loadSession = cache(async () => await getSession());

export const getCurrentSessionUser = cache(async () => {
  const session = await loadSession();
  const user = await getCurrentUser(session);
  const isAdmin = user.userTenantRoles.some(
    (role) => role.role === TenantRole.ADMIN,
  );
  const isSystemAdmin = user.userSystemRoles.some(
    (role) => role.role === SystemRole.ADMIN,
  );

  return {
    user,
    tenantId: user.tenants[0]?.id,
    isAdmin,
    isSystemAdmin,
    isSuperAdmin: session?.user["braille/roles"]?.includes("SUPERADMIN"),
  };
});

export const getCurrentSuperAdmin = async () => {
  const res = await getCurrentSessionUser();

  if (!res.isSuperAdmin) {
    return notFound();
  }

  return res;
};

export const getSystemAdmin = async () => {
  const res = await getCurrentSessionUser();

  if (!res.isSuperAdmin && !res.isSystemAdmin) {
    return notFound();
  }

  return res;
};