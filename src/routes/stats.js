'use strict';
const express = require('express');
const pool = require('../db');
const { requireReader } = require('../middleware/auth');
const { UUID_RE } = require('../services/sites');

const router = express.Router({ mergeParams: true });

const httpError = (status, message) => Object.assign(new Error(message), { status, expose: true });
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);
const DAY = 86_400_000;

router.param('siteId', (req, res, next, id) => (UUID_RE.test(id) ? next() : res.status(404).json({ error: 'Bulunamadı' })));
router.use('/:siteId', requireReader);

function parseRange(req) {
  const to = req.query.to ? new Date(req.query.to) : new Date();
  const from = req.query.from ? new Date(req.query.from) : new Date(to.getTime() - 7 * DAY);
  if (isNaN(from) || isNaN(to)) throw httpError(400, 'from/to ISO 8601 olmalı (to hariçtir)');
  if (from >= to) throw httpError(400, 'from, to değerinden küçük olmalı');
  if (to - from > 366 * DAY) throw httpError(400, 'En fazla 366 günlük aralık sorgulanabilir');
  return { from, to };
}

function parseTz(req) {
  const tz = req.query.tz || 'UTC';
  try { new Intl.DateTimeFormat('en', { timeZone: tz }); } catch (_) { throw httpError(400, 'Geçersiz tz (IANA, örn. Europe/Istanbul)'); }
  return tz;
}

const limitOf = (req) => Math.max(1, Math.min(parseInt(req.query.limit, 10) || 10, 100));

// 1) Genel özet
router.get('/:siteId/overview', wrap(async (req, res) => {
  const { from, to } = parseRange(req);
  const p = [req.params.siteId, from, to];
  const [s, pv] = await Promise.all([
    pool.query(
      `SELECT count(*)::int AS sessions,
              count(DISTINCT visitor_hash)::int AS visitors,
              COALESCE(round(100.0 * count(*) FILTER (WHERE pageviews <= 1) / NULLIF(count(*), 0), 1), 0) AS bounce_rate,
              COALESCE(round(avg(EXTRACT(EPOCH FROM (last_seen_at - started_at)))::numeric, 1), 0) AS avg_session_seconds
         FROM sessions WHERE website_id = $1 AND started_at >= $2 AND started_at < $3`, p),
    pool.query(
      `SELECT count(*)::int AS pageviews,
              COALESCE(round(avg(NULLIF(duration_s, 0))::numeric, 1), 0) AS avg_time_on_page_seconds
         FROM pageviews WHERE website_id = $1 AND created_at >= $2 AND created_at < $3`, p),
  ]);
  res.json({ range: { from, to }, ...s.rows[0], ...pv.rows[0],
    note: 'visitors = günlük benzersiz ziyaretçilerin toplamı (günlük dönen tuz nedeniyle)' });
}));

// 2) Zaman serisi
router.get('/:siteId/timeseries', wrap(async (req, res) => {
  const { from, to } = parseRange(req);
  const tz = parseTz(req);
  const auto = to - from <= 2 * DAY ? 'hour' : 'day';
  const interval = ['hour', 'day', 'week', 'month'].includes(req.query.interval) ? req.query.interval : auto;
  const r = await pool.query(
    `SELECT to_char(date_trunc($4, created_at AT TIME ZONE $5), 'YYYY-MM-DD"T"HH24:MI:SS') AS bucket,
            count(*)::int AS pageviews, count(DISTINCT visitor_hash)::int AS visitors
       FROM pageviews WHERE website_id = $1 AND created_at >= $2 AND created_at < $3
      GROUP BY 1 ORDER BY 1`,
    [req.params.siteId, from, to, interval, tz]);
  res.json({ interval, tz, data: r.rows });
}));

// 3) En çok görüntülenen sayfalar
router.get('/:siteId/pages', wrap(async (req, res) => {
  const { from, to } = parseRange(req);
  const r = await pool.query(
    `SELECT path, count(*)::int AS views, count(DISTINCT visitor_hash)::int AS visitors,
            COALESCE(round(avg(NULLIF(duration_s, 0))::numeric, 1), 0) AS avg_time_seconds
       FROM pageviews WHERE website_id = $1 AND created_at >= $2 AND created_at < $3
      GROUP BY path ORDER BY views DESC LIMIT $4`,
    [req.params.siteId, from, to, limitOf(req)]);
  res.json({ data: r.rows });
}));

// 4) Oturum bazlı kırılımlar (kaynak, cihaz, OS, tarayıcı, ülke, UTM, giriş sayfası)
const DIMENSIONS = {
  referrer: `COALESCE(referrer_domain, '(direct)')`,
  device: 'device_type',
  os: `COALESCE(os, 'Other')`,
  browser: `COALESCE(browser, 'Other')`,
  country: `COALESCE(country::text, '??')`,
  city: `COALESCE(city, '(unknown)')`,
  utm_source: `COALESCE(utm_source, '(none)')`,
  utm_medium: `COALESCE(utm_medium, '(none)')`,
  utm_campaign: `COALESCE(utm_campaign, '(none)')`,
  entry_path: `COALESCE(entry_path, '(unknown)')`,
};
router.get('/:siteId/breakdown/:dimension', wrap(async (req, res) => {
  const expr = DIMENSIONS[req.params.dimension]; // beyaz liste: SQL enjeksiyonu yok
  if (!expr) throw httpError(400, `dimension: ${Object.keys(DIMENSIONS).join(', ')}`);
  const { from, to } = parseRange(req);
  const r = await pool.query(
    `SELECT ${expr} AS value, count(*)::int AS sessions, count(DISTINCT visitor_hash)::int AS visitors
       FROM sessions WHERE website_id = $1 AND started_at >= $2 AND started_at < $3
      GROUP BY 1 ORDER BY sessions DESC LIMIT $4`,
    [req.params.siteId, from, to, limitOf(req)]);
  res.json({ dimension: req.params.dimension, data: r.rows });
}));

// 5) Özel olaylar (+ opsiyonel JSONB prop filtresi: ?name=signup&prop=plan&value=pro)
router.get('/:siteId/events', wrap(async (req, res) => {
  const { from, to } = parseRange(req);
  const params = [req.params.siteId, from, to];
  let where = '';
  if (req.query.name) { params.push(String(req.query.name)); where += ` AND name = $${params.length}`; }
  if (req.query.prop && req.query.value !== undefined) {
    params.push(JSON.stringify({ [String(req.query.prop)]: String(req.query.value) }));
    where += ` AND props @> $${params.length}::jsonb`;
  }
  params.push(limitOf(req));
  const r = await pool.query(
    `SELECT name, count(*)::int AS total, count(DISTINCT session_id)::int AS sessions
       FROM events WHERE website_id = $1 AND created_at >= $2 AND created_at < $3 ${where}
      GROUP BY name ORDER BY total DESC LIMIT $${params.length}`, params);
  res.json({ data: r.rows });
}));

// 6) Anlık: son 5 dakika
router.get('/:siteId/realtime', wrap(async (req, res) => {
  const id = req.params.siteId;
  const [v, pages] = await Promise.all([
    pool.query(`SELECT count(DISTINCT visitor_hash)::int AS visitors FROM sessions
                 WHERE website_id = $1 AND last_seen_at > now() - interval '5 minutes'`, [id]),
    pool.query(`SELECT path, count(*)::int AS views FROM pageviews
                 WHERE website_id = $1 AND created_at > now() - interval '5 minutes'
                 GROUP BY path ORDER BY views DESC LIMIT 10`, [id]),
  ]);
  res.json({ activeVisitors: v.rows[0].visitors, pages: pages.rows });
}));

module.exports = router;
