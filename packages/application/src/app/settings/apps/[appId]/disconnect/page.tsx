import { notFound } from "next/navigation";

import getCurrentAdminUser from "@/lib/getAdminUser";
import prisma from "@/lib/prisma";

export default async function Page({ params }: { params: any }) {
  const { tenantId } = await getCurrentAdminUser();

  const applicationId = params.appId;

  if (!applicationId) {
    return notFound();
  }

  await prisma.appOAuthTokenSet.deleteMany({
    where: {
      tenantId,
      connections: {
        some: {
          app: {
            id: applicationId,
          },
        },
      },
    },
  });

  return (
    <div>
      <h1>Disconnected</h1>
      <p>The app has now been disconnected.</p>
    </div>
  );
}
