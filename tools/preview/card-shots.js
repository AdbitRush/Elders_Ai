// Card pictures = real screenshots of the games (2026-10-10, Or: "real screenshots of the actual games, no stock photos").
//   node tools/preview/card-shots.js <dir with node_modules/playwright> <baseUrl> <outDir> [ids,comma]
// Each game is opened in light mode, played a few moves into a natural mid-game moment, and its play area is captured
// as <outDir>/<id>.png. tools/preview/frame_shots.py then frames those as instant photos -> images/cards/<id>.jpg.
const path = require('path'), fs = require('fs');
const { chromium } = require(path.join(path.resolve(process.argv[2]), 'node_modules', 'playwright'));
const U = (process.argv[3] || 'http://127.0.0.1:8931').replace(/\/$/, '');
const OUT = path.resolve(process.argv[4] || 'shots'); fs.mkdirSync(OUT, { recursive: true });
const ONLY = process.argv[5] ? process.argv[5].split(',') : null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// a few moves, so the picture shows a game being played rather than an empty board
const STAGE = {
  async memory(p) { const v = await p.evaluate(() => [...document.querySelectorAll('.card-inner')].map((c) => c.dataset.val));
    const done = []; for (let i = 0; i < v.length && done.length < 4; i++) { if (done.includes(i)) continue; const j = v.findIndex((x, k) => k !== i && x === v[i]); done.push(i, j); await p.click('#m-card-' + i); await p.click('#m-card-' + j); await sleep(300); } },
  async wordsearch(p) { await p.evaluate(() => { const st = gameState.wordsearch, w = st.words[0], cells = [...document.querySelectorAll('.ws-cell')], n = Math.sqrt(cells.length), g = [];
    cells.forEach((c) => { (g[+c.dataset.r] = g[+c.dataset.r] || [])[+c.dataset.c] = c; });
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) { const ch = [...w];
      if (c + ch.length <= n && ch.every((x, i) => g[r][c + i].innerText.trim() === x)) { ch.forEach((_, i) => g[r][c + i].click()); return; }
      if (r + ch.length <= n && ch.every((x, i) => g[r + i][c].innerText.trim() === x)) { ch.forEach((_, i) => g[r + i][c].click()); return; } } }); await sleep(400); },
  async sudoku(p) { await p.evaluate(() => selectSudoku9(4, 4)); },
  async shapes(p) { for (let id = 0; id < 2; id++) { await p.locator('#shapePick > div').nth(id).click(); await p.click(`#shapeDrop > div[data-target="${id}"]`); } },
  async solitaire(p) { await p.evaluate(() => { const i = gameState.solitaire.cards.findIndex((c) => c.val !== 13); document.getElementById('sol-card-' + i).click(); }); },
  async pairs(p) { await p.evaluate(() => { const c = [...document.querySelectorAll('.pair-chip')]; const a = c.find((x) => x.dataset.type === 'a'); const b = c.find((x) => x.dataset.type === 'b' && x.dataset.idx === a.dataset.idx); a.click(); b.click(); }); },
  async hangman(p) { await p.evaluate(() => { const w = [...new Set([...gameState.hangman.word].map(_hmNorm))]; guessLetter(w[0]); if (w[1]) guessLetter(w[1]);
    const miss = _hmKb().find((k) => !w.includes(k)); guessLetter(miss); }); await sleep(1600); },
  async blocks(p) { await sleep(2600); },
  async lifesim(p) { await p.locator('#gameContent button').first().click(); await sleep(500); },
  async safari(p) { await sleep(1500); },
  async jigsaw(p) { await p.click('.jig-chip[data-n="12"]'); await p.click('.jig-btn-go'); await p.waitForSelector('.jig-slot');
    await p.evaluate(() => { const S = JIGSAW_STATE; for (let si = 0; si < 4; si++) placeJigsawPiece(si, S.piecesArr[si].idx); }); await sleep(600); },
  async unscramble(p) { await p.evaluate(() => { const w = [...gameState.unscramble.word], t = [...document.querySelectorAll('.letter-tile')]; const used = [];
    for (const ch of w.slice(0, 2)) { const i = t.findIndex((x, k) => x.innerText === ch && !used.includes(k)); used.push(i); t[i].click(); } }); },
  async sequence(p) { await sleep(2500); },
  async recall(p) { await sleep(300); },
};

(async () => {
  const b = await chromium.launch();
  const ctx0 = await b.newContext(); const p0 = await ctx0.newPage(); await p0.goto(U + '/?lang=en'); const ids = ONLY || await p0.evaluate(() => window.GAME_IDS); await ctx0.close();
  for (const id of ids) {
    const ctx = await b.newContext({ viewport: { width: 640, height: 1000 }, deviceScaleFactor: 2, serviceWorkers: 'block' });
    // consent answered (so the banner is not in the picture), English, light, a name already chosen
    await ctx.addCookies([{ name: 'cc_cookie', value: encodeURIComponent(JSON.stringify({ categories: ['necessary'], revision: 0, data: null, consentTimestamp: new Date().toISOString(), consentId: 'shots', services: { necessary: [], ads: [] }, languageCode: 'en', lastConsentTimestamp: new Date().toISOString(), expirationTime: Date.now() + 864e5 })), url: U }]);
    await ctx.addInitScript(() => { try { if (sessionStorage.getItem('x')) return; sessionStorage.setItem('x', '1'); localStorage.clear();
      localStorage.setItem('gg-theme', 'light'); localStorage.setItem('gg-lang', 'en'); localStorage.setItem('gg_difficulty', 'normal');
      localStorage.setItem('gg_name', 'Ruth'); localStorage.setItem('gg_profile_seen', '1'); } catch (e) {} });
    const p = await ctx.newPage();
    await p.goto(U + '/?lang=en#' + id, { waitUntil: 'networkidle' }); await sleep(id === 'digitspan' ? 300 : 1500);   // Number Memory: catch the number before it hides
    await p.addStyleTag({ content: '#cc-main{display:none!important}' });
    if (STAGE[id]) await STAGE[id](p);
    if (id !== 'digitspan') await sleep(500);
    const box = await p.evaluate(() => { const r = document.getElementById('gameContent').getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height }; });
    const pad = 18;
    await p.screenshot({ path: path.join(OUT, id + '.png'), fullPage: true,
      clip: { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: Math.min(640, box.w + pad * 2), height: Math.min(1400, box.h + pad * 2) } });
    console.log(id, Math.round(box.w) + 'x' + Math.round(box.h));
    await ctx.close();
  }
  await b.close();
})();
