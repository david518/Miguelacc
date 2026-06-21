import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma/enums";

const STATUS_MAP: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: "待付款", className: "bg-yellow-50 text-yellow-700" },
  PAID: { label: "已付款", className: "bg-blue-50 text-blue-700" },
  SHIPPED: { label: "已出貨", className: "bg-green-50 text-green-700" },
  FAILED: { label: "付款失敗", className: "bg-red-50 text-red-700" },
  CANCELED: { label: "已取消", className: "bg-zinc-100 text-zinc-500" },
};

const SHIPPING_LABEL: Record<string, string> = {
  HOME_DELIVERY: "宅配到府",
  CVS_PICKUP: "超商取貨",
};

const CVS_LABEL: Record<string, string> = {
  UNIMARTC2C: "7-ELEVEN",
  FAMIC2C: "全家",
  HILIFEC2C: "萊爾富",
  OKMARTC2C: "OK mart",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, payments: { orderBy: { createdAt: "desc" } } },
  });
  if (!order) notFound();

  const s = STATUS_MAP[order.status];
  const isCvs = order.shippingMethod === "CVS_PICKUP";

  return (
    <div className="min-h-full bg-zinc-50 p-6">
      <div className="mb-1 flex items-center gap-3 text-sm">
        <a href="/admin/orders" className="text-zinc-500 hover:text-zinc-900">
          ← 訂單列表
        </a>
        <span className="text-zinc-300">/</span>
        <span className="font-mono text-zinc-600">{order.orderNumber}</span>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-xl font-semibold text-zinc-900">訂單明細</h1>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.className}`}>
          {s.label}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* 品項 */}
        <div className="space-y-6">
          <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <div className="border-b border-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-700">
              訂購品項（{order.items.length}）
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-4 py-2.5 text-left">商品</th>
                  <th className="px-4 py-2.5 text-center">數量</th>
                  <th className="px-4 py-2.5 text-right">原價</th>
                  <th className="px-4 py-2.5 text-right">折後</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-900">{item.variationName ?? "商品"}</p>
                      <p className="text-xs text-zinc-400">商品 ID：{item.productId}</p>
                    </td>
                    <td className="px-4 py-3 text-center text-zinc-600">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-zinc-500 line-through">
                      {item.priceOriginal.toLocaleString("zh-TW")}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-zinc-900">
                      {item.priceDiscount.toLocaleString("zh-TW")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="space-y-1 border-t border-zinc-100 px-4 py-3 text-sm">
              <div className="flex justify-between text-zinc-500">
                <span>原價合計</span>
                <span className="line-through">NT$ {order.subtotalOriginal.toLocaleString("zh-TW")}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-zinc-900">
                <span>應付金額</span>
                <span>NT$ {order.subtotalDiscount.toLocaleString("zh-TW")}</span>
              </div>
            </div>
          </section>

          {/* 付款紀錄 */}
          <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <div className="border-b border-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-700">
              付款紀錄（{order.payments.length}）
            </div>
            {order.payments.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-zinc-400">尚無付款紀錄</p>
            ) : (
              <ul className="divide-y divide-zinc-100 text-sm">
                {order.payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="font-medium text-zinc-800">{p.provider} · {p.status}</p>
                      <p className="text-xs text-zinc-400">交易號：{p.transactionId ?? "—"}</p>
                    </div>
                    <span className="font-medium text-zinc-900">NT$ {p.amount.toLocaleString("zh-TW")}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* 客戶 / 配送 */}
        <aside className="space-y-6">
          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-zinc-700">客戶資訊</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-zinc-400">姓名</dt><dd className="text-zinc-800">{order.customerName}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-zinc-400">Email</dt><dd className="text-zinc-800 break-all">{order.customerEmail}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-zinc-400">電話</dt><dd className="text-zinc-800">{order.customerPhone ?? "—"}</dd></div>
            </dl>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-zinc-700">配送資訊</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-zinc-400">配送方式</dt>
                <dd className="text-zinc-800">{SHIPPING_LABEL[order.shippingMethod] ?? order.shippingMethod}</dd>
              </div>
              {isCvs ? (
                <>
                  <div className="flex justify-between gap-3"><dt className="text-zinc-400">超商</dt><dd className="text-zinc-800">{CVS_LABEL[order.cvsLogisticsType ?? ""] ?? order.cvsLogisticsType ?? "—"}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-zinc-400">門市</dt><dd className="text-zinc-800 text-right">{order.cvsStoreName ?? "—"}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-zinc-400">門市代號</dt><dd className="text-zinc-800">{order.cvsStoreId ?? "—"}</dd></div>
                  <div className="text-xs text-zinc-400">{order.cvsStoreAddress}</div>
                </>
              ) : (
                <div className="flex justify-between gap-3"><dt className="text-zinc-400">地址</dt><dd className="text-zinc-800 text-right">{order.shippingAddress ?? "—"}</dd></div>
              )}
              {order.note && (
                <div className="border-t border-zinc-100 pt-2"><dt className="text-zinc-400">備註</dt><dd className="mt-1 text-zinc-700">{order.note}</dd></div>
              )}
            </dl>
          </section>

          <section className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-xs text-zinc-400">
            <p>建立時間：{new Date(order.createdAt).toLocaleString("zh-TW")}</p>
            <p>更新時間：{new Date(order.updatedAt).toLocaleString("zh-TW")}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
