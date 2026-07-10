/* ============ KÜRESEL ETKİ — Mobil 9:16 arayüz ============ */
/* Masaüstü DOM'u bozulmaz; mobile-ui iken paneller sekmeli kabuğa taşınır. */
window.GAME = window.GAME || {};

GAME.mobile = {
  active: false,
  page: 0,
  titles: ['Durum', 'Grafik', 'Olaylar', 'Harita', 'Enstrüman'],
  titleKeys: ['ui.nav_status', 'ui.nav_chart', 'ui.nav_feed', 'ui.nav_map', 'ui.nav_instr'],
  /* { elId, hostId, homeParentId, homeBeforeId } */
  moves: [
    { el: 'panel-left', host: 'm-host-status', home: 'game-body', before: 'panel-center' },
    { el: 'panel-center', host: 'm-host-charts', home: 'game-body', before: 'panel-right' },
    { el: 'panel-right', host: 'm-host-feed', home: 'game-body', before: null },
    { el: 'instrument-bar', host: 'm-host-instr', home: 'screen-game', before: 'mobile-chrome' }
  ]
};

/** Dar / dikey → mobil UI; masaüstü geniş yatay → desktop */
GAME.shouldUseMobileUI = function () {
  const w = window.innerWidth, h = window.innerHeight;
  if (w < 320 || h < 400) return false; // gate
  // Telefon dikey veya dar tablet
  if (w <= 920) return true;
  if (h > w && w < 1100) return true;
  return false;
};

GAME.shouldBlockViewport = function () {
  const w = window.innerWidth, h = window.innerHeight;
  return w < 300 || h < 380;
};

GAME.checkViewport = function () {
  const gate = document.getElementById('viewport-gate');
  const blocked = GAME.shouldBlockViewport();
  if (gate) gate.classList.toggle('hidden', !blocked);
  document.body.classList.toggle('viewport-blocked', blocked);

  if (!blocked) {
    const want = GAME.shouldUseMobileUI();
    if (want !== GAME.mobile.active) GAME.setMobileUI(want);
    else if (want) GAME.syncMobileChrome();
  }
  return !blocked;
};

GAME.setMobileUI = function (on) {
  const chrome = document.getElementById('mobile-chrome');
  if (!chrome) return;

  if (on && !GAME.mobile.active) {
    GAME.mobile.active = true;
    document.body.classList.add('mobile-ui');
    chrome.classList.remove('hidden');
    GAME.mobile.moves.forEach(m => {
      const el = document.getElementById(m.el);
      const host = document.getElementById(m.host);
      if (el && host && el.parentElement !== host) host.appendChild(el);
    });
    // Feed daraltılmışsa mobilde aç
    try {
      const body = document.getElementById('game-body');
      if (body && body.classList.contains('feed-collapsed')) GAME.toggleFeed(false);
    } catch (e) { /* ignore */ }
    GAME.buildMobileNav();
    GAME.goMobilePage(GAME.mobile.page, false);
    GAME.bindMobileNavOnce();
    GAME.syncMobileChrome();
    GAME.renderMobileMapChips();
    requestAnimationFrame(() => {
      GAME.layoutCenterPanel();
      GAME.drawChart();
      GAME.renderInstrumentBar();
    });
  } else if (!on && GAME.mobile.active) {
    GAME.mobile.active = false;
    document.body.classList.remove('mobile-ui');
    chrome.classList.add('hidden');
    // Masaüstü sırası: body → left, center, right; sonra instrument-bar
    const gb = document.getElementById('game-body');
    const sg = document.getElementById('screen-game');
    const left = document.getElementById('panel-left');
    const center = document.getElementById('panel-center');
    const right = document.getElementById('panel-right');
    const instr = document.getElementById('instrument-bar');
    if (gb) {
      if (left) gb.appendChild(left);
      if (center) gb.appendChild(center);
      if (right) gb.appendChild(right);
    }
    if (sg && instr) {
      const mc = document.getElementById('mobile-chrome');
      if (mc && mc.parentElement === sg) sg.insertBefore(instr, mc);
      else sg.appendChild(instr);
    }
    requestAnimationFrame(() => {
      GAME.layoutCenterPanel();
      GAME.drawChart();
      GAME.renderInstrumentBar();
    });
  }
};

GAME.buildMobileNav = function () {
  const dots = document.getElementById('m-nav-dots');
  if (!dots) return;
  dots.innerHTML = '';
  GAME.mobile.titles.forEach((t, i) => {
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'm-dot' + (i === GAME.mobile.page ? ' active' : '');
    d.title = t;
    d.setAttribute('aria-label', t);
    d.onclick = () => GAME.goMobilePage(i, true);
    dots.appendChild(d);
  });
  const label = document.getElementById('m-nav-label');
  if (label) {
    const keys = GAME.mobile.titleKeys;
    label.textContent = (keys && GAME.t)
      ? GAME.t(keys[GAME.mobile.page])
      : GAME.mobile.titles[GAME.mobile.page];
  }
};

GAME.goMobilePage = function (i, smooth) {
  const n = GAME.mobile.titles.length;
  // Döngüsel sekmeler: son → ilk, ilk → son
  GAME.mobile.page = ((i % n) + n) % n;
  const wrap = document.getElementById('mobile-track-wrap');
  const track = document.getElementById('mobile-track');
  if (wrap && track) {
    const page = track.children[GAME.mobile.page];
    if (page) page.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', inline: 'start', block: 'nearest' });
  }
  const label = document.getElementById('m-nav-label');
  if (label) {
    const keys = GAME.mobile.titleKeys;
    label.textContent = (keys && GAME.t)
      ? GAME.t(keys[GAME.mobile.page])
      : GAME.mobile.titles[GAME.mobile.page];
  }
  document.querySelectorAll('#m-nav-dots .m-dot').forEach((d, idx) => {
    d.classList.toggle('active', idx === GAME.mobile.page);
  });
  // Prev/next her zaman aktif (döngü)
  const prev = document.getElementById('m-nav-prev');
  const next = document.getElementById('m-nav-next');
  if (prev) prev.disabled = false;
  if (next) next.disabled = false;

  // Grafik sekmesine gelince yeniden boyutla
  if (GAME.mobile.page === 1) {
    requestAnimationFrame(() => { GAME.layoutCenterPanel(); GAME.drawChart(); });
  }
  if (GAME.mobile.page === 4) {
    requestAnimationFrame(() => GAME.renderInstrumentBar());
  }
};

GAME.syncMobileChrome = function () {
  if (!GAME.mobile.active || !GAME.state) return;
  const pdef = GAME.pdef();
  const s = GAME.state;
  const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  set('m-hdr-country', pdef.flag + ' ' + pdef.name);
  set('m-hdr-date', GAME.turnDate(s.turn) + ' · T' + s.turn + '/' + GAME.MAX_TURNS);
  set('m-hdr-polcap', '🏛 <b>' + Math.round(GAME.pc().internal.polCap) + '</b>');
  const used = s.pending.length;
  const left = GAME.SLOTS_PER_TURN - used;
  set('m-hdr-slots', GAME.t
    ? GAME.t('ui.slots_html', { used: left, max: GAME.SLOTS_PER_TURN })
    : ('Müdahale <b>' + left + '/' + GAME.SLOTS_PER_TURN + '</b>'));
  GAME.renderMobileMapChips();
};

GAME.renderMobileMapChips = function () {
  const box = document.getElementById('m-map-chips');
  if (!box || !GAME.state) return;
  box.innerHTML = '';
  for (const cid in GAME.state.countries) {
    const def = GAME.COUNTRIES[cid];
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn m-map-chip';
    const rel = cid === GAME.state.player ? null : GAME.getRelation(GAME.state.player, cid);
    b.textContent = def.flag + ' ' + def.name;
    if (cid === GAME.state.player) {
      b.style.borderColor = '#000080';
      b.style.fontWeight = 'bold';
    } else if (rel !== null) {
      b.style.borderColor = GAME.relationColor(rel);
    }
    b.onclick = () => GAME.openMapModal(cid);
    box.appendChild(b);
  }
};

GAME._mobileNavBound = false;
GAME.bindMobileNavOnce = function () {
  if (GAME._mobileNavBound) return;
  GAME._mobileNavBound = true;

  const prev = document.getElementById('m-nav-prev');
  const next = document.getElementById('m-nav-next');
  // En sağdan ▶ → en sol; en soldan ◀ → en sağ
  if (prev) prev.onclick = () => GAME.goMobilePage(GAME.mobile.page - 1, true);
  if (next) next.onclick = () => GAME.goMobilePage(GAME.mobile.page + 1, true);

  const mHelp = document.getElementById('m-btn-help');
  const mLog = document.getElementById('m-btn-log');
  const mCommit = document.getElementById('m-btn-commit');
  if (mHelp) mHelp.onclick = () => GAME.openHelpModal();
  if (mLog) mLog.onclick = () => GAME.openLogModal();
  const mReset = document.getElementById('m-btn-reset-pending');
  if (mReset) mReset.onclick = () => GAME.clearPending();
  if (mCommit) mCommit.onclick = () => GAME.confirmCommitTurn();
  if (GAME.Music && GAME.Music.bindButtons) GAME.Music.bindButtons();

  const openMap = document.getElementById('m-btn-open-map');
  if (openMap) openMap.onclick = () => GAME.openMapModal(GAME.state ? GAME.state.player : 'USA');

  // Kaydırma ile sayfa indeksi + kenarda döngüsel atlama
  const wrap = document.getElementById('mobile-track-wrap');
  if (wrap) {
    let scrollT = null;
    wrap.addEventListener('scroll', () => {
      clearTimeout(scrollT);
      scrollT = setTimeout(() => {
        const w = wrap.clientWidth || 1;
        const idx = Math.round(wrap.scrollLeft / w);
        if (idx !== GAME.mobile.page && idx >= 0 && idx < GAME.mobile.titles.length) {
          GAME.mobile.page = idx;
          GAME.buildMobileNav();
          if (idx === 1) { GAME.layoutCenterPanel(); GAME.drawChart(); }
        }
      }, 60);
    }, { passive: true });

    // Kenar swipe: en solda sağa kaydır → en sağ; en sağda sola kaydır → en sol
    let tx = 0, ty = 0, tPage = 0, tracking = false;
    wrap.addEventListener('touchstart', e => {
      if (!e.touches[0] || e.touches.length > 1) return;
      tracking = true;
      tx = e.touches[0].clientX;
      ty = e.touches[0].clientY;
      const w = wrap.clientWidth || 1;
      tPage = Math.round(wrap.scrollLeft / w);
    }, { passive: true });
    wrap.addEventListener('touchend', e => {
      if (!tracking || !e.changedTouches[0]) return;
      tracking = false;
      const dx = e.changedTouches[0].clientX - tx;
      const dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.1) return;
      const n = GAME.mobile.titles.length;
      // Parmak sağa (dx>0) = önceki sayfa; solda iken → son sayfa
      if (dx > 55 && tPage <= 0) {
        GAME.goMobilePage(n - 1, true);
        return;
      }
      // Parmak sola (dx<0) = sonraki sayfa; sağda iken → ilk sayfa
      if (dx < -55 && tPage >= n - 1) {
        GAME.goMobilePage(0, true);
      }
    }, { passive: true });
  }

  // Sayfa geneli: çift dokunuş / pinch zoom engeli (harita hariç kendi touch-action:none ile yönetir)
  if (!GAME._mobileZoomGuard) {
    GAME._mobileZoomGuard = true;
    const blockZoom = (e) => {
      if (e.touches && e.touches.length > 1) {
        // Harita alanında pinch serbest
        if (e.target && e.target.closest && e.target.closest('.map-well, .map-viewport, .map-stage, .map-nav')) return;
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', blockZoom, { passive: false, capture: true });
    // iOS gesture zoom
    document.addEventListener('gesturestart', (e) => {
      if (e.target && e.target.closest && e.target.closest('.map-well, .map-viewport, .map-stage')) return;
      e.preventDefault();
    }, { passive: false });
  }
};

/* runTurnAnimated masaüstü btn-commit kullanır; mobilde de senkron */
GAME._origRunTurnAnimated = null;
