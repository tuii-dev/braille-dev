import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession, touchSession } from "@auth0/nextjs-auth0/edge";

export async function middleware(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/api/auth/login?", request.url));
  }

  if (!("next-action" in request)) {
    await touchSession();
  }

  // const { device } = userAgent(request);
  // if (device.type === "mobile") {
  //   const url = request.nextUrl;
  //   const viewport = device.type === "mobile" ? "mobile" : "desktop";
  //   url.searchParams.set("viewport", viewport);
  //   return NextResponse.rewrite(url);
  // }
}

export const config = {
  matcher: [
    "/((?!api/auth|api/apps/publish|_next/static|_next/image|favicon.ico|.*\\..*|healthcheck).*)",
  ],
};
