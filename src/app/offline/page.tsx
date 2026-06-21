"use client";
export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-zinc-300"
      >
        <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
      </svg>
      <h1 className="text-xl font-semibold text-zinc-800">目前離線</h1>
      <p className="text-sm text-zinc-500">
        請確認網路連線後重新整理頁面。
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
      >
        重新整理
      </button>
    </div>
  );
}
