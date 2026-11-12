/*!
 * Self-hosted analytics tracker — bağımlılık yok, çerez yok, localStorage'a veri yazmaz.
 * Kullanım: <script defer src="https://analytics.sirketiniz.com/track.js" data-site-id="UUID"></script>
 *
 * data-* seçenekleri:
 *   data-site-id          (zorunlu)
 *   data-api              API uç noktasını elle belirle (varsayılan: betiğin kaynağı + /api/track)
 *   data-respect-dnt      "false" ise Do-Not-Track/GPC yok sayılır (sunucu RESPECT_DNT=true ise yine düşer)
 *   data-include-query    "true" ise ?sorgu kısmı da gönderilir (varsayılan: gönderilmez, PII riski)
 *   data-hash-mode        "true" ise #hash rotaları ayrı sayfa sayılır
 *   data-allow-localhost  "true" ise localhost'ta da çalışır
 *   data-heartbeat        ping aralığı saniye (varsayılan 15)
 * Olay API'si:  wsa('event', 'signup', {plan: 'pro'})   |   wsa('pageview')
 * Tıklama olayı: <button data-wsa-event="signup_click">
 * Kendini hariç tut: localStorage.setItem('wsa_ignore','1')
 */
(function (window, document) {
  'use strict';

  var script = document.currentScript;
  if (!script) return;
  var siteId = script.getAttribute('data-site-id');
  if (!siteId) return;

  var nav = window.navigator, loc = window.location, hist = window.history;
  var attr = function (n) { return script.getAttribute('data-' + n); };

  // ---- Çalışmama koşulları
  if (loc.protocol === 'file:') return;
  if (nav.webdriver) return;                                              // otomasyon / headless
  if (attr('allow-localhost') !== 'true' && /^(localhost|127\.0\.0\.1|\[?::1\]?)$/.test(loc.hostname)) return;
  if (attr('respect-dnt') !== 'false' &&
      (nav.doNotTrack === '1' || window.doNotTrack === '1' || nav.msDoNotTrack === '1' || nav.globalPrivacyControl === true)) return;
  try { if (window.localStorage.getItem('wsa_ignore') === '1') return; } catch (e) { /* storage kapalı */ }

  var endpoint = attr('api');
  if (!endpoint) {
    try { endpoint = new URL(script.src).origin + '/api/track'; } catch (e) { return; }
  }
  var includeQuery = attr('include-query') === 'true';
  var hashMode = attr('hash-mode') === 'true';
  var heartbeatMs = Math.max(5, parseInt(attr('heartbeat'), 10) || 15) * 1000;

  // ---- Yardımcılar
  function uuid() {
    var c = window.crypto;
    if (c && c.randomUUID) return c.randomUUID();
    var b = new Uint8Array(16);
    if (c && c.getRandomValues) c.getRandomValues(b); else for (var i = 0; i < 16; i++) b[i] = Math.random() * 256;
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var h = [].map.call(b, function (x) { return (x + 256).toString(16).slice(1); }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }

  // Yanıt beklenmez; sayfa kapanırken de gider (keepalive). fetch yoksa sendBeacon.
  function send(payload) {
    payload.s = siteId;
    var body = JSON.stringify(payload);
    try {
      if (window.fetch) {
        window.fetch(endpoint, {
          method: 'POST', body: body, keepalive: true, credentials: 'omit', mode: 'cors',
          headers: { 'Content-Type': 'text/plain' } // "simple request": preflight yok
        }).catch(function () {});
        return;
      }
    } catch (e) { /* düş */ }
    try { if (nav.sendBeacon) nav.sendBeacon(endpoint, new Blob([body], { type: 'text/plain' })); } catch (e) {}
  }

  function currentPath() {
    var p = loc.pathname + (includeQuery ? loc.search : '');
    return hashMode && loc.hash ? p + loc.hash : p;
  }

  function utmParams() {
    var out = null;
    try {
      var sp = new URLSearchParams(loc.search);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(function (k) {
        var v = sp.get(k); if (v) { out = out || {}; out[k] = v.slice(0, 100); }
      });
    } catch (e) {}
    return out;
  }

  // ---- Sayfada kalma süresi: yalnızca sekme görünürken (aktif) geçen süre
  var pid = null, lastPath = null, engaged = 0, visibleSince = 0, lastSent = 0, timer = null;
  var now = function () { return Date.now(); };
  function engagedSeconds() {
    var t = engaged + (visibleSince ? now() - visibleSince : 0);
    return Math.min(Math.round(t / 1000), 4 * 3600);
  }
  function ping() {
    if (!pid) return;
    var d = engagedSeconds();
    if (d > lastSent) { lastSent = d; send({ t: 'ping', p: pid, d: d }); }
  }
  function startTimer() { stopTimer(); timer = setInterval(function () { if (visibleSince) ping(); }, heartbeatMs); }
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

  function onVisibility() {
    if (document.visibilityState === 'hidden') {
      if (visibleSince) { engaged += now() - visibleSince; visibleSince = 0; }
      ping(); stopTimer();
    } else if (!visibleSince) {
      visibleSince = now(); startTimer();
    }
  }

  // ---- Sayfa görüntüleme
  var first = true;
  function pageview() {
    var path = currentPath();
    if (path === lastPath) return;       // aynı rota tekrarını yut (replaceState vb.)
    ping();                              // önceki sayfanın süresini kapat (SPA)
    lastPath = path;
    pid = uuid(); engaged = 0; lastSent = 0;
    visibleSince = document.visibilityState === 'visible' ? now() : 0;
    var payload = {
      t: 'pv', p: pid, u: path, ti: document.title || '',
      r: first ? document.referrer : '', w: window.screen ? window.screen.width : 0, mt: nav.maxTouchPoints || 0
    };
    var q = utmParams(); if (q) payload.q = q;
    first = false;
    send(payload);
    if (visibleSince) startTimer();
  }

  function track(name, props) {
    if (typeof name !== 'string' || !name) return;
    send({ t: 'ev', n: name, pr: props || undefined, u: currentPath(), w: window.screen ? window.screen.width : 0, mt: nav.maxTouchPoints || 0 });
  }

  // ---- SPA desteği
  if (hist && hist.pushState) {
    var orig = hist.pushState;
    hist.pushState = function () { var r = orig.apply(this, arguments); setTimeout(pageview, 0); return r; };
    window.addEventListener('popstate', function () { setTimeout(pageview, 0); });
  }
  if (hashMode) window.addEventListener('hashchange', function () { setTimeout(pageview, 0); });

  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', function () { if (visibleSince) { engaged += now() - visibleSince; visibleSince = 0; } ping(); });

  // data-wsa-event="isim" → tıklamada olay gönder
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-wsa-event]') : null;
    if (el) track(el.getAttribute('data-wsa-event'));
  }, true);

  // ---- Genel API (betik yüklenmeden önce yapılan çağrılar kuyruktan boşaltılır)
  var queued = (window.wsa && window.wsa.q) || [];
  function api(cmd, a, b) {
    if (cmd === 'event') track(a, b);
    else if (cmd === 'pageview') { lastPath = null; pageview(); }
  }
  api.track = track; api.pageview = function () { lastPath = null; pageview(); };
  window.wsa = api;

  // Ana iş parçacığını meşgul etmemek için ilk gönderim boşta zamanına ertelenir.
  var kick = function () { pageview(); queued.forEach(function (a) { api.apply(null, a); }); };
  if (window.requestIdleCallback) window.requestIdleCallback(kick, { timeout: 2000 }); else setTimeout(kick, 0);
})(window, document);
