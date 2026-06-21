import { notFound } from "next/navigation";
import { getProductById, getDbNativeProductById } from "@/lib/products";
import { getOverride, buildShopeeUrl, deriveCvsEligibility } from "@/lib/product-overrides";
import { ProductEditForm } from "./ProductEditForm";

export default async function AdminProductEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const saved = sp.saved === "1";

  const jsonBase = getProductById(id);
  // DB-native products (created in admin, shopeeId = null) are not in the JSON.
  const dbBase = jsonBase ? null : await getDbNativeProductById(id);
  const base = jsonBase ?? dbBase;
  if (!base) notFound();

  const isDbNative = !jsonBase;
  // Overrides only apply to Shopee-imported (JSON) products.
  const override = isDbNative ? null : await getOverride(id);

  const name = override?.name ?? base.name;
  const description = override?.description ?? base.description;
  const basePrice =
    override?.basePrice != null
      ? override.basePrice
      : (base.price ?? null);
  const thumbnailUrl = override?.thumbnailUrl ?? base.images[0] ?? "";
  const shopeeUrl = override?.shopeeUrl ?? base.shopeeUrl ?? (isDbNative ? "" : buildShopeeUrl(id));
  const isActive = override?.isActive ?? base.isActive ?? true;
  const allowCvsPickup =
    override?.allowCvsPickup ?? base.allowCvsPickup ?? deriveCvsEligibility(base);

  let images: string[] = base.images;
  if (override?.imagesJson) {
    try {
      const parsed = JSON.parse(override.imagesJson);
      if (Array.isArray(parsed)) images = parsed as string[];
    } catch {
      // keep base.images
    }
  }

  return (
    <div className="min-h-full bg-zinc-50 p-6">
      {/* Breadcrumb */}
      <div className="mb-1 flex items-center gap-3 text-sm">
        <a href="/admin/products" className="text-zinc-500 hover:text-zinc-900">
          ← 商品列表
        </a>
        <span className="text-zinc-300">/</span>
        <span className="text-zinc-600 truncate max-w-xs">{name}</span>
        <a
          href={`/products/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto shrink-0 text-orange-500 hover:underline"
        >
          前台 ↗
        </a>
      </div>

      <h1 className="mb-6 text-xl font-semibold text-zinc-900 line-clamp-2">
        編輯商品
      </h1>

      {saved && (
        <div className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">
          ✓ 儲存成功，前台已同步更新。
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* ── Edit form ── */}
        <ProductEditForm
          shopeeId={id}
          defaultName={name}
          defaultDescription={description}
          defaultBasePrice={basePrice ?? undefined}
          defaultThumbnailUrl={thumbnailUrl}
          defaultImages={images}
          defaultShopeeUrl={shopeeUrl}
          defaultIsActive={isActive}
          defaultAllowCvsPickup={allowCvsPickup}
          isDbNative={isDbNative}
        />

        {/* ── Right sidebar ── */}
        <aside className="space-y-4">
          {thumbnailUrl && (
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailUrl}
                alt={name}
                className="w-full object-cover"
              />
            </div>
          )}

          {base.variations.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
              <div className="border-b border-zinc-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                規格（蝦皮原始，唯讀）
              </div>
              <ul className="divide-y divide-zinc-100">
                {base.variations.map((v) => (
                  <li
                    key={String(v.variationId ?? v.variationName)}
                    className="grid grid-cols-3 gap-2 px-4 py-2.5 text-sm"
                  >
                    <span className="font-medium text-zinc-900">
                      {v.variationName ?? "主商品"}
                    </span>
                    <span className="text-zinc-600">
                      {v.price
                        ? `NT$ ${Number(v.price).toLocaleString("zh-TW")}`
                        : "—"}
                    </span>
                    <span className="text-zinc-400">庫存 {v.stock ?? "—"}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-xs text-zinc-400 space-y-1">
            <p>蝦皮 ID：{id}</p>
            <p>分類：{base.customCategory ?? "未分類"}</p>
            <p>
              資料來源：
              {override ? (
                <span className="text-orange-500">✎ 已套用後台編輯</span>
              ) : (
                "蝦皮原始資料"
              )}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
