import { ecpayCheckMac } from "./ecpay";

/** ECPay Logistics (物流) — separate credentials from payment (金流). */
function getLogisticsConfig() {
  return {
    merchantId: process.env.ECPAY_LOGISTICS_MERCHANT_ID ?? "",
    hashKey: process.env.ECPAY_LOGISTICS_HASH_KEY ?? "",
    hashIV: process.env.ECPAY_LOGISTICS_HASH_IV ?? "",
    isStage: process.env.ECPAY_IS_STAGE === "true",
  };
}

export const ECPAY_LOGISTICS_URL = {
  map: {
    prod: "https://logistics.ecpay.com.tw/Express/map",
    stage: "https://logistics-stage.ecpay.com.tw/Express/map",
  },
  create: {
    prod: "https://logistics.ecpay.com.tw/Express/Create",
    stage: "https://logistics-stage.ecpay.com.tw/Express/Create",
  },
} as const;

/** Convenience-store C2C sub-types supported by the ECPay test account. */
export const CVS_SUBTYPES = {
  UNIMARTC2C: "7-ELEVEN 超商取貨",
  FAMIC2C: "全家 超商取貨",
  HILIFEC2C: "萊爾富 超商取貨",
  OKMARTC2C: "OK 超商取貨",
} as const;

export type CvsSubType = keyof typeof CVS_SUBTYPES;

export function getMapUrl() {
  return getLogisticsConfig().isStage
    ? ECPAY_LOGISTICS_URL.map.stage
    : ECPAY_LOGISTICS_URL.map.prod;
}

export function getCreateUrl() {
  return getLogisticsConfig().isStage
    ? ECPAY_LOGISTICS_URL.create.stage
    : ECPAY_LOGISTICS_URL.create.prod;
}

/**
 * Params for the ECPay electronic map (選擇門市). The map endpoint does NOT
 * require a CheckMacValue. ServerReplyURL receives the chosen store via a
 * browser-driven POST (so localhost works during local testing).
 */
export function buildMapParams(opts: {
  subType: CvsSubType;
  serverReplyUrl: string;
  extraData?: string;
}): Record<string, string> {
  const { merchantId } = getLogisticsConfig();
  return {
    MerchantID: merchantId,
    LogisticsType: "CVS",
    LogisticsSubType: opts.subType,
    IsCollection: "N", // 不代收貨款（純取貨）
    ServerReplyURL: opts.serverReplyUrl,
    ExtraData: opts.extraData ?? "",
    Device: "0", // 0=PC, 1=mobile
  };
}

export type CreateLogisticsOrder = {
  merchantTradeNo: string; // ≤20, unique
  amount: number; // 代收金額（IsCollection=N 時填商品金額即可）
  subType: CvsSubType;
  storeId: string; // CVSStoreID
  senderName: string; // 寄件人（2–10 中文 / 4–10 英文）
  senderPhone: string; // 寄件人手機（SenderCellPhone，必填）
  receiverName: string; // 收件人
  receiverPhone?: string;
  receiverEmail?: string;
  serverReplyUrl: string; // 物流狀態通知（server-to-server）
};

/** Build params (with CheckMacValue) for 建立物流訂單 (C2C 超商取貨). */
export function buildCreateLogisticsParams(
  order: CreateLogisticsOrder
): Record<string, string> {
  const { merchantId, hashKey, hashIV } = getLogisticsConfig();
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const tradeDate = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const params: Record<string, string> = {
    MerchantID: merchantId,
    MerchantTradeNo: order.merchantTradeNo,
    MerchantTradeDate: tradeDate,
    LogisticsType: "CVS",
    LogisticsSubType: order.subType,
    GoodsAmount: String(Math.round(order.amount)),
    GoodsName: "Miguel ACC 商品",
    SenderName: order.senderName,
    SenderCellPhone: order.senderPhone,
    ReceiverName: order.receiverName,
    ReceiverCellPhone: order.receiverPhone ?? "",
    ReceiverEmail: order.receiverEmail ?? "",
    ReceiverStoreID: order.storeId,
    ServerReplyURL: order.serverReplyUrl,
    IsCollection: "N",
  };

  params.CheckMacValue = ecpayCheckMac(params, hashKey, hashIV, "md5"); // 物流用 MD5
  return params;
}

/**
 * Create a C2C convenience-store shipment with ECPay (server-to-server).
 * Returns ECPay's parsed key=value response. Call after payment succeeds.
 */
export async function createCvsShipment(
  order: CreateLogisticsOrder
): Promise<Record<string, string>> {
  const params = buildCreateLogisticsParams(order);
  const res = await fetch(getCreateUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });
  const text = await res.text();
  // ECPay returns either "1|key=value&..." or an error string.
  const payload = text.startsWith("1|") ? text.slice(2) : text;
  return Object.fromEntries(new URLSearchParams(payload));
}
