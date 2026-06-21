import { NewProductForm } from "./NewProductForm";

export default function AdminNewProductPage() {
  return (
    <div className="min-h-full bg-zinc-50 p-6">
      <div className="mb-1 flex items-center gap-3 text-sm">
        <a href="/admin/products" className="text-zinc-500 hover:text-zinc-900">
          ← 商品列表
        </a>
        <span className="text-zinc-300">/</span>
        <span className="text-zinc-600">新增商品</span>
      </div>

      <h1 className="mb-1 text-xl font-semibold text-zinc-900">新增商品</h1>
      <p className="mb-6 text-sm text-zinc-500">
        直接在網站建立商品，不需透過蝦皮匯入。
      </p>

      <div className="max-w-2xl">
        <NewProductForm />
      </div>
    </div>
  );
}
