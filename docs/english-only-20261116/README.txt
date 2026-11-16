English-only review, 16 November 2026

Scope: preparation and review only. Production, production redirects, game fixes and GTM deployment are not approved by this change.

Review: https://games-design.178-105-148-72.sslip.io/review/english-only-20261116/index.html?lang=en

Changes
- First paint, runtime, stored language and incoming lang query normalize to English/LTR. Language selector and non-English dictionaries/data removed. Scores, theme and avatar keys are not removed.
- Generator emits126 English game landing pages and127 sitemap URLs.630 legacy locale paths map to126 English equivalents in the accompanying CSV and draft Caddy mapping. No redirect is installed.
- Review service worker has isolated english-only-review- cache prefix. Query-versioned asset requests can use cached shell assets offline. Production migration will need its own reviewed cache rollout; do not blindly copy this review cache name to production.

Verification
- All126 catalog modules parse and render initial game state without JavaScript exceptions or Hebrew/Greek visible text. This is NOT126 complete game solves.
- Seven stored/query language inputs (he/es/fr/de/el/en/xx) normalize to en/LTR; sample score/theme/avatar remain.
- Word-game, memory, chess and Mate initial screens render in English. This branch intentionally does not include the separately held Mate/game changes.
- All external game JavaScript passes node --check. Raw source scan found no Hebrew/Greek in active HTML/JS; runtime dictionary keys are only en.
-630 unique legacy mappings; all126 destination index files exist; no he/es/fr/de/el directories remain in this branch. Mapping is draft, not deployed or an observed HTTP301 test.
- Exact-build service worker install and offline reload pass; saved non-English language normalizes en and sample score remains; memory renders8 cards offline. No unrelated origin caches are deleted.
- Hosted English desktop/mobile/light/dark and consent pixels inspected. Hosted consent Reject persists after reload; ads denied. No GTM/GA request in settings test. Automated consent visual test disables navigator.webdriver only because existing consent library intentionally hides UI from bots; production bot detection was not changed.

Remaining production work, held
- Shai's review and explicit production approval.
- Final production cache/update migration and approved redirect installation/HTTP verification.
- Old multilingual review snapshots still exist and must be inventoried/retired separately; this preparation does not delete other reviews.
- Root canonical/domain and old manifest application identity are preserved. No privacy/Israel policy rewrite.
- GTM consent-model decision remains separate and held.
