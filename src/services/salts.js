'use strict';
const crypto = require('crypto');
const pool = require('../db');

let cache = { day: null, salt: null };
let inflight = null;
const today = () => new Date().toISOString().slice(0, 10); // UTC

async function load(day) {
  const candidate = crypto.randomBytes(32).toString('hex');
  await pool.query('INSERT INTO daily_salts (day, salt) VALUES ($1, $2) ON CONFLICT (day) DO NOTHING', [day, candidate]);
  const r = await pool.query('SELECT salt FROM daily_salts WHERE day = $1', [day]);
  cache = { day, salt: r.rows[0].salt };
  return cache.salt;
}

async function get() {
  const day = today();
  if (cache.day === day) return cache.salt;
  if (!inflight) inflight = load(day).finally(() => { inflight = null; });
  return inflight;
}

module.exports = { get };
