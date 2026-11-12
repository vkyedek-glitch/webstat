'use strict';
// Asenkron toplu yazıcı: /api/track isteği kuyruğa atar ve hemen döner.
// Kuyruk her FLUSH_INTERVAL_MS'de (veya BATCH_SIZE dolunca) tek transaction ile yazılır.
const pool = require('../db');
const config = require('../config');

const SESSION_MS = config.sessionTimeoutMin * 60_000;
const queue = [];
const sessionCache = new Map(); // "siteId:visitorHash" -> { id, last }
let flushing = false;
let timer = null;
let sweeper = null;
const metrics = { enqueued: 0, dropped: 0, written: 0, failedBatches: 0 };

function enqueue(ev) {
  if (queue.length >= config.maxQueue) { metrics.dropped++; return false; } // geri basınç
  ev.ts = ev.ts || Date.now();
  queue.push(ev);
  metrics.enqueued++;
  if (queue.length >= config.batchSize) setImmediate(flush);
  return true;
}

async function resolveSession(client, e, pending) {
  const key = `${e.siteId}:${e.vh}`;
  let s = pending.get(key) || sessionCache.get(key);
  if (s && e.ts - s.last < SESSION_MS) { s.last = Math.max(s.last, e.ts); return s.id; }

  if (!s) { // bu instance'ın bilmediği ziyaretçi: DB'de aktif oturum var mı? (restart / çoklu instance)
    const r = await client.query(
      `SELECT id, last_seen_at FROM sessions
        WHERE website_id = $1 AND visitor_hash = $2 AND last_seen_at > $3
        ORDER BY last_seen_at DESC LIMIT 1`,
      [e.siteId, e.vh, new Date(e.ts - SESSION_MS)]
    );
    if (r.rowCount) {
      s = { id: r.rows[0].id, last: Math.max(r.rows[0].last_seen_at.getTime(), e.ts) };
      pending.set(key, s);
      return s.id;
    }
  }

  const a = e.attrs;
  const ins = await client.query(
    `INSERT INTO sessions (website_id, visitor_hash, started_at, last_seen_at, entry_path, referrer_domain,
        utm_source, utm_medium, utm_campaign, utm_term, utm_content,
        device_type, os, browser, country, city, screen_width)
     VALUES ($1,$2,$3,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING id`,
    [e.siteId, e.vh, new Date(e.ts), e.path, a.referrer, a.utm.utm_source, a.utm.utm_medium, a.utm.utm_campaign,
     a.utm.utm_term, a.utm.utm_content, a.device, a.os, a.browser, a.country, a.city, a.width]
  );
  s = { id: ins.rows[0].id, last: e.ts };
  pending.set(key, s);
  return s.id;
}

async function writeBatch(client, batch) {
  const pending = new Map();
  const touched = new Map(); // sessionId -> { pv, ev, last, exit }
  const pv = { w: [], s: [], pid: [], vh: [], host: [], path: [], title: [], ts: [] };
  const ev = { w: [], s: [], name: [], props: [], path: [], ts: [] };
  const pings = new Map(); // `${siteId}:${pid}` -> en büyük süre

  for (const e of batch) {
    if (e.type === 'ping') {
      const k = `${e.siteId}:${e.pid}`;
      const prev = pings.get(k);
      if (!prev || prev.d < e.d) pings.set(k, e);
      const c = sessionCache.get(`${e.siteId}:${e.vh}`);
      if (c) c.last = Math.max(c.last, e.ts);
      continue;
    }
    const sid = await resolveSession(client, e, pending);
    const t = touched.get(sid) || { pv: 0, ev: 0, last: 0, exit: null };
    t.last = Math.max(t.last, e.ts);
    if (e.type === 'pv') {
      pv.w.push(e.siteId); pv.s.push(sid); pv.pid.push(e.pid); pv.vh.push(e.vh); pv.host.push(e.host);
      pv.path.push(e.path); pv.title.push(e.title); pv.ts.push(new Date(e.ts).toISOString());
      t.pv++; t.exit = e.path;
    } else {
      ev.w.push(e.siteId); ev.s.push(sid); ev.name.push(e.name); ev.props.push(e.props ? JSON.stringify(e.props) : null);
      ev.path.push(e.path); ev.ts.push(new Date(e.ts).toISOString());
      t.ev++;
    }
    touched.set(sid, t);
  }

  if (pv.w.length) {
    await client.query(
      `INSERT INTO pageviews (website_id, session_id, pid, visitor_hash, hostname, path, title, created_at)
       SELECT * FROM unnest($1::uuid[], $2::uuid[], $3::uuid[], $4::text[], $5::text[], $6::text[], $7::text[], $8::timestamptz[])
       ON CONFLICT (website_id, pid) DO NOTHING`,
      [pv.w, pv.s, pv.pid, pv.vh, pv.host, pv.path, pv.title, pv.ts]
    );
  }
  if (ev.w.length) {
    await client.query(
      `INSERT INTO events (website_id, session_id, name, props, path, created_at)
       SELECT w, s, n, p::jsonb, pa, t
         FROM unnest($1::uuid[], $2::uuid[], $3::text[], $4::text[], $5::text[], $6::timestamptz[]) AS x(w, s, n, p, pa, t)`,
      [ev.w, ev.s, ev.name, ev.props, ev.path, ev.ts]
    );
  }
  if (touched.size) {
    const ids = [], pvs = [], evs = [], lasts = [], exits = [];
    for (const [id, t] of touched) {
      ids.push(id); pvs.push(t.pv); evs.push(t.ev); lasts.push(new Date(t.last).toISOString()); exits.push(t.exit);
    }
    await client.query(
      `UPDATE sessions s
          SET pageviews = s.pageviews + v.pv,
              events = s.events + v.ev,
              last_seen_at = GREATEST(s.last_seen_at, v.lseen),
              exit_path = COALESCE(v.xpath, s.exit_path)
         FROM unnest($1::uuid[], $2::int[], $3::int[], $4::timestamptz[], $5::text[]) AS v(id, pv, ev, lseen, xpath)
        WHERE s.id = v.id`,
      [ids, pvs, evs, lasts, exits]
    );
  }
  if (pings.size) {
    const w = [], pid = [], vh = [], d = [];
    for (const e of pings.values()) { w.push(e.siteId); pid.push(e.pid); vh.push(e.vh); d.push(e.d); }
    // visitor_hash eşleşmesi: başkasının pageview'unu güncelleme (IDOR) engellenir
    await client.query(
      `WITH upd AS (
         UPDATE pageviews p SET duration_s = GREATEST(p.duration_s, v.d)
           FROM unnest($1::uuid[], $2::uuid[], $3::text[], $4::int[]) AS v(wid, pid, vh, d)
          WHERE p.website_id = v.wid AND p.pid = v.pid AND p.visitor_hash = v.vh
         RETURNING p.session_id
       )
       UPDATE sessions s SET last_seen_at = now()
         FROM (SELECT DISTINCT session_id FROM upd) u WHERE s.id = u.session_id`,
      [w, pid, vh, d]
    );
  }
  return pending;
}

async function flush() {
  if (flushing || queue.length === 0) return;
  flushing = true;
  const batch = queue.splice(0, config.batchSize);
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const pending = await writeBatch(client, batch);
    await client.query('COMMIT');
    for (const [k, v] of pending) sessionCache.set(k, v); // cache yalnızca COMMIT sonrası güncellenir
    metrics.written += batch.length;
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    metrics.failedBatches++;
    console.error('[writer] batch yazılamadı:', err.message);
    const retry = batch.filter((e) => (e.retries = (e.retries || 0) + 1) <= 2);
    queue.unshift(...retry);
  } finally {
    if (client) client.release();
    flushing = false;
  }
  if (queue.length >= config.batchSize) setImmediate(flush);
}

function start() {
  timer = setInterval(flush, config.flushIntervalMs);
  sweeper = setInterval(() => {
    const cutoff = Date.now() - SESSION_MS;
    for (const [k, v] of sessionCache) if (v.last < cutoff) sessionCache.delete(k);
  }, 5 * 60_000);
  timer.unref(); sweeper.unref();
}

async function stop() {
  clearInterval(timer); clearInterval(sweeper);
  for (let i = 0; i < 20 && (queue.length || flushing); i++) {
    await flush();
    if (flushing) await new Promise((r) => setTimeout(r, 100));
  }
}

const stats = () => ({ ...metrics, queueLength: queue.length, cachedSessions: sessionCache.size });

module.exports = { enqueue, start, stop, stats };
