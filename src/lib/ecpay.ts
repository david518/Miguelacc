import { createHash } from "crypto";

export const ECPAY_PAYMENT_URL = {
  prod: "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5",
  stage: "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5",
} as const;

function getConfig() {
  return {
    merchantId: process.env.ECPAY_MERCHANT_ID ?? "",
    hashKey: process.env.ECPAY_HASH_KEY ?? "",
    hashIV: process.env.ECPAY_HASH_IV ?? "",
    isStage: process.env.ECPAY_IS_STAGE === "true",
  };
}

export function getPaymentUrl() {
  const { isStage } = getConfig();
  return isStage ? ECPAY_PAYMENT_URL.stage : ECPAY_PAYMENT_URL.prod;
}

/**
 * ECPay CheckMacValue (SHA256, mimics .NET HttpUtility.UrlEncode).
 * Pure function — pass the HashKey/HashIV explicitly so it can be reused for
 * both payment (金流) and logistics (物流), which use different credentials.
 */
export function ecpayCheckMac(
  params: Record<string, string>,
  hashKey: string,
  hashIV: string,
  algo: "sha256" | "md5" = "sha256" // 金流用 SHA256；物流用 MD5
): string {
  const sorted = Object.entries(params)
    .sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  const raw = `HashKey=${hashKey}&${sorted}&HashIV=${hashIV}`;

  // .NET HttpUtility.UrlEncode (used by ECPay) treats - _ . ! * ( ) as safe
  // chars and leaves them unencoded; only ' and ~ (and space) differ from
  // JS encodeURIComponent. Encoding ! * ( ) would break the CheckMacValue.
  const encoded = encodeURIComponent(raw)
    .replace(/%20/g, "+")
    .replace(/'/g, "%27")
    .replace(/~/g, "%7e")
    .toLowerCase();

  return createHash(algo).update(encoded).digest("hex").toUpperCase();
}

/** Payment CheckMacValue using the 金流 credentials from env. */
export function computeCheckMacValue(params: Record<string, string>): string {
  const { hashKey, hashIV } = getConfig();
  return ecpayCheckMac(params, hashKey, hashIV);
}

/** Verify an incoming CheckMacValue (for webhooks) */
export function verifyCheckMacValue(
  params: Record<string, string>
): boolean {
  const { CheckMacValue, ...rest } = params;
  if (!CheckMacValue) return false;
  return computeCheckMacValue(rest) === CheckMacValue;
}

export type EcpayOrderParams = {
  merchantTradeNo: string;   // max 20 chars, unique
  totalAmount: number;        // integer TWD
  tradeDesc: string;          // max 200 chars
  itemName: string;           // product names, '#' separated, max 400 chars
  returnUrl: string;          // server callback
  orderResultUrl: string;     // client redirect
  clientBackUrl?: string;     // "back" button URL
};

/** Build all form params (including CheckMacValue) for ECPay AIO */
export function buildEcpayFormParams(order: EcpayOrderParams): Record<string, string> {
  const { merchantId } = getConfig();

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const tradeDate = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const params: Record<string, string> = {
    MerchantID: merchantId,
    MerchantTradeNo: order.merchantTradeNo,
    MerchantTradeDate: tradeDate,
    PaymentType: "aio",
    TotalAmount: String(Math.round(order.totalAmount)),
    TradeDesc: order.tradeDesc,
    ItemName: order.itemName,
    ReturnURL: order.returnUrl,
    ChoosePayment: "ALL",
    EncryptType: "1",
    OrderResultURL: order.orderResultUrl,
  };

  if (order.clientBackUrl) {
    params.ClientBackURL = order.clientBackUrl;
  }

  params.CheckMacValue = computeCheckMacValue(params);
  return params;
}

/** Truncate ItemName to ECPay's 400-char limit */
export function buildItemName(
  items: Array<{ name: string; quantity: number }>
): string {
  const parts = items.map((i) => `${i.name.slice(0, 60)} x${i.quantity}`);
  let result = parts.join("#");
  if (result.length > 400) result = result.slice(0, 397) + "...";
  return result;
}
