'use strict';
const express = require('express');
const config = require('../config');
const sites = require('../services/sites');
const salts = require('../services/salts');
const writer = require('../services/writer');
const geo = require('../services/geo');
const { isBot, parseUserAgent } = require('../services/ua');
const { anonymizeIp, visitorHash, clean } = require('../services/privacy');

const router = express.Router();
const DEBUG = process.env.DEBUG_TRACK === '1';
const drop = (why) => { if (DEBUG) console.log('[track] drop:', why); };

// ---- CORS: tracker her domainden istek atar. Kimlik bilgisi (cookie) yok, bu yüzden "*" güvenlidir.
//      Asıl yetkilendirme Origin <-> websites.domain_name doğrulamasıyla handle() içinde yapılır.
router.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  });
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

// sendBeacon/fetch "text/plain" gönderir (preflight yok); JSON'u biz parse ederiz.
router.post('/', express.text({ type: () => true, limit: '4kb' }), (req, res) => {
  res.status(204).end(); // istemciyi asla bekletme; tüm sonuçlar için aynı yanıt (site ID enumeration yok)
  handle(req).catch((e) => console.error('[track]', e.message));
});

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
const PID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EVENT_NAME_RE = /^[\w\-. :]{1,64}$/;

function parsePath(u) {
  if (typeof u !== 'string' || u.length > 2048) return null;
  let p = u;
  if (!u.startsWith('/')) { try { p = new URL(u).pathname; } catch (_) { return null; } }
  p = p.split('#')[0].split('?')[0];          // sorgu parametreleri PII/token içerebilir: asla saklama
  return clean(p, 512) || '/';
}

function referrerDomain(ref, siteHost) {
  if (typeof ref !== 'string' || !ref) return null;
  try {
    const h = new URL(ref).hostname.toLowerCase().replace(/^www\./, '');
    if (!h || h === siteHost || h.endsWith('.' + siteHost)) return null; // iç gezinme direkt sayılır
    return clean(h, 253);
  } catch (_) { return null; }
}

function sanitizeProps(p) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) return null;
  const out = {};
  let n = 0;
  for (const [k, v] of Object.entries(p)) {
    if (++n > 10) break;
    const key = clean(k, 40);
    if (!key) continue;
    if (typeof v === 'string') out[key] = clean(v, 200);
    else if (typeof v === 'number' && Number.isFinite(v)) out[key] = v;
    else if (typeof v === 'boolean') out[key] = v;
  }
  return Object.keys(out).length ? out : null;
}

async function handle(req) {
  if (config.respectDnt && (req.get('dnt') === '1' || req.get('sec-gpc') === '1')) return drop('dnt/gpc');

  const ua = req.get('user-agent') || '';
  if (!ua || ua.length > 512 || isBot(ua)) return drop('ua');

  let b;
  try { b = JSON.parse(req.body); } catch (_) { return drop('json'); }
  if (!b || typeof b !== 'object') return drop('body');

  const site = await sites.get(b.s);
  if (!site || !site.is_active) return drop('site');
  const origin = req.get('origin');
  if (!sites.originAllowed(site, origin)) return drop('origin');

  const type = b.t;
  if (type !== 'pv' && type !== 'ping' && type !== 'ev') return drop('type');

  const salt = await salts.get();
  const vh = visitorHash(salt, site.id, anonymizeIp(req.ip), ua);
  const base = { siteId: site.id, vh };

  if (type === 'ping') {
    if (typeof b.p !== 'string' || !PID_RE.test(b.p)) return drop('pid');
    const d = Math.max(0, Math.min(Math.floor(Number(b.d) || 0), 4 * 3600));
    return void writer.enqueue({ ...base, type, pid: b.p.toLowerCase(), d });
  }

  const path = parsePath(b.u);
  if (!path) return drop('path');

  const touch = Math.max(0, Math.min(Number(b.mt) || 0, 20));
  const parsed = parseUserAgent(ua, touch);
  const { country, city } = geo.lookup(req);
  const width = Number.isFinite(Number(b.w)) ? Math.max(0, Math.min(Math.floor(Number(b.w)), 20000)) : null;
  const utm = {};
  const q = b.q && typeof b.q === 'object' ? b.q : {};
  for (const k of UTM_KEYS) utm[k] = clean(q[k], 100);

  let host = null;
  try { host = new URL(origin).hostname.toLowerCase(); } catch (_) { /* enforce_origin kapalı olabilir */ }

  const attrs = {
    device: parsed.device, os: parsed.os, browser: parsed.browser, country, city, width, utm,
    referrer: type === 'pv' ? referrerDomain(b.r, site.domain_name) : null,
  };

  if (type === 'pv') {
    if (typeof b.p !== 'string' || !PID_RE.test(b.p)) return drop('pid');
    return void writer.enqueue({ ...base, type, pid: b.p.toLowerCase(), host, path, title: clean(b.ti, 300), attrs });
  }

  // type === 'ev'
  const name = typeof b.n === 'string' && EVENT_NAME_RE.test(b.n) ? b.n : null;
  if (!name) return drop('event name');
  writer.enqueue({ ...base, type, name, props: sanitizeProps(b.pr), path, attrs });
}

module.exports = router;
