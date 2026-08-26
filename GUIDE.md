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

## Turn on cross-device progress (optional, ~5 minutes)

Progress is stored in each player's own browser. Nothing leaves their device and
there is no account — which also means a new phone starts from zero. To let
progress follow someone between devices:

1. Create a free project at **supabase.com**.
2. **SQL Editor -> New query** -> paste all of `supabase_schema.sql` -> **Run**.
3. **Settings -> API** -> copy **Project URL** and the **anon public** key into
   the two blanks at the top of `js/sync.js`.
4. Bump `CACHE` in `sw.js` and the `?v=` on the script tags, then push.

A 📱 button appears in the navbar. The player taps **Show my code**, gets six
characters, and types them on the other device. No email, no password.

The anon key is *meant* to be public — it is in the page source of every
Supabase site. It is safe here because the tables grant anon nothing directly:
all access goes through four `SECURITY DEFINER` functions that require the
player's secret id. Do **not** paste the `service_role` key; that one bypasses
everything.

Until step 3 is done the whole feature is inert — no button, no network calls,
no errors.

## For developers
- Static site: `index.html` (core + i18n) + `js/games/*.js` (one file per game) +
  feature modules (`js/*.js`). Service worker `sw.js` — **bump `CACHE` version on every
  change** or users get stale code.
- Add a game: js/games file + `validIds`/`games` arrays + titleMap/instMap + dispatch +
  homescreen card + i18n keys ×6 + script tag + sw precache (see klondike commit as template).
- Verify: render sweep — load every game in every language, catch `window.onerror`
  (2026-07-19 sweep: 156/156 clean).
