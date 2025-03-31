"use server";

import { z } from "zod";
import { createHash } from "crypto";

import prisma from "@/lib/prisma";
import getCurrentAdminUser from "@/lib/getAdminUser";
import { TenantRole, User } from "@jptr/braille-prisma";
import { getAccessToken } from "@/lib/auth0/getAuth0ManagementToken";
import { createUser } from "@/lib/auth0/createUser";
import { sendInviteEmail } from "@/lib/auth0/sendInviteEmail";

/**
 * UPDATE ORGANISATION NAME
 */

const updateTenant = z.object({
  name: z.string().min(1).max(255),
});

export const updateOrganisationName = async (formData: FormData) => {
  const { tenantId, isAdmin } = await getCurrentAdminUser();

  if (!isAdmin) {
    return {
      errors: {
        form: ["Only admins can invite users to the organisation"],
      },
    };
  }

  const form = updateTenant.safeParse({
    name: formData.get("name"),
  });

  if (!form.success) {
    console.error(form.error.flatten());
    return {
      errors: form.error.flatten().fieldErrors,
    };
  }

  await prisma.tenant.update({
    where: {
      id: tenantId,
    },
    data: {
      name: form.data.name,
    },
  });
};

/**
 * INVITE USER
 */

const inviteUserAction = z.object({
  email: z.string().email().trim(),
  name: z.string().optional(),
});

export const inviteUser = async (formData: FormData) => {
  const { tenantId, isAdmin } = await getCurrentAdminUser();

  if (!isAdmin) {
    console.error("Only admins can invite users to the organisation");
    return {
      error: {
        form: ["Only admins can invite users to the organisation"],
      },
    };
  }

  const form = inviteUserAction.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
  });

  if (!form.success) {
    console.error(form.error.flatten());
    return {
      error: form.error.formErrors.fieldErrors,
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: form.data.email,
    },
  });

  if (existingUser) {
    console.error("CANNOT INVITE USER, USER ALREADY EXISTS");
    return {
      error: {
        form: ["User already belongs to an organisation"],
      },
    };
  }

  let user: User;
  try {
    user = await prisma.$transaction(async (tx) => {
      const avatar = `https://gravatar.com/avatar/${createHash("sha256")
        .update(form.data.email)
        .digest("hex")}`;

      const u = await tx.user.create({
        data: {
          avatar,
          name: form.data.name,
          email: form.data.email,
          tenants: {
            connect: {
              id: tenantId,
            },
          },
        },
      });

      const response = await createUser({ email: form.data.email });

      if (response.status !== 201) {
        throw new Error(
          `Could not create user: ${response.status} ${response.statusText}`,
        );
      }

      return u;
    });
  } catch (error) {
    console.error(error);
    return {
      error: {
        form: ["Could not create user"],
      },
    };
  }

  try {
    await sendInviteEmail({
      email: form.data.email,
      username: user.name || form.data.email,
      type: "invite",
    });
  } catch (e) {
    console.error(e);
    return {
      error: {
        form: ["User was created but failed to send invite email"],
      },
    };
  }
};

const resendInviteAction = z.object({
  email: z.string().email().trim(),
});

const sendPasswordReset = async ({
  email,
  type,
}: {
  email: string;
  type: "invite" | "reset";
}) => {
  const accessToken = await getAccessToken();

  const res = await fetch(
    `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/tickets/password-change${type === "invite" ? "#type=invite" : ""}`,
    {
      method: "POST",
      redirect: "follow",
      headers: new Headers({
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      }),
      body: JSON.stringify({
        email: email,
        connection_id: process.env.AUTH0_CONNECTION_ID,
        client_id: process.env.AUTH0_CLIENT_ID,
        result_url: process.env.APP_DOMAIN,
        mark_email_as_verified: true,
        includeEmailInRedirect: true,
      }),
    },
  );

  if (res.status !== 201) {
    throw new Error(`Could not send invite: ${res.status} ${await res.text()}`);
  }
};

export const resendInvite = async (formData: FormData) => {
  const { isAdmin } = await getCurrentAdminUser();

  if (!isAdmin) {
    console.error("Only admins can send invitations");
    return {
      errors: {
        form: ["Only admins can send invitations"],
      },
    };
  }

  const form = resendInviteAction.safeParse({
    email: formData.get("email"),
  });

  if (!form.success) {
    console.error(form.error.flatten());
    return {
      errors: form.error.flatten().fieldErrors,
    };
  }

  await sendPasswordReset({ email: form.data.email, type: "invite" });
};

const updateRoleSchema = z.object({
  userId: z.string(),
  role: z.union([z.nativeEnum(TenantRole), z.enum(["USER"])]),
});

type FormErrors<Fields extends string> = {
  errors: {
    [K in Fields]?: string[] | undefined;
  };
};

type SuccessState = { status: "success" };

type UpdateRoleState = FormErrors<"userId" | "role" | "form"> | SuccessState;

export const updateRole = async (
  formData: FormData,
): Promise<UpdateRoleState> => {
  const { tenantId, user, isAdmin } = await getCurrentAdminUser();

  if (!isAdmin) {
    return {
      errors: {
        form: ["Only admins can manage users of this organisation"],
      },
    };
  }

  const form = updateRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (!form.success) {
    console.error(form.error.flatten());
    return {
      errors: form.error.flatten().fieldErrors,
    };
  }

  if (isAdmin && form.data.userId === user.id) {
    return {
      errors: {
        form: ["Admins cannot change their own role"],
      },
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.userTenantRole.deleteMany({
      where: {
        userId: {
          equals: form.data.userId,
        },
        tenantId: {
          equals: tenantId,
        },
      },
    });

    if (form.data.role !== "USER") {
      await tx.userTenantRole.create({
        data: {
          role: form.data.role,
          tenant: {
            connect: {
              id: tenantId,
            },
          },
          user: {
            connect: {
              id: form.data.userId,
            },
          },
        },
      });
    }
  });

  return {
    status: "success",
  };
};
