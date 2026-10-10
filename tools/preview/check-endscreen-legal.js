// Targeted checks for the 2026-10-10 (b) batch: honest end screen, Word Search / Memory fixes, Hebrew content removals,
// the corrected privacy/about wording, Cookie settings on both pages, footers without an "ads already run" claim.
//   node tools/preview/check-endscreen-legal.js <dir with node_modules/playwright> [baseUrl]
const path = require('path'), os = require('os');
const { chromium } = require(path.join(path.resolve(process.argv[2]), 'node_modules', 'playwright'));
const U = (process.argv[3] || 'https://games-preview.178-105-148-72.sslip.io').replace(/\/$/, '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = []; const ok = (n, p, i) => out.push((p ? 'PASS ' : 'FAIL ') + n + (i ? '  - ' + i : ''));
let b;
async function open(url, { lang = 'en', w = 1280 } = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, serviceWorkers: 'block' });
  await ctx.addCookies([{ name: 'cc_cookie', value: encodeURIComponent(JSON.stringify({ categories: ['necessary'], revision: 0, data: null, consentTimestamp: new Date().toISOString(), consentId: 't', services: { necessary: [], ads: [] }, languageCode: 'en', lastConsentTimestamp: new Date().toISOString(), expirationTime: Date.now() + 864e5 })), url: U }]);
  await ctx.addInitScript(([l]) => { try { if (sessionStorage.getItem('x')) return; sessionStorage.setItem('x', '1'); localStorage.clear(); localStorage.setItem('gg-lang', l); localStorage.setItem('gg-theme', 'light'); localStorage.setItem('gg_profile_seen', '1'); localStorage.setItem('gg_name', 'Ruth'); } catch (e) {} }, [lang]);
  // the banner library hides itself from automated browsers (hideFromBots); mask the flag so its UI is really built
  await ctx.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(U + url, { waitUntil: 'networkidle' }); await sleep(1200);
  return { ctx, p, errs };
}
const modal = (p) => p.evaluate(() => ({ up: !document.getElementById('modal').classList.contains('hidden'), title: document.getElementById('modalTitle').innerText,
  body: document.getElementById('modalBody').innerText, btn: document.getElementById('nextLevelBtn').innerText.trim(), confetti: document.querySelectorAll('.confetti-piece,[class*=confetti]').length,
  levels: localStorage.getItem('gg_levels') }));
async function answerAll(p, fn, right) {
  for (let i = 0; i < 20; i++) { const m = await modal(p); if (m.up) return m;
    await p.evaluate(([fn, right]) => { const bs = [...document.querySelectorAll('#gameContent [onclick^="' + fn + '"]')]; const x = bs.find((e) => { const m = e.getAttribute('onclick').match(/\((\w+),(\w+)\)/); return right ? m[1] === m[2] : m[1] !== m[2]; }); if (x) x.click(); }, [fn, right]);
    await sleep(1100); }
  return modal(p);
}
(async () => {
  b = await chromium.launch();
  // 3. failing session: no win, no confetti, no level-up, Play again at the same level
  { const { ctx, p, errs } = await open('/?lang=en#trivia');
    const m = await answerAll(p, 'answerTrivia', false);
    ok('3 trivia 0/10: gentle message, no "Well Done!"', m.up && /Nice try/.test(m.title) && !/Well Done/i.test(m.title), m.title + ' | ' + m.body);
    ok('3 trivia 0/10: no confetti, Play again, level not saved', m.confetti === 0 && /Play again/.test(m.btn) && !(m.levels || '').includes('trivia'), 'confetti ' + m.confetti + ' | btn ' + m.btn + ' | levels ' + m.levels);
    await p.click('#nextLevelBtn'); await sleep(1200);
    ok('3 Play again restarts trivia at level 1', await p.evaluate(() => gameState.currentId === 'trivia' && gameState.trivia.level === 1 && gameState.trivia.current === 0));
    ok('3 no JS errors (fail path)', !errs.length, errs.join(' | ')); await ctx.close(); }
  { const { ctx, p } = await open('/?lang=en#truefalse');
    const m = await answerAll(p, 'answerTF', true);
    ok('3 true/false 8/8: "Well Done!" + Level 2, level saved', m.up && /Well Done/.test(m.title) && /Level 2/.test(m.btn) && (m.levels || '').includes('truefalse'), m.title + ' | ' + m.body + ' | ' + m.btn); await ctx.close(); }
  { const { ctx, p } = await open('/?lang=he#math', { lang: 'he' });
    // 5 right of 10 = 50% -> fail (math only advances on a right answer, so force the score)
    await p.evaluate(() => { const g = gameState.math; g._sessionScore = { correct: 5, total: 10 }; levelComplete(); }); await sleep(600);
    const m = await modal(p);
    ok('3 50% (5/10) is a fail, in Hebrew too', /ניסיון יפה/.test(m.title) && /לשחק שוב/.test(m.btn), m.title + ' | ' + m.btn); await ctx.close(); }
  { const { ctx, p } = await open('/?lang=en#math');
    await p.evaluate(() => { const g = gameState.math; g._sessionScore = { correct: 6, total: 10 }; levelComplete(); }); await sleep(600);
    const m = await modal(p); ok('3 60% (6/10) passes', /Well Done/.test(m.title) && /Level 2/.test(m.btn), m.title); await ctx.close(); }
  { const { ctx, p } = await open('/?lang=en#blocks');
    for (let i = 0; i < 40; i++) { if ((await modal(p)).up) break; await p.keyboard.press('Space'); await sleep(150); }
    await sleep(2200); const m = await modal(p);
    ok('3 Falling Blocks, 0 lines: "Nice try" + Play again, no level-up', m.up && /Nice try/.test(m.title) && /Play again/.test(m.btn) && /0 lines/.test(m.body), m.title + ' | ' + m.body); await ctx.close(); }
  { const { ctx, p } = await open('/?lang=en#lifesim');
    await p.locator('#gameContent button').first().click(); await sleep(400);
    for (let i = 0; i < 8; i++) { if ((await modal(p)).up) break; await p.evaluate(() => { const x = document.querySelector('#gameContent [onclick="_lsChoose(0)"]') || document.querySelector('#gameContent [onclick="_lsChoose(1)"]'); if (x) x.click(); }); await sleep(1400); }
    const m = await modal(p); ok('3 Time Journey, 0 memories: "Nice try", no level-up', m.up && /Nice try/.test(m.title) && /Play again/.test(m.btn), m.title + ' | ' + m.body); await ctx.close(); }
  // 4. word search: a word through an already-found letter can be completed
  { const { ctx, p } = await open('/?lang=en#wordsearch');
    const r = await p.evaluate(() => { const cells = [...document.querySelectorAll('.ws-cell')]; const c = cells[0]; c.classList.add('found');
      // a found cell must still take part in a new selection
      clickWsCell(c, c.innerText.trim(), +c.dataset.r, +c.dataset.c); return c.classList.contains('selected'); });
    ok('4 word search: a found letter can start / join a new word', r); await ctx.close(); }
  // 5. memory: a matched card shows its picture (face element faces the viewer, card opaque)
  { const { ctx, p } = await open('/?lang=en#memory');
    const v = await p.evaluate(() => [...document.querySelectorAll('.card-inner')].map((c) => c.dataset.val)); const j = v.findIndex((x, k) => k > 0 && x === v[0]);
    await p.click('#m-card-0'); await p.click('#m-card-' + j); await sleep(1400);
    const r = await p.evaluate(() => { const e = document.getElementById('m-card-0'); return { cls: e.className, op: getComputedStyle(e).opacity }; });
    await p.locator('#m-card-0').screenshot({ path: path.join(os.tmpdir(), 'brainplay-memory-matched.png') });
    ok('5 memory: matched card stays opaque (3D flip intact)', /matched/.test(r.cls) && r.op === '1', JSON.stringify(r)); await ctx.close(); }
  // A. Hebrew content
  { const { ctx, p } = await open('/?lang=he', { lang: 'he' });
    const r = await p.evaluate(() => ({ q: i18nData.he.trivia_pool.some((x) => /חל שבת/.test(x.q)), w: i18nData.he.ws_pool.includes('שבת'), badge: /שישי שמח/.test(document.documentElement.innerHTML + JSON.stringify(typeof Achievements !== 'undefined' ? Achievements : '')) }));
    ok('A trivia question about Shabbat removed', !r.q); ok('A word "שבת" removed from ws_pool', !r.w); await ctx.close(); }
  // C/D. pages
  for (const [url, checks] of [['/privacy.html', ['We plan to support it with advertising through Google AdSense', 'Advertising through Google AdSense:', 'adssettings.google.com', 'does not send it to our servers', 'withdrawal does not affect processing', 'including your IP address, to the server hosting BrainPlay', 'If you email us, we receive your email address', 'remain in your browser until you clear', 'on this page or in the games homepage footer']],
                               ['/about.html', ['We plan to support the site with Google AdSense advertising', 'Play at your own pace', 'not medical care', 'We do not claim that these games prevent']]]) {
    const { ctx, p, errs } = await open(url);
    const t = await p.evaluate(() => document.body.innerText + ' ' + document.body.innerHTML);
    const miss = checks.filter((c) => !t.includes(c));
    ok('C/D ' + url + ': all new wording present', !miss.length, miss.join(' / '));
    const bad = ['never during a game', 'not set up to keep a log', 'small ads from Google are shown', 'No rush', 'No game, here or anywhere else'].filter((x) => t.includes(x));
    ok('C/D ' + url + ': old wording gone', !bad.length, bad.join(' / '));
    ok('C/D ' + url + ': exactly one contact placeholder', (t.match(/\[CONTACT EMAIL/g) || []).length === 2 /* innerText + innerHTML */, String((t.match(/\[CONTACT EMAIL/g) || []).length / 2));
    // Cookie settings opens the preferences dialog
    await p.evaluate(() => { const a = [...document.querySelectorAll('a')].filter((x) => x.textContent.trim() === 'Cookie settings').pop(); a.click(); }); await sleep(600);
    ok('C/D ' + url + ': Cookie settings opens the dialog', await p.evaluate(() => document.documentElement.classList.contains('show--preferences')));
    ok('C/D ' + url + ': no JS errors', !errs.length, errs.join(' | '));
    await ctx.close(); }
  // hub footer in 6 languages: no "ads already pay" claim
  { const { ctx, p } = await open('/?lang=en');
    const f = await p.evaluate(() => Object.keys(i18nData).map((l) => l + ': ' + i18nData[l].footer_desc));
    ok('footer: no language says ads already run', f.every((x) => !/ads between games|ממומן|anuncios entre|publicités entre|Anzeigen zwischen|διαφημίσεις ανάμεσα/.test(x)), f.join(' | ')); await ctx.close(); }
  await b.close();
  console.log(out.join('\n')); console.log(out.filter((x) => x.startsWith('PASS')).length + '/' + out.length + ' passed');
})();
