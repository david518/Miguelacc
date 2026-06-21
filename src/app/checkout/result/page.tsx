import Link from "next/link";

export default async function CheckoutResultPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  // ECPay sends these after redirect
  const rtnCode = typeof sp.RtnCode === "string" ? sp.RtnCode : sp.rtnCode;
  const rtnMsg =
    typeof sp.RtnMsg === "string"
      ? decodeURIComponent(sp.RtnMsg)
      : typeof sp.rtnMsg === "string"
      ? decodeURIComponent(sp.rtnMsg)
      : "";
  const tradeNo = typeof sp.TradeNo === "string" ? sp.TradeNo : sp.MerchantTradeNo;
  const paymentType = typeof sp.PaymentType === "string" ? sp.PaymentType : "";

  const isSuccess = rtnCode === "1";

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
        {isSuccess ? (
          <>
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-green-50">
              <svg className="size-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900">付款成功！</h1>
            <p className="mt-2 text-sm text-zinc-500">
              感謝您在 Miguel ACC 下單，我們將盡快安排出貨。
            </p>
            {tradeNo && (
              <div className="mt-5 rounded-xl bg-zinc-50 px-5 py-4 text-left text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">交易編號</span>
                  <span className="font-mono text-zinc-900">{tradeNo}</span>
                </div>
                {paymentType && (
                  <div className="mt-2 flex justify-between">
                    <span className="text-zinc-500">付款方式</span>
                    <span className="text-zinc-900">{paymentType}</span>
                  </div>
                )}
              </div>
            )}
            <p className="mt-5 text-xs text-zinc-400">
              訂單確認信將寄送至您的電子郵件信箱，如有疑問請與我們聯絡。
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-red-50">
              <svg className="size-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900">付款未完成</h1>
            <p className="mt-2 text-sm text-zinc-500">
              {rtnMsg || "付款流程未完成，請重試或選擇其他付款方式。"}
            </p>
          </>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/products"
            className="rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-700 hover:border-zinc-400 transition-colors"
          >
            繼續購物
          </Link>
          {!isSuccess && (
            <Link
              href="/checkout"
              className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              重新結帳
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
