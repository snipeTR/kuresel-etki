/* ============ KÜRESEL ETKİ — İç Dinamikler ve Toplum Psikolojisi ============ */
window.GAME = window.GAME || {};

/* Her tur: grup memnuniyeti → toplum onayı → istikrar → iç olaylar */
GAME.updateInternalDynamics = function (eventsOut) {
  const s = GAME.state;
  for (const cid in s.countries) {
    const c = s.countries[cid];
    const def = GAME.COUNTRIES[cid];
    const isDemo = def.gov === 'demokratik' || def.gov === 'birlik';
    const isAuto = def.gov === 'otoriter';

    /* 1. Grup memnuniyetleri: ekonomik koşullardan etkilenir + 55'e yavaş dönüş */
    const infl = c.ind.inflation, unemp = c.ind.unemployment, growth = c.ind.growth;
    const baseInfl = def.ind.inflation, baseUnemp = def.ind.unemployment;

    for (const gid in c.groups) {
      const g = c.groups[gid];
      let d = (55 - g.sat) * 0.03; // yavaş normalleşme
      const inflGap = infl - baseInfl, unempGap = unemp - baseUnemp;
      if (gid === 'labor')    d += -inflGap * 0.10 - unempGap * 0.5 + growth * 0.08;
      if (gid === 'rural')    d += -inflGap * 0.12 - ((s.globals.food - 100) / 100) * 1.5;
      if (gid === 'business') d += growth * 0.15 - Math.max(0, inflGap) * 0.05;
      if (gid === 'liberal')  d += -Math.max(0, inflGap) * 0.04;
      if (gid === 'nationalist' && s.disaster) d += 0.3; // dış tehdit algısı milliyetçiyi konsolide eder
      if (gid === 'bureau')   d += (c.internal.stability - 60) * 0.02;
      g.sat = GAME.clamp(g.sat + d, 0, 100);

      // Radikalleşme
      if (g.sat < 20) g.radical = Math.min(100, g.radical + 4);
      else if (g.sat > 40) g.radical = Math.max(0, g.radical - 2);
    }

    /* 2. Toplum onayı = ağırlıklı ortalama */
    let approval = 0;
    for (const gid in c.groups) approval += c.groups[gid].sat * (def.groupPower[gid] || 0);
    // Otoriterlerde onay daha yapışkan (propaganda etkisi)
    const inertia = isAuto ? 0.5 : 0.3;
    c.internal.approval = GAME.clamp(c.internal.approval * inertia + approval * (1 - inertia), 0, 100);

    /* 3. İstikrar */
    const sats = Object.keys(c.groups).map(g => c.groups[g].sat);
    const polarization = Math.max(...sats) - Math.min(...sats);
    const radicalAvg = Object.keys(c.groups).reduce((a, g) => a + c.groups[g].radical, 0) / 6;
    let stTarget = c.internal.approval * 0.55
      + (100 - polarization) * 0.15
      + Math.max(0, 100 - unemp * 3) * 0.15
      + Math.max(0, 100 - Math.max(0, infl - 5) * 1.5) * 0.15
      - radicalAvg * 0.25
      - (s.disaster ? 6 : 0);
    if (isAuto) stTarget += 8; // baskı aygıtı
    c.internal.stability = GAME.clamp(c.internal.stability * 0.7 + GAME.clamp(stTarget, 0, 100) * 0.3, 0, 100);

    /* 4. Siyasi sermaye yenilenmesi (FX sık kullanımı regen penaltısı) */
    let regen = 2 + (c.internal.approval - 50) * 0.06;
    if (typeof GAME.fxRegenPenalty === 'function') regen -= GAME.fxRegenPenalty(cid);
    c.internal.polCap = GAME.clamp(c.internal.polCap + regen, 0, 100);

    /* 5. İç olaylar (eşik kontrolü, ülke başına tur başına en çok 1) */
    if (!eventsOut) continue;
    const stab = c.internal.stability, appr = c.internal.approval;
    const roll = Math.random();
    if (c.groups.labor.sat < 30 && roll < 0.4) {
      GAME.applyDelta(cid, 'growth', -0.8); GAME.applyDelta(cid, 'inflation', 0.3);
      eventsOut.push({ ev: 'grev', cid: cid });
    } else if (stab < 35 && radicalAvg > 25 && roll < 0.45) {
      c.internal.approval = GAME.clamp(appr - 12, 0, 100); GAME.applyDelta(cid, 'growth', -1.0);
      eventsOut.push({ ev: 'buyuk_protesto', cid: cid });
    } else if (stab < 50 && roll < 0.3) {
      c.internal.approval = GAME.clamp(appr - 5, 0, 100); GAME.applyDelta(cid, 'growth', -0.3);
      eventsOut.push({ ev: 'protesto', cid: cid });
    } else if (appr < 25 && isDemo && roll < 0.35) {
      // Hükümet değişikliği: politika sıfırlaması + onay resetlenir
      c.internal.approval = 50; c.internal.polCap = Math.max(20, c.internal.polCap - 30);
      eventsOut.push({ ev: 'hukumet_degisti', cid: cid });
    } else if (appr < 45 && isDemo && roll < 0.25) {
      c.internal.polCap = Math.max(0, c.internal.polCap - 8);
      eventsOut.push({ ev: 'secim_baskisi', cid: cid });
    } else if (stab < 20 && isAuto && roll < 0.3) {
      c.internal.stability += 10; c.groups.liberal.sat -= 8;
      eventsOut.push({ ev: 'otoriter_sikilasma', cid: cid });
    }
  }
};
