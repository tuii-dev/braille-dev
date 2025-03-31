import { redirect } from "next/navigation";

import getCurrentAdminUser from "@/lib/getAdminUser";
import prisma from "@/lib/prisma";
import { WorkspaceModelEdit } from "@/components/workspace-model";

import { ModelPicker } from "../workspace-settings/client";
import { fetchAvailableModels } from "../workspace-settings/actions";
import { cn } from "@/lib/utils";
import { ProgressProvider } from "@/components/client";


export default async function Page({ params }: { params: any }) {
  const { tenantId } = await getCurrentAdminUser();

  const workspace = await prisma.workspace.findFirst({
    where: {
      id: params.id,
      tenantId,
    },
    include: {
      models: {
        include: {
          model: {
            include: {
              versions: {
                include: {
                  appVersionModelVersion: {
                    include: {
                      appVersion: {
                        include: {
                          app: true,
                        },
                      },
                    },
                  },
                },
                take: 1,
                orderBy: {
                  createdAt: "desc",
                },
              },
            },
          },
        },
        where: {
          OR: [{ tenantId }, { tenant: undefined }],
        },
      },
      tenant: {
        include: {
          appConnections: {
            include: {
              app: {
                include: {
                  entityModels: {
                    include: {
                      model: {
                        include: {
                          versions: {
                            take: 1,
                            orderBy: {
                              createdAt: "desc",
                            },
                          },
                          workspaces: {
                            where: {
                              workspace: {
                                id: params.id,
                                tenantId,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!workspace) {
    return redirect("/");
  }

  const availableModels = await fetchAvailableModels();

  const workspaceModel = workspace.models[0]?.model;
  const workspaceModelVersion = workspaceModel?.versions[0];
  const isUsingAppModel = !!workspaceModelVersion?.appVersionModelVersion;
  const appName =
    workspaceModelVersion?.appVersionModelVersion?.appVersion.app.name;
  const currentModel = workspaceModel
    ? {
        appName,
        id: workspaceModel.id,
        name: workspaceModel.name,
      }
    : null;
  const editting = workspaceModel && !isUsingAppModel;

  return (
    <div className="flex flex-col w-full h-full grow relative">

        <div
          className={cn("px-12 pt-8 mb-12", {
            "h-full": !editting,
          })}
        >
          <ModelPicker
            workspaceId={workspace.id}
            availableModels={availableModels}
            currentModel={currentModel}
          />
        </div>
        {editting && <WorkspaceModelEdit modelId={workspaceModel.id} />}
    
    </div>
  );
}
