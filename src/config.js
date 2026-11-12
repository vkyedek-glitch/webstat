'use strict';
require('dotenv').config();

const int = (v, d) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : d; };
const bool = (v, d) => (v === undefined || v === '' ? d : ['1', 'true', 'yes'].includes(String(v).toLowerCase()));

function parseTrustProxy(v) {
  if (v === undefined || v === '') return 1;
  if (/^\d+$/.test(v)) return Number(v);
  if (v === 'false') return false;
  if (v === 'true') throw new Error('TRUST_PROXY=true güvensizdir (XFF sahteciliği). Hop sayısı verin: 1');
  return v; // "loopback", "10.0.0.0/8" vb.
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: int(process.env.PORT, 3000),
  publicUrl: (process.env.PUBLIC_URL || `http://localhost:${int(process.env.PORT, 3000)}`).replace(/\/$/, ''),
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL || '',
  adminToken: process.env.ADMIN_TOKEN || '',
  dashboardUsername: process.env.DASHBOARD_USERNAME || '',
  dashboardPassword: process.env.DASHBOARD_PASSWORD || '',
  settingsEncryptionKey: process.env.SETTINGS_ENCRYPTION_KEY || '',
  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
  dashboardOrigin: process.env.DASHBOARD_ORIGIN || '',
  respectDnt: bool(process.env.RESPECT_DNT, true),
  sessionTimeoutMin: int(process.env.SESSION_TIMEOUT_MIN, 30),
  retentionDays: int(process.env.RETENTION_DAYS, 365),
  trackRate: { windowS: int(process.env.TRACK_RATE_WINDOW_S, 10), max: int(process.env.TRACK_RATE_MAX, 60) },
  apiRate: { windowS: int(process.env.API_RATE_WINDOW_S, 60), max: int(process.env.API_RATE_MAX, 120) },
  batchSize: int(process.env.BATCH_SIZE, 500),
  flushIntervalMs: int(process.env.FLUSH_INTERVAL_MS, 1000),
  maxQueue: int(process.env.MAX_QUEUE, 50000),
  geoipDb: process.env.GEOIP_DB || '',
  geoCountryHeader: (process.env.GEO_COUNTRY_HEADER || '').toLowerCase(),
};

config.assertRuntime = () => {
  if (!config.databaseUrl) throw new Error('DATABASE_URL tanımlı değil');
  if (config.adminToken.length < 32) throw new Error('ADMIN_TOKEN en az 32 karakter olmalı (openssl rand -hex 32)');
  if (!config.dashboardUsername || config.dashboardUsername.length > 128) throw new Error('DASHBOARD_USERNAME 1-128 karakter olmalı');
  if (config.dashboardPassword.length < 12) throw new Error('DASHBOARD_PASSWORD en az 12 karakter olmalı');
  if (!/^[0-9a-f]{64}$/i.test(config.settingsEncryptionKey)) throw new Error('SETTINGS_ENCRYPTION_KEY 64 karakterlik hex anahtar olmalı (openssl rand -hex 32)');
};

module.exports = config;
