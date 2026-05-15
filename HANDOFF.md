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

## 📦 מה בנוי (index.html — ~1650 שורות)

### 17 משחקים (כולם production-ready):
| # | ID | שם | קוגניציה | עומק |
|---|----|----|-----------|------|
| 1 | memory | אימון זיכרון | זיכרון קצר-טווח | מרובה רמות |
| 2 | oddoneout | יוצא דופן | קשב ויזואלי | **10 סיבובים/סשן** |
| 3 | math | חשבון מהיר | עיבוד מידע | **10 שאלות/סשן** |
| 4 | wordsearch | חיפוש מילים | שפה ודפוסים | מרובה רמות |
| 5 | simon | רצף צבעים | זיכרון עבודה | ∞ רמות, גיים-אובר בכישלון |
| 6 | sudoku | סודוקו יומי | היסק לוגי | **9×9 מלא** |
| 7 | shapes | סדר וארגון | מרחבי | מרובה רמות |
| 8 | solitaire | סוליטר פירמידה | פונקציה ניהולית | מרובה רמות |
| 9 | trivia | טריוויה | זיכרון ארוך-טווח | **10 שאלות/סשן** |
| 10 | numseq | רצף מספרים | לוגיקה | **10 שאלות/סשן** |
| 11 | unscramble | פענוח מילה | שפה | **7 מילים/סשן** |
| 12 | pairs | זוגות הפכים | אוצר מילים | מרובה רמות |
| 13 | truefalse | נכון / לא נכון | ידע כללי | **8 שאלות/סשן + ניקוד** |
| 14 | flags | דגלי העולם | זיהוי ויזואלי | **10 שאלות/סשן + ניקוד** |
| 15 | proverbs | השלם את הפתגם | זיכרון תרבותי | **6 פתגמים/סשן + ניקוד** |
| 16 | hangman | תלייה | שפה + ניחוש | מרובה מילים |
| 17 | recall | זיכרון תמונות | שחזור זיכרון | מרובה רמות |

### תשתיות:
- **SVG thumbnails** — כל 17 כרטיסים: inline SVG art (ללא תלות חיצונית, מיידי)
- **Retention Engine** — streak יומי, יעד 3 משחקים, ברכה לפי שעה, wellness nudges
- **Session Scores** — `levelComplete()` מציג X/Y תשובות נכונות לכל משחק session-based
- **High Scores** — localStorage לכל 17 משחקים + badge על הכרטיסים
- **Deep Links** — `/#gameId` + `?lang=en` לאנגלית
- **Sound Engine** — Web Audio API (ללא קבצים חיצוניים)
- **Confetti** — CSS animation ב-levelComplete
- **i18n** — עברית RTL + אנגלית LTR, `changeLanguage()`
- **Mobile** — touch-action, viewport, touch targets ≥44px
- **Hero** — dark navy gradient, premium dark theme

### פרסומות:
- **פס תחתון קבוע** (`#adBar`, 52px, dismissible) — ticker מסתובב כל 6 שניות
- **אזור צד** (`#adSide`, 160×250, נראה בלבד ≥1440px רוחב)
- **תשתית AdSense מוכנה** — קוד מוכן כ-comment, מחכה לאישור חשבון

---

## 🏦 הפעלת Google AdSense (כשתרצה)

1. פתח חשבון ב-https://adsense.google.com
2. הוסף את הדומיין: `adbitrush.github.io`
3. אמת בעלות על ידי הוספת `<meta>` tag ל-`<head>`
4. קבל אישור (לוקח ~2 שבועות)
5. צור Ad Unit מסוג **Display** (468×60 להגדרת ה-bar, 160×250 לצד)
6. בקוד: חפש `TO ACTIVATE GOOGLE ADSENSE` בשני מקומות ב-index.html
7. החלף את `#adFallback` ואת `#adSideContent` בקוד AdSense

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
Session:  gs._sq (total), gs._si (index), gs._ss (score) → gs._sessionScore={correct,total}
```

---

## 🚀 המשך עבודה אפשרי

| | פיצ'ר | עדיפות |
|---|-------|--------|
| 🟥 | הפעלת AdSense אמיתי | אחרי קבלת אישור |
| 🟧 | PWA (מותקן כאפליקציה) — manifest.json + service worker | גבוהה |
| 🟨 | עוד 5 משחקים: Crossword, Anagram, Category Sort, Photo Match | בינונית |
| 🟩 | Social Share buttons — "שתף את התוצאה שלי" | בינונית |
| 🟦 | Analytics קל (Plausible/Umami — privacy-first) | אופציונלי |
| 🟦 | Pairs + Shapes — convert to session mode (currently level-based) | אופציונלי |

---

## 📋 Git Log (עיקרי)

```
98b48f5  feat(games): production-ready upgrade pass — session scores + depth
bb80855  fix(mission): redesign Domain Picker + fix purple button text color (ABRI)
3277c44  chore(Session 35): update HANDOFF
14e40fc  fix(mission): redesign Domain Picker + fix purple button text color
bc31587  feat(dashboard): add Dashboard tab — KPIs, system controls, orphan ads panel
aea97b1  feat(images): replace all 17 thumbnails with AI images (Flux)
```
