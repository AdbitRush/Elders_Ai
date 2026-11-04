# Nostalgia batch 2 (2026-11-04): 20 more games + 4 history articles, cloud session

Branch `claude/friendly-ritchie-c0pysj`. **Not merged, not pushed (no write access), not published, not deployed.**
Base: `7738ffd` = the head of the first bundle (`nostalgia-batch.bundle`, Mancala / Dots and Boxes / Peg Jump /
Kitchen Table Dice / Boardwalk Roll), which PC Claude has integrated separately. Nothing in batch 1 was changed here.

## Bundles (import in order; each is incremental)

| Bundle | Range | Contents |
|---|---|---|
| `nostalgia-batch2-A.bundle` | `7738ffd..b1eac94` | NK kit + Reversi, Four in a Row, Shut the Box, Light Switch Puzzle, Placemat Maze |
| `nostalgia-batch2-BC.bundle` | `b1eac94..ed392b2` | Nine Men's Morris, Sea Salvo, Bingo Night, Moon Landing, Jelly Bean Jar; Six-Card Golf, Cross Sums, Logic Grid, Fill-In Puzzle, Color by Number |
| `nostalgia-batch2-D.bundle` | `ed392b2..HEAD` | Chess, Rail Yard Shuffle, Twenty Questions, Pick-Up Sticks, Tile Match; 4 articles; this handoff |
| `nostalgia-batch2-all.bundle` | `7738ffd..HEAD` | everything above in one file |

Ref names inside the bundles (verified by importing all of them, in order, into a fresh clone of main):
```
git fetch nostalgia-batch.bundle        claude/friendly-ritchie-c0pysj:nostalgia1    # first batch, head 7738ffd
git fetch nostalgia-batch2-A.bundle     nb2-A:nostalgia2-A                           # head b1eac94
git fetch nostalgia-batch2-BC.bundle    nb2-BC:nostalgia2-BC                         # head ed392b2
git fetch nostalgia-batch2-D.bundle     claude/friendly-ritchie-c0pysj:nostalgia2-D  # head = this commit
git fetch nostalgia-batch2-all.bundle   claude/friendly-ritchie-c0pysj:nostalgia2    # same head as -D
```
Each incremental bundle needs the previous head in the repository (A needs 7738ffd, BC needs b1eac94, D needs ed392b2).

Every batch is two kinds of commit: **"(new files)"** commits add only new paths (game files, card images, landing
pages, articles, test tools) and can be cherry-picked as they are; **"(integration)"** commits touch shared files and
are all reproducible (see below). Suggested import: cherry-pick the "(new files)" commits, then redo integration.

## The 20 games (all original implementations; no commercial names, art or assets)

| id | Title | Section | Nostalgia source | Mechanic |
|---|---|---|---|---|
| reversi | Reversi | pastimes | 19th-c. board game | flip-capture vs computer (1/1/3-ply) |
| fourrow | Four in a Row | pastimes | upright drop game | gravity connect-four vs computer (2/4/6-ply), two-step drop |
| shutbox | Shut the Box | pastimes | pub dice game | tiles summing to the roll, 3 rounds vs computer |
| lights | Light Switch Puzzle | handheld | 70s handheld light grids | toggle neighbors; exact par by GF(2) elimination |
| maze | Placemat Maze | puzzlebook | diner placemat maze | perfect maze, corridor-following moves |
| morris | Nine Men's Morris | pastimes | mill board game | place / move / fly, mills remove (1/2/3-ply) |
| salvo | Sea Salvo | pastimes | squared-paper fleet game | hidden fleets, alternate shots, hunt-target AI |
| bingo | Bingo Night | pastimes | community-hall 75-ball bingo | self-daub, four patterns, computer tables (luck, said so) |
| moonland | Moon Landing | handheld | 1969 typed lunar game | turn-based throttle/fuel physics (tuned by simulation) |
| jellybean | Jelly Bean Jar | pastimes | county-fair guessing jar | count/estimate, ribbons |
| golf | Six-Card Golf | pastimes | kitchen-table card game | swap/flip, column pairs, 3 holes vs computer |
| crosssums | Cross Sums | puzzlebook | puzzle-magazine number crossword | generated, solver-checked unique |
| logicgrid | Logic Grid | puzzlebook | puzzle-magazine deduction | generated, solver-checked unique, minimal clue set |
| fillin | Fill-In Puzzle | puzzlebook | newspaper fill-ins | generated grid from an original 174-word list |
| colorbynum | Color by Number | pastimes | 1950s paint-by-number | region painting on original pixel pictures |
| chess | Chess | pastimes | park-bench chess | full rules, take-backs, perft-verified generator |
| railyard | Rail Yard Shuffle | pastimes | Inglenook-style shunting puzzle | sidings with capacities; reverse-generated, par by BFS |
| twentyq | Twenty Questions | pastimes | 1946 radio parlor game | 30 things x 33 verified yes/no questions |
| sticks | Pick-Up Sticks | pastimes | toy-box classic | occlusion: lift only uncovered sticks |
| tilematch | Tile Match | pastimes | mahjong-style tile solitaire | free-tile pairs, deals solvable by construction |

No game needs a clock (Boardwalk's optional moving aim was batch 1). Each has full rules under "How to play", a
status line, restart / new game, keyboard play, a win end and an honest "Nice try" end via the shared end screen.

## Duplicate check and its gap

Checked against the 51 games on this branch and the planned wave-3 (trivia) / wave-4 (arcade) ids in
`tools/new_games.json`. **Gap:** the preview (d627950) could not be reached (proxy 403), so the Gentle Practice games
(Name Garden, Pattern Workshop, The Quiet Shelf, A Day in Town, Porch Rhythm) were checked **by name only**; I avoided
name recall, pattern copying, shelf sorting, errand/route planning and rhythm. Of the 13 preview articles only the 3 on
this branch were visible, so the 4 new articles are history notes (not health topics) to keep overlap unlikely.
Please compare mechanics and article topics on the PC before publishing.

## Shared runtime: `js/nostalgia-kit.js` (NK) - and the batch-1 risks it addresses

Verified on my copy of batch 1 (unchanged; PC Claude owns those fixes): after 3 restarts keydown listeners grew
5 -> 8 in Kitchen Table Dice, Mancala and Boardwalk; one R press then rolled the dice 3 times; R on a Hebrew layout
did nothing; Enter on the focused header "Back to Menu" was swallowed in Boardwalk. The NK kit prevents these for
the 20 new games:
- one global capture-phase key listener for all NK games; start/restart/level-up never adds listeners;
- action keys ignore auto-repeat (held keys act once); only focus movement may repeat;
- Enter/Space on a focused control outside the game area are left to the browser (and kept away from kbnav.js);
- Ctrl/Cmd/Alt combinations are never handled or prevented;
- letter shortcuts match `e.code` (physical key), so they work on Hebrew and other layouts;
- `data-k` focus restore after every redraw; the root element is created once per session (premium.css's entrance
  animation no longer replays on every move);
- session-scoped timers (`NK.after/every/raf`) and `NK.finish`, so a finish from an old session never opens the end
  screen after a restart;
- `dir="ltr"` game root and `dir="auto"` on status lines and the shared title / instructions / end-screen text, so
  English punctuation sits correctly on RTL pages.
Root cause outside my files, left as is: `js/kbnav.js` calls `preventDefault()` on Enter/Space for every key event
during any game, which blocks native Enter on focused header buttons for all non-NK games.

## Integration points (shared files)

- `index.html`: one line `<script src="js/nostalgia-kit.js?v=77"></script>` right after `game-kit.js`; all other
  changes are inside the `gen:` blocks.
- `sw.js`: `'./js/nostalgia-kit.js',` after `'./js/game-kit.js',` in the precache list; the rest is the `gen:` block.
- `tools/new_games.json`: + sections `pastimes` (batch 1), `puzzlebook`, `handheld`; + 20 entries (wave 6).
- `articles.html`: a "History notes" list with 4 links and one sentence each in the lead and "How to read them".
- Generated, rerun after merging the json: `python tools/build_new_games.py` then `python tools/build_pages.py`
  (index.html/sw.js gen blocks, about.html count, sitemap.xml, landing pages).
- Not bumped on purpose: `ASSET_V` (index.html) and `CACHE` (sw.js). Bump them at merge time.

## Tests (local `python -m http.server`, Playwright Chromium, service workers blocked)

Tools added: `tools/preview/play-nostalgia2.js` (+ `-drivers.js`), `winpath-nostalgia2.js`, `sweep-nostalgia2.js`,
`card-shots-nostalgia2.js`, `chess-perft.js`, `twentyq-check.js`. Results are in the session report and below.

All numbers below are from runs I actually made in this session (some runs were interrupted by a container restart
and were re-run; noted where it matters).
- **Full play + kit checks** (`play-nostalgia2.js`): 20/20 games OK at 390 normal and 20/20 at 1280 easy; batches A-B
  also at 1280 hard, batch C at 390. Each run: restart x3 adds no keydown listener; a held (repeat) Enter on a focused
  game button changes nothing; focus survives a redraw; Ctrl+R/L/F not prevented; a stale finish never opens the end
  screen after a restart; Enter on the focused header Back works; letter shortcuts act with Hebrew key values
  (where a game has one); then a whole game with real clicks/keys to the end screen, Next, back to hub, reopen.
  Rule checks inside the drivers: disc/flip counts, score sheets adding up, golf hole scores recomputed, Cross Sums
  wrong digit caught by Check, Fill-In clash refused, Rail Yard plan length = par, chess take-back restores e2.
- **Win paths** (`winpath-nostalgia2.js`): 20/20 reach "Well Done!" and Level 2 with a real final tap.
- **Layout sweep** (`sweep-nostalgia2.js`): 20 games x 4 variants (320 dark at A++ 130% text, 390 light at A++,
  390 Hebrew RTL, 1280 dark): no horizontal scroll, game inside its card, no non-cell button under 44 px, no console
  errors. Screens were also looked at by eye for every game at 320 and 390, and for a sample at 1280 and in RTL.
- **Generators / data**: `chess-perft.js` 5/5 positions match; `twentyq-check.js` passes (unique patterns, <= 9
  questions); Cross Sums and Logic Grid generators re-checked unique on 15-30 samples per level; Tile Match deals
  solvable by construction (exhaustive search confirmed 88/90 sampled deals; the other 2 exceeded the search budget);
  Moon Landing hard is winnable (beam search: 0.7 m/s landing with 64 fuel spare).
- **Shared-code regressions**: batch 1 (`play-nostalgia.js`) 5/5 OK at 390; existing games via `play-all.js`:
  memory, fifteen, mastermind, klondike, hearts, crossword, minesweeper, sudoku OK at 390, and fifteen, mastermind,
  g2048, memory, sudoku, checkers, klondike, crossword OK at 1280. Hub: 71 cards, 3 new sections, no broken images.
- **Articles**: 5 pages (4 new + articles.html) load (200) at 390 light and 1280 dark, no horizontal scroll, no
  console errors, each links to its game.
- **Found and fixed during testing** (examples): premium.css button rule displacing absolutely placed board points;
  shared button CSS not injected; maze walls wiped by a cell reset; boards overflowing at 320/130% (Peg, Bingo
  called board, Moon gauges, Cross Sums eraser); jelly beans outside the jar outline; sticks ending off the board;
  Tile Match deal builder failing, Shuffle corrupting faces after one pair, and greedy hints leading to dead ends
  (now a look-ahead hint, an explained dead end and Give up); plural and spelling slips.

## Known limits

- English only (like the other new games; other languages show the English text, RTL handled).
- Computer opponents are reasonable, not expert. Bingo is mostly luck by nature (the rules say so).
- Very small cells on 320 px phones in Reversi (8x8), Chess (8x8), the 13x13 maze and 12x12 Color by Number
  (about 30-34 px); every one also has keyboard play and, where useful, a big control pad or two-step selection.
- Rail Yard has no par on hard (the full search is too large); it is still solvable by construction.
- The articles' facts were checked through search-engine summaries only; the source pages were not reachable from
  the workspace. Each article says so on the page. Please re-check the links from the PC before publishing.
- Not run: the full `e2e-suite.js`; real devices; a screen-reader pass beyond labels and live regions.
