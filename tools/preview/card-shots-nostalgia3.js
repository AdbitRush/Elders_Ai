// Card pictures for the nostalgia batch-3 games (50 more) (NK kit): real screenshots a few moves in, then
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
  hanoi: ['.hn-row', () => { hnTap(0); hnTap(2); hnTap(0); hnTap(1); }],
  queens: ['.qn-b', () => { const s = _qnSolve(8, {}); [0, 1, 2, 3, 4].forEach((r) => qnTap(r, s[r])); }],
  knightour: ['.kt-b', () => { ktTap(0, 0); ktTap(1, 2); ktTap(2, 4); ktTap(0, 5); ktTap(2, 4) ; }],
  jugs: ['.jg-row', () => { jgFill(1); jgPick(1); jgPick(0); }],
  river: ['.rv-scene', () => { rvPick(3); rvPick(4); rvCross(); }],
  balance: ['.bl-scale', () => { [0, 1, 2, 3].forEach((i) => blCoin(i)); [4, 5, 6, 7].forEach((i) => { blCoin(i); blCoin(i); }); blWeigh(); }],
  magicsq: ['.ms-wrap', () => { const g = gameState.magicsq; [0, 4, 8].forEach((i) => { if (!g.g[i]) { g.g[i] = g.sol[i]; } }); NK.render('magicsq'); }],
  numpyramid: ['.np-p', () => {}],
  frogswap: ['.fs-row', () => { fsTap(2); fsTap(4); }],
  matchfix: ['.mf-eq', () => {}],
  cagemath: ['.cm-g', () => { const g = gameState.cagemath; for (let k = 0; k < 9; k++) { const r = Math.floor(k / g.n), c = k % g.n; g.g[r][c] = g.P.L[r][c]; } g.sel = [1, 4]; NK.render('cagemath'); }],
  skyline: ['.sky-g', () => { const g = gameState.skyline; for (let k = 0; k < 13; k++) { const r = Math.floor(k / g.n), c = k % g.n; g.g[r][c] = g.P.L[r][c]; } NK.render('skyline'); }],
  bridges: ['.br-b', () => { const g = gameState.bridges; g.P.sol.slice(0, Math.ceil(g.P.sol.length * 0.6)).forEach(([a, b, k]) => (g.b[_brKey(a, b)] = k)); NK.render('bridges'); }],
  lamps: ['.lm-b', () => { const g = gameState.lamps; let k = 0; g.P.lamp.forEach((row, r) => row.forEach((x, c) => { if (x && k++ < 6) g.g[r][c] = 1; })); NK.render('lamps'); }],
  tents: ['.tn-b', () => { const g = gameState.tents; let k = 0; g.P.tent.forEach((row, r) => row.forEach((x, c) => { if (x && k++ < 7) g.g[r][c] = 1; })); NK.render('tents'); }],
  dropquote: ['.dq-g', () => { const g = gameState.dropquote; g.P.ans.forEach((row, r) => row.forEach((ch, c) => { if (ch !== '#' && r < 2) g.g[r][c] = ch; })); NK.render('dropquote'); }],
  dotdot: ['.dd-b', () => { const g = gameState.dotdot; g.done = Math.ceil(g.dots.length * 0.7); NK.render('dotdot'); }],
  fenceloop: ['.fl-b', () => { const g = gameState.fenceloop; let k = 0; g.P.h.forEach((row, r) => row.forEach((x, c) => { if (x && k++ < 9) g.h[r][c] = 1; })); NK.render('fenceloop'); }],
  hose: ['.hs-b', () => { const g = gameState.hose; g.g = g.g.map((row, r) => row.map((m, c) => (r < 3 ? g.P.sol[r][c] : m))); NK.render('hose'); }],
  parking: ['.pk-w', () => {}],
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
