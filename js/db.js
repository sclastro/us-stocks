'use strict';

/* ── Watchlist DB operations ─────────────────────
 * All functions require isLoggedIn() === true.
 * RLS on the table filters rows by auth.uid().
 * ─────────────────────────────────────────────── */

async function dbWlLoad() {
  const { data, error } = await sbClient
    .from('watchlist')
    .select('symbol')
    .order('created_at');
  if (error) throw error;
  return data.map(r => r.symbol);
}

async function dbWlAdd(sym) {
  const { error } = await sbClient
    .from('watchlist')
    .insert({ user_id: getUserId(), symbol: sym });
  /* 23505 = unique_violation (already in watchlist) — safe to ignore */
  if (error && error.code !== '23505') throw error;
}

async function dbWlRemove(sym) {
  const { error } = await sbClient
    .from('watchlist')
    .delete()
    .eq('symbol', sym);
  if (error) throw error;
}

async function dbWlClear() {
  /* Delete all rows for this user (RLS restricts to current user) */
  const { error } = await sbClient
    .from('watchlist')
    .delete()
    .neq('symbol', '');          // matches all rows; RLS handles user scoping
  if (error) throw error;
}

/* ── Portfolio DB operations ─────────────────────
 * Lot schema: { id, sym, shares, buy_price, buy_date, user_id }
 * ─────────────────────────────────────────────── */

async function dbPfLoad() {
  const { data, error } = await sbClient
    .from('portfolio_lots')
    .select('*')
    .order('created_at');
  if (error) throw error;
  return data.map(r => ({
    id:       r.id,
    sym:      r.sym,
    shares:   Number(r.shares),
    buyPrice: Number(r.buy_price),
    buyDate:  r.buy_date,
  }));
}

async function dbPfAdd(lot) {
  /* Do NOT include id — let DB auto-generate via DEFAULT gen_random_uuid() */
  const { error } = await sbClient
    .from('portfolio_lots')
    .insert({
      user_id:   getUserId(),
      sym:       lot.sym,
      shares:    lot.shares,
      buy_price: lot.buyPrice,
      buy_date:  lot.buyDate,
    });
  if (error) throw error;
}

async function dbPfRemove(id) {
  const { error } = await sbClient
    .from('portfolio_lots')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

/* ── Sells DB operations ─────────────────────────────
 * Table: portfolio_sells
 * Columns: id, user_id, sym, shares, sell_price, avg_cost, sell_date
 * ─────────────────────────────────────────────────── */

async function dbSellLoad() {
  const { data, error } = await sbClient
    .from('portfolio_sells')
    .select('*')
    .order('sell_date', { ascending: false });
  if (error) throw error;
  return data.map(r => ({
    id:        r.id,
    sym:       r.sym,
    shares:    Number(r.shares),
    sellPrice: Number(r.sell_price),
    avgCost:   Number(r.avg_cost),
    sellDate:  r.sell_date,
  }));
}

async function dbSellAdd(sell) {
  const { error } = await sbClient
    .from('portfolio_sells')
    .insert({
      user_id:    getUserId(),
      sym:        sell.sym,
      shares:     sell.shares,
      sell_price: sell.sellPrice,
      avg_cost:   sell.avgCost,
      sell_date:  sell.sellDate,
    });
  if (error) throw error;
}

async function dbSellRemove(id) {
  const { error } = await sbClient
    .from('portfolio_sells')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
