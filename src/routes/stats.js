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
  const [r, total] = await Promise.all([
    pool.query(
    `SELECT p.path, count(*)::int AS views, count(DISTINCT p.visitor_hash)::int AS visitors,
            COALESCE(round(avg(NULLIF(p.duration_s, 0))::numeric, 1), 0) AS avg_time_seconds,
            (SELECT count(*)::int FROM sessions s
              WHERE s.website_id = $1 AND s.entry_path = p.path AND s.started_at >= $2 AND s.started_at < $3) AS entrances,
            (SELECT count(*)::int FROM sessions s
              WHERE s.website_id = $1 AND s.exit_path = p.path AND s.started_at >= $2 AND s.started_at < $3) AS exits,
            COALESCE((SELECT round(100.0 * count(*) FILTER (WHERE s.pageviews <= 1) / NULLIF(count(*), 0), 1)
              FROM sessions s
              WHERE s.website_id = $1 AND s.entry_path = p.path AND s.started_at >= $2 AND s.started_at < $3), 0) AS bounce_rate
       FROM pageviews p WHERE p.website_id = $1 AND p.created_at >= $2 AND p.created_at < $3
      GROUP BY p.path ORDER BY views DESC LIMIT $4`,
    [req.params.siteId, from, to, limitOf(req)]),
    pool.query(
      `SELECT count(DISTINCT path)::int AS total
         FROM pageviews WHERE website_id = $1 AND created_at >= $2 AND created_at < $3`,
      [req.params.siteId, from, to]),
  ]);
  res.json({ data: r.rows, totalPages: total.rows[0].total });
}));

router.get('/:siteId/audience', wrap(async (req, res) => {
  const { from, to } = parseRange(req);
  const id = req.params.siteId;
  const summary = await pool.query(
    `SELECT count(*)::int AS visitors,
            count(*) FILTER (WHERE session_count = 1)::int AS new_visitors,
            count(*) FILTER (WHERE session_count > 1)::int AS returning_visitors
       FROM (
         SELECT visitor_hash, count(*) AS session_count
           FROM sessions WHERE website_id = $1 AND started_at >= $2 AND started_at < $3
          GROUP BY visitor_hash
       ) visitors`,
    [id, from, to]);

  const params = [id, from, to];
  const search = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
  let filter = '';
  if (search) {
    params.push(`%${search}%`);
    filter = `WHERE visitor_id ILIKE $4 OR country ILIKE $4 OR device ILIKE $4 OR last_path ILIKE $4`;
  }
  params.push(limitOf(req));
  const visitors = await pool.query(
    `SELECT * FROM (
       SELECT 'visitor-' || substr(visitor_hash, 1, 12) AS visitor_id,
              count(*)::int AS sessions,
              max(last_seen_at) AS last_seen_at,
              COALESCE((array_agg(country ORDER BY last_seen_at DESC))[1]::text, '??') AS country,
              (array_agg(device_type ORDER BY last_seen_at DESC))[1] AS device,
              (array_agg(COALESCE(exit_path, entry_path, '/') ORDER BY last_seen_at DESC))[1] AS last_path
         FROM sessions
        WHERE website_id = $1 AND started_at >= $2 AND started_at < $3
        GROUP BY visitor_hash
     ) audience ${filter}
      ORDER BY last_seen_at DESC LIMIT $${params.length}`,
    params);
  res.json({
    ...summary.rows[0],
    note: 'Visitor identities rotate daily for privacy; returning visitors only reflect repeat sessions within the selected period and hash window.',
    data: visitors.rows,
  });
}));

router.get('/:siteId/traffic', wrap(async (req, res) => {
  const { from, to } = parseRange(req);
  const id = req.params.siteId;
  const params = [id, from, to];
  const [categories, referrers, terms, landingPages, exitPages, funnel] = await Promise.all([
    pool.query(
      `SELECT CASE
                WHEN lower(COALESCE(utm_medium, '')) IN ('social', 'social_media', 'community') OR lower(COALESCE(utm_source, '')) ~ '(facebook|instagram|linkedin|tiktok|youtube|twitter|pinterest|reddit)' THEN 'Social'
                WHEN lower(COALESCE(utm_medium, '')) IN ('search', 'organic') OR lower(COALESCE(utm_source, '')) ~ '(google|bing|yahoo|duckduckgo|baidu|yandex)' THEN 'Search'
                WHEN referrer_domain IS NULL AND utm_source IS NULL THEN 'Direct'
                WHEN referrer_domain ~* '(google|bing|yahoo|duckduckgo|baidu|yandex)\\.' THEN 'Search'
                WHEN referrer_domain ~* '(facebook|instagram|linkedin|tiktok|youtube|x\\.com|twitter|pinterest|reddit)\\.' THEN 'Social'
                ELSE 'Referral'
              END AS category,
              count(*)::int AS sessions, count(DISTINCT visitor_hash)::int AS visitors
         FROM sessions WHERE website_id = $1 AND started_at >= $2 AND started_at < $3
        GROUP BY 1 ORDER BY sessions DESC`, params),
    pool.query(
      `SELECT COALESCE(referrer_domain, '(direct)') AS value,
              count(*)::int AS sessions, count(DISTINCT visitor_hash)::int AS visitors
         FROM sessions WHERE website_id = $1 AND started_at >= $2 AND started_at < $3
        GROUP BY 1 ORDER BY sessions DESC LIMIT $4`, [...params, limitOf(req)]),
    pool.query(
      `SELECT utm_term AS value, count(*)::int AS sessions
         FROM sessions WHERE website_id = $1 AND started_at >= $2 AND started_at < $3
          AND utm_term IS NOT NULL AND utm_term <> ''
        GROUP BY utm_term ORDER BY sessions DESC LIMIT $4`, [...params, limitOf(req)]),
    pool.query(
      `SELECT COALESCE(entry_path, '(unknown)') AS value, count(*)::int AS sessions
         FROM sessions WHERE website_id = $1 AND started_at >= $2 AND started_at < $3
        GROUP BY 1 ORDER BY sessions DESC LIMIT $4`, [...params, limitOf(req)]),
    pool.query(
      `SELECT COALESCE(exit_path, '(unknown)') AS value, count(*)::int AS sessions
         FROM sessions WHERE website_id = $1 AND started_at >= $2 AND started_at < $3
        GROUP BY 1 ORDER BY sessions DESC LIMIT $4`, [...params, limitOf(req)]),
    pool.query(
      `SELECT
         (SELECT count(DISTINCT visitor_hash)::int FROM sessions WHERE website_id = $1 AND started_at >= $2 AND started_at < $3) AS visitors,
         (SELECT count(*)::int FROM sessions WHERE website_id = $1 AND started_at >= $2 AND started_at < $3) AS sessions,
         (SELECT count(*)::int FROM pageviews WHERE website_id = $1 AND created_at >= $2 AND created_at < $3) AS pageviews,
         (SELECT count(*)::int FROM sessions WHERE website_id = $1 AND started_at >= $2 AND started_at < $3 AND pageviews > 1) AS engaged_sessions,
         (SELECT count(DISTINCT e.session_id)::int FROM events e
           WHERE e.website_id = $1 AND e.created_at >= $2 AND e.created_at < $3) AS event_sessions`,
      params),
  ]);
  res.json({
    categories: categories.rows,
    referrers: referrers.rows,
    searchTerms: terms.rows,
    landingPages: landingPages.rows,
    exitPages: exitPages.rows,
    funnel: funnel.rows[0],
  });
}));

router.get('/:siteId/heatmap', wrap(async (req, res) => {
  const { from, to } = parseRange(req);
  const tz = parseTz(req);
  const r = await pool.query(
    `SELECT extract(isodow FROM created_at AT TIME ZONE $4)::int AS weekday,
            extract(hour FROM created_at AT TIME ZONE $4)::int AS hour,
            count(*)::int AS pageviews
       FROM pageviews WHERE website_id = $1 AND created_at >= $2 AND created_at < $3
      GROUP BY 1, 2 ORDER BY 1, 2`,
    [req.params.siteId, from, to, tz]);
  res.json({ tz, data: r.rows });
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
  const [v, pages, recent] = await Promise.all([
    pool.query(`SELECT count(DISTINCT visitor_hash)::int AS visitors FROM sessions
                 WHERE website_id = $1 AND last_seen_at > now() - interval '5 minutes'`, [id]),
    pool.query(`SELECT path, count(*)::int AS views FROM pageviews
                 WHERE website_id = $1 AND created_at > now() - interval '5 minutes'
                 GROUP BY path ORDER BY views DESC LIMIT 10`, [id]),
    pool.query(`SELECT p.path, p.created_at, s.device_type AS device
                  FROM pageviews p JOIN sessions s ON s.id = p.session_id
                 WHERE p.website_id = $1
                 ORDER BY p.created_at DESC LIMIT 10`, [id]),
  ]);
  res.json({ activeVisitors: v.rows[0].visitors, pages: pages.rows, recent: recent.rows });
}));

module.exports = router;
