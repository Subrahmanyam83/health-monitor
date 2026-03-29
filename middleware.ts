import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const country = request.headers.get("x-vercel-ip-country") ?? "";
  const userAgent = request.headers.get("user-agent") ?? "";
  const isIphone = userAgent.includes("iPhone");

  const blocked = country === "IN" || isIphone;

  if (blocked && request.nextUrl.pathname.startsWith("/alcohol")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Forward to the page as a request header so home can hide the card
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-hide-alcohol", blocked ? "1" : "0");
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/", "/alcohol/:path*"],
};
