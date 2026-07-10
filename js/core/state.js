/* ============ KÜRESEL ETKİ — Oyun Durumu ============ */
window.GAME = window.GAME || {};

/* Ayrı anahtar: /oyun/ ve /oyungrok/ aynı origin'de localStorage paylaşır */
GAME.SAVE_KEY = 'kureselEtkiSave_oyungrok';
/* Yarıda kesilen "Onayla ve İlerle" tur işi (client-side devam) */
GAME.TURN_JOB_KEY = 'kureselEtkiTurnJob_oyungrok';
GAME.MAX_TURNS = 60;      // 15 yıl
GAME.SLOTS_PER_TURN = 4;

GAME.state = null;

/* Yardımcılar */
GAME.rand = (a, b) => a + Math.random() * (b - a);
GAME.randInt = (a, b) => Math.floor(GAME.rand(a, b + 1));
GAME.pick = arr => arr[Math.floor(Math.random() * arr.length)];
GAME.clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
GAME.fmt = (v, dec) => (v === undefined || v === null || isNaN(v)) ? '—' : Number(v).toFixed(dec === undefined ? 1 : dec);
GAME.sign = v => (v > 0 ? '+' : '') + v;

/* Tur → tarih ("2026 Q1") */
GAME.turnDate = function (turn) {
  const q = ((turn - 1) % 4) + 1;
  const y = 2026 + Math.floor((turn - 1) / 4);
  return y + ' Q' + q;
};

/* Yeni oyun durumu kur */
GAME.newGame = function (playerCid) {
  const countries = {};
  for (const cid in GAME.COUNTRIES) {
    const def = GAME.COUNTRIES[cid];
    const ind = Object.assign({}, def.ind);
    const internal = Object.assign({}, def.internal);
    const groups = {};
    for (const gid in GAME.GROUPS) {
      groups[gid] = { sat: 55 + GAME.randInt(-5, 5), radical: 0 };
    }
    // Enstrüman durumları: numerical'lar ülkenin başlangıç oranlarında, diğerleri kapalı/0
    const instruments = {};
    GAME.INSTRUMENTS.forEach(ins => {
      let val = 0;
      if (ins.type === 'numerical') val = (def.rates && def.rates[ins.id] !== undefined) ? def.rates[ins.id] : (ins.min || 0);
      instruments[ins.id] = { val: val, target: null, progress: null, startTurn: null };
    });
    countries[cid] = {
      id: cid,
      ind: ind,
      base: Object.assign({}, ind),          // taban değerler (perm shift bunları oynatır)
      internal: internal,
      groups: groups,
      instruments: instruments,
      instrUseCount: {},                      // enstrüman id → turda onaylanmış kullanım sayısı
      history: { }                            // gösterge → [değerler]
    };
  }

  // İlişki matrisi: tüm çiftler 0, sonra init değerleri
  const relations = {};
  const ids = Object.keys(GAME.COUNTRIES);
  for (const a of ids) {
    relations[a] = {};
    for (const b of ids) if (a !== b) relations[a][b] = 0;
  }
  GAME.RELATIONS_INIT.forEach(([a, b, v]) => {
    if (relations[a] && relations[b]) { relations[a][b] = v; relations[b][a] = v; }
  });

  // Küresel değişkenler
  const globals = {}, gBase = {};
  for (const k in GAME.GLOBALS_INIT) { globals[k] = GAME.GLOBALS_INIT[k].val; gBase[k] = GAME.GLOBALS_INIT[k].val; }

  GAME.state = {
    player: playerCid,
    turn: 1,
    countries: countries,
    relations: relations,
    globals: globals,
    gBase: gBase,
    gHistory: {},                 // küresel değişken geçmişi
    activeEffects: [],            // [{cid|'G', k, perTurn, delay, left, src}]
    disaster: null,               // {id, startTurn}
    disasterTurn: GAME.randInt(2, 4),
    pending: [],                  // oyuncunun bekleyen değişiklikleri [{insId, val, target}]
    news: [],                     // tüm mesajlar (olay günlüğü)
    legacy: [],                   // kalıcı değişimler (miras)
    interventionLog: [],          // oyuncu müdahaleleri [{turn, insId, desc}]
    detectedOps: 0,               // tespit edilen gri alan operasyonu sayısı
    retaliationDamage: 0,
    gameOver: false
  };

  GAME.recordHistory();
  return GAME.state;
};

/* Geçmişe kaydet (grafikler için her tur çağrılır) */
GAME.recordHistory = function () {
  const s = GAME.state;
  for (const cid in s.countries) {
    const c = s.countries[cid];
    const keys = ['growth','inflation','unemployment','reserves','debt','currency','trade','influence'];
    keys.forEach(k => { (c.history[k] = c.history[k] || []).push(c.ind[k]); });
    (c.history.approval = c.history.approval || []).push(c.internal.approval);
    (c.history.stability = c.history.stability || []).push(c.internal.stability);
  }
  for (const k in s.globals) (s.gHistory[k] = s.gHistory[k] || []).push(s.globals[k]);
};

/* Kaydet / Yükle */
GAME.save = function () {
  try { localStorage.setItem(GAME.SAVE_KEY, JSON.stringify(GAME.state)); } catch (e) { console.warn('Kayıt hatası', e); }
};
/* Kayıt yüklenince eksik enstrüman / alanları tamamla (sürüm uyumu) */
GAME.migrateState = function () {
  const s = GAME.state;
  if (!s || !s.countries) return;
  for (const cid in s.countries) {
    const c = s.countries[cid];
    const def = GAME.COUNTRIES[cid];
    if (!c.instruments) c.instruments = {};
    if (!c.instrUseCount) c.instrUseCount = {};
    GAME.INSTRUMENTS.forEach(ins => {
      if (!c.instruments[ins.id]) {
        let val = 0;
        if (ins.type === 'numerical')
          val = (def && def.rates && def.rates[ins.id] !== undefined) ? def.rates[ins.id] : (ins.min || 0);
        c.instruments[ins.id] = { val: val, target: null, progress: null, startTurn: null };
      }
    });
  }
};

/* ---- Siyasi sermaye maliyeti (dinamik) ----
   escalateCost: taban cost + kullanım sayısı (0. kullanım = taban, her onay +1)
   fx_intervention: sabit 3; kullanım sayacı regen penaltısı için */
GAME.instrumentCost = function (cid, insId) {
  const ins = GAME.INSTRUMENTS_BY_ID[insId];
  if (!ins) return 8;
  const base = (ins.cost !== undefined && ins.cost !== null) ? ins.cost : 8;
  if (ins.escalateCost) {
    const c = GAME.state && GAME.state.countries[cid];
    const uses = (c && c.instrUseCount && c.instrUseCount[insId]) || 0;
    return base + uses;
  }
  return base;
};

GAME.pendingTotalCost = function () {
  const s = GAME.state;
  if (!s || !s.pending) return 0;
  return s.pending.reduce((a, p) => a + GAME.instrumentCost(s.player, p.insId), 0);
};

GAME.recordInstrumentUse = function (cid, insId) {
  const c = GAME.state.countries[cid];
  if (!c) return;
  if (!c.instrUseCount) c.instrUseCount = {};
  c.instrUseCount[insId] = (c.instrUseCount[insId] || 0) + 1;
};

/* Döviz müdahalesi: her 4 kullanımda regen −1, −2, −3… */
GAME.fxRegenPenalty = function (cid) {
  const c = GAME.state.countries[cid];
  if (!c || !c.instrUseCount) return 0;
  const uses = c.instrUseCount.fx_intervention || 0;
  return Math.floor(uses / 4);
};

GAME.clearPending = function () {
  if (!GAME.state || GAME.ui.processing) return;
  GAME.state.pending = [];
  if (typeof GAME.refreshGameUI === 'function') GAME.refreshGameUI();
};

GAME.load = function () {
  try {
    const raw = localStorage.getItem(GAME.SAVE_KEY);
    if (!raw) return false;
    GAME.state = JSON.parse(raw);
    GAME.migrateState();
    return true;
  } catch (e) { return false; }
};
GAME.hasSave = function () { return !!localStorage.getItem(GAME.SAVE_KEY); };
GAME.clearSave = function () {
  localStorage.removeItem(GAME.SAVE_KEY);
  GAME.clearTurnJob();
};

/* ---- Tur işi (script + preAiState; complete:false iken oynatma baştan) ----
   { complete, turn, player, preAiState, script:[{cid,actions:[]}], order } */
GAME.saveTurnJob = function (job) {
  try {
    if (!job) localStorage.removeItem(GAME.TURN_JOB_KEY);
    else localStorage.setItem(GAME.TURN_JOB_KEY, JSON.stringify(job));
  } catch (e) { console.warn('Tur işi kayıt hatası', e); }
};
GAME.loadTurnJob = function () {
  try {
    const raw = localStorage.getItem(GAME.TURN_JOB_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
};
GAME.clearTurnJob = function () {
  try { localStorage.removeItem(GAME.TURN_JOB_KEY); } catch (e) { /* ignore */ }
};
GAME.hasTurnJob = function () { return !!localStorage.getItem(GAME.TURN_JOB_KEY); };

/* Oyuncu ülkesi kısayolu */
GAME.pc = function () { return GAME.state.countries[GAME.state.player]; };
GAME.pdef = function () { return GAME.COUNTRIES[GAME.state.player]; };
