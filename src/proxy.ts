import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only handle /admin paths
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow login and logout through without auth check
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/logout")
  ) {
    // If already authenticated, redirect away from login
    if (pathname === "/admin/login") {
      const token = request.cookies.get(COOKIE_NAME)?.value;
      if (token) {
        const session = await verifySessionToken(token);
        if (session) {
          return NextResponse.redirect(new URL("/admin/products", request.url));
        }
      }
    }
    return NextResponse.next();
  }

  // Require authentication for all other /admin/* paths
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const session = await verifySessionToken(token);
  if (!session) {
    const response = NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
