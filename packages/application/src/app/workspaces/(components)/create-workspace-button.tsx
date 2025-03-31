"use client";

import { Button } from "@/components/button";

import { CreateWorkspaceDialogButton } from "../components";

export const CreateWorkspaceButton = () => {
  return (
    <CreateWorkspaceDialogButton>
      {(setIsDialogOpen) => (
        <Button
          variant="primary"
          shape="rounded"
          onClick={() => {
            setIsDialogOpen(true);
          }}
        >
          Create Workspace
        </Button>
      )}
    </CreateWorkspaceDialogButton>
  );
};
