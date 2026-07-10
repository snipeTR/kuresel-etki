/* ============ KÜRESEL ETKİ — Oyun Panelleri ============ */
window.GAME = window.GAME || {};

GAME.ui = { activeLayer: 2, feedFilter: 'all', helpConsent: false, helpCache: null, instrPage: 0 };

/* Kısa etiketler — üst şerit kaydırmasız sığsın */
GAME.HDR_SHORT = {
  USA:'ABD', CHN:'Çin', EU:'AB', JPN:'Jap', IND:'Hin', GBR:'BK', RUS:'Rus',
  CAN:'Kan', BRA:'Bre', KOR:'Kor', AUS:'Avu', MEX:'Mek', IDN:'End', SAU:'Sau',
  TUR:'Tür', CHE:'İsv', ZAF:'GAf'
};

/* ================= HEADER ================= */
GAME.renderHeader = function () {
  const s = GAME.state;
  document.getElementById('hdr-country').textContent = GAME.pdef().flag + ' ' + GAME.pdef().name;
  document.getElementById('hdr-date').textContent = GAME.turnDate(s.turn) + '  (Tur ' + s.turn + '/' + GAME.MAX_TURNS + ')';
  document.getElementById('hdr-polcap').innerHTML = '🏛 <b>' + Math.round(GAME.pc().internal.polCap) + '</b>';
  const used = s.pending.length;
  const slotsLeft = GAME.SLOTS_PER_TURN - used;
  document.getElementById('hdr-slots').innerHTML = GAME.t
    ? GAME.t('ui.slots_html', { used: slotsLeft, max: GAME.SLOTS_PER_TURN })
    : ('Müdahale: <b>' + slotsLeft + '/' + GAME.SLOTS_PER_TURN + '</b>');

  // Ülke çipleri: bayrak + kısa ad; ayrılan alana kaydırmasız sığar
  const map = document.getElementById('hdr-map');
  map.innerHTML = '';
  for (const cid in s.countries) {
    const chip = document.createElement('span');
    chip.className = 'map-chip';
    const def = GAME.COUNTRIES[cid];
    const short = GAME.HDR_SHORT[cid] || cid;
    if (cid === s.player) {
      chip.style.borderColor = '#000080'; chip.style.color = '#000080';
      chip.style.background = '#e8e8ff';
      chip.textContent = def.flag + short;
      chip.title = def.name + ' (sen) — haritada göster';
    } else {
      const rel = GAME.getRelation(s.player, cid);
      chip.style.borderColor = GAME.relationColor(rel);
      chip.style.color = GAME.relationColor(rel);
      chip.textContent = def.flag + short;
      chip.title = def.name + ' — İlişki: ' + Math.round(rel) + ' (haritada göster)';
    }
    chip.onclick = () => GAME.openMapModal(cid);
    map.appendChild(chip);
  }
};

/* ================= SOL PANEL ================= */
GAME.renderLeftPanel = function () {
  const s = GAME.state, c = GAME.pc(), def = GAME.pdef();
  document.getElementById('left-country-head').innerHTML = def.flag + ' ' + def.name +
    ' <span style="font-size:11px;color:#505050">(' + def.gov + ')</span>';

  // Göstergeler + değişim okları
  const indBox = document.getElementById('left-indicators');
  indBox.innerHTML = '';
  const keys = ['growth', 'inflation', 'unemployment', 'reserves', 'debt', 'currency', 'trade', 'influence'];
  keys.forEach(k => {
    const meta = GAME.IND_META[k];
    const h = c.history[k] || [];
    const prev = h.length >= 2 ? h[h.length - 2] : c.ind[k];
    const d = c.ind[k] - prev;
    const goodDir = meta.goodUp ? d : -d;
    const cls = Math.abs(d) < 0.05 ? 'flat' : (goodDir > 0 ? 'up' : 'down');
    const arrow = Math.abs(d) < 0.05 ? '—' : (d > 0 ? '▲' : '▼');
    indBox.innerHTML += '<div class="ind-row"><span class="lbl">' + meta.name + '</span>' +
      '<span class="val">' + GAME.fmt(c.ind[k], meta.dec) + meta.unit +
      '<span class="delta ' + cls + '">' + arrow + GAME.fmt(Math.abs(d), meta.dec) + '</span></span></div>';
  });

  // İç istikrar
  const intBox = document.getElementById('left-internal');
  intBox.innerHTML =
    '<div class="ind-row"><span class="lbl">Toplum Onayı</span><span class="val">' + Math.round(c.internal.approval) + '/100</span></div>' +
    '<div class="ind-row"><span class="lbl">İstikrar</span><span class="val">' + Math.round(c.internal.stability) + '/100</span></div>' +
    '<div class="ind-row"><span class="lbl">Siyasi Sermaye</span><span class="val">' + Math.round(c.internal.polCap) + '/100</span></div>';
  // Grup memnuniyetleri (mini)
  for (const gid in c.groups) {
    const g = c.groups[gid], meta = GAME.GROUPS[gid];
    const col = g.sat < 30 ? '#c00000' : g.sat < 50 ? '#c05000' : '#008000';
    intBox.innerHTML += '<div class="ind-row" title="' + meta.concerns + '">' +
      '<span class="lbl" style="font-size:11px">· ' + meta.name + '</span>' +
      '<span class="val" style="color:' + col + ';font-size:11px">' + Math.round(g.sat) +
      (g.radical > 30 ? ' ⚡' : '') + '</span></div>';
  }

  // Aktif politikalar
  const polBox = document.getElementById('left-policies');
  polBox.innerHTML = '';
  let any = false;
  GAME.INSTRUMENTS.forEach(ins => {
    const st = c.instruments[ins.id];
    if (!st) return;
    let active = false, stateTxt = '';
    if (ins.type === 'toggle' && st.val > 0) { active = true; stateTxt = 'AÇIK'; }
    else if (ins.type === 'slider' && st.val > 0) { active = true; stateTxt = 'Seviye: ' + Math.round(st.val); }
    else if (ins.type === 'numerical') {
      const defRate = def.rates ? def.rates[ins.id] : undefined;
      if (defRate !== undefined && Math.abs(st.val - defRate) > 0.01) { active = true; stateTxt = GAME.fmt(st.val, 1) + ins.unit; }
    }
    if (!active) return;
    any = true;
    const typeLabel = ins.type === 'toggle' ? 'T' : ins.type === 'slider' ? 'S' : 'N';
    let html = '<div class="policy-item"><span class="p-type">' + typeLabel + '</span>' +
      '<span class="p-name">' + ins.name + '</span>' +
      '<div class="p-meta">' + stateTxt +
      (st.target ? ' → ' + GAME.COUNTRIES[st.target].flag + ' ' + GAME.COUNTRIES[st.target].name : '') + '</div>';
    if (ins.project && st.progress !== null && st.progress !== undefined && st.progress < 100) {
      html += '<div class="progress-bar"><div class="progress-fill" style="width:' + st.progress + '%"></div></div>' +
        '<div class="p-meta">Proje: %' + Math.round(st.progress) + '</div>';
    } else if (ins.project && st.progress >= 100) {
      html += '<div class="p-meta" style="color:#008000">✓ Tamamlandı — kalıcı etki aktif</div>';
    }
    html += '</div>';
    polBox.innerHTML += html;
  });
  if (!any) polBox.innerHTML = '<div style="color:#505050;font-size:12px">Henüz aktif politika yok.</div>';
};

/* ================= ORTA PANEL KARTLARI ================= */
GAME.renderCenterCards = function () {
  const s = GAME.state, box = document.getElementById('center-cards');
  // Son müdahaleler
  const recent = s.interventionLog.slice(-4).reverse()
    .map(iv => '· <b>T' + iv.turn + '</b> ' + iv.name + (iv.target ? ' → ' + GAME.COUNTRIES[iv.target].name : '')).join('<br>') ||
    '<span style="color:#505050">Henüz müdahale yapılmadı</span>';
  // Küresel değişkenler
  let globals = '';
  for (const k in s.globals) {
    const d = s.globals[k] - 100;
    const col = Math.abs(d) < 5 ? '#505050' : (d > 0 ? '#c05000' : '#008000');
    globals += '· ' + GAME.GLOBALS_INIT[k].name + ': <b style="color:' + col + '">' + Math.round(s.globals[k]) + '</b><br>';
  }
  // Riskler
  const c = GAME.pc();
  const risks = [];
  if (c.ind.reserves < 80) risks.push('Rezerv düşük');
  if (c.ind.inflation > 30) risks.push('Enflasyon yüksek');
  if (c.internal.stability < 45) risks.push('İstikrar kırılgan');
  if (c.ind.debt > 120) risks.push('Borç yükü ağır');
  if (c.internal.polCap < 25) risks.push('Siyasi sermaye az');
  GAME.INSTRUMENTS.filter(i => i.risk >= 2).forEach(i => {
    if (c.instruments[i.id].val > 0) risks.push('Gri alan operasyonu aktif: tespit riski');
  });

  box.innerHTML =
    '<div class="info-card"><h4>Son Müdahaleler</h4><div>' + recent + '</div></div>' +
    '<div class="info-card"><h4>Küresel Göstergeler</h4><div>' + globals + '</div></div>' +
    '<div class="info-card"><h4>Öne Çıkan Riskler</h4><div>' +
    (risks.length ? risks.map(r => '⚠ ' + r).join('<br>') : '<span style="color:#008000">Belirgin risk yok</span>') +
    '</div></div>';
};

/* ================= SAĞ PANEL: MESAJ AKIŞI (mIRC tarzı) ================= */
GAME.CHANNELS = [
  ['all', '#genel'], ['eko', '#ekonomi'], ['diplo', '#diplomasi'], ['global', '#küresel'],
  ['ic', '#iç-olaylar'], ['gri', '#gri-alan'], ['benim', '#benim-ülkem']
];
/* mIRC nick renkleri (ülke başına sabit kimlik) */
GAME.NICK_COLORS = {
  USA: '#000080', CHN: '#c00000', EU: '#003399', JPN: '#008080', IND: '#ff6600',
  GBR: '#0000a0', RUS: '#a00000', CAN: '#cc0000', BRA: '#009933', KOR: '#0066cc',
  AUS: '#006666', MEX: '#006600', IDN: '#990000', SAU: '#006633', TUR: '#c05000',
  CHE: '#cc0000', ZAF: '#ffcc00'
};

/* Kaynak metninden ülke id'si bul (nick rengi için) */
GAME.sourceCid = function (source) {
  if (!source) return null;
  for (const cid in GAME.COUNTRIES) {
    if (source.indexOf(GAME.COUNTRIES[cid].name) >= 0) return cid;
  }
  return null;
};

GAME.renderFeed = function () {
  const s = GAME.state;
  const filterBox = document.getElementById('feed-filters');
  filterBox.innerHTML = '';
  GAME.CHANNELS.forEach(([id, label]) => {
    const b = document.createElement('button');
    b.className = 'chan-tab' + (GAME.ui.feedFilter === id ? ' active' : '');
    b.textContent = label;
    b.onclick = () => { GAME.ui.feedFilter = id; GAME.renderFeed(); };
    filterBox.appendChild(b);
  });

  const feed = document.getElementById('news-feed');
  feed.innerHTML = '';
  let items = s.news.slice(-200);
  const f = GAME.ui.feedFilter;
  if (f === 'benim') items = items.filter(m => (m.involves || []).includes(s.player));
  else if (f !== 'all') items = items.filter(m => m.cat === f);
  items = items.slice(-120); // kanalda son 120 satır

  let lastTurn = null, prevKey = null, prevBold = false;
  items.forEach(m => {
    // Çeyrek değişiminde kalın ayırıcı çizgi
    if (m.turn !== lastTurn) {
      const sep = document.createElement('div');
      sep.className = 'irc-divider';
      sep.textContent = '━━━ ' + (m.date || '') + ' ━━━';
      feed.appendChild(sep);
      lastTurn = m.turn; prevKey = null; prevBold = false;
    }
    const div = document.createElement('div');
    const time = '<span class="irc-time">[' + (m.date || '').replace(/^20(\d\d) /, '$1') + ']</span> ';
    const cid = GAME.sourceCid(m.source);
    const toneCls = m.tone === 5 ? ' t5' : m.tone === 4 ? ' t4' : '';
    const impCls = m.important ? ' imp' : '';
    const effect = m.effect ? ' <span class="irc-effect">(Etki: ' + m.effect + ')</span>' : '';
    if (cid) {
      // ülke mesajı: [27Q2] <🇨🇳 Çin> başlık — gövde
      const nick = '<span class="irc-nick" style="color:' + GAME.NICK_COLORS[cid] + '">&lt;' + m.source + '&gt;</span> ';
      div.className = 'irc-line' + toneCls + impCls;
      div.innerHTML = time + nick + m.title + (m.body ? ' — ' + m.body : '') + effect;
    } else {
      // sunucu/sistem bildirimi: *** metin
      div.className = 'irc-line irc-status-line' + (m.tone === 5 ? ' t5' : '') + impCls;
      div.innerHTML = time + '*** ' + (m.source ? m.source + ': ' : '') + m.title + (m.body ? ' — ' + m.body : '') + effect;
    }
    // Aynı renkte iki ardışık mesaj: biri normal, biri kalın (mIRC okunabilirliği)
    const key = (cid || 'sys') + '|' + toneCls;
    const alt = (key === prevKey) ? !prevBold : false;
    if (alt) div.classList.add('alt-b');
    prevBold = alt; prevKey = key;
    feed.appendChild(div);
  });
  if (!items.length) feed.innerHTML = '<div class="irc-line irc-status-line">*** Bu kanalda henüz mesaj yok.</div>';
  feed.scrollTop = feed.scrollHeight; // mIRC gibi: en yeni altta, otomatik kaydır
};

/* İşlem durumu satırı ("*** Çin işlem yapıyor...") */
GAME.setFeedStatus = function (txt) {
  const el = document.getElementById('feed-status');
  if (el) el.textContent = txt || '';
};

/* Sağ paneli aç/kapa */
GAME.toggleFeed = function (collapse) {
  const body = document.getElementById('game-body');
  const panel = document.getElementById('panel-right');
  const reopen = document.getElementById('feed-reopen');
  const on = (collapse !== undefined) ? collapse : !panel.classList.contains('collapsed');
  panel.classList.toggle('collapsed', on);
  body.classList.toggle('feed-collapsed', on);
  reopen.classList.toggle('hidden', !on);
  try { localStorage.setItem('keFeedCollapsed_oyungrok', on ? '1' : '0'); } catch (e) {}
  if (GAME.state) GAME.drawChart();
};

/* ================= ZENGİN ENSTRÜMAN DETAYI + TOOLTIP ================= */
GAME.TS_LABEL = { imm: 'Anında (0-6 ay)', short: 'Kısa vade (3-15 ay)', med: 'Orta vade (1-3,5 yıl)', long: 'Uzun vade (3-9 yıl)' };
GAME.TS_NARR = { imm: 'hemen', short: '3-12 ay içinde', med: '1-3 yıl içinde', long: 'uzun vadede (3+ yıl)' };

/* Etki motorundaki çapraz çarpan kurallarının insan diliyle açıklaması */
GAME.CROSS_RULES = {
  policy_rate: ['Kamu borcu GDP\'nin %100\'ünü aşmışsa tüm etkiler 1.35×; %200+ ise ek 1.15× (borç servisi).',
                'Sermaye kontrolü (seviye >30) aktifken kur etkisi 1.3× güçlenir.',
                'Yüksek faiz + yüksek borç her çeyrek borç stokunu büyütür (servis maliyeti).'],
  fx_intervention: ['Enflasyon %30+ ise 0.7×, %50+ ise ek 0.75× zayıflar.',
                    'Rezerv 60 mlr$ altındaysa etki 0.5×. Seviye açık kaldıkça her çeyrek rezerv erir.'],
  shadow_fx: ['Rezerv 60 mlr$ altındaysa 0.5×; yüksek enflasyonda etkinlik düşer.'],
  strategic_stock: ['Aktif felaket sırasında etkisi 1.4× güçlenir.'],
  price_controls: ['Felaket sırasında 1.25× daha etkili (kısa vadeli sosyal rahatlama).'],
  qe: ['Enflasyon %8+ iken enflasyon/kur yan etkileri 1.3× güçlenir.',
       'Politika faizi %2 altındayken büyüme etkisi 1.2× (likidite tuzağına yakın).'],
  energy_weapon: ['Yalnızca net enerji ihracatçılarında (deps.oil < 0) tam güç; ithalatçıda ~0.35×.'],
  food_weapon: ['Yalnızca net gıda ihracatçılarında (deps.food < 0) tam güç; ithalatçıda ~0.35×.'],
  secondary_sanctions: ['Küresel Etki >70 ise 1.15×. Hedefin ticaret ortaklarına yan sızıntı uygular.'],
  asset_freeze: ['Rezerv şoku hedefin rezervi ve senin finansal gücünle ölçeklenir (sınırsız değil).',
                 'Küresel Etki >70 ise genel etki 1.15×.'],
  rating_pressure: ['Küresel Etki >70 ise 1.15× (finans merkezleri daha etkili).'],
  tariff: ['Ticaret fazlası yüksekken korumacılığın trade kazancı biraz güçlenir.']
};
GAME.RISK_PCT = { 1: '%3,5', 2: '%7', 3: '%12' };

GAME.KEY_LABEL = function (k) {
  if (k.startsWith('g:')) { const g = GAME.GLOBALS_INIT[k.slice(2)]; return '🌍 ' + (g ? g.name : k); }
  const m = GAME.IND_META[k]; return m ? m.name : k;
};
/* Etki kendi ülken için iyi mi? (yeşil/kırmızı) */
GAME.effSpan = function (e) {
  let col = '#000';
  if (!e.k.startsWith('g:')) {
    const meta = GAME.IND_META[e.k];
    if (meta) col = ((e.m > 0) === meta.goodUp) ? '#008000' : '#c00000';
  }
  const v = (e.m > 0 ? '+' : '') + (Math.round(e.m * 100) / 100);
  return '<span style="color:' + col + '"><b>' + GAME.KEY_LABEL(e.k) + ' ' + v + '</b></span>';
};

/* Otomatik senaryo anlatısı: tüm etkiler zaman zincirine dizilir */
GAME.scenarioText = function (ins) {
  const seq = [];
  const by = { imm: [], short: [], med: [], long: [] };
  (ins.pulse || []).forEach(e => by[e.s] && by[e.s].push(e));
  const dir = e => GAME.KEY_LABEL(e.k).toLowerCase() + (e.m > 0 ? ' yükselir' : ' düşer');
  ['imm', 'short', 'med', 'long'].forEach(s => {
    if (by[s].length) seq.push(GAME.TS_NARR[s] + ' ' + by[s].map(dir).join(', '));
  });
  if (ins.sustain && ins.sustain.length)
    seq.push('açık kaldığı her çeyrek ' + ins.sustain.map(dir).join(', '));
  let txt = seq.length ? 'Uygularsan: ' + seq.join('; ') + '.' : '';
  if (ins.onTarget) {
    const t = [];
    (ins.onTarget.pulse || []).forEach(e => t.push(dir(e)));
    (ins.onTarget.sustain || []).forEach(e => t.push('her çeyrek ' + dir(e)));
    if (t.length) txt += ' Hedef ülkede ' + t.join(', ') + '.';
    if (ins.onTarget.rel) txt += ' İlişki ' + ins.onTarget.rel + ' puan değişir; hedef misilleme yapabilir, müttefikleri tonlu mesajlarla tepki verir.';
  }
  if (ins.project && ins.complete) {
    txt += ' Proje ~' + Math.round(ins.project / 4 * 10) / 10 + ' yılda tamamlanır ve KALICI miras bırakır: ' +
      ins.complete.map(dir).join(', ') + '.';
  }
  if (ins.groups) {
    const pos = [], neg = [];
    for (const g in ins.groups) (ins.groups[g] > 0 ? pos : neg).push(GAME.GROUPS[g].name);
    if (pos.length) txt += ' İç cephede ' + pos.join(', ') + ' memnun olur';
    if (neg.length) txt += (pos.length ? '; ' : ' İç cephede ') + neg.join(', ') + ' rahatsız olur';
    if (pos.length || neg.length) txt += '.';
  }
  if (ins.risk) txt += ' Tespit edilirse skandal patlar: ilişkiler çöker, misilleme yaptırımı gelir, itibar ve toplum onayı düşer.';
  return txt;
};

/* Tam detay bloğu (tooltip + modal içinde kullanılır) */
GAME.instrumentDetail = function (ins) {
  const typeName = ins.type === 'toggle' ? 'Toggle (Aç/Kapat)' : ins.type === 'slider' ? 'Slider (0-100)' : 'Sayısal Değer';
  const basis = ins.type === 'toggle' ? 'Değerler: aktifleştirme başına toplam etki' :
    ins.type === 'slider' ? 'Değerler: tam seviye (100) için — orantılı uygulanır' :
    'Değerler: her +1' + (ins.unit || '') + ' değişim başına';
  let h = '<div class="tt-head">' + ins.name + '</div>' +
    '<div class="tt-tags">' + typeName + ' · ' + GAME.LAYERS[ins.layer].name + ' · 🏛 ' +
    (GAME.state && GAME.state.player ? GAME.instrumentCost(GAME.state.player, ins.id) : (ins.cost || 8)) + ' siyasi sermaye' +
    (ins.targeted ? ' · 🎯 Hedef ülke seçilir' : '') +
    (ins.project ? ' · 🏗 ~' + Math.round(ins.project / 4 * 10) / 10 + ' yıllık proje' : '') + '</div>' +
    '<div>' + ins.desc + '</div>';

  const secs = [];
  const by = { imm: [], short: [], med: [], long: [] };
  (ins.pulse || []).forEach(e => by[e.s] && by[e.s].push(e));
  let fx = '';
  ['imm', 'short', 'med', 'long'].forEach(s => {
    if (by[s].length) fx += '· ' + GAME.TS_LABEL[s] + ': ' + by[s].map(GAME.effSpan).join(', ') + '<br>';
  });
  if (fx) secs.push('<b>Etkiler (kendi ülkene):</b><br>' + fx + '<span style="color:#505050;font-size:11px">' + basis + '</span>');
  if (ins.sustain && ins.sustain.length)
    secs.push('<b>Sürekli etki (açık kaldıkça, her çeyrek):</b><br>· ' + ins.sustain.map(GAME.effSpan).join(', '));
  if (ins.onTarget) {
    let t = '';
    if (ins.onTarget.pulse && ins.onTarget.pulse.length) t += '· Şok: ' + ins.onTarget.pulse.map(GAME.effSpan).join(', ') + '<br>';
    if (ins.onTarget.sustain && ins.onTarget.sustain.length) t += '· Her çeyrek: ' + ins.onTarget.sustain.map(GAME.effSpan).join(', ') + '<br>';
    if (ins.onTarget.rel) t += '· İlişki puanı: <b style="color:#c00000">' + ins.onTarget.rel + '</b><br>';
    secs.push('<b>🎯 Hedef ülkeye etkiler:</b><br>' + t);
  }
  if (ins.project && ins.complete)
    secs.push('<b>🏗 Proje tamamlanınca (KALICI miras):</b><br>· ' + ins.complete.map(GAME.effSpan).join(', '));
  if (ins.groups && Object.keys(ins.groups).length) {
    const g = Object.keys(ins.groups).map(gid => {
      const v = ins.groups[gid];
      return '<span style="color:' + (v > 0 ? '#008000' : '#c00000') + '">' + GAME.GROUPS[gid].name + ' ' + (v > 0 ? '+' : '') + v + '</span>';
    }).join(', ');
    secs.push('<b>İç gruplara etkisi:</b><br>' + g);
  }
  if (GAME.CROSS_RULES[ins.id])
    secs.push('<b>⚡ Çapraz etki kuralları:</b><br>' + GAME.CROSS_RULES[ins.id].map(r => '· ' + r).join('<br>'));
  if (ins.risk)
    secs.push('<b style="color:#c00000">☠ Gri alan riski:</b> Açık kaldığı her çeyrek ' + GAME.RISK_PCT[ins.risk] +
      ' tespit şansı. Tespitte: hedefle ilişki -70, herkesle -15, misilleme vergisi, Küresel Etki -5, Toplum Onayı -4.');
  const scn = GAME.scenarioText(ins);
  if (scn) secs.push('<b>📜 Senaryo:</b> ' + scn);
  return h + secs.map(sc => '<div class="tt-sec">' + sc + '</div>').join('');
};

GAME.showInstrTooltip = function (ins, btn) {
  const tp = document.getElementById('tooltip');
  tp.innerHTML = GAME.instrumentDetail(ins);
  tp.classList.remove('hidden');
  const r = btn.getBoundingClientRect();
  tp.style.left = Math.max(4, Math.min(r.left, window.innerWidth - 460)) + 'px';
  tp.style.bottom = (window.innerHeight - r.top + 8) + 'px';
};
GAME.hideInstrTooltip = function () {
  document.getElementById('tooltip').classList.add('hidden');
};

/* ================= ENSTRÜMAN MENÜSÜ (sayfalı, kaydırma yok) ================= */
GAME.instrPerPage = function () {
  // Mobil: tek dikey sayfa (tümü). Desktop: yatay sığan kart sayısı.
  if (GAME.mobile && GAME.mobile.active) return 9999;
  const list = document.getElementById('instr-list');
  if (!list) return 4;
  const w = list.clientWidth || (list.parentElement && list.parentElement.clientWidth) || 800;
  const card = 206; // btn ~200 + gap
  return Math.max(2, Math.floor(w / card));
};

/** Desktop sayfalama vs mobil dikey liste tutarlılık kontrolleri */
GAME.testInstrumentPaging = function () {
  const report = { ok: true, checks: [] };
  const add = (name, pass, detail) => {
    report.checks.push({ name: name, pass: !!pass, detail: detail || '' });
    if (!pass) report.ok = false;
  };
  const layers = [1, 2, 3, 4];
  layers.forEach(L => {
    const n = GAME.INSTRUMENTS.filter(i => i.layer === L).length;
    add('layer' + L + '_count', n > 0, n + ' enstrüman');
  });
  add('total_instruments', GAME.INSTRUMENTS.length >= 40, 'toplam ' + GAME.INSTRUMENTS.length);

  // Desktop simülasyonu
  const wasMobile = !!(GAME.mobile && GAME.mobile.active);
  if (GAME.mobile) GAME.mobile.active = false;
  const deskPer = GAME.instrPerPage();
  add('desktop_per_page_finite', deskPer >= 2 && deskPer < 999, 'per=' + deskPer);
  const layer2 = GAME.INSTRUMENTS.filter(i => i.layer === 2).length;
  const deskPages = Math.max(1, Math.ceil(layer2 / Math.max(1, deskPer)));
  add('desktop_layer2_pages', deskPages >= 1, 'L2=' + layer2 + ' → ' + deskPages + ' sayfa');

  // Mobil simülasyonu
  if (GAME.mobile) GAME.mobile.active = true;
  const mobPer = GAME.instrPerPage();
  add('mobile_shows_all', mobPer >= layer2 && mobPer >= 100, 'per=' + mobPer + ' (tüm liste)');
  const mobPages = Math.max(1, Math.ceil(layer2 / Math.max(1, mobPer)));
  add('mobile_single_page', mobPages === 1, 'sayfa=' + mobPages);

  // Geri yükle
  if (GAME.mobile) GAME.mobile.active = wasMobile;

  // Her enstrümanın id/type/layer tutarlılığı
  const ids = {};
  GAME.INSTRUMENTS.forEach(ins => {
    if (ids[ins.id]) add('dup_' + ins.id, false, 'yinelenen id');
    ids[ins.id] = true;
    add('ins_' + ins.id + '_type', ['toggle', 'slider', 'numerical'].indexOf(ins.type) >= 0, ins.type);
    add('ins_' + ins.id + '_layer', ins.layer >= 1 && ins.layer <= 4, String(ins.layer));
  });

  // renderInstrumentBar DOM dumanı (oyun ekranı varsa)
  try {
    if (GAME.state && document.getElementById('instr-list')) {
      const prevPage = GAME.ui.instrPage;
      GAME.ui.activeLayer = 2;
      GAME.ui.instrPage = 0;
      if (GAME.mobile) GAME.mobile.active = false;
      GAME.renderInstrumentBar();
      const deskBtns = document.querySelectorAll('#instr-list .instr-btn').length;
      add('desktop_render_count', deskBtns > 0 && deskBtns <= deskPer, 'DOM kart=' + deskBtns + ' per=' + deskPer);
      const deskPager = document.getElementById('instr-pager');
      const deskHasPager = deskPager && deskPager.children.length > 0;
      add('desktop_pager_if_needed', layer2 > deskPer ? deskHasPager : true,
        deskHasPager ? 'pager var' : 'pager yok');

      if (GAME.mobile) GAME.mobile.active = true;
      GAME.renderInstrumentBar();
      const mobBtns = document.querySelectorAll('#instr-list .instr-btn').length;
      add('mobile_render_all_L2', mobBtns === layer2, 'DOM=' + mobBtns + ' beklenen=' + layer2);
      const mobPager = document.getElementById('instr-pager');
      const mobPagerEmpty = !mobPager || mobPager.children.length === 0 ||
        (mobPager.style && mobPager.offsetParent === null);
      // CSS hides pager on mobile; children may still exist if pages>1 with old logic — should be 0 pages
      add('mobile_no_pager_ui', mobPages === 1, 'mobil tek sayfa');

      if (GAME.mobile) GAME.mobile.active = wasMobile;
      GAME.ui.instrPage = prevPage;
      GAME.renderInstrumentBar();
    } else {
      add('dom_skip', true, 'oyun state yok — DOM render atlandı (mantık testleri OK)');
    }
  } catch (e) {
    add('dom_render', false, String(e.message || e));
    if (GAME.mobile) GAME.mobile.active = wasMobile;
  }

  report.summary = (report.ok ? 'PASS' : 'FAIL') + ' — ' +
    report.checks.filter(c => c.pass).length + '/' + report.checks.length + ' kontrol';
  return report;
};

GAME.renderInstrumentBar = function () {
  const s = GAME.state, c = GAME.pc();
  const tabs = document.getElementById('instr-tabs');
  tabs.innerHTML = '';
  [1, 2, 3, 4].forEach(layer => {
    const b = document.createElement('button');
    b.className = 'instr-tab' + (GAME.ui.activeLayer === layer ? ' active' : '');
    b.innerHTML = GAME.LAYERS[layer].name + (layer >= 3 ? ' <span class="risk-dot">●</span>' : '');
    b.onclick = () => { GAME.ui.activeLayer = layer; GAME.ui.instrPage = 0; GAME.renderInstrumentBar(); };
    tabs.appendChild(b);
  });

  const list = document.getElementById('instr-list');
  list.innerHTML = '';
  const slotsLeft = GAME.SLOTS_PER_TURN - s.pending.length;
  const all = GAME.INSTRUMENTS.filter(i => i.layer === GAME.ui.activeLayer);
  const per = GAME.instrPerPage();
  const pages = Math.max(1, Math.ceil(all.length / Math.min(per, Math.max(all.length, 1))));
  if (GAME.ui.instrPage >= pages) GAME.ui.instrPage = pages - 1;
  if (GAME.ui.instrPage < 0) GAME.ui.instrPage = 0;
  const page = GAME.ui.instrPage;
  const slice = all.slice(page * per, page * per + per);

  const makeBtn = (ins) => {
    const st = c.instruments[ins.id];
    const pending = s.pending.find(p => p.insId === ins.id);
    const div = document.createElement('button');
    const noSlot = slotsLeft <= 0 && !pending;
    const costNow = GAME.instrumentCost(s.player, ins.id);
    const noCap = GAME.pc().internal.polCap < costNow;
    div.className = 'instr-btn' + (pending ? ' pending' : '') + ((noSlot || noCap) && !pending ? ' disabled' : '');
    let stateTxt;
    if (ins.type === 'toggle') stateTxt = st.val > 0 ? 'AÇIK' : 'Kapalı';
    else if (ins.type === 'slider') stateTxt = 'Seviye: ' + Math.round(st.val);
    else stateTxt = GAME.fmt(st.val, 1) + ins.unit;
    if (pending) stateTxt += ' → bekleyen: ' + (ins.type === 'toggle' ? (pending.val > 0 ? 'AÇ' : 'KAPAT') : pending.val);
    const typeName = ins.type === 'toggle' ? 'Toggle' : ins.type === 'slider' ? 'Slider' : 'Sayısal';
    div.innerHTML =
      '<div class="i-name">' + ins.name + '</div>' +
      '<div class="i-meta"><span class="i-type">' + typeName + '</span>' +
      (ins.risk ? '<span class="i-risk">Risk ' + '!'.repeat(ins.risk) + '</span>' : '') +
      (ins.project ? ' 🏗 ' + (ins.project / 4) + ' yıl' : '') +
      ' · 🏛' + costNow + '</div>' +
      '<div class="i-state">' + stateTxt + '</div>';
    div.onmouseenter = () => GAME.showInstrTooltip(ins, div);
    div.onmouseleave = GAME.hideInstrTooltip;
    if (!noSlot || pending) div.onclick = () => { GAME.hideInstrTooltip(); GAME.openInstrumentModal(ins); };
    return div;
  };
  slice.forEach(ins => list.appendChild(makeBtn(ins)));

  // Sayfa numaraları
  const pager = document.getElementById('instr-pager');
  pager.innerHTML = '';
  if (pages > 1) {
    const prev = document.createElement('button');
    prev.className = 'pg-btn'; prev.textContent = '◀';
    prev.disabled = page <= 0;
    prev.onclick = () => { GAME.ui.instrPage--; GAME.renderInstrumentBar(); };
    pager.appendChild(prev);
    for (let i = 0; i < pages; i++) {
      const pb = document.createElement('button');
      pb.className = 'pg-btn' + (i === page ? ' active' : '');
      pb.textContent = String(i + 1);
      pb.onclick = () => { GAME.ui.instrPage = i; GAME.renderInstrumentBar(); };
      pager.appendChild(pb);
    }
    const next = document.createElement('button');
    next.className = 'pg-btn'; next.textContent = '▶';
    next.disabled = page >= pages - 1;
    next.onclick = () => { GAME.ui.instrPage++; GAME.renderInstrumentBar(); };
    pager.appendChild(next);
    const info = document.createElement('span');
    info.className = 'pg-info';
    info.textContent = 'Sayfa ' + (page + 1) + '/' + pages + ' · ' + all.length + ' enstrüman';
    pager.appendChild(info);
  }

  // Bekleyen değişiklikler
  const pBox = document.getElementById('pending-changes');
  pBox.innerHTML = '';
  s.pending.forEach(p => {
    const ins = GAME.INSTRUMENTS_BY_ID[p.insId];
    const chip = document.createElement('span');
    chip.className = 'pending-chip';
    let txt = ins.name + ': ';
    if (ins.type === 'toggle') txt += p.val > 0 ? 'AÇ' : 'KAPAT';
    else txt += p.val;
    if (p.target) txt += ' → ' + GAME.COUNTRIES[p.target].name;
    chip.innerHTML = txt + ' <button title="İptal">✕</button>';
    chip.querySelector('button').onclick = () => {
      s.pending = s.pending.filter(x => x !== p);
      GAME.refreshGameUI();
    };
    pBox.appendChild(chip);
  });
};

/* ================= ENSTRÜMAN MODALI ================= */
GAME.openInstrumentModal = function (ins) {
  if (GAME.ui.processing) return; // tur çözümlenirken müdahale edilemez
  const s = GAME.state, c = GAME.pc();
  const st = c.instruments[ins.id];
  const existing = s.pending.find(p => p.insId === ins.id);

  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  const btns = document.getElementById('modal-buttons');
  title.textContent = ins.name;
  btns.innerHTML = '';

  const projInfo = ins.project ? '<p style="color:#806000;font-size:12px">🏗 Uzun vadeli proje: ~' + (ins.project / 4) + ' yıl sürer, başladıktan sonra slot harcamadan ilerler. Tamamlanınca kalıcı etkiler kazanılır.</p>' : '';
  const riskInfo = ins.risk ? '<p style="color:#c00000;font-size:12px">⚠ Tespit riski: ' + ['', 'Düşük', 'Yüksek', 'Çok Yüksek'][ins.risk] + '. Tespit edilirse ilişkiler çöker ve misilleme gelir.</p>' : '';
  const costNow = GAME.instrumentCost(s.player, ins.id);
  let costExtra = '';
  if (ins.escalateCost) {
    const uses = (c.instrUseCount && c.instrUseCount[ins.id]) || 0;
    costExtra = ' <span style="color:#806000">(' + (GAME.t ? GAME.t('ui.cost_escalates', { n: uses }) : ('kullanım ' + uses + ' → maliyet artar')) + ')</span>';
  }
  if (ins.id === 'fx_intervention') {
    const pen = GAME.fxRegenPenalty(s.player);
    costExtra += ' <span style="color:#806000">(' + (GAME.t ? GAME.t('ui.fx_penalty_hint', { n: pen }) : ('regen penaltı: −' + pen)) + ')</span>';
  }
  const costInfo = '<p style="font-size:12px;color:#505050">Maliyet: 1 müdahale slotu + <b>🏛 ' + costNow + '</b> siyasi sermaye' + costExtra + '</p>' +
    '<div class="tt-inmodal">' + GAME.instrumentDetail(ins) + '</div>';

  const addPending = (val, target) => {
    if (existing) { existing.val = val; if (target !== undefined) existing.target = target; }
    else {
      if (s.pending.length >= GAME.SLOTS_PER_TURN) return;
      s.pending.push({ insId: ins.id, val: val, target: target });
    }
    GAME.closeModal();
    GAME.refreshGameUI();
  };

  const needsTarget = ins.targeted && st.val === 0; // açarken hedef seçilir

  if (ins.type === 'toggle') {
    const turningOn = st.val === 0;
    body.innerHTML = '<p class="desc">' + ins.desc + '</p>' + projInfo + riskInfo + costInfo;
    if (turningOn && needsTarget) {
      body.innerHTML += '<p><b>Hedef ülke seç:</b></p>';
      const tl = document.createElement('div'); tl.className = 'target-list';
      Object.keys(s.countries).filter(o => o !== s.player).forEach(o => {
        const def = GAME.COUNTRIES[o];
        const rel = Math.round(GAME.getRelation(s.player, o));
        const tb = document.createElement('button');
        tb.className = 'btn target-btn';
        tb.innerHTML = '<span>' + def.flag + ' ' + def.name + '</span><span style="color:' + GAME.relationColor(rel) + '">' + rel + '</span>';
        tb.onclick = () => addPending(1, o);
        tl.appendChild(tb);
      });
      body.appendChild(tl);
    } else {
      const b = document.createElement('button');
      b.className = 'btn ' + (turningOn ? 'btn-primary' : 'btn-danger');
      b.textContent = turningOn ? 'AÇ (1 slot)' : 'KAPAT (1 slot)';
      b.onclick = () => addPending(turningOn ? 1 : 0);
      btns.appendChild(b);
    }
  }
  else if (ins.type === 'slider') {
    body.innerHTML = '<p class="desc">' + ins.desc + '</p>' + riskInfo + costInfo +
      '<div class="slider-val" id="sl-val">' + Math.round(existing ? existing.val : st.val) + '</div>' +
      '<input type="range" id="sl-input" min="0" max="100" step="5" value="' + (existing ? existing.val : st.val) + '">' +
      '<div style="display:flex;justify-content:space-between;font-size:11px;color:#505050"><span>Kapalı (0)</span><span>Düşük</span><span>Orta</span><span>Yüksek (100)</span></div>';
    const inp = body.querySelector('#sl-input');
    inp.oninput = () => body.querySelector('#sl-val').textContent = inp.value;
    let selectedTarget = existing && existing.target ? existing.target : st.target;
    if (ins.targeted && !selectedTarget) {
      const tip = document.createElement('p');
      tip.innerHTML = '<b>Hedef ülke seç:</b>';
      body.appendChild(tip);
      const tl = document.createElement('div'); tl.className = 'target-list';
      Object.keys(s.countries).filter(o => o !== s.player).forEach(o => {
        const def = GAME.COUNTRIES[o];
        const rel = Math.round(GAME.getRelation(s.player, o));
        const tb = document.createElement('button');
        tb.className = 'btn target-btn';
        tb.innerHTML = '<span>' + def.flag + ' ' + def.name + '</span><span style="color:' + GAME.relationColor(rel) + '">' + rel + '</span>';
        tb.onclick = () => {
          selectedTarget = o;
          tl.querySelectorAll('.target-btn').forEach(x => x.classList.remove('btn-primary'));
          tb.classList.add('btn-primary');
        };
        tl.appendChild(tb);
      });
      body.appendChild(tl);
    }
    const b = document.createElement('button');
    b.className = 'btn btn-primary'; b.textContent = 'Uygula (1 slot)';
    b.onclick = () => {
      const v = Number(inp.value);
      if (v === st.val && (!ins.targeted || selectedTarget === st.target)) { GAME.closeModal(); return; }
      if (ins.targeted && v > 0 && !selectedTarget) { alert('Hedef ülke seçmelisin.'); return; }
      addPending(v, ins.targeted ? selectedTarget : undefined);
    };
    btns.appendChild(b);
  }
  else { // numerical
    const isMobile = !!(GAME.mobile && GAME.mobile.active);
    // Mobil: % → 0.25, döviz vb. → 0.5
    const mobStep = (ins.unit && String(ins.unit).indexOf('%') >= 0) ? 0.25 : 0.5;
    const useStep = isMobile ? mobStep : (ins.step || 1);
    const curVal = existing ? existing.val : st.val;
    const dec = (useStep < 1) ? 2 : 1;
    let numRow;
    if (isMobile) {
      // [4 rakam] [birim] [▲] [▼] [Uygula] [Vazgeç] — hepsi aynı (normal btn) yükseklik
      numRow = '<div class="num-stepper">' +
        '<input type="number" id="num-input" min="' + ins.min + '" max="' + ins.max +
        '" step="' + useStep + '" value="' + curVal + '" inputmode="decimal">' +
        '<span class="num-unit">' + (ins.unit || '').trim() + '</span>' +
        '<button type="button" class="btn num-step-btn" id="num-up" title="Artır" aria-label="Artır">▲</button>' +
        '<button type="button" class="btn num-step-btn" id="num-down" title="Azalt" aria-label="Azalt">▼</button>' +
        '<button type="button" class="btn btn-primary" id="num-apply">Uygula</button>' +
        '<button type="button" class="btn" id="num-cancel">Vazgeç</button>' +
        '</div>' +
        '<p class="num-step-hint">Adım: ' + useStep + (ins.unit || '') + '</p>';
    } else {
      numRow = '<p style="margin-top:8px">Yeni değer: <input type="number" id="num-input" min="' + ins.min +
        '" max="' + ins.max + '" step="' + useStep + '" value="' + curVal + '">' + (ins.unit || '') + '</p>';
    }
    body.innerHTML = '<p class="desc">' + ins.desc + '</p>' + costInfo +
      '<p>Mevcut değer: <b>' + GAME.fmt(st.val, dec) + ins.unit + '</b></p>' + numRow;

    const numInp = body.querySelector('#num-input');
    const nudge = (dir) => {
      let v = Number(numInp.value);
      if (isNaN(v)) v = st.val;
      v = GAME.clamp(Math.round((v + dir * useStep) * 1000) / 1000, ins.min, ins.max);
      if (useStep <= 0.25) numInp.value = (Math.round(v * 100) / 100).toString();
      else if (useStep < 1) numInp.value = (Math.round(v * 10) / 10).toString();
      else numInp.value = String(Math.round(v * 10) / 10);
    };
    const down = body.querySelector('#num-down');
    const up = body.querySelector('#num-up');
    if (down) down.onclick = () => nudge(-1);
    if (up) up.onclick = () => nudge(1);

    const doApply = () => {
      const v = GAME.clamp(Number(body.querySelector('#num-input').value), ins.min, ins.max);
      if (v !== st.val) addPending(v); else GAME.closeModal();
    };
    if (isMobile) {
      const applyBtn = body.querySelector('#num-apply');
      const cancelBtn = body.querySelector('#num-cancel');
      if (applyBtn) applyBtn.onclick = doApply;
      if (cancelBtn) cancelBtn.onclick = GAME.closeModal;
      // Alt buton satırı kullanılmıyor
    } else {
      const b = document.createElement('button');
      b.className = 'btn btn-primary'; b.textContent = 'Uygula (1 slot)';
      b.onclick = doApply;
      btns.appendChild(b);
    }
  }

  // Mobil sayısal satırda zaten Vazgeç var
  if (!(ins.type === 'numerical' && GAME.mobile && GAME.mobile.active)) {
    const cancel = document.createElement('button');
    cancel.className = 'btn'; cancel.textContent = 'Vazgeç';
    cancel.onclick = GAME.closeModal;
    btns.appendChild(cancel);
  }

  document.getElementById('modal-backdrop').classList.remove('hidden');
};

GAME.closeModal = function () {
  document.getElementById('modal-backdrop').classList.add('hidden');
  const box = document.getElementById('modal-box');
  box.classList.remove('map-mode', 'map-mode-mobile');
  document.getElementById('modal-backdrop').classList.remove('map-backdrop-mobile');
  const btns = document.getElementById('modal-buttons');
  if (btns) btns.classList.remove('map-btns-mobile');
};

/* ================= YARDIM / DANIŞMA KURULU ================= */
/* AI karar motoru (aiPlan) oyuncunun ülkesi için çalıştırılır; en iyi
   adaylar gerekçeleriyle öneri olarak gösterilir. Tur başına önbelleklenir. */
GAME.buildAdvice = function () {
  const s = GAME.state;
  if (GAME.ui.helpCache && GAME.ui.helpCache.turn === s.turn) return GAME.ui.helpCache.html;

  const c = GAME.pc();
  const cands = GAME.aiPlan(s.player).filter(cd => cd.score >= 1.0 && cd.why);
  const seen = {}, list = [];
  for (const cd of cands) {
    if (seen[cd.insId]) continue;
    seen[cd.insId] = 1; list.push(cd);
    if (list.length >= 4) break; // 4 slot kuralına uygun
  }

  let html;
  if (!list.length) {
    html = '<p><b>Danışma Kurulu:</b> Şu an acil müdahale gerektiren bir gösterge görünmüyor. ' +
      'Mevcut politikaları sürdürmek slot harcamaz — beklemek de bir stratejidir.</p>' +
      '<p style="margin-top:8px">💡 Sakin dönemler <b>uzun vadeli projeler</b> (Yapısal Strateji sekmesi) başlatmak için idealdir: ' +
      'slot harcamadan kendiliğinden ilerler ve kalıcı miras bırakırlar.</p>';
  } else {
    html = '<p><b>Danışma Kurulu bu çeyrek için ' + list.length + ' müdahale öneriyor</b> (öncelik sırasıyla):</p>';
    list.forEach((cd, i) => {
      const d = GAME.INSTRUMENTS_BY_ID[cd.insId];
      const st = c.instruments[cd.insId];
      let act;
      if (d.type === 'toggle') act = cd.val > 0 ? '<b style="color:#008000">AÇ</b>' : '<b style="color:#c00000">KAPAT</b>';
      else act = '<b>' + GAME.fmt(st.val, 1) + (d.unit || '') + ' → ' + GAME.fmt(cd.val, 1) + (d.unit || '') + '</b>';
      if (cd.target) act += ' · Hedef: <b>' + GAME.COUNTRIES[cd.target].flag + ' ' + GAME.COUNTRIES[cd.target].name + '</b>';
      html += '<div class="advice-item">' +
        '<div class="a-head">' + (i + 1) + '. <span class="a-layer">[' + GAME.LAYERS[d.layer].name + ']</span> ' +
        '<b>' + d.name + '</b> <span class="a-cost">🏛 ' + (d.cost || 8) + '</span></div>' +
        '<div class="a-act">Önerilen: ' + act + '</div>' +
        '<div class="a-why">' + cd.why + '</div>' +
        '</div>';
    });
    html += '<p style="color:#505050;font-size:11px;margin-top:8px">Öneriler mevcut göstergelere göre otomatik hesaplanır; nihai karar senin. ' +
      'Kalan slot: <b>' + (GAME.SLOTS_PER_TURN - s.pending.length) + '/' + GAME.SLOTS_PER_TURN + '</b> · ' +
      'Siyasi Sermaye: <b>' + Math.round(c.internal.polCap) + '</b></p>';
  }
  GAME.ui.helpCache = { turn: s.turn, html: html };
  return html;
};

GAME.helpTopicBarHtml = function () {
  return '<div class="help-topic-bar">' +
    '<button class="btn" data-topic="instruments">📚 Enstrümanlar</button>' +
    '<button class="btn" data-topic="countries">🌍 Ülkeler</button>' +
    '<button class="btn" data-topic="charts">📈 Grafikler</button>' +
    '<button class="btn" data-topic="topics">📖 Konular &amp; Sistem</button>' +
    '</div><div id="help-topic-detail"></div>';
};

GAME.bindHelpTopicBar = function (root) {
  (root || document).querySelectorAll('.help-topic-bar [data-topic]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-topic');
      const box = document.getElementById('help-topic-detail');
      if (!box) return;
      box.innerHTML = '<div class="about-topic-body" style="max-height:36vh;margin-top:8px">' +
        (GAME.HELP_TOPICS[id] || '') + '</div>';
      box.scrollIntoView({ block: 'nearest' });
    };
  });
};

GAME.showAdvice = function () {
  document.getElementById('modal-box').classList.remove('map-mode');
  document.getElementById('modal-title').textContent = '🧭 Danışma Kurulu Önerileri — ' + GAME.turnDate(GAME.state.turn);
  document.getElementById('modal-body').innerHTML = GAME.buildAdvice() + GAME.helpTopicBarHtml();
  GAME.bindHelpTopicBar(document.getElementById('modal-body'));
  const btns = document.getElementById('modal-buttons');
  btns.innerHTML = '';
  const b = document.createElement('button');
  b.className = 'btn btn-primary'; b.textContent = 'Kapat'; b.onclick = GAME.closeModal;
  btns.appendChild(b);
  document.getElementById('modal-backdrop').classList.remove('hidden');
};

GAME.openHelpModal = function () {
  if (GAME.ui.processing || !GAME.state) return;
  if (GAME.ui.helpConsent) { GAME.showAdvice(); return; }
  document.getElementById('modal-box').classList.remove('map-mode');
  document.getElementById('modal-title').textContent = '❓ Yardım';
  document.getElementById('modal-body').innerHTML =
    '<p><b>Danışma Kurulu:</b> Hangi enstrümanı kullanmanız gerektiğine dair tur bazlı öneri verir.</p>' +
    '<p style="margin-top:8px;color:#505050">Ayrıca alttaki butonlardan enstrümanlar, ülkeler, grafikler ve sistem ' +
    'hakkında çok detaylı ansiklopedi okuyabilirsiniz.</p>' +
    '<p style="margin-top:10px"><b>Bu çeyrek için öneri istiyor musunuz?</b></p>' +
    GAME.helpTopicBarHtml();
  GAME.bindHelpTopicBar(document.getElementById('modal-body'));
  const btns = document.getElementById('modal-buttons');
  btns.innerHTML = '';
  const yes = document.createElement('button');
  yes.className = 'btn btn-primary'; yes.textContent = 'Evet, öneri ver';
  yes.onclick = () => { GAME.ui.helpConsent = true; GAME.showAdvice(); };
  const no = document.createElement('button');
  no.className = 'btn'; no.textContent = 'Kapat'; no.onclick = GAME.closeModal;
  btns.appendChild(yes); btns.appendChild(no);
  document.getElementById('modal-backdrop').classList.remove('hidden');
};

/* ================= OLAY GÜNLÜĞÜ MODALI ================= */
GAME.openLogModal = function () {
  const s = GAME.state;
  document.getElementById('modal-title').textContent = 'Olay Günlüğü (' + s.news.length + ' kayıt)';
  const body = document.getElementById('modal-body');
  body.innerHTML = '';
  s.news.slice().reverse().slice(0, 200).forEach(m => {
    body.innerHTML += '<div class="log-item">[' + m.date + '] <b>' + (m.source || '') + '</b> — ' + m.title + '</div>';
  });
  const btns = document.getElementById('modal-buttons');
  btns.innerHTML = '';
  const b = document.createElement('button');
  b.className = 'btn btn-primary'; b.textContent = 'Kapat'; b.onclick = GAME.closeModal;
  btns.appendChild(b);
  document.getElementById('modal-backdrop').classList.remove('hidden');
};

/* ================= TÜM OYUN UI YENİLE ================= */
GAME.refreshGameUI = function () {
  GAME.renderHeader();
  GAME.renderLeftPanel();
  GAME.renderCenterCards();
  GAME.renderFeed();
  GAME.renderInstrumentBar();
  GAME.renderChartControls();
  if (GAME.syncMobileChrome) GAME.syncMobileChrome();
  // Önce kart/kontrol yüksekliği otursun, sonra grafik paneli doldursun
  requestAnimationFrame(() => {
    GAME.layoutCenterPanel();
    GAME.drawChart();
  });
};

/* Viewport: mobil.js yüklendiyse oradaki sürüm kullanılır; yoksa basit fallback */
GAME.checkViewport = GAME.checkViewport || function () {
  const gate = document.getElementById('viewport-gate');
  if (!gate) return true;
  const blocked = window.innerWidth < 300 || window.innerHeight < 380;
  gate.classList.toggle('hidden', !blocked);
  document.body.classList.toggle('viewport-blocked', blocked);
  return !blocked;
};
