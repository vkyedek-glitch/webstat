'use strict';
const redis = require('../redis');
const { rateKey } = require('../services/privacy');

const LUA = `local n = redis.call('INCR', KEYS[1])
if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return n`;

/** Sabit pencere, IP başına limit. Redis varsa paylaşımlı; yoksa/çökerse bellek içi (fail-open değil, yerel). */
function createRateLimiter({ name, windowS, max }) {
  const mem = new Map();
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of mem) if (v.reset <= now) mem.delete(k);
  }, 30_000);
  sweep.unref();

  return async function rateLimit(req, res, next) {
    const key = rateKey(req.ip);
    let count;
    if (redis && redis.status === 'ready') {
      try { count = await redis.eval(LUA, 1, `rl:${name}:${key}`, windowS); } catch (_) { count = undefined; }
    }
    if (count === undefined) {
      const now = Date.now();
      let e = mem.get(key);
      if (!e || e.reset <= now) { e = { count: 0, reset: now + windowS * 1000 }; mem.set(key, e); }
      count = ++e.count;
    }
    if (count > max) {
      res.set('Retry-After', String(windowS));
      return res.status(429).end();
    }
    next();
  };
}

module.exports = { createRateLimiter };
