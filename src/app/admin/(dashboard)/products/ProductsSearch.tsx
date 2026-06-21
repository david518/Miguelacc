"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

type Option = { value: string; label: string };

export function ProductsSearch({
  defaultQ,
  defaultCategory,
  categoryOptions,
}: {
  defaultQ: string;
  defaultCategory: string;
  categoryOptions: Option[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const params = new URLSearchParams();
    const q = (data.get("q") as string).trim();
    const cat = data.get("category") as string;
    if (q) params.set("q", q);
    if (cat !== "ALL") params.set("category", cat);
    params.set("page", "1");
    router.push(`/admin/products?${params}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 flex flex-wrap gap-3 rounded-xl border border-zinc-200 bg-white p-4"
    >
      <input
        ref={inputRef}
        name="q"
        type="text"
        defaultValue={defaultQ}
        placeholder="搜尋商品名稱或描述..."
        className="h-9 flex-1 min-w-48 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-400/20"
      />
      <select
        name="category"
        defaultValue={defaultCategory}
        className="h-9 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 outline-none focus-visible:border-zinc-400"
      >
        {categoryOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="h-9 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
      >
        搜尋
      </button>
      <a
        href="/admin/products"
        className="flex h-9 items-center rounded-lg border border-zinc-200 px-4 text-sm text-zinc-500 hover:bg-zinc-50 transition-colors"
      >
        清除
      </a>
    </form>
  );
}
