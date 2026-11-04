// Visual + layout sweep for the nostalgia batch-2 games: each game at 320 (dark, text A++ = 130%), 390 (light,
// A++), 390 Hebrew RTL, and 1280 (dark). Checks: no horizontal page scroll, the game root fits its card, no
// console errors, every non-cell game button at least 44px tall. Full-page screenshots for a human look.
//   node tools/preview/sweep-nostalgia2.js '' http://127.0.0.1:8931 <outDir> ids,comma
const path = require('path'), fs = require('fs');
const pwDir = process.argv[2];
const { chromium } = require(pwDir ? path.join(path.resolve(pwDir), 'node_modules', 'playwright') : 'playwright');
const U = (process.argv[3] || 'http://127.0.0.1:8931').replace(/\/$/, '');
const OUT = path.resolve(process.argv[4] || 'sweep'); fs.mkdirSync(OUT, { recursive: true });
const IDS = process.argv[5].split(',');
const VARIANTS = [[320, 'dark', 130, 'en'], [390, 'light', 130, 'en'], [390, 'light', 100, 'he'], [1280, 'dark', 100, 'en']];
(async () => {
  const b = await chromium.launch(); let bad = 0;
  for (const id of IDS) for (const [w, theme, ts, lang] of VARIANTS) {
    const mob = w < 500;
    const ctx = await b.newContext({ viewport: { width: w, height: mob ? 844 : 900 }, isMobile: mob, hasTouch: mob, serviceWorkers: 'block' });
    await ctx.addCookies([{ name: 'cc_cookie', value: encodeURIComponent(JSON.stringify({ categories: ['necessary'], revision: 0, data: null, consentTimestamp: new Date().toISOString(), consentId: 't', services: { necessary: [], ads: [] }, languageCode: 'en', lastConsentTimestamp: new Date().toISOString(), expirationTime: Date.now() + 864e5 })), url: U }]);
    await ctx.addInitScript(([t, s, l]) => { try { localStorage.setItem('gg-theme', t); localStorage.setItem('gg-textsize', String(s)); localStorage.setItem('gg-lang', l); localStorage.setItem('gg_profile_seen', '1'); localStorage.setItem('gg_name', 'Ruth'); } catch (e) {} }, [theme, ts, lang]);
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)); });
    await p.goto(`${U}/?lang=${lang}#${id}`, { waitUntil: 'networkidle' }); await p.waitForTimeout(1100);
    const r = await p.evaluate(() => {
      const root = document.querySelector('#gameContent > .nk'), card = document.getElementById('gameContent');
      const rr = root.getBoundingClientRect(), cr = card.getBoundingClientRect();
      const small = [...root.querySelectorAll('button:not(.nk-cell)')].filter((x) => { const q = x.getBoundingClientRect(); return q.width && q.height < 44; }).map((x) => (x.dataset.k || x.textContent.trim()).slice(0, 20));
      const over = [...root.querySelectorAll('*')].filter((x) => { const q = x.getBoundingClientRect(); return q.width && (q.right > cr.right + 1 || q.left < cr.left - 1); }).length;
      return { sw: document.documentElement.scrollWidth, vw: innerWidth, fits: rr.right <= cr.right + 1 && rr.left >= cr.left - 1, over, small, dir: document.documentElement.dir, ts: document.documentElement.style.fontSize };
    });
    const ok = r.sw <= r.vw && r.fits && !r.over && !r.small.length && !errs.filter((e) => !/404/.test(e)).length;
    if (!ok) bad++;
    console.log(`${ok ? 'OK ' : 'BAD'} ${id} ${w} ${theme} ${r.ts || '100%'} ${lang}${r.dir === 'rtl' ? '(rtl)' : ''}: scroll ${r.sw}/${r.vw}, fits ${r.fits}, overflow ${r.over}${r.small.length ? ', small buttons ' + r.small.join('|') : ''}${errs.length ? ', errors ' + errs.join(' / ') : ''}`);
    await p.screenshot({ path: path.join(OUT, `${id}-${w}-${theme}-${ts}-${lang}.png`), fullPage: true });
    await ctx.close();
  }
  console.log(bad ? `${bad} variant(s) with problems` : 'all variants OK');
  await b.close();
})();
