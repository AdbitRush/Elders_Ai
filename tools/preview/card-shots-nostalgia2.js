// Card pictures for the nostalgia batch-2 games (NK kit): real screenshots a few moves in, then
//   python tools/preview/frame_shots.py <rawDir> images/cards
//   node tools/preview/card-shots-nostalgia2.js '' http://127.0.0.1:8931 <rawDir> [ids,comma]
const path = require('path'), fs = require('fs');
const pwDir = process.argv[2];
const { chromium } = require(pwDir ? path.join(path.resolve(pwDir), 'node_modules', 'playwright') : 'playwright');
const U = (process.argv[3] || 'http://127.0.0.1:8931').replace(/\/$/, '');
const OUT = path.resolve(process.argv[4] || 'shots'); fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// id: [element to capture, staging code run in the page]
const STAGE = {
  reversi: ['.rv-board', () => { const g = gameState.reversi; [19, 18, 17].forEach((i, k) => { const ms = _rvMoves(g.b, 1); if (ms.length) { g.b = _rvApply(g.b, ms[k % ms.length], 1); const c = _rvMoves(g.b, 2); if (c.length) g.b = _rvApply(g.b, c[0], 2); } }); g.flipped = []; NK.render('reversi'); }],
  fourrow: ['.fr-wrap', () => { const g = gameState.fourrow; [[3, 1], [3, 2], [2, 1], [4, 2], [2, 2], [4, 1], [3, 1]].forEach(([c, p]) => { g.b[_frDrop(g.b, c)][c] = p; }); g.sel = 2; NK.render('fourrow'); }],
  shutbox: ['.nk-shutbox', () => { const g = gameState.shutbox; g.open[8] = g.open[2] = g.open[5] = false; g.dice = [4, 3]; g.need = 7; g.pick = [7]; NK.render('shutbox'); document.querySelector('.nk-shutbox .sb-score').style.display = 'none'; document.querySelector('.nk-shutbox .nk-rules').style.display = 'none'; document.querySelector('.nk-shutbox .gk-btns').style.display = 'none'; document.querySelector('.nk-shutbox .nk-msg').style.display = 'none'; document.querySelector('.nk-shutbox .nk-top').style.display = 'none'; }],
  lights: ['.lt-board', () => {}],
  maze: ['.mz-paper', () => { for (const d of ['right', 'down', 'right', 'down']) mzGo(d); }],
  morris: ['.mo-wrap', () => { const g = gameState.morris; [[0, 1], [4, 2], [9, 1], [13, 2], [21, 1], [7, 2], [12, 1]].forEach(([i, p]) => { g.b[i] = p; g.hand[p]--; }); g.sel = -1; NK.render('morris'); }],
  salvo: ['.sv-sea', () => { const g = gameState.salvo; const sh = g.cpu.ships[0]; g.myShots[sh.cells[0]] = 2; sh.hits = 1; g.myShots[sh.cells[1]] = 2; sh.hits = 2; [5, 18, 33, 47, 60, 27, 42].forEach((i) => { if (!g.myShots[i] && g.cpu.g[i] < 0) g.myShots[i] = 1; }); g.aim = [9, 14, 50].find((i) => !g.myShots[i]); NK.render('salvo'); }],
  bingo: ['.bg-card', () => { for (let i = 0; i < 14; i++) bgNext(); const g = gameState.bingo; g.cards.forEach((c) => c.nums.forEach((n, i) => { if (g.called.includes(n)) c.daub[i] = true; })); NK.render('bingo'); }],
  moonland: ['.ml-scene', () => { mlSet(6); mlFire(); mlSet(5); }],
  jellybean: ['.jb-jar', () => {}],
  golf: ['.gf-t', () => { gfSlot(0); gfSlot(4); gfStock(); }],
  crosssums: ['.ks-grid', () => { const g = gameState.crosssums; Object.keys(g.P.sol).map(Number).slice(0, 7).forEach((i) => (g.v[i] = g.P.sol[i])); NK.render('crosssums'); }],
  logicgrid: ['.lg-clues', () => {}],
  fillin: ['.fi-grid', () => { const g = gameState.fillin; g.slots.slice(0, 3).forEach((s, k) => (s.w = g.P.placed[k].w)); NK.render('fillin'); }],
  colorbynum: ['.cn-grid', () => { const g = gameState.colorbynum; g.done = g.done.map((_, i) => i % 3 !== 2); NK.render('colorbynum'); }],
  chess: ['.ch-board', () => { [[52, 36], [6, 21], [62, 45], [11, 27]].forEach(([f, t], k) => { const g = gameState.chess; const m = _chLegal(g.S).find((x) => x.f === f && x.t === t) || _chLegal(g.S)[0]; g.S = _chApply(g.S, m); g.last = m; }); gameState.chess.sel = 57; NK.render('chess'); }],
  railyard: ['.ry-yard', () => { rySel(1); }],
  twentyq: ['.tq-items', () => { const g = gameState.twentyq; [0, 3].forEach((q) => tqAsk(q)); }],
  sticks: ['.sk-svg', () => {}],
  tilematch: ['.tm-board', () => {}],
};
(async () => {
  const b = await chromium.launch();
  const ids = process.argv[5] ? process.argv[5].split(',') : Object.keys(STAGE);
  for (const id of ids) {
    const ctx = await b.newContext({ viewport: { width: 640, height: 1000 }, deviceScaleFactor: 2, serviceWorkers: 'block' });
    await ctx.addCookies([{ name: 'cc_cookie', value: encodeURIComponent(JSON.stringify({ categories: ['necessary'], revision: 0, data: null, consentTimestamp: new Date().toISOString(), consentId: 'shots', services: { necessary: [], ads: [] }, languageCode: 'en', lastConsentTimestamp: new Date().toISOString(), expirationTime: Date.now() + 864e5 })), url: U }]);
    await ctx.addInitScript(() => { try { if (sessionStorage.getItem('x')) return; sessionStorage.setItem('x', '1'); localStorage.clear(); localStorage.setItem('gg-theme', 'light'); localStorage.setItem('gg-lang', 'en'); localStorage.setItem('gg_difficulty', 'normal'); localStorage.setItem('gg_name', 'Ruth'); localStorage.setItem('gg_profile_seen', '1'); } catch (e) {} });
    const p = await ctx.newPage();
    await p.goto(U + '/?lang=en#' + id, { waitUntil: 'networkidle' }); await sleep(1300);
    await p.addStyleTag({ content: '#cc-main{display:none!important} nav{position:static!important}' });
    await p.evaluate(STAGE[id][1]); await sleep(500);
    await p.evaluate(() => scrollTo(0, 0));
    const box = await p.evaluate((sel) => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height }; }, STAGE[id][0]);
    const pad = 12;
    await p.screenshot({ path: path.join(OUT, id + '.png'), fullPage: true, clip: { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: Math.min(640, box.w + pad * 2), height: box.h + pad * 2 } });
    console.log(id, Math.round(box.w) + 'x' + Math.round(box.h));
    await ctx.close();
  }
  await b.close();
})();
