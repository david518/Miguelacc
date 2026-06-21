export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { HorizontalProductRail } from "@/components/HorizontalProductRail";
import { getPublicProducts, getTopCategories } from "@/lib/products";

export default async function Home() {
  const products = await getPublicProducts();
  const topCategories = getTopCategories(products);

  const bestsellingProducts = [...products]
    .sort((a, b) => (b.variations.length ?? 0) - (a.variations.length ?? 0))
    .slice(0, 12);

  const latestProducts = [...products]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 10);

  const jSpaceProducts = products
    .filter((product) => (product.customCategory ?? "").includes("J SPACE") || /j ?space/i.test(product.name))
    .slice(0, 8);

  const townaceProducts = products.filter((product) => product.customCategory === "Townace").slice(0, 8);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
      <header className="relative border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <Image src="/brand-logo-dark.jpg" alt="Miguel ACC" width={56} height={56} style={{ height: "auto" }} className="hidden sm:block" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-orange-500">Miguel Auto Accessories</p>
              <h1 className="text-2xl font-semibold text-zinc-900">Miguel ACC</h1>
            </div>
          </div>
          <div className="hidden gap-6 text-sm font-semibold text-zinc-600 md:flex">
            <a href="#products" className="transition hover:text-zinc-900">
              熱銷商品
            </a>
            <a href="#categories" className="transition hover:text-zinc-900">
              改裝分類
            </a>
            <a href="#story" className="transition hover:text-zinc-900">
              品牌故事
            </a>
          </div>
          <Link
            href="https://shopee.tw/miguel.acc"
            className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-black"
            target="_blank"
          >
            前往蝦皮
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-12">
        {/* Hero */}
        <section className="grid gap-8 rounded-3xl bg-gradient-to-r from-zinc-900 to-zinc-800 p-8 text-white md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <p className="text-sm uppercase tracking-[0.4em] text-orange-300">Taiwan Custom Car Culture</p>
            <h2 className="text-4xl font-semibold leading-tight">
              專為中小型商旅與改裝車主打造的專屬配件，
              <span className="text-orange-300"> 一站式入手</span>
            </h2>
            <p className="text-lg text-zinc-200">
              我們從 Miguel ACC 蝦皮賣場延伸，將 370+ 件汽車內外觀配件整理成視覺化產品庫，讓你在自家官網就能瀏覽、收藏、分享。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="#products"
                className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-orange-100"
              >
                瀏覽商品
              </Link>
              <a
                href="https://www.facebook.com/miguel.acc"
                target="_blank"
                className="rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                追蹤社群
              </a>
            </div>
          </div>
          <div className="rounded-2xl bg-white/5 p-6 shadow-lg">
            <dl className="grid grid-cols-2 gap-6 text-sm text-zinc-100">
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-zinc-400">商品數量</dt>
                <dd className="text-3xl font-semibold text-orange-300">{products.length}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-zinc-400">熱門分類</dt>
                <dd className="text-3xl font-semibold text-orange-300">{topCategories.length}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-zinc-400">服務年資</dt>
                <dd className="text-3xl font-semibold text-orange-300">7+</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-zinc-400">Shopee 評分</dt>
                <dd className="text-3xl font-semibold text-orange-300">5.0</dd>
              </div>
            </dl>
            <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm leading-relaxed text-zinc-100" id="story">
              「從 MG、Toyota 到商旅 Town Ace，我們替車主把想像中的內裝與外觀升級化為實品，
              並保留台灣施工的細膩與速度。」
            </div>
          </div>
        </section>

        {/* Categories */}
        <section id="categories" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-orange-500">Categories</p>
              <h3 className="text-2xl font-semibold text-zinc-900">熱門改裝領域</h3>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {topCategories.map((category) => (
              <Link
                key={category.name}
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow"
              >
                <p className="text-sm uppercase tracking-[0.3em] text-orange-500">{category.count} items</p>
                <h4 className="mt-2 text-lg font-semibold text-zinc-900">
                  {category.name}
                </h4>
                <p className="mt-3 text-sm text-zinc-600">
                  點擊即可在商品頁套用該分類，快速瀏覽車系專屬配件。
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Products */}
        <section id="products" className="space-y-12">
          <HorizontalProductRail
            title="Hot Picks"
            subtitle="依變體數排序，暫代熱銷排行（等待實際銷售數據）"
            products={bestsellingProducts}
            viewAllHref="/products"
          />
          <HorizontalProductRail
            title="Latest Arrivals"
            subtitle="依商品 ID 新→舊排名"
            products={latestProducts}
            viewAllHref="/products"
          />
          <HorizontalProductRail
            title="J SPACE 精選"
            subtitle="J SPACE / CMC 客製件"
            products={jSpaceProducts}
            viewAllHref="/products?category=CMC%20J%20SPACE"
          />
          <HorizontalProductRail
            title="Town Ace 精選"
            subtitle="Toyota Town Ace 熱門升級"
            products={townaceProducts}
            viewAllHref="/products?category=Townace"
          />
        </section>
      </main>
    </div>
  );
}
