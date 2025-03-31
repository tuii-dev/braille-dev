"use client";

import { Workspace } from "@jptr/braille-prisma";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

type ColorOverride = { workspaceId: string; color: string };

type WorkspaceSettingsContextType = {
  workspaces: Workspace[];
  colorOverride: ColorOverride | undefined;
  setColorOverride: (override: ColorOverride | undefined) => void;
};

const WorkspaceSettingsContext = createContext<
  WorkspaceSettingsContextType | undefined
>(undefined);

export const useWorkspaceContext = (workspaceId?: string) => {
  const context = useContext(WorkspaceSettingsContext);
  if (context === undefined) {
    throw new Error(
      "useWorkspaceSettings must be used within a WorkspaceSettingsProvider",
    );
  }

  const workspace = context.workspaces.find(
    (workspace) => workspace.id === workspaceId,
  );

  const overrideColor =
    context.colorOverride?.workspaceId === workspaceId
      ? context.colorOverride?.color
      : undefined;

  if (!workspace) {
    return {
      name: "hello?",
      color: "#1d4ed8",
      setOverride: (override: string | undefined) => {
        context.setColorOverride(
          override && workspaceId
            ? {
                workspaceId,
                color: override,
              }
            : undefined,
        );
      },
    };
  }

  return {
    name: workspace.name,
    id: workspace.id,
    color: overrideColor ?? workspace.color ?? "#1d4ed8",
    setOverride: (override: string | undefined) => {
      context.setColorOverride(
        override && workspaceId
          ? {
              workspaceId,
              color: override,
            }
          : undefined,
      );
    },
  };
};

export const WorkspaceSettingsProvider: React.FC<{
  children: ReactNode;
  workspaces: Workspace[];
}> = ({ children, workspaces: serverWorkspaces }) => {
  const [colorOverride, setColorOverride] = useState<
    { workspaceId: string; color: string } | undefined
  >(undefined);

  return (
    <WorkspaceSettingsContext.Provider
      value={{ workspaces: serverWorkspaces, colorOverride, setColorOverride }}
    >
      {children}
    </WorkspaceSettingsContext.Provider>
  );
};
