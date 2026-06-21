import Link from "next/link";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

interface HorizontalProductRailProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
}

export function HorizontalProductRail({ title, subtitle, products, viewAllHref }: HorizontalProductRailProps) {
  if (products.length === 0) return null;
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-orange-500">{title}</p>
          {subtitle && <p className="text-sm text-zinc-600">{subtitle}</p>}
        </div>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            查看更多 →
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.map((product) => (
          <div key={product.id} className="w-72 flex-shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
