'use strict';
const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const config = require('./src/config');
config.assertRuntime();

const pool = require('./src/db');
const redis = require('./src/redis');
const writer = require('./src/services/writer');
const maintenance = require('./src/services/maintenance');
const geo = require('./src/services/geo');
const { createRateLimiter } = require('./src/middleware/rateLimit');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', config.trustProxy);

// CORP=cross-origin zorunlu: aksi halde başka sitelerden <script src="/track.js"> engellenir.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Rate limit en başta: gövde parse edilmeden/DB'ye gidilmeden önce kes.
const trackLimiter = createRateLimiter({ name: 'track', ...config.trackRate });
const apiLimiter = createRateLimiter({ name: 'api', ...config.apiRate });

// ---- Tracker betiği (bellekte, ETag + cache)
const trackerSrc = fs.readFileSync(path.join(__dirname, 'public', 'tracker.js'), 'utf8');
app.get('/track.js', (req, res) => {
  res.set({
    'Content-Type': 'application/javascript; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    'Access-Control-Allow-Origin': '*',
  }).send(trackerSrc);
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.use(express.static(path.join(__dirname, 'public'), { index: false, maxAge: 0 }));

// ---- Veri toplama (hafif yol)
app.use('/api/track', trackLimiter, require('./src/routes/track'));

// ---- Rapor + yönetim API'leri (JSON, kimlik doğrulamalı)
app.use('/api', (req, res, next) => {
  if (config.dashboardOrigin) {
    res.set({
      'Access-Control-Allow-Origin': config.dashboardOrigin,
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      Vary: 'Origin',
    });
    if (req.method === 'OPTIONS') return res.status(204).end();
  }
  next();
});
app.use('/api/stats', apiLimiter, express.json({ limit: '10kb' }), require('./src/routes/stats'));
app.use('/api/admin', apiLimiter, express.json({ limit: '10kb' }), require('./src/routes/admin'));

app.get('/health', async (req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true }); } catch (_) { res.status(503).json({ ok: false }); }
});

app.use((req, res) => res.status(404).json({ error: 'Bulunamadı' }));
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error('[error]', err);
  res.status(status).json({ error: status >= 500 ? 'Sunucu hatası' : (err.expose ? err.message : 'Geçersiz istek') });
});

async function main() {
  await geo.init();
  writer.start();
  maintenance.start();
  const server = app.listen(config.port, () => console.log(`Analytics ${config.port} portunda (${config.env})`));
  server.keepAliveTimeout = 65_000;

  let closing = false;
  const shutdown = async (sig) => {
    if (closing) return; closing = true;
    console.log(`${sig}: kapanıyor, kuyruk boşaltılıyor…`);
    server.close();
    await writer.stop();
    if (redis) redis.disconnect();
    await pool.end();
    process.exit(0);
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
main().catch((e) => { console.error(e); process.exit(1); });
