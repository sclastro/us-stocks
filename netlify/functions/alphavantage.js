'use strict';

/* Proxy for Alpha Vantage OVERVIEW endpoint.
   Returns ForwardPE, TrailingPE, EPS for a given symbol.
   Free tier: 25 req/day, 500/month.                      */

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders() };
  }

  const { symbol } = event.queryStringParameters || {};
  if (!symbol) return json(400, { error: 'Missing symbol' });

  const key = process.env.AV_KEY;
  if (!key) return json(500, { error: 'AV_KEY not configured' });

  try {
    const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${encodeURIComponent(symbol)}&apikey=${key}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!res.ok) return json(res.status, { error: `AV returned ${res.status}` });

    const data = await res.json();

    /* AV returns {} or { Information: '...' } when rate-limited / unknown symbol */
    if (!data || !data.Symbol) return json(200, { forwardPE: null, trailingPE: null, eps: null });

    const parse = v => {
      const n = parseFloat(v);
      return (n > 0 && isFinite(n)) ? n : null;
    };

    return json(200, {
      forwardPE:  parse(data.ForwardPE),
      trailingPE: parse(data.TrailingPE),
      eps:        parse(data.EPS),
    });
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
