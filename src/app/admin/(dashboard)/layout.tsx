import { LayoutGrid } from "lucide-react";
import { AdminNav } from "./AdminNav";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-white">
        <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-4">
          <LayoutGrid className="size-4 text-orange-500" />
          <span className="text-sm font-semibold text-zinc-900">
            Miguel ACC
          </span>
          <span className="ml-auto text-[10px] uppercase tracking-widest text-orange-500">
            Admin
          </span>
        </div>
        <AdminNav />
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
