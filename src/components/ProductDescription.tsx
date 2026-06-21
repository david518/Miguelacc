"use client";

import { useState } from "react";

export function ProductDescription({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  const plain = content.trim();
  const preview = plain.slice(0, 150);
  const needsToggle = plain.length > 150;

  return (
    <div className="space-y-4">
      <p className="whitespace-pre-line text-sm leading-7 text-zinc-700">
        {expanded || !needsToggle ? plain : `${preview}...`}
      </p>
      {needsToggle && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="text-sm font-semibold text-orange-600 hover:text-orange-700"
        >
          {expanded ? "收合" : "顯示全部"}
        </button>
      )}
    </div>
  );
}
