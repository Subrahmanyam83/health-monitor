import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  // Block unauthenticated access to all non-public routes
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // Existing alcohol-blocking logic for Indian users
  const country = request.headers.get("x-vercel-ip-country") ?? "";
  const blocked = country === "IN";

  if (blocked && request.nextUrl.pathname.startsWith("/sip-log")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-hide-alcohol", blocked ? "1" : "0");
  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
