/**
 * Product DB overrides — merges Shopee JSON data with admin edits stored in Prisma.
 * When an admin saves a product edit, it's upserted into the Product table by shopeeId.
 * Frontend reads: DB override first, JSON fallback.
 */

import { prisma } from "@/lib/prisma";
import type { Product } from "@/lib/types";

export type ProductOverride = {
  shopeeId: string;
  name: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  imagesJson: string | null;
  shopeeUrl: string | null;
  basePrice: number | null;
  isActive: boolean;
  allowCvsPickup: boolean;
};

// 超商取貨尺寸/重量上限（綠界 C2C 店到店）：單邊 ≤45cm、長寬高合計 ≤105cm、重量 ≤5kg
const CVS_MAX_SIDE_CM = 45;
const CVS_MAX_SUM_CM = 105;
const CVS_MAX_WEIGHT_KG = 5;

/**
 * Derive whether a product is eligible for CVS pickup from Shopee import data.
 * Signal 1: Shopee offered 店到店 (蝦皮店到店/隔日店到店) → small/light enough.
 * Signal 2: shipping weight/dimensions within CVS limits.
 * Returns false when there is no usable signal (admin then sets it manually).
 */
export function deriveCvsEligibility(base: Product): boolean {
  const logistics = base.shopeeLogistics ?? [];
  if (logistics.some((l) => l.includes("店到店"))) return true;

  const s = base.shipping;
  if (s) {
    const w = Number(s.weight) || 0;
    const dims = [Number(s.length) || 0, Number(s.width) || 0, Number(s.height) || 0];
    const hasDims = dims.some((d) => d > 0);
    const hasWeight = w > 0;
    if (hasDims || hasWeight) {
      const withinWeight = !hasWeight || w <= CVS_MAX_WEIGHT_KG;
      const withinSide = !hasDims || dims.every((d) => d <= CVS_MAX_SIDE_CM);
      const withinSum = !hasDims || dims.reduce((a, b) => a + b, 0) <= CVS_MAX_SUM_CM;
      return withinWeight && withinSide && withinSum;
    }
  }
  return false;
}

/** Fetch all DB overrides keyed by shopeeId (single query) */
export async function getAllOverrides(): Promise<Map<string, ProductOverride>> {
  const rows = await prisma.product.findMany({
    where: { shopeeId: { not: null } },
    select: {
      shopeeId: true,
      name: true,
      description: true,
      thumbnailUrl: true,
      imagesJson: true,
      shopeeUrl: true,
      basePrice: true,
      isActive: true,
      allowCvsPickup: true,
    },
  });

  const map = new Map<string, ProductOverride>();
  for (const row of rows) {
    if (row.shopeeId) map.set(row.shopeeId, row as ProductOverride);
  }
  return map;
}

/** Fetch a single override by shopeeId (never throws — returns null on error) */
export async function getOverride(
  shopeeId: string
): Promise<ProductOverride | null> {
  try {
    const row = await prisma.product.findUnique({
      where: { shopeeId },
      select: {
        shopeeId: true,
        name: true,
        description: true,
        thumbnailUrl: true,
        imagesJson: true,
        shopeeUrl: true,
        basePrice: true,
        isActive: true,
        allowCvsPickup: true,
      },
    });
    return row as ProductOverride | null;
  } catch (err) {
    console.error("[getOverride] DB error:", err);
    return null;
  }
}

/** Merge JSON product data with a DB override */
export function mergeProduct(
  base: Product,
  override: ProductOverride | null | undefined
): Product & { shopeeUrl?: string; isActive: boolean; allowCvsPickup: boolean } {
  if (!override) {
    return { ...base, isActive: true, allowCvsPickup: deriveCvsEligibility(base) };
  }

  const images: string[] = override.imagesJson
    ? (() => {
        try {
          return JSON.parse(override.imagesJson) as string[];
        } catch {
          return base.images;
        }
      })()
    : base.images;

  return {
    ...base,
    name: override.name ?? base.name,
    description: override.description ?? base.description,
    images,
    price: override.basePrice ?? base.price,
    shopeeUrl: override.shopeeUrl ?? undefined,
    isActive: override.isActive,
    allowCvsPickup: override.allowCvsPickup,
  };
}

/** Build the Shopee product URL */
export function buildShopeeUrl(productId: string, overrideUrl?: string | null): string {
  if (overrideUrl) return overrideUrl;
  const shopId = process.env.SHOPEE_SHOP_ID ?? "358098272";
  return `https://shopee.tw/product/${shopId}/${productId}`;
}
