import prisma from "@/lib/prisma";
import { Prisma } from "@jptr/braille-prisma";
import SwaggerParser from "@apidevtools/swagger-parser";

export const publishApp = async (appId: string, data: Prisma.JsonObject) => {
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

  await prisma.$transaction(async (tx) => {
    const applicationVersion = await tx.appVersion.create({
      data: {
        app: {
          connect: {
            id: appId,
          },
        },
        schema: data,
      },
    });

    const entityTransactions = Object.entries(
      swagger["x-braille"].entities,
    ).map(async ([name, definition]: [string, any]) => {
      const model = await tx.model.findFirst({
        where: {
          name,
          appEntityModel: {
            appId,
          },
        },
      });

      if (model) {
        return tx.model.update({
          where: {
            id: model.id,
          },
          data: {
            versions: {
              create: {
                appVersionModelVersion: {
                  create: {
                    appVersionId: applicationVersion.id,
                  },
                },
                schema: {
                  create: {
                    schema: definition.schema as {},
                  },
                },
              },
            },
          },
        });
      }

      return tx.appVersionModelVersion.create({
        data: {
          appVersion: {
            connect: {
              id: applicationVersion.id,
            },
          },
          modelVersion: {
            create: {
              schema: {
                create: {
                  schema: definition.schema as {},
                },
              },
              model: {
                create: {
                  name,
                  appEntityModel: {
                    create: {
                      appId,
                    },
                  },
                },
              },
            },
          },
        },
      });
    });

    await Promise.all(entityTransactions);
  });
};
