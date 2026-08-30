#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// DOWNLOAD real Wikimedia photos for BrainPlay game cards (Elders_Ai).
// Replaces dark AI thumbnails with authentic photos where Wikimedia has good
// matches. Saves to images/cards/<game>.jpg (overwrites). Skips games not in
// the map or when no decent image is found.
// ═══════════════════════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'images', 'cards');
fs.mkdirSync(OUT, { recursive: true });

const UA = 'BrainPlay/1.0 (https://games.178-105-148-72.sslip.io; admin@cruisedeals50.example)';

// game → search query (curated: prefer classic games with real photos)
const QUERIES = {
  sudoku: 'sudoku puzzle solved',
  jigsaw: 'jigsaw puzzle in progress',
  hangman: 'hangman game word puzzle',
  flags: 'national flags row',
  klondike: 'carpet patience solitaire cards',
  solitaire: 'solitaire playing cards table',
  shapes: 'wooden blocks children',
  blocks: 'wooden building blocks',
  letters: 'alphabet wooden blocks',
  unscramble: 'scrabble tiles wood',
  memory: 'playing cards deck',
  pairs: 'playing cards deck',
  math: 'abacus',
  clock: 'analog clock face',
  counting: 'finger counting',
  wordsearch: 'crossword puzzle',
  colormatch: 'color wheel',
  recall: 'memory game cards',
  proverbs: 'open old book',
  trivia: 'quiz show',
  sequence: 'colorful lights pattern buttons',
  oddoneout: 'colorful geometric shapes',
  numseq: 'numbers pattern',
  digitspan: 'numbers memory',
  category: 'sorting objects',
  truefalse: 'quiz true false',
  safari: 'safari animals',
  lifesim: 'seniors playing board game',
};

function wikiSearch(q) {
  return new Promise((resolve) => {
    const api = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search' +
      '&gsrsearch=' + encodeURIComponent(q) +
      '&gsrnamespace=6&gsrlimit=4&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=600&format=json';
    const req = https.get(api, { headers: { 'User-Agent': UA }, timeout: 20000 }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          const pages = j.query?.pages || {};
          let best = null;
          for (const p of Object.values(pages)) {
            const ii = p.imageinfo?.[0];
            if (!ii || !ii.thumburl) continue;
            const mime = ii.mime || '';
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(mime)) continue;
            const landscape = (ii.width >= ii.height);
            const cand = { u: ii.thumburl, w: ii.width, h: ii.height, mime, landscape };
            if (!best || (cand.landscape && !best.landscape)) best = cand;
          }
          resolve(best ? best.u : null);
        } catch (e) { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

function download(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { headers: { 'User-Agent': UA }, timeout: 30000 }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303) {
        res.resume();
        const loc = res.headers.location;
        if (loc) return download(new URL(loc, url).href).then(resolve, reject);
        return reject(new Error('redirect'));
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)); }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(new Error('timeout')); });
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const games = Object.keys(QUERIES);
  console.log(`games to fetch: ${games.length}`);
  let ok = 0, missing = 0, fail = 0;
  for (const g of games) {
    const imgUrl = await wikiSearch(QUERIES[g]);
    if (!imgUrl) { missing++; console.log(`✗ ${g}: no Wikimedia match`); continue; }
    try {
      const buf = await download(imgUrl);
      if (buf.length > 8000) {
        const out = path.join(OUT, g + '.jpg');
        fs.writeFileSync(out, buf);
        ok++;
        console.log(`✓ ${g}: ${Math.round(buf.length / 1024)}KB`);
      } else { fail++; console.log(`✗ ${g}: tiny (${buf.length}B)`); }
    } catch (e) { fail++; console.log(`✗ ${g}: ${e.message}`); }
    await sleep(800);
  }
  console.log(`\nDONE: ${ok} updated, ${missing} no match, ${fail} failed`);
  process.exit(0);
})();
