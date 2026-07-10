# KÜRESEL ETKİ — AGENTS.md (Kalıcı Kurallar ve Mimari)

> Bu dosya ajanlar ve geliştiriciler için **değişmez / korunması gereken** proje bilgisidir.
> Gizli sunucu adresleri, yayın yolları ve **henüz yapılmamış** işler → yerel `YAPILACAKLAR.md`
> (public repoda gitignore; sahibi private `kuresel-etki-secrets` deposunda yedekler).
>
> **Teknoloji:** Saf HTML + CSS + JavaScript (framework yok, build yok).  
> Global: `window.GAME`. Script sırası `index.html` içinde: data → core → ui (mobile → main).

---

## 1. Oyun konsepti (koru)

- Klasik “kazan/kaybet” yok. Amaç: ekonomik enstrüman değişince dünyada ne olduğunu hissettirmek.
- Büyük küresel felaket sonrası ülke yönetimi; yalnızca ekonomik araçlar.
- Tur = **3 ay (1 çeyrek)**. Oyun **60 tur ≈ 15 yıl**. Felaket tur **2–4** arası bir kez.
- Her tur en fazla **4 slot** enstrüman değişikliği. Sürdürmek slot harcamaz.
- Siyasi sermaye: müdahale maliyeti; onay ile yenilenir.
- Gri alan: tespit riski → ilişki çöküşü + misilleme.

---

## 2. Değişmez mimari

```
ekonomi oyunu/
├── index.html                 # Tek sayfa + #mobile-chrome
├── css/style.css              # Win95 + body.mobile-ui (masaüstü stillerine dokunma)
├── assets/world-map.svg       # ISO ülke SVG (CC BY-SA, flekschas/simple-world-map)
├── js/
│   ├── data/
│   │   ├── countries.js       # 17 ülke, RELATIONS, tradeLinks, deps, rates
│   │   ├── instruments.js     # 48 enstrüman — SİLME; eksik eklenebilir
│   │   └── disasters.js       # 10 felaket + sev haritası
│   ├── core/
│   │   ├── state.js           # SAVE_KEY, TURN_JOB_KEY, newGame, migrate
│   │   ├── effects.js         # pulse/sustain/perm, çarpanlar, scaleReserves
│   │   ├── internal.js        # gruplar, onay, istikrar (gov: birlik ≈ demokratik)
│   │   ├── diplomacy.js       # ilişki, ton, relationColor
│   │   ├── news.js            # 80+ şablon (countNewsTemplates)
│   │   ├── ai.js              # v3; buildAIScript / applyAIScriptEntry
│   │   └── turn.js            # beginTurn, finishTurn, skorlar
│   └── ui/
│       ├── charts.js          # layoutCenterPanel: sıkıştır, min 140px’te scroll
│       ├── help.js            # ansiklopedi
│       ├── panels.js          # paneller, enstrüman, sayfalama, testInstrumentPaging
│       ├── screens.js         # menü, harita pan/zoom/touch, AB=İspanya
│       ├── mobile.js          # 5 sekme, döngü, pinch engeli (harita hariç)
│       ├── music.js           # normal → felaket fade 1s → felaket/diplomasi/savaş sırası
│       └── main.js            # onay modalı, runTurnAnimated script modeli
├── test-consistency.js
├── AGENTS.md                  # BU DOSYA
└── YAPILACAKLAR.md            # gizli yollar + açık todo
```

---

## 3. Ülkeler (17 — koru)

| ID | Ad | Not |
|----|-----|-----|
| USA | ABD | |
| CHN | Çin | |
| EU | Avrupa Birliği | Tek varlık; `gov:'birlik'`; haritada üye path’leri boyanır; **nokta İspanya üzerinde**, yazı **altta** |
| JPN | Japonya | |
| IND | Hindistan | |
| GBR | Birleşik Krallık | AB’den ayrı |
| RUS | Rusya | |
| CAN | Kanada | |
| BRA | Brezilya | |
| KOR | G. Kore | |
| AUS | Avustralya | |
| MEX | Meksika | |
| IDN | Endonezya | |
| SAU | Suudi Arabistan | |
| TUR | Türkiye | |
| CHE | İsviçre | |
| ZAF | G. Afrika | |

- **Almanya (DEU) yok** — AB içinde temsil edilir.
- İlişki matrisi simetrik; `newGame` tüm çiftleri 0 ile doldurur, sonra `RELATIONS_INIT`.
- `needsExporter: 'oil'|'food'` — ithalatçıda zayıf silah (~0.35×).

---

## 4. Enstrüman kuralları (koru)

- **Silme yok.** Eksik gerçekçi araç eklenebilir.
- Tipler: `toggle` | `slider` | `numerical`.
- Katman 1–4 + makro (faiz, vergi, harcama, FX, QE…).
- Hedefli enstrüman: `targeted` + `onTarget` (rel, pulse, sustain).
- Proje: `project` tur + `complete` kalıcı base/gBase.
- **Maliyet:** `GAME.instrumentCost(cid, id)`. `escalateCost:true` (faiz/vergi/kamu): taban `cost` + `instrUseCount`. FX sabit **3**; regen penaltısı `floor(fxUses/4)`.
- Onay öncesi: `pendingTotalCost` > polCap → uyarı, tur ilerlemez. **Sıfırla** = `clearPending()`.
- Mobil sayısal adım: `%` içeren unit → **0.25**; diğer (mlr$) → **0.5**.
- Mobil UI: `[4 rakam][birim][▲][▼][Uygula][Vazgeç]` — yükseklik normal `.btn`.
- Desktop enstrüman: yatay sayfalama (`instrPerPage`). Mobil: dikey tüm liste (`per=9999`).

---

## 5. Etki motoru (koru)

- **pulse** / **sustain** / **perm** (addPerm → base veya gBase + legacy).
- Timescales: imm, short, med, long.
- Mean reversion gösterge bazlı hızlar (ölüm sarmalı önlemi).
- Okun: işsizlik hedefe çekme; kur→enflasyon geçişkenliği sınırlı.
- `scaleReserves` varlık dondurmada hedef/güç ölçeği.
- İkincil yaptırım: üçüncü taraf trade spill.
- Numerical sustain: `rates[id]` baseline; yoksa 0 (FX, QE).

---

## 6. Tur / kayıt modeli v2 (koru — kritik)

### localStorage anahtarları
| Anahtar | Amaç |
|---------|------|
| `kureselEtkiSave_oyungrok` | Kalıcı oyun (complete tur sonrası) |
| `kureselEtkiTurnJob_oyungrok` | Yarım tur script (`complete:false`) |
| `keFeedCollapsed_oyungrok` | Feed daraltma |
| `keLang_oyungrok` | Dil tercihi (`tr` / `en`) |
| `keSettings_oyungrok` | Ayarlar paneli (`volStep`/`volume`, `chatSpeed` slow|fast, onay, feed) |
| `keTunables_oyungrok` | Gelişmiş ayarlar — oyun/enstrüman/ülke sabitleri |
| `keGlossSkip_oyungrok` | Haber sözlüğü “bir daha gösterme” (kalıcı) |

**Eski `/oyun/` sürümü `kureselEtkiSave` kullanır — karıştırma / üzerine yazma.**  
**Public commit’e asla:** sunucu IP, SSH private key, gerçek `YAPILACAKLAR.md`, deploy env.

### Onayla ve İlerle
1. Modal: bekleyen enstrüman özeti + “emin misin?”
2. Evet → mobilse **Olaylar (sekme 2)**; sonra `runTurnAnimated`
3. **Plan (tek sefer):** `beginTurn` → `preAiState` clone → `buildAIScript` (tüm AI sırayla, state üzerinde) → state = preAi → job kaydet `complete:false` + SAVE = preAi
4. **Oynatma:** script baştan; her ülke gecikmesi **chat hızı** ayarına bağlı (`GAME.getChatDelays`: yavaş 500–2000 ms, hızlı 200 ms); `applyAIScriptEntry` + haber. Bu sırada kalıcı SAVE yok.
5. **Flag:** `finishTurn` → job sil → `GAME.save()` → mesajlar kalıcı → buton aktif
6. **Kesinti (`complete:false`):** preAi yükle, script **baştan** oynat (ortadan devam etme)

API: `recordAICountry`, `applyAIScriptEntry`, `buildAIScript`, `cloneState`.

---

## 7. AI (koru)

- Skor tabanlı adaylar: öz-bakım, felaket, oyuncu misilleme, projeler, agresyon.
- `AI_PROJECT_PREFS` ülke bazlı.
- Krizde max 3, normalde 2 eylem; siyasi sermaye AI için de geçerli.
- `runAICountry` senkron/test; canlı tur script üzerinden.

---

## 8. UI kuralları (koru)

### Masaüstü
- Win95: gümüş panel, lacivert başlık, kabartmalı buton.
- 3 panel + alt enstrüman bar; orta panelde **scroll yok** → grafik sıkışır; min ~140px’te scroll.
- Harita: pan/zoom (mouse + touch), ilişki **renkli çizgiler** (relationColor), efsane yan panelde.
- mIRC sağ panel; daraltılabilir.
- **Bayraklar:** UI HTML’de `GAME.flagHtml` / `flagLabelHtml` + `assets/flags/*.png` (Win95 çerçeve). Haber `source` / status düz metin: `GAME.countryText` / `countrySource` (emoji yok — Windows CA/BR harfi).

### Mobil (`body.mobile-ui`, genişlik ≤920 veya dikey dar)
| # | Sekme |
|---|--------|
| 0 | Durum |
| 1 | Grafik |
| 2 | Olaylar |
| 3 | Harita |
| 4 | Enstrüman |

- ◀ ▶ + swipe; **döngü** (en sol↔en sağ kaydırma ve oklar).
- Sayfa geneli **pinch zoom kapalı**; haritada pinch/pan **açık** (`touch-action: none` only on map-well).
- Harita modal: tam ekran, info `<details>`, büyük Kapat.
- Viewport gate: yalnızca aşırı küçük ekran (&lt;~300×380).

### Harita özel
- `MAP_ISO.EU` = üye ISO listesi (boyama).
- AB **marker** = `#es` (İspanya) centroid; **label y > nokta** (sadece EU).

### Müzik (`music/`)
| Dosya | Rol |
|-------|-----|
| `normal.mp3` | Oyun başı / felaket öncesi (bitince tekrar) |
| `felaket.mp3` | Felaket anı (normal 1 sn fade-out sonrası) |
| `diplomasi.mp3` | Kriz listesinde 2. |
| `savas.mp3` | Kriz listesinde 3.; sonra felaket’e döner |

- `GAME.Music.onGameStart()` → normal (kayıtta felaket varsa kriz listesi).
- `GAME.Music.onDisaster()` → fade 1000 ms → `felaket.mp3` → ended → diplomasi → savas → felaket…
- Autoplay: ilk pointer/key/touch ile unlock.

---

## 9. Test

```bash
node test-consistency.js
# news_templates >= 80, instrument paging desktop/mobile, ALL_OK
```

Konsolda: `GAME.countNewsTemplates()`, `GAME.testInstrumentPaging()`.

---

## 10. Ajan çalışma kuralları

1. Önce `AGENTS.md` (bu dosya) ve **[CHANGELOG.md](CHANGELOG.md)**.
2. **Kaynak gerçeği:** public GitHub `snipeTR/global-impact` (Küresel Etki / Global Impact). Yerel klasör yalnızca clone/workspace.
3. Gizli deploy / SSH / todo:
   - Yerel `YAPILACAKLAR.md` varsa oku.
   - **Git erişimi varsa** private: `https://github.com/snipeTR/kuresel-etki-secrets`
     (`YAPILACAKLAR.md`, `ssh/*`). Public’e sızdırma.
   - Yoksa yalnızca `YAPILACAKLAR.example.md`.
   - **SSH dayanıklılık (sunucu):** `tools/sh/harden-sshd.sh` → drop-in  
     `/etc/ssh/sshd_config.d/99-gi-keepalive.conf`  
     (UseDNS no, ClientAlive*, MaxStartups, LoginGraceTime).  
     **Yapma:** anahtar değiştirme, Port değiştirme, fail2ban’ı izinsiz agresif kurma,  
     yedeksiz `sshd_config` rewrite. Kilitlenince OCI **Console connection**.
4. **Enstrüman silme.**  
   - **Geliştirme / günlük deploy:** yalnız `/oyungrok/` (`tools/sh/deploy-from-github.sh` / secrets deploy).  
   - **Site kökü (/**) release:** yalnızca bilinçli `tools/sh/release.sh` — otomatik her işte çalıştırma.  
   - **`/oyun/` asla** yazma/silme (eski stabil).
5. Masaüstü düzenini bozmadan mobil değişiklikleri `body.mobile-ui` / media ile sınırla.
6. Kayıt anahtarlarına `_oyungrok` soneki zorunlu (çakışma olmasın).
7. Tur script modelini basitleştirip “sadece AIIndex”e geri alma — kullanıcı v2’yi istedi.
8. Biten işleri YAPILACAKLAR açık listesinden çıkar; yeni kalıcı kuralı buraya yaz.
9. Dokümantasyon: `README.md` (TR) + `README-EN.md` (EN).
10. **CHANGELOG zorunlu:** Her anlamlı değişiklikten sonra `CHANGELOG.md` üstüne tarihli madde ekle (ne / neden / dosyalar). Ajanlar ve sonraki oturumlar buradan tarih okur.
11. **Yayın üçlüsü (zorunlu — her anlamlı iş bitince):**  
    a) **Yerel kaydet** (dosyaları yaz).  
    b) **GitHub public:** `git add` → `git status` (`YAPILACAKLAR.md` / `deviralma.md` yok) → `commit` → `git push origin main` (`snipeTR/global-impact`).  
    c) **Sunucu (geliştirme yolu):** SSH ile  
       `bash ~/global-impact-work/kuresel-etki-secrets/deploy/deploy-from-github.sh`  
       → **`/var/www/html/oyungrok`** — **`/oyun/` yazma**.  
    d) **Site kökü (/**) “release”:** kullanıcı özellikle isterse;  
       günlük işlerde **otomatik root kopyalama yok**.  
       `bash /var/www/html/oyungrok/tools/sh/release.sh --yes`  
    Gizli dosya değiştiyse ayrıca private `kuresel-etki-secrets` push.  
    Kullanıcı “sadece local” demedikçe a–c atlanmaz; **d bilinçli**.

### 10.0 `tools/` yapısı (koru — ajanlar)

```
tools/
  README.md          # yönlendirme
  js/                # Node CLI — runtime DEĞİL
    README.md
    sync-instrument-descs.js
    sync-help-i18n.js
    build-lang-tr.js / build-lang-en.js
    fill-tr-descs-from-data.js
  sh/                # Bash — runtime DEĞİL
    README.md
    INSTALL.sh
    release.sh
    deploy-from-github.sh
    harden-sshd.sh       # sunucu SSH dayanıklılık (drop-in; port/key değiştirmez)
    install-ops-to-home.sh  # → ~/gi-ops sarmalayıcıları
```

- **Tek seferlik `patch-*.js` ekleme / bırakma.** Kalıcı iş kaynak dosyaya veya `tools/js` senkron scriptlerine.
- Yeni Node aracı → `tools/js/`; shell → `tools/sh/`. README’leri güncelle.
- Node script kök yolu: `path.join(__dirname, '../..')`.
- Oyun runtime: `index.html` → `js/`, `lang/`, `css/` — **tools yüklenmez**.
- Sunucu SSH sertleştirme: `bash tools/sh/harden-sshd.sh --yes` (sshd -t + reload; yedek `/etc/ssh/backup-gi/`).
- **Sunucu home ops:** `~/gi-ops/` (`install-ops-to-home.sh --yes`).  
  Günlük: `~/gi-ops/update-dev.sh` (oyungrok). Sürüm: `~/gi-ops/update-release.sh` veya `release.sh`.

### 10.0b Yardım / about metinleri

- Baseline TR: `js/ui/help.js` (`HELP_TOPICS`, `ABOUT_MAIN_HTML`).
- Pack override: `lang/tr|en/pack.js` → `help` + `about` (`node tools/js/sync-help-i18n.js`).
- Yeni mekanik (maliyet, ayar, UI): **help.js + TR/EN about/help + CHANGELOG** birlikte güncelle.
- Tooltip çapraz kurallar: `GAME.CROSS_RULES_I18N` (tr/en).

### 10.1 Enstrüman tooltip / açıklama senkronu (zorunlu)

Hover özet (`GAME.instrumentDetail`) metni `ins.desc` + dinamik maliyet + `CROSS_RULES` kullanır.

Enstrüman **davranış / maliyet / desc** değişince **üç yer** güncel olmalı:

| Kaynak | Ne |
|--------|-----|
| `js/data/instruments.js` | `name` / `desc` (TR baseline) + `cost` / `escalateCost` / etkiler |
| `lang/tr/pack.js` → `instruments[id]` | TR `name` + `desc` (i18n apply) |
| `lang/en/pack.js` → `instruments[id]` | EN `name` + `desc` |

Kontrol:

```bash
node tools/js/sync-instrument-descs.js --check
```

Maliyet/kurallar için `js/ui/panels.js` → `CROSS_RULES_I18N` / `getCrossRules` ve `instrumentDetail` dinamik notları da güncelle.

### 10.2 Gelişmiş ayarlar / tunables (masaüstü)

- Kod: `js/core/tunables.js` — `buildTunableRows`, `applyStoredTunables`, `keTunables_oyungrok`.
- UI: Ayarlar → **Gelişmiş ayarlar** (excel tablo; mobil gizli).
- Yeni sabit: `buildTunableRows` içine `get/set` + `desc {tr,en}` ekle; varsayılan `captureTunableDefaults` kapsamına girsin.
- Enstrüman cost/risk/min/max ve ülke `ind`/`rates` satırları otomatik üretilir.
- Değişince: CHANGELOG + push + deploy (yayın üçlüsü).

### 10.3 Haber akışı sözlüğü (`glossary.js`)

Dünya olayları satırlarında teknik terimler `*` ile işaretlenir (`GAME.annotateGlossaryText`).

- Sözlük: `js/data/glossary.js` → `GAME.GLOSSARY_BY_LANG.tr` / `.en`
- Yeni terim: **TR ve EN** birlikte ekle (uzun ifadeler önce eşleşir).
- Açıklama: günlük dil; zorunlu teknik kelime varsa aynı metinde sadeleştir.
- Sonra CHANGELOG + git push + sunucu deploy (madde 11 / yayın üçlüsü).

---

## 11. Çoklu dil (i18n) — koru

```
lang/
  i18n.js           # çekirdek: register, t, setLang, applyAll
  tr/pack.js        # Türkçe (varsayılan / kaynak)
  en/pack.js        # İngilizce
```

- **localStorage:** `keLang_oyungrok` (dil tercihi).
- **API:** `GAME.t('ui.new_game')`, `GAME.i18n.setLang('en')`, `GAME.aiMsg(key, vars)`.
- **UI host:** `[data-lang-switcher]` — menü sağ alt + masaüstü oyun penceresi sağ alt + mobil kabuk sağ alt (3 harfli select).
- **Paket bölümleri:** `ui`, `instruments`, `countries`, `disasters`, `layers`, `groups`, `globals`, `indMeta`, `toneMeta`, `newsCats`, `diplo`, `econTitle`, `econBody`, `globalTitle`, `globalBody`, `risk`, `events`, `projectDone`, `projectProg`, `detection*`, `disasterFlavor`, `help`, `about`, `chartSeries`, `ai`, `gov`.
- **gov kodları çevrilmez** (`demokratik` / `otoriter` / `hibrit` / `birlik`) — görünen etiket `GAME.govLabel(gov)`.
- Yeni dil eklemek: `lang/<kod>/pack.js` yaz → `GAME.i18n.supported` (`short: 'XX'`) → `index.html` script tag.
- Yeni UI metni: `data-i18n` veya `GAME.t('ui.…')` + her dil paketinde anahtar.
- `tools/js/build-lang-*.js` paket üretici (runtime zorunlu değil).
- `tools/sh/INSTALL.sh` — çoklu distro/mimari paket kontrol + kurulum.
- `tools/sh/release.sh` — bilinçli site kökü kopyası (oyungrok → `/var/www/html`).
