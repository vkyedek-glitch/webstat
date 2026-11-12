'use strict';
const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30000,
  statement_timeout: 15000, // rapor sorguları kontrolsüz uzamasın
  application_name: 'analytics',
});
pool.on('error', (err) => console.error('[pg] idle client hatası:', err.message));

module.exports = pool;
