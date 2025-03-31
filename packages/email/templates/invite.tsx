import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Section,
  Text,
  Tailwind,
  Preview,
  Link,
} from "@react-email/components";

export function Invite(props: {
  url: string;
  username: string;
  email: string;
  invitedByEmail: string;
  invitedByUsername: string | null;
  tenantName: string;
}) {
  const { url, username, invitedByUsername, tenantName } = props;

  return (
    <Html>
      <Head />
      <Preview>
        {invitedByUsername
          ? `${invitedByUsername} has invited you to the ${tenantName} team on Braille.`
          : `You have been invited to the ${tenantName} on Braille`}
      </Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src="https://app.braille-ai.com/braille-80.png"
                width="38"
                alt="Braille"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Join <strong>{tenantName}</strong> <br />
              on <strong>Braille</strong>
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {username},
            </Text>
            {invitedByUsername ? (
              <Text className="text-black text-[14px] leading-[24px]">
                <strong>{invitedByUsername}</strong> has invited you to the{" "}
                <strong>{tenantName}</strong> team on <strong>Braille</strong>.
              </Text>
            ) : (
              <Text className="text-black text-[14px] leading-[24px]">
                You have been invited to the <strong>{tenantName}</strong> team
                on <strong>Braille</strong>.
              </Text>
            )}
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[14px] font-semibold no-underline text-center px-5 py-3"
                href={url}
              >
                Join the team
              </Button>
              <Text className="text-black text-[14px] leading-[24px]">
                or copy and paste this URL into your browser:{" "}
                <Link href={url} className="text-blue-600 no-underline">
                  {url}
                </Link>
              </Text>
              <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
              <Text className="text-[#666666] text-[12px] leading-[24px]">
                This invitation was intended for{" "}
                <span className="text-black">{username}</span>. If you were not
                expecting this invitation, you can ignore this email. If you are
                concerned about your account's safety, please reply to this
                email to get in touch with us.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

Invite.PreviewProps = {
  url: "https://localhost:3000",
  username: "John Smith",
  email: "john-smith@example.com",
  invitedByEmail: "admin@example.com",
  invitedByUsername: "Sean Wilson",
  tenantName: "Wilson Design and Build",
};

export default Invite;
