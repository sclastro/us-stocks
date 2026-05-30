'use strict';

/* Proxy for Financial Modeling Prep — returns forwardEps from analyst estimates.
   Free tier: 250 calls/day. Used to compute Forward P/E on client side.      */

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders() };
  }

  const { symbol } = event.queryStringParameters || {};
  if (!symbol) return json(400, { error: 'Missing symbol' });

  const key = process.env.FMP_KEY;
  if (!key) return json(500, { error: 'FMP_KEY not configured' });

  try {
    /* Annual analyst EPS estimates — fetch 2 periods to ensure we get a future one */
    const url = `https://financialmodelingprep.com/api/v3/analyst-estimates/${encodeURIComponent(symbol)}?period=annual&limit=2&apikey=${key}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!res.ok) return json(res.status, { error: `FMP returned ${res.status}` });

    const data = await res.json();
    if (!Array.isArray(data) || !data.length) return json(200, { forwardEps: null });

    /* Prefer closest future annual estimate; fall back to first entry */
    const today  = new Date();
    const sorted = data
      .filter(e => new Date(e.date) > today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const next       = sorted[0] ?? data[0];
    const forwardEps = next?.estimatedEpsAvg ?? null;

    return json(200, { forwardEps });
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
