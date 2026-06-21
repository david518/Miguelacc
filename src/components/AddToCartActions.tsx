"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import { useCart } from "./cart-provider";

export function AddToCartActions({
  product,
  price,
  shopeeUrl,
}: {
  product: Product;
  price?: number;
  shopeeUrl: string;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const hasVariations = product.variations.length > 0;
  const [selectedVariationId, setSelectedVariationId] = useState<
    string | undefined
  >(product.variations[0]?.variationId?.toString());

  const activeVariation = hasVariations
    ? product.variations.find(
        (v) => v.variationId?.toString() === selectedVariationId
      )
    : undefined;

  const effectivePrice = activeVariation?.price ?? price;
  const discountedPrice = effectivePrice
    ? Math.round(effectivePrice * 0.9)
    : undefined;

  const handleAdd = () => {
    console.log("[Cart] handleAdd fired, product:", product.id);
    addItem(
      {
        productId: product.id,
        variationId: activeVariation?.variationId ?? undefined,
        variationName: activeVariation?.variationName,
        name: product.name,
        price: effectivePrice,
        image: product.images[0] ?? null,
        allowCvsPickup: product.allowCvsPickup ?? false,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4">
      {hasVariations && (
        <label className="flex flex-col text-sm font-medium text-zinc-600">
          規格選擇
          <select
            className="mt-2 rounded-xl border border-zinc-300 px-4 py-2"
            value={selectedVariationId}
            onChange={(e) => setSelectedVariationId(e.target.value)}
          >
            {product.variations.map((v) => (
              <option
                key={v.variationId ?? v.variationName}
                value={v.variationId?.toString() ?? v.variationName ?? "main"}
              >
                {v.variationName ?? "主商品"}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="flex items-center gap-4 text-sm text-zinc-600">
        <label className="flex items-center gap-2">
          數量
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="w-20 rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        {effectivePrice && (
          <div>
            <p className="text-xs text-zinc-500">
              原價 NT$ {effectivePrice.toLocaleString("zh-TW")}
            </p>
            <p className="text-sm font-semibold text-orange-600">
              9 折 NT$ {discountedPrice?.toLocaleString("zh-TW")}
            </p>
          </div>
        )}
      </div>

      {/* Two ordering methods */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Method 1: Direct order (9折) */}
        <button
          onClick={handleAdd}
          className="flex-1 rounded-full border border-orange-500 bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 active:scale-95"
        >
          {added
            ? "✓ 已加入購物車"
            : discountedPrice
            ? `加入購物車（9折 NT$ ${discountedPrice.toLocaleString("zh-TW")}）`
            : "加入購物車（享9折優惠）"}
        </button>

        {/* Method 2: Shopee (original price) */}
        <a
          href={shopeeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-full border border-zinc-300 bg-white px-5 py-3 text-center text-sm font-semibold text-zinc-700 transition hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
        >
          {effectivePrice
            ? `前往蝦皮（原價 NT$ ${effectivePrice.toLocaleString("zh-TW")}）`
            : "前往蝦皮下單（原價）"}
        </a>
      </div>

      <p className="text-center text-xs text-zinc-400">
        🛒 網站下單享全站9折 ｜ 🐧 蝦皮下單原價，依蝦皮活動為準
      </p>
    </div>
  );
}
