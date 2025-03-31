"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentSuperAdmin } from "@/lib/getCurrentSessionUser";
import { publishApp } from "@/lib/publish-app";

const newVersionSchema = z.object({
  appId: z.string(),
  value: z.string(),
});

export const createNewVersion = async (
  appId: string,
  value: string | undefined,
) => {
  await getCurrentSuperAdmin();

  const form = newVersionSchema.safeParse({
    appId,
    value,
  });

  if (!form.success) {
    return {
      errors: form.error.flatten().fieldErrors,
    };
  }

  await publishApp(form.data.appId, JSON.parse(form.data.value));

  revalidatePath(`/admin/apps/${form.data.appId}`);
};
