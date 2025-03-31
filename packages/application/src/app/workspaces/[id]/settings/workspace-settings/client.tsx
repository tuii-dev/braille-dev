"use client";

import { Fragment, useState } from "react";

import { Combobox } from "@/components/combobox";
import {
  fetchAvailableModels,
  connectWorkspaceModel,
  createNewWorkspaceModel,
} from "./actions";
import { Submit } from "@/components/form-submit-button";
import { useProgress } from "@/components/client";
import { EmptyState } from "@/components/empty-state";
import { PlusIcon } from "@heroicons/react/24/outline";

const SaveIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.80527 0C8.04636 0 8.27759 0.0957773 8.44809 0.266268L9.73373 1.55191C9.90423 1.7224 10 1.95363 10 2.19474V8.63636C10 9.3895 9.3895 10 8.63636 10H1.36364C0.610523 10 0 9.3895 0 8.63636V1.36364C0 0.610523 0.610523 0 1.36364 0H7.80527ZM1.36364 0.909091C1.1126 0.909091 0.909091 1.1126 0.909091 1.36364V8.63636C0.909091 8.88741 1.1126 9.09091 1.36364 9.09091H1.81818V6.36364C1.81818 5.6105 2.4287 5 3.18182 5H6.81818C7.57132 5 8.18182 5.6105 8.18182 6.36364V9.09091H8.63636C8.88741 9.09091 9.09091 8.88741 9.09091 8.63636V2.64929C9.09091 2.40818 8.99514 2.17695 8.82464 2.00646L7.99355 1.17536C7.82305 1.00487 7.59182 0.909091 7.35073 0.909091H7.27273V1.81818C7.27273 2.5713 6.66223 3.18182 5.90909 3.18182H4.09091C3.3378 3.18182 2.72727 2.5713 2.72727 1.81818V0.909091H1.36364ZM7.27273 9.09091V6.36364C7.27273 6.11259 7.06923 5.90909 6.81818 5.90909H3.18182C2.93078 5.90909 2.72727 6.11259 2.72727 6.36364V9.09091H7.27273ZM3.63636 0.909091H6.36364V1.81818C6.36364 2.06922 6.16014 2.27273 5.90909 2.27273H4.09091C3.83987 2.27273 3.63636 2.06922 3.63636 1.81818V0.909091Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const ModelPicker = ({
  workspaceId,
  currentModel,
  availableModels,
}: {
  workspaceId: string;
  availableModels: Awaited<ReturnType<typeof fetchAvailableModels>>;
  currentModel: {
    id: string;
    appName?: string | null;
    name?: string | null;
  } | null;
}) => {
  const options = availableModels.map<{
    label: string;
    sublabel?: string;
    value: string;
  }>((model) => ({
    label: model.name ?? "Custom Model",
    sublabel:
      ("appEntityModel" in model && model.appEntityModel?.app.name) ||
      "Custom Model",
    value: model.id,
  }));

  const [selectedApp, setSelectedApp] = useState<string>(
    currentModel?.id ?? "",
  );
  const { monitorProgress } = useProgress();

  const value = options.find((o) => o.value === selectedApp) ?? {
    label: "(none)",
    value: "",
  };

  if (currentModel) {
    return (
      <div className="flex flex-col gap-2 text-sm grow h-full">
        <p>
          Parameters define the information to be extracted from documents that
          are uploaded into this workspace.
        </p>
        <p>This workspace is currently using a custom model.</p>
      </div>
    );
  }

  if (availableModels.length === 0) {
    return (
      <Fragment>
        <div className="flex flex-col gap-2 text-sm grow h-full pb-12">
          <EmptyState title="Create parameters">
            <div className="max-w-[28rem] mt-4 m-auto flex flex-col gap-2">
              <p>
                Parameters define the information to be extracted from documents
                that are uploaded into this workspace.
              </p>
              {!currentModel && (
                <p>
                  This workspace does not currently have parameters configured.
                </p>
              )}
              <div className="mt-4">
                <form
                  action={monitorProgress(
                    createNewWorkspaceModel.bind(null, workspaceId),
                  )}
                >
                  <Submit
                    icon={
                      <PlusIcon
                        className="-ml-0.5 h-5 w-5"
                        aria-hidden="true"
                      />
                    }
                  >
                    Create new parameters
                  </Submit>
                </form>
              </div>
            </div>
          </EmptyState>
        </div>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <div className="mb-6 flex flex-col gap-2 text-sm">
        <p>
          Parameters define the information to be extracted from documents that
          are uploaded into this workspace.
        </p>
        {!currentModel && (
          <p>This workspace does not currently have parameters configured.</p>
        )}
      </div>
      <label className="font-bold mb-2 block">Parameters</label>
      <form
        action={monitorProgress(
          createNewWorkspaceModel.bind(null, workspaceId),
        )}
      >
        <p className="text-sm mb-3">
          Choose from existing parameters or{" "}
          <button
            type="submit"
            className="font-normal text-indigo-600 hover:text-indigo-400 hover:decoration-indigo-400 underline decoration-indigo-600 dark:text-indigo-400 hover:dark:text-indigo-200 hover:dark:decoration-indigo-200 dark:decoration-indigo-400 decoration-1 underline-offset-4"
          >
            create new custom parameters
          </button>
          .
        </p>
      </form>
      <div className="mt-4 max-w-64 flex flex-col gap-8 items-start">
        <form
          action={monitorProgress(
            connectWorkspaceModel.bind(null, workspaceId),
          )}
        >
          <Combobox
            className="h-[64px] min-w-[400px]"
            value={value}
            onChange={(value: any) => {
              setSelectedApp(value.value);
            }}
            options={options}
            renderOption={(option) => (
              <div className="flex flex-col items-start">
                <div className="text-normal font-semibold">{option.label}</div>
                <div className="text-xs opacity-70 font-light">
                  {option.sublabel}
                </div>
              </div>
            )}
          />
          <input type="hidden" name="modelId" value={selectedApp} />
          <Submit
            aria-disabled={!value.value}
            className="mt-6"
            onClick={(e) => {
              if (!value.value) {
                e.preventDefault();
              }
            }}
            icon={<SaveIcon className="w-2.5 h-2.5" />}
          >
            Save
          </Submit>
        </form>
      </div>
    </Fragment>
  );
};
