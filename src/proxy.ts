import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth enforcement is handled entirely by the (dashboard) layout server component.
// This proxy only handles the "already logged in → skip login page" redirect.
const COOKIE_NAME = "admin_token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from the login page
  if (pathname === "/admin/login") {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      return NextResponse.redirect(new URL("/admin/products", request.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/login",
};
