# StockLens — 開發手冊

## 專案資料

| 項目 | 值 |
|------|-----|
| 網站 | https://us-stocks.netlify.app |
| GitHub | https://github.com/sclastro/us-stocks |
| 本機路徑 | C:\Claude_Projects\my-new-site |
| 技術 | 純 HTML / CSS / JS，多頁架構，無框架 |
| 本地開發 | `netlify dev`（localhost:8888） |
| Netlify 帳號 | 新帳號（舊帳號因超出免費額度停用） |
| Build 狀態 | **Stopped Builds**（不自動 deploy，保護 credits） |
| Deploy 方式 | 本機測試完成後手動執行 `netlify deploy --prod` |

---

## Auto Push

Every file edit is automatically committed and pushed to GitHub via `push.bat`.

To push manually: run `push.bat` from the project root.

---

## 專案架構

```
my-new-site/
├── index.html                   # 主入口（redirect 到 pages/quote.html）
├── netlify.toml                 # Netlify build + functions 設定
├── .env                         # 本機環境變數（不上傳 GitHub）
├── css/
│   └── style.css                # 所有共用樣式（nav、cards、watchlist、pos-bar 等）
├── js/
│   ├── config.js                # API key 和全域常數（本地 file:// 備用）
│   ├── api.js                   # 所有 API call（Finnhub + Yahoo）
│   └── utils.js                 # i18n、watchlist state、格式化工具函數
│                                # 含：formatVolume、calcWeekPosition、renderPositionBar
├── netlify/
│   └── functions/
│       ├── finnhub.js           # Finnhub proxy（server-side 隱藏 API key）
│       ├── yahoo.js             # Yahoo Finance 即時報價 proxy（已擴展返回字段）
│       └── yahoo-history.js     # Yahoo Finance 歷史 OHLCV proxy（Lightweight Charts 用）
├── pages/
│   ├── quote.html               # 股票搜尋頁
│   ├── detail.html              # 詳情頁（股票/ETF/指數/匯率/商品，統一入口）
│   ├── etf.html                 # ETF 分類瀏覽（~72隻，按資產/地區分類）
│   ├── indices.html             # 環球指數（6個分類，Yahoo Finance 數據）
│   ├── watchlist.html           # 自選清單（即時價格 + 強化欄位）
│   └── portfolio.html           # 持倉追蹤（Coming soon）
└── CLAUDE.md
```

## 每個檔案的用途

| 檔案 | 用途 |
|------|------|
| `index.html` | 入口，redirect 到 `pages/quote.html` |
| `netlify.toml` | publish dir = `.`，functions dir = `netlify/functions` |
| `netlify/functions/finnhub.js` | Finnhub proxy，server-side 注入 API key，轉發至 Finnhub |
| `netlify/functions/yahoo.js` | Yahoo Finance v8 proxy，返回標準化即時報價（含 trailingPE） |
| `netlify/functions/yahoo-history.js` | Yahoo Finance v8 歷史 OHLCV proxy，返回 bars 陣列 |
| `css/style.css` | 共用樣式：CSS 變數、nav、card、skeleton、watchlist、pos-bar、ETF、indices |
| `js/config.js` | `CONFIG.FH_KEY`、`CONFIG.FH_BASE`、`CONFIG.HOT_STOCKS` |
| `js/api.js` | `API` 物件，自動路由：`file://` → 直連 Finnhub，HTTP → Netlify proxy |
| `js/utils.js` | `I18N`、`TINTS`、`tr()`、`fmt$()`、`fmtCap()`、`esc()`、`tsToDate()`、`detectSentiment()`、`formatVolume()`、`calcWeekPosition()`、`renderPositionBar()`、`watchlist` Set、`applyLang()`、`setLang()`、`updateWlBadge()` |
| `pages/quote.html` | 股票搜尋頁，點擊跳轉到 `detail.html?symbol=XXX&type=TYPE` |
| `pages/detail.html` | 統一詳情頁：報價卡、Lightweight Charts 圖表（K線/線圖）、新聞 |
| `pages/watchlist.html` | 自選清單，Yahoo Finance 批量報價，8 欄位顯示 |
| `pages/etf.html` | ETF 分類瀏覽（資產類別 + 地區，~72 隻 ETF，含描述） |
| `pages/indices.html` | 環球指數（Yahoo Finance），6 個分類，含匯率、商品 |
| `pages/portfolio.html` | Coming soon |

---

## api.js 使用方法

所有頁面通過 `API` 物件呼叫，**禁止**直接寫 `fetch("https://finnhub.io/...")` 或 `fetch("https://query1.finance.yahoo.com/...")`：

```javascript
// 即時報價（Finnhub，通過 proxy）
const quote = await API.getQuote('AAPL');
// { c: 178.32, d: 0.82, dp: 0.46, h: 179.1, l: 177.5, o: 177.9, pc: 177.5 }

// 公司資料
const profile = await API.getCompanyProfile('AAPL');
// { name, exchange, finnhubIndustry, currency, marketCapitalization, ... }

// 財務指標（含 52 週高低）
const metrics = await API.getMetrics('AAPL');
// { metric: { '52WeekHigh': 199.62, '52WeekLow': 164.08, ... } }

// 公司新聞（自動 fallback 60 天 → 180 天）
const news = await API.getNews('AAPL');
// [{ headline, summary, source, datetime, url }, ...]

// 環球指數 / 股票報價（Yahoo Finance，通過 proxy，需 HTTP 環境）
// watchlist.html 也用此方法取得所有股票數據
const data = await API.getIndexQuote('^GSPC');
// { price, change, changePercent, marketState, currency,
//   open, dayHigh, dayLow, volume,
//   fiftyTwoWeekHigh, fiftyTwoWeekLow, shortName, trailingPE }

// 歷史 OHLCV bars（Yahoo Finance，Lightweight Charts 用）
const bars = await API.getHistory('AAPL', '1mo', '1d');
// [{ time: unixSeconds, open, high, low, close, volume }, ...]
```

---

## Netlify Functions 說明

### `finnhub.js` — `/.netlify/functions/finnhub`

- **用途**：轉發 Finnhub API 請求，server-side 注入 API key，避免 key 暴露前端
- **環境變數**：`FINNHUB_API_KEY`（Netlify Project configuration → Environment variables）
- **呼叫方式**：`/.netlify/functions/finnhub?path=quote&symbol=AAPL`
  - `path` = Finnhub endpoint（`quote`、`stock/profile2`、`stock/candle` 等）
  - 其餘 query params 原樣轉發

### `yahoo.js` — `/.netlify/functions/yahoo`

- **用途**：Yahoo Finance v8 即時報價，適用指數/商品/匯率/股票
- **不需要 API key**
- **呼叫方式**：`/.netlify/functions/yahoo?symbol=^GSPC`
- **返回格式**：
  ```json
  {
    "price": 5648.40,
    "change": 25.35,
    "changePercent": 0.45,
    "marketState": "REGULAR",
    "currency": "USD",
    "open": 5620.10,
    "dayHigh": 5660.00,
    "dayLow": 5610.50,
    "volume": 3456789000,
    "fiftyTwoWeekHigh": 5878.46,
    "fiftyTwoWeekLow": 4803.69,
    "shortName": "S&P 500",
    "trailingPE": 26.5
  }
  ```
  - `changePercent` 已是百分比值（`1.24` = +1.24%）
  - `trailingPE`：有盈利股票才有；ETF / 指數 / 虧損股返回 `null`
  - `marketState`：`REGULAR` / `PRE` / `POST` / `POSTPOST` / `CLOSED`

### `yahoo-history.js` — `/.netlify/functions/yahoo-history`

- **用途**：Yahoo Finance v8 歷史 OHLCV 數據，供 Lightweight Charts 渲染
- **不需要 API key**
- **呼叫方式**：`/.netlify/functions/yahoo-history?symbol=AAPL&range=1mo&interval=1d`
- **有效 range**：`1d` `5d` `1mo` `3mo` `6mo` `1y` `2y` `5y` `10y` `ytd` `max`
- **有效 interval**：`1m` `5m` `15m` `30m` `60m` `1h` `1d` `1wk` `1mo`
- **返回格式**：`{ bars: [{ time, open, high, low, close, volume }, ...] }`
  - `time` 為 Unix seconds（整數）
  - 自動過濾 null / NaN 的 bars

---

## detail.html — URL 跳轉架構

所有詳情頁統一跳去 `detail.html`，用 `type` 參數區分數據來源：

| URL | 數據來源 | 說明 |
|-----|---------|------|
| `detail.html?symbol=AAPL&type=stock` | Finnhub | 普通股票 |
| `detail.html?symbol=QQQ&type=etf` | Finnhub（fallback Yahoo） | ETF |
| `detail.html?symbol=^GSPC&type=index` | Yahoo Finance | 指數 |
| `detail.html?symbol=EURUSD=X&type=forex` | Yahoo Finance | 匯率 |
| `detail.html?symbol=GC=F&type=commodity` | Yahoo Finance | 商品 |

`isYahoo = symType === 'index' || symType === 'forex' || symType === 'commodity'`

### detail.html 圖表（Lightweight Charts）

- **Library**：`lightweight-charts@4.2.2`（CDN standalone UMD，在 `<head>` 載入）
- **數據來源**：`API.getHistory()` → Yahoo Finance，適用所有 type（不再依賴 TradingView）
- **Period mapping**：

| 按鈕 | range | interval | badge |
|------|-------|----------|-------|
| 1M | `1mo` | `1d` | 日線 / Daily |
| 3M | `3mo` | `1d` | 日線 / Daily |
| 6M | `6mo` | `1d` | 日線 / Daily |
| 1Y | `1y` | `1wk` | 週線 / Weekly |
| 3Y | `5y` | `1wk` | 週線 / Weekly |
| 5Y | `5y` | `1mo` | 月線 / Monthly |

- **圖表類型**：K線（Candlestick）/ 線圖（Line）切換按鈕（`.ct-btn`）
- **顏色**：漲 `#22c55e`，跌 `#ef4444`，線圖 `#3b82f6`
- **Responsive**：ResizeObserver 監聽容器寬度自動調整
- **VIX 特例**：顯示「高波動 >20」/「低波動 <20」（中性灰），不顯示升跌顏色

---

## 自選清單（watchlist.html）強化

### 欄位順序

名稱 | 現價 | 漲跌幅 | 52W 範圍 | 52W 位置 | 成交量 | P/E | 移除

### 數據來源

所有數據由 `API.getIndexQuote(sym)`（Yahoo Finance）取得，每隔 300ms 批量更新一個 symbol。

### Responsive 斷點

| 寬度 | 可見欄位 |
|------|---------|
| ≥ 769px | 全部 8 欄 |
| 601–768px | 隱藏 52W 範圍、成交量 |
| ≤ 600px | 再隱藏升跌幅、52W 位置、P/E（只剩名稱、現價、移除） |

### 進度條顏色（`.pos-bar-fill`）

- < 30%：紅色 `#ef4444`
- 30–70%：橙色 `#f97316`
- > 70%：綠色 `#22c55e`

---

## utils.js 工具函數

```javascript
// 大數字縮寫
formatVolume(num)
// >= 1B → '1.23B'  |  >= 1M → '456.7M'  |  >= 1K → '123.4K'

// 52 週位置百分比（0–100 整數）
calcWeekPosition(price, low52, high52)
// 返回 number | null（數據不足時）

// 進度條 HTML（高度 4px，顏色隨百分比變化）
renderPositionBar(percent)
// 返回包含 .pos-bar-cell > .pos-bar-pct + .pos-bar-wrap > .pos-bar-fill 的 HTML string

// 其他現有函數
fmt$(n)                             // 格式化美元價格（兩位小數）
fmtCap(m)                           // 市值縮寫（$T / $B / $M）
esc(s)                              // HTML escape（防 XSS）
tsToDate(ts)                        // Unix seconds → 'YYYY-MM-DD'
tr(key)                             // i18n 翻譯，優先 currentLang
detectSentiment(title, summary)     // 新聞情緒分析（'pos' / 'neg' / 'neu'）
applyLang()                         // 套用 data-i18n 屬性
setLang(lang)                       // 切換語言並儲存到 localStorage
updateWlBadge()                     // 更新 nav 的自選清單計數徽章
```

---

## 腳本載入順序

每個頁面 `<script>` 必須按此順序：

```html
<script src="../js/config.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/api.js"></script>   <!-- 如果頁面需要 API -->
<script>
  applyLang();
  updateWlBadge();
  /* 頁面專屬邏輯 */
</script>
```

`detail.html` 額外需要（在 `</head>` 前載入）：

```html
<script src="https://unpkg.com/lightweight-charts@4.2.2/dist/lightweight-charts.standalone.production.js"></script>
```

---

## localStorage 鍵名

| 鍵名 | 內容 |
|------|------|
| `stocklens.watchlist` | `["AAPL","TSLA",...]` 自選清單 |
| `stocklens.lang` | `"zh"` 或 `"en"` |

---

## i18n 鍵名對照

| key | 中文 | English |
|-----|------|---------|
| `chart_title` | 價格走勢 | Price chart |
| `chart_loading` | 圖表載入中… | Loading chart… |
| `daily` | 日線 | Daily |
| `weekly` | 週線 | Weekly |
| `k_open` | 開盤 | Open |
| `k_hl` | 最高 · 最低 | High · Low |
| `k_vol` | 成交量 | Volume |
| `k_cap` | 市值 | Market cap |
| `k_52w` | 52 週區間 | 52w range |
| `wl_price` | 最新價 | Price |
| `wl_change` | 升跌 | Change |
| `add_watch` | 加入自選 | Add to watchlist |
| `on_watch` | 已加入自選 | Watchlisted |

**尚未加入 i18n（新增 UI 文字時須補充）：**

| 中文 | English |
|------|---------|
| 52週範圍 | 52W Range |
| 52週位置 | 52W Pos |
| 年初至今 | YTD |
| 開盤 | Open |
| 資產規模 | AUM |
| 月線 | Monthly |

---

## 本地開發

```bash
# 啟動本地伺服器（必須在 my-new-site 目錄執行）
netlify dev
# → http://localhost:8888

# .env 文件（已設定，已加入 .gitignore）
FINNHUB_API_KEY=your_key_here
```

- `file://` 模式：Finnhub 直連可用，Yahoo Finance proxy 不可用（新字段顯示 `—`）
- **推薦**：一律用 `netlify dev`，確保所有功能正常

---

## 部署流程

```bash
# 1. 本機測試
netlify dev

# 2. 確認所有功能正常後手動 deploy
netlify deploy --prod
```

- GitHub push **不觸發**自動 build（Build 已設為 Stopped）
- 每次 `netlify deploy --prod` 消耗約 15 Netlify credits
- 免費計劃 300 credits / 月 → 最多約 20 次 deploy

### Netlify 環境設定

- **Project configuration → Environment variables**：`FINNHUB_API_KEY`
- `netlify.toml`：publish dir = `.`，functions dir = `netlify/functions`
- Build Hook：已停用（Stopped Builds）

---

## 已完成功能清單

### 基礎功能
- ✅ 股票即時報價（價格、升跌幅、開盤、最高最低、成交量、市值、52 週區間）
- ✅ 熱門股票快捷按鈕（顯示即時升跌幅，背景批量更新）
- ✅ 最新新聞 + 繁體中文翻譯（Google Translate API）
- ✅ 中英文切換（i18n）
- ✅ Skeleton loading 效果
- ✅ Responsive 設計（桌面 tabs + 手機底部導航欄）
- ✅ URL param 支援：`detail.html?symbol=AAPL&type=stock`

### 詳情頁（detail.html）
- ✅ 統一詳情頁，`type` 參數路由至正確 API
- ✅ **Lightweight Charts 圖表**（完全替代 TradingView Widget，無商品限制）
  - K線 / 線圖 切換
  - 1M / 3M / 6M / 1Y / 3Y / 5Y 時間範圍
  - 適用所有 type（stock / etf / index / forex / commodity）
  - 數據來源：Yahoo Finance `yahoo-history.js` proxy

### 指數 / 商品 / 匯率（indices.html）
- ✅ 環球指數（6 個分類，Yahoo Finance 數據）
  - 美國(5)：DJI、GSPC、IXIC、RUT、VIX
  - 亞洲(13)：N225、HSI、HSCE、上證、深證、KOSPI、SENSEX、TWII、JKSE、VNINDEX、SET、KLSE、STI
  - 歐洲(8)：FTSE、DAX、CAC40、STOXX50E、SMI、AEX、IBEX、MIB
  - 其他(6)：ASX200、BOVESPA、TASI、JSE、IPC、MERVAL
  - 商品(10)：黃金、白銀、WTI、布蘭特、天然氣、銅、玉米、大豆、白金、URA
  - 匯率(10)：EUR、GBP、JPY、HKD、CNY、AUD、CAD、CHF、CNY(在岸)、TWD

### ETF（etf.html）
- ✅ ETF 分類瀏覽（11 個資產類別 + 8 個地區，~72 隻 ETF，含描述）

### 自選清單（watchlist.html）
- ✅ 自選清單（localStorage，批量 Yahoo Finance 報價，點擊跳轉）
- ✅ **強化欄位**：52W 範圍、52W 位置進度條、成交量、P/E
- ✅ Responsive 三段斷點（769 / 601 / 600px）

### 基礎設施
- ✅ Netlify Functions proxy（finnhub.js、yahoo.js、yahoo-history.js）
- ✅ 本機 `.env` 環境變數設定完成
- ✅ Netlify 新帳號設定，Build 設為 Stopped
- ✅ `push.bat` 自動 commit + push

---

## 已解決問題

- ✅ indices.html 卡片點擊跳轉問題
- ✅ detail.html 根據 `type` 參數判斷 API
- ✅ ETF 點擊後跳去錯誤頁面
- ✅ 導航欄 active 狀態錯誤
- ✅ 股票查詢 HTTP 500（.env 未設定）
- ✅ 本機 `FINNHUB_API_KEY` 未設定
- ✅ TradingView 圖表「此商品僅在TradingView上可用」→ 已改用 Lightweight Charts

---

## 下一步待完成

優先順序由高至低：

### 【高】ETF 卡片新增數據顯示（etf.html）
- 52W 範圍 + 進度條
- 成交量
- AUM 資產規模（Yahoo Finance `totalAssets`）

### 【高】環球指數卡片新增數據顯示（indices.html）
- 52W 範圍 + 進度條
- YTD 年初至今漲跌幅
- 今日開盤價

### 【中】Portfolio 持倉追蹤功能（portfolio.html）
- 記錄買入價、數量、日期
- 計算盈虧、回報率
- 圖表顯示持倉分佈

### 【低】歷史搜尋記錄（quote.html）
- 儲存最近搜尋的股票（localStorage）
- 顯示在搜尋頁輸入框下方

---

## 技術注意事項

### API 規則
- 所有 API call 必須經過 `netlify/functions` proxy
- **禁止**直接從前端 fetch Finnhub 或 Yahoo Finance
- `file://` 模式：Finnhub 可直連，Yahoo 不可用（watchlist / detail 圖表顯示 `—`）
- 本機開發必須用 `netlify dev`

### 新增功能 Checklist
1. 新 API 字段 → 先更新對應 proxy（`yahoo.js` 或 `finnhub.js`）
2. 新共用函數 → 加到 `utils.js`
3. 新 API method → 加到 `api.js` 的 `API` 物件
4. 新 UI 文字 → 加 i18n 到 `utils.js` 的 `I18N`（zh + en 都要加）
5. 新 CSS class → 加到 `css/style.css`

### Netlify Credits 保護
- GitHub push **不自動** build（Stopped Builds 已設定）
- 每次 `netlify deploy --prod` 消耗約 15 credits
- 免費計劃 300 credits / 月 ≈ 最多 20 次 deploy
- 工作流程：`netlify dev` 本機測試 → 確認無誤 → `netlify deploy --prod`

### 環境變數
- 本機：`.env` 檔（已設定，已加入 `.gitignore`，不能 commit）
- Netlify：Project configuration → Environment variables
- 必須設定：`FINNHUB_API_KEY`
