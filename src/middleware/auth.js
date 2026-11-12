'use strict';
const crypto = require('crypto');
const config = require('../config');
const sites = require('../services/sites');
const { safeEqual, sha256 } = require('../services/privacy');

const DASHBOARD_SESSION_MS = 12 * 60 * 60 * 1000;
const MAX_DASHBOARD_SESSIONS = 10_000;
const dashboardSessions = new Map();

function bearer(req) {
  const h = req.get('authorization') || '';
  const m = h.match(/^Bearer\s+(\S{16,256})$/i);
  return m ? m[1] : null;
}

const deny = (res) => res.status(401).set('WWW-Authenticate', 'Bearer').json({ error: 'Yetkisiz' });

function hashCredential(value) {
  return crypto.createHash('sha256').update(value).digest();
}

function verifyDashboardCredentials(username, password) {
  if (typeof username !== 'string' || typeof password !== 'string' ||
      username.length > 128 || password.length > 1024) return false;
  const usernameMatches = crypto.timingSafeEqual(
    hashCredential(username),
    hashCredential(config.dashboardUsername)
  );
  const passwordMatches = crypto.timingSafeEqual(
    hashCredential(password),
    hashCredential(config.dashboardPassword)
  );
  return usernameMatches && passwordMatches;
}

function createDashboardSession() {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  for (const [hash, expiresAt] of dashboardSessions) {
    if (expiresAt <= now) dashboardSessions.delete(hash);
  }
  if (dashboardSessions.size >= MAX_DASHBOARD_SESSIONS) {
    const oldestHash = dashboardSessions.keys().next().value;
    dashboardSessions.delete(oldestHash);
  }
  dashboardSessions.set(sha256(token), now + DASHBOARD_SESSION_MS);
  return token;
}

function isDashboardSession(token) {
  const hash = sha256(token);
  const expiresAt = dashboardSessions.get(hash);
  if (!expiresAt) return false;
  if (expiresAt <= Date.now()) {
    dashboardSessions.delete(hash);
    return false;
  }
  return true;
}

function revokeDashboardSession(token) {
  return dashboardSessions.delete(sha256(token));
}

function requireAdmin(req, res, next) {
  const t = bearer(req);
  if (t && (safeEqual(t, config.adminToken) || isDashboardSession(t))) return next();
  return deny(res);
}

/** Admin credential/session (tüm siteler) veya ilgili sitenin read token'ı */
async function requireReader(req, res, next) {
  try {
    const t = bearer(req);
    if (!t) return deny(res);
    if (safeEqual(t, config.adminToken) || isDashboardSession(t)) return next();
    const site = await sites.get(req.params.siteId);
    if (site && safeEqual(sha256(t), site.read_token_hash)) return next();
    return deny(res); // site yok ve token yanlış aynı yanıtı verir (enumeration yok)
  } catch (e) { next(e); }
}

module.exports = {
  requireAdmin,
  requireReader,
  verifyDashboardCredentials,
  createDashboardSession,
  revokeDashboardSession,
};
