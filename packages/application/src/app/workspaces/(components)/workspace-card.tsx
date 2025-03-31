"use client";

import { Files, Pin, PinOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { WorkspaceData } from "@/lib/getWorkspaceData";
import { cn } from "@/lib/utils";
import { usePinnedWorkspaces } from "@/app/_helpers/hooks/useUserPreferences";
import { Card } from "@/components/card";
import { Badge } from "@/components/badge";

interface WorkspaceCardProps {
  workspace: WorkspaceData;
}

export default function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const router = useRouter();
  const { pinnedWorkspaces, setPinnedWorkspaces } = usePinnedWorkspaces();
  const isPinned = pinnedWorkspaces.includes(workspace.id);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isPinned) {
      // Pin the workspace when navigating to it
      await setPinnedWorkspaces([...pinnedWorkspaces, workspace.id]);
    }

    router.push(`/workspaces/${workspace.id}`);
  };

  return (
    <Link
      href={`/workspaces/${workspace.id}`}
      className="block"
      onClick={handleClick}
    >
      <Card
        className={cn(
          "p-4 transition-colors relative",
          !isPinned
            ? "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
            : "hover:bg-gray-50 dark:hover:bg-gray-900",
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "p-2 rounded",
              !isPinned
                ? "bg-gray-200 dark:bg-gray-800"
                : "bg-blue-50 dark:bg-blue-900/30",
            )}
          >
            <Files
              className={cn(
                "w-4 h-4",
                !isPinned
                  ? "text-gray-500 dark:text-gray-400"
                  : "text-blue-500 dark:text-blue-400",
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                "font-medium truncate",
                !isPinned && "text-gray-500 dark:text-gray-400",
              )}
            >
              {workspace.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Updated {formatDistanceToNow(new Date(workspace.updatedAt))} ago
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div>
              {!isPinned ? (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                >
                  <PinOff className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  <span className="hidden md:inline text-indigo-600 dark:text-indigo-400">
                    Unpinned
                  </span>
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 border-[#F0EA56] bg-yellow-50 dark:border-[#F0EA56]  dark:bg-[#F0EA56]/20"
                >
                  <Pin className="w-3 h-3 text-[#6c6a27] dark:text-[#F0EA56]" />
                  <span className="hidden md:inline text-[#6c6a27] dark:text-[#F0EA56]">
                    Pinned
                  </span>
                </Badge>
              )}
            </div>
            {workspace._count.documents > 0 && (
              <Badge variant="default" className="flex items-center gap-1">
                <Files className="w-3 h-3" />
                {workspace._count.documents}
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
