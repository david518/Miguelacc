"use server";

import { prisma } from "@/lib/prisma";
import { getProductById } from "@/lib/products";
import {
  buildEcpayFormParams,
  buildItemName,
  getPaymentUrl,
} from "@/lib/ecpay";

export type CheckoutState =
  | {
      ecpayUrl: string;
      params: Record<string, string>;
    }
  | { error: string }
  | undefined;

type CartItemInput = {
  productId: string;          // shopeeId (from JSON)
  variationId?: string | number;
  variationName?: string;
  name: string;
  price?: number;
  quantity: number;
};

export async function checkoutAction(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  // ── Parse customer info ──────────────────────────────────────────────────
  const customerName = (formData.get("customerName") as string).trim();
  const customerEmail = (formData.get("customerEmail") as string).trim();
  const customerPhone = (formData.get("customerPhone") as string).trim();
  const shippingAddress = (formData.get("shippingAddress") as string)?.trim() ?? "";
  const note = (formData.get("note") as string | null)?.trim() || null;

  // ── Shipping method ──────────────────────────────────────────────────────
  const shippingMethod =
    formData.get("shippingMethod") === "CVS_PICKUP" ? "CVS_PICKUP" : "HOME_DELIVERY";
  const cvsSubType = (formData.get("cvsSubType") as string)?.trim() || null;
  const cvsStoreId = (formData.get("cvsStoreId") as string)?.trim() || null;
  const cvsStoreName = (formData.get("cvsStoreName") as string)?.trim() || null;
  const cvsStoreAddress = (formData.get("cvsStoreAddress") as string)?.trim() || null;

  if (!customerName || !customerEmail || !customerPhone) {
    return { error: "請填寫姓名、Email 與手機" };
  }
  if (shippingMethod === "HOME_DELIVERY" && !shippingAddress) {
    return { error: "宅配請填寫收件地址" };
  }
  if (shippingMethod === "CVS_PICKUP" && !cvsStoreId) {
    return { error: "超商取貨請先選擇門市" };
  }

  // ── Parse cart items ─────────────────────────────────────────────────────
  let items: CartItemInput[];
  try {
    items = JSON.parse(formData.get("cartItems") as string);
  } catch {
    return { error: "購物車資料異常，請重新加入商品" };
  }

  if (!items.length) return { error: "購物車是空的" };

  const itemsWithPrice = items.filter((i) => i.price && i.price > 0);
  if (!itemsWithPrice.length) return { error: "購物車中的商品缺少價格" };

  // ── Compute totals ───────────────────────────────────────────────────────
  const subtotalOriginal = itemsWithPrice.reduce(
    (sum, i) => sum + (i.price ?? 0) * i.quantity,
    0
  );
  const subtotalDiscount = Math.round(subtotalOriginal * 0.9);

  if (subtotalDiscount <= 0) return { error: "訂單金額不正確" };

  // ── Upsert products to DB (to satisfy FK on OrderItem) ──────────────────
  const dbProductIds = new Map<string, string>(); // shopeeId → DB Product.id

  for (const item of itemsWithPrice) {
    const shopeeId = item.productId;
    const jsonProduct = getProductById(shopeeId);

    const dbProduct = await prisma.product.upsert({
      where: { shopeeId },
      create: {
        shopeeId,
        name: jsonProduct?.name ?? item.name,
        description: jsonProduct?.description ?? "",
        basePrice: jsonProduct?.price ? Math.round(jsonProduct.price) : null,
      },
      update: {},
      select: { id: true },
    });

    dbProductIds.set(shopeeId, dbProduct.id);
  }

  // ── Generate order number ────────────────────────────────────────────────
  const ts = Date.now().toString(36).toUpperCase();
  const merchantTradeNo = `ORD${ts}`.slice(0, 20);
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const orderNumber = `ORD-${ymd}-${ts}`;

  // ── Create Order + OrderItems in DB ─────────────────────────────────────
  await prisma.order.create({
    data: {
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress: shippingAddress || null,
      note,
      shippingMethod,
      cvsLogisticsType: cvsSubType,
      cvsStoreId,
      cvsStoreName,
      cvsStoreAddress,
      subtotalOriginal: Math.round(subtotalOriginal),
      subtotalDiscount,
      items: {
        create: itemsWithPrice.map((i) => ({
          productId: dbProductIds.get(i.productId)!,
          variationName: i.variationName ?? null,
          quantity: i.quantity,
          priceOriginal: Math.round(i.price ?? 0),
          priceDiscount: Math.round((i.price ?? 0) * 0.9),
        })),
      },
    },
  });

  // ── Build ECPay params ───────────────────────────────────────────────────
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const ecpayParams = buildEcpayFormParams({
    merchantTradeNo,
    totalAmount: subtotalDiscount,
    tradeDesc: "Miguel ACC 汽車配件 9折優惠",
    itemName: buildItemName(
      itemsWithPrice.map((i) => ({ name: i.name, quantity: i.quantity }))
    ),
    returnUrl: `${baseUrl}/api/ecpay/notify`,
    orderResultUrl: `${baseUrl}/checkout/result`,
    clientBackUrl: `${baseUrl}/products`,
  });

  return {
    ecpayUrl: getPaymentUrl(),
    params: ecpayParams,
  };
}
