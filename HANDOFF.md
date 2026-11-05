## 2026-11-05 - Tests finished on the 125-game build; "unstable restart button" explained (no site change, site code still 5abe1ee)
- Cause of the restart failures (Eight Queens, Hot Dice, Sticks, earlier Moon Landing): a TEST race, not a player bug and not hover motion. The check forges NK.finish(win) then clicks restart. The kit opens the end screen 600 ms later. The previous restart's 450 ms gg-round-in entry animation (css/premium.css, button moves 14 px) used most of that window, so a click taking over 600 ms found the end screen correctly over the button. Evidence: all three failure screenshots show the modal with the forged text "stale"; modal false at 300 ms, true at 600 ms in all 4 games; "Level 2" sits on the button's spot in 3 of them. Hover ruled out: computed transform stays none while hovered (nostalgia-kit.js overrides premium.css).
- Player checks on the 4 games, all passed: mouse at centre and near the top edge at 220-1070 ms spacing 8/8 each, touch at 390 8/8, Enter and Space 5/5. 104 instrumented clicks after the key step all worked.
- Fix, tools only (bcca870): the check waits for the entry animation before forging the finish; assertion unchanged. play-all's generic driver no longer dies when the end screen opens during a click, and still reads the end modal. Same class of race explained the Counting failure at 390 (screenshot: real end screen, 6 of 7 right). No timeout raised, no force click, no hover or focus style changed.
- Rechecks: the 4 games full runs x3 at 390 and 1280: 24/24 OK. Counting 390 x3 OK. On LIVE: Queens and Hot Dice at 1280, Moon Landing and Sticks at 390, all OK.
- Found, NOT fixed (separate from this cause): after a keyboard restart focus falls to the page body in NK games, so the next Tab starts from the top of the page. Keyboard activation itself works.
- Full local results on the build: e2e 32/32 batches, 119 pass, 2 fail on record. Section 7 needs the preview-only review toolbar, so it is UNTESTED, not passed. Section 9 slice 2 is the Bubble Pop star, fixed in 5abe1ee, slice passes on recheck. Batches other than 9a slice 2 and 12.3-12.7 ran at 1ccb9e6, which differs from the live site only by that one Bubble Pop character; 12.3-12.7 ran at bcca870, all 5 PASS (61 games at 320/390/430/390-RTL).
- Batch 3 play: 390 normal 49/50, 1280 hard 49/50, 1280 easy 50/50, the misses being this race and passing on recheck. Batch 2: 390 20/20, 1280 19/20 (same race, Sticks). Batch 1: 5/5 at both. Victory Garden hard x6 all won. Win paths all OK, keys 41/41, layout 319/319, regressions 8/8, collection 133/133, header 288 views 0 problems, sweep of the 50 new games all variants OK, perft and Twenty Questions OK. play-all 50 scripted older games OK at 1280, 49 at 390 plus Counting on recheck; it has no real driver for the other 75, which the batch suites cover (Cribbage, Spades and Golf get a wrong generic driver there).
- Evidence: _BACKUPS/brainplay-nostalgia-batch3-20261104/evidence on the PC.
- Still open: the home page has no canonical tag; art has no legal clearance; no real-device, human, screen-reader or native-speaker testing.

## 2026-11-05 - LIVE DEPLOY of BrainPlay 5abe1ee: 125 games (Or asked to make it live before the full local test run finished)
- Live: https://games.178-105-148-72.sslip.io/ . main fast-forwarded 28a97cd -> 5abe1ee, no force-push. Cache golden-games-v85, ASSET_V 81. 125 games, 17 articles, 750 landing pages, 751 sitemap URLs.
- Cloud work: nostalgia-batch3-final-3d7c334.bundle, 3,097,389 bytes, sha256 c9d0eed352c237f1eae844e3b23f68c311ac61dce8a9d5a3d469413a72bd4c1a; handoff sha256 eddee2b19228b4e2bb92d95b3d2decd900ec51e394ec40b12e59cca10117dead. Prerequisite 28a97cd, tip 3d7c334, exactly 20 commits, all ancestors of main. Saved in _BACKUPS/brainplay-nostalgia-batch3-20261104 on the PC, handoff also at docs/HANDOFF_NOSTALGIA3_20261104.md.
- Added on top of the bundle: 4e82973 Victory Garden fix, bcb7c10 and 1ccb9e6 Muse art, 11884da versions and generated files, 5abe1ee Bubble Pop marker.
- Victory Garden 0 lb: real cause found. Clearing a wilted bed left b.dead set, so the empty bed stayed grey and the test driver retried it forever. Simulation with the driver's own priorities, real game code: hard 49.7% won and 17.6% zero-lb before; easy 100%, normal 99.7%, hard 92.5%, 1 zero-lb in 3000 after. The handoff's "95-99% on hard" did not reproduce. Driver unchanged.
- Art: images/art/scene-{bingo,moonland,railyard,salvo}.webp, decorative headers only. Hashes, alt text and rights note: images/art/muse-provenance-batch4.json; masters in _BACKUPS/brainplay-muse-art-20261104. NOT CC0, exclusive or legally cleared; no commercial ban established; site use requested by Or 2026-11-04. VPS worktree incubator/game-art-20261104 was left untouched, nothing committed there.
- ROLLBACK: (a) tag rollback/live-before-125games = 28a97cd on GitHub; `git push origin $(git commit-tree 28a97cd^{tree} -p origin/main -m "Rollback to 28a97cd"):main`, then on the VPS `git -C /opt/Elders_Ai pull --ff-only && systemctl restart elders-ai`. Tree equality and fast-forward proven with an unpushed object; the rollback itself was not run. (b) VPS archive /root/backups/elders-ai-live-before-125games-20261105-0016.tar.gz, sha256 85a2693a5d9a6d68d848e7682203b5f807f9b9d59c30e47836104d56195eb3ae, checksum OK and equal to the live tree just before deploy. Do NOT hard-reset only the VPS.
- Passed on LIVE at 5abe1ee: live_verify 15/15 (750 landing pages, 195 js/css/top-level files equal the commit, 192 precached files, sitemap, About says 125, private paths 404, hub 125 cards and all 125 games open at phone and desktop with no script errors or sideways scroll, 17 articles and links). Extra checks 21/22: canonical, og:url and hreflang on all 750 landing pages, robots, sitemap hosts, 4 Muse headers at both widths, hub search, 9 chips, Back. Returning visitor v84 -> v85 in 17 s, old cache removed, no saved key lost, Bubble Pop opened offline.
- Played on LIVE, all OK: Moon Landing 1280 and 390; FreeCell, Counting, Hearts at 1280 and 390; Victory Garden 1280 hard (70/70 lb) and 390 (56/55 lb); 20 batch-3 samples; Chess, Reversi, Rail Yard, Sea Salvo, Bingo at 390; Klondike, Memory, Sudoku, Crossword, Backgammon, Trivia at 1280. Earlier, on the 75-game build: Moon Landing 3/3 at 1280 on live; e2e all 32 batches ran, 120 pass, 1 fail (section 7).
- FAIL, not fixed: the home page has no canonical tag. Not a regression: 28a97cd had none either. Landing pages are correct.
- e2e on the integrated build, run at 1ccb9e6: 27 of 32 batches complete, 114 pass, 2 fail. Section 7 fails because the review toolbar exists only on the preview site, so it stays UNTESTED. Section 9 slice 2 failed on the Bubble Pop star; fixed in 5abe1ee and that slice passes on recheck. Batches 12.3-12.7 have NO result (12.3 hung after a Claude Code low-memory stop and was stopped at 2176 s, the others exited at once): 5 of 8 slices of the 320/390/430/RTL layout section are NOT verified.
- The local run finished later: see the entry above. The first step showed Eight Queens "restart click timeout" at 390 locally under load; Eight Queens passed at 390 on live. No assertion was weakened.
- play-all has drivers for 50 games only. The other 75 are driven by play-nostalgia (5), play-nostalgia2 (20) and play-nostalgia3 (50); "no driver" in play-all logs is expected, and "golf" gets a wrong generic driver there.
- Still open, not accepted by Or: new games English only; no real-device, human, screen-reader, native-speaker, medical or legal review; art has no legal clearance; small cells on 320px; hover jitter. Not touched: Voyageworthy, the preview site, ASIA, Junior, billing, server control.

## 2026-11-04 - LIVE DEPLOY of BrainPlay d1e0112 (Or approved; published before the remaining regressions finished, at Or's request)
- Live: https://games.178-105-148-72.sslip.io/ (Caddy -> elders-ai.service :8792, /opt/Elders_Ai). main fast-forwarded 7edd6ce -> d1e0112; site code is d1e0112, later main commits are docs only. Cache golden-games-v84, ASSET_V 80.
- Inventory, measured on live: 75 games (46 live before + 4 Gentle Practice + 5 batch 1 + 20 batch 2; 450 landing pages, 451 sitemap URLs), 17 articles (3 existing + 10 Gentle Practice + 4 history notes). Batch 1: Mancala, Dots and Boxes, Peg Jump, Kitchen Table Dice, Boardwalk Roll. Batch 2 (bundle 94d6a13, sha256 73115fe8...): 20 games, 4 articles.
- ROLLBACK to the pre-deploy site: (a) tag rollback/live-before-3a1b44f = 7edd6ce on GitHub; `git push origin $(git commit-tree 7edd6ce^{tree} -p origin/main -m "Rollback to 7edd6ce"):main`, then on the VPS `git -C /opt/Elders_Ai pull --ff-only && systemctl restart elders-ai`; the changed sw.js replaces v84 for returning visitors. (b) VPS archive /root/backups/elders-ai-live-before-3a1b44f-20261104-0825.tar.gz, sha256 8568642a1feadd4e5561a90036ee5d248b73d63d33e0150d673c2d09353f1bd5, verified equal to the live tree just before the deploy. The rollback itself was not run. Do NOT hard-reset only the VPS.
- Article checks: the 4 history notes were checked by opening sources. Removed as unverifiable: 1979 Manchester exhibition, December 1982 magazine date, tiddlywinks, the exhibition's exact title, "accounts differ", a Boing Boing quote source. NPR, Smithsonian Magazine, si.edu, Boing Boing and PressReader refused or timed out, so they are not cited. arXiv paper: abstract only.
- Found and fixed in this integration: Moon Landing Fuel gauge clipped at 320px with large text. Test tools: article count checks now exact at 17/18; play driver logs full errors. No check was weakened.
- Passed on LIVE: 450 landing pages; card pictures and articles; 145 js/css/top-level files equal the commit; 142 precached files; 75 games open at 390 and 1280 with no script errors or sideways scroll; hub shows 75 cards at both widths; 17 articles, internal links, 15 game links; private paths 404; returning visitor v77 -> v84, old cache removed, saved progress kept, new game opened offline. Play on live: batch 2 20/20 at 390, 19/20 at 1280 (Moon Landing: New landing click "element is not stable", the known hover-lift jitter; passes in the local run and in its own win path), win paths 20/20, batch 1 5/5 at both widths, collection 133/133, regressions 8/8.
- Passed locally on the same code: batch 2 20/20 at 390 and 1280 after reruns (first-run failures traced to the test server refusing connections, queue enlarged, checks unchanged), keys 41/41, layout 319/319, header 288 views, play-all 390 all 50 scripted older games OK.
- NOT FINISHED: the system stopped the background test jobs for low memory (Claude Code low-memory stop, not restarted, as its notice instructs). Never ran on this build: e2e-suite batches. Incomplete: play-all at 1280 (37 of 75 reached) and on live. Unverified flags from the stopped low-memory desktop run: FreeCell undo (passed at 390; code unchanged since 3a1b44f where it passed at 1280), counting and hearts click timeouts. play-all has no driver for the 25 newest games; "golf" gets a wrong generic driver there and passes its own play test.
- Open, not accepted by Or: Chess and other tall boards need scrolling on an 800px-high desktop screen; hover jitter site-wide; small cells on 320px (Reversi, Chess, 13x13 maze, 12x12 Color by Number); new games English only; New game has no confirmation in batch 1; opponents decent, not expert; Rail Yard no par on hard; no real-device, human or screen-reader testing; no native-speaker, medical or legal review; art no legal clearance. Earlier limits: docs/HANDOFF_NOSTALGIA_INTEGRATION_20261104.md and docs/HANDOFF_COLLECTION_20261103.md.
- Not touched: Voyageworthy, the BrainPlay preview (still d627950), GitHub permissions.
## 2026-11-03 - LIVE DEPLOY of BrainPlay review d86506d (Or approved separately)
- Live: https://games.178-105-148-72.sslip.io/ (Caddy -> elders-ai.service :8792 serving /opt/Elders_Ai). Deployed main = merge commit b5ec801 (parents 1e2755e live-before + d86506d). Tree equals d86506d plus main's two docs-only files (AUDIT-2026-10-10.md, HANDOFF.md; HANDOFF.md kept both histories).
- Contents: warm redesign line (preview/warm-redesign), runtime assets, art04 headers (FreeCell/Spider/Gin Rummy/Go Fish), 3 English articles + articles.html + footer/about links (6 languages), Hebrew prevention-tip correction, Go Fish phone header fix.
- ROLLBACK (pre-deploy state 1e2755e): (a) git tag rollback/live-before-d86506d on GitHub = 1e2755e; (b) VPS archive /root/backups/elders-ai-live-before-d86506d-.tar.gz (name has a stray empty date), sha256 48b4ce79ed0e1e99581cef24bbe24a51b10dde040228bbf42877b2487259f91d, 1300 entries, taken before the pull. To roll back: `git revert -m 1 b5ec801` on main + push, then `ssh root@178.105.148.72 systemctl restart elders-ai` (the unit fetches origin main and hard-resets on start, so the VPS follows GitHub main). Do NOT hard-reset only the VPS; the next restart would re-deploy origin/main.
- Live checks (2026-11-03): all 200: /, articles.html, 3 articles, about, css/articles.css, /en/gofish/, /he/freecell/, scene-gofish.webp, sw.js; HANDOFF.md, tools/preview/*.py, /.git/config = 404 (Caddy notsite). Footer Articles link 12/12 PASS (6 langs x 390/1280, RTL ok, click-through works). Articles/about 5 pages x 320/390/1280 x light/dark HTTP 200, normal-text contrast >= 7.09. Go Fish phone header screenshot shows rod/reeds/cattails. play-all (targeted, not a full suite) freecell, spider, ginrummy, gofish, digitspan, backgammon: 6/6 OK at 390 and 1280 on live.
- Still open (accepted by Or): digitspan @1280 / backgammon failed on the local review run but passed once on live (flaky or local-environment; not explained, no baseline comparison); solitaire @1440 dark e2e local failure unexplained; 4 external article source links unverified (403/405 to plain fetch); fifteen/mastermind @1280 not re-run; residuals in the review handoff (brainplay-review-d86506d-20261103). Not run live: full play-all/e2e.
- Screenshots page not published: Artifact tool refused the scratchpad PNGs ("blocked by a Read permission rule"); permission rules unchanged. Screenshots are in _BACKUPS\brainplay-review-d86506d-20261103\evidence\screenshots.
- Untouched: ASIA, CONNECTION, ABR_Ai. Review worktree Elders_Ai_review-74f and deploy worktree Elders_Ai_deploy-d86 (branch deploy/main-d86506d) kept locally.
## 2026-10-10 - pre-launch audit (report only, no site code changed)

Full report: `AUDIT-2026-10-10.md` (main). Tested the preview @ d6e8cbc at 1280 and 390 px; every game played end to
end with real clicks by `tools/preview/play-all.js` (preview branch, c4059cd). 0 console errors in 28 games.
- **Broken:** Falling Blocks - `blocks.js` uses `window.gameState`/`window.currentLang` (they are `let` globals), so
  game over never opens the end screen and the keyboard does nothing. Same on live `main`.
- Hangman unwinnable in Greek (Latin keyboard); Recall Hard: the 4 s countdown wipes the picks; Number Sequence's
  4th generator makes rule-less puzzles; double-tap counts twice in 14 games; Time Journey/Safari cards show Hebrew
  on en/es/fr/de/el (`lang-content.js` loads after the first `changeLanguage`); every quiz says "Well Done!" at 0/10.
- 48 design problems and 16 inputs Or must supply (logo, name, domain, photo direction, content era, AdSense ID,
  consent, legal) are listed in the report. Nothing was fixed; the fix order is at the end of Part 2.

## 2026-10-09 (round 3) - visual upgrade on `preview/warm-redesign` @ d6e8cbc (preview only, main untouched)

Or's call: the games looked cheap because they were built from keyboard emoji. Preview rebuilt; e2e **100/100**
(new section 9). ASSET_V / sw CACHE 65. Report: https://claude.ai/artifact/JWTWftcCvN9wn8h9nUZCAJ (private).
- **Icons:** one family, Lucide 1.48.0 (ISC), self-hosted: `images/icons/lucide/*.svg` + LICENSE, inlined into
  `js/lucide-icons.js` by `python tools/build_icons.py <lucide-static/icons>` (add a name to its list, rerun).
  `js/icons.js`: `Icon.ui(name)` for buttons/labels, `Icon.sym(emoji)` for gameplay symbols. Game data keeps its emoji
  as keys (memory matching, recall's "🍎 Apple" strings in 6 languages); SYM maps key -> icon + colour (all >= 4.5:1
  on white); unknown keys fall back to the emoji. A missing icon logs "Icon missing" (section 9 fails on it).
  Gotchas: Tailwind preflight makes svg display:block (warm.css sets `.lc{display:inline-block}`); every `.lc` has
  pointer-events:none (the ☰ outside-click check compares e.target with the button).
- **Games converted:** memory (icon faces, framed amber back), odd one out (sets differ in shape AND colour), quick
  count (8 hues), recall, shape sorter (solid shapes), time journey, sequence, true/false, digit span, hangman,
  klondike, jigsaw, word search. Living Safari = 12 Pexels animal portraits (`images/safari/`) on a savanna photo.
  Home: header controls, hero, card benefit lines, About/Play links, favourite hearts, ticker, tip bar, daily
  challenge (also made readable in light mode), brain score, games menu, level-complete dialog, landing-page theme
  button. Kept: playing-card suits; the player's own avatar emoji; achievements/share message text.
- **Photos:** all 28 cards (960x720), 6 jigsaw pictures (1200x900) and safari (240px portraits + 1280x720 backdrop)
  are Pexels; file -> photographer -> source in IMAGES.md, all 47 on credits.html (+ Lucide licence). The old
  uncredited Wikimedia/AI cards are gone, incl. GLAM (letters) and the UN-lettering flags card.
- **Or's defects:** Shabbat banner 1.4:1 -> 8.6:1 light / 12.2:1 dark. Light background: ambient photo removed in
  both themes (the pale wash left grey smudges) - both options are in the report.
- Six games (colormatch, digitspan, clock, counting, category, letters) showed "undefined" as their subtitle; they
  now fall back to the card description. `js/gametext.js` re-keyed for strings that lost an emoji prefix (gt() looks
  up es/fr/de/el by the English text). Recall pool: lion/butterfly/violin -> turtle/bird/piano (no Lucide icon).
- Rollback: the preview branch is all this is; `git revert d6e8cbc` on preview/warm-redesign and rebuild.

## 2026-10-09 (round 2) - Or's 9 fixes on `preview/warm-redesign` @ 66d81f2 (still preview only, main untouched)

Preview rebuilt; e2e suite **94/94** (new section 8 checks each fix). ASSET_V / sw CACHE 64.
- Ticker medical-claim line: **left as is** (Or's call: casual site, playful line is fine). Not changed.
- No dark photo backgrounds: dark theme drops the ambient photo (plain warm gradient); light keeps it as a pale cream
  wash; game headers fade the photo into the ivory table with dark ink. Landing pages (168, `tools/build_pages.py`,
  regenerate with `python tools/build_pages.py`) are now light cards with the photo framed, a Light/Dark button
  (same `gg-theme` key as the app) and 48px links.
- Light mode readable: hero + "why" titles were transparent gradient text (an older light rule out-ranked warm.css);
  tip bar (was 1.5:1), practice-score pill, hub difficulty buttons, ticker ✕, jigsaw piece-count chips (were 1.2:1).
  The "profile pill dark-on-dark" could not be reproduced on the preview (390/1440, name/no name, OS dark); the chip
  colours are now pinned anyway.
- Card photos replaced (Wikimedia Commons, no baked-in text): oddoneout (yellow tulip among red), flags (Palais des
  Nations avenue), math (six dice 1-6), wordsearch (alphabet tiles). Credits: `credits.html` (footer link) + IMAGES.md.
  Older Commons cards have no on-site credit (pre-existing gap); trivia's card photo has "VINCENT" on a uniform.
- Memory: 8/12/16/20/24 cards only (pairs rounded up to even, min 4 - so "easy" level 1 is now 4 pairs, was 2), the
  column count divides the card count, plain warm card backs, less padding.
- Odd one out: distinct symbol sets (no sunflower/daisy, car/SUV, cat faces...).
- Welcome: first visit = a small corner card (name + "Pick a symbol" + ✕), marked seen when shown; the full editor is
  still `Profile.edit()` from the profile button.
- Copy: no "no ads" anywhere (ticker EN line, es/fr/de/el footers, Hebrew default footer, landing chips).
- Phones: one-row header (logo, title / level in a game, ☰ Menu, Light/Dark, Back) with labels; text size, sound,
  scores, awards, invite, profile and the language dropdown are MOVED into a labelled grid at the top of the ☰ menu
  by `js/warm.js` (same elements; moved back on wider screens). "About this game" links 52px.

## 2026-10-09 - warm redesign on a PREVIEW branch (not live; main untouched)

**Preview:** https://games-preview.178-105-148-72.sslip.io (noindex) · branch `preview/warm-redesign` (c6e4f0b+) ·
the live site games.178-105-148-72.sslip.io and GitHub Pages still serve `main`. Merge only with Or's yes.

What changed (all additive; `css/warm.css` is the last stylesheet, `js/warm.js` the helper; ASSET_V / sw CACHE 63):
- Warm high-contrast palette in both themes (main text 8:1 to 16.8:1, measured), bigger type, 48px+ buttons.
- Light/dark toggle kept (`toggleTheme` unchanged) and now labelled ("Light"/"Dark", 6 languages), always on row 1.
- Inside every game: the game's own photo (images/cards/<id>.jpg) as a header, ivory game table, quiz answers in four
  warm colours with strong right/wrong colours + check/cross marks, memory card backs with a photo, green felt for Klondike.
- Fixed on the way (also broken on the live site): Klondike's Undo/Hint/New deal labels and empty slots were white on
  white; on a 390px phone Sudoku lost its outer columns and Klondike showed 5 of 7 piles. Trivia answers were
  right-aligned in English.
- Ads: the existing #adBar ticker (and affiliate.js) unchanged, but hidden while a game is being played; it shows on
  the hub and at the end-of-game modal (html.in-game / html.between-games). No new ad network.
- Every game page linked from the hub: "About this game" on each card + an "All games" list (`#all-games`, 28 links
  to `<lang>/<id>/`, following the language), plus play links (`?lang=xx#id`).
- Phone header: two rows of controls, nothing removed; the Invite button (hidden on phones since ee95f2d) is back.
- Nothing interactive dropped: checked against `tools/preview/baseline-inventory.json` (captured from the live site).
- Open / not done: the first-visit "Welcome" profile card still covers everything on first load; copy mismatch
  "no ads" (ticker) vs "supported by quiet ads" (footer) left for Or; `levelComplete` from the review tool's
  "Show me" records a win in that browser's stats (preview only).

Preview infra (VPS): /opt/brainplay-preview/{repo.git,site,notes,tool}; `brainplay-preview.service` (127.0.0.1:8798);
Caddy block `games-preview.178-105-148-72.sslip.io` (backup Caddyfile.bak-before-brainplay-preview-20261009).
Rebuild: `bash /opt/brainplay-preview/tool/build-preview.sh` (renames the SW cache per build so reviewers never see a
stale copy). Review notes: `cat /opt/brainplay-preview/notes/notes.json`.
e2e: `node tools/preview/e2e-suite.js <dir with node_modules/playwright>` on the preview branch - **79/79**
(28 games x 390 light + 1440 dark, 6 languages, nothing lost vs live, ads never mid-game, toggle, links, contrast,
review tool). Playwright now runs on Or's PC again (it hung on 2026-10-06).
## 2026-10-12 (f) / 2026-10-10 (d) - games project, per-wave status (preview only; main untouched) - RESUME HERE

Or's full plan arrived complete this time (waves 3/4 included): Wave 0 = 9 review fixes, then 36 games in 4 waves of 9.
Wave 3 list (final): Finish the Lyric, Who Sang It, Movie Quote Quiz (60s-80s), TV Trivia (60s-80s), Name That Year,
Famous Faces, Vintage Brands and Ads, Then vs Now prices, States & Capitals. Wave 4 (final): Space Invaders-style,
Asteroids-style, Pong, Breakout, Frogger-style, Duck Hunt-style gallery, Missile Command-style, Snake, Whack-a-Mole.
The 8 wave-1 games committed earlier (f4a39a1) match Or's wave-1 list exactly and were kept (not "partial work").

**Wave 0 - DONE (9/9).** Items 1-5, 8, 9 in c4bc8cc (see (c) below); this round:
- #6 Trivia: 205 American questions, 1950s-1980s x TV / music / movies / everyday life / sports / history, each with a
  one-line explanation shown after the answer (Next button, no auto-advance), decade + topic picker, repeat avoidance
  (localStorage `gg_qk_seen_<id>`: no question repeats until the chosen mix is used up; the next round never repeats
  the last one). Easy = levels 1-2 of the same adult questions (best-known first), hard = levels 2-3. Hebrew keeps its
  old general pool. Engine: **QuizKit** in js/game-kit.js (shared by trivia and all wave-3 quizzes).
- #7 American English (practise/ageing/favourites/colour/organised -> US) and nostalgia tone: "{n} Classic Games",
  "Pick a game and play at your own pace", Play buttons, "Tap" instead of "Click", hero mark = the record logo (was a
  brain), daily lines are nostalgic (the old unattributed "brain is a muscle" quotes are gone), the tip carousel now
  has checkable "Did you know?" facts instead of health claims ("sleep improves memory by up to 40%" removed), share
  texts, manifest, landing pages ("Why it is good for you"). The health copy stays, lower on the page.
- Found and fixed on the way (root causes):
  - genre chips were styled as header buttons: `#hub-nav` was a `<nav>`, and warm.css styles every `body nav button`
    with !important -> now a div with role=navigation.
  - in-place language switch race: the tip carousel and the ticker chose their language BEFORE their 400/500 ms fade,
    so a rotation in flight wrote the old language back; and a switch faded the old text out slowly. Both now read the
    language when writing, and a switch writes at once (e2e 11b).
  - Living Safari at 320 px: animals were placed by `left:x%` with an 80 px sprite, so at x=90% they hung 20 px off
    the right edge -> `left: calc((100% - size) * t)`.
  - play-all "recall" timeout at 1280: the driver's `text=Check` matched the hidden "Checkers" card (wave 1) -> all
    driver text selectors are scoped to #gameContent. Not a game bug.
  - ticker said "28 familiar games" (hard-coded) -> real count.
- Tests added: e2e **11b** (whole page after an in-place he->en switch at 390 px: hub incl. welcome card, a game, its
  end screen - no Hebrew left, URL ?lang=en), e2e **12** (every game, after its own Start button, at 320/390/430 px
  and 390 RTL: nothing wider than the screen; arcade `.ak-stage` + `.ak-controls` must fit the screen height),
  play-all QuizKit driver (explanation after every answer, double-tap scores once, no repeats in the next round).
- Checks (local server, tree of this commit + Hearts): e2e **103/104** (the 1 = "review toolbar present", which only
  exists on the VPS preview build); play-all **37/37 at 390** and **37/37 at 1280** (recall re-run after the selector fix).

**Wave 1 - DONE (9/9).** FreeCell, Spider (1 suit), Checkers, Backgammon, Dominoes, Crazy Eights, Gin Rummy, Go Fish
(f4a39a1) + **Hearts** (this commit): one hand vs 3 computer players, pass 3 cards (left/right/across/keep by level),
2♣ leads, follow suit, no points on trick 1, hearts must be broken, shoot the moon; lowest (or tied lowest) score
passes. Gold dashed = playable now, blue = the cards you were passed; an illegal card says why. play-all driver plays a
full hand (pass cap at 3, illegal card refused, points add up to 26).

**Pre-wave-2 fixes - DONE (1363259, on the preview):** About page count comes from the build
(`<!-- gen:game-count -->`, written by build_new_games.py: 37 then, 46 now); ☰ menu on phones = bounded flex column, only
the list scrolls (root cause: the panel's inline overflow:hidden beat warm.css's overflow-y:auto and the list had
max-height none -> a 1,790 px list clipped by a 754 px panel); Quick Count = visible countdown (20/14/10 s), 100 points +
10 per second left, time-out = a miss with the answer shown. e2e 13 / 13b added and passing.

**Wave 2 - DONE (9/9), on the preview @ 3158b48 (assets v73).** Crossword, cryptoquote, word ladder, picture logic
(nonogram), minesweeper, 2048, spot the difference (10 public-domain Margolies photos, credited on credits.html),
15-puzzle, mastermind. Fixed during the round (root causes):
- game boxes shrank to content inside the centred flex #gameContent (grids wider than the card were clipped:
  minesweeper showed 7 of 9 columns at 320) -> width:100% on every wave-2 box and QuizKit; grid cells/keys got class
  `gk-cell` so a11y.css's 48 px button minimum and premium.css's 1.1rem rounding (circles) do not apply; Word Ladder key
  "Enter" -> "OK" (cut at 320). e2e 12 now measures against the game CARD edges (the card clips; the old screen-edge
  check missed clipped grids).
- emoji (site rule = Lucide only): minesweeper 💣🚩⛏ -> Lucide bomb / flag / search; mastermind peg glyphs ★●▲◆♥■ ->
  Lucide star/circle/triangle/diamond/heart/square, feedback ●○ -> filled/outline Lucide circle (c46a2b2).
- the stricter card-edge check caught 3 OLDER games (3158b48): Spider - GameKit.fit's 28 px card floor made 10 columns
  wider than a 320 px card (outer two columns clipped) -> fit() takes a floor, Spider uses 20; Falling Blocks - touch pad
  was `min(94vw,420px)` = 6 px past the card each side at 320 -> width:100%, canvas max-width 100%; Jigsaw - only the
  invisible knob padding of the slot outline svgs (opacity 0, edge slots have flat sides) -> `data-allow-overflow`.
- Tests run FROM THE VPS against the preview (PC short of memory): `/root/bp-tests` = `git archive` of tools/ from
  /opt/brainplay-preview/repo.git; Playwright dir arg = `/opt/whatsapp-deals-bot` (the script appends node_modules).
  Results: e2e **113/113** (incl. 12: 46 games x 320/390/430/390-RTL, 13 menu scroll, 13b Quick Count timeout, review
  toolbar), play-all **46/46 at 390** and **46/46 at 1280**.
  Gotcha: a wait loop `while pgrep -f play-all.js` matches its own bash command line -> use `pgrep -f "^node tools/..."`.

**RESUME HERE: Wave 3** (only `tools/drafts/wave3/whosang.js` written, 61 songs) then Wave 4, as described below.
## 2026-10-10 (c) - games project: wave 1 (8/9) + wave 0 (7/9) (preview only; main untouched)

Or's plan (latest message): Wave 0 = 9 review fixes, then 36 games in 4 waves of 9. Waves 3/4 lists were cut off in his
message; assumed = the earlier lists (trivia: song titles, who sang it, movie quotes, TV, name that year, famous faces,
brands/slogans, then-vs-now prices, states & capitals; arcade: invaders, asteroids, pong, breakout, road crossing,
gallery, snake, Simon-style (exists as Color Sequence), moles). Already on the site, not duplicated: Klondike, Sudoku,
Hangman (Word Balloons), Jigsaw, Color Sequence (Simon).

**Built so far**
- Infrastructure: `tools/new_games.json` (registry) + `tools/build_new_games.py` (publishes a game once js/games/<id>.js
  exists: hub section+cards, All-games list, maps, menu, i18n fallback, skills, daily challenge, SW precache);
  `js/game-kit.js` (cards, buttons, felt, GameKit.finish -> shared end screen with game-reported result, GameKit.fit);
  card pictures `tools/preview/card-shots.js` + `frame_shots.py`; landing pages via `tools/build_pages.py`.
  Caddy `(notsite)` landing exemption is now `^/(he|en|es|fr|de|el)/[a-z0-9]+/$` (backup Caddyfile.bak-before-game-ids-20261010).
- **Wave 1 (commit f4a39a1): FreeCell, Spider (1 suit), Checkers, Backgammon, Dominoes, Crazy Eights, Gin Rummy, Go Fish**
  - each played to the end by play-all drivers (win and loss paths). **Hearts is still to do** (wave 1 = 9).
- **Wave 0 (this commit), done:** #1/#2 Jigsaw fits 320/390/430 + RTL, readable on the ivory table; #3 in-place language
  switch redraws hero quote, daily challenge (names now in the current language), practice score, tip, ticker, welcome
  card, end-screen "new personal best" (key new_best), game title/instructions; URL ?lang= follows; e2e section 11;
  #4 Color Sequence runs are tied to their state object (no TypeError after leaving mid-run); #5 hub: Continue +
  favorites + genre chips (js/hub-nav.js, every game has a genre) on top, "Why train" moved below the games;
  #8 Falling Blocks: viewport-height board, one control row, Start/Pause/Restart, Enter/P keys; #9 Klondike How to play
  with rules + worked example. Also: default theme follows the system setting until the visitor picks one.
- Root causes worth knowing: categories.js found cards by `[onclick=loadGame(id)]` and grabbed the new hub buttons
  (now `.premium-card[...]`); changeLanguage called the ticker before `_adMsgs` existed (TDZ) which aborted the rest;
  daily-challenge names used a selector that matched nothing (always Hebrew); vanilla-cookieconsent hides itself from
  automated browsers (tests mask navigator.webdriver or pre-set cc_cookie).

**NOT done yet - resume in this order**
1. Wave 0 #6 Trivia expansion (50s-80s American sets: TV, music, movies, everyday objects, sports, history; decade/topic
   picker; short explanation after each answer; repeat avoidance; verifiable facts only).
2. Wave 0 #7 American English + nostalgia/fun tone across copy (practise->practice, ageing->aging, favourites->favorites...).
3. Run play-all (both widths) + e2e on the preview; check the play-all 1280 failure on **recall** (click timeout,
   seen on the wave-1 run - not yet investigated). Then report Wave 0 with the commit hash.
4. Hearts (finishes wave 1), then wave 2: crossword (word list started: js/data/crossword-words.js, game not built),
   cryptoquote, word ladder, nonogram, minesweeper, 2048, spot the difference (vintage PD photos), 15-puzzle,
   mastermind - update tools/new_games.json to that list (anagrams was dropped; registry still lists it - remove).
5. Waves 3 and 4 (arcade games also need start/pause/restart, relaxed mode, phone-fit controls, touch + keyboard).

## 2026-10-10 (b) - honest end screen, Hebrew Shabbat content, privacy/about corrections (preview only; main untouched)

Commits ea55a47 + 971c7cf on `preview/warm-redesign`, ASSET_V / sw CACHE 67. Not merged; the live site is still main 1e2755e.

**Audience (Or, 2026-10-10):** primary audience is **American 50+**. Nostalgia references, trivia topics and photos should
lean American; Hebrew is low priority (no effort on Hebrew-specific content). Applies to all future content work.

- **A. Hebrew content:** trivia question "באיזה יום בשבוע חל שבת?" removed (it answered itself); "שבת" removed from the
  Hebrew ws_pool. The "שישי שמח" badge left alone. (Other "שבת" substrings left: "לשבת" = sit, "שבתאי" = Saturn.)
- **B3. End screen matches performance** (`levelComplete` in index.html): a scored session passes at **60% correct**
  (`PASS_RATIO`). Below that: title "Nice try - want to play again?" (6 languages), body "x of n this time", a replay
  icon, **no confetti, no win sound, no level saved, no personal best, no badges, no daily-challenge credit, no share
  button**; the button is "Play again" at the same level. A finished session still counts as a game played for the
  streak / "played today" (it was practice) - my call. Unscored puzzles (memory, sudoku, jigsaw, word search...) only end
  when solved, so they always win. Falling Blocks is judged by lines cleared (0 = "Nice try"); Time Journey by
  memories collected, same 60% bar; Color Sequence's own end screen says "Nice try" (and records no best) when the very
  first colour was missed. Recall and Word Balloons already had their own gentle fail screens (unchanged).
- **B4 / B5** were fixed in the previous round (6ea3705) and re-verified: a found Word Search letter can start or join a
  new word; a matched Memory card stays opaque and shows its picture (checked by screenshot).
- **C. privacy.html** - Or's wording for items 6-12: ads described as planned through Google AdSense (not active);
  the AdSense advertising-cookies paragraph + a Google Ads Settings link next to the partner-sites link; local data,
  retention, rights (GDPR list, withdrawal), "your browser sends your IP address to the server hosting BrainPlay"
  replaces the unverifiable no-log sentence; "If you email us"; Cookie settings "on this page or in the games homepage
  footer". Exactly **one** `[CONTACT EMAIL — to be added before launch]` (under "Who runs this site").
- **D. about.html** - items 13-15 (funding planned, "Play at your own pace", medical disclaimer) and a working
  **Cookie settings** link in its footer. Meta descriptions of both pages no longer repeat the old claims.
- **Same rule applied where the old claim also lived (my call, consistency with item 6):** the hub footer in all 6
  languages ("Free to play, no sign-up. Your progress stays in your browser on this device.") and the consent banner
  text in all 6 languages now say ads are planned, not running, and no longer promise "never during a game".
- Tools: `tools/preview/check-endscreen-legal.js <playwright dir> [url]` = the 24 targeted checks for this batch;
  e2e-suite's footer check now asserts that no footer claims ads are already running.

**PRE-LAUNCH BLOCKERS (Or - recorded, NOT done):**
1. Verify the real server / log-retention facts (Caddy, Docker, hosting provider) before the site makes ANY logging claim.
2. Confirm the consent setup meets Google's requirement of a **Google-certified CMP integrated with IAB TCF** for
   personalised ads in the EEA / UK / Switzerland **before AdSense goes live** (vanilla-cookieconsent is not a certified CMP).
3. Add the consent **vendor list** before the policy claims one.
4. Replace `[CONTACT EMAIL — to be added before launch]` with the real address Or provides.
5. Translate Privacy / About into the other 5 languages **only after Or approves the corrected English**.

**Checks** (all against the deployed preview @ 971c7cf; the PC's local test servers were stopped for low memory)
- `tools/preview/check-endscreen-legal.js`: **24/24** - trivia 0/10 -> "Nice try", no confetti, Play again, level not
  saved, replay starts at level 1; true/false 8/8 -> "Well Done!" + Level 2 saved; 5/10 fails (Hebrew), 6/10 passes;
  Falling Blocks 0 lines and Time Journey 0 memories -> "Nice try"; Word Search found-letter reuse; Memory matched card
  (screenshot shows the picture); both Hebrew removals; every new privacy/about sentence present, old ones gone, one
  contact placeholder per page, Cookie settings opens the dialog on both pages; no footer says ads already run.
  (The banner library hides itself from automated browsers - the check masks `navigator.webdriver`.)
- `tools/preview/play-all.js`: **28/28 at 1280 px, 28/28 at 390 px**, 0 console errors.
- `tools/preview/e2e-suite.js`: **100/100**.

## 2026-10-10 - audit fixes + design round 4 on `preview/warm-redesign` (preview only; main and the live site untouched)

From the audit (`AUDIT-2026-10-10.md` on main) and Or's answers of 2026-10-10. ASSET_V / sw CACHE 66.
Merge to main only with Or's yes. The logo and all new copy (privacy, about, headline, ticker, footer) are DRAFTS for
Or's approval.

**Game fixes** (re-checked with `tools/preview/play-all.js` at 1280 and 390 px; results at the end of this entry)
- Falling Blocks: `window.gameState` / `window.currentLang` -> the `let` globals. Game over now opens the end screen;
  arrow keys / Space work. No `_sessionScore` (a number made the modal read "undefined/undefined").
- One answer per question in 14 games (`gs._locked`, reset when the next question renders): oddoneout, math, numseq,
  trivia, truefalse, flags, proverbs, colormatch, clock, counting, category, letters, digitspan (OK key), lifesim.
- Hangman: Greek keyboard (`_EL_KB`, `_hmKb()`); `_hmNorm` folds final letters and accents (ς->Σ, Ά->Α, É->E).
- Picture Recall Hard: "Got them!" clears the countdown (`gs._iv`); a countdown can no longer draw into another game.
- Number Sequence: 4th generator is a real "sum of the two before" rule (a,b,a+b,a+2b -> 2a+3b, b > a).
- Time Journey / Living Safari cards were Hebrew on en/es/fr/de/el: `lang-content.js` now re-applies `[data-i18n]`.
- Living Safari: animals 80 px+, the requested animal is drawn on top, a tap on the grass within one animal's width
  counts for the nearest animal; taps after the last round are ignored.
- Found on the way (also broken on the live site): Word Search - a word crossing an already-found word could never
  be completed (found cells were untappable). Memory - a matched pair showed its BACK, not its picture (opacity < 1 on
  the 3D card flattened it; `css/warm.css` keeps the card opaque).

**Design**
- Logo (draft): `images/logo.svg` - an old vinyl record whose label is a play button; cream rim so it reads on the
  light and dark header. App icons regenerated from `images/icon.svg` (icon-192/512, apple-touch-icon). The per-language
  header letter is gone. One brand everywhere: "BrainPlay" (site_title, footer, share texts, manifest, landing pages).
- Card pictures = real screenshots: `images/cards/<id>.jpg` made by `tools/preview/card-shots.js` (plays each game a few
  moves, captures the play area at 640 px) + `tools/preview/frame_shots.py` (instant-photo frame on warm paper - the
  nostalgia is the frame, the picture is the game). Rebuild: run both, then `python tools/build_pages.py`.
  The Pexels object photos moved to `images/scenes/<id>.jpg` and stay as the photo at the top of each game (credits
  updated). `scenes/lifesim.jpg` (people's faces) removed: no stock photos of people; Time Journey has no header photo.
  Hub thumbnails are 4:3 on phones too (16:9 cut half the game off).
- Consent: vanilla-cookieconsent 3.1.0 (MIT) self-hosted in `js/vendor/cookieconsent/` (the UMD is wrapped in a function:
  as a plain script its `var t` replaced the site's `t()` and broke every game). `js/consent.js` = 6 languages, equal
  Accept / Reject, categories necessary + ads, Google Consent Mode v2 defaults DENIED in `<head>`; `css/consent.css`.
  The banner hides itself from automated browsers (`hideFromBots`): tests pre-set the `cc_cookie` (both harnesses do).
  The first-visit welcome card waits until the banner is answered. NO ad code yet - see "next".
- Footer: "no data collection" / "no pop-ups" gone, in all 6 languages; links About · Privacy · Cookie settings.
- `privacy.html` + `about.html` (English drafts, own URLs, linked from the hub footer and every landing page):
  operator "BrainPlay", one marked placeholder `[CONTACT EMAIL — to be added before launch]`; no company, address or email
  invented. Statements checked: localStorage only (sync.js has no URL), consent cookie 182 days, Google Fonts and
  flagcdn.com named, no access log in the Caddyfile for the games sites.
- Shabbat / Jewish-holiday banner removed everywhere (`js/holiday.js` keeps only the milestone celebration; slot, calls
  and CSS gone). The Friday badge keeps its id but is now "Friday Fun" / "שישי שמח".
- Hangman -> "Word Balloons" (6 languages; id and URLs still `hangman`): a bunch of balloons, one per allowed mistake;
  a wrong letter lets one float away (reduced-motion: it just disappears).
- Headline nostalgia-first: "The games you grew up with" (+5 languages), page title and manifest description.

**My calls on the smaller audit questions (Or: "make the sensible call, record it")**
- Ticker: every line rewritten to true, checkable statements (no "studies show", "no tracking", doctor or brain claims).
- Shabbat banner: removed (Or). Holiday banner: removed with it - it was Jewish holidays only, the audience is international.
- Falling Blocks kept (Or) and fixed; Word Balloons name and picture as above.
- Privacy/About in English first; the other 5 languages once Or approves the English text.
- 0/10 sessions still say "Well Done!" and advance a level - not changed this round (game-design decision, see next).

**Not done / next**
- AdSense: Or's answer says reuse the publisher ID from the allyfind/voyageworthy source without touching those sites -
  not wired yet (this round's list did not include it). Slot = end-of-game screen only.
- Translations of privacy/about; score-based end screen; self-host Google Fonts and the 20 flags (privacy page names them).
- Logo final approval (Or).

**Checks** (preview built from 6ea3705, https://games-preview.178-105-148-72.sslip.io)
- `tools/preview/play-all.js` on the final tree (local server): **28/28 at 1280 px and 28/28 at 390 px, 0 console
  errors**. Double-tap now advances one question; Falling Blocks reaches the end screen; Safari 6/6 taps on a phone.
  Against the deployed preview at 390 px: 27/28 on the first pass - Trivia hit a 4 s click timeout in the driver (once,
  not reproduced: Trivia passed on an immediate rerun and in both local passes); treat as a harness flake.
- `tools/preview/e2e-suite.js` against the preview: **100/100**. Its expectations were updated where the change was
  deliberate: header photo now from images/scenes (none for Time Journey), 46 credited Pexels photos (was 47), German /
  Greek footers say "Anzeigen" / "διαφημίσεις", landing-page back link is `../../?lang=xx`, and the Shabbat contrast
  check became "no Shabbat / holiday banner on a Saturday".
- Visual: hub 390 light / 1440 dark with the consent banner (en, he), footer links, preferences dialog, Word Balloons,
  Time Journey, About (390), Privacy (1440 dark), a landing page - screenshots checked by eye.
- Live site (games.178-105-148-72.sslip.io, /opt/Elders_Ai @ main 1e2755e) not touched; it still has the Falling
  Blocks, Word Search and Memory bugs above until the merge.

## 2026-10-07 - Server Claude ("incubator") + Telegram bridge (VPS infra, not the games site)

Goal (Or): stop working from the PC; talk to Claude Code on the VPS from a private
Telegram chat. The PC is a thin client. Full operator doc lives ON THE SERVER:
`/opt/incubator/README.md` (Claude's own rules: `/opt/incubator/work/CLAUDE.md`).
Source copy on Or's PC: `C:/Users/AdBitRush/repos/server-incubator` (not a git repo).

**Architecture**
- Unprivileged user `incubator`, home `/opt/incubator`, password locked, no sudo, no SSH key
  (reached only via root: `incubator-shell`). Everything runs in `incubator.slice`:
  MemoryHigh 750M / MemoryMax 900M, CPUQuota 100%, no swap (box has ~1.2 GB spare).
- `incubator-bridge.service` runs `/opt/incubator/bridge/bridge.mjs` (root-owned, ~150
  lines, zero dependencies): long-polls a NEW Telegram bot, obeys ONLY the owner's numeric
  ID in a private chat, silently drops everything else, runs `claude -p` (prompt on stdin)
  one job at a time in `/opt/incubator/work`, keeps the conversation via `--resume`.
  Commands: `/new /cancel /status /help`. Unit is sandboxed (NoNewPrivileges,
  ProtectSystem=strict, writes only `/opt/incubator`); children inherit that.
- Claude Code 2.1.292 in `/opt/incubator/claude` (isolated; root's global 2.1.183 untouched).
  **Auth is the claude.ai subscription login (`claude auth login`), never API keys:** root's
  `/root/claude-code.env` (ANTHROPIC_* per-token creds) is unreadable to `incubator`, and the
  bridge hands Claude a scrubbed env. `claude auth status` as `incubator` before login:
  `loggedIn:false, authMethod:none`.
- Toolbox: Playwright 1.54 + chromium headless shell 1181 (copied from the 2026-10-06
  sweep), Python venv (requests, pillow, bs4, pyyaml), Node, tmux. Add more under
  `/opt/incubator` and list it in `TOOLS.md`.
- Config `/etc/incubator/bridge.env` (0600 root): `ALLOWED_USER_ID` (copied at install from
  the ops bot's allowFrom) and `TELEGRAM_BOT_TOKEN`. `incubator-set-token` sets it (hidden
  prompt, validates with getMe, REFUSES the ops bot's token).
- Reused/untouched: OpenClaw `ops-agent` + @Christoph_s_bot keep their own token (Telegram
  allows ONE poller per token, so the bridge has its own bot); the WhatsApp deals bot,
  elders-ai, all timers, sshd, ufw and Tailscale are unchanged (before/after snapshot
  identical; iPhone Termius over Tailscale is the backup door). The cruise.com 04:00 fetch
  stays on the PC (home IP).

**Verified 2026-10-07:** mock-Telegram test `node /opt/incubator/bridge/test.mjs`, 12/12
(stranger gets no reply and never reaches Claude; owner's id in a group is ignored; spoofed
chat ignored; bot token and ANTHROPIC_* absent from Claude's env; prompt on stdin; ignored
updates logged by id only). Inside the unit's sandbox: cannot write /etc, /root or the bridge
code, no sudo, cannot read bridge.env, headless Chromium loads the live games site.
**NOT yet verified (needs Or):** a real Telegram round trip and a logged-in Claude.

**Or's two manual steps** (then message the bot "hello"):
1. `@BotFather` -> `/newbot` -> copy token -> `ssh root@178.105.148.72 incubator-set-token`
   (paste hidden) -> press Start on the new bot.
2. `ssh -t root@178.105.148.72 incubator-shell` -> `claude` -> `/login` (claude.ai
   subscription, NOT an API key) -> open the URL, sign in, paste the code back ->
   `/status` must show the claude.ai account -> `/exit` -> Ctrl-b d.

**Operate:** `systemctl status|restart incubator-bridge`; `journalctl -u incubator-bridge -f`;
EMERGENCY STOP `systemctl disable --now incubator-bridge`; rotate the token: BotFather
`/revoke` then `incubator-set-token`. Default tools Read,Grep,Glob,Edit,Write,Bash,WebFetch,
WebSearch, mode acceptEdits (override in bridge.env: CLAUDE_ALLOWED_TOOLS,
CLAUDE_PERMISSION_MODE).

**KNOWN LIMITATION (same-user design, chosen on purpose as the simple version):** the bridge
and the Claude it spawns run as the SAME user, so Claude can in principle read the bot token
from the bridge's `/proc/<pid>/environ` (a prompt-injected agent could leak it). A leaked
token lets someone hijack polling or message Or as the bot; it does NOT let them command the
server (only Or's id is accepted). Stronger design: bridge under its own uid with a
spawn-only helper. Mitigation now: revoke via BotFather if anything looks odd. Also the tmux
session is not inside the unit's sandbox (same unprivileged user, no sudo).
**Tailscale node key expires 2026-11-23** - disable key expiry in the admin console or the
iPhone door closes that day.
**Not built (the permission layer declined; add only with Or's explicit OK):** a root-run
scheduled-job runner and a daily doors-check timer.

### 2026-10-07 - git push access for the incubator (deploy keys, not a token)

The `incubator` user can push to exactly two repos, with two **per-repo write deploy keys**
generated ON the server (private keys never left it, mode 600 in `/opt/incubator/.ssh`):
| repo | remote form on the server | key | GitHub deploy key title |
|---|---|---|---|
| `AdbitRush/Elders_Ai` (PUBLIC) | `git@github.com:AdbitRush/Elders_Ai.git` | `id_ed25519` | `incubator-vps` |
| `AdbitRush/Cruise-seniors` (private) | `git@github-cruise:AdbitRush/Cruise-seniors.git` | `id_ed25519_cruise` | `incubator-vps-cruise` |
GitHub allows a deploy key on ONE repo only, hence two keys and the `github-cruise` host alias
in `/opt/incubator/.ssh/config`. `incubator`'s `~/.gitconfig` has the identity
(`Server Claude (incubator)`), `pull.ff=only`, and `insteadOf` rewrites so plain
`https://github.com/AdbitRush/{Elders_Ai,Cruise-seniors}` URLs resolve to the right key.
**Verified:** `ssh -T` names each repo; `git ls-remote` works for both; both keys are REFUSED
("Repository not found") on private repos `whatsapp-deals-bot` and `abri-one`; `git push
--dry-run` authenticates for write on both and created nothing on GitHub.
**Revoke:** GitHub repo -> Settings -> Deploy keys -> delete the key (or `gh repo deploy-key
delete`). Keys can also push to those repos' `main`, so treat the same-uid limitation above as
applying to them too.

**Deliberately NOT transferred from the PC** (the permission layer blocked a bulk credential
move, and it would widen the same-uid exposure): the PC's `gh` OAuth token (repo+workflow
scope = every repo), Hostinger/FTP credentials, affiliate/API keys, `.env` files, and the
Claude config/login (the server logs in on its own with `claude auth login`; sharing one OAuth
login between machines can sign the other out). If a server job needs a specific secret, name
the job and provision only that secret (root-owned file, read by the unit via EnvironmentFile),
not into the agent's home. Cruise-seniors on the VPS (`/opt/cruise-seniors`) still has ~4,700
uncommitted changes in the live docroot - not touched.

## 2026-10-06 — site audit (games.178-105-148-72.sslip.io)

Shipped in 4074812 (+ Caddy change on the VPS):
- **All 168 landing pages (`/<lang>/<game>/`) were 404 on the VPS.** The Caddy
  `(notsite)` snippet's `@dirlist` (`^/.+/$`, there to stop directory listings)
  caught them, and `/he/klondike` 301s into the slash form. Fixed by an exact
  exemption `^/(he|en|es|fr|de|el)/(<28 ids>)/$` in `/root/caddy/Caddyfile`
  (edited in place, backup `.bak-before-games-landing-20261006`). **A new game id
  must be added to that regex** or its landing pages will 404 on the VPS.
  Listings (`/js/`, `/images/`, `/css/`), `/.git/config` still 404.
- Light theme: logo, "Why train" and "28 Brain Games" headings were invisible
  (inline gradient styles beat the theme CSS; the overrides now carry `!important`).
- Duplicate, unclosed `#themeBtn` removed (it nested the language `<select>` in a button).
- `cdn.tailwindcss.com` (5 s+, render-blocking JIT) replaced by `css/tailwind.css`
  (23 KB). **Rebuild after adding Tailwind classes to index.html or js/**:
  `npx tailwindcss@3.4.17 -i in.css -o css/tailwind.css --content "./index.html,./js/**/*.js" --minify`
  (in.css = the three `@tailwind` directives).
- Removed: visible "ממתין ל-AdSense" placeholder box (#adSide), the "Ad" pill on a
  self-promo ticker (now ★), the IP-to-ipwho.is language lookup (now
  `navigator.language`), 28 runtime Pollinations.ai image fallbacks, the unused
  Supabase SDK tag (sync.js has no URL/key; re-add the tag when configured).
- "Brain Health" score renamed "Practice score" (it is not a health measure).
- ASSET_V and sw.js CACHE bumped to 60.

Known, not done: `counting.jpg` 623 KB / `flags.jpg` 448 KB (compress); mobile
header is ~1/3 of the viewport; the affiliate "admin" login is a SHA-256 hash in
the visitor's own localStorage, so it protects nothing and its settings are
per-browser; full 6-language x mobile sweep not completed (machine out of memory).

### Follow-up 2026-10-06 (later)
- Card images over 150 KB re-encoded (progressive JPEG q78, 960 px wide max):
  counting 623->68 KB, flags 448->25, colormatch 168->20, safari 298->232,
  blocks 275->218, math 193->160, pairs 172->136 (2.18 MB -> 0.86 MB total).
- **Verified live, English/desktop/dark: 28 of 28 games load, zero console errors.**
  NOT verified: he/es/fr/de/el, mobile, light theme across games. Two attempts
  failed because Playwright's browser (bundled headless shell AND installed Chrome)
  hung at launch on this PC; not a site fault. Re-run `sweep.py`-style checks
  (load `/#<game>` per lang/device, collect console errors, failed requests, and
  horizontal overflow) once the PC is healthy.

### DONE 2026-10-06 - affiliate admin login removed (Or chose Option A)
`js/affiliate.js` is now a ~70-line renderer driven by `AFFILIATE_CONFIG` at the
top of the file (platform, amazonTag, products). The login, password hash,
`?admin` / 5-tap trigger, per-browser product editor and "Forgot password" are
gone; the old `gg_aff_*` localStorage keys are deleted on load. Config ships as
`platform: 'off'` with no products, so nothing is shown and the normal
site-message ticker runs. **No real tag exists in the repo - Or must supply the
Amazon tag / links; none were invented.** To enable: edit the config, commit,
push. Only https:// links are rendered, names are HTML-escaped. Tested in Node
(off / on / hostile `javascript:` URL), not in a browser (see below).
ASSET_V and sw.js CACHE are 61.

### DONE 2026-10-06 (evening): full sweep + mobile header, run FROM THE VPS
Browsers hang at launch on Or's PC (bundled headless shell, installed Chrome and a
bare `chrome --headless` all hang; Defender is on and non-admin cannot see its
exclusions, so the cause is unproven but it is the PC, not Playwright). So the
sweep runs on the VPS: `/root/audit-sweep` (Node + playwright 1.54 +
chromium-headless-shell, ~300 MB, run with `nice -n 15`, one browser at a time;
VPS has ~1 GB free). Re-run:
`cd /root/audit-sweep && nohup nice -n 15 node sweep.cjs https://games.178-105-148-72.sslip.io out.json he,es,fr,de,el dark "$(cat games.txt)" &`
(args: base, out, langs, themes, game|ids, optional devices). `shots.cjs` takes
screenshots + checks the affiliate change. Do not use `pkill -f` over ssh (kills
the ssh shell); redirect stdin (`</dev/null`) so ssh returns.
**Result, live site: 377 page loads = 5 languages (he/es/fr/de/el) x desktop+mobile
dark, plus en mobile dark, plus en desktop+mobile light, x (home + 28 games):
0 console errors, 0 failed requests, 0 empty game areas, 0 horizontal overflow;
dir=rtl only for he.** Combined with the earlier en/desktop/dark run, all 28 games
are covered in every language, both devices, both themes (light only for en).
- Mobile header (ee95f2d): 235 px -> 119 px on the home page, 173 px inside a game
  (row 1 logo+title+language, row 2 controls; 48 px targets kept). The "Invite
  friends" button is HIDDEN on phones (<640px) to make room - Or may want it back
  somewhere else; the profile chip shows its avatar only.
- Dark theme: the game instruction line was pale blue on the ivory game table
  (unreadable); now dark in both themes.
- Affiliate removal verified in a real browser on the live site: `?admin` and five
  taps on the pill open nothing, no password inputs, legacy keys cleared, ticker
  intact, no page errors.
Still open: Or to supply a real Amazon tag / links for `AFFILIATE_CONFIG`; Invite
button on mobile; light theme was only swept for English.

## 2026-09-04 — image generation: cost model

The game card artwork is AI-generated, and it is **not free**. There is no free
tier for image generation on any Gemini image model — `GEMINI_FREE_API_KEY` and
`GEMINI_API_KEY` both fail with a quota error and always will. Only
`GEMINI_PAID_API_KEY` works (in `/root/openclaw/.env` on the VPS).

- `gemini-3.1-flash-image` — $0.067 per 1K image. Used for all 28 cards.
- `gemini-3.1-flash-lite-image` — $0.0336, fine for anything secondary.

30 card images were generated here, about $2.01. Across this repo and
cruise-seniors the total is 128 images, $6.74.

**Before generating, check whether a real photograph exists.** On the cruise
site ~350 images were about to be generated and were pulled from Wikimedia
Commons for nothing instead. `tools/dl-wiki-game-cards.js` in this repo now does
the same for game cards.

The full write-up, including the per-image brief for every card, is in
`IMAGES.md`. Owner's decision 2026-09-04: no more paid image generation for now.

## 2026-07-19 — Klondike Solitaire + sound toggle (Fable session)
- **Game 27: Klondike** (`js/games/klondike.js`) — real classic solitaire, senior-friendly
  click-to-move (tap card → tap destination, no dragging), Undo (100 steps), Hint
  (foundation→tableau→waste priority), New deal, moves counter. Difficulty: easy/normal
  = draw 1, hard = draw 3 + 3 redeals. Tap selected card again = auto-to-foundation.
- **🔊 Sound toggle** in navbar (persists `gg-sound`; gates `_tone` so ALL sfx obey).
- i18n: title/desc/inst in he/en/es/fr/de/el. Cache v20→v21 (+sw precache).
- **Verified:** 26-game render sweep passed in ALL 6 languages (156/156, zero JS errors);
  Klondike gameplay E2E (deal/draw/undo/hint/legal-move/win modal) in HE+EN.
- Gotcha hit: SW served stale index during verification — cleared SW+caches to confirm;
  real users get v21 via normal SW update cycle.

# HANDOFF — Golden Games (Elders_Ai)

## 2026-07-07 — Text-size toggle (seniors accessibility)
- `js/textsize.js` — navbar 🔠 button cycles A → A+ → A++ (100/115/130% via `html{font-size}`,
  scales all rem/Tailwind sizes). Persists in localStorage (`gg-textsize`), applies on load.
- sw.js cache bumped v9→v10 + textsize.js precached. Verified in browser: scaling + persistence.

**תאריך עדכון:** 2026-06-13 | **סטטוס:** 🟢 חי ב-GitHub Pages

---

## 🔗 לינקים

| | |
|---|---|
| **אתר חי** | https://adbitrush.github.io/Elders_Ai/ |
| **ריפו** | https://github.com/AdbitRush/Elders_Ai |
| **לינק ישיר למשחק** | `/#gameId` למשל `/#tetris`, `/#simon` |

---

## ✅ מה בוצע (Session 40)

### Session 40 (חלק ב׳ — מחובר במלואו)
- **Difficulty** — Easy/Normal/Hard מחובר לכל 18 משחקים + סלקטור ב-homescreen
  - memory: פחות/יותר זוגות; simon: מהירות flash; tetris: מהירות נפילה
  - שאר המשחקים: כמות שאלות/מילים/שלבים מתכווננת לפי קושי
- **Share button** — מופיע בכל מודל ניצחון + Simon result screen
- **PWA icon** — images/icon.svg (SVG) + manifest.json מעודכן
- **WordSearch** — dark theme cells (slate-700/slate-800)
- **Solitaire** — 4 suits (♥♦♠♣), flex card layout, premium shadows
- **Recall (Hard)** — countdown timer 4 שניות, אחר כך עובר אוטומטית לשלב הבדיקה
- **Hangman** — lives color changes to amber/red as mistakes increase

### Session 40 (חלק א׳ — skeletons)
- **15 שיפורים** — ניתוח + skeleton code לכל חלק
- **תיקון באגים** — refreshHSBadges כלל Tetris; i18n "17"→"18"; matched-card CSS
- **PWA** — manifest.json + sw.js (offline + installable)
- **js/stats.js** — לוח שיאים + modal
- **js/difficulty.js** — Easy/Normal/Hard + multipliers
- **js/share.js** — Web Share API + clipboard fallback + toast
- **js/categories.js** — תגיות מיומנויות קוגניטיביות על כל קלף
- **js/accessibility.js** — ARIA live, trap focus, keyboard nav
- **js/lazy-loader.js** — skeleton לטעינה עצלה (לא מופעל עדיין)
- **css/style.css** — קובץ עיצוב חיצוני (memory/wordsearch/solitaire dark styles)
- **📊 כפתור Scoreboard** — navbar

---

## ✅ מה בוצע (Session 38-39)

### Session 38
- **טטריס** (#18) — canvas, 7 טטרומינו, ghost piece, מקלדת + swipe + כפתורים
- **סודוקו** — inline CSS borders (אמינים), dark navy theme
- **ABR_Ai Inspector** — try/except מונע 500, fetch error handling משופר

### Session 39
- **ריפקטור מודולרי** — `index.html` 1811→983 שורות, 18 קבצי `js/games/*.js`
  - כל משחק בקובץ נפרד: `js/games/{id}.js`
  - shared globals (i18nData, gameState, routing, shuffle, sfx) נשארים ב-index.html
  - 18 `<script src="js/games/id.js">` נטענים אחרי inline script
- **Simon** — i18n bilingual (HE/EN), visual upgrade (neon glow on flash, dark buttons)

---

## 📦 מה בנוי (18 משחקים)

| # | ID | שם | מצב |
|---|----|----|-----|
| 1 | memory | אימון זיכרון | ✅ |
| 2 | oddoneout | יוצא דופן | ✅ |
| 3 | math | חשבון מהיר | ✅ |
| 4 | wordsearch | חיפוש מילים | ✅ |
| 5 | simon | רצף צבעים | ✅ neon glow |
| 6 | sudoku | סודוקו יומי | ✅ dark theme |
| 7 | shapes | סדר וארגון | ✅ |
| 8 | solitaire | סוליטר פירמידה | ✅ |
| 9 | trivia | טריוויה | ✅ |
| 10 | numseq | רצף מספרים | ✅ |
| 11 | unscramble | פענוח מילה | ✅ |
| 12 | pairs | זוגות הפכים | ✅ |
| 13 | truefalse | נכון / לא נכון | ✅ |
| 14 | flags | דגלי העולם | ✅ |
| 15 | proverbs | השלם את הפתגם | ✅ |
| 16 | hangman | תלייה | ✅ |
| 17 | recall | זיכרון תמונות | ✅ |
| 18 | tetris | טטריס | ✅ |

---

## 🏗️ מבנה קבצים

```
Elders_Ai/
├── index.html              ← shell + shared globals (983 שורות)
├── js/
│   └── games/
│       ├── memory.js
│       ├── oddoneout.js
│       ├── math.js
│       ├── wordsearch.js
│       ├── simon.js        ← updated: neon glow + bilingual
│       ├── sudoku.js       ← updated: inline CSS borders + dark theme
│       ├── shapes.js
│       ├── solitaire.js
│       ├── trivia.js
│       ├── numseq.js
│       ├── unscramble.js
│       ├── pairs.js
│       ├── truefalse.js
│       ├── flags.js
│       ├── proverbs.js
│       ├── hangman.js
│       ├── recall.js
│       └── tetris.js
└── images/
    └── {game}/thumb.jpg   ← כשמוסיפים תמונה מקומית
```

### ארכיטקטורה
```
Stack:    HTML + Vanilla JS + Tailwind CSS CDN
i18n:     t('key') → i18nData[currentLang][key]
Routing:  location.hash = gameId | hashchange listener
Storage:  localStorage (gg_streak, gg_today_count, gg_total_games, gg_hs_{id})
Games:    loadGame(id) → init{Game}(container) → levelComplete()
Cleanup:  window._gameCleanup() → called by showHome() + loadGame()
```

---

## 🚀 NEXT SESSION — מה עוד צריך

### עדיפות גבוהה
- **בדיקה ידנית** — לפתוח כל 18 משחקים בדפדפן אחרי Ctrl+Shift+R
- **Memory** — שיפור ויזואלי: matched state גלוי יותר, נושא כהה
- **WordSearch** — שיפור ויזואלי: dark cells
- **Solitaire** — שיפור ויזואלי: cards nicer

### עדיפות בינונית
- **PWA** — manifest.json + service worker (offline support)
- **Google AdSense** — אחרי 2 שבועות טראפיק

### עדיפות נמוכה
- **תמונות מקומיות** — החלפת Pollinations ב-images/ לפי game

---

## 📋 Git Log (Session 39)

```
cd6bc1a  refactor(modular): split 18 games into js/games/*.js — index.html 1811→983 lines
52c83a0  chore(session38): update HANDOFF
a8fe6ea  feat(session38): Tetris game + Sudoku dark theme + inspector error guard
```
