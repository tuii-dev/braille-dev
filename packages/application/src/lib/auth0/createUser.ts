import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

import { getManagementClient } from "./client";

export const createUser = async ({ email }: { email: string }) => {
  const client = getManagementClient();

  return client.users.create({
    email,
    password: await bcrypt.hash(randomUUID(), 8),
    connection: "Username-Password-Authentication",
    email_verified: false,
    verify_email: false,
  });
};
