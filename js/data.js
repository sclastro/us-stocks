'use strict';

/* ── Auth-aware Watchlist operations ─────────────
 * Guest  → read/write localStorage (utils.js)
 * Logged → read/write Supabase DB   (db.js)
 * ─────────────────────────────────────────────── */

/** Load watchlist from DB (if logged in) and sync in-memory Set + badge. */
async function wlInit() {
  if (isLoggedIn()) {
    try {
      const syms = await dbWlLoad();
      watchlist.clear();
      syms.forEach(s => watchlist.add(s));
    } catch(e) { console.warn('[wlInit]', e); }
  }
  updateWlBadge();
}

/** Add a symbol to watchlist. */
async function wlAdd(sym) {
  watchlist.add(sym);
  updateWlBadge();
  if (isLoggedIn()) {
    try { await dbWlAdd(sym); }
    catch(e) { console.warn('[wlAdd]', e); }
  } else {
    saveWatchlist();
  }
}

/** Remove a symbol from watchlist. */
async function wlRemove(sym) {
  watchlist.delete(sym);
  updateWlBadge();
  if (isLoggedIn()) {
    try { await dbWlRemove(sym); }
    catch(e) { console.warn('[wlRemove]', e); }
  } else {
    saveWatchlist();
  }
}

/** Clear entire watchlist. */
async function wlClear() {
  watchlist.clear();
  updateWlBadge();
  if (isLoggedIn()) {
    try { await dbWlClear(); }
    catch(e) { console.warn('[wlClear]', e); }
  } else {
    saveWatchlist();
  }
}

/* ── Auth-aware Portfolio operations ─────────────
 * Guest  → localStorage  (loadPortfolio / savePortfolio)
 * Logged → Supabase DB   (dbPfLoad / dbPfAdd / dbPfRemove)
 * ─────────────────────────────────────────────── */

/** Load all portfolio lots. */
async function pfLoad() {
  if (isLoggedIn()) {
    try { return await dbPfLoad(); }
    catch(e) { console.warn('[pfLoad]', e); return []; }
  }
  return loadPortfolio();
}

/** Add a new lot. */
async function pfAdd(lot) {
  if (isLoggedIn()) {
    try { await dbPfAdd(lot); }          // DB auto-generates UUID id
    catch(e) { console.warn('[pfAdd]', e); }
  } else {
    const lots = loadPortfolio();
    lots.push({ ...lot, id: pfUid() });  // generate client-side id for guest mode
    savePortfolio(lots);
  }
}

/** Remove a lot by id. */
async function pfRemove(id) {
  if (isLoggedIn()) {
    try { await dbPfRemove(id); }
    catch(e) { console.warn('[pfRemove]', e); }
  } else {
    const lots = loadPortfolio().filter(l => l.id !== id);
    savePortfolio(lots);
  }
}

/* ── Realized P&L (Sells) operations ─────────────────
 * Guest  → localStorage (loadSells / saveSells)
 * Logged → Supabase DB  (dbSellLoad / dbSellAdd / dbSellRemove)
 * ─────────────────────────────────────────────────── */

/** Load all recorded sell transactions. */
async function sellLoad() {
  if (isLoggedIn()) {
    try { return await dbSellLoad(); }
    catch(e) { console.warn('[sellLoad]', e); return []; }
  }
  return loadSells();
}

/** Record a sell transaction. sell = { sym, shares, sellPrice, avgCost, sellDate } */
async function sellAdd(sell) {
  if (isLoggedIn()) {
    try { await dbSellAdd(sell); }
    catch(e) { console.warn('[sellAdd]', e); }
  } else {
    const sells = loadSells();
    sells.unshift({ ...sell, id: sellUid() });  // newest first
    saveSells(sells);
  }
}

/** Delete a sell record by id. */
async function sellRemove(id) {
  if (isLoggedIn()) {
    try { await dbSellRemove(id); }
    catch(e) { console.warn('[sellRemove]', e); }
  } else {
    saveSells(loadSells().filter(s => s.id !== id));
  }
}
