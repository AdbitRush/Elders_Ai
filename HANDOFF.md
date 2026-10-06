## 2026-10-06 — site audit (games.178-105-148-72.sslip.io)

Shipped in 4074812 (+ Caddy change on the VPS):
- **All 168 landing pages (`/<lang>/<game>/`) were 404 on the VPS.** The Caddy
  `(notsite)` snippet's `@dirlist` (`^/.+/$`, there to stop directory listings)
  caught them, and `/he/klondike` 301s into the slash form. Fixed by an exact
  exemption `^/(he|en|es|fr|de|el)/(<28 ids>)/$` in `/root/caddy/Caddyfile`
  (edited in place, backup `.bak-before-games-landing-20261006`). **A new game id
  must be added to that regex** or its landing pages will 404 on the VPS.
  Listings (`/js/`, `/images/`, `/css/`), `/.git/config` still 404.
- Light theme: logo, "Why train" and "28 Brain Games" headings were invisible
  (inline gradient styles beat the theme CSS; the overrides now carry `!important`).
- Duplicate, unclosed `#themeBtn` removed (it nested the language `<select>` in a button).
- `cdn.tailwindcss.com` (5 s+, render-blocking JIT) replaced by `css/tailwind.css`
  (23 KB). **Rebuild after adding Tailwind classes to index.html or js/**:
  `npx tailwindcss@3.4.17 -i in.css -o css/tailwind.css --content "./index.html,./js/**/*.js" --minify`
  (in.css = the three `@tailwind` directives).
- Removed: visible "ממתין ל-AdSense" placeholder box (#adSide), the "Ad" pill on a
  self-promo ticker (now ★), the IP-to-ipwho.is language lookup (now
  `navigator.language`), 28 runtime Pollinations.ai image fallbacks, the unused
  Supabase SDK tag (sync.js has no URL/key; re-add the tag when configured).
- "Brain Health" score renamed "Practice score" (it is not a health measure).
- ASSET_V and sw.js CACHE bumped to 60.

Known, not done: `counting.jpg` 623 KB / `flags.jpg` 448 KB (compress); mobile
header is ~1/3 of the viewport; the affiliate "admin" login is a SHA-256 hash in
the visitor's own localStorage, so it protects nothing and its settings are
per-browser; full 6-language x mobile sweep not completed (machine out of memory).

### Follow-up 2026-10-06 (later)
- Card images over 150 KB re-encoded (progressive JPEG q78, 960 px wide max):
  counting 623->68 KB, flags 448->25, colormatch 168->20, safari 298->232,
  blocks 275->218, math 193->160, pairs 172->136 (2.18 MB -> 0.86 MB total).
- **Verified live, English/desktop/dark: 28 of 28 games load, zero console errors.**
  NOT verified: he/es/fr/de/el, mobile, light theme across games. Two attempts
  failed because Playwright's browser (bundled headless shell AND installed Chrome)
  hung at launch on this PC; not a site fault. Re-run `sweep.py`-style checks
  (load `/#<game>` per lang/device, collect console errors, failed requests, and
  horizontal overflow) once the PC is healthy.

### DONE 2026-10-06 - affiliate admin login removed (Or chose Option A)
`js/affiliate.js` is now a ~70-line renderer driven by `AFFILIATE_CONFIG` at the
top of the file (platform, amazonTag, products). The login, password hash,
`?admin` / 5-tap trigger, per-browser product editor and "Forgot password" are
gone; the old `gg_aff_*` localStorage keys are deleted on load. Config ships as
`platform: 'off'` with no products, so nothing is shown and the normal
site-message ticker runs. **No real tag exists in the repo - Or must supply the
Amazon tag / links; none were invented.** To enable: edit the config, commit,
push. Only https:// links are rendered, names are HTML-escaped. Tested in Node
(off / on / hostile `javascript:` URL), not in a browser (see below).
ASSET_V and sw.js CACHE are 61.

### DONE 2026-10-06 (evening): full sweep + mobile header, run FROM THE VPS
Browsers hang at launch on Or's PC (bundled headless shell, installed Chrome and a
bare `chrome --headless` all hang; Defender is on and non-admin cannot see its
exclusions, so the cause is unproven but it is the PC, not Playwright). So the
sweep runs on the VPS: `/root/audit-sweep` (Node + playwright 1.54 +
chromium-headless-shell, ~300 MB, run with `nice -n 15`, one browser at a time;
VPS has ~1 GB free). Re-run:
`cd /root/audit-sweep && nohup nice -n 15 node sweep.cjs https://games.178-105-148-72.sslip.io out.json he,es,fr,de,el dark "$(cat games.txt)" &`
(args: base, out, langs, themes, game|ids, optional devices). `shots.cjs` takes
screenshots + checks the affiliate change. Do not use `pkill -f` over ssh (kills
the ssh shell); redirect stdin (`</dev/null`) so ssh returns.
**Result, live site: 377 page loads = 5 languages (he/es/fr/de/el) x desktop+mobile
dark, plus en mobile dark, plus en desktop+mobile light, x (home + 28 games):
0 console errors, 0 failed requests, 0 empty game areas, 0 horizontal overflow;
dir=rtl only for he.** Combined with the earlier en/desktop/dark run, all 28 games
are covered in every language, both devices, both themes (light only for en).
- Mobile header (ee95f2d): 235 px -> 119 px on the home page, 173 px inside a game
  (row 1 logo+title+language, row 2 controls; 48 px targets kept). The "Invite
  friends" button is HIDDEN on phones (<640px) to make room - Or may want it back
  somewhere else; the profile chip shows its avatar only.
- Dark theme: the game instruction line was pale blue on the ivory game table
  (unreadable); now dark in both themes.
- Affiliate removal verified in a real browser on the live site: `?admin` and five
  taps on the pill open nothing, no password inputs, legacy keys cleared, ticker
  intact, no page errors.
Still open: Or to supply a real Amazon tag / links for `AFFILIATE_CONFIG`; Invite
button on mobile; light theme was only swept for English.

## 2026-09-04 — image generation: cost model

The game card artwork is AI-generated, and it is **not free**. There is no free
tier for image generation on any Gemini image model — `GEMINI_FREE_API_KEY` and
`GEMINI_API_KEY` both fail with a quota error and always will. Only
`GEMINI_PAID_API_KEY` works (in `/root/openclaw/.env` on the VPS).

- `gemini-3.1-flash-image` — $0.067 per 1K image. Used for all 28 cards.
- `gemini-3.1-flash-lite-image` — $0.0336, fine for anything secondary.

30 card images were generated here, about $2.01. Across this repo and
cruise-seniors the total is 128 images, $6.74.

**Before generating, check whether a real photograph exists.** On the cruise
site ~350 images were about to be generated and were pulled from Wikimedia
Commons for nothing instead. `tools/dl-wiki-game-cards.js` in this repo now does
the same for game cards.

The full write-up, including the per-image brief for every card, is in
`IMAGES.md`. Owner's decision 2026-09-04: no more paid image generation for now.

## 2026-07-19 — Klondike Solitaire + sound toggle (Fable session)
- **Game 27: Klondike** (`js/games/klondike.js`) — real classic solitaire, senior-friendly
  click-to-move (tap card → tap destination, no dragging), Undo (100 steps), Hint
  (foundation→tableau→waste priority), New deal, moves counter. Difficulty: easy/normal
  = draw 1, hard = draw 3 + 3 redeals. Tap selected card again = auto-to-foundation.
- **🔊 Sound toggle** in navbar (persists `gg-sound`; gates `_tone` so ALL sfx obey).
- i18n: title/desc/inst in he/en/es/fr/de/el. Cache v20→v21 (+sw precache).
- **Verified:** 26-game render sweep passed in ALL 6 languages (156/156, zero JS errors);
  Klondike gameplay E2E (deal/draw/undo/hint/legal-move/win modal) in HE+EN.
- Gotcha hit: SW served stale index during verification — cleared SW+caches to confirm;
  real users get v21 via normal SW update cycle.

# HANDOFF — Golden Games (Elders_Ai)

## 2026-07-07 — Text-size toggle (seniors accessibility)
- `js/textsize.js` — navbar 🔠 button cycles A → A+ → A++ (100/115/130% via `html{font-size}`,
  scales all rem/Tailwind sizes). Persists in localStorage (`gg-textsize`), applies on load.
- sw.js cache bumped v9→v10 + textsize.js precached. Verified in browser: scaling + persistence.

**תאריך עדכון:** 2026-06-13 | **סטטוס:** 🟢 חי ב-GitHub Pages

---

## 🔗 לינקים

| | |
|---|---|
| **אתר חי** | https://adbitrush.github.io/Elders_Ai/ |
| **ריפו** | https://github.com/AdbitRush/Elders_Ai |
| **לינק ישיר למשחק** | `/#gameId` למשל `/#tetris`, `/#simon` |

---

## ✅ מה בוצע (Session 40)

### Session 40 (חלק ב׳ — מחובר במלואו)
- **Difficulty** — Easy/Normal/Hard מחובר לכל 18 משחקים + סלקטור ב-homescreen
  - memory: פחות/יותר זוגות; simon: מהירות flash; tetris: מהירות נפילה
  - שאר המשחקים: כמות שאלות/מילים/שלבים מתכווננת לפי קושי
- **Share button** — מופיע בכל מודל ניצחון + Simon result screen
- **PWA icon** — images/icon.svg (SVG) + manifest.json מעודכן
- **WordSearch** — dark theme cells (slate-700/slate-800)
- **Solitaire** — 4 suits (♥♦♠♣), flex card layout, premium shadows
- **Recall (Hard)** — countdown timer 4 שניות, אחר כך עובר אוטומטית לשלב הבדיקה
- **Hangman** — lives color changes to amber/red as mistakes increase

### Session 40 (חלק א׳ — skeletons)
- **15 שיפורים** — ניתוח + skeleton code לכל חלק
- **תיקון באגים** — refreshHSBadges כלל Tetris; i18n "17"→"18"; matched-card CSS
- **PWA** — manifest.json + sw.js (offline + installable)
- **js/stats.js** — לוח שיאים + modal
- **js/difficulty.js** — Easy/Normal/Hard + multipliers
- **js/share.js** — Web Share API + clipboard fallback + toast
- **js/categories.js** — תגיות מיומנויות קוגניטיביות על כל קלף
- **js/accessibility.js** — ARIA live, trap focus, keyboard nav
- **js/lazy-loader.js** — skeleton לטעינה עצלה (לא מופעל עדיין)
- **css/style.css** — קובץ עיצוב חיצוני (memory/wordsearch/solitaire dark styles)
- **📊 כפתור Scoreboard** — navbar

---

## ✅ מה בוצע (Session 38-39)

### Session 38
- **טטריס** (#18) — canvas, 7 טטרומינו, ghost piece, מקלדת + swipe + כפתורים
- **סודוקו** — inline CSS borders (אמינים), dark navy theme
- **ABR_Ai Inspector** — try/except מונע 500, fetch error handling משופר

### Session 39
- **ריפקטור מודולרי** — `index.html` 1811→983 שורות, 18 קבצי `js/games/*.js`
  - כל משחק בקובץ נפרד: `js/games/{id}.js`
  - shared globals (i18nData, gameState, routing, shuffle, sfx) נשארים ב-index.html
  - 18 `<script src="js/games/id.js">` נטענים אחרי inline script
- **Simon** — i18n bilingual (HE/EN), visual upgrade (neon glow on flash, dark buttons)

---

## 📦 מה בנוי (18 משחקים)

| # | ID | שם | מצב |
|---|----|----|-----|
| 1 | memory | אימון זיכרון | ✅ |
| 2 | oddoneout | יוצא דופן | ✅ |
| 3 | math | חשבון מהיר | ✅ |
| 4 | wordsearch | חיפוש מילים | ✅ |
| 5 | simon | רצף צבעים | ✅ neon glow |
| 6 | sudoku | סודוקו יומי | ✅ dark theme |
| 7 | shapes | סדר וארגון | ✅ |
| 8 | solitaire | סוליטר פירמידה | ✅ |
| 9 | trivia | טריוויה | ✅ |
| 10 | numseq | רצף מספרים | ✅ |
| 11 | unscramble | פענוח מילה | ✅ |
| 12 | pairs | זוגות הפכים | ✅ |
| 13 | truefalse | נכון / לא נכון | ✅ |
| 14 | flags | דגלי העולם | ✅ |
| 15 | proverbs | השלם את הפתגם | ✅ |
| 16 | hangman | תלייה | ✅ |
| 17 | recall | זיכרון תמונות | ✅ |
| 18 | tetris | טטריס | ✅ |

---

## 🏗️ מבנה קבצים

```
Elders_Ai/
├── index.html              ← shell + shared globals (983 שורות)
├── js/
│   └── games/
│       ├── memory.js
│       ├── oddoneout.js
│       ├── math.js
│       ├── wordsearch.js
│       ├── simon.js        ← updated: neon glow + bilingual
│       ├── sudoku.js       ← updated: inline CSS borders + dark theme
│       ├── shapes.js
│       ├── solitaire.js
│       ├── trivia.js
│       ├── numseq.js
│       ├── unscramble.js
│       ├── pairs.js
│       ├── truefalse.js
│       ├── flags.js
│       ├── proverbs.js
│       ├── hangman.js
│       ├── recall.js
│       └── tetris.js
└── images/
    └── {game}/thumb.jpg   ← כשמוסיפים תמונה מקומית
```

### ארכיטקטורה
```
Stack:    HTML + Vanilla JS + Tailwind CSS CDN
i18n:     t('key') → i18nData[currentLang][key]
Routing:  location.hash = gameId | hashchange listener
Storage:  localStorage (gg_streak, gg_today_count, gg_total_games, gg_hs_{id})
Games:    loadGame(id) → init{Game}(container) → levelComplete()
Cleanup:  window._gameCleanup() → called by showHome() + loadGame()
```

---

## 🚀 NEXT SESSION — מה עוד צריך

### עדיפות גבוהה
- **בדיקה ידנית** — לפתוח כל 18 משחקים בדפדפן אחרי Ctrl+Shift+R
- **Memory** — שיפור ויזואלי: matched state גלוי יותר, נושא כהה
- **WordSearch** — שיפור ויזואלי: dark cells
- **Solitaire** — שיפור ויזואלי: cards nicer

### עדיפות בינונית
- **PWA** — manifest.json + service worker (offline support)
- **Google AdSense** — אחרי 2 שבועות טראפיק

### עדיפות נמוכה
- **תמונות מקומיות** — החלפת Pollinations ב-images/ לפי game

---

## 📋 Git Log (Session 39)

```
cd6bc1a  refactor(modular): split 18 games into js/games/*.js — index.html 1811→983 lines
52c83a0  chore(session38): update HANDOFF
a8fe6ea  feat(session38): Tetris game + Sudoku dark theme + inspector error guard
```
