# StockLens — 開發手冊

## Auto Push

After any file edit, changes are automatically committed and pushed to GitHub via `push.bat`.

To push manually: run `push.bat` from the project root.

---

## 專案架構

```
my-new-site/
├── index.html              # 自動 redirect 去 pages/quote.html
├── netlify.toml            # Netlify build + functions 設定
├── netlify/
│   └── functions/
│       ├── finnhub.js      # Finnhub API proxy（server-side，隱藏 API key）
│       └── yahoo.js        # Yahoo Finance proxy（提供環球指數數據）
├── css/
│   └── style.css           # 所有共用樣式（nav、cards、watchlist、indices 等）
├── js/
│   ├── config.js           # API key 和全域常數（本地開發備用）
│   ├── api.js              # 所有 API call（Finnhub + Yahoo）
│   └── utils.js            # i18n、watchlist state、格式化工具函數
├── pages/
│   ├── quote.html          # 股票查詢（主功能頁）
│   ├── etf.html            # ETF 分類瀏覽
│   ├── indices.html        # 環球指數（Yahoo Finance 數據）
│   ├── watchlist.html      # 自選清單（即時價格、點擊跳轉）
│   └── portfolio.html      # 持倉追蹤（Coming soon）
└── CLAUDE.md
```

## 每個檔案的用途

| 檔案 | 用途 |
|------|------|
| `index.html` | 入口，redirect 到 `pages/quote.html` |
| `netlify.toml` | 設定 publish dir = `.`，functions dir = `netlify/functions` |
| `netlify/functions/finnhub.js` | Server-side proxy，從 env var 讀 API key，轉發請求去 Finnhub |
| `netlify/functions/yahoo.js` | Server-side proxy，call Yahoo Finance v8 API，返回標準化數據 |
| `css/style.css` | 共用樣式：CSS 變數、nav、card、skeleton、watchlist、ETF、indices |
| `js/config.js` | `CONFIG.FH_KEY`（API key）、`CONFIG.FH_BASE`、`CONFIG.HOT_STOCKS` |
| `js/api.js` | `API` 物件，自動判斷路由：`file://` → 直連 Finnhub，HTTP → Netlify proxy |
| `js/utils.js` | `I18N`、`TINTS`、`tr()`、`fmt$()`、`fmtCap()`、`esc()`、`tsToDate()`、`detectSentiment()`、`watchlist` Set、`applyLang()`、`setLang()`、`updateWlBadge()` |
| `pages/quote.html` | 股票即時報價、K 線、新聞、自選按鈕、URL param `?symbol=XXX` |
| `pages/watchlist.html` | 自選清單，自動批量更新即時價格（每隔 300ms） |
| `pages/etf.html` | ETF 分類瀏覽（資產類別 + 地區，~70 隻 ETF） |
| `pages/indices.html` | 環球指數（Yahoo Finance），6 個分類，含匯率、商品 |
| `pages/portfolio.html` | Coming soon |

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

// K 線資料
const candles = await API.getCandles('AAPL', fromTimestamp, toTimestamp, 'D');
// { c: [...], h: [...], l: [...], o: [...], t: [...], v: [...], s: 'ok' }

// 環球指數/商品/匯率（Yahoo Finance，通過 proxy，需 HTTP 環境）
const data = await API.getIndexQuote('^GSPC');
// { price: 5648.40, change: 25.35, changePercent: 0.45, marketState: 'REGULAR', currency: 'USD' }
```

## Netlify Functions 說明

### finnhub.js — `/api/finnhub`（實際路徑：`/.netlify/functions/finnhub`）

- **用途**：轉發 Finnhub API 請求，在 server-side 注入 API key，避免 key 暴露在前端
- **環境變數**：`FINNHUB_API_KEY`（在 Netlify Dashboard → Site Settings → Environment Variables 設定）
- **呼叫方式**：`/.netlify/functions/finnhub?path=quote&symbol=AAPL`
  - `path` = Finnhub endpoint（如 `quote`、`stock/profile2`、`stock/candle`）
  - 其餘 query params 原樣轉發

### yahoo.js — `/api/yahoo`（實際路徑：`/.netlify/functions/yahoo`）

- **用途**：從 Yahoo Finance v8 API 取得指數/商品/匯率數據，返回標準化格式
- **不需要 API key**（Yahoo Finance 公開 API）
- **呼叫方式**：`/.netlify/functions/yahoo?symbol=^GSPC`
- **返回格式**：`{ price, change, changePercent, marketState, currency }`
  - `changePercent` 已是百分比值（如 `1.24` 代表 +1.24%）
  - `marketState`：`REGULAR`（開市）、`PRE`（盤前）、`POST`/`POSTPOST`（盤後）、`CLOSED`（收市）

## 本地開發說明

### 方法 1：直接開啟 HTML 檔案（file://）
- Finnhub API call 正常運作（直連 Finnhub，使用 config.js 的 API key）
- **環球指數頁面無法使用**（Yahoo Finance 需要 server-side proxy，file:// 無法呼叫）
- ETF、股票查詢、自選清單正常

### 方法 2：使用 netlify dev（推薦）
```bash
npm install -g netlify-cli
netlify dev
```
- 所有功能正常，包括環球指數
- Functions 在 `http://localhost:8888/.netlify/functions/` 可用
- 需在 `.env` 檔案設定 `FINNHUB_API_KEY=your_key`（或 netlify dev 會從 Netlify 帳戶同步）

## 腳本載入順序

每個頁面的 `<script>` 必須按此順序：

```html
<script src="../js/config.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/api.js"></script>   <!-- 如果頁面需要 API -->
<script>
  /* 頁面專屬邏輯 */
  applyLang();
  updateWlBadge();
</script>
```

## localStorage 鍵名

| 鍵名 | 內容 |
|------|------|
| `stocklens.watchlist` | `["AAPL","TSLA",...]`，自選清單 |
| `stocklens.lang` | `"zh"` 或 `"en"` |

## quote.html 指數模式

`quote.html` 自動判斷是否為指數/商品/匯率：
- Symbol 開頭為 `^`（指數）→ index mode
- Symbol 包含 `=F`（期貨）或 `=X`（匯率）→ index mode
- URL 帶 `type=index` 且 symbol 匹配 → index mode

Index mode 行為：
- 呼叫 `API.getIndexQuote(sym)`（Yahoo Finance proxy）
- 隱藏自選按鈕、新聞面板
- 圖表使用 `TV_SYMBOL_MAP` 對應到 TradingView symbol；無對應則隱藏圖表
- 數字格式：匯率 4 位小數、商品/指數 2 位小數 + 千位分隔符
- VIX 顯示「高波動 >20」/「低波動 <20」（中性灰色），不顯示升跌顏色

`TV_SYMBOL_MAP` 涵蓋：美股指數(5)、亞洲(9)、歐洲(8)、其他(3)、商品(9)、匯率(9)
無對應的 symbol（越南VNINDEX、沙特TASI、南非JSE、阿根廷MERVAL、URA、CNY=X 等）→ 隱藏圖表區塊

## Netlify 部署設定

1. 在 Netlify Dashboard → Site Settings → Environment Variables 加入：
   - `FINNHUB_API_KEY` = 你的 Finnhub API key
2. `netlify.toml` 已設定 publish dir = `.`，functions dir = `netlify/functions`
3. 每次 push 到 GitHub main branch 自動部署

## 現有功能清單

- 股票即時報價（價格、升跌幅、開盤、最高最低、成交量、市值、52 週區間）
- 熱門股票快捷按鈕（顯示即時升跌幅，背景批量更新）
- K 線走勢圖（1M / 3M / 6M / 1Y / 3Y / 5Y，TradingView Widget）
- 最新新聞 + 繁體中文翻譯（Google Translate API）
- 自選清單（localStorage，支援批量即時價格更新）
- ETF 分類瀏覽（11 個資產類別 + 8 個地區，~70 隻 ETF，含描述）
- 環球指數（6 個分類，Yahoo Finance 數據）：
  - 美國(5)：DJI、GSPC、IXIC、RUT、VIX
  - 亞洲(13)：N225、HSI、HSCE、上證、深證、KOSPI、SENSEX、TWII、JKSE、VNINDEX、SET、KLSE、STI
  - 歐洲(8)：FTSE、DAX、CAC40、STOXX50E、SMI、AEX、IBEX、MIB
  - 其他市場(6)：ASX200、BOVESPA、TASI、JSE、IPC、MERVAL
  - 商品(10)：黃金、白銀、WTI、布蘭特、天然氣、銅、玉米、大豆、白金、鈾礦ETF(URA)
  - 匯率(10)：EUR、GBP、JPY、HKD、CNY、AUD、CAD、CHF、CNY(在岸)、TWD
- 中英文切換（i18n）
- Skeleton loading 效果
- URL param 支援：`pages/quote.html?symbol=AAPL`
- Responsive 設計（桌面 tabs + 手機底部導航欄）
- Netlify Functions API proxy（隱藏 Finnhub key，提供 Yahoo Finance 數據）
