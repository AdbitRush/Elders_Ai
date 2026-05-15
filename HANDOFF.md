# HANDOFF — Golden Games (Elders_Ai)
**תאריך עדכון:** 2026-05-15 | **סטטוס:** 🟢 חי ב-GitHub Pages

---

## 🔗 לינקים

| | |
|---|---|
| **אתר חי** | https://adbitrush.github.io/Elders_Ai/ |
| **ריפו** | https://github.com/AdbitRush/Elders_Ai |
| **לינק ישיר למשחק** | `/#gameId` למשל `/#trivia`, `/#hangman` |

---

## ⚠️ מצב נוכחי — קריטי לסשן הבא

### 1. משחקים לא נפתחים — סיבת השורש
**סיבה:** כפתור "התחל אימון" לא קיבל `onclick` משלו — רק ה-`div` עטפן קיבל onclick.
בגלגול שונה של Tailwind CDN או מכשיר מסוים, הקליק לא הגיע ל-div.

**תיקון שנעשה (Session 37):**
- הוספנו `onclick="loadGame('id')"` ישירות לכל 17 כפתורות "התחל אימון"
- הפונקציות `loadGame()` ו-`showHome()` ממומשות עם null-checks כך שלא קורסות אם אלמנט חסר
- `_el(id)` helper function נוספה

### 2. האם זה עובד עכשיו?
**צריך לבדוק בדפדפן אחרי deploy.** GitHub Pages לוקח 1-3 דקות.
עשה hard-refresh: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac).

---

## 🏗️ ארכיטקטורה נוכחית (בעיה!)
**כל הקוד נמצא בקובץ אחד** `index.html` — 1700+ שורות.
זה לא מודולרי, קשה לתחזוקה, וקשה לבדוק כל משחק.

## 🚀 NEXT SESSION — ריפקטור מודולרי (מבנה מוצע)

```
Elders_Ai/
├── index.html              ← shell בלבד (HTML structure, no game JS)
├── css/
│   └── main.css            ← כל ה-CSS
├── js/
│   ├── core.js             ← i18n, routing, gameState, retention, utils
│   ├── games/
│   │   ├── memory.js
│   │   ├── wordsearch.js
│   │   ├── math.js
│   │   ├── simon.js
│   │   ├── sudoku.js
│   │   ├── shapes.js
│   │   ├── solitaire.js
│   │   ├── trivia.js
│   │   ├── numseq.js
│   │   ├── unscramble.js
│   │   ├── pairs.js
│   │   ├── truefalse.js
│   │   ├── flags.js
│   │   ├── proverbs.js
│   │   ├── hangman.js
│   │   ├── recall.js
│   │   └── oddoneout.js
│   └── ads.js              ← ad ticker rotation
└── images/
    ├── memory/thumb.jpg    ← תמונה מוכנה (600×400px)
    ├── oddoneout/thumb.jpg
    ├── math/thumb.jpg
    ... (17 תיקיות)
```

### איך להתחיל את הריפקטור:
1. צור קבצי `.js` ריקים לכל משחק
2. העבר כל `function init{Game}()` לקובץ שלו
3. עדכן `index.html` לטעון קבצים: `<script src="js/games/memory.js"></script>`
4. בדוק כל משחק בנפרד אחרי כל העברה

---

## 📁 תיקיות תמונות — מוכנות

```
images/memory/     ← תמונה למשחק זיכרון (שים thumb.jpg)
images/oddoneout/  ← תמונה ליוצא דופן
images/math/       ← תמונה לחשבון מהיר
images/wordsearch/ ← תמונה לחיפוש מילים
images/simon/      ← תמונה לרצף צבעים
images/sudoku/     ← תמונה לסודוקו
images/shapes/     ← תמונה לסדר וארגון
images/solitaire/  ← תמונה לסוליטר
images/trivia/     ← תמונה לטריוויה
images/numseq/     ← תמונה לרצף מספרים
images/unscramble/ ← תמונה לפענוח מילה
images/pairs/      ← תמונה לזוגות הפכים
images/truefalse/  ← תמונה לנכון/לא נכון
images/flags/      ← תמונה לדגלי העולם
images/proverbs/   ← תמונה לפתגמים
images/hangman/    ← תמונה לתלייה
images/recall/     ← תמונה לזיכרון תמונות
```

**כשמוסיפים תמונה:** שנה בקוד מ-`src="https://image.pollinations.ai/..."` ל-`src="images/memory/thumb.jpg"`
ראה `images/README.md` לפרטים.

---

## 📦 מה בנוי (17 משחקים — כולם production-ready)

| # | ID | שם | מצב |
|---|----|----|-----|
| 1 | memory | אימון זיכרון | ✅ |
| 2 | oddoneout | יוצא דופן | ✅ |
| 3 | math | חשבון מהיר | ✅ |
| 4 | wordsearch | חיפוש מילים | ✅ |
| 5 | simon | רצף צבעים | ✅ |
| 6 | sudoku | סודוקו יומי | ✅ |
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

---

## 🧱 ארכיטקטורה נוכחית

```
Stack:    HTML + Vanilla JS + Tailwind CSS CDN
Font:     Assistant (Google Fonts)
Colors:   --primary: #1a365d | --accent: #b7791f | --bg: #070d1c
i18n:     t('key') → i18nData[currentLang][key]
Routing:  location.hash = gameId | hashchange listener
Storage:  localStorage (gg_streak, gg_today_count, gg_total_games, gg_last_date, gg_hs_{id})
Games:    loadGame(id) → init{Game}(container) → levelComplete()
Images:   Pollinations Flux API (free, seed-stable) — fallback: images/ folder
```

---

## 🏦 הפעלת Google AdSense

1. פתח חשבון ב-https://adsense.google.com
2. הוסף דומיין: `adbitrush.github.io`
3. אמת בעלות (`<meta>` tag ב-`<head>`)
4. קבל אישור (~2 שבועות)
5. בקוד: חפש `TO ACTIVATE GOOGLE ADSENSE`

---

## 📋 Git Log (Session 37)

```
ef4b146  fix(ux): shimmer skeleton + .hidden CSS safety + eager image loading
d18cc6c  feat(thumbnails): restore Pollinations Flux AI images for all 17 game cards
9b9de6c  fix(grid): remove extra </div> closing premium-card prematurely in all 17 game cards
d31404e  feat(design): premium dark navy redesign — gold glow, glassmorphism cards
```
