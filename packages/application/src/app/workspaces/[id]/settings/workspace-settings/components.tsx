import { redirect } from "next/navigation";

import { Submit } from "@/components/form-submit-button";
import Field from "@/components/field";
import prisma from "@/lib/prisma";
import getCurrentAdminUser from "@/lib/getAdminUser";

import { createWorkspaceModel } from "../actions";
import { WorkspaceModelEdit } from "@/components/workspace-model";

import { EntityModelCheckbox, EntityModelForm } from "../components";

export const NewModelForm = ({ workspaceId }: { workspaceId: string }) => {
  return (
    <form action={createWorkspaceModel}>
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <Field type="text" label="Name" name="name" />
      <Submit>Create Parameters</Submit>
    </form>
  );
};

export const ParametersManagement = async ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  const { tenantId } = await getCurrentAdminUser();
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      tenantId,
    },
    include: {
      models: {
        include: {
          model: {
            include: {
              versions: {
                include: {
                  appVersionModelVersion: true,
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
          tenantId,
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
                                id: workspaceId,
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
    return redirect("/workspaces/[id]");
  }

  const workspaceModel = workspace.models[0]?.model;
  const workspaceModelVersion = workspaceModel?.versions[0];

  if (workspaceModelVersion?.appVersionModelVersion) {
    <div className="p-8 w-full max-w-lg">
      {workspace.tenant.appConnections.map((appConnection) => {
        return (
          <div key={appConnection.id}>
            <h2 className="font-semibold text-lg mb-3">
              {appConnection.app.name}
            </h2>
            <EntityModelForm
              connectedModelIds={appConnection.app.entityModels
                .filter((model) => model.model.workspaces.length)
                .map((model) => model.model.id)}
            >
              <input type="hidden" name="workspaceId" value={workspace.id} />
              <ul className="flex flex-col gap-y-3">
                {appConnection.app.entityModels.map((entityModel) => (
                  <li key={entityModel.model.id}>
                    <EntityModelCheckbox
                      label={entityModel.model.name ?? "Unknown"}
                      name="entity_model"
                      value={entityModel.model.id}
                    />
                  </li>
                ))}
              </ul>
            </EntityModelForm>
          </div>
        );
      })}
    </div>;
  }

  if (workspaceModel) {
    return <WorkspaceModelEdit modelId={workspaceModel.id} />;
  }

  return (
    <div className="py-8 w-full flex items-center justify-center">
      <NewModelForm workspaceId={workspace.id} />
    </div>
  );
};
