'use strict';

const translations = {
  en: {
    privateAnalytics: 'PRIVATE ANALYTICS', welcome: 'Welcome to Webstat',
    loginDescription: 'Sign in with your username and password to manage sites and view reports.',
    username: 'Username', password: 'Password', signIn: 'Sign in', workspace: 'WORKSPACE',
    selectSite: 'Select site', addWebsite: 'Add website', overview: 'Overview',
    pages: 'Pages', audience: 'Audience', events: 'Events', connected: 'Connected', websites: 'Websites',
    traffic: 'Traffic', sources: 'Sources', exportReport: 'Export report',
    notifications: 'Notifications', systemStatus: 'System status', databaseStatus: 'Database',
    queueLength: 'Write queue', cachedSessions: 'Cached sessions',
    statusHealthy: 'Operational', statusUnavailable: 'Unavailable',
    systemStatusDescription: 'Database and event writer health',
    signOut: 'Sign out', analytics: 'Analytics', last7: 'Last 7 days',
    last30: 'Last 30 days', last90: 'Last 90 days', refresh: 'Refresh',
    noSitesTitle: 'Start measuring your website',
    noSitesDescription: 'Add your first website to get a tracking snippet and see analytics here.',
    addFirstWebsite: 'Add your first website', visitors: 'Visitors', pageviews: 'Pageviews',
    sessions: 'Sessions', bounceRate: 'Bounce rate', avgDuration: 'Avg. session duration',
    dailyUnique: 'Daily unique visitors', totalPageviews: 'Total pageviews',
    totalSessions: 'Total sessions', singlePageSessions: 'Single-page sessions',
    timePerSession: 'Time per session', trafficOverTime: 'Traffic over time',
    pageviewsVisitors: 'Pageviews and visitors', noTraffic: 'No traffic data for this period',
    realtime: 'Realtime', last5Minutes: 'Last 5 minutes', live: 'LIVE',
    activeVisitors: 'Active visitors', topPagesNow: 'Top pages right now',
    topPages: 'Top pages', mostViewedPages: 'Most viewed pages in this period',
    sessionsBySource: 'Sessions by source', devices: 'Devices', countries: 'Countries',
    activityHeatmap: 'Weekly activity', activityHeatmapDescription: 'Pageviews by weekday and hour',
    recentActivity: 'Recent activity', recentActivityDescription: 'Latest recorded pageviews',
    trafficSources: 'Traffic sources', trafficSourcesDescription: 'How visitors reached this website',
    conversionFunnel: 'Conversion funnel', conversionFunnelDescription: 'Visitor journey in the selected period',
    landingPages: 'Landing pages', landingPagesDescription: 'First page recorded for each session',
    exitPages: 'Exit pages', exitPagesDescription: 'Last page recorded for each session',
    totalVisitors: 'Total visitors', newVisitors: 'New visitors', returningVisitors: 'Returning visitors',
    geography: 'Geography', visitorsByCountry: 'Visitors by country',
    deviceBreakdown: 'Device breakdown', visitorsByDevice: 'Visitors by device type',
    visitorList: 'Visitor list', visitorListDescription: 'Anonymized visitor activity in the selected period',
    visitorSearch: 'Search visitor, city, country or page', visitor: 'Visitor', type: 'Type',
    location: 'Location', device: 'Device', lastPage: 'Last page', lastVisit: 'Last visit',
    privacyNote: 'Visitor identifiers rotate daily for privacy. Returning visitors only count repeat sessions within the same daily identity window.',
    totalPages: 'Total pages', pagePerformance: 'Page performance',
    pagePerformanceDescription: 'Views, visitors, time on page and session outcomes',
    entrances: 'Entrances', exits: 'Exits', searchTraffic: 'Search', socialTraffic: 'Social',
    directTraffic: 'Direct', referralTraffic: 'Referral', sourceDetails: 'Source details',
    sourceDetailsDescription: 'Referrer domains and attributed visits', campaignTerms: 'Campaign terms',
    campaignTermsDescription: 'Search or campaign terms provided as UTM parameters',
    unknown: 'Unknown', newVisitor: 'New', returningVisitor: 'Returning',
    visitorsStage: 'Unique visitors', sessionsStage: 'Sessions', pageviewsStage: 'Pageviews',
    engagedSessionsStage: 'Engaged sessions', eventSessionsStage: 'Sessions with events',
    topEvents: 'Top events', customEventsCollected: 'Custom events collected during this period',
    siteSettings: 'Website settings', siteSettingsDescription: 'Manage tracking and access for this website',
    rotateToken: 'Rotate read token', deleteWebsite: 'Delete website', domain: 'Domain',
    trackingStatus: 'Tracking status', created: 'Created', trackingSnippet: 'Tracking snippet',
    snippetDescription: 'Add this snippet inside the <head> of your website.',
    copy: 'Copy', privacyFirst: 'Privacy-first analytics', systemHealth: 'System health',
    websiteName: 'Website name', allowSubdomains: 'Allow subdomains',
    enforceOrigin: 'Validate request origin', cancel: 'Cancel',
    createWebsite: 'Create website', important: 'IMPORTANT', saveToken: 'Save your read token',
    tokenWarning: 'This token is shown only once. Store it securely before closing this window.',
    done: 'Done', enabled: 'Enabled', disabled: 'Disabled', activate: 'Activate',
    deactivate: 'Deactivate', views: 'Views', avgTime: 'Avg. time', source: 'Source',
    count: 'Count', event: 'Event',     total: 'Total', visitorsColumn: 'Visitors', less: 'Less', more: 'More',
    noData: 'No data for this period', noEvents: 'No custom events yet',
    noRealtimePages: 'No pageviews in the last 5 minutes', direct: '(direct)',
    loginFailed: 'Sign-in failed. Check your username and password.',
    loadFailed: 'Could not load dashboard data. Please try again.',
    createFailed: 'Could not create website.', websiteCreated: 'Website created successfully.',
    tokenRotated: 'Read token rotated. The old token no longer works.',
    tokenRotateConfirm: 'Rotate this site’s read token? Existing integrations using it will stop working.',
    deleteConfirm: 'Delete this website and permanently delete all of its analytics data?',
    deleteFailed: 'Could not delete website.', siteDeleted: 'Website and its data deleted.',
    updateFailed: 'Could not update website.', copied: 'Copied to clipboard.',
    copyFailed: 'Could not copy. Please select and copy manually.',
    allSites: 'All websites', dateLocale: 'en-US', minutes: 'm', seconds: 's',
    statusError: 'The service returned an error. Check the server logs.',
    signOutConfirm: 'Sign out of Webstat?', refreshed: 'Dashboard refreshed.',
    systemSettings: 'System settings', systemSettingsDescription: 'Configure your public URL, mail server, and email alerts.',
    publicAddress: 'Public address', publicAddressHelp: 'Used to create tracking snippets. Existing website snippets are not changed.',
    publicUrl: 'Public URL', emailServer: 'Email server (SMTP)', smtpHost: 'SMTP host',
    smtpPort: 'Port', smtpUser: 'Username', smtpPassword: 'Password', smtpFrom: 'Sender email',
    alertRecipient: 'Alert recipient', smtpSecure: 'Use implicit TLS (usually port 465)',
    clearSmtpPassword: 'Clear saved SMTP password', emailAlerts: 'Email alerts',
    dailyReport: 'Daily analytics report (UTC)', weeklyReport: 'Weekly analytics report (Monday, UTC)',
    queueErrors: 'Database write failures (at most once per 30 minutes)',
    databaseHealthAlerts: 'Database unavailable / recovered',
    encryptionNote: 'SMTP password is encrypted in the database with the server-only SETTINGS_ENCRYPTION_KEY.',
    sendTestEmail: 'Send test email', saveSettings: 'Save settings', savedSettings: 'Settings saved.',
    settingsLoadFailed: 'Could not load system settings.', testEmailSent: 'Test email sent.',
    hasSmtpPassword: 'A SMTP password is saved. Leave the password field empty to keep it.',
    noSmtpPassword: 'No SMTP password saved.', settingsTestFirst: 'Save settings first, then send a test email.'
  },
  tr: {
    privateAnalytics: 'GİZLİLİK ODAKLI ANALİTİK', welcome: "Webstat'a hoş geldiniz",
    loginDescription: 'Siteleri yönetmek ve raporları görmek için kullanıcı adı ve şifrenizle giriş yapın.',
    username: 'Kullanıcı adı', password: 'Şifre', signIn: 'Giriş yap', workspace: 'ÇALIŞMA ALANI',
    selectSite: 'Site seçin', addWebsite: 'Site ekle', overview: 'Genel bakış',
    pages: 'Sayfalar', audience: 'Ziyaretçiler', events: 'Olaylar', connected: 'Bağlı', websites: 'Web Siteleri',
    traffic: 'Trafik', sources: 'Kaynaklar', exportReport: 'Raporu dışa aktar',
    notifications: 'Bildirimler', systemStatus: 'Sistem durumu', databaseStatus: 'Veritabanı',
    queueLength: 'Yazma kuyruğu', cachedSessions: 'Önbellekteki oturumlar',
    statusHealthy: 'Çalışıyor', statusUnavailable: 'Erişilemiyor',
    systemStatusDescription: 'Veritabanı ve olay yazıcısı sağlığı',
    signOut: 'Çıkış yap', analytics: 'Analitik', last7: 'Son 7 gün',
    last30: 'Son 30 gün', last90: 'Son 90 gün', refresh: 'Yenile',
    noSitesTitle: 'Sitenizin trafiğini ölçmeye başlayın',
    noSitesDescription: 'İzleme kodunu almak ve analizleri görmek için ilk sitenizi ekleyin.',
    addFirstWebsite: 'İlk siteyi ekle', visitors: 'Ziyaretçiler', pageviews: 'Sayfa görüntüleme',
    sessions: 'Oturumlar', bounceRate: 'Hemen çıkma oranı', avgDuration: 'Ort. oturum süresi',
    dailyUnique: 'Günlük tekil ziyaretçiler', totalPageviews: 'Toplam sayfa görüntüleme',
    totalSessions: 'Toplam oturum', singlePageSessions: 'Tek sayfalı oturumlar',
    timePerSession: 'Oturum başına süre', trafficOverTime: 'Zaman içindeki trafik',
    pageviewsVisitors: 'Sayfa görüntüleme ve ziyaretçiler', noTraffic: 'Bu aralıkta trafik verisi yok',
    realtime: 'Anlık', last5Minutes: 'Son 5 dakika', live: 'CANLI',
    activeVisitors: 'Aktif ziyaretçiler', topPagesNow: 'Şu an en çok görüntülenen sayfalar',
    topPages: 'En çok görüntülenen sayfalar', mostViewedPages: 'Bu aralıkta en çok görüntülenen sayfalar',
    sessionsBySource: 'Kaynağa göre oturumlar', devices: 'Cihazlar', countries: 'Ülkeler',
    activityHeatmap: 'Haftalık aktivite', activityHeatmapDescription: 'Gün ve saate göre sayfa görüntüleme',
    recentActivity: 'Son aktiviteler', recentActivityDescription: 'Son kaydedilen sayfa görüntülemeleri',
    trafficSources: 'Trafik kaynakları', trafficSourcesDescription: 'Ziyaretçiler bu siteye nereden geldi',
    conversionFunnel: 'Dönüşüm hunisi', conversionFunnelDescription: 'Seçilen dönemdeki ziyaretçi yolculuğu',
    landingPages: 'Giriş sayfaları', landingPagesDescription: 'Oturum başına kaydedilen ilk sayfa',
    exitPages: 'Çıkış sayfaları', exitPagesDescription: 'Oturum başına kaydedilen son sayfa',
    totalVisitors: 'Toplam ziyaretçi', newVisitors: 'Yeni ziyaretçi', returningVisitors: 'Geri dönen ziyaretçi',
    geography: 'Coğrafi dağılım', visitorsByCountry: 'Ülkeye göre ziyaretçiler',
    deviceBreakdown: 'Cihaz dağılımı', visitorsByDevice: 'Cihaz türüne göre ziyaretçiler',
    visitorList: 'Ziyaretçi listesi', visitorListDescription: 'Seçili dönemdeki anonim ziyaretçi aktiviteleri',
    visitorSearch: 'Ziyaretçi, şehir, ülke veya sayfada ara', visitor: 'Ziyaretçi', type: 'Tür',
    location: 'Konum', device: 'Cihaz', lastPage: 'Son sayfa', lastVisit: 'Son ziyaret',
    privacyNote: 'Gizlilik için ziyaretçi kimlikleri her gün yenilenir. Geri dönen ziyaretçiler yalnızca aynı günlük kimlik penceresindeki tekrar oturumları kapsar.',
    totalPages: 'Toplam sayfa', pagePerformance: 'Sayfa performansı',
    pagePerformanceDescription: 'Görüntüleme, ziyaretçi, sayfada kalma ve oturum sonuçları',
    entrances: 'Giriş', exits: 'Çıkış', searchTraffic: 'Arama', socialTraffic: 'Sosyal',
    directTraffic: 'Doğrudan', referralTraffic: 'Yönlendirme', sourceDetails: 'Kaynak detayları',
    sourceDetailsDescription: 'Yönlendiren alan adları ve ilişkilendirilen ziyaretler', campaignTerms: 'Kampanya terimleri',
    campaignTermsDescription: 'UTM parametreleriyle iletilen arama veya kampanya terimleri',
    unknown: 'Bilinmiyor', newVisitor: 'Yeni', returningVisitor: 'Geri dönen',
    visitorsStage: 'Tekil ziyaretçi', sessionsStage: 'Oturum', pageviewsStage: 'Sayfa görüntüleme',
    engagedSessionsStage: 'Etkileşimli oturum', eventSessionsStage: 'Olay içeren oturum',
    topEvents: 'Öne çıkan olaylar', customEventsCollected: 'Bu aralıkta kaydedilen özel olaylar',
    siteSettings: 'Site ayarları', siteSettingsDescription: 'Bu site için izleme ve erişim ayarlarını yönetin',
    rotateToken: 'Okuma token’ını yenile', deleteWebsite: 'Siteyi sil', domain: 'Alan adı',
    trackingStatus: 'İzleme durumu', created: 'Oluşturulma', trackingSnippet: 'İzleme kodu',
    snippetDescription: 'Bu kodu sitenizin <head> bölümüne ekleyin.',
    copy: 'Kopyala', privacyFirst: 'Gizlilik odaklı analitik', systemHealth: 'Sistem durumu',
    websiteName: 'Site adı', allowSubdomains: 'Alt alan adlarına izin ver',
    enforceOrigin: 'İstek kaynağını doğrula', cancel: 'İptal',
    createWebsite: 'Siteyi oluştur', important: 'ÖNEMLİ', saveToken: 'Okuma token’ınızı kaydedin',
    tokenWarning: 'Bu token yalnızca bir kez gösterilir. Pencereyi kapatmadan güvenli bir yere kaydedin.',
    done: 'Tamam', enabled: 'Etkin', disabled: 'Devre dışı', activate: 'Etkinleştir',
    deactivate: 'Devre dışı bırak', views: 'Görüntüleme', avgTime: 'Ort. süre', source: 'Kaynak',
    count: 'Sayı', event: 'Olay', total: 'Toplam', visitorsColumn: 'Ziyaretçi', less: 'Az', more: 'Çok',
    noData: 'Bu aralıkta veri yok', noEvents: 'Henüz özel olay yok',
    noRealtimePages: 'Son 5 dakikada sayfa görüntüleme yok', direct: '(doğrudan)',
    loginFailed: 'Giriş başarısız. Kullanıcı adı ve şifrenizi kontrol edin.',
    loadFailed: 'Dashboard verileri yüklenemedi. Lütfen tekrar deneyin.',
    createFailed: 'Site oluşturulamadı.', websiteCreated: 'Site başarıyla oluşturuldu.',
    tokenRotated: 'Okuma token’ı yenilendi. Eski token artık çalışmıyor.',
    tokenRotateConfirm: 'Bu sitenin okuma token’ı yenilensin mi? Eski token’ı kullanan entegrasyonlar durur.',
    deleteConfirm: 'Bu site ve tüm analitik verileri kalıcı olarak silinsin mi?',
    deleteFailed: 'Site silinemedi.', siteDeleted: 'Site ve verileri silindi.',
    updateFailed: 'Site güncellenemedi.', copied: 'Panoya kopyalandı.',
    copyFailed: 'Kopyalanamadı. Lütfen seçip elle kopyalayın.',
    allSites: 'Tüm siteler', dateLocale: 'tr-TR', minutes: 'dk', seconds: 'sn',
    statusError: 'Sunucu hata döndürdü. Sunucu kayıtlarını kontrol edin.',
    signOutConfirm: 'Webstat oturumundan çıkılsın mı?', refreshed: 'Dashboard yenilendi.',
    systemSettings: 'Sistem ayarları', systemSettingsDescription: 'Genel URL, e-posta sunucusu ve e-posta uyarılarını ayarlayın.',
    publicAddress: 'Genel adres', publicAddressHelp: 'İzleme kodlarının adresini belirler. Var olan site kodları otomatik değişmez.',
    publicUrl: 'Genel URL', emailServer: 'E-posta sunucusu (SMTP)', smtpHost: 'SMTP sunucusu',
    smtpPort: 'Port', smtpUser: 'Kullanıcı adı', smtpPassword: 'Şifre', smtpFrom: 'Gönderici e-posta',
    alertRecipient: 'Uyarı alıcısı', smtpSecure: 'Implicit TLS kullan (genellikle 465 portu)',
    clearSmtpPassword: 'Kayıtlı SMTP şifresini sil', emailAlerts: 'E-posta uyarıları',
    dailyReport: 'Günlük analitik raporu (UTC)', weeklyReport: 'Haftalık analitik raporu (Pazartesi, UTC)',
    queueErrors: 'Veritabanı yazma hataları (en fazla 30 dakikada bir)',
    databaseHealthAlerts: 'Veritabanı erişilemez / yeniden erişilebilir',
    encryptionNote: 'SMTP şifresi, yalnızca sunucuda bulunan SETTINGS_ENCRYPTION_KEY ile veritabanında şifrelenir.',
    sendTestEmail: 'Test e-postası gönder', saveSettings: 'Ayarları kaydet', savedSettings: 'Ayarlar kaydedildi.',
    settingsLoadFailed: 'Sistem ayarları yüklenemedi.', testEmailSent: 'Test e-postası gönderildi.',
    hasSmtpPassword: 'SMTP şifresi kayıtlı. Saklı şifreyi korumak için bu alanı boş bırakın.',
    noSmtpPassword: 'Kayıtlı SMTP şifresi yok.', settingsTestFirst: 'Önce ayarları kaydedin, ardından test e-postası gönderin.'
  }
};

const SESSION_KEY = 'webstat-dashboard-session';
const state = {
  token: sessionStorage.getItem(SESSION_KEY) || '', sites: [], siteId: '',
  language: localStorage.getItem('webstat-language') || 'tr', chartData: [],
  pages: [], audience: null, traffic: null, events: [], activeView: 'overview'
};
const $ = (selector) => document.querySelector(selector);
const t = (key) => translations[state.language][key] || translations.en[key] || key;
const dateLocale = () => t('dateLocale');
let realtimeTimer;
let visitorSearchTimer;

function applyLanguage() {
  document.documentElement.lang = state.language;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  document.querySelectorAll('[data-language-toggle]').forEach((el) => { el.textContent = state.language === 'tr' ? 'EN' : 'Türkçe'; });
  document.title = state.language === 'tr' ? 'Webstat | Analitik' : 'Webstat | Analytics';
  renderSiteDetails();
  renderChart(state.chartData);
  if (state.siteId) refreshData().catch(showError);
}

function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${state.token}`);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return fetch(path, { ...options, headers }).then(async (response) => {
    if (response.status === 401) {
      sessionStorage.removeItem(SESSION_KEY);
      state.token = '';
      showLogin(t('loginFailed'));
      throw new Error(t('loginFailed'));
    }
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || t('statusError'));
    }
    return response.status === 204 ? null : response.json();
  });
}

function showLogin(error = '') {
  clearInterval(realtimeTimer);
  $('#login-screen').classList.remove('hidden');
  $('#app').classList.add('hidden');
  $('#login-error').textContent = error;
}

function showApp() {
  $('#login-screen').classList.add('hidden');
  $('#app').classList.remove('hidden');
}

function notify(message, type = 'success') {
  const box = $('#notice');
  box.textContent = message;
  box.className = `notice ${type === 'error' ? 'error-notice' : ''}`;
  window.setTimeout(() => box.classList.add('hidden'), 5000);
}

function showError(error) {
  notify(error.message || t('loadFailed'), 'error');
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString(dateLocale());
}

function formatDuration(value) {
  const seconds = Math.max(0, Math.round(Number(value) || 0));
  if (seconds < 60) return `${seconds}${t('seconds')}`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder ? `${minutes}${t('minutes')} ${remainder}${t('seconds')}` : `${minutes}${t('minutes')}`;
}

function dateQuery() {
  const end = new Date();
  const start = new Date(end.getTime() - Number($('#date-range').value || 7) * 86_400_000);
  return `from=${encodeURIComponent(start.toISOString())}&to=${encodeURIComponent(end.toISOString())}`;
}

function renderSiteList() {
  const select = $('#site-select');
  select.replaceChildren();
  if (!state.sites.length) return;
  state.sites.forEach((site) => {
    const option = document.createElement('option');
    option.value = site.id;
    option.textContent = `${site.name} · ${site.domain_name}`;
    select.append(option);
  });
  if (!state.sites.some((site) => site.id === state.siteId)) state.siteId = state.sites[0].id;
  select.value = state.siteId;
  renderSiteDetails();
}

function currentSite() {
  return state.sites.find((site) => site.id === state.siteId) || null;
}

function renderSiteDetails() {
  const site = currentSite();
  if (!site) return;
  $('#breadcrumb-site').textContent = site.name;
  $('#site-domain').textContent = site.domain_name;
  $('#site-status').textContent = site.is_active ? t('enabled') : t('disabled');
  $('#site-created').textContent = new Intl.DateTimeFormat(dateLocale(), { dateStyle: 'medium' }).format(new Date(site.created_at));
  $('#snippet-code').textContent = site.snippet || `<script defer src="${location.origin}/track.js" data-site-id="${site.id}"></script>`;
  const toggle = $('#toggle-site');
  toggle.textContent = site.is_active ? t('deactivate') : t('activate');
  toggle.dataset.active = String(site.is_active);
}

function updateSettingsForm(settings) {
  $('#setting-public-url').value = settings.publicUrl || '';
  $('#setting-smtp-host').value = settings.smtpHost || '';
  $('#setting-smtp-port').value = settings.smtpPort || 587;
  $('#setting-smtp-secure').checked = settings.smtpSecure === true;
  $('#setting-smtp-user').value = settings.smtpUser || '';
  $('#setting-smtp-password').value = '';
  $('#setting-smtp-from').value = settings.smtpFrom || '';
  $('#setting-alert-email').value = settings.alertEmail || '';
  $('#setting-alert-daily').checked = settings.alertDaily === true;
  $('#setting-alert-weekly').checked = settings.alertWeekly === true;
  $('#setting-alert-queue').checked = settings.alertQueueErrors === true;
  $('#setting-alert-health').checked = settings.alertServiceHealth === true;
  $('#setting-clear-smtp-password').checked = false;
  $('#smtp-password-status').textContent = t(settings.hasSmtpPassword ? 'hasSmtpPassword' : 'noSmtpPassword');
}

async function loadSystemSettings() {
  const settings = await api('/api/admin/settings');
  updateSettingsForm(settings);
}

function settingsPayload() {
  return {
    publicUrl: $('#setting-public-url').value.trim(),
    smtpHost: $('#setting-smtp-host').value.trim(),
    smtpPort: Number($('#setting-smtp-port').value),
    smtpSecure: $('#setting-smtp-secure').checked,
    smtpUser: $('#setting-smtp-user').value.trim(),
    smtpPassword: $('#setting-smtp-password').value,
    clearSmtpPassword: $('#setting-clear-smtp-password').checked,
    smtpFrom: $('#setting-smtp-from').value.trim(),
    alertEmail: $('#setting-alert-email').value.trim(),
    alertDaily: $('#setting-alert-daily').checked,
    alertWeekly: $('#setting-alert-weekly').checked,
    alertQueueErrors: $('#setting-alert-queue').checked,
    alertServiceHealth: $('#setting-alert-health').checked
  };
}

async function saveSystemSettings({ sendTest = false } = {}) {
  const message = $('#settings-message');
  message.textContent = '';
  message.classList.remove('error');
  try {
    const saved = await api('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsPayload())
    });
    updateSettingsForm(saved);
    state.sites = state.sites.map((site) => ({
      ...site,
      snippet: `<script defer src="${saved.publicUrl}/track.js" data-site-id="${site.id}"></script>`
    }));
    renderSiteDetails();
    if (sendTest) {
      await api('/api/admin/settings/test-email', { method: 'POST' });
      message.textContent = t('testEmailSent');
    } else {
      message.textContent = t('savedSettings');
    }
  } catch (error) {
    message.textContent = error.message || t('settingsLoadFailed');
    message.classList.add('error');
  }
}

function setNoSites(isEmpty) {
  $('#no-sites').classList.toggle('hidden', !isEmpty);
  $('#dashboard-content').classList.remove('hidden');
  $('#websites-view .site-settings').classList.toggle('hidden', isEmpty);
  setActiveView(isEmpty ? 'settings' : state.activeView);
}

async function loadSites() {
  const result = await api('/api/admin/websites');
  state.sites = result.data;
  renderSiteList();
  setNoSites(state.sites.length === 0);
}

async function refreshData() {
  if (!state.siteId) return;
  const id = encodeURIComponent(state.siteId);
  const range = dateQuery();
  const tz = encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const search = encodeURIComponent($('#visitor-search')?.value.trim() || '');
  const requests = [
    api(`/api/stats/${id}/overview?${range}`),
    api(`/api/stats/${id}/timeseries?${range}&tz=${tz}`),
    api(`/api/stats/${id}/pages?${range}&limit=100`),
    api(`/api/stats/${id}/breakdown/referrer?${range}&limit=6`),
    api(`/api/stats/${id}/breakdown/device?${range}&limit=5`),
    api(`/api/stats/${id}/breakdown/country?${range}&limit=5`),
    api(`/api/stats/${id}/events?${range}&limit=10`),
    api(`/api/stats/${id}/realtime`),
    api(`/api/stats/${id}/heatmap?${range}&tz=${tz}`),
    api(`/api/stats/${id}/audience?${range}&limit=100${search ? `&q=${search}` : ''}`),
    api(`/api/stats/${id}/traffic?${range}&limit=10`)
  ];
  const results = await Promise.allSettled(requests);
  const failed = results.find((result) => result.status === 'rejected');
  if (failed) throw failed.reason;
  const [overview, timeseries, pages, sources, devices, countries, events, realtime, heatmap, audience, traffic] =
    results.map((result) => result.value);
  $('#metric-visitors').textContent = formatNumber(overview.visitors);
  $('#metric-pageviews').textContent = formatNumber(overview.pageviews);
  $('#metric-sessions').textContent = formatNumber(overview.sessions);
  $('#metric-bounce').textContent = Number(overview.bounce_rate || 0).toLocaleString(dateLocale(), { maximumFractionDigits: 1 });
  $('#metric-duration').textContent = formatDuration(overview.avg_session_seconds);
  state.chartData = timeseries.data || [];
  state.pages = pages.data || [];
  state.audience = audience;
  state.traffic = traffic;
  state.events = events.data || [];
  renderChart(state.chartData);
  renderPages(state.pages.slice(0, 10));
  renderDetailedPages(state.pages, pages.totalPages || 0, overview);
  renderRanks('#sources-list', sources.data || [], 'sessions', (value) => value === '(direct)' ? t('direct') : value);
  renderRanks('#devices-list', devices.data || [], 'sessions');
  renderRanks('#countries-list', countries.data || [], 'sessions', countryName);
  renderEvents(state.events);
  renderHeatmap(heatmap.data || []);
  renderRecentActivity(realtime.recent || []);
  renderAudience(audience, devices.data || [], countries.data || []);
  renderTraffic(traffic);
  $('#realtime-visitors').textContent = formatNumber(realtime.activeVisitors);
  renderRealtimePages(realtime.pages || []);
  renderSiteDetails();
}

function countryName(code) {
  if (!/^[A-Z]{2}$/.test(code)) return code;
  try { return new Intl.DisplayNames([state.language], { type: 'region' }).of(code) || code; } catch (_) { return code; }
}

function tableMarkup(headers, rows, emptyMessage) {
  if (!rows.length) return `<table class="data-table"><tbody><tr><td class="empty-row" colspan="${headers.length}">${escapeHtml(emptyMessage)}</td></tr></tbody></table>`;
  const head = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('');
  const body = rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('');
  return `<table class="data-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function renderPages(rows) {
  const html = tableMarkup([t('pages'), t('views'), t('visitorsColumn'), t('avgTime')], rows.map((row) => [
    `<span class="path-cell" title="${escapeHtml(row.path)}">${escapeHtml(row.path)}</span>`,
    formatNumber(row.views), formatNumber(row.visitors), formatDuration(row.avg_time_seconds)
  ]), t('noData'));
  $('#pages-list').innerHTML = html;
}

function renderDetailedPages(rows, totalPages, overview) {
  $('#pages-total').textContent = formatNumber(totalPages);
  $('#pages-views').textContent = formatNumber(overview.pageviews);
  $('#pages-average').textContent = formatDuration(overview.avg_time_on_page_seconds);
  $('#pages-bounce').textContent = `${Number(overview.bounce_rate || 0).toLocaleString(dateLocale(), { maximumFractionDigits: 1 })}%`;
  $('#pages-report-list').innerHTML = tableMarkup(
    [t('pages'), t('views'), t('visitorsColumn'), t('avgTime'), t('entrances'), t('exits'), t('bounceRate')],
    rows.map((row) => [
      `<span class="path-cell" title="${escapeHtml(row.path)}">${escapeHtml(row.path)}</span>`,
      formatNumber(row.views), formatNumber(row.visitors), formatDuration(row.avg_time_seconds),
      formatNumber(row.entrances), formatNumber(row.exits),
      `${Number(row.bounce_rate || 0).toLocaleString(dateLocale(), { maximumFractionDigits: 1 })}%`
    ]), t('noData'));
}

function renderAudience(data, devices, countries) {
  $('#audience-total').textContent = formatNumber(data.visitors);
  $('#audience-new').textContent = formatNumber(data.new_visitors);
  $('#audience-returning').textContent = formatNumber(data.returning_visitors);
  $('#audience-countries').textContent = formatNumber(countries.filter((row) => /^[A-Z]{2}$/.test(row.value)).length);
  renderRanks('#audience-countries-list', countries, 'visitors', (value) => countryName(value));
  renderRanks('#audience-devices-list', devices, 'visitors');
  $('#visitor-privacy-note').textContent = t('privacyNote');
  renderVisitorList(data.data || []);
}

function renderVisitorList(rows) {
  $('#visitor-list').innerHTML = tableMarkup(
    [t('visitor'), t('type'), t('location'), t('device'), t('lastPage'), t('lastVisit')],
    rows.map((row) => [
      `<code>${escapeHtml(row.visitor_id)}</code>`,
      escapeHtml(Number(row.sessions) > 1 ? t('returningVisitor') : t('newVisitor')),
      escapeHtml(countryName(row.country)),
      escapeHtml(row.device || t('unknown')),
      `<span class="path-cell" title="${escapeHtml(row.last_path)}">${escapeHtml(row.last_path)}</span>`,
      escapeHtml(formatDateTime(row.last_seen_at))
    ]), t('noData'));
}

function renderTraffic(data) {
  const categories = data.categories || [];
  renderRanks('#traffic-categories', categories.map((row) => ({ value: t(`${row.category.toLowerCase()}Traffic`), ...row })), 'sessions');
  const labels = [
    ['visitorsStage', 'visitors'], ['sessionsStage', 'sessions'], ['pageviewsStage', 'pageviews'],
    ['engagedSessionsStage', 'engaged_sessions'], ['eventSessionsStage', 'event_sessions']
  ];
  const funnel = data.funnel || {};
  const max = Math.max(...labels.map(([, key]) => Number(funnel[key]) || 0), 1);
  $('#conversion-funnel').innerHTML = labels.map(([label, key]) => {
    const value = Number(funnel[key]) || 0;
    const percent = Number(funnel.visitors) ? value / Number(funnel.visitors) * 100 : 0;
    return `<div class="funnel-step"><div class="funnel-meta"><span>${escapeHtml(t(label))}</span><strong>${formatNumber(value)} · ${percent.toLocaleString(dateLocale(), { maximumFractionDigits: 1 })}%</strong></div><div class="funnel-track"><div class="funnel-bar" style="width:${value ? Math.max(2, value / max * 100) : 0}%">${percent.toLocaleString(dateLocale(), { maximumFractionDigits: 1 })}%</div></div></div>`;
  }).join('');
  const listTable = (selector, rows) => {
    $(selector).innerHTML = tableMarkup([t('pages'), t('sessions')], (rows || []).map((row) => [
      `<span class="path-cell" title="${escapeHtml(row.value)}">${escapeHtml(row.value)}</span>`, formatNumber(row.sessions)
    ]), t('noData'));
  };
  listTable('#landing-pages-list', data.landingPages);
  listTable('#exit-pages-list', data.exitPages);
  $('#source-search').textContent = formatNumber(categorySessions(categories, 'Search'));
  $('#source-social').textContent = formatNumber(categorySessions(categories, 'Social'));
  $('#source-direct').textContent = formatNumber(categorySessions(categories, 'Direct'));
  $('#source-referral').textContent = formatNumber(categorySessions(categories, 'Referral'));
  $('#source-details-list').innerHTML = tableMarkup([t('source'), t('sessions'), t('visitorsColumn')], (data.referrers || []).map((row) => [
    escapeHtml(row.value === '(direct)' ? t('direct') : row.value), formatNumber(row.sessions), formatNumber(row.visitors)
  ]), t('noData'));
  $('#campaign-terms-list').innerHTML = tableMarkup([t('campaignTerms'), t('sessions')], (data.searchTerms || []).map((row) => [
    escapeHtml(row.value), formatNumber(row.sessions)
  ]), t('noData'));
}

function categorySessions(categories, name) {
  const row = (categories || []).find((item) => item.category === name);
  return row ? row.sessions : 0;
}

function formatDateTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat(dateLocale(), { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

function renderRecentActivity(rows) {
  const el = $('#recent-activity');
  if (!rows.length) {
    el.innerHTML = `<div class="muted">${escapeHtml(t('noData'))}</div>`;
    return;
  }
  el.innerHTML = rows.map((row) => `<div class="compact-row"><span title="${escapeHtml(row.path)}"><strong>${escapeHtml(row.device || t('unknown'))}</strong> · ${escapeHtml(row.path)}</span><time>${escapeHtml(formatDateTime(row.created_at))}</time></div>`).join('');
}

function renderHeatmap(rows) {
  const counts = new Map(rows.map((row) => [`${row.weekday}-${row.hour}`, Number(row.pageviews) || 0]));
  const max = Math.max(...counts.values(), 1);
  const weekdays = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(dateLocale(), { weekday: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2024, 0, index + 1))));
  const colors = ['#f0f7fc', '#d7effa', '#b5e3f7', '#83d1f1', '#49b8e4', '#148dc9', '#075f9d'];
  let html = '<span class="heatmap-spacer"></span>';
  for (let hour = 0; hour < 24; hour += 1) html += `<span class="heatmap-hour">${hour % 3 === 0 ? String(hour).padStart(2, '0') : ''}</span>`;
  for (let day = 1; day <= 7; day += 1) {
    html += `<span class="heatmap-day">${escapeHtml(weekdays[day - 1])}</span>`;
    for (let hour = 0; hour < 24; hour += 1) {
      const count = counts.get(`${day}-${hour}`) || 0;
      const level = count ? Math.min(colors.length - 1, Math.ceil(count / max * (colors.length - 1))) : 0;
      html += `<span class="heatmap-cell" style="background:${colors[level]}" title="${escapeHtml(weekdays[day - 1])} ${String(hour).padStart(2, '0')}:00 · ${formatNumber(count)}"></span>`;
    }
  }
  html += `<span class="heatmap-legend">${escapeHtml(t('less'))} ${colors.map((color) => `<i style="background:${color}"></i>`).join('')} ${escapeHtml(t('more'))}</span>`;
  $('#activity-heatmap').innerHTML = html;
}

function renderEvents(rows) {
  $('#events-list').innerHTML = tableMarkup([t('event'), t('total'), t('sessions')], rows.map((row) => [
    `<strong>${escapeHtml(row.name)}</strong>`, formatNumber(row.total), formatNumber(row.sessions)
  ]), t('noEvents'));
}

async function loadSystemHealth() {
  const status = await api('/api/admin/health');
  $('#status-database').textContent = t('statusHealthy');
  $('#status-queue').textContent = formatNumber(status.writer.queueLength);
  $('#status-sessions').textContent = formatNumber(status.writer.cachedSessions);
  $('#status-message').textContent = `${t('statusHealthy')} · ${t('queueLength')}: ${formatNumber(status.writer.queueLength)}`;
}

function setActiveView(target) {
  const views = ['overview', 'traffic', 'audience', 'pages', 'sources', 'events', 'websites', 'settings', 'notifications', 'status'];
  const active = views.includes(target) ? target : 'overview';
  const displayView = active === 'notifications' ? 'settings' : active;
  state.activeView = active;
  document.querySelectorAll('.report-view').forEach((view) => {
    view.classList.toggle('hidden', view.id !== `${displayView}-view`);
  });
  document.querySelectorAll('.side-nav .nav-item[href^="#"]').forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${active}`);
  });
  $('#websites-view .site-settings').classList.toggle('hidden', state.sites.length === 0);
  $('#export-report').classList.toggle('hidden', ['settings', 'websites', 'notifications', 'status'].includes(active));
  $('#page-title').textContent = t(active === 'settings' ? 'systemSettings' : active === 'websites' ? 'siteSettings' :
    active === 'notifications' ? 'emailAlerts' : active);
  if (active === 'overview') requestAnimationFrame(() => renderChart(state.chartData));
  if (active === 'notifications') requestAnimationFrame(() => $('#email-alerts-section').scrollIntoView({ block: 'start' }));
  if (active === 'status' && state.token) loadSystemHealth().catch(showError);
}

function exportCurrentReport() {
  const exports = {
    overview: {
      filename: 'pages',
      headers: [t('pages'), t('views'), t('visitorsColumn'), t('avgTime')],
      rows: state.pages.slice(0, 10).map((row) => [row.path, row.views, row.visitors, formatDuration(row.avg_time_seconds)])
    },
    pages: {
      filename: 'pages',
      headers: [t('pages'), t('views'), t('visitorsColumn'), t('avgTime'), t('entrances'), t('exits'), t('bounceRate')],
      rows: state.pages.map((row) => [row.path, row.views, row.visitors, formatDuration(row.avg_time_seconds), row.entrances, row.exits, `${row.bounce_rate}%`])
    },
    audience: {
      filename: 'audience',
      headers: [t('visitor'), t('sessions'), t('location'), t('device'), t('lastPage'), t('lastVisit')],
      rows: (state.audience?.data || []).map((row) => [row.visitor_id, row.sessions, countryName(row.country), row.device, row.last_path, formatDateTime(row.last_seen_at)])
    },
    sources: {
      filename: 'sources',
      headers: [t('source'), t('sessions'), t('visitorsColumn')],
      rows: (state.traffic?.referrers || []).map((row) => [row.value, row.sessions, row.visitors])
    },
    traffic: {
      filename: 'traffic',
      headers: [t('source'), t('sessions'), t('visitorsColumn')],
      rows: (state.traffic?.categories || []).map((row) => [t(`${row.category.toLowerCase()}Traffic`), row.sessions, row.visitors])
    },
    events: {
      filename: 'events',
      headers: [t('event'), t('total'), t('sessions')],
      rows: state.events.map((row) => [row.name, row.total, row.sessions])
    }
  };
  const report = exports[state.activeView];
  if (!report || !report.rows.length) {
    notify(t('noData'), 'error');
    return;
  }
  const quote = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [report.headers, ...report.rows].map((row) => row.map(quote).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `webstat-${report.filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function renderRealtimePages(rows) {
  const el = $('#realtime-pages');
  if (!rows.length) {
    el.innerHTML = `<div class="muted">${escapeHtml(t('noRealtimePages'))}</div>`;
    return;
  }
  el.innerHTML = rows.map((row) => `<div class="compact-row"><span title="${escapeHtml(row.path)}">${escapeHtml(row.path)}</span><strong>${formatNumber(row.views)}</strong></div>`).join('');
}

function renderRanks(selector, rows, countKey, formatLabel = (label) => label) {
  const el = $(selector);
  if (!rows.length) {
    el.innerHTML = `<div class="muted">${escapeHtml(t('noData'))}</div>`;
    return;
  }
  const max = Math.max(...rows.map((row) => Number(row[countKey]) || 0), 1);
  el.innerHTML = rows.map((row) => {
    const label = formatLabel(String(row.value ?? ''));
    const value = Number(row[countKey]) || 0;
    return `<div class="rank-row"><span class="rank-label" title="${escapeHtml(label)}">${escapeHtml(label)}</span><span class="rank-track"><i class="rank-bar" style="width:${Math.max(3, value / max * 100)}%"></i></span><strong class="rank-value">${formatNumber(value)}</strong></div>`;
  }).join('');
}

function renderChart(rows) {
  const canvas = $('#traffic-chart');
  if (!canvas || canvas.offsetParent === null) return;
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const width = Math.max(280, rect.width);
  const height = Math.max(150, rect.height);
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, width, height);
  const data = (rows || []).filter((row) => Number.isFinite(Number(row.pageviews)) && Number.isFinite(Number(row.visitors)));
  $('#chart-empty').classList.toggle('hidden', data.length > 0);
  if (!data.length) return;
  const pad = { top: 10, right: 12, bottom: 28, left: 31 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const max = Math.max(...data.map((d) => Math.max(Number(d.pageviews), Number(d.visitors))), 1);
  ctx.font = '10px "DM Sans", Arial';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let i = 0; i <= 3; i += 1) {
    const y = pad.top + (plotHeight * i / 3);
    ctx.strokeStyle = '#eff0f5';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
    ctx.fillStyle = '#a0a3b2';
    ctx.fillText(Math.round(max * (3 - i) / 3).toLocaleString(dateLocale()), pad.left - 7, y);
  }
  const line = (key, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    data.forEach((row, i) => {
      const x = pad.left + (data.length === 1 ? plotWidth / 2 : i / (data.length - 1) * plotWidth);
      const y = pad.top + plotHeight - (Number(row[key]) / max * plotHeight);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  };
  line('pageviews', '#7262df');
  line('visitors', '#56b9a2');
  const labelIndexes = new Set([0, Math.floor((data.length - 1) / 2), data.length - 1]);
  ctx.fillStyle = '#999cad'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  data.forEach((row, i) => {
    if (!labelIndexes.has(i)) return;
    const date = new Date(row.bucket);
    const label = Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat(dateLocale(), { month: 'short', day: 'numeric', ...(data.length <= 8 && date.getHours() ? { hour: '2-digit' } : {}) }).format(date);
    const x = pad.left + (data.length === 1 ? plotWidth / 2 : i / (data.length - 1) * plotWidth);
    ctx.fillText(label, x, height - pad.bottom + 9);
  });
}

async function authenticate() {
  const username = $('#dashboard-username').value.trim();
  const password = $('#dashboard-password').value;
  if (!username || !password) return;
  let login;
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    login = await response.json();
    if (!response.ok) throw new Error(t('loginFailed'));
  } catch (error) {
    sessionStorage.removeItem(SESSION_KEY);
    state.token = '';
    $('#login-error').textContent = error.message || t('loginFailed');
    return;
  }
  state.token = login.token;
  sessionStorage.setItem(SESSION_KEY, state.token);
  $('#dashboard-password').value = '';
  let result;
  try {
    result = await api('/api/admin/websites');
  } catch (error) {
    sessionStorage.removeItem(SESSION_KEY);
    state.token = '';
    $('#login-error').textContent = error.message || t('loginFailed');
    return;
  }
  state.sites = result.data;
  state.siteId = sessionStorage.getItem('webstat-site-id') || (state.sites[0] && state.sites[0].id) || '';
  renderSiteList();
  showApp();
  setNoSites(state.sites.length === 0);
  if (state.siteId) {
    await refreshData().catch(showError);
    startRealtimeRefresh();
  }
  await loadSystemSettings().catch((error) => showError(error));
}

function startRealtimeRefresh() {
  clearInterval(realtimeTimer);
  realtimeTimer = window.setInterval(() => {
    if (!state.siteId || document.hidden) return;
    const id = encodeURIComponent(state.siteId);
    api(`/api/stats/${id}/realtime`).then((data) => {
      $('#realtime-visitors').textContent = formatNumber(data.activeVisitors);
      renderRealtimePages(data.pages || []);
      renderRecentActivity(data.recent || []);
    }).catch(showError);
  }, 30_000);
}

function openSiteDialog() {
  $('#site-form-error').textContent = '';
  $('#site-dialog').showModal();
}

async function createSite(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const payload = {
    name: String(data.get('name') || '').trim(),
    domain: String(data.get('domain') || '').trim(),
    allow_subdomains: data.has('allow_subdomains'),
    enforce_origin: data.has('enforce_origin')
  };
  let created;
  try {
    created = await api('/api/admin/websites', { method: 'POST', body: JSON.stringify(payload) });
  } catch (error) {
    $('#site-form-error').textContent = error.message || t('createFailed');
    return;
  }
  $('#site-dialog').close();
  form.reset();
  state.sites.unshift(created);
  state.siteId = created.id;
  renderSiteList();
  setNoSites(false);
  $('#token-value').textContent = created.read_token;
  $('#token-dialog').showModal();
  notify(t('websiteCreated'));
  startRealtimeRefresh();
  await refreshData().catch(showError);
}

async function updateSite(active) {
  try {
    const updated = await api(`/api/admin/websites/${encodeURIComponent(state.siteId)}`, {
      method: 'PATCH', body: JSON.stringify({ is_active: active })
    });
    state.sites = state.sites.map((site) => site.id === updated.id ? { ...site, ...updated } : site);
    renderSiteList();
    notify(active ? t('enabled') : t('disabled'));
  } catch (error) { showError(error); }
}

async function deleteSite() {
  if (!window.confirm(t('deleteConfirm'))) return;
  try {
    await api(`/api/admin/websites/${encodeURIComponent(state.siteId)}`, { method: 'DELETE' });
    state.sites = state.sites.filter((site) => site.id !== state.siteId);
    state.siteId = state.sites[0]?.id || '';
    if (state.siteId) sessionStorage.setItem('webstat-site-id', state.siteId);
    else sessionStorage.removeItem('webstat-site-id');
    renderSiteList();
    setNoSites(state.sites.length === 0);
    if (state.siteId) await refreshData();
    notify(t('siteDeleted'));
  } catch (error) { showError(error); }
}

async function rotateToken() {
  if (!window.confirm(t('tokenRotateConfirm'))) return;
  try {
    const result = await api(`/api/admin/websites/${encodeURIComponent(state.siteId)}/rotate-token`, { method: 'POST' });
    $('#token-value').textContent = result.read_token;
    $('#token-dialog').showModal();
    notify(t('tokenRotated'));
  } catch (error) { showError(error); }
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    notify(t('copied'));
  } catch (_) {
    notify(t('copyFailed'), 'error');
  }
}

function setupEvents() {
  $('#login-form').addEventListener('submit', (event) => { event.preventDefault(); authenticate(); });
  $('#site-select').addEventListener('change', async (event) => {
    state.siteId = event.target.value;
    sessionStorage.setItem('webstat-site-id', state.siteId);
    await refreshData().catch(showError);
  });
  $('#date-range').addEventListener('change', () => refreshData().catch(showError));
  $('#visitor-search').addEventListener('input', () => {
    clearTimeout(visitorSearchTimer);
    visitorSearchTimer = setTimeout(() => refreshData().catch(showError), 250);
  });
  $('#export-report').addEventListener('click', exportCurrentReport);
  $('#refresh').addEventListener('click', () => refreshData().then(() => notify(t('refreshed'))).catch(showError));
  $('#refresh-status').addEventListener('click', () => loadSystemHealth().catch(showError));
  $('#add-site-open').addEventListener('click', openSiteDialog);
  $('#empty-add-site').addEventListener('click', openSiteDialog);
  $('#site-form').addEventListener('submit', createSite);
  $('#settings-form').addEventListener('submit', (event) => {
    event.preventDefault();
    saveSystemSettings();
  });
  $('#test-email').addEventListener('click', () => saveSystemSettings({ sendTest: true }));
  $('#toggle-site').addEventListener('click', (event) => updateSite(event.currentTarget.dataset.active !== 'true'));
  $('#delete-site').addEventListener('click', deleteSite);
  $('#rotate-token').addEventListener('click', rotateToken);
  $('#copy-snippet').addEventListener('click', () => copyText($('#snippet-code').textContent));
  $('#copy-token').addEventListener('click', () => copyText($('#token-value').textContent));
  $('#sign-out').addEventListener('click', async () => {
    if (!window.confirm(t('signOutConfirm'))) return;
    let logoutError;
    try { await api('/api/admin/session', { method: 'DELETE' }); } catch (error) { logoutError = error; }
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('webstat-site-id');
    state.token = '';
    state.siteId = '';
    showLogin();
    if (logoutError) $('#login-error').textContent = logoutError.message;
  });
  document.querySelectorAll('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => button.closest('dialog').close()));
  document.querySelectorAll('[data-language-toggle]').forEach((button) => button.addEventListener('click', () => {
    state.language = state.language === 'tr' ? 'en' : 'tr';
    localStorage.setItem('webstat-language', state.language);
    applyLanguage();
  }));
  document.querySelectorAll('.side-nav .nav-item[href^="#"]').forEach((link) =>
    link.addEventListener('click', () => setActiveView(link.getAttribute('href').slice(1))));
  window.addEventListener('hashchange', () => setActiveView(location.hash.slice(1)));
  window.addEventListener('resize', () => renderChart(state.chartData));
  setActiveView(location.hash.slice(1));
}

applyLanguage();
setupEvents();
if (state.token) {
  api('/api/admin/websites').then((result) => {
    state.sites = result.data;
    state.siteId = sessionStorage.getItem('webstat-site-id') || (state.sites[0] && state.sites[0].id) || '';
    renderSiteList();
    showApp();
    setNoSites(state.sites.length === 0);
    if (state.siteId) {
      refreshData().catch(showError);
      startRealtimeRefresh();
    }
    loadSystemSettings().catch(showError);
  }).catch(() => showLogin());
}
