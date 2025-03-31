"use server";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";

import { schema, string_to_slug } from "./utils";
import { Template } from "@/app/workspaces/templates";
import { revalidatePath } from "next/cache";

function mapFormDataToTemplate(formData: FormData): Template {
  const templateString = formData.get("workspaceTemplate")?.toString();

  if (!templateString) {
    throw new Error("Template data is missing from the FormData.");
  }

  try {
    // Parse the workspaceTemplate as JSON
    const parsedTemplate = JSON.parse(templateString);

    // Validate required fields for Template
    if (!parsedTemplate.id || !parsedTemplate.name || !parsedTemplate.model) {
      throw new Error(
        "Invalid template data: Missing required fields (id, name, or model).",
      );
    }

    // Construct and return a Template object
    const template: Template = {
      id: parsedTemplate.id,
      name: parsedTemplate.name,
      categories: parsedTemplate.categories || [],
      description: parsedTemplate.description || "",
      createdBy: parsedTemplate.createdBy,
      tenantId: parsedTemplate.tenantId,
      model: parsedTemplate.model,
      apps: parsedTemplate.apps || [],
      settings: parsedTemplate.settings || [],
      publicTemplate: parsedTemplate.publicTemplate || false,
      tenantPublisher: parsedTemplate.tenantPublisher || false,
    };

    return template;
  } catch (error) {
    console.error("Failed to parse or validate template data:", error);
    throw new Error(
      "The provided template data is invalid. Please check the workspace template.",
    );
  }
}

export async function createWorkspace(formData: FormData) {
  const { isAdmin } = await getCurrentSessionUser();
  const workspaceName = formData.get("name")?.toString().trim() || "";
  const workspaceTemplate = formData.get("workspaceTemplate");

  if (!isAdmin) {
    return {
      errors: {
        form: ["You must be an admin to create a workspace."],
      },
    };
  }

  if (!workspaceName) {
    return {
      errors: {
        name: ["Workspace name is required."],
      },
    };
  }

  if (!workspaceTemplate) {
    const result = await createBlankWorkspace(workspaceName);
    return result;
  }

  try {
    const template = mapFormDataToTemplate(formData);
    if (template) {
      const result = await createWorkspaceFromTemplate(workspaceName, template);
      revalidatePath("/workspaces", "layout");
      return result; // Pass the result (including workspace URL) to the client
    } else {
      console.error(
        "Template mapping failed. Cannot create workspace from template.",
      );
      return {
        errors: {
          form: ["Failed to create workspace from the provided template."],
        },
      };
    }
  } catch (error) {
    console.error("Error while creating workspace from template:", error);
    return {
      errors: {
        form: ["An error occurred while processing the template."],
      },
    };
  }
}

export async function createBlankWorkspace(workspaceName: string) {
  const { user } = await getCurrentSessionUser();

  const workspace = await prisma.workspace.create({
    data: {
      name: workspaceName,
      slug: string_to_slug(workspaceName),
      tenant: {
        connect: {
          id: user.tenants[0].id,
        },
      },
    },
  });
  redirect(`/workspaces/${workspace.id}`);
}

async function createWorkspaceFromTemplate(
  workspaceName: string,
  template: Template,
) {
  const { tenantId } = await getCurrentSessionUser();

  if (!template.model || !template.model.schema) {
    return {
      errors: {
        form: ["Template model not found."],
      },
    };
  }

  // Create the workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: workspaceName,
      slug: string_to_slug(workspaceName),
      tenant: {
        connect: { id: tenantId },
      },
    },
  });

  // Create the model and model version with schema
  const model = await prisma.model.create({
    data: {
      name: template.model.name || workspaceName,
      archived: false,
      tenant: { connect: { id: tenantId } },
      versions: {
        create: {
          schema: {
            create: {
              schema: template.model.schema,
              tenant: { connect: { id: tenantId } },
            },
          },
          tenant: { connect: { id: tenantId } },
        },
      },
    },
  });

  // Link the model to the workspace
  await prisma.workspaceModel.create({
    data: {
      workspace: { connect: { id: workspace.id } },
      model: { connect: { id: model.id } },
      tenant: { connect: { id: tenantId } },
    },
  });

  // Associate apps with the model
  if (template.apps && template.apps.length > 0) {
    for (const appData of template.apps) {
      const app = await prisma.app.findUnique({
        where: { id: appData.id },
      });

      if (app) {
        await prisma.appEntityModel.create({
          data: {
            app: { connect: { id: app.id } },
            model: { connect: { id: model.id } },
          },
        });
      } else {
        console.warn(`App with id ${appData.id} not found.`);
      }
    }
  }

  // Handle settings (if necessary)
  if (template.settings && template.settings.length > 0) {
    // Implement logic to handle settings
  }

  // Return workspace URL instead of redirecting
  return {
    success: true,
    workspaceUrl: `/workspaces/${workspace.id}`,
  };
}
