"use client";

import { useActionState, useEffect } from "react";
import { createProductAction } from "./actions";
import { Button } from "@/components/ui/button";

const inputCls =
  "mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-400/20";

export function NewProductForm() {
  const [state, action, pending] = useActionState(createProductAction, undefined);

  useEffect(() => {
    if (state && "success" in state && state.success) {
      window.location.href = state.redirectTo;
    }
  }, [state]);

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-zinc-700">
          商品名稱 <span className="text-red-500">*</span>
        </label>
        <input name="name" required placeholder="例：通用型碳纖維後視鏡蓋" className={inputCls} />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700">
          統一定價（TWD）
        </label>
        <input name="basePrice" type="number" min={0} step={1} placeholder="例：1200" className={inputCls} />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700">
          商品描述 <span className="text-red-500">*</span>
        </label>
        <textarea name="description" required rows={8} className={`${inputCls} resize-y`} />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700">主圖 URL</label>
        <input name="thumbnailUrl" type="url" placeholder="https://..." className={inputCls} />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700">
          全部圖片網址 <span className="ml-2 font-normal text-zinc-400">每行一個網址</span>
        </label>
        <textarea
          name="images"
          rows={5}
          placeholder={"https://example.com/img1.jpg\nhttps://example.com/img2.jpg"}
          className={`${inputCls} font-mono text-xs`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700">蝦皮商品連結（選填）</label>
        <input name="shopeeUrl" type="url" placeholder="https://shopee.tw/..." className={inputCls} />
      </div>

      {/* Active */}
      <label className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 cursor-pointer">
        <input type="hidden" name="isActive" value="true" />
        <input
          type="checkbox"
          defaultChecked
          onChange={(e) => {
            const h = e.currentTarget.form?.elements.namedItem("isActive") as HTMLInputElement | null;
            if (h) h.value = e.currentTarget.checked ? "true" : "false";
          }}
          className="size-4 rounded"
        />
        <span className="text-sm font-medium text-zinc-700">前台顯示此商品（上架）</span>
      </label>

      {/* CVS pickup */}
      <label className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 cursor-pointer">
        <input type="hidden" name="allowCvsPickup" value="false" />
        <input
          type="checkbox"
          onChange={(e) => {
            const h = e.currentTarget.form?.elements.namedItem("allowCvsPickup") as HTMLInputElement | null;
            if (h) h.value = e.currentTarget.checked ? "true" : "false";
          }}
          className="size-4 rounded"
        />
        <span className="text-sm font-medium text-zinc-700">可超商取貨（綠界物流）</span>
        <span className="ml-auto text-xs text-zinc-400">限小件（≤5kg、單邊≤45cm）</span>
      </label>

      {state && "error" in state && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending} size="lg">
          {pending ? "建立中…" : "建立商品"}
        </Button>
        <a
          href="/admin/products"
          className="flex items-center rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          取消
        </a>
      </div>
    </form>
  );
}
