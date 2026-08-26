# 🎨 Games Site — Graphic Improvement Plan (todo)

> Goal: "האתר צריך להיות מרשים, לא כאילו ילד עשה אותו"
> Created: 2026-08-26. Status: **COMPLETE — all 28 cards replaced (e40c261, then 2026-08-27).**

## ✅ Functional check — ALL 27 GAMES WORK (2026-08-26)

Automated smoke test (Playwright, mobile 420px):
- Every game loads, has interactive elements, responds to clicks
- **0 JS errors, 0 horizontal overflow, 0 broken images** across all 27 games
- No game is "broken" functionally — the problem is purely VISUAL QUALITY of the card thumbnails

## ✅ DONE 2026-08-26 (commit e40c261) — all 13 replaced

Regenerated with `gemini-3.1-flash-image`, each one looked at before committing.
Two were generated twice: **flags** (generic pennants read as bunting, not as a
flag quiz — now an atlas with six correct real flags) and **digitspan** (an
abacus reads as arithmetic, and was the darkest card in the grid — now four
bright numbered tiles). Live on both hosts; `sw.js` at v34.

The prompts avoid every failure in the list below by construction: no prompt
asks for text the model cannot spell. Where a game really is about letters or
numbers the objects carry it (blocks reading A B C, painted numerals, a hangman
board with blank dashes); elsewhere nothing legible is in frame.

## 🔴 The 13 that were broken (for the record)

These destroy trust — seniors see broken text/wrong objects and think the site is broken.

| # | Game | File | Problem (AI defect) | New image concept |
|---|------|------|---------------------|-------------------|
| 1 | **hangman** | images/cards/hangman.jpg | Chalkboard full of gibberish AI text — looks corrupted. **Most urgent.** | Clean classic hangman gallows on warm chalkboard, one blank word line |
| 2 | **colormatch** | images/cards/colormatch.jpg | Fake word "SVATD" painted on board — broken text | Color wheel blending into a target color, elegant |
| 3 | **letters** | images/cards/letters.jpg | Scrabble tiles with garbled fake letters | Wooden alphabet tiles spelling a real word like "BRAIN" |
| 4 | **truefalse** | images/cards/truefalse.jpg | Box says "Quuik" (misspelled) + 2 gibberish logos | Big elegant ✓ and ✗, warm tones |
| 5 | **flags** | images/cards/flags.jpg | Fake globe with misshapen continents + gibberish text over China | Realistic flag collage or proper world map, clean |
| 6 | **klondike** | images/cards/klondike.jpg | Card faces are smeared abstract textures, no suits/numbers | Classic green felt table with fan of real playing cards |
| 7 | **digitspan** | images/cards/digitspan.jpg | Numbers lost in messy server-room racks, low contrast | Bright scoreboard digits lighting up sequentially |
| 8 | **blocks** | images/cards/blocks.jpg | Neon cubes, 2000s wallpaper vibe, childish | Wooden stacking blocks / Jenga, warm light |
| 9 | **oddoneout** | images/cards/oddoneout.jpg | Toy-like lego grid, plastic gradients | Three fruits where one is different (e.g. 2 apples 1 orange) |
| 10 | **shapes** | images/cards/shapes.jpg | Plastic toy blocks with abstract nonsense icons | Elegant geometric shapes arrangement (like R4I5 wooden blocks) |
| 11 | **recall** | images/cards/recall.jpg | Generic "head with brain" medical clip-art | Memory/pattern: glowing dots on a grid, one lighting up |
| 12 | **pairs** | images/cards/pairs.jpg | Waxy uncanny split-face, tired cliché | Two matching vintage cards/objects side by side |
| 13 | **safari** | images/cards/safari.jpg | Giraffe+elephant too small, muddy low contrast | One clear majestic animal portrait, golden savanna |

## ✅ ALSO DONE 2026-08-27 — the other 14 replaced too

The 13 below were individually fine, which is why this file kept them. They were
replaced anyway, because the complaint was never about any one card: the grid
mixed warm portraits, cold neon on black and flat-lay still life, and three good
pictures in the wrong language are the reason the other 25 could not match
anything. All 28 (including a card for the new jigsaw game) are now one recipe.

## 🟢 Cards that were judged GOOD — kept until 2026-08-27

| Game | Why it's good |
|------|---------------|
| counting | Beautiful watercolor butterflies |
| category | Vibrant produce, clear colors |
| clock | Sophisticated antique clock, warm |
| lifesim | High-energy swing dancing, senior-relevant |
| math | Old man drawing — hero quality |
| memory | Old woman doing puzzle — gold standard |
| proverbs | Rich library lighting, professional |
| sequence | Neon keyboard, high contrast (weird word "Solons" passes) |
| solitaire | Clean green card game image |
| sudoku | Journal & coffee, cozy sophisticated |
| trivia | Neon question mark, legible |
| unscramble | Real wooden blocks, high quality |
| wordsearch | Newspaper & coffee lifestyle — professional |

## ⚪ Not rated (check visually)
- numseq — not flagged; verify when replacing others

## 🛠️ How to generate replacements
- Provider ready: **openrouter/google/gemini-3.1-flash-image-preview** (configured, key works) or google/gemini-3-pro-image-preview
- Size: 600x400 (landscape 3:2) to match existing cards, JPEG
- Prompt style that worked: warm, professional, senior-friendly, **NO TEXT in image** (or minimal real words)
- After generating: overwrite images/cards/<game>.jpg, bump sw.js cache version, commit

## 🎨 Bonus polish (later, beyond cards)
- Home grid card hover effects, subtle shadows — make the grid feel premium
- Consistent warm color grade across all card images

---

> **See also `IMAGES.md`** — the full manifest of every picture in the app
> (cards, icons, and the two sources fetched rather than stored), a single
> house recipe so the 27 cards read as one set, and a per-game subject line.
> The defect list below is folded into it as the Verdict column. The two files
> disagree on scope: this one replaces the 13 broken cards, `IMAGES.md` argues
> for all 27 on the grounds that the grid mixing three visual languages is the
> actual complaint. Read both before generating anything.
