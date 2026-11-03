# BrainPlay collection handoff - 2026-11-03

STATUS: on the PREVIEW site only. NOT on the live site, NOT merged, NOT pushed to GitHub. Going live needs Or's explicit word.

- Try it: https://games-preview.178-105-148-72.sslip.io/?lang=en (noindex; served by brainplay-preview.service from /opt/brainplay-preview/site)
- Articles: https://games-preview.178-105-148-72.sslip.io/articles.html
- Built from commit d627950 on branch `review/brainplay-fixes-20261103`, worktree `...\2026\Elders_Ai_fix-bp2`, started from main 7edd6ce (= live). Later commits on the branch are docs only.
- Preview rollback: /root/backups/brainplay-preview-before-d627950-*.tar.gz (the previous preview, 0a3e4d3); before this release round: /root/backups/brainplay-preview-before-ecfbb3b-20261103-2005.tar.gz (c9c89eb). Built without GitHub: `git archive` uploaded, same steps as tools/preview/build-preview.sh.
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

## Wording changed (live copy, six languages; translations by Claude, no native-speaker or professional review)
Removed from the home page, landing pages, skill tooltips, Memory title and description, invite text and taglines, milestone popup, achievements, Hebrew tips and quotes, and the home page's built-in Hebrew fallback text: training, brain-health and improvement promises ("good for you", "ten minutes a day", "daily brain training", "Brain health score", "Healthy Brain", "Brain Guardian", "The brain is a muscle", and their translations). The first pass (c9c89eb) missed many of these; they were found in the 2026-11-03 release review and fixed in ecfbb3b, 0a3e4d3 and d627950. "neighbours" became "neighbors" in Name Garden; article text stays word-for-word with the package.

## Header fix
Controls no longer shrink below their labels; the group wraps to a second row when it cannot fit (css/warm.css). Before: labels ran past the button edge at 900 px in game (es, fr, de, el, with sideways scroll in el) and at 320-360 px (el). tools/preview/check-header.js measures this.

## Test results on the preview URL, build d627950 (2026-11-03)
- tools/preview/check-collection.js in 7 batches: 133/133 (namegarden 17, patternworkshop 17, quietshelf 18, daytown 35, sequence 23, crossword 11, articles 12). No bugs and no script or network failures.
- tools/preview/check-regressions.js: 8/8.
- Retired phrases in 30 served files, six languages: 0 hits of 45.
- check-header.js: 288 views, 0 problems, on a local server from ecfbb3b (22 widths 320-1920, six languages, home and in game; css/warm.css is unchanged since). The run on the preview URL was stopped by the machine running low on memory after the phone widths; no problem had been printed up to then.
- NOT run on d627950: e2e-suite.js (never started, same memory stop) and play-all. Last results: e2e 107/108 local on c9c89eb (toolbar check needs the preview server); play-all 18/18 preview on c9c89eb. Later commits changed header CSS, version numbers, wording and the Name Garden spelling.

## Open items (none accepted by Or; all still open for a decision)
- Crossword on phones: keys are 31px wide x 50px tall and squares 39px, below the 44px target; a 10-key row cannot reach 44px wide at phone width.
- Memory: levels 1-3 are all 8 cards (documented rule), so early progression is slow. Unchanged.
- The home page now says there is no recommended amount, but the page still shows a daily goal ("Played X of 3 today") and a streak counter. Not changed.
- Evidence statements kept and not medically reviewed: why3_d ("linked with healthier cognitive aging") and the list in why_note (physical activity, blood pressure, hearing and vision, sleep, not smoking, social contact).
- Translation review covered the strings changed here, the whole skill-tooltip table, and a keyword scan. Not read line by line: other translated game text (js/gametext.js, older game strings), consent and privacy text. A keyword scan cannot prove absence. No native speaker has read any of it.
- Achievements and the "Practice score" label exist only in Hebrew and English. New games, articles and most game text are English only; other languages fall back to English.
- FreeCell phone title 4.3-4.8:1 (passes large-text 3:1). Desktop in-game "Level 1" text sits slightly high in its box. Natural Klondike win untested. No real-device or human QA; no screen-reader run. Zoom approximated by 320px width.
- Source links: Or's assistant reported that Wiley, ScienceDirect and NIA opened; automated fetches here get 403/405. Link check only, not a check of what the sources say.
- Art is AI-generated with no legal-clearance claim. Articles have not had independent medical or legal review.
- Not pushed to GitHub; preview only.
