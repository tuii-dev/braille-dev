import { WorkspaceSettingsProvider } from "@/app/_helpers/workspace-settings-context";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { getTenantWorkspaces } from "@/lib/getTenantWorkspaces";
import { getUserPreferences } from "@/lib/getUserPreferences";

import { SpaceSettingsLink } from "./components";
import { SpacesList } from "./(components)/spaces-list";

type LayoutProps = {
  children: React.ReactNode;
};

export default async function Layout({ children }: LayoutProps) {
  const { tenantId, isAdmin } = await getCurrentSessionUser();
  const workspaces = await getTenantWorkspaces(tenantId);
  const preferences = await getUserPreferences();

  if (workspaces.length === 0) {
    return children;
  }

  return (
    <WorkspaceSettingsProvider workspaces={workspaces}>
      <div className="h-full flex flex-col w-full">
        <div className="shrink-0 flex justify-between px-6 pb-6 relative z-10">
          <SpacesList
            isAdmin={isAdmin}
            workspaces={workspaces}
            pinnedIds={preferences.pinnedWorkspaces}
          />
          {isAdmin && <SpaceSettingsLink />}
        </div>
        <div className="w-full grow flex flex-col">{children}</div>
      </div>
    </WorkspaceSettingsProvider>
  );
}
