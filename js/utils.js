'use strict';

/* ── i18n ─────────────────────────────────────────── */
const I18N = {
  zh:{
    logo_name:'<b>聰聰</b><span class="dim">的投資世界</span>',
    market_open:'市場開市', powered_by:'技術提供',
    nav_quote:'股票查詢', nav_etf:'ETF', nav_indices:'環球指數',
    nav_watchlist:'自選清單', nav_portfolio:'持倉',
    hero_title:'股票<em>即時</em>查詢', hero_sub:'輸入股票代碼，獲取即時行情、K 線圖及最新新聞',
    search_ph:'輸入代碼，例如 AAPL', search:'查詢', searching:'查詢中…', trending:'熱門',
    live:'即時', err_title:'查詢失敗',
    k_open:'開盤', k_hl:'最高 · 最低', k_vol:'成交量', k_cap:'市值', k_52w:'52 週區間', k_pe:'市盈率', k_fwd_pe:'預期P/E',
    of_range:'% 位置',
    chart_title:'價格走勢', chart_loading:'圖表載入中…', daily:'日線', weekly:'週線',
    latest_news:'最新新聞',
    sent_pos:'利多', sent_neg:'利空', sent_neu:'中性',
    tr_btn:'🌐 翻譯', tr_ing:'翻譯中…', tr_orig:'原文',
    add_watch:'加入自選', on_watch:'已加入自選',
    wl_page_title:'自選清單', wl_subtitle:'點擊股票查看詳情',
    wl_empty:'自選清單為空', wl_empty_sub:'在股票查詢頁搜尋，然後點擊「加入自選」',
    wl_price:'最新價', wl_change:'升跌', wl_updating:'更新中…',
    wl_updated:'已更新', wl_clear:'清除全部',
    card_52w_label:'52週', card_ytd:'年初至今', card_vol:'成交量', card_aum:'規模',
    wl_52w_range:'52W 範圍', wl_52w_pos:'52W 位置',
    bn_quote:'查詢', bn_indices:'指數', bn_watchlist:'自選', bn_portfolio:'持倉',
    vix_hi:'高波動', vix_lo:'低波動',
    vix_hi_vol:'高波動 >20', vix_lo_vol:'低波動 <20',
    ct_candle:'K線', ct_line:'線圖',
    mkt_open:'開市', mkt_pre:'盤前', mkt_post:'盤後', mkt_closed:'收市',
    back:'返回',
    coming_soon:'敬請期待', coming_soon_desc:'此功能正在開發中，即將推出。',
    footer_left:'StockLens · 僅供研究及教育用途，不構成投資建議。',
    footer_delay:'報價延遲約 15 分鐘', footer_terms:'服務條款',
    pf_page_title:'持倉追蹤', pf_subtitle:'追蹤你的投資回報',
    pf_add:'+ 新增持倉', pf_add_title:'新增持倉',
    pf_sym:'股票代碼', pf_sym_ph:'例如 AAPL',
    pf_shares:'股數', pf_buy_price:'買入價', pf_buy_date:'買入日期',
    pf_cancel:'取消', pf_confirm:'確認',
    pf_empty:'持倉為空', pf_empty_sub:'點擊「新增持倉」開始記錄你的投資',
    pf_total_cost:'總投入', pf_total_value:'總市值',
    pf_total_pnl:'總盈虧', pf_total_return:'總回報',
    pf_col_sym:'股票', pf_col_shares:'股數',
    pf_col_buy:'買入價', pf_col_price:'現價', pf_col_value:'市值',
    pf_col_pnl:'盈虧', pf_col_pnl_pct:'盈虧%', pf_col_alloc:'佔比',
    pf_updating:'更新中…', pf_updated:'已更新',
    pf_guest_note:'Guest 模式 · 資料儲存於本機',
    pf_delete_confirm:'確定移除此持倉？',
    pf_sell_btn:'賣出', pf_sell_title:'記錄賣出',
    pf_sell_price:'賣出價', pf_sell_date:'賣出日期',
    pf_sell_note:'僅記錄已實現盈虧，不會自動修改持倉。',
    pf_realized_title:'已實現盈虧', pf_realized_empty:'尚無賣出記錄',
    pf_realized_total:'已實現總盈虧',
    pf_col_sell_price:'賣出價', pf_col_avg_cost:'成本價',
    pf_chart_title:'投資組合走勢', pf_chart_loading:'載入歷史數據…',
    nav_login:'登入', nav_logout:'登出',
    recent:'最近', recent_clear:'清除記錄',
  },
  en:{
    logo_name:'<b>Stock</b><span class="dim">Lens</span>',
    market_open:'Markets open', powered_by:'Powered by',
    nav_quote:'Quote', nav_etf:'ETF', nav_indices:'Indices',
    nav_watchlist:'Watchlist', nav_portfolio:'Portfolio',
    hero_title:'Stock <em>real-time</em> lookup', hero_sub:'Enter a ticker for live quotes, charts and the latest news.',
    search_ph:'Enter ticker — e.g. AAPL, TSLA', search:'Search', searching:'Searching…', trending:'Trending',
    live:'Live', err_title:'Query failed',
    k_open:'Open', k_hl:'High · Low', k_vol:'Volume', k_cap:'Market cap', k_52w:'52w range', k_pe:'P/E', k_fwd_pe:'Fwd P/E',
    of_range:'% of range',
    chart_title:'Price chart', chart_loading:'Loading chart…', daily:'Daily', weekly:'Weekly',
    latest_news:'Latest news',
    sent_pos:'BULLISH', sent_neg:'BEARISH', sent_neu:'NEUTRAL',
    tr_btn:'🌐 Translate', tr_ing:'Translating…', tr_orig:'Original',
    add_watch:'Add to watchlist', on_watch:'Watchlisted',
    wl_page_title:'Watchlist', wl_subtitle:'Click a stock to view details',
    wl_empty:'Your watchlist is empty', wl_empty_sub:'Search for a stock and click "Add to Watchlist"',
    wl_price:'Price', wl_change:'Change', wl_updating:'Updating…',
    wl_updated:'Updated', wl_clear:'Clear all',
    card_52w_label:'52W', card_ytd:'YTD', card_vol:'Vol', card_aum:'AUM',
    wl_52w_range:'52W Range', wl_52w_pos:'52W Position',
    bn_quote:'Quote', bn_indices:'Indices', bn_watchlist:'Watchlist', bn_portfolio:'Portfolio',
    vix_hi:'High Vol', vix_lo:'Low Vol',
    vix_hi_vol:'High Vol >20', vix_lo_vol:'Low Vol <20',
    ct_candle:'Candles', ct_line:'Line',
    mkt_open:'Open', mkt_pre:'Pre', mkt_post:'After', mkt_closed:'Closed',
    back:'Back',
    coming_soon:'Coming Soon', coming_soon_desc:'This feature is under development and will be available soon.',
    footer_left:'StockLens · For research and educational use. Not financial advice.',
    footer_delay:'Quotes delayed ~15 min', footer_terms:'Terms',
    pf_page_title:'Portfolio', pf_subtitle:'Track your investment returns',
    pf_add:'+ Add Position', pf_add_title:'Add Position',
    pf_sym:'Ticker', pf_sym_ph:'e.g. AAPL',
    pf_shares:'Shares', pf_buy_price:'Buy Price', pf_buy_date:'Date',
    pf_cancel:'Cancel', pf_confirm:'Confirm',
    pf_empty:'Portfolio is empty', pf_empty_sub:'Click "Add Position" to start tracking your investments',
    pf_total_cost:'Total Cost', pf_total_value:'Market Value',
    pf_total_pnl:'Total P&L', pf_total_return:'Return',
    pf_col_sym:'Symbol', pf_col_shares:'Shares',
    pf_col_buy:'Buy Price', pf_col_price:'Price', pf_col_value:'Value',
    pf_col_pnl:'P&L', pf_col_pnl_pct:'P&L%', pf_col_alloc:'Alloc',
    pf_updating:'Updating…', pf_updated:'Updated',
    pf_guest_note:'Guest mode · Data stored locally',
    pf_delete_confirm:'Remove this position?',
    pf_sell_btn:'Sell', pf_sell_title:'Record Sale',
    pf_sell_price:'Sell Price', pf_sell_date:'Sell Date',
    pf_sell_note:'Only records realized P&L. Holdings are not modified.',
    pf_realized_title:'Realized P&L', pf_realized_empty:'No realized P&L records yet',
    pf_realized_total:'Total Realized P&L',
    pf_col_sell_price:'Sell Price', pf_col_avg_cost:'Avg Cost',
    pf_chart_title:'Portfolio Chart', pf_chart_loading:'Loading history…',
    nav_login:'Sign in', nav_logout:'Sign out',
    recent:'Recent', recent_clear:'Clear history',
  }
};

/* ── Per-stock tint colors ───────────────────────── */
const TINTS = {
  AAPL: {fg:'oklch(.42 .04 60)',   bg:'oklch(.94 .02 60)',   bd:'oklch(.88 .03 60)'},
  TSLA: {fg:'oklch(.48 .13 28)',   bg:'oklch(.94 .03 28)',   bd:'oklch(.88 .05 28)'},
  GOOGL:{fg:'oklch(.48 .11 250)',  bg:'oklch(.94 .025 250)', bd:'oklch(.88 .05 250)'},
  MSFT: {fg:'oklch(.48 .09 195)',  bg:'oklch(.94 .025 195)', bd:'oklch(.88 .05 195)'},
  NVDA: {fg:'oklch(.46 .13 145)',  bg:'oklch(.94 .03 145)',  bd:'oklch(.86 .06 145)'},
  AMZN: {fg:'oklch(.48 .10 55)',   bg:'oklch(.94 .03 55)',   bd:'oklch(.88 .05 55)'},
  META: {fg:'oklch(.48 .10 230)',  bg:'oklch(.94 .025 230)', bd:'oklch(.88 .05 230)'},
};
const DEFAULT_TINT = {fg:'oklch(.42 .06 240)', bg:'oklch(.94 .02 240)', bd:'oklch(.88 .04 240)'};

/* ── Theme (dark mode) ───────────────────────────── */
/* Apply immediately on script load — prevents flash of light mode */
(function(){ if(localStorage.getItem('stocklens.dark')==='1') document.documentElement.dataset.theme='dark'; })();

function applyTheme(){
  const dark = localStorage.getItem('stocklens.dark')==='1';
  document.documentElement.dataset.theme = dark ? 'dark' : '';
  document.querySelectorAll('.theme-toggle').forEach(btn=>{
    btn.textContent = dark ? '☀️' : '🌙';
    btn.title = dark
      ? (currentLang==='zh' ? '切換至淺色' : 'Light mode')
      : (currentLang==='zh' ? '切換至深色' : 'Dark mode');
  });
}
function toggleTheme(){
  const dark = localStorage.getItem('stocklens.dark')==='1';
  localStorage.setItem('stocklens.dark', dark?'0':'1');
  applyTheme();
}

/* ── Language state ──────────────────────────────── */
let currentLang = localStorage.getItem('stocklens.lang') || 'zh';

function tr(k){ return I18N[currentLang][k] ?? I18N.zh[k] ?? k; }

function applyLang(){
  document.documentElement.lang = currentLang === 'zh' ? 'zh-Hant' : 'en';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = I18N[currentLang][el.dataset.i18n];
    if (v !== undefined) el.innerHTML = v;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const v = I18N[currentLang][el.dataset.i18nPh];
    if (v !== undefined) el.placeholder = v;
  });
  document.querySelectorAll('.lang-toggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === currentLang);
  });
}

function setLang(lang){
  currentLang = lang;
  localStorage.setItem('stocklens.lang', lang);
  applyLang();
}

/* ── Watchlist state ─────────────────────────────── */
const watchlist = new Set(JSON.parse(
  localStorage.getItem('stocklens.watchlist') || localStorage.getItem('stocklens_wl') || '[]'
));
function saveWatchlist(){ localStorage.setItem('stocklens.watchlist', JSON.stringify([...watchlist])); }

function updateWlBadge(){
  const el = document.getElementById('wlBadge');
  if (!el) return;
  const n = watchlist.size;
  el.textContent = n;
  el.hidden = n === 0;
}

/* ── Formatting helpers ──────────────────────────── */
const fmt$ = n => '$' + Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});

function fmtCap(m){
  const n = parseFloat(m) * 1e6;
  if (!n || isNaN(n)) return '—';
  return n>=1e12?'$'+(n/1e12).toFixed(2)+'T':n>=1e9?'$'+(n/1e9).toFixed(2)+'B':'$'+(n/1e6).toFixed(2)+'M';
}

function esc(s){
  if (!s) return '';
  const d = document.createElement('div'); d.textContent = s; return d.innerHTML;
}

function tsToDate(ts){ return new Date(ts*1000).toISOString().slice(0,10); }

function detectSentiment(title, summary){
  const text = (title+' '+(summary||'')).toLowerCase();
  const pos = ['beat','beats','surges','record','growth','strong','gains','profit','jumps','rally','soars','upgrade','tops','rises','accelerat','expands'];
  const neg = ['fall','falls','drops','misses','concern','risk','cuts','decline','slump','lawsuit','warning','downgrade','restrict','tariff','tighten','weaker','slow'];
  let s = 0;
  pos.forEach(w => { if (text.includes(w)) s++; });
  neg.forEach(w => { if (text.includes(w)) s--; });
  return s > 0 ? 'pos' : s < 0 ? 'neg' : 'neu';
}

/* ── Skeleton helpers ────────────────────────────── */
const sk  = (w,h,r='4px') => `<span class="sk" style="width:${w};height:${h};border-radius:${r}"></span>`;
const skb = (w,h='14px',mb='8px') => `<div class="sk" style="display:block;width:${w};height:${h};border-radius:4px;margin-bottom:${mb}"></div>`;

/* ── Watchlist extra-field helpers ───────────────── */
function formatVolume(num) {
  if (!num || isNaN(num)) return '—';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return String(num);
}

function calcWeekPosition(price, low52, high52) {
  if (!price || !low52 || !high52 || high52 === low52) return null;
  return Math.round((price - low52) / (high52 - low52) * 100);
}

function renderPositionBar(pct) {
  if (pct === null || pct === undefined) {
    return '<div class="pos-bar-cell"><span class="pos-bar-pct">—</span><div class="pos-bar-wrap"></div></div>';
  }
  const p     = Math.max(0, Math.min(100, pct));
  const color = p < 30 ? '#ef4444' : p < 70 ? '#f97316' : '#22c55e';
  return `<div class="pos-bar-cell"><span class="pos-bar-pct">${p}%</span><div class="pos-bar-wrap"><div class="pos-bar-fill" style="width:${p}%;background:${color}"></div></div></div>`;
}

/* ── Alpha Vantage Forward P/E cache (24 h TTL) ──────── */
function getAvFwdPE(sym) {
  try {
    const store = JSON.parse(localStorage.getItem('stocklens.av.fpe') || '{}');
    const entry = store[sym];
    if (entry && (Date.now() - entry.ts) < 86400000) return entry.v; // null is a valid cached value
  } catch {}
  return undefined; // undefined = no valid cache entry
}
function setAvFwdPE(sym, v) {
  try {
    const store = JSON.parse(localStorage.getItem('stocklens.av.fpe') || '{}');
    store[sym] = { ts: Date.now(), v };
    localStorage.setItem('stocklens.av.fpe', JSON.stringify(store));
  } catch {}
}

/* ── Recent search history (localStorage) ───────────── */
const RECENT_MAX = 8;
function loadRecent() {
  try { return JSON.parse(localStorage.getItem('stocklens.recent') || '[]'); }
  catch { return []; }
}
function saveRecent(sym) {
  let r = loadRecent().filter(s => s !== sym);
  r.unshift(sym);
  localStorage.setItem('stocklens.recent', JSON.stringify(r.slice(0, RECENT_MAX)));
}
function removeRecent(sym) {
  localStorage.setItem('stocklens.recent', JSON.stringify(loadRecent().filter(s => s !== sym)));
}
function clearRecent() {
  localStorage.removeItem('stocklens.recent');
}

/* ── Portfolio helpers (Guest mode, localStorage) ────── */
function loadPortfolio() {
  try { return JSON.parse(localStorage.getItem('stocklens.portfolio') || '[]'); }
  catch { return []; }
}
function savePortfolio(lots) {
  localStorage.setItem('stocklens.portfolio', JSON.stringify(lots));
}
function pfUid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function fmtAssets(n) {
  if (!n || isNaN(n)) return null;
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9)  return '$' + (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6)  return '$' + (n / 1e6).toFixed(0) + 'M';
  return null;
}

/* ── Realized P&L helpers (Guest mode, localStorage) ── */
function loadSells() {
  try { return JSON.parse(localStorage.getItem('stocklens.sells') || '[]'); }
  catch { return []; }
}
function saveSells(sells) {
  localStorage.setItem('stocklens.sells', JSON.stringify(sells));
}
function sellUid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
