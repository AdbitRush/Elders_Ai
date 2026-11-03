# BrainPlay fixes handoff - 2026-11-03 (review branch only; NOT merged, pushed, or deployed)

Branch `review/brainplay-fixes-20261103` in worktree `...\2026\Elders_Ai_fix-bp2`, started from origin/main 7edd6ce (= live). ASIA, CONNECTION, ABR_Ai untouched. Live site not touched by this work.

## What was compared (identical steps, state, viewport, theme; baseline = tag checkpoint/bce885f-before-articles vs main)
Game code is byte-identical between bce885f and d86506d (`git diff bce885f d86506d -- js` = only lang-content.js and tips.js), so the earlier "regressions" could not come from game changes.
| Item | Result | Verdict |
|---|---|---|
| Digit Span @1280 "double-tap scores twice" | Reproduced on the OLD BASELINE too under 6x CPU throttle (1 of 6 on bce885f; 0/6 at normal speed, 0/6 on main at 6x in that sample). The test's "double-tap" was two Playwright clicks; the second waits for actionability and lands on the NEXT round's pad when slow, scoring an empty answer. The game's `_locked` guard is correct; a real same-tick double-click scores once (check-regressions.js 3 passes). | TEST-HARNESS timing. Fixed in play-all.js (atomic double-click, state-based waits). |
| Solitaire @1440 dark "kids 0" | 1/10 at 6x throttle on BOTH baseline and main (content appeared 254 ms / 781 ms after the fixed 1.2 s check); 10/10 at normal speed on both. | TEST-HARNESS fixed wait. Fixed in e2e-suite.js (wait for content). |
| Backgammon 15th checker (390 and 1280) | Main failed 1/12 in the unthrottled probe (baseline 12/12; difference is noise-level). Mechanism found: after the last legal move the game waits 900 ms (1600 ms if no legal move) before `_bgEndTurn`, and the old test (and the game) treated the position as the player's turn during that pause. The test injects a position inside the pause; the timer then hands the turn to the computer mid-test. | MIXED: harness race AND a REAL GAME BUG (below). |
| Backgammon real bug | During the pause the **Take back** button was live: `bgUndo` restored the position, but `_bgEndTurn` still fired, so the player lost both their moves and their turn. Reproduced deterministically (check 1 FAILED before the fix). | Fixed in js/games/backgammon.js: `busy` is set for the pause, `bgUndo` refuses while busy. |
| Klondike Undo vs Moves | Moves counter never went back on Undo (Draw -> Undo showed Moves: 1). Reproduced (checks 5/5b FAILED before). | Fixed: snapshot includes `moves`. |
| Memory level 2 = 4 pairs | Documented rule (HANDOFF 2026-10-09: 8/12/16/20/24 cards, pairs rounded up to even, min 4). Levels 1-3 share 8 cards by design; the shuffle deals fresh pictures. | NOT a bug. Check 6 asserts the rule and monotonic growth. Progression is slow (L1-3 identical size); a design choice for Or, unchanged. |
| Fifteen, Mastermind @1280 (never re-run) | PASS @1280 and @390 on main locally; PASS @1280 on live. | Closed. |

## Evidence
- `tools/preview/check-regressions.js` (new, ~1 min): before fix 5/8 (FAIL 1, 5, 5b); after fix 8/8 at cpu x1 and x6.
- play-all on the fixed tree: digitspan, backgammon, klondike, memory, solitaire, fifteen, mastermind all [OK] at 390 and 1280.
- e2e once on the fixed tree: 107/108; only failure = "7 review toolbar present" (VPS-only preview tool). Solitaire @1440 dark passes.
- `index.html` ASSET_V 73 -> 74 and `sw.js` CACHE v77 -> v78 so installed clients get the two changed game files.
- Logs: backup folder `evidence/logs`. No visual change in this batch (logic only); no new screenshots needed.

## Residuals and blockers (precise)
- digitspan/solitaire fixes are test-harness only: no game change was needed or made. Backgammon dice and CPU turn remain random; check 1 and 2 use state waits, not luck.
- Klondike: Undo now restores Moves; a natural Klondike win and the Draw-3 redeal path are still not covered by a scripted check.
- Memory progression is flat for levels 1-3 (documented rule). Decision for Or only.
- categories.js tooltips use "trains" wording for skills; conflicts with the article claim limits; left unchanged (live copy, 6 languages). Decision for Or.
- Article package for 7+ new articles NOT received. `docs/ARTICLE_GAMES_PLAN_20261103.md` has 3 designs (against the published articles) and open slots 4-10; no new game is coded.
- Four external article source links still unverified (403/405 to plain fetch).
- Earlier residuals unchanged (see docs / review handoff in _BACKUPS\brainplay-review-d86506d-20261103).
- Screenshots page for d86506d still unpublished (Artifact tool Read-rule block; permission rules unchanged).

## What would be published (only with Or's separate approval)
Commit(s) on `review/brainplay-fixes-20261103`: js/games/backgammon.js, js/games/klondike.js, index.html (ASSET_V), sw.js (CACHE), tools/preview/{check-regressions,play-all,e2e-suite}.js, docs/. Gameplay change visible to players: Backgammon Take back is disabled while the turn is ending; Klondike Moves goes back on Undo.
