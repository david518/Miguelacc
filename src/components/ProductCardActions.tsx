"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "./cart-provider";

export function ProductCardActions({
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
  const firstVariation = product.variations[0];

  const handleAdd = () => {
    addItem({
      productId: product.id,
      variationId: firstVariation?.variationId ?? undefined,
      variationName: firstVariation?.variationName,
      name: product.name,
      price,
      image: product.images[0] ?? null,
      allowCvsPickup: product.allowCvsPickup ?? false,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleAdd}
        className="flex-1 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 active:scale-95"
      >
        {added ? "✓ 已加入" : "加入購物車"}
      </button>
      <a
        href={shopeeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
      >
        蝦皮
      </a>
    </div>
  );
}
