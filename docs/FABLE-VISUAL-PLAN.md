# Fable visual overhaul - per-game classification (from Nov-4 audit sheets)
# Tiers: A=heavy overhaul, B=moderate themed pass, C=light polish (palette/typography/spacing)
# Approach default: code-drawn SVG/CSS; Hermes image only if a real asset is needed and no free source ($3 cap total)

## Sheet 01 (desktop baseline unless noted)
- memory (Memory Match): dark patterned card backs on plain card; B - themed card faces/backs (SVG), warmer board
- oddoneout (Odd One Out): emoji apples grid, plain; B - ALREADY weak-listed; themed scene, bigger targets. NOTE: counter fix merged; visual still plain
- math (Quick Math): pastel answer buttons, clean but sterile; C - polish + playful theme header
- wordsearch: dark wood/photo background, dated heavy; B - replace photo bg with light themed SVG scene, keep grid readable
- sequence (Color Sequence): flat solid squares; C - shape/pattern variety for colorblind safety, polish
- sudoku (Daily Sudoku): plain blue grid; C - paper/pencil theme, better number hierarchy
- shapes (Shape Sorter): minimal flat shapes, lots of empty space; B - scene + friendly shape styling
- klondike (Classic Solitaire): green felt + huge wall of instruction text, cramped cards; A - layout overhaul, real card table feel, text into collapsible help
- solitaire (Pyramid Solitaire): sparse white, tiny cards; B - themed tableau, larger cards (NOTE: dup-cards fix is the live-revert question, visual work separate)
- trivia (50s-60s): plain Q/A list; C - era-themed chrome (SVG), polish
- numseq (Number Sequence): pastel buttons, fine; C
- unscramble (Word Unscramble): plain tiles; C - letter-tile styling (scrabble-ish SVG)
- pairs (Opposites Pairs): extremely sparse, tiny buttons; B - card-pair visual, bigger targets
- truefalse: plain statement + 2 buttons; C
- flags (Flag Quiz): pastel buttons + flag; C

## Sheet 02
- proverbs (Complete the Proverb): pastel buttons, sterile; C
- hangman (Word Balloons): balloons theme exists but thin/flat; B - richer balloon scene (SVG sky), gallows-free already good
- recall (Picture Recall): icon row + plain; B - real picture cards (SVG scenes), warmer staging
- blocks (Falling Blocks): tiny dark Tetris board, cramped phone-like; A - board scale-up, senior-friendly colors/contrast, big controls
- colormatch (Color Match): big color buttons OK; C - add shape labels for colorblind, polish
- digitspan (Number Memory): one big number, very plain; C - themed staging (NOTE: blank-board fix tracked separately)
- clock (Clock Reading): plain analog clock + pastel answers; C - nicer clock face, day-moment theme
- counting (Quick Count): emoji rows + pastel; B - ALREADY weak-listed; themed objects, bigger visuals
- category (Categories): pastel buttons; C
- letters (Missing Letter): pastel letter tiles; C - letter-tile styling
- lifesim (Time Journey): two gradient mode cards, splash-like; B - scene-based era picker (SVG postcards)
- safari (Living Safari): real photo bg + circular spot targets - photo-heavy, targets small; B - replace photo with illustrated SVG savanna, bigger animated animals
- jigsaw (Jigsaw Puzzle): picker with photo thumbs + adjustments; B - illustrated piece rendering, warmer board
- freecell: green felt, dense small cards; B - larger cards, cleaner felt theme
- spider (Spider Solitaire): green felt, dense; B - same card-table treatment as freecell

## Sheet 03
- checkers: decent wooden board, pieces smallish; C - larger pieces, polish
- backgammon: wooden board, readable; C - polish only
- dominoes: green felt, tiny domino tiles; B - bigger tiles, table theme (SHARED card-table component)
- crazy8: green felt, small cards; B - shared card-table overhaul
- ginrummy: green felt; B - shared card-table
- gofish: green felt; B - shared card-table
- hearts: green felt, tiny cards; B - shared card-table
- crossword (Daily Mini): grid + keyboard decent; C - paper theme polish
- cryptoquote: yellow letter tiles + keyboard; C
- wordladder: dark tiles + keyboard; C - lighter tile theme
- nonogram (Picture Logic): plain grid; C - theme + cell states polish
- minesweeper: tan flat grid; C - classic mine theme polish
- g2048: standard 2048 look; C - polish
- spotdiff (Spot the Difference): two AI-ish photos; B - illustrated SVG scene pairs, crisper diff targets
- fifteen (15-Puzzle): brown tiles plain; C

## INSIGHT: shared-component passes cover many games at once:
- CARD TABLE (green felt, bigger cards, unified chrome): klondike, freecell, spider, crazy8, ginrummy, gofish, hearts, dominoes = 8 games
- QUIZ CHROME (pastel buttons, themed headers): math, trivia, truefalse, flags, category, numseq, proverbs, sequence, colormatch = 9 games
- LETTER TILES/KEYBOARD: unscramble, letters, crossword, cryptoquote, wordladder, hangman, wordsearch = 7 games

## Sheet 04
- mastermind: plain color pegs on white; C - wooden board + peg styling
- mancala: dark wood board with stones, decent; C
- dotsboxes: bare dots grid; C - pencil-and-paper theme
- pegjump: triangle board with gold pegs, decent; C
- tabledice (Kitchen Table Dice): green felt + dense pay-table text; B - bigger dice, layout overhaul
- boardwalk (Boardwalk Roll): skee-ball target, themed already; C
- hanoi (Tower of Hanoi): colored discs, functional; C - wooden pole/disc styling
- queens (Eight Queens): plain chessboard; C
- knightour: plain board; C
- jugs (Water Jugs): plain jug outlines; C - better jug SVG + water fill
- river (River Crossing): flat color blocks + emoji; B - illustrated river/bank scene
- balance (Balance Scale): scale theme present; C
- magicsq: plain grid; C
- numpyramid: colored pyramid tiles; C
- frogswap (Frog Swap): abstract teal circles; B - real frog/lilypad SVG characters

## Sheet 05
- matchfix (Matchstick Fix): digital-LCD matchsticks on dark; C - real matchstick styling
- cagemath (Cage Math): plain grid; C
- skyline (City Skyline): pale grid, faint; C - city theme colors
- bridges (Island Bridges): blue board + yellow islands, readable; C
- lamps (Lamplighter): B/W grid, stark; C - warm lamp-glow theme
- tents (Campground): green grid + tree icons, themed; C
- dropquote (Drop Quote): B/W grid + letter pool; C - paper theme
- dotdot (Dot to Dot): sparse dots, faint; C - bigger numbered dots, reveal illustration
- fenceloop (Fence Loop): dense tiny dots grid; B - larger grid, clearer lines
- hose (Garden Hose): green garden grid, themed; C
- parking (Parking Lot): colorful block cars; C - car SVG styling
- golfsol (Golf Solitaire): green felt; B - shared card-table
- cribbage: wooden track + green felt; B - shared card-table, bigger cards
- accordion: green felt; B - shared card-table
- calculation: green felt; B - shared card-table

## Sheet 06
- pokersq (Poker Squares): green felt, empty grid; B - shared card-table
- hilo (High-Low Ladder): green felt; B - shared card-table
- kingscorner: green felt; B - shared card-table
- casino: green felt; B - shared card-table
- spades: green felt, tiny cards (NOTE: localized d77ca36); B - shared card-table
- oldmaid (Old Maid): green felt + dense card rows; B - shared card-table
- nim (Nim Rows): wooden board + matchsticks; C - matchstick styling polish
- foxgeese (Fox and Geese): green board diagram-like; B - illustrated meadow scene, animal pieces
- fiverow (Five in a Row): plain tan go board; C - wooden go-board styling
- hex: honeycomb board, decent (NOTE: no-path fix merged); C
- ur (Royal Game of Ur): flat brown board; C - themed board styling
- hotdice (Hot Dice): green felt strip; B - shared dice/table treatment w/ tabledice
- liarsdice (Liar's Dice): dark red/maroon table, moody; B - lighter senior-friendly table theme
- shipcrew (Ship Captain and Crew): dark navy table; B - lighter nautical theme
- mate1 (Mate in One): plain chessboard; C - same chess styling as queens

## Sheet 07
- starhop (Star Hop): yellow peg board, OK; C
- crane (Claw Crane): WEAK-LISTED; A - arcade machine scene, prizes, motion (staged live copy in /tmp/weak8)
- muncher (Cheese Chase): WEAK-LISTED; A - character + maze theme, softer colors (staged in /tmp/weak8)
- gemswap (Gem Swap): dark navy casino-ish; B - lighter jewel-box board
- bubbles (Bubble Pop): dark navy; B - sky/light theme, bigger bubbles
- adventure (The Old Lighthouse): WEAK-LISTED; A - dark text screen; needs illustrated scenes (staged in /tmp/weak8) - strongest Hermes-image candidate if any (scene art), else SVG panels
- cavehunt (Cave Hunt): dark cave circle; B - lighter illustrated cave, bigger targets
- wagontrail: DONE chunk 1.1 (commit a408ae4, ASSET_V 85) - screenshot here is pre-overhaul
- telegraph: DONE chunk 1.2 (commit a69d6ca, ASSET_V 86)
- crates (Crate Shove): brown sokoban; C - warehouse theme
- victorygarden: WEAK-LISTED; B/A - illustrated garden beds, growth stages (staged in /tmp/weak8)
- namegarden (Name Garden): text + blue buttons; B - garden visual
- patternworkshop: small pattern tiles; C
- quietshelf (The Quiet Shelf): book row icons; C - shelf theme
- daytown (A Day in Town): text + buttons; B - illustrated town map

## Sheet 08
- reversi: green board, small discs; C - larger discs, polish
- fourrow (Four in a Row): blue board, readable; C
- shutbox (Shut the Box): wooden number tiles, themed; C
- lights (Light Switch Puzzle): yellow bulbs on dark; C - warmer lamp styling
- maze (Placemat Maze): B/W maze; C - themed maze, thicker walls
- morris (Nine Men's Morris): tan board, plain; C (retest under BRAINPLAY-FIXES)
- salvo (Sea Salvo): blue grid, plain; C - naval theme (shared w/ shipcrew?)
- bingo (Bingo Night): two blue cards, decent; C - bingo-hall theme
- moonland (Moon Landing): dark space scene, tiny lander; B - bigger craft, friendlier space scene
- jellybean (Jelly Bean Jar): jar of beans + keypad, charming already; C
- golf (Six-Card Golf): green felt; B - shared card-table
- crosssums (Cross Sums): dark B/W grid, stark; C - paper theme
- logicgrid (Logic Grid): text-dense clue list; B - layout + clue presentation for seniors
- fillin (Fill-In Puzzle): pale grid; C
- colorbynum (Color by Number): pale yellow grid; C - clearer numbering

## Sheet 09
- chess: plain standard board; C - shared chess styling (queens, mate1, knightour)
- railyard (Rail Yard Shuffle): train cars on tracks; C - rail-yard theme polish
- twentyq (Twenty Questions): dense answer-button grid; B - card-style Q/A presentation, fewer buttons per screen
- sticks (Pick-Up Sticks): colored stick pile, decent; C
- tilematch (Tile Match): icon tiles grid, decent; C - larger tiles
