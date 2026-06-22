"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type SaveProductState =
  | { success: true; redirectTo: string }
  | { error: string }
  | undefined;

export async function saveProductAction(
  _prev: SaveProductState,
  formData: FormData
): Promise<SaveProductState> {
  const shopeeId = formData.get("shopeeId") as string;
  if (!shopeeId) return { error: "商品 ID 不存在" };
  const isDbNative = formData.get("isDbNative") === "true";

  const name = (formData.get("name") as string).trim();
  const description = (formData.get("description") as string).trim();
  const basePriceRaw = formData.get("basePrice") as string;
  const basePrice = basePriceRaw ? Math.round(Number(basePriceRaw)) : null;
  const thumbnailUrl = (formData.get("thumbnailUrl") as string).trim() || null;
  const shopeeUrl = (formData.get("shopeeUrl") as string).trim() || null;
  const isActive = formData.get("isActive") === "true";
  const allowCvsPickup = formData.get("allowCvsPickup") === "true";

  // Images: one URL per line
  const imagesRaw = (formData.get("images") as string).trim();
  const imagesArray = imagesRaw
    ? imagesRaw
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean)
    : null;
  const imagesJson = imagesArray?.length ? JSON.stringify(imagesArray) : null;

  if (!name) return { error: "商品名稱不可空白" };
  if (!description) return { error: "商品描述不可空白" };

  const data = {
    name,
    description,
    basePrice,
    thumbnailUrl,
    imagesJson,
    shopeeUrl,
    isActive,
    allowCvsPickup,
  };

  if (isDbNative) {
    // DB-native product (shopeeId = null): update by its cuid id.
    await prisma.product.update({ where: { id: shopeeId }, data });
  } else {
    // Shopee-imported product: upsert an override keyed by shopeeId.
    await prisma.product.upsert({
      where: { shopeeId },
      create: { shopeeId, ...data },
      update: data,
    });
  }

  revalidatePath("/products");
  revalidatePath(`/products/${shopeeId}`);
  revalidatePath("/admin/products");

  return { success: true, redirectTo: `/admin/products/${shopeeId}?saved=1` };
}
