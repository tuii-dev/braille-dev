import prisma from "../prisma";

export class Workspace {
  constructor(
    public id: string,
    public name: string,
    public tenantId: string,
  ) {}

  static async create({ tenantId, name }: { tenantId: string; name: string }) {
    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug: name.toLowerCase().replace(" ", "-"),
        tenantId: tenantId,
      },
    });

    return new Workspace(workspace.id, workspace.name, workspace.tenantId);
  }

  // createModel({ name }: { name: string }) {
  //   return WorkspaceModel.create({ tenantId: this.tenantId, name });
  // }
}

export class WorkspaceModel {
  constructor(
    public id: string,
    public name: string,
    public workspaceId: string,
    public tenantId: string,
  ) {}

  static async create({ workspaceId, tenantId, name }) {}
}
