# 🎨 Games Site — Graphic Improvement Plan (todo)

> Goal: "האתר צריך להיות מרשים, לא כאילו ילד עשה אותו"
> Created: 2026-08-26. Status: analysis done, images NOT yet replaced.

## ✅ Functional check — ALL 27 GAMES WORK (2026-08-26)

Automated smoke test (Playwright, mobile 420px):
- Every game loads, has interactive elements, responds to clicks
- **0 JS errors, 0 horizontal overflow, 0 broken images** across all 27 games
- No game is "broken" functionally — the problem is purely VISUAL QUALITY of the card thumbnails

## 🔴 Cards to REPLACE (13) — AI artifacts / childish / text gibberish

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

## 🟢 Cards that are GOOD — KEEP (13)

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
