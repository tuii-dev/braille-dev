import { redirect } from "next/navigation";
import { cache } from "react";
import { trace } from "@opentelemetry/api";
import type { Session } from "@auth0/nextjs-auth0";
import prisma from "@/lib/prisma";
import { TenantRole } from "@jptr/braille-prisma";
import { logger } from "@/logger";

const getUserByEmail = cache((email: string) => {
  return prisma.user.findUnique({
    relationLoadStrategy: "join",
    include: { tenants: true, userTenantRoles: true, userSystemRoles: true },
    where: {
      email,
    },
  });
});

export const getCurrentUser = cache(
  async (session: Session | null | undefined) => {
    return trace
      .getTracer("braille-application")
      .startActiveSpan("getCurrentUser", async (span) => {
        try {
          if (!session) {
            logger.info(
              "getCurrentUser, No session found, redirecting to login",
            );
            return redirect("/api/auth/login");
          }

          if (!session.user.email || typeof session.user.email !== "string") {
            throw new Error("No email found for user of current session");
          }

          const email: string = session.user.email;

          const user = await getUserByEmail(email);

          if (user) {
            return user;
          }

          if (session.user["braille/roles"]?.includes("SUPERADMIN")) {
            logger.info(`BOOTSTRAPING SUPERADMIN USER: ${email}`);
            const user = await prisma.user.create({
              relationLoadStrategy: "join",
              include: {
                tenants: true,
                userTenantRoles: true,
              },
              data: {
                email,
                tenants: {
                  create: {
                    name: "My Documents",
                  },
                },
              },
            });

            await prisma.userTenantRole.create({
              data: {
                role: TenantRole.ADMIN,
                tenantId: user.tenants[0].id,
                userId: user.id,
              },
            });

            return prisma.user.findUniqueOrThrow({
              relationLoadStrategy: "join",
              include: {
                tenants: true,
                userTenantRoles: true,
                userSystemRoles: true,
              },
              where: {
                email,
              },
            });
          }

          if (!user) {
            throw new Error("User not found");
          }

          return user;
        } finally {
          span.end();
        }
      });
  },
);