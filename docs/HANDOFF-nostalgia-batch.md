# Nostalgia batch (2026-11-03): 5 new games, cloud session, branch `claude/friendly-ritchie-c0pysj`

Built on `main` @ 7edd6ce (the live d86506d line). **Not merged, not published, not deployed.** The PC session's
preview build d627950 (Name Garden, Pattern Workshop, The Quiet Shelf, A Day in Town, Porch Rhythm, 13 articles) is
NOT on this branch and was not touched. No ids, file names or section keys overlap with those games, as far as the
names allow me to tell, or with the planned wave 3/4 ids in `tools/new_games.json`.

## The games (hub section "Kitchen Table & Boardwalk", key `pastimes`)

| id | Title | Pastime it draws on | Mechanic (new to BrainPlay) |
|---|---|---|---|
| `mancala` | Mancala | the stone-sowing board game (Kalah rules, boxed sets of the 50s-70s) | sowing / counting where the last stone lands, vs computer |
| `dotsboxes` | Dots and Boxes | school-notebook / placemat pencil game | claim edges, avoid giving the 3rd side, vs computer |
| `pegjump` | Peg Jump Puzzle | wooden triangle peg puzzle on diner tables + cross peg solitaire | jump-and-remove solo puzzle |
| `tabledice` | Kitchen Table Dice | five-dice score-card games (public-domain "Yacht" family) | roll / keep / choose a score line, 13 turns |
| `boardwalk` | Boardwalk Roll | seaside / county-fair ball-rolling lanes | aim mark + lane "lean" you learn from earlier balls |

None needs a clock. Boardwalk has an optional **Moving aim** switch (off by default, remembered in
`localStorage gg_bw_swing`). Each game: full rules under "How to play", a status line (`role=status`), restart
button, keyboard play, a win and an honest "Nice try" end through `GameKit.finish`, Level 2 via the shared end screen.
Names and art are original; no commercial names (no "Yahtzee", "Skee-Ball", restaurant brands), no copied assets.

Difficulty (`Difficulty.get()`): Mancala 3/4/4 stones, computer looks 1/2/5 moves ahead; Dots 3x3/4x4/5x5, smarter
give-aways on hard; Peg goal (triangle) 3/2/1 and (cross) 5/3/1, hard starts on the cross; Dice goal 140/170/200;
Boardwalk goal 220/270/310, bigger lean + wobble (simulated lean-correcting player: median 360-410).

Keyboard: Mancala 1-6; Dice R = roll, 1-5 = keep; Boardwalk arrows move the aim, Enter rolls (it takes the arrow keys
in a capture listener, so the shared kbnav helper does not fight it); Dots and Peg use the shared kbnav (arrows + Enter).

## Files

New (no merge risk): `js/games/{mancala,dotsboxes,pegjump,tabledice,boardwalk}.js`,
`images/cards/<same ids>.jpg` (real screenshots, framed by `frame_shots.py`), `{en,es,fr,de,el,he}/<same ids>/index.html`
(landing pages), `tools/preview/play-nostalgia.js` (real-click play-through), `tools/preview/card-shots-nostalgia.js`
(card pictures), this file.

Shared, changed only by the generators:
- `tools/new_games.json`: + section `pastimes` (before `arcade`), + 5 entries (`"wave": 5`) after `mastermind`.
- `index.html` / `sw.js` / `about.html`: only inside the `gen:` marker blocks (`build_new_games.py`).
- `sitemap.xml`: +30 URLs (`build_pages.py`).
No CSS file, `game-kit.js`, `kbnav.js`, `play-all.js`, `card-shots.js` or `HANDOFF.md` was edited. Each game carries its
own `<style>`, including scoped overrides for `css/premium.css`'s `#gameContent button {position:relative; ...}` rule
(it broke absolutely positioned buttons; overriding it locally avoided touching the shared file).

## How to merge on top of d627950 (or later)

1. Take the PC branch's versions of `index.html`, `sw.js`, `about.html`, `sitemap.xml` on any conflict.
2. In `tools/new_games.json`, keep the PC entries and add this branch's `pastimes` section + 5 game entries.
3. Run `python tools/build_new_games.py` then `python tools/build_pages.py` (they rebuild every block and page).
4. Bump `ASSET_V` (index.html) and `CACHE` (sw.js) as usual. I did **not** bump them, to avoid a needless conflict.
5. Re-check: `node tools/preview/play-nostalgia.js <pw dir> <url> '' 390` and `... 1280`, plus the PC's e2e suite
   (its section 12 width check and the About count now include these 5 games).

## Tests run here (local `python -m http.server`, Chromium/Playwright, service workers blocked)

- `play-nostalgia.js` (real clicks, the driver plays deliberately plainly): **10/10 OK** = 5 games x 1280 and 390,
  normal; plus pegjump + boardwalk at 390 hard OK (peg solved to 1 via hints, Puzzle master). Per game it checked:
  Mancala 48 stones conserved every move, key "3", empty-pit message, loss -> Nice try + same level; Dots 16 boxes
  accounted for, two-tap and Draw button both draw; Peg cross hint, stuck-peg and invalid-hole messages, undo, win;
  Dice 13 lines filled, kept dice never change, 0-score lines ask twice, sum matches; Boardwalk arrow keys move the
  aim, Moving aim moves and stops, 9 balls add up, Enter rolls. Then end screen -> Next, Back to hub, reopen from card.
  0 page/console errors (after the card images were added; before that only their 404).
- Win path (board one move from a win, then a real tap, 390 touch): Mancala "You won 27 to 22" + Level 2; Dots
  "You won 16 boxes to 0"; Peg 1 peg "Puzzle master"; missed peg goal: no end screen yet, Undo kept, Finish -> Nice try.
- Keyboard: Dots line drawn by arrows + Enter + Enter; Peg selection by arrows + Enter; Mancala digit keys; Boardwalk
  arrows/Enter (driver above). Dice R / 1-5 shortcuts added after that check and not separately re-run.
- Screens inspected: every game at 320 (dark, hard), 390 (light) and 1280 (dark); hub section 390/1280; landing page
  en/boardwalk at 390; all 5 games in Hebrew RTL (no overflow). `scrollWidth` = viewport everywhere. Found and fixed:
  premium.css button rule broke Dots and Peg layout; triangle and cross boards overflowed at 390/320; Boardwalk message
  below the fold on phones; ring-label contrast (now >= 5.4:1); Mancala pits too small on phones (upright layout).
- Boardwalk goals calibrated by a 4,000-game simulation per level (`median 360-410` for a lean-correcting player).

## Delivery status

`git push` and the GitHub connector both returned 403 (no write access for this org from the cloud session), so the
commit was **not pushed and no PR exists**. The commit is delivered as a git bundle (see the session reply): on the PC,
`git fetch <bundle> claude/friendly-ritchie-c0pysj:nostalgia-batch` then push that branch. VPS not touched (CLAUDE.md
ship checklist steps 2-4 deliberately skipped: Or asked for no merge, publish or deploy).

## Known limits

- English only (like the other wave games; other languages fall back to English text, `dir="ltr"` inside the board).
- The computer players are decent, not expert (Mancala hard = 5-ply search; Dots has no long-chain "double-cross").
- Peg hint on the cross board searches with a budget; when it runs out it says it can only show *a* legal jump.
- Not run: the full `e2e-suite.js` / `play-all.js` (they target the preview build and would include games not on this
  branch); no real-device test, no screen-reader pass beyond labels and live regions.
