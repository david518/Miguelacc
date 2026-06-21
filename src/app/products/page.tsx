export const dynamic = "force-dynamic";

import { ProductBrowser } from "@/components/ProductBrowser";
import { getPublicProducts } from "@/lib/products";

export default async function ProductsPage() {
  const products = await getPublicProducts();
  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-zinc-200 bg-gradient-to-r from-orange-50 to-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-12">
          <p className="text-sm uppercase tracking-[0.4em] text-orange-500">Catalog</p>
          <h1 className="text-3xl font-semibold text-zinc-900">Miguel ACC 全部商品</h1>
          <p className="max-w-3xl text-sm text-zinc-600">
            共 {products.length} 件來自蝦皮 Miguel ACC 的汽車內、外裝配件，提供分類篩選、搜尋與頁面大小調整。
          </p>
        </div>
      </section>
      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <ProductBrowser products={products} />
      </main>
    </div>
  );
}
