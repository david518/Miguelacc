"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return <div className="aspect-square rounded-3xl bg-gradient-to-br from-zinc-100 to-zinc-200" />;
  }

  const showNav = images.length > 1;
  const go = (delta: number) =>
    setActiveIndex((prev) => (prev + delta + images.length) % images.length);

  return (
    <div className="space-y-4">
      <div className="group relative aspect-square overflow-hidden rounded-3xl bg-zinc-100">
        <Image
          src={images[activeIndex]}
          alt={alt}
          fill
          sizes="(max-width:1024px) 100vw, 60vw"
          className="object-cover"
          priority
        />
        {showNav && (
          <>
            <button
              type="button"
              aria-label="上一張"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-zinc-900 shadow-sm transition hover:bg-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="下一張"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-zinc-900 shadow-sm transition hover:bg-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white">
              {activeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
          {images.map((img, index) => (
            <button
              type="button"
              key={img + index}
              onClick={() => setActiveIndex(index)}
              aria-label={`檢視圖片 ${index + 1}`}
              className={`relative aspect-square overflow-hidden rounded-xl bg-zinc-100 transition ${
                index === activeIndex
                  ? "ring-2 ring-orange-500 ring-offset-2"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${alt} 縮圖 ${index + 1}`}
                fill
                sizes="150px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
