# Handoff: nostalgia batch 3 (50 more games) + site improvements, 2026-11-04

Branch `claude/friendly-ritchie-c0pysj`, based on `origin/main` 28a97cd (live deploy d1e0112 + docs).
Nothing here was deployed, published or pushed; the VPS and server settings were not touched.
Delivered as git bundles (see the end) for the PC/VPS session to review, merge and deploy.

## Inventory

Live before this work: 75 games, 17 articles. After: **125 games** (75 + 50), 17 articles (no article changes).
All 50 are wave 7 in `tools/new_games.json`, built on the NK kit (`js/nostalgia-kit.js`), one file each in `js/games/<id>.js`,
each with a card picture (`images/cards/<id>.jpg`, a real screenshot) and landing pages in all 6 languages.

| # | id | Title | Section | Batch |
|---|----|-------|---------|-------|
| 1 | hanoi | Tower of Hanoi | puzzlebook | A |
| 2 | queens | Eight Queens | puzzlebook | A |
| 3 | knightour | Knight's Tour | puzzlebook | A |
| 4 | jugs | Water Jugs | puzzlebook | A |
| 5 | river | River Crossing | puzzlebook | A |
| 6 | balance | Balance Scale | puzzlebook | A |
| 7 | magicsq | Magic Square | puzzlebook | A |
| 8 | numpyramid | Number Pyramid | puzzlebook | A |
| 9 | frogswap | Frog Swap | puzzlebook | A |
| 10 | matchfix | Matchstick Fix | puzzlebook | A |
| 11 | cagemath | Cage Math | puzzlebook | B |
| 12 | skyline | City Skyline | puzzlebook | B |
| 13 | bridges | Island Bridges | puzzlebook | B |
| 14 | lamps | Lamplighter | puzzlebook | B |
| 15 | tents | Campground | puzzlebook | B |
| 16 | dropquote | Drop Quote | words | B |
| 17 | dotdot | Dot to Dot | pastimes | B |
| 18 | fenceloop | Fence Loop | puzzlebook | B |
| 19 | hose | Garden Hose | puzzlebook | B |
| 20 | parking | Parking Lot | puzzlebook | B |
| 21 | golfsol | Golf Solitaire | cards | C |
| 22 | cribbage | Cribbage | cards | C (replaces Pyramid, see below) |
| 23 | accordion | Accordion | cards | C |
| 24 | calculation | Calculation | cards | C |
| 25 | pokersq | Poker Squares | cards | C |
| 26 | hilo | High-Low Ladder | cards | C |
| 27 | kingscorner | Kings in the Corner | cards | C |
| 28 | casino | Casino | cards | C |
| 29 | spades | Spades | cards | C |
| 30 | oldmaid | Old Maid | cards | C |
| 31 | nim | Nim Rows | pastimes | D |
| 32 | foxgeese | Fox and Geese | pastimes | D |
| 33 | fiverow | Five in a Row | pastimes | D |
| 34 | hex | Hex | pastimes | D |
| 35 | ur | Royal Game of Ur | pastimes | D |
| 36 | hotdice | Hot Dice | pastimes | D |
| 37 | liarsdice | Liar's Dice | pastimes | D |
| 38 | shipcrew | Ship, Captain and Crew | pastimes | D |
| 39 | mate1 | Mate in One | puzzlebook | D |
| 40 | starhop | Star Hop | pastimes | D |
| 41 | crane | Claw Crane | arcade | E |
| 42 | muncher | Cheese Chase | arcade | E |
| 43 | gemswap | Gem Swap | arcade | E |
| 44 | bubbles | Bubble Pop | arcade | E |
| 45 | adventure | The Old Lighthouse | handheld | E |
| 46 | cavehunt | Cave Hunt | handheld | E |
| 47 | wagontrail | Prairie Wagon | handheld | E |
| 48 | telegraph | Telegraph Office | handheld | E |
| 49 | crates | Crate Shove | handheld | E |
| 50 | victorygarden | Victory Garden | pastimes | E |

Duplicate check against the 75 live games was done on mechanics, not names. Two planned games were dropped as
duplicates and replaced: a word search (the original `wordsearch` exists) became **Fence Loop**, and **Pyramid
Solitaire** (built and committed in 3C) was found to repeat the original `solitaire` game (pairs to 13) and was
removed and replaced by **Cribbage** in a later commit. Gaps (Montana) was dropped because 13 columns of cards are
unreadable on a phone. Original content only: invented puzzle rooms, pictures, sayings are old proverbs, no brands.

Puzzle content is generated or verified by solvers, never hand-guessed: Cage Math / City Skyline keep only puzzles
with exactly one answer; Parking Lot boards (90) and Crate Shove rooms (36) were found by breadth-first solvers and
carry the fewest moves; Mate in One positions (106) come from engine self-play and have exactly one mating move;
Island Bridges, Lamplighter, Campground, Fence Loop and Garden Hose are grown from a real solution and accept any
valid answer.

## Site improvements (separate commits)

- `site: compact game header` (23254f4): the game-screen title block is shorter so the board comes first; Chess
  board bottom 845 -> 762 px at 1280x800 (fits), Sudoku 826 -> 755.
- `review fixes` (8476ce7): one persistent live region for every NK game (Pick-Up Sticks feedback is now announced);
  Shut the Box tiles announce open / picked / shut.
- `site: hub search box and a filter chip for every section` (57f26d6): chips covered only 4 of 8 sections; now all
  8 plus a search box (titles and descriptions, live count, clear button, no-match message). Checked en/he/es.
- `site: canonical domain` (see log): sitemap, robots.txt, canonical, hreflang and og:url pointed at
  adbitrush.github.io/Elders_Ai; they now point at the live site https://games.178-105-148-72.sslip.io/.
- Chess "278 px overflow after resizing to 390": investigated, **not reproduced** (1280/1440/1920 -> 390, idle and
  mid-game, every frame for 1.5 s: 0 px overflow). Likely the moment before warm.js moves header controls into the
  menu on its media-query change. No code change made for it.

## Tests (actual play, not page loads)

`tools/preview/play-nostalgia3.js` plays every game to its real end screen through clicks, taps and keys
(`play-nostalgia3-drivers.js`, one driver per game, each also tries at least one forbidden move and records the
game's answer), then checks: restart x3 adds no key listeners; a held (repeat) Enter does nothing; focus survives a
redraw; Ctrl+R/L/F are not blocked; a shortcut still works when the key carries a Hebrew character; a finish from an
old session is ignored; Enter on the focused header Back button works; Next opens Level 2 (or Play again after a
loss); back to the hub and reopen works. Win AND loss end screens both count as a complete loop (the drivers are
honest players, they do not cheat to win).

RESULTS_PLACEHOLDER

Layout sweep (`sweep-nostalgia2.js`: 320 dark with 130% text, 390 light with 130% text, 390 Hebrew RTL, 1280 dark;
no horizontal scroll, nothing outside the game box, no small buttons, no script errors): all 50 games, all 4
variants OK after the fixes listed below.

Balance checks by simulation (not by feel): Cheese Chase and Prairie Wagon were far too hard at first (a careful
bot won 10% / 0% on normal); retuned to normal 38% / 70% for the bot (people plan better), easy higher, hard lower.

Found and fixed during testing (selection): Fence Loop gap buttons half a button off (kit resets transform; also
Hex and Star Hop), Dot to Dot board hidden under the sticky site bar after Next picture, Cage Math init name,
Golf Solitaire 7th column clipped at 390, Five in a Row missing vertical lines, Hex 9x9 cells too small on phones
(now 6/7/9), Claw Crane prizes overlapping, Telegraph keyboard off-screen, Fox and Geese could go on forever (now
a move limit), several 320 px large-text overflows.

Not tested: real phones, real screen readers, human players, native speakers. play-all/e2e suites were not run;
their expected counts (75 cards, about-page count) must be updated to 125 before they will pass.

## Integration notes (shared files)

Generated, rebuild instead of hand-merging: `index.html` gen blocks, `sw.js` precache list, `about.html` game
list, `sitemap.xml`, `robots.txt`, `<lang>/<id>/` landing pages. Commands:
`python3 tools/build_new_games.py && python3 tools/build_pages.py`.
Hand-edited shared files that may conflict with other sessions: `tools/new_games.json` (50 entries inserted before
the wave-3 `songtitle` entry; sections puzzlebook and handheld added), `js/nostalgia-kit.js` (live region),
`css/warm.css` (header and search rules appended at the end), `js/hub-nav.js`, `tools/build_pages.py` (SITE).
Bump ASSET_V / the service-worker cache name on deploy as usual.
