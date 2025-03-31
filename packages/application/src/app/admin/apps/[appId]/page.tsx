import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";

import { AppEditor, EditorProvider, SubmitButton } from "./components";

export default async function Page() {
  const app = await prisma.app.findFirst({
    include: {
      appOAuthClientSecret: true,
      versions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!app) {
    return notFound();
  }

  const currentVersion = app.versions[0];

  const value = currentVersion?.schema
    ? JSON.stringify(currentVersion.schema, null, 2)
    : "{}";

  return (
    <EditorProvider appId={app.id} value={value}>
      <div className="w-full h-full flex flex-col border-b border-midnight-400 dark:bg-midnight-900">
        <div className="w-full flex py-6 px-8 items-center justify-between">
          <div>
            <h1 className="font-semibold text-lg">{app.name}</h1>
            {currentVersion && (
              <div className="text-xs font-mono text-gray-400">
                <p>Created: {currentVersion.createdAt.toUTCString()}</p>
              </div>
            )}
          </div>
          <div>
            <SubmitButton />
          </div>
        </div>
        <div className="grow">
          <AppEditor />
        </div>
      </div>
    </EditorProvider>
  );
}
