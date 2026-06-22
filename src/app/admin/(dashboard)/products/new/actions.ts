"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type CreateProductState =
  | { success: true; redirectTo: string }
  | { error: string }
  | undefined;

export async function createProductAction(
  _prev: CreateProductState,
  formData: FormData
): Promise<CreateProductState> {
  const name = (formData.get("name") as string).trim();
  const description = (formData.get("description") as string).trim();
  const basePriceRaw = formData.get("basePrice") as string;
  const basePrice = basePriceRaw ? Math.round(Number(basePriceRaw)) : null;
  const thumbnailUrl = (formData.get("thumbnailUrl") as string).trim() || null;
  const shopeeUrl = (formData.get("shopeeUrl") as string).trim() || null;
  const isActive = formData.get("isActive") === "true";
  const allowCvsPickup = formData.get("allowCvsPickup") === "true";

  const imagesRaw = (formData.get("images") as string).trim();
  const imagesArray = imagesRaw
    ? imagesRaw.split("\n").map((u) => u.trim()).filter(Boolean)
    : null;
  const imagesJson = imagesArray?.length ? JSON.stringify(imagesArray) : null;

  if (!name) return { error: "商品名稱不可空白" };
  if (!description) return { error: "商品描述不可空白" };

  // DB-native product: shopeeId stays null (not a Shopee import).
  const product = await prisma.product.create({
    data: {
      name,
      description,
      basePrice,
      thumbnailUrl,
      imagesJson,
      shopeeUrl,
      isActive,
      allowCvsPickup,
    },
    select: { id: true },
  });

  revalidatePath("/products");
  revalidatePath("/admin/products");

  return { success: true, redirectTo: `/admin/products/${product.id}?saved=1` };
}
