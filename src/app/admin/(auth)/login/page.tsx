"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { loginAction } from "./actions";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-orange-500">
            Admin
          </p>
          <h1 className="text-2xl font-semibold text-zinc-900">登入管理後台</h1>
        </div>

        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-zinc-700"
            >
              電子郵件
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="admin@example.com"
              className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-400/20 transition-shadow"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-zinc-700"
            >
              密碼
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-400/20 transition-shadow"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="mt-1 w-full">
            {pending ? "登入中…" : "登入"}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-400">
          <Link href="/" className="hover:text-zinc-600">
            返回首頁
          </Link>
        </div>
      </div>
    </div>
  );
}
