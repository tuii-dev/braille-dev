"use client";

import { usePathname, useSearchParams } from "next/navigation";

import {
  DataExtractionJob,
  Document,
  File,
  WorkspaceDocument,
  User,
  ActionExecution,
  ActionOuputs,
} from "@jptr/braille-prisma";
import { Link } from "@/components/link";
import { DateString, TimeString } from "@/components/datetime";
import { cn } from "@/lib/utils";
import { aggregateJobsStatus } from "@/lib/workspace-document";

import { ActionStatus, JobStatus } from "../../../../../components/job-status";

import {
  DocumentCheckbox,
  DownloadDocumentsButton,
  useDocumentCheckboxes,
} from "./document-checkbox";
import { DropDownMenu } from "@/components/dropdownmenu";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/dropdown-menu";
import { ArrowDownTrayIcon } from "@heroicons/react/16/solid";
import { CopyX, ListTodo, Trash2 } from "lucide-react";

type DocumnentListRowProps = {
  thumbnail: string | null;
  document: WorkspaceDocument & {
    createdBy: User;
    document: Document & { files: File[] };
  };
  jobs: DataExtractionJob[];
  job: DataExtractionJob & {
    actionExecutions: (ActionExecution & { outputs: ActionOuputs[] })[];
  };
  workspaceId: string;
};

export const DocumentListRow = ({
  document,
  job,
  jobs,
  workspaceId,
  thumbnail,
}: DocumnentListRowProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const docBasePath = `/workspaces/${workspaceId}/${document.id}`;
  const href = searchParams.size
    ? `${docBasePath}?${searchParams}`
    : docBasePath;

  const active = pathname.startsWith(docBasePath);
  const activeCellStyles = {
    "bg-blue-300/15 dark:bg-charcoal-980": active,
  };

  const status = aggregateJobsStatus(jobs);
  const deploymentAction = job?.actionExecutions?.find(
    (execution) => execution.status === "FINISHED",
  );
  const deploymentLinkOutput = deploymentAction?.outputs.find(
    (output) => output.name === "$link",
  )?.data;

  return (
    <tr key={document.id}>
      <td width="32" className={cn("p-4 pl-6 pr-2", activeCellStyles)}>
        <div className="relative min-h-4">
          <DocumentCheckbox
            status={status}
            name="jobId"
            value={job?.id}
            thumbnail={thumbnail}
          />
        </div>
      </td>
      <td width="100%" className={cn("px-3", activeCellStyles)}>
        <div className="flex justify-between gap-x-3 items-center">
          <h2 className="min-w-0 max-w-xl text-xs xl:text-sm leading-6 dark:text-white">
            <Link
              href={href}
              className="flex gap-3 items-start justify-between"
            >
              <span className="truncate font-semibold leading-normal rr-mask">
                {document.document.name}
              </span>
            </Link>
          </h2>
          {status && status !== "FINISHED" && (
            <JobStatus pill status={status} />
          )}
          {deploymentAction && (
            <ActionStatus
              href={
                typeof deploymentLinkOutput === "string"
                  ? deploymentLinkOutput
                  : undefined
              }
            />
          )}
        </div>
      </td>
      <td className={cn("px-2 rr-mask", activeCellStyles)}>
        <div className="inline-flex text-xs px-2.5 py-1.5 bg-cyan-300/40 text-cyan-900  dark:text-white font-bold rounded-2xl">
          {document.createdBy.name
            ? document.createdBy.name
            : document.createdBy.email}
        </div>
      </td>
      <td className={cn("text-right pl-8", activeCellStyles)}>
        <div className="flex flex-col gap-x-2 text-xs font-mono rr-mask">
          <DateString>{document.document.createdAt}</DateString>
          <TimeString className="text-xs">{document.createdAt}</TimeString>
        </div>
      </td>
      <td className={cn("text-right pr-8", activeCellStyles)}></td>
    </tr>
  );
};

const DeselectAllItem = () => {
  const { deselectAll } = useDocumentCheckboxes();

  return (
    <DropdownMenuItem
      onClick={() => {
        deselectAll();
      }}
    >
      <span className="flex gap-x-2 items-center">
        <CopyX className="w-4 h-4" />
        Deselect All
      </span>
    </DropdownMenuItem>
  );
};

export const DocumentsActions = () => {
  const { state } = useDocumentCheckboxes();
  const selectionCount = Object.values(state).filter(Boolean).length;

  if (Object.entries(state).some(([_, value]) => value) === true) {
    return (
      <div className="flex gap-x-3 items-center">
        <DropDownMenu
          label={`${selectionCount} selected`}
          size="sm"
          align="start"
          icon={<ListTodo className="w-4 h-4" />}
        >
          {/* <DropdownMenuLabel>File(s)</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <span className="flex gap-x-2 items-center">
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
           <DropdownMenuSeparator /> */}
          <DropdownMenuLabel>Export</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <DownloadDocumentsButton format="json" />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <DownloadDocumentsButton format="csv" />
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Selection</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DeselectAllItem />
          </DropdownMenuGroup>
        </DropDownMenu>
      </div>
    );
  }

  return null;
};
