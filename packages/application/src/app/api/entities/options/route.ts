import { NextRequest } from "next/server";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { tenantId } = await getCurrentSessionUser();

  const { searchParams } = new URL(request.url);

  const results = await fetch(
    process.env.WORKER_ENDPOINT +
      `/search?${new URLSearchParams({
        q: searchParams.get("query")!,
        tenantId,
        entityModelId: searchParams.get("entityModelId")!,
        take: "15",
      })}`,
  ).then((res) => res.json());

  return Response.json({
    data: results.map(
      (
        item: any,
      ): { value: string; label: string; sublabel: string | undefined } => {
        return {
          value: item.id,
          label: item.data.DisplayName ?? item.data.Name,
          sublabel: undefined,
        };
      },
    ),
  });
}
