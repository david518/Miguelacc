import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Miguel ACC | 汽車改裝配件",
    short_name: "Miguel ACC",
    description: "Miguel Auto Accessories 官方網站與商品展示",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ea580c",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["shopping"],
  };
}
