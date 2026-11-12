'use strict';
// Saatlik bakım: eski tuzları sil + saklama süresi dolan oturumları (CASCADE ile pageview/event) temizle.
const pool = require('../db');
const config = require('../config');

async function run() {
  const client = await pool.connect();
  try {
    // Çoklu instance'ta yalnızca biri çalışsın
    const lock = await client.query('SELECT pg_try_advisory_lock(727001) AS ok');
    if (!lock.rows[0].ok) return;
    try {
      await client.query(`DELETE FROM daily_salts WHERE day < (now() AT TIME ZONE 'UTC')::date - 1`);
      let total = 0;
      for (;;) {
        const r = await client.query(
          `DELETE FROM sessions WHERE id IN (
             SELECT s.id FROM sessions s JOIN websites w ON w.id = s.website_id
              WHERE s.last_seen_at < now() - make_interval(days => COALESCE(w.retention_days, $1))
              LIMIT 5000)`,
          [config.retentionDays]
        );
        total += r.rowCount;
        if (r.rowCount < 5000) break;
      }
      if (total) console.log(`[maintenance] ${total} eski oturum silindi`);
    } finally {
      await client.query('SELECT pg_advisory_unlock(727001)');
    }
  } finally {
    client.release();
  }
}

function start() {
  const t = setInterval(() => run().catch((e) => console.error('[maintenance]', e.message)), 60 * 60_000);
  t.unref();
  run().catch((e) => console.error('[maintenance]', e.message));
  return t;
}

module.exports = { start, run };
