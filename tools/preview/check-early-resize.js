// Regression: a resize event that fires before the main inline script has run (slow stylesheets, rotation,
// scrollbar change during load) must not raise "gameState is not defined".
// Usage: node tools/preview/check-early-resize.js http://localhost:PORT   (needs playwright)
const { chromium } = require('playwright');
const url = process.argv[2] || 'http://localhost:8765';
(async () => {
  const b = await chromium.launch(); let bad = 0;
  for (const id of ['wordsearch', 'hearts', 'klondike', 'crossword', 'memory']) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    await p.route(/consent\.css|cookieconsent\.css/, async (r) => { await new Promise((x) => setTimeout(x, 700)); r.continue(); });
    await p.addInitScript(() => { const a = window.addEventListener.bind(window); window.addEventListener = function (t, f, o) { a(t, f, o); if (t === 'resize' && !window.__d) { window.__d = 1; window.dispatchEvent(new Event('resize')); } }; });
    await p.goto(url + '/?lang=en#' + id, { waitUntil: 'networkidle' }).catch(() => {});
    await p.waitForTimeout(1200);
    const ok = errs.length === 0; if (!ok) bad++;
    console.log((ok ? 'PASS ' : 'FAIL ') + id + ' early resize ' + JSON.stringify(errs)); await p.close();
  }
  await b.close(); process.exit(bad ? 1 : 0);
})();
