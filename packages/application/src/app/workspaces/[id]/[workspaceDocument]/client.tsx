"use client";

import React, { Fragment } from "react";

import {
  ActionExecution,
  ActionExecutionError,
  ActionOuputs,
  App,
  DataExtractionJobStatus,
  TaskStatus,
} from "@jptr/braille-prisma";

import { Scrollbars } from "@/components/scrollbars";
import { executeAction, rerunJob } from "@/components/entity-view/actions";
import { RocketLaunchIcon } from "@heroicons/react/20/solid";
import { Submit } from "@/components/form-submit-button";
import { Button } from "@/components/button";
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/16/solid";
import { DateString } from "@/components/datetime";
import { Dialog, DialogContent, DialogTrigger } from "@/components/dialog";
import { TextArea } from "@/components/textinput";
import { Label } from "@/components/label";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getWorkspaceDocument } from "./actions";
import { useProgress } from "@/components/client";
import { JobStatus } from "@/components/job-status";

import { Thumbnail } from "./thumbnail";
import DataViewSkeleton from "./data-view-skeleton";
import { EditabilityController } from "@/components/entity-view/editability-controller";
import { PDFPanel } from "../(components)/pdf-panel";


export const ActionButton = ({
  jobId,
  executions,
  app,
}: {
  jobId: string;
  executions: (ActionExecution & { outputs: ActionOuputs[] })[];
  app: App;
}) => {
  if (executions.some((exec) => exec.status === "PENDING")) {
    return (
      <form action={executeAction.bind(null, jobId)}>
        <Submit
          size="sm"
          icon={<RocketLaunchIcon className="w-3 h-3" />}
          variant="primary"
        >
          Deploying...
        </Submit>
      </form>
    );
  }

  const successfulExecution = executions.find(
    (exec) => exec.status === TaskStatus.FINISHED,
  );

  if (successfulExecution) {
    const linkOutput = successfulExecution.outputs.find(
      (output) => output.name === "$link",
    );

    if (typeof linkOutput?.data === "string") {
      return (
        <Button
          as="link"
          size="sm"
          icon={<ArrowTopRightOnSquareIcon className="w-3 h-3" />}
          variant="minimal"
          target="_blank"
          href={linkOutput.data}
          subtext={
            <Fragment>
              Deployed <DateString>{successfulExecution.executedAt}</DateString>
            </Fragment>
          }
        >
          View in {app.name}
        </Button>
      );
    }

    return (
      <Button
        onClick={(e) => {
          e.preventDefault();
        }}
        size="sm"
        aria-disabled="true"
        icon={<RocketLaunchIcon className="w-3 h-3" />}
        variant="minimal"
        subtext={
          <Fragment>
            at <DateString>{successfulExecution.executedAt}</DateString>
          </Fragment>
        }
      >
        Deployed to {app.name}
      </Button>
    );
  }

  return (
    <form action={executeAction.bind(null, jobId)}>
      <Submit
        size="sm"
        icon={<RocketLaunchIcon className="w-3 h-3" />}
        variant="primary"
      >
        Deploy to {app.name}
      </Submit>
    </form>
  );
};

export const ReprocessAction = ({
  jobId,
  tenantId,
  workspaceDocumentId,
  executions,
}: {
  jobId: string;
  tenantId: string;
  workspaceDocumentId: string;
  executions: ActionExecution[];
}) => {
  const [showModal, setShowModal] = React.useState(false);
  const queryClient = useQueryClient();
  const { monitorProgress } = useProgress();

  if (executions.find((exec) => exec.status === TaskStatus.FINISHED)) {
    return null;
  }

  if (executions.find((exec) => exec.status === TaskStatus.PENDING)) {
    return (
      <Button
        onClick={(e) => {
          e.preventDefault();
        }}
        type="submit"
        size="sm"
        aria-disabled="true"
        icon={<ArrowPathIcon className="w-3 h-3" />}
        variant="minimal"
      >
        Reprocess
      </Button>
    );
  }

  return (
    <div>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <form
            className="dark:text-white"
            onSubmit={async (e) => {
              e.preventDefault();

              queryClient.setQueryData(
                ["getWorkspaceDocument", tenantId, workspaceDocumentId],
                (prev: any) => {
                  prev.workspaceDocument.dataExtractionJobs[0].status =
                    "RUNNING";

                  return { ...prev };
                },
              );

              setShowModal(false);

              await monitorProgress(rerunJob.bind(null, jobId))(
                new FormData(e.target as HTMLFormElement),
              );

              queryClient.invalidateQueries({
                queryKey: [
                  "getWorkspaceDocument",
                  tenantId,
                  workspaceDocumentId,
                ],
              });
            }}
          >
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 items-baseline">
                <ArrowPathIcon className="w-5 h-5 pt-1" />
                <h1 className="text-lg font-semibold">Reprocess</h1>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm">
                  Provide custom instructions to help improve results.
                </p>
                <p className="text-sm">
                  Tell us what was wrong and what outcome you expected instead.
                </p>
              </div>
              <Label name="prompt">Prompt (optional)</Label>
              <TextArea name="prompt" rows={3} className="max-h-[50vh]" />
              <div className="flex justify-end mt-2">
                <Submit>Confirm</Submit>
              </div>
            </div>
          </form>
        </DialogContent>
        <DialogTrigger asChild>
          <Button
            size="sm"
            icon={<ArrowPathIcon className="w-3 h-3" />}
            variant="minimal"
            onClick={() => setShowModal(true)}
          >
            Reprocess
          </Button>
        </DialogTrigger>
      </Dialog>
    </div>
  );
};

export const DeploymentFailureMessage = ({
  errors,
}: {
  errors: ActionExecutionError[];
}) => {
  return (
    <div className="rounded p-3 border border-red-500 dark:border-red-200 flex flex-col gap-0.5">
      <p className="text-xs shrink-0 font-bold mt-0 mb-1 dark:text-red-400">
        Deployment Attempt Failed
      </p>
      <ul className="text-xs dark:text-red-100">
        {errors.map((error, index) => (
          <li key={index}>{error.userMessage}</li>
        ))}
      </ul>
    </div>
  );
};

const FailedJobMessage = ({
  jobId,
  tenantId,
  workspaceDocumentId,
}: {
  jobId: string;
  tenantId: string;
  workspaceDocumentId: string;
}) => {
  const queryClient = useQueryClient();

  return (
    <div className="flex flex-col justify-center items-center gap-4 border dark:border-midnight-700 rounded px-6 py-12">
      <p>Failed to process job.</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          queryClient.setQueryData(
            ["getWorkspaceDocument", tenantId, workspaceDocumentId],
            (prev: any) => {
              prev.workspaceDocument.dataExtractionJobs[0].status = "RUNNING";

              return { ...prev };
            },
          );

          await rerunJob.bind(
            null,
            jobId,
          )(new FormData(e.target as HTMLFormElement));

          queryClient.invalidateQueries({
            queryKey: ["getWorkspaceDocument", tenantId, workspaceDocumentId],
          });
        }}
      >
        <Submit
          size="sm"
          icon={<ArrowPathIcon className="w-4 h-4" />}
          variant="secondary"
        >
          Retry
        </Submit>
      </form>
    </div>
  );
};

export const DocumentView = ({
  tenantId,
  workspaceDocumentId,
  children,
}: {
  tenantId: string;
  workspaceDocumentId: string;
  children?: React.ReactNode;
}) => {
  const { monitorProgress } = useProgress();

  const { data, isLoading } = useQuery<
    NonNullable<Awaited<ReturnType<typeof getWorkspaceDocument>>>
  >({
    queryKey: ["getWorkspaceDocument", tenantId, workspaceDocumentId],
    queryFn: monitorProgress(async () => {
      const result = await getWorkspaceDocument(tenantId, workspaceDocumentId);
      if (!result) throw new Error("Failed to fetch document");
      return result;
    }),
  });

  if (isLoading || !data) {
    return <div>Loading...</div>;
  }

  const { pdf, thumbnail, workspaceDocument: document } = data;

  if (!document) {
    return null;
  }

  const [job] = document.dataExtractionJobs ?? [];
  const app = job?.modelVersion.appVersionModelVersion?.appVersion.app;
  const [execution] = job?.actionExecutions ?? [];

  return (
    <div className="flex flex-col w-full grow" data-testid="workspace-document">
      <div className="flex flex-col relative h-full @container">
        <div className="flex h-full items-stretch @container">
          {pdf && <PDFPanel pdf={pdf} />}
          <div className="@container flex flex-col grow w-7/12 h-full">
            {job && (
              <Scrollbars className="flex h-full justify-center grow">
                <div className="w-full flex flex-col px-5 @lg:px-7 py-6 z-10  border-b border-slate-200  dark:border-midnight-400 dark:bg-charcoal-950 gap-y-2 ">
                  <div className=" w-full flex items-center justify-between gap-x-4">
                    <div className="w-full flex gap-x-5 @xl:items-center flex-row-reverse @lg:flex-row">
                      {thumbnail && <Thumbnail src={thumbnail} />}
                      <div className="flex gap-x-6 gap-y-2 w-full justify-between items-center flex-wrap">
                        <div>
                          <h2 className="text-md @md:text-lg font-semibold dark:text-gray-100 flex">
                            {document.document.name}{" "}
                            {job &&
                              job.status &&
                              job.status !==
                                DataExtractionJobStatus.FINISHED && (
                                <JobStatus
                                  pill
                                  className="ml-4"
                                  status={job.status}
                                />
                              )}
                          </h2>
                          <div className="hidden @[900px]:flex gap-x-1 text-xs dark:text-gray-400 mb-1 mt-0.5">
                            <span>Created by </span>
                            <span className="rr-mask">
                              {document.document.createdBy.name ||
                                document.document.createdBy.email}
                            </span>
                          </div>
                        </div>
                        {(job.status === DataExtractionJobStatus.FAILED ||
                          job.status === DataExtractionJobStatus.FINISHED) && (
                          <div className="flex items-end gap-2 flex-wrap">
                            {app &&
                              job.status ===
                                DataExtractionJobStatus.FINISHED && (
                                <ActionButton
                                  app={app}
                                  jobId={job.id}
                                  executions={job.actionExecutions}
                                />
                              )}
                            {job.workspaceDocumentId &&
                              job.status !== DataExtractionJobStatus.FAILED && (
                                <ReprocessAction
                                  jobId={job.id}
                                  tenantId={job.tenantId}
                                  workspaceDocumentId={job.workspaceDocumentId}
                                  executions={job.actionExecutions}
                                />
                              )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex pb-12 pt-6 px-5 @lg:px-7  flex-col items-stretch grow">
                  <div className="flex flex-col gap-y-4">
                    {execution &&
                      ![
                        DataExtractionJobStatus.RUNNING,
                        DataExtractionJobStatus.PENDING,
                      ].some((status) => status === job.status) &&
                      execution.status === TaskStatus.FAILED && (
                        <DeploymentFailureMessage
                          errors={job.actionExecutions[0].errors}
                        />
                      )}
                    {job.status === DataExtractionJobStatus.FAILED && (
                      <FailedJobMessage
                        jobId={job.id}
                        tenantId={job.tenantId}
                        workspaceDocumentId={document.id}
                      />
                    )}
                    {[
                      DataExtractionJobStatus.RUNNING,
                      DataExtractionJobStatus.PENDING,
                    ].some((status) => status === job.status) && (
                      <DataViewSkeleton />
                    )}
                    <EditabilityController
                      editable={
                        !execution || execution.status === TaskStatus.FAILED
                      }
                    >
                      {children}
                    </EditabilityController>
                  </div>
                </div>
              </Scrollbars>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
