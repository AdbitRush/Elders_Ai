// BrainPlay preview e2e suite (branch preview/warm-redesign).
//   node tools/preview/e2e-suite.js <dir with node_modules/playwright> [baseUrl]
// Checks: 28 games load (390 light + 1440 dark), 6 languages, nothing interactive lost vs the live baseline
// (tools/preview/baseline-inventory.json), ads never mid-game, the light/dark toggle, every game page linked from
// the hub, text contrast, the review tool. It removes its own TEST notes at the end.
const path = require('path'), fs = require('fs');
const { chromium } = require(path.join(path.resolve(process.argv[2]), 'node_modules', 'playwright'));
const U = (process.argv[3] || 'https://games-preview.178-105-148-72.sslip.io').replace(/\/$/, '');
const BASE = JSON.parse(fs.readFileSync(path.join(__dirname, 'baseline-inventory.json'), 'utf8'));
const INTERACTIVE = 'a[href],button,select,input,textarea,[onclick],[role=button],[tabindex]:not([tabindex="-1"]),canvas';
const res = []; const ok = (n, p, i) => res.push((p ? 'PASS ' : 'FAIL ') + n + (i ? '  — ' + i : ''));
let b;
async function page(w, url, { theme = 'dark', lang = 'en', init } = {}) {
  const mob = w < 500;
  const ctx = await b.newContext({ viewport: { width: w, height: mob ? 844 : 900 }, isMobile: mob, hasTouch: mob, serviceWorkers: 'block' });
  // first load only (a reload must keep what the page itself stored)
  await ctx.addInitScript(([t, l]) => { try { if (sessionStorage.getItem('e2e-init')) return; sessionStorage.setItem('e2e-init', '1');
    localStorage.setItem('gg-theme', t); localStorage.setItem('gg-lang', l);
    localStorage.setItem('gg_name', 'Ruth'); localStorage.setItem('gg_avatar', '🌻'); localStorage.setItem('gg_profile_seen', '1'); } catch (e) {} }, [theme, lang]);
  if (init) await ctx.addInitScript(init);
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.route(/pagead2|googlesyndication|google-analytics|googletagmanager/, (r) => r.abort());
  await p.goto(U + url, { waitUntil: 'networkidle' }).catch(() => {});
  await p.waitForTimeout(1200);
  return { ctx, p, errs };
}
const inv = (p, scope) => p.evaluate(([sel, scope]) => {
  const root = scope ? document.querySelector(scope) : document;
  if (!root) return [];
  return [...root.querySelectorAll(sel)].filter((e) => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden')
    .map((e) => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.getAttribute('onclick') ? '[onclick]' : '') + ' ' + (e.getAttribute('aria-label') || e.title || e.textContent || e.value || '').trim().replace(/\s+/g, ' ').slice(0, 40));
}, [INTERACTIVE, scope]);
// nothing lost: every baseline element with an id is still there; every id-less kind is at least as numerous
function lost(before, after) {
  // numbered ids (sol-card-10, m-card-3) change with every deal: they are counted by kind, like id-less elements
  const head = (k) => k.split(' ')[0].replace(/(#[a-z-]*?)-?\d+(?=\[|$)/i, '$1-N');
  const named = (h) => h.includes('#') && !h.includes('-N');
  const ids = before.map(head).filter(named), have = new Set(after.map(head));
  const missingIds = ids.filter((h) => !have.has(h));
  const count = (list) => list.map(head).filter((h) => !named(h)).reduce((m, h) => (m[h] = (m[h] || 0) + 1, m), {});
  const cb = count(before), ca = count(after);
  // a numbered kind (cards of a random deal: Solitaire shows 10-12 on the live site too) only has to be present
  const fewer = Object.keys(cb).filter((h) => (ca[h] || 0) < (h.includes('-N') ? 1 : cb[h])).map((h) => h + ' ' + (ca[h] || 0) + '/' + cb[h]);
  return missingIds.concat(fewer);
}
function lum(c) { const m = c.match(/[\d.]+/g).map(Number); const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]); }
const contrastIn = (p, sels) => p.evaluate((sels) => sels.map((s) => {
  const e = document.querySelector(s); if (!e || !e.getClientRects().length) return [s, null];
  const fg = getComputedStyle(e).color;
  let n = e, bg = null;
  while (n && n.nodeType === 1) { const cs = getComputedStyle(n); const c = cs.backgroundColor; const img = cs.backgroundImage;
    const a = /rgba/.test(c) ? Number(c.match(/[\d.]+/g)[3]) : 1;   // see-through backgrounds: keep walking up
    if (c && c !== 'transparent' && a >= 0.6) { bg = c; break; } if (img && img !== 'none') { bg = 'image'; break; } n = n.parentElement; }
  return [s, fg, bg];
}), sels);

(async () => {
  b = await chromium.launch();
  const games = JSON.parse(JSON.stringify(Object.keys(BASE).filter((k) => k.startsWith('game:')).map((k) => k.slice(5))));
  // 1. every game, phone light + desktop dark: loads, has content, no errors, no sideways scroll, nothing lost
  for (const g of games) for (const [w, theme] of [[390, 'light'], [1440, 'dark']]) {
    const { ctx, p, errs } = await page(w, '/#' + g, { theme });
    const r = await p.evaluate(() => ({ kids: document.getElementById('gameContent').children.length, inGame: document.documentElement.classList.contains('in-game'),
      game: document.documentElement.getAttribute('data-game'), over: document.documentElement.scrollWidth - innerWidth,
      photo: getComputedStyle(document.querySelector('#gameView > div > div:first-child')).backgroundImage.includes('images/cards/') }));
    let miss = [];
    if (w === 390) miss = lost(BASE['game:' + g] || [], await inv(p, '#gameView'));
    ok(`1 ${g} @${w} ${theme}: loads, photo header, nothing lost`, !errs.length && r.kids > 0 && r.inGame && r.game === g && r.over <= 0 && r.photo && !miss.length,
      (errs[0] || '') + ' ' + JSON.stringify(r) + (miss.length ? ' LOST ' + miss.join(', ') : ''));
    await ctx.close();
  }
  // 2. languages
  for (const lang of ['he', 'en', 'es', 'fr', 'de', 'el']) {
    const { ctx, p, errs } = await page(390, '/', { lang });
    const r = await p.evaluate(() => ({ dir: document.documentElement.dir, lang: document.documentElement.lang, links: document.querySelectorAll('#all-games .ag-page').length,
      href: (document.querySelector('#all-games .ag-page') || {}).getAttribute && document.querySelector('#all-games .ag-page').getAttribute('href'),
      label: document.querySelector('#themeBtn .w-tl') && document.querySelector('#themeBtn .w-tl').textContent }));
    ok(`2 hub in ${lang}: renders, list follows the language`, !errs.length && r.lang === lang && (lang === 'he') === (r.dir === 'rtl') && r.links === 28 && r.href.startsWith(lang + '/') && r.label,
      JSON.stringify(r) + (errs[0] ? ' JS:' + errs[0] : ''));
    await ctx.close();
  }
  // 3. hub: nothing lost (phone and desktop), every game page linked and reachable
  for (const [w, key] of [[390, 'hub'], [1440, 'hub_desktop']]) {
    const { ctx, p } = await page(w, '/');
    const miss = lost(BASE[key], await inv(p));
    ok(`3 hub @${w}: every control of the live hub is still there`, !miss.length, miss.join(', ') || BASE[key].length + ' baseline controls');
    await ctx.close();
  }
  {
    const { ctx, p } = await page(1440, '/');
    const links = await p.evaluate(() => ({ list: [...document.querySelectorAll('#all-games .ag-page')].map((a) => a.getAttribute('href')),
      cards: [...document.querySelectorAll('#homeScreen a.w-page')].map((a) => a.getAttribute('href')) }));
    ok('3 all 28 games linked from the hub list and from their cards', links.list.length === 28 && links.cards.length === 28 && new Set(links.list).size === 28, links.list.length + ' / ' + links.cards.length);
    const codes = await p.evaluate((hrefs) => Promise.all(hrefs.map((h) => fetch(h).then((r) => r.status))), links.list);
    ok('3 every linked game page answers 200', codes.every((c) => c === 200), codes.filter((c) => c !== 200).length + ' not 200');
    await p.goto(U + '/en/klondike/', { waitUntil: 'networkidle' });
    const back = await p.evaluate(() => [...document.querySelectorAll('a')].map((a) => a.getAttribute('href')));
    ok('3 a game page links back to the hub and to play', back.includes('../../') && back.some((h) => /#klondike$/.test(h)), back.slice(0, 3).join(' '));
    await ctx.close();
  }
  // 4. ads: the existing ticker on the hub and between games, never during play
  for (const w of [390, 1440]) {
    const { ctx, p } = await page(w, '/');
    const vis = () => p.evaluate(() => { const a = document.getElementById('adBar'); return !!a && getComputedStyle(a).display !== 'none' && !a.classList.contains('closed'); });
    const hub = await vis();
    await p.evaluate(() => loadGame('trivia')); await p.waitForTimeout(1500);
    const playing = await vis();
    await p.evaluate(() => levelComplete()); await p.waitForTimeout(600);
    const between = await vis();
    ok(`4 @${w} ad ticker: hub yes, while playing no, between games yes`, hub && !playing && between, JSON.stringify({ hub, playing, between }));
    await ctx.close();
  }
  // 5. light / dark toggle: visible, labelled, works, remembered
  for (const w of [390, 1440]) {
    const { ctx, p, errs } = await page(w, '/', { theme: 'dark' });
    const r1 = await p.evaluate(() => { const b = document.getElementById('themeBtn').getBoundingClientRect(); return { inView: b.top >= 0 && b.bottom <= innerHeight && b.left >= 0 && b.right <= innerWidth, h: Math.round(b.height), label: document.querySelector('#themeBtn .w-tl').textContent }; });
    await p.click('#themeBtn'); await p.waitForTimeout(300);
    const t = await p.evaluate(() => [document.documentElement.getAttribute('data-theme'), localStorage.getItem('gg-theme'), document.querySelector('#themeBtn .w-tl').textContent]);
    await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(800);
    const kept = await p.evaluate(() => document.documentElement.getAttribute('data-theme'));
    ok(`5 @${w} theme toggle: on screen, ≥48px, labelled, switches and is remembered`, r1.inView && r1.h >= 48 && r1.label === 'Light' && t[0] === 'light' && t[1] === 'light' && t[2] === 'Dark' && kept === 'light' && !errs.length,
      JSON.stringify(r1) + ' ' + JSON.stringify(t) + ' kept=' + kept);
    await ctx.close();
  }
  // 6. contrast of the main text, both themes
  for (const theme of ['light', 'dark']) {
    const { ctx, p } = await page(390, '/', { theme });
    const hub = await contrastIn(p, ['#homeScreen .premium-card h3', '#homeScreen .premium-card p', '#greetingText', '#all-games .ag-page', 'nav #themeBtn', 'footer > div']);
    await p.evaluate(() => loadGame('trivia')); await p.waitForTimeout(1500);
    const game = await contrastIn(p, ['#gameContent button.border-gray-200', '#gameContent .text-xl', '#gameInstructions']);
    const rows = hub.concat(game).map(([s, fg, bg]) => [s, fg && bg && bg !== 'image' ? ((Math.max(lum(fg), lum(bg)) + 0.05) / (Math.min(lum(fg), lum(bg)) + 0.05)) : (bg === 'image' ? 99 : 0)]);
    const low = rows.filter(([, c]) => c < 7).map(([s, c]) => s + ' ' + c.toFixed(1));
    ok(`6 ${theme}: main text contrast ≥ 7:1 (AAA)`, !low.length, low.join(' | ') || rows.map(([s, c]) => c === 99 ? 'photo' : c.toFixed(1)).join(','));
    await ctx.close();
  }
  // 7. review tool
  {
    const { ctx, p, errs } = await page(1440, '/');
    ok('7 review toolbar present', await p.locator('.afr-bar').isVisible());
    const a0 = await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--w-accent').trim());
    await p.click('.afr-bar .afr-light >> nth=0'); await p.click('.afr-menu .afr-opt[data-id="garden"]'); await p.waitForTimeout(200);
    const a1 = await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--w-accent').trim());
    ok('7 palette switch repaints', a0 !== a1 && a1 === '#7fd18b', a0 + ' -> ' + a1);
    await p.click('.afr-bar .afr-btn:has-text("Notes")'); await p.waitForTimeout(400);
    ok('7 notes drawer has 10 fields', (await p.locator('.afr-sec textarea').count()) === 10);
    const text = 'TEST note from the BrainPlay deploy check (' + new Date().toISOString() + ') - safe to ignore';
    await p.locator('.afr-sec textarea').nth(9).fill(text); await p.locator('.afr-save').nth(9).click();
    await p.waitForFunction(() => /Saved/.test(document.querySelectorAll('.afr-st')[9].textContent), null, { timeout: 8000 }).catch(() => {});
    const j = await p.evaluate(() => fetch('/__review/notes').then((r) => r.json()));
    ok('7 a note is saved on the VPS', j.notes.general && j.notes.general.text === text);
    const del = await p.evaluate(() => fetch('/__review/notes/test', { method: 'DELETE' }).then((r) => r.json()));
    ok('7 the suite removes its own TEST notes', del.ok && del.removed >= 1, JSON.stringify(del));
    ok('7 no JS errors', !errs.length, errs.join(' | '));
    await ctx.close();
  }
  await b.close();
  console.log(res.join('\n'));
  console.log(`\n${res.filter((r) => r.startsWith('PASS')).length}/${res.length} passed`);
})();
