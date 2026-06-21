import Link from "next/link";
import { getAllProducts, getDbNativeProducts } from "@/lib/products";
import { customCategoryConfig, defaultCategoryLabel } from "@/lib/custom-category-config";
import { ProductsSearch } from "./ProductsSearch";

const PAGE_SIZE = 25;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const category = typeof sp.category === "string" ? sp.category : "ALL";
  const page = Math.max(1, Number(sp.page ?? "1"));

  const dbProducts = await getDbNativeProducts();
  const allProducts = [...dbProducts, ...getAllProducts()];

  const filtered = allProducts.filter((p) => {
    const label = p.customCategory ?? defaultCategoryLabel;
    const matchCat = category === "ALL" || label === category;
    const matchQ =
      q.length === 0 ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const categoryOptions = [
    { value: "ALL", label: `全部商品（${allProducts.length}）` },
    ...customCategoryConfig.map((c) => {
      const count = allProducts.filter(
        (p) => (p.customCategory ?? defaultCategoryLabel) === c.label
      ).length;
      return { value: c.label, label: `${c.label}（${count}）` };
    }),
  ];

  function buildLink(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category !== "ALL") params.set("category", category);
    params.set("page", String(currentPage));
    Object.entries(overrides).forEach(([k, v]) => params.set(k, v));
    return `/admin/products?${params}`;
  }

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">商品管理</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            共 {allProducts.length} 件商品（蝦皮匯入 {getAllProducts().length} ＋ 自建 {dbProducts.length}）
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
        >
          ＋ 新增商品
        </Link>
      </div>

      {/* Search & filter */}
      <ProductsSearch
        defaultQ={q}
        defaultCategory={category}
        categoryOptions={categoryOptions}
      />

      {/* Results info */}
      <div className="mb-3 flex items-center justify-between text-sm text-zinc-500">
        <span>
          共 {filtered.length} 件，第 {currentPage}/{totalPages} 頁
        </span>
        <div className="flex gap-2">
          {currentPage > 1 && (
            <Link
              href={buildLink({ page: String(currentPage - 1) })}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1 text-xs hover:bg-zinc-50"
            >
              上一頁
            </Link>
          )}
          {currentPage < totalPages && (
            <Link
              href={buildLink({ page: String(currentPage + 1) })}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1 text-xs hover:bg-zinc-50"
            >
              下一頁
            </Link>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3 text-left">商品名稱</th>
              <th className="px-4 py-3 text-left">分類</th>
              <th className="px-4 py-3 text-right">價格 (TWD)</th>
              <th className="px-4 py-3 text-right">規格數</th>
              <th className="px-4 py-3 text-right">圖片</th>
              <th className="px-4 py-3 text-center">庫存狀態</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {pageItems.map((p) => {
              const price = p.price ?? p.variations[0]?.price;
              const totalStock = p.variations.reduce(
                (sum, v) => sum + (v.stock ?? 0),
                0
              );
              const inStock = p.variations.length === 0 || totalStock > 0;
              const category = p.customCategory ?? defaultCategoryLabel;

              return (
                <tr
                  key={p.id}
                  className="hover:bg-zinc-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="max-w-xs truncate font-medium text-zinc-900">
                      {p.name}
                    </p>
                    <p className="text-xs text-zinc-400">ID: {p.id}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{category}</td>
                  <td className="px-4 py-3 text-right text-zinc-700">
                    {price
                      ? `NT$ ${Number(price).toLocaleString("zh-TW")}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-500">
                    {p.variations.length}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-500">
                    {p.images.length}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        inStock
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {inStock ? "有庫存" : "缺貨"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:underline"
                      >
                        編輯
                      </Link>
                      <Link
                        href={`/products/${p.id}`}
                        target="_blank"
                        className="text-xs text-orange-500 hover:underline"
                      >
                        前台 ↗
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {pageItems.length === 0 && (
          <div className="py-16 text-center text-sm text-zinc-400">
            找不到符合條件的商品
          </div>
        )}
      </div>

      {/* Bottom pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
            const p = i + 1;
            return (
              <Link
                key={p}
                href={buildLink({ page: String(p) })}
                className={`flex size-8 items-center justify-center rounded-lg text-xs transition-colors ${
                  p === currentPage
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {p}
              </Link>
            );
          })}
          {totalPages > 10 && (
            <span className="px-2 py-1 text-xs text-zinc-400">
              … / {totalPages}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
