import Link from "next/link";

export function FloatingSupportButton() {
  return (
    <Link
      href="https://line.me/R/ti/p/@pty8370v"
      target="_blank"
      className="fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full bg-[#06c755] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#05b04b]"
    >
      <span className="text-base">💬</span>
      LINE 客服
    </Link>
  );
}
