import { getAllProducts } from "@/lib/products";
import {
  customCategoryConfig,
  defaultCategoryLabel,
} from "@/lib/custom-category-config";
import Link from "next/link";

export default function AdminCategoriesPage() {
  const products = getAllProducts();

  // Build counts from real data
  const countMap = new Map<string, number>();
  for (const p of products) {
    const label = p.customCategory ?? defaultCategoryLabel;
    countMap.set(label, (countMap.get(label) ?? 0) + 1);
  }

  const categories = customCategoryConfig.map((c) => ({
    label: c.label,
    keywords: c.keywords,
    count: countMap.get(c.label) ?? 0,
  }));

  const uncategorized = countMap.get(defaultCategoryLabel) ?? 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-900">分類管理</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          依車型關鍵字自動分類，共 {categories.length} 個分類 ＋「{defaultCategoryLabel}」兜底。
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3 text-left">分類名稱</th>
              <th className="px-4 py-3 text-left">關鍵字（匹配規則）</th>
              <th className="px-4 py-3 text-right">商品數</th>
              <th className="px-4 py-3 text-right">佔比</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {categories.map((c) => (
              <tr key={c.label} className="hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {c.label}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {c.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-medium text-zinc-900">
                  {c.count}
                </td>
                <td className="px-4 py-3 text-right text-zinc-500">
                  {products.length > 0
                    ? `${((c.count / products.length) * 100).toFixed(1)}%`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/products?category=${encodeURIComponent(c.label)}`}
                    className="text-xs text-orange-500 hover:underline"
                  >
                    查看商品
                  </Link>
                </td>
              </tr>
            ))}
            {/* Default catch-all */}
            <tr className="bg-zinc-50">
              <td className="px-4 py-3 font-medium text-zinc-500">
                {defaultCategoryLabel}
                <span className="ml-2 text-xs text-zinc-400">（其他）</span>
              </td>
              <td className="px-4 py-3 text-xs text-zinc-400">
                未命中任何關鍵字的商品
              </td>
              <td className="px-4 py-3 text-right font-medium text-zinc-500">
                {uncategorized}
              </td>
              <td className="px-4 py-3 text-right text-zinc-400">
                {products.length > 0
                  ? `${((uncategorized / products.length) * 100).toFixed(1)}%`
                  : "—"}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href="/admin/products?category=ALL"
                  className="text-xs text-zinc-400 hover:underline"
                >
                  查看全部
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-zinc-400">
        分類由 <code className="font-mono">src/lib/custom-category-config.ts</code> 中的關鍵字規則決定，修改該檔案即可同步更新前後台分類。
      </p>
    </div>
  );
}
