import { Fragment } from "react";

import Field from "@/components/field";
import { Submit } from "@/components/form-submit-button";
import getCurrentAdminUser from "@/lib/getAdminUser";
import prisma from "@/lib/prisma";
import { Button } from "@/components/button";

import { updateConfiguration, revokeConnection } from "./actions";
import Link from "next/link";

export default async function Page() {
  const { tenantId } = await getCurrentAdminUser();
  const apps = await prisma.app.findMany({
    include: {
      appPublisher: true,
      versions: {
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      },
      connections: {
        where: {
          tenantId,
        },
        include: {
          settings: true,
          oauthTokenset: true,
        },
      },
    },
  });

  const definitionsByName = apps.reduce<Record<string, any>>((acc, cur) => {
    const schema: any = cur.versions[0]?.schema;
    if (!schema) {
      return acc;
    }

    if (!cur.name) {
      return acc;
    }
    return {
      ...acc,
      [cur.name]: schema,
    };
  }, {});

  return (
    <div className="w-full p-12">
      <h1 className="text-2xl mb-8 font-bold">Find an Application</h1>
      <h2 className="text-xl mb-6 font-bold">Featured</h2>
      <ul className="flex flex-wrap gap-12 w-full">
        {apps.map((app) => {
          if (!app.name) {
            return null;
          }

          const definition = definitionsByName[app.name]?.["x-braille"];

          const settings = definition?.configuration.arguments?.settings;
          const [configuration] = app.connections;

          return (
            <li className="w-full" key={app.id}>
              <div className="border rounded py-8 px-6 dark:bg-midnight-800 dark:border-midnight-400">
                <h2 className="font-semibold text-xl mb-4">{app.name}</h2>
                {configuration ? (
                  <Fragment>
                    {!!settings?.length && (
                      <Fragment>
                        <h3 className="font-semibold text-base mb-3">
                          Settings
                        </h3>
                        <form action={updateConfiguration}>
                          {settings?.map(
                            (setting: {
                              name: string;
                              description: string;
                            }) => {
                              return (
                                <div key={setting.name}>
                                  <Field
                                    label={setting.description}
                                    type="text"
                                    name={`setting__${setting.name}`}
                                    defaultValue={
                                      configuration.settings.find(
                                        (s) => s.key === setting.name,
                                      )?.value ?? ""
                                    }
                                  />
                                </div>
                              );
                            },
                          )}
                          <input
                            type="hidden"
                            name="connectionId"
                            value={configuration.id}
                          />
                          <footer className="mt-4 flex justify-end">
                            <Submit>Save</Submit>
                          </footer>
                        </form>
                      </Fragment>
                    )}
                    <Link href={`/apps/${configuration.appId}`}>View</Link>
                    <form action={revokeConnection}>
                      <input
                        type="hidden"
                        name="connectionId"
                        value={configuration.id}
                      />
                      <Submit>Disconnect</Submit>
                    </form>
                  </Fragment>
                ) : (
                  <Fragment>
                    <Button
                      as="link"
                      href={`/api/apps/auth/authorize?applicationId=${app.id}`}
                    >
                      Connect
                    </Button>
                  </Fragment>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
