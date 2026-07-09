/* ============ KÜRESEL ETKİ — i18n çekirdeği ============
   Modüler dil paketleri: lang/<kod>/*.js → GAME.i18n.register(lang, section, data)
   Kullanım: GAME.t('ui.new_game')  ·  GAME.i18n.setLang('en')
   Kayıt: localStorage keLang_oyungrok
*/
window.GAME = window.GAME || {};

GAME.i18n = {
  LANG_KEY: 'keLang_oyungrok',
  DEFAULT: 'tr',
  lang: 'tr',
  /** @type {Record<string, Record<string, any>>} lang → section → data */
  packs: {},
  /** Desteklenen diller (UI seçici: short = 3 harfli kod, menü dropdown) */
  supported: [
    { code: 'tr', short: 'TR', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', short: 'EN', label: 'English', flag: '🇬🇧' }
  ],
  /** Snapshot: ilk yüklemede TR veri dosyalarından (fallback) */
  _baseline: null,

  register: function (lang, section, data) {
    if (!this.packs[lang]) this.packs[lang] = {};
    if (section == null || section === '') {
      Object.keys(data || {}).forEach(k => { this.packs[lang][k] = data[k]; });
    } else {
      this.packs[lang][section] = data;
    }
  },

  getLang: function () { return this.lang; },

  /** Nested path: 'ui.new_game' veya ['ui','new_game'] */
  get: function (path, lang) {
    const L = this.packs[lang || this.lang];
    if (!L) return undefined;
    const parts = Array.isArray(path) ? path : String(path).split('.');
    let cur = L;
    for (let i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  },

  /**
   * Çeviri + {var} interpolasyonu.
   * Eksikse fallbackLang (tr) dener; o da yoksa key döner.
   */
  t: function (key, vars, lang) {
    let s = this.get(key, lang);
    if (s === undefined && lang !== this.DEFAULT) s = this.get(key, this.DEFAULT);
    if (s === undefined) s = key;
    if (typeof s !== 'string') return s;
    if (vars) {
      s = s.replace(/\{(\w+)\}/g, function (_, k) {
        return vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : '{' + k + '}';
      });
    }
    return s;
  },

  /** HTML güvenli değil — çağıran escape etsin; çoğu yer innerHTML ile TR/EN kontrollü metin */
  tHtml: function (key, vars, lang) {
    return this.t(key, vars, lang);
  },

  setLang: function (code, opts) {
    opts = opts || {};
    if (!this.packs[code]) {
      console.warn('[i18n] unknown lang', code);
      return false;
    }
    this.lang = code;
    try { localStorage.setItem(this.LANG_KEY, code); } catch (e) {}
    try { document.documentElement.lang = code === 'tr' ? 'tr' : code; } catch (e) {}
    this.applyAll();
    if (opts.rerender !== false && typeof GAME.afterLangChange === 'function') {
      GAME.afterLangChange(code);
    }
    return true;
  },

  loadSaved: function () {
    let code = this.DEFAULT;
    try {
      const s = localStorage.getItem(this.LANG_KEY);
      if (s && this.packs[s]) code = s;
    } catch (e) {}
    this.lang = code;
    try { document.documentElement.lang = code === 'tr' ? 'tr' : code; } catch (e) {}
    return code;
  },

  /** Veri dosyalarındaki TR metinleri yedekle (paket eksik alanlar için) */
  captureBaseline: function () {
    if (this._baseline) return;
    const snapIns = {};
    (GAME.INSTRUMENTS || []).forEach(i => {
      snapIns[i.id] = { name: i.name, desc: i.desc };
    });
    const snapCo = {};
    if (GAME.COUNTRIES) {
      Object.keys(GAME.COUNTRIES).forEach(id => {
        const c = GAME.COUNTRIES[id];
        snapCo[id] = {
          name: c.name, desc: c.desc, style: c.style,
          difficulty: c.difficulty, gov: c.gov
        };
      });
    }
    const snapDi = {};
    (GAME.DISASTERS || []).forEach(d => {
      snapDi[d.id] = { name: d.name, desc: d.desc, impacts: (d.impacts || []).slice() };
    });
    this._baseline = {
      instruments: snapIns,
      countries: snapCo,
      disasters: snapDi,
      layers: JSON.parse(JSON.stringify(GAME.LAYERS || {})),
      groups: JSON.parse(JSON.stringify(GAME.GROUPS || {})),
      globals: {},
      indMeta: {},
      newsCats: Object.assign({}, GAME.NEWS_CATS || {}),
      toneMeta: JSON.parse(JSON.stringify(GAME.TONE_META || {})),
      help: Object.assign({}, GAME.HELP_TOPICS || {}),
      about: GAME.ABOUT_MAIN_HTML || '',
      diplo: GAME.DIPLO_TEMPLATES ? JSON.parse(JSON.stringify(GAME.DIPLO_TEMPLATES)) : null,
      econTitle: GAME.ECON_TITLE ? JSON.parse(JSON.stringify(GAME.ECON_TITLE)) : null,
      econBody: GAME.ECON_BODY ? JSON.parse(JSON.stringify(GAME.ECON_BODY)) : null,
      globalTitle: GAME.GLOBAL_TITLE ? JSON.parse(JSON.stringify(GAME.GLOBAL_TITLE)) : null,
      risk: GAME.RISK_TEMPLATES ? JSON.parse(JSON.stringify(GAME.RISK_TEMPLATES)) : null,
      events: GAME.EVENT_TEXTS ? JSON.parse(JSON.stringify(GAME.EVENT_TEXTS)) : null,
      projectDone: (GAME.PROJECT_DONE || []).slice(),
      projectProg: (GAME.PROJECT_PROG || []).slice(),
      detectionTitles: (GAME.DETECTION_TITLES || []).slice(),
      detectionBodies: (GAME.DETECTION_BODIES || []).slice(),
      disasterFlavor: GAME.DISASTER_FLAVOR ? JSON.parse(JSON.stringify(GAME.DISASTER_FLAVOR)) : null,
      globalBody: (GAME.GLOBAL_BODY || []).slice()
    };
    if (GAME.GLOBALS_INIT) {
      Object.keys(GAME.GLOBALS_INIT).forEach(k => {
        this._baseline.globals[k] = { name: GAME.GLOBALS_INIT[k].name };
      });
    }
    if (GAME.IND_META) {
      Object.keys(GAME.IND_META).forEach(k => {
        this._baseline.indMeta[k] = { name: GAME.IND_META[k].name };
      });
    }
  },

  _pickField: function (section, id, field) {
    const p = this.packs[this.lang] && this.packs[this.lang][section];
    if (p && p[id] && p[id][field] !== undefined) return p[id][field];
    const b = this._baseline && this._baseline[section];
    if (b && b[id] && b[id][field] !== undefined) return b[id][field];
    return undefined;
  },

  applyDataStrings: function () {
    this.captureBaseline();
    const lang = this.lang;
    const pack = this.packs[lang] || {};

    // Instruments
    (GAME.INSTRUMENTS || []).forEach(ins => {
      const n = this._pickField('instruments', ins.id, 'name');
      const d = this._pickField('instruments', ins.id, 'desc');
      if (n !== undefined) ins.name = n;
      if (d !== undefined) ins.desc = d;
    });

    // Countries
    if (GAME.COUNTRIES) {
      Object.keys(GAME.COUNTRIES).forEach(id => {
        const c = GAME.COUNTRIES[id];
        // gov kod anahtarıdır (demokratik/otoriter/hibrit/birlik) — çevirme
        ['name', 'desc', 'style', 'difficulty'].forEach(f => {
          const v = this._pickField('countries', id, f);
          if (v !== undefined) c[f] = v;
        });
      });
    }

    // Disasters
    (GAME.DISASTERS || []).forEach(dis => {
      const n = this._pickField('disasters', dis.id, 'name');
      const d = this._pickField('disasters', dis.id, 'desc');
      const im = this._pickField('disasters', dis.id, 'impacts');
      if (n !== undefined) dis.name = n;
      if (d !== undefined) dis.desc = d;
      if (im !== undefined) dis.impacts = im.slice ? im.slice() : im;
    });

    // Layers
    if (GAME.LAYERS && (pack.layers || (this._baseline && this._baseline.layers))) {
      const src = pack.layers || this._baseline.layers;
      Object.keys(GAME.LAYERS).forEach(k => {
        if (src[k]) {
          if (src[k].name) GAME.LAYERS[k].name = src[k].name;
          if (src[k].short) GAME.LAYERS[k].short = src[k].short;
        }
      });
    }

    // Groups
    if (GAME.GROUPS && (pack.groups || (this._baseline && this._baseline.groups))) {
      const src = pack.groups || this._baseline.groups;
      Object.keys(GAME.GROUPS).forEach(k => {
        if (src[k]) {
          if (src[k].name) GAME.GROUPS[k].name = src[k].name;
          if (src[k].concerns) GAME.GROUPS[k].concerns = src[k].concerns;
        }
      });
    }

    // Globals names
    if (GAME.GLOBALS_INIT) {
      Object.keys(GAME.GLOBALS_INIT).forEach(k => {
        const n = (pack.globals && pack.globals[k] && pack.globals[k].name)
          || (this._baseline && this._baseline.globals[k] && this._baseline.globals[k].name);
        if (n) GAME.GLOBALS_INIT[k].name = n;
      });
    }

    // IND_META names
    if (GAME.IND_META) {
      Object.keys(GAME.IND_META).forEach(k => {
        const n = (pack.indMeta && pack.indMeta[k] && pack.indMeta[k].name)
          || (this._baseline && this._baseline.indMeta[k] && this._baseline.indMeta[k].name);
        if (n) GAME.IND_META[k].name = n;
      });
    }

    // Tone meta
    if (GAME.TONE_META && (pack.toneMeta || (this._baseline && this._baseline.toneMeta))) {
      const src = pack.toneMeta || this._baseline.toneMeta;
      Object.keys(GAME.TONE_META).forEach(k => {
        if (src[k] && src[k].name) GAME.TONE_META[k].name = src[k].name;
      });
    }

    // News cats
    if (GAME.NEWS_CATS) {
      const src = pack.newsCats || (this._baseline && this._baseline.newsCats);
      if (src) Object.keys(src).forEach(k => { GAME.NEWS_CATS[k] = src[k]; });
    }

    // News template blobs
    const assignIf = (key, targetName) => {
      const v = pack[key] !== undefined ? pack[key]
        : (this._baseline ? this._baseline[key] : undefined);
      if (v !== undefined) GAME[targetName] = typeof v === 'object' && !Array.isArray(v)
        ? JSON.parse(JSON.stringify(v))
        : (Array.isArray(v) ? v.slice() : v);
    };
    assignIf('diplo', 'DIPLO_TEMPLATES');
    assignIf('econTitle', 'ECON_TITLE');
    assignIf('econBody', 'ECON_BODY');
    assignIf('globalTitle', 'GLOBAL_TITLE');
    assignIf('globalBody', 'GLOBAL_BODY');
    assignIf('risk', 'RISK_TEMPLATES');
    assignIf('events', 'EVENT_TEXTS');
    assignIf('projectDone', 'PROJECT_DONE');
    assignIf('projectProg', 'PROJECT_PROG');
    assignIf('detectionTitles', 'DETECTION_TITLES');
    assignIf('detectionBodies', 'DETECTION_BODIES');
    assignIf('disasterFlavor', 'DISASTER_FLAVOR');

    // Help
    if (GAME.HELP_TOPICS) {
      const src = pack.help || (this._baseline && this._baseline.help);
      if (src) Object.keys(src).forEach(k => { GAME.HELP_TOPICS[k] = src[k]; });
    }
    if (pack.about !== undefined) GAME.ABOUT_MAIN_HTML = pack.about;
    else if (this._baseline && this._baseline.about) GAME.ABOUT_MAIN_HTML = this._baseline.about;

    // Chart series labels
    if (GAME.chart && GAME.chart.SERIES) {
      const cs = pack.chartSeries || (this._baseline && this._baseline.chartSeries);
      if (cs) {
        GAME.chart.SERIES.forEach(s => {
          if (cs[s.id]) s.name = cs[s.id];
        });
      }
    }
  },

  /** data-i18n, data-i18n-title, data-i18n-placeholder, data-i18n-html */
  applyDom: function () {
    const self = this;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const v = self.t(key);
      if (typeof v === 'string') el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const v = self.t(key);
      if (typeof v === 'string') el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const v = self.t(key);
      if (typeof v === 'string') el.setAttribute('title', v);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const v = self.t(key);
      if (typeof v === 'string') el.setAttribute('placeholder', v);
    });
    // document title
    const title = this.t('ui.doc_title');
    if (title && title !== 'ui.doc_title') document.title = title;
  },

  applyAll: function () {
    this.applyDataStrings();
    this.applyDom();
  },

  /**
   * Dil seçici: 3 harfli kodlarla <select> (TR / EN …)
   * container: menü / masaüstü oyun / mobil pencere içi host
   */
  renderLangSwitcher: function (container) {
    if (!container) return;
    const self = this;
    container.innerHTML = '';
    container.classList.add('lang-switcher');

    const sel = document.createElement('select');
    sel.id = (container.id || 'lang') + '-select';
    sel.className = 'lang-select';
    sel.setAttribute('aria-label', 'Language');
    sel.title = 'Language';

    this.supported.forEach(L => {
      const opt = document.createElement('option');
      opt.value = L.code;
      opt.textContent = (L.short || String(L.code).toUpperCase().slice(0, 3));
      opt.title = L.label || L.code;
      if (L.code === self.lang) opt.selected = true;
      sel.appendChild(opt);
    });

    sel.onchange = function () {
      const code = sel.value;
      if (code && code !== self.lang) self.setLang(code);
    };

    container.appendChild(sel);
  },

  /** Tüm data-lang-switcher host’larını doldur */
  renderAllLangSwitchers: function () {
    const self = this;
    document.querySelectorAll('[data-lang-switcher]').forEach(function (el) {
      self.renderLangSwitcher(el);
    });
  },

  init: function () {
    this.captureBaseline();
    // TR pack yoksa baseline zaten TR; EN pack register edilmiş olmalı
    this.loadSaved();
    this.applyAll();
  }
};

/** Kısayol */
GAME.t = function (key, vars) {
  return GAME.i18n.t(key, vars);
};

/** Zorluk sınıfı (çok dilli metin) */
GAME.difficultyClass = function (diffStr) {
  const d = String(diffStr || '');
  if (/zor|hard/i.test(d) && !/orta|medium/i.test(d)) return 'diff-zor';
  if (/kolay|easy/i.test(d)) return 'diff-kolay';
  return 'diff-orta';
};

/** Yönetim biçimi etiketi (gov kodu sabit kalır) */
GAME.govLabel = function (gov) {
  const k = 'gov.' + (gov || '');
  const t = GAME.t(k);
  return (t && t !== k) ? t : (gov || '');
};

/** AI haber metni: ai.<key>.title|body|why */
GAME.aiMsg = function (key, vars) {
  vars = vars || {};
  return {
    title: GAME.t('ai.' + key + '.title', vars),
    body: GAME.t('ai.' + key + '.body', vars),
    why: GAME.t('ai.' + key + '.why', vars)
  };
};

/**
 * Dil değişince UI yenile.
 * Oyun içi haber arşivi eski dilde kalır (tarihsel kayıt).
 */
GAME.afterLangChange = function () {
  if (typeof GAME.renderMenu === 'function') {
    const menu = document.getElementById('screen-menu');
    if (menu && menu.classList.contains('active')) GAME.renderMenu();
  }
  if (typeof GAME.renderAbout === 'function') {
    const about = document.getElementById('screen-about');
    if (about && about.classList.contains('active')) GAME.renderAbout();
  }
  if (typeof GAME.renderCountrySelect === 'function') {
    const cs = document.getElementById('screen-country');
    if (cs && cs.classList.contains('active')) GAME.renderCountrySelect();
  }
  if (GAME.state && !GAME.state.gameOver && document.getElementById('screen-game') &&
      document.getElementById('screen-game').classList.contains('active')) {
    if (typeof GAME.refreshGameUI === 'function') GAME.refreshGameUI();
    else {
      if (GAME.renderHeader) GAME.renderHeader();
      if (GAME.renderLeftPanel) GAME.renderLeftPanel();
      if (GAME.renderInstrumentBar) GAME.renderInstrumentBar();
      if (GAME.renderFeed) GAME.renderFeed();
      if (GAME.renderChartControls) GAME.renderChartControls();
      if (GAME.drawChart) GAME.drawChart();
      if (GAME.syncMobileChrome) GAME.syncMobileChrome();
    }
  }
  if (GAME.state && GAME.state.gameOver && typeof GAME.showEndScreen === 'function') {
    const end = document.getElementById('screen-end');
    if (end && end.classList.contains('active')) GAME.showEndScreen();
  }
  if (GAME.Music && GAME.Music.updateButtons) GAME.Music.updateButtons();
  if (GAME.i18n && GAME.i18n.renderAllLangSwitchers) GAME.i18n.renderAllLangSwitchers();
};
