# KÜRESEL ETKİ

> **English:** [README-EN.md](README-EN.md) · **Türkçe (bu dosya)**

**Sıra tabanlı ekonomik devlet yönetimi simülasyonu.**  
Büyük bir küresel felaket sonrası seçtiğin ülkeyi **yalnızca ekonomik enstrümanlarla** yönetirsin. Her faiz, yaptırım veya projenin kısa / orta / uzun vadede tüm dünyaya nasıl yayıldığını görürsün.

> Klasik “kazan-kaybet” yok. Amaç: *“Bu aracı değiştirdiğimde dünyada gerçekten ne oluyor?”* sorusunu yaşamak.

| | |
|--|--|
| **Teknoloji** | Saf HTML + CSS + JavaScript (framework yok, build yok) |
| **Platform** | Masaüstü tarayıcı + mobil dikey (9:16 sekmeli arayüz) |
| **Süre** | 60 tur ≈ 15 yıl (1 tur = 3 ay / 1 çeyrek) |
| **İçerik** | 17 ülke · 48 enstrüman · 10 felaket · AI rakip ülkeler |
| **Diller** | Türkçe + English (`lang/` modüler paketler; menüde **TR/EN** dropdown) |
| **Repo (public)** | [github.com/snipeTR/global-impact](https://github.com/snipeTR/global-impact) |
| **Gizli notlar** | Private: [kuresel-etki-secrets](https://github.com/snipeTR/kuresel-etki-secrets) *(yalnız yetkili erişim)* |

---

## Bu README kim için? (3 aşama)

| Aşama | Kim okusun? | Ne bulacak? |
|-------|-------------|-------------|
| **[1. Basit kullanıcılar](#1-basit-kullanıcılar)** | Sadece oynamak isteyenler | Kurulum, kurallar, ekranlar, ipuçları, SSS |
| **[2. Programcılar](#2-programcılar)** | Kod okuyan / katkı yapanlar | Mimari, veri modelleri, enstrüman ekleme, test |
| **[3. Yapay zekâ ajanları](#3-yapay-zekâ-ajanları)** | LLM / agent araçları | Dokunulmaz kurallar, API haritası, gizli repo, checklist |

Kalıcı / değişmez kurallar (kaynak): **[AGENTS.md](AGENTS.md)**  
Açık todo şablonu: **[YAPILACAKLAR.example.md](YAPILACAKLAR.example.md)**  
English README: **[README-EN.md](README-EN.md)**

---

# 1. Basit kullanıcılar

Bu bölüm **hiç kod bilmeden** oynamak içindir.

## 1.0 Dil seçimi

- Ana menü **sağ altta** açılır liste: **TR** / **EN** (3 harfli kod).
- **Masaüstü oyun:** pencere **içinde sağ alt** aynı select.
- **Mobil:** mobil pencere **içinde sağ alt** (alt sekmelerin üstü).
- Seçim tarayıcıda hatırlanır (`keLang_oyungrok`).
- Dil ayrıca **Ana menü → Ayarlar** içinden de değiştirilebilir.

## 1.0b Ayarlar ve Gelişmiş ayarlar

### Ayarlar (ana menü)
Ana menüde **Ayarlar**: dil, ses basamağı, **chat hızı** (yavaş / hızlı yuvarlaklar), yeni oyun onayı, olay akışını daralt (masaüstü), sözlük “bir daha gösterme” listesini sıfırla.  
- **Yavaş:** AI ülkeler turda ~0,5–2 sn arayla (varsayılan).  
- **Hızlı:** her ülke **0,2 sn**.  
Tercihler bu tarayıcıda saklanır (`keSettings_oyungrok`); sunucuya gitmez.

### Gelişmiş ayarlar (yalnız masaüstü)
Ayarlar → **Gelişmiş ayarlar**: excel benzeri tablo — oyun sabitleri, enstrüman maliyetleri, ülke başlangıç değerleri.  
Her satır: **değişken | değer | varsayılan | açıklama** (TR/EN). Filtre, grup, kaydet, metin ithalat/ihracat, varsayılana dön.  
Mobilde bu bölüm **görünmez**. Saklama: `keTunables_oyungrok`.

## 1.1 Oyunu nasıl açarım?

### Masaüstü

1. Projeyi bilgisayarına indir (ZIP) veya klonla.  
2. **En kolay:** `index.html` dosyasına çift tıkla → tarayıcıda açılır.  
3. **Önerilen:** klasörde terminal / PowerShell açıp:

```bash
node serve.js
```

Sonra tarayıcıda: **http://localhost:8123**

> Node.js yoksa da tarayıcıda `index.html` yeter. Müzik ve bazı tarayıcı kısıtları için HTTP sunucu daha temiz çalışır.

### Telefon / tablet

- Aynı adresi telefondan aç (aynı Wi‑Fi’de bilgisayar sunucusu veya yayınladığın site).  
- Ekranı **dikey** tut. Oyun 5 sekmeye bölünür.  
- Çok küçük ekranlarda “ekran uygun değil” uyarısı çıkabilir; pencereyi büyüt veya tablete geç.

### Ses

- Tarayıcılar otomatik müziği engelleyebilir → **bir kez ekrana tıkla / dokun**.  
- Başlangıç sesi **%40**.  
- Yardım (`?`) butonunun yanındaki ses düğmesi döngüsü:

| İkon | Seviye |
|------|--------|
| 🔇 | Sessiz (%0) |
| 🔉 | Normal (%40) |
| 🔊 | Tam (%100) |

## 1.2 30 saniyelik özet

1. **Yeni Oyun** → ülke seç (ör. Türkiye, ABD, AB, Çin…).  
2. İlk turlar sakin; **2.–4. tur** civarı rastgele **bir küresel felaket** gelir.  
3. Her turda en fazla **4 enstrüman** değiştirebilirsin (faiz, stok, yaptırım, proje…).  
4. **Onayla ve İlerle** → özet çıkar → **Evet** dersen tur işlenir.  
5. Diğer ülkeler tepki verir (haber akışı / mobilde **Olaylar** sekmesi).  
6. 60 tur bitince **miras** ve 5 performans skoru gösterilir.  
7. Oyun **otomatik kaydolur**; menüden **Devam Et**.

## 1.3 Temel kurallar (ezberle)

| Kural | Ne demek? |
|--------|-----------|
| **4 slot** | Turda en fazla 4 *değişiklik*. Politikayı “olduğu gibi bırakmak” slot harcamaz. |
| **Siyasi sermaye** | Her müdahale puan harcar. Yetersizse tur **onaylanamaz** (uyarı + buton kilit). |
| **Maliyet artışı** | Faiz / vergi / kamu: taban **2**, her onayda **+1**. Döviz müdahalesi: **3**; her 4 kullanımda regen cezası. |
| **Sıfırla** | Olay Günlüğü yanında: onay öncesi bekleyen tüm enstrüman değişikliklerini iptal. |
| **Zaman** | Bazı etkiler hemen, bazıları yıllar sonra gelir. Grafikleri oku. |
| **Proje** | Başlattığın uzun işler slot harcamadan ilerler; bitince **kalıcı miras** bırakır. |
| **Gri alan** | Casusluk, dezenformasyon vb. tespit edilirse skandal + misilleme. |
| **Hedefli araç** | Bazı enstrümanlar başka bir ülkeye yöneliktir (yaptırım, yardım…). |
| **Felaket müziği** | Felaket gelince sakin müzik solar; kriz müzikleri sırayla çalar. |
| **Sözlük (*)** | Haber satırında yıldızlı terimler: hover/tık ile sade dil açıklama. |

## 1.4 Göstergeler ne anlama geliyor?

Sol panelde (mobilde **Durum** sekmesinde) ülkenin nabzını görürsün:

| Gösterge | Kısa anlam |
|----------|------------|
| **Büyüme** | Ekonominin çeyreklik temposu |
| **Enflasyon** | Fiyat artışı; çok yüksekse istikrar ve onay erir |
| **İşsizlik** | İşsizlik oranı |
| **Rezerv** | Döviz / varlık tamponu (mlr $) |
| **Borç** | Kamu borcu (GSYH %) |
| **Kur** | Para birimi gücü (başlangıç 100) |
| **Ticaret** | Dış ticaret dengesi |
| **Etki** | Küresel nüfuz (0–100) |
| **Onay** | Halk desteği |
| **İstikrar** | İç düzen; düşükse kriz riski |
| **Siyasi sermaye** | Bu turda ne kadar müdahale yapabileceğin |

## 1.5 Enstrüman katmanları (48 araç)

Alt menüde (mobilde **Enstrüman** sekmesi) 4 katman vardır:

| Katman | Ad | Ne işe yarar? | Risk |
|--------|-----|----------------|------|
| **1** | Yapısal Strateji | Uzun vadeli güç: rezerv para, altyapı, Ar-Ge, standartlar… | Genelde düşük; yavaş |
| **2** | Konjonktürel Müdahale | Faiz, vergi, harcama, yaptırım, stok, enerji… | Orta |
| **3** | Piyasa Operasyonları | Casusluk, jawboning, patent, sertifikasyon… | Yüksek (tespit) |
| **4** | Gri Alan | NGO, yolsuzluk ağı, isyan finansmanı, lawfare… | Çok yüksek |

### Türler

- **Aç/kapa (toggle):** Aç veya kapat.  
- **Kaydırıcı (slider):** Yoğunluk seç.  
- **Sayısal (numerical):** Faiz, vergi, QE gibi rakam gir (mobilde ▲▼ adımları var).  
- **Hedefli:** Önce hedef ülke seçersin.  
- **Proje:** Birkaç tur sürer; bitince kalıcı etki.

### Örnek araçlar (hepsi değil)

**Makro:** Politika faizi, vergi oranı, kamu harcaması, döviz müdahalesi, QE.  
**Yapısal:** Rezerv para statüsü, SWIFT rakibi, CBDC, altyapı kuşağı, Brüksel etkisi.  
**Baskı:** İkincil yaptırım, varlık dondurma, enerji/gıda silahı, gümrük tarifesi.  
**Gri:** Ekonomik casusluk, dezenformasyon, nüfuz ticareti.

> Oyundaki **Yardım (`?`)** butonu her aracı ansiklopedi gibi anlatır. Tereddütte oraya bak.

## 1.6 Ülkeler (17)

Avrupa Birliği **tek varlık**tır; Almanya ayrı seçilemez (AB içinde temsil edilir). İngiltere (GBR) AB’den **ayrıdır**.

| ID | Ülke | Zorluk (yaklaşık) | Tarz özeti |
|----|------|-------------------|------------|
| USA | ABD | Zor | Küresel etki, rezerv para |
| CHN | Çin | Orta-Zor | Yapısal proje + tedarik zinciri |
| EU | Avrupa Birliği | Orta | Regülasyon, ihracat, diplomasi |
| JPN | Japonya | Orta | Teknoloji + finans |
| IND | Hindistan | Orta | Uzun vadeli reform |
| GBR | Birleşik Krallık | Orta | Finans + soft power |
| RUS | Rusya | — | Enerji / jeopolitik baskı |
| CAN | Kanada | — | Kaynak + müttefik ağ |
| BRA | Brezilya | — | Tarım / emtia |
| KOR | G. Kore | — | Teknoloji ihracatı |
| AUS | Avustralya | — | Madencilik / müttefik |
| MEX | Meksika | — | ABD ticareti |
| IDN | Endonezya | — | Yükselen Asya |
| SAU | Suudi Arabistan | — | Enerji |
| TUR | Türkiye | — | Koridor / denge |
| CHE | İsviçre | — | Finans / tarafsızlık |
| ZAF | G. Afrika | — | Maden / bölgesel etki |

Ülke seçim ekranında kısa açıklama ve başlangıç göstergeleri görünür.

## 1.7 Felaket

- Oyun başında **tek** küresel felaket planlanır (tur **2–4** arası).  
- Felaket geldiğinde: göstergeler sarsılır, haber akışı dolar, müzik kriz listesine geçer.  
- Amacın “kazanmak” değil; felakete **ekonomik araçlarla** uyum sağlamak ve yan etkileri izlemektir.

## 1.8 Ekranlar

### Masaüstü

| Bölge | İçerik |
|-------|--------|
| **Sol** | Göstergeler, istikrar, aktif politikalar |
| **Orta** | Zaman serisi grafikler |
| **Sağ** | mIRC tarzı dünya olayları akışı (daraltılabilir) |
| **Alt** | 4 katmanlı enstrüman menüsü + sayfalama |
| **Üst** | Ülke şeritleri (ilişki rengi), tarih, yardım, ses, **Onayla ve İlerle** |

### Mobil sekmeler (kaydır veya ◀ ▶)

| # | Sekme | Ne var? |
|---|--------|---------|
| 0 | **Durum** | Ekonomi ve iç politika özeti |
| 1 | **Grafik** | Zaman serileri |
| 2 | **Olaylar** | Haber / diplomasi akışı |
| 3 | **Harita** | Ülke listesi → dünya haritası |
| 4 | **Enstrüman** | Tüm araçlar (dikey liste) |

**İpuçları**

- En solda bir kez daha sağa kaydırırsan en sağa (veya tersi) **döngü** ile atlanır.  
- Turu onayladıktan sonra mobil otomatik **Olaylar** sekmesine geçer (tepki akışını izle).  
- Sayfanın geneli iki parmakla zoomlanmaz; **sadece haritada** pinch zoom vardır.  
- **Olaylar / feed:** masaüstünde satır hover → imleç yanı ipucu; yıldızlı (`*`) terim → gri açıklama; satıra tık → sade dil özeti. Mobilde beyaz satır ipucu yok (yalnız tık).  
- **Grafik çipleri:** masaüstünde hover ipucu; mobilde 1. tık seçim, aynı çipe 2. tık açıklama.

## 1.9 Harita

1. Ülke adına / listeden tıkla → dünya haritası açılır.  
2. **Yeşil çizgi** = iyi ilişki, **kırmızı** = gerilim (seçili ülkeye göre).  
3. Sürükle = pan; pinch = zoom (mobilde harita alanında).  
4. **AB** noktası İspanya üzerinde; yazısı noktanın **altında**.  
5. AB üyesi ülkelerin toprakları haritada boyanır (tek AB varlığı).

## 1.10 Oyun sonu skorları

60. turdan sonra 5 boyut:

| Skor | Ne ölçer? |
|------|-----------|
| **Kendi ülke performansı** | Büyüme, istikrar, rezerv vb. genel sağlık |
| **Küresel istikrar katkısı** | Dünyayı yakıp yakmadığın |
| **Miras gücü** | Bıraktığın kalıcı değişimler |
| **Stratejik tutarlılık** | Başlattığın projeleri tamamlama oranı |
| **Risk yönetimi** | Tespit edilen gri operasyonlar (az = iyi) |

Ayrıca metin olarak **miras listesi** (kalıcı kaymalar) arşivlenir.

## 1.11 Pratik ipuçları

1. **İlk 2 tur:** Felaket gelmeden rezerv, faiz ve stok durumuna bak; panik yapma.  
2. **Slotları boşa harcama:** Her tur 4 değişiklik zorunlu değil.  
3. **Grafikleri oku:** Enflasyon “hemen” düşmez; 2–4 tur sonra görürsün.  
4. **Proje sabrı:** 5–9 yıllık işler bitince miras verir; yarıda bırakma.  
5. **İlişki rengi:** Üst şeritteki bayrak renkleri o ülkeyle ilişkinin özetidir.  
6. **Gri alan:** Büyük baskı için cazip; yakalanırsan skor ve ilişki çöker.  
7. **Kaydetme:** Ayrı “Kaydet”e gerek yok; tur bittikçe otomatik kaydolur.

## 1.12 Sık sorulanlar

**Kayıt nerede?**  
Tarayıcının kendi hafızasında (`localStorage`). Başka bilgisayara / tarayıcıya taşınmaz. Gizli modda silinebilir.

**“Tur…” butonu kilitli?**  
Tur işleniyor demektir (AI ülkeler sırayla tepki veriyor). Bitince açılır. Yarıda sayfa yenilersen tepkiler **baştan** oynatılır; yarım kayıt bozulmaz.

**Kazanma koşulu var mı?**  
Yok. Amaç etkiyi keşfetmek; sonda 5 skorla değerlendirilirsin.

**Müzik çalmıyor?**  
Önce ekrana bir kez tıkla. Ses düğmesinin sessizde olmadığından emin ol.

**Mobilde harita kaymıyor?**  
Harita alanında tek parmakla sürükle; pinch ile yakınlaştır. Sayfanın geri kalanında zoom kapalıdır (bilerek).

**Eski bir sitedeki kaydım kayboldu mu?**  
Bu sürüm kayıt anahtarlarını ayrı tutar (`…_oyungrok`). Eski `/oyun/` kaydıyla karışmaz.

---

# 2. Programcılar

Bu bölüm kod tabanını anlamak ve katkı yapmak içindir.

## 2.1 Gereksinimler

- Modern tarayıcı (Chrome / Edge / Firefox / Safari)  
- İsteğe bağlı: **Node.js** 18+ (`serve.js` ve `test-consistency.js` için)

Bağımlılık yöneticisi yok: **npm install yok**, bundler yok, framework yok.

## 2.2 Çalıştırma

```bash
git clone https://github.com/snipeTR/global-impact.git
cd global-impact

# Linux/macOS: yayın + dev paketlerini kontrol/kur (git, rsync, curl, node, …)
bash tools/sh/INSTALL.sh
# bash tools/sh/INSTALL.sh --check-only
# bash tools/sh/INSTALL.sh --with-nginx

node serve.js
# → http://localhost:8123

# Araçlar: tools/js (Node) · tools/sh (bash) — oyun runtime değil
# Sunucu:
#   Geliştirme: …/oyungrok/  ← deploy-from-github
#   Site kökü release: bash tools/sh/release.sh --yes
#   Eski stabil: …/oyun/  (dokunma)
```

`serve.js` yalnızca statik dosya sunar. `index.html` dosya protokolüyle de açılabilir; müzik / CORS için HTTP tercih edilir.

## 2.3 Çoklu dil (`lang/`)

| Dosya | Rol |
|-------|-----|
| `lang/i18n.js` | `GAME.t`, `setLang`, `applyAll`, dil seçici |
| `lang/tr/pack.js` | Türkçe paket (varsayılan) |
| `lang/en/pack.js` | İngilizce paket |

- Ana menü sağ alt: `<select>` ile **TR / EN**.
- Tercih: `localStorage` → `keLang_oyungrok`.
- Yeni dil: `lang/<kod>/pack.js` + `GAME.i18n.supported` (+ `short: 'XX'`) + `index.html` script.
- Ayrıntı: [AGENTS.md §11](AGENTS.md).

## 2.4 Proje ağacı

```text
global-impact/
├── index.html              # Tüm ekranlar + #mobile-chrome kabuğu
├── css/style.css           # Win95 tema + body.mobile-ui
├── lang/                   # i18n çekirdek + tr/ + en/
├── assets/
│   ├── world-map.svg       # ISO path’li dünya haritası
│   └── flags/*.png         # 17 ülke bayrağı (Win95 çerçeveli UI)
├── music/                  # normal, felaket, diplomasi, savas
├── js/
│   ├── data/
│   │   ├── countries.js    # 17 ülke, ilişkiler, trade, deps, rates
│   │   ├── instruments.js  # 48 enstrüman — SİLME; ekleme serbest
│   │   ├── disasters.js    # 10 felaket + şiddet haritası
│   │   └── glossary.js     # haber * terimleri TR/EN
│   ├── core/
│   │   ├── state.js        # SAVE_KEY, newGame, migrate, save/load
│   │   ├── tunables.js     # gelişmiş ayarlar (masaüstü excel tablo)
│   │   ├── effects.js      # pulse / sustain / perm motoru
│   │   ├── internal.js     # gruplar, onay, istikrar
│   │   ├── diplomacy.js    # ilişki, ton, relationColor
│   │   ├── news.js         # 80+ haber şablonu
│   │   ├── ai.js           # skorlu plan; buildAIScript / applyAIScriptEntry
│   │   └── turn.js         # beginTurn, finishTurn, end scores
│   └── ui/
│       ├── charts.js       # grafik + hover/tap ipuçları
│       ├── help.js         # oyun içi ansiklopedi
│       ├── panels.js       # paneller, enstrüman UI, sözlük feed
│       ├── screens.js      # menü, ayarlar, advanced, harita
│       ├── mobile.js       # 5 sekme, swipe, döngü
│       ├── music.js        # fade + playlist + ses basamakları
│       └── main.js         # onay modalı, runTurnAnimated, resume
├── tools/
│   ├── js/                 # Node CLI (senkron/build) — runtime değil
│   └── sh/                 # INSTALL, release, deploy sarmalayıcı
├── CHANGELOG.md
├── test-consistency.js
├── serve.js
├── AGENTS.md               # Değişmez kurallar
├── YAPILACAKLAR.example.md # Public todo şablonu (gizli yok)
├── README.md / README-EN.md
└── .gitignore              # YAPILACAKLAR.md, *.key, ssh, .env public’te yok
```

## 2.5 Mimari kararlar

| Konu | Karar | Neden |
|------|--------|--------|
| Framework | Yok — `window.GAME` | Basit deploy, sıfır build |
| Script sırası | data → core → ui | Bağımlılık zinciri net |
| State | Tek `GAME.state` | Kaydet / yükle / clone kolay |
| Kayıt | `localStorage` `*_oyungrok` | Eski `/oyun/` ile çakışmasın |
| AI turu | Plan → gecikmeli replay | Animasyon + yenilemede güvenlik |
| Mobil | DOM panelleri sekmeye **taşınır** | Desktop CSS bozulmaz |
| Tema | Win95 | Bilinçli estetik |

### Script yükleme sırası (`index.html`)

```text
lang/i18n → tr/pack → en/pack
→ countries → instruments → disasters → glossary
→ state → tunables → effects → internal → diplomacy → news → ai → turn
→ charts → help → music → panels → screens → mobile → main
```

Sırayı bozma: `tunables` data’dan sonra; `main` en sonda; `mobile` panellere, `ai` effects’e bağlıdır.

## 2.5 State ve kayıt

### localStorage anahtarları

| Anahtar | Amaç |
|---------|------|
| `kureselEtkiSave_oyungrok` | Kalıcı oyun (yalnız **tamamlanmış** tur sonrası) |
| `kureselEtkiTurnJob_oyungrok` | Yarım tur AI script (`complete: false`) |
| `keFeedCollapsed_oyungrok` | Sağ feed daraltma tercihi |
| `keLang_oyungrok` | Dil (`tr` / `en`) |
| `keSettings_oyungrok` | Ayarlar (`volStep`, `chatSpeed`, …) |
| `keTunables_oyungrok` | Gelişmiş ayarlar (sabitler) |
| `keGlossSkip_oyungrok` | Sözlük “bir daha gösterme” |

Bayrak API: `GAME.flagHtml` / `flagLabelHtml` (UI), `GAME.countryText` / `countrySource` (haber metni).

Eski sürüm `kureselEtkiSave` kullanır — **karıştırma**.

### Tipik state alanları (özet)

- `player`, `turn`, `year` / çeyrek  
- `countries[cid].ind`, `.internal`, `.rates`, aktif enstrümanlar  
- `relations`, `pulses`, `sustains`, `legacy`  
- `messages` (haber akışı)  
- `disaster` planı ve uygulanma durumu  

`GAME.cloneState` tur planında snapshot için kullanılır.

## 2.6 Tur çözümleme (v2 — kritik)

Canlı oyunda **asla** “AI’yi senkron çalıştır + yarım index’ten devam” modeli kullanılmaz.

```text
Oyuncu "Onayla" → modal onay
        ↓
beginTurn()
        ↓
preAiState = clone(state)
buildAIScript()     ← tüm AI hamleleri state üzerinde planlanır
state = preAiState  ← plan yan etkileri geri alınır
job = { preAiState, script, complete:false } → localStorage
SAVE = preAi (kalıcı kayıt henüz final değil)
        ↓
script baştan oynat (ülke başına chat hızı: yavaş ~500–2000 ms / hızlı 200 ms)
  applyAIScriptEntry + haber satırı
        ↓
finishTurn() → job sil → GAME.save() → mesajlar kalıcı
```

**Sayfa yenileme (`complete:false`):**  
`preAiState` yüklenir, script **baştan** oynatılır (ortadan `AIIndex` ile devam **yok**).

API: `runTurnAnimated`, `tryResumeTurnJob`, `buildAIScript`, `applyAIScriptEntry`, `recordAICountry`.

## 2.7 Etki motoru (kısa)

| Tür | Yaşam | Kullanım |
|-----|--------|----------|
| **pulse** | Kısa süreli şok | Anlık şok, felaket, tek seferlik darbe |
| **sustain** | Süre / decay | Politika sürerken devam eden etki |
| **perm** | Kalıcı | Proje bitişi, miras, base / gBase kayması |

- Zaman ölçekleri: imm / short / med / long  
- Mean reversion: göstergeler aşırı uçtan yavaşça döner (ölüm sarmalı önlemi)  
- Ticaret spill + `deps` (oil, food, chip, dollar, ship) küresel yayılım  
- `scaleReserves`: varlık dondurma vb. güç ölçeği  

Detay: `js/core/effects.js`.

## 2.8 Enstrüman şeması

`js/data/instruments.js` içinde tipik alanlar:

```js
{
  id: 'policy_rate',
  name: 'Merkez Bankası Politika Faizi',
  layer: 2,                 // 1..4
  type: 'numerical',        // toggle | slider | numerical
  // targeted: true,        // hedef ülke ister
  // risk: 0..3,            // gri alan tespit riski
  // cost: 8,               // siyasi sermaye
  // project: 20,           // tur cinsinden süre
  // onApply / onTarget / complete  // etki tanımları
}
```

### Yeni enstrüman eklerken

1. **Silme yok** — mevcut `id`’leri kaldırma.  
2. `INSTRUMENTS` dizisine ekle; `id` benzersiz olsun.  
3. Etki yollarını `effects` API’sine bağla (`addPulse`, sustain, `addPerm`).  
4. Hedefliyse `targeted` + `onTarget` ve UI hedef seçimini doğrula.  
5. Yardım metni: `help.js` veya enstrüman `desc` alanları.  
6. AI aday üretimi gerekirse `ai.js` skorlarına bağla.  
7. `node test-consistency.js` ve tarayıcıda desktop + mobil dene.

### Katman isimleri

```text
1 Yapısal Strateji
2 Konjonktürel Müdahale
3 Piyasa Operasyonları
4 Gri Alan Taktikleri
```

### Mobil sayısal adımlar

- Unit içinde `%` → adım **0.25**  
- Diğer (ör. mlr$) → adım **0.5**  
- Düzen: `[4 rakam][birim][▲][▼][Uygula][Vazgeç]` — yükseklik normal `.btn`

## 2.9 AI (özet)

- Skor tabanlı aday listesi: öz-bakım, felaket tepkisi, oyuncuya misilleme, projeler, agresyon.  
- `AI_PROJECT_PREFS` ülke bazlı proje tercihi.  
- Krizde max **3**, normalde max **2** eylem; siyasi sermaye AI için de geçerli.  
- Canlı tur: yalnızca script üzerinden.  
- Test / senkron: `runAICountry` / `commitTurn` (UI animasyonu olmadan).

## 2.10 UI notları

### Masaüstü

- Win95: gümüş panel, lacivert başlık, kabartmalı buton.  
- Orta panelde scroll **yok** → grafik sıkışır; min ~140px’te scroll açılır.  
- Harita: mouse + touch pan/zoom; ilişki renkli çizgiler (`relationColor`).  

### Mobil (`body.mobile-ui`)

- Tetik: genişlik ≤920 veya dikey dar ekran.  
- 5 sekme; swipe + oklar; kenarlarda **wrap**.  
- Enstrüman: dikey tam liste (`per=9999`); desktop yatay sayfalama.  
- DOM panelleri sekmeye taşınır — masaüstü layout CSS’ine dokunma.

### Müzik

| Dosya | Rol |
|-------|-----|
| `normal.mp3` | Felaket öncesi loop |
| `felaket.mp3` | Kriz listesi 1 (normal 1 sn fade sonrası) |
| `diplomasi.mp3` | Kriz 2 |
| `savas.mp3` | Kriz 3 → sonra felaket’e döner |

`GAME.Music.onGameStart()`, `onDisaster()`, ses basamakları `0 / 0.4 / 1`.

## 2.11 Test

```bash
node test-consistency.js
```

Beklenen:

- Haber şablon sayısı ≥ 80  
- Enstrüman sayfalama desktop / mobil tutarlı  
- Çıktı: `ALL_OK`

Tarayıcı konsolu:

```js
GAME.countNewsTemplates()
GAME.testInstrumentPaging()
```

## 2.12 Katkı kuralları

1. **Enstrüman silme.** Eksik araç eklenebilir.  
2. Masaüstü düzenini bozmadan mobil stilleri `body.mobile-ui` altında tut.  
3. Gizli sunucu / SSH / kişisel path **asla** bu **public** repoya commit etme.  
4. `YAPILACAKLAR.md` gitignore’dadır — şablon: `YAPILACAKLAR.example.md`.  
5. Gizli yedek (yetkili): private **[kuresel-etki-secrets](https://github.com/snipeTR/kuresel-etki-secrets)** (`YAPILACAKLAR.md`, `ssh/*`).  
6. Kalıcı davranış kuralı → `AGENTS.md`; açık iş → yerel / private todo.  
7. Framework / build pipeline ekleme (açık talep olmadıkça).

### Git akışı

```bash
git add -A
git status    # YAPILACAKLAR.md listede olmamalı
git commit -m "açıklama"
git push
```

Repo: https://github.com/snipeTR/global-impact

## 2.13 Bilinen açık işler (örnek)

Şablon listesi `YAPILACAKLAR.example.md` içinde; güncel yerel liste geliştiricide:

- Etki büyüklüklerinin oynanışa göre ince ayarı  
- Grafik overlay (müdahale işaretleri)  
- Opsiyonel “ne olurdu eğer” karşılaştırma modu  

---

# 3. Yapay zekâ ajanları

> Kod değiştiren LLM / agent’lar için. İnsan oyuncu §1 ile yetinir; insan geliştirici §2 + AGENTS.  
> **Tek doğruluk kaynağı (kurallar):** [AGENTS.md](AGENTS.md) — bu bölüm özet + operasyonel haritadır.

## 3.1 Oturum başlangıcı (zorunlu sıra)

1. **[AGENTS.md](AGENTS.md)** — değişmez model (ülkeler, tur v2, UI, müzik, enstrüman, i18n).  
2. **Gizli / deploy bilgisi (öncelik sırası):**  
   - Yerel `YAPILACAKLAR.md` (gitignore; public clone’da yoktur).  
   - **Git erişimin varsa** private repo:  
     **https://github.com/snipeTR/kuresel-etki-secrets**  
     (`YAPILACAKLAR.md`, `ssh/` anahtarları, deploy notları).  
     `gh repo view snipeTR/kuresel-etki-secrets` veya clone ile oku.  
   - Erişim yoksa yalnızca **[YAPILACAKLAR.example.md](YAPILACAKLAR.example.md)** (şablon; IP/SSH yok).  
3. İlgili kaynak dosyayı oku (aşağıdaki harita).  
4. Değişiklikten sonra checklist’i işaretle.

**Çalışma kökü:** kullanıcının belirttiği `ekonomi oyunu` klasörü (genelde Documents `grok-projeler` altı). Yanlış kopyaya yazma.

### 3.1.1 Private secrets repo (ajanlar)

| | |
|--|--|
| Repo | `snipeTR/kuresel-etki-secrets` (**private**) |
| Ne var? | Deploy URL/path, SSH notları, `ssh/*.key`, açık gizli todo |
| Ne yok? | Oyun kaynak kodu (o public `global-impact`’de) |
| Kural | Private içeriği **asla** public commit / issue / chat’e yapıştırma |
| Deploy hedefi | Yalnız `/oyungrok/` — **`/oyun/` dokunma** (notlar private dosyada) |

## 3.2 Dokunulmaz kısıtlar

| # | Kısıt | Detay |
|---|--------|--------|
| 1 | Enstrüman silme | `instruments.js` girdilerini silme / birleştirerek yok etme |
| 2 | 17 ülke seti | **DEU yok**; **EU** tek varlık; **GBR** ayrı |
| 3 | Kayıt anahtarları | Sonek `_oyungrok`; eski `kureselEtkiSave` ile karıştırma |
| 4 | Tur modeli v2 | Önce tam AI script, sonra oynatma; kesintide **baştan** |
| 5 | Masaüstü vs mobil | Desktop layout’u bozma; mobil `body.mobile-ui` |
| 6 | Gizli bilgi | IP, SSH, kişisel path, canlı şifre **commit etme** |
| 7 | Framework | İstenmedikçe React/Vue/Webpack yok |
| 8 | Canlı `/oyun/` | Kullanıcı özellikle demedikçe o yola yazma; oyungrok ayrımı korunur |
| 9 | Tur modelini basitleştirme | “Sadece AIIndex’ten devam” v1’e geri alma — yasak |

## 3.3 Dosya → sorumluluk haritası

| Dosya | Dokununca ne düşün |
|-------|---------------------|
| `js/data/instruments.js` | Yeni araç ekle; silme yok; tip/layer/cost/risk |
| `js/data/countries.js` | 17 set + RELATIONS + tradeLinks + deps |
| `js/data/disasters.js` | Felaket metin / şiddet |
| `js/core/state.js` | SAVE_KEY, TURN_JOB_KEY, migrate, newGame |
| `js/core/effects.js` | pulse/sustain/perm, spill, mean reversion |
| `js/core/ai.js` | skor adayları, `buildAIScript`, `applyAIScriptEntry` |
| `js/core/turn.js` | begin/finish, end scores |
| `js/core/news.js` | şablonlar (≥80); `countNewsTemplates` |
| `js/core/diplomacy.js` | rel, ton, `relationColor` |
| `js/core/internal.js` | onay, istikrar, gruplar; `gov:'birlik'` ≈ demokratik |
| `js/ui/main.js` | onay modalı, `runTurnAnimated`, resume |
| `js/ui/mobile.js` | sekmeler, swipe wrap, pinch engeli |
| `js/ui/screens.js` | menü, harita, AB=`#es` label below |
| `js/ui/panels.js` | enstrüman UI, sayfalama, `testInstrumentPaging` |
| `js/ui/music.js` | fade 1s, playlist, volume 0/0.4/1 |
| `css/style.css` | mobil kuralları `body.mobile-ui` altında |
| `index.html` | script sırası, `#mobile-chrome` |
| `AGENTS.md` | kalıcı kural değişince **mutlaka** güncelle |
| `YAPILACAKLAR.md` | gizli + todo; **asla** public commit |

## 3.4 `window.GAME` yüzey alanı

### Oyun yaşam döngüsü

| API | Ne işe yarar |
|-----|----------------|
| `GAME.newGame(cid)` | Yeni oyun |
| `GAME.save` / `GAME.load` | Kalıcı kayıt |
| `GAME.beginTurn` / `finishTurn` | Tur çerçeve |
| `GAME.commitTurn` | Senkron tur (test; animasyonsuz) |
| `GAME.runTurnAnimated` | Canlı tur (script + delay) |
| `GAME.tryResumeTurnJob` | Sayfa yenileme sonrası yarım tur |

### AI

| API | Ne işe yarar |
|-----|----------------|
| `GAME.aiPlan(cid)` | Skorlu aday listesi (+ danışma kurulu UI) |
| `GAME.buildAIScript` | Tüm AI hamlelerini tek script’e dök |
| `GAME.applyAIScriptEntry` | Tek satır replay |
| `GAME.recordAICountry` | Script satırı üretimi |
| `GAME.cloneState` | preAi snapshot |

### Etki / enstrüman

| API | Ne işe yarar |
|-----|----------------|
| `GAME.applyInstrumentChange` | Oyuncu / AI uygulama |
| `GAME.addPulse` / sustain API / `addPerm` | Etki yazımı |
| `GAME.INSTRUMENTS` / `COUNTRIES` | Veri tabloları |

### UI / medya

| API | Ne işe yarar |
|-----|----------------|
| `GAME.openMapModal` / `attachMapNav` | Harita |
| `GAME.setMobileUI` / `goMobilePage` | Mobil sekmeler (0–4) |
| `GAME.Music.*` | Müzik + ses basamakları |
| `GAME.countNewsTemplates` | Sağlık |
| `GAME.testInstrumentPaging` | Sağlık |
| `GAME.calcEndScores` | Oyun sonu |

Eksik görünen API için önce mevcut dosyada `GAME.` araması yap; uydurma global ekleme.

## 3.5 Tur job şeması (beklenen)

```js
{
  complete: false,
  preAiState: { /* clone */ },
  script: [
    // { cid, actions: [...], messages?: ... }
  ]
  // complete:true veya job silinmiş = kalıcı save güvenli
}
```

Kesintide: `complete === false` → state = `preAiState`, script index 0’dan.

## 3.6 Ülke seti (doğrulama listesi)

`USA CHN EU JPN IND GBR RUS CAN BRA KOR AUS MEX IDN SAU TUR CHE ZAF`  
**DEU yok.** EU `gov:'birlik'`. Harita: `MAP_ISO.EU` boyama; marker `#es`; label y > nokta.

## 3.7 Değişiklik checklist

Her PR / oturum sonu:

- [ ] `AGENTS.md` ile çelişmiyor mu?  
- [ ] Enstrüman silinmedi mi?  
- [ ] localStorage anahtarları `*_oyungrok` mu?  
- [ ] Tur v2 (plan → replay → finish save) bozulmadı mı?  
- [ ] Mobil + desktop duman testi yapıldı mı?  
- [ ] `node test-consistency.js` → `ALL_OK`?  
- [ ] `YAPILACAKLAR.md` stage’de değil mi? (`git status`)  
- [ ] Kalıcı kural eklendiyse `AGENTS.md` güncellendi mi?  
- [ ] Açık todo bittiyse yerel `YAPILACAKLAR.md` listesinden çıkarıldı mı?  
- [ ] Gizli IP/path commit edilmedi mi?

## 3.8 Sık tuzaklar (yapma)

| Tuzak | Doğru davranış |
|-------|----------------|
| Enstrüman “sadeleştirme” diye silmek | Ekle veya dengele; silme |
| Yarım turda `AIIndex` ile devam | preAi + script baştan |
| Desktop CSS’i mobil için bozmak | `body.mobile-ui { ... }` |
| `kureselEtkiSave` kullanmak | `kureselEtkiSave_oyungrok` |
| AB’yi Almanya ile değiştirmek | EU tek varlık, DEU yok |
| Haber şablonlarını azaltmak | ≥ 80 koru; `countNewsTemplates` |
| Framework’e taşımak | Kullanıcı açıkça istemedikçe hayır |
| Deploy secret’ı README’ye yazmak | Yalnız yerel / private `YAPILACAKLAR.md` |
| SSH key veya sunucu IP commit | Asla; private secrets + gitignore |
| Public geçmişe secret sızdı sanmak | `git log -S` + GitHub Secret Scanning kontrol et |

## 3.8b Güvenlik (public repo)

| Konu | Durum / kural |
|------|----------------|
| Public kod | Framework’süz oyun; sunucu IP/SSH **yok** |
| Gizli yedek | Private `kuresel-etki-secrets` (SSH, deploy notları) |
| `.gitignore` | `YAPILACAKLAR.md`, `*.key`, `**/ssh/`, `.env*` |
| GitHub | Secret scanning + push protection; Dependabot updates; `main` ruleset |
| Commit öncesi | `git status` → `YAPILACAKLAR.md` stage’de olmasın |
| Canlı deploy | Yalnız `/oyungrok/`; **`/oyun/` yazma** |

## 3.9 Önerilen çalışma stili

1. Küçük, odaklı diff.  
2. Önce oku (ilgili 1–3 dosya), sonra yaz.  
3. Davranış değişince hem kod hem `AGENTS.md` (kalıcıysa).  
4. UI metinleri Türkçe tutarlı kalsın.  
5. “Güzel refactor” için tur/kayıt modeline dokunma.  
6. Test: `node test-consistency.js` + mümkünse tarayıcı duman.

## 3.10 Bilinçli tasarım özeti

- **Etki:** pulse / sustain / perm + mean reversion + ticaret spill + global deps.  
- **İlişki rengi:** `relationColor(rel)` — harita çizgileri seçili ülkeye göre.  
- **AB harita:** path boyası çoklu ISO; marker `#es`; label below.  
- **Müzik:** normal loop; felakette 1s fade → felaket → diplomasi → savas döngüsü.  
- **Mobil sayı:** `%` → 0.25; aksi 0.5; 4 haneli kutu + birim + ▲▼.  
- **Onay:** tur commit öncesi modal; mobilde Olaylar sekmesine atla.

Daha fazlası: kod yorumları + **AGENTS.md** bölüm 1–10.

---

## Lisans / varlıklar

- Dünya haritası SVG: [simple-world-map](https://github.com/flekschas/simple-world-map) türevi (**CC BY-SA 3.0**).  
- Ülke bayrakları PNG: `assets/flags/` (flagcdn / genel kullanım bayrak grafikleri; UI’da Win95 çerçeve).  
- Oyun kodu: repo sahibi / proje lisansına bakın (belirtilmemişse katkı öncesi netleştirin).  
- Müzik dosyaları (`music/*.mp3`): projeye özel; yeniden dağıtım hakkını kontrol edin.

---

## Hızlı bağlantılar

| | |
|--|--|
| Oyna (lokal) | `node serve.js` → http://localhost:8123 |
| Kurallar (kalıcı) | [AGENTS.md](AGENTS.md) |
| Todo şablonu | [YAPILACAKLAR.example.md](YAPILACAKLAR.example.md) |
| Changelog | [CHANGELOG.md](CHANGELOG.md) |
| English README | [README-EN.md](README-EN.md) |
| GitHub (public) | https://github.com/snipeTR/global-impact |
| Secrets (private, yetkili) | https://github.com/snipeTR/kuresel-etki-secrets |
| §1 Kullanıcı | [Basit kullanıcılar](#1-basit-kullanıcılar) |
| §2 Geliştirici | [Programcılar](#2-programcılar) |
| §3 Ajan | [Yapay zekâ ajanları](#3-yapay-zekâ-ajanları) |
