import { NextRequest } from "next/server";
import { Http2ServerRequest } from "http2";
import { JSONPath } from "@astronautlabs/jsonpath";

import { AppConnectionSettingType } from "@jptr/braille-prisma";

import prisma from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";

import {
  getApplicationById,
  getOIDClient,
  getScopesForApplication,
} from "../utils";
import { sendBootstrapMessage } from "@/lib/sqs";

export const GET = async (request: NextRequest) => {
  const redirect_uri = `${process.env.BASE_URL}/api/apps/auth/oauth-callback`;
  const { searchParams } = new URL(request.url);

  const state = searchParams.get("state");

  if (!state) {
    throw new Error("No state provided");
  }

  const { applicationId } = JSON.parse(state);

  if (!applicationId) {
    throw new Error("No applicationId defined");
  }

  const integration: any = await getApplicationById(applicationId);
  const scope = await getScopesForApplication(applicationId);
  const { user, tenantId } = await getCurrentSessionUser();

  const client = await getOIDClient(applicationId);

  const params = client.callbackParams(
    request as unknown as Http2ServerRequest,
  );

  const tokenSet = await client.callback(redirect_uri, params, {
    response_type: "code",
    state,
    scope,
  });

  if (!tokenSet.access_token) {
    throw new Error("No access token found in token set");
  }

  if (!tokenSet.refresh_token) {
    throw new Error("No refresh token found in token set");
  }

  if (typeof tokenSet.expires_at !== "number") {
    throw new Error("No expires in found in token set");
  }

  const fieldsSource = {
    id_token_claims: tokenSet.claims(),
  };

  const data = integration["x-braille"].configuration.arguments.computed?.map(
    (field: any) => {
      return {
        type: AppConnectionSettingType.COMPUTED,
        key: field.name,
        value: JSONPath.query(fieldsSource, field.value)[0] ?? null,
        tenantId,
      };
    },
  );

  await prisma.appConnection.create({
    data: {
      app: {
        connect: {
          id: applicationId,
        },
      },
      settings: {
        createMany: {
          data,
        },
      },
      oauthTokenset: {
        create: {
          accessToken: tokenSet.access_token,
          refreshToken: tokenSet.refresh_token,
          expiresAt: tokenSet.expires_at,
          scope: tokenSet.scope,
          createdById: user.id,
          tenantId: tenantId,
        },
      },
      tenant: {
        connect: {
          id: tenantId,
        },
      },
    },
  });

  await sendBootstrapMessage(tenantId, applicationId);

  return Response.redirect(`${process.env.BASE_URL}/apps`);
};
