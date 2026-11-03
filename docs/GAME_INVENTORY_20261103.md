# BrainPlay game inventory (2026-11-03, main 7edd6ce + fixes)

46 games in `js/games/`. Source: file headers + `js/categories.js` skill tags. 'Mode' is derived from the code (vs computer = plays against the computer; no game has human multiplayer or pass-and-play today). All are English-first; 6 languages exist for the UI.

| id | family | skill tags (what the task asks of the player) | mode | what it is |
|---|---|---|---|---|
| backgammon | Strategy | - | vsCPU | BACKGAMMON vs COMPUTER (2026-10, wave 1) — standard rules, no doubling cube. |
| blocks | Spatial | spatial,planning | solo | GAME 18: BLOCKS  —  mobile-first controls + celebration FX (window.fx.*) |
| category | Language | language,logic | solo | GAME 23: WORD CATEGORY — pick the word that belongs to the category |
| checkers | Strategy | - | vsCPU | CHECKERS vs COMPUTER (2026-10, wave 1) — American checkers on the dark squares of an 8x8 board. |
| clock | Attention & visual | perception,logic | solo | GAME 21: CLOCK READING — read the analog clock, pick the right time |
| colormatch | Attention & visual | attention,speed | solo | GAME 19: COLOR MATCH (Stroop) — tap the INK color, not the word |
| counting | Attention & visual | speed,attention | solo | GAME 22: QUICK COUNT — how many target emojis are in the grid? |
| crazy8 | Cards | - | vsCPU | CRAZY EIGHTS vs COMPUTER (2026-10, wave 1) — 7 cards each. Play a card that matches the top card's suit or ran |
| crossword | Language | - | solo | Words and clues for the Daily Mini Crossword (js/games/crossword.js). Plain dictionary-style clues, everyday |
| cryptoquote | Language | - | solo | CRYPTOQUOTE (2026-10, wave 2) — the newspaper-puzzle classic: a famous quote in a letter-swap code. |
| digitspan | Memory & recall | memory,sequence | solo | GAME 20: DIGIT SPAN — memorize a number, type it back |
| dominoes | Strategy | - | vsCPU | DOMINOES, THE BLOCK GAME vs COMPUTER (2026-10, wave 1) — a double-six set (28 tiles), 7 tiles each, no drawing |
| fifteen | Numbers & logic | - | solo | 15-PUZZLE (2026-10, wave 2) — the sliding-tile puzzle from the toy box. Put the numbers back in order. |
| flags | Knowledge | knowledge,geography | solo | Windows has no flag-emoji glyphs — render real flag images from the emoji's |
| freecell | Cards | - | solo | FREECELL (2026-10, wave 1) — every card face up; four free cells, four home piles, eight columns. |
| g2048 | Numbers & logic | - | solo | 2048 (2026-10, wave 2) — slide the tiles; two equal tiles join into one. |
| ginrummy | Cards | - | vsCPU | GIN RUMMY vs COMPUTER (2026-10, wave 1) — one hand per game, standard rules. |
| gofish | Cards | - | vsCPU | GO FISH vs COMPUTER (2026-10, wave 1) — 7 cards each. On your turn ask for a rank you hold (tap one of its car |
| hangman | Language | language,vocabulary | solo | GAME 16: HANGMAN |
| hearts | Cards | - | vsCPU | HEARTS vs 3 COMPUTER PLAYERS (2026-10, wave 1) — one full hand of 13 tricks. |
| jigsaw | Spatial | - | solo | GAME: JIGSAW PUZZLE (פאזל ג'יקסו) — v3 |
| klondike | Cards | planning,memory | solo | GAME 27: KLONDIKE SOLITAIRE — the classic. Senior-friendly click-to-move |
| letters | Language | language,spelling | solo | GAME 24: MISSING LETTER — complete the word with the right letter |
| lifesim | Reminiscence & planning | planning,sequence | solo | GAME 25: LIFE SIM — "Time Journey": seniors play their young selves, |
| mastermind | Strategy | - | vsCPU | MASTERMIND (2026-10, wave 2) — classic code-breaking. The computer hides a code of colored pegs; you have 10 t |
| math | Numbers & logic | arithmetic,speed | solo | GAME 3: QUICK MATH — 10-question session |
| memory | Memory & recall | memory,focus | solo | GAME 1: MEMORY |
| minesweeper | Numbers & logic | - | solo | MINESWEEPER (2026-10, wave 2) — clear the field without opening a mine. |
| nonogram | Numbers & logic | - | solo | PICTURE LOGIC — nonogram / picross (2026-10, wave 2). The numbers beside each row and above each column give t |
| numseq | Numbers & logic | logic,pattern | solo | GAME 10: NUMBER SEQUENCE |
| oddoneout | Attention & visual | perception,attention | solo | GAME 2: ODD ONE OUT — 10-round session |
| pairs | Language | language,vocabulary | solo | GAME 12: OPPOSITES PAIRS |
| proverbs | Language | language,memory | solo | GAME 15: PROVERBS |
| recall | Memory & recall | memory,attention | solo | GAME 17: WORD RECALL |
| safari | Attention & visual | perception,attention | solo | GAME 26: LIVING SAFARI — a living animal world. Animals roam a savanna; |
| sequence | Memory & recall | memory,sequence | solo | GAME 5: SEQUENCE — neon glow + bilingual + difficulty speed |
| shapes | Attention & visual | spatial,perception | solo | GAME 7: SHAPES |
| solitaire | Cards | arithmetic,planning | solo | GAME 8: SOLITAIRE |
| spider | Cards | - | solo | SPIDER SOLITAIRE, ONE SUIT (2026-10, wave 1) — 104 spades in 10 columns, 50 in the deck (5 deals of 10). |
| spotdiff | Attention & visual | - | solo | SPOT THE DIFFERENCE on vintage photos (2026-10, wave 2). Real 1976-1978 American street and boardwalk photos b |
| sudoku | Numbers & logic | logic,planning | solo | GAME 6: SUDOKU 9×9 |
| trivia | Knowledge | knowledge,recall | vsCPU | GAME 9: TRIVIA — American nostalgia, the 1950s to the 1980s (expanded 2026-10, review item 6) |
| truefalse | Knowledge | knowledge,recall | solo | GAME 13: TRUE / FALSE |
| unscramble | Language | language,spelling | solo | GAME 11: WORD UNSCRAMBLE — 7-word session |
| wordladder | Language | - | solo | WORD LADDER (2026-10, wave 2) — Lewis Carroll's "Doublets" (1879): turn the top word into the bottom word, |
| wordsearch | Language | language,focus | solo | GAME 4: WORD SEARCH (with adjacency validation) |

## Notes for the article games

- Engines to reuse: `GameKit` (js/game-kit.js: picker -> start -> finish/levelComplete, buttons, icons, QuizKit for question games). Games with custom init (digitspan, memory, clock, colormatch, category, letters, hangman, flags) call `levelComplete()` directly.
- Gaps today: no pass-and-play or two-person mode; no reminiscence prompts; no daily set / break prompt; no in-game 'what this practice does and does not do' note; no per-game personal-best display (only the scoreboard).
- Wording risk found while inventorying: `js/categories.js` tooltips say tasks 'train' attention/memory (e.g. safari: 'Searching a busy scene for a target trains focused attention.'). The article claim review says labels should describe what the task asks the player to do, not a proven outcome. Not changed here (live-site copy, all six languages); list for Or's decision.
