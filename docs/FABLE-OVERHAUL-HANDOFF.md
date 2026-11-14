# Fable Visual Overhaul — Running Handoff

Owner request: Or Kandel, WhatsApp 2026-11-14 21:54 IST (via main agent; anchor wamid...RD6DC0ABCB1B50C08):
"יש לי פייבל מתנה נראה לי. תבדוק עם קלוד. אם כן שיעיף את כל המשחקים שיהיו ברמה ויזואלית כמו שמצופה מאתר שיגרום לזקנים להיות בו שעות."
Overhaul ALL BrainPlay games' visuals to the level expected of a site that keeps seniors (65+) playing for hours, using the free Claude Fable gift. Follow-ups 21:56 (shippable chunks, weakest first, exact remainder list) and 22:04 (this handoff file, updated after EVERY chunk).

## STRATEGY CHANGE 14.11 22:16 (Or, via main) - READ FIRST

Scope is ALL ~125 games, not just the weak 8. Method:
1. PLANNING PASS FIRST over every game: per-game what+how, building on the Nov-5 audit. Keep it CHEAP - minimal/no Fable usage (coordinator can classify from the audit + repo).
2. THEN execute, quota-budgeted so the free allowance covers everyone at a good level - broad coverage, NOT a few perfect games.
3. Plan shape to report: tiers (A: weak 8 full rebuild ~5% Fable each; B: middle/fair games light visual passes, batched; C: strong felt/wood/newspaper families - preserve, polish only if quota remains), per-game depth, quota budget. Re-check claude.ai/settings/usage before each batch; STOP if credits would be needed.
4. Budget anchors (22:15 live read): Fable allowance = 50% of weekly limit; ~5% per heavy full-rebuild chunk; week resets Monday 9:00 IST; 1 free Fable reset available (expires 17.11 09:59 IST) which refills the Fable allowance. Usage credits stay OFF/$0 - never enable.

## IMAGE RULE 14.11 22:18 + MONEY GRANT 22:20 (Or, via main)

Default: code-drawn visuals (inline SVG/CSS), no raster files - Fable draws with code. If a game genuinely needs a real image asset and no free source exists: route through HERMES image generation. Or approved up to $3 TOTAL on Hermes images for BrainPlay art (characters, backgrounds, card images, effects). No per-image approval within the cap. TRACK THE SPEND, report the running total with every chunk report, STOP at $3 - beyond that needs Or's fresh yes. This is the ONLY money exception; everything else that costs money stops for explicit approval. Hermes spend so far: $0.00.

## ROME PARALLEL 14.11 22:17 (Or, via main)

Rome site (Muse-built, for the 2-7.12 trip) is driven to done IN PARALLEL with the overhaul, with the whole agent team (Muse, Junior, Hermes as fits) - not queued after. Tracked under todo-01M4NMTCRF26NVX6892ETA5VF3; bookings still need Or's explicit yes for payment.

## Fable offer facts (verified live in Or's claude.ai account 2026-11-14 21:58 IST, https://claude.ai/settings/usage)

- Plan: Pro. "Fable is included in your plan, up to 50% of your weekly usage limits, through November 16 at 11:59 PM PT" (= 2026-11-17 09:59 IST).
- Chat model picker: "Fable 5.2 — Included until November 16".
- At verification: week 17% used (resets Monday 9:00), 5-hour 0%, Fable allowance untouched, 1 free Fable limit reset available (expires 17.11 09:59 IST), full reset available (expires 11.12).
- Usage credits: OFF, $0 balance, monthly cap $0.00, auto-reload OFF. NEVER enable paid usage credits. If a limit is hit, generation simply stops — nothing bills. If any step would cost money: STOP and escalate to Or via the main agent.

## Approach

- Fable runs through Or's signed-in claude.ai web chat (cloud browser profile, config-c). One chat per game. Model: Fable 5.2, effort Medium.
- Server Claude (Junior, VPS) CANNOT verify account/quota state (asked 14.11 22:01, result mail [INSTINCT-JUNIOR:RESULT:FABLE-STATUS-20261114-01]: runs claude-haiku-5-5, no introspection, no tools). Junior's mail bridge model tiers are haiku/sonnet/opus — Fable via Junior is unproven; do not rely on it.
- If Fable quota runs out mid-work: finished chunks stand (each is committed+deployed+verified). Continue remaining games with Sonnet/Haiku (via Junior code-fix route or claude.ai chat with Sonnet 5.5) using the same prompt template below.

## Prompt template (send the whole thing + the complete current game file pasted after "CURRENT FILE:")

```
You are overhauling the VISUALS of one game on BrainPlay, a games site for seniors (65+). The game logic is finished and loved; only the presentation is weak (called "sparse" in a visual audit).

Below is the complete current file. Rewrite it with a much richer, calmer, more beautiful presentation while keeping the code contract EXACTLY:

HARD RULES (must not change):
- Keep the NK.start('<id>', {...}) structure and every function name, global name, and handler name exactly as-is.
- Do not touch game logic, math, events, probabilities, scoring, persistence (localStorage keys, save/load field lists), NK.after/NK.render usage, sfx hooks, or the rules array text.
- The view function must keep returning an HTML string; keep NK.msg(gs.msg), NK.btn usage, and all aria labels/roles. Keep keyboard support and data-k attributes.
- No external assets, fonts, images or libraries: pure inline SVG + CSS only (site constraint).
- No new global names beyond the existing ones.

VISUAL BAR (what "richer" means here):
- Audience: seniors 65+. Large readable type (nothing under ~1rem), high contrast, calm warm palette, generous spacing. No neon, no tiny UI, no visual noise.
- Meaningful functional art: a real scene or props that show game STATE (not decorative headers). The scene should subtly reflect state changes (progress, danger, success).
- Buttons stay NK.btn. Respect prefers-reduced-motion. RTL-safe (site is Hebrew-first; avoid hardcoded text alignment that breaks under dir=rtl).
- Keep the same DOM structure ids/classes the logic queries (e.g. getElementById targets must still exist).

DELIVERABLE: the COMPLETE new file as ONE artifact (or a single fenced code block if artifacts are unavailable), nothing omitted, ready to deploy verbatim. After it, at most 5 short bullets on what changed visually.
```
Then append: 2-4 lines naming the game, its theme, and 2-3 concrete scene ideas; then `CURRENT FILE:` and the full current file contents.

Non-NK games (oddoneout, counting are the old core-game style, not NK): adapt the "NK.start structure" rule to "keep the existing init function name, DOM ids, and integration contract of the file".

## Repo/deploy mechanics (all proven 2026-11-14)

- Live site: https://games.178-105-148-72.sslip.io (caddy 443 → static-server.py :8792 serving /opt/Elders_Ai on VPS 178.105.148.72). Repo /opt/Elders_Ai == origin/main (git@github.com:AdbitRush/Elders_Ai.git). Committing to main on the VPS IS publishing.
- Game files: /opt/Elders_Ai/js/games/<id>.js (NK framework: js/nostalgia-kit.js, cards: js/game-kit.js, i18n: gt(en,he) from js/gametext.js).
- Deploy from the coordinator sandbox: export vault item "Existing VPS SSH key - Base64 private key" (single-use, re-export before EVERY SSH call) with `tools vault write-file`, then run a driver importing /tmp/ssh-vault-transfer/ssh_private_session.py (`execute(python_script)` runs python3 as root over SSH, prints stdout). One export = one execute call: batch write+git add/commit/push+marker greps in ONE script.
- After ANY js change: bump ASSET_V in index.html (script loader cache-buster) and commit it too.
- After each deployed chunk: append a row to /var/lib/or-office/instinct-results.json (format: {"at": "<UTC ISO>", "title": "...", "project": "brainplay", "evidence": "..."}).

## Verification procedure per chunk (all required before "done")

1. Syntax: `node --check` the new file.
2. Logic smoke in node with stubs (NK/GameKit/localStorage/gt): boot, one full game loop through the real handlers, persistence save/restore if the game has it.
3. Deploy to VPS, commit, push.
4. Live HTTPS check in cloud browser (default Hebrew): loadGame('<id>'), no JS errors, screenshot BEFORE (if not already archived) and AFTER; confirm the new scene renders, play a few real moves, confirm state changes reflect in the scene.
5. Update THIS FILE's status table + the office results file; report to the main agent with screenshots.

## Work order (weakest first, per the 2026-11-05 125-game pixel audit)

Chunk 1 (weakest 8, in this order):
1. wagontrail  (Prairie Wagon, handheld)   — sparse
2. telegraph   (Telegraph Office, handheld) — sparse
3. adventure   (The Old Lighthouse, handheld) — sparse
4. victorygarden (Victory Garden, pastimes) — sparse
5. crane       (Claw Crane, arcade)         — cheap/neon
6. muncher     (Cheese Chase, arcade)       — flat
7. oddoneout   (Odd One Out, core game)     — generic
8. counting    (Quick Count, core game)     — generic

Chunk 2: remaining "fair" games from the audit (fill in from audit when chunk 1 done; strong felt-card/wood-board/newspaper families are LOW priority — preserve them, polish last if quota remains).

## Status table (update after EVERY chunk)

| Game | File | Status | Commit | Verified live | Notes |
|---|---|---|---|---|---|
| wagontrail | js/games/wagontrail.js | DONE | a408ae4 | YES 14.11 22:11 IST | chunk 1.1; panoramic prairie scene, state-tinted sky, wooden sign-board stat cards, paper journal; autosave/restore gg_wagontrail_save verified live (moves + reload-resume); 29,043 bytes; ASSET_V 85 |
| telegraph | js/games/telegraph.js | DONE | a69d6ca | YES 14.11 22:20 IST | chunk 1.2; telegraph-office scene (brass key+sounder, paper tape, lamp, pigeonholes), telegram-form paper, wooden type-block keys; full-shift smoke + live typing verified; ASSET_V 86 |
| adventure | js/games/adventure.js | DONE | eacfc66 | YES 15.11 00:34 IST | phase 2.1; lighthouse/sea SVG scene w/ state (storm darkens on hard, lamp beam when lit), keeper-journal room pages, wooden-shelf inventory; smoke parity vs orig (same 15-move win); live full win 29 moves via UI; desktop+375+360 verified; ASSET_V 90 |
| victorygarden | js/games/victorygarden.js | pending | - | - | |
| crane | js/games/crane.js | DONE | 275ca6a | YES 15.11 00:49 IST | phase 2.2; wooden/brass arcade cabinet + glass-box scene, plush prizes at true positions, state claw (slide/drop/close/lift), won-prize shelf, token coin props; smoke parity vs orig; live real-UI drop won a prize (1 of 3, tok 9->8); desktop+375+360 verified; ASSET_V 91 |
| muncher | js/games/muncher.js | pending | - | - | |
| oddoneout | js/games/oddoneout.js | pending | - | - | core-game style, 2.7KB |
| counting | js/games/counting.js | pending | - | - | core-game style, 6.8KB |

## Fable output extraction (proven 14.11 chunk 1.1)

Getting the artifact code OUT of claude.ai is the fiddly part. What works: ONE execute-js call that clicks the Copy button inside the div whose innerText starts with '<Title> · JS', waits >=1200ms, then returns `JSON.stringify(await navigator.clipboard.readText())` — all atomically. The clipboard goes stale BETWEEN calls (later reads return garbage); waits under ~700ms race the copy. Capture the single-line JSON from stdout (grep -o '^".*"$'), decode with python json.load. The DOM code-line scrape is virtualized and unreliable; the conversation API exposes tool calls but not artifact file bytes (file download endpoints 404). Fable also self-renders states with node+playwright in its own sandbox before delivering — keep asking for that in the brief.

## If you pick this up cold

1. Read this file fully. Check the status table for the first non-done game.
2. Confirm Fable still free: claude.ai/settings/usage (signed-in cloud browser profile) — if the offer expired or credits would be needed, STOP and tell the main agent.
3. Get the current game file from /opt/Elders_Ai (or https://games.178-105-148-72.sslip.io/js/games/<id>.js).
4. Run the prompt template + file through Fable (or Sonnet/Haiku if Fable is exhausted), then follow "Verification procedure per chunk" exactly.
5. Update this file and the office results file after every chunk. Report to the main agent.

---

## ALL-GAMES VISUAL PLAN (2026-11-14 23:45, per Or's 22:16 strategy: plan-first, broad coverage, quota-budgeted)

Full per-game classification (all 124 games, from the Nov-4 audit sheets): docs/FABLE-VISUAL-PLAN.md

### Tiers
- A (heavy overhaul, 5 remaining): adventure, crane, muncher, blocks, klondike. (wagontrail, telegraph DONE)
- B (moderate themed pass, ~47): card/dice table family (~23), scene/story games (~24)
- C (light polish: palette/typography/spacing/target size, ~70): everything else; batched 8-10/chunk

### Shared-component passes (the leverage: half the catalog in 4 passes)
1. CARD TABLE (bigger cards, unified table chrome, collapsible help): ~19-23 games
2. QUIZ CHROME (themed header + button kit): ~9 games
3. LETTER TILES/KEYBOARD: ~7 games
4. CHESS/BOARD styling kit: ~6 games

### Phases
1. CARD TABLE shared pass (GO from Or via main 23:43)
2. A-tier scenes: adventure, crane, muncher, blocks (1-2 games/chunk)
3. QUIZ CHROME + LETTER TILES (2 chunks, 16 games)
4. Scene B-tier pairs (victorygarden+namegarden, safari+foxgeese, daytown+lifesim, gemswap+bubbles, ...)
5. C sweep batches

### Quota budget
~5% Fable allowance per heavy chunk; Phases 1-4 ~8 chunks ~40%, Phase 5 ~7 chunks ~35%; total ~75% of allowance inside the promo window (ends 16.11 11:59 PM PT), free reset expires 17.11 09:59 IST. Baseline at plan time: allowance 9%, week 21%, session 26%.

### Hermes budget ($3 total cap, Or 22:20)
$0 spent. Default code-drawn SVG/CSS everywhere. Only candidate: adventure scene art, and ONLY after Or's explicit yes on that specific spend.

### 2026-11-14 23:53 - Phase 1 CARD TABLE DONE LIVE (chunk 2.1)
- Fable-built rewrite of js/game-kit.js card layer (commit a8741cd, ASSET_V 87). Same API (RANKS/SUITS/isRed/deck/card/finish/btn/icon/css/fit/keyBlocked/focusKey/restoreFocus), so all 17 GameKit card games inherit with zero per-game changes (games already wrap boards in .gk-table).
- New look: warm felt table (radial vignette + SVG speckle, !important so per-game greens are overridden), wooden rail edge, ornate lattice card backs (navy/gold), bigger high-contrast rank+suit, deep warm red suits, gold dashed hint glow, selected-card lift.
- Verified live: freecell (52 cards render, real move fcTap -> moves 1), hearts (pass-3 phase, opponent backs), crazy8 (playable-card hint glow). Screenshots: cloud-browser-20261114-215249.png (hearts), -215256.png (crazy8) + inline freecell.
- Klondike still has its own renderer (kl-card) - gets its treatment in Phase 2 A-tier work or a small rewiring later.
- Hermes: bash spent. Fable chat: https://claude.ai/chat/c194ffe3-cd4b-4802-8614-234ae8dc586e (also produced a "Shot" PNG preview, not needed).
- SSH key path this session: /tmp/vps_key.pem (workspace box; re-export vault item per session).
