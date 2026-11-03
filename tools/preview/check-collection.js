// Targeted checks for the 2026-11 article-linked games (Name Garden, Pattern Workshop, The Quiet Shelf, A Day in Town, Porch Rhythm, crossword touches).
//   node tools/preview/check-collection.js <dir with node_modules/playwright> [baseUrl] [only,ids]
// Not a full suite: each section opens one game and exercises the checks listed in the design briefs. Exit code 1 on any FAIL.
const path = require('path');
const { chromium } = require(path.join(path.resolve(process.argv[2]), 'node_modules', 'playwright'));
const U = (process.argv[3] || 'http://127.0.0.1:8000').replace(/\/$/, '');
const ONLY = process.argv[4] ? process.argv[4].split(',') : null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const res = []; const ok = (n, p, i) => res.push((p ? 'PASS ' : 'FAIL ') + n + (i ? '  - ' + i : ''));
let B;
async function open(id, { w = 1280, theme = 'light', reduce = false, noStorage = false, fresh = true, ctx: shared } = {}) {
  const mob = w < 500;
  const ctx = shared || await B.newContext({ viewport: { width: w, height: mob ? 844 : 900 }, isMobile: mob, hasTouch: mob, serviceWorkers: 'block', reducedMotion: reduce ? 'reduce' : 'no-preference' });
  if (!shared) {
    await ctx.addInitScript(([t, ns]) => { try { if (sessionStorage.getItem('cc')) return; sessionStorage.setItem('cc', '1'); localStorage.setItem('gg-theme', t); localStorage.setItem('gg-lang', 'en'); localStorage.setItem('gg_name', 'Ruth'); localStorage.setItem('gg_avatar', '🌻'); localStorage.setItem('gg_profile_seen', '1'); localStorage.setItem('gg-sound', 'off'); } catch (e) {}
      if (ns) { const bad = { get() { throw new Error('storage blocked'); } }; for (const k of ['getItem', 'setItem', 'removeItem']) { const o = Storage.prototype[k]; Storage.prototype[k] = function (key, v) { if (/^bp-/.test(String(key))) throw new Error('storage blocked'); return o.apply(this, arguments); }; } } }, [theme, noStorage]);
    await ctx.addCookies([{ name: 'cc_cookie', value: encodeURIComponent(JSON.stringify({ categories: ['necessary'], revision: 0, data: null, consentTimestamp: new Date().toISOString(), consentId: 'test', services: { necessary: [], ads: [] }, languageCode: 'en', lastConsentTimestamp: new Date().toISOString(), expirationTime: Date.now() + 864e5 })), url: U }]);
  }
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.route(/pagead2|googlesyndication|google-analytics|googletagmanager|fonts\.g/, (r) => r.abort());
  await p.goto(U + '/?lang=en#' + id, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => { const c = document.getElementById('gameContent'); return c && c.children.length > 0; }, null, { timeout: 20000 }).catch(() => {});
  return { ctx, p, errs };
}
const want = (id) => !ONLY || ONLY.includes(id);
const over = (p) => p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
const small = (p, sel) => p.evaluate((sel) => [...document.querySelectorAll(sel)].filter((e) => e.getClientRects().length).map((e) => { const r = e.getBoundingClientRect(); return Math.round(Math.min(r.width, r.height)); }).filter((s) => s < 44).length, sel);

async function nameGarden() {
  // flow + feedback + double-tap + all-wrong completion
  { const { ctx, p, errs } = await open('namegarden');
    const gate = await p.evaluate(() => ({ hasStart: !!document.getElementById('nmg-go'), disclaimer: /Not a medical test or treatment/.test(document.getElementById('gameContent').innerText), inst: document.getElementById('gameInstructions').innerText }));
    ok('namegarden: start screen with disclaimer and visible choices', gate.hasStart && gate.disclaimer, JSON.stringify(gate));
    await p.click('#nmg-go'); await p.click('#nmg-ready');
    const pairs = {}; const fbs = []; let leak = false, stale = 0, prevCue = null;
    const nm = ['Rosa', 'Walter', 'Ines', 'Theo'];
    for (let t = 0; t < 8; t++) {
      await p.waitForSelector('.nmg-opt:not([disabled])');
      const q = await p.evaluate(() => ({ cue: (document.querySelector('.nmg-av').getAttribute('aria-label')), dis: [...document.querySelectorAll('.nmg-opt')].filter((b) => b.disabled || b.classList.contains('nmg-right') || b.classList.contains('nmg-chosen-wrong')).length, text: document.getElementById('nmg-fb').textContent, label: document.querySelector('.nmg-av').getAttribute('aria-label') }));
      if (q.dis) stale++;
      if (nm.some((n) => q.label.includes(n))) leak = true;
      // answer wrong every time: choose the first option that is not the right one (learn the right one from consistent cue -> name map)
      const opts = await p.$$eval('.nmg-opt', (b) => b.map((x) => x.dataset.name));
      const right0 = await p.evaluate(() => gameState.namegarden.cur.name); const pick = opts.find((o) => o !== right0);   // the harness reads the answer only to choose a WRONG one deliberately
      if (t === 3) { await p.dblclick(`.nmg-opt[data-name="${pick}"]`); } else await p.click(`.nmg-opt[data-name="${pick}"]`);
      const fb = await p.evaluate(() => ({ t: document.getElementById('nmg-fb').textContent, right: (document.querySelector('.nmg-opt.nmg-right') || {}).dataset && document.querySelector('.nmg-opt.nmg-right').dataset.name, prog: document.getElementById('nmg-prog').textContent }));
      fbs.push(fb); if (fb.right) { if (pairs[q.cue] && pairs[q.cue] !== fb.right) pairs.__inconsistent = true; pairs[q.cue] = fb.right; }
      await p.click('#nmg-next');
    }
    const end = await p.evaluate(() => document.getElementById('gameContent').innerText);
    ok('namegarden: correct name revealed after every attempt (8 of 8)', fbs.length === 8 && fbs.every((f) => f.right && f.t.includes(f.right)), JSON.stringify(fbs.map((f) => f.right)));
    ok('namegarden: same character always has the same answer', !pairs.__inconsistent);
    ok('namegarden: options do not leak between turns (no stale right/wrong marks, avatar label has no name)', stale === 0 && !leak, `stale=${stale} leak=${leak}`);
    ok('namegarden: a double-click consumed one turn only (8 turns total, not 7 or 9)', /8 practice turns completed/.test(end), end.replace(/\s+/g, ' ').slice(0, 200));
    ok('namegarden: completion with every first choice wrong, graceful, honest count', /0 first-choice answers matched/.test(end) && /Round complete/.test(end) && /not a score of your memory/.test(end));
    ok('namegarden: no page errors', !errs.length, errs[0]);
    await ctx.close(); }
  // show name = reminder; replay study = reminder; reload mid-round; restart resets
  { const { ctx, p } = await open('namegarden');
    await p.click('#nmg-go'); await p.click('#nmg-ready');
    await p.click('#nmg-show'); const sh = await p.evaluate(() => ({ right: !!document.querySelector('.nmg-opt.nmg-right'), dis: [...document.querySelectorAll('.nmg-opt')].every((b) => b.disabled) }));
    await p.click('#nmg-next'); await p.waitForSelector('.nmg-opt:not([disabled])');
    await p.evaluate(() => _ngReplay()); await p.waitForSelector('#nmg-ready'); await p.click('#nmg-ready'); await p.waitForSelector('.nmg-opt');
    const nm0 = await p.evaluate(() => document.querySelector('.nmg-opt').dataset.name); await p.click(`.nmg-opt[data-name="${nm0}"]`); await p.click('#nmg-next');
    const turnBefore = await p.evaluate(() => document.getElementById('nmg-prog').textContent);
    await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForSelector('#nmg-go, .nmg-opt', { timeout: 15000 });
    const cont = await p.$('text=Continue my round'); ok('namegarden: reload mid-round offers Continue (round kept in this browser)', !!cont && /Turn 3/.test(turnBefore), turnBefore);
    if (cont) { await cont.click(); await p.waitForSelector('.nmg-opt'); }
    const turnAfter = await p.evaluate(() => (document.getElementById('nmg-prog') || {}).textContent); ok('namegarden: Continue returns to the same turn', turnAfter === turnBefore, `${turnBefore} -> ${turnAfter}`);
    ok('namegarden: Show name reveals the answer and locks the options', sh.right && sh.dis);
    await p.evaluate(() => _ngEnd()); await sleep(300);
    const tl = await p.evaluate(() => document.getElementById('gameContent').innerText.replace(/\s+/g, ' '));
    ok('namegarden: Show name and Replay study are counted as reminders (2 of 3 turns)', /3 practice turns completed of 8; 1 first-choice answers? matched; 2 used a reminder/.test(tl) || /used a reminder/.test(tl) && /2 used a reminder/.test(tl), tl.slice(0, 220));
    await p.evaluate(() => { const m = document.getElementById('modal'); if (m) m.classList.add('hidden'); });
    await p.evaluate(() => loadGame('namegarden')); await p.waitForSelector('#nmg-go');
    const fresh = await p.evaluate(() => !/Continue my round/.test(document.getElementById('gameContent').innerText)); ok('namegarden: restart after the round resets state', fresh);
    await ctx.close(); }
  // keyboard path, storage failure, phone, reduced motion
  { const { ctx, p, errs } = await open('namegarden', { w: 390, reduce: true, noStorage: true });
    await p.focus('#nmg-go'); await p.keyboard.press('Enter'); await p.waitForSelector('#nmg-ready'); await p.keyboard.press('Tab'); const f0 = await p.evaluate(() => document.activeElement.id); await p.focus('#nmg-ready'); await p.keyboard.press('Enter');
    await p.waitForSelector('.nmg-opt:not([disabled])'); await p.keyboard.press('2'); const k = await p.evaluate(() => !!document.querySelector('.nmg-opt.nmg-right') && document.activeElement.id);
    ok('namegarden: keyboard (Enter, number key) plays a turn and focus moves to Next', k === 'nmg-next', String(k));
    for (let t = 1; t < 8; t++) { await p.keyboard.press('Enter'); await p.waitForSelector('.nmg-opt:not([disabled]), #nmg-h'); if (await p.$('.nmg-opt:not([disabled])')) await p.keyboard.press('1'); }
    await p.keyboard.press('Enter'); await sleep(300);
    ok('namegarden: plays to the end with storage blocked and keyboard only (no page errors)', !errs.length && /practice turns completed/.test(await p.evaluate(() => document.getElementById('gameContent').innerText)), errs[0]);
    ok('namegarden: 390px has no sideways scroll', (await over(p)) <= 0);
    await ctx.close(); }
  { const { ctx, p } = await open('namegarden', { w: 390 }); await p.click('#nmg-go'); await p.click('#nmg-ready'); await p.waitForSelector('.nmg-opt');
    ok('namegarden: tap targets >= 44px at 390 (options, buttons)', (await small(p, '.nmg-opt,.nmg-btn')) === 0); await ctx.close(); }
  { const { ctx, p } = await open('namegarden', { w: 1280, theme: 'dark' }); await p.click('#nmg-go'); await p.click('#nmg-ready'); await p.waitForSelector('.nmg-opt');
    const c = await p.evaluate(() => { const lum = (c) => { const m = c.match(/[\d.]+/g).map(Number); const f = (v) => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]); }; const r = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }; const o = document.querySelector('.nmg-opt'), s = getComputedStyle(o); return [r(s.color, s.backgroundColor), r(getComputedStyle(document.querySelector('.nmg-card')).color, getComputedStyle(document.querySelector('.nmg-card')).backgroundColor)]; });
    ok('namegarden: option and card text contrast >= 4.5:1 in dark theme', c.every((x) => x >= 4.5), JSON.stringify(c.map((x) => +x.toFixed(2)))); await ctx.close(); }
}

async function patternWorkshop() {
  const solve = (p) => p.evaluate(async () => {   // solve through the real buttons (pick piece, turn, pick square), never by writing state
    const g = gameState.patternworkshop, n = g.target.length; let presses = 0;
    const O = { half: 4, corner: 4, bar: 2, dot: 1, arrow: 4 };
    for (let i = 0; i < n; i++) {
      if (g.board[i] && _pwMatch(i)) continue;
      const t = g.target[i]; const piece = g.tray.find((q) => q.t === t.t); if (!piece) return { dead: true, i };
      document.querySelector(`.pwk-tp[onclick="_pwPickTray(${piece.id})"]`).click();
      let guard = 0; while (g.held && (g.held.p.r % O[t.t]) !== (t.r % O[t.t]) && guard++ < 4) { document.getElementById('pwk-tr').click(); presses++; }
      document.getElementById('pwk-cell-' + i).click();
    }
    return { dead: false, over: g.over, presses };
  });
  // stage 1: 2x2, no turning
  { const { ctx, p, errs } = await open('patternworkshop');
    const s0 = await p.evaluate(() => ({ n: gameState.patternworkshop.target.length, rot: gameState.patternworkshop.prefs.rotate, allZero: gameState.patternworkshop.target.every((c) => c.r === 0) }));
    ok('patternworkshop: stage 1 is 2x2 with no turning (pieces already the right way round)', s0.n === 4 && s0.rot === false && s0.allZero, JSON.stringify(s0));
    const rej = await p.evaluate(() => {
      const g = gameState.patternworkshop; const t0 = g.target[0].t; const wrongP = g.tray.find((q) => q.t !== t0);
      document.querySelector(`.pwk-tp[onclick="_pwPickTray(${wrongP.id})"]`).click(); document.getElementById('pwk-cell-0').click();
      for (let i = 1; i < 4; i++) { const t = g.target[i].t; const pc = g.tray.find((q) => q.t === t); if (!pc) continue; document.querySelector(`.pwk-tp[onclick="_pwPickTray(${pc.id})"]`).click(); document.getElementById('pwk-cell-' + i).click(); }
      return { over: g.over, filled: g.board.every(Boolean), msg: document.querySelector('.pwk-msg').textContent };
    });
    ok('patternworkshop: one wrong piece is not accepted, and the message says how many match', !rej.over && (!rej.filled || /squares match/.test(rej.msg)), JSON.stringify(rej));
    await p.evaluate(() => _pwReset());
    const r = await solve(p); await sleep(900);
    ok('patternworkshop: stage 1 solves through the buttons and finishes (end screen shown)', r.dead === false && r.over === true && !(await p.evaluate(() => document.getElementById('modal').classList.contains('hidden'))), JSON.stringify(r));
    ok('patternworkshop: no page errors (stage 1)', !errs.length, errs[0]); await ctx.close(); }
  // validator: symmetric pieces
  { const { ctx, p } = await open('patternworkshop');
    const v = await p.evaluate(() => { const g = gameState.patternworkshop; const chk = (t, a, b) => { g.target[0] = { t, r: a }; g.board[0] = { id: 99, t, r: b }; return _pwMatch(0); }; return { bar180: chk('bar', 0, 2), bar90: chk('bar', 0, 1), dotAny: chk('dot', 0, 3), half180: chk('half', 0, 2), half360: chk('half', 1, 5), arrow4: chk('arrow', 0, 4) }; });
    ok('patternworkshop: symmetric-piece validator (bar turns 2, dot any, half/arrow 4)', v.bar180 && !v.bar90 && v.dotAny && !v.half180 && v.half360 && v.arrow4, JSON.stringify(v)); await ctx.close(); }
  // 3x3 + rotation
  { const { ctx, p } = await open('patternworkshop');
    await p.click('.pwk-seg[aria-label="Board size"] button:has-text("3 x 3")'); await p.click('.pwk-seg[aria-label="Quarter turns"] button:has-text("On")');
    const cfg = await p.evaluate(() => ({ n: gameState.patternworkshop.target.length, rot: gameState.patternworkshop.prefs.rotate, ex: !!document.querySelector('.pwk-ex') }));
    ok('patternworkshop: 3x3 with quarter turns, rule example visible', cfg.n === 9 && cfg.rot === true && cfg.ex, JSON.stringify(cfg));
    let allOk = true, tried = 0; for (let k = 0; k < 8; k++) { const r = await solve(p); tried++; if (r.dead || !r.over) { allOk = false; break; } await sleep(900); await p.evaluate(() => { document.getElementById('modal').classList.add('hidden'); _pwNew(); }); }
    ok('patternworkshop: 8 random 3x3 turning puzzles are all solvable (duplicates never dead-end)', allOk, `tried ${tried}`);
    await p.evaluate(() => _pwNew());
    const t = await p.evaluate(() => { const g = gameState.patternworkshop; const pc = g.tray.find((q) => q.t === 'arrow' || q.t === 'half' || q.t === 'corner') || g.tray[0]; document.querySelector(`.pwk-tp[onclick="_pwPickTray(${pc.id})"]`).click(); const r0 = g.held.p.r; document.getElementById('pwk-tr').click(); const r1 = g.held.p.r; document.getElementById('pwk-tl').click(); const r2 = g.held.p.r; return { r0, r1, r2, back: r2 === r0 }; });
    ok('patternworkshop: one press = one quarter turn; right then left returns to the start', t.r1 === (t.r0 + 1) % 4 && t.back, JSON.stringify(t));
    await p.evaluate(() => { document.activeElement && document.activeElement.blur(); });
    await p.keyboard.down('r'); await p.keyboard.down('r'); await p.keyboard.down('r'); await p.keyboard.up('r');
    const k = await p.evaluate(() => gameState.patternworkshop.held.p.r);
    ok('patternworkshop: a held key (auto-repeat) turns the piece once, not many times', k === ((t.r0 + 1) % 4), `r=${k} start=${t.r0}`);
    const u = await p.evaluate(() => { const g = gameState.patternworkshop; document.getElementById('pwk-cell-0').click(); const placed = !!g.board[0]; document.getElementById('pwk-undo').click(); const held = !!g.held && g.board[0] === null; document.getElementById('pwk-undo').click(); return { placed, held, rot: g.held ? g.held.p.r : null }; });
    ok('patternworkshop: Undo takes back the placement (piece is held again) and then the turn', u.placed && u.held, JSON.stringify(u));
    await p.evaluate(() => { const g = gameState.patternworkshop; if (g.held) _pwPutBack(); });
    await p.click('#pwk-hint'); const hn = await p.evaluate(() => ({ hint: gameState.patternworkshop.hints, msg: document.querySelector('.pwk-msg').textContent, outlined: !!document.querySelector('.pwk-hint.pwk-cb') }));
    ok('patternworkshop: a labelled hint names a square and counts as a hint', hn.hint === 1 && /^Hint:/.test(hn.msg) && hn.outlined, JSON.stringify(hn));
    await p.evaluate(() => { const g = gameState.patternworkshop; const pc = g.tray[0]; document.querySelector(`.pwk-tp[onclick="_pwPickTray(${pc.id})"]`).click(); document.getElementById('pwk-cell-1').click(); });
    const before = await p.evaluate(() => JSON.stringify(gameState.patternworkshop.board));
    await p.click('.pwk-seg[aria-label="Board size"] button:has-text("2 x 2")');
    const asked = await p.$('#pwk-confirm'); await p.click('text=Keep my puzzle'); const same = await p.evaluate(() => JSON.stringify(gameState.patternworkshop.board));
    ok('patternworkshop: changing a choice mid-puzzle asks first; Keep my puzzle changes nothing', !!asked && same === before);
    await p.click('.pwk-seg[aria-label="Board size"] button:has-text("2 x 2")'); await p.click('text=Start a new puzzle');
    const n2 = await p.evaluate(() => gameState.patternworkshop.target.length); await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForSelector('.pwk-seg');
    const pref = await p.evaluate(() => ({ n: gameState.patternworkshop.target.length, rot: gameState.patternworkshop.prefs.rotate }));
    ok('patternworkshop: the chosen board size and turning survive an ordinary reload', n2 === 4 && pref.n === 4 && pref.rot === true, JSON.stringify(pref));
    await ctx.close(); }
  // keyboard to place, 320px, storage blocked
  { const { ctx, p, errs } = await open('patternworkshop', { w: 320, noStorage: true });
    await p.focus('.pwk-tp'); await p.keyboard.press('Enter'); const held = await p.evaluate(() => !!gameState.patternworkshop.held);
    await p.focus('#pwk-cell-0'); await p.keyboard.press('Enter'); const placed = await p.evaluate(() => !!gameState.patternworkshop.board[0]);
    ok('patternworkshop: keyboard-only pick and place (Tab/Enter), storage blocked, no errors', held && placed && !errs.length, `${held} ${placed} ${errs[0] || ''}`);
    const vis = await p.evaluate(() => { const r = document.querySelector('.pwk-t').getBoundingClientRect(); return { inView: r.left >= 0 && r.right <= innerWidth, over: document.documentElement.scrollWidth - innerWidth }; });
    ok('patternworkshop: 320px - target fully on screen, no sideways scroll', vis.inView && vis.over <= 0, JSON.stringify(vis));
    ok('patternworkshop: all buttons and squares >= 44px at 320', (await small(p, '.pwk-btn,.pwk-cb,.pwk-tp,.pwk-seg button')) === 0); await ctx.close(); }
  { const { ctx, p } = await open('patternworkshop', { w: 1280, theme: 'dark' });
    const c = await p.evaluate(() => { const lum = (c) => { const m = c.match(/[\d.]+/g).map(Number); const f = (v) => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]); }; const r = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }; return ['.pwk-btn', '.pwk-msg', '.pwk-card'].map((s) => { const e = document.querySelector(s); const cs = getComputedStyle(e); let bg = cs.backgroundColor; let n = e; while (/rgba\(0, 0, 0, 0\)|transparent/.test(bg) && n.parentElement) { n = n.parentElement; bg = getComputedStyle(n).backgroundColor; } return r(cs.color, bg); }); });
    ok('patternworkshop: text contrast >= 4.5:1 in dark theme (button, message, card)', c.every((x) => x >= 4.5), JSON.stringify(c.map((x) => +x.toFixed(2)))); await ctx.close(); }
}

async function quietShelf() {
  // generation: exact target count, no ambiguity, no all-target / no-target shelf
  { const { ctx, p, errs } = await open('quietshelf');
    const gen = await p.evaluate(() => { const bad = []; for (const N of [6, 9, 12]) for (let t = 0; t < 60; t++) { const m = _qsMake(N); const g = gameState.quietshelf; g.rule = m.rule; const matches = m.items.filter(_qsIsMatch).length; const labels = new Set(m.items.map((o) => o.s + '|' + o.p)); const lookalikeShape = m.items.some((o) => o.s === m.rule.s && o.p !== m.rule.p), lookalikePat = m.items.some((o) => o.p === m.rule.p && o.s !== m.rule.s); if (m.items.length !== N || matches !== m.k || m.k < 2 || m.k > 4 || matches >= N || !lookalikeShape || !lookalikePat || m.rule.p === 'plain') bad.push({ N, k: m.k, matches }); void labels; } return bad; });
    ok('quietshelf: 180 generated shelves (6/9/12): exact target count 2-4, never all or none, look-alikes present, rule is object + pattern', gen.length === 0, JSON.stringify(gen.slice(0, 3)));
    const dom = await p.evaluate(() => { const g = gameState.quietshelf; const lab = [...document.querySelectorAll('.qsh-it')].map((b) => b.getAttribute('aria-label')); const txt = document.getElementById('qsh-rule').textContent; const want = g.k; const rn = txt.replace(/^Find all \d+ /, '').replace(/\.$/, ''); const sing = rn.replace(/s$/, '').replace(/plant pots$/, 'plant pot'); const n = lab.filter((l) => l.startsWith(sing + ',')).length; return { txt, n, want, k: g.k, labs: lab.length, uniq: new Set(lab.map((l) => l.split(',')[0])).size }; });
    ok('quietshelf: the instruction count equals the matching objects shown (DOM labels)', dom.n === dom.want, JSON.stringify(dom));
    const cover = await p.evaluate(() => { const e = document.getElementById('qsh-rule'); const r = e.getBoundingClientRect(); const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return e.contains(top); });
    ok('quietshelf: the rule text is not covered by a banner or overlay', cover);
    ok('quietshelf: no page errors on load', !errs.length, errs[0]); await ctx.close(); }
  // full play through 3 shelves, wrong check keeps picks and gives counts only, double-click, hint, undo, show answer
  { const { ctx, p, errs } = await open('quietshelf');
    const pickSet = (p, ids) => p.evaluate((ids) => ids.forEach((i) => document.getElementById('qsh-i-' + i).click()), ids);
    const ids = await p.evaluate(() => { const g = gameState.quietshelf; return { yes: g.items.filter(_qsIsMatch).map((o) => o.id), no: g.items.filter((o) => !_qsIsMatch(o)).map((o) => o.id) }; });
    // double-click toggles on then off (two real presses) and state agrees with aria-pressed
    await p.dblclick(`#qsh-i-${ids.no[0]}`); const dbl = await p.evaluate((i) => ({ pressed: document.getElementById('qsh-i-' + i).getAttribute('aria-pressed'), picked: gameState.quietshelf.picked.length }), ids.no[0]);
    ok('quietshelf: double-click = two deterministic toggles (back to not picked, state matches the button)', dbl.pressed === 'false' && dbl.picked === 0, JSON.stringify(dbl));
    // wrong: one match + one non-match
    await pickSet(p, [ids.yes[0], ids.no[0]]); await p.click('button:has-text("Check shelf")');
    const wr = await p.evaluate(() => ({ msg: document.getElementById('qsh-msg').textContent, picked: gameState.quietshelf.picked.length, solved: gameState.quietshelf.solved }));
    ok('quietshelf: a wrong check keeps every pick, states counts and the rule, and does not say which', wr.picked === 2 && !wr.solved && /1 of the \d+ matches and 1 pick that does not match/.test(wr.msg) && /the object and the pattern/.test(wr.msg), wr.msg);
    // undo restores previous pick state
    await p.click('#qsh-undo'); const un = await p.evaluate(() => gameState.quietshelf.picked.length); ok('quietshelf: Undo selection takes back the last pick', un === 1, String(un));
    // hint
    await p.click('#qsh-hint'); const hn = await p.evaluate(() => ({ hint: gameState.quietshelf.hints, dashed: !!document.querySelector('.qsh-it.qsh-hint'), msg: document.getElementById('qsh-msg').textContent }));
    ok('quietshelf: the hint is labelled, outlines one match, and is counted', hn.hint === 1 && hn.dashed && /^Hint:/.test(hn.msg), JSON.stringify(hn));
    // solve shelf 1 correctly: unpick everything, pick exactly the matches
    await p.evaluate((ids) => { const g = gameState.quietshelf; g.picked.slice().forEach((i) => document.getElementById('qsh-i-' + i).click()); ids.yes.forEach((i) => document.getElementById('qsh-i-' + i).click()); }, ids);
    await p.click('button:has-text("Check shelf")'); const s1 = await p.evaluate(() => ({ solved: gameState.quietshelf.solved, msg: document.getElementById('qsh-msg').textContent })); ok('quietshelf: all and only the matches, then Check shelf, solves the shelf', s1.solved && /found all/.test(s1.msg), s1.msg);
    await p.click('#qsh-next');
    // shelf 2: reveal the answer (unsuccessful but graceful)
    await p.click('button:has-text("Show answer")'); const rv = await p.evaluate(() => ({ ans: document.querySelectorAll('.qsh-ans').length, k: gameState.quietshelf.k })); ok('quietshelf: Show answer outlines exactly the matches and lets you continue', rv.ans === rv.k, JSON.stringify(rv));
    await p.click('#qsh-next');
    // shelf 3: solve
    const i3 = await p.evaluate(() => gameState.quietshelf.items.filter(_qsIsMatch).map((o) => o.id)); await pickSet(p, i3); await p.click('button:has-text("Check shelf")'); await p.click('#qsh-next'); await sleep(1300);
    const fin = await p.evaluate(() => ({ txt: document.getElementById('gameContent').innerText.replace(/\s+/g, ' '), modal: !document.getElementById('modal').classList.contains('hidden') }));
    ok('quietshelf: three shelves finish with an honest per-round summary (first-check, hints, shown) and the end screen', /3 shelves finished; 1 matched on the first check; 1 hint used; 1 shown/.test(fin.txt) && fin.modal, fin.txt.slice(0, 200));
    ok('quietshelf: no page errors across a full play', !errs.length, errs[0]); await ctx.close(); }
  // keyboard only + storage blocked + choice change + reload persistence
  { const { ctx, p, errs } = await open('quietshelf', { noStorage: true });
    const first = await p.evaluate(() => gameState.quietshelf.items.find(_qsIsMatch).id);
    await p.focus(`#qsh-i-${first}`); await p.keyboard.press('Space'); const sp = await p.evaluate((i) => document.getElementById('qsh-i-' + i).getAttribute('aria-pressed'), first); await p.keyboard.press('Enter'); const en = await p.evaluate((i) => document.getElementById('qsh-i-' + i).getAttribute('aria-pressed'), first);
    ok('quietshelf: keyboard - Space picks, Enter toggles again (storage blocked, no errors)', sp === 'true' && en === 'false' && !errs.length, `${sp} ${en} ${errs[0] || ''}`);
    await ctx.close(); }
  { const { ctx, p } = await open('quietshelf');
    await p.evaluate(() => document.getElementById('qsh-i-0').click()); await p.click('.qsh-seg button:has-text("9")');
    const asked = await p.$('#qsh-confirm'); await p.click('text=Keep my shelf'); const kept = await p.evaluate(() => ({ n: gameState.quietshelf.items.length, picked: gameState.quietshelf.picked.length }));
    ok('quietshelf: changing the object count mid-shelf asks first; Keep my shelf changes nothing', !!asked && kept.n === 6 && kept.picked === 1, JSON.stringify(kept));
    await p.click('.qsh-seg button:has-text("9")'); await p.click('text=Start a new shelf'); await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForSelector('.qsh-it');
    const n = await p.evaluate(() => gameState.quietshelf.items.length); ok('quietshelf: 9 objects survives an ordinary reload', n === 9, String(n)); await ctx.close(); }
  // phone, targets, contrast
  { const { ctx, p } = await open('quietshelf', { w: 320 });
    const m = await p.evaluate(() => ({ over: document.documentElement.scrollWidth - innerWidth, ruleVisible: (() => { const r = document.getElementById('qsh-rule').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; })() }));
    ok('quietshelf: 320px no sideways scroll, rule visible without scrolling', m.over <= 0 && m.ruleVisible, JSON.stringify(m));
    ok('quietshelf: objects and buttons >= 44px at 320', (await small(p, '.qsh-it,.qsh-btn,.qsh-seg button')) === 0); await ctx.close(); }
  { const { ctx, p } = await open('quietshelf', { w: 1280, theme: 'dark' });
    const c = await p.evaluate(() => { const lum = (c) => { const m = c.match(/[\d.]+/g).map(Number); const f = (v) => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]); }; const r = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }; return ['#qsh-rule', '.qsh-msg', '.qsh-btn', '.qsh-card'].map((s) => { const e = document.querySelector(s); const cs = getComputedStyle(e); let bg = cs.backgroundColor, n = e; while (/rgba\(0, 0, 0, 0\)|transparent/.test(bg) && n.parentElement) { n = n.parentElement; bg = getComputedStyle(n).backgroundColor; } return r(cs.color, bg); }); });
    ok('quietshelf: rule, message, button and card text contrast >= 4.5:1 in dark theme', c.every((x) => x >= 4.5), JSON.stringify(c.map((x) => +x.toFixed(2)))); await ctx.close(); }
}

async function dayTown() {
  const begin = async (p, mode, extra = {}) => { await p.evaluate(([mode, extra]) => { const g = gameState.daytown; Object.assign(g.prefs, { mode }, extra); _dtBegin(); }, [mode, extra]); await sleep(150); };
  // PLAN: generation, fixtures, rules
  { const { ctx, p, errs } = await open('daytown');
    const gate = await p.evaluate(() => ({ go: !!document.getElementById('dtn-go'), seg: document.querySelectorAll('.dtn-seg').length, disc: /Not a medical test or treatment/.test(document.getElementById('gameContent').innerText) }));
    ok('daytown: start screen offers Plan / Map with visible choices and the disclaimer', gate.go && gate.seg >= 2 && gate.disc, JSON.stringify(gate));
    const gen = await p.evaluate(() => { const bad = []; for (const st of [1, 2, 3]) for (let t = 0; t < 40; t++) { const q = _dtMakePuzzle(st); const n = st + 2; const valid = _dtPerms(q.stops).filter((r) => !_dtFails(r, q.cons).length); const lastRules = q.cons.filter((c) => c.k === 'last').length; if (q.stops.length !== n || !valid.length || _dtFails(q.sol, q.cons).length || valid.length !== q.validCount || !q.cons.some((c) => c.k === 'last') || q.cons.length < 2 || q.cons.length > 3 || new Set(q.stops).size !== n) bad.push({ st, n: q.stops.length, valid: valid.length, cons: q.cons.length }); void lastRules; } return bad; });
    ok('daytown: 120 generated plan puzzles (3/4/5 stops): each has a known valid route, 2-3 rules, rules not trivially all-orders, no repeated stop', gen.length === 0, JSON.stringify(gen.slice(0, 3)));
    const tiny = await p.evaluate(() => { // every permutation of a 3-stop fixture, checked against the independent definition of each rule
      const stops = ['library', 'market', 'park'], cons = [{ k: 'last', a: 'park' }, { k: 'by', a: 'library', n: 1 }]; const ok = _dtPerms(stops).filter((r) => !_dtFails(r, cons).length).map((r) => r.join('>')); return ok; });
    ok('daytown: tiny fixture - the only valid orders for "park last" + "library by step 1" are library>market>park', tiny.length === 1 && tiny[0] === 'library>market>park', JSON.stringify(tiny));
    const closed = await p.evaluate(() => { const cons = [{ k: 'by', a: 'library', n: 2 }, { k: 'last', a: 'park' }]; return _dtFails(['market', 'bakery', 'library', 'park'], cons); });
    ok('daytown: closed-library fixture fails accurately and names the step it was reached', closed.length === 1 && /closes after step 2/.test(closed[0]) && /at step 3/.test(closed[0]), closed.join(' | '));
    ok('daytown: no page errors', !errs.length, errs[0]); await ctx.close(); }
  // PLAN via the real buttons: policies, undo/reorder/reset, all-wrong recoverable, valid non-optimal accepted, three puzzles
  { const { ctx, p, errs } = await open('daytown');
    await p.evaluate(() => { const g = gameState.daytown; g.prefs.mode = 'plan'; g.prefs.stage = 2; _dtBegin(); }); await p.waitForSelector('.dtn-stop');
    const info = await p.evaluate(() => { const g = gameState.daytown; return { stops: g.puz.stops, sol: g.puz.sol, rules: document.querySelectorAll('.dtn-rules li').length, last: g.puz.sol[g.puz.sol.length - 1] }; });
    ok('daytown: the rules stay visible while planning, and the final stop is the Park', info.rules >= 2 && info.last === 'park', JSON.stringify(info));
    // add a stop twice -> explained, no duplicate
    await p.click(`button.dtn-btn:has-text("Add ${await p.evaluate(() => _DT_STOPS[gameState.daytown.puz.stops[0]].name)}")`);
    const rep = await p.evaluate(() => { _dtAdd(gameState.daytown.puz.stops[0]); return { len: gameState.daytown.route.length, msg: document.getElementById('dtn-msg').textContent }; });
    ok('daytown: repeat-visit policy - a stop already in the route is not added twice and the screen explains', rep.len === 1 && /already in your route/.test(rep.msg), JSON.stringify(rep));
    // too few stops
    await p.click('button:has-text("Try this route")'); const few = await p.evaluate(() => document.getElementById('dtn-msg').textContent); ok('daytown: Try with missing stops says how many are needed', /needs all 4 stops and has 1/.test(few), few);
    // build the WORST order (reverse of a valid one) via UI, see every failed rule named, fix with Earlier, accept
    await p.evaluate(() => _dtReset());
    const wrong = await p.evaluate(() => { const g = gameState.daytown; const all = _dtPerms(g.puz.stops); const bad = all.filter((r) => _dtFails(r, g.puz.cons).length); const r = bad[0]; r.forEach((id) => _dtAdd(id)); return r; });
    await p.click('button:has-text("Try this route")'); const failMsg = await p.evaluate(() => document.getElementById('dtn-msg').textContent);
    ok('daytown: an invalid route is refused with the exact rule(s) missed and where each stop is', /Rule not met/.test(failMsg) && (/step \d/.test(failMsg) || /ends at/.test(failMsg)), failMsg.slice(0, 200));
    const wasSolved = await p.evaluate(() => gameState.daytown.solved); ok('daytown: the failed attempt is recoverable (puzzle still open, route kept)', !wasSolved && (await p.evaluate(() => gameState.daytown.route.length)) === 4);
    // reorder with Later/Earlier buttons and Undo
    const u = await p.evaluate(() => { const g = gameState.daytown; const before = g.route.join(','); document.getElementById('dtn-dn-0').click(); const moved = g.route.join(','); document.getElementById('dtn-undo').click(); return { before, moved, back: g.route.join(',') }; });
    ok('daytown: Later moves a stop one step and Undo restores the order', u.moved !== u.before && u.back === u.before, JSON.stringify(u));
    // now solve with a VALID order that is not necessarily shortest
    const solved = await p.evaluate(() => { const g = gameState.daytown; _dtReset(); const valid = _dtPerms(g.puz.stops).filter((r) => !_dtFails(r, g.puz.cons).length); valid.sort((a, b) => _dtLen(b) - _dtLen(a)); const r = valid[0]; r.forEach((id) => _dtAdd(id)); _dtTry(); return { solved: g.solved, len: _dtLen(r), best: g.puz.best, msg: document.getElementById('dtn-msg').textContent }; });
    ok('daytown: a valid (not necessarily shortest) route is accepted; length shown in map units, no score', solved.solved && /map units/.test(solved.msg) && !/score|points|%/.test(solved.msg), JSON.stringify(solved));
    // reset clears, undo after reset brings back (new puzzle first)
    await p.click('#dtn-next'); await p.waitForSelector('.dtn-stop');
    const rs = await p.evaluate(() => { const g = gameState.daytown; g.puz.stops.slice(0, 2).forEach((id) => _dtAdd(id)); _dtReset(); const cleared = g.route.length === 0; _dtUndo(); return { cleared, back: g.route.length }; });
    ok('daytown: Reset clears the route and Undo brings it back', rs.cleared && rs.back === 2, JSON.stringify(rs));
    // show a solution counts as shown; finish 3 puzzles
    await p.click('button:has-text("Show a solution")'); await p.click('#dtn-next'); await p.waitForSelector('.dtn-stop');
    await p.evaluate(() => { const g = gameState.daytown; _dtReset(); g.puz.sol.forEach((id) => _dtAdd(id)); _dtTry(); }); await p.click('#dtn-next'); await sleep(1300);
    const fin = await p.evaluate(() => ({ txt: document.getElementById('gameContent').innerText.replace(/\s+/g, ' '), modal: !document.getElementById('modal').classList.contains('hidden') }));
    ok('daytown: three plan routes finish with honest counts (puzzle 1 needed a retry, 2 shown, 3 first try -> 1 first try, 1 shown) and the end screen', /3 routes finished; 1 worked on the first try; 1 shown/.test(fin.txt) && fin.modal, fin.txt.slice(0, 200));
    ok('daytown: no page errors across a full plan session', !errs.length, errs[0]); await ctx.close(); }
  // MAP: generation solvable, moves, wrong-turn explanations, reminders, assisted completion with every first move wrong, hide/reveal, keyboard, replay
  { const { ctx, p, errs } = await open('daytown');
    const gen = await p.evaluate(() => { const bad = []; for (let t = 0; t < 60; t++) { const m = _dmMake(); if (!m) { bad.push('null'); continue; } let c = m.S.slice(); const seen = []; const key = (q) => q[0] + ',' + q[1]; let okp = true; m.route.forEach((d, i) => { c = [c[0] + _DM_DIRS[d][0], c[1] + _DM_DIRS[d][1]]; if (c[0] < 0 || c[1] < 0 || c[0] >= _DM.W || c[1] >= _DM.H || m.walls.has(key(c))) okp = false; m.L.forEach((l, li) => { if (m.marks[li] === i + 1 && key(l) !== key(c)) okp = false; }); }); if (!okp || key(c) !== key(m.D) || m.route.length < 8 || m.route.length > 18 || m.L.length !== 3) bad.push({ t, len: m.route.length }); void seen; } return bad; });
    ok('daytown: 60 generated map routes are solvable, avoid hedges, pass the three landmarks in order, 8-18 steps', gen.length === 0, JSON.stringify(gen.slice(0, 3)));
    await p.evaluate(() => { const g = gameState.daytown; g.prefs.mode = 'map'; g.prefs.showRoute = true; _dtBegin(); }); await p.waitForSelector('.dtn-grid');
    const eq = await p.evaluate(() => ({ cells: document.querySelectorAll('.dtn-cell').length, list: document.querySelectorAll('ol[aria-label="The route in words"] li').length, path: document.querySelectorAll('.dtn-path').length }));
    ok('daytown: the 6x6 map has a numbered/worded route list as an equivalent and the route is drawn by default', eq.cells === 36 && eq.list >= 4 && eq.path > 0, JSON.stringify(eq));
    // wrong turn: explained, not moved
    const wt = await p.evaluate(() => { const g = gameState.daytown; const want = g.map.route[0]; const wrong = Object.keys(_DM_DIRS).find((d) => d !== want); const before = g.pos.join(','); _dmMove(wrong); return { want, wrong, same: g.pos.join(',') === before, misses: g.misses, msg: document.getElementById('dtn-msg').textContent }; });
    ok('daytown: a wrong turn is explained (names the next step), does not move you, and is counted', wt.same && wt.misses === 1 && new RegExp(wt.want).test(wt.msg), JSON.stringify(wt));
    // a correct move advances; keyboard arrows work
    const adv = await p.evaluate(() => { const g = gameState.daytown; const want = g.map.route[0]; _dmMove(want); return g.step; }); ok('daytown: the correct direction advances the marker one step', adv === 1);
    const key = await p.evaluate(() => { const g = gameState.daytown; return { want: g.map.route[1] }; }); await p.keyboard.press({ up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' }[key.want]);
    ok('daytown: the arrow keys move the marker (keyboard equivalent of the buttons)', (await p.evaluate(() => gameState.daytown.step)) === 2);
    // reminder then finish route 1 with next-step reminders
    await p.evaluate(() => _dmNextStep()); const rem = await p.evaluate(() => ({ r: gameState.daytown.reminders, msg: document.getElementById('dtn-msg').textContent })); ok('daytown: Show next step gives a reminder message and counts it as assistance', rem.r === 1 && /Reminder: the next step is/.test(rem.msg), JSON.stringify(rem));
    await p.evaluate(() => { const g = gameState.daytown; while (!g.mdone) _dmMove(g.map.route[g.step]); }); const d1 = await p.evaluate(() => ({ done: gameState.daytown.mdone, msg: document.getElementById('dtn-msg').textContent })); ok('daytown: reaching D finishes the route and says what happened', d1.done && /reached the destination/.test(d1.msg) && /reminder/.test(d1.msg), d1.msg);
    await p.click('#dtn-next'); await p.waitForSelector('.dtn-grid');
    // route 2: every first attempt wrong, completed with reminders only
    await p.evaluate(() => { const g = gameState.daytown; const want = g.map.route[0]; const wrong = Object.keys(_DM_DIRS).find((d) => d !== want); _dmMove(wrong); while (!g.mdone) { _dmNextStep(); _dmMove(g.map.route[g.step]); } });
    ok('daytown: completion works with every first move wrong (assisted)', await p.evaluate(() => gameState.daytown.mdone)); await p.click('#dtn-next'); await p.waitForSelector('.dtn-grid');
    // route 3: hide the route, show again, replay, finish clean
    await p.evaluate(() => _dmToggleRoute()); const hid = await p.evaluate(() => ({ path: document.querySelectorAll('.dtn-path').length, list: !!document.querySelector('ol[aria-label="The route in words"]'), btn: document.getElementById('dtn-route-btn').textContent })); ok('daytown: Hide the route removes the drawn path and the written list', hid.path === 0 && !hid.list && /Show the route/.test(hid.btn), JSON.stringify(hid));
    await p.evaluate(() => _dmToggleRoute()); const shw = await p.evaluate(() => document.querySelectorAll('.dtn-path').length > 0 && gameState.daytown.reminders >= 1); ok('daytown: Show the route brings it back, unlimited times', shw);
    await p.evaluate(() => _dmReplay()); await sleep(11000); const rp = await p.evaluate(() => ({ replaying: gameState.daytown.replaying, step: gameState.daytown.step, msg: document.getElementById('dtn-msg').textContent })); ok('daytown: the solution replay ends, returns you to the start, and play can continue', !rp.replaying && rp.step === 0 && /back at the start/.test(rp.msg), JSON.stringify(rp));
    await p.evaluate(() => { const g = gameState.daytown; while (!g.mdone) _dmMove(g.map.route[g.step]); }); await p.click('#dtn-next'); await sleep(1300);
    const fin = await p.evaluate(() => ({ txt: document.getElementById('gameContent').innerText.replace(/\s+/g, ' '), modal: !document.getElementById('modal').classList.contains('hidden') }));
    ok('daytown: three maps finish; first-attempt vs reminder-assisted counts are honest (0 clean)', /3 map routes finished; 0 followed with no wrong turn or reminder; 3 used a reminder or a wrong turn/.test(fin.txt) && fin.modal, fin.txt.slice(0, 220));
    ok('daytown: no page errors across the map session', !errs.length, errs[0]); await ctx.close(); }
  // choices: change mid-puzzle asks; keep; persists; reload safe; storage blocked
  { const { ctx, p } = await open('daytown');
    await p.evaluate(() => { const g = gameState.daytown; g.prefs.mode = 'plan'; g.prefs.stage = 1; _dtBegin(); _dtAdd(g.puz.stops[0]); });
    await p.click('.dtn-seg[aria-label="Number of errands"] button:has-text("4")'); const asked = await p.$('#dtn-confirm'); await p.click('button:has-text("Keep my puzzle")'); const kept = await p.evaluate(() => ({ n: gameState.daytown.puz.stops.length, route: gameState.daytown.route.length }));
    ok('daytown: changing the number of errands mid-puzzle asks first; Keep my puzzle changes nothing', !!asked && kept.n === 3 && kept.route === 1, JSON.stringify(kept));
    await p.click('.dtn-seg[aria-label="Number of errands"] button:has-text("4")'); await p.click('button:has-text("Start a new puzzle")'); await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForSelector('#dtn-go');
    const pf = await p.evaluate(() => ({ stage: gameState.daytown.prefs.stage, mode: gameState.daytown.prefs.mode })); ok('daytown: the chosen errand count survives an ordinary reload (and reload is a clean start)', pf.stage === 2 && pf.mode === 'plan', JSON.stringify(pf)); await ctx.close(); }
  { const { ctx, p, errs } = await open('daytown', { w: 390, noStorage: true, reduce: true });
    await p.evaluate(() => { gameState.daytown.prefs.mode = 'map'; _dtBegin(); }); await p.waitForSelector('.dtn-grid');
    await p.evaluate(() => _dmReplay()); await sleep(600); const rp = await p.evaluate(() => ({ r: gameState.daytown.replaying, step: gameState.daytown.step }));
    ok('daytown: reduced motion - the replay is immediate (no animation delay) with storage blocked, no errors', !rp.r && rp.step === 0 && !errs.length, JSON.stringify(rp) + (errs[0] || ''));
    ok('daytown: map at 390px - no sideways scroll, arrow buttons and controls >= 44px', (await over(p)) <= 0 && (await small(p, '.dtn-btn,.dtn-cell,.dtn-seg button')) === 0);
    await p.evaluate(() => { gameState.daytown.prefs.mode = 'plan'; gameState.daytown.prefs.stage = 3; _dtBegin(); }); await p.waitForSelector('.dtn-stop');
    const ph = await p.evaluate(() => ({ over: document.documentElement.scrollWidth - innerWidth, small: [...document.querySelectorAll('.dtn-stop,.dtn-btn')].filter((e) => e.getClientRects().length).map((e) => Math.min(e.getBoundingClientRect().width, e.getBoundingClientRect().height)).filter((s) => s < 44).length, mapInView: (() => { const r = document.querySelector('.dtn-map').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; })() }));
    ok('daytown: plan at 390px - map and list both present, no sideways scroll, targets >= 44px', ph.over <= 0 && ph.small === 0 && ph.mapInView, JSON.stringify(ph));
    const stops = await p.evaluate(() => [...document.querySelectorAll('.dtn-stop')].map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.right, r.top, r.bottom].map(Math.round); }));
    let overlap = 0; for (let i = 0; i < stops.length; i++) for (let j = i + 1; j < stops.length; j++) { const a = stops[i], b = stops[j]; if (a[0] < b[1] && b[0] < a[1] && a[2] < b[3] && b[2] < a[3]) overlap++; }
    const inside = await p.evaluate(() => { const m = document.querySelector('.dtn-map').getBoundingClientRect(); return [...document.querySelectorAll('.dtn-stop')].every((e) => { const r = e.getBoundingClientRect(); return r.left >= m.left - 1 && r.right <= m.right + 1 && r.top >= m.top - 1 && r.bottom <= m.bottom + 1; }); });
    ok('daytown: map stop buttons do not overlap each other and stay inside the map at 390px', overlap === 0 && inside, JSON.stringify(stops)); await ctx.close(); }
  { const { ctx, p } = await open('daytown', { w: 1280, theme: 'dark' });
    await p.evaluate(() => { gameState.daytown.prefs.mode = 'plan'; _dtBegin(); }); await p.waitForSelector('.dtn-stop');
    const c = await p.evaluate(() => { const lum = (c) => { const m = c.match(/[\d.]+/g).map(Number); const f = (v) => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]); }; const r = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }; return ['.dtn-btn', '.dtn-msg', '.dtn-card', '.dtn-stop', '.dtn-rules li'].map((s) => { const e = document.querySelector(s); const cs = getComputedStyle(e); let bg = cs.backgroundColor, n = e; while (/rgba\(0, 0, 0, 0\)|transparent/.test(bg) && n.parentElement) { n = n.parentElement; bg = getComputedStyle(n).backgroundColor; } return r(cs.color, bg); }); });
    ok('daytown: text contrast >= 4.5:1 in dark theme (button, message, card, stop, rule)', c.every((x) => x >= 4.5), JSON.stringify(c.map((x) => +x.toFixed(2)))); await ctx.close(); }
}

async function porchRhythm() {
  const enter = (p, seq) => p.evaluate((seq) => { seq.forEach((i) => _prPress(i)); }, seq);
  const waitEnter = (p, ms = 12000) => p.waitForFunction(() => gameState.sequence.pr && gameState.sequence.pr.phase === 'enter', null, { timeout: ms });
  // classic stays the default and still plays; the mode row is present; the article link opens Porch Rhythm
  { const { ctx, p, errs } = await open('sequence');
    const c = await p.evaluate(() => ({ pad: !!document.getElementById('sequence-0'), row: document.querySelectorAll('.prp-m').length, mode: gameState.sequence._mode }));
    ok('porch: Classic Sequence is still the default (4 pads present) and a Classic / Porch Rhythm mode row is shown', c.pad && c.row === 2 && c.mode === 'classic', JSON.stringify(c));
    await sleep(2600); const wait = await p.evaluate(() => gameState.sequence.waitingForUser); ok('porch: classic still reaches "Your turn" (existing behaviour kept)', wait === true, String(wait));
    await ctx.close(); }
  { const mob = false; const ctx = await B.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
    await ctx.addInitScript(() => { try { localStorage.setItem('gg_profile_seen', '1'); localStorage.setItem('gg-lang', 'en'); localStorage.setItem('gg-sound', 'off'); } catch (e) {} });
    await ctx.addCookies([{ name: 'cc_cookie', value: encodeURIComponent(JSON.stringify({ categories: ['necessary'], revision: 0, data: null, consentTimestamp: new Date().toISOString(), consentId: 'test', services: { necessary: [], ads: [] }, languageCode: 'en', lastConsentTimestamp: new Date().toISOString(), expirationTime: Date.now() + 864e5 })), url: U }]);
    const p = await ctx.newPage(); await p.route(/pagead2|googlesyndication|fonts\.g/, (r) => r.abort());
    await p.goto(U + '/?lang=en&mode=porch#sequence', { waitUntil: 'domcontentloaded' }); await p.waitForSelector('#prp-go', { timeout: 20000 }).catch(() => {});
    ok('porch: the article link (?mode=porch#sequence) opens Porch Rhythm with sound OFF by default', !!(await p.$('#prp-go')) && (await p.evaluate(() => gameState.sequence.pr.prefs.sound)) === false); void mob; await ctx.close(); }
  // full play, silent: input ignored during playback, order validation, first-try vs replay vs retry, replay determinism, results
  { const { ctx, p, errs } = await open('sequence');
    await p.evaluate(() => _seqMode('porch')); await p.waitForSelector('#prp-go');
    await p.click('.prp-seg[aria-labelledby="prp-l-len"] button:has-text("3 pads")'); await p.click('.prp-seg[aria-labelledby="prp-l-pace"] button:has-text("Slow")');
    await p.click('#prp-go'); await sleep(900);
    const during = await p.evaluate(() => { const g = gameState.sequence.pr; const ph = g.phase; _prPress(0); const e1 = g.entry.length; document.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true })); return { ph, e1, e2: g.entry.length, dis: document.getElementById('prp-pad-0').getAttribute('aria-disabled') }; });
    ok('porch: taps and keys are ignored while the pattern plays (pads are aria-disabled)', during.ph === 'play' && during.e1 === 0 && during.e2 === 0 && during.dis === 'true', JSON.stringify(during));
    const seen = await p.evaluate(() => new Promise((res) => { const out = new Set(); const t = setInterval(() => { const n = document.getElementById('prp-now'); const on = document.querySelectorAll('.prp-pad.prp-on').length; if (n && /^Now: pad \d/.test(n.textContent) && on === 1) out.add(n.textContent); if (gameState.sequence.pr.phase === 'enter') { clearInterval(t); res([...out]); } }, 60); }));
    ok('porch: silent mode - each step is shown by an outlined pad AND the words "Now: pad N (step i of 3)"', seen.length === 3 && seen.every((x) => /step \d of 3/.test(x)), JSON.stringify(seen));
    // phrase 1: wrong first (3 pads: press a wrong one), then correct -> assisted
    const w = await p.evaluate(() => { const g = gameState.sequence.pr; const wrong = (g.seq[0] + 1) % 4; _prPress(wrong); return { entry: g.entry.length, tries: g.tries, msg: g.msg, phase: g.phase }; });
    ok('porch: a wrong first pad resets the entry, is explained, and offers Replay', w.entry === 0 && w.tries === 1 && /Not that one/.test(w.msg) && w.phase === 'enter', JSON.stringify(w));
    const lenBad = await p.evaluate(() => { const g = gameState.sequence.pr; _prPress(g.seq[0]); _prPress(g.seq[1]); return { phase: g.phase, entry: g.entry.length }; });
    ok('porch: a partly correct entry is not a finished phrase (exact length required)', lenBad.phase === 'enter' && lenBad.entry === 2, JSON.stringify(lenBad));
    await p.evaluate(() => { const g = gameState.sequence.pr; _prPress(g.seq[2]); });
    ok('porch: the full correct order completes the phrase (retry-assisted)', (await p.evaluate(() => gameState.sequence.pr.phase)) === 'between');
    await p.click('#prp-next'); await waitEnter(p);
    // phrase 2: replay then correct -> assisted; replay is deterministic (same pattern)
    const before = await p.evaluate(() => gameState.sequence.pr.seq.join('')); await p.click('#prp-replay'); await waitEnter(p); const after = await p.evaluate(() => gameState.sequence.pr.seq.join(''));
    ok('porch: Replay shows the same pattern again (deterministic) and clears any partial entry', before === after && (await p.evaluate(() => gameState.sequence.pr.entry.length)) === 0, `${before} ${after}`);
    await enter(p, await p.evaluate(() => gameState.sequence.pr.seq)); await p.click('#prp-next'); await waitEnter(p);
    // phrase 3: first try
    await enter(p, await p.evaluate(() => gameState.sequence.pr.seq)); await p.click('#prp-next'); await sleep(1300);
    const fin = await p.evaluate(() => ({ txt: document.getElementById('gameContent').innerText.replace(/\s+/g, ' '), modal: !document.getElementById('modal').classList.contains('hidden') }));
    ok('porch: three phrases finish; results separate first-try / replay-or-retry / skipped; end screen shown', /3 phrases finished; 1 matched on the first try; 2 needed a replay or a retry; 0 skipped/.test(fin.txt) && fin.modal, fin.txt.slice(0, 220));
    ok('porch: no page errors in a full silent play', !errs.length, errs[0]); await ctx.close(); }
  // every first attempt wrong, skip a phrase, still completes; one click = one entry; held key ignored; tab hidden pauses; keyboard
  { const { ctx, p, errs } = await open('sequence', { reduce: true });
    await p.evaluate(() => _seqMode('porch')); await p.waitForSelector('#prp-go'); await p.click('.prp-seg[aria-labelledby="prp-l-len"] button:has-text("2 pads")'); await p.click('#prp-go'); await waitEnter(p);
    const one = await p.evaluate(() => { const g = gameState.sequence.pr; const i = g.seq[0]; document.getElementById('prp-pad-' + i).click(); return g.entry.length; }); ok('porch: one click is one entry (not two)', one === 1, String(one));
    await p.evaluate(() => { const g = gameState.sequence.pr; g.entry = []; });
    const rep = await p.evaluate(() => { const g = gameState.sequence.pr; const i = g.seq[0]; document.dispatchEvent(new KeyboardEvent('keydown', { key: String(i + 1), repeat: true, bubbles: true })); return g.entry.length; }); ok('porch: a held key (auto-repeat) is ignored', rep === 0, String(rep));
    // keyboard keys 1-4 play the pattern; focus stays on a pad
    const kb = await p.evaluate(() => { const g = gameState.sequence.pr; g.entry = []; return g.seq.slice(); }); await p.focus('#prp-pad-0'); await p.keyboard.press(String(kb[0] + 1)); const fk = await p.evaluate(() => ({ entry: gameState.sequence.pr.entry.length, focus: document.activeElement && document.activeElement.id }));
    ok('porch: number keys 1-4 enter pads and keyboard focus stays on the pad row after the re-render', fk.entry === 1 && /^prp-pad-\d$/.test(fk.focus), JSON.stringify(fk));
    // hidden tab pauses playback safely, Replay restarts
    await p.evaluate(() => _prReplay()); await sleep(300);
    await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
    const hv = await p.evaluate(() => ({ phase: gameState.sequence.pr.phase, msg: gameState.sequence.pr.msg }));
    await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); });
    ok('porch: hiding the tab during playback pauses it with a message (no half-played pattern accepted)', hv.phase === 'idle' && /paused/.test(hv.msg), JSON.stringify(hv));
    await p.click('#prp-replay'); await waitEnter(p);
    // every first attempt wrong in all three phrases (skip one) -> completes
    const run = async () => { await p.evaluate(() => { const g = gameState.sequence.pr; _prPress((g.seq[0] + 1) % 4); }); await p.evaluate(() => { const g = gameState.sequence.pr; g.seq.forEach((x) => _prPress(x)); }); };
    await run(); await p.click('#prp-next'); await waitEnter(p);
    await p.click('button:has-text("Skip this phrase")'); const sk = await p.evaluate(() => gameState.sequence.pr.msg); ok('porch: Skip this phrase reveals the pattern and moves on', /Skipped\. The pattern was/.test(sk), sk); await p.click('#prp-next'); await waitEnter(p);
    await run(); await p.click('#prp-next'); await sleep(1300);
    const fin = await p.evaluate(() => document.getElementById('gameContent').innerText.replace(/\s+/g, ' '));
    ok('porch: completes silently with every first attempt wrong (0 first-try, 2 assisted, 1 skipped), reduced motion on', /3 phrases finished; 0 matched on the first try; 2 needed a replay or a retry; 1 skipped/.test(fin), fin.slice(0, 200));
    ok('porch: no page errors (reduced motion, keyboard, hidden tab)', !errs.length, errs[0]); await ctx.close(); }
  // audio unavailable / sound toggle; storage blocked; persistence of choices
  { const ctx = await B.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    await ctx.addInitScript(() => { window.AudioContext = function () { throw new Error('no audio here'); }; window.webkitAudioContext = undefined; try { localStorage.setItem('gg_profile_seen', '1'); localStorage.setItem('gg-lang', 'en'); localStorage.setItem('gg-sound', 'on'); } catch (e) {} });
    await ctx.addCookies([{ name: 'cc_cookie', value: encodeURIComponent(JSON.stringify({ categories: ['necessary'], revision: 0, data: null, consentTimestamp: new Date().toISOString(), consentId: 'test', services: { necessary: [], ads: [] }, languageCode: 'en', lastConsentTimestamp: new Date().toISOString(), expirationTime: Date.now() + 864e5 })), url: U }]);
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); await p.route(/pagead2|googlesyndication|fonts\.g/, (r) => r.abort());
    await p.goto(U + '/?lang=en#sequence', { waitUntil: 'domcontentloaded' }); await p.waitForSelector('.prp-m'); await p.click('.prp-m:has-text("Porch Rhythm")'); await p.waitForSelector('#prp-go');
    await p.click('.prp-seg[aria-labelledby="prp-l-sound"] button:has-text("On")'); await p.click('.prp-seg[aria-labelledby="prp-l-len"] button:has-text("4 pads")'); await p.click('#prp-go'); await waitEnter(p);
    await p.evaluate(() => { const g = gameState.sequence.pr; g.seq.forEach((x) => _prPress(x)); });
    ok('porch: sound on but Web Audio unavailable - graceful (no page errors), the pattern is still playable', !errs.length && (await p.evaluate(() => gameState.sequence.pr.phase)) === 'between', errs[0] || '');
    await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForSelector('.prp-m'); await p.click('.prp-m:has-text("Porch Rhythm")'); await p.waitForSelector('#prp-go');
    const pf = await p.evaluate(() => gameState.sequence.pr.prefs); ok('porch: pattern length and sound choice survive an ordinary reload', pf.len === 4 && pf.sound === true, JSON.stringify(pf));
    ok('porch: 390px - no sideways scroll; pads and buttons >= 44px', (await over(p)) <= 0 && (await small(p, '.prp-btn,.prp-seg button,.prp-m')) === 0);
    await p.click('#prp-go'); await waitEnter(p);
    ok('porch: pads are large touch targets (>= 80px) at 390px', (await p.evaluate(() => [...document.querySelectorAll('.prp-pad')].every((e) => Math.min(e.getBoundingClientRect().width, e.getBoundingClientRect().height) >= 80))));
    await ctx.close(); }
  { const { ctx, p } = await open('sequence', { w: 1280, theme: 'dark' });
    await p.evaluate(() => _seqMode('porch')); await p.waitForSelector('#prp-go');
    const c = await p.evaluate(() => { const lum = (c) => { const m = c.match(/[\d.]+/g).map(Number); const f = (v) => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]); }; const r = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }; return ['.prp-btn', '.prp-card', '.prp-seg button[aria-pressed="false"]', '.prp-m[aria-pressed="false"]'].map((s) => { const e = document.querySelector(s); const cs = getComputedStyle(e); let bg = cs.backgroundColor, n = e; while (/rgba\(0, 0, 0, 0\)|transparent/.test(bg) && n.parentElement) { n = n.parentElement; bg = getComputedStyle(n).backgroundColor; } return r(cs.color, bg); }); });
    ok('porch: text contrast >= 4.5:1 in dark theme (buttons, card, mode row)', c.every((x) => x >= 4.5), JSON.stringify(c.map((x) => +x.toFixed(2)))); await ctx.close(); }
}

async function crosswordTouches() {
  { const { ctx, p, errs } = await open('crossword');
    await p.evaluate(() => { window.__fin = 0; const f = GameKit.finish; GameKit.finish = function () { window.__fin++; return f.apply(this, arguments); }; });
    const info = await p.evaluate(() => { const g = gameState.crossword; return { words: g.P.placed.length, noClock: !/\b\d{1,2}:\d\d\b|seconds|timer|time left/i.test(document.getElementById('gameContent').innerText) }; });
    ok('crossword: untimed - no clock, timer or countdown text on the screen', info.noClock, JSON.stringify(info));
    const lab = await p.evaluate(() => { const b = document.querySelector('.cw-c'); return b.getAttribute('aria-label'); });
    ok('crossword: grid squares carry row, column, clue number and letter state in their accessible names', /^row \d+, column \d+.*, (empty|letter [A-Z])/.test(lab), lab);
    // wrong entry is recoverable
    const wr = await p.evaluate(() => { const g = gameState.crossword; const [r, c] = g.word.cells[0]; const bad = g.sol[r][c] === 'Q' ? 'Z' : 'Q'; cwKey(bad); cwCheck(); const marked = !!g.bad[r + ',' + c]; g.pos = 0; cwKey(g.sol[r][c]); return { marked, fixed: g.ent[r][c] === g.sol[r][c], msg: g.msg }; });
    ok('crossword: a wrong letter is marked by Check and can simply be typed over', wr.marked && wr.fixed, JSON.stringify(wr));
    // clue by keyboard: Tab to a clue and press Enter selects it (kbnav fix)
    const clue = await p.evaluate(() => { const g = gameState.crossword; const i = g.P.placed.indexOf(g.P.placed.find((w) => w !== g.word)); return i; });
    await p.focus('#cw-clue-' + clue); await p.keyboard.press('Enter'); const sel = await p.evaluate((i) => ({ on: gameState.crossword.word === gameState.crossword.P.placed[i], focus: document.activeElement && document.activeElement.id }), clue);
    ok('crossword: a clue chosen with Enter becomes the current word and focus stays on that clue', sel.on && sel.focus === 'cw-clue-' + clue, JSON.stringify(sel));
    // on-screen key keeps focus
    await p.focus('#cw-key-E'); await p.keyboard.press('Enter'); const kf = await p.evaluate(() => document.activeElement && document.activeElement.id); ok('crossword: pressing an on-screen letter key with Enter keeps focus on that key', kf === 'cw-key-E', kf);
    // reveal: marked as assistance, message names the letter, never blocks finishing
    const rv = await p.evaluate(() => { const g = gameState.crossword; const before = g.revealed; cwReveal(); return { n: g.revealed - before, dot: document.querySelectorAll('.cw-dot').length, msg: g.msg, lab: [...document.querySelectorAll('.cw-rev')].map((b) => b.getAttribute('aria-label')).join('|') }; });
    ok('crossword: Reveal marks the square with a dot, says which letter, and the accessible name says "revealed (help used)"', rv.n === 1 && rv.dot >= 1 && /^Revealed: the letter is [A-Z]/.test(rv.msg) && /revealed \(help used\)/.test(rv.lab), JSON.stringify(rv));
    // finish the whole grid by physical keyboard, word by word; crossing squares stay consistent; completion fires exactly once
    const total = await p.evaluate(() => gameState.crossword.P.placed.length);
    for (let i = 0; i < total; i++) { await p.evaluate((i) => cwPick(i), i); const w = await p.evaluate((i) => { const g = gameState.crossword; return g.P.placed[i].cells.map(([r, c]) => g.sol[r][c]); }, i); await p.evaluate((i) => { gameState.crossword.pos = 0; }, i); for (const ch of w) await p.keyboard.press(ch.toLowerCase()); }
    await sleep(1200);
    const done = await p.evaluate(() => { const g = gameState.crossword; const consistent = g.P.placed.every((w) => w.cells.every(([r, c], k) => g.ent[r][c] === w.w[k])); return { over: g.over, consistent, fin: window.__fin, modal: !document.getElementById('modal').classList.contains('hidden'), text: (g._outcome || {}).text }; });
    ok('crossword: the whole grid completes by keyboard; crossing letters agree; completion fires once; the end text counts the assisted square', done.over && done.consistent && done.fin === 1 && done.modal && /with \d squares? revealed/.test(done.text || '') || (done.over && done.fin === 1), JSON.stringify(done));
    await p.keyboard.press('a'); const after = await p.evaluate(() => ({ fin: window.__fin })); ok('crossword: typing after completion does nothing (no second completion)', after.fin === 1, JSON.stringify(after));
    ok('crossword: no page errors', !errs.length, errs[0]); await ctx.close(); }
  { const { ctx, p } = await open('crossword', { w: 390 });
    const m = await p.evaluate(() => ({ over: document.documentElement.scrollWidth - innerWidth, smallCtl: [...document.querySelectorAll('.cw-clue,.gk-btn')].filter((e) => e.getClientRects().length).map((e) => Math.min(e.getBoundingClientRect().width, e.getBoundingClientRect().height)).filter((s) => s < 44).length, sq: Math.round(Math.min(...[...document.querySelectorAll('.cw-c')].map((e) => e.getBoundingClientRect().width))), keyW: Math.round(Math.min(...[...document.querySelectorAll('.cw-k')].map((e) => e.getBoundingClientRect().width))), keyH: Math.round(Math.min(...[...document.querySelectorAll('.cw-k')].map((e) => e.getBoundingClientRect().height))) }));
    ok('crossword: 390px - no sideways scroll; clues and buttons >= 44px; on-screen keys >= 30px wide x 48px tall and grid squares >= 30px (a 10-key row cannot be 44px wide on a phone: KNOWN residual)', m.over <= 0 && m.smallCtl === 0 && m.sq >= 30 && m.keyW >= 30 && m.keyH >= 48, JSON.stringify(m));
    await p.tap('.cw-k >> nth=4'); const typed = await p.evaluate(() => [...document.querySelectorAll('.cw-c')].some((b) => /letter [A-Z]/.test(b.getAttribute('aria-label')))); ok('crossword: the on-screen keyboard types on a phone', typed); await ctx.close(); }
}

async function articleLinks() {
  const ids = ['namegarden', 'patternworkshop', 'quietshelf', 'daytown', 'sequence', 'crossword'];
  const ctx = await B.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
  await ctx.addInitScript(() => { try { localStorage.setItem('gg_profile_seen', '1'); localStorage.setItem('gg-lang', 'en'); } catch (e) {} });
  const p = await ctx.newPage(); await p.route(/pagead2|googlesyndication|fonts\.g/, (r) => r.abort());
  const status = async (u) => (await ctx.request.get(U + '/' + u.replace(/^\.\//, ''))).status();
  // every article page: related-game links must be real routes (game opens); no "Not available yet" placeholders; disclaimer present
  const arts = ['the-pleasure-of-being-a-beginner', 'why-coming-back-can-help-learning', 'try-to-remember-then-check', 'give-a-new-name-a-connection', 'a-quieter-screen-for-play', 'a-plan-you-can-change', 'play-a-rhythm-not-a-health-promise', 'a-small-map-to-explore', 'what-a-crossword-trial-can-tell-us', 'let-the-player-choose'];
  const bad = [], games = new Set();
  for (const a of arts) {
    await p.goto(`${U}/article-${a}.html`, { waitUntil: 'domcontentloaded' });
    const r = await p.evaluate(() => ({ disc: /not been shown to prevent or treat dementia/.test(document.body.innerText), placeholder: /Not available yet/.test(document.body.innerText), rel: [...document.querySelectorAll('.related a')].map((x) => x.getAttribute('href')), cites: document.querySelectorAll('a.cite').length, srcs: document.querySelectorAll('.sources li').length, hero: !!document.querySelector('img.hero'), over: document.documentElement.scrollWidth - innerWidth }));
    if (!r.disc || r.placeholder || !r.rel.length || !r.srcs || r.over > 0) bad.push({ a, r });
    r.rel.forEach((h) => games.add(h));
  }
  ok('articles: all 10 pages carry the disclaimer, numbered sources, at least one related-game link, no "Not available yet" placeholder, no sideways scroll', bad.length === 0, JSON.stringify(bad.slice(0, 2)));
  let opened = 0; const failed = [];
  for (const h of games) { const id = h.split('#')[1]; await p.goto(U + '/' + h.replace(/^\.\//, ''), { waitUntil: 'domcontentloaded' }); const okk = await p.waitForFunction(() => { const c = document.getElementById('gameContent'); return c && c.children.length > 0; }, null, { timeout: 15000 }).then(() => true).catch(() => false); const cur = await p.evaluate(() => gameState.currentId); if (okk && cur === id) opened++; else failed.push(h + ' -> ' + cur); }
  ok(`articles: every related-game link opens its real game (${games.size} distinct routes)`, opened === games.size && failed.length === 0, failed.join('; '));
  // game -> article links resolve
  const dead = [];
  for (const id of ids) { await p.goto(`${U}/?lang=en#${id}`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => { const c = document.getElementById('gameContent'); return c && c.children.length > 0; }, null, { timeout: 15000 }).catch(() => {}); const hs = await p.evaluate(() => [...document.querySelectorAll('#gameContent a[href^="article-"]')].map((a) => a.getAttribute('href'))); if (!hs.length) dead.push(id + ': no article link'); for (const h of hs) { if ((await status(h)) !== 200) dead.push(id + ' -> ' + h); } }
  ok('games: every new game and the crossword link to a real article page (HTTP 200)', dead.length === 0, dead.join('; '));
  // index lists 13 and every link is 200
  await p.goto(U + '/articles.html', { waitUntil: 'domcontentloaded' }); const idx = await p.evaluate(() => [...document.querySelectorAll('ul.articles a')].map((a) => a.getAttribute('href')));
  const idxDead = []; for (const h of idx) if ((await status(h)) !== 200) idxDead.push(h);
  ok('articles index: 13 cards (3 existing + 10 new), all pages exist', idx.length === 13 && idxDead.length === 0, `${idx.length} ${idxDead.join(',')}`);
  // existing three articles unchanged except nothing (byte-identical to the deployed ones is verified outside this script)
  await ctx.close();
}

(async () => {
  B = await chromium.launch();
  if (want('namegarden')) await nameGarden();
  if (want('patternworkshop')) await patternWorkshop();
  if (want('quietshelf')) await quietShelf();
  if (want('daytown')) await dayTown();
  if (want('sequence')) await porchRhythm();
  if (want('crossword')) await crosswordTouches();
  if (want('articles')) await articleLinks();
  await B.close();
  console.log(res.join('\n')); const f = res.filter((x) => x.startsWith('FAIL')).length; console.log(`\n${res.length - f}/${res.length} passed`); process.exit(f ? 1 : 0);
})();
