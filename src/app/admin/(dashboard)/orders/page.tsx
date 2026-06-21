import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma/enums";

const STATUS_MAP: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  PENDING: { label: "待付款", className: "bg-yellow-50 text-yellow-700" },
  PAID: { label: "已付款", className: "bg-blue-50 text-blue-700" },
  SHIPPED: { label: "已出貨", className: "bg-green-50 text-green-700" },
  FAILED: { label: "付款失敗", className: "bg-red-50 text-red-700" },
  CANCELED: { label: "已取消", className: "bg-zinc-100 text-zinc-500" },
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const statusFilter =
    typeof sp.status === "string" && sp.status in STATUS_MAP
      ? (sp.status as OrderStatus)
      : undefined;

  const [orders, counts] = await Promise.all([
    prisma.order.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      include: { items: true, payments: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  const totalOrders = counts.reduce((sum, c) => sum + c._count.id, 0);

  const statusCounts = Object.fromEntries(
    counts.map((c) => [c.status, c._count.id])
  ) as Record<string, number>;

  const statuses: Array<{ value: string; label: string }> = [
    { value: "ALL", label: `全部（${totalOrders}）` },
    ...Object.entries(STATUS_MAP).map(([value, { label }]) => ({
      value,
      label: `${label}（${statusCounts[value] ?? 0}）`,
    })),
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">訂單管理</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            共 {totalOrders} 筆訂單
          </p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {statuses.map((s) => {
          const active =
            s.value === "ALL" ? !statusFilter : statusFilter === s.value;
          const href =
            s.value === "ALL"
              ? "/admin/orders"
              : `/admin/orders?status=${s.value}`;
          return (
            <a
              key={s.value}
              href={href}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {s.label}
            </a>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white py-20 text-center">
          <p className="text-zinc-500">尚無訂單記錄</p>
          <p className="mt-1 text-xs text-zinc-400">
            當前台結帳流程完成後，訂單將自動出現在此。
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3 text-left">訂單編號</th>
                <th className="px-4 py-3 text-left">客戶</th>
                <th className="px-4 py-3 text-center">狀態</th>
                <th className="px-4 py-3 text-right">件數</th>
                <th className="px-4 py-3 text-right">原價 (TWD)</th>
                <th className="px-4 py-3 text-right">折後 (TWD)</th>
                <th className="px-4 py-3 text-left">日期</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orders.map((order) => {
                const s = STATUS_MAP[order.status];
                return (
                  <tr
                    key={order.id}
                    className="hover:bg-zinc-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-zinc-700 hover:text-orange-600 hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-900">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {order.customerEmail}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.className}`}
                      >
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-600">
                      {order.items.length}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-500 line-through">
                      {order.subtotalOriginal.toLocaleString("zh-TW")}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-zinc-900">
                      {order.subtotalDiscount.toLocaleString("zh-TW")}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {new Date(order.createdAt).toLocaleDateString("zh-TW")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-xs font-medium text-orange-500 hover:underline"
                      >
                        明細 →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
