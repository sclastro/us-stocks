# StockLens — 開發手冊

## 專案資料

| 項目 | 值 |
|------|-----|
| 網站 | https://us-stocks.netlify.app |
| GitHub | https://github.com/sclastro/us-stocks |
| 本機路徑 | C:\Claude_Projects\my-new-site |
| 技術 | 純 HTML / CSS / JS，多頁架構，無框架 |
| 本地開發 | `netlify dev`（預設 localhost:8888，若被佔用會自動換 port，以終端輸出為準） |
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
│   └── style.css                # 所有共用樣式（nav、cards、watchlist、pos-bar、portfolio、chart 等）
├── js/
│   ├── config.js                # API key、全域常數、Supabase 憑證
│   ├── auth.js                  # Supabase Auth（initAuth、sbClient、isLoggedIn、getUser、getUserId、authSignIn/Up/Out）
│   ├── db.js                    # Supabase DB CRUD（watchlist、portfolio_lots、portfolio_sells）
│   ├── data.js                  # Auth-aware 資料層（wl、pf、sell 三組操作）
│   ├── api.js                   # 所有 API call（Finnhub + Yahoo + AV）
│   └── utils.js                 # i18n、主題切換、watchlist state、格式化工具函數、localStorage helpers
├── netlify/
│   └── functions/
│       ├── finnhub.js           # Finnhub proxy（server-side 隱藏 API key）
│       ├── yahoo.js             # Yahoo Finance 即時報價 proxy
│       ├── yahoo-history.js     # Yahoo Finance 歷史 OHLCV proxy（Lightweight Charts 用）
│       ├── fmp.js               # Financial Modeling Prep proxy（forwardEps，free tier 403，已廢棄）
│       └── alphavantage.js      # Alpha Vantage OVERVIEW proxy（ForwardPE，25 req/day free）
├── pages/
│   ├── quote.html               # 股票搜尋頁
│   ├── detail.html              # 詳情頁（股票/ETF/指數/匯率/商品，統一入口）
│   ├── etf.html                 # ETF 分類瀏覽（~72隻，52W 範圍 + 進度條 + 成交量 + AUM）
│   ├── indices.html             # 環球指數（6個分類，Yahoo Finance 數據，52W + YTD + 開盤）
│   ├── watchlist.html           # 自選清單（即時價格 + 強化欄位）
│   ├── portfolio.html           # 持倉追蹤（Guest + 登入雙模式，含已實現盈虧 + 歷史圖表）
│   └── login.html               # 登入 / 建立帳號頁面
└── CLAUDE.md
```

## 每個檔案的用途

| 檔案 | 用途 |
|------|------|
| `index.html` | 入口，redirect 到 `pages/quote.html` |
| `netlify.toml` | publish dir = `.`，functions dir = `netlify/functions` |
| `netlify/functions/finnhub.js` | Finnhub proxy，server-side 注入 API key，轉發至 Finnhub |
| `netlify/functions/yahoo.js` | Yahoo Finance v8 即時報價，適用指數/商品/匯率/股票 |
| `netlify/functions/yahoo-history.js` | Yahoo Finance v8 歷史 OHLCV proxy，返回 bars 陣列 |
| `netlify/functions/fmp.js` | FMP proxy（**free tier 403，已廢棄**） |
| `netlify/functions/alphavantage.js` | Alpha Vantage OVERVIEW proxy，返回 `{forwardPE, trailingPE, eps}`（25 req/day） |
| `css/style.css` | 共用樣式：CSS 變數、dark mode、nav、card、skeleton、watchlist、pos-bar、ETF、indices、portfolio、chart、auth |
| `js/config.js` | `CONFIG.FH_KEY`、`CONFIG.FH_BASE`、`CONFIG.HOT_STOCKS`、`CONFIG.SUPA_URL`、`CONFIG.SUPA_KEY` |
| `js/auth.js` | `sbClient`（Supabase 單例）、`initAuth()`、`isLoggedIn()`、`getUser()`、`getUserId()`、`authSignIn/Up/Out()`、nav UI 更新 |
| `js/db.js` | Supabase CRUD：watchlist（`dbWlLoad/Add/Remove/Clear`）、portfolio_lots（`dbPfLoad/Add/Remove`）、portfolio_sells（`dbSellLoad/Add/Remove`） |
| `js/data.js` | Auth-aware 抽象層：watchlist（`wlInit/Add/Remove/Clear`）、portfolio（`pfLoad/Add/Remove`）、sells（`sellLoad/Add/Remove`） |
| `js/api.js` | `API` 物件，自動路由：`file://` → 直連 Finnhub，HTTP → Netlify proxy |
| `js/utils.js` | `I18N`、`TINTS`、`applyTheme/toggleTheme`、`tr()`、`fmt$()`、`fmtCap()`、`esc()`、`tsToDate()`、`detectSentiment()`、`formatVolume()`、`calcWeekPosition()`、`renderPositionBar()`、`getAvFwdPE/setAvFwdPE`、`loadPortfolio/savePortfolio/pfUid`、`loadSells/saveSells/sellUid`、`watchlist` Set、`applyLang/setLang`、`updateWlBadge` |
| `pages/quote.html` | 股票搜尋頁，點擊跳轉到 `detail.html?symbol=XXX&type=TYPE` |
| `pages/detail.html` | 統一詳情頁：報價卡（7欄位含Fwd P/E）、Lightweight Charts 圖表、新聞 |
| `pages/watchlist.html` | 自選清單，Yahoo Finance 批量報價，9 欄位顯示（含 P/E + Fwd P/E），inline confirm 刪除 |
| `pages/etf.html` | ETF 分類瀏覽（資產類別 + 地區，~72 隻 ETF，含 52W / 成交量 / AUM） |
| `pages/indices.html` | 環球指數（Yahoo Finance），6 個分類，含 52W / YTD / 開盤 / 匯率 / 商品 |
| `pages/portfolio.html` | 持倉追蹤（Guest + 登入雙模式）：持倉表、已實現盈虧、歷史走勢圖 |
| `pages/login.html` | 登入 / 建立帳號（email + password），登入後 redirect 回原頁 |

---

## api.js 使用方法

所有頁面通過 `API` 物件呼叫，**禁止**直接寫 `fetch("https://finnhub.io/...")` 或 `fetch("https://query1.finance.yahoo.com/...")`：

```javascript
// 即時報價（Finnhub，通過 proxy）
const quote = await API.getQuote('AAPL');

// 公司資料
const profile = await API.getCompanyProfile('AAPL');

// 財務指標（含 52 週高低、P/E TTM）
const metrics = await API.getMetrics('AAPL');

// 公司新聞（自動 fallback 60 天 → 180 天）
const news = await API.getNews('AAPL');

// 環球指數 / 股票報價（Yahoo Finance，通過 proxy，需 HTTP 環境）
const data = await API.getIndexQuote('^GSPC');
// { price, change, changePercent, marketState, currency,
//   open, dayHigh, dayLow, volume,
//   fiftyTwoWeekHigh, fiftyTwoWeekLow, shortName, trailingPE }
// ⚠️ forwardPE 從 Yahoo server-side 永遠返回 null，改用 Alpha Vantage

// 歷史 OHLCV bars（Yahoo Finance，Lightweight Charts / portfolio chart 用）
// ⚠️ 返回的是 bars 陣列本身，不是 { bars: [...] }！
const bars = await API.getHistory('AAPL', '1y', '1d');
// [{ time: unixSeconds, open, high, low, close, volume }, ...]

// Alpha Vantage OVERVIEW（Forward P/E 專用，25 req/day，配合 localStorage 24h cache）
const ov = await API.getAvOverview('AAPL');
// { forwardPE: 24.3, trailingPE: 32.1, eps: 6.42 }
// ⚠️ ETF / 指數返回 { forwardPE: null, trailingPE: null, eps: null }
```

---

## Netlify Functions 說明

### `yahoo-history.js` — `/.netlify/functions/yahoo-history`

- **呼叫方式**：`/.netlify/functions/yahoo-history?symbol=AAPL&range=1mo&interval=1d`
- **有效 range**：`1d` `5d` `1mo` `3mo` `6mo` `1y` `2y` `5y` `10y` `ytd` `max`
- **有效 interval**：`1m` `5m` `15m` `30m` `60m` `1h` `1d` `1wk` `1mo`
- **返回格式**：`{ bars: [{ time, open, high, low, close, volume }, ...] }`
- **`API.getHistory()`** 已在內部 unwrap，返回 bars 陣列（`return data.bars`），呼叫端**不需要**再解構 `{ bars }`

### `alphavantage.js` — `/.netlify/functions/alphavantage`

- **環境變數**：`AV_KEY`（25 req/day / 500 req/month free）
- **返回格式**：`{ forwardPE: 24.3, trailingPE: 32.1, eps: 6.42 }`
- **必須配合 localStorage 24h cache** 使用（`getAvFwdPE` / `setAvFwdPE`）

### `fmp.js` ⚠️ 已廢棄

- FMP free tier 不包含 analyst-estimates → 403，代碼保留但不再呼叫

---

## Dark Mode（主題切換）

### 架構

- CSS 變數：`[data-theme="dark"]` 掛在 `document.documentElement` 上
- 持久化：`localStorage.getItem('stocklens.dark') === '1'`
- **預設**：淺色模式（`stocklens.dark` 不存在或為 `'0'`）
- 防閃爍：utils.js 頂部 IIFE 在腳本載入時立即套用

```javascript
// utils.js 頂部（腳本載入即執行，防止白閃）
(function(){ if(localStorage.getItem('stocklens.dark')==='1') document.documentElement.dataset.theme='dark'; })();

// 套用主題（更新 dataset.theme 及 toggle 按鈕圖示）
applyTheme();

// 切換並儲存
toggleTheme();
```

### 切換按鈕（所有頁面 nav-right）

```html
<button class="theme-toggle" id="themeToggle" type="button">🌙</button>
```

```javascript
document.getElementById('themeToggle').addEventListener('click', toggleTheme);
```

### portfolio.html 特殊處理

portfolio.html 的 Lightweight Charts 圖表需在 theme toggle 時重新渲染：

```javascript
document.getElementById('themeToggle').addEventListener('click', () => {
  toggleTheme();
  if (_currentLots && _currentLots.length > 0) renderPfChart(_pfChartRange, _currentLots);
});
```

---

## detail.html — URL 跳轉架構

| URL | 數據來源 |
|-----|---------|
| `detail.html?symbol=AAPL&type=stock` | Finnhub |
| `detail.html?symbol=QQQ&type=etf` | Finnhub（fallback Yahoo） |
| `detail.html?symbol=^GSPC&type=index` | Yahoo Finance |
| `detail.html?symbol=EURUSD=X&type=forex` | Yahoo Finance |
| `detail.html?symbol=GC=F&type=commodity` | Yahoo Finance |

### detail.html 圖表（Lightweight Charts）

- **Library**：`lightweight-charts@4.2.2`（CDN standalone UMD）
- **tsToDateStr(ts)**：Unix seconds → `'YYYY-MM-DD'`（UTC）

| 按鈕 | range | interval |
|------|-------|----------|
| 1M | `1mo` | `1d` |
| 3M | `3mo` | `1d` |
| 6M | `6mo` | `1d` |
| 1Y | `1y` | `1wk` |
| 3Y | `5y` | `1wk` |
| 5Y | `5y` | `1mo` |

---

## 自選清單（watchlist.html）

### 欄位（9 欄）

名稱 | 現價 | 漲跌幅 | 52W 範圍 | 52W 位置 | 成交量 | P/E | Fwd P/E | 移除

```
grid-template-columns: 1fr 120px 120px 110px 100px 80px 60px 72px 44px
```

### Responsive 斷點

| 寬度 | 可見欄位 |
|------|---------|
| ≥ 769px | 全部 9 欄 |
| 601–768px | 隱藏 52W 範圍、成交量 |
| ≤ 600px | 再隱藏漲跌幅、52W 位置、P/E、Fwd P/E |

---

## 持倉追蹤（portfolio.html）

### 資料模型

```javascript
// Lot（買入紀錄）— localStorage: 'stocklens.portfolio' / Supabase: portfolio_lots
{ id, sym, shares, buyPrice, buyDate }

// Sell（已實現盈虧）— localStorage: 'stocklens.sells' / Supabase: portfolio_sells
{ id, sym, shares, sellPrice, avgCost, sellDate }
// avgCost = 賣出時對應 lot 的 buyPrice（記錄當下快照，賣出不修改持倉）
```

### 持倉表欄位（9 欄）

股票 · 股數 · 買入價 · 現價 · 市值 · 盈虧 · 盈虧% · 佔比 · **[賣出] [×]**

```
grid-template-columns: 1fr 72px 96px 96px 108px 104px 76px 64px 80px
```

每行 actions 欄（`.pf-remove-col`）：
- **賣出按鈕**（`.pf-sell-btn`）→ 打開 Sell Modal，預填 sym + shares
- **× 刪除**（`.pf-remove`）→ inline confirm（✓ ✗），行背景變紅

### 賣出 Modal（Record Sale）

- 股票代碼（readonly）、股數、賣出價、賣出日期
- 儲存 `sellAdd({ sym, shares, sellPrice, avgCost: lot.buyPrice, sellDate })`
- **不修改持倉**，僅記錄已實現盈虧

### 已實現盈虧區塊

```
grid-template-columns: 1fr 72px 96px 96px 104px 76px 44px
欄位：股票 | 股數 | 成本價 | 賣出價 | 盈虧$ | 盈虧% | 刪除
```

- 顯示所有賣出紀錄，匯總已實現總盈虧
- 右上角：已實現總盈虧（色彩隨正負）
- 每行可刪除記錄（`sellRemove(id)`）

### 歷史走勢圖（投資組合走勢）

- **Library**：`lightweight-charts@4.2.2`（同 detail.html，portfolio.html `<head>` 已載入）
- 放置位置：summary cards 下方 → 持倉表上方
- 範圍按鈕：**3M | 6M | 1Y**（預設）| 2Y
- 2Y 用 `1wk` interval，其餘用 `1d`

**資料計算邏輯：**
```javascript
// 1. 並行 fetch 所有持倉 symbol 的歷史數據
const bars = await API.getHistory(sym, range, interval);  // 直接是 bars 陣列
histMap[sym] = new Map(bars.map(b => [tsToDateStr(b.time), b.close]));

// 2. 收集所有交易日，排序
const allDates = [...new Set(Object.values(histMap).flatMap(m=>[...m.keys()]))].sort();

// 3. Forward-fill + 計算每日組合總市值
for (const date of allDates) {
  // 更新 lastPx（當日有數據才更新）
  for (const [sym, map] of Object.entries(histMap)) {
    if (map.has(date)) lastPx[sym] = map.get(date);
  }
  // 只計算 buyDate <= date 的 lot
  let value = 0;
  for (const lot of lots) {
    if (lot.buyDate > date) continue;
    const px = lastPx[lot.sym];
    if (px != null) value += lot.shares * px;
  }
  chartData.push({ time: date, value });
}
```

**Dark mode 顏色：**
- 淺色：line `#2f7a52`、top fill `rgba(47,122,82,0.15)`
- 深色：line `#4caf73`、top fill `rgba(76,175,115,0.20)`

**圖表 JS 函數（portfolio.html 內部）：**
- `tsToDateStr(ts)` — Unix ts → `'YYYY-MM-DD'`（UTC）
- `pfChartColors()` — 根據當前 theme 返回顏色物件
- `_pfChartInit(wrap)` — 銷毀舊 chart + ResizeObserver，建立新 chart + AreaSeries
- `renderPfChart(range, lots)` — fetch + 計算 + 渲染，更新 active 按鈕

**圖表狀態變數（portfolio.html 內部）：**
```javascript
let _pfChart = null;       // LW Charts instance
let _pfSeries = null;      // AreaSeries instance
let _pfChartRange = '1y';  // 當前 range
let _pfChartRO = null;     // ResizeObserver
let _currentLots = [];     // 最新 lots（供 theme toggle 重渲）
```

### Responsive 斷點（持倉表）

| 寬度 | 隱藏欄位 |
|------|---------|
| ≥ 901px | 全部 9 欄 |
| 601–900px | 隱藏市值、佔比 |
| ≤ 600px | 再隱藏買入價、現價、盈虧$；隱藏賣出按鈕 |

---

## Phase 2 — 用戶登入架構（Supabase）

### 設計原則

| 項目 | 說明 |
|------|------|
| 認證方式 | Email + Password |
| 自助註冊 | ✅ 允許（`authSignUp`） |
| 資料層抽象 | `data.js`：訪客 → localStorage；登入 → Supabase DB |
| `sbClient` 全域 | `auth.js` 建立，`db.js` / `data.js` 直接使用 |

### Supabase 資料庫 SQL Schema（已建立）

```sql
-- ── Watchlist 表 ──────────────────────────────────────
CREATE TABLE watchlist (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users NOT NULL,
  symbol     text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, symbol)
);
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own watchlist"
  ON watchlist FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Portfolio Lots 表 ──────────────────────────────────
CREATE TABLE portfolio_lots (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users NOT NULL,
  sym        text NOT NULL,
  shares     numeric NOT NULL,
  buy_price  numeric NOT NULL,
  buy_date   date NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE portfolio_lots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own portfolio"
  ON portfolio_lots FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Portfolio Sells 表 ────────────────────────────────
CREATE TABLE portfolio_sells (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users NOT NULL,
  sym        text NOT NULL,
  shares     numeric NOT NULL,
  sell_price numeric NOT NULL,
  avg_cost   numeric NOT NULL,
  sell_date  date NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE portfolio_sells ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sells"
  ON portfolio_sells FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### data.js API 摘要

```javascript
// 初始化（頁面 boot 必須先 await）
await wlInit()           // 載入自選清單 + 更新 badge

// 自選清單
await wlAdd(sym)
await wlRemove(sym)
await wlClear()

// 持倉
const lots = await pfLoad()
await pfAdd({ sym, shares, buyPrice, buyDate })
await pfRemove(id)

// 已實現盈虧
const sells = await sellLoad()
await sellAdd({ sym, shares, sellPrice, avgCost, sellDate })
await sellRemove(id)
```

---

## utils.js 工具函數

```javascript
// 主題切換
applyTheme()                        // 套用 data-theme，更新 toggle 按鈕圖示
toggleTheme()                       // 切換 dark/light，存 localStorage

// 大數字縮寫
formatVolume(num)                   // >= 1B → '1.23B'

// 52 週位置（0–100 整數）
calcWeekPosition(price, low52, high52)

// 進度條 HTML
renderPositionBar(percent)

// Alpha Vantage Forward P/E cache（24h TTL）
getAvFwdPE(sym)     // number | null（命中）| undefined（無快取）
setAvFwdPE(sym, v)  // 儲存至 'stocklens.av.fpe'

// Portfolio Guest 模式
loadPortfolio()     // 'stocklens.portfolio' → lot[]
savePortfolio(lots)
pfUid()             // 生成 lot ID

// Sells Guest 模式
loadSells()         // 'stocklens.sells' → sell[]，失敗返回 []
saveSells(sells)    // 儲存至 'stocklens.sells'
sellUid()           // 生成 sell ID（timestamp36 + random）

// 格式化
fmt$(n)                             // 美元價格（兩位小數）
fmtCap(m)                           // 市值縮寫（$T / $B / $M）
fmtAssets(n)                        // AUM 縮寫
esc(s)                              // HTML escape（防 XSS）
tsToDate(ts)                        // Unix seconds → 'YYYY-MM-DD'（本地時區）
tr(key)                             // i18n 翻譯
detectSentiment(title, summary)     // 新聞情緒（'pos' / 'neg' / 'neu'）
applyLang()                         // 套用 data-i18n 屬性
setLang(lang)                       // 切換語言並儲存
updateWlBadge()                     // 更新自選清單計數徽章
```

---

## 腳本載入順序

```html
<!-- Supabase CDN 必須最前 -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="../js/config.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/auth.js"></script>
<script src="../js/db.js"></script>
<script src="../js/data.js"></script>
<script src="../js/api.js"></script>
```

**portfolio.html** 額外在 `</head>` 前加入：

```html
<script src="https://unpkg.com/lightweight-charts@4.2.2/dist/lightweight-charts.standalone.production.js"></script>
```

**detail.html** 同樣需要 Lightweight Charts CDN。

`login.html` 只需要 Supabase CDN + config.js + utils.js + auth.js。

---

## localStorage 鍵名

| 鍵名 | 內容 |
|------|------|
| `stocklens.watchlist` | `["AAPL","TSLA",...]` 自選清單 |
| `stocklens.lang` | `"zh"` 或 `"en"` |
| `stocklens.dark` | `"1"` = 深色；`"0"` 或不存在 = 淺色（預設） |
| `stocklens.portfolio` | `[{ id, sym, shares, buyPrice, buyDate }, ...]` lots（Guest） |
| `stocklens.sells` | `[{ id, sym, shares, sellPrice, avgCost, sellDate }, ...]` sells（Guest） |
| `stocklens.av.fpe` | `{ "AAPL": { ts, v }, ... }` Alpha Vantage Forward P/E cache（24h） |

---

## i18n 鍵名對照（portfolio 相關）

| key | 中文 | English |
|-----|------|---------|
| `pf_page_title` | 持倉追蹤 | Portfolio |
| `pf_add` | + 新增持倉 | + Add Position |
| `pf_total_cost` | 總投入 | Total Cost |
| `pf_total_value` | 總市值 | Market Value |
| `pf_total_pnl` | 總盈虧 | Total P&L |
| `pf_total_return` | 總回報 | Return |
| `pf_sell_btn` | 賣出 | Sell |
| `pf_sell_title` | 記錄賣出 | Record Sale |
| `pf_sell_price` | 賣出價 | Sell Price |
| `pf_sell_note` | 僅記錄已實現盈虧，不會自動修改持倉。 | Only records realized P&L. Holdings are not modified. |
| `pf_realized_title` | 已實現盈虧 | Realized P&L |
| `pf_realized_total` | 已實現總盈虧 | Total Realized P&L |
| `pf_col_sell_price` | 賣出價 | Sell Price |
| `pf_col_avg_cost` | 成本價 | Avg Cost |
| `pf_chart_title` | 投資組合走勢 | Portfolio Chart |
| `pf_chart_loading` | 載入歷史數據… | Loading history… |

---

## 本地開發

```bash
# 啟動本地伺服器（必須在 my-new-site 目錄執行）
netlify dev
# → 預設 http://localhost:8888（若被佔用會自動換 port）

# .env 文件（已設定，已加入 .gitignore）
FINNHUB_API_KEY=...
FMP_KEY=...          # 已廢棄（free tier 403）
AV_KEY=...           # Alpha Vantage，25 req/day
```

- `file://` 模式：Finnhub 直連可用，Yahoo / AV proxy 不可用
- **推薦**：一律用 `netlify dev`，確保所有功能正常
- ⚠️ `.env` 變更後必須**重啟** `netlify dev` 才會生效

---

## 部署流程

```bash
netlify dev          # 本機測試
netlify deploy --prod  # 確認無誤後手動 deploy
```

- GitHub push **不觸發**自動 build（Stopped Builds）
- 每次 `netlify deploy --prod` 消耗約 15 Netlify credits
- 免費計劃 300 credits / 月 ≈ 最多 20 次 deploy

---

## 已完成功能清單

### 基礎功能
- ✅ 股票即時報價（價格、升跌幅、開盤、最高最低、成交量、市值、52 週區間）
- ✅ 熱門股票快捷按鈕（顯示即時升跌幅，背景批量更新）
- ✅ 最新新聞 + 繁體中文翻譯（Google Translate API）
- ✅ 中英文切換（i18n，zh / en）
- ✅ **深色/淺色主題切換**（nav 按鈕 🌙/☀️，預設淺色，localStorage 持久化）
- ✅ Skeleton loading 效果
- ✅ Responsive 設計（桌面 tabs + 手機底部導航欄）

### 詳情頁（detail.html）
- ✅ 統一詳情頁，`type` 參數路由至正確 API
- ✅ Lightweight Charts 圖表（K線/線圖，1M/3M/6M/1Y/3Y/5Y）
- ✅ P/E（Finnhub）、Fwd P/E（Alpha Vantage，24h cache）

### ETF（etf.html）
- ✅ 分類瀏覽（11 資產類別 + 8 地區，~72 隻 ETF）
- ✅ 52W 範圍 + 進度條、成交量、AUM

### 環球指數（indices.html）
- ✅ 6 個分類，Yahoo Finance 數據
- ✅ 52W 範圍 + 進度條、YTD 年初至今、開盤價

### 自選清單（watchlist.html）
- ✅ Guest + 登入雙模式（localStorage / Supabase）
- ✅ 9 欄顯示（含 52W / 成交量 / P/E / Fwd P/E）
- ✅ Inline confirm 刪除（× → ✓ ✗）+ 清除全部 inline confirm
- ✅ Responsive 三段斷點

### 持倉追蹤（portfolio.html）
- ✅ Guest + 登入雙模式（localStorage / Supabase）
- ✅ 多 lot 支援（同 symbol 多筆買入，各自獨立）
- ✅ 即時報價（Yahoo Finance，批量 300ms apart）
- ✅ P&L、P&L%、佔比即時計算 + 匯總欄
- ✅ 新增持倉 Modal（表單驗證、今日日期預填）
- ✅ Inline confirm 刪除
- ✅ **賣出 Modal（記錄已實現盈虧）**
- ✅ **已實現盈虧區塊**（賣出記錄表 + 總盈虧，雲端同步）
- ✅ **歷史走勢圖**（Lightweight Charts area chart，3M/6M/1Y/2Y，dark mode 自適應）
- ✅ Responsive 三段斷點

### Phase 2 — 用戶登入
- ✅ Supabase Auth（Email + Password，自助註冊）
- ✅ `auth.js`、`db.js`、`data.js` 完整架構
- ✅ `login.html`（登入 / 建立帳號，redirect 回原頁）
- ✅ 所有頁面 nav 更新（登入/用戶名稱/登出）
- ✅ Supabase DB 三張表已建立（watchlist、portfolio_lots、portfolio_sells）
- ✅ RLS 設定完成（每個表只能讀寫自己的資料）

### 基礎設施
- ✅ Netlify Functions proxy（finnhub、yahoo、yahoo-history、alphavantage）
- ✅ Alpha Vantage Forward P/E（24h cache）
- ✅ `push.bat` 自動 commit + push

---

## 下一步待完成

| 優先 | 功能 |
|------|------|
| 【高】 | **Feature 6：股票對比**（同一圖表比較多隻股票表現） |
| 【中】 | 歷史搜尋記錄（quote.html，localStorage，顯示最近搜尋） |

---

## 技術注意事項

### API 規則
- 所有 API call 必須經過 `netlify/functions` proxy
- `file://` 模式：Finnhub 可直連，Yahoo / AV 不可用
- 本機開發必須用 `netlify dev`

### `API.getHistory()` 注意事項
- 函數內部已 `return data.bars`，返回的**是陣列本身**
- 呼叫端：`const bars = await API.getHistory(sym, range, interval);`
- ❌ 錯誤：`const { bars } = await API.getHistory(...)` → bars 會是 undefined

### Forward P/E 限制
- Alpha Vantage 免費：25 req/day，500 req/month
- ETF 和指數不返回 ForwardPE（顯示 `—` 正常）
- **必須搭配 24h localStorage cache**（`getAvFwdPE` / `setAvFwdPE`）

### 新增功能 Checklist
1. 新 API 字段 → 先更新對應 proxy（`yahoo.js` 或 `finnhub.js`）
2. 新共用函數 → 加到 `utils.js`
3. 新 API method → 加到 `api.js` 的 `API` 物件
4. 新 UI 文字 → 加 i18n 到 `utils.js` 的 `I18N`（**zh + en 都要加**）
5. 新 CSS class → 加到 `css/style.css`
6. Supabase 新表 → 在 `db.js` 加 CRUD，在 `data.js` 加 auth-aware 包裝

### Netlify Credits 保護
- GitHub push **不自動** build（Stopped Builds 已設定）
- 每次 `netlify deploy --prod` 消耗約 15 credits
- 工作流程：`netlify dev` 本機測試 → 確認無誤 → `netlify deploy --prod`
