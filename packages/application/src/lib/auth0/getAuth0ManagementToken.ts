import { redis } from "@/lib/redis";
import { logger } from "@/logger";

const AUTH0_MANAGEMENT_ACCESS_TOKEN_KEY = "auth0-access-token";

export async function getAccessToken() {
  // const currentToken = await redis().get(AUTH0_MANAGEMENT_ACCESS_TOKEN_KEY);

  // if (currentToken) {
  //   console.log("AUTH0 ACCESS TOKEN CACHE HIT");
  //   return currentToken;
  // } else {
  //   console.log("AUTH0 ACCESS TOKEN CACHE MISS");
  // }

  const response = await fetch(
    `https://${process.env.AUTH0_MANAGEMENT_DOMAIN}/oauth/token`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: `https://${process.env.AUTH0_MANAGEMENT_DOMAIN}/api/v2/`,
      }),
    },
  );

  if (!response.ok) {
    logger.info({
      message: "Failed to get auth0 management token",
      json: await response.json(),
    });
    throw response;
  }

  const { access_token } = await response.json();

  await redis().setex(
    AUTH0_MANAGEMENT_ACCESS_TOKEN_KEY,
    60 * 60 * 12,
    access_token,
  );

  return access_token;
}
