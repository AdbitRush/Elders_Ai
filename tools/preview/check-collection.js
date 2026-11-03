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

(async () => {
  B = await chromium.launch();
  if (want('namegarden')) await nameGarden();
  if (want('patternworkshop')) await patternWorkshop();
  if (want('quietshelf')) await quietShelf();
  await B.close();
  console.log(res.join('\n')); const f = res.filter((x) => x.startsWith('FAIL')).length; console.log(`\n${res.length - f}/${res.length} passed`); process.exit(f ? 1 : 0);
})();
