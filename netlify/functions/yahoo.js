'use strict';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders() };
  }

  const { symbol } = event.queryStringParameters || {};

  if (!symbol) {
    return json(400, { error: 'Missing symbol parameter' });
  }

  const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
  const quoteUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}&formatted=false&lang=en&region=US`;

  const reqHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
  };

  try {
    const [chartRes, quoteData] = await Promise.all([
      fetch(chartUrl, { headers: reqHeaders }),
      fetch(quoteUrl, { headers: reqHeaders })
        .then(r => r.ok ? r.json() : null)
        .catch(() => null),
    ]);

    if (!chartRes.ok) return json(chartRes.status, { error: `Yahoo returned HTTP ${chartRes.status}` });

    const raw = await chartRes.json();
    const result = raw?.chart?.result?.[0];

    if (!result) {
      return json(404, { error: 'No data for symbol' });
    }

    const meta = result.meta;
    const price = meta.regularMarketPrice;
    const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? price;
    const change = meta.regularMarketChange ?? (price - prevClose);
    const changePercent = meta.regularMarketChangePercent ?? (prevClose ? ((price - prevClose) / prevClose) * 100 : 0);

    const q = quoteData?.quoteResponse?.result?.[0];

    return json(200, {
      price,
      change,
      changePercent,
      marketState:      meta.marketState ?? 'CLOSED',
      currency:         meta.currency,
      open:             meta.regularMarketOpen             ?? null,
      dayHigh:          meta.regularMarketDayHigh          ?? null,
      dayLow:           meta.regularMarketDayLow           ?? null,
      volume:           meta.regularMarketVolume           ?? null,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh              ?? null,
      fiftyTwoWeekLow:  meta.fiftyTwoWeekLow               ?? null,
      shortName:        meta.shortName || meta.longName    || null,
      trailingPE:       meta.trailingPE                    ?? null,
      totalAssets:      q?.totalAssets                     ?? null,
      ytdReturn:        q?.ytdReturn                       ?? null,
    });
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
