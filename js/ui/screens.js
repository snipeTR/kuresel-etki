/* ============ KÜRESEL ETKİ — Ekranlar ============ */
window.GAME = window.GAME || {};

GAME.showScreen = function (id) {
  document.querySelectorAll('.screen').forEach(sc => sc.classList.remove('active'));
  document.getElementById(id).classList.add('active');
};

/* ---- Ana menü ---- */
GAME.renderMenu = function () {
  document.getElementById('btn-continue').disabled = !GAME.hasSave();
  if (GAME.i18n && GAME.i18n.applyDom) GAME.i18n.applyDom();
  if (GAME.i18n && GAME.i18n.renderAllLangSwitchers) GAME.i18n.renderAllLangSwitchers();
  GAME.showScreen('screen-menu');
};

/* ---- Ayarlar (kalıcı localStorage) ---- */
GAME.SETTINGS_KEY = 'keSettings_oyungrok';
GAME.loadSettings = function () {
  try {
    const raw = localStorage.getItem(GAME.SETTINGS_KEY);
    if (!raw) return { confirmNew: true, feedCollapsedDefault: false };
    return Object.assign({ confirmNew: true, feedCollapsedDefault: false }, JSON.parse(raw));
  } catch (e) { return { confirmNew: true, feedCollapsedDefault: false }; }
};
GAME.saveSettings = function (s) {
  try { localStorage.setItem(GAME.SETTINGS_KEY, JSON.stringify(s || GAME.loadSettings())); } catch (e) {}
};

GAME.renderSettings = function () {
  if (GAME.i18n && GAME.i18n.applyDom) GAME.i18n.applyDom();
  const body = document.getElementById('settings-body');
  if (!body) return;
  const t = (k, v) => (GAME.t ? GAME.t(k, v) : k);
  const st = GAME.loadSettings();
  const lang = (GAME.i18n && GAME.i18n.getLang && GAME.i18n.getLang()) || 'tr';
  const vol = (GAME.Music && GAME.Music.volume != null) ? GAME.Music.volume : 0.4;
  const volLabel = vol <= 0.001 ? t('ui.vol_mute') : (vol <= 0.5 ? t('ui.vol_40') : t('ui.vol_100'));

  body.innerHTML =
    '<div class="settings-row">' +
    '<label class="settings-label">' + t('ui.set_language') + '</label>' +
    '<select id="set-lang" class="lang-select settings-control">' +
    '<option value="tr"' + (lang === 'tr' ? ' selected' : '') + '>TR</option>' +
    '<option value="en"' + (lang === 'en' ? ' selected' : '') + '>EN</option>' +
    '</select></div>' +

    '<div class="settings-row">' +
    '<label class="settings-label">' + t('ui.set_volume') + '</label>' +
    '<button type="button" id="set-vol" class="btn settings-control">' + volLabel + '</button></div>' +

    '<div class="settings-row">' +
    '<label class="settings-check"><input type="checkbox" id="set-confirm-new"' + (st.confirmNew !== false ? ' checked' : '') + '> ' +
    t('ui.set_confirm_new') + '</label></div>' +

    '<div class="settings-row">' +
    '<label class="settings-check"><input type="checkbox" id="set-feed-collapsed"' + (st.feedCollapsedDefault ? ' checked' : '') + '> ' +
    t('ui.set_feed_collapsed') + '</label></div>' +

    '<div class="settings-row settings-actions">' +
    '<button type="button" id="set-reset-gloss" class="btn">' + t('ui.set_reset_glossary') + '</button>' +
    '<span class="settings-hint" id="set-reset-gloss-msg"></span></div>' +

    '<p class="settings-note">' + t('ui.set_note') + '</p>';

  const langSel = document.getElementById('set-lang');
  if (langSel) langSel.onchange = function () {
    if (GAME.i18n && GAME.i18n.setLang) GAME.i18n.setLang(langSel.value);
    GAME.renderSettings();
  };
  const volBtn = document.getElementById('set-vol');
  if (volBtn) volBtn.onclick = function () {
    if (GAME.Music && GAME.Music.cycleVolume) GAME.Music.cycleVolume();
    GAME.renderSettings();
  };
  const conf = document.getElementById('set-confirm-new');
  if (conf) conf.onchange = function () {
    const s = GAME.loadSettings();
    s.confirmNew = !!conf.checked;
    GAME.saveSettings(s);
  };
  const feedC = document.getElementById('set-feed-collapsed');
  if (feedC) feedC.onchange = function () {
    const s = GAME.loadSettings();
    s.feedCollapsedDefault = !!feedC.checked;
    GAME.saveSettings(s);
    try { localStorage.setItem('keFeedCollapsed_oyungrok', feedC.checked ? '1' : '0'); } catch (e) {}
  };
  const rg = document.getElementById('set-reset-gloss');
  if (rg) rg.onclick = function () {
    try { localStorage.removeItem(GAME.GLOSS_SKIP_KEY || 'keGlossSkip_oyungrok'); } catch (e) {}
    const msg = document.getElementById('set-reset-gloss-msg');
    if (msg) msg.textContent = t('ui.set_reset_done');
    if (typeof GAME.renderFeed === 'function' && GAME.state) GAME.renderFeed();
  };

  GAME.showScreen('screen-settings');
};

/* ---- Nasıl oynanır (detaylı + konu butonları) ---- */
GAME.renderAbout = function () {
  if (GAME.i18n && GAME.i18n.applyDom) GAME.i18n.applyDom();
  document.getElementById('about-content').innerHTML = GAME.ABOUT_MAIN_HTML || '';
  const topics = document.getElementById('about-topics');
  const body = document.getElementById('about-topic-body');
  if (body) { body.classList.add('hidden'); body.innerHTML = ''; }
  if (topics) {
    topics.innerHTML = '';
    const items = [
      ['instruments', GAME.t('ui.topic_instruments') || '📚 Instruments'],
      ['countries', GAME.t('ui.topic_countries') || '🌍 Countries'],
      ['charts', GAME.t('ui.topic_charts') || '📈 Charts'],
      ['topics', GAME.t('ui.topic_system') || '📖 Topics & System']
    ];
    items.forEach(([id, label]) => {
      const b = document.createElement('button');
      b.className = 'btn';
      b.textContent = label;
      b.onclick = () => {
        body.classList.remove('hidden');
        body.innerHTML = GAME.HELP_TOPICS[id] || ('<p>' + (GAME.t('ui.no_content') || 'No content.') + '</p>');
        body.scrollTop = 0;
      };
      topics.appendChild(b);
    });
  }
  GAME.showScreen('screen-about');
};

/* ---- Ülke seçimi ---- */
GAME.renderCountrySelect = function () {
  const grid = document.getElementById('country-grid');
  grid.innerHTML = '';
  for (const cid in GAME.COUNTRIES) {
    const def = GAME.COUNTRIES[cid];
    const card = document.createElement('div');
    card.className = 'country-card';
    const diffCls = GAME.difficultyClass ? GAME.difficultyClass(def.difficulty)
      : (def.difficulty.includes('Zor') || /hard/i.test(def.difficulty) ? 'diff-zor'
        : (def.difficulty.includes('Kolay') || /easy/i.test(def.difficulty) ? 'diff-kolay' : 'diff-orta'));
    const L = (k, v) => (GAME.t ? GAME.t(k, v) : k);
    card.innerHTML =
      '<div class="flag">' + def.flag + '</div>' +
      '<h3>' + def.name + '</h3>' +
      '<div class="diff ' + diffCls + '">' + L('ui.difficulty', { d: def.difficulty }) + '</div>' +
      '<div class="desc">' + def.desc + '</div>' +
      '<div class="stats">' +
      '<span>' + L('ui.stat_growth') + ': <b>%' + def.ind.growth + '</b></span>' +
      '<span>' + L('ui.stat_inflation') + ': <b>%' + def.ind.inflation + '</b></span>' +
      '<span>' + L('ui.stat_reserves') + ': <b>' + def.ind.reserves + ' mlr$</b></span>' +
      '<span>' + L('ui.stat_debt') + ': <b>%' + def.ind.debt + '</b></span>' +
      '</div>' +
      '<div style="margin-top:8px;font-size:11px;color:#000080">▸ ' + def.style + '</div>';
    card.onclick = () => {
      GAME.newGame(cid);
      GAME.save();
      GAME.startGameScreen();
    };
    grid.appendChild(card);
  }
  GAME.showScreen('screen-country');
};

/* ---- Felaket ekranı ---- */
GAME.showDisasterScreen = function (dis, onContinue) {
  document.getElementById('disaster-name').textContent = dis.icon + ' ' + dis.name;
  document.getElementById('disaster-desc').textContent = dis.desc;
  document.getElementById('disaster-impacts').innerHTML = dis.impacts.map(i => '<div>• ' + i + '</div>').join('');
  // Normal → 1 sn fade-out → felaket müziği (sonra diplomasi → savaş → …)
  if (GAME.Music && GAME.Music.onDisaster) GAME.Music.onDisaster(dis);
  const btn = document.getElementById('btn-disaster-continue');
  btn.onclick = () => { GAME.showScreen('screen-game'); GAME.refreshGameUI(); if (onContinue) onContinue(); };
  GAME.showScreen('screen-disaster');
};

/* ---- Oyun ekranını başlat ---- */
GAME.startGameScreen = function () {
  GAME.checkViewport();
  GAME.showScreen('screen-game');
  if (GAME.i18n && GAME.i18n.renderAllLangSwitchers) GAME.i18n.renderAllLangSwitchers();
  if (GAME.syncMobileChrome) GAME.syncMobileChrome();
  if (GAME.Music && GAME.Music.onGameStart) GAME.Music.onGameStart();
  // Açılış mesajları (ilk turda)
  if (GAME.state.turn === 1 && GAME.state.news.length === 0) {
    GAME.pushNews({
      cat: 'global', tone: 3, source: GAME.t('ui.global_source'),
      title: GAME.t('ui.intro_title') || 'Dünya ekonomisi istikrarlı görünüyor',
      body: GAME.t('ui.intro_body') || '2026 yılı sakin başladı. Ancak uzmanlar küresel tedarik zincirlerinin ve finansal sistemin aşırı kırılgan olduğunu belirtiyor. Bu sükûnet ne kadar sürer?',
      involves: [], important: true
    });
    GAME.pushNews({
      cat: 'ic', tone: 3, source: '⚠ Danışma Kurulu',
      title: 'Göreve hoş geldiniz',
      body: 'Ülkenin ekonomi yönetimi sizde. Her çeyrek en fazla 4 müdahale yapabilirsiniz. Alt paneldeki enstrümanları inceleyin, hazır olduğunuzda "Onayla ve İlerle" deyin.',
      involves: [GAME.state.player], important: true
    });
  }
  GAME.refreshGameUI();
};

/* ================= DÜNYA HARİTASI (gerçekçi SVG, ISO ülke yolları) ================= */
/* Kaynak: flekschas/simple-world-map (CC BY-SA 3.0) — yerel kopya + CDN yedek
   MAP_ISO: string veya dizi (AB birden fazla üye ülke yolu boyanır) */
GAME.MAP_ISO = {
  USA: 'us', CHN: 'cn', JPN: 'jp', IND: 'in', GBR: 'gb', RUS: 'ru',
  CAN: 'ca', BRA: 'br', KOR: 'kr', AUS: 'au', MEX: 'mx', IDN: 'id',
  SAU: 'sa', TUR: 'tr', CHE: 'ch', ZAF: 'za',
  /* AB: ana üyeler tek blok gibi renklendirilir */
  EU: ['de', 'fr', 'it', 'es', 'nl', 'pl', 'be', 'at', 'se', 'pt', 'ie', 'fi', 'gr', 'cz', 'ro', 'hu', 'dk', 'sk', 'bg', 'hr', 'lt', 'si', 'lv', 'ee', 'cy', 'lu', 'mt']
};
GAME.MAP_SVG_URLS = [
  'assets/world-map.svg',
  'https://cdn.jsdelivr.net/gh/flekschas/simple-world-map@master/world-map.svg'
];
GAME._worldSvgCache = null;

/* Yedek merkezler (viewBox ~31,242 784×459) */
GAME.MAP_POS_FALLBACK = {
  USA: [160, 380], CAN: [170, 340], MEX: [175, 450], BRA: [280, 560],
  /* AB noktası İspanya üzerinde (es) */
  EU: [385, 430], GBR: [400, 365], CHE: [425, 400], TUR: [490, 425],
  RUS: [620, 320], SAU: [520, 460], ZAF: [470, 580],
  IND: [610, 470], CHN: [680, 420], JPN: [760, 410], KOR: [740, 420],
  IDN: [700, 530], AUS: [750, 580]
};

GAME.loadWorldMapSvg = function () {
  if (GAME._worldSvgCache) return Promise.resolve(GAME._worldSvgCache);
  const tryUrl = (i) => {
    if (i >= GAME.MAP_SVG_URLS.length) return Promise.reject(new Error('Harita SVG yüklenemedi'));
    return fetch(GAME.MAP_SVG_URLS[i], { cache: 'force-cache' })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(txt => {
        if (!txt || txt.indexOf('<svg') < 0) throw new Error('Geçersiz SVG');
        GAME._worldSvgCache = txt;
        return txt;
      })
      .catch(() => tryUrl(i + 1));
  };
  return tryUrl(0);
};

GAME.mapIsoList = function (cid) {
  const v = GAME.MAP_ISO[cid];
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
};

GAME.mapCountryEls = function (svgRoot, cid) {
  return GAME.mapIsoList(cid).map(iso => {
    try { return svgRoot.querySelector('#' + iso) || (svgRoot.getElementById && svgRoot.getElementById(iso)); }
    catch (e) { return null; }
  }).filter(Boolean);
};

GAME.mapCountryEl = function (svgRoot, cidOrIso) {
  /* Geriye uyum: cid veya tek iso */
  if (GAME.MAP_ISO[cidOrIso] !== undefined) {
    const els = GAME.mapCountryEls(svgRoot, cidOrIso);
    return els[0] || null;
  }
  return svgRoot.querySelector('#' + cidOrIso) || null;
};

GAME.mapPaintLand = function (svgRoot) {
  svgRoot.querySelectorAll('path').forEach(p => {
    p.setAttribute('fill', '#d4e2c8');
    p.setAttribute('stroke', '#6e7f68');
    p.setAttribute('stroke-width', '0.35');
    p.setAttribute('vector-effect', 'non-scaling-stroke');
    p.style.cursor = 'default';
  });
  // Grup içi path'ler de boyandı; ada/çok parçalı ülkeler g içinde
  svgRoot.querySelectorAll('g').forEach(g => {
    if (g.id && g.id.length === 2) {
      g.querySelectorAll('path').forEach(p => {
        p.setAttribute('fill', '#d4e2c8');
        p.setAttribute('stroke', '#6e7f68');
        p.setAttribute('stroke-width', '0.35');
      });
    }
  });
};

GAME.mapSetCountryFill = function (el, fill, stroke, sw, cls) {
  if (!el) return;
  const paint = (node) => {
    node.setAttribute('fill', fill);
    if (stroke) node.setAttribute('stroke', stroke);
    if (sw) node.setAttribute('stroke-width', sw);
    if (cls) node.setAttribute('class', (node.getAttribute('class') || '') + ' ' + cls);
    node.style.cursor = 'pointer';
  };
  if (el.tagName.toLowerCase() === 'g') el.querySelectorAll('path').forEach(paint);
  else paint(el);
};

GAME.mapCentroid = function (elOrEls, cid) {
  const els = Array.isArray(elOrEls) ? elOrEls : (elOrEls ? [elOrEls] : []);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, ok = false;
  els.forEach(el => {
    try {
      const b = el.getBBox();
      if (b && (b.width + b.height) > 0) {
        minX = Math.min(minX, b.x); minY = Math.min(minY, b.y);
        maxX = Math.max(maxX, b.x + b.width); maxY = Math.max(maxY, b.y + b.height);
        ok = true;
      }
    } catch (e) { /* ignore */ }
  });
  if (ok) return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
  const fb = GAME.MAP_POS_FALLBACK[cid];
  return fb ? { x: fb[0], y: fb[1] } : { x: 400, y: 400 };
};

GAME.buildMapInfoPanel = function (selCid) {
  const s = GAME.state, sel = GAME.COUNTRIES[selCid], c = s.countries[selCid];
  const links = sel.tradeLinks || {};
  const rel = Math.round(GAME.getRelation(s.player, selCid));
  const relHtml = selCid === s.player ? '<b style="color:#000080">Bu senin ülken</b>' :
    'İlişki (sana): <b style="color:' + GAME.relationColor(rel) + '">' + rel + '</b>';
  const partners = Object.entries(links).sort((a, b) => b[1] - a[1]).slice(0, 4)
    .map(([pid, w]) => GAME.COUNTRIES[pid].flag + ' ' + GAME.COUNTRIES[pid].name + ' %' + Math.round(w * 100)).join('<br>');
  const ops = [];
  GAME.INSTRUMENTS.filter(i => i.targeted).forEach(i => {
    for (const a in s.countries) {
      const st = s.countries[a].instruments[i.id];
      if (!st || st.val <= 0 || !st.target) continue;
      if (st.target === selCid) ops.push(GAME.COUNTRIES[a].name + ' → ' + sel.name + ': ' + i.name);
      else if (a === selCid) ops.push(sel.name + ' → ' + GAME.COUNTRIES[st.target].name + ': ' + i.name);
    }
  });
  return '<div class="map-info">' +
    '<h4>ÜLKE</h4><b>' + sel.flag + ' ' + sel.name + '</b> (' + sel.gov + ', ' + sel.difficulty + ')<br>' + relHtml +
    '<h4>GÖSTERGELER</h4>' +
    'Büyüme: <b>%' + GAME.fmt(c.ind.growth, 1) + '</b> · Enflasyon: <b>%' + GAME.fmt(c.ind.inflation, 1) + '</b><br>' +
    'Para Birimi: <b>' + GAME.fmt(c.ind.currency, 0) + '</b> · Rezerv: <b>' + GAME.fmt(c.ind.reserves, 0) + ' mlr$</b><br>' +
    'İstikrar: <b>' + Math.round(c.internal.stability) + '</b> · Küresel Etki: <b>' + Math.round(c.ind.influence) + '</b>' +
    '<h4>TİCARET ORTAKLARI</h4>' + (partners || 'Yok') +
    '<h4>AKTİF HEDEFLİ HAMLELER</h4>' + (ops.length ? ops.slice(0, 6).join('<br>') : '<span style="color:#505050">Yok</span>') +
    '<p style="color:#505050;font-size:11px;margin-top:8px">Sürükle = kaydır · tekerlek = zoom · çift tık = yaklaş. Ülkeye tıkla = geçiş.</p>' +
    '<p class="map-rel-legend"><b>Çizgi renkleri</b> (seçili ülkeye göre ilişki): ' +
    '<span style="color:#006400">■■</span> çok iyi · ' +
    '<span style="color:#008000">■■</span> iyi · ' +
    '<span style="color:#806000">■■</span> nötr · ' +
    '<span style="color:#c05000">■■</span> gergin · ' +
    '<span style="color:#c00000">■■</span> düşman. ' +
    'Kalınlık ≈ ticaret bağı (varsa) + ilişki şiddeti.</p>' +
    '<p class="map-credit">Harita: simple-world-map (CC BY-SA 3.0)</p></div>';
};

/* Google Maps tarzı pan/zoom — mouse + touch (mobil kaydırma) */
GAME.attachMapNav = function (well, stage, baseW, baseH) {
  const state = {
    scale: 1, x: 0, y: 0, dragging: false, lastX: 0, lastY: 0, moved: false,
    pinchDist: 0, pinching: false
  };
  // Tarayıcının scroll/gesture ele geçirmesini engelle
  well.style.touchAction = 'none';
  well.style.webkitUserSelect = 'none';
  well.style.userSelect = 'none';

  const apply = () => {
    stage.style.transform = 'translate(' + state.x + 'px,' + state.y + 'px) scale(' + state.scale + ')';
  };
  const clampPan = () => {
    const rect = well.getBoundingClientRect();
    const sw = baseW * state.scale, sh = baseH * state.scale;
    const pad = 40;
    // Harita ekrandan büyükse kenarlardan 40px pay ile pan; değilse ortala
    if (sw > rect.width) {
      state.x = Math.min(pad, Math.max(rect.width - sw - pad, state.x));
    } else {
      state.x = (rect.width - sw) / 2;
    }
    if (sh > rect.height) {
      state.y = Math.min(pad, Math.max(rect.height - sh - pad, state.y));
    } else {
      state.y = (rect.height - sh) / 2;
    }
  };
  const zoomAt = (cx, cy, factor) => {
    const rect = well.getBoundingClientRect();
    const mx = cx - rect.left, my = cy - rect.top;
    const prev = state.scale;
    state.scale = Math.max(0.6, Math.min(10, state.scale * factor));
    const k = state.scale / prev;
    state.x = mx - (mx - state.x) * k;
    state.y = my - (my - state.y) * k;
    clampPan();
    apply();
  };
  const fit = () => {
    const rect = well.getBoundingClientRect();
    if (!rect.width || !baseW) return;
    state.scale = Math.min(rect.width / baseW, rect.height / baseH) * 0.98;
    state.x = (rect.width - baseW * state.scale) / 2;
    state.y = (rect.height - baseH * state.scale) / 2;
    apply();
  };
  const panBy = (dx, dy) => {
    if (Math.abs(dx) + Math.abs(dy) > 2) state.moved = true;
    state.x += dx;
    state.y += dy;
    clampPan();
    apply();
  };
  const touchDist = (t0, t1) => {
    const dx = t0.clientX - t1.clientX, dy = t0.clientY - t1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Nav buttons
  const nav = document.createElement('div');
  nav.className = 'map-nav';
  const mk = (txt, title, fn) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = txt; b.title = title;
    b.onclick = (e) => { e.stopPropagation(); fn(); };
    // touch'ta da tıklama kaçmasın
    b.addEventListener('touchend', (e) => { e.preventDefault(); e.stopPropagation(); fn(); }, { passive: false });
    nav.appendChild(b);
  };
  mk('+', 'Yakınlaştır', () => {
    const r = well.getBoundingClientRect();
    zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1.25);
  });
  mk('−', 'Uzaklaştır', () => {
    const r = well.getBoundingClientRect();
    zoomAt(r.left + r.width / 2, r.top + r.height / 2, 0.8);
  });
  mk('⌂', 'Sığdır', fit);
  well.appendChild(nav);
  const hint = document.createElement('div');
  hint.className = 'map-hint';
  hint.textContent = (GAME.mobile && GAME.mobile.active)
    ? 'Tek parmak: kaydır · İki parmak: zoom · +/−/⌂'
    : 'Sürükle · Tekerlek zoom · Çift tık yaklaş';
  well.appendChild(hint);

  well.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.15 : 0.87);
  }, { passive: false });

  /* ---- Mouse pan ---- */
  well.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    if (e.target.closest && e.target.closest('.map-nav')) return;
    state.dragging = true; state.moved = false;
    state.lastX = e.clientX; state.lastY = e.clientY;
    well.classList.add('dragging');
  });
  const onMouseMove = (e) => {
    if (!state.dragging) return;
    panBy(e.clientX - state.lastX, e.clientY - state.lastY);
    state.lastX = e.clientX; state.lastY = e.clientY;
  };
  const onMouseUp = () => {
    state.dragging = false;
    well.classList.remove('dragging');
  };
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  well.addEventListener('dblclick', (e) => {
    if (e.target.closest && e.target.closest('.map-nav')) return;
    e.preventDefault();
    zoomAt(e.clientX, e.clientY, 1.6);
  });

  /* ---- Touch pan + pinch zoom ---- */
  well.addEventListener('touchstart', (e) => {
    if (e.target.closest && e.target.closest('.map-nav')) return;
    if (e.touches.length === 1) {
      state.dragging = true;
      state.pinching = false;
      state.moved = false;
      state.lastX = e.touches[0].clientX;
      state.lastY = e.touches[0].clientY;
      well.classList.add('dragging');
    } else if (e.touches.length >= 2) {
      state.dragging = false;
      state.pinching = true;
      state.pinchDist = touchDist(e.touches[0], e.touches[1]);
    }
  }, { passive: true });

  well.addEventListener('touchmove', (e) => {
    if (e.touches.length >= 2 && state.pinching) {
      e.preventDefault();
      const d = touchDist(e.touches[0], e.touches[1]);
      if (state.pinchDist > 0) {
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        zoomAt(midX, midY, d / state.pinchDist);
      }
      state.pinchDist = d;
      return;
    }
    if (!state.dragging || e.touches.length !== 1) return;
    e.preventDefault();
    const t = e.touches[0];
    panBy(t.clientX - state.lastX, t.clientY - state.lastY);
    state.lastX = t.clientX;
    state.lastY = t.clientY;
  }, { passive: false });

  const endTouch = () => {
    state.dragging = false;
    state.pinching = false;
    state.pinchDist = 0;
    well.classList.remove('dragging');
  };
  well.addEventListener('touchend', endTouch);
  well.addEventListener('touchcancel', endTouch);

  well._mapNavState = state;
  well._mapNavCleanup = () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };
  fit();
  return state;
};

GAME.openMapModal = function (selCid) {
  const s = GAME.state;
  const sel = GAME.COUNTRIES[selCid];
  if (!sel) return;
  const isMob = !!(GAME.mobile && GAME.mobile.active);
  const box = document.getElementById('modal-box');
  box.classList.add('map-mode');
  box.classList.toggle('map-mode-mobile', isMob);
  document.getElementById('modal-title').textContent = '🗺 ' + sel.name;

  const body = document.getElementById('modal-body');
  body.innerHTML = '<div class="map-flex' + (isMob ? ' map-flex-mobile' : '') + '">' +
    '<div class="map-well map-loading">Harita yükleniyor…</div>' +
    (isMob
      ? '<details class="map-info-details" open><summary class="map-info-summary">Ülke bilgisi ▾</summary>' +
        GAME.buildMapInfoPanel(selCid) + '</details>'
      : GAME.buildMapInfoPanel(selCid)) +
    '</div>';

  const btns = document.getElementById('modal-buttons');
  btns.innerHTML = '';
  btns.classList.toggle('map-btns-mobile', isMob);
  const b = document.createElement('button');
  b.className = 'btn btn-primary' + (isMob ? ' map-close-full' : '');
  b.textContent = 'Kapat';
  b.onclick = GAME.closeModal;
  btns.appendChild(b);
  document.getElementById('modal-backdrop').classList.remove('hidden');
  document.getElementById('modal-backdrop').classList.toggle('map-backdrop-mobile', isMob);

  GAME.loadWorldMapSvg().then(svgText => {
    const well = body.querySelector('.map-well');
    if (!well) return;
    well.classList.remove('map-loading');
    well.innerHTML = '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const srcSvg = doc.documentElement;
    if (!srcSvg || srcSvg.querySelector('parsererror')) throw new Error('SVG parse hatası');

    const viewport = document.createElement('div');
    viewport.className = 'map-viewport';
    const stage = document.createElement('div');
    stage.className = 'map-stage';
    viewport.appendChild(stage);
    well.appendChild(viewport);

    const svg = document.importNode(srcSvg, true);
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.setAttribute('class', 'world-map-svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Dünya haritası');
    const vb = svg.viewBox && svg.viewBox.baseVal;
    const ox = vb && vb.width ? vb.x : 30.767;
    const oy = vb && vb.width ? vb.y : 241.591;
    const ow = vb && vb.width ? vb.width : 784.077;
    const oh = vb && vb.width ? vb.height : 458.627;

    const ocean = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    ocean.setAttribute('x', ox); ocean.setAttribute('y', oy);
    ocean.setAttribute('width', ow); ocean.setAttribute('height', oh);
    ocean.setAttribute('fill', '#9ec5e0');
    ocean.setAttribute('class', 'map-ocean');
    svg.insertBefore(ocean, svg.firstChild);

    GAME.mapPaintLand(svg);

    const pos = {};
    const goCountry = (cid, ev) => {
      if (ev) ev.stopPropagation();
      const st = well._mapNavState;
      if (st && st.moved) return; // sürükleme sonrası tıklama sayma
      GAME.openMapModal(cid);
    };
    for (const cid in GAME.COUNTRIES) {
      const els = GAME.mapCountryEls(svg, cid);
      if (!els.length) { pos[cid] = GAME.mapCentroid([], cid); continue; }
      const isSel = cid === selCid;
      const isPlayer = cid === s.player;
      let fill = isPlayer ? '#2a4a9a' : GAME.relationColor(GAME.getRelation(s.player, cid));
      if (isSel) fill = '#e6c200';
      const stroke = isSel ? '#000000' : '#1a1a1a';
      const sw = isSel ? '1.2' : '0.7';
      els.forEach(el => {
        GAME.mapSetCountryFill(el, fill, stroke, sw, 'map-country' + (isSel ? ' map-glow-path' : ''));
        el.setAttribute('data-cid', cid);
        el.classList.add('map-country-hit');
        el.style.cursor = 'pointer';
        el.addEventListener('click', (ev) => goCountry(cid, ev));
        el.querySelectorAll('path').forEach(p => {
          p.setAttribute('data-cid', cid);
          p.style.cursor = 'pointer';
          p.addEventListener('click', (ev) => goCountry(cid, ev));
        });
      });
    }

    stage.appendChild(svg);
    // SVG boyutunu sabitle (pan/zoom için)
    const dispW = 900;
    const dispH = dispW * (oh / ow);
    svg.setAttribute('width', dispW);
    svg.setAttribute('height', dispH);
    svg.style.width = dispW + 'px';
    svg.style.height = dispH + 'px';

    for (const cid in GAME.COUNTRIES) {
      pos[cid] = GAME.mapCentroid(GAME.mapCountryEls(svg, cid), cid);
    }
    // Avrupa Birliği işareti: İspanya (es) üzerinde sabit merkez
    try {
      const esEl = svg.querySelector('#es') || (svg.getElementById && svg.getElementById('es'));
      if (esEl) {
        const esPos = GAME.mapCentroid([esEl], 'EU');
        if (esPos) pos.EU = esPos;
      } else if (GAME.MAP_POS_FALLBACK.EU) {
        pos.EU = { x: GAME.MAP_POS_FALLBACK.EU[0], y: GAME.MAP_POS_FALLBACK.EU[1] };
      }
    } catch (e) { /* fallback zaten var */ }

    // İlişki çizgileri: seçili ülkeden tüm oyun ülkelerine (renk = iyi/kötü)
    const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    overlay.setAttribute('class', 'map-overlay');
    const links = GAME.COUNTRIES[selCid].tradeLinks || {};
    const sc = pos[selCid];
    if (sc) {
      // Önce zayıf/kötü, üstte iyi görünsün diye |rel| artan sırada çiz
      const peers = Object.keys(GAME.COUNTRIES).filter(pid => pid !== selCid && pos[pid]);
      peers.sort((a, b) => Math.abs(GAME.getRelation(selCid, a)) - Math.abs(GAME.getRelation(selCid, b)));
      peers.forEach(pid => {
        const pc = pos[pid];
        const rel = GAME.getRelation(selCid, pid);
        const tradeW = links[pid] || 0;
        // Kalınlık: taban + ticaret + ilişki şiddeti
        const width = Math.max(1.0, 1.2 + tradeW * 12 + Math.abs(rel) / 120);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', sc.x); line.setAttribute('y1', sc.y);
        line.setAttribute('x2', pc.x); line.setAttribute('y2', pc.y);
        line.setAttribute('stroke', GAME.relationColor(rel));
        line.setAttribute('stroke-width', String(width));
        line.setAttribute('stroke-opacity', tradeW > 0 ? '0.75' : '0.45');
        line.setAttribute('stroke-linecap', 'round');
        line.setAttribute('pointer-events', 'none');
        line.setAttribute('class', 'map-rel-line');
        // title tooltip (SVG)
        const tip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        tip.textContent = GAME.COUNTRIES[selCid].name + ' ↔ ' + GAME.COUNTRIES[pid].name +
          ': ilişki ' + Math.round(rel) + (tradeW ? ', ticaret %' + Math.round(tradeW * 100) : '');
        line.appendChild(tip);
        overlay.appendChild(line);
      });
    }

    for (const cid in GAME.COUNTRIES) {
      const p = pos[cid];
      if (!p) continue;
      const def = GAME.COUNTRIES[cid];
      const isSel = cid === selCid;
      const isPlayer = cid === s.player;
      // Nokta rengi: seçili ülkeye göre ilişki (seçili = sarı, oyuncu vurgusu çerçevede)
      let fill;
      if (isSel) fill = '#ffff00';
      else fill = GAME.relationColor(GAME.getRelation(selCid, cid));

      if (isSel) {
        const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        ring.setAttribute('cx', p.x); ring.setAttribute('cy', p.y);
        ring.setAttribute('r', Math.max(ow, oh) * 0.028);
        ring.setAttribute('fill', 'none');
        ring.setAttribute('stroke', '#ffff00');
        ring.setAttribute('stroke-width', '2.5');
        ring.setAttribute('class', 'map-glow');
        ring.setAttribute('pointer-events', 'none');
        overlay.appendChild(ring);
      }

      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y);
      dot.setAttribute('r', isSel ? 6 : 4.5);
      dot.setAttribute('fill', fill);
      dot.setAttribute('stroke', '#000');
      dot.setAttribute('stroke-width', '1');
      dot.setAttribute('class', 'map-marker' + (isSel ? ' map-glow' : ''));
      dot.setAttribute('data-cid', cid);
      dot.style.cursor = 'pointer';
      dot.addEventListener('click', (ev) => goCountry(cid, ev));
      overlay.appendChild(dot);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', p.x);
      // Yalnızca AB: yazı noktanın altında; diğerleri üstte
      const labelBelow = (cid === 'EU');
      const labelY = labelBelow
        ? (p.y + (isSel ? 18 : 14))
        : (p.y - (isSel ? 14 : 10));
      label.setAttribute('y', labelY);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', isSel ? '13' : '11');
      label.setAttribute('font-weight', 'bold');
      label.setAttribute('font-family', 'Tahoma, Verdana, sans-serif');
      label.setAttribute('fill', '#000');
      label.setAttribute('stroke', '#fff');
      label.setAttribute('stroke-width', '2.5');
      label.setAttribute('paint-order', 'stroke');
      label.setAttribute('class', 'map-marker');
      label.setAttribute('data-cid', cid);
      label.style.cursor = 'pointer';
      label.textContent = def.flag + ' ' + def.name;
      label.addEventListener('click', (ev) => goCountry(cid, ev));
      overlay.appendChild(label);
    }
    svg.appendChild(overlay);
    GAME.attachMapNav(well, stage, dispW, dispH);
  }).catch(err => {
    console.warn(err);
    const well = body.querySelector('.map-well');
    if (well) {
      well.classList.remove('map-loading');
      well.innerHTML = '<div class="map-error">Harita yüklenemedi. İnternet veya <code>assets/world-map.svg</code> dosyasını kontrol et.<br><small>' +
        (err && err.message ? err.message : '') + '</small></div>';
    }
  });
};

/* ---- Oyun sonu ekranı ---- */
GAME.showEndScreen = function () {
  const s = GAME.state;
  const scores = GAME.calcEndScores();
  const box = document.getElementById('end-content');
  const def = GAME.pdef();

  const t = (k, v) => (GAME.t ? GAME.t(k, v) : k);
  let legacyHtml = scores.playerLegacy.length ?
    scores.playerLegacy.map(l => '<div class="legacy-item">[' + GAME.turnDate(l.turn) + '] ' + l.text + '</div>').join('') :
    '<div style="color:#505050">' + t('ui.legacy_none_long') + '</div>';

  // Küresel kalıcı değişimler (diğer aktörlerinki dahil)
  const worldLegacy = s.legacy.filter(l => l.cid !== s.player).slice(0, 8)
    .map(l => '<div class="legacy-item" style="border-left-color:#606060">[' + GAME.turnDate(l.turn) + '] ' + l.text + '</div>').join('');

  const dis = s.disaster ? GAME.DISASTERS.find(d => d.id === s.disaster.id) : null;

  box.innerHTML =
    '<p style="text-align:center;color:#505050">' + def.flag + ' ' + def.name + ' — ' + GAME.turnDate(1) + ' → ' + GAME.turnDate(s.turn) + '</p>' +
    (dis ? '<p style="text-align:center">' + t('ui.lived_disaster') + '<b>' + dis.icon + ' ' + dis.name + '</b> (' + GAME.turnDate(s.disaster.startTurn) + ')</p>' : '') +
    '<h3>' + t('ui.end_h_legacy') + '</h3>' + legacyHtml +
    (worldLegacy ? '<h3>' + t('ui.end_h_world') + '</h3>' + worldLegacy : '') +
    '<h3>' + t('ui.end_h_scores') + '</h3>' +
    '<table>' +
    '<tr><td>' + t('ui.score_perf') + '</td><td>' + scores.perf + '/100</td></tr>' +
    '<tr><td>' + t('ui.score_global') + '</td><td>' + scores.global + '/100</td></tr>' +
    '<tr><td>' + t('ui.score_legacy') + '</td><td>' + scores.legacy + '/100</td></tr>' +
    '<tr><td>' + t('ui.score_consistency', { done: scores.projectStats.completed, started: scores.projectStats.started }) + '</td><td>' + scores.consistency + '/100</td></tr>' +
    '<tr><td>' + t('ui.score_risk', { n: s.detectedOps }) + '</td><td>' + scores.risk + '/100</td></tr>' +
    '</table>' +
    '<h3>' + t('ui.end_h_reflect') + '</h3>' +
    '<p class="reflect">' + t('ui.end_reflect_html') + '</p>' +
    '<p style="text-align:center;margin-top:14px;color:#806000"><b>' + t('ui.end_total_acts', { n: s.interventionLog.length }) + '</b></p>';

  if (GAME.i18n && GAME.i18n.applyDom) GAME.i18n.applyDom();
  document.getElementById('btn-end-log').onclick = GAME.openLogModal;
  document.getElementById('btn-end-menu').onclick = () => { GAME.clearSave(); GAME.renderMenu(); };
  GAME.showScreen('screen-end');
};
