---
title: Miguel ACC 專案總覽
tags:
  - moc
  - miguelacc
created: 2026-06-20
---

# 🚗 Miguel ACC 專案總覽 (MOC)

汽車改裝配件電商網站 — 本機開發 / 測試文件庫。

> [!info] 技術棧
> - **框架**：Next.js 16.2.2 (App Router, Turbopack)
> - **語言**：TypeScript + React 19
> - **資料庫**：Prisma 7 + SQLite (`prisma/dev.db`)
> - **金流**：綠界 ECPay
> - **UI**：Tailwind CSS 4 + shadcn / Radix UI

## 📚 文件導覽

- [[本機部署指南]] — 如何在本機把網站跑起來
- [[環境變數設定]] — `.env` 所有變數說明
- [[後台管理]] — admin 登入與管理功能
- [[綠界測試金流]] — 測試卡號與結帳測試流程
- [[超商取貨與商品上架]] — 超商取貨、綠界物流、後台新增商品
- [[公開通道 (ngrok-cloudflared)]] — 用 cloudflared 通道測綠界回呼
- [[疑難排解紀錄]] — 部署過程遇到的問題與修法

## ⚡ 快速啟動

```bash
cd C:\Miguelacc
npm run dev
```

開啟 👉 **http://localhost:3000**

> [!tip] 建議用 `localhost` 而非 `127.0.0.1`
> 兩者在 Next.js 16 開發模式下視為不同來源，詳見 [[疑難排解紀錄#跨來源 cross-origin 導致按鈕沒反應]]。

## 🔑 重要憑證速查

| 項目 | 值 |
|------|-----|
| 網站位址 | http://localhost:3000 |
| 後台登入 | http://localhost:3000/admin/login |
| Admin 帳號 | `admin@example.com` |
| Admin 密碼 | `admin1234` |
| 綠界商店代號 | `3385459` |
| 綠界測試卡號 | `4311-9522-2222-2222` |

詳見 [[後台管理]] 與 [[綠界測試金流]]。
