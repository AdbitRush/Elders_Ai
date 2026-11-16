# Mate in One: post-checkmate turn label, review only

Reproduced on the design host: after Black mates, the banner says White to move and the board flips. The engine correctly advances its active-color field to the checkmated side. Rendering incorrectly treats that as a new playable turn.

Fix: derive the puzzle mover from the side that just won when solved. Preserve orientation and the mover color chip; render Checkmate! White/Black wins. No rules, scoring, puzzle positions or production deployment changed.

Tests: all 106 bundled positions across easy/normal/hard, execute the engine mating move, assert solved status, correct winner banner and unchanged first-square orientation. White and Black mobile screenshots at 390px, no overflow. Review approval is still required before production.
