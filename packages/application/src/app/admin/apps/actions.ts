"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentSuperAdmin } from "@/lib/getCurrentSessionUser";
import prisma from "@/lib/prisma";

const createAppSchema = z.object({
  name: z.string(),
});

export const createApp = async (data: FormData) => {
  const user = getCurrentSuperAdmin();

  if (!user) {
    throw new Error("User not found");
  }

  const form = createAppSchema.safeParse({
    name: data.get("name"),
  });

  if (!form.success) {
    return {
      errors: form.error.flatten().fieldErrors,
    };
  }

  await prisma.$transaction(async ($tx) => {
    const name = "Braille";

    const existingPublisher = await $tx.appPublisher.findFirst({
      where: {
        name,
      },
    });

    await $tx.app.create({
      data: {
        name: form.data.name,
        appPublisher: existingPublisher
          ? {
              connect: {
                id: existingPublisher.id,
              },
            }
          : {
              create: {
                name,
              },
            },
      },
    });
  });

  revalidatePath(`/admin/apps`);
};
