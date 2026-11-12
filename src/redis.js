'use strict';
const config = require('./config');

let client = null;
if (config.redisUrl) {
  const Redis = require('ioredis');
  client = new Redis(config.redisUrl, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false, // Redis düşerse istek bekletme; limiter belleğe düşer
    retryStrategy: (n) => Math.min(n * 500, 5000),
  });
  let lastLog = 0;
  client.on('error', (e) => {
    if (Date.now() - lastLog > 30000) { lastLog = Date.now(); console.error('[redis]', e.message); }
  });
}
module.exports = client;
