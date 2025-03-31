"use client";

import { Fragment, useMemo, useState } from "react";

import { usePinnedWorkspaces } from "@/app/_helpers/hooks/useUserPreferences";
import WorkspaceCard from "./workspace-card";
import { WorkspaceFilters as WorkspaceFiltersComponent } from "./workspace-filters";
import { WorkspaceStatus } from "./types";
import type { WorkspaceData } from "../../../lib/getWorkspaceData";

interface WorkspaceGridProps {
  workspaces: WorkspaceData[];
}

export function WorkspaceGrid({ workspaces }: WorkspaceGridProps) {
  const { pinnedWorkspaces } = usePinnedWorkspaces();
  const [filters, setFilters] = useState<{
    search: string;
    status: WorkspaceStatus;
  }>({
    search: "",
    status: WorkspaceStatus.ALL,
  });

  const filteredWorkspaces = useMemo(() => {
    return workspaces
      .filter((workspace) => {
        // Filter by status
        switch (filters.status) {
          case WorkspaceStatus.PINNED:
            if (!pinnedWorkspaces.includes(workspace.id)) return false;
            break;
          case WorkspaceStatus.UNPINNED:
            if (pinnedWorkspaces.includes(workspace.id)) return false;
            break;
          case WorkspaceStatus.ALL:
            break;
        }

        // Filter by search term
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          return workspace.name.toLowerCase().includes(searchTerm);
        }

        return true;
      })
      .sort((a, b) => {
        const aIsPinned = pinnedWorkspaces.includes(a.id);
        const bIsPinned = pinnedWorkspaces.includes(b.id);
        if (aIsPinned && !bIsPinned) return -1;
        if (!aIsPinned && bIsPinned) return 1;
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
  }, [workspaces, pinnedWorkspaces, filters]);

  return (
    <Fragment>
      <WorkspaceFiltersComponent
        totalCount={workspaces.length}
        onFilterChange={setFilters}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredWorkspaces.map((workspace) => (
          <WorkspaceCard key={workspace.id} workspace={workspace} />
        ))}
        {filteredWorkspaces.length === 0 && (
          <div className="col-span-full py-8 text-center text-gray-500 dark:text-gray-400">
            No workspaces found
            {filters.search ? ` matching "${filters.search}"` : ""}
          </div>
        )}
      </div>
    </Fragment>
  );
}
