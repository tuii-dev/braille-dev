"use client";

import { Zap } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";

import { useWorkspaceContext } from "@/app/_helpers/workspace-settings-context";
import { workspaceThemeTextColor } from "@/lib/color";
import { useWorkspaceDocuments } from "@/app/_helpers/hooks/useWorkspaceDocuments";
import { Button } from "@/components/button";

import { MotionAccordian } from "../components";

type WorkflowPanelProps = {
  children: React.ReactNode;
};

const HeaderNavigation = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const workspaceDocumentId = params.workspaceDocument as string;
  const { color } = useWorkspaceContext(params.id as string);
  const textColor = workspaceThemeTextColor(color);

  // Get navigation data using our unified hook
  const { data: navigationData, navigateToDocument } = useWorkspaceDocuments({
    params,
    currentDocumentId: workspaceDocumentId,
    search: searchParams.get("search") ?? "",
    from: searchParams.get("from") ?? "",
    to: searchParams.get("to") ?? "",
    uploader: searchParams.get("uploader") ?? "",
    searchType: "adjacent",
  });

  // Handle nullable prev/next documents
  const previousDoc =
    navigationData && "prev" in navigationData
      ? navigationData?.prev?.id
      : null;
  const nextDoc =
    navigationData && "next" in navigationData
      ? navigationData?.next?.id
      : null;

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        style={{ color: textColor }}
        variant="ghost"
        aria-disabled={!previousDoc}
        onClick={() => previousDoc && navigateToDocument(previousDoc)}
      >
        Previous
      </Button>
      <Button
        size="sm"
        style={{ color: textColor }}
        variant="ghost"
        aria-disabled={!nextDoc}
        onClick={() => nextDoc && navigateToDocument(nextDoc)}
      >
        Next
      </Button>
    </div>
  );
};

export const WorkflowPanel = ({ children }: WorkflowPanelProps) => {
  const params = useParams<{ id: string }>();
  const { color } = useWorkspaceContext(params.id);
  const textColor = workspaceThemeTextColor(color);

  return (
    <MotionAccordian
      icon={
        <Zap
          fill="currentColor"
          className="w-4 h-4 mr-2 flex"
          style={{ color: textColor }}
        />
      }
      headerChildren={<HeaderNavigation />}
      headerStyle={{ color: textColor }}
      headerColor={color}
      title="Workflow"
      expanded
      expandAxis="x"
    >
      {children}
    </MotionAccordian>
  );
};
