import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCheckMacValue } from "@/lib/ecpay";
import { createCvsShipment, type CvsSubType } from "@/lib/ecpay-logistics";

/**
 * ECPay ReturnURL — server-to-server payment notification.
 * ECPay expects the response body to be exactly "1|OK" on success.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, string>;

  try {
    const text = await req.text();
    body = Object.fromEntries(new URLSearchParams(text));
  } catch {
    return new NextResponse("0|ParseError", { status: 400 });
  }

  // Verify signature
  if (!verifyCheckMacValue(body)) {
    console.error("[ECPay notify] CheckMacValue mismatch", body);
    return new NextResponse("0|CheckMacValueError", { status: 400 });
  }

  const {
    MerchantTradeNo,
    RtnCode,
    RtnMsg,
    TradeNo,
    PaymentType,
    PaymentDate,
    TradeAmt,
  } = body;

  const isPaid = RtnCode === "1";

  // Find the order in DB by merchantTradeNo encoded in orderNumber
  // Our orderNumber starts with "ORD-YYYYMMDD-{ts}" but MerchantTradeNo = "ORD{ts}"
  // We stored MerchantTradeNo pattern — find by matching suffix
  const tradeTs = MerchantTradeNo.replace(/^ORD/, "").toLowerCase();

  const order = await prisma.order.findFirst({
    where: { orderNumber: { endsWith: `-${tradeTs.toUpperCase()}` } },
  });

  if (!order) {
    console.error("[ECPay notify] Order not found for", MerchantTradeNo);
    // Return OK to ECPay anyway to prevent retries for unknown orders
    return new NextResponse("1|OK");
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: isPaid ? "PAID" : "FAILED",
      payments: {
        create: {
          provider: "ECPAY",
          status: isPaid ? "SUCCESS" : "FAILED",
          transactionId: TradeNo ?? null,
          amount: Number(TradeAmt) || 0,
          rawResponse: body as object,
        },
      },
    },
  });

  console.log(
    `[ECPay notify] Order ${order.orderNumber} → ${isPaid ? "PAID" : "FAILED"} | ${RtnMsg} | PaymentType: ${PaymentType} | Date: ${PaymentDate}`
  );

  // On successful CVS-pickup payment, create the ECPay logistics shipment.
  if (isPaid && order.shippingMethod === "CVS_PICKUP" && order.cvsStoreId && order.cvsLogisticsType) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
      const result = await createCvsShipment({
        merchantTradeNo: MerchantTradeNo.slice(0, 20),
        amount: order.subtotalDiscount,
        subType: order.cvsLogisticsType as CvsSubType,
        storeId: order.cvsStoreId,
        senderName: "MiguelACC",
        senderPhone: process.env.SHOP_SENDER_PHONE ?? "0911222333",
        receiverName: order.customerName,
        receiverPhone: order.customerPhone ?? undefined,
        receiverEmail: order.customerEmail,
        serverReplyUrl: `${baseUrl}/api/ecpay/logistics-notify`,
      });
      console.log(`[ECPay logistics] Shipment created for ${order.orderNumber}:`, result);
    } catch (err) {
      console.error(`[ECPay logistics] Failed to create shipment for ${order.orderNumber}:`, err);
    }
  }

  return new NextResponse("1|OK");
}
