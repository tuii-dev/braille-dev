import { NextRequest } from "next/server";
import { Parser } from "@json2csv/plainjs";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import prisma from "@/lib/prisma";

import flatten from "./transform";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { tenantId } = await getCurrentSessionUser();
  const format = request.nextUrl.searchParams.get("format") ?? "json";
  const jobIds = request.nextUrl.searchParams.get("jobId")?.split(",") ?? [];

  const data = (
    await prisma.data.findMany({
      where: {
        tenantId,
        dataExtractionJob: {
          is: {
            tenantId,
            status: "FINISHED",
            id: { in: jobIds },
          },
        },
      },
    })
  ).map((item) => item.json);

  if (format === "csv") {
    const parser = new Parser({
      transforms: [flatten({ objects: true, arrays: true, separator: "." })],
    });
    const csv = parser.parse(data);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="braille-data-export.csv"`,
      },
    });
  }

  return Response.json(data, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="braille-data-export.json"`,
    },
  });
}
