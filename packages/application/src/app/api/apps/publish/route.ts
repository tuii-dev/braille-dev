import { NextRequest } from "next/server";
import SwaggerParser from "@apidevtools/swagger-parser";

import { getCurrentSuperAdmin } from "@/lib/getCurrentSessionUser";

import prisma from "@/lib/prisma";
import { Prisma } from "@jptr/braille-prisma";
import { publishApp } from "@/lib/publish-app";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  await getCurrentSuperAdmin();

  const data: any = await request.json();

  const swagger: any = await SwaggerParser.dereference(data as any, {
    dereference: { circular: "ignore" },
  });

  Object.entries(swagger["x-braille"].entities).forEach(
    ([_, definition]: [string, any]) => {
      const { ["x-braille"]: __, ...rest } = swagger;
      definition.actions.forEach((action: any) => {
        action.spec = rest;
      });
    },
  );

  const appName = swagger["x-braille"].application.name;

  const application = await prisma.$transaction(async (tx) => {
    const existingApplication = await tx.app.findFirst({
      where: {
        name: swagger["x-braille"].application.name,
        appPublisher: {
          // TODO: Add integration name
          name: "Braille",
        },
      },
      include: {
        entityModels: true,
      },
    });

    if (existingApplication) {
      return existingApplication;
    }

    const publisher = await tx.appPublisher.findFirst({
      where: {
        name: "Braille",
      },
    });

    if (!publisher) {
      return tx.app.create({
        data: {
          name: appName,
          appPublisher: {
            create: {
              name: "Braille",
            },
          },
        },
      });
    }

    return tx.app.create({
      data: {
        name: appName,
        appPublisher: {
          connect: {
            id: publisher.id,
          },
        },
      },
    });
  });

  await publishApp(application.id, data);

  return Response.json({
    status: 200,
  });
}
