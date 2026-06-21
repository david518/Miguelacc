"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { ShippingMethodSelector } from "@/components/ShippingMethodSelector";
import { checkoutAction } from "./actions";

export default function CheckoutPage() {
  const { items, originalTotal, discountedTotal, clear } = useCart();
  const [state, action, pending] = useActionState(checkoutAction, undefined);
  const ecpayFormRef = useRef<HTMLFormElement>(null);

  // When server action returns ECPay params, auto-submit to ECPay
  useEffect(() => {
    if (state && "ecpayUrl" in state && ecpayFormRef.current) {
      clear(); // Clear cart before leaving
      ecpayFormRef.current.submit();
    }
  }, [state, clear]);

  if (items.length === 0 && !(state && "ecpayUrl" in state)) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="text-xl font-semibold text-zinc-900">購物車是空的</p>
          <p className="mt-2 text-sm text-zinc-500">請先選購商品再結帳。</p>
          <Link
            href="/products"
            className="mt-6 inline-block rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600"
          >
            瀏覽商品
          </Link>
        </div>
      </div>
    );
  }

  const itemsWithPrice = items.filter((i) => i.price && i.price > 0);
  const savings = Math.round(originalTotal * 0.1);
  const cvsEligible = items.length > 0 && items.every((i) => i.allowCvsPickup);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hidden ECPay auto-submit form */}
      {state && "ecpayUrl" in state && (
        <form
          ref={ecpayFormRef}
          method="POST"
          action={state.ecpayUrl}
          className="hidden"
        >
          {Object.entries(state.params).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
        </form>
      )}

      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/products" className="text-sm text-zinc-500 hover:text-zinc-900">
            ← 繼續購物
          </Link>
          <span className="text-zinc-300">/</span>
          <h1 className="text-xl font-semibold text-zinc-900">結帳</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Customer info form */}
          <form action={action} className="space-y-5">
            <input
              type="hidden"
              name="cartItems"
              value={JSON.stringify(
                items.map((i) => ({
                  productId: i.productId,
                  variationId: i.variationId,
                  variationName: i.variationName,
                  name: i.name,
                  price: i.price,
                  quantity: i.quantity,
                }))
              )}
            />

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-zinc-900">
                收件人資訊
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-zinc-700">
                    姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="customerName"
                    required
                    placeholder="王小明"
                    className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-400/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    電子郵件 <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="customerEmail"
                    type="email"
                    required
                    placeholder="example@email.com"
                    className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-400/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    手機號碼 <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="customerPhone"
                    type="tel"
                    required
                    placeholder="0912345678"
                    className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-400/20"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-zinc-700">
                    收件地址
                    <span className="ml-2 font-normal text-zinc-400">
                      （宅配必填；超商取貨免填）
                    </span>
                  </label>
                  <input
                    name="shippingAddress"
                    placeholder="台北市中山區中山北路一段"
                    className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-400/20"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-zinc-700">
                    備註
                    <span className="ml-2 font-normal text-zinc-400">（選填）</span>
                  </label>
                  <textarea
                    name="note"
                    rows={2}
                    placeholder="安裝注意事項或其他說明..."
                    className="mt-1.5 w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-400/20"
                  />
                </div>
              </div>
            </div>

            <ShippingMethodSelector cvsEligible={cvsEligible} />

            {state && "error" in state && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending || itemsWithPrice.length === 0}
              className="w-full rounded-full bg-orange-500 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-50"
            >
              {pending
                ? "處理中，請稍候…"
                : `前往付款 NT$ ${discountedTotal.toLocaleString("zh-TW", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            </button>

            <p className="text-center text-xs text-zinc-400">
              點擊後將跳轉至綠界科技安全付款頁面
            </p>
          </form>

          {/* Order summary */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-zinc-900">
                訂單明細
              </h2>
              <ul className="space-y-3 divide-y divide-zinc-100">
                {items.map((item) => (
                  <li key={item.cartId} className="pt-3 first:pt-0">
                    <div className="flex items-start justify-between gap-2 text-sm">
                      <div>
                        <p className="font-medium text-zinc-900 line-clamp-2">
                          {item.name}
                        </p>
                        {item.variationName && (
                          <p className="text-xs text-zinc-400">
                            規格：{item.variationName}
                          </p>
                        )}
                        <p className="text-xs text-zinc-400">x{item.quantity}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {item.price ? (
                          <>
                            <p className="text-xs text-zinc-400 line-through">
                              NT$ {(item.price * item.quantity).toLocaleString("zh-TW")}
                            </p>
                            <p className="font-semibold text-orange-600">
                              NT$ {Math.round(item.price * item.quantity * 0.9).toLocaleString("zh-TW")}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-zinc-400">洽詢</p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 space-y-2 border-t border-zinc-100 pt-4 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>原價合計</span>
                  <span>NT$ {originalTotal.toLocaleString("zh-TW")}</span>
                </div>
                <div className="flex justify-between text-orange-600">
                  <span>9折優惠折扣</span>
                  <span>- NT$ {savings.toLocaleString("zh-TW")}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-zinc-900">
                  <span>應付金額</span>
                  <span>
                    NT${" "}
                    {Math.round(discountedTotal).toLocaleString("zh-TW")}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment methods info */}
            <div className="rounded-2xl bg-zinc-100 p-4 text-xs text-zinc-500">
              <p className="font-medium text-zinc-700 mb-2">支援付款方式</p>
              <ul className="space-y-1">
                <li>💳 信用卡 / 簽帳金融卡</li>
                <li>🏧 ATM 轉帳</li>
                <li>🏪 超商代碼繳費</li>
                <li>📱 行動支付</li>
              </ul>
              <p className="mt-3 text-zinc-400">
                由綠界科技提供安全金流服務
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
