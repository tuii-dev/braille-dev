import https from "https";
import { PassThrough } from "stream";

import { NextRequest } from "next/server";

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";

import { v4 as uuidv4 } from "uuid";

import { MimeType } from "@jptr/braille-prisma";
import prisma from "@/lib/prisma";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!request.body) {
    throw new Error("No body");
  }

  const s3 = new S3Client({
    region: process.env.AWS_DEFAULT_REGION,
    forcePathStyle: true,
  });

  const { fileId } = await request.json();

  const file = await prisma.file.findUnique({
    where: {
      id: fileId,
    },
    include: {
      document: true,
    },
  });

  if (!file) {
    throw new Error("Could not find file.");
  }

  const command = new GetObjectCommand({
    Bucket: process.env.S3_UPLOAD_BUCKET,
    Key: file.key,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 300 });

  const response = await fetch(
    `${process.env.PDF_CO_API_ENDPOINT}/v1/pdf/convert/to/png`,
    {
      body: JSON.stringify({
        url,
      }),
      method: "post",
      headers: new Headers({
        "x-api-key": process.env.PDF_CO_API_KEY!,
        "Content-Type": "application/json",
      }),
    },
  ).then((res) => res.json());

  const promises = response.urls.map(async (url: string, index: number) => {
    let createdFile;
    const passthrough = new PassThrough();
    const extension = "png";
    const key = `${uuidv4()}.${extension}`;

    const upload = new Upload({
      client: s3,
      params: {
        Bucket: process.env.S3_UPLOAD_BUCKET,
        Body: passthrough,
        Key: key,
        ContentType: extension,
      },
    });

    await prisma.$transaction(async (tx) => {
      https.get(url, function (response) {
        response.pipe(passthrough);
      });

      createdFile = await tx.file.create({
        data: {
          key,
          tenantId: file.tenantId,
          documentId: file.document?.id,
          type: MimeType.PNG,
          idx: index,
        },
      });

      await upload.done();
    });

    return createdFile;
  });

  const files = await Promise.allSettled(promises);

  return Response.json(files);
}
