import type { NextRequest } from "next/server";
import Redis from "ioredis";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { tenantId } = await getCurrentSessionUser();

  const sub = new Redis({
    host: process.env.REDIS_HOST,
    reconnectOnError: (error) => {
      const targetErrors = [/READONLY/, /ETIMEDOUT/];
      return targetErrors.some((targetError) =>
        targetError.test(error.message),
      );
    },
    connectTimeout: 17000,
    maxRetriesPerRequest: 4,
    retryStrategy: (times) => Math.min(times * 30, 1000),
  });

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  sub.psubscribe(`${tenantId}:*`, (err, count) => {
    if (err) {
      console.error("failure", err);
    }
  });

  writer.write(encoder.encode("event: message\n"));
  writer.write(
    encoder.encode(
      `data: ${JSON.stringify({ action: "ready", subject: "connection" })}\n\n`,
    ),
  );

  const sendKeepAlive = () => {
    writer.write(encoder.encode("event: message\n"));
    writer.write(
      encoder.encode(
        `data: ${JSON.stringify({
          action: "keep-alive",
          subject: "connection",
        })}\n\n`,
      ),
    );
  };

  const sendMessage = (_pattern: string, _channel: string, message: string) => {
    writer.write(encoder.encode("event: message\n"));
    writer.write(encoder.encode(`data: ${message}\n\n`));
  };

  const keepAlive = setInterval(sendKeepAlive, 30000);

  sub.on("pmessage", sendMessage);

  writer.closed.then(() => {
    sub.off("pmessage", sendMessage);
    sub.unsubscribe();
    clearInterval(keepAlive);
  });

  request.signal.onabort = () => {
    clearInterval(keepAlive);
    sub.unsubscribe();
    writer.close();
  };

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
