'use strict';
const express = require('express');
const crypto = require('crypto');
const pool = require('../db');
const config = require('../config');
const sites = require('../services/sites');
const writer = require('../services/writer');
const {
  requireAdmin,
  verifyDashboardCredentials,
  createDashboardSession,
  revokeDashboardSession,
} = require('../middleware/auth');
const { sha256, clean } = require('../services/privacy');
const { createRateLimiter } = require('../middleware/rateLimit');

const router = express.Router();
const loginLimiter = createRateLimiter({ name: 'dashboard-login', windowS: 60, max: 10 });

const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);
const bad = (res, msg) => res.status(400).json({ error: msg });
const snippet = (id) => `<script defer src="${config.publicUrl}/track.js" data-site-id="${id}"></script>`;
const PUBLIC_COLS = 'id, name, domain_name, allow_subdomains, enforce_origin, is_active, retention_days, created_at';

router.post('/login', loginLimiter, (req, res) => {
  const body = req.body || {};
  if (!verifyDashboardCredentials(body.username, body.password)) {
    return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
  }
  res.json({ token: createDashboardSession(), expiresIn: 12 * 60 * 60 });
});

router.use(requireAdmin);

router.delete('/session', (req, res) => {
  const token = (req.get('authorization') || '').match(/^Bearer\s+(\S{16,256})$/i)?.[1];
  if (token) revokeDashboardSession(token);
  res.status(204).end();
});

function normalizeDomain(v) {
  if (typeof v !== 'string') return null;
  const s = v.trim().toLowerCase();
  let host;
  try { host = new URL(/^https?:\/\//.test(s) ? s : `http://${s}`).hostname; } catch (_) { return null; }
  host = host.replace(/^www\./, '');
  return /^(localhost|([a-z0-9-]{1,63}\.)+[a-z0-9-]{2,63})$/.test(host) ? host : null;
}

router.post('/websites', wrap(async (req, res) => {
  const name = clean(req.body.name, 100);
  const domain = normalizeDomain(req.body.domain);
  if (!name) return bad(res, 'name zorunlu');
  if (!domain) return bad(res, 'Geçerli bir domain girin (örn. ornek.com)');
  const token = crypto.randomBytes(32).toString('hex'); // yalnızca bir kez gösterilir, DB'de hash'i durur
  try {
    const r = await pool.query(
      `INSERT INTO websites (name, domain_name, allow_subdomains, enforce_origin, retention_days, read_token_hash)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${PUBLIC_COLS}`,
      [name, domain, req.body.allow_subdomains !== false, req.body.enforce_origin !== false,
       Number.isInteger(req.body.retention_days) && req.body.retention_days > 0 ? req.body.retention_days : null, sha256(token)]);
    res.status(201).json({ ...r.rows[0], read_token: token, snippet: snippet(r.rows[0].id) });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Bu domain zaten kayıtlı' });
    throw e;
  }
}));

router.get('/websites', wrap(async (req, res) => {
  const r = await pool.query(`SELECT ${PUBLIC_COLS} FROM websites ORDER BY created_at DESC`);
  res.json({ data: r.rows.map((w) => ({ ...w, snippet: snippet(w.id) })) });
}));

router.patch('/websites/:id', wrap(async (req, res) => {
  if (!sites.UUID_RE.test(req.params.id)) return res.status(404).json({ error: 'Bulunamadı' });
  const sets = []; const vals = [];
  for (const k of ['is_active', 'allow_subdomains', 'enforce_origin']) {
    if (typeof req.body[k] === 'boolean') { vals.push(req.body[k]); sets.push(`${k} = $${vals.length}`); }
  }
  if (req.body.name !== undefined) { const n = clean(req.body.name, 100); if (!n) return bad(res, 'name geçersiz'); vals.push(n); sets.push(`name = $${vals.length}`); }
  if (!sets.length) return bad(res, 'Güncellenecek alan yok');
  vals.push(req.params.id);
  const r = await pool.query(`UPDATE websites SET ${sets.join(', ')} WHERE id = $${vals.length} RETURNING ${PUBLIC_COLS}`, vals);
  if (!r.rowCount) return res.status(404).json({ error: 'Bulunamadı' });
  sites.invalidate(req.params.id);
  res.json(r.rows[0]);
}));

router.post('/websites/:id/rotate-token', wrap(async (req, res) => {
  if (!sites.UUID_RE.test(req.params.id)) return res.status(404).json({ error: 'Bulunamadı' });
  const token = crypto.randomBytes(32).toString('hex');
  const r = await pool.query('UPDATE websites SET read_token_hash = $1 WHERE id = $2 RETURNING id', [sha256(token), req.params.id]);
  if (!r.rowCount) return res.status(404).json({ error: 'Bulunamadı' });
  sites.invalidate(req.params.id);
  res.json({ read_token: token });
}));

router.delete('/websites/:id', wrap(async (req, res) => {
  if (!sites.UUID_RE.test(req.params.id)) return res.status(404).json({ error: 'Bulunamadı' });
  const r = await pool.query('DELETE FROM websites WHERE id = $1', [req.params.id]); // CASCADE: tüm veri silinir (silme hakkı)
  sites.invalidate(req.params.id);
  res.status(r.rowCount ? 204 : 404).end();
}));

router.get('/health', wrap(async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ ok: true, writer: writer.stats() });
}));

module.exports = router;
