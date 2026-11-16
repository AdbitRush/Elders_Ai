# English-only and block-removal review, 16 November 2026

REVIEW ONLY. No production publish or redirects installed.

Base: production35ddf20f01ae5953f779e4873a046b8091a8a908, not the older English branch. Reapplies the reviewed English-only language transformation and126current English landing pages. Keeps the current five-card homepage, games.html126catalog, current meta description, magazine, stories and branding.

Additional UI-only change: remove retentionBar (played-today/streak/total/practice-score UI), brain-score-slot inside it, and the entire why-train-wrap section including its3columns and disclaimer. Retention.renderBar exits safely when the optional bar is absent. Retention load/save/recordWin and score storage remain unchanged. No storage keys deleted.

Review SW: english-block-review-v135 / english-block-review- prefix. Includes current games.html precache. This is deliberately isolated from production golden-games-v134 and from the earlier English review cache prefix.

English scope remains broad by design:630non-English landing pages removed in this review;126English pages preserved; English-only source/generator, current language normalization,630draft1:1redirect map. Redirects are NOT installed. The prior English transformation reformats JS, so line count is not a good measure of new logic. New block-removal guard is one early return.

Validation:126initial game boots, seven saved/query language states, consent remains denied after Reject/reload, no GTM/GA requests,390/1440 UI/data/navigation tests. Seeded memory highscore9 survives; retention total42→43 after simulated recordWin; unrelated preference survives. This validates retained storage behaviour, not a complete game-solve suite. Five featured cards/catalog126remain. Production hash must remaincc3f5cc57ae698784010d8faa939b554687fd3cb1ab2e3eafda2730152cc37e6.
