/* Generate lang/tr/pack.js from current game data (Turkish source). */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '../..');
const sandbox = { window: {}, console };
sandbox.window.GAME = sandbox.GAME = {
  pick: a => a[0],
  rand: () => 0,
  randInt: (a) => a,
  clamp: (v) => v,
  fmt: (v) => String(v),
  sign: (v) => String(v),
  turnDate: () => '2026 Q1',
  pushNews: () => {},
  state: { turn: 1, news: [], player: 'USA', countries: {}, globals: {}, gHistory: {}, disaster: null },
  COUNTRIES: {},
  INSTRUMENTS_BY_ID: {},
  IND_META: {},
  GLOBALS_INIT: {},
  getRelation: () => 0,
  calcTone: () => 3,
  toneFeedback: () => {},
  pc: () => ({ ind: {}, internal: {} }),
  pdef: () => ({})
};
vm.createContext(sandbox);
function load(rel) {
  vm.runInContext(fs.readFileSync(path.join(root, rel), 'utf8'), sandbox);
}
load('js/data/countries.js');
load('js/data/instruments.js');
load('js/data/disasters.js');
load('js/core/diplomacy.js');
load('js/core/news.js');
load('js/ui/help.js');
const G = sandbox.GAME;

function emitPack(lang, sections) {
  const dir = path.join(root, 'lang', lang);
  fs.mkdirSync(dir, { recursive: true });
  let out = '/* Language pack: ' + lang + ' — generated / curated */\n';
  out += 'window.GAME = window.GAME || {};\n(function () {\n';
  out += "  var R = function (s, d) { GAME.i18n.register('" + lang + "', s, d); };\n";
  for (const [sec, data] of Object.entries(sections)) {
    out += '  R(' + JSON.stringify(sec) + ', ' + JSON.stringify(data) + ');\n';
  }
  out += '})();\n';
  fs.writeFileSync(path.join(dir, 'pack.js'), out);
  console.log('wrote', lang, 'pack.js', out.length, 'chars');
}

const trInstruments = {};
G.INSTRUMENTS.forEach(i => { trInstruments[i.id] = { name: i.name, desc: i.desc }; });
const trCountries = {};
Object.keys(G.COUNTRIES).forEach(id => {
  const c = G.COUNTRIES[id];
  trCountries[id] = { name: c.name, desc: c.desc, style: c.style, difficulty: c.difficulty, gov: c.gov };
});
const trDisasters = {};
G.DISASTERS.forEach(d => { trDisasters[d.id] = { name: d.name, desc: d.desc, impacts: d.impacts.slice() }; });

const trUi = {
  doc_title: 'Küresel Etki — Ekonomik Devlet Yönetimi',
  game_title: 'KÜRESEL ETKİ',
  game_subtitle: 'Bir ekonomik enstrümanı değiştirdiğinde, dünyada gerçekten ne değişiyor?',
  new_game: 'Yeni Oyun',
  continue: 'Devam Et',
  how_to_play: 'Nasıl Oynanır?',
  menu_note: 'Paralel evrende 2026. Dünya ekonomisi istikrarlı görünüyor… ama uzmanlar küresel sistemin aşırı kırılgan olduğunu söylüyor.',
  menu_mission: 'Misyon: Ekonomik enstrümanların zincirleme etkilerini anlamak. Kazanmak değil; her kararın dünya üzerindeki izini görmek.',
  about_title: 'Nasıl Oynanır?',
  back: 'Geri Dön',
  pick_country: 'Ülkeni Seç',
  pick_country_sub: 'Felaket vurmadan önce ülkeni tanı. Her ülkenin güçlü ve zayıf yönleri farklıdır.',
  disaster_alert: '⚠ KÜRESEL KRİZ BAŞLADI ⚠',
  continue_btn: 'Devam Et',
  help: '❓ Yardım',
  help_title: 'Danışma Kurulu: hangi enstrümanı kullanmalıyım?',
  music_title_40: 'Ses: %40 — tıkla: %100',
  music_title_100: 'Ses: %100 — tıkla: sessiz',
  music_title_0: 'Ses: kapalı — tıkla: %40',
  polcap: 'Siyasi Sermaye',
  slots: 'Müdahale: {used}/{max}',
  slots_short: 'Müdahale {used}/{max}',
  log: 'Olay Günlüğü',
  commit: 'Onayla ve İlerle ▶',
  commit_short: 'İlerle ▶',
  commit_busy: 'Tur...',
  econ_indicators: 'Ekonomik Göstergeler',
  internal_stability: 'İç İstikrar',
  active_policies: 'Aktif Politikalar',
  feed_title: '#dünya-olayları',
  feed_reopen: '◀ #dünya-olayları',
  feed_collapse: 'Paneli daralt',
  tab_status: '📊 Durum',
  tab_chart: '📈 Grafik',
  tab_feed: '💬 Olaylar',
  tab_map: '🗺 Harita',
  tab_instr: '⚙ Enstrümanlar',
  nav_status: 'Durum',
  nav_chart: 'Grafik',
  nav_feed: 'Olaylar',
  nav_map: 'Harita',
  nav_instr: 'Enstrüman',
  prev_tab: 'Önceki sekme',
  next_tab: 'Sonraki sekme',
  map_hint: 'Bir ülkeye dokunarak dünya haritasını aç. Sürükle / pinch zoom masaüstü harita modalında çalışır.',
  open_world_map: 'Dünya Haritasını Aç',
  end_title: 'OYUN SONA ERDİ — SENİN MİRASIN',
  end_log: 'Olay Günlüğünü İncele',
  end_menu: 'Ana Menüye Dön',
  viewport_title: 'C:\\OYUN\\EKRAN.SYS',
  viewport_h2: 'Ekran çok küçük',
  viewport_p: 'Bu cihaz veya pencere boyutu oyunu sağlıklı gösteremiyor.',
  viewport_li1: 'Pencereyi büyütün',
  viewport_li2: 'Telefonu dikey tutup yenileyin (mobil arayüz)',
  viewport_li3: 'Daha iyi deneyim: tablet yatay veya masaüstü',
  viewport_min: 'Minimum ~320×480 · Mobil dikey desteklenir',
  lang_label: 'Dil',
  difficulty: 'Zorluk: {d}',
  confirm_new: 'Kayıtlı oyun silinecek. Yeni oyuna başlamak istediğine emin misin?',
  turn_confirm_title: '▶ Turu Onayla — {date}',
  turn_confirm_none: 'Bu turda enstrüman değişikliği yok. Yine de ilerlemek istiyor musun?',
  turn_confirm_list: 'Bu turda şu değişiklikler uygulanacak:',
  turn_confirm_polcap: 'Siyasi sermaye maliyeti düşülecek. Mevcut: <b>{pc}</b>',
  yes_advance: 'Evet, ilerle',
  cancel: 'Vazgeç',
  open: 'AÇ',
  close: 'KAPAT',
  level: 'Seviye {v}',
  apply: 'Uygula',
  on: 'Açık',
  off: 'Kapalı',
  target: 'Hedef',
  no_policies: 'Aktif özel politika yok',
  page: 'Sayfa {cur}/{total}',
  range_1y: '1 Yıl',
  range_3y: '3 Yıl',
  range_5y: '5 Yıl',
  range_10y: '10 Yıl',
  range_all: 'Tümü',
  global_source: '🌍 Küresel',
  crisis_source: 'KÜRESEL KRİZ',
  advisory: '⚠ Danışma Kurulu',
  relation_pts: 'İlişki: {v} puan',
  effect_collapsed: 'İlişkiler çöktü, misilleme başlıyor',
  intelligence: 'istihbaratı',
  intl_press: 'uluslararası basın',
  log_title: 'Olay Günlüğü',
  close_modal: 'Kapat',
  score_perf: 'Kendi Ülke Performansı',
  score_global: 'Küresel İstikrar Katkısı',
  score_legacy: 'Miras Gücü',
  score_consistency: 'Stratejik Tutarlılık (Proje: {done}/{started} tamamlandı)',
  score_risk: 'Risk Yönetimi (Tespit edilen operasyon: {n})',
  legacy_none: 'Kayıtlı kalıcı miras yok.',
  lived_disaster: 'Yaşanan felaket: ',
  country_you: '(sen)',
  relation_short: 'İlişki: {v}',
  map_show: 'haritada göster',
  feed_status_acting: '*** {flag} {name} hamle yapıyor…',
  project_years: 'Proje ~{y} yılda tamamlanır ve KALICI miras bırakır',
  political_cap_cost: 'Siyasi sermaye: {n}',
  risk_label: 'Tespit riski: {n}',
  gov_label: 'Yönetim: {g}',
  no_pending: 'Bekleyen değişiklik yok',
  pending_title: 'Bekleyen değişiklikler',
  slots_left: 'Kalan slot: {n}',
  filter_all: 'Tümü',
  approval: 'Toplum Onayı',
  stability: 'İstikrar',
  pol_cap_lbl: 'Siyasi Sermaye',
  none: '—',
  diplo_about: ' hakkında',
  diplo_mfa: ' dışişleri: ',
  diplo_official: ' resmi tepki: ',
  diplo_brief: ' basına brifing verdi',
  project_done_1: ': "{ins}" TAMAMLANDI',
  project_done_2: ' stratejik projeyi bitirdi: ',
  project_done_3: 'Miras: ',
  project_prog_1: ': {ins} %{pct} seviyesinde',
  project_prog_2: ' projesi ilerliyor (%{pct}): ',
  project_prog_3: 'Güncelleme — {ins} @ %{pct}',
  disaster_q: 'Felaketin etkileri sürüyor ({n}. çeyrek)',
  disaster_upd: ' — {n}. çeyrek güncellemesi',
  disaster_log: 'Kriz günlüğü: ',
  disaster_still: 'Hâlâ sarsıntıda: ',
  global_economy: ' küresel ekonomi',
  legacy_global: ' (küresel: ',
  news_rel_effect: 'İlişki: {v} puan'
};

const trAi = {
  rate_hike: {
    title: "{name} faizi %{from}'den %{to}'e çıkardı",
    body: 'Merkez bankası artan enflasyona sıkılaştırmayla yanıt verdi.',
    why: 'Enflasyon %{infl} — tabanın {gap} puan üzerinde. Faiz artışı enflasyonu ve kur baskısını düşürür.'
  },
  qe_slow: {
    title: '{name} miktarsal gevşemeyi yavaşlattı',
    body: 'Enflasyon baskısı nedeniyle bilanço genişlemesi frenlendi.',
    why: 'QE enflasyonu besliyor. Likidite musluğunu kısmak fiyat istikrarı için gerekli.'
  },
  price_cap: {
    title: '{name} temel mallarda fiyat tavanı getirdi',
    body: 'Toplumsal öfkeyi bastırmak için acil fiyat kontrolü.',
    why: 'Enflasyon yüksek ve istikrar kırılgan. Kısa vadede baskılar; orta vadede kıtlık riski.'
  },
  rate_cut: {
    title: '{name} faiz indirimine gitti',
    body: 'Zayıflayan ekonomiyi desteklemek için para politikası gevşetildi.',
    why: 'Enflasyon kontrol altında ama büyüme zayıf. Faiz indirimi krediyi ucuzlatır.'
  },
  qe_start: {
    title: '{name} miktarsal gevşeme programı başlattı',
    body: 'Merkez bankası varlık alımlarıyla likidite enjekte ediyor.',
    why: 'Klasik faiz alanının daraldığı ortamda QE büyümeyi destekler.'
  },
  stimulus: {
    title: '{name} teşvik paketi açıkladı',
    body: 'Kamu harcamaları daralan ekonomiye karşı artırılıyor.',
    why: 'Mali teşvik talebi canlandırır; borç ve enflasyon maliyeti vardır.'
  },
  tax_cut: {
    title: '{name} vergi indirimine gitti',
    body: 'Özel sektörü canlandırmak için vergi yükü hafifletildi.',
    why: 'Vergi indirimi büyümeyi destekler; mali dengeyi zorlar.'
  },
  austerity: {
    title: '{name} kemer sıkmaya geçti',
    body: 'Yükselen borç yükü nedeniyle kamu harcamaları kısılıyor.',
    why: 'Borç dinamiğini dizginlemek için harcama kısıntısı.'
  },
  tax_hike: {
    title: '{name} mali konsolidasyon için vergi artırdı',
    body: 'Borç sürdürülebilirliği için gelirler güçlendiriliyor.',
    why: 'Vergi artışı borcu yavaşlatır ama büyümeyi ve onayı sıkar.'
  },
  fx_defend: {
    title: '{name} döviz piyasasına müdahale etti',
    body: 'Merkez bankası rezerv satarak kuru savunuyor.',
    why: 'Kur baskısı rezerv maliyetine karşı savunuluyor.'
  },
  capital_ctrl: {
    title: '{name} sermaye kontrollerini sıkılaştırdı',
    body: 'Sıcak para çıkışına karşı yeni tedbirler devrede.',
    why: 'Sermaye çıkışı kuru ve rezervleri tehdit ediyor.'
  },
  shadow_fx: {
    title: '{name} gölge döviz operasyonunu devreye aldı',
    body: 'Örtülü müdahale ile kur yönetiliyor.',
    why: 'Açık rezerv satışı yerine örtülü kanal.'
  },
  jawbone: {
    title: '{name} piyasalara güvence mesajı verdi',
    body: 'Üst düzey açıklamalarla kur ve risk algısı yönetiliyor.',
    why: 'Ucuz iletişim aracı; kısa ömürlü etki.'
  },
  fx_stop: {
    title: '{name} kur savunmasını durdurdu',
    body: 'Rezervlerin erimesi üzerine döviz müdahalesine son verildi.',
    why: 'Rezervler kritik; müdahale sürdürülemez.'
  },
  rate_reserve: {
    title: '{name} rezerv kaybını frenlemek için faiz artırdı',
    body: 'Faiz artışı sermaye çıkışını yavaşlatmayı hedefliyor.',
    why: 'Rezerv erimesi ve kur baskısı.'
  },
  subsidy_jobs: {
    title: '{name} istihdam için sübvansiyonları artırdı',
    body: 'İşsizliğe karşı sanayi ve istihdam destekleri genişletildi.',
    why: 'İşsizlik tabanın üzerinde; istihdam teşviki.'
  },
  export_credit: {
    title: '{name} ihracat kredi paketini genişletti',
    body: 'Exim tipi desteklerle dış talep çekiliyor.',
    why: 'İhracat ve ticaret dengesi için finansman.'
  },
  stocks: {
    title: '{name} stratejik stokları güçlendirdi',
    body: 'Toplumsal gerilime karşı gıda ve enerji güvenliği önlemleri.',
    why: 'İstikrar ve fiyat şoklarına tampon.'
  },
  national_champ: {
    title: '{name} ulusal şampiyon birleşmelerine yeşil ışık yaktı',
    body: 'Yerli devlerin küresel rekabeti hedefleniyor.',
    why: 'Sanayi politikası ve ölçek ekonomisi.'
  },
  crisis_industry: {
    title: '{name} sanayiye kriz desteği açıkladı',
    body: 'Tedarik şokuna karşı sübvansiyon devrede.',
    why: 'Felaket kaynaklı üretim şoku.'
  },
  energy_spend: {
    title: '{name} enerji dönüşümü için harcamaları artırdı',
    body: 'Enerji güvenliği yatırımları hızlandı.',
    why: 'Enerji şokuna yapısal yanıt.'
  },
  energy_weapon: {
    title: '{name} enerji ihracatını silahlaştırdı',
    body: 'Petrol/gaz kısıtı ile jeopolitik baskı.',
    why: 'İhracatçı avantajı kriz döneminde.'
  },
  food_weapon: {
    title: '{name} gıda ihracatını kısıtladı',
    body: 'Küresel gıda krizinde arz silahı devrede.',
    why: 'Gıda ihracatçısı olarak baskı aracı.'
  },
  alt_finance: {
    title: '{name} alternatif ödeme altyapısını hızlandırdı',
    body: 'Yaptırım direnci için ödeme ağı güçlendiriliyor.',
    why: 'Finansal yaptırım riski.'
  },
  cbdc: {
    title: '{name} CBDC sınır ötesi pilotunu genişletti',
    body: 'Dijital para ile dolarsızlaşma adımı.',
    why: 'Rezerv para bağımlılığını azaltma.'
  },
  corridor: {
    title: '{name} alternatif koridor projesini başlattı',
    body: 'Süveyş tıkanıklığına karşı lojistik diversifikasyon.',
    why: 'Lojistik şokuna yapısal yanıt.'
  },
  swap: {
    title: '{name}, {target} ile döviz swap hattı açtı',
    body: 'İkili likidite hattı ilişkileri ve ticareti destekliyor.',
    why: 'Diplomasi ve rezerv esnekliği.'
  },
  export_fin: {
    title: '{name} ihracat finansmanını güçlendirdi',
    body: 'Exim kapasitesi artırıldı.',
    why: 'Ticaret fazlası hedefi.'
  },
  tariff_wall: {
    title: '{name}, {pname} mallarına gümrük duvarı ördü',
    body: 'Misilleme tarifeleri devrede.',
    why: 'Ticaret misillemesi.'
  },
  tariff_ret: {
    title: '{name}, {pname} mallarına misilleme vergisi koydu',
    body: 'Karşılıklılık ilkesi devrede.',
    why: 'Yaptırım/tarife misillemesi.'
  },
  freeze: {
    title: '{name}, {pname} varlıklarını dondurdu',
    body: 'Mali yaptırım sertleştirildi.',
    why: 'Sert misilleme.'
  },
  energy_vs: {
    title: "{name} enerji musluğunu {pname}'e karşı kıstı",
    body: 'Enerji ihracat kısıtı misilleme olarak kullanıldı.',
    why: 'Enerji silahı.'
  },
  stock_shock: {
    title: '{name} arz şokuna karşı stok artırdı',
    body: 'Stratejik stoklar yükseltiliyor.',
    why: 'Arz silahına savunma.'
  },
  tariff_balance: {
    title: '{name}, {pname} mallarına dengeleyici tarife koydu',
    body: 'Sübvansiyon rekabetine tarife yanıtı.',
    why: 'Ticaret dengeleme.'
  },
  energy_target: {
    title: "{name} enerji silahını {target}'e çevirdi",
    body: 'Hedefli enerji kısıtı.',
    why: 'Fırsatçı baskı.'
  },
  chokepoint: {
    title: '{name} kritik tedarikte kota uyguladı',
    body: 'Tedarik zinciri silahlaştırıldı.',
    why: 'Stratejik baskı.'
  },
  project_start: {
    title: '{name} uzun vadeli proje başlattı: {ins}',
    body: 'Stratejik yatırım zaman çizelgesine girdi.',
    why: 'Yapısal güç inşası.'
  },
  generic_act: {
    title: '{name}: {ins}',
    body: 'Politika ayarı güncellendi.',
    why: 'Skor tabanlı aday.'
  },
  aid: {
    title: '{name}, {target} için kalkınma yardımı açıkladı',
    body: 'Yardım diplomasisi ilişkileri güçlendiriyor.',
    why: 'Yumuşak güç ve ilişki onarımı.'
  },
  detection_scandal: {
    title: 'Tespit skandalı',
    body: 'Örtülü operasyon ifşa oldu.'
  }
};

const trSections = {
  ui: trUi,
  instruments: trInstruments,
  countries: trCountries,
  disasters: trDisasters,
  layers: G.LAYERS,
  groups: {},
  globals: {},
  indMeta: {},
  toneMeta: G.TONE_META,
  newsCats: G.NEWS_CATS,
  diplo: G.DIPLO_TEMPLATES,
  econTitle: G.ECON_TITLE,
  econBody: G.ECON_BODY,
  globalTitle: G.GLOBAL_TITLE,
  globalBody: [
    'Tedarik zincirleri yeniden fiyatlanıyor.',
    'İthalatçı ve ihracatçı ülkeler asimetrik etkileniyor.',
    'Merkez bankaları ve bakanlıklar brifing üstüne brifing veriyor.',
    'Vadeli piyasalar volatilite primi istiyor.',
    'Jeopolitik risk primi fiyatlara yansıyor.'
  ],
  risk: G.RISK_TEMPLATES,
  events: G.EVENT_TEXTS,
  projectDone: G.PROJECT_DONE,
  projectProg: G.PROJECT_PROG,
  detectionTitles: G.DETECTION_TITLES,
  detectionBodies: G.DETECTION_BODIES,
  disasterFlavor: G.DISASTER_FLAVOR,
  help: Object.assign({}, G.HELP_TOPICS),
  about: G.ABOUT_MAIN_HTML,
  chartSeries: {
    growth: 'GDP Büyüme', inflation: 'Enflasyon', currency: 'Para Birimi', trade: 'Ticaret Dengesi',
    debt: 'Kamu Borcu', reserves: 'Rezerv', stability: 'İstikrar', influence: 'Küresel Etki',
    'g:oil': 'Petrol (Küresel)', 'g:food': 'Gıda (Küresel)', 'g:dollar': 'Dolar Endeksi'
  },
  ai: trAi
};
Object.keys(G.GROUPS).forEach(k => {
  trSections.groups[k] = { name: G.GROUPS[k].name, concerns: G.GROUPS[k].concerns };
});
Object.keys(G.GLOBALS_INIT).forEach(k => {
  trSections.globals[k] = { name: G.GLOBALS_INIT[k].name };
});
Object.keys(G.IND_META).forEach(k => {
  trSections.indMeta[k] = { name: G.IND_META[k].name };
});

emitPack('tr', trSections);
fs.writeFileSync(path.join(root, 'lang/_extract/tr_sections_keys.json'),
  JSON.stringify(Object.keys(trSections), null, 2));
console.log('OK tr pack');
