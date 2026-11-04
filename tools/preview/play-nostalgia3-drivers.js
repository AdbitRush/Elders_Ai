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
module.exports = D;
