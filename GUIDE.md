# Golden Games (Elders_Ai) — Complete Guide

**Live:** https://adbitrush.github.io/Elders_Ai/ · GitHub Pages PWA · no ads, no tracking.

## What it is
**27 brain-training games for seniors** in **6 languages** (עברית, English, Español,
Français, Deutsch, Ελληνικά). Direct game links: `/#klondike`, `/#tetris`, `/#simon`…

## The games
Klondike Solitaire (classic, click-to-move, Undo/Hint) · Memory · Odd One Out · Math ·
Word Search · Simon · Sudoku · Shapes · Pyramid Solitaire · Trivia · Number Sequence ·
Unscramble · Pairs · True/False · Flags · Proverbs · Hangman · Recall · Tetris ·
Color Match · Digit Span · Clock · Counting · Category · Letters · Life Sim · Safari

## Options & accessibility
- **Difficulty** Easy/Normal/Hard — wired into every game (speed, pairs, draw-3…)
- **🔠 Text size** A/A+/A++ (persists) · **🔊 Sound ON/OFF** (persists)
- Keyboard navigation, ARIA live announcements, big touch targets
- **Levels** persist per game; 🏅 high-score badges; streaks + daily counter
- **Daily Challenge**, Achievements, Favorites/recently-played, skill Categories,
  Brain Score, per-game share buttons

## For developers
- Static site: `index.html` (core + i18n) + `js/games/*.js` (one file per game) +
  feature modules (`js/*.js`). Service worker `sw.js` — **bump `CACHE` version on every
  change** or users get stale code.
- Add a game: js/games file + `validIds`/`games` arrays + titleMap/instMap + dispatch +
  homescreen card + i18n keys ×6 + script tag + sw precache (see klondike commit as template).
- Verify: render sweep — load every game in every language, catch `window.onerror`
  (2026-07-19 sweep: 156/156 clean).
