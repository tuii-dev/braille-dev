import { redirect } from "next/navigation";

import { Submit } from "@/components/form-submit-button";
import Field from "@/components/field";
import prisma from "@/lib/prisma";
import getCurrentAdminUser from "@/lib/getAdminUser";

import { updateWorkspace } from "../actions";
import { ArchiveWorkspaceButton } from "./archive-workspace-button";

export default async function Page({ params }: { params: any }) {
  const { tenantId } = await getCurrentAdminUser();

  const workspace = await prisma.workspace.findFirst({
    where: {
      id: params.id,
      tenantId,
      archived: { not: true },
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

  return (
    <div className="flex flex-col gap-y-12 pt-8">
      <div className="px-16">
        <div className=" w-full max-w-lg">
          <form action={updateWorkspace} className="flex flex-col gap-y-8">
            <input type="hidden" name="workspaceId" value={workspace.id} />
            <Field
              type="text"
              name="name"
              label="Display Name"
              defaultValue={workspace.name}
            />
            <Field
              type="text"
              name="description"
              label="Description"
              defaultValue={workspace.description ?? ""}
              helperText="A short description of the workspace. This would be information you would pass to an assistant. This is optional."
            />
            <Field
              workspaceId={workspace.id}
              type="color"
              name="color"
              label="Workspace Color"
              helperText="The color of the workspace. Click on the color to change, click anywhere to accept. Enter to accept, escape to reset."
              defaultValue={workspace.color ?? "#1d4ed8"}
            />
            <footer className="flex mt-2 justify-between">
              <Submit>Save settings</Submit>
              <ArchiveWorkspaceButton
                workspaceId={workspace.id}
                workspaceName={workspace.name}
              />
            </footer>
          </form>
        </div>
      </div>
    </div>
  );
}
