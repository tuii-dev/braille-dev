import { Fragment } from "react";

import { getWorkspaceData, getRecentActivity } from "@/lib/getWorkspaceData";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { EmptyState } from "@/components/empty-state";
import { WorkspaceGrid } from "@/app/workspaces/(components)/workspace-grid";
import { ActivityFeed } from "@/app/workspaces/(components)/activity-feed";
import { CreateWorkspaceButton } from "./(components)/create-workspace-button";

export default async function Page() {
  const { workspaces } = await getWorkspaceData();
  const recentActivity = await getRecentActivity();
  const { user, isAdmin } = await getCurrentSessionUser();

  const userName = user?.name;

  if (workspaces.length > 0) {
    const workspaceCount = workspaces.length;

    return (
      <div className="p-5 bg-stone-50 dark:bg-charcoal-980 grow flex">
        <div className="flex gap-5 w-full">
          <div className="rounded-xl bg-white dark:bg-charcoal-900 w-[530px] shrink-0 px-8 py-12 flex flex-col gap-10">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Welcome back{userName ? `, ${userName}` : ""}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Here&apos;s what&apos;s happening in your workspaces
              </p>
            </div>
            <div className="h-[1px] bg-gray-200 dark:bg-midnight-400 w-full"></div>
            <div>
              <ActivityFeed initialActivities={recentActivity} />
            </div>
          </div>
          <div className="rounded-xl bg-white dark:bg-charcoal-900 w-full px-8 py-12 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Workspaces</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {workspaceCount} workspace{workspaceCount !== 1 ? "s" : ""}
                </span>
              </div>
              {isAdmin && <CreateWorkspaceButton />}
            </div>
            <WorkspaceGrid workspaces={workspaces} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <EmptyState
      title="Welcome to Braille"
      image={
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
      }
    >
      {isAdmin ? (
        <Fragment>
          <p className="my-6 text-sm text-gray-500 dark:text-gray-200 max-w-[22rem] m-auto">
            Workspaces logically group documents based on their purpose, for
            example{" "}
            <b className="text-black dark:text-gray-200">Creating Invoices</b>{" "}
            in Your Accounting Software,{" "}
            <b className="text-black dark:text-gray-200">Marking Exams</b> from
            Students, or{" "}
            <b className="text-black dark:text-gray-200">
              Extracting Information
            </b>{" "}
            from Resumes.
          </p>
          <CreateWorkspaceButton />
        </Fragment>
      ) : (
        <p className="mt-2 text-sm text-gray-500 max-w-[22rem] m-auto">
          Looks like your administrator has not created any Workspaces yet. Come
          check back later..
        </p>
      )}
    </EmptyState>
  );
}
