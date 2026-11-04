// ═══════════════════════════════════════════════════════════════════════════════
// ISLAND BRIDGES (2026-11, nostalgia batch 3) — the island-and-bridge logic puzzle of puzzle magazines.
// Connect the islands with bridges so that each island has exactly as many bridges as its number. Bridges run
// straight across or down, never cross each other, and two islands may share one or two bridges. All islands must
// end up joined into one group. Each puzzle is grown from a real network of bridges, so it always has an answer;
// any answer that follows the rules is accepted. Tap an island, then a neighbor in a straight line: each tap adds a
// bridge (0 -> 1 -> 2 -> 0). Easy 7x7, normal 9x9, hard 11x11. No clock.
// ═══════════════════════════════════════════════════════════════════════════════
function _brMake(n, want) {
    for (let t = 0; t < 200; t++) {
        const isl = [[Math.floor(n / 2), Math.floor(n / 2)]], key = (r, c) => r + ',' + c, at = new Map([[key(...isl[0]), 0]]), br = [];
        const occ = new Set();   // cells covered by bridges
        for (let k = 0; k < 600 && isl.length < want; k++) {
            const a = Math.floor(Math.random() * isl.length), [r, c] = isl[a], [dr, dc] = [[0, 1], [0, -1], [1, 0], [-1, 0]][Math.floor(Math.random() * 4)], len = 2 + Math.floor(Math.random() * 3);
            const r2 = r + dr * len, c2 = c + dc * len; if (r2 < 0 || r2 >= n || c2 < 0 || c2 >= n || at.has(key(r2, c2))) continue;
            let ok = true; const cells = [];
            for (let s = 1; s < len; s++) { const y = r + dr * s, x = c + dc * s; if (at.has(key(y, x)) || occ.has(key(y, x))) { ok = false; break; } cells.push(key(y, x)); }
            // keep islands from touching side by side (clearer to read)
            if ([[0, 1], [0, -1], [1, 0], [-1, 0]].some(([a2, b2]) => at.has(key(r2 + a2, c2 + b2)) && !(r2 + a2 === r && c2 + b2 === c))) ok = false;
            if (!ok || occ.has(key(r2, c2))) continue;
            cells.forEach((x) => occ.add(x)); at.set(key(r2, c2), isl.length); isl.push([r2, c2]); br.push([a, isl.length - 1, Math.random() < 0.4 ? 2 : 1]);
        }
        if (isl.length < want) continue;
        const deg = isl.map(() => 0); br.forEach(([a, b, k]) => { deg[a] += k; deg[b] += k; });
        return { n, isl, deg, sol: br };   // sol: the network the puzzle was grown from (one answer of possibly several)
    }
    return null;
}
function initBridges() {
    NK.start('bridges', {
        setup(gs, diff) {
            const [n, want] = diff === 'easy' ? [7, 7] : diff === 'hard' ? [11, 18] : [9, 12];
            let P = null; while (!P) P = _brMake(n, want);
            gs.P = P; gs.b = {}; gs.sel = -1; gs.over = false;
            gs.msg = 'Tap an island, then another island in a straight line, to add a bridge between them.';
        },
        view: _brView,
        rules: [
            'Each island\'s number is how many <b>bridges</b> it must have.',
            'Bridges run <b>straight</b> across or down between two islands, and may <b>not cross</b> other bridges or islands.',
            'Two islands can share <b>one or two</b> bridges. Tap the first island, then the second: each tap adds a bridge (a third tap takes them away).',
            'Finish with every island at its number and all islands joined into <b>one group</b>.',
            'Islands that are full turn green; too many turns them red. No clock. Keyboard: arrows and Enter on the islands.'],
        css: `.br-b{position:relative;width:min(100%,32rem,max(18rem,calc(100vh - 300px)));aspect-ratio:1;margin:0 auto;background:radial-gradient(circle at 40% 30%,#7dd3fc,#0ea5e9);border-radius:16px;box-shadow:inset 0 0 0 4px #0369a1}
.br-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
#gameContent .nk button.br-i{position:absolute}
.br-i{width:11%;height:11%;margin:-5.5% 0 0 -5.5%;border-radius:50%;border:3px solid #78350f;background:radial-gradient(circle at 40% 35%,#fef3c7,#fcd34d);font:900 clamp(.9rem,3.8vw,1.45rem) Georgia,serif;color:#2b1b0d;cursor:pointer;padding:0;--nk-r:50%;--nk-bw:3px;z-index:2}
.br-i.br-ok{background:radial-gradient(circle at 40% 35%,#dcfce7,#4ade80);border-color:#14532d}
.br-i.br-over{background:#fecaca;border-color:#b91c1c}
.br-i.br-sel{box-shadow:0 0 0 4px #fff,0 0 0 7px #1d4ed8}
.br-i.br-can{box-shadow:0 0 0 4px #fde68a}`,
    });
}
const _brKey = (a, b) => (a < b ? a + '-' + b : b + '-' + a);
// islands that a straight bridge from i can reach (the nearest island in each direction)
function _brNbrs(P, i) {
    const [r, c] = P.isl[i], out = [];
    for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { for (let s = 1; s < P.n; s++) { const y = r + dr * s, x = c + dc * s; const j = P.isl.findIndex(([a, b]) => a === y && b === x); if (j >= 0) { out.push(j); break; } if (y < 0 || y >= P.n || x < 0 || x >= P.n) break; } }
    return out;
}
function _brCross(P, b, a1, b1) {
    const seg = (a, bb) => { const [r1, c1] = P.isl[a], [r2, c2] = P.isl[bb]; return { h: r1 === r2, r: r1, c: c1, r2, c2, lo: Math.min(r1 === r2 ? c1 : r1, r1 === r2 ? c2 : r2), hi: Math.max(r1 === r2 ? c1 : r1, r1 === r2 ? c2 : r2) }; };
    const s = seg(a1, b1);
    return Object.keys(b).some((k) => { if (!b[k]) return false; const [x, y] = k.split('-').map(Number); if ([x, y].includes(a1) && [x, y].includes(b1)) return false; const t = seg(x, y); if (s.h === t.h) return false;
        const H = s.h ? s : t, V = s.h ? t : s; return V.c > H.lo && V.c < H.hi && H.r > V.lo && H.r < V.hi; });
}
const _brDeg = (gs, i) => Object.entries(gs.b).reduce((a, [k, v]) => a + (k.split('-').map(Number).includes(i) ? v : 0), 0);
function brTap(i) {
    const gs = gameState.bridges; if (gs.over) return;
    if (gs.sel < 0 || gs.sel === i) { gs.sel = gs.sel === i ? -1 : i; gs.msg = gs.sel < 0 ? '' : 'Now tap an island in a straight line from it (a yellow ring).'; return NK.render('bridges'); }
    const a = gs.sel, k = _brKey(a, i);
    if (!_brNbrs(gs.P, a).includes(i)) { gs.sel = i; gs.msg = 'Those islands are not in a straight line with nothing between. This island is picked now.'; return NK.render('bridges'); }
    if (!gs.b[k] && _brCross(gs.P, gs.b, a, i)) { gs.msg = 'That bridge would cross another one.'; if (typeof sfxWrong === 'function') sfxWrong(); return NK.render('bridges'); }
    gs.b[k] = ((gs.b[k] || 0) + 1) % 3; gs.sel = -1; if (typeof sfxFlip === 'function') sfxFlip();
    if (gs.P.isl.every((_, j) => _brDeg(gs, j) === gs.P.deg[j]) && _brConnected(gs)) {
        gs.over = true; gs.msg = 'Every island has its bridges and all are joined. Done!'; NK.render('bridges'); if (typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('bridges', true, `All ${gs.P.isl.length} islands joined with the right number of bridges.`);
    }
    gs.msg = gs.P.isl.every((_, j) => _brDeg(gs, j) === gs.P.deg[j]) ? 'Every number is met, but the islands are not all joined in one group yet.' : `${gs.b[k] === 0 ? 'Bridges removed' : NK.pl(gs.b[k], 'bridge') + ' there now'}.`;
    NK.render('bridges');
}
function _brConnected(gs) { const n = gs.P.isl.length, seen = new Set([0]), st = [0]; while (st.length) { const i = st.pop(); Object.entries(gs.b).forEach(([k, v]) => { if (!v) return; const [x, y] = k.split('-').map(Number); const j = x === i ? y : y === i ? x : -1; if (j >= 0 && !seen.has(j)) { seen.add(j); st.push(j); } }); } return seen.size === n; }
function brClear() { const gs = gameState.bridges; if (gs.over) return; gs.b = {}; gs.sel = -1; gs.msg = 'All bridges removed.'; NK.render('bridges'); }
function brNew() { initBridges(); }
function _brView(gs) {
    const P = gs.P, u = 100 / P.n, pos = ([r, c]) => [(c + 0.5) * u, (r + 0.5) * u];
    let lines = '';
    Object.entries(gs.b).forEach(([k, v]) => { if (!v) return; const [a, b] = k.split('-').map(Number), [x1, y1] = pos(P.isl[a]), [x2, y2] = pos(P.isl[b]), h = y1 === y2, o = v === 2 ? 0.9 : 0;
        for (const d of v === 2 ? [-o, o] : [0]) lines += `<line x1="${x1 + (h ? 0 : d)}" y1="${y1 + (h ? d : 0)}" x2="${x2 + (h ? 0 : d)}" y2="${y2 + (h ? d : 0)}" stroke="#78350f" stroke-width="1.1" stroke-linecap="round"/><line x1="${x1 + (h ? 0 : d)}" y1="${y1 + (h ? d : 0)}" x2="${x2 + (h ? 0 : d)}" y2="${y2 + (h ? d : 0)}" stroke="#fbbf24" stroke-width=".5" stroke-dasharray="1 .6"/>`; });
    const can = gs.sel >= 0 ? _brNbrs(P, gs.sel) : [], sz = Math.min(11, u * 0.9).toFixed(2);
    const isl = P.isl.map((p, i) => { const [x, y] = pos(p), d = _brDeg(gs, i), cls = d === P.deg[i] ? ' br-ok' : d > P.deg[i] ? ' br-over' : '';
        return `<button type="button" class="nk-cell br-i${cls}${gs.sel === i ? ' br-sel' : ''}${can.includes(i) ? ' br-can' : ''}" style="left:${x}%;top:${y}%;width:${sz}%;height:${sz}%;margin:-${sz / 2}% 0 0 -${sz / 2}%" onclick="brTap(${i})" data-k="i${i}"${i === 0 ? ' data-first' : ''} aria-label="island needing ${P.deg[i]}, has ${d}"${gs.over ? ' disabled' : ''}>${P.deg[i]}</button>`; }).join('');
    const done = P.isl.filter((_, j) => _brDeg(gs, j) === P.deg[j]).length;
    return `<div class="nk-top"><span>Islands complete: <b>${done}</b> of ${P.isl.length}</span></div>
      <div class="br-b"><svg class="br-svg" viewBox="0 0 100 100" aria-hidden="true">${lines}</svg>${isl}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn('Remove all bridges', 'brClear()', { k: 'clear', disabled: gs.over })}${NK.btn(NK.icon('rotate-ccw') + 'New puzzle', 'brNew()', { k: 'restart' })}</div>`;
}
