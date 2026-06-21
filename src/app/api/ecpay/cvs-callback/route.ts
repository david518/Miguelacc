import { NextRequest } from "next/server";

/**
 * ECPay electronic-map reply endpoint.
 * After the shopper picks a store, ECPay does a browser-driven POST here with
 * the chosen store. We bounce it back to the checkout tab via postMessage and
 * close this popup. (Browser-driven POST → works on localhost.)
 */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const store = {
    storeId: String(form.get("CVSStoreID") ?? ""),
    storeName: String(form.get("CVSStoreName") ?? ""),
    storeAddress: String(form.get("CVSAddress") ?? ""),
    storePhone: String(form.get("CVSTelephone") ?? ""),
    subType: String(form.get("LogisticsSubType") ?? ""),
  };

  const json = JSON.stringify(store).replace(/</g, "\\u003c");
  const html = `<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><title>門市選擇完成</title></head>
<body style="font-family:sans-serif;text-align:center;padding:40px;color:#333">
<p>已選擇門市：${store.storeName || "(未取得名稱)"}</p>
<p>視窗將自動關閉…</p>
<script>
  (function () {
    var store = ${json};
    try {
      if (window.opener) {
        window.opener.postMessage({ type: "ecpay-cvs-store", store: store }, window.location.origin);
      }
    } catch (e) {}
    setTimeout(function () { window.close(); }, 600);
  })();
</script>
</body></html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
