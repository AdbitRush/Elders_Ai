# HANDOFF — Golden Games (Elders_Ai)
**תאריך:** 2026-05-15 | **מצב:** ניתוח ראשוני + רשימת באגים + תוכנית

---

## מה קיים בריפו

הריפו מכיל **2 קבצי HTML** (ללא סיומת):
- `old1` — גרסה 1 ראשונה (~49K)
- `old2` — גרסה 2 נוכחית (~57K) — **זו הגרסה הפעילה**

### מה בנוי ב-old2 (1142 שורות):
- SPA מלא — HTML + Vanilla JS + Tailwind CSS דרך CDN
- **9 משחקים מיושמים** עם generation פרוצדורלי:
  1. Memory Match — היפוך קלפים, זוגות עם אימוג'י
  2. Odd One Out — 4×4 גריד, מצא את השונה
  3. Quick Math — חיבור/חיסור, קושי גדל עם רמה
  4. Word Search — גריד דינמי, מילים מוטמנות אנכית/אופקית
  5. Simon Sequence — רצף צבעים, async/await
  6. Sudoku — 4×4, מספרים אקראיים
  7. Shape Sorter — click-to-select + click-to-place
  8. Pyramid Solitaire — זוגות שסכומם 13
  9. General Trivia — בחירה מרובה, EN+HE
- i18n מלא (HE/EN) עם RTL/LTR switching
- מודל ניצחון (modal) גנרי
- UI: Navy #1a365d + Gold #b7791f — עיצוב בוגר ומכובד

---

## באגים קריטיים (לתקן לפני הכל)

### 🔴 BUG 1 — Trivia קורסת (שורה 1092)
```js
// קוד שבור:
const pool = i18nData[currentLang].trivia_qs;
// המפתח האמיתי ב-i18nData:
const pool = i18nData[currentLang].trivia_pool;
```
**תוצאה:** המשחק קורס ברגע שלוחצים על Trivia.

### 🔴 BUG 2 — Sudoku base solution שגויה (שורות 871-887)
```js
// הפתרון הנוכחי:
[1, 4, 3, 2],
[2, 3, 4, 1],
[3, 1, 4, 2],  // ← עמודה 3: 3,4,4,1 = שני 4-ים!
[4, 2, 1, 3]   // ← עמודה 4: 2,1,2,3 = שני 2-ים!
```
**תוצאה:** כל פאזל סודוקו אי-אפשר לפתור (contradictory solution).

**פתרון נכון:**
```js
[1, 2, 3, 4],
[3, 4, 1, 2],
[2, 1, 4, 3],
[4, 3, 2, 1]
```

### 🟡 BUG 3 — Shape Sorter: drop zones ריקות
ה-drop zone מציג משבצת ריקה עם קו מקווקו — המשתמש לא יודע **איזו צורה** שייכת לכל חריץ.
צריך להציג ghost/outline של הצורה (opacity: 0.3) בכל drop zone.

### 🟡 BUG 4 — Word Search: אין validation מיקום
לחיצה על תאים לא-סמוכים יכולה "לגלות" מילה מקרית. צריך לוודא שהתאים הנבחרים סמוכים (אופקית או אנכית).

---

## מה חסר מה-README ולא מיושם

| פיצ'ר | מצב |
|--------|------|
| **Retention Engine** (localStorage) | ❌ לא קיים בכלל |
| Daily Streak (אש) | ❌ לא קיים |
| דשבורד אישי + ברכה לפי שעה | ❌ לא קיים |
| Wellness Nudges (מים/מתיחה) | ❌ לא קיים |
| Daily Goal (שחק 3 משחקים) | ❌ לא קיים |

---

## מה לבנות עכשיו — סדר עדיפויות

### שלב 1 — Fix Bugs (30 דק')
1. `trivia_qs` → `trivia_pool`
2. תיקון base solution של Sudoku
3. Ghost shapes ב-Shape Sorter

### שלב 2 — Retention Engine (~2 שעות)
```js
// localStorage keys:
localStorage.setItem('gg_streak', N)
localStorage.setItem('gg_last_play', date)
localStorage.setItem('gg_today_count', N)
```
- ברכה לפי שעה (בוקר/ערב/לילה) בעמוד הבית
- counter "שחקת X מתוך 3 משחקים היום"
- Streak bar עם אימוג'י אש
- Wellness nudge: 25% אחרי כל שלב מנצח

### שלב 3 — Trivia Pool Expansion
6 שאלות = גמור ב-2 שלבים. צריך 30+ שאלות בעברית ו-30+ באנגלית.

### שלב 4 — שם קובץ + Hosting
- לשנות את שם `old2` ל-`index.html`
- להוסיף `index.html` כ-GitHub Pages entry point
- הפעלה: Settings → Pages → main branch → / root

### שלב 5 (אופציונלי) — משחק חדש
**Word Connect** (חיבור מילים) או **Number Pairs** — קל לבנות, מגוון את הcatalog.

---

## טכנולוגיה — תזכורת לסשן הבא
- **Stack:** HTML + Vanilla JS + Tailwind CDN (ללא frameworks)
- **Font:** `Assistant` (Google Fonts) — optimized for Hebrew
- **Colors:** `--primary: #1a365d` | `--accent: #b7791f` | `--bg: #f8fafc`
- **i18n pattern:** `t('key')` function → `i18nData[currentLang][key]`
- **Game lifecycle:** `loadGame(id)` → `init{Game}(container)` → `levelComplete()`

---

## סטטוס מהסשן הזה
- [x] ניתוח מלא של הקוד הקיים
- [x] זיהוי 4 באגים (2 קריטיים)
- [x] תוכנית עבודה מסודרת
- [ ] תיקון הבאגים (הסשן הבא)
- [ ] בניית Retention Engine
- [ ] GitHub Pages deployment
