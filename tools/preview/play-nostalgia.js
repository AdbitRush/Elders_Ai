// Plays the 2026-11 nostalgia batch end to end with real clicks (and some keyboard), like play-all.js.
//   node tools/preview/play-nostalgia.js <dir with node_modules/playwright, or '' for global> [baseUrl] [ids,comma] [width] [diff]
// Reads gameState only to choose moves and to check the rules (stone count, box count, score sums); every move is a
// real click or key press. Per game: rule checks, a full game to the end screen, Level 2, back to hub, reopen.
// Screenshots + JSON go to <OS temp>/brainplay-play-nostalgia.
const path = require('path'), fs = require('fs'), os = require('os');
const pwDir = process.argv[2];
const { chromium } = require(pwDir ? path.join(path.resolve(pwDir), 'node_modules', 'playwright') : 'playwright');
const U = (process.argv[3] || 'http://127.0.0.1:8931').replace(/\/$/, '');
const IDS = process.argv[4] ? process.argv[4].split(',') : ['mancala', 'dotsboxes', 'pegjump', 'tabledice', 'boardwalk'];
const W = +(process.argv[5] || 1280), DIFF = process.argv[6] || 'normal';
const OUT = path.join(os.tmpdir(), 'brainplay-play-nostalgia'); fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let b;

async function open(id) {
  const mob = W < 500;
  const ctx = await b.newContext({ viewport: { width: W, height: mob ? 844 : 900 }, isMobile: mob, hasTouch: mob, serviceWorkers: 'block' });
  await ctx.addInitScript(([d]) => { try { if (sessionStorage.getItem('x')) return; sessionStorage.setItem('x', '1'); localStorage.clear(); localStorage.setItem('gg-theme', 'light'); localStorage.setItem('gg-lang', 'en'); localStorage.setItem('gg_difficulty', d); localStorage.setItem('gg_name', 'Ruth'); localStorage.setItem('gg_profile_seen', '1'); } catch (e) {} }, [DIFF]);
  await ctx.addCookies([{ name: 'cc_cookie', value: encodeURIComponent(JSON.stringify({ categories: ['necessary'], revision: 0, data: null, consentTimestamp: new Date().toISOString(), consentId: 'test', services: { necessary: [], ads: [] }, languageCode: 'en', lastConsentTimestamp: new Date().toISOString(), expirationTime: Date.now() + 864e5 })), url: U }]);
  const p = await ctx.newPage(); p.setDefaultTimeout(5000); const errs = [];
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' || /Icon missing/.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); });
  await p.goto(U + '/?lang=en#' + id, { waitUntil: 'networkidle' }).catch(() => {});
  await sleep(1000);
  return { ctx, p, errs };
}
const G = (p, id) => p.evaluate((id) => JSON.parse(JSON.stringify(gameState[id])), id);
const modalUp = (p) => p.evaluate(() => !document.getElementById('modal').classList.contains('hidden'));
const modalText = (p) => p.evaluate(() => document.getElementById('modalTitle').innerText + ' | ' + document.getElementById('modalBody').innerText);
const msg = (p, sel) => p.locator('#gameContent [role=status]').innerText();
async function waitModal(p, ms = 9000) { const t = Date.now(); while (Date.now() - t < ms) { if (await modalUp(p)) return true; await sleep(150); } return false; }
async function after(p, id, R) {
  R.steps.push('end modal: ' + (await modalText(p)));
  await p.screenshot({ path: `${OUT}/${id}-end-${W}.png` });
  await p.click('#nextLevelBtn'); await sleep(1200);
  const lvl = await p.evaluate(() => document.getElementById('levelIndicator').innerText);
  const filled = await p.evaluate(() => document.getElementById('gameContent').children.length > 0);
  R.steps.push(`next button -> "${lvl.replace(/\s+/g, ' ')}", content ${filled ? 'rendered' : 'EMPTY'}`);
  if (!filled) R.defects.push('next game shows an empty area');
  await p.click('#backBtn').catch(() => p.evaluate(() => showHome())); await sleep(700);
  await p.evaluate((id) => document.querySelector(`.premium-card[onclick="loadGame('${id}')"]`).scrollIntoView(), id);
  await p.click(`.premium-card[onclick="loadGame('${id}')"]`); await sleep(1200);
  const ok = await p.evaluate((id) => gameState.active && gameState.currentId === id && document.getElementById('gameContent').children.length > 0, id);
  R.steps.push('back to hub + reopen from card: ' + (ok ? 'ok' : 'FAILED')); if (!ok) R.defects.push('reopen failed');
}

const PLAY = {
  async mancala(p, R) {
    const total = (await G(p, 'mancala')).b.reduce((a, c) => a + c, 0);
    // an empty pit is refused with a message (make one empty first by playing pit 1 when it is the player's turn)
    await p.keyboard.press('3'); R.steps.push('key "3" -> ' + (await msg(p)).slice(0, 80));
    let turns = 0;
    for (; turns < 200 && !(await modalUp(p)); turns++) {
      const g = await G(p, 'mancala');
      const sum = g.b.reduce((a, c) => a + c, 0); if (sum !== total) { R.defects.push(`stones not conserved: ${sum} != ${total}`); break; }
      if (g.over) break;
      if (g.turn !== 0 || g.busy) { await sleep(300); continue; }
      const empty = g.b.slice(0, 6).findIndex((v) => v === 0);
      if (empty >= 0 && !R._emptyTried) { R._emptyTried = 1; await p.click(`.mc [onclick="mcTap(${empty})"]`, { force: true });   // aria-disabled on purpose: it still answers with a message
 R.steps.push('tap empty pit -> ' + (await msg(p)).slice(0, 60)); continue; }
      // prefer a move that ends in the store, else the fullest pit
      let i = [5, 4, 3, 2, 1, 0].find((k) => g.b[k] && g.b[k] === 6 - k); if (i === undefined) i = g.b.slice(0, 6).reduce((bi, v, k, a) => (v > a[bi] ? k : bi), 0);
      await p.click(`.mc [onclick="mcTap(${i})"]`); await sleep(80);
    }
    const g = await G(p, 'mancala');
    R.steps.push(`game over after ${turns} loops: you ${g.b[6]}, computer ${g.b[13]} (sum ${g.b[6] + g.b[13]} of ${total})`);
    if (g.b[6] + g.b[13] !== total) R.defects.push('final stores do not add up');
    if (!(await waitModal(p))) return R.defects.push('no end screen');
    await after(p, 'mancala', R);
  },
  async dotsboxes(p, R) {
    const n = (await G(p, 'dotsboxes')).n;
    let k = 0;
    for (; k < 400 && !(await modalUp(p)); k++) {
      const g = await G(p, 'dotsboxes');
      if (g.over) break;
      if (g.turn !== 0) { await sleep(250); continue; }
      const free = [];
      for (let r = 0; r <= n; r++) for (let c = 0; c < n; c++) if (!g.h[r][c]) free.push(['h', r, c]);
      for (let r = 0; r < n; r++) for (let c = 0; c <= n; c++) if (!g.v[r][c]) free.push(['v', r, c]);
      if (!free.length) { await sleep(300); continue; }
      const e = free[Math.floor(Math.random() * free.length)];
      const sel = `.db [onclick="dbTap('${e[0]}',${e[1]},${e[2]})"]`;
      // locate by the line's centre: the diamond tap area is the point that matters
      await p.locator(sel).scrollIntoViewIfNeeded();   // like a person: bring the line on screen first, or a stale position lands on the sticky header
      const bx = await p.locator(sel).boundingBox();
      await p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2);
      if (k === 0) R.steps.push('first tap -> ' + (await msg(p)).slice(0, 60));
      if (k % 2) await p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2);   // second tap draws
      else await p.locator('#gameContent .gk-btn', { hasText: 'Draw line' }).click();
      await sleep(60);
    }
    const g = await G(p, 'dotsboxes');
    R.steps.push(`all lines drawn: you ${g.score[0]}, computer ${g.score[1]} (boxes ${n * n})`);
    if (g.score[0] + g.score[1] !== n * n) R.defects.push('box count wrong');
    if (!(await waitModal(p))) return R.defects.push('no end screen');
    await after(p, 'dotsboxes', R);
  },
  async pegjump(p, R) {
    // cross board: a hint, an illegal tap, then back to the triangle
    await p.locator('#gameContent .gk-btn', { hasText: 'Cross' }).click(); await sleep(100);
    await p.locator('#gameContent .gk-btn', { hasText: 'Hint' }).click(); R.steps.push('cross hint -> ' + (await msg(p)).slice(0, 90));
    await p.locator('#gameContent .gk-btn', { hasText: 'Triangle' }).click(); await sleep(100);
    await p.click('.pj [onclick="pjTap(4)"]'); R.steps.push('tap a stuck peg -> ' + (await msg(p)).slice(0, 70));
    await p.click('.pj [onclick="pjTap(3)"]'); await p.click('.pj [onclick="pjTap(5)"]'); R.steps.push('tap a non-target hole -> ' + (await msg(p)).slice(0, 70));
    await p.click('.pj [onclick="pjTap(3)"]'); await p.click('.pj [onclick="pjTap(0)"]');
    R.steps.push('jump -> ' + (await msg(p)));
    await p.locator('#gameContent .gk-btn', { hasText: 'Undo' }).click(); R.steps.push('undo -> ' + (await msg(p)));
    // follow the hints to the end (they lead to the goal when the solver finds a way)
    for (let k = 0; k < 20 && !(await modalUp(p)); k++) {
      const over = (await G(p, 'pegjump')).over; if (over) break;
      await p.locator('#gameContent .gk-btn', { hasText: 'Hint' }).click();
      const h = (await G(p, 'pegjump')).hint; if (!h) { R.defects.push('hint gave no move: ' + (await msg(p))); break; }
      await p.click(`.pj [onclick="pjTap(${h[2]})"]`); await sleep(60);
    }
    const g = await G(p, 'pegjump');
    R.steps.push(`finished with ${g.p.filter(Boolean).length} pegs (goal ${g.goal})`);
    if (!(await waitModal(p))) return R.defects.push('no end screen');
    await after(p, 'pegjump', R);
  },
  async tabledice(p, R) {
    await p.locator('.td [onclick="tdScore(\'n1\')"]').click(); R.steps.push('score before rolling -> ' + (await msg(p)).slice(0, 40));
    for (let t = 0; t < 13; t++) {
      await p.locator('#gameContent .gk-btn', { hasText: 'Roll' }).click();
      let g = await G(p, 'tabledice');
      // keep the most common number and roll twice more
      const cnt = [0, 0, 0, 0, 0, 0, 0]; g.dice.forEach((d) => cnt[d]++); const best = cnt.indexOf(Math.max(...cnt));
      for (let i = 0; i < 5; i++) if (g.dice[i] === best) await p.click(`.td [onclick="tdHold(${i})"]`);
      for (let r = 0; r < 2; r++) {
        await p.locator('#gameContent .gk-btn', { hasText: 'Roll' }).click();
        g = await G(p, 'tabledice');
        if (r === 0) for (let i = 0; i < 5; i++) if (g.dice[i] === best && !g.hold[i]) await p.click(`.td [onclick="tdHold(${i})"]`);
      }
      g = await G(p, 'tabledice');
      if (g.dice.some((d, i) => g.hold[i] && d !== best)) R.defects.push('a kept die changed');
      // the open line with the highest value now (fall back to a 0, which needs two taps)
      const pots = await p.evaluate(() => _TD_LINES.filter((L) => gameState.tabledice.card[L.k] === undefined).map((L) => [L.k, L.f(gameState.tabledice.dice)]));
      pots.sort((a, c) => c[1] - a[1]);
      const k = pots[0][0];
      await p.click(`.td [onclick="tdScore('${k}')"]`);
      if (pots[0][1] === 0) { R.steps.push(`turn ${t + 1}: zero line asks -> ` + (await msg(p)).slice(0, 50)); await p.click(`.td [onclick="tdScore('${k}')"]`); }
      await sleep(40);
    }
    const g = await G(p, 'tabledice');
    const sum = Object.values(g.card).reduce((a, c) => a + c, 0), up = ['n1', 'n2', 'n3', 'n4', 'n5', 'n6'].reduce((a, k) => a + g.card[k], 0);
    R.steps.push(`card full: lines ${Object.keys(g.card).length}, total ${sum + (up >= 63 ? 35 : 0)} (top ${up}), goal ${g.goal}`);
    if (Object.keys(g.card).length !== 13) R.defects.push('card not full');
    if (!(await waitModal(p))) return R.defects.push('no end screen');
    await after(p, 'tabledice', R);
  },
  async boardwalk(p, R) {
    const a0 = (await G(p, 'boardwalk')).aim;
    await p.keyboard.press('ArrowLeft'); await p.keyboard.press('ArrowUp');
    const a1 = (await G(p, 'boardwalk')).aim; R.steps.push(`arrow keys moved the aim ${a0} -> ${a1}`);
    if (a0[0] === a1[0] || a0[1] === a1[1]) R.defects.push('arrow keys did not move the aim');
    await p.locator('#gameContent .gk-btn', { hasText: 'Moving aim' }).click(); await sleep(400);
    const s1 = (await G(p, 'boardwalk')).aim[0]; await sleep(400); const s2 = (await G(p, 'boardwalk')).aim[0];
    R.steps.push(`moving aim on: x ${s1.toFixed(0)} -> ${s2.toFixed(0)}`); if (s1 === s2) R.defects.push('moving aim did not move');
    await p.locator('#gameContent .gk-btn', { hasText: 'Moving aim' }).click(); await sleep(300);
    for (let k = 0; k < 9; k++) {
      // correct for the lean seen so far, then place the aim by tapping the board
      const g = await G(p, 'boardwalk');
      let dx = 0, dy = 0; g.shots.forEach((s) => { dx += s.at[0] - s.aim[0]; dy += s.at[1] - s.aim[1]; });
      const n = g.shots.length || 1, tx = 150 - dx / n, ty = 128 - dy / n;
      const bx = await p.locator('.bw-svg').boundingBox();
      await p.mouse.click(bx.x + tx / 300 * bx.width, bx.y + ty / 420 * bx.height);
      if (k === 8) await p.keyboard.press('Enter'); else await p.locator('#gameContent .gk-btn', { hasText: 'Roll' }).click();
      for (let w = 0; w < 30 && (await G(p, 'boardwalk')).rolling; w++) await sleep(100);
      if (k === 0) R.steps.push('ball 1 -> ' + (await msg(p)).slice(0, 90));
    }
    const g = await G(p, 'boardwalk');
    const sum = g.shots.reduce((a, s) => a + s.pts, 0);
    R.steps.push(`9 balls: ${g.shots.map((s) => s.pts).join(',')} = ${g.score} (goal ${g.goal}, lean ${g.drift})`);
    if (sum !== g.score) R.defects.push('score does not add up');
    if (!(await waitModal(p))) return R.defects.push('no end screen');
    await after(p, 'boardwalk', R);
  },
};

(async () => {
  b = await chromium.launch();
  const report = {};
  for (const id of IDS) {
    const R = { steps: [], defects: [] };
    const { ctx, p, errs } = await open(id);
    try {
      await p.screenshot({ path: `${OUT}/${id}-start-${W}.png` });
      await PLAY[id](p, R);
    } catch (e) { R.defects.push('DRIVER/GAME ERROR: ' + e.message.split('\n')[0]); await p.screenshot({ path: `${OUT}/${id}-error-${W}.png` }).catch(() => {}); }
    R.errors = [...new Set(errs)];
    delete R._emptyTried;
    report[id] = R;
    console.log('\n## ' + id + ` @${W} ${DIFF}` + (R.defects.length || R.errors.length ? '  [ISSUES]' : '  [OK]'));
    R.steps.forEach((s) => console.log('  - ' + s)); R.defects.forEach((s) => console.log('  ! ' + s)); R.errors.forEach((s) => console.log('  E ' + s));
    await ctx.close();
  }
  fs.writeFileSync(`${OUT}/play-${W}-${DIFF}.json`, JSON.stringify(report, null, 1));
  await b.close();
})();
