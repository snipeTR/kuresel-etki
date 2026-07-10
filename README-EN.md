# GLOBAL IMPACT (Küresel Etki)

> **Türkçe:** [README.md](README.md) · **English (this file)**

**Turn-based economic statecraft simulation.**  
After a major global disaster you govern your chosen country using **economic instruments only**. Watch how each rate change, sanction, or project ripples across the world in the short, medium, and long run.

> There is no classic win/lose. The goal is to *feel* what happens when you change a tool.

| | |
|--|--|
| **Stack** | Plain HTML + CSS + JavaScript (no framework, no build) |
| **Platform** | Desktop browser + mobile portrait (9:16 tabbed UI) |
| **Length** | 60 turns ≈ 15 years (1 turn = 3 months / 1 quarter) |
| **Content** | 17 countries · 48 instruments · 10 disasters · AI rivals |
| **Languages** | Turkish + English (`lang/` modular packs; main menu **TR/EN** dropdown) |
| **Repo (public)** | [github.com/snipeTR/global-impact](https://github.com/snipeTR/global-impact) |
| **Secrets** | Private: [kuresel-etki-secrets](https://github.com/snipeTR/kuresel-etki-secrets) *(authorized access only)* |

---

## Who is this README for? (3 tiers)

| Tier | Audience | What you get |
|------|----------|----------------|
| **[1. Players](#1-players-end-users)** | Just want to play | Install, rules, screens, tips, FAQ |
| **[2. Programmers](#2-programmers)** | Reading / contributing code | Architecture, data models, tests |
| **[3. AI agents](#3-ai-agents)** | LLM / coding agents | Immutable rules, API map, **private secrets repo**, checklist |

Canonical rules: **[AGENTS.md](AGENTS.md)**  
Public todo template: **[YAPILACAKLAR.example.md](YAPILACAKLAR.example.md)**  
Turkish README: **[README.md](README.md)**

---

# 1. Players (end users)

No coding required.

## 1.0 Language

- Main menu **bottom-right** dropdown: **TR** / **EN** (3-letter codes).
- **Desktop game:** same select **inside the game window**, bottom-right.
- **Mobile:** same select **inside the mobile chrome**, bottom-right (above tab bar).
- Preference stored in the browser (`keLang_oyungrok`).
- Language can also be changed under **Main menu → Settings**.

## 1.0b Settings & Advanced settings

### Settings (main menu)
**Settings**: language, volume step, **chat speed** (slow / fast round picks), new-game confirm, collapse feed by default (desktop), reset glossary “don’t show again”.  
- **Slow:** AI countries ~0.5–2 s apart (default).  
- **Fast:** **0.2 s** per country.  
Stored only in this browser (`keSettings_oyungrok`); never sent to a server.

### Advanced settings (desktop only)
Settings → **Advanced settings**: spreadsheet-like table of game constants, instrument costs, country baselines.  
Columns: **variable | value | default | description** (TR/EN). Filter, group, save, text import/export, reset to defaults.  
Hidden on mobile. Storage: `keTunables_oyungrok`.

## 1.1 How to run

### Desktop

1. Download (ZIP) or clone the repo.  
2. **Easiest:** double-click `index.html`.  
3. **Recommended:**

```bash
node serve.js
```

Then open **http://localhost:8123**

> File protocol works without Node. HTTP is cleaner for music / CORS.

### Phone / tablet

- Open the same URL on the same Wi‑Fi (or your published site).  
- Keep the phone **portrait**. The game uses 5 tabs.  
- Very small screens may show a “screen too small” gate.

### Audio

- Browsers may block autoplay → **tap the screen once**.  
- Default volume **40%**. Volume button next to help:

| Icon | Level |
|------|--------|
| 🔇 | Mute (0%) |
| 🔉 | Normal (40%) |
| 🔊 | Full (100%) |

## 1.2 30-second summary

1. **New Game** → pick a country.  
2. Early turns are calm; around turns **2–4** a random **global disaster** hits.  
3. At most **4 instrument** changes per turn.  
4. **Confirm & Advance** → summary → **Yes** commits the turn.  
5. Other countries react (feed / mobile **Events** tab).  
6. After 60 turns you get **legacy** text and 5 performance scores.  
7. Auto-save; use **Continue**.

## 1.3 Core rules

| Rule | Meaning |
|------|---------|
| **4 slots** | At most 4 *changes* per turn. Leaving a policy as-is costs no slot. |
| **Political capital** | Interventions spend points. Insufficient capital **blocks** turn commit. |
| **Escalating cost** | Rate / tax / spending: base **2**, **+1** each confirmed use. FX intervention: **3**; regen penalty every 4 uses. |
| **Reset** | Next to Event Log: cancel all pending instrument changes before confirm. |
| **Time** | Some effects are immediate; others take years. Read the charts. |
| **Projects** | Long jobs advance without slots; completion leaves **permanent legacy**. |
| **Grey zone** | Espionage, disinfo, etc. risk exposure → scandal + retaliation. |
| **Targeted tools** | Some instruments need a target country. |
| **Crisis music** | On disaster, calm music fades; crisis playlist cycles. |
| **Glossary (*)** | Starred terms in the feed: hover/tap for plain-language tips. |

## 1.4 Indicators

| Indicator | Meaning |
|-----------|---------|
| **Growth** | Quarterly economic pace |
| **Inflation** | Price pressure |
| **Unemployment** | Jobless rate |
| **Reserves** | FX / asset buffer (bn $) |
| **Debt** | Public debt (% GDP) |
| **Currency** | Index (start = 100) |
| **Trade** | External balance |
| **Influence** | Global power (0–100) |
| **Approval** | Public support |
| **Stability** | Internal order |
| **Political capital** | Intervention budget |

## 1.5 Instrument layers (48 tools)

| Layer | Name | Use | Risk |
|-------|------|-----|------|
| **1** | Structural strategy | Reserve currency, corridors, R&D, standards… | Usually low; slow |
| **2** | Cyclical intervention | Rates, tax, spending, sanctions, stocks, energy… | Medium |
| **3** | Market operations | Espionage, jawboning, patents, certification… | High (detection) |
| **4** | Grey zone | NGOs, corruption nets, insurgency finance, lawfare… | Very high |

Types: **toggle**, **slider**, **numerical**, **targeted**, **project**.  
In-game **Help (`?`)** is the full encyclopedia.

## 1.6 Countries (17)

The **EU is one entity**; Germany is not separate (represented inside EU). The **UK (GBR) is separate**.

USA, CHN, EU, JPN, IND, GBR, RUS, CAN, BRA, KOR, AUS, MEX, IDN, SAU, TUR, CHE, ZAF.

## 1.7 Disaster

- One global disaster planned for turns **2–4**.  
- Goal is not “winning” — adapt with economic tools and observe side effects.

## 1.8 Screens

**Desktop:** left indicators · center charts · right event feed · bottom instruments · top country strip + commit.

**Mobile tabs:** 0 Status · 1 Charts · 2 Events · 3 Map · 4 Instruments (swipe wraps at edges).

## 1.9 Map

Relation-colored lines (green = friend, red = hostile vs selected country).  
EU marker on Spain (`#es`), label below. Pan/pinch on the map only.

## 1.10 End scores

Own performance · global stability · legacy power · strategic consistency · risk management (+ legacy text list).

## 1.11 Tips & FAQ

- Don’t spend all 4 slots every turn.  
- Effects lag; watch charts for 2–4 turns.  
- Save is automatic in `localStorage` with `_oyungrok` keys (does not collide with older `/oyun/` builds).  
- Feed: desktop line hover = cursor tip; starred (`*`) terms = grey glossary pop; line click = plain summary. Mobile: no white line tip (tap only). Chart chips: desktop hover, mobile second-tap tip.  
- **Settings** / **Advanced settings** (desktop spreadsheet of constants) live under the main menu.

---

# 2. Programmers

## 2.1 Requirements

Modern browser; optional **Node.js** 18+ for `serve.js` / tests. No npm install.

### One-line install (Linux server)

```bash
curl -fsSL https://raw.githubusercontent.com/snipeTR/global-impact/main/install.sh | bash
```

With nginx:

```bash
curl -fsSL https://raw.githubusercontent.com/snipeTR/global-impact/main/install.sh | bash -s -- --yes --with-nginx
```

| Script | Role |
|--------|------|
| **`install.sh`** (repo root) | Bootstrap: clone + packages + `~/gi-ops` |
| **`tools/sh/INSTALL.sh`** | Detailed multi-distro package install |
| **`~/gi-ops/`** | Server shortcuts: deploy / release / status |

### Manual

```bash
git clone https://github.com/snipeTR/global-impact.git
cd global-impact
bash install.sh --yes
# or: bash tools/sh/INSTALL.sh

node serve.js
# → http://localhost:8123

# Server after install: cd ~/gi-ops && ./update-dev.sh
# Site root release: ./update-release.sh  (never touch /oyun/)
```

## 2.2 i18n (`lang/`)

| File | Role |
|------|------|
| `lang/i18n.js` | `GAME.t`, `setLang`, `applyAll`, language select |
| `lang/tr/pack.js` | Turkish pack (default) |
| `lang/en/pack.js` | English pack |

- Main menu bottom-right: `<select>` **TR / EN**.  
- Preference: `keLang_oyungrok`.  
- New language: `lang/<code>/pack.js` + `supported` entry (`short: 'XX'`) + script tag in `index.html`.  
- Details: [AGENTS.md §11](AGENTS.md).

## 2.3 Project tree

```text
global-impact/
├── index.html
├── css/style.css
├── lang/                   # i18n
├── assets/                 # world-map.svg + flags/*.png (Win95 UI)
├── music/
├── js/data/                # countries, instruments, disasters, glossary
├── js/core/                # state, tunables, effects, turn, ai…
├── js/ui/                  # panels, screens (settings/advanced), charts…
├── tools/js/               # Node CLI (not runtime)
├── tools/sh/               # INSTALL, release, deploy wrapper
├── AGENTS.md · CHANGELOG.md
├── YAPILACAKLAR.example.md # public template only
├── README.md / README-EN.md
├── .gitignore              # YAPILACAKLAR.md, keys, ssh, .env out of public git
└── serve.js / test-consistency.js
```

## 2.4 Architecture

| Topic | Decision |
|-------|----------|
| Framework | None — `window.GAME` |
| Load order | lang → data (+glossary) → state → **tunables** → core → ui (see `index.html`) |
| Save keys | `*_oyungrok` only (see table below) |
| AI turn | Plan full script → delayed replay; on interrupt **restart from preAi** |
| Mobile | Move DOM into tabs under `body.mobile-ui` |
| Advanced constants | `js/core/tunables.js` + desktop UI; `keTunables_oyungrok` |

### localStorage keys

| Key | Purpose |
|-----|---------|
| `kureselEtkiSave_oyungrok` | Permanent save (after completed turn) |
| `kureselEtkiTurnJob_oyungrok` | Incomplete turn AI script |
| `keFeedCollapsed_oyungrok` | Feed collapsed preference |
| `keLang_oyungrok` | Language |
| `keSettings_oyungrok` | Settings panel |
| `keTunables_oyungrok` | Advanced constants |
| `keGlossSkip_oyungrok` | Glossary “don’t show again” |

### Turn model v2 (critical)

```text
Confirm → beginTurn → preAi snapshot → buildAIScript
→ restore preAi → job complete:false
→ play script (chat speed: slow ~500–2000 ms / fast 200 ms per country)
→ finishTurn → clear job → permanent save
```

Never resume mid-script by AI index alone.

## 2.5 Instruments

- **Do not delete** instruments; adding is fine.  
- Types: toggle / slider / numerical; layers 1–4.  
- Effects: pulse / sustain / perm via `effects.js`.

## 2.6 Tests

```bash
node test-consistency.js
# news templates ≥ 80, instrument paging OK → ALL_OK
```

## 2.7 Contribution rules

1. No instrument deletion.  
2. Mobile CSS under `body.mobile-ui` only.  
3. **Never** commit secrets (IP, SSH, personal paths) to this **public** repo.  
4. `YAPILACAKLAR.md` is gitignored — use example template in public.  
5. Authorized secrets backup: private **[kuresel-etki-secrets](https://github.com/snipeTR/kuresel-etki-secrets)**.  
6. Durable rules → `AGENTS.md`.  
7. No framework/build unless explicitly requested.

### Open todos (template)

See `YAPILACAKLAR.example.md` (balancing, chart overlays, optional “what if” mode).

---

# 3. AI agents

> For LLMs / agents that change code. Humans: §1 play · §2 develop.  
> **Rule source of truth:** [AGENTS.md](AGENTS.md).

## 3.1 Session start (required order)

1. **[AGENTS.md](AGENTS.md)** — immutable model (countries, turn v2, UI, music, instruments, i18n).  
2. **Secrets / deploy (priority):**  
   - Local `YAPILACAKLAR.md` if present (gitignored; missing on public clone).  
   - **If you have GitHub access to the private repo, read it:**  
     **https://github.com/snipeTR/kuresel-etki-secrets**  
     Contains `YAPILACAKLAR.md`, `ssh/` keys, deploy paths/notes.  
     Example: `gh repo clone snipeTR/kuresel-etki-secrets` or `gh api` / `gh repo view`.  
   - If no access: only **[YAPILACAKLAR.example.md](YAPILACAKLAR.example.md)** (no real IP/SSH).  
3. Open the relevant source files.  
4. Run the checklist after changes.

**Working root:** the user’s `ekonomi oyunu` folder under Documents `grok-projeler` unless told otherwise. Do not write to the wrong copy.

### 3.1.1 Private secrets repository (agents with git access)

| | |
|--|--|
| Repo | `snipeTR/kuresel-etki-secrets` (**private**) |
| Contents | Deploy URL/path, SSH notes, `ssh/*.key`, private todos |
| Not in there | Game source (lives in public `global-impact`) |
| Rule | **Never** paste private contents into public commits, issues, or chats |
| Deploy target | Only **`/oyungrok/`** — **never** write to `/oyun/` (details in private file) |
| Public web | Do not publish `YAPILACAKLAR.md` or keys under the web root |

If `gh` is authenticated as an account with access, prefer reading the private repo over guessing deploy settings.

## 3.2 Hard constraints

| # | Constraint |
|---|------------|
| 1 | Do not delete instruments |
| 2 | 17-country set; no DEU; EU single entity; GBR separate |
| 3 | localStorage keys must end with `_oyungrok` |
| 4 | Turn model v2: full AI script then replay; interrupt → from start |
| 5 | Don’t break desktop layout; mobile under `body.mobile-ui` |
| 6 | No secrets in public commits |
| 7 | No framework unless asked |
| 8 | Don’t deploy to live `/oyun/` |
| 9 | Don’t simplify turn model back to mid-index resume |

## 3.3 Key `GAME` APIs

`newGame` / `save` / `load` · `beginTurn` / `finishTurn` / `runTurnAnimated` / `tryResumeTurnJob` · `buildAIScript` / `applyAIScriptEntry` · `aiPlan` · effects · `Music.*` · `i18n` / `t` · mobile map helpers · `countNewsTemplates` / `testInstrumentPaging`.

## 3.4 Script load order

`lang/i18n` + packs → countries → instruments → disasters → **glossary** → state → **tunables** → effects → internal → diplomacy → news → ai → turn → charts → help → music → panels → screens → mobile → main

## 3.5 Checklist

- [ ] Matches AGENTS.md  
- [ ] No instrument removed  
- [ ] `*_oyungrok` keys  
- [ ] Turn v2 intact  
- [ ] Desktop + mobile smoke  
- [ ] `node test-consistency.js` → `ALL_OK`  
- [ ] `YAPILACAKLAR.md` / keys **not** staged for public  
- [ ] Durable rule → AGENTS.md; private deploy notes → secrets repo if owner updates them  
- [ ] Private secrets never leaked to public  
- [ ] CHANGELOG entry + GitHub push + `/oyungrok` deploy triad  

## 3.5b Security (public repo)

| Topic | Rule / status |
|-------|----------------|
| Public code | No server IP / SSH private keys |
| Secrets backup | Private `kuresel-etki-secrets` only |
| `.gitignore` | `YAPILACAKLAR.md`, `*.key`, `**/ssh/`, `.env*` |
| GitHub | Secret scanning + push protection; Dependabot; `main` ruleset (no force-push/delete) |
| Live deploy | `/oyungrok/` only — never `/oyun/` |

## 3.6 Working style

Small diffs · read before write · keep UI strings via i18n packs · don’t “simplify” turn/save · test when possible.

---

## License / assets

- World map SVG: [simple-world-map](https://github.com/flekschas/simple-world-map) derivative (**CC BY-SA 3.0**).  
- Game code: see repo owner / project license.  
- Music (`music/*.mp3`): project-specific; check redistribution rights.

---

## Recent changes (high level)

- Modular **i18n** (`lang/tr`, `lang/en`); main menu **TR/EN** dropdown (bottom-right).  
- Turn **v2** AI plan + delayed replay; resume from `preAi` snapshot.  
- Mobile 9:16 tabs, map pan/pinch, relation-colored lines, EU on Spain.  
- Music system + volume steps 0 / 40% / 100%.  
- Public/private split: game code public; secrets + SSH in **private** `kuresel-etki-secrets`.  
- Dual README: [README.md](README.md) (TR) + this file (EN).

---

## Quick links

| | |
|--|--|
| Play (local) | `node serve.js` → http://localhost:8123 |
| Rules | [AGENTS.md](AGENTS.md) |
| Todo template | [YAPILACAKLAR.example.md](YAPILACAKLAR.example.md) |
| Changelog | [CHANGELOG.md](CHANGELOG.md) |
| Turkish README | [README.md](README.md) |
| GitHub (public) | https://github.com/snipeTR/global-impact |
| Secrets (private, authorized) | https://github.com/snipeTR/kuresel-etki-secrets |
| §1 Players | [Players](#1-players-end-users) |
| §2 Devs | [Programmers](#2-programmers) |
| §3 Agents | [AI agents](#3-ai-agents) |
