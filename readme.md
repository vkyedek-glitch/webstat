Proje analytics.zip içinde hazır. Gerçek bir PostgreSQL 16 üzerinde uçtan uca test ettim; kurulum rehberi, Nginx ayarı ve entegrasyon örnekleri zip içindeki README.md’de.

Test edilenler
Veri akışı: sayfa görüntüleme, süre ping’i, özel olay ve oturum birleştirme çalışıyor.
Reddedilenler: yanlış Origin, bot UA, bilinmeyen site ID, bozuk JSON ve DNT isteği sessizce düşüyor. Hepsine 204 dönüyor, bu yüzden site ID’leri tahmin edilemez.
Rapor API’si: tüm rapor uçları ve yetki kontrolleri doğru çalışıyor.
Koruma katmanı: rate limit (429), 4 KB üstü gövde (413), CORS preflight ve graceful shutdown çalışıyor.
Tracker: tracker.js’i jsdom’da çalıştırıp canlı sunucuya bağladım. SPA geçişi, tıklama olayı, heartbeat ve yükleme öncesi kuyruk doğru çalıştı. Gerçek tarayıcıda denemedim.
Denenmeyenler: Redis, MaxMind coğrafi arama ve Docker build’i test edilmedi. Bu üçü yazıldı ama çalıştırılmadı.
Güvenlik incelemesi: isteğinden farklı yaptıklarım
IP’yi hiç saklamıyorum. Maskelenmiş IP bile User-Agent ile birleşince tanımlayıcı olabilir. IP yalnızca hash hesabında ve isteğe bağlı coğrafi aramada, istek süresince bellekte kullanılıyor.
Ziyaretçi ID’si çerezsiz. HMAC(günlük_tuz, site | anonim_IP | UA) kullanıyor, tuz her gün yenileniyor ve 2 günden eskisi siliniyor. Günler arası takip yok, çerez/localStorage onay yükü azalıyor. Bedeli: aynı kişi ertesi gün yeni ziyaretçi sayılıyor.
Access-Control-Allow-Origin: * bırakıldı ama tek başına yetmez. Site UUID’si sayfa kaynağında görünür, herkes başka site adına veri basabilir. Bu yüzden Origin başlığı kayıtlı domain ve alt domainleriyle eşleşmiyorsa olay düşüyor. Tarayıcı dışı istemciler Origin’i taklit edebilir, bu risk rate limit ve bot filtresiyle azalıyor ama sıfırlanmıyor.
URL’deki sorgu parametreleri saklanmıyor. ?email=... ve ?token=... gibi değerler sızabilir; yalnızca utm_* alınıyor.
Rapor API’sine kimlik doğrulama eklendi. İsteğindeki taslakta bu yoktu. Yönetici token’ı tüm siteleri, her sitenin kendi okuma token’ı yalnızca o siteyi görüyor. Token’lar hash’li saklanıyor.
Ping’lerle başkasının kaydı değiştirilemiyor. Süre güncellemesi visitor_hash eşleşmesi istiyor.
TRUST_PROXY yanlışsa rate limit atlatılır. Saldırgan X-Forwarded-For başlığını sahteleyebilir. true değerini kabul etmiyorum, hop sayısı istiyorum.
Helmet’in varsayılan Cross-Origin-Resource-Policy: same-origin ayarı track.js’in başka sitelerde yüklenmesini engelliyor. cross-origin olarak ayarladım.
PostgreSQL \u0000 içeren metni reddediyor. Bu, kötü niyetli bir başlıkla yazma batch’ini düşürebilirdi; girdiler temizleniyor.
Eklediğim özellikler
Özel olaylar (JSONB prop’lu ve filtrelenebilir) ve data-wsa-event ile tıklama takibi
SPA desteği, UTM, sekme görünürken ölçülen gerçek kalma süresi
Anlık ziyaretçi, hemen çıkma oranı ve ülke/şehir kırılımı
DNT/GPC desteği ve localStorage.wsa_ignore ile kendi ziyaretini hariç tutma
Saklama süresi görevi (site bazında ayarlanabilir) ve site silince tüm verinin silinmesi (silme hakkı)
Token rotasyonu, kuyruk metrikleri, Docker Compose, retry’lı toplu yazma
Bilinen sınırlar
Bellek kuyruğu çökmede en fazla yaklaşık 1 saniyelik veriyi kaybedebilir. Kesin dayanıklılık için Redis Streams veya Kafka gerekir.
Aynı NAT ve aynı UA’daki farklı kişiler tek ziyaretçi sayılabilir.
Dağıtık botnet’e karşı IP bazlı rate limit zayıf kalır; Cloudflare veya Nginx limit_req ekleyin.
Çerezsiz ölçümün onay gerektirip gerektirmediği ülkeye göre değişiyor. Bu hukuki görüş değil, yayına almadan önce hukuk danışmanınıza doğrulatın.
Sıradaki adımlar

Önceliğim şu sırada olurdu: önce bir dashboard arayüzü, sonra pageviews için aylık partition ve günlük özet tabloları (yaklaşık 1M olay/gün üstünde gerekir), sonra hedef ve huni takibi.  dashboard’u  yazabiliriz.

# Self-Hosted Analytics (multi-domain, çerezsiz, KVKK/GDPR dostu)

Node.js + Express + PostgreSQL (+ opsiyonel Redis). Tek sunucudan sınırsız alan adı takip eder.

```
tracker.js ──fetch(keepalive)──▶ POST /api/track ──▶ 204 (anında)
                                      │  doğrula: site, Origin, bot, DNT, rate limit
                                      ▼
                              bellek kuyruğu ──(1 sn / 500 olay)──▶ tek transaction ile PostgreSQL
```

## 1. Kurulum

### A) Docker (önerilen)
```bash
cp .env.example .env
# ADMIN_TOKEN ve SETTINGS_ENCRYPTION_KEY için openssl rand -hex 32 çıktısı kullanın (farklı değerler).
# DASHBOARD_USERNAME ve en az 12 karakterli DASHBOARD_PASSWORD belirleyin.
# PUBLIC_URL ve TRUST_PROXY değerlerini dağıtımınıza göre düzenleyin.
echo "POSTGRES_PASSWORD=$(openssl rand -hex 16)" >> .env
docker compose up -d --build
curl localhost:3000/health
```

### B) Manuel
```bash
# Gereksinim: Node 20+, PostgreSQL 13+, (opsiyonel) Redis 6+
createdb analytics
cp .env.example .env   # DATABASE_URL, tokenlar, dashboard kullanıcı adı/şifresi, PUBLIC_URL düzenle
npm ci --omit=dev
npm run migrate        # şema idempotent, tekrar çalıştırılabilir
npm start
```

### Nginx (TLS + ek koruma)
```nginx
limit_req_zone $binary_remote_addr zone=track:10m rate=30r/s;

server {
  listen 443 ssl http2;
  server_name analytics.sirketiniz.com;
  # ssl_certificate ...; (certbot)

  client_max_body_size 8k;

  location /api/track {
    limit_req zone=track burst=60 nodelay;
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header X-Forwarded-For $remote_addr;   # istemcinin XFF'ini EZ, uygulamaya sahtesi gitmesin
    proxy_set_header Host $host;
  }
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header Host $host;
  }
}
```
Nginx tek hop olduğu için `.env` içinde `TRUST_PROXY=1`. Cloudflare + Nginx varsa `2` (ve Cloudflare IP'lerini doğrulayın).

## 2. Site ekleme ve entegrasyon

```bash
curl -X POST https://analytics.sirketiniz.com/api/admin/websites \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Şirket Sitesi","domain":"ornek.com"}'
```
Yanıttaki `snippet` hedef sitenin `<head>` bölümüne eklenir:
```html
<script defer src="https://analytics.sirketiniz.com/track.js" data-site-id="SITE-UUID"></script>
```
`read_token` **yalnızca bir kez** gösterilir (DB'de sadece hash'i durur); raporlara erişim için saklayın.

Opsiyonel `data-*` özellikleri: `data-respect-dnt="false"`, `data-include-query="true"`, `data-hash-mode="true"`, `data-heartbeat="15"`, `data-api="..."`.

**Özel olaylar**
```html
<!-- Betik yüklenmeden önce de çağrılabilsin diye (opsiyonel kuyruk) -->
<script>window.wsa=window.wsa||function(){(wsa.q=wsa.q||[]).push(arguments)}</script>

<button data-wsa-event="demo_talep">Demo İste</button>
<script>wsa('event', 'satin_alma', { plan: 'pro', tutar: 499 });</script>
```
Kendi ziyaretinizi hariç tutmak için tarayıcı konsolunda: `localStorage.setItem('wsa_ignore','1')`.

SPA (React/Vue/Next): `history.pushState` otomatik yakalanır, ek kod gerekmez.

## Dashboard

Sunucu çalışırken `http://localhost:3000/` adresini açın ve `.env` içindeki `DASHBOARD_USERNAME` ile en az 12 karakterli `DASHBOARD_PASSWORD` değerlerini kullanarak giriş yapın. `ADMIN_TOKEN` web paneli girişinde kullanılmaz; doğrudan yönetim API'si ve otomasyonlar için ayrı tutulur. Panel girişi, dakikada en fazla 10 deneme ile sınırlandırılır ve 12 saatlik sunucu belleği oturumu oluşturur; çıkışta oturum iptal edilir. Sunucu yeniden başladığında tekrar giriş gerekir. Dashboard aynı Express sunucusundan sunulur; ayrı bir frontend servisi veya CORS ayarı gerekmez.

Arayüz Türkçe ve İngilizce kullanılabilir. Dil tercihi tarayıcıda saklanır; yönetici token'ı yalnızca geçerli sekme oturumunda tutulur. Dashboard Türkçe/İngilizce ve seçili tarih aralığı desteği sunar. Üst çubuktaki dışa aktarma düğmesi açık raporun CSV çıktısını indirir. Dashboard üzerinden:

* Genel bakışta özet metrikleri, trafik grafiği, haftanın gün/saat aktivite haritası ve son sayfa görüntülemelerini inceleyin.
* Trafik raporunda kaynak kategorilerini, ziyaretçi hunisini, giriş ve çıkış sayfalarını; kaynaklar raporunda yönlendiren alan adlarını ve iletilmiş UTM terimlerini inceleyin. Arama motorlarının sorgu kelimeleri URL'lerden alınmadığından yalnızca `utm_term` gibi açıkça iletilen terimler raporlanır.
* Ziyaretçiler raporunda anonim kimlikleri, konum/cihaz kırılımını ve ziyaretçi aramasını kullanın. Kimlikler her gün döndüğü için yeni/geri dönen sınıflandırması yalnızca aynı günlük kimlik penceresindeki oturumları kapsar; günler arası ziyaretçi takibi yapılmaz.
* Sayfalar raporunda görüntülenme, tekil ziyaretçi, ortalama süre, giriş/çıkış ve hemen çıkma oranını; olaylar raporunda özel olay sayılarını görün.
* Son beş dakikanın aktif ziyaretçilerini ve sayfalarını 30 saniyede bir yenilenen anlık görünümde takip edin.
* Site ekleyin, izleme kodunu kopyalayın, izlemeyi etkinleştirip devre dışı bırakın, okuma token'ını yenileyin veya siteyi tüm verileriyle silin.
* **Sistem ayarları** bölümünde `PUBLIC_URL` değerini değiştirin. Yeni oluşturulan ve listelenen tracker snippet'leri bu adresi kullanır; mevcut sitelerdeki snippet'leri hedef web sitelerinde ayrıca güncelleyin.
* SMTP sunucusu, port, TLS, kimlik bilgileri, gönderici ve tek alıcı adresini ayarlayıp test e-postası gönderin. SMTP parolası AES-256-GCM ile veritabanında şifrelenir. `SETTINGS_ENCRYPTION_KEY` değeri uygulama `.env` dosyasında sabit ve yedekli tutulmalıdır; kaybolursa kayıtlı SMTP parolası çözülemez.
* İsteğe bağlı e-posta uyarıları: günlük rapor (her gün 09:00 UTC'den sonra), haftalık rapor (Pazartesi 09:00 UTC'den sonra), veritabanı yazma hataları (en fazla 30 dakikada bir) ve veritabanı bağlantısının kesilmesi/geri gelmesi.

Yeni site oluşturulurken okuma token'ı yalnızca bir kez gösterilir; ayrıca entegrasyonlarda kullanacaksanız güvenli biçimde saklayın. Siteyi silme işlemi geri alınamaz.

## 3. Raporlama API'si

Başlık: `Authorization: Bearer <ADMIN_TOKEN | site read_token>`. Tüm uçlar: `?from=2026-11-01&to=2026-11-12` (ISO 8601, `to` hariç, varsayılan son 7 gün, en fazla 366 gün), `&tz=Europe/Istanbul`, `&limit=10`.

| Uç nokta | Açıklama |
|---|---|
| `GET /api/stats/:siteId/overview` | Oturum, ziyaretçi, sayfa görüntüleme, hemen çıkma oranı, ort. süre |
| `GET /api/stats/:siteId/timeseries?interval=hour\|day\|week\|month` | Zaman serisi |
| `GET /api/stats/:siteId/pages` | En çok görüntülenen sayfalar + ort. kalma süresi |
| `GET /api/stats/:siteId/audience?q=...` | Anonim ziyaretçi özeti ve filtrelenebilir liste |
| `GET /api/stats/:siteId/traffic` | Kaynak kategorileri, yönlendirenler, UTM terimleri, giriş/çıkış sayfaları ve huni |
| `GET /api/stats/:siteId/heatmap` | Saat ve haftanın gününe göre sayfa görüntülemeleri |
| `GET /api/stats/:siteId/breakdown/:dim` | `referrer, device, os, browser, country, city, utm_source, utm_medium, utm_campaign, entry_path` |
| `GET /api/stats/:siteId/events?name=satin_alma&prop=plan&value=pro` | Özel olaylar (JSONB filtre) |
| `GET /api/stats/:siteId/realtime` | Son 5 dakika |

Yönetim (`ADMIN_TOKEN`): `POST/GET /api/admin/websites`, `PATCH /websites/:id` (aktif/pasif vb.), `POST /websites/:id/rotate-token`, `DELETE /websites/:id` (tüm veriyi siler), `GET /api/admin/health` (kuyruk metrikleri).

## 4. Gizlilik tasarımı (KVKK / GDPR)

* **Çerez yok, localStorage'a yazma yok.** Ziyaretçi kimliği `HMAC(günlük_tuz, site_id | anonim_IP | User-Agent)`.
* **Ham IP ve User-Agent saklanmaz.** IP yalnızca hash ve (opsiyonel) coğrafi arama için o isteğin süresince bellekte tutulur; IPv4'te son oktet, IPv6'da son 80 bit sıfırlanır.
* **Tuz her gün (UTC) yenilenir, 2 günden eskisi silinir** → önceki günlerin hash'leri artık yeniden üretilemez; günler arası takip yok. Aynı ziyaretçi ertesi gün yeni sayılır.
* **URL'de sorgu parametresi saklanmaz** (e-posta, token, kimlik sızıntısı riski). Yalnızca `utm_*` alınır.
* **DNT / Global Privacy Control** hem istemcide hem sunucuda (`RESPECT_DNT`) saygı görür.
* **Saklama süresi:** `RETENTION_DAYS` (site bazında `retention_days`) dolunca saatlik görev siler. Site silme CASCADE ile her şeyi kaldırır.
* Bu bir hukuki görüş değildir. Çerezsiz/anonim ölçümün onay gerektirip gerektirmediği ülke ve otoriteye göre değişir (ör. CNIL muafiyet koşulları). Gizlilik politikanıza yazın ve hukuk danışmanınıza doğrulatın.

## 5. Güvenlik özeti

| Konu | Önlem |
|---|---|
| Sahte/yanlış domain verisi | `Origin` başlığı kayıtlı `domain_name` (+alt domain) ile eşleşmeli; eşleşmezse sessizce düşer |
| Flood / DoS | IP başına rate limit (Redis ya da bellek), Nginx `limit_req`, 4 KB gövde sınırı, kuyruk üst sınırı (geri basınç) |
| Bot | UA regex, `navigator.webdriver`, headless tespiti |
| Site ID enumeration | Her durumda aynı `204` yanıtı |
| Rapor erişimi | Bearer token; read token'lar hash'li saklanır, `timingSafeEqual` ile karşılaştırılır |
| SQL enjeksiyonu | Tüm sorgular parametreli; `dimension`/`interval` beyaz liste |
| Ping IDOR | Süre güncellemesi `visitor_hash` eşleşmesi ister |
| Sorgu maliyeti | `statement_timeout` 15 sn, en çok 366 gün, `limit ≤ 100` |
| XFF sahteciliği | `TRUST_PROXY` doğru hop sayısı olmalı; `true` kabul edilmez |
| Başlıklar | Helmet (CORP `cross-origin` olarak ayarlı, aksi halde betik başka sitede yüklenmez) |

**Bilinen sınırlar:** `Origin` tarayıcı dışı istemcilerce taklit edilebilir (veri kirletme riski kalır; CDN/WAF kuralı ve rate limit ile azaltın). Bellek kuyruğu çökmede en fazla ~1 sn'lik veriyi kaybedebilir (kesin dayanıklılık için Redis Streams/Kafka). Aynı NAT + aynı UA'daki farklı kişiler tek ziyaretçi sayılabilir. TLS'i uygulama değil Nginx sonlandırır.

## 6. Ölçekleme notları

* Çoklu instance: Redis ile rate limit paylaşılır; oturum çözümü DB'ye de bakar. Yine de ~1M+ olay/gün üstünde `pageviews`'ı aylık partition'a (pg_partman) alın ve günlük özet tabloları ekleyin.
* Coğrafi konum: `GEOIP_DB=/path/GeoLite2-City.mmdb` + `npm i maxmind`, veya Cloudflare arkasında `GEO_COUNTRY_HEADER=CF-IPCountry`.
* Hata ayıklama: `DEBUG_TRACK=1` düşürülen olayların nedenini loglar.
