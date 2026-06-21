"use client";

import { useEffect, useState } from "react";

const CVS_SUBTYPES: { value: string; label: string }[] = [
  { value: "UNIMARTC2C", label: "7-ELEVEN" },
  { value: "FAMIC2C", label: "全家" },
  { value: "HILIFEC2C", label: "萊爾富" },
  { value: "OKMARTC2C", label: "OK mart" },
];

type Store = {
  storeId: string;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  subType: string;
};

export function ShippingMethodSelector({ cvsEligible }: { cvsEligible: boolean }) {
  const [method, setMethod] = useState<"HOME_DELIVERY" | "CVS_PICKUP">("HOME_DELIVERY");
  const [subType, setSubType] = useState("UNIMARTC2C");
  const [store, setStore] = useState<Store | null>(null);

  // Receive the chosen store from the map popup
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "ecpay-cvs-store" && e.data.store) {
        setStore(e.data.store as Store);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // If method switches away from CVS, clear any chosen store
  useEffect(() => {
    if (method !== "CVS_PICKUP") setStore(null);
  }, [method]);

  function openMap() {
    window.open(
      `/api/ecpay/cvs-map?subType=${encodeURIComponent(subType)}`,
      "ecpayMap",
      "width=1000,height=700"
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-zinc-900">配送方式</h2>

      {/* Hidden fields submitted with the checkout form */}
      <input type="hidden" name="shippingMethod" value={method} />
      <input type="hidden" name="cvsSubType" value={method === "CVS_PICKUP" ? subType : ""} />
      <input type="hidden" name="cvsStoreId" value={store?.storeId ?? ""} />
      <input type="hidden" name="cvsStoreName" value={store?.storeName ?? ""} />
      <input type="hidden" name="cvsStoreAddress" value={store?.storeAddress ?? ""} />

      <div className="space-y-3">
        <label className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 text-sm has-[:checked]:border-orange-400 has-[:checked]:bg-orange-50 cursor-pointer">
          <input
            type="radio"
            name="shippingMethodRadio"
            checked={method === "HOME_DELIVERY"}
            onChange={() => setMethod("HOME_DELIVERY")}
            className="size-4"
          />
          <span className="font-medium text-zinc-800">宅配到府</span>
        </label>

        <label
          className={`flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 text-sm has-[:checked]:border-orange-400 has-[:checked]:bg-orange-50 ${
            cvsEligible ? "cursor-pointer" : "opacity-40 cursor-not-allowed"
          }`}
        >
          <input
            type="radio"
            name="shippingMethodRadio"
            checked={method === "CVS_PICKUP"}
            disabled={!cvsEligible}
            onChange={() => setMethod("CVS_PICKUP")}
            className="size-4"
          />
          <span className="font-medium text-zinc-800">超商取貨</span>
          {!cvsEligible && (
            <span className="ml-auto text-xs text-zinc-400">含大件商品，不適用</span>
          )}
        </label>
      </div>

      {method === "CVS_PICKUP" && cvsEligible && (
        <div className="mt-4 space-y-3 rounded-lg border border-zinc-100 bg-zinc-50 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm text-zinc-600">超商：</label>
            <select
              value={subType}
              onChange={(e) => {
                setSubType(e.target.value);
                setStore(null);
              }}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm"
            >
              {CVS_SUBTYPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={openMap}
              className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-black"
            >
              {store ? "重新選擇門市" : "選擇門市"}
            </button>
          </div>

          {store ? (
            <div className="rounded-lg border border-orange-200 bg-white p-3 text-sm">
              <p className="font-semibold text-zinc-900">{store.storeName}</p>
              <p className="text-zinc-500">{store.storeAddress}</p>
              <p className="text-xs text-zinc-400">門市代號：{store.storeId}</p>
            </div>
          ) : (
            <p className="text-xs text-zinc-400">尚未選擇門市，請點「選擇門市」。</p>
          )}
        </div>
      )}
    </div>
  );
}
