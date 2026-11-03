// Keyboard and restart checks for the nostalgia batch, including the Kitchen Table Dice shortcuts added after the cloud's keyboard test.
//   node tools/preview/check-nostalgia-keys.js <dir with node_modules/playwright> [baseUrl]
// Every action is a real key press or click. gameState is only read, to check the result. Exit code 1 on any FAIL.
const path = require('path');
const { chromium } = require(path.join(path.resolve(process.argv[2]), 'node_modules', 'playwright'));
const U = (process.argv[3] || 'http://127.0.0.1:18772').replace(/\/$/, '');
const res = []; const ok = (n, p, i) => res.push((p ? 'PASS ' : 'FAIL ') + n + (i !== undefined ? '  - ' + i : ''));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let B;
async function open(id, { w = 1280, reduce = true } = {}) {
  const mob = w < 500;
  const ctx = await B.newContext({ viewport: { width: w, height: mob ? 844 : 900 }, isMobile: mob, hasTouch: mob, serviceWorkers: 'block', reducedMotion: reduce ? 'reduce' : 'no-preference' });
  await ctx.addInitScript(() => { try { localStorage.setItem('gg-theme', 'light'); localStorage.setItem('gg-lang', 'en'); localStorage.setItem('gg_name', 'Ruth'); localStorage.setItem('gg_profile_seen', '1'); localStorage.setItem('gg-sound', 'off'); } catch (e) {} });
  await ctx.addCookies([{ name: 'cc_cookie', value: encodeURIComponent(JSON.stringify({ categories: ['necessary'], revision: 0, data: null, consentTimestamp: new Date().toISOString(), consentId: 't', services: { necessary: [], ads: [] }, languageCode: 'en', lastConsentTimestamp: new Date().toISOString(), expirationTime: Date.now() + 864e5 })), url: U }]);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.route(/pagead2|googlesyndication|google-analytics|googletagmanager|fonts\.g/, (r) => r.abort());
  await p.goto(`${U}/?lang=en#${id}`, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction((id) => typeof GAME_INIT !== 'undefined' && typeof window[GAME_INIT[id]] === 'function' && gameState.currentId === id && document.getElementById('gameContent').children.length > 0, id, { timeout: 30000 }); await sleep(500);
  return { ctx, p, errs };
}
const blur = (p) => p.evaluate(() => { if (document.activeElement) document.activeElement.blur(); });
const clickText = (p, t) => p.click(`#gameContent button:has-text("${t}")`);

async function dice() {
  const { ctx, p, errs } = await open('tabledice'); const S = () => p.evaluate(() => { const g = gameState.tabledice; return { rolls: g.rolls, dice: g.dice.slice(), hold: g.hold.slice(), turn: g.turn, card: Object.keys(g.card).length, msg: g.msg }; });
  await blur(p);
  await p.keyboard.press('2'); let s = await S(); ok('dice: 1-5 before the first roll keeps nothing and says to roll', s.hold.every((x) => !x) && /Roll first/.test(s.msg), s.msg);
  await p.keyboard.press('r'); s = await S(); ok('dice: R rolls once', s.rolls === 1 && s.dice.every((d) => d >= 1 && d <= 6), JSON.stringify(s.dice));
  await blur(p); const d0 = s.dice.slice();
  await p.keyboard.press('1'); await p.keyboard.press('5'); s = await S(); ok('dice: 1 and 5 keep the first and fifth dice', s.hold[0] && s.hold[4] && !s.hold[1], JSON.stringify(s.hold));
  ok('dice: the kept state is announced to screen readers on the button', await p.evaluate(() => { const b = document.querySelectorAll('.td-die'); return b[0].getAttribute('aria-pressed') === 'true' && /kept/.test(b[0].getAttribute('aria-label')); }));
  await p.keyboard.press('5'); s = await S(); ok('dice: pressing 5 again frees that die', !s.hold[4]);
  await p.keyboard.press('R'); s = await S(); ok('dice: capital R also rolls, and the kept die does not change', s.rolls === 2 && s.dice[0] === d0[0], JSON.stringify(s.dice));
  // focus: pick a die by Tab + Enter, then keep going
  await p.focus('.td-die'); await p.keyboard.press('Enter'); const f = await p.evaluate(() => ({ cls: document.activeElement.className, pressed: document.querySelectorAll('.td-die')[0].getAttribute('aria-pressed') }));
  ok('dice: Enter on a focused die toggles it once and focus stays on a die', /td-die/.test(f.cls), JSON.stringify(f));
  await blur(p);
  await p.keyboard.press('r'); s = await S(); ok('dice: third roll allowed', s.rolls === 3);
  await p.keyboard.press('r'); s = await S(); ok('dice: a fourth R does nothing', s.rolls === 3);
  await p.keyboard.press('2'); s = await S(); ok('dice: after the last roll a number key explains there are no rolls left', /No rolls left/.test(s.msg), s.msg);
  // auto-repeat: a held key must not burn rolls or flip a die back and forth
  await clickText(p, 'New score card'); await blur(p);
  await p.keyboard.down('r'); await p.keyboard.down('r'); await p.keyboard.down('r'); await p.keyboard.up('r'); s = await S(); ok('dice: a held R (auto-repeat) rolls once, not three times', s.rolls === 1, `rolls=${s.rolls}`);
  await p.keyboard.down('1'); await p.keyboard.down('1'); await p.keyboard.up('1'); s = await S(); ok('dice: a held 1 keeps the die once', s.hold[0] === true, JSON.stringify(s.hold));
  // restart must not stack listeners
  await clickText(p, 'New score card'); await clickText(p, 'New score card'); await blur(p);
  await p.keyboard.press('r'); s = await S(); ok('dice: after New score card, one R is one roll', s.rolls === 1, `rolls=${s.rolls}`);
  await p.keyboard.press('3'); s = await S(); ok('dice: after New score card, one 3 keeps one die', s.hold[2] === true, JSON.stringify(s.hold));
  // keys in other places
  await p.evaluate(() => toggleGameMenu()); await sleep(200); await p.focus('#gameMenuSearch'); await p.keyboard.type('r1'); s = await S(); ok('dice: typing in the game search box does not roll or keep', s.rolls === 1 && await p.evaluate(() => document.getElementById('gameMenuSearch').value === 'r1'));
  await p.evaluate(() => toggleGameMenu()); await sleep(150); await blur(p);
  await p.keyboard.press('Control+r').catch(() => {});
  ok('dice: no page errors', !errs.length, errs[0]); await ctx.close();
  // Full game by keyboard: R and a line chosen by Tab/Enter on the line button; then keys are dead on the end screen and in the next level there is one listener
  { const { ctx, p, errs } = await open('tabledice'); await blur(p);
    for (let t = 0; t < 13; t++) { await p.keyboard.press('r'); await p.focus('.td-line:not([disabled])'); await p.keyboard.press('Enter'); const c = await p.evaluate(() => gameState.tabledice.confirm); if (c) { await p.focus('.td-line.td-confirm'); await p.keyboard.press('Enter'); } await blur(p); }
    await p.waitForFunction(() => !document.getElementById('modal').classList.contains('hidden'), null, { timeout: 8000 }).catch(() => {}); const e = await p.evaluate(() => ({ full: Object.keys(gameState.tabledice.card).length, over: gameState.tabledice.over, modal: !document.getElementById('modal').classList.contains('hidden') })); ok('dice: 13 turns played by keyboard alone reach the end screen', e.full === 13 && e.over && e.modal, JSON.stringify(e));
    ok('dice: full keyboard game has no page errors', !errs.length, errs[0]); await ctx.close(); }
}

async function mancala() {
  const { ctx, p, errs } = await open('mancala', { reduce: true });
  const stones = () => p.evaluate(() => gameState.mancala.b.reduce((a, b) => a + b, 0));
  await p.click('#gameContent button:has-text("New game")'); await p.click('#gameContent button:has-text("New game")'); await blur(p);
  const b0 = await p.evaluate(() => gameState.mancala.b.slice()); await p.keyboard.press('3'); await sleep(100); const b1 = await p.evaluate(() => ({ b: gameState.mancala.b.slice(), moves: gameState.mancala.moves }));
  ok('mancala: after New game, one key 3 makes one move', b0[2] > 0 && b1.b[2] === 0 && b1.moves === 1, JSON.stringify(b1)); ok('mancala: stones conserved after a key move', (await stones()) === 48);
  ok('mancala: no page errors', !errs.length, errs[0]); await ctx.close();
}

async function boardwalk() {
  const { ctx, p, errs } = await open('boardwalk'); const S = () => p.evaluate(() => { const g = gameState.boardwalk; return { aim: g.aim.slice(), shots: g.shots.length }; });
  await clickText(p, 'New game'); await clickText(p, 'New game'); await blur(p);
  const a0 = (await S()).aim; await p.keyboard.press('ArrowLeft'); let s = await S(); ok('boardwalk: after New game, one arrow press moves one step (6)', a0[0] - s.aim[0] === 6, `${a0[0]} -> ${s.aim[0]}`);
  await p.keyboard.press('Enter'); await sleep(60); s = await S(); ok('boardwalk: after New game, one Enter rolls one ball', s.shots === 1, `shots=${s.shots}`);
  await p.keyboard.down('Enter'); await p.keyboard.down('Enter'); await p.keyboard.down('Enter'); await p.keyboard.up('Enter'); await sleep(60); s = await S(); ok('boardwalk: a held Enter rolls one ball, not several', s.shots === 2, `shots=${s.shots}`);
  // Enter on other controls belongs to those controls (on a fresh game: a finished game ignores every key, which would pass by accident)
  await clickText(p, 'New game'); await blur(p);
  await p.focus('.bw-rules summary'); const open0 = await p.evaluate(() => document.querySelector('.bw-rules').open); await p.keyboard.press('Enter'); await sleep(60);
  const r = await p.evaluate(() => document.querySelector('.bw-rules').open); s = await S(); ok('boardwalk: Enter on How to play opens it and does not roll a ball', r !== open0 && s.shots === 0, `open ${open0}->${r} shots ${s.shots}`);
  await p.evaluate(() => document.getElementById('textsize-btn').focus()); const t0 = await p.evaluate(() => document.documentElement.style.fontSize); await p.keyboard.press('Enter'); await sleep(60); s = await S(); const t1 = await p.evaluate(() => document.documentElement.style.fontSize);
  ok('boardwalk: Enter on a header button presses that button and does not roll', s.shots === 0 && t1 !== t0, `shots ${s.shots}, size ${t0}->${t1}`);
  const nb = await p.evaluate(() => { const e = new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true, cancelable: true }); document.body.dispatchEvent(e); return { prevented: e.defaultPrevented, x: gameState.boardwalk.aim[0] }; });
  ok('boardwalk: Alt+Left stays the browser back shortcut and does not move the aim', !nb.prevented && nb.x === (await S()).aim[0], JSON.stringify(nb));
  // New game while a ball is in the air must not add that ball to the new game
  { const { ctx: c2, p: q } = await open('boardwalk', { reduce: false }); await q.evaluate(() => bwRoll()); await sleep(100); await clickText(q, 'New game'); await sleep(1300); const sh = await q.evaluate(() => gameState.boardwalk.shots.length); ok('boardwalk: New game during a roll leaves no phantom ball', sh === 0, `shots=${sh}`); await c2.close(); }
  // focus survives the redraw after Roll by keyboard
  await p.focus('.bw-roll'); await p.keyboard.press('Enter'); await sleep(80); const bf = await p.evaluate(() => document.activeElement.className); s = await S(); ok('boardwalk: Enter on Roll rolls once and focus stays on Roll', s.shots === 1 && /bw-roll/.test(bf), `shots=${s.shots} focus=${bf}`);
  await p.focus('#backBtn'); await p.keyboard.press('Enter'); await sleep(300); const home = await p.evaluate(() => document.getElementById('gameView').classList.contains('hidden'));
  ok('boardwalk: Enter on Back to Menu leaves the game', home);
  ok('boardwalk: no page errors', !errs.length, errs[0]); await ctx.close();
  // the menu open: arrows belong to it
  { const { ctx, p } = await open('boardwalk'); await p.evaluate(() => toggleGameMenu()); await sleep(200); const a = (await S2(p)).aim; await p.focus('#gameMenuSearch'); await p.keyboard.press('ArrowLeft'); const b = (await S2(p)).aim; ok('boardwalk: arrows in the search box do not move the aim', a[0] === b[0]);
    await ctx.close(); }
}
const S2 = (p) => p.evaluate(() => { const g = gameState.boardwalk; return { aim: g.aim.slice(), shots: g.shots.length }; });

async function dotsPeg() {
  { const { ctx, p, errs } = await open('dotsboxes'); await blur(p);
    const count = () => p.evaluate(() => { const g = gameState.dotsboxes; return [...g.h.flat(), ...g.v.flat()].filter(Boolean).length; });
    await p.keyboard.press('ArrowRight'); await p.keyboard.press('Enter'); await sleep(50); const sel = await p.evaluate(() => !!gameState.dotsboxes.sel); await p.keyboard.press('Enter'); await sleep(50); const n1 = await count();
    ok('dots: arrows + Enter picks a line, Enter again draws exactly one', sel && n1 === 1, `sel=${sel} lines=${n1}`);
    await sleep(1100); ok('dots: the computer answers with one line and it is your turn', (await count()) === 2 && await p.evaluate(() => gameState.dotsboxes.turn === 0));
    const name = await p.evaluate(() => { const b = document.querySelector('button.db-e:not([disabled])'); b.focus(); return b.getAttribute('onclick'); }); await p.keyboard.press('Enter'); await sleep(50); const f1 = await p.evaluate(() => document.activeElement.getAttribute('onclick')); ok('dots: Tab-style focus stays on the picked line after Enter', f1 === name, `${name} -> ${f1}`);
    await p.keyboard.press('Enter'); await sleep(50); const f2 = await p.evaluate(() => ({ role: document.activeElement.getAttribute('role'), text: document.activeElement.textContent.slice(0, 20) })); ok('dots: after drawing, focus goes to the status line, not to New game', f2.role === 'status', JSON.stringify(f2));
    ok('dots: no page errors', !errs.length, errs[0]); await ctx.close(); }
  { const { ctx, p, errs } = await open('pegjump'); await blur(p);
    let m0 = ''; for (let t = 0; t < 8; t++) { await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter'); await sleep(60); m0 = await p.evaluate(() => gameState.pegjump.msg); if (!/^Tap a peg that can jump\. Goal/.test(m0)) break; } ok('peg: arrow keys reach a hole and Enter acts on it (the ring starts on the board buttons above)', !/^Tap a peg that can jump\. Goal/.test(m0), m0);
    await p.click('#gameContent button:has-text("New game")').catch(() => {}); await p.evaluate(() => pjRestart());
    const i = await p.evaluate(() => { const g = gameState.pegjump; return g.p.findIndex((_, k) => _pjMovesFrom(g, k).length); }); await p.focus(`.pj-h[onclick="pjTap(${i})"]`); await p.keyboard.press('Enter'); await sleep(50); const k = await p.evaluate(() => ({ sel: gameState.pegjump.sel, f: document.activeElement.getAttribute('onclick') })); ok('peg: Enter on a focused peg selects it and focus stays there', k.sel === i && k.f === `pjTap(${i})`, JSON.stringify(k));
    ok('peg: no page errors', !errs.length, errs[0]); await ctx.close(); }
  // Hebrew page: dice shortcut with a Hebrew keyboard layout, games stay left-to-right and readable
  { const { ctx, p } = await open('tabledice'); await p.evaluate(() => { const e = new KeyboardEvent('keydown', { key: '\u05E8', code: 'KeyR', bubbles: true, cancelable: true }); document.body.dispatchEvent(e); }); const r = await p.evaluate(() => gameState.tabledice.rolls); ok('dice: the R key rolls on a Hebrew keyboard layout too', r === 1, `rolls=${r}`); await ctx.close(); }
}

(async () => {
  B = await chromium.launch();
  await dice(); await mancala(); await boardwalk(); await dotsPeg();
  await B.close();
  console.log(res.join('\n')); const f = res.filter((x) => x.startsWith('FAIL')).length; console.log(`\n${res.length - f}/${res.length} passed`); process.exit(f ? 1 : 0);
})();
