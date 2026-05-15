# תמונות למשחקים — Game Images

כל תיקייה מכילה את התמונה (thumbnail) של המשחק המתאים.

## שימוש
1. שים/י תמונה בתיקייה המתאימה (JPG, PNG, WebP)
2. שמור/י את הקובץ בשם `thumb.jpg` (או `thumb.png` / `thumb.webp`)
3. בכל משחק ב-`index.html`, שנה/י את ה-`src` של ה-`<img>` ל: `images/{game}/thumb.jpg`

## מבנה התיקיות
```
images/
├── memory/          ← אימון זיכרון
├── oddoneout/       ← יוצא דופן  
├── math/            ← חשבון מהיר
├── wordsearch/      ← חיפוש מילים
├── simon/           ← רצף צבעים
├── sudoku/          ← סודוקו יומי
├── shapes/          ← סדר וארגון
├── solitaire/       ← סוליטר פירמידה
├── trivia/          ← טריוויה
├── numseq/          ← רצף מספרים
├── unscramble/      ← פענוח מילה
├── pairs/           ← זוגות הפכים
├── truefalse/       ← נכון / לא נכון
├── flags/           ← דגלי העולם
├── proverbs/        ← השלם את הפתגם
├── hangman/         ← תלייה
└── recall/          ← זיכרון תמונות
```

## גודל מומלץ
- 600×400px (יחס 3:2)
- פורמט: JPG, PNG, WebP
- עד 200KB לתמונה (GitHub Pages מוגבל ל-100MB בסה"כ)

## החלפת תמונה
בכל כרטיס משחק ב-`index.html`, מצא/י את שורת ה-`<img>`:
```html
<img src="https://image.pollinations.ai/prompt/..." class="thumbnail-img" ...>
```
שנה/י ל:
```html
<img src="images/memory/thumb.jpg" class="thumbnail-img" alt="memory">
```
