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

## 📦 מה בנוי (index.html — ~1500 שורות)

### 17 משחקים:
| # | ID | שם | קוגניציה |
|---|----|----|-----------|
| 1 | memory | אימון זיכרון | זיכרון קצר-טווח |
| 2 | oddoneout | יוצא דופן | קשב ויזואלי |
| 3 | math | חשבון מהיר | עיבוד מידע |
| 4 | wordsearch | חיפוש מילים | שפה ודפוסים |
| 5 | simon | רצף צבעים | זיכרון עבודה |
| 6 | sudoku | סודוקו יומי | היסק לוגי |
| 7 | shapes | סדר וארגון | מרחבי |
| 8 | solitaire | סוליטר פירמידה | פונקציה ניהולית |
| 9 | trivia | טריוויה | זיכרון ארוך-טווח |
| 10 | numseq | רצף מספרים | לוגיקה |
| 11 | unscramble | פענוח מילה | שפה |
| 12 | pairs | זוגות הפכים | אוצר מילים |
| 13 | truefalse | נכון / לא נכון | ידע כללי |
| 14 | flags | דגלי העולם | זיהוי ויזואלי |
| 15 | proverbs | השלם את הפתגם | זיכרון תרבותי |
| 16 | hangman | תלייה | שפה + ניחוש |
| 17 | recall | זיכרון תמונות | שחזור זיכרון |

### תשתיות:
- **תמונות AI** — כל 17 כרטיסים: Pollinations.ai Flux, seed קבוע (1001-1017)
- **Retention Engine** — streak יומי, יעד 3 משחקים, ברכה לפי שעה, wellness nudges
- **High Scores** — localStorage לכל 17 משחקים + badge על הכרטיסים
- **Deep Links** — `/#gameId` + `?lang=en` לאנגלית
- **Sound Engine** — Web Audio API (ללא קבצים חיצוניים)
- **Confetti** — CSS animation ב-levelComplete
- **i18n** — עברית RTL + אנגלית LTR, `changeLanguage()`
- **Mobile** — touch-action, viewport, touch targets ≥44px

### פרסומות:
- **פס תחתון קבוע** (`#adBar`, 52px, dismissible) — ticker מסתובב כל 6 שניות
- **אזור צד** (`#adSide`, 160×250, נראה בלבד ≥1440px רוחב)
- **תשתית AdSense מוכנה** — קוד מוכן כ-comment, מחכה לאישור חשבון
- **איך להפעיל:** ראה הוראות בהמשך ↓

---

## 🏦 הפעלת Google AdSense (כשתרצה)

1. פתח חשבון ב-https://adsense.google.com
2. הוסף את הדומיין: `adbitrush.github.io`
3. אמת בעלות על ידי הוספת `<meta>` tag ל-`<head>`
4. קבל אישור (לוקח ~2 שבועות)
5. צור Ad Unit מסוג **Display** (468×60 להגדרת ה-bar, 160×250 לצד)
6. בקוד: חפש `TO ACTIVATE GOOGLE ADSENSE` בשני מקומות ב-index.html
7. החלף את `#adFallback` ואת `#adSideContent` בקוד AdSense

**פורמטים לבקש:**
- Bottom bar: `468×60` (Leaderboard) או `Responsive`
- Side panel: `160×250` (Small Rectangle)

---

## 🧱 ארכיטקטורה

```
Stack:    HTML + Vanilla JS + Tailwind CSS CDN
Font:     Assistant (Google Fonts) — מותאם לעברית
Colors:   --primary: #1a365d | --accent: #b7791f | --bg: #f8fafc
i18n:     t('key') → i18nData[currentLang][key]
Routing:  location.hash = gameId | hashchange listener
Storage:  localStorage (gg_streak, gg_today_count, gg_total_games, gg_last_date, gg_hs_{id})
Games:    loadGame(id) → init{Game}(container) → levelComplete()
```

---

## 🚀 המשך עבודה אפשרי

| | פיצ'ר | עדיפות |
|---|-------|--------|
| 🟥 | הפעלת AdSense אמיתי | אחרי קבלת אישור |
| 🟧 | PWA (מותקן כאפליקציה) — manifest.json + service worker | גבוהה |
| 🟨 | עוד 5 משחקים: Crossword, Sudoku 6×6, Anagram, Category Sort, Photo Match | בינונית |
| 🟩 | Social Share buttons — "שתף את התוצאה שלי" | בינונית |
| 🟦 | Analytics קל (Plausible/Umami — privacy-first) לראות כמה משתמשים | אופציונלי |

---

## 📋 Git Log (עיקרי)

```
aea97b1  feat(images): replace all 17 thumbnails with AI images (Flux)
08f9807  feat(games): add 5 new games — 17 total, mobile-ready
31c80d5  feat(routing): add deep-link hash routing
c6d24c6  chore: update HANDOFF
ac84650  feat(v2): Golden Games v2 — 12 games, sound, confetti, high scores
```
