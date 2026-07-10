# CHANGELOG — Global Impact (Küresel Etki)

> **Kural (ajanlar / geliştiriciler):** Her anlamlı kod veya dokümantasyon değişikliğinden sonra bu dosyaya **yeni bir madde** ekleyin (tarih + kısa açıklama).  
> En yeni girişler **üstte** (ters kronolojik).  
> Public repo: https://github.com/snipeTR/global-impact  
> Gizli notlar: private `snipeTR/kuresel-etki-secrets` (public’e sızdırma).

---

## [Unreleased]

_(Boş — sıradaki iş buraya)_

---

## 2026-07-10 — Mobil grafik tık + ana menü Ayarlar

- Mobil grafik çipleri: 1. tık aktif, aynı çipe 2. tık açıklama; başka yere tık → kapat.
- Masaüstü: hover açıklama aynı.
- Ana menü **Ayarlar**: dil, ses, yeni oyun onayı, feed daralt, sözlük mute sıfırla (`keSettings_oyungrok`).

---

## 2026-07-10 — Grafik çip ipuçları + sözlük popover UX

- Grafik butonları (büyüme, enflasyon, rezerv, gıda…): hover’da “ne / yükselirse / düşerse” 1’er cümle (TR+EN).
- Sözlük popover: **Kapat** butonu kaldırıldı; tık (mesaj/popover) veya mouse leave ile kapanır.
- “Bu açıklamayı bir daha gösterme” checkbox → `localStorage keGlossSkip_oyungrok` (oyuna özel değil, kalıcı).

---

## 2026-07-10 — Dünya olayları ekonomi sözlüğü (* terimler)

- `js/data/glossary.js`: TR/EN sade dil sözlüğü (enflasyon, rezerv, yaptırım, QE…).
- Haber satırlarında terimler `terim*` olarak işaretlenir; hover (masaüstü) / tık (mobil) ile açıklama.
- Satıra tıklayınca satırdaki tüm terimlerin sade dil özeti.
- `renderFeed` entegrasyonu; mobil + desktop CSS (`.econ-term`, `#glossary-pop`).
- i18n: `glossary_*`, `effect_label`, `feed_empty`.

---

## 2026-07-10 — Tooltip desc senkronu + ajan yayın/desc kuralları

- Makro/FX `instruments.js` desc metinleri lang pack ile hizalandı.
- Hover `instrumentDetail`: anlık 🏛 maliyet + escalate/FX penaltı notları.
- `CROSS_RULES` (faiz/vergi/kamu/FX) maliyet kuralları eklendi.
- `tools/sync-instrument-descs.js` — ajanlar için desc kontrolü (`--check`).
- `AGENTS.md`: her iş sonrası **yerel + GitHub push + sunucu deploy**; enstrüman desc üçlüsü zorunlu.

---

## 2026-07-10 — Siyasi sermaye, Sıfırla, makro/FX maliyetleri, EN yardım

### UI / tur
- Onay modalında **yetersiz siyasi sermaye** uyarısı; ilerleme butonu engellenir.
- Olay Günlüğü yanında **Sıfırla / Reset**: tüm bekleyen enstrüman değişikliklerini iptal (onay öncesi).
- Mobilde de Sıfırla butonu.

### Maliyetler
- **Politika faizi, vergi, kamu harcaması:** taban maliyet **2**; her onaylanan kullanımda **+1** (`escalateCost` + `instrUseCount`).
- **Döviz müdahalesi:** maliyet **3**; rezerv erimesi artırıldı; her **4** kullanımda siyasi sermaye **regen −1/−2/−3…**; enflasyon **4 çeyrek gecikmeli** hafif uzun sızma.

### i18n
- TR/EN yeni UI stringleri (`reset_pending`, `polcap_*`, vb.).
- İngilizce **help/about** metinleri TR ile aynı kapsamda, daha açık ve doğru terimlerle genişletildi.
- İlgili enstrüman `desc` güncellemeleri.

### API
- `GAME.instrumentCost`, `pendingTotalCost`, `clearPending`, `recordInstrumentUse`, `fxRegenPenalty`.

---

## 2026-07-10 — Dil seçici Win95 pencere içi sağ alt

- Ana menü: `TR/EN` select tarayıcı/masaüstü köşesinde değil; **menu-box** status bar sağında.
- Masaüstü oyun: enstrüman barı sağ alt.
- Mobil: alt nav satırında sağ (oklar arası).
- Select stili sunken Win95 border.

---

## 2026-07-10 — GitHub deploy script + full server deploy

### Deploy
- Private repo `deploy/`: `setup-git-auth.sh`, `deploy-from-github.sh`, `bootstrap-server.sh`, nginx deny snippet.
- Sunucu: `git` + `rsync` kuruldu; private repo için **deploy key** (`id_ed25519_github_secrets`).
- Script public `global-impact` + private `kuresel-etki-secrets` çeker, `/var/www/html/oyungrok` birleştirir.
- Gizli dosyalar sunucuda da yüklü; **HTTP 403** (`YAPILACAKLAR.md`, `ssh/*`) — oyun dosyaları 200.
- Public sarmalayıcı: `tools/deploy-from-github.sh`.

### Not
- Deploy key tek repoya özel (GitHub kuralı); public HTTPS, private SSH key.
- ASLA `/oyun/` path.

---

## 2026-07-10 — Repo rename, dil UI, CHANGELOG, GitHub-first

### Depo
- Public GitHub repo adı **`kuresel-etki` → `global-impact`** (Küresel Etki / Global Impact).
- Çalışma kaynağı: **GitHub ana repo**; yerel kopya yalnızca clone/workspace.
- Tüm public kaynak dosyalar repoda (müzik, lang, tools, agent.md dahil). `YAPILACAKLAR.md` bilerek gitignore (sırlar private repoda).

### Dil seçici UI
- Ana menü sağ alt: 3 harfli **TR/EN** `<select>` (önceki oturum).
- **Masaüstü oyun:** dil kutusu oyun penceresi **içinde sağ alt**.
- **Mobil:** dil kutusu mobil kabuk **içinde sağ alt** (alt nav üstü).
- Header **🌐** butonları kaldırıldı; tek tip select.

### Dokümantasyon
- `CHANGELOG.md` oluşturuldu; ajanların değişiklik kaydı zorunluluğu `AGENTS.md` + README ajan bölümüne eklendi.
- `README.md` / `README-EN.md` / `AGENTS.md` repo URL güncellemeleri (`global-impact`).

---

## 2026-07-09 — Oturum özeti (bu sohbetin başından)

### i18n (çoklu dil)
- `lang/i18n.js` çekirdeği: `GAME.t`, `setLang`, `applyAll`, paket register.
- `lang/tr/pack.js` + `lang/en/pack.js` (UI, enstrüman, ülke, felaket, haber, help, AI mesajları).
- `localStorage` anahtarı: `keLang_oyungrok`.
- UI ve veri metinleri dil paketlerinden; `gov` kod anahtarları çevrilmez.
- Araçlar: `tools/build-lang-tr.js`, `tools/build-lang-en.js`, `tools/patch-intro-ui.js`.

### Dil seçici (önceki adım)
- Menüde bayrak butonları yerine **3 harfli dropdown** (TR/EN), sağ alt.

### README / docs
- README üç kademe (kullanıcı / programcı / ajan) genişletildi.
- `README-EN.md` eklendi; TR README başına EN linki.
- Ajan bölümünde private secrets repo okuma talimatı.

### Private secrets
- Private repo: `snipeTR/kuresel-etki-secrets`.
- İçerik: `YAPILACAKLAR.md`, `ssh/` (private+public key yedek).
- Public repoda `YAPILACAKLAR.md` gitignore; `YAPILACAKLAR.example.md` şablon.

### Deploy / sunucu (oyungrok)
- Canlı yol: `/var/www/html/oyungrok` — **`/oyun/` dokunulmaz**.
- i18n dosyaları sunucuya yüklendi; web kökünden gizli `YAPILACAKLAR.md` silindi.

### Oyun / mimari (oturum boyunca, özet)
- Turn **v2**: AI script plan → gecikmeli replay; kesintide `preAi` + baştan.
- localStorage sonekleri `*_oyungrok` (eski `/oyun/` kaydıyla çakışmasın).
- 17 ülke; EU tek varlık; GBR ayrı; DEU yok.
- 48 enstrüman (silme yok kuralı).
- Mobil 9:16 sekmeler, swipe wrap, harita pan/pinch (sayfa zoom kapalı).
- Harita ilişki renkli çizgiler; AB marker İspanya, label altta.
- Müzik: normal → felaket fade → playlist; ses 0 / 40% / 100%.
- Tur onay modalı; mobilde Olaylar sekmesine atlama.
- Haber şablonları 80+; `test-consistency.js`.
- `AGENTS.md` kalıcı kurallar; açık todo private/local.

### Git
- Public history: initial commit → README → i18n → dil UI → docs/private secrets → README-EN → (bu sürüm).

---

## Nasıl giriş eklenir? (ajan şablonu)

```markdown
## YYYY-MM-DD — Kısa başlık

- Ne değişti (1–5 madde)
- Etkilenen dosyalar (özet)
- Kırıcı değişiklik / migrate notu (varsa)
```

Örnek:

```markdown
## 2026-07-11 — Enstrüman X eklendi

- `instruments.js`: `new_tool` (layer 2, slider)
- `lang/tr/pack.js` + `lang/en/pack.js`: name/desc
- CHANGELOG bu madde
```
