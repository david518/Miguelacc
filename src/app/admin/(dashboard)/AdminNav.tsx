"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, ShoppingCart, Tags, LayoutGrid, LogOut } from "lucide-react";

const navItems = [
  { href: "/admin/products", label: "商品管理", icon: Package },
  { href: "/admin/categories", label: "分類管理", icon: Tags },
  { href: "/admin/orders", label: "訂單管理", icon: ShoppingCart },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="flex flex-col gap-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-zinc-100 font-medium text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-zinc-100 px-2 py-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
        >
          <LayoutGrid className="size-4" />
          查看前台 ↗
        </Link>
        <Link
          href="/admin/logout"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="size-4" />
          登出
        </Link>
      </div>
    </>
  );
}
