/* ============ KÜRESEL ETKİ — Tur Yöneticisi ============ */
/* Tur 3 faza bölünmüştür ki arayüz ülkeleri gecikmeli "canlı" oynatabilsin:
   1) beginTurn(): oyuncunun bekleyen kararları uygulanır + diplomatik tepkiler
   2) runAICountry(cid): her AI ülke kendi kararlarını verir (ai.js)
   3) finishTurn(): simülasyon tick + haberler + kayıt + oyun sonu             */
window.GAME = window.GAME || {};

/* ---- Faz 1: Oyuncu kararları ---- */
GAME.beginTurn = function () {
  const s = GAME.state;
  const out = [];
  s.pending.forEach(p => {
    const ins = GAME.INSTRUMENTS_BY_ID[p.insId];
    const st = GAME.pc().instruments[p.insId];
    const oldVal = st.val;
    const cost = GAME.instrumentCost(s.player, p.insId);
    GAME.pc().internal.polCap = Math.max(0, GAME.pc().internal.polCap - cost);
    GAME.applyInstrumentChange(s.player, ins, oldVal, p.val, p.target);
    GAME.recordInstrumentUse(s.player, p.insId);
    s.interventionLog.push({ turn: s.turn, insId: p.insId, name: ins.name, val: p.val, target: p.target || null, cost: cost });
    // Diplomatik tepkiler (yapısal projeler sessiz başlar, agresif eylemler gürültülü)
    if (ins.targeted && p.val > 0) GAME.generateReactions(s.player, ins, p.target, out);
    else if (!ins.project && Math.random() < 0.6) GAME.generateReactions(s.player, ins, null, out);
  });
  s.pending = [];
  return out;
};

/* ---- AI ülke sırası (her tur karışık: canlılık hissi) ---- */
GAME.aiOrder = function () {
  const ids = Object.keys(GAME.state.countries).filter(c => c !== GAME.state.player);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
};

/* ---- Faz 3: Simülasyon ve tur sonu ---- */
GAME.finishTurn = function () {
  const s = GAME.state;
  const out = [];
  const events = [];
  const projEvents = [];

  const prevGrowth = {};
  for (const cid in s.countries) prevGrowth[cid] = s.countries[cid].ind.growth;
  s.turn++;

  /* Felaket tetikleme */
  let disasterTriggered = null;
  if (!s.disaster && s.turn >= s.disasterTurn) {
    const dis = GAME.pick(GAME.DISASTERS);
    s.disaster = { id: dis.id, startTurn: s.turn };
    GAME.applyDisaster(dis);
    disasterTriggered = dis;
    GAME.pushNews({
      cat: 'global', tone: 5, source: dis.icon + ' KÜRESEL KRİZ',
      title: dis.name, body: dis.desc, involves: [], important: true
    });
  }

  /* Simülasyon */
  GAME.meanReversion();
  GAME.tickActiveEffects();
  GAME.applySustains();
  GAME.applyGlobalExposure();
  GAME.propagateTrade(prevGrowth);
  GAME.economicLinks();
  GAME.tickProjects(projEvents);
  GAME.updateInternalDynamics(events);
  GAME.relationDrift();
  GAME.checkDetection(out);

  /* Mesaj üretimi */
  GAME.generateEconNews(out);
  GAME.generateEventNews(events, out);
  GAME.generateProjectNews(projEvents, out);
  GAME.generateDisasterNews(out);
  GAME.generateRiskWarnings(out);

  /* Kayıt ve tur sonu */
  GAME.recordHistory();
  if (s.turn >= GAME.MAX_TURNS) s.gameOver = true;
  GAME.save();

  return { disasterTriggered: disasterTriggered, gameOver: s.gameOver, news: out };
};

/* ---- Senkron tam tur (testler ve otomasyon için) ---- */
GAME.commitTurn = function () {
  GAME.beginTurn();
  GAME.aiOrder().forEach(cid => GAME.runAICountry(cid));
  return GAME.finishTurn();
};

/* ---- Oyun sonu skorları (opsiyonel skor sistemi, doc 10.3) ---- */
GAME.calcEndScores = function () {
  const s = GAME.state, c = GAME.pc();

  // 1. Kendi ülke performansı: son durum vs başlangıç
  const gH = c.history;
  const first = k => gH[k][0], last = k => gH[k][gH[k].length - 1];
  let perf = 50;
  perf += (last('growth') - first('growth')) * 4;
  perf -= (last('inflation') - first('inflation')) * 0.5;
  perf += (last('influence') - first('influence')) * 1.2;
  perf += (c.internal.stability - 60) * 0.4;

  // 2. Küresel istikrar: dünya ne kadar hasar aldı
  let worldGrowth = 0, n = 0;
  for (const cid in s.countries) { const h = s.countries[cid].history.growth; worldGrowth += h[h.length - 1]; n++; }
  let global = 50 + (worldGrowth / n) * 6 + ((s.globals.trade - 100) * 0.5);

  // 3. Miras: kalıcı değişimler
  const playerLegacy = s.legacy.filter(l => l.cid === s.player);
  let legacy = Math.min(100, playerLegacy.length * 18);

  // 4. Stratejik tutarlılık: başlatılan projelerin tamamlanma oranı
  let started = 0, completed = 0;
  GAME.INSTRUMENTS.filter(i => i.project).forEach(i => {
    const st = c.instruments[i.id];
    if (st.startTurn) { started++; if (st.progress >= 100) completed++; }
  });
  let consistency = started ? Math.round(100 * completed / started) : 50;

  // 5. Risk yönetimi
  let risk = Math.max(0, 100 - s.detectedOps * 30 - s.retaliationDamage);

  const clampS = v => Math.round(GAME.clamp(v, 0, 100));
  return {
    perf: clampS(perf), global: clampS(global), legacy: clampS(legacy),
    consistency: clampS(consistency), risk: clampS(risk),
    playerLegacy: playerLegacy,
    projectStats: { started: started, completed: completed }
  };
};
