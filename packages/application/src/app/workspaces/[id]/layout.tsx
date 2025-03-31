import { Suspense } from "react";

import { cookies } from "next/headers";

import { DocumentPlusIcon } from "@heroicons/react/24/outline";

import { Upload } from "@/components/upload";

import { updateDocumentsToWorkspace } from "./actions";
import { DocumentListAccordion } from "./components";
import { Layout } from "./(components)/layout";
import { WorkflowPanel } from "./(components)/workflow-panel";
import { UploadAccordion } from "./(components)/upload-accordion";
import { ConditionalSegment } from "./(components)/conditional-segment";

type RouteLayoutProps = {
  params: any;
  workspaceDocuments: React.ReactNode;
  children: React.ReactNode;
};

export default async function RouteLayout({
  params,
  workspaceDocuments,
  children,
}: RouteLayoutProps) {
  const workspaceId = params.id;

  const getLayout = () => {
    const layout = cookies().get(`react-resizable-panels:layout`)?.value;
    return layout ? JSON.parse(layout) : [0.5, 0.5];
  };

  return (
    <ConditionalSegment fallback={<Suspense>{children}</Suspense>}>
      <div className="bg-stone-50 dark:bg-charcoal-980 grow">
        <Layout
          workspaceId={workspaceId}
          layout={getLayout()}
          left={
            <div className="p-5 pr-0 h-full flex flex-col gap-4">
              <div className="min-h-40">
                <UploadAccordion>
                  <Upload
                    className="w-full h-full @container"
                    action={updateDocumentsToWorkspace.bind(null, workspaceId)}
                  >
                    <DocumentPlusIcon
                      className="h-7 w-7 flex-none dark:text-gray dark:text-gray-300"
                      aria-hidden="true"
                    />
                    <span className="@sm:block hidden mt-2 text-xs lg:text-sm font-normal text-[#595F75] dark:text-gray-300 text-nowrap overflow-ellipsis">
                      Upload a document to start a job
                    </span>
                  </Upload>
                </UploadAccordion>
              </div>
              <div className="grow">
                <DocumentListAccordion>
                  <Suspense>{workspaceDocuments}</Suspense>
                </DocumentListAccordion>
              </div>
            </div>
          }
          right={
            <WorkflowPanel>
              <Suspense>{children}</Suspense>
            </WorkflowPanel>
          }
        />
      </div>
    </ConditionalSegment>
  );
}
