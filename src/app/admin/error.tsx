"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-red-500">錯誤</p>
        <h1 className="mt-2 text-xl font-semibold text-zinc-900">頁面載入失敗</h1>
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-left font-mono text-xs text-red-700 break-all">
          {error.message || "Unknown error"}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            重試
          </button>
          <a
            href="/admin/products"
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
          >
            返回商品列表
          </a>
        </div>
      </div>
    </div>
  );
}
