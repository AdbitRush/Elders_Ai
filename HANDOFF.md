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
