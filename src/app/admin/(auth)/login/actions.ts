"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  verifyCredentials,
  createSessionToken,
  COOKIE_NAME,
  EXPIRY_SECONDS,
} from "@/lib/auth";

type LoginState = { error?: string } | undefined;

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!email || !password) {
    return { error: "請填寫所有欄位。" };
  }

  if (!verifyCredentials(email, password)) {
    return { error: "帳號或密碼錯誤。" };
  }

  const token = await createSessionToken(email);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: EXPIRY_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/admin/products");
}
