/* Patch TR/EN packs: new UI strings + fuller English help/about */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '..');

function loadPack(lang) {
  const pack = {};
  const sb = { window: {}, GAME: { i18n: { register(l, s, d) { pack[s] = d; } } } };
  sb.window.GAME = sb.GAME;
  vm.createContext(sb);
  vm.runInContext(fs.readFileSync(path.join(root, 'lang', lang, 'pack.js'), 'utf8'), sb);
  return pack;
}

function emit(lang, sections) {
  let out = '/* Language pack: ' + lang + ' */\nwindow.GAME = window.GAME || {};\n(function () {\n';
  out += "  var R = function (s, d) { GAME.i18n.register('" + lang + "', s, d); };\n";
  for (const [sec, data] of Object.entries(sections)) {
    out += '  R(' + JSON.stringify(sec) + ', ' + JSON.stringify(data) + ');\n';
  }
  out += '})();\n';
  fs.writeFileSync(path.join(root, 'lang', lang, 'pack.js'), out);
  console.log('wrote', lang, out.length);
}

const tr = loadPack('tr');
const en = loadPack('en');

Object.assign(tr.ui, {
  reset_pending: 'Sıfırla',
  reset_pending_title: 'Bekleyen tüm enstrüman değişikliklerini iptal et',
  polcap_insufficient: 'Yetersiz siyasi sermaye: gerekli 🏛 {need}, mevcut 🏛 {have}.',
  polcap_block_advance: 'Siyasi sermaye yetersiz — turu ilerletmek için maliyeti düşür (Sıfırla / değişiklikleri iptal et) veya onay biriktir.',
  cost_escalates: 'önceki kullanım: {n} (her seferinde +1 maliyet)',
  fx_penalty_hint: 'regen penaltı: −{n} (her 4 FX kullanımında −1)'
});

Object.assign(en.ui, {
  reset_pending: 'Reset',
  reset_pending_title: 'Cancel all pending instrument changes',
  polcap_insufficient: 'Not enough political capital: need 🏛 {need}, have 🏛 {have}.',
  polcap_block_advance: 'Insufficient political capital — lower the cost (Reset / cancel changes) or wait to regenerate capital before advancing.',
  cost_escalates: 'prior uses: {n} (cost +1 each time)',
  fx_penalty_hint: 'regen penalty: −{n} (−1 per 4 FX uses)',
  log: 'Event Log',
  log_short: 'Log',
  commit: 'Confirm & Advance ▶',
  commit_short: 'Advance ▶'
});

/* English instrument descs for the 4 macros */
if (en.instruments) {
  en.instruments.policy_rate = en.instruments.policy_rate || {};
  en.instruments.policy_rate.desc = 'Main monetary-policy lever. Higher rates cool inflation and support the currency but slow growth and raise unemployment pressure. Cheap at first; each confirmed use costs +1 political capital.';
  en.instruments.tax_rate = en.instruments.tax_rate || {};
  en.instruments.tax_rate.desc = 'Overall tax burden. Higher taxes ease debt but squeeze growth, investment and approval. Cheap base cost that rises by +1 political capital after every confirmed use.';
  en.instruments.public_spending = en.instruments.public_spending || {};
  en.instruments.public_spending.desc = 'Public investment and spending. Boosts growth and jobs but raises debt and inflation. Low base political-capital cost that escalates with repeated use.';
  en.instruments.fx_intervention = en.instruments.fx_intervention || {};
  en.instruments.fx_intervention.desc = 'Defend the currency by selling reserves (cost 3). Heavy reserve drain. Every 4 confirmed uses cuts political-capital regeneration by another −1. Small inflation rise arrives after a 4-quarter delay.';
}
if (tr.instruments && tr.instruments.fx_intervention) {
  tr.instruments.fx_intervention.desc = 'Rezerv satarak kuru savunmak (maliyet 3). Sık kullanım siyasi sermaye yenilenmesini aşındırır (her 4 kullanımda −1 regen); enflasyon ~4 çeyrek gecikmeyle hafif yükselir. Açık kaldıkça rezerv hızla erir.';
  if (tr.instruments.policy_rate) tr.instruments.policy_rate.desc = 'Para politikasının ana aracı. Artış enflasyonu ve kuru baskılar; büyümeyi yavaşlatır. Ucuz başlar; her onaylanan kullanımda siyasi sermaye maliyeti +1 artar.';
  if (tr.instruments.tax_rate) tr.instruments.tax_rate.desc = 'Genel vergi yükü. Borcu rahatlatır ama büyümeyi ve onayı sıkar. Düşük taban maliyet; her onayda +1 siyasi sermaye.';
  if (tr.instruments.public_spending) tr.instruments.public_spending.desc = 'Kamu yatırımı ve harcama. Büyümeyi canlandırır; borç ve enflasyon üretir. Düşük taban maliyet; her onayda +1 siyasi sermaye.';
}

/* Full English help + about (clearer, complete) */
en.help = {
  instruments:
    '<h4>Instruments — Full Guide</h4>' +
    '<p>Each instrument is a <b>state economic tool</b>. Changing one spends <b>1 intervention slot</b> + <b>political capital</b>. Leaving a policy open (not changing it) costs no slot. Effects flow through three channels: <b>pulse</b> (at the moment of change), <b>sustain</b> (each quarter while active), and <b>complete/perm</b> (permanent base shifts when a project finishes).</p>' +
    '<h5>Types</h5><ul>' +
    '<li><b>Toggle (On/Off):</b> Fully on or off. Sanctions, projects, grey-zone ops. Targeted tools require a country when turned on. Closing may partially repair relations.</li>' +
    '<li><b>Slider (0–100):</b> Intensity. 0 = off. Subsidies, stockpiles, capital controls, tariffs, R&amp;D… Sustain scales with level (50 = half strength).</li>' +
    '<li><b>Numerical:</b> Policy rate %, tax %, public spending, FX intervention (bn$), QE. Sustain is relative to the country’s neutral baseline rates.</li></ul>' +
    '<h5>Layer 1 — Structural strategy</h5>' +
    '<p>5–9 year projects. They advance without spending slots; when finished they leave a <b>legacy</b> (permanent base shift). Examples: reserve-currency build, SWIFT alternative, capital markets, CBDC, infrastructure corridor, tech standards, Brussels effect, R&amp;D.</p>' +
    '<p><i>When:</i> Prefer when stability and growth are relatively calm. In a crisis, prioritize emergency macro tools first.</p>' +
    '<h5>Layer 2 — Cyclical + macro</h5>' +
    '<ul>' +
    '<li><b>Policy rate, tax, public spending:</b> Low base political-capital cost that <b>rises by +1 after every confirmed use</b> (escalating fatigue).</li>' +
    '<li><b>FX intervention:</b> Fixed cost 3. Burns reserves faster. Every 4 uses: −1 to political-capital regeneration; small inflation after a 4-quarter delay.</li>' +
    '<li><b>QE, subsidies, stockpiles, tariffs, sanctions family:</b> Trade and industrial tactics; energy/food weapons only at full power if you are a net exporter.</li></ul>' +
    '<h5>Layers 3–4 — Market ops &amp; grey zone</h5>' +
    '<p>Espionage, jawboning, disinfo, NGO proxies, corruption nets, lawfare. High <b>detection risk</b>. Detection: relation collapse, retaliation, end-game risk score.</p>' +
    '<h5>4-slot rule &amp; Reset</h5>' +
    '<p>At most 4 different instrument changes per turn. Use <b>Reset</b> (next to Event Log) to clear all <i>pending</i> changes before you Confirm &amp; Advance. Confirming with insufficient political capital is blocked with a warning.</p>' +
    '<h5>Political capital</h5>' +
    '<p>Each intervention spends capital. Approval regenerates it each quarter (minus FX overuse penalties). AI countries also spend capital.</p>',
  countries:
    '<h4>Countries — 17 Powers</h4>' +
    '<p>There are <b>17 playable powers</b>. The European Union is a single entity; the United Kingdom is separate. Indicators, AI personality, trade links, global dependencies and domestic interest groups differ by country.</p>' +
    '<h5>Indicators</h5><ul>' +
    '<li><b>GDP growth:</b> Economic vitality.</li>' +
    '<li><b>Inflation:</b> Price stability; high inflation erodes approval and stability.</li>' +
    '<li><b>Unemployment:</b> Linked to growth (Okun-style).</li>' +
    '<li><b>Reserves:</b> Fuel for FX defense; low reserves weaken intervention.</li>' +
    '<li><b>Debt % GDP:</b> Fiscal space; very high debt crowds out growth.</li>' +
    '<li><b>Currency index:</b> 100 = start. Falls can feed inflation.</li>' +
    '<li><b>Trade balance &amp; global influence:</b> Shape sanctions, standards and leverage.</li></ul>' +
    '<h5>Personality (AI)</h5>' +
    '<p><b>aggression</b> favors retaliation/sanctions; <b>diplomacy</b> favors swaps/aid and softer tone; <b>opportunism</b> crisis opportunism and grey-zone tools; <b>patience</b> long projects. Authoritarian regimes lean to shadow FX and hard retaliation. The EU uses government type <code>union</code> (democratic-like rules + slower coordination feel).</p>' +
    '<h5>Dependencies (deps)</h5>' +
    '<p>Sensitivity to oil/food/chips/freight/dollar. <b>Negative</b> means you gain when that price rises (exporter). Energy/food weapons only hit full power for net exporters.</p>' +
    '<h5>Relations</h5>' +
    '<p>−200…+200. Targeted moves lower relations; aid/swaps raise them. Header colours show relations relative to you.</p>',
  charts:
    '<h4>Charts — How to Read</h4>' +
    '<p>The center panel plots a <b>time series</b> of the selected indicator. Goal: see cause and effect (e.g. “I raised rates → when did inflation fall?”).</p>' +
    '<h5>Time ranges</h5><ul>' +
    '<li><b>1 year (4 turns):</b> Shocks, rates, FX.</li>' +
    '<li><b>3–5 years:</b> Subsidies, stockpiles, medium structure.</li>' +
    '<li><b>10 years / all:</b> Project completes and paradigm shifts.</li></ul>' +
    '<h5>Engine link</h5>' +
    '<p>Each turn: mean reversion + pulse ticks + sustain + global commodities + trade spill + Okun/FX-inflation links + domestic politics. Watch 2–8 turns after an intervention on a short range.</p>' +
    '<h5>Tips</h5><ul>' +
    '<li>Compare inflation charts with rates/QE in sequence.</li>' +
    '<li>Reserve melt + currency fall → stop FX defense / raise rates.</li>' +
    '<li>Project completion shows step changes in influence/currency/trade.</li></ul>',
  topics:
    '<h4>Topics &amp; System — Deep Mechanics</h4>' +
    '<h5>Mission</h5>' +
    '<p><b>No win condition.</b> Feel what happens when you change an economic instrument. 60 turns ≈ 15 years; one turn = one quarter (3 months).</p>' +
    '<h5>Turn flow</h5>' +
    '<ol><li>You choose up to 4 pending changes (or <b>Reset</b> them).</li>' +
    '<li>Confirm &amp; Advance — blocked if political capital is insufficient.</li>' +
    '<li>AI countries react (planned script, delayed feed).</li>' +
    '<li>Simulation tick: reversion, pulses, sustains, globals, trade, projects, politics, detection.</li>' +
    '<li>News, autosave, turn++. One disaster fires on turns 2–4.</li></ol>' +
    '<h5>Effect timescales</h5>' +
    '<p>imm / short / med / long delays and durations. Mean reversion stops death spirals. FX overuse adds delayed inflation (4-quarter wait).</p>' +
    '<h5>Diplomacy &amp; AI</h5>' +
    '<p>Five tones from friendly to hostile. Score-based AI candidates. Advisory Board uses the same planner for you.</p>' +
    '<h5>Saves</h5>' +
    '<p>localStorage keys with <code>_oyungrok</code> suffix. Turn model v2: full AI script then replay; incomplete turn restarts from pre-AI snapshot.</p>' +
    '<h5>End scores</h5>' +
    '<p>Own performance, global stability, legacy, project consistency, risk (detections). Evaluation board, not a victory screen.</p>'
};

en.about =
  '<h4>Mission</h4>' +
  '<p><b>Global Impact (Küresel Etki)</b> is not a classic win/lose game. After a major global disaster you govern with <b>economic instruments only</b>. Every rate hike, sanction, stockpile decision or multi-year project reshapes partners, commodities, diplomacy and the order 15 years later. Goal: live the question <i>“When I change this tool, what really happens in the world?”</i></p>' +
  '<h4>Core rules</h4><ul>' +
  '<li><b>Turn = 3 months.</b> Game lasts 60 turns (≈15 years).</li>' +
  '<li><b>4 slots:</b> At most 4 instrument changes per turn. Sustaining is free. Use <b>Reset</b> to clear pending changes before confirm.</li>' +
  '<li><b>Political capital:</b> Interventions cost capital; approval regenerates it. Confirm is blocked if you cannot pay.</li>' +
  '<li><b>Escalating macro costs:</b> Policy rate, tax and public spending start cheap but +1 capital per confirmed use.</li>' +
  '<li><b>FX intervention:</b> Cost 3; overuse hurts capital regeneration and feeds delayed inflation.</li>' +
  '<li><b>17 countries:</b> EU is one entity; UK separate. AI reacts to your moves.</li>' +
  '<li><b>1 disaster:</b> Randomly on turns 2–4; severity differs by country.</li>' +
  '<li><b>Grey-zone risk:</b> Covert ops can be exposed → scandal + retaliation.</li></ul>' +
  '<h4>Interface map</h4><ul>' +
  '<li><b>Country strip:</b> Relation-coloured short names; click → world map.</li>' +
  '<li><b>Left / Status:</b> Indicators, groups, active policies.</li>' +
  '<li><b>Center / Charts:</b> Time series.</li>' +
  '<li><b>Right / Events:</b> mIRC-style feed.</li>' +
  '<li><b>Bottom / Instruments:</b> 4 layers (paged on desktop).</li>' +
  '<li><b>Language:</b> TR/EN inside the Win95 window (menu status bar / game bar).</li>' +
  '<li><b>❓ Help:</b> Advisory Board + encyclopedia.</li></ul>' +
  '<h4>Strategy tips</h4><ul>' +
  '<li>In crisis: macro first (rates, stockpiles, reserves); structural projects in calmer periods.</li>' +
  '<li>Sanctions invite retaliation; swaps/aid build relations.</li>' +
  '<li>Watch 1–3 year chart ranges — effects lag.</li>' +
  '<li>Four bad slots can amplify a disaster.</li></ul>';

emit('tr', tr);
emit('en', en);
console.log('OK');
