/* ============ KÜRESEL ETKİ — Etki Motoru ============ */
/* pulse/sustain/perm etkileri, çapraz çarpanlar, ticaret yayılımı, küresel değişkenler */
window.GAME = window.GAME || {};

/* Zaman ölçekleri: gecikme + süre (tur) */
GAME.TIMESCALES = {
  imm:   { delay: 0,  dur: 2 },
  short: { delay: 1,  dur: 4 },
  med:   { delay: 4,  dur: 10 },
  long:  { delay: 12, dur: 24 }
};

/* Gösterge sınırları */
GAME.IND_LIMITS = {
  growth: [-15, 15], inflation: [-2, 120], unemployment: [0.5, 40],
  reserves: [0, 6000], debt: [0, 400], currency: [20, 220], trade: [-600, 600],
  influence: [0, 100], approval: [0, 100], stability: [0, 100]
};

/* ---- Aktif etki oluştur (pulse) ---- */
/* cid: etkilenen ülke ('G' = küresel), k: gösterge, total: toplam etki, s: zaman ölçeği */
GAME.addPulse = function (cid, k, total, s, src) {
  if (!total || Math.abs(total) < 0.0001) return;
  const ts = GAME.TIMESCALES[s] || GAME.TIMESCALES.short;
  GAME.state.activeEffects.push({
    cid: cid, k: k, perTurn: total / ts.dur, delay: ts.delay, left: ts.dur, src: src || ''
  });
};

/* ---- Kalıcı taban kayması (perm / paradigma değişimi) ---- */
GAME.addPerm = function (cid, k, m, src) {
  const s = GAME.state;
  if (k.startsWith('g:')) {
    const gk = k.slice(2);
    s.gBase[gk] = (s.gBase[gk] || 100) + m;
  } else {
    const c = s.countries[cid];
    if (c && c.base[k] !== undefined) c.base[k] += m;
    else if (c && (k === 'approval' || k === 'stability')) { /* iç göstergelerde taban yok, direkt uygula */
      c.internal[k] = GAME.clamp(c.internal[k] + m, 0, 100);
    }
  }
  if (src) {
    s.legacy.push({ turn: s.turn, cid: cid, text: src + (k.startsWith('g:') ? ' (küresel: ' + (GAME.GLOBALS_INIT[k.slice(2)] || {}).name + ' ' + GAME.sign(Math.round(m)) + ')' : ' (' + (GAME.IND_META[k] ? GAME.IND_META[k].name : k) + ' ' + GAME.sign(Math.round(m * 10) / 10) + ')') });
  }
};

/* ---- Çapraz çarpanlar (Amplifier / CrossEffect kuralları) ---- */
GAME.crossMultiplier = function (cid, insId, k) {
  const c = GAME.state.countries[cid];
  if (!c) return 1;
  const def = GAME.COUNTRIES[cid];
  let mult = 1;
  // Yüksek borç, faiz etkisini güçlendirir (borç servisi hassasiyeti)
  if (insId === 'policy_rate' && c.ind.debt > 100) mult *= 1.35;
  if (insId === 'policy_rate' && c.ind.debt > 200) mult *= 1.15;
  // Sermaye kontrolü + faiz → kur etkisi güçlenir
  if (insId === 'policy_rate' && k === 'currency' && c.instruments.capital_controls && c.instruments.capital_controls.val > 30) mult *= 1.3;
  // Yüksek enflasyon ortamında kur müdahalesi / gölge FX zayıflar
  if ((insId === 'fx_intervention' || insId === 'shadow_fx') && c.ind.inflation > 30) mult *= 0.7;
  if ((insId === 'fx_intervention' || insId === 'shadow_fx') && c.ind.inflation > 50) mult *= 0.75;
  // Düşük rezerv, kur savunmasını zayıflatır
  if ((insId === 'fx_intervention' || insId === 'shadow_fx') && c.ind.reserves < 60) mult *= 0.5;
  // Felaket sırasında stratejik stok / fiyat kontrolü daha etkili
  if (insId === 'strategic_stock' && GAME.state.disaster) mult *= 1.4;
  if (insId === 'price_controls' && GAME.state.disaster) mult *= 1.25;
  // QE: likidite tuzağı / düşük faiz ortamında daha güçlü, yüksek enflasyonda zararlı taraf güçlenir
  if (insId === 'qe' && c.ind.inflation > 8 && (k === 'inflation' || k === 'currency')) mult *= 1.3;
  if (insId === 'qe' && c.instruments.policy_rate && c.instruments.policy_rate.val < 2 && k === 'growth') mult *= 1.2;
  // Küresel etki yüksekse standart/yaptırım/derecelendirme araçları daha sert
  if ((insId === 'secondary_sanctions' || insId === 'asset_freeze' || insId === 'rating_pressure' ||
       insId === 'tech_standards' || insId === 'brussels_effect') && c.ind.influence > 70) mult *= 1.15;
  // İhracatçı enstrümanlar: petrol/gıda bağımlılığı negatifse (ihracatçı) tam güç
  const ins = GAME.INSTRUMENTS_BY_ID[insId];
  if (ins && ins.needsExporter && def.deps) {
    const d = def.deps[ins.needsExporter] || 0;
    if (d >= 0) mult *= 0.35;          // ithalatçı: zayıf silah
    else mult *= 1 + Math.min(0.6, -d); // güçlü ihracatçı: ekstra etki
  }
  // Tarif / anti-damping: yüksek ticaret fazlasında korumacılık daha az acil zarar verir
  if ((insId === 'tariff' || insId === 'anti_dumping') && k === 'trade' && c.ind.trade > 40) mult *= 1.1;
  return mult;
};

/* Hedef ülke rezerv şoku: dondurulabilir havuz ≈ min(hedef rezervi, uygulayanın finansal gücü) */
GAME.scaleTargetReserveHit = function (actorCid, targetCid, baseHit) {
  const actor = GAME.state.countries[actorCid];
  const target = GAME.state.countries[targetCid];
  if (!actor || !target) return baseHit;
  const power = Math.max(40, actor.ind.influence * 3 + actor.ind.reserves * 0.08);
  const pool = Math.min(target.ind.reserves * 0.45, power);
  const hit = -Math.min(Math.abs(baseHit), pool);
  return hit;
};

/* ---- Enstrüman değişikliğini uygula ---- */
/* cid: uygulayan ülke, ins: tanım, oldVal→newVal, target: hedef ülke id (varsa) */
GAME.applyInstrumentChange = function (cid, ins, oldVal, newVal, target) {
  const s = GAME.state;
  const st = s.countries[cid].instruments[ins.id];

  let delta;
  if (ins.type === 'toggle') delta = newVal - oldVal;               // ±1
  else if (ins.type === 'slider') delta = (newVal - oldVal) / 100;  // 0-1
  else delta = newVal - oldVal;                                     // birim başına

  st.val = newVal;
  if (target !== undefined) st.target = target;
  if (newVal > 0 && oldVal === 0) st.startTurn = s.turn;

  // Uzun vadeli proje başlatma / durdurma
  if (ins.project) {
    if (newVal > 0 && oldVal === 0) st.progress = 0;
    if (newVal === 0) st.progress = null;
  }

  const srcName = ins.name;

  // Pulse etkileri (kendi ülkesine + küresele)
  (ins.pulse || []).forEach(e => {
    const mult = GAME.crossMultiplier(cid, ins.id, e.k);
    if (e.k.startsWith('g:')) GAME.addPulse('G', e.k.slice(2), e.m * delta * mult, e.s, srcName);
    else GAME.addPulse(cid, e.k, e.m * delta * mult, e.s, srcName);
  });

  /* Döviz müdahalesi artışı: küçük enflasyon, 4 çeyrek gecikmeli, uzun sızma */
  if (ins.id === 'fx_intervention' && newVal > oldVal) {
    const mag = Math.min(1.2, (newVal - oldVal) / 30);
    const inflTotal = 0.32 * Math.max(0.25, mag);
    s.activeEffects.push({
      cid: cid, k: 'inflation', perTurn: inflTotal / 12, delay: 4, left: 12,
      src: srcName + ' (gecikmeli enflasyon)'
    });
  }

  // Hedef ülke etkileri (yalnızca açılışta şok; kapatmada ilişki kısmen toparlar)
  if (ins.onTarget && st.target && newVal > 0 && oldVal === 0) {
    const t = st.target;
    const expMult = GAME.crossMultiplier(cid, ins.id, 'growth'); // ihracatçı/güç çarpanı
    (ins.onTarget.pulse || []).forEach(e => {
      let m = e.m * expMult;
      if (e.k.startsWith('g:')) {
        GAME.addPulse('G', e.k.slice(2), m, e.s, srcName);
      } else {
        if (ins.scaleReserves && e.k === 'reserves' && m < 0) {
          m = GAME.scaleTargetReserveHit(cid, t, m);
        }
        GAME.addPulse(t, e.k, m, e.s, srcName);
      }
    });
    if (ins.onTarget.rel) {
      // Swap/yardım gibi pozitif araçlar ilişkiyi iyileştirir (rel > 0)
      GAME.changeRelation(cid, t, Math.round(ins.onTarget.rel * Math.min(1.2, expMult)));
    }
    // İkincil yaptırım: hedefin ticaret ortaklarına sızıntı (üçüncü taraf maliyeti)
    if (ins.id === 'secondary_sanctions') {
      const links = GAME.COUNTRIES[t].tradeLinks || {};
      for (const oid in links) {
        if (oid === cid) continue;
        const w = links[oid];
        GAME.addPulse(oid, 'trade', -8 * w, 'short', srcName + ' (yan etki)');
        GAME.addPulse(oid, 'growth', -0.15 * w, 'short', srcName + ' (yan etki)');
      }
    }
  }
  // Hedefli enstrüman kapatılırsa ilişki kısmen toparlar (pozitif rel için de simetrik)
  if (ins.onTarget && st.target && newVal === 0 && oldVal > 0 && ins.onTarget.rel) {
    GAME.changeRelation(cid, st.target, Math.round(-ins.onTarget.rel * 0.4));
  }

  // İç grup etkileri (aktivasyon yönüne göre)
  if (ins.groups) {
    const c = s.countries[cid];
    const gd = (ins.type === 'toggle') ? delta : (delta > 0 ? Math.min(1, Math.abs(delta) * 2) * Math.sign(delta) : delta);
    for (const gid in ins.groups) {
      if (c.groups[gid]) c.groups[gid].sat = GAME.clamp(c.groups[gid].sat + ins.groups[gid] * gd * 3, 0, 100);
    }
  }
};

/* ---- Sustain etkileri (her tur, açık enstrümanlar) ---- */
GAME.applySustains = function () {
  const s = GAME.state;
  for (const cid in s.countries) {
    const c = s.countries[cid];
    GAME.INSTRUMENTS.forEach(ins => {
      const st = c.instruments[ins.id];
      if (!st) return;
      let level = 0;
      if (ins.type === 'toggle') level = st.val > 0 ? 1 : 0;
      else if (ins.type === 'slider') level = st.val / 100;
      else { // numerical: nötr (ülke rates veya 0) değerden sapma
        const rates = GAME.COUNTRIES[cid].rates || {};
        const baseline = rates[ins.id] !== undefined ? rates[ins.id] : 0;
        level = st.val - baseline;
      }
      if (!level) return;

      const expMult = ins.needsExporter ? GAME.crossMultiplier(cid, ins.id, 'growth') : 1;
      (ins.sustain || []).forEach(e => {
        if (e.k.startsWith('g:')) GAME.applyDelta('G', e.k.slice(2), e.m * level * expMult);
        else GAME.applyDelta(cid, e.k, e.m * level);
      });
      if (ins.onTarget && st.target && st.val > 0) {
        const tMult = ins.needsExporter ? expMult : 1;
        (ins.onTarget.sustain || []).forEach(e => GAME.applyDelta(st.target, e.k, e.m * level * tMult));
      }
    });
  }
};

/* ---- Tek tur delta uygula ---- */
GAME.applyDelta = function (cid, k, v) {
  const s = GAME.state;
  if (cid === 'G') {
    s.globals[k] = GAME.clamp((s.globals[k] || 100) + v, 10, 600);
    return;
  }
  const c = s.countries[cid];
  if (!c) return;
  if (k === 'approval' || k === 'stability') {
    c.internal[k] = GAME.clamp(c.internal[k] + v, 0, 100);
  } else if (c.ind[k] !== undefined) {
    const lim = GAME.IND_LIMITS[k] || [-1e9, 1e9];
    c.ind[k] = GAME.clamp(c.ind[k] + v, lim[0], lim[1]);
  }
};

/* ---- Aktif pulse etkilerini işle (her tur) ---- */
GAME.tickActiveEffects = function () {
  const s = GAME.state;
  s.activeEffects = s.activeEffects.filter(e => {
    if (e.delay > 0) { e.delay--; return true; }
    GAME.applyDelta(e.cid, e.k, e.perTurn);
    e.left--;
    return e.left > 0;
  });
};

/* ---- Tabana geri çekilme (mean reversion) ----
   Gösterge bazlı hızlar: büyüme hızlı normalleşir, borç yapışkandır.
   Bu, tur başına eklenen etkilerin sınırsız birikmesini engeller. */
GAME.REVERSION = {
  growth: 0.15, inflation: 0.08, unemployment: 0.12, reserves: 0.04,
  debt: 0.02, currency: 0.06, trade: 0.08, influence: 0.03
};
GAME.meanReversion = function () {
  const s = GAME.state;
  for (const cid in s.countries) {
    const c = s.countries[cid];
    for (const k in c.base) {
      const rate = GAME.REVERSION[k] !== undefined ? GAME.REVERSION[k] : 0.05;
      c.ind[k] += (c.base[k] - c.ind[k]) * rate;
    }
  }
  for (const k in s.globals) {
    s.globals[k] += (s.gBase[k] - s.globals[k]) * 0.06;
  }
};

/* ---- Küresel değişkenlerin ülkelere etkisi ---- */
GAME.applyGlobalExposure = function () {
  const s = GAME.state;
  for (const cid in s.countries) {
    const c = s.countries[cid];
    const deps = GAME.COUNTRIES[cid].deps;
    const oil = (s.globals.oil - 100) / 100, food = (s.globals.food - 100) / 100,
          chip = (s.globals.chip - 100) / 100, ship = (s.globals.ship - 100) / 100,
          gt = (s.globals.trade - 100) / 100;
    // Enflasyon baskısı: pahalı petrol/gıda/lojistik
    GAME.applyDelta(cid, 'inflation', (oil * deps.oil * 0.9) + (food * deps.food * 0.8) + (ship * deps.ship * 0.4));
    // Büyüme baskısı
    GAME.applyDelta(cid, 'growth', -(oil * Math.max(0, deps.oil) * 0.35) - (chip * Math.max(0, deps.chip) * 0.3) + (gt * 0.5));
    // İhracatçılar için kazanç (negatif bağımlılık = ihracatçı)
    if (deps.oil < 0) { GAME.applyDelta(cid, 'trade', oil * (-deps.oil) * 20); GAME.applyDelta(cid, 'reserves', oil * (-deps.oil) * 15); }
    if (deps.food < 0) { GAME.applyDelta(cid, 'trade', food * (-deps.food) * 12); }
    // Dolar endeksi: yükselen dolar diğer paraları zayıflatır
    if (cid !== 'USA') GAME.applyDelta(cid, 'currency', -((s.globals.dollar - 100) / 100) * (deps.dollar || 0.3) * 2.5);
    else GAME.applyDelta(cid, 'currency', ((s.globals.dollar - 100) / 100) * 1.5);
  }
};

/* ---- Ticaret ağı yayılımı (sönümlü + sınırlı: ölüm sarmalını engeller) ---- */
GAME.propagateTrade = function (prevGrowth) {
  const s = GAME.state;
  for (const cid in s.countries) {
    const links = GAME.COUNTRIES[cid].tradeLinks;
    let spill = 0;
    for (const pid in links) {
      const pg = prevGrowth[pid] || 0;
      // Ortakların trend büyümesinden sapması komşuya sızar
      spill += (pg - GAME.COUNTRIES[pid].ind.growth) * links[pid] * 0.25;
    }
    spill = GAME.clamp(spill, -1.2, 1.2);
    GAME.applyDelta(cid, 'growth', spill * 0.5);
    GAME.applyDelta(cid, 'trade', spill * 6);
  }
};

/* ---- Ekonomik iç tutarlılık bağları ---- */
GAME.economicLinks = function () {
  const s = GAME.state;
  for (const cid in s.countries) {
    const c = s.countries[cid];
    const rates = c.instruments;
    // Büyüme ↔ işsizlik (Okun benzeri): hedefe çekme, birikimli değil
    const gGap = c.ind.growth - GAME.COUNTRIES[cid].ind.growth;
    const unempTarget = GAME.COUNTRIES[cid].ind.unemployment - gGap * 0.8;
    c.ind.unemployment += (GAME.clamp(unempTarget, 1, 35) - c.ind.unemployment) * 0.12;
    // Zayıf para → enflasyon (geçişkenlik, sınırlı)
    const curGap = Math.min(0.4, (100 - c.ind.currency) / 100);
    if (curGap > 0) GAME.applyDelta(cid, 'inflation', curGap * 1.0);
    // Güçlü para enflasyonu hafif baskılar
    else if (c.ind.currency > 105) GAME.applyDelta(cid, 'inflation', -((c.ind.currency - 100) / 100) * 0.15);
    // Ticaret fazlası rezervi besler
    GAME.applyDelta(cid, 'reserves', GAME.clamp(c.ind.trade * 0.02, -6, 6));
    // Faiz–borç servisi: yüksek faiz + yüksek borç → borç stoku büyür
    if (rates.policy_rate) {
      const baseRate = (GAME.COUNTRIES[cid].rates && GAME.COUNTRIES[cid].rates.policy_rate) || 4;
      const realBurden = (rates.policy_rate.val - baseRate) * Math.max(0, c.ind.debt - 60) / 100;
      if (realBurden > 0) GAME.applyDelta(cid, 'debt', Math.min(1.5, realBurden * 0.15));
    }
    // Çok yüksek enflasyon istikrarı ve onayı yer
    if (c.ind.inflation > 25) {
      GAME.applyDelta(cid, 'stability', -Math.min(3, (c.ind.inflation - 25) * 0.04));
      GAME.applyDelta(cid, 'approval', -Math.min(1.5, (c.ind.inflation - 25) * 0.02));
    }
    // Negatif büyüme borcu artırır (sınırlı)
    if (c.ind.growth < 0) GAME.applyDelta(cid, 'debt', Math.min(2, -c.ind.growth * 0.3));
    // Aşırı borç büyümeyi frenler (crowding-out)
    if (c.ind.debt > 140) GAME.applyDelta(cid, 'growth', -Math.min(0.25, (c.ind.debt - 140) * 0.004));
  }
};

/* ---- Felaket şoku uygula (tetiklendiği tur) ---- */
GAME.applyDisaster = function (dis) {
  const s = GAME.state;
  // Küresel etkiler: dur boyunca sürer (pulse olarak eklenir)
  (dis.global || []).forEach(e => {
    GAME.state.activeEffects.push({ cid: 'G', k: e.k, perTurn: e.m, delay: 0, left: e.dur, src: dis.name });
  });
  // Kalıcı küresel kaymalar
  (dis.gPerm || []).forEach(e => GAME.addPerm(null, 'g:' + e.k, e.m, dis.name));
  // Ülke şokları (şiddet çarpanlı)
  for (const cid in s.countries) {
    const sev = (dis.sev && dis.sev[cid] !== undefined) ? dis.sev[cid] : 1.0;
    (dis.country || []).forEach(e => {
      s.activeEffects.push({ cid: cid, k: e.k, perTurn: e.m * sev, delay: 0, left: e.dur, src: dis.name });
    });
  }
};

/* ---- Proje ilerlemesi (her tur) ---- */
GAME.tickProjects = function (newsOut) {
  const s = GAME.state;
  for (const cid in s.countries) {
    const c = s.countries[cid];
    GAME.INSTRUMENTS.forEach(ins => {
      if (!ins.project) return;
      const st = c.instruments[ins.id];
      if (!st || st.val <= 0 || st.progress === null || st.progress === undefined) return;
      if (st.progress >= 100) return;
      st.progress = Math.min(100, st.progress + 100 / ins.project);
      const milestone = Math.floor(st.progress);
      if (st.progress >= 100) {
        // Tamamlandı → kalıcı etkiler
        (ins.complete || []).forEach(e => {
          if (e.k.startsWith('g:')) GAME.addPerm(cid, e.k, e.m, GAME.COUNTRIES[cid].name + ': ' + ins.name);
          else GAME.addPerm(cid, e.k, e.m, GAME.COUNTRIES[cid].name + ': ' + ins.name);
        });
        if (newsOut) newsOut.push({ type: 'proje', cid: cid, insName: ins.name, done: true });
      } else if ((milestone >= 50 && milestone - 100 / ins.project < 50) || (milestone >= 75 && milestone - 100 / ins.project < 75)) {
        if (newsOut) newsOut.push({ type: 'proje', cid: cid, insName: ins.name, done: false, pct: milestone });
      }
    });
  }
};
