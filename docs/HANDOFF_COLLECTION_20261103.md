# BrainPlay collection handoff - 2026-11-03

STATUS: on the PREVIEW site only. NOT on the live site, NOT merged, NOT pushed to GitHub. Going live needs Or's explicit word.

- Try it: https://games-preview.178-105-148-72.sslip.io/?lang=en (noindex; served by brainplay-preview.service from /opt/brainplay-preview/site)
- Articles: https://games-preview.178-105-148-72.sslip.io/articles.html
- Built from commit c9c89eb on branch `review/brainplay-fixes-20261103`, worktree `...\2026\Elders_Ai_fix-bp2`, started from main 7edd6ce (= live). Later commits on the branch are test and docs only.
- Preview rollback: /root/backups/brainplay-preview-before-c9c89eb-20261103-1629.tar.gz (the previous preview, e272755). Built without GitHub: `git archive` uploaded, same steps as tools/preview/build-preview.sh.
- Live site: /opt/Elders_Ai still 7edd6ce. Live rollback details are in HANDOFF.md (tag rollback/live-before-d86506d).

## What was built
| Article(s) | Playable destination | Engine decision | Mechanic | Controls | Progression | Completion |
|---|---|---|---|---|---|---|
| 02 spacing, 03 retrieval, 04 names | Name Garden `namegarden` | New: recall/memory/pairs have no study-attempt-feedback per item | Study 4 or 6 fictional neighbours, then name each twice with others between; answer always shown | Tap, Tab/Enter, keys 1-6; Show name, Replay study, End round | Player picks 4/6, gap, cue on/off | 2 turns per neighbour, whatever the answers; counts first-choice vs reminder |
| 01 beginner, 10 choice | Pattern Workshop `patternworkshop` | New: shapes/blocks/jigsaw have no copy-a-target with turns | Copy a mosaic; target stays visible | Pick piece, pick square; Turn left/right (R/L); Put back, Undo, Reset, Hint, Show answer | Player picks 2x2/3x3, turns on/off | All squares match by canonical orientation |
| 05 attention | The Quiet Shelf `quietshelf` | New: oddoneout is one-odd-tile with no persistent rule | Find all objects matching object + pattern | Toggle buttons, Undo, Hint, Check shelf, Show answer | Player picks 6/9/12 objects | Three shelves; all and only matches, or shown |
| 06 planning, 08 map | A Day in Town `daytown` (Plan and Map modes in one game) | New: no game has route constraints | Order errands to meet rules, or follow a route past 3 landmarks | Add, Earlier/Later/Remove, Undo, Reset, Preview, Try; arrow buttons/keys, next step, hide route, replay | Player picks 3/4/5 errands; route shown or hidden | Three routes; any valid order accepted |
| 07 rhythm, 10 choice | Porch Rhythm: a mode inside `sequence` (`?mode=porch`) | Extended Sequence, no second rhythm game. Classic stays default | Watch or hear a pattern, repeat the order | Pads, keys 1-4; Replay, mute, Skip | Player picks length 2/3/4 and pace | Three phrases; first-try vs assisted vs skipped |
| 09 crossword | Existing `crossword` | Improved, no clone | Reveal marked with a dot and named; richer labels; focus kept; no clock | Existing + Tab/Enter | Existing | Fires once; reveal never blocks finishing |

Art: all 19 originals deduplicated by source hash. 18 already had site copies (nothing overwritten, GoFish phone crop untouched); one new web copy, images/art/scene-garden.webp (images/art/muse-provenance-collection.json). Name Garden people, shelf objects, mosaics, maps and pads are original code-drawn vector/UI.

## Bugs fixed
- Backgammon: Take back during the end-of-turn pause lost both the moves and the turn. Klondike: Undo did not restore Moves.
- kbnav.js: Enter/Space on a focused button did nothing in button-based games (site-wide); arrow ring and real focus could disagree.
- Digit Span and Solitaire 1440 dark: test-harness timing, reproduced on the old baseline; tests fixed, games unchanged.
- Own bugs caught in review: all new article pages and the index had the wrong browser title and the index had the wrong description; rhythm article opened Classic; "shelfves"; map stops misplaced by the site's global button CSS; pw- class collision with the welcome card.

## Wording changed (live copy, six languages; translations by Claude, not professionally reviewed)
Home section no longer says "good for you", "Ten minutes a day" or that skills "all improve"; landing heading "Why it is good for you" is now "What you do in this game"; 27 skill tooltips describe the task; Hebrew tips with unsupported health numbers (sleep 40%, hippocampus, etc.) replaced. The Hebrew tip and promo correction now covers the whole he tips list.

## Test results on c9c89eb
- tools/preview/check-collection.js: 133/133 on the local server. On the preview URL it did not finish: one run stopped on script timing (fixed), the next on a single page reload that exceeded 30 s. Not re-run in a loop; four timed loads afterwards had the game ready in 0.7-2.5 s.
- tools/preview/check-regressions.js: 8/8 on the preview URL.
- play-all on the preview URL: namegarden, patternworkshop, quietshelf, daytown, sequence, crossword, digitspan, backgammon, klondike: 18/18 OK at 390 and 1280.
- e2e once on the final code, local server: 107/108; only failure is the toolbar check, which needs the VPS preview server. Not run on the preview URL.
- Header contrast on rendered pixels: phone titles >= 6.2:1, instructions >= 7.8:1; desktop titles >= 11.1:1.
- Article fidelity: 10/10 word-for-word with the package, except the status line ("English only" replaces draft/Muse wording). The three live articles have no diff against main.

## Open items
- Source links: 15 of 18 return 200. Wiley (403), ScienceDirect (403), NIA (405) refuse automated fetches: unverified, not proven broken. Please click those three.
- Crossword on phones: keys are 31px wide x 50px tall and squares 39px; a 10-key row cannot reach 44px wide.
- Memory: levels 1-3 are all 8 cards (documented rule), so progression is slow. Unchanged.
- FreeCell phone title 4.3-4.8:1 (passes large-text 3:1). Natural Klondike win untested. No real-device or human QA; no screen-reader run (labels and live regions are checked by script only). Zoom/reflow approximated by 320px width.
- New games, articles and most game text are English only; other languages fall back to English.
- Art is AI-generated with no legal-clearance claim. Article drafts have not had independent medical or legal review.
- Screenshots page: Artifact upload blocked by a Read permission rule; screenshots are in the backup's evidence folder.
