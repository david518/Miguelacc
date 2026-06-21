"use client";

import { useActionState } from "react";
import { saveProductAction } from "./actions";
import { Button } from "@/components/ui/button";

type Props = {
  shopeeId: string;
  defaultName: string;
  defaultDescription: string;
  defaultBasePrice?: number;
  defaultThumbnailUrl: string;
  defaultImages: string[];
  defaultShopeeUrl: string;
  defaultIsActive: boolean;
  defaultAllowCvsPickup: boolean;
  isDbNative?: boolean;
};

export function ProductEditForm({
  shopeeId,
  defaultName,
  defaultDescription,
  defaultBasePrice,
  defaultThumbnailUrl,
  defaultImages,
  defaultShopeeUrl,
  defaultIsActive,
  defaultAllowCvsPickup,
  isDbNative = false,
}: Props) {
  const [state, action, pending] = useActionState(saveProductAction, undefined);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="shopeeId" value={shopeeId} />
      <input type="hidden" name="isDbNative" value={isDbNative ? "true" : "false"} />

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-zinc-700">
          商品名稱
        </label>
        <input
          name="name"
          defaultValue={defaultName}
          required
          className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-400/20"
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-zinc-700">
          統一定價（TWD）
          <span className="ml-2 font-normal text-zinc-400">
            不填則沿用各規格價格
          </span>
        </label>
        <input
          name="basePrice"
          type="number"
          min={0}
          step={1}
          defaultValue={defaultBasePrice ?? ""}
          placeholder="例：9900"
          className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-400/20"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-zinc-700">
          商品描述
        </label>
        <textarea
          name="description"
          defaultValue={defaultDescription}
          required
          rows={8}
          className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-400/20 resize-y"
        />
      </div>

      {/* Thumbnail */}
      <div>
        <label className="block text-sm font-medium text-zinc-700">
          主圖 URL
        </label>
        <input
          name="thumbnailUrl"
          type="url"
          defaultValue={defaultThumbnailUrl}
          placeholder="https://..."
          className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-400/20"
        />
        <p className="mt-1 text-xs text-zinc-400">
          貼上圖片網址。留空則使用蝦皮原始主圖。
        </p>
      </div>

      {/* Images (multi-line) */}
      <div>
        <label className="block text-sm font-medium text-zinc-700">
          全部圖片網址
          <span className="ml-2 font-normal text-zinc-400">每行一個網址</span>
        </label>
        <textarea
          name="images"
          defaultValue={defaultImages.join("\n")}
          rows={6}
          placeholder={"https://example.com/img1.jpg\nhttps://example.com/img2.jpg"}
          className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 font-mono text-xs text-zinc-700 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-400/20 resize-y"
        />
        <p className="mt-1 text-xs text-zinc-400">
          留空則使用蝦皮原始圖庫。填入後將完全取代原始圖庫。
        </p>
      </div>

      {/* Shopee URL */}
      <div>
        <label className="block text-sm font-medium text-zinc-700">
          蝦皮商品連結
        </label>
        <input
          name="shopeeUrl"
          type="url"
          defaultValue={defaultShopeeUrl}
          placeholder="https://shopee.tw/..."
          className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-400/20"
        />
        <p className="mt-1 text-xs text-zinc-400">
          前台「前往蝦皮下單」按鈕的連結目標。
        </p>
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="hidden"
            name="isActive"
            value={defaultIsActive ? "true" : "false"}
          />
          <input
            type="checkbox"
            id="isActiveCheckbox"
            defaultChecked={defaultIsActive}
            onChange={(e) => {
              const hidden = e.currentTarget.form?.elements.namedItem(
                "isActive"
              ) as HTMLInputElement | null;
              if (hidden) hidden.value = e.currentTarget.checked ? "true" : "false";
            }}
            className="size-4 rounded"
          />
          <span className="text-sm font-medium text-zinc-700">
            前台顯示此商品（上架）
          </span>
        </label>
        <span className="ml-auto text-xs text-zinc-400">
          取消勾選將隱藏於前台列表
        </span>
      </div>

      {/* CVS pickup toggle */}
      <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="hidden"
            name="allowCvsPickup"
            value={defaultAllowCvsPickup ? "true" : "false"}
          />
          <input
            type="checkbox"
            id="allowCvsPickupCheckbox"
            defaultChecked={defaultAllowCvsPickup}
            onChange={(e) => {
              const hidden = e.currentTarget.form?.elements.namedItem(
                "allowCvsPickup"
              ) as HTMLInputElement | null;
              if (hidden) hidden.value = e.currentTarget.checked ? "true" : "false";
            }}
            className="size-4 rounded"
          />
          <span className="text-sm font-medium text-zinc-700">
            可超商取貨（綠界物流）
          </span>
        </label>
        <span className="ml-auto text-xs text-zinc-400">
          限小件商品（≤5kg、單邊≤45cm）
        </span>
      </div>

      {/* Error */}
      {state && "error" in state && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending} size="lg" className="gap-2">
          {pending ? "儲存中…" : "儲存變更"}
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
