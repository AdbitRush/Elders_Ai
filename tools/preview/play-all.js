// Plays every BrainPlay game end to end with real clicks (audit 2026-10-10, see AUDIT-2026-10-10.md).
//   node tools/preview/play-all.js <dir with node_modules/playwright> [baseUrl] [ids,comma] [width]
// Per game: a wrong move, a double-tap on a right answer, the rest right, the end screen, Level 2, back to hub, reopen.
// It reads gameState only to know the right answer; every move is a real click. Screenshots + JSON go to the OS temp dir.
const path = require('path'), fs = require('fs'), os = require('os');
const { chromium } = require(path.join(path.resolve(process.argv[2]), 'node_modules', 'playwright'));
const U = (process.argv[3] || 'https://games-preview.178-105-148-72.sslip.io').replace(/\/$/, '');
const ONLY = process.argv[4] ? process.argv[4].split(',') : null;
const W = +(process.argv[5] || 1280);
const OUT = path.join(os.tmpdir(), 'brainplay-play-all'); fs.mkdirSync(OUT, { recursive: true });
const SHOTS = OUT + '/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let b;
const report = {};

async function open(id, { lang = 'en', theme = 'light', diff = 'normal', w = W } = {}) {
  const mob = w < 500;
  const ctx = await b.newContext({ viewport: { width: w, height: mob ? 844 : 900 }, isMobile: mob, hasTouch: mob, serviceWorkers: 'block' });
  await ctx.addInitScript(([t, l, d]) => { try { if (sessionStorage.getItem('x')) return; sessionStorage.setItem('x', '1');
    localStorage.clear(); localStorage.setItem('gg-theme', t); localStorage.setItem('gg-lang', l); localStorage.setItem('gg_difficulty', d);
    localStorage.setItem('gg_name', 'Ruth'); localStorage.setItem('gg_avatar', '🌻'); localStorage.setItem('gg_profile_seen', '1'); } catch (e) {} }, [theme, lang, diff]);
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
  p.on('requestfailed', (r) => { if (!/google|analytics/.test(r.url())) errs.push('reqfail: ' + r.url().slice(0, 120)); });
  await p.goto(U + '/?lang=' + lang + '#' + id, { waitUntil: 'networkidle' }).catch(() => {});
  await sleep(1200);
  return { ctx, p, errs };
}
const gs = (p, id) => p.evaluate((id) => { const s = gameState[id]; return JSON.parse(JSON.stringify(s, (k, v) => (v instanceof Set ? [...v] : v instanceof HTMLElement ? undefined : v))); }, id);
const modalUp = (p) => p.evaluate(() => !document.getElementById('modal').classList.contains('hidden'));
const modalText = (p) => p.evaluate(() => document.getElementById('modalTitle').innerText + ' | ' + document.getElementById('modalBody').innerText);
async function waitModal(p, ms = 8000) { const t = Date.now(); while (Date.now() - t < ms) { if (await modalUp(p)) return true; await sleep(200); } return false; }
// click button in #gameContent whose onclick matches predicate on its attribute
async function clickWhere(p, fn) {
  const i = await p.evaluate((src) => { const f = eval(src); const bs = [...document.querySelectorAll('#gameContent [onclick]')]; return bs.findIndex((x) => f(x.getAttribute('onclick'), x)); }, fn.toString());
  if (i < 0) return false;
  await p.locator('#gameContent [onclick]').nth(i).click({ timeout: 4000 });
  return true;
}
async function nextLevelCheck(p, id, R) {
  await p.click('#nextLevelBtn');
  await sleep(1500);
  const lvl = await p.evaluate(() => document.getElementById('levelIndicator').innerText);
  const filled = await p.evaluate(() => document.getElementById('gameContent').children.length > 0);
  R.steps.push('next level -> "' + lvl + '", content ' + (filled ? 'rendered' : 'EMPTY'));
  if (!filled) R.defects.push('Next level shows an empty game area');
}
async function restartCheck(p, id, R) {
  await p.click('#backBtn').catch(() => p.evaluate(() => showHome()));
  await sleep(800);
  const home = await p.evaluate(() => !document.getElementById('homeScreen').classList.contains('hidden'));
  await p.evaluate((id) => document.querySelector(`.premium-card[onclick="loadGame('${id}')"]`).scrollIntoView(), id);
  await p.click(`.premium-card[onclick="loadGame('${id}')"]`);
  await sleep(1500);
  const ok = await p.evaluate((id) => gameState.active && gameState.currentId === id && document.getElementById('gameContent').children.length > 0, id);
  R.steps.push('back to hub ' + (home ? 'ok' : 'FAILED') + ', reopen from card ' + (ok ? 'ok' : 'FAILED'));
  if (!home || !ok) R.defects.push('Back/reopen failed');
}

// quiz family: idx field, how to find correct/wrong buttons
const QUIZ = {
  math: { idx: '_si', score: '_ss', right: (a) => { const m = a.match(/answerMath\((\d+),(\d+)\)/); return m && m[1] === m[2]; }, wrong: (a) => { const m = a.match(/answerMath\((\d+),(\d+)\)/); return m && m[1] !== m[2]; }, wrongAdvances: false },
  numseq: { idx: '_si', score: '_ss', right: (a) => { const m = a.match(/answerNumSeq\((\d+),(\d+)\)/); return m && m[1] === m[2]; }, wrong: (a) => { const m = a.match(/answerNumSeq\((\d+),(\d+)\)/); return m && m[1] !== m[2]; }, wrongAdvances: false },
  trivia: { idx: 'current', score: 'score', right: (a) => { const m = a.match(/answerTrivia\((\d+),(\d+)\)/); return m && m[1] === m[2]; }, wrong: (a) => { const m = a.match(/answerTrivia\((\d+),(\d+)\)/); return m && m[1] !== m[2]; }, wrongAdvances: true },
  truefalse: { idx: 'idx', score: 'score', right: (a) => { const m = a.match(/answerTF\((\w+),(\w+)\)/); return m && m[1] === m[2]; }, wrong: (a) => { const m = a.match(/answerTF\((\w+),(\w+)\)/); return m && m[1] !== m[2]; }, wrongAdvances: true },
  flags: { idx: 'idx', score: 'score', right: (a) => { const m = a.match(/answerFlag\((\d+),(\d+)\)/); return m && m[1] === m[2]; }, wrong: (a) => { const m = a.match(/answerFlag\((\d+),(\d+)\)/); return m && m[1] !== m[2]; }, wrongAdvances: true },
  proverbs: { idx: 'idx', score: 'score', right: (a) => { const m = a.match(/answerProv\((\d+),(\d+)\)/); return m && m[1] === m[2]; }, wrong: (a) => { const m = a.match(/answerProv\((\d+),(\d+)\)/); return m && m[1] !== m[2]; }, wrongAdvances: true },
  oddoneout: { idx: '_si', score: '_ss', right: (a) => /clickOdd\(true/.test(a), wrong: (a) => /clickOdd\(false/.test(a), wrongAdvances: false },
  colormatch: { idx: '_si', score: '_ss', ans: true, right: (a) => a.includes("'" + gameState.colormatch._answer + "'"), wrong: (a) => /_cmAnswer/.test(a) && !a.includes("'" + gameState.colormatch._answer + "'"), wrongAdvances: true },
  clock: { idx: '_si', score: '_ss', right: (a) => a.includes("'" + gameState.clock._answer + "'"), wrong: (a) => /_clkAnswer/.test(a) && !a.includes("'" + gameState.clock._answer + "'"), wrongAdvances: true },
  counting: { idx: '_si', score: '_ss', right: (a) => a === '_cntAnswer(this,' + gameState.counting._answer + ')', wrong: (a) => /_cntAnswer/.test(a) && a !== '_cntAnswer(this,' + gameState.counting._answer + ')', wrongAdvances: true },
  category: { idx: '_si', score: '_ss', right: (a, x) => /_catAnswer/.test(a) && x.innerText.trim() === gameState.category._answer, wrong: (a, x) => /_catAnswer/.test(a) && x.innerText.trim() !== gameState.category._answer, wrongAdvances: true },
  letters: { idx: '_si', score: '_ss', right: (a) => a.includes("'" + gameState.letters._answer + "'"), wrong: (a) => /_ltrAnswer/.test(a) && !a.includes("'" + gameState.letters._answer + "'"), wrongAdvances: true },
};

async function playQuiz(p, id, R) {
  const q = QUIZ[id];
  let s = await gs(p, id);
  const total = s._sq || s.perLevel || (s.questions && s.questions.length);
  R.steps.push('started: ' + total + ' questions');
  // 1 wrong answer first
  const before = s[q.idx];
  await clickWhere(p, q.wrong); await sleep(1300);
  s = await gs(p, id);
  R.steps.push('wrong answer -> ' + (s[q.idx] === before ? 'stays on question (retry)' : 'moves on') + ', score ' + s[q.score]);
  // double tap test on the right answer
  const b2 = s[q.idx];
  const i = await p.evaluate((src) => { const f = eval(src); return [...document.querySelectorAll('#gameContent [onclick]')].findIndex((x) => f(x.getAttribute('onclick'), x)); }, q.right.toString());
  await p.locator('#gameContent [onclick]').nth(i).dblclick();
  await sleep(1300);
  s = await gs(p, id);
  const jumped = s[q.idx] - b2;
  R.steps.push('double-tap on right answer -> question index +' + jumped + ', score ' + s[q.score]);
  if (jumped > 1) R.defects.push(`Double-tap counts twice: one double-tap advanced ${jumped} questions (score ${s[q.score]}); a question is skipped/scored without being seen`);
  // answer the rest correctly
  let guard = 0;
  while (!(await modalUp(p)) && guard++ < 40) {
    if (!(await clickWhere(p, q.right))) { await sleep(400); continue; }
    await sleep(900);
  }
  const up = await waitModal(p, 4000);
  if (!up) { R.defects.push('Session never finished (no end modal)'); return; }
  R.steps.push('end modal: ' + (await modalText(p)));
  await nextLevelCheck(p, id, R);
}

const PLAY = {
  async memory(p, R) {
    let s = await gs(p, 'memory'); R.steps.push(s.pairs + ' pairs');
    const vals = await p.evaluate(() => [...document.querySelectorAll('.card-inner')].map((c) => c.dataset.val));
    // mismatch first
    const a = 0, bb = vals.findIndex((v, i) => i > 0 && v !== vals[0]);
    await p.click('#m-card-' + a); await p.click('#m-card-' + bb); await sleep(1300);
    const back = await p.evaluate(() => document.querySelectorAll('.card-inner.flipped').length);
    R.steps.push('mismatch -> flipped back: ' + (back === 0));
    if (back !== 0) R.defects.push('Mismatched cards did not flip back');
    const done = new Set();
    for (let i = 0; i < vals.length; i++) { if (done.has(i)) continue; const j = vals.findIndex((v, k) => k !== i && v === vals[i]); done.add(i); done.add(j);
      await p.click('#m-card-' + i); await p.click('#m-card-' + j); await sleep(250); }
    if (!(await waitModal(p))) return R.defects.push('No win after all pairs matched');
    R.steps.push('end modal: ' + (await modalText(p))); await nextLevelCheck(p, 'memory', R);
  },
  async pairs(p, R) {
    const chips = await p.evaluate(() => [...document.querySelectorAll('.pair-chip')].map((c) => [c.id, c.dataset.idx, c.dataset.type]));
    R.steps.push(chips.length / 2 + ' pairs');
    const w = chips.find((c) => c[1] !== chips[0][1] && c[2] !== chips[0][2]);
    await p.click('#' + chips[0][0]); await p.click('#' + w[0]); await sleep(900);
    for (const c of chips.filter((c) => c[2] === 'a')) { const m = chips.find((d) => d[1] === c[1] && d[2] === 'b'); await p.click('#' + c[0]); await p.click('#' + m[0]); await sleep(150); }
    if (!(await waitModal(p))) return R.defects.push('No win after all pairs');
    R.steps.push('end modal: ' + (await modalText(p))); await nextLevelCheck(p, 'pairs', R);
  },
  async shapes(p, R) {
    const n = await p.evaluate(() => gameState.shapes.total); R.steps.push(n + ' shapes');
    await p.locator('#shapePick > div').nth(0).click();
    const wrongSlot = await p.evaluate(() => [...document.querySelectorAll('#shapeDrop > div')].findIndex((d) => d.dataset.target !== '0'));
    await p.locator('#shapeDrop > div').nth(wrongSlot).click(); await sleep(500);
    for (let id = 0; id < n; id++) { await p.locator('#shapePick > div').nth(id).click(); await p.click(`#shapeDrop > div[data-target="${id}"]`); await sleep(100); }
    if (!(await waitModal(p))) return R.defects.push('No win after all shapes placed');
    R.steps.push('end modal: ' + (await modalText(p))); await nextLevelCheck(p, 'shapes', R);
  },
  async solitaire(p, R) {
    const cards = await p.evaluate(() => gameState.solitaire.cards.map((c) => c.val)); R.steps.push(cards.length + ' cards');
    const used = new Set();
    for (let i = 0; i < cards.length; i++) { if (used.has(i)) continue;
      if (cards[i] === 13) { await p.click('#sol-card-' + i); used.add(i); continue; }
      const j = cards.findIndex((v, k) => !used.has(k) && k !== i && v + cards[i] === 13); used.add(i); used.add(j);
      await p.click('#sol-card-' + i); await p.click('#sol-card-' + j); }
    if (!(await waitModal(p))) return R.defects.push('No win after all cards cleared');
    R.steps.push('end modal: ' + (await modalText(p))); await nextLevelCheck(p, 'solitaire', R);
  },
  async wordsearch(p, R) {
    const info = await p.evaluate(() => { const cells = [...document.querySelectorAll('.ws-cell')]; const n = Math.sqrt(cells.length); const g = []; cells.forEach((c) => { (g[+c.dataset.r] = g[+c.dataset.r] || [])[+c.dataset.c] = c.innerText.trim(); }); return { n, g, words: gameState.wordsearch.words }; });
    R.steps.push(info.words.length + ' words in ' + info.n + 'x' + info.n + ': ' + info.words.join(','));
    for (const w of info.words) { const ch = [...w]; let path = null;
      for (let r = 0; r < info.n && !path; r++) for (let c = 0; c < info.n && !path; c++) {
        if (c + ch.length <= info.n && ch.every((x, i) => info.g[r][c + i] === x)) path = ch.map((_, i) => [r, c + i]);
        else if (r + ch.length <= info.n && ch.every((x, i) => info.g[r + i][c] === x)) path = ch.map((_, i) => [r + i, c]); }
      if (!path) { R.defects.push('Word ' + w + ' not findable in grid'); continue; }
      for (const [r, c] of path) await p.click(`.ws-cell[data-r="${r}"][data-c="${c}"]`); await sleep(150); }
    if (!(await waitModal(p))) return R.defects.push('No win after all words found');
    R.steps.push('end modal: ' + (await modalText(p))); await nextLevelCheck(p, 'wordsearch', R);
  },
  async sequence(p, R) {
    for (let round = 1; round <= 3; round++) {
      const t = Date.now(); while (!(await p.evaluate(() => gameState.sequence.waitingForUser)) && Date.now() - t < 15000) await sleep(200);
      const seq = await p.evaluate(() => gameState.sequence.sequence);
      for (const id of seq) { await p.click('#sequence-' + id); await sleep(250); }
      R.steps.push('round ' + round + ' repeated (' + seq.length + ' colours): ' + (await p.locator('#sequence-score').innerText()));
      await sleep(400);
    }
    const t = Date.now(); while (!(await p.evaluate(() => gameState.sequence.waitingForUser)) && Date.now() - t < 15000) await sleep(200);
    const seq = await p.evaluate(() => gameState.sequence.sequence);
    await p.click('#sequence-' + ((seq[0] + 1) % 4)); await sleep(1500);
    const end = await p.evaluate(() => document.getElementById('gameContent').innerText.replace(/\s+/g, ' '));
    R.steps.push('wrong tap -> end screen: "' + end.slice(0, 90) + '"');
    await p.click('text=Play Again'); await sleep(2500);
    const lvl = await p.evaluate(() => gameState.sequence.sequence.length);
    R.steps.push('Play Again -> new sequence length ' + lvl);
    if (lvl !== 1) R.defects.push('Play Again did not restart at level 1 (sequence length ' + lvl + ')');
  },
  async sudoku(p, R) {
    const s = await gs(p, 'sudoku');
    const holes = []; for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (!s.given[r][c]) holes.push([r, c]);
    R.steps.push(holes.length + ' empty cells');
    // a wrong digit first
    const [r0, c0] = holes[0]; const wrong = s.sol[r0].find((v, i) => i !== c0 && v !== s.sol[r0][c0] && true);
    await p.click(`[onclick="selectSudoku9(${r0},${c0})"]`); await p.click(`[onclick="fillSudoku9(${s.sol[r0][(c0 + 1) % 9]})"]`); await sleep(200);
    const red = await p.evaluate(([r, c]) => getComputedStyle(document.querySelector(`[onclick="selectSudoku9(${r},${c})"]`)).color, [r0, c0]);
    R.steps.push('conflicting digit shown in colour ' + red);
    for (const [r, c] of holes) { await p.click(`[onclick="selectSudoku9(${r},${c})"]`); await p.click(`[onclick="fillSudoku9(${s.sol[r][c]})"]`); }
    if (!(await waitModal(p))) return R.defects.push('No win after a correct grid');
    R.steps.push('end modal: ' + (await modalText(p))); await nextLevelCheck(p, 'sudoku', R);
  },
  async hangman(p, R) {
    const s = await gs(p, 'hangman'); R.steps.push('word "' + s.word + '" hint "' + s.hint + '", ' + s.maxWrong + ' mistakes allowed');
    const keys = await p.evaluate(() => [...document.querySelectorAll('#gameContent button[onclick^="guessLetter"]')].map((x) => x.innerText.trim()));
    const norm = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };
    const need = [...new Set([...s.word].map((c) => norm[c] || c))];
    const missing = need.filter((c) => !keys.includes(c));
    if (missing.length) { R.defects.push('UNWINNABLE: the keyboard has no key for "' + missing.join('') + '" (word ' + s.word + ', keyboard ' + keys.slice(0, 6).join('') + '...)'); }
    const wrongKey = keys.find((k) => !need.includes(k));
    await p.click(`#gameContent button[onclick="guessLetter('${wrongKey}')"]`); await sleep(200);
    R.steps.push('wrong letter -> ' + (await p.evaluate(() => gameState.hangman.wrong)) + ' mistake(s)');
    for (const c of need) { if (!keys.includes(c)) continue; await p.click(`#gameContent button[onclick="guessLetter('${c}')"]`); await sleep(120); }
    if (missing.length) {
      // lose path instead
      for (const k of keys.filter((k) => !need.includes(k)).slice(1)) { if (await p.evaluate(() => gameState.hangman.wrong >= gameState.hangman.maxWrong)) break; await p.click(`#gameContent button[onclick="guessLetter('${k}')"]`).catch(() => {}); }
      R.steps.push('lose screen: "' + (await p.evaluate(() => document.getElementById('gameContent').innerText.replace(/\s+/g, ' '))).slice(0, 120) + '"');
      return;
    }
    if (!(await waitModal(p))) return R.defects.push('No win after all letters');
    R.steps.push('end modal: ' + (await modalText(p))); await nextLevelCheck(p, 'hangman', R);
    // lose path on level 2
    const keys2 = await p.evaluate(() => [...document.querySelectorAll('#gameContent button[onclick^="guessLetter"]')].map((x) => x.innerText.trim()));
    const w2 = await p.evaluate(() => [...gameState.hangman.word]);
    for (const k of keys2.filter((k) => !w2.includes(k))) { if (await p.evaluate(() => gameState.hangman.wrong >= gameState.hangman.maxWrong)) break; await p.click(`#gameContent button[onclick="guessLetter('${k}')"]`); }
    const txt = await p.evaluate(() => document.getElementById('gameContent').innerText.replace(/\s+/g, ' '));
    R.steps.push('lose path -> "' + txt.slice(0, 100) + '"');
    await p.click('text=New Word').catch(() => R.defects.push('No New Word button after losing')); await sleep(400);
    R.steps.push('New Word -> ' + (await p.evaluate(() => gameState.hangman.word.length)) + '-letter word, mistakes reset ' + (await p.evaluate(() => gameState.hangman.wrong === 0)));
  },
  async recall(p, R) {
    const s = await gs(p, 'recall'); R.steps.push('study ' + s.targets.length + ' items: ' + s.targets.join(', '));
    await p.click('text=Got them! Continue'); await sleep(400);
    // fail path: select nothing, Check
    await p.click('text=Check'); await sleep(500);
    const fail = await p.evaluate(() => document.getElementById('gameContent').innerText.includes('Found'));
    R.steps.push('check with nothing selected -> "Found 0 of N" + Try Again: ' + fail);
    await p.click('text=Try Again'); await sleep(400);
    const s2 = await gs(p, 'recall');
    await p.click('text=Got them! Continue'); await sleep(400);
    const all = await p.evaluate(() => gameState.recall._all);
    for (let i = 0; i < all.length; i++) if (s2.targets.includes(all[i])) await p.locator('.recall-item').nth(i).click();
    await p.click('text=Check');
    if (!(await waitModal(p))) return R.defects.push('No win after selecting all studied items');
    R.steps.push('end modal: ' + (await modalText(p))); await nextLevelCheck(p, 'recall', R);
  },
  async digitspan(p, R) {
    for (let round = 0; round < 5; round++) {
      await p.waitForSelector('#ds-pad:not(.hidden)', { timeout: 12000 });
      const t = await p.evaluate(() => gameState.digitspan._target);
      const digits = round === 0 ? [...t].reverse().join('') === t ? '0' + t.slice(1) : [...t].reverse().join('') : t;
      for (const d of digits) await p.click(`#ds-pad button[onclick="_dsKey(${d})"]`);
      if (round === 1) { await p.click('#ds-pad button[onclick="_dsKey(-2)"]'); await p.click('#ds-pad button[onclick="_dsKey(-2)"]').catch(() => {}); }
      else await p.click('#ds-pad button[onclick="_dsKey(-2)"]');
      await sleep(round === 0 ? 1800 : 600);
      const s = await gs(p, 'digitspan');
      R.steps.push('round ' + (round + 1) + (round === 0 ? ' (typed wrong)' : round === 1 ? ' (OK double-tapped)' : '') + ' -> round index ' + s._si + ', score ' + s._ss);
      if (round === 1 && s._si > 2) { R.defects.push('Double-tap on OK scores the same number twice and skips a round'); }
      if (await modalUp(p)) break;
    }
    if (!(await waitModal(p, 6000))) return R.defects.push('Session never finished');
    R.steps.push('end modal: ' + (await modalText(p))); await nextLevelCheck(p, 'digitspan', R);
  },
  async unscramble(p, R) {
    let guard = 0, first = true;
    while (!(await modalUp(p)) && guard++ < 15) {
      const s = await gs(p, 'unscramble');
      const tiles = await p.evaluate(() => [...document.querySelectorAll('.letter-tile')].map((t) => t.innerText));
      if (first) { // deliberately wrong order
        const order = tiles.map((_, i) => i).reverse(); const formed = order.map((i) => tiles[i]).join('');
        if (formed !== s.word) { for (const i of order) await p.click('#lt-' + i); await sleep(800);
          R.steps.push('wrong spelling -> cleared for retry: ' + (await p.evaluate(() => gameState.unscramble.answer.length === 0)) + ', still word ' + ((await gs(p, 'unscramble'))._si + 1)); }
        first = false; continue;
      }
      const used = new Set();
      for (const ch of [...s.word]) { const i = tiles.findIndex((t, k) => t === ch && !used.has(k)); used.add(i); await p.click('#lt-' + i); }
      await sleep(1000);
    }
    if (!(await waitModal(p))) return R.defects.push('Session never finished');
    R.steps.push('end modal: ' + (await modalText(p))); await nextLevelCheck(p, 'unscramble', R);
  },
  async lifesim(p, R) {
    await p.locator('#gameContent button').first().click(); await sleep(400);
    const n = await p.evaluate(() => gameState.lifesim._scenes.length); R.steps.push('era picked, ' + n + ' scenes');
    await clickWhere(p, (a) => a === '_lsChoose(0)'); await sleep(1500);
    R.steps.push('"bad" choice -> scene ' + ((await gs(p, 'lifesim'))._si + 1) + ', hearts ' + (await gs(p, 'lifesim'))._hearts);
    const b2 = (await gs(p, 'lifesim'))._si;
    const i = await p.evaluate(() => [...document.querySelectorAll('#gameContent [onclick]')].findIndex((x) => x.getAttribute('onclick') === '_lsChoose(1)'));
    await p.locator('#gameContent [onclick]').nth(i).dblclick(); await sleep(1500);
    const j = (await gs(p, 'lifesim'))._si - b2; R.steps.push('double-tap -> scene +' + j);
    if (j > 1) R.defects.push('Double-tap on a choice skips a scene and counts two hearts');
    let g = 0; while (!(await modalUp(p)) && g++ < 10) { await clickWhere(p, (a) => a === '_lsChoose(1)'); await sleep(1200); }
    if (!(await waitModal(p))) return R.defects.push('Never finished');
    R.steps.push('end modal: ' + (await modalText(p))); await nextLevelCheck(p, 'lifesim', R);
  },
  async safari(p, R) {
    const n = await p.evaluate(() => gameState.safari._rounds); R.steps.push(n + ' rounds, ' + (await p.evaluate(() => gameState.safari._sprites.length)) + ' animals moving');
    const imgsOk = await p.evaluate(() => [...document.querySelectorAll('.sf-a img')].every((i) => i.complete && i.naturalWidth > 0));
    R.steps.push('animal photos loaded: ' + imgsOk);
    // wrong tap
    await p.evaluate(() => [...document.querySelectorAll('.sf-a')].find((e) => e.dataset.id !== gameState.safari._target).click());
    R.steps.push('wrong animal -> score ' + (await p.evaluate(() => gameState.safari._found)));
    for (let k = 0; k < n; k++) {
      const box = await p.evaluate(() => { const e = [...document.querySelectorAll('.sf-a')].find((e) => e.dataset.id === gameState.safari._target); const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
      await p.mouse.click(box[0], box[1]); await sleep(300);
    }
    const found = await p.evaluate(() => gameState.safari._found);
    R.steps.push('real mouse taps on moving target -> found ' + found + '/' + n);
    if (found < n) { R.defects.push(`Moving targets: ${n - found} of ${n} real taps at the animal's position missed`); for (let k = found; k < n; k++) { await p.evaluate(() => [...document.querySelectorAll('.sf-a')].find((e) => e.dataset.id === gameState.safari._target).click()); await sleep(200); } }
    if (!(await waitModal(p))) return R.defects.push('Never finished');
    R.steps.push('end modal: ' + (await modalText(p))); await nextLevelCheck(p, 'safari', R);
  },
  async blocks(p, R) {
    const dropBtn = p.locator('#gameContent button').nth(4);
    const t = Date.now(); let presses = 0;
    while (!(await modalUp(p)) && Date.now() - t < 60000) {
      if (presses % 3 === 0) await p.locator('#gameContent button').nth(presses % 6 < 3 ? 0 : 2).dispatchEvent('pointerdown');
      await dropBtn.dispatchEvent('pointerdown'); await dropBtn.dispatchEvent('pointerup'); presses++; await sleep(120);
    }
    const sc = await p.evaluate(() => (document.getElementById('tet-score') || {}).innerText);
    R.steps.push(presses + ' drops; score ' + sc + '; ' + ((await modalUp(p)) ? 'game over -> end modal: ' + (await modalText(p)) : 'NO END MODAL'));
    if (!(await modalUp(p))) return R.defects.push('Game over never shows the end modal');
    await nextLevelCheck(p, 'blocks', R);
  },
  async klondike(p, R) {
    const before = await p.evaluate(() => gameState.klondike.stock.length);
    await p.click('text=Draw').catch(() => p.locator('#gameContent [onclick="klDraw()"]').first().click());
    await sleep(200);
    R.steps.push('draw: stock ' + before + ' -> ' + (await p.evaluate(() => gameState.klondike.stock.length)));
    // a few hint-guided moves
    let moves = 0;
    for (let k = 0; k < 6; k++) {
      await p.locator('#gameContent [onclick="klHint()"]').first().click(); await sleep(150);
      const sel = await p.evaluate(() => gameState.klondike.sel);
      if (!sel) { await p.locator('#gameContent [onclick="klDraw()"]').first().click(); continue; }
      // find a legal target for the hinted card
      const tgt = await p.evaluate(() => { const s = gameState.klondike, sel = s.sel; const c = sel.where === 'w' ? s.waste[s.waste.length - 1] : s.t[sel.pi][sel.ci];
        const single = sel.where === 'w' || sel.ci === s.t[sel.pi].length - 1;
        if (single) for (let fi = 0; fi < 4; fi++) if (_klCanFoundation(c, fi)) return `klTap('f',${fi},-1)`;
        for (let ti = 0; ti < 7; ti++) if (ti !== sel.pi && _klCanTableau(c, ti)) { const n = s.t[ti].length; return n ? `klTap('t',${ti},${n - 1})` : `klTap('t',${ti},-1)`; } return null; });
      if (!tgt) continue;
      const loc = p.locator(`#gameContent [onclick="${tgt}"]`);
      if (await loc.count()) { await loc.first().click(); moves++; } await sleep(150);
    }
    R.steps.push('hint-guided legal moves made: ' + moves + ' (moves counter ' + (await p.evaluate(() => gameState.klondike.moves)) + ')');
    const ub = await p.evaluate(() => gameState.klondike.undo.length);
    await p.locator('#gameContent [onclick="klUndo()"]').first().click(); await sleep(150);
    R.steps.push('undo: history ' + ub + ' -> ' + (await p.evaluate(() => gameState.klondike.undo.length)));
    // illegal move
    // win handling: put the board one move from done
    await p.evaluate(() => { const s = gameState.klondike; s.f = [0, 1, 2, 3].map((su) => Array.from({ length: 13 }, (_, i) => ({ v: i + 1, s: su, up: true }))); const k = s.f[0].pop();
      s.t = [[], [], [], [], [], [], []]; s.stock = []; s.waste = [k]; s.sel = null; _klRender(document.getElementById('gameContent')); });
    await p.locator(`#gameContent [onclick="klTap('w',0,0)"]`).first().click(); await sleep(100);
    await p.locator(`#gameContent [onclick="klTap('w',0,0)"]`).first().click().catch(() => {});
    if (!(await waitModal(p))) return R.defects.push('Last card to foundation did not produce a win (state forced one move from done)');
    R.steps.push('forced last move -> end modal: ' + (await modalText(p)));
    await nextLevelCheck(p, 'klondike', R);
  },
  async jigsaw(p, R) {
    await p.click('.jig-chip[data-n="6"]'); await p.click('.jig-btn-go'); await p.waitForSelector('.jig-slot', { timeout: 10000 });
    const S = await p.evaluate(() => JIGSAW_STATE.piecesArr.map((x) => x.idx));
    R.steps.push(S.length + ' pieces');
    // wrong slot
    const p0 = 0; const wrongSlot = (S[p0] + 1) % S.length;
    await p.click(`.jig-piece[data-piece="${p0}"]`); await p.click(`.jig-slot[data-slot="${wrongSlot}"]`); await sleep(300);
    R.steps.push('wrong slot -> rejected: ' + (await p.evaluate(() => JIGSAW_STATE.placedCount === 0)));
    await p.click(`.jig-piece[data-piece="${p0}"]`).catch(() => {}); // deselect
    await p.evaluate(() => { JIGSAW_STATE.selected = -1; });
    for (let si = 0; si < S.length; si++) { await p.click(`.jig-piece[data-piece="${si}"]`); await p.click(`.jig-slot[data-slot="${S[si]}"]`); await sleep(120); }
    if (!(await waitModal(p))) return R.defects.push('No win after all pieces placed');
    R.steps.push('end modal: ' + (await modalText(p))); await nextLevelCheck(p, 'jigsaw', R);
  },
};

(async () => {
  b = await chromium.launch();
  const ids = ONLY || await (async () => { const { ctx, p } = await open(''); const g = await p.evaluate(() => window.GAME_IDS); await ctx.close(); return g; })();
  for (const id of ids) {
    const R = { steps: [], defects: [] };
    const { ctx, p, errs } = await open(id);
    try {
      await p.screenshot({ path: SHOTS + id + '-start-' + W + '.png' });
      if (QUIZ[id]) await playQuiz(p, id, R); else if (PLAY[id]) await PLAY[id](p, R); else R.defects.push('no driver');
      await p.screenshot({ path: SHOTS + id + '-after-' + W + '.png' });
      await restartCheck(p, id, R);
    } catch (e) { R.defects.push('DRIVER/GAME ERROR: ' + e.message.split('\n')[0]); await p.screenshot({ path: SHOTS + id + '-error-' + W + '.png' }).catch(() => {}); }
    R.errors = [...new Set(errs)];
    report[id] = R;
    console.log('\n## ' + id + (R.defects.length || R.errors.length ? '  [ISSUES]' : '  [OK]'));
    R.steps.forEach((s) => console.log('  - ' + s)); R.defects.forEach((s) => console.log('  ! ' + s)); R.errors.forEach((s) => console.log('  E ' + s));
    await ctx.close();
  }
  fs.writeFileSync(OUT + '/play-' + W + (ONLY ? '-' + ONLY.join('_').slice(0, 40) : '') + '.json', JSON.stringify(report, null, 1));
  await b.close();
})();
