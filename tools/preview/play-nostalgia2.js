// Plays the nostalgia batch-2 games (NK kit) end to end with real clicks and checks the batch-1 review risks.
//   node tools/preview/play-nostalgia2.js <dir with node_modules/playwright, or ''> [baseUrl] [ids,comma] [width] [diff]
// Per game:
//   play  - a full game to the end screen with real clicks / keys (gameState is read only to choose moves and to
//           check the rules), then Next, Back to hub, reopen from the card.
//   kit   - (1) restart x3 adds no keydown listener; (2) a held (repeat) Enter on a focused game button does nothing;
//           (3) Enter on the focused header "Back" button still works; (4) Ctrl+R / Ctrl+L are not blocked;
//           (5) focus survives a redraw; (6) a finish from an old session never opens the end screen after a restart;
//           (7) a game's letter shortcut works with a Hebrew key value (e.code match), when the game has one.
// Output: <OS temp>/brainplay-play-nostalgia2/ (screenshots + JSON).
const path = require('path'), fs = require('fs'), os = require('os');
const pwDir = process.argv[2];
const { chromium } = require(pwDir ? path.join(path.resolve(pwDir), 'node_modules', 'playwright') : 'playwright');
const U = (process.argv[3] || 'http://127.0.0.1:8931').replace(/\/$/, '');
const ALL = Object.keys(require('./play-nostalgia2-drivers.js'));
const IDS = process.argv[4] ? process.argv[4].split(',') : ALL;
const W = +(process.argv[5] || 1280), DIFF = process.argv[6] || 'normal';
const OUT = path.join(os.tmpdir(), 'brainplay-play-nostalgia2'); fs.mkdirSync(OUT, { recursive: true });
const DRV = require('./play-nostalgia2-drivers.js');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let b;

async function open(id, o = {}) {
  const mob = W < 500;
  const ctx = await b.newContext({ viewport: { width: W, height: mob ? 844 : 900 }, isMobile: mob, hasTouch: mob, serviceWorkers: 'block' });
  await ctx.addInitScript(([d]) => {
    // count keydown listeners added anywhere (restart must not add more)
    window.__kd = 0; const add = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (t, f, o) { if (t === 'keydown') window.__kd++; return add.call(this, t, f, o); };
    try { if (sessionStorage.getItem('x')) return; sessionStorage.setItem('x', '1'); localStorage.clear(); localStorage.setItem('gg-theme', 'light'); localStorage.setItem('gg-lang', 'en'); localStorage.setItem('gg_difficulty', d); localStorage.setItem('gg_name', 'Ruth'); localStorage.setItem('gg_profile_seen', '1'); } catch (e) {}
  }, [DIFF]);
  await ctx.addCookies([{ name: 'cc_cookie', value: encodeURIComponent(JSON.stringify({ categories: ['necessary'], revision: 0, data: null, consentTimestamp: new Date().toISOString(), consentId: 'test', services: { necessary: [], ads: [] }, languageCode: 'en', lastConsentTimestamp: new Date().toISOString(), expirationTime: Date.now() + 864e5 })), url: U }]);
  const p = await ctx.newPage(); p.setDefaultTimeout(6000); const errs = [];
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' || /Icon missing/.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); });
  await p.goto(U + '/?lang=en#' + id, { waitUntil: 'networkidle' }).catch(() => {});
  await sleep(900);
  return { ctx, p, errs };
}
const modalUp = (p) => p.evaluate(() => !document.getElementById('modal').classList.contains('hidden'));
const modalText = (p) => p.evaluate(() => document.getElementById('modalTitle').innerText + ' | ' + document.getElementById('modalBody').innerText);
async function waitModal(p, ms = 12000) { const t = Date.now(); while (Date.now() - t < ms) { if (await modalUp(p)) return true; await sleep(150); } return false; }
const H = { sleep, modalUp, waitModal, G: (p, id) => p.evaluate((id) => JSON.parse(JSON.stringify(gameState[id], (k, v) => (v instanceof Set ? [...v] : v))), id),
  msg: (p) => p.locator('#gameContent .nk-msg').innerText().catch(() => ''),
  click: async (p, sel) => { const l = p.locator('#gameContent ' + sel).first(); await l.evaluate((e) => e.scrollIntoView({ block: 'center' })); await l.click(); await sleep(40); },
  btn: async (p, text) => { const l = p.locator('#gameContent .gk-btn', { hasText: text }).first(); await l.evaluate((e) => e.scrollIntoView({ block: 'center' })); await l.click(); await sleep(40); } };

async function kitChecks(p, id, R) {
  const D = DRV[id];
  // (1) restart x3: no new keydown listeners
  const k0 = await p.evaluate(() => window.__kd);
  for (let i = 0; i < 3; i++) { await p.locator(`#gameContent [data-k="${D.restartK || 'restart'}"]`).first().click(); await sleep(120); }
  const k1 = await p.evaluate(() => window.__kd);
  R.steps.push(`restart x3: keydown listeners ${k0} -> ${k1}`); if (k1 !== k0) R.defects.push('restart added keydown listeners');
  // (2) held Enter on a focused game button does nothing
  const sel = D.focusSel || '#gameContent .nk [data-first]';
  await p.locator(sel).first().focus();
  const s0 = JSON.stringify(await H.G(p, id));
  await p.evaluate(() => document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', repeat: true, bubbles: true, cancelable: true })));
  const s1 = JSON.stringify(await H.G(p, id));
  R.steps.push('held Enter (repeat) changed state: ' + (s0 !== s1)); if (s0 !== s1) R.defects.push('a repeated key acted');
  // (5) focus survives a redraw
  const fk = await p.evaluate(() => document.activeElement && document.activeElement.dataset.k);
  await p.evaluate((id) => NK.render(id), id);
  const fk2 = await p.evaluate(() => document.activeElement && document.activeElement.dataset.k);
  R.steps.push(`focus across redraw: ${fk} -> ${fk2}`); if (!fk || fk !== fk2) R.defects.push('focus lost on redraw');
  // (4) Ctrl+R / Ctrl+L not prevented
  const blocked = await p.evaluate(() => ['KeyR', 'KeyL', 'KeyF'].map((c) => { const e = new KeyboardEvent('keydown', { key: c.slice(3).toLowerCase(), code: c, ctrlKey: true, bubbles: true, cancelable: true }); document.activeElement.dispatchEvent(e); return e.defaultPrevented; }));
  R.steps.push('Ctrl+R/L/F prevented: ' + blocked.join(',')); if (blocked.some(Boolean)) R.defects.push('a browser shortcut was blocked');
  // (7) Hebrew key value with the same physical key
  if (D.heKey) {
    const before = JSON.stringify(await H.G(p, id));
    await p.evaluate((k) => document.body.dispatchEvent(new KeyboardEvent('keydown', { key: k.key, code: k.code, bubbles: true, cancelable: true })), D.heKey);
    await sleep(100);
    const after = JSON.stringify(await H.G(p, id));
    R.steps.push(`Hebrew key ${D.heKey.key} (${D.heKey.code}) acted: ${before !== after}`); if (before === after) R.defects.push('shortcut failed with a Hebrew key value');
    await p.locator(`#gameContent [data-k="${D.restartK || 'restart'}"]`).first().click(); await sleep(100);
  }
  // (6) stale finish: finish, then restart at once - no end screen may appear
  await p.evaluate((id) => NK.finish(id, true, 'stale'), id);
  await p.locator(`#gameContent [data-k="${D.restartK || 'restart'}"]`).first().click();
  await sleep(1400);
  const stale = await modalUp(p);
  R.steps.push('stale finish opened the end screen: ' + stale); if (stale) { R.defects.push('old session finish opened the end screen'); await p.evaluate(() => document.getElementById('modal').classList.add('hidden')); }
  // (3) Enter on the focused header Back button works (and does not act in the game)
  await p.locator('#backBtn').focus(); await p.keyboard.press('Enter'); await sleep(600);
  const home = await p.evaluate(() => !document.getElementById('homeScreen').classList.contains('hidden'));
  R.steps.push('Enter on header Back: ' + (home ? 'went to the hub' : 'DID NOTHING')); if (!home) R.defects.push('Enter on a header control did not work');
  await p.evaluate((id) => document.querySelector(`.premium-card[onclick="loadGame('${id}')"]`).scrollIntoView(), id);
  await p.click(`.premium-card[onclick="loadGame('${id}')"]`); await sleep(900);
}
async function after(p, id, R) {
  R.steps.push('end modal: ' + (await modalText(p)));
  await p.screenshot({ path: `${OUT}/${id}-end-${W}.png` });
  await p.click('#nextLevelBtn'); await sleep(1000);
  const lvl = await p.evaluate(() => document.getElementById('levelIndicator').innerText.replace(/\s+/g, ' '));
  const filled = await p.evaluate(() => !!document.querySelector('#gameContent > .nk') && document.querySelector('#gameContent > .nk').children.length > 0);
  R.steps.push(`next -> "${lvl}", ${filled ? 'rendered' : 'EMPTY'}`); if (!filled) R.defects.push('next game empty');
  await p.click('#backBtn'); await sleep(600);
  await p.evaluate((id) => document.querySelector(`.premium-card[onclick="loadGame('${id}')"]`).scrollIntoView(), id);
  await p.click(`.premium-card[onclick="loadGame('${id}')"]`); await sleep(1000);
  const ok = await p.evaluate((id) => gameState.active && gameState.currentId === id && !!document.querySelector('#gameContent > .nk'), id);
  R.steps.push('back to hub + reopen: ' + (ok ? 'ok' : 'FAILED')); if (!ok) R.defects.push('reopen failed');
}

(async () => {
  b = await chromium.launch();
  const report = {};
  for (const id of IDS) {
    const R = { steps: [], defects: [] };
    const { ctx, p, errs } = await open(id);
    try {
      await kitChecks(p, id, R);
      await DRV[id].play(p, R, H);
      if (!(await waitModal(p))) R.defects.push('no end screen');
      else await after(p, id, R);
    } catch (e) { R.defects.push('DRIVER/GAME ERROR: ' + e.message.replace(/\x1b\[[0-9;]*m/g, '').split('\n').slice(0, 14).join(' | ').slice(0, 900)); await p.screenshot({ path: `${OUT}/${id}-error-${W}.png` }).catch(() => {}); }
    R.errors = [...new Set(errs)]; delete R._undone; delete R._miss;
    report[id] = R;
    console.log('\n## ' + id + ` @${W} ${DIFF}` + (R.defects.length || R.errors.length ? '  [ISSUES]' : '  [OK]'));
    R.steps.forEach((s) => console.log('  - ' + s)); R.defects.forEach((s) => console.log('  ! ' + s)); R.errors.forEach((s) => console.log('  E ' + s));
    await ctx.close();
  }
  fs.writeFileSync(`${OUT}/play-${W}-${DIFF}-${IDS.join('_').slice(0, 60)}.json`, JSON.stringify(report, null, 1));
  await b.close();
})();
