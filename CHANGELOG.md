# CHANGELOG — Global Impact (Küresel Etki)

> **Kural (ajanlar / geliştiriciler):** Her anlamlı kod veya dokümantasyon değişikliğinden sonra bu dosyaya **yeni bir madde** ekleyin (tarih + kısa açıklama).  
> En yeni girişler **üstte** (ters kronolojik).  
> Public repo: https://github.com/snipeTR/global-impact  
> Gizli notlar: private `snipeTR/kuresel-etki-secrets` (public’e sızdırma).

---

## [Unreleased]

_(Boş — sıradaki iş buraya)_

---

## 2026-07-10 — tools/ yeniden yapı: js/ + sh/; patch JS silindi

- `tools/js/`: kalıcı Node CLI (sync-instrument-descs, sync-help-i18n, build-lang-*).
- `tools/sh/`: INSTALL.sh, release.sh, deploy-from-github.sh.
- Tek seferlik `patch-*.js` kaldırıldı.
- Her klasörde + `tools/README.md`; AGENTS §10.0 yapı kuralı.
- Komut yolları: `node tools/js/...`, `bash tools/sh/...`.

---

## 2026-07-10 — tools/sh/release.sh: site kökü sürüm kopyası

- `tools/sh/release.sh`: `/oyungrok` → `/var/www/html/` (index + css/js/lang/assets/music).
- Geliştirme yolu: günlük deploy yalnız `/oyungrok/`. `/oyun/` dokunulmaz.

---

## 2026-07-10 — tools/sh/INSTALL.sh: çoklu distro/mimari paket kurulumu

- git, rsync, curl, ca-certificates, openssh, nodejs (+ opsiyonel nginx).
- apt/dnf/yum/zypper/pacman/apk/brew; çoklu mimari.
- `--check-only`, `--yes`, `--with-nginx`, `--help`.

---

## 2026-07-10 — Finalize: bugfix + agent/test senkron

- Haber `source` / tur status: emoji bayrak yok → `countryText` / `countrySource` (Windows harf çifti yok).
- HTML UI: pending/hedef/tavsiye bayrakları `flagLabelHtml`.
- `clearSave` → `GAME.state = null` (menü yan etkisi).
- Danışma maliyeti `instrumentCost` (escalate doğru).
- Olay günlüğü modal i18n + escape.
- `test-consistency.js`: flags, glossary, tunables, music yükler.
- AGENTS §8 bayrak/metin kuralı.

---

## 2026-07-10 — Müzik: ayar %40 iken yeni oyunda çalmama

- `unlock()` bitince `pause()` yeni oyunun `playFile` ile yarışıyordu → buton %40, ses yok.
- `_playGen` + `ensurePlaying`; unlock aktif parçayı kesmez.
- `onGameStart`: ayarlardan `volStep` oku → unlock → play → gecikmeli kick.
- Menüde `bindUnlockOnce` state kalıntısıyla erken start yapmaz (yalnız screen-game active).

---

## 2026-07-10 — Yardım/about metin uyumu (TR+EN) + tooltip i18n

- `help.js` / `lang/*/pack.js`: makro escalate, FX maliyet 3, Sıfırla, yetersiz sermaye, chat hızı, sözlük, Ayarlar/gelişmiş, PNG bayraklar, tur v2.
- Yardım modalı metinleri i18n (`help_intro`, `advice_title`…).
- `CROSS_RULES` → `CROSS_RULES_I18N` (TR+EN); tooltip başlıkları dil bilincili.
- `tools/sync-help-i18n.js`, `tools/patch-help-ui-i18n.js`.

---

## 2026-07-10 — Ülke bayrakları: PNG + Win95 çerçeve

- Windows’ta emoji bayraklar CA/BR harfine düşüyordu → `assets/flags/*.png` (17 ülke).
- `js/data/flags.js`: `GAME.flagHtml` / `flagLabelHtml` + ISO eşlemesi.
- Ülke seçim kartları, header, sol panel, mobil, hedef listesi, harita bilgi paneli.
- CSS: `.flag-win95` (kabartmalı çerçeve, sm/md/lg).

---

## 2026-07-10 — Chat satır ipucu: imleç yanı (desktop); mobilde yok

- Native `title` kaldırıldı (beyaz sistem balonu + çift ipucu).
- Masaüstü: “satıra tıkla sade dil…” metni **imleç yanında** (`#feed-line-tip`).
- Yıldızlı (`*`) terimde gri `#glossary-pop` aynı; satır ipucu o sırada kapanır.
- Mobil (`body.mobile-ui`): beyaz satır ipucu **hiç** gösterilmez (CSS + JS).

---

## 2026-07-10 — Ayarlar: chat hızı (yavaş / hızlı)

- Ana menü **Ayarlar**: Chat hızı — iki yuvarlak seçim (**Yavaş** / **Hızlı**).
- Yavaş: ülke başına **0,5–2 sn** (mevcut tempo).
- Hızlı: ülke başına **0,2 sn** sabit; simülasyon beklemesi de hızlanır.
- `keSettings_oyungrok.chatSpeed` (`slow`|`fast`); `GAME.getChatDelays()`.
- TR/EN i18n; Win95 yuvarlak buton stili.

---

## 2026-07-10 — Mute: ayarlardan kapatınca yeni oyunda müzik susmuyor

- Kök neden: `Music.unlock()` async olarak eski `prev` sesini geri yüklüyordu; buton mute iken element sesi açılıyordu.
- `applyVolumeToAudio` + `a.muted`; fade/play mute’u ezerse hemen hedef basamağa kilitle.
- Ses basamağı `keSettings_oyungrok` (`volStep`/`volume`) ile kalıcı; sayfa açılışı ve `onGameStart` okur.
- `cycleVolume` tercihi kaydeder.

---

## 2026-07-10 — Güvenlik denetimi + README/CHANGELOG senkronu

### Sızıntı taraması (public `global-impact`)
- Git geçmişi: IP, SSH private key, `YAPILACAKLAR.md` **yok** (hiç commit edilmemiş).
- GitHub Secret Scanning alert: **0**. Push protection: **açık**.
- Dependabot security updates: **açık**.
- `main` branch ruleset: silme + force-push engeli (`main-protect`).
- Private `kuresel-etki-secrets` ayrı kalır; free planda private secret scanning yok (GHAS gerekir).

### Dokümantasyon
- README TR/EN: Ayarlar, Gelişmiş ayarlar, sözlük, Sıfırla, maliyet kuralları, tam `localStorage` listesi, script sırası, güvenlik notları.
- CHANGELOG: deploy key dosya adı sadeleştirildi (operasyonel sır azaltımı).
- `AGENTS.md` + `YAPILACAKLAR.example.md`: eksik anahtarlar / güvenlik.

---

## 2026-07-10 — Gelişmiş ayarlar (excel tablo, masaüstü)

- `js/core/tunables.js`: oyun/enstrüman/ülke/timescale sabitleri; `keTunables_oyungrok`.
- Ayarlar altında **Gelişmiş ayarlar** (yalnız desktop): filtre, grup, kaydet, metin ithalat/ihracat, varsayılana dön.
- Her satır: değişken | değer | varsayılan | TR/EN açıklama.
- PolCap regen, FX penaltı/enflasyon gecikmesi, MAX_TURNS, slot, instrument cost… ayarlanabilir.
- AGENTS §10.2 tunables kuralı.

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
- Private repo `deploy/`: kurulum + GitHub’dan çekme scriptleri; nginx gizli path deny snippet.
- Sunucu: `git` + `rsync`; private secrets için **repo-scoped deploy key** (dosya adları public’e yazılmaz).
- Script public `global-impact` + private `kuresel-etki-secrets` çeker; yalnız `/oyungrok` web köküne birleştirir.
- Gizli dosyalar sunucuda da yüklüyse HTTP **403** (`YAPILACAKLAR.md`, `ssh/*`); oyun dosyaları 200.
- Public sarmalayıcı: `tools/deploy-from-github.sh` (asıl script private’da).

### Not
- Deploy key tek private repoya özel; public klon HTTPS.
- ASLA `/oyun/` path; IP/SSH public commit’e girmez.

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
