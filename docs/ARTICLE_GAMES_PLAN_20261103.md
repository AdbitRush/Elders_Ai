# Article-linked games: plan (2026-11-03) - DESIGN ONLY, nothing built yet

Status: the incoming package with the 7+ new sourced articles has NOT arrived in this workspace (only the three published articles exist: `articles.html`). So games 4-10 below are open slots, not designs, and no game has been coded. Games 1-3 are designed against the three published articles and can be built now if Or approves; they are review-only. Nothing here is live.

## Guardrails (every game, every screen)
- Frame each game as enjoyment, curiosity and practice "at your own pace". Never: treatment, diagnosis, assessment, "prevents/reduces/improves" memory or dementia, a recommended daily dose, a clinical-intervention equivalent, or "scientifically proven brain health".
- Skill words describe what the task asks the player to do ("remember a number", "spot a difference"), not an outcome.
- Each game shows the site disclaimer near the start screen: "BrainPlay is for entertainment and practice. It has not been shown to prevent or treat dementia and is not a medical assessment."
- The "Read the article" link on the end screen goes to the matching article; the article's limits box is not repeated as a promise.
- Scores are never shown as a cognitive result or compared with norms. No "brain age", no percentile.

## Accessibility baseline (testable)
Tap targets >= 48 px; every action reachable by keyboard (Tab/Enter/Space/arrows) with a visible focus ring; text >= 4.5:1 (3:1 only for large text) in light and dark; nothing depends on colour alone; no required speed (timers optional or off by default); `prefers-reduced-motion` respected; screen-reader names for cards/tiles; wrong answers never shame ("Nice try - want to play again?" pattern already in the end modal); works at 320, 390 and 1280 px without sideways scroll.

## Per-game record format
Linked article | Mechanic | Controls | Progression | Testable completion state (what `play-all.js` / a check script can assert) | Reuse.

## Designed now (against the three published articles)

### 1. "Same Skill, New Task" (article 01: what brain games can and cannot do)
- Mechanic: improve **Digit Span** into a two-task practice screen: forward digits, then the same numbers backwards. After each task a plain note says "You practised this task. How it carries over to other things is not known."
- Controls: existing on-screen keypad (OK / delete) + keyboard digits and Enter.
- Progression: span grows by one digit after two correct rounds; 5 rounds per task; level 1 starts at 3 digits; easy/normal/hard already offset the start.
- Completion state: `gameState.digitspan._si === _sq` -> `levelComplete()`; the end modal shows best span for this session only and the article link. Assert: double-tap on OK scores once (covered by `check-regressions.js` check 3), backwards task accepts the reversed string, modal appears, link present.
- Reuse: digitspan (no new engine). Effort: small.

### 2. "Trivia for Two" (article 02: make a game an invitation)
- Mechanic: pass-and-play on one screen. Two players alternate questions from the existing nostalgia **Trivia** bank (1950s-80s); after every third question a "tell me about it" prompt appears ("Which of these did you watch or play growing up?"), skippable.
- Controls: tap an answer, tap "Pass to <name>"; keyboard 1-4; names typed once (never stored beyond the session).
- Progression: 10 questions, 5 each; easy/hard changes question pool difficulty already in Trivia.
- Completion state: both scores sum to the number answered; modal shows "Good game, <name1> and <name2>" (no winner shaming; ties allowed). Assert: players alternate, prompt appears on turns 3/6/9, the game ends after 10, skip works.
- Claim limit: invitation only; no statement that it reduces loneliness (the pilot studied small-group storytelling, not browser play).
- Reuse: trivia + QuizKit; new two-player wrapper. Effort: medium.

### 3. "A Game in Your Day" (article 03: a game is one part of your day)
- Mechanic: a **Daily Set** of three short games from different families (one word, one number/shape, one memory or visual), launched from the hub, followed by a "take a break" card (stand up, a glass of water, look out of a window). No streak guilt: the set can be skipped, repeated or stopped any time.
- Controls: one "Start today's set" button, then each game's own controls; "Skip this one" always visible.
- Progression: set rotates by calendar date from fixed lists, difficulty follows the player's existing Easy/Normal/Hard choice; no escalating targets.
- Completion state: three `levelComplete()` calls (or skips) -> a local-only "today's set" card (localStorage; try/catch). Assert: set differs from the previous day's, skip works, break card shows, no medical/dose wording.
- Reuse: hub launcher + three existing games. Effort: medium.

## Open slots (need the package; do not guess topics)
| # | Article (title + sources) | Candidate existing games to improve first | Mechanic / controls / progression / completion | Status |
|---|---|---|---|---|
| 4-10 | not received | pick from the inventory families: memory & recall (memory, sequence, recall), attention & visual (spotdiff, oddoneout, safari, counting), language (wordladder, cryptoquote, crossword), numbers & logic (sudoku, nonogram, fifteen), reminiscence (trivia, lifesim, proverbs, spotdiff vintage photos), strategy (mastermind, checkers, backgammon, dominoes) | to be filled from each article's claim limits | BLOCKED: package not delivered |

Rule for filling slots: improve or re-skin an existing game wherever the topic fits; build a new game only when no existing mechanic can honestly serve the topic, and never seven clones of one mechanic.

## Proposed build order once the package arrives
1) Verify package SHA256/sources/claim limits exactly as for the first package; 2) fill the slot table; 3) build 1-3 plus the first two slot games; 4) per game: play-all step, regression check, 320/390/1280 + dark screenshots, contrast; 5) review branch only.
