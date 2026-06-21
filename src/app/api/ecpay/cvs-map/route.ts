import { NextRequest } from "next/server";
import { buildMapParams, getMapUrl, CVS_SUBTYPES, type CvsSubType } from "@/lib/ecpay-logistics";

/**
 * Opened in a popup from checkout. Renders a self-submitting form that POSTs to
 * ECPay's electronic map. After the shopper picks a store, ECPay POSTs back to
 * /api/ecpay/cvs-callback which messages the result to the checkout tab.
 */
export async function GET(req: NextRequest) {
  const subType = (req.nextUrl.searchParams.get("subType") ?? "UNIMARTC2C") as CvsSubType;
  if (!(subType in CVS_SUBTYPES)) {
    return new Response("Invalid subType", { status: 400 });
  }

  const origin = req.nextUrl.origin;
  const params = buildMapParams({
    subType,
    serverReplyUrl: `${origin}/api/ecpay/cvs-callback`,
  });

  const mapUrl = getMapUrl();
  const inputs = Object.entries(params)
    .map(
      ([k, v]) =>
        `<input type="hidden" name="${k}" value="${String(v).replace(/"/g, "&quot;")}">`
    )
    .join("");

  const html = `<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><title>選擇門市</title></head>
<body onload="document.forms[0].submit()">
<form method="POST" action="${mapUrl}">${inputs}</form>
</body></html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
