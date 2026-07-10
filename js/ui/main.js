/* ============ KÜRESEL ETKİ — Başlatma ve Ana Akış ============ */
window.GAME = window.GAME || {};

GAME.sleep = ms => new Promise(r => setTimeout(r, ms));

/* Bekleyen enstrüman özeti metni */
GAME.formatPendingSummary = function () {
  const s = GAME.state;
  const t = (k, v) => (GAME.t ? GAME.t(k, v) : k);
  if (!s || !s.pending || !s.pending.length) {
    return '<p style="color:#505050">' + t('ui.pending_none_html') + '</p>';
  }
  let html = '<p><b>' + s.pending.length + '</b> ' + t('ui.pending_waiting') + '</p><ol class="commit-summary-list">';
  s.pending.forEach(p => {
    const ins = GAME.INSTRUMENTS_BY_ID[p.insId];
    if (!ins) return;
    const cost = GAME.instrumentCost(s.player, p.insId);
    let act;
    if (ins.type === 'toggle') act = p.val > 0
      ? '<b style="color:#008000">' + t('ui.open') + '</b>'
      : '<b style="color:#c00000">' + t('ui.close') + '</b>';
    else if (ins.type === 'slider') act = t('ui.level', { v: Math.round(p.val) });
    else act = '<b>' + GAME.fmt(p.val, 1) + (ins.unit || '') + '</b>';
    if (p.target && GAME.COUNTRIES[p.target]) {
      act += ' → ' + GAME.COUNTRIES[p.target].flag + ' ' + GAME.COUNTRIES[p.target].name;
    }
    const layer = GAME.LAYERS[ins.layer] ? GAME.LAYERS[ins.layer].short : '';
    html += '<li><span class="commit-layer">[' + layer + ']</span> <b>' + ins.name + '</b>: ' + act +
      ' <span class="commit-cost">🏛 ' + cost + '</span></li>';
  });
  html += '</ol>';
  const cap = GAME.pendingTotalCost();
  const pc = Math.round(GAME.pc().internal.polCap);
  html += '<p style="margin-top:8px;font-size:12px;color:#505050">' +
    t('ui.total_polcap_cost', { cap: cap, pc: pc }) + '</p>';
  if (cap > pc) {
    html += '<p style="margin-top:8px;color:#c00000;font-weight:bold">' +
      t('ui.polcap_insufficient', { need: cap, have: pc }) + '</p>';
  }
  return html;
};

/* Onayla ve İlerle: özet → emin misin? → tur */
GAME.confirmCommitTurn = function () {
  if (GAME.ui.processing || !GAME.state || GAME.state.gameOver) return;
  document.getElementById('modal-box').classList.remove('map-mode', 'map-mode-mobile');
  document.getElementById('modal-backdrop').classList.remove('map-backdrop-mobile');
  document.getElementById('modal-title').textContent =
    GAME.t('ui.turn_confirm_title', { date: GAME.turnDate(GAME.state.turn) });
  const need = GAME.pendingTotalCost();
  const have = GAME.pc().internal.polCap;
  const short = need > have;
  document.getElementById('modal-body').innerHTML =
    '<div class="commit-confirm">' +
    GAME.formatPendingSummary() +
    (short
      ? '<p style="margin-top:12px;color:#c00000"><b>' + GAME.t('ui.polcap_block_advance') + '</b></p>'
      : '<p style="margin-top:12px"><b>' + GAME.t('ui.turn_confirm_sure') + '</b></p>') +
    '<p style="font-size:11px;color:#505050">' + GAME.t('ui.turn_confirm_note') + '</p>' +
    '</div>';
  const btns = document.getElementById('modal-buttons');
  btns.innerHTML = '';
  if (!short) {
    const yes = document.createElement('button');
    yes.className = 'btn btn-primary';
    yes.textContent = GAME.t('ui.yes_advance');
    yes.onclick = () => {
      GAME.closeModal();
      if (GAME.mobile && GAME.mobile.active && GAME.goMobilePage) {
        GAME.goMobilePage(2, true);
      }
      GAME.runTurnAnimated();
    };
    btns.appendChild(yes);
  }
  const no = document.createElement('button');
  no.className = 'btn';
  no.textContent = short ? GAME.t('ui.close_modal') : GAME.t('ui.cancel');
  no.onclick = GAME.closeModal;
  btns.appendChild(no);
  document.getElementById('modal-backdrop').classList.remove('hidden');
};

/*
  Tur çözümleme (client-side script):
  1) beginTurn + AI tüm kararları TEK SEFERDE belirlenir, localStorage'a yazılır (complete:false)
  2) preAiState geri yüklenir; script 0.5–2 sn gecikmelerle oynatılır (görsel)
  3) finishTurn + complete:true → kalıcı kayıt, mesajlar kalıcı, buton aktif
  Yenileme complete:false iken: preAiState'ten script BAŞTAN oynatılır.
*/
GAME.runTurnAnimated = async function (resumeJob) {
  if (GAME.ui.processing || !GAME.state || GAME.state.gameOver) return;
  GAME.ui.processing = true;
  GAME.ui.helpConsent = false;
  GAME.ui.helpCache = null;
  const commitBtns = [document.getElementById('btn-commit'), document.getElementById('m-btn-commit')].filter(Boolean);
  commitBtns.forEach(btn => { btn.disabled = true; btn.textContent = GAME.t('ui.commit_busy'); });

  let job = resumeJob || null;

  /* ---- Planı hazırla (yoksa) ---- */
  if (!job || !job.script || job.complete) {
    GAME.setFeedStatus('*** Kararlar hesaplanıyor');
    GAME.beginTurn();
    const preAiState = GAME.cloneState(GAME.state);
    // AI'yi geçici olarak uygula (sırayla etkileşim için), script'i kaydet
    const built = GAME.buildAIScript();
    // Oynatma için AI'sız duruma dön
    GAME.state = GAME.cloneState(preAiState);
    GAME.migrateState();

    job = {
      version: 2,
      complete: false,
      turn: preAiState.turn,
      player: preAiState.player,
      preAiState: preAiState,
      script: built.script,
      order: built.order,
      ts: Date.now()
    };
    GAME.saveTurnJob(job);
    // Kalıcı ana kayıt: henüz AI/sim yok (flag false)
    try { localStorage.setItem(GAME.SAVE_KEY, JSON.stringify(preAiState)); } catch (e) { /* ignore */ }
  } else {
    // Yarıda kesilmiş iş: preAi snapshot'a dön, baştan oynat
    if (job.preAiState) {
      GAME.state = GAME.cloneState(job.preAiState);
      GAME.migrateState();
    }
    job.complete = false;
    GAME.saveTurnJob(job);
    try { localStorage.setItem(GAME.SAVE_KEY, JSON.stringify(job.preAiState)); } catch (e) { /* ignore */ }
    GAME.setFeedStatus('*** Tur baştan oynatılıyor (kesinti sonrası)');
  }

  GAME.renderHeader();
  GAME.renderInstrumentBar();
  GAME.renderFeed();
  if (GAME.syncMobileChrome) GAME.syncMobileChrome();

  /* ---- Oynatma: her ülke 0.5–2 sn ---- */
  const script = job.script || [];
  for (let i = 0; i < script.length; i++) {
    const entry = script[i];
    const cid = entry.cid;
    const def = GAME.COUNTRIES[cid];
    if (def) {
      GAME.setFeedStatus('*** ' + def.flag + ' ' + def.name +
        (entry.actions && entry.actions.length ? ' işlem yapıyor' : ' geçiyor'));
    }
    const before = GAME.state.news.length;
    const acted = GAME.applyAIScriptEntry(entry);
    // Oynatma sırasında kalıcı SAVE yok (flag false) — sadece job
    GAME.saveTurnJob(job);
    await GAME.sleep(GAME.randInt(500, 2000));
    if (GAME.state.news.length > before) GAME.renderFeed();
    if (acted && GAME.syncMobileChrome) GAME.syncMobileChrome();
  }

  /* ---- Simülasyon + kalıcı flag ---- */
  GAME.setFeedStatus('*** Simülasyon hesaplanıyor');
  await GAME.sleep(GAME.randInt(500, 1200));
  const result = GAME.finishTurn();

  // Flag: tur tamam — mesajlar ve state kalıcı
  job.complete = true;
  job.finishedAt = Date.now();
  // complete job'u kısa süre tutmaya gerek yok; sil + final save
  GAME.clearTurnJob();
  GAME.save(); // finishTurn zaten save eder; emin olmak için

  GAME.setFeedStatus('');
  GAME.ui.processing = false;
  commitBtns.forEach(btn => {
    btn.disabled = false;
    btn.textContent = btn.id === 'm-btn-commit' ? GAME.t('ui.commit_short') : GAME.t('ui.commit');
  });

  if (result.disasterTriggered) {
    GAME.showDisasterScreen(result.disasterTriggered, null);
    GAME.refreshGameUI();
    return;
  }
  if (result.gameOver) { GAME.showEndScreen(); return; }
  GAME.refreshGameUI();
};

/* complete:false job varsa baştan oynat */
GAME.tryResumeTurnJob = function () {
  const job = GAME.loadTurnJob();
  if (!job || !job.script || job.complete) {
    if (job && job.complete) GAME.clearTurnJob();
    return false;
  }
  if (!GAME.state && job.preAiState) {
    GAME.state = GAME.cloneState(job.preAiState);
    GAME.migrateState();
  }
  if (!GAME.state || GAME.state.gameOver) return false;
  if (job.player && job.player !== GAME.state.player) {
    // preAi'den yükle
    if (job.preAiState) {
      GAME.state = GAME.cloneState(job.preAiState);
      GAME.migrateState();
    }
  }
  if (GAME.mobile && GAME.mobile.active && GAME.goMobilePage) GAME.goMobilePage(2, false);
  GAME.setFeedStatus('*** Kesinti: kaydedilmiş ülke tepkileri baştan oynatılıyor');
  if (typeof GAME.renderFeed === 'function') GAME.renderFeed();
  setTimeout(() => GAME.runTurnAnimated(job), 250);
  return true;
};

document.addEventListener('DOMContentLoaded', function () {
  /* i18n: dil paketleri yüklü → baseline + kayıtlı dil uygula */
  if (GAME.i18n && GAME.i18n.init) GAME.i18n.init();

  if (GAME.Music && GAME.Music.bindUnlockOnce) GAME.Music.bindUnlockOnce();
  if (GAME.Music && GAME.Music.bindButtons) GAME.Music.bindButtons();

  /* Menü butonları */
  document.getElementById('btn-new-game').onclick = () => {
    if (GAME.hasSave() && !confirm(GAME.t('ui.confirm_new'))) return;
    GAME.clearSave();
    GAME.renderCountrySelect();
  };
  document.getElementById('btn-continue').onclick = () => {
    if (GAME.load()) {
      if (GAME.state.gameOver) GAME.showEndScreen();
      else {
        GAME.startGameScreen();
        GAME.tryResumeTurnJob();
      }
    }
  };
  document.getElementById('btn-about').onclick = GAME.renderAbout;
  document.getElementById('btn-about-back').onclick = GAME.renderMenu;

  /* Oyun ekranı butonları */
  document.getElementById('btn-log').onclick = GAME.openLogModal;
  const btnReset = document.getElementById('btn-reset-pending');
  if (btnReset) btnReset.onclick = () => GAME.clearPending();
  document.getElementById('btn-commit').onclick = GAME.confirmCommitTurn;
  document.getElementById('btn-help').onclick = GAME.openHelpModal;

  /* Dil seçiciler (menü + masaüstü oyun + mobil pencere) */
  if (GAME.i18n && GAME.i18n.renderAllLangSwitchers) GAME.i18n.renderAllLangSwitchers();

  /* mIRC paneli aç/kapa */
  document.getElementById('btn-feed-toggle').onclick = () => GAME.toggleFeed(true);
  document.getElementById('feed-reopen').onclick = () => GAME.toggleFeed(false);
  try { if (localStorage.getItem('keFeedCollapsed_oyungrok') === '1') GAME.toggleFeed(true); } catch (e) {}

  /* Modal dışına tıklayınca kapat */
  document.getElementById('modal-backdrop').addEventListener('click', e => {
    if (e.target.id === 'modal-backdrop') GAME.closeModal();
  });

  /* ESC ile modal kapat */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') GAME.closeModal();
  });

  /* Pencere boyutu: viewport kapısı + enstrüman sayfası + orta panel grafik */
  let resizeT = null;
  const onResize = () => {
    GAME.checkViewport();
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      if (!document.getElementById('screen-game').classList.contains('active')) return;
      if (GAME.mobile && GAME.mobile.active) GAME.syncMobileChrome();
      if (!GAME.state || GAME.state.gameOver) return;
      GAME.renderInstrumentBar();
      GAME.layoutCenterPanel();
      GAME.drawChart();
    }, 100);
  };
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', () => setTimeout(onResize, 200));

  GAME.checkViewport();
  GAME.renderMenu();

  /* Sayfa yenilendi + complete:false tur işi → script baştan oynat */
  if (GAME.hasTurnJob && GAME.hasTurnJob()) {
    const job = GAME.loadTurnJob();
    if (job && !job.complete && job.preAiState) {
      GAME.state = GAME.cloneState ? GAME.cloneState(job.preAiState) : JSON.parse(JSON.stringify(job.preAiState));
      if (GAME.migrateState) GAME.migrateState();
      if (GAME.state.gameOver) GAME.showEndScreen();
      else {
        GAME.startGameScreen();
        GAME.tryResumeTurnJob();
      }
    } else if (GAME.hasSave() && GAME.load()) {
      if (GAME.state.gameOver) GAME.showEndScreen();
      else GAME.startGameScreen();
    }
  }
});
