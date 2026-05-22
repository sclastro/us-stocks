'use strict';

/* ── Internal fetch helper ───────────────────────── */
async function _fhFetch(path){
  const sep = path.includes('?') ? '&' : '?';
  const res  = await fetch(`${CONFIG.FH_BASE}/${path}${sep}token=${CONFIG.FH_KEY}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error){
    const msg = data.error.toLowerCase();
    if (msg.includes('invalid')) throw new Error('Finnhub API Key 無效。');
    if (msg.includes('limit'))   throw new Error('已達 Finnhub 請求上限。');
    throw new Error(data.error);
  }
  return data;
}

/* ── Public API surface ──────────────────────────── */
const API = {
  getQuote:          sym      => _fhFetch(`quote?symbol=${sym}`),
  getCompanyProfile: sym      => _fhFetch(`stock/profile2?symbol=${sym}`),
  getMetrics:        sym      => _fhFetch(`stock/metric?symbol=${sym}&metric=all`),
  getCandles: (sym, from, to, resolution = 'D') =>
    _fhFetch(`stock/candle?symbol=${sym}&resolution=${resolution}&from=${from}&to=${to}`),

  async getNews(sym){
    const now = Math.floor(Date.now()/1000);
    const to  = tsToDate(now);
    try {
      const d = await _fhFetch(`company-news?symbol=${sym}&from=${tsToDate(now-60*86400)}&to=${to}`);
      if (Array.isArray(d) && d.length) return d;
    } catch {}
    try {
      const d = await _fhFetch(`company-news?symbol=${sym}&from=${tsToDate(now-180*86400)}&to=${to}`);
      if (Array.isArray(d) && d.length) return d;
    } catch {}
    return [];
  }
};
