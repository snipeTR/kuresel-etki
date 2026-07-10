/* ============ KÜRESEL ETKİ — Canvas Grafikler ============ */
window.GAME = window.GAME || {};

GAME.chart = {
  indicator: 'growth',
  range: 'all',   // '1y' | '3y' | '5y' | '10y' | 'all'
  RANGES: { '1y': 4, '3y': 12, '5y': 20, '10y': 40, 'all': 999 },
  /* Grafikte seçilebilen seriler */
  SERIES: [
    { id: 'growth',    name: 'GDP Büyüme' },
    { id: 'inflation', name: 'Enflasyon' },
    { id: 'currency',  name: 'Para Birimi' },
    { id: 'trade',     name: 'Ticaret Dengesi' },
    { id: 'debt',      name: 'Kamu Borcu' },
    { id: 'reserves',  name: 'Rezerv' },
    { id: 'stability', name: 'İstikrar' },
    { id: 'influence', name: 'Küresel Etki' },
    { id: 'g:oil',     name: 'Petrol (Küresel)' },
    { id: 'g:food',    name: 'Gıda (Küresel)' },
    { id: 'g:dollar',  name: 'Dolar Endeksi' }
  ]
};

/* Orta paneli sığdır: grafik yüksekliği paneli doldurur; min eşiğin altında kaydırma açılır */
GAME.MIN_CHART_H = 140;
GAME.layoutCenterPanel = function () {
  const panel = document.getElementById('panel-center');
  const canvas = document.getElementById('main-chart');
  const wrap = document.getElementById('chart-wrap');
  const controls = document.getElementById('chart-controls');
  const cards = document.getElementById('center-cards');
  if (!panel || !canvas || !document.getElementById('screen-game').classList.contains('active')) return;

  panel.classList.remove('center-scroll');
  // Önce kaydırmasız ölç
  const panelH = panel.clientHeight;
  const panelW = panel.clientWidth;
  if (panelH < 40 || panelW < 40) return;

  const controlsH = controls ? controls.offsetHeight : 0;
  const cardsH = cards ? cards.offsetHeight : 0;
  const gaps = 14;
  let chartH = panelH - controlsH - cardsH - gaps;
  let chartW = wrap ? wrap.clientWidth : (panelW - 24);

  if (chartH < GAME.MIN_CHART_H) {
    // Aşırı sıkışma: min yükseklik + panel kaydırılabilir
    panel.classList.add('center-scroll');
    chartH = GAME.MIN_CHART_H;
  } else {
    // Üst sınır: çok yüksek ekranda abartma
    chartH = Math.min(chartH, Math.max(GAME.MIN_CHART_H, Math.floor(panelH * 0.72)));
  }
  chartW = Math.max(200, Math.floor(chartW));
  chartH = Math.max(GAME.MIN_CHART_H, Math.floor(chartH));

  canvas.style.width = chartW + 'px';
  canvas.style.height = chartH + 'px';
  if (canvas.width !== chartW || canvas.height !== chartH) {
    canvas.width = chartW;
    canvas.height = chartH;
  }
};

GAME.drawChart = function () {
  const canvas = document.getElementById('main-chart');
  if (!canvas) return;
  // Boyut paneli henüz layout etmediyse ayarla
  if (!canvas.width || !canvas.height) GAME.layoutCenterPanel();
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  if (W < 10 || H < 10) return;
  ctx.clearRect(0, 0, W, H);

  const s = GAME.state;
  if (!s) return;
  const ch = GAME.chart;

  // Veri serisi
  let data, name;
  if (ch.indicator.startsWith('g:')) {
    data = s.gHistory[ch.indicator.slice(2)] || [];
    name = (GAME.GLOBALS_INIT[ch.indicator.slice(2)] || {}).name || ch.indicator;
  } else {
    data = GAME.pc().history[ch.indicator] || [];
    name = (GAME.IND_META[ch.indicator] || {}).name || ch.indicator;
  }
  const maxN = ch.RANGES[ch.range];
  const startIdx = Math.max(0, data.length - maxN);
  const view = data.slice(startIdx);
  if (view.length < 2) {
    ctx.fillStyle = '#404040'; ctx.font = '13px Tahoma';
    ctx.fillText('Grafik için en az 2 tur gerekli — turu ilerlet.', 30, H / 2);
    return;
  }

  // Dar/kısa canvas'ta etiket payını sıkıştır
  const PAD = {
    l: H < 180 ? 42 : 56,
    r: 12,
    t: H < 180 ? 20 : 30,
    b: H < 180 ? 22 : 30
  };
  const plotW = Math.max(40, W - PAD.l - PAD.r), plotH = Math.max(30, H - PAD.t - PAD.b);
  let lo = Math.min(...view), hi = Math.max(...view);
  if (hi - lo < 0.5) { hi += 0.5; lo -= 0.5; }
  const pad = (hi - lo) * 0.12; lo -= pad; hi += pad;

  const x = i => PAD.l + (i / (view.length - 1)) * plotW;
  const y = v => PAD.t + (1 - (v - lo) / (hi - lo)) * plotH;

  // Izgara + eksen etiketleri
  ctx.strokeStyle = '#c8c8c8'; ctx.fillStyle = '#404040'; ctx.font = '11px Tahoma';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const v = lo + (hi - lo) * i / 4, yy = y(v);
    ctx.beginPath(); ctx.moveTo(PAD.l, yy); ctx.lineTo(W - PAD.r, yy); ctx.stroke();
    ctx.fillText(GAME.fmt(v, Math.abs(hi - lo) > 20 ? 0 : 1), 8, yy + 4);
  }
  // X ekseni tarih etiketleri
  const step = Math.max(1, Math.floor(view.length / 6));
  for (let i = 0; i < view.length; i += step) {
    ctx.fillText(GAME.turnDate(startIdx + i + 1), x(i) - 18, H - 8);
  }

  // Sıfır çizgisi
  if (lo < 0 && hi > 0) {
    ctx.strokeStyle = '#808080'; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(PAD.l, y(0)); ctx.lineTo(W - PAD.r, y(0)); ctx.stroke();
    ctx.setLineDash([]);
  }

  // Felaket işareti
  if (s.disaster && s.disaster.startTurn - 1 >= startIdx && s.disaster.startTurn - 1 < startIdx + view.length) {
    const dx = x(s.disaster.startTurn - 1 - startIdx);
    ctx.strokeStyle = 'rgba(192,0,0,.6)'; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(dx, PAD.t); ctx.lineTo(dx, H - PAD.b); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#c00000'; ctx.fillText('⚠ FELAKET', dx + 4, PAD.t + 12);
  }

  // Oyuncu müdahale işaretleri
  ctx.fillStyle = '#806000';
  GAME.state.interventionLog.forEach(iv => {
    const idx = iv.turn - 1 - startIdx;
    if (idx >= 0 && idx < view.length) {
      ctx.beginPath(); ctx.arc(x(idx), H - PAD.b - 5, 3, 0, Math.PI * 2); ctx.fill();
    }
  });

  // Ana çizgi (düz lacivert — 90'lar stili)
  ctx.strokeStyle = '#000080'; ctx.lineWidth = 2;
  ctx.beginPath();
  view.forEach((v, i) => { i === 0 ? ctx.moveTo(x(i), y(v)) : ctx.lineTo(x(i), y(v)); });
  ctx.stroke();

  // Son değer vurgusu
  const lastV = view[view.length - 1];
  ctx.fillStyle = '#008000';
  ctx.beginPath(); ctx.arc(x(view.length - 1), y(lastV), 4, 0, Math.PI * 2); ctx.fill();

  // Başlık
  ctx.fillStyle = '#000000'; ctx.font = (H < 180 ? 'bold 11px' : 'bold 13px') + ' Tahoma';
  ctx.fillText(name + ' — ' + GAME.fmt(lastV, 1), PAD.l, H < 180 ? 14 : 18);
};

/* Grafik butonu hover: ne gösterir / yükselir / düşer (TR+EN) */
GAME.CHART_TIPS = {
  tr: {
    growth: {
      what: 'Ülkenin ekonomik temposunu (üretim/gelir artışı) gösterir.',
      up: 'Yükselirse ekonomi canlanıyor demektir; genelde iş ve gelir umudu artar.',
      down: 'Düşerse ekonomi yavaşlıyor veya küçülüyor; işsizlik baskısı büyüyebilir.'
    },
    inflation: {
      what: 'Fiyatların ne kadar hızlı arttığını gösterir.',
      up: 'Yükselirse aynı parayla daha az şey alırsın; hayat pahalılaşır.',
      down: 'Düşerse fiyat baskısı hafifler; alım gücü genelde rahatlar.'
    },
    currency: {
      what: 'Paranın dışarıdaki gücünü (kur endeksi) gösterir; 100 başlangıçtır.',
      up: 'Yükselirse para güçlenir; ithalat görece ucuzlar.',
      down: 'Düşerse para zayıflar; ithalat ve enflasyon baskısı artabilir.'
    },
    trade: {
      what: 'İhracat ile ithalat farkını (dış ticaret dengesi) gösterir.',
      up: 'Yükselirse dışarıya net satış artar; döviz kazanmak kolaylaşır.',
      down: 'Düşerse net ithalat artar; döviz ve rezerv baskısı gelebilir.'
    },
    debt: {
      what: 'Devletin borç yükünü (GSYH’ye oran) gösterir.',
      up: 'Yükselirse bütçe nefesi daralır; faiz ve vergi baskısı artabilir.',
      down: 'Düşerse mali alan genişler; kriz manevrası kolaylaşır.'
    },
    reserves: {
      what: 'Döviz ve likit “yedek kasa”yı gösterir.',
      up: 'Yükselirse kur savunması ve ithalat için tampon güçlenir.',
      down: 'Düşerse kriz anında manevra alanı daralır; spekülatif baskı artabilir.'
    },
    stability: {
      what: 'İç düzen ve toplumsal sakinlik skorunu gösterir.',
      up: 'Yükselirse protesto/kriz riski azalır; politika yapmak kolaylaşır.',
      down: 'Düşerse sokak gerilimi ve siyasi kriz ihtimali artar.'
    },
    influence: {
      what: 'Ülkenin dünya sahnesindeki ağırlığını gösterir.',
      up: 'Yükselirse yaptırım, standart ve diplomasi gücü artar.',
      down: 'Düşerse sesin zayıflar; rakiplerin dayatması artabilir.'
    },
    'g:oil': {
      what: 'Küresel petrol fiyat endeksini gösterir (100 = oyun başı).',
      up: 'Yükselirse enerji pahalılaşır; ithalatçı enflasyon baskısı, ihracatçı kazanç görür.',
      down: 'Düşerse enerji ucuzlar; üretici ülkeler gelir kaybı yaşayabilir.'
    },
    'g:food': {
      what: 'Küresel gıda fiyat endeksini gösterir.',
      up: 'Yükselirse market sepeti pahalılaşır; toplumsal gerilim artabilir.',
      down: 'Düşerse gıda rahatlar; tarım ihracatçısı zorlanabilir.'
    },
    'g:dollar': {
      what: 'Doların diğer paralara göre gücünü gösterir.',
      up: 'Yükselirse dolarla borçlu ülkeler ve emtia fiyatları sarsılabilir.',
      down: 'Düşerse dolar zayıflar; emtia ve yükselen piyasalar genelde ferahlar.'
    }
  },
  en: {
    growth: {
      what: 'Shows the pace of the economy (output/income growth).',
      up: 'Rising means the economy is picking up; jobs and incomes often improve.',
      down: 'Falling means the economy is slowing or shrinking; unemployment pressure may rise.'
    },
    inflation: {
      what: 'Shows how fast overall prices are rising.',
      up: 'Rising means your money buys less; living costs climb.',
      down: 'Falling eases price pressure; purchasing power usually improves.'
    },
    currency: {
      what: 'Shows the strength of the currency (index; 100 = start).',
      up: 'Rising means a stronger currency; imports get relatively cheaper.',
      down: 'Falling means a weaker currency; imports and inflation pressure can rise.'
    },
    trade: {
      what: 'Shows exports minus imports (trade balance).',
      up: 'Rising means more net sales abroad; easier to earn foreign currency.',
      down: 'Falling means more net imports; pressure on FX and reserves can grow.'
    },
    debt: {
      what: 'Shows the government debt burden (% of GDP).',
      up: 'Rising squeezes the budget; interest and tax pressure may grow.',
      down: 'Falling frees fiscal space; crisis maneuvering gets easier.'
    },
    reserves: {
      what: 'Shows the FX/liquid “rainy-day” stash.',
      up: 'Rising strengthens the buffer for currency defense and imports.',
      down: 'Falling shrinks crisis room; speculative pressure can rise.'
    },
    stability: {
      what: 'Shows domestic order and social calm.',
      up: 'Rising lowers unrest risk; policy is easier to run.',
      down: 'Falling raises protest and political-crisis odds.'
    },
    influence: {
      what: 'Shows the country’s weight on the world stage.',
      up: 'Rising boosts sanctions, standards and diplomatic clout.',
      down: 'Falling weakens your voice; rivals can push harder.'
    },
    'g:oil': {
      what: 'Global oil price index (100 = game start).',
      up: 'Rising makes energy costlier; importers feel inflation, exporters gain.',
      down: 'Falling cheapens energy; producer countries may lose income.'
    },
    'g:food': {
      what: 'Global food price index.',
      up: 'Rising fills grocery baskets with higher prices; social tension can rise.',
      down: 'Falling eases food costs; farm exporters may struggle.'
    },
    'g:dollar': {
      what: 'Strength of the dollar vs other major currencies.',
      up: 'Rising can squeeze dollar debtors and commodity prices.',
      down: 'Falling weakens the dollar; commodities and emerging markets often ease.'
    }
  }
};

GAME.chartTipText = function (id) {
  const lang = (GAME.i18n && GAME.i18n.getLang && GAME.i18n.getLang()) || 'tr';
  const pack = (GAME.CHART_TIPS && (GAME.CHART_TIPS[lang] || GAME.CHART_TIPS.tr)) || {};
  const tip = pack[id];
  if (!tip) return '';
  const L = lang === 'en'
    ? { w: 'Shows', u: 'Rising', d: 'Falling' }
    : { w: 'Ne', u: 'Yükselirse', d: 'Düşerse' };
  return L.w + ': ' + tip.what + ' ' + L.u + ': ' + tip.up + ' ' + L.d + ': ' + tip.down;
};

/* Mobil: ilk tık aktif, aynı butona ikinci tık = açıklama; masaüstü: hover */
GAME._isTouchUi = function () {
  return !!(GAME.mobile && GAME.mobile.active) ||
    (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: none)').matches);
};

/* Grafik kontrol çipleri */
GAME.renderChartControls = function () {
  const indBox = document.getElementById('chart-ind-buttons');
  const rngBox = document.getElementById('chart-range-buttons');
  indBox.innerHTML = ''; rngBox.innerHTML = '';
  const touch = GAME._isTouchUi();
  GAME.chart.SERIES.forEach(sr => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (GAME.chart.indicator === sr.id ? ' active' : '');
    b.textContent = sr.name;
    b.setAttribute('data-chart-id', sr.id);
    const tip = GAME.chartTipText(sr.id);
    if (tip) {
      b.removeAttribute('title');
      b.setAttribute('aria-label', sr.name + '. ' + tip);
    }
    if (!touch && tip) {
      b.onmouseenter = (e) => GAME.showChartChipTip(sr.id, b, e);
      b.onmouseleave = () => GAME.hideChartChipTip();
    }
    b.onclick = (e) => {
      e.stopPropagation();
      if (touch) {
        // 1) pasif → aktif  2) zaten aktif → açıklama aç/kapa
        if (GAME.chart.indicator !== sr.id) {
          GAME.chart.indicator = sr.id;
          GAME.hideChartChipTip();
          GAME.renderChartControls();
          GAME.drawChart();
          return;
        }
        const el = GAME._chartTipEl;
        const open = el && !el.classList.contains('hidden') && GAME._chartTipOpenId === sr.id;
        if (open) GAME.hideChartChipTip();
        else GAME.showChartChipTip(sr.id, b, e);
        return;
      }
      GAME.chart.indicator = sr.id;
      GAME.hideChartChipTip();
      GAME.renderChartControls();
      GAME.drawChart();
    };
    indBox.appendChild(b);
  });
  [['1y', 'ui.range_1y'], ['3y', 'ui.range_3y'], ['5y', 'ui.range_5y'], ['10y', 'ui.range_10y'], ['all', 'ui.range_all']].forEach(([id, labelKey]) => {
    const label = GAME.t ? GAME.t(labelKey) : labelKey;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (GAME.chart.range === id ? ' active' : '');
    b.textContent = label;
    b.onclick = () => {
      GAME.chart.range = id;
      GAME.hideChartChipTip();
      GAME.renderChartControls();
      GAME.drawChart();
    };
    rngBox.appendChild(b);
  });
  if (!GAME._chartTipOutsideBound) {
    GAME._chartTipOutsideBound = true;
    document.addEventListener('click', function (ev) {
      if (!GAME._chartTipEl || GAME._chartTipEl.classList.contains('hidden')) return;
      if (ev.target.closest && (ev.target.closest('#chart-chip-tip') || ev.target.closest('[data-chart-id]'))) return;
      GAME.hideChartChipTip();
    }, true);
  }
};

GAME._chartTipEl = null;
GAME.showChartChipTip = function (id, anchor, e) {
  const lang = (GAME.i18n && GAME.i18n.getLang && GAME.i18n.getLang()) || 'tr';
  const pack = (GAME.CHART_TIPS && (GAME.CHART_TIPS[lang] || GAME.CHART_TIPS.tr)) || {};
  const tip = pack[id];
  if (!tip) return;
  let el = GAME._chartTipEl;
  if (!el) {
    el = document.createElement('div');
    el.id = 'chart-chip-tip';
    el.className = 'chart-chip-tip';
    document.body.appendChild(el);
    GAME._chartTipEl = el;
  }
  const L = lang === 'en'
    ? { w: 'What it shows', u: 'If rising', d: 'If falling' }
    : { w: 'Ne gösterir', u: 'Yükselirse', d: 'Düşerse' };
  el.innerHTML =
    '<div class="cct-row"><b>' + L.w + ':</b> ' + tip.what + '</div>' +
    '<div class="cct-row cct-up"><b>' + L.u + ':</b> ' + tip.up + '</div>' +
    '<div class="cct-row cct-dn"><b>' + L.d + ':</b> ' + tip.down + '</div>';
  el.classList.remove('hidden');
  GAME._chartTipOpenId = id;
  // mobilde tıklanabilir (dışarı tık yakalama için)
  el.style.pointerEvents = GAME._isTouchUi() ? 'auto' : 'none';
  const pad = 8;
  const r = anchor.getBoundingClientRect();
  el.style.position = 'fixed';
  el.style.zIndex = '280';
  el.style.left = '0px';
  el.style.top = '0px';
  const er = el.getBoundingClientRect();
  let left = r.left;
  let top = r.bottom + 6;
  if (left + er.width > window.innerWidth - pad) left = window.innerWidth - er.width - pad;
  if (top + er.height > window.innerHeight - pad) top = r.top - er.height - 6;
  if (left < pad) left = pad;
  if (top < pad) top = pad;
  el.style.left = left + 'px';
  el.style.top = top + 'px';
};
GAME.hideChartChipTip = function () {
  if (GAME._chartTipEl) GAME._chartTipEl.classList.add('hidden');
  GAME._chartTipOpenId = null;
};
