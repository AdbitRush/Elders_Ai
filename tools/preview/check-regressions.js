// Targeted regression checks for the 2026-11-03 BrainPlay fixes (run alone; ~1 minute; not a full suite).
//   node tools/preview/check-regressions.js <dir with node_modules/playwright> [baseUrl] [cpuThrottle]
// 1 Backgammon: Take back inside the 900 ms "Turn done" window must be a no-op (it used to restore the position AND still hand the turn to the computer).
// 2 Backgammon: bearing off the 15th checker wins even after a settled computer turn (state-based wait, no fixed sleeps).
// 3 Digit Span: a real double-tap on OK (two clicks in one tick) scores once and advances one round.
// 4 Solitaire at 1440 dark loads (waits for content instead of a fixed 1.2 s).
// 5 Klondike: Undo restores the Moves counter.
// 6 Memory: card counts follow the documented rule (8/12/16/20/24, full rows) and never shrink as the level rises.
const path = require('path');
const { chromium } = require(path.join(path.resolve(process.argv[2]), 'node_modules', 'playwright'));
const U = (process.argv[3] || 'http://127.0.0.1:8000').replace(/\/$/, ''), THR = +(process.argv[4] || 1);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const res = []; const ok = (n, p, i) => res.push((p ? 'PASS ' : 'FAIL ') + n + (i ? '  - ' + i : ''));
async function open(b, w, id, theme) {
  const mob = w < 500;
  const ctx = await b.newContext({ viewport: { width: w, height: mob ? 844 : 900 }, isMobile: mob, hasTouch: mob, serviceWorkers: 'block' });
  await ctx.addInitScript(([t]) => { try { if (sessionStorage.getItem('rg')) return; sessionStorage.setItem('rg', '1'); localStorage.setItem('gg-theme', t); localStorage.setItem('gg-lang', 'en');
    localStorage.setItem('gg_name', 'Ruth'); localStorage.setItem('gg_avatar', '🌻'); localStorage.setItem('gg_profile_seen', '1'); } catch (e) {} }, [theme]);
  await ctx.addCookies([{ name: 'cc_cookie', value: encodeURIComponent(JSON.stringify({ categories: ['necessary'], revision: 0, data: null, consentTimestamp: new Date().toISOString(), consentId: 'test', services: { necessary: [], ads: [] }, languageCode: 'en', lastConsentTimestamp: new Date().toISOString(), expirationTime: Date.now() + 864e5 })), url: U }]);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.route(/pagead2|googlesyndication|google-analytics|googletagmanager|fonts\.g/, (r) => r.abort());
  if (THR > 1) { const c = await ctx.newCDPSession(p); await c.send('Emulation.setCPUThrottlingRate', { rate: THR }); }
  await p.goto(U + '/?lang=en#' + id, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => { const c = document.getElementById('gameContent'); return c && c.children.length > 0; }, null, { timeout: 20000 }).catch(() => {});
  return { ctx, p, errs };
}
const waitFor = async (p, fn, arg, ms = 15000) => { try { await p.waitForFunction(fn, arg, { timeout: ms }); return true; } catch (e) { return false; } };
(async () => {
  const b = await chromium.launch();
  // 1 + 2 Backgammon
  { const { ctx, p } = await open(b, 1280, 'backgammon', 'light');
    const BG = () => p.evaluate(() => ({ turn: gameState.backgammon.turn, busy: gameState.backgammon.busy, dice: gameState.backgammon.dice.length, done: gameState.backgammon.done.length, st: JSON.stringify(gameState.backgammon.st) }));
    // a position where the roll leaves exactly one legal move, so the "Turn done" timer starts right after it
    await p.evaluate(() => { const g = gameState.backgammon; const pts = Array(26).fill(0); pts[24] = 1; pts[20] = -3; pts[13] = -2; g.st = { pts, bar: [0, 0], off: [14, 0] }; g.dice = []; g.done = []; _bgRender(); });
    await p.evaluate(() => { const r = Math.random; let n = 0; Math.random = () => (n++ < 2 ? 0 : r()); });   // dice 1 and 1 -> four 1s; one checker can step 24->23->22->21->(20 blocked? 3 enemy) so the sequence ends early
    await p.locator('.gk-btn', { hasText: 'Roll' }).click();
    let guard = 0; while (guard++ < 6) { const nx = await p.evaluate(() => { const n = _bgNext(); return n.length ? n[0] : null; }); if (!nx) break; await p.evaluate((m) => bgTap(m.from), nx); await p.evaluate((m) => bgTap(m.to), nx); }
    const mid = await BG();
    const pendingWindow = mid.turn === 0 && mid.dice > 0 && mid.done > 0;   // the 900 ms window: the moves are made, the computer has not started
    const undone = await p.evaluate(() => { const before = JSON.stringify(gameState.backgammon.st); bgUndo(); return { before, after: JSON.stringify(gameState.backgammon.st), turn: gameState.backgammon.turn }; });
    ok('1 backgammon: Take back inside the "Turn done" window is a no-op (position kept, nothing forfeited)', pendingWindow && undone.before === undone.after, `window=${pendingWindow} ${JSON.stringify({ moves: mid.done })}`);
    // settle: state-based wait for the computer's turn to finish
    const settled = await waitFor(p, () => { const g = gameState.backgammon; return g.turn === 0 && !g.busy && g.dice.length === 0; }, null, 15000);
    await p.evaluate(() => { const g = gameState.backgammon; const pts = Array(26).fill(0); pts[1] = 1; pts[20] = -3; g.st = { pts, bar: [0, 0], off: [14, 0] }; g.dice = []; g.done = []; _bgRender(); });
    await p.evaluate(() => { const r = Math.random; Math.random = r; });
    await p.locator('.gk-btn', { hasText: 'Roll' }).click();
    await p.locator('.bg-pt >> .bg-n:text-is("1")').click(); await p.click('.bg-offbox');
    const won = await waitFor(p, () => !document.getElementById('modal').classList.contains('hidden'), null, 8000);
    ok('2 backgammon: bearing off the 15th checker wins (after a settled computer turn)', settled && won, `settled=${settled}`);
    await ctx.close(); }
  // 3 Digit Span: two clicks in the same tick
  { const { ctx, p } = await open(b, 1280, 'digitspan', 'light');
    await p.waitForSelector('#ds-pad:not(.hidden)', { timeout: 15000 });
    const before = await p.evaluate(() => ({ si: gameState.digitspan._si, ss: gameState.digitspan._ss, t: gameState.digitspan._target }));
    for (const d of before.t) await p.click(`#ds-pad button[onclick="_dsKey(${d})"]`);
    const after = await p.evaluate(() => { const ok = document.querySelector('#ds-pad button[onclick="_dsKey(-2)"]'); ok.click(); ok.click(); return { si: gameState.digitspan._si, ss: gameState.digitspan._ss }; });
    ok('3 digit span: a real double-tap on OK scores once and advances one round', after.si === before.si + 1 && after.ss === before.ss + 1, JSON.stringify({ before, after }));
    // and the next round still starts normally
    const next = await waitFor(p, (si) => gameState.digitspan._si === si && !document.getElementById('ds-pad').classList.contains('hidden') && gameState.digitspan._input === '', after.si, 12000);
    ok('3b digit span: the next round starts and accepts input after the double-tap', next);
    await ctx.close(); }
  // 4 Solitaire 1440 dark
  { const t0 = Date.now(); const { ctx, p, errs } = await open(b, 1440, 'solitaire', 'dark');
    const r = await p.evaluate(() => ({ kids: document.getElementById('gameContent').children.length, inGame: document.documentElement.classList.contains('in-game'), game: document.documentElement.getAttribute('data-game'), over: document.documentElement.scrollWidth - innerWidth }));
    ok('4 solitaire @1440 dark: loads (content-ready wait, cpu x' + THR + ')', r.kids > 0 && r.inGame && r.game === 'solitaire' && r.over <= 0 && !errs.length, JSON.stringify(r) + ' ' + (Date.now() - t0) + 'ms ' + (errs[0] || ''));
    await ctx.close(); }
  // 5 Klondike: Undo restores Moves
  { const { ctx, p } = await open(b, 390, 'klondike', 'light');
    const r = await p.evaluate(() => { const s = gameState.klondike; const m0 = s.moves; klDraw(); const m1 = s.moves; klUndo(); return { m0, m1, m2: s.moves }; });
    ok('5 klondike: Undo restores the Moves counter', r.m1 === r.m0 + 1 && r.m2 === r.m0, JSON.stringify(r));
    const txt = await p.evaluate(() => (document.querySelector('.kl-count') || {}).textContent);
    ok('5b klondike: the visible "Moves" label matches after Undo', /Moves:\s*0/.test(txt || ''), txt);
    await ctx.close(); }
  // 6 Memory
  { const { ctx, p } = await open(b, 390, 'memory', 'light');
    const out = await p.evaluate(async () => { const o = []; for (const lv of [1, 2, 3, 4, 5, 6, 8, 12]) { gameState.memory.level = lv; initMemory(document.getElementById('gameContent')); await new Promise((x) => setTimeout(x, 40)); o.push([lv, document.querySelectorAll('[id^="m-card-"]').length]); } return o; });
    const valid = out.every(([, n]) => [8, 12, 16, 20, 24].includes(n)), mono = out.every(([, n], i) => i === 0 || n >= out[i - 1][1]);
    ok('6 memory: card counts 8/12/16/20/24 and never shrink with level (level 2 = 4 pairs is the documented rounding, not a bug)', valid && mono, JSON.stringify(out));
    await ctx.close(); }
  await b.close();
  console.log(res.join('\n')); const f = res.filter((x) => x.startsWith('FAIL')).length; console.log(`\n${res.length - f}/${res.length} passed`); process.exit(f ? 1 : 0);
})();
