import React from "react";

import { LayoutWithTitle } from "@/components/layout";
import getCurrentAdminUser from "@/lib/getAdminUser";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getCurrentAdminUser();

  return (
    <LayoutWithTitle
      title="Account Settings"
      tabs={[
        {
          href: `/settings/organisation`,
          label: "Organisation",
        },
        {
          href: `/settings/users`,
          label: "Users",
        },
        // {
        //   href: `/settings/teams`,
        //   label: "Teams",
        // },
        {
          href: `/settings/apps`,
          label: "Apps",
        },
        {
          href: `/settings/subscription`,
          label: "Subscription",
        },
        {
          href: `/settings/billing`,
          label: "Billing",
        },
      ]}
    >
      {children}
    </LayoutWithTitle>
  );
}
