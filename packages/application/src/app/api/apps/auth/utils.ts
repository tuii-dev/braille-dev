import { Issuer } from "openid-client";

import prisma from "@/lib/prisma";

export const getOIDClient = async (id: string) => {
  const redirect_uri = `${process.env.BASE_URL}/api/apps/auth/oauth-callback`;
  const connectUrl = await getOIDConnectUrl(id);

  const { Client } = await Issuer.discover(connectUrl);

  const app = await prisma.app.findFirst({
    where: {
      id,
    },
    include: {
      appOAuthClientSecret: true,
    },
  });

  if (!app) {
    throw new Error("No app found");
  }

  if (!app.appOAuthClientSecret) {
    throw new Error("No client secret found");
  }

  return new Client({
    client_id: app.appOAuthClientSecret.clientId,
    client_secret: app.appOAuthClientSecret.clientSecret,
    redirect_uris: [redirect_uri],
  });
};

export const getApplicationById = async (id: string) => {
  const latestVersion = await prisma.appVersion.findFirstOrThrow({
    where: {
      app: {
        id,
      },
    },
    take: 1,
    orderBy: {
      createdAt: "desc",
    },
  });

  return latestVersion.schema;
};

export const getScopesForApplication = async (id: string) => {
  const app: any = await getApplicationById(id);

  const security = app?.security.find((security: any) =>
    Object.entries(security).some(([key]) => key === "OpenID"),
  );

  if (!security) {
    throw new Error("No security found");
  }

  return security.OpenID.join(" ");
};

export const getOIDConnectUrl = async (appId: string) => {
  const app: any = await getApplicationById(appId);

  if (!app) {
    throw new Error("No app found");
  }

  const [_, scheme] =
    Object.entries(app.components.securitySchemes).find(
      ([_, scheme]: any) => scheme.type === "openIdConnect",
    ) ?? [];

  if (!scheme) {
    throw new Error("No OpenID Connect scheme found");
  }

  return (scheme as any).openIdConnectUrl;
};
