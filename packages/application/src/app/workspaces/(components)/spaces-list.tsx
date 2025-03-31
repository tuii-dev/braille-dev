"use client";

import { LayoutDashboard, Plus } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { usePathname } from "next/navigation";

import { Reorder } from "framer-motion";

import { Workspace } from "@jptr/braille-prisma";
import { Button } from "@/components/button";
import { XMarkIcon } from "@heroicons/react/24/outline";

import {
  usePinnedWorkspaces,
  useLastUsedWorkspace,
} from "@/app/_helpers/hooks/useUserPreferences";

import { cn } from "@/lib/utils";
import { CreateWorkspaceDialogButton } from "../components";
import { getLuminance } from "@/lib/color";
import { useTheme } from "@/components/theme";

interface SpacesListProps {
  isAdmin: boolean;
  workspaces: Workspace[];
  pinnedIds: string[];
}

type Item = {
  isGhost: boolean;
  name: string;
  id: string;
  slug: string;
  tenantId: string;
  color: string | null;
  description: string | null;
  archived: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

type SpaceButtonProps = {
  item: Item;
  pinnedIds: string[];
};

const workspaceThemeTextColor = (color: string) => {
  return getLuminance(color) < 0.5 ? "white" : "black";
};

const PinSVG = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="7"
      height="6"
      viewBox="0 0 7 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.06638 0.697785C4.27418 0.559239 4.37809 0.489964 4.49131 0.501175C4.60454 0.512386 4.69285 0.600694 4.86946 0.777307L5.72269 1.63055C5.89931 1.80716 5.98762 1.89547 5.99882 2.00869C6.01005 2.1219 5.94078 2.22581 5.80222 2.43364L5.27759 3.2206C5.09878 3.4888 5.00939 3.62287 4.93804 3.76601C4.88512 3.87211 4.83971 3.9818 4.80206 4.09423C4.75134 4.2459 4.71974 4.40393 4.6565 4.71999L4.59572 5.02387L4.59534 5.02587C4.55002 5.24955 4.29092 5.35422 4.10298 5.22476L4.10129 5.22362C4.09706 5.22069 4.09493 5.21923 4.09283 5.21776C2.99503 4.45701 2.043 3.50497 1.28224 2.40717C1.28078 2.40507 1.27931 2.40295 1.27638 2.39872L1.27522 2.39704C1.1458 2.20908 1.25046 1.94999 1.47413 1.90467L1.47613 1.90427L1.78002 1.84349C2.09608 1.78028 2.25411 1.74868 2.40577 1.69793C2.51821 1.66032 2.6279 1.61489 2.73399 1.56198C2.87713 1.49062 3.0112 1.40122 3.2794 1.22243L4.06638 0.697785Z"
        fill="currentColor"
      />
      <path d="M1 5.5L2.43203 4.06798L1 5.5Z" fill="currentColor" />
      <path
        d="M1 5.5L2.43203 4.06798M4.06638 0.697785C4.27418 0.559239 4.37809 0.489964 4.49131 0.501175C4.60454 0.512386 4.69285 0.600694 4.86946 0.777307L5.72269 1.63055C5.89931 1.80716 5.98762 1.89547 5.99882 2.00869C6.01005 2.1219 5.94078 2.22581 5.80222 2.43364L5.27759 3.2206C5.09878 3.4888 5.00939 3.62287 4.93804 3.76601C4.88512 3.87211 4.83971 3.9818 4.80206 4.09423C4.75134 4.2459 4.71974 4.40393 4.6565 4.71999L4.59572 5.02387L4.59534 5.02587C4.55002 5.24955 4.29092 5.35422 4.10298 5.22476L4.10129 5.22362C4.09706 5.22069 4.09493 5.21923 4.09283 5.21776C2.99503 4.45701 2.043 3.50497 1.28224 2.40717C1.28078 2.40507 1.27931 2.40295 1.27638 2.39872L1.27522 2.39704C1.1458 2.20908 1.25046 1.94999 1.47413 1.90467L1.47613 1.90427L1.78002 1.84349C2.09608 1.78028 2.25411 1.74868 2.40577 1.69793C2.51821 1.66032 2.6279 1.61489 2.73399 1.56198C2.87713 1.49062 3.0112 1.40122 3.2794 1.22243L4.06638 0.697785Z"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </svg>
  );
};

const SpaceButton = ({ item, pinnedIds }: SpaceButtonProps) => {
  const { setLastUsedWorkspace } = useLastUsedWorkspace();
  const { pinnedWorkspaces, setPinnedWorkspaces } =
    usePinnedWorkspaces(pinnedIds);
  const pathname = usePathname();
  const { theme } = useTheme();
  const isActive = pathname.startsWith(`/workspaces/${item.id}`);
  const isGhost = item.isGhost;
  const color = !isGhost ? item.color ?? "#1d4ed8" : "transparent";
  const textColor = !isGhost
    ? workspaceThemeTextColor(color)
    : theme === "dark"
      ? "white"
      : "black";

  return (
    <div className="relative group">
      {!isGhost && (
        <Fragment>
          <div
            className={cn(
              "absolute inset-0 rounded-full blur opacity-0 transition-all",
              {
                "opacity-40 group-hover:opacity-50": isActive,
              },
            )}
            style={{
              boxShadow: `0 0 8px 3px ${color}`,
              backgroundColor: color,
            }}
          />
          <div
            className={cn(
              "absolute inset-0 rounded-full blur-[2px] opacity-0 transition-all",
              {
                "opacity-25 group-hover:opacity-50": isActive,
              },
            )}
            style={{
              boxShadow: `0 0 3px 0 white`,
            }}
          />
        </Fragment>
      )}
      <Button
        as="link"
        shape="pill"
        className={cn(
          "px-5 pr-10 relative transition-transform group/button font-semibold backdrop-blur-sm bg-[rgba(0,0,0,0.10)] dark:bg-[rgba(0,0,0,0.25)] hover:bg-[rgba(0,0,0,0.25) dark:hover:bg-[rgba(0,0,0,0.5)]",
          {
            "text-black": isActive,
            "border-slate-200 dark:border-[#2F2F2F]": isGhost,
          },
        )}
        draggable={false}
        href={`/workspaces/${item.id}`}
        style={
          isActive
            ? {
                backgroundColor: color,
                color: textColor,
              }
            : {}
        }
        variant={item.isGhost ? "ghost" : "minimal"}
        onClick={() => {
          if (item.isGhost) {
            setPinnedWorkspaces([...pinnedWorkspaces, item.id]);
          }
          setLastUsedWorkspace(item.id);
        }}
      >
        <PinSVG
          aria-label="Pinned"
          className={cn(
            "w-2.5 h-2.5 mr-2 opacity-100 transition-all group/button:active:-translate-y-1 group/button:active:translate-x-1",
            {
              "opacity-0 -translate-y-1 translate-x-1": isGhost,
            },
          )}
        />
        {item.name}
      </Button>
      {!isGhost && (
        <button
          aria-label="Close workspace"
          className="absolute right-3 w-5 h-5 flex items-center justify-center m-auto top-0 bottom-0 p-1 rounded-full hover:bg-red-500 group/xmarks"
          data-testid={`close-workspace-${item.id}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setPinnedWorkspaces(
              pinnedWorkspaces.filter((id) => id !== item.id),
            );
          }}
        >
          <XMarkIcon
            className="w-4 h-4 transition-all text-black dark:text-white group-hover/xmarks:stroke-white group-hover/xmarks:stroke-2"
            style={
              isActive
                ? {
                    color: textColor,
                  }
                : {}
            }
          />
        </button>
      )}
    </div>
  );
};

export const SpacesList = ({
  isAdmin,
  workspaces,
  pinnedIds,
}: SpacesListProps) => {
  const params = useParams();
  const pathname = usePathname();
  const { pinnedWorkspaces, setPinnedWorkspaces } =
    usePinnedWorkspaces(pinnedIds);

  const sorted = useMemo(() => {
    // Get the current workspace ID from the URL if we're on a workspace page
    const currentWorkspaceId = params?.id as string;

    // If no pinned workspaces, only show current workspace. Otherwise show pinned ones and current workspace
    const pinnedTabs = !pinnedWorkspaces?.length
      ? workspaces.filter((workspace) => workspace.id === currentWorkspaceId)
      : workspaces.filter(
          (workspace) =>
            pinnedWorkspaces.includes(workspace.id) ||
            workspace.id === currentWorkspaceId,
        );

    // Add isGhost property and sort by pinned order
    return pinnedTabs
      .map((workspace) => ({
        ...workspace,
        isGhost:
          !pinnedWorkspaces.includes(workspace.id) &&
          workspace.id == currentWorkspaceId,
      }))
      .sort((a, b) => {
        // Keep the order as defined in pinnedWorkspaces
        const aIndex = pinnedWorkspaces.indexOf(a.id);
        const bIndex = pinnedWorkspaces.indexOf(b.id);
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
  }, [workspaces, pinnedWorkspaces, params]);

  return (
    <nav className="relative flex items-center gap-3">
      <div className="flex items-center gap-5">
        <Button
          href="/workspaces"
          variant="ghost"
          shape="rounded"
          as="link"
          className={cn("flex items-center gap-2 py-2.5 border-transparent", {
            "bg-black backdrop-blur-sm text-white hover:bg-[rgba(0,0,0,0.75) dark:bg-[rgba(0,0,0,0.5)]":
              pathname === "/workspaces",
          })}
        >
          <LayoutDashboard fill="currentColor" className="w-4 h-4" />
          Dashboard
        </Button>
        <Reorder.Group
          className="flex z-20 gap-3"
          as="ul"
          axis="x"
          values={sorted}
          onReorder={(values) => {
            const newOrder = values.map((workspace) => workspace.id);
            setPinnedWorkspaces(newOrder);
          }}
        >
          {sorted.map((item) => (
            <Reorder.Item
              key={item.id}
              value={item}
              as="li"
              data-workspace-id={item.id}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              initial={false}
            >
              <SpaceButton item={item} pinnedIds={pinnedIds} />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
      {isAdmin && (
        <CreateWorkspaceDialogButton>
          {(setIsDialogOpen) => {
            return (
              <Button
                className="w-8 h-8 p-0 flex justify-center items-center"
                shape="pill"
                variant="minimal"
                aria-label="New Workspace"
                onClick={() => {
                  setIsDialogOpen(true);
                }}
                icon={<Plus className="w-4 h-4" />}
              />
            );
          }}
        </CreateWorkspaceDialogButton>
      )}
    </nav>
  );
};
