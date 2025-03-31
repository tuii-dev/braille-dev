"use server";

import { SES } from "@aws-sdk/client-ses";
import { render } from "@react-email/components";
import { Invite } from "@jptr/braille-emails";

import getCurrentAdminUser from "../getAdminUser";
import { getAccessToken } from "./getAuth0ManagementToken";

export const sendInviteEmail = async ({
  email,
  type,
  username,
}: {
  email: string;
  username: string;
  type: "invite" | "reset";
}) => {
  const inviter = await getCurrentAdminUser();
  const invitedByEmail = inviter.user.email;
  const invitedByUsername = inviter.user.name;
  const tenantName = inviter.user.tenants[0].name;

  const ses = new SES({
    region: process.env.AWS_REGION,
  });

  const accessToken = await getAccessToken();

  const res = await fetch(
    `https://${process.env.AUTH0_DOMAIN}/api/v2/tickets/password-change${type === "invite" ? "#type=invite" : ""}`,
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
        mark_email_as_verified: true,
        includeEmailInRedirect: true,
      }),
    },
  );

  if (res.status !== 201) {
    throw new Error(`Could not send invite: ${res.status} ${await res.text()}`);
  }

  const { ticket } = await res.json();

  const emailHtml = await render(
    <Invite
      email={email}
      url={ticket}
      username={username}
      invitedByEmail={invitedByEmail}
      invitedByUsername={invitedByUsername}
      tenantName={tenantName}
    />,
  );

  const sender =
    process.env.EMAIL_FROM_ADDRESS || `noreply@${process.env.APP_DOMAIN}`;

  await ses.sendEmail({
    Source: `Braille <${sender}>`,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: emailHtml,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: invitedByUsername
          ? `${invitedByUsername} has added you to their team on Braille`
          : `You've been invited to join Braille`,
      },
    },
  });
};
