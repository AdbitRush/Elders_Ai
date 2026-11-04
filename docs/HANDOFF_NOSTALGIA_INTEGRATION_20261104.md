# BrainPlay nostalgia integration handoff - 2026-11-04

STATUS: saved review branch only, final results below. NOT merged, NOT deployed, NOT published, NOT pushed to GitHub. The existing preview still serves d627950; live is still 7edd6ce. Publication needs Or's separate approval.

- Branch: `review/nostalgia-integration-20261103`, worktree `...\2026\Elders_Ai_nostalgia`, based on the PC candidate e64b85a (d627950 plus docs).
- Source: `nostalgia-batch.bundle` from the cloud session "New games batch for BrainPlay". Verified: `git bundle verify` passed, 283,780 bytes, one ref `refs/heads/claude/friendly-ritchie-c0pysj` at 7738ffd, requires 7edd6ce, two commits (f33d9e0, 7738ffd). Imported as `refs/imports/nostalgia-batch-7738ffd`. Handoff: 7,025 bytes, a real Markdown document, kept at docs/HANDOFF-nostalgia-batch.md.
- SHA256: bundle 2faac6268e45f6791d6601cc6f8a7ab3b64a410b5b8d77878db039771362f7d8, handoff 9dea22312c05c321b090512e241c75b476ca9f081945f752cda98b9bae4efa87.

## Integration
Game files, card pictures and test scripts come from the bundle. tools/new_games.json was merged by hand (kept every PC entry, added section `pastimes` and five games), then index.html, sw.js, about.html, sitemap and landing pages were regenerated, not taken from the bundle. 55 games, 330 landing pages, 331 sitemap URLs. ASSET_V 79, sw cache v83. The four Gentle Practice games, Porch Rhythm and all 13 articles are preserved; the article files are identical to the candidate, and the three live articles are identical to main. e345c26 is the unmodified integration; f5f0740 and fe7167e hold the fixes.

## Real bugs found and fixed (the cloud's own tests did not catch these)
- New game stacked keyboard listeners in Dice and Boardwalk (two restarts: one R = three rolls, one Enter = three balls, one arrow = three steps). Mancala had the same leak, mostly hidden.
- New game during a roll: the ball in flight landed in the new game.
- Held keys used up all rolls (R) or balls (Enter), or flipped a die back and forth.
- Boardwalk took Enter from every control outside the game, including header buttons, and swallowed Alt+Left. kbnav blocked browser shortcuts with arrow keys in every game: fixed site-wide.
- Dice R did nothing on a Hebrew keyboard layout.
- Keyboard focus was lost on every redraw in all five games. It now stays on the same control, or moves to the status line, never to New game.
- English text on right-to-left pages put the period at the wrong end, in games, end screens, hub cards and landing pages, for all English-only games.
- Landing page photos were cropped tall on phones, for every game.
- Dots: board, message and Draw line did not fit a laptop screen; focus mark was too faint.
- Dots: outer tap areas passed the game card's clipped edge at 390 and 430px (found by the end-to-end suite).
- Dice: "tap to keep" labels crowded at 320px and large text; now "Keep". Boardwalk on phones: last ball result added beside the controls. Peg: "neighbouring" spelling, "Plenty of room to improve" reworded.

## Test results on the integrated build (preview not replaced)
Code: f5f0740 plus the Dots tap-area fix in fe7167e. Later commits change only test tools and docs.

### End-to-end suite: 126 of 126 checks passed, 0 failed, 0 never ran
Run in 32 batches by tools/preview/e2e-batches.js, one fresh process and browser per batch, each result saved as it happened. Free memory stayed near 3 GB, so no resource blocker remains.
Served from a private local copy with the real review server, so the review-toolbar section ran instead of failing as it does on a plain local server. No check's pass/fail condition changed. With no options set the suite runs as a single pass, as before; that single pass was not repeated.

| Section | Checks | Result |
|---|---|---|
| 1 original games, phone and desktop | 56 | all pass |
| 2 languages / 3 hub / 4 ads / 5 theme toggle / 6 contrast | 6 / 5 / 2 / 2 / 2 | all pass |
| 7 review tool | 6 | all pass |
| 8 October fixes | 15 | all pass |
| 9 icons and photos (55 games in 4 batches, then 5 more) | 4 + 5 | all pass |
| 10 games added since 2026-10 (27 games in 4 batches) | 4 | all pass |
| 11, 11b language switching / 13, 13b menu and Quick Count | 4, 3 / 2, 2 | all pass |
| 12 all 55 games at 320, 390, 430 and 390 RTL (8 batches) | 8 | all pass after the fix below |

A check in sections 9, 10 and 12 covers one slice of games, so those counts are batches of games, not one check per game. Slices add up to all 55 (sections 9 and 12) and all 27 (section 10).

First-run failure, kept in evidence as first-run-FAIL-12.7of8.txt: section 12 failed on Dots at 390, 430 and 390 RTL. The invisible tap areas of the outer vertical lines passed the game card's clipped edge by about 5px. Real issue, fixed in the game (capped at 56px wide, above the 44px minimum); the check was not changed. Reran batches 12.7of8, 10.3of4 and all of 9a. Those runs used the fixed Dots file; the other batches ran before that one-file change.

### Other suites
- check-collection.js, 7 batches: 133/133. check-regressions.js: 8/8. check-header.js: 288 views, 0 problems. (f5f0740, before the Dots fix, which changes only js/games/dotsboxes.js.)
- check-nostalgia-keys.js: 41/41 on the fixed Dots code; before the fixes 21/31.
- check-nostalgia-layout.js: 319/319 on the fixed Dots code.
- play-nostalgia.js: 10/10 on f5f0740; Dots again on the fixed code, 3 of 3 at 390 and 1 of 1 at 1280.
- play-all.js, games on the changed shared code only: freecell, klondike, memory, namegarden, daytown at 390 and 1280: OK, after the first item below.
- Screens inspected by eye: every game, mid-game. Not repeated by eye after the Dots tap-area change, which draws nothing visible; measured by the layout check.

### Not run
- play-all.js for the other 50 games. Section 1, 10 and 12 load checks cover them, but they were not played end to end on this build.

### Test-environment failures, not game bugs
- daytown at 390 in play-all, intermittent: "element is not stable". The parked test pointer sat on the button edge and the site's hover lift in css/premium.css kept oscillating. Moving the pointer away stopped it in 12 of 12 runs, a real tap worked, and 450 puzzles had no covered control. Driver now moves the pointer; 6 of 6 pass.
- Dots at 390 in play-nostalgia, intermittent: the driver took a line's position without scrolling to it, so a tap could land on the sticky header and Draw line stayed disabled. All 40 lines answered their own tap on both old and new code. Driver now scrolls first; 3 of 3 pass.
- Earlier end-to-end attempts gave no result: one hit my own time limit, one was stopped by the system for low memory.
- White bands and a nav bar across full-page screenshots are capture artifacts of fixed backgrounds and the sticky header; viewport captures are clean.

## Account-settings request seen during the download
Evidence: the browser log showed PATCH /api/account/settings with status 202. It was absent at 21:49:11 UTC and present by 21:50:41 UTC, so it fired after one of: closing the file panel, scrolling, or clicking the attachment card.
No recorded action of mine touched a settings control. The log holds only URL and status, not what was sent, and the endpoint cannot be read back (GET returns Method Not Allowed). Read on 2026-11-04 without changing anything: Appearance, Capabilities and Notifications look ordinary. Code settings could not be read (screenshot timed out). There is no earlier snapshot to compare.
Conclusion: a request was accepted, but there is no evidence of any user-facing setting having changed, and not enough evidence to rule out a stored interface preference. The timing suggests the page saving its own layout state, which is an inference, not a finding.

## Open items (none accepted by Or)
- play-all.js has not played the other 50 games end to end on this build.
- Hover jitter: a real desktop mouse resting on the bottom edge of a button can make it pulse. Site-wide, already live, not changed.
- New game has no "are you sure" in the five new games, so a mis-tap discards a game in progress.
- All five games are English only. On Hebrew pages English paragraphs now align left.
- Achievements and tooltips for these games were not translated; computer players are decent, not expert.
- Dots: after a line is drawn by keyboard, focus rests on the status line, so Tab users move on from there.
- All earlier limits in docs/HANDOFF_COLLECTION_20261103.md still stand: Crossword phone keys, Memory card counts, daily goal against "no recommended amount", no real-device, human or screen-reader testing, no native-speaker, medical or legal review.
- Cloud session: one approved message was sent to restart it. Its copies of the files are temporary.
