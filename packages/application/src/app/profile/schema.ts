import { z } from "zod";

export const UpdateUserSchema = z.object({
  name: z.string().trim().min(1, "Your name cannot be empty").max(255),
});

export type UpdateUserType = z.infer<typeof UpdateUserSchema>;
