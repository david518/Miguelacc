import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { CartDrawer } from "@/components/CartDrawer";
import { FloatingSupportButton } from "@/components/FloatingSupportButton";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "Miguel ACC | 汽車改裝配件",
  description: "Miguel Auto Accessories 官方網站與商品展示",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Miguel ACC",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#ea580c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className="h-full antialiased">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full bg-white text-zinc-900">
        <ServiceWorkerRegistration />
        <CartProvider>
          {children}
          <CartDrawer />
          <FloatingSupportButton />
        </CartProvider>
      </body>
    </html>
  );
}
