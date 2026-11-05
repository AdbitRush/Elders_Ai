// Matched Classic / Refreshed screenshots, plus how far down the page the game starts.
//   node tools/preview/shots-refresh.js <dir with node_modules/playwright> <baseUrl> <outDir> [names,comma] [widths,comma] [themes,comma]
const path = require('path'), fs = require('fs');
const { chromium } = require(path.join(path.resolve(process.argv[2]), 'node_modules', 'playwright'));
const U = process.argv[3].replace(/\/$/, ''), OUT = process.argv[4]; fs.mkdirSync(OUT, { recursive: true });
const only = process.argv[5] ? process.argv[5].split(',') : null, WS = (process.argv[6] || '1280,390').split(',').map(Number), TH = (process.argv[7] || 'light').split(',');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const VIEWS = { hub: '/?lang=en', hub_cards: '/?lang=en&cards', article: '/article-painting-by-numbers.html', articles: '/articles.html', landing: '/en/crossword/',
  felt_klondike: '/?lang=en#klondike', felt_hearts: '/?lang=en#hearts', wood_mancala: '/?lang=en#mancala', wood_backgammon: '/?lang=en#backgammon', chess: '/?lang=en#chess',
  paper_crossword: '/?lang=en#crossword', grid_sudoku: '/?lang=en#sudoku', grid_queens: '/?lang=en#queens', quiz_trivia: '/?lang=en#trivia', word_wordsearch: '/?lang=en#wordsearch', dice_hotdice: '/?lang=en#hotdice', arcade_moonland: '/?lang=en#moonland', sim_victorygarden: '/?lang=en#victorygarden', sim_wagon: '/?lang=en#wagontrail', word_telegraph: '/?lang=en#telegraph', text_lighthouse: '/?lang=en#adventure', quiz_counting: '/?lang=en#counting' };
// a few real moves first, so the picture states show: Victory Garden empty, growing, ripe and another crop
const STAGE = { sim_victorygarden: () => { const g = gameState.victorygarden; g.left = 9; vgTool('tomato'); vgBed(0); vgBed(1); vgTool('carrot'); vgBed(2); g.beds[1].age = 6; g.beds[1].water = 3; g.beds[4].crop = 'beans'; g.beds[4].age = 2; g.beds[4].weeds = 2; g.beds[5].crop = 'tomato'; g.beds[5].dead = true; NK.render('victorygarden'); } };
(async () => { const b = await chromium.launch(); const rows = [];
  for (const [name, route] of Object.entries(VIEWS)) { if (only && !only.includes(name)) continue;
    for (const w of WS) for (const th of TH) for (const look of ['classic', 'refreshed']) { const mob = w < 500;
      const ctx = await b.newContext({ viewport: { width: w, height: mob ? 844 : 800 }, isMobile: mob, hasTouch: mob, deviceScaleFactor: 1, serviceWorkers: 'block', reducedMotion: 'reduce' });
      await ctx.addInitScript(([l, t]) => { try { localStorage.setItem('gg-look', l); localStorage.setItem('gg-theme', t); localStorage.setItem('gg-lang', 'en'); localStorage.setItem('gg_name', 'Ruth'); localStorage.setItem('gg_profile_seen', '1'); } catch (e) {} }, [look, th]);
      await ctx.addCookies([{ name: 'cc_cookie', value: encodeURIComponent(JSON.stringify({ categories: ['necessary'], revision: 0, data: null, consentTimestamp: new Date().toISOString(), consentId: 'test', services: { necessary: [], ads: [] }, languageCode: 'en', lastConsentTimestamp: new Date().toISOString(), expirationTime: Date.now() + 864e5 })), url: U }]);
      const p = await ctx.newPage(); await p.goto(U + route, { waitUntil: 'load', timeout: 20000 }).catch(() => {}); await sleep(1100); if (STAGE[name]) { await p.evaluate(STAGE[name]); await sleep(200); } if (name === 'hub_cards') { await p.evaluate(() => { const c = [...document.querySelectorAll('#homeScreen .premium-card')].find((x) => x.offsetParent); window.scrollTo(0, c.getBoundingClientRect().top + scrollY - 90); }); await sleep(400); }
      const m = await p.evaluate(() => { const c0 = [...document.querySelectorAll('#homeScreen .premium-card')].find((x) => x.offsetParent); const g = document.getElementById('gameContent'), v = g && g.offsetParent ? g.getBoundingClientRect() : null, c = g && g.offsetParent && g.firstElementChild ? g.firstElementChild.getBoundingClientRect() : null;
        return { first: c0 ? Math.round(c0.getBoundingClientRect().top + scrollY) : null, top: v ? Math.round(v.top + scrollY) : null, contentH: c ? Math.round(c.height) : null, over: document.documentElement.scrollWidth - innerWidth, pageH: document.documentElement.scrollHeight }; });
      const f = `${name}-${w}-${th}-${look}.png`; await p.screenshot({ path: path.join(OUT, f) }); rows.push({ name, w, th, look, ...m, f }); await ctx.close(); } }
  fs.writeFileSync(path.join(OUT, 'metrics.json'), JSON.stringify(rows, null, 1));
  for (const r of rows.filter((x) => x.look === 'classic')) { const q = rows.find((x) => x.name === r.name && x.w === r.w && x.th === r.th && x.look === 'refreshed'); console.log(`${r.name} ${r.w} ${r.th}: game top ${r.top} -> ${q.top}; first card ${r.first} -> ${q.first}; page ${r.pageH} -> ${q.pageH}; overflow ${r.over} -> ${q.over}`); }
  await b.close(); })();
