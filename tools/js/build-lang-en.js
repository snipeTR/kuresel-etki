/* Generate lang/en/pack.js and patch extra ui keys into lang/tr/pack.js */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '../..');

const tr = {};
const sb = { window: {}, GAME: { i18n: { register(l, s, d) { tr[s] = d; } } } };
sb.window.GAME = sb.GAME;
vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(root, 'lang/tr/pack.js'), 'utf8'), sb);

function emit(lang, sections) {
  let out = '/* Language pack: ' + lang + ' */\nwindow.GAME = window.GAME || {};\n(function () {\n';
  out += "  var R = function (s, d) { GAME.i18n.register('" + lang + "', s, d); };\n";
  for (const [sec, data] of Object.entries(sections)) {
    out += '  R(' + JSON.stringify(sec) + ', ' + JSON.stringify(data) + ');\n';
  }
  out += '})();\n';
  const dir = path.join(root, 'lang', lang);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'pack.js'), out);
  console.log('wrote', lang, out.length);
}

const ui = {
  doc_title: 'Global Impact — Economic Statecraft Simulation',
  game_title: 'GLOBAL IMPACT',
  game_subtitle: 'When you change one economic instrument, what really changes in the world?',
  new_game: 'New Game',
  continue: 'Continue',
  how_to_play: 'How to Play?',
  menu_note: 'Parallel universe, 2026. The world economy looks stable… but experts say the global system is extremely fragile.',
  menu_mission: 'Mission: understand cascading effects of economic instruments. Not winning — seeing each decision leave a mark on the world.',
  about_title: 'How to Play?',
  back: 'Back',
  pick_country: 'Choose Your Country',
  pick_country_sub: 'Know your country before the disaster hits. Each has different strengths and weaknesses.',
  disaster_alert: '⚠ GLOBAL CRISIS HAS BEGUN ⚠',
  continue_btn: 'Continue',
  help: '❓ Help',
  help_title: 'Advisory Board: which instrument should I use?',
  music_title_40: 'Volume: 40% — click: 100%',
  music_title_100: 'Volume: 100% — click: mute',
  music_title_0: 'Volume: muted — click: 40%',
  polcap: 'Political Capital',
  slots: 'Interventions: {used}/{max}',
  slots_short: 'Acts {used}/{max}',
  slots_html: 'Interventions: <b>{used}/{max}</b>',
  log: 'Event Log',
  log_short: 'Log',
  commit: 'Confirm & Advance ▶',
  commit_short: 'Advance ▶',
  commit_busy: 'Turn...',
  econ_indicators: 'Economic Indicators',
  internal_stability: 'Internal Stability',
  active_policies: 'Active Policies',
  feed_title: '#world-events',
  feed_reopen: '◀ #world-events',
  feed_collapse: 'Collapse panel',
  tab_status: '📊 Status',
  tab_chart: '📈 Charts',
  tab_feed: '💬 Events',
  tab_map: '🗺 Map',
  tab_instr: '⚙ Instruments',
  nav_status: 'Status',
  nav_chart: 'Charts',
  nav_feed: 'Events',
  nav_map: 'Map',
  nav_instr: 'Instruments',
  prev_tab: 'Previous tab',
  next_tab: 'Next tab',
  map_hint: 'Tap a country to open the world map. Drag / pinch zoom work in the desktop map modal.',
  open_world_map: 'Open World Map',
  end_title: 'GAME OVER — YOUR LEGACY',
  end_log: 'Review Event Log',
  end_menu: 'Return to Main Menu',
  viewport_title: 'C:\\GAME\\SCREEN.SYS',
  viewport_h2: 'Screen too small',
  viewport_p: 'This device or window size cannot display the game properly.',
  viewport_li1: 'Make the window larger',
  viewport_li2: 'Hold the phone upright and refresh (mobile UI)',
  viewport_li3: 'Better experience: tablet landscape or desktop',
  viewport_min: 'Minimum ~320×480 · Portrait mobile supported',
  lang_label: 'Language',
  difficulty: 'Difficulty: {d}',
  confirm_new: 'Saved game will be deleted. Start a new game?',
  turn_confirm_title: '▶ Confirm Turn — {date}',
  turn_confirm_none: 'No instrument changes this turn. Advance anyway?',
  turn_confirm_list: 'These changes will apply this turn:',
  turn_confirm_polcap: 'Political capital will be spent. Current: <b>{pc}</b>',
  turn_confirm_sure: 'Are you sure you want to advance the turn with these interventions?',
  turn_confirm_note: 'After confirmation, decisions apply, other countries react, and the simulation runs. Cannot be undone.',
  yes_advance: 'Yes, advance',
  cancel: 'Cancel',
  open: 'ON',
  close: 'OFF',
  level: 'Level {v}',
  apply: 'Apply',
  on: 'On',
  off: 'Off',
  target: 'Target',
  no_policies: 'No special active policies',
  page: 'Page {cur}/{total}',
  range_1y: '1 Year',
  range_3y: '3 Years',
  range_5y: '5 Years',
  range_10y: '10 Years',
  range_all: 'All',
  global_source: '🌍 Global',
  crisis_source: 'GLOBAL CRISIS',
  advisory: '⚠ Advisory Board',
  relation_pts: 'Relation: {v} pts',
  effect_collapsed: 'Relations collapsed; retaliation begins',
  intelligence: 'intelligence',
  intl_press: 'international press',
  log_title: 'Event Log',
  close_modal: 'Close',
  score_perf: 'Own Country Performance',
  score_global: 'Global Stability Contribution',
  score_legacy: 'Legacy Power',
  score_consistency: 'Strategic Consistency (Projects: {done}/{started} completed)',
  score_risk: 'Risk Management (Detected ops: {n})',
  legacy_none: 'No permanent legacy recorded.',
  legacy_none_long: 'You created no permanent structural change. The world drifts back toward its pre-disaster order…',
  lived_disaster: 'Disaster survived: ',
  country_you: '(you)',
  relation_short: 'Relation: {v}',
  map_show: 'show on map',
  feed_status_acting: '*** {flag} {name} is acting…',
  project_years: 'Project finishes in ~{y} years and leaves a PERMANENT legacy',
  political_cap_cost: 'Political capital: {n}',
  risk_label: 'Detection risk: {n}',
  gov_label: 'Government: {g}',
  no_pending: 'No pending changes',
  pending_title: 'Pending changes',
  pending_none_html: 'No <b>instrument changes</b> selected this turn. The turn will advance with current policies.',
  pending_waiting: 'intervention(s) awaiting confirmation:',
  total_polcap_cost: 'Total political capital cost: <b>🏛 {cap}</b> · Current: <b>{pc}</b>',
  slots_left: 'Slots left: {n}',
  filter_all: 'All',
  approval: 'Public Approval',
  stability: 'Stability',
  pol_cap_lbl: 'Political Capital',
  none: '—',
  topic_instruments: '📚 Instruments',
  topic_countries: '🌍 Countries',
  topic_charts: '📈 Charts',
  topic_system: '📖 Topics & System',
  no_content: 'No content.',
  stat_growth: 'Growth',
  stat_inflation: 'Inflation',
  stat_reserves: 'Reserves',
  stat_debt: 'Debt',
  end_h_legacy: '🏛 Your Legacy (Permanent Structural Shifts)',
  end_h_world: '🌍 Marks Left by Others',
  end_h_scores: '📊 Performance Assessment',
  end_h_reflect: '💭 Personal Reflection',
  end_reflect_html: '· Which intervention do you regret most?<br>· Which decision are you proudest of?<br>· What would have been the best strategy against this disaster?<br>· If you had chosen differently, how would the world look today?',
  end_total_acts: 'You made {n} interventions in total. The world now carries your mark too.'
};

const instruments = {
  policy_rate: { name: 'Central Bank Policy Rate', desc: 'Main monetary policy tool. Higher rates curb inflation and support the currency but slow growth and raise unemployment pressure.' },
  tax_rate: { name: 'Tax Rate', desc: 'Overall tax burden. Higher taxes ease the budget/debt but squeeze growth, investment and public support.' },
  public_spending: { name: 'Public Spending / Borrowing', desc: 'Public investment and spending level. Boosts growth but produces debt and inflation.' },
  fx_intervention: { name: 'FX Intervention', desc: 'Defend the currency by selling reserves. While open, reserves erode each quarter as the exchange rate is supported.' },
  qe: { name: 'Quantitative Easing (QE / Balance Sheet)', desc: 'Central bank asset purchases inject liquidity. Supports growth and asset prices; risks inflation and currency weakness.' },
  reserve_currency: { name: 'Building Reserve Currency Status', desc: 'Force energy and commodity trade in your currency. An 8-year mega-project.' },
  alt_finance: { name: 'Alternative Financial Rails (SWIFT Rival)', desc: 'Build a sanctions-resilient payment system and spread it.' },
  capital_markets: { name: 'Deep Capital Markets', desc: 'Make bond and equity markets a safe harbor for global investors.' },
  cbdc: { name: 'CBDC De-dollarization', desc: 'Cross-border digital currency to reduce dollar dependence.' },
  infra_corridor: { name: 'Infrastructure Belt & Transport Corridors', desc: 'Long-run logistics and connectivity mega-project.' },
  brain_gain: { name: 'Brain Gain Program', desc: 'Attract skilled talent with visas, labs and incentives.' },
  migration_weapon: { name: 'Migration Weapon', desc: 'Use migration pressure as geopolitical leverage (high risk).' },
  eez_expansion: { name: 'Strategic EEZ Expansion', desc: 'Expand maritime resource claims and control.' },
  space_deepsea: { name: 'Space & Deep-Sea Resources', desc: 'Long-horizon resource and prestige project.' },
  tech_standards: { name: 'Dictate Technology Standards', desc: 'Set the rules others must follow in tech markets.' },
  ip_regime: { name: 'Comprehensive IP Regime', desc: 'Export your intellectual property rules and enforcement.' },
  edu_export: { name: 'Education & Language Export', desc: 'Soft power through universities and language programs.' },
  brussels_effect: { name: 'Legal Export (Brussels Effect)', desc: 'Force global firms to adopt your regulations.' },
  rd_policy: { name: 'Strategic R&D & Industrial Policy', desc: 'Long-run productivity and tech capacity.' },
  chokepoint: { name: 'Supply-Chain Weaponization', desc: 'Restrict critical inputs to coerce targets.' },
  subsidy: { name: 'Subsidy Wars', desc: 'Industrial subsidies for competitiveness and jobs.' },
  anti_dumping: { name: 'Anti-Dumping & Countervailing Duties', desc: 'Trade defense tariffs against targeted exporters.' },
  strategic_stock: { name: 'Strategic Stockpile Management', desc: 'Food/energy buffers against shocks and unrest.' },
  capital_controls: { name: 'Macroprudential Capital Controls', desc: 'Limit hot money flows; protect reserves and FX.' },
  shadow_fx: { name: 'Shadow FX Intervention', desc: 'Covert currency defense (detection risk).' },
  debt_trap: { name: 'Debt-Trap Diplomacy', desc: 'Lending that creates political leverage over targets.' },
  secondary_sanctions: { name: 'Secondary Sanctions', desc: 'Punish third parties that deal with your target.' },
  asset_freeze: { name: 'Asset Freeze & Seizure', desc: 'Freeze target reserves and private assets.' },
  service_ban: { name: 'Technical Service Ban', desc: 'Deny maintenance/tech services to the target.' },
  food_weapon: { name: 'Food & Seed Weapon', desc: 'Restrict food exports to pressure importers (exporters only).' },
  energy_weapon: { name: 'Energy Export Squeeze', desc: 'Restrict oil/gas exports as geopolitical pressure.' },
  tariff: { name: 'General Customs Tariff', desc: "Broad tariffs on a target's goods." },
  export_credit: { name: 'Export Credit & Exim Support', desc: 'Finance foreign buyers of your exports.' },
  currency_swap: { name: 'Bilateral Currency Swap Line', desc: 'Liquidity line that supports allies and influence.' },
  price_controls: { name: 'Price Controls', desc: 'Short-run inflation relief; medium-run shortages risk.' },
  aid_diplomacy: { name: 'Development Aid Diplomacy', desc: 'Soft power via aid packages.' },
  espionage: { name: 'Economic Espionage', desc: 'Steal competitive intelligence (detection risk).' },
  insider_trading: { name: 'State-Linked Insider Trading', desc: 'Market abuse via privileged information (high risk).' },
  rating_pressure: { name: 'Rating & Index Pressure', desc: 'Push credit ratings and index inclusion against targets.' },
  national_champion: { name: 'National Champions (Cartel Encouragement)', desc: 'Scale domestic giants for global competition.' },
  patent_revoke: { name: 'License & Patent Revocation', desc: 'Strip IP rights from targets.' },
  cert_weapon: { name: 'Certification Weaponization', desc: 'Block market access via standards and certificates.' },
  jawboning: { name: 'Market Jawboning', desc: 'Cheap talk to manage FX and risk sentiment.' },
  disinfo: { name: 'Disinformation & Black Propaganda', desc: 'Information ops against targets (high risk).' },
  ngo_use: { name: 'Using Non-State Actors (NGOs)', desc: 'Proxy influence campaigns (grey-zone risk).' },
  corruption_net: { name: 'Corruption & Influence Peddling', desc: 'Buy elites abroad (very high risk).' },
  insurgency_finance: { name: 'Financing Insurgency', desc: 'Fund unrest in target states (extreme risk).' },
  lawfare: { name: 'International Lawfare', desc: 'Endless legal harassment via courts and treaties.' }
};

const countries = {
  USA: { name: 'USA', difficulty: 'Hard', style: 'Interventions with global reach', desc: 'Hegemony and reserve-currency advantage. Ideal for high-impact moves; expectations and responsibility are huge.' },
  CHN: { name: 'China', difficulty: 'Medium-Hard', style: 'Structural projects + supply chains', desc: 'High state control, long planning horizon. Strong for structural projects and supply-chain weaponization.' },
  EU: { name: 'European Union', difficulty: 'Medium', style: 'Regulation + exports + diplomacy', desc: '27-member economic giant. Brussels effect and export power are high; energy and geopolitics move slowly.' },
  JPN: { name: 'Japan', difficulty: 'Medium', style: 'Tech standards + finance', desc: 'Tech and finance strength; aging population and huge public debt.' },
  IND: { name: 'India', difficulty: 'Medium', style: 'Long-run structural reform', desc: 'Fast-rising domestic market. Infrastructure and energy gaps are weaknesses; demographics are a long-run plus.' },
  GBR: { name: 'United Kingdom', difficulty: 'Medium', style: 'Finance + diplomacy + soft power', desc: 'Financial hub and soft power. Post-Brexit competition with the EU.' },
  RUS: { name: 'Russia', difficulty: 'Medium', style: 'Energy leverage + grey zone', desc: 'Energy exporter with grey-zone toolkit; sanctions exposure is high.' },
  CAN: { name: 'Canada', difficulty: 'Easy', style: 'Commodities + alliance network', desc: 'Stable institutions, commodities, deep US ties.' },
  BRA: { name: 'Brazil', difficulty: 'Medium', style: 'Food & commodity power', desc: 'Agricultural and commodity leverage with regional influence.' },
  KOR: { name: 'South Korea', difficulty: 'Medium', style: 'Chips & export manufacturing', desc: 'High-tech exporter under geopolitical pressure.' },
  AUS: { name: 'Australia', difficulty: 'Easy', style: 'Mining/LNG + alliances', desc: 'Resource exporter tied to Asian demand and US alliances.' },
  MEX: { name: 'Mexico', difficulty: 'Medium', style: 'Nearshoring + US trade', desc: 'Deep US trade integration; nearshoring opportunities.' },
  IDN: { name: 'Indonesia', difficulty: 'Medium', style: 'Critical minerals + demography', desc: 'Rising Asia player with minerals and a young population.' },
  SAU: { name: 'Saudi Arabia', difficulty: 'Medium', style: 'Energy superpower', desc: 'Oil leverage and sovereign wealth; strategic diversification projects.' },
  TUR: { name: 'Türkiye', difficulty: 'Medium-Hard', style: 'Corridor geopolitics + opportunism', desc: 'Bridge country with inflation sensitivity and opportunistic diplomacy.' },
  CHE: { name: 'Switzerland', difficulty: 'Easy', style: 'Finance haven + neutrality', desc: 'Financial shelter and high institutional trust.' },
  ZAF: { name: 'South Africa', difficulty: 'Medium', style: 'Mining + BRICS', desc: 'Minerals and regional role; unemployment and stability risks.' }
};

const impactTpl = (a, b, c) => [
  '<b>Short term:</b> ' + a,
  '<b>Medium term:</b> ' + b,
  '<b>Long term:</b> ' + c
];
const disasters = {
  volcano: {
    name: 'Supervolcano Eruption',
    desc: 'A massive volcanic eruption choked the atmosphere with ash. 60–70% of global air traffic is down; agricultural prices are soaring.',
    impacts: impactTpl('Air traffic halted; farm prices surge.', 'Supply chains regionalize; tourism collapses.', 'Global logistics architecture will change permanently.')
  },
  suez: {
    name: 'Prolonged Suez Canal Blockage',
    desc: 'Chain accidents closed the Suez Canal for years. Europe–Asia trade is ~40% disrupted; freight rates are 3–4× higher.',
    impacts: impactTpl('Europe–Asia trade down 35–45%; shipping much costlier.', 'Alternative routes accelerate.', 'Trade routes will diversify permanently.')
  },
  megahurricane: {
    name: 'Mega-Hurricane Series Hits the US',
    desc: 'Back-to-back Category 5 storms devastated the US East Coast and Gulf. The US economy is in freefall; insurers are collapsing.',
    impacts: impactTpl('US GDP could fall hard over two years.', 'Dollar hegemony weakens; politics polarize.', 'US leadership will be questioned.')
  },
  china_quake: {
    name: 'Major Quake in China Tech Hub',
    desc: 'An 8.4 quake on the Shenzhen–Guangdong belt halted 35–40% of world semiconductor and battery output.',
    impacts: impactTpl('Chip/battery output shocked.', 'China+1 diversification forced.', 'Tech supply chains rebuilt permanently.')
  },
  tsunami: {
    name: 'Giga Tsunami (Taiwan + East Asia)',
    desc: 'A huge undersea collapse hit Taiwan, southern Japan and China coasts. A global chip crisis has erupted.',
    impacts: impactTpl('East Asian coasts damaged; chip crisis.', 'Infrastructure rebuilt.', 'New production hubs rise.')
  },
  summit_attack: {
    name: 'Terror Attack at Major Leaders Summit',
    desc: 'An attack on a G20 summit killed major leaders. A global leadership vacuum and panic wave follow.',
    impacts: impactTpl('Leadership vacuum and market panic.', 'Alliances reshape.', 'Multipolar order settles faster.')
  },
  oil_depletion: {
    name: 'Sudden Strategic Oil Depletion Shock',
    desc: 'A cascade of production failures and geopolitics creates a structural oil shortage.',
    impacts: impactTpl('Energy rationing talk spreads.', 'Nuclear and renewables surge.', 'Transport and food inflation hit households.')
  },
  supernova: {
    name: 'Geomagnetic Superstorm (Solar)',
    desc: 'A severe solar storm cripples grids, satellites and digital payments worldwide.',
    impacts: impactTpl('Grid repairs slow; blackouts continue.', 'Analog backups in demand.', 'Satellite/internet backbone recovers gradually.')
  },
  food_crisis: {
    name: 'Compound Global Food Crisis',
    desc: 'Simultaneous crop failures and export bans trigger a worldwide food emergency.',
    impacts: impactTpl('Grain export bans cascade.', 'Food queues in capitals.', 'Fertilizer/seed shortages threaten next season.')
  },
  brics_currency: {
    name: 'BRICS Reserve Currency Shock',
    desc: 'A new multipolar reserve unit shakes dollar dominance and capital markets.',
    impacts: impactTpl('Reserve mixes shift quietly.', 'Energy deals in the new unit.', 'Multipolar finance goes mainstream.')
  }
};

const layers = {
  1: { name: 'Structural Strategy', short: 'Structural' },
  2: { name: 'Cyclical Intervention', short: 'Cyclical' },
  3: { name: 'Market Operations', short: 'Market Ops' },
  4: { name: 'Grey-Zone Tactics', short: 'Grey Zone' }
};
const groups = {
  business: { name: 'Capital / Business', concerns: 'Profitability, stability, low inflation' },
  labor: { name: 'Labor / Unions', concerns: 'Job security, wages, social rights' },
  nationalist: { name: 'Nationalists', concerns: 'Sovereignty, security, strong state' },
  liberal: { name: 'Liberals / Urban', concerns: 'Freedom, openness, rule of law' },
  rural: { name: 'Rural / Agriculture', concerns: 'Food prices, farm support' },
  bureau: { name: 'State Bureaucracy', concerns: 'Stability, pay, status' }
};
const globals = {
  oil: { name: 'Oil Price' }, food: { name: 'Food Prices' }, chip: { name: 'Chips / Tech' },
  dollar: { name: 'Dollar Index' }, ship: { name: 'Freight / Logistics' }, trade: { name: 'Global Trade' }
};
const indMeta = {
  growth: { name: 'GDP Growth' }, inflation: { name: 'Inflation' }, unemployment: { name: 'Unemployment' },
  reserves: { name: 'FX Reserves' }, debt: { name: 'Public Debt' }, currency: { name: 'Currency' },
  trade: { name: 'Trade Balance' }, influence: { name: 'Global Influence' },
  approval: { name: 'Public Approval' }, stability: { name: 'Stability' }
};
const toneMeta = {
  1: { name: 'Friendly Positive', cls: 't1' },
  2: { name: 'Positive', cls: 't2' },
  3: { name: 'Neutral', cls: 't3' },
  4: { name: 'Negative', cls: 't4' },
  5: { name: 'Hostile', cls: 't5' }
};
const newsCats = {
  eko: 'Economic News', diplo: 'Diplomatic Messages', global: 'Global Effects',
  ic: 'Domestic Events', gri: 'Espionage / Grey Zone', benim: 'Affecting Me'
};
const chartSeries = {
  growth: 'GDP Growth', inflation: 'Inflation', currency: 'Currency', trade: 'Trade Balance',
  debt: 'Public Debt', reserves: 'Reserves', stability: 'Stability', influence: 'Global Influence',
  'g:oil': 'Oil (Global)', 'g:food': 'Food (Global)', 'g:dollar': 'Dollar Index'
};

const diplo = {
  1: [
    "\"We welcome {actor}'s step with understanding and satisfaction. Ready to coordinate.\"",
    "\"We support this bold decision. We will deepen cooperation with {actor}.\"",
    "\"{actor}'s move serves our common interests. We stand with them.\"",
    '"We appreciate this policy contributing to a shared future."',
    "\"Channels with {actor} are more open than ever. This step is promising.\"",
    '"A move for regional stability; we can advance hand in hand."',
    '"Our trade and investment partnership will strengthen with this decision."',
    '"A sincere gesture. We are ready to proceed on mutual benefit."'
  ],
  2: [
    "\"We have noted this decision. Open to cooperation opportunities with {actor}.\"",
    "\"We view {actor}'s step positively.\"",
    '"A constructive step. We will follow developments with interest."',
    '"First impression is positive; we would like to work on details together."',
    '"We hope this direction proves sustainable."',
    '"Our joint committees can prioritize this file."',
    '"Markets read this signal positively; we are cautiously optimistic."',
    '"We are always open to technical dialogue."'
  ],
  3: [
    "\"We are assessing the situation. We are closely watching {actor}'s steps.\"",
    "\"We are analyzing the effects of {actor}'s decision.\"",
    '"No comment at this stage; we are monitoring developments."',
    '"Official positions require data and time."',
    '"Neither support nor opposition: observation mode."',
    '"We are reviewing the file in light of national interests."',
    '"We prefer a wait-and-see approach."',
    '"Diplomatic channels are open; we avoid hasty comments."'
  ],
  4: [
    "\"We receive this decision with concern. We invite {actor} to reconsider.\"",
    "\"{actor}'s step may harm bilateral relations. We will watch closely.\"",
    '"This policy is worrying for regional balances."',
    '"Reciprocity must not be forgotten; retaliation options are on the table."',
    '"We do not want our trade partners harmed; we expect a step back."',
    '"Directions contrary to international norms are unacceptable."',
    '"This step damages the climate of trust. We demand urgent consultations."',
    '"Markets are already pricing this in; political costs will rise."'
  ],
  5: [
    "\"{actor}'s hostile and unilateral step is unacceptable. We will take necessary retaliation.\"",
    "\"This is a clear economic attack. {actor} will pay the price.\"",
    "\"{actor} is playing with fire. Our response will be firm.\"",
    '"We are mobilizing all economic and diplomatic tools."',
    '"We regard this as an attack on our sovereignty."',
    "\"The international community will see {actor}'s irresponsibility.\"",
    '"Red lines have been crossed. Not dialogue — defense."',
    '"A retaliation package is being prepared; markets will get a clear message."'
  ]
};

const econTitle = {
  up: ['{name}: {meta} rose', '{name} — {meta} increase', '{name}: climb in {meta}', 'Data: {name} {meta} up', '{meta} pressure rises in {name}'],
  down: ['{name}: {meta} fell', '{name} — {meta} decline', '{name}: {meta} eased', 'Data: {name} {meta} down', '{meta} eases in {name}']
};
const econBody = {
  up: [
    '{meta} {prev}{unit} → {cur}{unit}. Analysts say near-term pressure may persist.',
    '{meta} rose from {prev}{unit} to {cur}{unit}. Markets are reacting.',
    'Last quarter {meta} was {prev}{unit}; now {cur}{unit}. Knock-on effects are watched.',
    'Rise in {meta} ({prev}{unit} → {cur}{unit}) is stressing households and firms.',
    'Official data show {meta} at {prev}{unit} → {cur}{unit}.'
  ],
  down: [
    '{meta} {prev}{unit} → {cur}{unit}. Is it easing — or temporary?',
    '{meta} fell from {prev}{unit} to {cur}{unit}.',
    'Last quarter {meta} was {prev}{unit}; now {cur}{unit}.',
    'Drop in {meta} ({prev}{unit} → {cur}{unit}) relieved policymakers.',
    'Official data show {meta} at {prev}{unit} → {cur}{unit}.'
  ]
};
const globalTitle = {
  up: ['{name} index rising', 'Global {name}: sharp rise', 'Tension in {name} markets', '{name} index near records', 'Jump in world {name} prices'],
  down: ['{name} index falling', 'Global {name}: pullback', 'Calm in {name} markets', '{name} index under pressure', 'Drop in world {name} prices']
};
const globalBody = [
  'Supply chains are being re-priced.',
  'Importers and exporters are affected asymmetrically.',
  'Central banks and ministries are briefing nonstop.',
  'Futures markets demand a volatility premium.',
  'Geopolitical risk premia are feeding into prices.'
];
const risk = {
  reserves: [
    { t: 'FX reserves at critical levels', b: 'Reserves fell to {v} billion dollars. Currency defense capacity is nearly exhausted.' },
    { t: 'Reserve melt alarm', b: 'Central bank reserves at {v} bn$. Speculative pressure may rise.' },
    { t: 'Liquidity shield thinning', b: 'Only {v} bn$ reserves left. The emergency window is closing.' }
  ],
  inflation: [
    { t: 'Inflation spinning out of control', b: 'Annual inflation at %{v}. Social backlash is growing.' },
    { t: 'Price stability broken', b: 'Inflation at %{v} — far above the policy target.' },
    { t: 'Hyper-risk zone', b: '%{v} inflation is eroding household purchasing power.' }
  ],
  stability: [
    { t: 'Stability flashing red', b: 'Stability score {v}. Large-scale unrest may be near.' },
    { t: 'Social tension rising', b: 'Stability {v}/100. Room to maneuver is shrinking.' },
    { t: 'Fragile balance', b: 'Stability indicator {v}. A small shock could cascade.' }
  ],
  debt: [
    { t: 'Debt at unsustainable levels', b: 'Public debt reached %{v} of GDP. Borrowing costs are rising fast.' },
    { t: 'Fiscal space exhausted', b: 'Debt/GDP %{v}. Markets demand a risk premium.' },
    { t: 'Debt dynamics broken', b: '%{v} debt load threatens the interest–growth balance.' }
  ],
  polCap: [
    { t: 'Political capital running out', b: "The government's room to maneuver is narrowing. New interventions need public support." },
    { t: 'Policy fatigue', b: 'Political capital low ({v}). Bold reforms have become expensive.' },
    { t: 'Street and parliament pressure', b: 'Capital score {v}. Every new step carries political cost.' }
  ]
};
const events = {
  grev: [
    { t: 'Strike wave begins', b: 'Unions halted production over wages and job security. Industrial output is slipping.' },
    { t: 'Walkouts at factories', b: 'Strikes spread in metal and logistics. Export orders are delayed.' },
    { t: 'Union action grows', b: 'General strike calls rise; government is pushed into mediation.' }
  ],
  protesto: [
    { t: 'Street protests', b: 'Groups reacting to economic conditions took to the streets.' },
    { t: 'Tension in squares', b: 'Price rises and unemployment turned into protests.' },
    { t: 'Civil society in the streets', b: 'Peaceful marches turned confrontational in some cities.' }
  ],
  buyuk_protesto: [
    { t: 'Major protest wave', b: 'Tens of thousands protest government economic policy. Events are growing.' },
    { t: 'Nationwide action day', b: 'Mass demonstrations in the capital and major cities. Transport paralyzed.' },
    { t: 'Resignation calls rise', b: 'Crowds demand the government resign; security forces on alert.' }
  ],
  secim_baskisi: [
    { t: 'Election pressure rising', b: "Falling approval shrinks the government's room. Opposition wants early elections." },
    { t: 'Ballot debate', b: 'Polls show the government behind; coalition talks are speculated.' },
    { t: 'Crisis in parliament', b: 'Confidence-vote rumors shadow economic policy.' }
  ],
  hukumet_degisti: [
    { t: 'GOVERNMENT CHANGED', b: 'Public anger hit the ballot; a new government formed. Policy uncertainty rose.' },
    { t: 'Power changed hands', b: 'New cabinet sworn in. Markets are in wait-and-see mode.' },
    { t: 'Transfer of power complete', b: 'Old team out; reform promises and uncertainty arrive together.' }
  ],
  otoriter_sikilasma: [
    { t: 'Authoritarian tightening', b: 'The regime answered instability with emergency powers. Streets are quiet but tense.' },
    { t: 'Emergency powers', b: 'Media and civic space narrowed; “stability” is the stated reason.' },
    { t: 'Martial-law signals', b: 'Security apparatus expanded; capital flight fears rise.' }
  ]
};
const projectDone = [
  'Long-term strategic project completed. Permanent structural effects are online.',
  'Project finished: legacy system updated. Rivals must reposition.',
  "Completed infrastructure/policy package may shift the country's global weight.",
  'Strategic goal reached. Markets price a “new normal”.'
];
const projectProg = [
  'Project is advancing as planned.',
  'Milestone passed; budget and schedule are closely watched.',
  'Field teams and bureaucracy are aligned; delay risk is low.',
  'International partners are monitoring the process carefully.'
];
const detectionTitles = [
  "EXPOSED: {an}'s secret operation uncovered",
  'SCANDAL: {an} caught in a covert economic operation',
  'Leak: {an} — "{ins}" file leaked',
  'International pressure: {an} grey-zone op exposed'
];
const detectionBodies = [
  '"{ins}" was documented by {by}. International reaction is large.',
  'Evidence was published by {by}. "{ins}" can no longer be denied.',
  '"{ins}" file leaked; {by} briefed. Retaliation signals are coming.',
  'Diplomatic crisis: "{ins}" exposed. Markets panic-buy.'
];
const disasterFlavor = {
  volcano: [
    'Ash clouds keep air corridors closed; cargo flights shift to sea routes.',
    'Crop losses deepen across farm belts.',
    'Insurance premiums tripled in disaster zones.',
    'Tourism revenues collapse while alternative destinations fill up.'
  ],
  suez: [
    'Africa-around routes strain port capacity.',
    'Interest in the Middle Corridor and Northern Route hits records.',
    'Container freight is multiples of pre-crisis levels.',
    'Europe–Asia supply contracts are being rewritten.'
  ],
  megahurricane: [
    'Insurers cannot meet claim volumes.',
    'Rebuilding costs strain the US budget.',
    'Energy infrastructure repairs will take months.',
    'Internal migration shocks housing and labor markets.'
  ],
  china_quake: [
    'Chip inventories melt; automakers halt lines.',
    '“China+1” dominates board agendas.',
    'Battery and semiconductor prices jumped hard.',
    'Emergency import licenses and stockpile drives began.'
  ],
  tsunami: [
    'East Asian ports reopen gradually.',
    'Chip price spikes cool electronics demand.',
    'Production shifts toward Southeast Asia.',
    'Insurance and logistics costs remain at crisis levels.'
  ],
  summit_attack: [
    'Leadership vacuum paralyzed global institutions.',
    'Markets swing hard on every statement.',
    'Alliance meetings are canceled or delayed en masse.',
    'Security spending hits budget ceilings.'
  ],
  oil_depletion: [
    'Energy rationing is on the agenda; industry prepares for outages.',
    'Nuclear and renewable applications break records.',
    'Petro-dollar debates dominate central bank meetings.',
    'Transport and food inflation pass the energy shock to households.'
  ],
  supernova: [
    'Grid repairs crawl; regional outages continue.',
    'Demand for analog backups exploded.',
    'Digital payment outages increased cash use.',
    'Satellite and internet backbone recover gradually.'
  ],
  food_crisis: [
    'Grain export bans create domino effects.',
    'Food queues are daily scenes in many capitals.',
    'Fertilizer and seed shortages threaten next season.',
    'Emergency food-aid diplomacy heated up.'
  ],
  brics_currency: [
    'Central banks quietly change reserve composition.',
    'First major energy deal priced in the new unit signed.',
    'Refinancing panic in dollar-debt countries.',
    'Multipolar finance architecture debate goes mainstream.'
  ]
};

const ai = {
  rate_hike: { title: '{name} raised the policy rate from %{from} to %{to}', body: 'The central bank tightened in response to rising inflation.', why: 'Inflation is %{infl} — {gap} points above baseline. Higher rates cool inflation and FX pressure.' },
  qe_slow: { title: '{name} slowed quantitative easing', body: 'Balance-sheet expansion was reined in due to inflation pressure.', why: 'QE feeds inflation. Tightening the liquidity tap is needed for price stability.' },
  price_cap: { title: '{name} imposed price caps on basics', body: 'Emergency price controls to contain public anger.', why: 'Inflation is high and stability fragile. Short-run relief; medium-run shortage risk.' },
  rate_cut: { title: '{name} cut interest rates', body: 'Monetary policy eased to support a weakening economy.', why: 'Inflation is under control but growth is weak. Lower rates cheapen credit.' },
  qe_start: { title: '{name} launched a QE program', body: 'The central bank injects liquidity via asset purchases.', why: 'When classic rate space is tight, QE supports growth.' },
  stimulus: { title: '{name} announced a stimulus package', body: 'Public spending is rising against a contracting economy.', why: 'Fiscal stimulus lifts demand; costs are debt and inflation.' },
  tax_cut: { title: '{name} cut taxes', body: 'Tax burden eased to revive the private sector.', why: 'Tax cuts support growth; fiscal balance gets harder.' },
  austerity: { title: '{name} switched to austerity', body: 'Public spending is cut under rising debt.', why: 'Spending cuts aim to brake debt dynamics.' },
  tax_hike: { title: '{name} raised taxes for fiscal consolidation', body: 'Revenues strengthened for debt sustainability.', why: 'Tax hikes slow debt but squeeze growth and approval.' },
  fx_defend: { title: '{name} intervened in FX markets', body: 'The central bank sells reserves to defend the currency.', why: 'FX pressure is being defended at a reserve cost.' },
  capital_ctrl: { title: '{name} tightened capital controls', body: 'New measures against hot-money outflows.', why: 'Capital flight threatens the currency and reserves.' },
  shadow_fx: { title: '{name} activated shadow FX operations', body: 'Covert intervention manages the exchange rate.', why: 'Covert channel instead of open reserve sales.' },
  jawbone: { title: '{name} reassured markets', body: 'High-level statements manage FX and risk perception.', why: 'Cheap communication tool; short-lived effect.' },
  fx_stop: { title: '{name} stopped FX defense', body: 'Intervention ended as reserves melted.', why: 'Reserves are critical; defense is unsustainable.' },
  rate_reserve: { title: '{name} hiked rates to stem reserve losses', body: 'Higher yields aim to slow capital flight.', why: 'Reserve melt and FX pressure.' },
  subsidy_jobs: { title: '{name} raised employment subsidies', body: 'Industry and jobs support widened against unemployment.', why: 'Unemployment above baseline; employment boost.' },
  export_credit: { title: '{name} expanded export credit packages', body: 'Exim-style support pulls external demand.', why: 'Financing for exports and the trade balance.' },
  stocks: { title: '{name} strengthened strategic stockpiles', body: 'Food and energy security against social tension.', why: 'Buffer against stability and price shocks.' },
  national_champ: { title: '{name} green-lit national-champion mergers', body: 'Domestic giants target global competition.', why: 'Scale economies and export power; monopoly risk.' },
  crisis_industry: { title: '{name} announced crisis support for industry', body: 'Subsidies against supply shocks.', why: 'Disaster-driven production shock.' },
  energy_spend: { title: '{name} raised spending for energy transition', body: 'Energy security investment accelerated.', why: 'Structural answer to an energy shock.' },
  energy_weapon: { title: '{name} weaponized energy exports', body: 'Oil/gas restrictions as geopolitical pressure.', why: 'Exporter advantage in crisis.' },
  food_weapon: { title: '{name} restricted food exports', body: 'Supply weapon active in a global food crisis.', why: 'Food-exporter leverage.' },
  alt_finance: { title: '{name} accelerated alternative payment rails', body: 'Payment network strengthened against sanctions.', why: 'Financial sanctions risk.' },
  cbdc: { title: '{name} expanded its cross-border CBDC pilot', body: 'A de-dollarization step via digital currency.', why: 'Reduce reserve-currency dependence.' },
  corridor: { title: '{name} launched an alternative corridor project', body: 'Logistics diversification against Suez blockage.', why: 'Structural answer to a logistics shock.' },
  swap: { title: '{name} opened a currency swap line with {target}', body: 'Bilateral liquidity supports relations and trade.', why: 'Diplomacy and reserve flexibility.' },
  export_fin: { title: '{name} strengthened export financing', body: 'Exim capacity increased.', why: 'Trade-surplus target.' },
  tariff_wall: { title: '{name} built a tariff wall on {pname} goods', body: 'Retaliatory tariffs active.', why: 'Trade retaliation.' },
  tariff_ret: { title: '{name} imposed retaliatory duties on {pname} goods', body: 'Reciprocity principle active.', why: 'Sanctions/tariff retaliation.' },
  freeze: { title: '{name} froze {pname} assets', body: 'Financial sanctions hardened.', why: 'Hard retaliation.' },
  energy_vs: { title: '{name} squeezed energy flows against {pname}', body: 'Energy export curbs used as retaliation.', why: 'Energy weapon.' },
  stock_shock: { title: '{name} raised stockpiles against supply shocks', body: 'Strategic stocks are being lifted.', why: 'Defense against supply weapons.' },
  tariff_balance: { title: '{name} set balancing tariffs on {pname} goods', body: 'Tariff answer to subsidy competition.', why: 'Trade balancing.' },
  energy_target: { title: '{name} turned the energy weapon on {target}', body: 'Targeted energy restriction.', why: 'Opportunistic pressure.' },
  chokepoint: { title: '{name} imposed quotas on critical supplies', body: 'Supply chain weaponized.', why: 'Strategic pressure.' },
  project_start: { title: '{name} launched a long-term project: {ins}', body: 'Strategic investment entered the timeline.', why: 'Building structural power.' },
  generic_act: { title: '{name}: {ins}', body: 'Policy setting updated.', why: 'Score-based candidate.' },
  aid: { title: '{name} announced development aid for {target}', body: 'Aid diplomacy strengthens relations.', why: 'Soft power and relationship repair.' },
  detection_scandal: { title: 'Detection scandal', body: 'Covert operation exposed.' }
};

const help = {
  instruments: '<h4>Instruments — Full Guide</h4><p>Each instrument is a <b>state economic tool</b>. Changing one costs 1 intervention slot + political capital. Keeping a policy open does not cost a slot. Effects flow via <b>pulse</b>, <b>sustain</b>, and <b>complete/perm</b>.</p><h5>Types</h5><ul><li><b>Toggle:</b> On/off. Sanctions, projects, grey-zone ops.</li><li><b>Slider (0–100):</b> Intensity. Sustain scales with level.</li><li><b>Numerical:</b> Rates, taxes, spending, FX intervention, QE.</li></ul><h5>Layers 1–4</h5><p>Structural projects, cyclical/macro tools, market operations, and high-risk grey-zone tactics. Max <b>4 slots</b> per turn. Political capital regenerates with approval.</p>',
  countries: '<h4>Countries — 17 Powers</h4><p>Seventeen playable powers. The EU is a single entity; the UK is separate. Indicators, personality, trade links, deps and domestic groups differ by country.</p>',
  charts: '<h4>Charts — How to Read</h4><p>The center panel draws a time series for the selected indicator. Goal: see cause and effect over 1–15 years.</p>',
  topics: '<h4>Topics & System</h4><p><b>No win condition.</b> 60 turns ≈ 15 years; 1 turn = 1 quarter. Confirm interventions → AI reacts → simulation. One disaster on turns 2–4. Save model v2 plans AI then replays with delays.</p>'
};
const about = '<h4>Mission</h4><p><b>Global Impact</b> is not a classic win/lose game. After a major global disaster you govern with <b>economic instruments only</b>.</p><h4>Core rules</h4><ul><li><b>Turn = 3 months.</b> 60 turns ≈ 15 years.</li><li><b>4 slots</b> of changes per turn; sustaining is free.</li><li><b>Political capital</b> costs interventions.</li><li><b>17 countries:</b> EU single entity, UK separate.</li><li><b>1 disaster</b> on turns 2–4.</li><li><b>Grey-zone risk:</b> exposure → scandal + retaliation.</li></ul>';

const en = {
  ui, instruments, countries, disasters, layers, groups, globals, indMeta, toneMeta,
  newsCats, diplo, econTitle, econBody, globalTitle, globalBody, risk, events,
  projectDone, projectProg, detectionTitles, detectionBodies, disasterFlavor,
  help, about, chartSeries, ai,
  gov: { demokratik: 'Democratic', otoriter: 'Authoritarian', hibrit: 'Hybrid', birlik: 'Union' }
};

emit('en', en);

// Patch TR ui extras
Object.assign(tr.ui, {
  slots_html: 'Müdahale: <b>{used}/{max}</b>',
  log_short: 'Günlük',
  turn_confirm_sure: 'Bu müdahalelerle turu ilerletmek istediğine emin misin?',
  turn_confirm_note: 'Onaydan sonra kararlar uygulanır, diğer ülkeler tepki verir ve simülasyon işler. Geri alınamaz.',
  pending_none_html: 'Bu turda <b>hiç enstrüman değişikliği</b> seçilmedi. Mevcut politikalar sürdürülerek tur ilerleyecek.',
  pending_waiting: 'müdahale onay bekliyor:',
  total_polcap_cost: 'Toplam siyasi sermaye maliyeti: <b>🏛 {cap}</b> · Mevcut: <b>{pc}</b>',
  topic_instruments: '📚 Enstrümanlar',
  topic_countries: '🌍 Ülkeler',
  topic_charts: '📈 Grafikler',
  topic_system: '📖 Konular & Sistem',
  no_content: 'İçerik yok.',
  stat_growth: 'Büyüme',
  stat_inflation: 'Enflasyon',
  stat_reserves: 'Rezerv',
  stat_debt: 'Borç',
  legacy_none_long: 'Kalıcı yapısal değişim yaratmadın. Dünya, felaket öncesi düzenine geri dönüyor…',
  end_h_legacy: '🏛 Senin Mirasın (Kalıcı Yapısal Değişimler)',
  end_h_world: '🌍 Dünyada Başkalarının Bıraktığı İzler',
  end_h_scores: '📊 Performans Değerlendirmesi',
  end_h_reflect: '💭 Kişisel Yansıma',
  end_reflect_html: '· En çok pişman olduğun müdahale hangisiydi?<br>· En gurur duyduğun kararın neydi?<br>· Bu felakete karşı en iyi strateji ne olurdu?<br>· Farklı bir yol seçseydin, dünya bugün nasıl olurdu?',
  end_total_acts: 'Toplam {n} müdahale yaptın. Dünya artık senin de izini taşıyor.'
});
tr.gov = { demokratik: 'Demokratik', otoriter: 'Otoriter', hibrit: 'Hibrit', birlik: 'Birlik' };
emit('tr', tr);
console.log('done');
