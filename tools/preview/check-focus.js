// Keyboard focus across restart, on every game that has an NK restart button. node tools/preview/check-focus.js <baseUrl> <outFile> [ids,comma]
const path = require('path'), fs = require('fs');
const { chromium } = require(path.join('C:/Users/AdBitRush/Documents/whatsapp-deals-bot', 'node_modules', 'playwright'));
const [U, OUT, ONLY] = process.argv.slice(2); const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const lines = []; const log = (s) => { lines.push(s); fs.writeFileSync(OUT, lines.join('\n') + '\n'); }; let bad = 0, n = 0, nores = [];
const WHO = () => { const a = document.activeElement, r = document.querySelector('#gameContent > .nk'); return { k: a && a.dataset ? a.dataset.k || null : null, tag: a ? a.tagName : null, inRoot: !!(r && r.contains(a)), isRoot: a === r }; };
(async () => { const b = await chromium.launch();
  const c0 = await b.newContext({ serviceWorkers: 'block' }); const p0 = await c0.newPage(); await p0.goto(U + '/?lang=en', { waitUntil: 'load' }); const ids = ONLY ? ONLY.split(',') : await p0.evaluate(() => window.GAME_IDS); await c0.close(); log('games ' + ids.length);
  for (const id of ids) { const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' });
    await ctx.addInitScript(() => { try { localStorage.setItem('gg-lang', 'en'); localStorage.setItem('gg_name', 'Ruth'); localStorage.setItem('gg_profile_seen', '1'); } catch (e) {} });
    const p = await ctx.newPage(); p.setDefaultTimeout(5000); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    try { await p.goto(U + '/?lang=en#' + id, { waitUntil: 'load' }); await sleep(700);
      const sel = '#gameContent > .nk [data-k="restart"]'; if (!(await p.locator(sel).count())) { nores.push(id); await ctx.close(); continue; } n++;
      const fails = []; const t0 = await p.evaluate((i) => gameState[i]._nk, id);
      await p.locator(sel).first().focus(); await p.keyboard.press('Enter'); await sleep(120);
      const t1 = await p.evaluate((i) => gameState[i]._nk, id); let w = await p.evaluate(WHO);
      if (t1 === t0) fails.push('Enter no restart'); if (w.k !== 'restart') fails.push('after Enter focus ' + JSON.stringify(w));
      await p.keyboard.press('Tab'); w = await p.evaluate(WHO); if (!w.inRoot) fails.push('Tab left game ' + JSON.stringify(w));
      await p.locator(sel).first().focus(); await p.keyboard.press('Space'); await sleep(120); w = await p.evaluate(WHO); if (w.k !== 'restart') fails.push('after Space focus ' + JSON.stringify(w));
      // pointer player: the focus must NOT land on restart
      await p.waitForFunction(() => [...document.querySelectorAll('#gameContent > *')].every((e) => e.getAnimations().every((a) => a.playState !== 'running')));
      const t2 = await p.evaluate((i) => gameState[i]._nk, id); await p.locator(sel).first().click(); await sleep(120); const t3 = await p.evaluate((i) => gameState[i]._nk, id); w = await p.evaluate(WHO);
      if (t3 === t2) fails.push('click no restart'); if (w.k === 'restart') fails.push('click left focus on restart');
      // end screen, keyboard: the modal button then Tab must be inside the game
      await p.waitForFunction(() => [...document.querySelectorAll('#gameContent > *')].every((e) => e.getAnimations().every((a) => a.playState !== 'running')));
      await p.evaluate((i) => NK.finish(i, true, 'x'), id); await sleep(800);
      const up = await p.evaluate(() => !document.getElementById('modal').classList.contains('hidden'));
      if (up) { await p.locator('#nextLevelBtn').focus(); await p.keyboard.press('Enter'); await sleep(900); w = await p.evaluate(WHO); if (!w.inRoot) fails.push('after modal Enter focus ' + JSON.stringify(w)); } else fails.push('no modal');
      if (errs.length) fails.push('errors ' + errs.join(' ').slice(0, 120));
      if (fails.length) { bad++; log('FAIL ' + id + ': ' + fails.join('; ')); } else log('ok ' + id);
    } catch (e) { bad++; log('FAIL ' + id + ': threw ' + e.message.split('\n')[0]); }
    await ctx.close(); }
  log(`\n${n} games with an NK restart button, ${bad} failed; no such button: ${nores.length} (${nores.join(',')})`);
  await b.close(); process.exit(bad ? 1 : 0); })();
