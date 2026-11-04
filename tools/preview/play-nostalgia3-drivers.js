// Game drivers for play-nostalgia3.js (nostalgia batch 3: 50 more games). Same contract as play-nostalgia2-drivers.js:
// play(p, R, H) plays a REAL game to its end screen with clicks / keys; gameState is read only to choose moves and to
// check rules. Each driver also tries at least one move the rules forbid and records the game's answer.
const D = {};
// ---------- batch A: classic puzzles ----------
D.hanoi = { restartK: 'restart', heKey: null, async play(p, R, H) {
  await H.click(p, '[onclick="hnTap(1)"]'); R.steps.push('lift from an empty peg -> ' + (await H.msg(p)).slice(0, 40));
  const n = (await H.G(p, 'hanoi')).n, mv = []; (function h(k, a, b, c) { if (!k) return; h(k - 1, a, c, b); mv.push([a, c]); h(k - 1, b, a, c); })(n, 0, 1, 2);
  // a forbidden move first: disk 2 onto disk 1
  await H.click(p, '[onclick="hnTap(0)"]'); await H.click(p, '[onclick="hnTap(1)"]'); await H.click(p, '[onclick="hnTap(0)"]'); await H.click(p, '[onclick="hnTap(1)"]');
  R.steps.push('bigger on smaller -> ' + (await H.msg(p)).slice(0, 45)); await H.btn(p, 'Undo');
  for (const [a, c] of mv) { if (await H.modalUp(p)) break; await p.keyboard.press('Digit' + (a + 1)); await p.keyboard.press('Digit' + (c + 1)); }
  R.steps.push(`${mv.length} moves by keyboard digits; moves counted ${(await H.G(p, 'hanoi')).moves}`);
} };
D.queens = { heKey: { code: 'KeyH', key: 'י' }, async play(p, R, H) {
  const g = await H.G(p, 'queens');
  if (!g.fixed.length) { await H.click(p, '[onclick="qnTap(0,0)"]'); await H.click(p, '[onclick="qnTap(1,1)"]'); R.steps.push('two queens on a diagonal -> ' + (await H.msg(p)).slice(0, 40)); await H.btn(p, 'Clear board'); }
  const sol = await p.evaluate(() => { const g = gameState.queens, fx = {}; g.fixed.forEach(([r, c]) => (fx[r] = c)); return _qnSolve(g.n, fx); });
  for (let r = 0; r < g.n; r++) { if (await H.modalUp(p)) break; if (g.fixed.some((x) => x[0] === r)) continue; await H.click(p, `[onclick="qnTap(${r},${sol[r]})"]`); }
  R.steps.push(`${g.n} queens placed from a solver solution`);
} };
D.knightour = { heKey: null, focusSel: '#gameContent [data-k="s0_0"]', async play(p, R, H) {
  const g = await H.G(p, 'knightour');
  if (!g.path.length) await H.click(p, '[onclick="ktTap(0,0)"]');
  await H.click(p, '[onclick="ktTap(0,1)"]'); R.steps.push('non-knight move -> ' + (await H.msg(p)).slice(0, 40));
  const tour = await p.evaluate(() => { const g = gameState.knightour, n = g.n, v = g.v.map((r) => r.slice()), path = g.path.map((x) => x.slice());
    const mv = (r, c) => _KT_D.map(([a, b]) => [r + a, c + b]).filter(([y, x]) => y >= 0 && y < n && x >= 0 && x < n && !v[y][x]);
    let nodes = 0; const go = () => { if (path.length === n * n) return true; if (++nodes > 200000) return false; const [r, c] = path[path.length - 1]; const ms = mv(r, c).sort((a, b) => mv(...a).length - mv(...b).length);
      for (const m of ms) { v[m[0]][m[1]] = 1; path.push(m); if (go()) return true; path.pop(); v[m[0]][m[1]] = 0; } return false; };
    return go() ? path : null; });
  if (!tour) return R.defects.push('test search found no tour');
  for (const [r, c] of tour.slice((await H.G(p, 'knightour')).path.length)) { if (await H.modalUp(p)) break; await H.click(p, `[onclick="ktTap(${r},${c})"]`); }
  R.steps.push(`tour of ${tour.length} squares played`);
} };
D.jugs = { heKey: null, async play(p, R, H) {
  await H.click(p, '[onclick="jgPick(0)"]'); R.steps.push('pour from an empty jug -> ' + (await H.msg(p)).slice(0, 35));
  for (let k = 0; k < 3; k++) {
    if (await H.modalUp(p)) break;
    const plan = await p.evaluate(() => { const g = gameState.jugs, P = g.P, key = (v) => v.join(','), q = [[g.v, []]], seen = new Set([key(g.v)]);
      for (let h = 0; h < q.length; h++) { const [v, path] = q[h]; if (_jgDone(P, v)) return path;
        const acts = []; v.forEach((x, i) => { if (!P.noTap) { acts.push(['f', i]); acts.push(['e', i]); } v.forEach((_, j) => { if (i !== j) acts.push(['p', i, j]); }); });
        for (const a of acts) { const n = v.slice(); if (a[0] === 'f') n[a[1]] = P.cap[a[1]]; else if (a[0] === 'e') n[a[1]] = 0; else { const t = Math.min(n[a[1]], P.cap[a[2]] - n[a[2]]); if (!t) continue; n[a[1]] -= t; n[a[2]] += t; } const kk = key(n); if (seen.has(kk)) continue; seen.add(kk); q.push([n, path.concat([a])]); } }
      return null; });
    const par = (await H.G(p, 'jugs')).par; if (!plan || plan.length !== par) R.defects.push(`puzzle ${k + 1}: plan ${plan && plan.length} vs par ${par}`);
    for (const a of plan) { if (a[0] === 'f') await H.click(p, `[onclick="jgFill(${a[1]})"]`); else if (a[0] === 'e') await H.click(p, `[onclick="jgEmpty(${a[1]})"]`); else { await H.click(p, `[onclick="jgPick(${a[1]})"]`); await H.click(p, `[onclick="jgPick(${a[2]})"]`); } }
    R.steps.push(`puzzle ${k + 1}: ${plan.length} steps (par ${par})`);
    if (k < 2) await H.btn(p, 'Next puzzle');
  }
} };
D.river = { heKey: { code: 'KeyC', key: 'ב' }, async play(p, R, H) {
  const plan = await p.evaluate(() => { const g = gameState.river, sc = g.sc, n = sc.who.length;
    const key = (s, b, m) => s.join('') + b + (sc.times ? ':' + m : ''); const q = [[g.side, g.boat, 0, []]], seen = new Set([key(g.side, 0, 0)]);
    for (let h = 0; h < q.length; h++) { const [s, b, m, path] = q[h]; if (s.every((x) => x === 1) && (!sc.times || m <= sc.limit)) return path;
      const here = [...Array(n).keys()].filter((i) => s[i] === b), groups = []; here.forEach((i) => groups.push([i])); here.forEach((i, a) => here.slice(a + 1).forEach((j) => groups.push([i, j])));
      for (const gr of groups) { if (sc.driver && !gr.includes(0)) continue; const ns = s.slice(); gr.forEach((i) => (ns[i] = 1 - b)); const nm = m + (sc.times ? Math.max(...gr.map((i) => sc.times[i])) : 0);
        if (sc.times && nm > sc.limit) continue; if (_rvBad(sc, ns, 1 - b)) continue; const kk = key(ns, 1 - b, nm); if (seen.has(kk)) continue; seen.add(kk); q.push([ns, 1 - b, nm, path.concat([gr])]); } }
    return null; });
  if (!plan) return R.defects.push('test search found no plan');
  // a rule-breaking trip first, then Undo
  const bad = await p.evaluate(() => { const g = gameState.river; return g.sc.driver ? [0, 3] : g.sc.times ? null : [0, 1]; });
  if (bad) { for (const i of bad) await H.click(p, `[onclick="rvPick(${i})"]`); await H.btn(p, 'Cross'); R.steps.push('bad trip -> ' + (await p.locator('#gameContent .rv-bad').innerText().catch(() => '(none)')).slice(0, 50)); await H.btn(p, 'Undo'); }
  for (const gr of plan) { for (const i of gr) await H.click(p, `[onclick="rvPick(${i})"]`); await H.btn(p, 'Cross'); }
  R.steps.push(`${plan.length} trips`);
} };
D.balance = { heKey: { code: 'KeyW', key: "'" }, async play(p, R, H) {
  const g = await H.G(p, 'balance');
  await H.btn(p, 'Weigh'); R.steps.push('weigh with empty pans -> ' + (await H.msg(p)).slice(0, 40));
  // a fair first weighing: 4 against 4 (3 v 3 on easy), then choose with what the test knows
  const k = g.n === 9 ? 3 : 4;
  for (let i = 0; i < k; i++) await H.click(p, `[onclick="blCoin(${i})"]`);
  for (let i = k; i < 2 * k; i++) { await H.click(p, `[onclick="blCoin(${i})"]`); await H.click(p, `[onclick="blCoin(${i})"]`); }
  await H.btn(p, 'Weigh'); const g2 = await H.G(p, 'balance'); R.steps.push('weighing 1 -> ' + g2.log[0].replace(/<[^>]+>/g, ''));
  const want = g2.fake < k ? -1 : g2.fake < 2 * k ? 1 : 0, tl = g2.tilt * (g2.heavy ? 1 : -1);
  if (tl !== want) R.defects.push(`scale answer looks wrong: tilt ${g2.tilt}, fake ${g2.fake}`);
  await H.click(p, `[onclick="blCoin(${g2.fake})"]`);
  await H.click(p, g2.heavy ? '[data-k="gh"]' : '[data-k="gl"]');
} };
D.magicsq = { heKey: null, async play(p, R, H) {
  const g = await H.G(p, 'magicsq');
  const empty = g.g.map((x, i) => (x ? -1 : i)).filter((i) => i >= 0);
  await H.click(p, `[onclick="msSel(${empty[0]})"]`); await H.click(p, `[data-k="n${g.sol[empty[1]]}"]`); R.steps.push('wrong number in a square -> sum shown, no win: ' + !(await H.modalUp(p)));
  for (const i of empty) { if (await H.modalUp(p)) break; await H.click(p, `[onclick="msSel(${i})"]`); await H.click(p, `[data-k="n${g.sol[i]}"]`); }
  R.steps.push(`${empty.length} squares filled to a ${g.n} x ${g.n} magic square`);
} };
D.numpyramid = { focusSel: '#gameContent [data-k="k7"]', heKey: null, async play(p, R, H) {
  const g = await H.G(p, 'numpyramid');
  const left = []; g.P.forEach((row, r) => row.forEach((_, i) => { if (!g.v[r + ',' + i]) left.push([r, i]); }));
  const [r0, i0] = left[0]; await H.click(p, `[onclick="npSel('${r0},${i0}')"]`); for (const ch of String(g.P[r0][i0] + 1)) await H.click(p, `[data-k="k${ch}"]`); await H.btn(p, 'OK');
  R.steps.push('wrong number -> ' + (await H.msg(p)).slice(0, 40));
  for (const [r, i] of left) { if (await H.modalUp(p)) break; await H.click(p, `[onclick="npSel('${r},${i}')"]`); for (const ch of String(g.P[r][i])) await p.keyboard.press('Digit' + ch); await p.keyboard.press('Enter'); }
  R.steps.push(`${left.length} bricks typed with keyboard digits + Enter`);
} };
D.frogswap = { heKey: null, async play(p, R, H) {
  await H.click(p, '[onclick="fsTap(0)"]'); R.steps.push('stuck frog -> ' + (await H.msg(p)).slice(0, 40));
  const plan = await p.evaluate(() => { const g = gameState.frogswap, n = g.n, goal = [...Array(n).fill('T'), '', ...Array(n).fill('F')].join(',');
    const q = [[g.row, []]], seen = new Set([g.row.join(',')]);
    for (let h = 0; h < q.length; h++) { const [row, path] = q[h]; if (row.join(',') === goal) return path; const e = row.indexOf('');
      row.forEach((pc, i) => { const ok = (pc === 'F' && (i + 1 === e || (i + 2 === e && row[i + 1] === 'T'))) || (pc === 'T' && (i - 1 === e || (i - 2 === e && row[i - 1] === 'F'))); if (!ok) return; const nr = row.slice(); nr[e] = pc; nr[i] = ''; const k = nr.join(','); if (!seen.has(k)) { seen.add(k); q.push([nr, path.concat([i])]); } }); }
    return null; });
  for (const i of plan) await H.click(p, `[onclick="fsTap(${i})"]`);
  R.steps.push(`${plan.length} moves (fewest ${(await H.G(p, 'frogswap')).best})`);
} };
D.matchfix = { heKey: null, async play(p, R, H) {
  for (let k = 0; k < 3; k++) {
    if (await H.modalUp(p)) break;
    const m = await p.evaluate(() => { const g = gameState.matchfix; const all = _mfMoves(g.list[g.k].start, g.diff !== 'easy'); const ok = all.find((m) => { const e = _mfEval(m.st); return e && e.ok; }); const bad = all.find((m) => { const e = _mfEval(m.st); return e && !e.ok; }); return { ok: ok && [ok.from, ok.to], bad: bad && [bad.from, bad.to] }; });
    if (!m.ok) { R.defects.push('no true sum reachable'); break; }
    if (k === 0 && m.bad) { await H.click(p, `[data-k="m${m.bad[0][0]}${m.bad[0][1]}"]`); await H.click(p, `[data-k="m${m.bad[1][0]}${m.bad[1][1]}"]`); R.steps.push('a move that stays wrong -> ' + (await H.msg(p)).slice(0, 50)); }
    await H.click(p, `[data-k="m${m.ok[0][0]}${m.ok[0][1]}"]`); await H.click(p, `[data-k="m${m.ok[1][0]}${m.ok[1][1]}"]`);
    R.steps.push(`puzzle ${k + 1}: ` + (await H.msg(p)).slice(0, 30));
    if (k < 2) await H.btn(p, 'Next puzzle');
  }
} };
// ---------- batch B: newspaper and puzzle-book grids ----------
async function latinPlay(p, R, H, id, sel, key) {   // fill a Latin-style grid with keyboard digits from the stored answer
  const g = await H.G(p, id), n = g.n, L = g.P.L;
  // a wrong digit first: the same digit twice in row 1
  await H.click(p, `[data-k="c0_0"]`); await p.keyboard.press('Digit' + L[0][1]); await H.click(p, `[data-k="c0_1"]`); await p.keyboard.press('Digit' + L[0][1]);
  await H.btn(p, 'Check'); R.steps.push('same digit twice + Check -> ' + (await H.msg(p)).slice(0, 45));
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) { if (await H.modalUp(p)) return; await H.click(p, `[data-k="c${r}_${c}"]`); await p.keyboard.press('Digit' + L[r][c]); }
  R.steps.push(`${n * n} squares typed with digit keys`);
}
D.cagemath = { heKey: null, async play(p, R, H) { await latinPlay(p, R, H, 'cagemath'); } };
D.skyline = { heKey: null, async play(p, R, H) { await latinPlay(p, R, H, 'skyline'); } };
D.bridges = { heKey: null, async play(p, R, H) {
  const g = await H.G(p, 'bridges'), P = g.P;
  // two islands that are not in a straight line
  const far = P.isl.findIndex(([r, c]) => r !== P.isl[0][0] && c !== P.isl[0][1]);
  await H.click(p, '[data-k="i0"]'); await H.click(p, `[data-k="i${far}"]`); R.steps.push('islands not in line -> ' + (await H.msg(p)).slice(0, 45));
  await H.click(p, `[data-k="i${far}"]`);   // let go
  for (const [a, b, k] of P.sol) for (let j = 0; j < k; j++) { if (await H.modalUp(p)) return; await H.click(p, `[data-k="i${a}"]`); await H.click(p, `[data-k="i${b}"]`); }
  R.steps.push(`${P.sol.length} bridge lines built (${P.sol.reduce((x, y) => x + y[2], 0)} bridges)`);
} };
D.lamps = { heKey: { code: 'KeyH', key: 'י' }, async play(p, R, H) {
  const g = await H.G(p, 'lamps'), { n, W, lamp } = g.P;
  // two lamps in one open row
  let pair = null; for (let r = 0; r < n && !pair; r++) for (let c = 0; c + 1 < n; c++) if (!W[r][c] && !W[r][c + 1]) { pair = [r, c]; break; }
  if (pair) { await H.click(p, `[data-k="s${pair[0]}_${pair[1]}"]`); await H.click(p, `[data-k="s${pair[0]}_${pair[1] + 1}"]`); R.steps.push('two lamps facing -> ' + (await H.msg(p)).slice(0, 50)); await H.btn(p, 'Clear all'); }
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (lamp[r][c]) { if (await H.modalUp(p)) return; await H.click(p, `[data-k="s${r}_${c}"]`); }
  R.steps.push(`${lamp.flat().filter(Boolean).length} lamps placed`);
} };
D.tents = { heKey: { code: 'KeyH', key: 'י' }, async play(p, R, H) {
  const g = await H.G(p, 'tents'), { n, tree, tent } = g.P;
  let pair = null; for (let r = 0; r < n && !pair; r++) for (let c = 0; c + 1 < n; c++) if (!tree[r][c] && !tree[r][c + 1]) { pair = [r, c]; break; }
  await H.click(p, `[data-k="s${pair[0]}_${pair[1]}"]`); await H.click(p, `[data-k="s${pair[0]}_${pair[1] + 1}"]`); R.steps.push('two touching tents -> ' + (await H.msg(p)).slice(0, 50)); await H.btn(p, 'Clear all');
  await H.btn(p, 'Grass away'); R.steps.push('grass shortcut -> ' + (await H.msg(p)).slice(0, 50));
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (tent[r][c]) { if (await H.modalUp(p)) return; await H.click(p, `[data-k="s${r}_${c}"]`); }
  R.steps.push(`${tent.flat().filter(Boolean).length} tents pitched`);
} };
D.dropquote = { heKey: null, async play(p, R, H) {
  const g = await H.G(p, 'dropquote'), { w, rows, ans, piles } = g.P;
  // a letter that is not in this column's pile
  const [r0, c0] = g.sel, miss = 'ZQXJKVW'.split('').find((L) => !piles[c0].includes(L));
  await p.keyboard.press('Key' + miss); R.steps.push(`typed ${miss} (not in the pile) -> ` + (await H.msg(p)).slice(0, 45));
  // Hebrew layout: the physical key for the right letter carries a Hebrew character in e.key
  const want = ans[r0][c0];
  await p.evaluate((code) => document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'ש', code, bubbles: true, cancelable: true })), 'Key' + want);
  const got = (await H.G(p, 'dropquote')).g[r0][c0]; R.steps.push(`Hebrew-layout key for ${want} wrote: ${got || '(nothing)'}`); if (got !== want) R.defects.push('letter key failed with a Hebrew key value');
  let typed = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < w; c++) { if (ans[r][c] === '#' || g.given[r][c]) continue; if (await H.modalUp(p)) return; await H.click(p, `[data-k="c${r}_${c}"]`); await p.keyboard.press('Key' + ans[r][c]); typed++; }
  R.steps.push(`${typed} letters typed: ${g.P.say}`);
} };
D.dotdot = { heKey: null, async play(p, R, H) {
  for (let k = 0; k < 3; k++) {
    const g = await H.G(p, 'dotdot'), n = g.dots.length;
    await p.locator('#gameContent .dd-b').evaluate((e) => e.scrollIntoView({ block: 'center' })); await H.sleep(100);
    let box = await p.locator('#gameContent .dd-b').boundingBox(); const box0 = box;
    const tapDot = async (i) => { box = await p.locator('#gameContent .dd-b').boundingBox(); if (Math.abs(box.y - box0.y) > 2) R.steps.push(`board moved ${Math.round(box.y - box0.y)}px at dot ${i + 1}`); const [x, y] = g.dots[i]; await p.mouse.click(box.x + box.width * x / 100 + Math.sign(50 - x) * 6, box.y + box.height * y / 100 + Math.sign(50 - y) * 5); await H.sleep(40); };   // a little off the dot: taps are forgiving
    if (k === 0) { await tapDot(Math.min(5, n - 1)); R.steps.push('wrong dot -> ' + (await H.msg(p)).slice(0, 40)); }
    for (let i = 1; i < n; i++) { await tapDot(i); const d = (await H.G(p, 'dotdot')).done; if (d !== i + 1) { const [x, y] = g.dots[i]; const el = await p.evaluate(([X, Y]) => { const e = document.elementFromPoint(X, Y); return e ? e.outerHTML.slice(0, 120) : 'none'; }, [box.x + box.width * x / 100 + Math.sign(50 - x) * 6, box.y + box.height * y / 100 + Math.sign(50 - y) * 5]); R.defects.push(`tap on dot ${i + 1} (${x.toFixed(1)},${y.toFixed(1)}) not taken: ` + (await H.msg(p)) + ' | hit ' + el); break; } }
    if (k === 1) { await p.locator('#gameContent [data-k="d0"]').focus(); await p.keyboard.press('Enter'); } else await tapDot(0);
    R.steps.push(`picture ${k + 1} (${n} dots${k === 1 ? ', closed by keyboard' : ''}) -> ` + (await H.msg(p)).slice(0, 30));
    if (k < 2) await H.btn(p, 'Next picture');
  }
} };
D.fenceloop = { heKey: { code: 'KeyH', key: 'י' }, async play(p, R, H) {
  const g = await H.G(p, 'fenceloop'), { h, v } = g.P;
  for (const k of ['h1_0', 'h1_1', 'v0_1']) await H.click(p, `[data-k="${k}"]`);
  R.steps.push('three pieces at one dot -> ' + (await H.msg(p)).slice(0, 50)); await H.btn(p, 'Clear all');
  let k = 0;
  for (let r = 0; r < h.length; r++) for (let c = 0; c < h[r].length; c++) if (h[r][c]) { if (await H.modalUp(p)) return; await H.click(p, `[data-k="h${r}_${c}"]`); k++; }
  for (let r = 0; r < v.length; r++) for (let c = 0; c < v[r].length; c++) if (v[r][c]) { if (await H.modalUp(p)) return; await H.click(p, `[data-k="v${r}_${c}"]`); k++; }
  R.steps.push(`${k} fence pieces placed`);
} };
D.hose = { heKey: null, async play(p, R, H) {
  const g = await H.G(p, 'hose'), n = g.n, rot = (m) => ((m << 1) | (m >> 3)) & 15;
  let taps = 0;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) { let m = g.g[r][c]; while (m !== g.P.sol[r][c]) { if (await H.modalUp(p)) return R.steps.push(`${taps} turns (finished early: another arrangement also works)`); if (r === 0 && c === 0 && taps === 0) { await p.locator('#gameContent [data-k="s0_0"]').focus(); await p.keyboard.press('Enter'); } else await H.click(p, `[data-k="s${r}_${c}"]`); m = rot(m); taps++; } }
  R.steps.push(`${taps} quarter turns; first one by Enter`);
} };
D.parking = { heKey: null, async play(p, R, H) {
  const plan = async () => p.evaluate(() => { const g = gameState.parking, seen = new Map([[g.b, null]]), q = [g.b];
    for (let h = 0; h < q.length; h++) { const b = q[h]; if (b[17] === 'A') { const out = []; let x = b; while (seen.get(x)) { const [prev, ch, sh] = seen.get(x); out.unshift([ch, sh]); x = prev; } return out; }
      for (const ch of Object.keys(_pkCars(b))) for (const { shift } of _pkReach(b, ch)) { const nb = _pkSlide(b, ch, shift); if (!seen.has(nb)) { seen.set(nb, [b, ch, shift]); q.push(nb); } } } return null; });
  const g = await H.G(p, 'parking');
  // keyboard: pick the red car with Enter, push it the wrong way into whatever is there
  await p.locator('#gameContent [data-k="vA"]').focus(); await p.keyboard.press('Enter');
  const reachL = await p.evaluate(() => _pkReach(gameState.parking.b, 'A').filter((x) => x.shift < 0).length);
  for (let i = 0; i <= reachL; i++) await p.keyboard.press('ArrowLeft');
  R.steps.push(`red car pushed left ${reachL + 1} times by keyboard -> ` + (await H.msg(p)).slice(0, 40));
  await H.btn(p, 'Start this lot over');
  const mv = await plan(); if (!mv) return R.defects.push('test solver found no way out');
  for (const [ch, sh] of mv) {
    if (await H.modalUp(p)) break;
    const sel = (await H.G(p, 'parking')).sel; if (sel !== ch) await H.click(p, `[data-k="v${ch}"]`);
    const cell = await p.evaluate(([ch, sh]) => _pkReach(gameState.parking.b, ch).find((x) => x.shift === sh).cell, [ch, sh]);
    await H.click(p, `[data-k="t${cell}"]`);
  }
  const e = await H.G(p, 'parking'); R.steps.push(`${mv.length} slides by tapping (fewest ${g.best}); counted ${e.moves}`);
  if (mv.length !== g.best) R.defects.push(`stored fewest ${g.best} but solver found ${mv.length}`);
} };
// ---------- batch C: card games ----------
async function until(p, H, fn, ms = 20000) { const t = Date.now(); while (Date.now() - t < ms) { if (await H.modalUp(p)) return 'modal'; if (await p.evaluate(fn)) return true; await H.sleep(120); } return false; }
D.golfsol = { heKey: { code: 'KeyD', key: 'ג' }, async play(p, R, H) {
  const bad = await p.evaluate(() => { const g = gameState.golfsol; return g.cols.findIndex((c) => !_gsFits(g, c[c.length - 1])); });
  if (bad >= 0) { await H.click(p, `[data-k="c${bad}"]`); R.steps.push('card that does not fit -> ' + (await H.msg(p)).slice(0, 45)); }
  let moves = 0;
  for (let k = 0; k < 200; k++) { if (await H.modalUp(p) || await p.evaluate(() => gameState.golfsol.over)) break;
    const i = await p.evaluate(() => { const g = gameState.golfsol; let best = -1, bl = -1; g.cols.forEach((c, i) => { if (c.length && _gsFits(g, c[c.length - 1]) && c.length > bl) { best = i; bl = c.length; } }); return best; });
    if (i >= 0) await H.click(p, `[data-k="c${i}"]`); else await H.click(p, '[data-k="stock"]'); moves++; }
  R.steps.push(`${moves} plays (columns first, else the stock)`);
} };
D.pyramid = { focusSel: '#gameContent [data-k="p6_0"]', heKey: { code: 'KeyD', key: 'ג' }, async play(p, R, H) {
  const bad = await p.evaluate(() => { const g = gameState.pyramid, a = _pyAvail(g).filter((x) => x[0] === 'p'); for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (_pyCard(g, a[i]).r + _pyCard(g, a[j]).r !== 13 && _pyCard(g, a[i]).r !== 13 && _pyCard(g, a[j]).r !== 13) return [a[i], a[j]]; return null; });
  if (bad) { for (const x of bad) await H.click(p, `[data-k="p${x[1]}_${x[2]}"]`); R.steps.push('two cards not making 13 -> ' + (await H.msg(p)).slice(0, 45)); await H.click(p, `[data-k="p${bad[1][1]}_${bad[1][2]}"]`); }
  let pairs = 0, draws = 0;
  for (let k = 0; k < 300; k++) { if (await H.modalUp(p) || await p.evaluate(() => gameState.pyramid.over)) break;
    const pr = await p.evaluate(() => { const ps = _pyPairs(gameState.pyramid); ps.sort((a, b) => Math.min(...a.map((x) => (x[0] === 'w' ? 9 : x[1]))) - Math.min(...b.map((x) => (x[0] === 'w' ? 9 : x[1])))); return ps[0] || null; });
    if (pr) { for (const x of pr) await H.click(p, x[0] === 'w' ? '[data-k="waste"]' : `[data-k="p${x[1]}_${x[2]}"]`); pairs++; } else { await H.click(p, '[data-k="stock"]'); draws++; } }
  R.steps.push(`${pairs} pairs/kings removed, ${draws} stock turns`);
} };
D.accordion = { heKey: { code: 'KeyD', key: 'ג' }, async play(p, R, H) {
  await H.click(p, '[data-k="p2"]'); await H.click(p, '[data-k="p0"]'); R.steps.push('jump of two places -> ' + (await H.msg(p)).slice(0, 45));
  let jumps = 0, deals = 0;
  for (let k = 0; k < 400; k++) { if (await H.modalUp(p) || await p.evaluate(() => gameState.accordion.over)) break;
    const m = await p.evaluate(() => { const g = gameState.accordion; for (let i = g.row.length - 1; i > 0; i--) { const t = _acTargets(g, i); if (t.length) return [i, t[t.length - 1]]; } return null; });
    if (m) { await H.click(p, `[data-k="p${m[0]}"]`); await H.click(p, `[data-k="p${m[1]}"]`); jumps++; } else { await H.click(p, '[data-k="deal"]'); deals++; } }
  R.steps.push(`${jumps} jumps, ${deals} deals`);
} };
D.calculation = { heKey: null, async play(p, R, H) {
  // Hebrew U needs something to undo: one move first
  await H.click(p, '[data-k="put0"]');
  const prevent = 0;
  R.steps.push('first card put on waste pile 1');
  const misfit = await p.evaluate(() => { const g = gameState.calculation; return [0, 1, 2, 3].find((k) => _caNeed(g, k) !== g.cur.r); });
  if (misfit !== undefined) { await H.click(p, `[data-k="f${misfit}"]`); R.steps.push('card on the wrong foundation -> ' + (await H.msg(p)).slice(0, 50)); }
  let n = 0;
  for (let k = 0; k < 400; k++) { if (await H.modalUp(p) || await p.evaluate(() => gameState.calculation.over)) break;
    const a = await p.evaluate(() => { const g = gameState.calculation;
      for (let i = 0; i < 4; i++) { const w = g.w[i]; if (!w.length) continue; const k = [0, 1, 2, 3].find((f) => _caNeed(g, f) === w[w.length - 1].r); if (k !== undefined) return ['w', i, k]; }
      if (!g.cur) return null; const k = [0, 1, 2, 3].find((f) => _caNeed(g, f) === g.cur.r); if (k !== undefined) return ['f', k];
      // waste: kings on pile 4, else the pile whose top is just above the card
      if (g.cur.r === 13) return ['put', 3]; let best = 0, bs = 99; for (let i = 0; i < 3; i++) { const w = g.w[i], t = w.length ? w[w.length - 1].r : 99, d = t >= g.cur.r ? t - g.cur.r : 50 + g.cur.r - t; if (d < bs) { bs = d; best = i; } } return ['put', best]; });
    if (!a) break;
    if (a[0] === 'w') { await H.click(p, `[data-k="w${a[1]}"]`); await H.click(p, `[data-k="f${a[2]}"]`); } else if (a[0] === 'f') await p.keyboard.press('Digit' + (a[1] + 1)); else await H.click(p, `[data-k="put${a[1]}"]`); n++; }
  R.steps.push(`${n} moves (foundation moves by digit keys); on foundations ${(await H.G(p, 'calculation')).f.flat().length}`);
} };
D.pokersq = { heKey: null, async play(p, R, H) {
  for (let k = 0; k < 25; k++) { if (await H.modalUp(p) || await p.evaluate(() => gameState.pokersq.over)) break;
    const i = await p.evaluate(() => { const g = gameState.pokersq, c = g.cur; let best = -1, bv = -1; g.g.forEach((x, i) => { if (x) return; g.g[i] = c; const L = _pqLines(g), v = _pqTotal(L) * 10 + (g.g.slice(Math.floor(i / 5) * 5, Math.floor(i / 5) * 5 + 5).filter((y) => y && y.s === c.s).length); g.g[i] = null; if (v > bv) { bv = v; best = i; } }); return best; });
    await H.click(p, `[data-k="s${i}"]`); }
  const g = await H.G(p, 'pokersq'); R.steps.push(`25 cards placed, final ${await p.evaluate(() => _pqTotal(_pqLines(gameState.pokersq)))} points (goal ${g.goal})`);
} };
D.hilo = { focusSel: '#gameContent [data-k="hi"]', heKey: { code: 'KeyS', key: 'ד' }, async play(p, R, H) {
  let k = 0;
  for (; k < 60; k++) { if (await H.modalUp(p) || await p.evaluate(() => gameState.hilo.over)) break;
    const dir = await p.evaluate(() => { const C = _hlCounts(gameState.hilo); return C.hi >= C.lo ? 'ArrowUp' : 'ArrowDown'; });
    if (k % 2) await p.keyboard.press(dir); else await H.btn(p, dir === 'ArrowUp' ? 'Higher' : 'Lower'); }
  const g = await H.G(p, 'hilo'); R.steps.push(`${k} guesses by counting (keys and buttons): rung ${g.rung}, lives ${g.lives}`);
} };
D.kingscorner = { heKey: { code: 'KeyE', key: 'ק' }, async play(p, R, H) {
  // a card that does not fit
  const bad = await p.evaluate(() => { const g = gameState.kingscorner; for (let i = 0; i < g.hands[0].length; i++) for (let q = 0; q < 4; q++) if (g.piles[q].length && !_kcFits(g.piles, q, g.hands[0][i])) return [g.hands[0][i].r, g.hands[0][i].s, q]; return null; });
  if (bad) { await H.click(p, `[data-k="h${bad[0]}_${bad[1]}"]`); await H.click(p, `[data-k="p${bad[2]}"]`); R.steps.push('card on a pile it does not fit -> ' + (await H.msg(p)).slice(0, 50)); await H.click(p, `[data-k="h${bad[0]}_${bad[1]}"]`); }
  let turns = 0, plays = 0;
  for (; turns < 80; turns++) {
    if ((await until(p, H, () => gameState.kingscorner.turn === 0 || gameState.kingscorner.over)) === 'modal' || await p.evaluate(() => gameState.kingscorner.over)) break;
    if (await H.modalUp(p)) break;
    for (let k = 0; k < 20; k++) {
      const m = await p.evaluate(() => { const g = gameState.kingscorner, h = g.hands[0];
        for (let pp = 0; pp < 4; pp++) for (let q = 0; q < 8; q++) if (_kcPileFits(g.piles, pp, q) && g.piles[q].length) return ['p', pp, q];
        for (const c of h.slice().sort((a, b) => b.r - a.r)) for (const q of [4, 5, 6, 7, 0, 1, 2, 3]) if ((g.piles[q].length || (q >= 4 && c.r === 13)) && _kcFits(g.piles, q, c)) return ['h', c.r, c.s, q];
        const e = [0, 1, 2, 3].find((q) => !g.piles[q].length); if (e !== undefined && h.length) { const c = h.reduce((a, b) => (b.r > a.r ? b : a)); return ['h', c.r, c.s, e]; } return null; });
      if (!m || (await H.modalUp(p)) || await p.evaluate(() => gameState.kingscorner.over)) break;
      if (m[0] === 'p') { await H.click(p, `[data-k="p${m[1]}"]`); await H.click(p, `[data-k="p${m[2]}"]`); } else { await H.click(p, `[data-k="h${m[1]}_${m[2]}"]`); await H.click(p, `[data-k="p${m[3]}"]`); } plays++;
    }
    if (await H.modalUp(p) || await p.evaluate(() => gameState.kingscorner.over)) break;
    await H.btn(p, 'End turn');
  }
  R.steps.push(`${turns} turns, ${plays} plays by tapping`);
} };
D.casino = { heKey: null, async play(p, R, H) {
  const g0 = await H.G(p, 'casino');
  // a wrong capture: a hand card with a table card that does not match
  const bad = await p.evaluate(() => { const g = gameState.casino; for (const c of g.hands[0]) for (const t of g.table) if (!_csValid(c, [t])) return [c.r, c.s, t.r, t.s]; return null; });
  if (bad) { await H.click(p, `[data-k="h${bad[0]}_${bad[1]}"]`); await H.click(p, `[data-k="t${bad[2]}_${bad[3]}"]`); await H.btn(p, 'Take'); R.steps.push('wrong capture -> ' + (await H.msg(p)).slice(0, 50)); await H.click(p, `[data-k="h${bad[0]}_${bad[1]}"]`); }
  let caps = 0, trails = 0;
  for (let k = 0; k < 40; k++) {
    if ((await until(p, H, () => gameState.casino.turn === 0 || gameState.casino.over)) === 'modal' || await p.evaluate(() => gameState.casino.over) || (await H.modalUp(p))) break;
    const m = await p.evaluate(() => { const g = gameState.casino; let best = null; g.hands[0].forEach((c) => _csCaptures(c, g.table).forEach((idx) => { const v = _csWorth([c, ...idx.map((x) => g.table[x])]); if (!best || v > best.v) best = { v, c: [c.r, c.s], t: idx.map((x) => [g.table[x].r, g.table[x].s]) }; }));
      if (best) return best; const c = g.hands[0].reduce((a, b) => (_csWorth([b]) < _csWorth([a]) ? b : a)); return { c: [c.r, c.s], t: [] }; });
    await H.click(p, `[data-k="h${m.c[0]}_${m.c[1]}"]`);
    if (m.t.length) { for (const t of m.t) await H.click(p, `[data-k="t${t[0]}_${t[1]}"]`); if (k % 2) await p.keyboard.press('KeyT'); else await H.btn(p, 'Take'); caps++; } else { await H.btn(p, 'Trail'); trails++; }
    await H.sleep(200);
  }
  R.steps.push(`${caps} captures, ${trails} trails`);
} };
D.spades = { focusSel: '#gameContent [data-k="b1"]', heKey: null, async play(p, R, H) {
  await p.evaluate(() => { gameState.spades.target = 60; });
  R.steps.push('target lowered to 60 for the test run (normal play: ' + ({ easy: 150, normal: 200, hard: 250 }[(await H.G(p, 'spades')).diff]) + ')');
  let tricks = 0, hands = 0, illegal = false;
  for (let k = 0; k < 400; k++) {
    if ((await until(p, H, () => { const g = gameState.spades; return g.over || g.phase === 'bid' || g.phase === 'scored' || (g.phase === 'play' && _spNextPlayer(g) === 0 && g.trick.length < 4); }, 30000)) === 'modal' || (await H.modalUp(p)) || await p.evaluate(() => gameState.spades.over)) break;
    const g = await H.G(p, 'spades');
    if (g.phase === 'bid') { const n = await p.evaluate(() => _spCpuBid(gameState.spades.hands[0], 'normal')); await H.click(p, `[data-k="b${n}"]`); continue; }
    if (g.phase === 'scored') { hands++; R.steps.push('hand ' + hands + ': ' + (await H.msg(p)).slice(0, 70)); await H.btn(p, 'Next hand'); continue; }
    if (!illegal && g.trick.length) { const bad = await p.evaluate(() => { const g = gameState.spades, L = _spLegal(g, 0); const c = g.hands[0].find((x) => !L.includes(x)); return c ? [c.r, c.s] : null; });
      if (bad) { illegal = true; const dis = await p.locator(`#gameContent [data-k="h${bad[0]}_${bad[1]}"]`).isDisabled(); R.steps.push(`card that does not follow suit is disabled: ${dis}`); if (!dis) R.defects.push('unplayable card was enabled'); } }
    const c = await p.evaluate(() => { const c = _spCpuCard(gameState.spades, 0); return [c.r, c.s]; });
    await H.click(p, `[data-k="h${c[0]}_${c[1]}"]`); tricks++;
  }
  R.steps.push(`${tricks} cards played over ${hands} scored hands`);
} };
D.oldmaid = { heKey: null, async play(p, R, H) {
  let draws = 0;
  for (let k = 0; k < 200; k++) {
    if ((await until(p, H, () => gameState.oldmaid.turn === 0 || gameState.oldmaid.over, 30000)) === 'modal' || await p.evaluate(() => gameState.oldmaid.over) || (await H.modalUp(p))) break;
    const n = (await H.G(p, 'oldmaid')).hands; const i = k % 3;
    const sel = await p.locator('#gameContent [data-k^="d"]').count(); if (!sel) { await H.sleep(200); continue; }
    if (k === 1) { await p.locator('#gameContent [data-k="d0"]').focus(); await p.keyboard.press('Enter'); } else await H.click(p, `[data-k="d${Math.min(i, sel - 1)}"]`); draws++;
  }
  R.steps.push(`${draws} draws (one by Enter)`);
} };
// ---------- batch D: board and dice games ----------
const over = (p, id) => p.evaluate((id) => gameState[id].over, id);
D.nim = { focusSel: '#gameContent [data-k="s3_0"]', heKey: null, async play(p, R, H) {
  let k = 0;
  for (; k < 200; k++) {
    if ((await until(p, H, () => { const g = gameState.nim; return g.over || g.done || g.turn === 0; })) === 'modal' || await over(p, 'nim')) break;
    const g = await H.G(p, 'nim');
    if (g.done) { await H.btn(p, 'Next game'); continue; }
    if (k === 0) { await H.btn(p, 'Take'); R.steps.push('Take with nothing marked -> ' + (await H.msg(p)).slice(0, 40)); }
    const mv = await p.evaluate(() => { const g = gameState.nim; const b = _nmBest(g.rows); if (b) return b; const r = g.rows.indexOf(Math.max(...g.rows)); return [r, g.rows[r] - 1]; });
    await H.click(p, `[data-k="s${mv[0]}_${mv[1]}"]`); if (k % 2) await p.keyboard.press('KeyT'); else await H.btn(p, 'Take');
  }
  const g = await H.G(p, 'nim'); R.steps.push(`${k} turns played with the binary strategy; games you ${g.wins[0]}, computer ${g.wins[1]}`);
} };
D.foxgeese = { heKey: null, async play(p, R, H) {
  let k = 0;
  const bad = await p.evaluate(() => gameState.foxgeese.geese.findIndex((_, i) => !_fgGooseMoves(gameState.foxgeese, i).length));
  if (bad >= 0) { const g = (await H.G(p, 'foxgeese')).geese[bad]; await H.click(p, `[data-k="p${g[0]}_${g[1]}"]`); R.steps.push('boxed-in goose -> ' + (await H.msg(p)).slice(0, 45)); await H.click(p, `[data-k="p${g[0]}_${g[1]}"]`); }
  for (; k < 120; k++) {
    if ((await until(p, H, () => gameState.foxgeese.turn === 0 || gameState.foxgeese.over)) === 'modal' || await over(p, 'foxgeese')) break;
    const mv = await p.evaluate(() => { const g = gameState.foxgeese; let best = null;
      g.geese.forEach((from, i) => _fgGooseMoves(g, i).forEach((to) => { const save = g.geese; g.geese = save.slice(); g.geese[i] = to;
        const fm = _fgFoxMoves(g), v = -fm.length * 3 - fm.filter((m) => m[2] >= 0).length * 40 + (to[0] < from[0] ? 2 : 0) + Math.random(); g.geese = save; if (!best || v > best.v) best = { v, from, to }; }));
      return best; });
    if (!mv) break;
    await H.click(p, `[data-k="p${mv.from[0]}_${mv.from[1]}"]`); await H.click(p, `[data-k="p${mv.to[0]}_${mv.to[1]}"]`);
  }
  const g = await H.G(p, 'foxgeese'); R.steps.push(`${k} goose moves; ${g.geese.length} geese left`);
} };
D.fiverow = { heKey: null, async play(p, R, H) {
  let k = 0;
  for (; k < 90; k++) {
    if ((await until(p, H, () => gameState.fiverow.turn === 1 || gameState.fiverow.over)) === 'modal' || await over(p, 'fiverow')) break;
    const i = await p.evaluate(() => { const g = gameState.fiverow, n = g.n; let best = -1, bv = -1; g.b.forEach((v, i) => { if (v) return; const a = _frVal(g.b, n, i, 1).v * 1.1 + _frVal(g.b, n, i, 2).v; if (a > bv) { bv = a; best = i; } }); return best; });
    if (k === 0) { await H.click(p, `[data-k="p${i}"]`); continue; }
    await p.locator(`#gameContent [data-k="p${i}"]`).focus(); await p.keyboard.press('Enter');
  }
  R.steps.push(`${k} stones placed (Enter on the focused point after the first)`);
} };
D.hex = { heKey: null, async play(p, R, H) {
  let k = 0;
  for (; k < 90; k++) {
    if ((await until(p, H, () => gameState.hex.turn === 1 || gameState.hex.over)) === 'modal' || await over(p, 'hex')) break;
    const i = await p.evaluate(() => { const g = gameState.hex, n = g.n, b = g.b; let best = -1, bv = -1e9; for (let i = 0; i < b.length; i++) { if (b[i]) continue; b[i] = 1; const v = _hxDist(b, n, 2).d - _hxDist(b, n, 1).d * 1.05 + Math.random() * 0.1; b[i] = 0; if (v > bv) { bv = v; best = i; } } return best; });
    await H.click(p, `[data-k="h${i}"]`);
  }
  R.steps.push(`${k} hexagons claimed by shortest-path play`);
} };
D.ur = { focusSel: '#gameContent [data-k="roll"]', heKey: { code: 'KeyR', key: 'ר' }, async play(p, R, H) {
  let k = 0, wrong = false;
  for (; k < 400; k++) {
    if ((await until(p, H, () => gameState.ur.turn === 0 || gameState.ur.over, 30000)) === 'modal' || await over(p, 'ur')) break;
    const g = await H.G(p, 'ur');
    if (g.roll === null) { await p.keyboard.press('KeyR'); await H.sleep(80); continue; }
    const ms = await p.evaluate(() => _urMoves(gameState.ur, 0, gameState.ur.roll));
    if (!ms.length) { await H.sleep(1500); continue; }
    if (!wrong) { const stuck = await p.evaluate(() => { const g = gameState.ur, ok = _urMoves(g, 0, g.roll).map((m) => m.from); return g.pc[0].find((x) => x > 0 && x < 15 && !ok.includes(x)); }); if (stuck) { wrong = true; await p.evaluate((x) => urMove(x), stuck); R.steps.push('piece that cannot move -> ' + (await H.msg(p)).slice(0, 40)); } }
    const m = ms.sort((a, b) => (b.to === 15) - (a.to === 15) || b.cap - a.cap || [4, 8, 14].includes(b.to) - [4, 8, 14].includes(a.to) || b.from - a.from)[0];
    if (m.from === 0) await H.btn(p, 'Enter a piece'); else { const sq = await p.evaluate((k) => _urSq(0, k), m.from); await H.click(p, `[data-k="s${sq[0]}_${sq[1]}"]`); }
  }
  const g = await H.G(p, 'ur'); R.steps.push(`${k} actions; home: you ${g.pc[0].filter((x) => x === 15).length}, computer ${g.pc[1].filter((x) => x === 15).length}`);
} };
D.hotdice = { focusSel: '#gameContent [data-k="roll"]', heKey: { code: 'KeyR', key: 'ר' }, async play(p, R, H) {
  await p.evaluate(() => { gameState.hotdice.target = 1500; }); R.steps.push('target lowered to 1500 for the test run');
  let k = 0, wrongDone = false;
  for (; k < 400; k++) {
    if ((await until(p, H, () => { const g = gameState.hotdice; return g.over || (g.turn === 0 && !g.bust); }, 30000)) === 'modal' || await over(p, 'hotdice')) break;
    const g = await H.G(p, 'hotdice');
    if (!g.rolled) { await H.click(p, '[data-k="roll"]'); continue; }
    const b = await p.evaluate(() => _hdBest(gameState.hotdice.dice));
    if (!wrongDone) { const nonScore = g.dice.findIndex((v) => v !== 1 && v !== 5 && g.dice.filter((x) => x === v).length < 3); if (nonScore >= 0) { wrongDone = true; await H.click(p, `[data-k="d${nonScore}"]`); R.steps.push('non-scoring die set aside -> ' + (await H.msg(p)).slice(0, 40)); await H.click(p, `[data-k="d${nonScore}"]`); } }
    for (const i of b.pick) if (!g.pick.includes(i)) await H.click(p, `[data-k="d${i}"]`);
    const left = g.left - b.pick.length, pts = g.turnPts + b.best;
    if (pts >= 300 && left > 0 && left <= 3) await p.keyboard.press('KeyB'); else await p.keyboard.press('KeyR');
    await H.sleep(100);
  }
  const g = await H.G(p, 'hotdice'); R.steps.push(`${k} actions; score you ${g.score[0]}, computer ${g.score[1]}`);
} };
D.liarsdice = { focusSel: '#gameContent [data-k="bid"]', heKey: null, async play(p, R, H) {
  let k = 0, wrong = false;
  for (; k < 300; k++) {
    if ((await until(p, H, () => { const g = gameState.liarsdice; return g.over || g.turn === 0 || g.turn === -2; }, 30000)) === 'modal' || await over(p, 'liarsdice')) break;
    const g = await H.G(p, 'liarsdice');
    if (g.turn === -2) { await H.btn(p, 'Next round'); continue; }
    if (!wrong && g.bid) { wrong = true; await p.evaluate(() => { const g = gameState.liarsdice; g.q = g.bid.q; g.f = 2; NK.render('liarsdice'); }); if (g.bid.f > 2) { await H.click(p, '[data-k="bid"]'); R.steps.push('bid that does not raise -> ' + (await H.msg(p)).slice(0, 45)); } }
    const act = await p.evaluate(() => { const g = gameState.liarsdice, mine = g.d[0], others = _ldTotal(g) - mine.length, est = (f) => mine.filter((v) => v === f || v === 1).length + others / 3;
      if (g.bid && g.bid.q > est(g.bid.f) + 1) return { call: true };
      let best = null; for (let f = 2; f <= 6; f++) { const q = g.bid ? (f > g.bid.f ? g.bid.q : g.bid.q + 1) : Math.max(1, Math.floor(est(f) - 0.5)); const c = est(f) - q; if (!best || c > best.c) best = { q, f, c }; }
      if (g.bid && best.c < -1) return { call: true }; return best; });
    if (act.call) { await H.btn(p, 'Liar!'); continue; }
    await H.click(p, `[data-k="f${act.f}"]`);
    const cur = (await H.G(p, 'liarsdice')).q; for (let j = cur; j < act.q; j++) await H.click(p, '[data-k="qp"]'); for (let j = cur; j > act.q; j--) await H.click(p, '[data-k="qm"]');
    await H.click(p, '[data-k="bid"]');
  }
  const g = await H.G(p, 'liarsdice'); R.steps.push(`${k} actions; dice left: you ${g.n[0]}, Hank ${g.n[1]}, Dot ${g.n[2]}`);
} };
D.shipcrew = { focusSel: '#gameContent [data-k="roll"]', heKey: { code: 'KeyR', key: 'ר' }, async play(p, R, H) {
  let k = 0;
  for (; k < 200; k++) {
    if ((await until(p, H, () => { const g = gameState.shipcrew; return g.over || (g.p === 0 && !g.done); }, 30000)) === 'modal' || await over(p, 'shipcrew')) break;
    const g = await H.G(p, 'shipcrew'), c = g.have === 3 ? g.dice.reduce((a, b) => a + b, 0) : null;
    if (c !== null && (c >= 7 || g.rolls >= 3)) await p.keyboard.press('KeyK'); else await H.click(p, '[data-k="roll"]');
    await H.sleep(80);
  }
  const g = await H.G(p, 'shipcrew'); R.steps.push(`${k} actions; totals you ${g.tot[0]}, Ada ${g.tot[1]}, Gus ${g.tot[2]}`);
} };
D.mate1 = { heKey: { code: 'KeyH', key: 'י' }, async play(p, R, H) {
  for (let k = 0; k < 5; k++) {
    await until(p, H, () => !!gameState.mate1 && !!gameState.mate1.S);
    const m = await p.evaluate(() => { const g = gameState.mate1, M = g.mates[0], other = _chLegal(g.S).find((x) => !g.mates.some((y) => y.f === x.f && y.t === x.t)); return { f: M.f, t: M.t, of: other && other.f, ot: other && other.t }; });
    if (k === 0 && m.of !== undefined) { await H.click(p, `[data-k="q${m.of}"]`); await H.click(p, `[data-k="q${m.ot}"]`); R.steps.push('a move that is not mate -> ' + (await H.msg(p)).slice(0, 45)); }
    await H.click(p, `[data-k="q${m.f}"]`); await H.click(p, `[data-k="q${m.t}"]`);
    R.steps.push(`puzzle ${k + 1}: ` + (await H.msg(p)).slice(0, 30));
    if (k < 4) await H.btn(p, 'Next puzzle');
  }
} };
D.starhop = { heKey: null, async play(p, R, H) {
  let k = 0;
  for (; k < 220; k++) {
    if ((await until(p, H, () => gameState.starhop.turn === 1 || gameState.starhop.over)) === 'modal' || await over(p, 'starhop')) break;
    const mv = await p.evaluate(() => { const g = gameState.starhop, S = g.S; let best = null;
      g.b.forEach((v, i) => { if (v !== 1) return; _shReach(g, i).forEach((path, t) => { const gain = g.pts[t][0] - g.pts[i][0], inG = _shGoal(g, 1, i);
        const sc = gain * 10 + (gain > 0 ? (S - g.pts[i][0]) * 0.8 : 0) - (inG && !_shGoal(g, 1, t) ? 60 : 0) + (_shGoal(g, 1, t) && !inG ? 8 : 0) + (inG && _shGoal(g, 1, t) ? gain * 3 : 0) - Math.abs(g.pts[t][1] - g.pts[t][2]) * 0.5 + Math.random() * 0.5;
        if (!best || sc > best.sc) best = { sc, i, t }; }); }); return best; });
    if (!mv) break;
    await H.click(p, `[data-k="h${mv.i}"]`); await H.click(p, `[data-k="h${mv.t}"]`);
  }
  const g = await H.G(p, 'starhop'); R.steps.push(`${k} moves; blue home ${g.b.filter((v, i) => v === 1 && g.pts[i][0] > g.S).length}`);
} };
module.exports = D;
