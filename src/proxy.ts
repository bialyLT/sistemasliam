import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  sessionCookie,
  verifySessionToken,
} from "@/features/admin/services/session";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(sessionCookie.name)?.value;
  const authed = verifySessionToken(token);
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    if (authed) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!authed) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};