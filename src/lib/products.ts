import productsJson from "@/data/products.json";
import { Product } from "./types";
import { customCategoryConfig, defaultCategoryLabel } from "./custom-category-config";
import { getAllOverrides, getOverride, mergeProduct } from "./product-overrides";
import { prisma } from "./prisma";

const products = productsJson as Product[];

function resolveCustomCategory(product: Product) {
  const searchable = `${product.name} ${product.description}`.toLowerCase();
  for (const config of customCategoryConfig) {
    if (config.keywords.some((keyword) => searchable.includes(keyword))) {
      return config.label;
    }
  }
  return defaultCategoryLabel;
}

const enrichedProducts = products.map((product) => ({
  ...product,
  customCategory: product.customCategory ?? resolveCustomCategory(product),
}));

export function getAllProducts(): Product[] {
  return enrichedProducts;
}

export function getFeaturedProducts(limit = 8) {
  return enrichedProducts.filter((item) => item.images.length > 0).slice(0, limit);
}

export function getTopCategories(sourceProducts: Product[] = enrichedProducts, limit = 6) {
  const counts = new Map<string, number>();
  for (const item of sourceProducts) {
    const key = item.customCategory ?? defaultCategoryLabel;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

export function getProductById(id: string) {
  return enrichedProducts.find((item) => item.id === id);
}

// ── DB-native products (created in admin, not from Shopee; shopeeId = null) ──

type DbProductRow = {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string | null;
  imagesJson: string | null;
  shopeeUrl: string | null;
  basePrice: number | null;
  isActive: boolean;
  allowCvsPickup: boolean;
};

function dbRowToProduct(row: DbProductRow): Product & { isActive: boolean; allowCvsPickup: boolean } {
  let images: string[] = [];
  if (row.imagesJson) {
    try {
      const parsed = JSON.parse(row.imagesJson);
      if (Array.isArray(parsed)) images = parsed as string[];
    } catch {
      // ignore
    }
  }
  if (images.length === 0 && row.thumbnailUrl) images = [row.thumbnailUrl];

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    images,
    variations: [],
    price: row.basePrice ?? undefined,
    customCategory: resolveCustomCategory({ name: row.name, description: row.description } as Product),
    shopeeUrl: row.shopeeUrl ?? undefined,
    isActive: row.isActive,
    allowCvsPickup: row.allowCvsPickup,
  };
}

/** Fetch DB-native products (those without a Shopee counterpart). */
export async function getDbNativeProducts(): Promise<
  (Product & { isActive: boolean; allowCvsPickup: boolean })[]
> {
  try {
    const rows = await prisma.product.findMany({
      where: { shopeeId: null },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnailUrl: true,
        imagesJson: true,
        shopeeUrl: true,
        basePrice: true,
        isActive: true,
        allowCvsPickup: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(dbRowToProduct);
  } catch (err) {
    console.error("[getDbNativeProducts] DB error:", err);
    return [];
  }
}

/** Fetch a single DB-native product by its cuid. */
export async function getDbNativeProductById(id: string) {
  try {
    const row = await prisma.product.findFirst({
      where: { id, shopeeId: null },
      select: {
        id: true,
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
    return row ? dbRowToProduct(row) : null;
  } catch (err) {
    console.error("[getDbNativeProductById] DB error:", err);
    return null;
  }
}

// DB-aware public functions — apply admin overrides and respect isActive flag

export async function getPublicProducts() {
  const overrides = await getAllOverrides();
  const fromJson = enrichedProducts
    .map((p) => mergeProduct(p, overrides.get(p.id)))
    .filter((p) => p.isActive);
  const fromDb = (await getDbNativeProducts()).filter((p) => p.isActive);
  return [...fromDb, ...fromJson];
}

export async function getPublicProductById(id: string) {
  const base = enrichedProducts.find((p) => p.id === id);
  if (base) {
    const override = await getOverride(id);
    const merged = mergeProduct(base, override);
    return merged.isActive ? merged : null;
  }
  // DB-native fallback (cuid id)
  const dbProduct = await getDbNativeProductById(id);
  return dbProduct && dbProduct.isActive ? dbProduct : null;
}
