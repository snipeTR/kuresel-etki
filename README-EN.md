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
| **Repo (public)** | [github.com/snipeTR/kuresel-etki](https://github.com/snipeTR/kuresel-etki) |
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
- In-game **🌐** cycles language.
- Preference stored in the browser (`keLang_oyungrok`).

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
| **Political capital** | Interventions spend points; higher approval regenerates faster. |
| **Time** | Some effects are immediate; others take years. Read the charts. |
| **Projects** | Long jobs advance without slots; completion leaves **permanent legacy**. |
| **Grey zone** | Espionage, disinfo, etc. risk exposure → scandal + retaliation. |
| **Targeted tools** | Some instruments need a target country. |
| **Crisis music** | On disaster, calm music fades; crisis playlist cycles. |

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

---

# 2. Programmers

## 2.1 Requirements

Modern browser; optional **Node.js** 18+ for `serve.js` / tests. No npm install.

```bash
git clone https://github.com/snipeTR/kuresel-etki.git
cd kuresel-etki
node serve.js
# → http://localhost:8123
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
kuresel-etki/
├── index.html
├── css/style.css
├── lang/                   # i18n
├── assets/world-map.svg
├── music/
├── js/data|core|ui/
├── AGENTS.md
├── YAPILACAKLAR.example.md # public template only
├── README.md               # Turkish
├── README-EN.md            # English (this file)
├── .gitignore              # keeps YAPILACAKLAR.md out of public git
└── serve.js / test-consistency.js
```

## 2.4 Architecture

| Topic | Decision |
|-------|----------|
| Framework | None — `window.GAME` |
| Load order | data → core → ui (see `index.html`) |
| Save keys | `*_oyungrok` only |
| AI turn | Plan full script → delayed replay; on interrupt **restart from preAi** |
| Mobile | Move DOM into tabs under `body.mobile-ui` |

### Turn model v2 (critical)

```text
Confirm → beginTurn → preAi snapshot → buildAIScript
→ restore preAi → job complete:false
→ play script (500–2000 ms / country)
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
| Not in there | Game source (lives in public `kuresel-etki`) |
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

`lang/i18n` + packs → countries → instruments → disasters → state → effects → internal → diplomacy → news → ai → turn → charts → help → music → panels → screens → mobile → main

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
| Turkish README | [README.md](README.md) |
| GitHub (public) | https://github.com/snipeTR/kuresel-etki |
| Secrets (private, authorized) | https://github.com/snipeTR/kuresel-etki-secrets |
| §1 Players | [Players](#1-players-end-users) |
| §2 Devs | [Programmers](#2-programmers) |
| §3 Agents | [AI agents](#3-ai-agents) |
