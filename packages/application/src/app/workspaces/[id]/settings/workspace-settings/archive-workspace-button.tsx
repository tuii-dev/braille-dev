"use client";

import React, { useState } from "react";
import { Button } from "@/components/button";
import { archiveWorkspace } from "./actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogOverlay,
} from "@/components/dialog";

interface ArchiveWorkspaceButtonProps {
  workspaceId: string;
  workspaceName: string;
}

export const ArchiveWorkspaceButton: React.FC<ArchiveWorkspaceButtonProps> = ({
  workspaceId,
  workspaceName,
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const handleArchive = async () => {
    const result = await archiveWorkspace(workspaceId);

    if (result?.errors) {
      console.error(result.errors);
      alert("Failed to archive the workspace. Please try again.");
      return;
    }

    setIsConfirmOpen(false); // Close confirmation dialog
    setIsSuccessOpen(true); // Show success dialog
  };

  return (
    <>
      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogTrigger asChild>
          <Button variant="danger">Archive Workspace</Button>
        </DialogTrigger>
        <DialogOverlay />
        <DialogContent>
          <DialogTitle>Archive Workspace</DialogTitle>
          <DialogDescription className="mt-2">
            Are you sure you want to archive the workspace{" "}
            <b>{workspaceName}</b>? This action cannot be undone.
          </DialogDescription>
          <div className="mt-4 flex justify-end gap-2">
            <Button onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleArchive}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog (but I have no idea what to do with this here because on the redirect this disappears instantly. I should add some kind of chip that comes up that says it was successful.
      Although, thinkin about this, it seems that the success is self-evident based on the redirect actually occuring and the tab disappearing) */}
      {/* <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogOverlay />
        <DialogContent>
          <DialogTitle>Workspace Archived</DialogTitle>
          <DialogDescription className="mt-2">
            Workspace <b>{workspaceName}</b> has been successfully archived.
          </DialogDescription>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setIsSuccessOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog> */}
    </>
  );
};
