"use server";

import { z } from "zod";

import prisma from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import getCurrentAdminUser from "@/lib/getAdminUser";

const updateConfigurationSchema = z.object({
  connectionId: z.string(),
  settings: z.array(z.tuple([z.string(), z.string()])),
});

export const updateConfiguration = async (data: FormData) => {
  const { tenantId, isAdmin } = await getCurrentSessionUser();

  if (!isAdmin) {
    return {
      errors: {
        form: ["Only admins can update configurations"],
      },
    };
  }

  const settings = [...data.entries()].reduce<[string, FormDataEntryValue][]>(
    (acc, [key, value]) => {
      const match = /^setting__(.+)$/g.exec(key);

      if (!match) {
        return acc;
      }

      return [...acc, [match[1], value]];
    },
    [],
  );

  const form = updateConfigurationSchema.safeParse({
    connectionId: data.get("connectionId"),
    settings,
  });

  if (!form.success) {
    console.error(form.error.flatten().fieldErrors);
    return {
      errors: form.error.flatten().fieldErrors,
    };
  }

  await prisma.$transaction(async ($tx) => {
    await $tx.appConnectionSetting.deleteMany({
      where: {
        connectionId: form.data.connectionId,
      },
    });

    return await $tx.appConnectionSetting.createMany({
      data: form.data.settings.map(([key, value]) => ({
        key,
        value: value as string,
        connectionId: form.data.connectionId,
        tenantId,
      })),
    });
  });
};

const revokeConnectionSchema = z.object({
  connectionId: z.string(),
});

export const revokeConnection = async (formData: FormData) => {
  const { tenantId, isAdmin } = await getCurrentAdminUser();

  if (!isAdmin) {
    return {
      errors: {
        form: ["Only admins can update configurations"],
      },
    };
  }

  const form = revokeConnectionSchema.safeParse({
    connectionId: formData.get("connectionId"),
  });

  if (!form.success) {
    console.error(form.error.flatten().fieldErrors);
    return {
      errors: form.error.flatten().fieldErrors,
    };
  }

  await prisma.appConnection.delete({
    where: {
      tenantId,
      id: form.data.connectionId,
    },
  });
};
