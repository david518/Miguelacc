import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "admin_token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login" || pathname.startsWith("/admin/logout")) {
    return NextResponse.next();
  }

  // Optimistic check: just verify the cookie exists.
  // Full JWT verification is done in the dashboard layout (server component).
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
