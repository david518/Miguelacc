import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductCardActions } from "@/components/ProductCardActions";

const SHOPEE_SHOP_ID = "358098272";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const displayPrice = product.price ?? product.variations[0]?.price;
  const categoryLabel = product.customCategory ?? "汽車配件";
  const shopeeUrl =
    product.shopeeUrl ?? `https://shopee.tw/product/${SHOPEE_SHOP_ID}/${product.id}`;
  return (
    <div className="group flex flex-col rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/products/${product.id}`} className="flex flex-1 flex-col">
        {product.images[0] ? (
          <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-zinc-100">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover transition group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="aspect-square rounded-t-2xl bg-gradient-to-br from-zinc-100 to-zinc-200" />
        )}
        <div className="flex flex-1 flex-col gap-3 p-5 pb-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-orange-500">{categoryLabel}</p>
            <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-zinc-900">
              {product.name}
            </h3>
          </div>
          <p className="line-clamp-3 text-sm text-zinc-600">
            {product.description.replace(/\n+/g, " ")}
          </p>
          <div className="mt-auto">
            {displayPrice ? (
              <span className="text-xl font-bold text-zinc-900">
                NT${" "}
                {Number(displayPrice).toLocaleString("zh-TW")}
              </span>
            ) : (
              <span className="text-sm font-medium text-zinc-500">洽詢價</span>
            )}
          </div>
        </div>
      </Link>
      <div className="px-5 pb-5">
        <ProductCardActions
          product={product}
          price={displayPrice}
          shopeeUrl={shopeeUrl}
        />
      </div>
    </div>
  );
}
