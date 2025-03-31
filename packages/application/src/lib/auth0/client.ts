import { AuthenticationClient, ManagementClient } from "auth0";

let management: ManagementClient;

export const getManagementClient = () => {
  if (!management) {
    management = new ManagementClient({
      domain: process.env.AUTH0_MANAGEMENT_DOMAIN!,
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    });
  }

  return management;
};

let auth: AuthenticationClient;

export const getDBClient = () => {
  if (!auth) {
    auth = new AuthenticationClient({
      domain: process.env.AUTH0_MANAGEMENT_DOMAIN!,
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    });
  }

  return auth;
};
