---
title: 公開通道 (cloudflared)
tags:
  - tunnel
  - testing
  - ecpay
created: 2026-06-21
---

# 🌐 公開通道（cloudflared）

回到 [[00-總覽 (MOC)]]。相關：[[綠界測試金流]]、[[超商取貨與商品上架]]。

綠界的**伺服器對伺服器回呼**（付款結果 ReturnURL、物流狀態通知）連不到本機 `localhost`。要在本機完整測試金流/物流回呼，需要把本機透過通道公開到外網。

本專案用 **cloudflared 快速通道**（免註冊、免 authtoken）。

## 安裝

```powershell
winget install --id Cloudflare.cloudflared -e
```
執行檔位置（PATH 未重載時用全路徑）：
`C:\Users\Medlmg_Server\AppData\Local\Microsoft\WinGet\Links\cloudflared.exe`

## 啟動通道

```bash
cloudflared tunnel --url http://localhost:3000
```
輸出會出現一個網址，例如：`https://xxxx-yyyy.trycloudflare.com`

## 設定（每次通道網址改變都要更新）

1. `.env` 的 `NEXT_PUBLIC_BASE_URL` 改成通道網址
2. `next.config.ts` 的 `allowedDevOrigins` 已加 `*.trycloudflare.com`（萬用字元，不用每次改）
3. **重啟 `npm run dev`**（`.env` 改了才會生效）

> [!note] 快速通道網址每次重啟都會變
> trycloudflare 的免費快速通道是隨機網址，重開就換一組，記得回來更新 `NEXT_PUBLIC_BASE_URL`。
> 若要固定網址，需用 Cloudflare 具名通道（需登入帳號）或 ngrok 付費版。

## 已驗證的端到端測試（2026-06-21）

- **付款回呼**：模擬綠界送付款成功通知到通道 → 訂單變 `PAID`、建立 Payment 紀錄、回應 `1|OK` ✅
- **物流建單**：付款成功後自動呼叫綠界建立超商取貨單，CheckMacValue（MD5）與所有參數通過驗證 ✅（見 [[超商取貨與商品上架]]）

## 上線後

正式環境是真實公開網域（不需通道），把 `NEXT_PUBLIC_BASE_URL` 設成正式網址、`ECPAY_IS_STAGE="false"` 並換上正式憑證即可。見 [[環境變數設定]]。
