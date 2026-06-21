"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/components/cart-provider";
import { defaultCategoryLabel } from "@/lib/custom-category-config";

const PAGE_OPTIONS = [12, 24, 48];

export function ProductBrowser({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(12);
  const [page, setPage] = useState(1);
  const { items, discountedTotal, clear } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handleCategoryChange = (value: string) => {
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  const selectedCategory = searchParams.get("category") ?? "ALL";

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      const label = product.customCategory ?? defaultCategoryLabel;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      const label = product.customCategory ?? defaultCategoryLabel;
      const matchCategory = selectedCategory === "ALL" || label === selectedCategory;
      const matchQuery =
        q.length === 0 ||
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [products, selectedCategory, query]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const currentItems = filtered.slice(start, start + pageSize);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col text-sm font-medium text-zinc-600">
            關鍵字搜尋
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="輸入車款、零件、特色..."
              className="mt-2 rounded-xl border border-zinc-300 px-4 py-2 text-base"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-zinc-600">
            自訂分類
            <select
              className="mt-2 rounded-xl border border-zinc-300 px-4 py-2"
              value={selectedCategory}
              onChange={(event) => handleCategoryChange(event.target.value)}
            >
              <option value="ALL">全部分類（{products.length}）</option>
              {categories.map(([name, count]) => (
                <option key={name} value={name}>
                  {name}（{count}）
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-sm font-medium text-zinc-600">
            每頁顯示數
            <select
              className="mt-2 rounded-xl border border-zinc-300 px-4 py-2"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
            >
              {PAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} 項/頁
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600">
          <span>
            共 {filtered.length} 項，頁次 {currentPage}/{totalPages}
          </span>
          <div className="flex gap-2">
            <button
              className="rounded-full border border-zinc-300 px-3 py-1 disabled:opacity-40"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              上一頁
            </button>
            <button
              className="rounded-full border border-zinc-300 px-3 py-1 disabled:opacity-40"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              下一頁
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr_1fr]">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {currentItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <aside className="space-y-4 rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-orange-500">購物車</p>
            <h4 className="mt-2 text-xl font-semibold">本機暫存（9折優惠）</h4>
            <p className="mt-1 text-sm text-zinc-600">目前 {items.length} 件商品</p>
          </div>
          <ul className="space-y-2 text-sm text-zinc-600">
            {items.length === 0 && <li>尚未加入任何商品</li>}
            {items.map((item) => (
              <li key={item.cartId} className="flex items-center justify-between gap-3">
                <span className="line-clamp-1">{item.name}</span>
                <span className="text-xs text-orange-600">9折 NT$ {item.price ? Math.round(item.price * 0.9).toLocaleString("zh-TW") : "—"}</span>
              </li>
            ))}
          </ul>
          <div className="rounded-2xl bg-white p-4 text-sm">
            <p className="text-zinc-500">結帳金額（9折）：</p>
            <p className="text-2xl font-semibold">NT$ {discountedTotal.toLocaleString("zh-TW", { minimumFractionDigits: 0 })}</p>
            <p className="text-xs text-zinc-500">＊僅為官網暫存購物車，實際結帳仍需至蝦皮完成。</p>
            <button
              onClick={clear}
              className="mt-3 w-full rounded-full border border-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-900 hover:text-white"
              disabled={items.length === 0}
            >
              清空購物車
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
