// Card pictures for the 2026-11 nostalgia batch: real screenshots of the games, a few moves in (same idea as
// card-shots.js, kept separate so that shared file is untouched). Then frame them like the others:
//   node tools/preview/card-shots-nostalgia.js '' http://127.0.0.1:8931 <rawDir>
//   python tools/preview/frame_shots.py <rawDir> images/cards
const path = require('path'), fs = require('fs');
const pwDir = process.argv[2];
const { chromium } = require(pwDir ? path.join(path.resolve(pwDir), 'node_modules', 'playwright') : 'playwright');
const U = (process.argv[3] || 'http://127.0.0.1:8931').replace(/\/$/, '');
const OUT = path.resolve(process.argv[4] || 'shots'); fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// [what to capture, how to stage it]
const STAGE = {
  mancala: ['.mc-board', async (p) => { await p.evaluate(() => { mcTap(2); }); await sleep(2600); }],
  dotsboxes: ['.db-paper', async (p) => { await p.evaluate(() => { const g = gameState.dotsboxes; g.turn = 0;
    [['h', 0, 0], ['v', 0, 0], ['h', 1, 0], ['h', 0, 1], ['v', 1, 3], ['h', 3, 2], ['v', 2, 2]].forEach(([t, r, c]) => _dbApply(g, { t, r, c }, 1));
    [['v', 0, 1], ['h', 4, 3], ['v', 3, 4], ['h', 3, 3], ['h', 2, 1]].forEach(([t, r, c]) => _dbApply(g, { t, r, c }, 2));
    g.lastCpu = ['h2_1']; g.sel = { t: 'v', r: 2, c: 1 }; _dbRender(); }); }],
  pegjump: ['.pj-wood', async (p) => { await p.evaluate(() => { pjTap(3); pjTap(0); pjTap(5); pjTap(3); pjTap(1); }); }],
  tabledice: ['.td-felt', async (p) => { await p.evaluate(() => { const g = gameState.tabledice; tdRoll(); g.dice = [5, 5, 2, 5, 6]; g.hold = [true, true, false, true, false]; _tdRender(); }); await sleep(500); }],
  boardwalk: ['.bw-svg', async (p) => { await p.evaluate(() => { const g = gameState.boardwalk; g.wob = 0; g.drift = [0, 0];
    g.shots = [{ aim: [150, 128], at: [161, 120], pts: 40 }, { aim: [140, 136], at: [146, 131], pts: 50 }, { aim: [262, 34], at: [255, 52], pts: 0 }]; g.score = 90; g.aim = [148, 126]; _bwRender(); }); }],
};

(async () => {
  const b = await chromium.launch();
  for (const id of Object.keys(STAGE)) {
    const ctx = await b.newContext({ viewport: { width: 640, height: 1000 }, deviceScaleFactor: 2, serviceWorkers: 'block' });
    await ctx.addCookies([{ name: 'cc_cookie', value: encodeURIComponent(JSON.stringify({ categories: ['necessary'], revision: 0, data: null, consentTimestamp: new Date().toISOString(), consentId: 'shots', services: { necessary: [], ads: [] }, languageCode: 'en', lastConsentTimestamp: new Date().toISOString(), expirationTime: Date.now() + 864e5 })), url: U }]);
    await ctx.addInitScript(() => { try { if (sessionStorage.getItem('x')) return; sessionStorage.setItem('x', '1'); localStorage.clear();
      localStorage.setItem('gg-theme', 'light'); localStorage.setItem('gg-lang', 'en'); localStorage.setItem('gg_difficulty', 'normal');
      localStorage.setItem('gg_name', 'Ruth'); localStorage.setItem('gg_profile_seen', '1'); } catch (e) {} });
    const p = await ctx.newPage();
    await p.goto(U + '/?lang=en#' + id, { waitUntil: 'networkidle' }); await sleep(1500);
    await p.addStyleTag({ content: '#cc-main{display:none!important} nav{position:static!important}' });
    await STAGE[id][1](p); await sleep(500);
    await p.evaluate(() => scrollTo(0, 0));
    const box = await p.evaluate((sel) => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height }; }, STAGE[id][0]);
    const pad = 12;
    await p.screenshot({ path: path.join(OUT, id + '.png'), fullPage: true, clip: { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: Math.min(640, box.w + pad * 2), height: box.h + pad * 2 } });
    console.log(id, Math.round(box.w) + 'x' + Math.round(box.h));
    await ctx.close();
  }
  await b.close();
})();
