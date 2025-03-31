"use server";

import { z } from "zod";

import prisma from "@/lib/prisma";
import { getSystemAdmin } from "@/lib/getCurrentSessionUser";
import { Prisma } from "@jptr/braille-prisma";

const SystemAdminCreateTenantSchema = z.object({
  tenantName: z.string().trim().min(1, "Must provide a tenant name"),
  adminUserEmail: z.string().email(),
  adminUserName: z
    .string()
    .trim()
    .min(1, "Must provide a name for the tenant's admin user"),
});

export const systemAdminCreateTenant = async (formData: FormData) => {
  try {
    await getSystemAdmin();

    const form = SystemAdminCreateTenantSchema.safeParse({
      tenantName: formData.get("tenantName"),
      adminUserEmail: formData.get("adminUserEmail"),
      adminUserName: formData.get("adminUserName"),
    });

    if (!form.success) {
      return { error: form.error.formErrors.fieldErrors };
    }

    const tenant = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        include: {
          users: true,
        },
        data: {
          name: form.data.tenantName,
          users: {
            create: {
              email: form.data.adminUserEmail,
              name: form.data.adminUserName,
            },
          },
        },
      });

      await tx.userTenantRole.create({
        data: {
          role: "ADMIN",
          user: {
            connect: {
              id: tenant.users[0].id,
            },
          },
          tenant: {
            connect: {
              id: tenant.id,
            },
          },
        },
      });

      return tenant;
    });

    return tenant;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return {
          error: {
            form: [
              "Cannot create tenant with the admin user. User already belongs to an organisation.",
            ],
          },
        };
      }
    }

    return { error: { form: ["Something went wrong"] } };
  }
};
