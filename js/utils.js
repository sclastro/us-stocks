'use strict';

/* ── i18n ─────────────────────────────────────────── */
const I18N = {
  zh:{
    market_open:'市場開市', powered_by:'技術提供',
    nav_quote:'股票查詢', nav_etf:'ETF', nav_indices:'環球指數',
    nav_watchlist:'自選清單', nav_portfolio:'持倉',
    hero_title:'股票<em>即時</em>查詢', hero_sub:'輸入股票代碼，獲取即時行情、K 線圖及最新新聞',
    search_ph:'輸入代碼，例如 AAPL', search:'查詢', searching:'查詢中…', trending:'熱門',
    live:'即時', err_title:'查詢失敗',
    k_open:'開盤', k_hl:'最高 · 最低', k_vol:'成交量', k_cap:'市值', k_52w:'52 週區間',
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
    coming_soon:'敬請期待', coming_soon_desc:'此功能正在開發中，即將推出。',
    footer_left:'StockLens · 僅供研究及教育用途，不構成投資建議。',
    footer_delay:'報價延遲約 15 分鐘', footer_terms:'服務條款',
  },
  en:{
    market_open:'Markets open', powered_by:'Powered by',
    nav_quote:'Quote', nav_etf:'ETF', nav_indices:'Indices',
    nav_watchlist:'Watchlist', nav_portfolio:'Portfolio',
    hero_title:'Stock <em>real-time</em> lookup', hero_sub:'Enter a ticker for live quotes, charts and the latest news.',
    search_ph:'Enter ticker — e.g. AAPL, TSLA', search:'Search', searching:'Searching…', trending:'Trending',
    live:'Live', err_title:'Query failed',
    k_open:'Open', k_hl:'High · Low', k_vol:'Volume', k_cap:'Market cap', k_52w:'52w range',
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
    coming_soon:'Coming Soon', coming_soon_desc:'This feature is under development and will be available soon.',
    footer_left:'StockLens · For research and educational use. Not financial advice.',
    footer_delay:'Quotes delayed ~15 min', footer_terms:'Terms',
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

function fmtAssets(n) {
  if (!n || isNaN(n)) return null;
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9)  return '$' + (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6)  return '$' + (n / 1e6).toFixed(0) + 'M';
  return null;
}
