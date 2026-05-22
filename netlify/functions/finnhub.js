'use strict';

const FH_BASE = 'https://finnhub.io/api/v1';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders() };
  }

  const params = event.queryStringParameters || {};
  const { path: apiPath, ...rest } = params;

  if (!apiPath) {
    return json(400, { error: 'Missing path parameter' });
  }

  const key = process.env.FINNHUB_API_KEY;
  if (!key) {
    return json(500, { error: 'FINNHUB_API_KEY not configured' });
  }

  const qs = Object.entries(rest)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  const url = qs
    ? `${FH_BASE}/${apiPath}?${qs}&token=${key}`
    : `${FH_BASE}/${apiPath}?token=${key}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return json(res.status, data);
  } catch (err) {
    return json(500, { error: err.message });
  }
};

function json(status, body) {
  return { statusCode: status, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify(body) };
}

function corsHeaders() {
  return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,OPTIONS' };
}
