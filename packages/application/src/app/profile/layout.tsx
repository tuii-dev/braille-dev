import React from "react";

import { LogOut } from "lucide-react";

import { LayoutWithTitle } from "@/components/layout";
import { Button } from "@/components/button";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutWithTitle
      title="Profile"
      width="narrow"
      headerAfter={
        <Button
          href="/api/auth/logout"
          variant="minimal"
          className="justify-self-end ml-auto"
          as="a"
          icon={<LogOut className="w-3 h-3" />}
        >
          Logout
        </Button>
      }
      tabs={[
        {
          href: `/profile`,
          label: "About You",
        },
        {
          href: `/profile/preferences`,
          label: "Preferences",
        },
      ]}
    >
      {children}
    </LayoutWithTitle>
  );
}
