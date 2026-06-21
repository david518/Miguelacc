import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicProductById } from "@/lib/products";
import { AddToCartActions } from "@/components/AddToCartActions";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductDescription } from "@/components/ProductDescription";
import { defaultCategoryLabel } from "@/lib/custom-category-config";

const SHOPEE_SHOP_ID = "358098272";

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getPublicProductById(id);
  if (!product) notFound();

  const displayPrice = product.price ?? product.variations[0]?.price;
  const customCategory = product.customCategory ?? defaultCategoryLabel;
  const shopeeUrl = product.shopeeUrl ?? `https://shopee.tw/product/${SHOPEE_SHOP_ID}/${id}`;

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-zinc-200 bg-zinc-50 text-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-6 py-3 text-zinc-500">
          <Link href="/" className="hover:text-zinc-900">
            首頁
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-zinc-900">
            全部商品
          </Link>
          <span>/</span>
          <span className="text-zinc-900">{product.name}</span>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
          {/* Images */}
          <ProductGallery images={product.images} alt={product.name} />

          {/* Info */}
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-orange-500">
                {customCategory}
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-zinc-900">
                {product.name}
              </h1>
              {displayPrice && (
                <p className="mt-2 text-3xl font-bold text-zinc-900">
                  NT$ {Number(displayPrice).toLocaleString("zh-TW")}
                </p>
              )}
            </div>

            {product.shipping && (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.4em] text-orange-500">
                  物流資訊
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-zinc-700">
                  <span>重量：{product.shipping.weight ?? "—"} kg</span>
                  <span>長度：{product.shipping.length ?? "—"} cm</span>
                  <span>寬度：{product.shipping.width ?? "—"} cm</span>
                  <span>高度：{product.shipping.height ?? "—"} cm</span>
                </div>
              </div>
            )}

            {product.variations.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-white">
                <div className="border-b border-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-700">
                  產品規格 / SKU
                </div>
                <div className="divide-y divide-zinc-100 text-sm">
                  {product.variations.map((variation) => (
                    <div
                      key={variation.variationId ?? variation.sku}
                      className="grid grid-cols-4 gap-3 px-4 py-3 text-zinc-700"
                    >
                      <span className="font-medium">
                        {variation.variationName ?? "主商品"}
                      </span>
                      <span>{variation.sku ?? "—"}</span>
                      <span>
                        {variation.price
                          ? `NT$ ${Number(variation.price).toLocaleString("zh-TW")}`
                          : "—"}
                      </span>
                      <span>庫存：{variation.stock ?? "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <AddToCartActions
              product={product}
              price={displayPrice}
              shopeeUrl={shopeeUrl}
            />
          </div>
        </div>

        <section className="mt-12 rounded-3xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">商品敘述</h2>
          <div className="mt-4">
            <ProductDescription content={product.description} />
          </div>
        </section>
      </main>
    </div>
  );
}
