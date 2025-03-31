"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import prisma from "@/lib/prisma";
import { logger } from "@/logger";

import { UpdateUserSchema } from "./schema";

export const updateUser = async (formData: FormData) => {
  const user = await getCurrentSessionUser();

  const form = UpdateUserSchema.safeParse({
    name: formData.get("name") as string,
  });

  if (!form.success) {
    return {
      error: {
        name: form.error.flatten().fieldErrors.name,
      },
    };
  }

  try {
    await prisma.user.update({
      where: {
        id: user.user.id,
      },
      data: {
        name: form.data.name,
      },
    });
  } catch (err) {
    logger.error(err);

    return {
      error: {
        form: "An error occurred. Please try again.",
      },
    };
  }
};
