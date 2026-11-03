# BrainPlay nostalgia integration handoff - 2026-11-04

STATUS: saved review branch only. NOT merged, NOT deployed, NOT published, NOT pushed to GitHub. The existing preview still serves d627950; live is still 7edd6ce. Publication needs Or's separate approval.

- Branch: `review/nostalgia-integration-20261103`, worktree `...\2026\Elders_Ai_nostalgia`, based on the PC candidate e64b85a (d627950 plus docs).
- Source: `nostalgia-batch.bundle` from the cloud session "New games batch for BrainPlay". Verified: `git bundle verify` passed, 283,780 bytes, one ref `refs/heads/claude/friendly-ritchie-c0pysj` at 7738ffd, requires 7edd6ce, two commits (f33d9e0, 7738ffd). Imported as `refs/imports/nostalgia-batch-7738ffd`. Handoff: 7,025 bytes, a real Markdown document, kept at docs/HANDOFF-nostalgia-batch.md.
- SHA256: bundle 2faac6268e45f6791d6601cc6f8a7ab3b64a410b5b8d77878db039771362f7d8, handoff 9dea22312c05c321b090512e241c75b476ca9f081945f752cda98b9bae4efa87.

## Integration
Game files, card pictures and test scripts come from the bundle. tools/new_games.json was merged by hand (kept every PC entry, added section `pastimes` and five games), then index.html, sw.js, about.html, sitemap and landing pages were regenerated, not taken from the bundle. 55 games, 330 landing pages, 331 sitemap URLs. ASSET_V 79, sw cache v83. The four Gentle Practice games, Porch Rhythm and all 13 articles are preserved; the article files are identical to the candidate, and the three live articles are identical to main. e345c26 is the unmodified integration; f5f0740 holds the fixes.

## Real bugs found and fixed (none were caught by the cloud's tests)
- New game stacked keyboard listeners in Dice and Boardwalk (two restarts: one R = three rolls, one Enter = three balls, one arrow = three steps). Mancala had the same leak, mostly hidden.
- New game during a roll: the ball in flight landed in the new game.
- Held keys used up all rolls (R) or balls (Enter), or flipped a die back and forth.
- Boardwalk took Enter from every control outside the game, including header buttons, and swallowed Alt+Left. kbnav blocked browser shortcuts with arrow keys in every game: fixed site-wide.
- Dice R did nothing on a Hebrew keyboard layout.
- Keyboard focus was lost on every redraw in all five games. It now stays on the same control, or moves to the status line, never to New game.
- English text on right-to-left pages put the period at the wrong end, in games, end screens, hub cards and landing pages, for all English-only games.
- Landing page photos were cropped tall on phones, for every game.
- Dots: board, message and Draw line did not fit a laptop screen; focus mark was too faint.
- Dice: "tap to keep" labels crowded at 320px and large text; now "Keep". Boardwalk on phones: last ball result added beside the controls. Peg: "neighbouring" spelling, "Plenty of room to improve" reworded.

## Test results on the integrated build, local server (preview not replaced)
Final code f5f0740 unless noted; the only later commit changes a test driver and docs.
- check-collection.js, 7 batches: 133/133. check-regressions.js: 8/8.
- play-nostalgia.js: 10/10 (five games at 390 and 1280).
- check-nostalgia-keys.js (new, includes the dice R and 1-5 shortcuts): 41/41. Before the fixes: 21/31.
- check-nostalgia-layout.js (new): 319/319. 390, 320 and 1280; light and dark; Hebrew RTL; largest text at 390, 320 and 1280; 375x667; 1366x768.
- check-header.js: 288 views, 0 problems.
- play-all.js, targeted at games on the changed shared code: freecell, klondike, memory, namegarden, daytown at 390 and 1280: OK, after the daytown item below.
- Screens inspected by eye: every game, mid-game.

### NOT completed
- e2e-suite.js: no result on this build. Run 1 hit my own 9.5 minute limit. Run 2 was stopped by the system for low memory and was not restarted. It prints only at the end, so there are no partial results.
- play-all.js for all 55 games was not run; only the five above.

### Test-environment failures, not game bugs
- daytown at 390 in play-all, intermittent (3 of 4 runs at worst): click timed out with "element is not stable". The parked test pointer sat on the button edge and the site's hover lift in css/premium.css kept oscillating. Moving the pointer away stopped it in 12 of 12 runs, a real tap worked, and 450 puzzles had no covered control. Driver now moves the pointer; 6 of 6 pass.
- White bands and a nav bar across full-page screenshots are capture artifacts of fixed backgrounds and the sticky header; viewport captures are clean.

## Open items (none accepted by Or)
- e2e-suite.js still needs one complete run before publication. Its section 12 width check and the About count now include these games.
- Hover jitter: a real desktop mouse resting on the bottom edge of a button can make it pulse. Site-wide, already live, not changed.
- New game has no "are you sure" in the five new games, so a mis-tap discards a game in progress.
- All five games are English only. On Hebrew pages English paragraphs now align left.
- Achievements and tooltips for these games were not translated; computer players are decent, not expert.
- Dots: after a line is drawn by keyboard, focus rests on the status line, so Tab users move on from there.
- All earlier limits in docs/HANDOFF_COLLECTION_20261103.md still stand: Crossword phone keys, Memory card counts, daily goal against "no recommended amount", no real-device, human or screen-reader testing, no native-speaker, medical or legal review.
- Cloud session: one approved message was sent to restart it. Its copies of the files are temporary.
