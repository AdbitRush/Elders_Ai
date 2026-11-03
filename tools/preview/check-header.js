// Measures header control gaps, overlaps and label overflow at many widths, six languages, home and in-game. PW_DIR=<dir with playwright> node tools/preview/check-header.js <baseUrl> [outDir]
const path = require('path');
const { chromium } = require(path.join(path.resolve(process.env.PW_DIR || '.'), 'node_modules', 'playwright'));
const U = process.argv[2].replace(/\/$/, ''), OUT = process.argv[3];
if (OUT) require('fs').mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const measure = () => {
  const nav = document.querySelector('nav');
  const els = [...nav.querySelectorAll('button,select,a,h1,#w-brand,.w-tl')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; });
  const tops = els.filter((e) => !els.some((o) => o !== e && o.contains(e)));
  const R = tops.map((e) => ({ n: e.id || e.tagName + '.' + (e.className || '').toString().slice(0, 14), r: e.getBoundingClientRect() }));
  const out = { overlaps: [], tight: [], over: document.documentElement.scrollWidth - innerWidth, navH: Math.round(nav.getBoundingClientRect().height), clipped: [] };
  for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) {
    const a = R[i].r, b = R[j].r; const vert = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); if (vert <= 2) continue;
    const gap = Math.max(a.left, b.left) - Math.min(a.right, b.right);
    if (gap < 0) out.overlaps.push(`${R[i].n}|${R[j].n}:${gap.toFixed(1)}`); else if (gap < 4) out.tight.push(`${R[i].n}|${R[j].n}:${gap.toFixed(1)}`);
  }
  const t = nav.querySelector('#themeBtn'); if (t) { const r = t.getBoundingClientRect(); const c = [...t.children].concat([...t.childNodes].filter((x) => x.nodeType === 3 && x.textContent.trim())); const rng = document.createRange(); rng.selectNodeContents(t); const tr = rng.getBoundingClientRect(); out.theme = { w: Math.round(r.width), textW: Math.round(tr.width), overflow: Math.round(tr.right - r.right), txt: t.innerText.trim(), scroll: t.scrollWidth - t.clientWidth }; void c; }
  [...nav.querySelectorAll('button,select')].forEach((e) => { if (e.getClientRects().length && e.scrollWidth - e.clientWidth > 1 && e.tagName !== 'SELECT') out.clipped.push(e.id || e.title); });
  const ls = nav.querySelector('#langSelect'); if (ls && t && ls.getClientRects().length && t.getClientRects().length) { const a = t.getBoundingClientRect(), b = ls.getBoundingClientRect(); out.themeLang = Math.round(Math.max(a.left, b.left) - Math.min(a.right, b.right)); }
  return out;
};
(async () => {
  const b = await chromium.launch(); let bad = 0, rows = 0;
  const widths = [320, 360, 390, 430, 639, 640, 700, 768, 820, 860, 899, 900, 940, 980, 1024, 1060, 1100, 1180, 1280, 1366, 1440, 1920];
  for (const w of widths) for (const lang of ['en', 'he', 'es', 'fr', 'de', 'el']) for (const theme of (w === 1280 || w === 390) ? ['light', 'dark'] : ['light']) {
    const mob = w < 500;
    const ctx = await b.newContext({ viewport: { width: w, height: mob ? 844 : 900 }, isMobile: mob, hasTouch: mob, serviceWorkers: 'block' });
    await ctx.addInitScript(([t, l]) => { try { localStorage.setItem('gg-theme', t); localStorage.setItem('gg-lang', l); localStorage.setItem('gg_name', 'Margaret-Anne'); localStorage.setItem('gg_profile_seen', '1'); localStorage.setItem('gg-sound', 'off'); localStorage.setItem('gg_hs_sudoku', '12'); } catch (e) {} }, [theme, lang]);
    await ctx.addCookies([{ name: 'cc_cookie', value: encodeURIComponent(JSON.stringify({ categories: ['necessary'], revision: 0, data: null, consentTimestamp: new Date().toISOString(), consentId: 't', services: { necessary: [], ads: [] }, languageCode: 'en', lastConsentTimestamp: new Date().toISOString(), expirationTime: Date.now() + 864e5 })), url: U }]);
    const p = await ctx.newPage(); await p.route(/pagead2|googlesyndication|google-analytics|googletagmanager/, (r) => r.abort());
    await p.goto(`${U}/?lang=${lang}`, { waitUntil: 'load' }); await sleep(500);
    for (const view of ['home', 'game']) {
      if (view === 'game') { await p.evaluate(() => loadGame('sudoku')); await sleep(600); }
      const m = await p.evaluate(measure); rows++;
      const problem = m.overlaps.length || m.tight.length || m.over > 0 || m.clipped.length || (m.theme && m.theme.overflow > 0);
      if (problem) { bad++; console.log(`${w} ${lang} ${theme} ${view} nav=${m.navH} over=${m.over} themeLang=${m.themeLang} overlaps=${m.overlaps.join(',')} tight=${m.tight.join(',')} clip=${m.clipped.join(',')} theme=${JSON.stringify(m.theme)}`); }
      else if (lang === 'en' && (w === 1280 || w === 390)) console.log(`ok ${w} ${lang} ${theme} ${view} nav=${m.navH} themeLang=${m.themeLang} theme=${JSON.stringify(m.theme)}`);
      if (OUT && (w === 1280 || w === 390 || w === 1024) && ['en', 'de', 'he'].includes(lang) && theme === (w === 390 ? 'light' : 'dark' === theme ? 'dark' : theme)) await p.screenshot({ path: `${OUT}/hdr_${w}_${lang}_${theme}_${view}.png`, clip: { x: 0, y: 0, width: w, height: 110 } });
    }
    await ctx.close();
  }
  console.log(`\n${rows} views, ${bad} with a problem`); await b.close();
})();
