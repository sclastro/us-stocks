'use strict';

const VALID_RANGES    = new Set(['1d','5d','1mo','3mo','6mo','1y','2y','5y','10y','ytd','max']);
const VALID_INTERVALS = new Set(['1m','5m','15m','30m','60m','1h','1d','1wk','1mo']);

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders() };
  }

  const { symbol, range = '1mo', interval = '1d' } = event.queryStringParameters || {};

  if (!symbol) return json(400, { error: 'Missing symbol' });

  const safeRange    = VALID_RANGES.has(range)     ? range    : '1mo';
  const safeInterval = VALID_INTERVALS.has(interval) ? interval : '1d';

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
              `?range=${safeRange}&interval=${safeInterval}&includePrePost=false`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept':     'application/json',
      }
    });

    if (!res.ok) return json(res.status, { error: `Yahoo returned HTTP ${res.status}` });

    const raw    = await res.json();
    const result = raw?.chart?.result?.[0];
    if (!result) return json(404, { error: 'No data for symbol' });

    const timestamps = result.timestamp || [];
    const q          = result.indicators?.quote?.[0] || {};
    const { open = [], high = [], low = [], close = [], volume = [] } = q;

    const bars = [];
    for (let i = 0; i < timestamps.length; i++) {
      const o = open[i], h = high[i], l = low[i], c = close[i];
      if (o == null || h == null || l == null || c == null ||
          isNaN(o)  || isNaN(h)  || isNaN(l)  || isNaN(c)) continue;
      bars.push({
        time:   timestamps[i],
        open:   +o.toFixed(6),
        high:   +h.toFixed(6),
        low:    +l.toFixed(6),
        close:  +c.toFixed(6),
        volume: volume[i] || 0,
      });
    }

    return json(200, { bars });
  } catch (err) {
    return json(500, { error: err.message });
  }
};

function json(status, body) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    body: JSON.stringify(body),
  };
}
function corsHeaders() {
  return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,OPTIONS' };
}
