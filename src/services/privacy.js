'use strict';
const net = require('net');
const crypto = require('crypto');

function normalizeIp(raw) {
  if (!raw) return '';
  let ip = String(raw).trim().split('%')[0];
  const m = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i); // IPv4-mapped IPv6
  if (m) ip = m[1];
  return ip;
}

function expandV6(ip) {
  if (ip.includes('::')) {
    const [head, tail] = ip.split('::');
    const h = head ? head.split(':') : [];
    const t = tail ? tail.split(':') : [];
    return [...h, ...Array(Math.max(0, 8 - h.length - t.length)).fill('0'), ...t];
  }
  return ip.split(':');
}

/** IPv4: son oktet sıfırlanır (1.2.3.xxx -> 1.2.3.0). IPv6: yalnızca ilk 48 bit kalır. */
function anonymizeIp(raw) {
  const ip = normalizeIp(raw);
  const v = net.isIP(ip);
  if (v === 4) { const p = ip.split('.'); p[3] = '0'; return p.join('.'); }
  if (v === 6) return expandV6(ip).slice(0, 3).join(':') + '::';
  return '';
}

/** Rate-limit anahtarı: IPv6'da bir kullanıcı tüm /64'ü kontrol eder. */
function rateKey(raw) {
  const ip = normalizeIp(raw);
  if (net.isIP(ip) === 6) return expandV6(ip).slice(0, 4).join(':');
  return ip || 'unknown';
}

/** Günlük tuzlu HMAC: IP ve UA saklanmaz, çıktı gün değişince korelasyon yapılamaz. */
function visitorHash(salt, siteId, anonIp, ua) {
  return crypto.createHmac('sha256', salt).update(`${siteId}|${anonIp}|${ua}`).digest('hex').slice(0, 32);
}

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

/** Kontrol karakterlerini (PostgreSQL'in reddettiği \u0000 dahil) temizler ve kırpar. */
function clean(s, max) {
  if (typeof s !== 'string') return null;
  const out = s.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
  return out || null;
}

module.exports = { anonymizeIp, rateKey, visitorHash, sha256, safeEqual, clean };
