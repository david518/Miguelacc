import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import { LayoutGrid } from "lucide-react";
import { AdminNav } from "./AdminNav";

const COOKIE_NAME = "admin_token";

async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;
    const secret = process.env.JWT_SECRET;
    if (!secret) return false;
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await verifyAdminSession();
  if (!authenticated) {
    redirect("/admin/login");
  }

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
