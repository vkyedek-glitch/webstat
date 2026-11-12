'use strict';

const BOT_RE = /bot|crawl|spider|slurp|headless|phantom|puppeteer|playwright|selenium|lighthouse|pagespeed|gtmetrix|curl\/|wget|python-requests|python-urllib|aiohttp|httpclient|okhttp|axios|node-fetch|undici|go-http|java\/|libwww|scrapy|facebookexternalhit|preview|monitor|uptime|pingdom|statuscake/i;

const isBot = (ua) => BOT_RE.test(ua);

function parseBrowser(ua) {
  if (/Edg(e|A|iOS)?\//.test(ua)) return 'Edge';
  if (/OPR\/|Opera/.test(ua)) return 'Opera';
  if (/SamsungBrowser/.test(ua)) return 'Samsung Internet';
  if (/Firefox\/|FxiOS/.test(ua)) return 'Firefox';
  if (/Chrome\/|CriOS/.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua) && /Version\//.test(ua)) return 'Safari';
  if (/MSIE |Trident\//.test(ua)) return 'Internet Explorer';
  return 'Other';
}

function parseOs(ua, touchPoints) {
  if (/Windows/.test(ua)) return 'Windows';
  if (/Android/.test(ua)) return 'Android';
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
  if (/Macintosh|Mac OS X/.test(ua)) return touchPoints > 1 ? 'iOS' : 'macOS'; // iPadOS "masaüstü" UA gönderir
  if (/CrOS/.test(ua)) return 'ChromeOS';
  if (/Linux|X11/.test(ua)) return 'Linux';
  return 'Other';
}

function parseDevice(ua, os, touchPoints) {
  if (/iPad|Tablet|PlayBook|Silk/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))) return 'tablet';
  if (os === 'iOS' && /Macintosh/.test(ua)) return 'tablet';
  if (/Mobi|iPhone|iPod|Android/.test(ua)) return 'mobile';
  return 'desktop';
}

function parseUserAgent(ua, touchPoints = 0) {
  const os = parseOs(ua, touchPoints);
  return { browser: parseBrowser(ua), os, device: parseDevice(ua, os, touchPoints) };
}

module.exports = { isBot, parseUserAgent };
