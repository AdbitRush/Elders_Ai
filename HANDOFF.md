## 2026-10-10 (c) - games project: wave 1 (8/9) + wave 0 (7/9) - RESUME HERE (preview only; main untouched)

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
