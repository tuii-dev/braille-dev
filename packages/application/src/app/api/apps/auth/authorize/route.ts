import { getOIDClient, getScopesForApplication } from "../utils";

export const GET = async (request: Request) => {
  const redirect_uri = `${process.env.BASE_URL}/api/apps/auth/oauth-callback`;

  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get("applicationId");

  if (!applicationId) {
    throw new Error("No application defined");
  }

  const scope = await getScopesForApplication(applicationId);
  const state = JSON.stringify({ applicationId });
  const client = await getOIDClient(applicationId);

  const url = client.authorizationUrl({
    redirect_uri,
    /**
     * TODO: Implement CSRF validation
     */
    state,
    scope,
  });

  return Response.redirect(url);
};
