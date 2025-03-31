import { Suspense } from "react";

import { Scrollbars } from "@/components/scrollbars";

import { SettingsTabs } from "./components";

type LayoutProps = {
  params: any;
  children: React.ReactNode;
};

export default async function Layout({ params, children }: LayoutProps) {
  return (
    <Scrollbars>
      <div className="w-full text-[#282222] dark:text-white h-full flex flex-col">
        <div className="px-16">
          <SettingsTabs
            tabs={[
              {
                href: `/workspaces/${params.id}/settings/workspace-settings`,
                label: "General Settings",
              },
              {
                href: `/workspaces/${params.id}/settings/parameters`,
                label: "Workflow",
              },
            ]}
          />
        </div>
        <div className="grow flex w-full h-full bg-stone-50 dark:bg-charcoal-950">
          <Scrollbars>
            <Suspense>{children}</Suspense>
          </Scrollbars>
        </div>
      </div>
    </Scrollbars>
  );
}
