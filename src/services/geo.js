'use strict';
// Coğrafi konum: yer tutucu mimari. Üç kaynak sırayla denenir:
//  1) GEO_COUNTRY_HEADER (örn. CF-IPCountry) – yalnızca güvenilir CDN arkasında
//  2) GEOIP_DB (MaxMind GeoLite2-City .mmdb) – "npm i maxmind" gerekir (optionalDependency)
//  3) Hiçbiri yoksa null
// Ham IP yalnızca bu fonksiyon çağrısı süresince bellekte tutulur, asla saklanmaz.
const config = require('../config');

let reader = null;

async function init() {
  if (!config.geoipDb) return;
  try {
    const maxmind = require('maxmind');
    reader = await maxmind.open(config.geoipDb);
    console.log('[geo] MaxMind veritabanı yüklendi');
  } catch (e) {
    console.error('[geo] MaxMind yüklenemedi, coğrafi konum devre dışı:', e.message);
  }
}

function lookup(req) {
  let country = null;
  let city = null;
  if (config.geoCountryHeader) {
    const h = req.get(config.geoCountryHeader);
    if (h && /^[A-Za-z]{2}$/.test(h) && h.toUpperCase() !== 'XX' && h.toUpperCase() !== 'T1') country = h.toUpperCase();
  }
  if (!country && reader) {
    try {
      const r = reader.get(req.ip);
      if (r) {
        country = (r.country && r.country.iso_code) || null;
        city = (r.city && r.city.names && r.city.names.en) || null;
      }
    } catch (_) { /* geçersiz IP */ }
  }
  return { country, city };
}

module.exports = { init, lookup };
