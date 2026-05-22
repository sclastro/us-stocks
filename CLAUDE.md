# StockLens — 開發手冊

## Auto Push

After any file edit, changes are automatically committed and pushed to GitHub via `push.bat`.

To push manually: run `push.bat` from the project root.

---

## 專案架構

```
my-new-site/
├── index.html              # 自動 redirect 去 pages/quote.html
├── css/
│   └── style.css           # 所有共用樣式（nav、cards、watchlist、coming-soon 等）
├── js/
│   ├── config.js           # API key 和全域常數（只有這檔案有 API key）
│   ├── api.js              # 所有 Finnhub API call（依賴 config.js + utils.js）
│   └── utils.js            # i18n、watchlist state、格式化工具函數
├── pages/
│   ├── quote.html          # 股票查詢（主功能頁）
│   ├── etf.html            # ETF 分類瀏覽（Coming soon）
│   ├── indices.html        # 環球指數（Coming soon）
│   ├── watchlist.html      # 自選清單（即時價格、點擊跳轉）
│   └── portfolio.html      # 持倉追蹤（Coming soon）
└── CLAUDE.md
```

## 每個檔案的用途

| 檔案 | 用途 |
|------|------|
| `index.html` | 入口，redirect 到 `pages/quote.html` |
| `css/style.css` | 共用樣式：CSS 變數、nav、card、skeleton、watchlist 表格、coming-soon |
| `js/config.js` | `CONFIG.FH_KEY`（API key）、`CONFIG.FH_BASE`、`CONFIG.HOT_STOCKS` |
| `js/api.js` | `API` 物件，所有 Finnhub fetch 在這裡，其他頁面只可呼叫 `API.*` |
| `js/utils.js` | `I18N`、`TINTS`、`tr()`、`fmt$()`、`fmtCap()`、`esc()`、`tsToDate()`、`detectSentiment()`、`watchlist` Set、`applyLang()`、`setLang()`、`updateWlBadge()` |
| `pages/quote.html` | 股票即時報價、K 線、新聞、自選按鈕、URL param `?symbol=XXX` |
| `pages/watchlist.html` | 自選清單，自動批量更新即時價格（每隔 300ms） |
| `pages/etf.html` | Coming soon |
| `pages/indices.html` | Coming soon |
| `pages/portfolio.html` | Coming soon |

## api.js 使用方法

所有頁面通過 `API` 物件呼叫，**禁止**直接寫 `fetch("https://finnhub.io/...")`：

```javascript
// 即時報價
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
```

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

## 搬去 Netlify 的步驟

1. 在 Netlify 建立新 site，連接 GitHub repo
2. Build command: 留空（純靜態）
3. Publish directory: `.`（或 `/`）
4. 如需隱藏 API key，改用 Netlify Functions：
   - 建立 `netlify/functions/finnhub.js`，在 server-side 呼叫 Finnhub
   - 修改 `js/api.js` 的 `_fhFetch` 指向 `/.netlify/functions/finnhub?path=...`
   - 在 Netlify 環境變數設定 `FINNHUB_API_KEY`
   - 從 `js/config.js` 移除 `FH_KEY`

## 現有功能清單

- 股票即時報價（價格、升跌幅、開盤、最高最低、成交量、市值、52 週區間）
- 熱門股票快捷按鈕（顯示即時升跌幅，背景批量更新）
- K 線走勢圖（1M / 3M / 6M / 1Y / 3Y / 5Y，TradingView Widget）
- 最新新聞 + 繁體中文翻譯（Google Translate API）
- 自選清單（localStorage，支援批量即時價格更新）
- 中英文切換（i18n）
- Skeleton loading 效果
- URL param 支援：`pages/quote.html?symbol=AAPL`
- Responsive 設計（桌面 tabs + 手機底部導航欄）
