import React from "react";

import type { Metadata } from "next";

import { UserProvider } from "@auth0/nextjs-auth0/client";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

import { ApplicationShell } from "./shell";
import { ServerEventsFeed } from "@/components/server-events";

export const metadata: Metadata = {
  title: "Braille - AI Document Processing",
  description: "AI Document Processing",
};

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";

export const ShellServer = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, isAdmin, isSuperAdmin, isSystemAdmin } =
    await getCurrentSessionUser();

  return (
    <UserProvider>
      <ApplicationShell
        user={user}
        isAdmin={isAdmin}
        isSuperAdmin={isSuperAdmin}
        isSystemAdmin={isSystemAdmin}
        statsigKey={process.env.STATSIG_API_KEY}
      >
        <ServerEventsFeed />
        <div className="flex w-full h-full items-stretch dark:bg-charcoal-900 dark:text-gray-200">
          {children}
        </div>
      </ApplicationShell>
    </UserProvider>
  );
};
