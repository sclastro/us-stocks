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
  const statsUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=summaryDetail%2CdefaultKeyStatistics&formatted=false&lang=en&region=US`;

  const reqHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
  };

  try {
    const [chartRes, quoteData, statsData] = await Promise.all([
      fetch(chartUrl, { headers: reqHeaders }),
      fetch(quoteUrl, { headers: reqHeaders })
        .then(r => r.ok ? r.json() : null)
        .catch(() => null),
      fetch(statsUrl, { headers: reqHeaders })
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

    const q  = quoteData?.quoteResponse?.result?.[0];
    // v10/quoteSummary — summaryDetail has forwardPE, defaultKeyStatistics has forwardEps
    const sd = statsData?.quoteSummary?.result?.[0]?.summaryDetail;
    const ks = statsData?.quoteSummary?.result?.[0]?.defaultKeyStatistics;
    // Yahoo may return {raw, fmt} objects or plain numbers depending on formatted= param
    const _raw = v => (v !== null && v !== undefined && typeof v === 'object') ? (v.raw ?? null) : (v ?? null);

    // Best-effort forwardPE: compute from chart meta's epsForward if API fields missing
    const epsForwardMeta = meta.epsForward ?? null;
    const fwdPEFromMeta  = (epsForwardMeta && epsForwardMeta !== 0 && price > 0)
      ? Math.round(price / epsForwardMeta * 10) / 10
      : null;


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
      trailingPE:       q?.trailingPE  ?? meta.trailingPE ?? _raw(ks?.trailingPE)  ?? null,
      forwardPE:        q?.forwardPE  ?? _raw(sd?.forwardPE) ?? _raw(ks?.forwardPE) ?? fwdPEFromMeta ?? null,
      forwardEps:       q?.epsForward ?? _raw(ks?.forwardEps) ?? epsForwardMeta    ?? null,
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
