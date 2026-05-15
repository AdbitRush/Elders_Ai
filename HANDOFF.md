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

## 📦 מה בנוי (index.html — ~1700 שורות)

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
- **Pollinations Flux thumbnails** — כל 17 כרטיסים: `<img>` from Pollinations.ai free API (seed-stable)
- **Shimmer skeleton** — thumbnail-container מציג shimmer animation עד שהתמונה נטענת, אחר כך fade-in
- **`.hidden { display:none !important; }` CSS fallback** — משחקים עובדים גם אם Tailwind CDN נכשל
- **CSS grid fallback** — #homeScreen תמיד מציג גריד גם אם Tailwind CDN נכשל
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

## 🐛 בעיות שנפתרו (Session 37 — 2026-05-15)

| בעיה | פתרון |
|------|-------|
| גריד שבור — "חלון אחד וכל השאר מתחת לשני" | **תוספת `</div>` בכל 17 כרטיסים** סגרה את `.premium-card` לפני `.p-5` → הסרנו את ה-div הזה |
| תמונות AI נעלמו | Pollinations Flux API images שוחזרו עם כל 17 prompts ו-seeds |
| תמונות טוענות לאט (Pollinations יכול לקחת 30-60 שניות) | shimmer skeleton animation + fade-in כשהתמונה נטענת |
| משחקים לא עובדים אם Tailwind CDN נכשל | `.hidden { display:none !important; }` CSS fallback נוסף |
| Word Search — מילים לא ניתנות למציאה | filter pool לפי גודל grid + tracking רק מילים שהוצבו |

---

## ⚠️ ידוע — Pollinations Images

- Pollinations.ai **מייצר תמונות on-demand** — הפעם הראשונה שכל URL נטען עשויה לקחת 15-60 שניות
- לאחר הגנרציה הראשונה, Pollinations **מcache** את התמונות לפי seed → טעינות חוזרות מהירות
- כל 17 seeds קבועות (1001-1017) → אותן תמונות בכל פעם
- **Shimmer animation** מחביאה את ה-latency
- אם Pollinations API נופל: onerror handler → gradient כחול-כהה (לא broken image)

---

## 🏦 הפעלת Google AdSense (כשתרצה)

1. פתח חשבון ב-https://adsense.google.com
2. הוסף את הדומיין: `adbitrush.github.io`
3. אמת בעלות על ידי הוספת `<meta>` tag ל-`<head>`
4. קבל אישור (לוקח ~2 שבועות)
5. צור Ad Unit מסוג **Display** (468×60 להגדרת ה-bar, 160×250 לצד)
6. בקוד: חפש `TO ACTIVATE GOOGLE ADSENSE` בשני מקומות ב-index.html

---

## 🧱 ארכיטקטורה

```
Stack:    HTML + Vanilla JS + Tailwind CSS CDN
Font:     Assistant (Google Fonts) — מותאם לעברית
Colors:   --primary: #1a365d | --accent: #b7791f | --bg: #070d1c
i18n:     t('key') → i18nData[currentLang][key]
Routing:  location.hash = gameId | hashchange listener
Storage:  localStorage (gg_streak, gg_today_count, gg_total_games, gg_last_date, gg_hs_{id})
Games:    loadGame(id) → init{Game}(container) → levelComplete()
Session:  gs._sq (total), gs._si (index), gs._ss (score) → gs._sessionScore={correct,total}
Images:   https://image.pollinations.ai/prompt/{prompt}?width=600&height=400&nologo=true&seed={1001-1017}&model=flux
```

---

## 🚀 NEXT SESSION PRIORITIES

### 🔴 CRITICAL — לפני פרסום רחב:
1. **בדוק כל 17 משחקים ידנית** — לחץ כל כרטיס ושחק עד סיום/level complete
2. **בדוק על נייד** (iOS Safari + Android Chrome) — touch targets, RTL, scroll
3. **Pollinations image quality** — אם תמונות כלשהן נראות גרועות, שנה את ה-prompt באותו כרטיס (seed ו-model=flux)

### 🟧 גבוה:
4. **PWA** — `manifest.json` + service worker → ניתן להתקין כ-app ממסך הבית
5. **Hard-refresh cache buster** — הוסף `?v=2` ל-Tailwind CDN URL כדי למנוע cache issues

### 🟨 בינוני:
6. **Social Share** — "שתף את התוצאה שלי" בסיום כל משחק
7. **עוד 5 משחקים** — Crossword, Anagram, Category Sort, Photo Match
8. **Pairs + Shapes** — המר ל-session mode (כרגע level-based)

### 🟦 אופציונלי:
9. **Google AdSense** — אחרי קבלת אישור חשבון
10. **Analytics קל** (Plausible/Umami — privacy-first)

---

## 📋 Git Log (עיקרי Session 37)

```
d18cc6c  feat(thumbnails): restore Pollinations Flux AI images for all 17 game cards
9b9de6c  fix(grid): remove extra </div> closing premium-card prematurely in all 17 game cards
d31404e  feat(design): premium dark navy redesign — gold glow, glassmorphism cards, gradient hero
```
