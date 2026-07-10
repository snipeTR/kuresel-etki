/**
 * Sync help/about from js/ui/help.js (TR baseline) + EN strings below into lang packs.
 * Usage: node tools/sync-help-i18n.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '../..');

function loadHelpJs() {
  let code = fs.readFileSync(path.join(root, 'js/ui/help.js'), 'utf8');
  code = code.replace(/\/\*[\s\S]*?\*\//g, '');
  const sandbox = { window: {}, console };
  sandbox.window.GAME = {};
  // help.js uses bare GAME after window.GAME =
  sandbox.GAME = sandbox.window.GAME;
  vm.createContext(sandbox);
  vm.runInContext(code + '\n;this.GAME=window.GAME;', sandbox);
  // re-bind: scripts may reassign window.GAME
  const G = sandbox.window.GAME || sandbox.GAME;
  return G;
}

const EN_HELP = {
  instruments:
    '<h4>Instruments — Full Guide</h4>' +
    '<p>Each instrument is a <b>state economic tool</b>. Changing one spends <b>1 intervention slot</b> + <b>political capital</b>. ' +
    'Leaving a policy open costs no slot. Effects: <b>pulse</b> (at change), <b>sustain</b> (each quarter while active), ' +
    '<b>complete/perm</b> (permanent base shift when a project finishes).</p>' +
    '<h5>Types</h5><ul>' +
    '<li><b>Toggle:</b> On/off. Sanctions, projects, grey-zone. Targeted tools need a country when opened.</li>' +
    '<li><b>Slider (0–100):</b> Intensity; 0 = off. Sustain scales with level.</li>' +
    '<li><b>Numerical:</b> Policy rate, tax, spending, FX (bn$), QE. Sustain is relative to the country’s neutral baseline.</li></ul>' +
    '<h5>Layer 1 — Structural</h5>' +
    '<p>5–9 year projects advance without slots; completion leaves <b>legacy</b>. Prefer calm periods; in crisis use macro first.</p>' +
    '<h5>Layer 2 — Cyclical + macro</h5><ul>' +
    '<li><b>Policy rate, tax, public spending:</b> base political-capital cost <b>2</b>; each <b>confirmed</b> use adds <b>+1</b>.</li>' +
    '<li><b>FX intervention:</b> cost <b>3</b>; burns reserves. Every <b>4</b> confirmed uses: capital regen −1, −2…; mild inflation after ~4-quarter delay.</li>' +
    '<li><b>QE / shadow FX, sanctions family, stocks, tariffs, swaps/aid, price controls:</b> as in the tooltips.</li></ul>' +
    '<h5>Layers 3–4</h5>' +
    '<p>Market ops and grey zone often carry <b>detection risk</b>. Exposure damages relations, scores and approval.</p>' +
    '<h5>4 slots</h5>' +
    '<p>At most 4 instrument changes per turn. <b>Reset</b> (next to Event Log) clears pending before confirm. ' +
    'Confirm is <b>blocked</b> if political capital is insufficient.</p>' +
    '<h5>Political capital</h5>' +
    '<p>Spent on interventions; regenerates with approval. Tooltips show live cost including escalate / FX notes. AI also spends capital.</p>',

  countries:
    '<h4>Countries — 17 Powers</h4>' +
    '<p><b>17</b> playable powers. EU is one entity; UK is separate. Each has indicators, personality, trade links, deps and domestic groups.</p>' +
    '<p><b>Flags:</b> Selection UI uses Win95-framed PNG flags (emoji flags break into letter pairs on Windows).</p>' +
    '<h5>Indicators</h5><ul>' +
    '<li><b>Growth / inflation / unemployment / reserves / debt / currency / trade / influence</b> — see in-game labels.</li></ul>' +
    '<h5>AI personality</h5>' +
    '<p>aggression, diplomacy, opportunism, patience drive retaliation, aid, grey-zone and projects. EU is type <code>birlik</code>.</p>' +
    '<h5>Deps</h5>' +
    '<p>Sensitivity to oil/food/chips/shipping/dollar. Negative dep = exporter gains when that price rises. Food/energy weapons need net exporters.</p>' +
    '<h5>Relations</h5>' +
    '<p>−200…+200. Sanctions hurt; aid/swaps help. Header chip colours show relation to you.</p>',

  charts:
    '<h4>Charts — How to read them</h4>' +
    '<p>Centre panel time series: ask “I raised rates — when did inflation move?”</p>' +
    '<h5>Chips & tips</h5>' +
    '<p><b>Desktop:</b> hover a chip for short up/down tips. <b>Mobile:</b> first tap selects, second tap on the same chip opens the tip.</p>' +
    '<h5>Time ranges</h5>' +
    '<p>1y for shocks; 3–5y for medium policy; 10y/all for project completion steps.</p>' +
    '<h5>Engine</h5>' +
    '<p>Each turn blends mean reversion, pulses, sustains, global commodities, trade spillovers and domestic politics. Watch 2–8 turns after a move.</p>',

  topics:
    '<h4>Topics &amp; system</h4>' +
    '<h5>Goal</h5><p>No classic win. Feel cascading effects over 60 turns (≈15 years), 1 turn = 1 quarter.</p>' +
    '<h5>Turn flow (v2)</h5>' +
    '<ol><li>Up to 4 pending changes (<b>Reset</b> can clear them).</li>' +
    '<li>Confirm → summary; blocked if capital insufficient.</li>' +
    '<li>AI is planned then replayed at <b>chat speed</b> (slow 0.5–2s / fast 0.2s per country).</li>' +
    '<li>Simulation tick, news, save. One disaster on turns 2–4.</li></ol>' +
    '<p>If you refresh mid-turn, replay restarts from the pre-AI snapshot.</p>' +
    '<h5>Feed &amp; glossary</h5>' +
    '<p>Starred (*) terms: desktop hover grey popover; line click = plain summary. Desktop cursor tip on lines; <b>no white line tip on mobile</b>. “Don’t show again” is permanent (reset in Settings).</p>' +
    '<h5>Settings</h5>' +
    '<ul><li>Language &amp; volume (mute / 40% / 100%).</li>' +
    '<li>Chat speed slow/fast.</li>' +
    '<li>Advanced settings (desktop spreadsheet of constants).</li></ul>' +
    '<h5>Saves</h5>' +
    '<p>Keys end with <code>_oyungrok</code> so they never collide with older <code>/oyun/</code> builds.</p>' +
    '<h5>End scores</h5>' +
    '<p>Performance, global stability, legacy, project consistency, risk — 0–100 panels, not a win condition.</p>'
};

const EN_ABOUT =
  '<h4>Mission</h4>' +
  '<p><b>Global Impact (Küresel Etki)</b> is not a classic win/lose game. After a major global disaster you govern with ' +
  '<b>economic instruments only</b>. Every rate hike, sanction, stockpile decision or multi-year project reshapes partners, ' +
  'commodities, diplomacy and the order 15 years later. Goal: live the question <i>“When I change this tool, what really happens in the world?”</i></p>' +
  '<h4>Core rules</h4><ul>' +
  '<li><b>Turn = 3 months.</b> 60 turns ≈ 15 years.</li>' +
  '<li><b>4 slots</b> of changes per turn; sustaining is free. <b>Reset</b> clears pending before confirm.</li>' +
  '<li><b>Political capital:</b> interventions cost capital; approval regenerates it. Confirm is blocked if you cannot pay.</li>' +
  '<li><b>Escalating macro costs:</b> policy rate, tax and spending start at 2 and +1 per confirmed use. FX intervention costs 3; overuse cuts regen and feeds delayed inflation.</li>' +
  '<li><b>17 countries:</b> EU single entity, UK separate; PNG flags in the picker. AI reacts.</li>' +
  '<li><b>1 disaster</b> on turns 2–4.</li>' +
  '<li><b>Grey-zone risk:</b> exposure → scandal + retaliation.</li></ul>' +
  '<h4>Interface map</h4><ul>' +
  '<li><b>Main menu Settings:</b> language, volume, chat speed, advanced constants (desktop).</li>' +
  '<li><b>Header chips:</b> flag + short name, relation colour → map.</li>' +
  '<li><b>Left:</b> indicators &amp; policies. <b>Centre:</b> charts with chip tips. <b>Right:</b> event feed + * glossary.</li>' +
  '<li><b>Bottom:</b> four instrument layers (paged on desktop).</li>' +
  '<li><b>? Help:</b> advisory board + encyclopaedia topics.</li></ul>' +
  '<h4>Strategy tips</h4><ul>' +
  '<li>Crisis: macro first; calm periods: structural projects.</li>' +
  '<li>Sanctions invite retaliation; aid/swaps buy relations.</li>' +
  '<li>Watch 1–3 year chart windows — effects lag.</li>' +
  '<li>Repeating rate/tax/spending burns capital via escalation.</li></ul>' +
  '<p style="margin-top:12px;color:#505050">Use the topic buttons below for deeper pages on instruments, countries, charts and system rules.</p>';

function replaceRegister(packSrc, key, value) {
  const startToken = 'R("' + key + '",';
  const i = packSrc.indexOf(startToken);
  if (i < 0) throw new Error('missing ' + key);
  let j = i + startToken.length;
  // skip whitespace
  while (/\s/.test(packSrc[j])) j++;
  const open = packSrc[j];
  let end;
  if (open === '{') {
    let depth = 0;
    for (let k = j; k < packSrc.length; k++) {
      const c = packSrc[k];
      if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) {
          end = k + 1;
          break;
        }
      } else if (c === '"') {
        k++;
        while (k < packSrc.length) {
          if (packSrc[k] === '\\') { k += 2; continue; }
          if (packSrc[k] === '"') break;
          k++;
        }
      }
    }
  } else if (open === '"') {
    let k = j + 1;
    while (k < packSrc.length) {
      if (packSrc[k] === '\\') { k += 2; continue; }
      if (packSrc[k] === '"') { end = k + 1; break; }
      k++;
    }
  } else throw new Error('bad open for ' + key);
  if (!end) throw new Error('unclosed ' + key);
  const json = JSON.stringify(value);
  return packSrc.slice(0, j) + json + packSrc.slice(end);
}

const G = loadHelpJs();
const trHelp = G.HELP_TOPICS;
const trAbout = G.ABOUT_MAIN_HTML;

let trPack = fs.readFileSync(path.join(root, 'lang/tr/pack.js'), 'utf8');
trPack = replaceRegister(trPack, 'help', trHelp);
trPack = replaceRegister(trPack, 'about', trAbout);
fs.writeFileSync(path.join(root, 'lang/tr/pack.js'), trPack);
console.log('TR help+about synced from help.js');

let enPack = fs.readFileSync(path.join(root, 'lang/en/pack.js'), 'utf8');
enPack = replaceRegister(enPack, 'help', EN_HELP);
enPack = replaceRegister(enPack, 'about', EN_ABOUT);
fs.writeFileSync(path.join(root, 'lang/en/pack.js'), enPack);
console.log('EN help+about synced');

// quick size check
console.log('TR instruments help chars', trHelp.instruments.length);
console.log('EN instruments help chars', EN_HELP.instruments.length);
console.log('OK');
