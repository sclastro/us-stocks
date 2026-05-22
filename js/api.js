'use strict';

/* ── Routing: file:// → direct Finnhub, HTTP → proxy ─
   netlify dev and production both serve via HTTP so the
   proxy is used automatically in both cases.            */
const _useProxy = window.location.protocol !== 'file:';

/* ── Internal fetch helpers ─────────────────────────── */
async function _fhFetch(path) {
  let url;
  if (_useProxy) {
    const qMark  = path.indexOf('?');
    const apiPath = qMark >= 0 ? path.slice(0, qMark) : path;
    const apiQs   = qMark >= 0 ? path.slice(qMark + 1) : '';
    const p = new URLSearchParams(apiQs);
    p.set('path', apiPath);
    url = `/.netlify/functions/finnhub?${p.toString()}`;
  } else {
    const sep = path.includes('?') ? '&' : '?';
    url = `${CONFIG.FH_BASE}/${path}${sep}token=${CONFIG.FH_KEY}`;
  }

  const res  = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) {
    const msg = data.error.toLowerCase();
    if (msg.includes('invalid')) throw new Error('Finnhub API Key 無效。');
    if (msg.includes('limit'))   throw new Error('已達 Finnhub 請求上限。');
    throw new Error(data.error);
  }
  return data;
}

/* ── Public API surface ──────────────────────────────── */
const API = {
  getQuote:          sym      => _fhFetch(`quote?symbol=${sym}`),
  getCompanyProfile: sym      => _fhFetch(`stock/profile2?symbol=${sym}`),
  getMetrics:        sym      => _fhFetch(`stock/metric?symbol=${sym}&metric=all`),
  getCandles: (sym, from, to, resolution = 'D') =>
    _fhFetch(`stock/candle?symbol=${sym}&resolution=${resolution}&from=${from}&to=${to}`),

  async getNews(sym) {
    const now = Math.floor(Date.now() / 1000);
    const to  = tsToDate(now);
    try {
      const d = await _fhFetch(`company-news?symbol=${sym}&from=${tsToDate(now - 60 * 86400)}&to=${to}`);
      if (Array.isArray(d) && d.length) return d;
    } catch {}
    try {
      const d = await _fhFetch(`company-news?symbol=${sym}&from=${tsToDate(now - 180 * 86400)}&to=${to}`);
      if (Array.isArray(d) && d.length) return d;
    } catch {}
    return [];
  },

  async getIndexQuote(symbol) {
    if (!_useProxy) throw new Error('環球指數需要透過 netlify dev 或 Netlify 部署才能使用。');
    const res  = await fetch(`/.netlify/functions/yahoo?symbol=${encodeURIComponent(symbol)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data; // { price, change, changePercent, marketState, currency }
  },
};
