// Win path for the nostalgia batch-2 games: put a game one step from a win (state edited in the page), then make
// that last step with a REAL tap, and check the "Well Done!" end screen and the Level 2 button.
//   node tools/preview/winpath-nostalgia2.js '' http://127.0.0.1:8931 [ids,comma]
const path = require('path');
const pwDir = process.argv[2];
const { chromium } = require(pwDir ? path.join(path.resolve(pwDir), 'node_modules', 'playwright') : 'playwright');
const U = (process.argv[3] || 'http://127.0.0.1:8931').replace(/\/$/, '');
// id: [setup in the page (returns the selector to tap, or an array of selectors), expected end-screen title start]
const CASES = {
  reversi: () => { const g = gameState.reversi; g.b = Array(64).fill(1); g.b[63] = 0; g.b[62] = 2; g.b[0] = 2; g.b[1] = 1; g.turn = 1; NK.render('reversi'); return '[onclick="rvTap(63)"]'; },
  fourrow: () => { const g = gameState.fourrow; g.b[5][0] = g.b[5][1] = g.b[5][2] = 1; g.b[4][0] = g.b[4][1] = 2; g.turn = 1; NK.render('fourrow'); return ['[onclick="frPick(3)"]', '[onclick="frPick(3)"]']; },
  shutbox: () => { const g = gameState.shutbox; g.round = 3; g.tot = [0, 40]; g.hist = [[0, 20], [0, 20]]; g.open = g.open.map((_, i) => i === 6); g.dice = [3, 4]; g.need = 7; g.pick = []; NK.render('shutbox'); return ['[onclick="sbTile(7)"]', '[data-k="shut"]']; },
  lights: () => { const g = gameState.lights; g.on = g.on.map(() => false); [0, 1, g.n].forEach((i) => (g.on[i] = true)); NK.render('lights'); return '[onclick="ltTap(0)"]'; },
  maze: () => { const g = gameState.maze; const r = _mzRoute(g); const [a, b] = r[r.length - 2].split(',').map(Number); g.pos = [a, b]; NK.render('maze'); const n = g.n - 1; return `[onclick="mzTap(${n},${n})"]`; },
  morris: () => { const g = gameState.morris; g.b = Array(24).fill(0); [0, 1, 14].forEach((i) => (g.b[i] = 1)); [21, 22, 23].forEach((i) => (g.b[i] = 2)); g.hand = [0, 0, 0]; g.turn = 1; NK.render('morris'); return ['[onclick="moTap(14)"]', '[onclick="moTap(2)"]', '[onclick="moTap(21)"]']; },
  salvo: () => { const g = gameState.salvo; let last = -1; g.cpu.ships.forEach((sh, k) => sh.cells.forEach((c, j) => { if (k === 0 && j === 0) { last = c; return; } g.myShots[c] = 2; sh.hits++; })); NK.render('salvo'); return [`[onclick="svTap(${last})"]`, `[onclick="svTap(${last})"]`]; },
  bingo: () => { const g = gameState.bingo; g.pat = 'corners'; const cd = g.cards[0]; [0, 4, 20].forEach((i) => { cd.daub[i] = true; g.called.push(cd.nums[i]); }); g.called.push(cd.nums[24]); NK.render('bingo'); return ['[onclick="bgDaub(0,24)"]', '[data-k="claim"]']; },
  moonland: () => { const g = gameState.moonland; g.h = 3; g.v = 1; g.B = 3; NK.render('moonland'); return '[data-k="fire"]'; },
  jellybean: () => { const g = gameState.jellybean; g.i = 4; g.res = [0, 1, 2, 3].map(() => ({ g: 1, n: 1, cls: 'b', name: 'Blue ribbon', pts: 3 })); g.fill = _jbFill(g.jars[4]); g.entry = String(g.jars[4]); NK.render('jellybean'); return ['[data-k="guess"]', '[data-k="next"]']; },
  golf: () => { const g = gameState.golf; const C = (r, s) => ({ r, s, up: true }); g.hole = 3; g.tot = [0, 0]; g.cards = [[0, 0], [0, 0]]; g.phase = 'play'; g.turn = 0; g.ender = 1; g.hold = null; g.mustFlip = false;
    g.hands[0] = [C(13, 0), C(13, 1), C(13, 2), C(13, 3), C(12, 0), C(12, 1)]; g.hands[1] = [C(12, 2), C(11, 0), C(10, 0), C(9, 0), C(11, 1), C(8, 0)]; g.deck.push({ r: 12, s: 3, up: false }); NK.render('golf'); return ['[data-k="stock"]', '[onclick="gfSlot(5)"]']; },
  crosssums: () => { const g = gameState.crosssums; const cells = Object.keys(g.P.sol).map(Number).filter((i) => !g.P.given[i]); cells.slice(1).forEach((i) => (g.v[i] = g.P.sol[i])); g.sel = cells[0]; NK.render('crosssums'); return `[data-k="d${g.P.sol[cells[0]]}"]`; },
  logicgrid: () => { const g = gameState.logicgrid; g.P.cats.forEach((_, c) => { for (let q = 0; q < g.P.n; q++) g.ans[c][q] = g.P.A[c][q]; }); g.ans[0][0] = -1; g.sel = [0, 0]; NK.render('logicgrid'); return `[data-k="o${g.P.A[0][0]}"]`; },
  fillin: () => { const g = gameState.fillin; let last = -1; g.slots.forEach((s, k) => { if (!s.w) { s.w = g.P.placed[k].w; last = k; } }); g.slots[last].w = null; g.sel = last; NK.render('fillin'); return `[onclick="fiWord(${g.words.indexOf(g.P.placed[last].w)})"]`; },
  colorbynum: () => { const g = gameState.colorbynum; g.done = g.done.map(() => true); g.done[0] = false; const r = g.R.regs[0]; g.paint = g.num[r.ch]; NK.render('colorbynum'); return `[onclick="cnTap(${r.lab[0]},${r.lab[1]})"]`; },
  chess: () => { const g = gameState.chess; g.S = _chFromFen('6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1'); g.reps = {}; NK.render('chess'); return ['[onclick="chTap(56)"]', '[onclick="chTap(0)"]']; },
  railyard: () => { const g = gameState.railyard, T = g.target, rest = [...Array(T.length + 3).keys()].filter((c) => !T.includes(c)).slice(0, 10); g.S = [T.slice(1), [], []]; g.E = [T[0]];
    rest.forEach((c) => { if (c >= 8) return; const x = g.S[1].length < g.caps[1] ? 1 : 2; if (g.S[x].length < g.caps[x]) g.S[x].push(c); }); NK.render('railyard'); return ['[onclick="rySel(0)"]', '[data-k="g0"]']; },
  twentyq: () => { const g = gameState.twentyq; return [`[onclick="tqPick(${_TQ_ITEMS.indexOf(g.secret)})"]`, '[data-k="guess"]']; },
  sticks: () => { const g = gameState.sticks; g.st.forEach((s, i) => (s.gone = i !== g.st.length - 1)); g.sel = g.st.length - 1; NK.render('sticks'); return '[data-k="lift"]'; },
  tilematch: () => { const g = gameState.tilematch; const a = g.t.findIndex((x) => x.z === 0 && x.r === 0 && x.c === 0), b = g.t.findIndex((x) => x.z === 0 && x.r === 0 && x.c === 5); g.t.forEach((x, i) => (x.gone = i !== a && i !== b)); g.t[b].f = g.t[a].f; NK.render('tilematch'); return [`[onclick="tmTap(${a})"]`, `[onclick="tmTap(${b})"]`]; },
};
(async () => {
  const b = await chromium.launch(); const ids = process.argv[4] ? process.argv[4].split(',') : Object.keys(CASES); let bad = 0;
  for (const id of ids) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    await ctx.addInitScript(() => { try { if (sessionStorage.getItem('x')) return; sessionStorage.setItem('x', '1'); localStorage.clear(); localStorage.setItem('gg_profile_seen', '1'); localStorage.setItem('gg_name', 'R'); } catch (e) {} });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(`${U}/?lang=en#${id}`, { waitUntil: 'networkidle' }); await p.waitForTimeout(900);
    let sels = await p.evaluate(CASES[id]); if (!Array.isArray(sels)) sels = [sels];
    for (const s of sels) { await p.tap('#gameContent ' + s); await p.waitForTimeout(150); }
    let t = ''; for (let i = 0; i < 150 && !t; i++) { await p.waitForTimeout(200); t = await p.evaluate(() => (document.getElementById('modal').classList.contains('hidden') ? '' : document.getElementById('modalTitle').innerText + ' | ' + document.getElementById('modalBody').innerText)); }
    let lvl = '';
    if (t) { await p.click('#nextLevelBtn'); await p.waitForTimeout(800); lvl = await p.evaluate(() => document.getElementById('levelIndicator').innerText.replace(/\s+/g, ' ')); }
    const ok = /^Well Done|^Amazing/.test(t) && /2/.test(lvl) && !errs.length;
    if (!ok) bad++;
    console.log(`${ok ? 'OK ' : 'BAD'} ${id}: ${t || 'NO END SCREEN'} -> ${lvl}${errs.length ? ' errors: ' + errs.join(' / ') : ''}`);
    await ctx.close();
  }
  console.log(bad ? bad + ' failed' : 'all win paths OK'); await b.close();
})();
