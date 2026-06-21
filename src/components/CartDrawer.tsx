"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";

export function CartDrawer() {
  const { items, discountedTotal, originalTotal, updateQuantity, removeItem, clear } = useCart();
  const [open, setOpen] = useState(false);
  const savings = Math.max(0, originalTotal - discountedTotal);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-orange-600"
      >
        購物車（{items.length}）
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold">9 折購物車</h3>
                <p className="text-sm text-zinc-500">折扣僅在本站計算，蝦皮下單為原價</p>
              </div>
              <button className="text-sm text-zinc-500" onClick={() => setOpen(false)}>
                關閉
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 && <p className="text-sm text-zinc-500">尚未加入任何商品。</p>}
              {items.map((item) => (
                <div key={item.cartId} className="flex gap-3 rounded-2xl border border-zinc-200 p-3">
                  <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-zinc-100">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                    ) : (
                      <div className="h-full w-full bg-zinc-200" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">{item.name}</p>
                        {item.variationName && (
                          <p className="text-xs text-zinc-500">規格：{item.variationName}</p>
                        )}
                      </div>
                      <button className="text-xs text-zinc-400" onClick={() => removeItem(item.cartId)}>
                        移除
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-zinc-500">數量</label>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.cartId, Number(e.target.value))}
                          className="w-16 rounded border border-zinc-300 px-2 py-1 text-sm"
                        />
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-zinc-500 line-through">
                          原價 NT$ {item.price ? (item.price * item.quantity).toLocaleString("zh-TW") : "—"}
                        </p>
                        <p className="text-base font-semibold text-orange-600">
                          9 折 NT$ {item.price ? Math.round(item.price * item.quantity * 0.9).toLocaleString("zh-TW") : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-zinc-200 px-6 py-4 text-sm">
              <div className="flex justify-between">
                <span>原價合計</span>
                <span>NT$ {originalTotal.toLocaleString("zh-TW")}</span>
              </div>
              <div className="flex justify-between text-orange-600">
                <span>折扣（9折）</span>
                <span>省 NT$ {savings.toLocaleString("zh-TW")}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-zinc-900">
                <span>折扣後金額</span>
                <span>NT$ {discountedTotal.toLocaleString("zh-TW")}</span>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={clear}
                  className="w-1/4 rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:border-zinc-400 disabled:opacity-40"
                  disabled={items.length === 0}
                >
                  清空
                </button>
                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  className={`flex-1 rounded-full bg-orange-500 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-orange-600 ${
                    items.length === 0
                      ? "pointer-events-none opacity-40"
                      : ""
                  }`}
                >
                  前往結帳（9折）
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
