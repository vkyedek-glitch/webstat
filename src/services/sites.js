'use strict';
const pool = require('../db');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TTL_MS = 60_000;
const NEG_TTL_MS = 30_000;
const MAX_ENTRIES = 5000;
const cache = new Map(); // id -> { row|null, exp }

async function get(id) {
  if (typeof id !== 'string' || !UUID_RE.test(id)) return null;
  const key = id.toLowerCase();
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.row;

  const r = await pool.query('SELECT * FROM websites WHERE id = $1', [key]);
  const row = r.rows[0] || null;
  if (cache.size >= MAX_ENTRIES) cache.clear(); // rastgele UUID ile cache şişirme saldırısına karşı sınır
  cache.set(key, { row, exp: Date.now() + (row ? TTL_MS : NEG_TTL_MS) });
  return row;
}

const invalidate = (id) => cache.delete(String(id).toLowerCase());

/** Origin başlığı kayıtlı domain (veya alt domain) ile eşleşiyor mu? */
function originAllowed(site, origin) {
  if (!site.enforce_origin) return true;
  if (!origin) return false;
  let host;
  try { host = new URL(origin).hostname.toLowerCase(); } catch (_) { return false; }
  const d = site.domain_name;
  return host === d || (site.allow_subdomains && host.endsWith('.' + d));
}

module.exports = { get, invalidate, originAllowed, UUID_RE };
