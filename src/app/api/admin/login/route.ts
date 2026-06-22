import { NextRequest, NextResponse } from "next/server";
import {
  verifyCredentials,
  createSessionToken,
  COOKIE_NAME,
  EXPIRY_SECONDS,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!email || !password || !verifyCredentials(email, password)) {
    return NextResponse.json({ error: "帳號或密碼錯誤。" }, { status: 401 });
  }

  const token = await createSessionToken(email);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: EXPIRY_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
