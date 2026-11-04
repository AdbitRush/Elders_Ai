// ═══════════════════════════════════════════════════════════════════════════════
// HEX (2026-11, nostalgia batch 3) — the connection game from the 1940s puzzle columns, played on a diamond of
// hexagons. You are red and join the TOP and BOTTOM edges; the computer is blue and joins LEFT and RIGHT. Take turns
// claiming one empty hexagon. Someone always wins: there are no draws. Easy 6x6, normal 7x7 (you move first);
// hard 9x9 with the computer moving first. The computer measures how far each side is from joining its edges
// (a shortest path through its own and empty cells) and picks the cell that helps it most; hard looks a move ahead.
// Cells: index r * n + c; neighbors of (r, c): (r, c±1), (r-1, c), (r-1, c+1), (r+1, c), (r+1, c-1).
// ═══════════════════════════════════════════════════════════════════════════════
const _HX_N = [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, -1]];
function initHex() {
    NK.start('hex', {
        setup(gs, diff) {
            gs.diff = diff; gs.n = diff === 'easy' ? 6 : diff === 'hard' ? 9 : 7; gs.b = Array(gs.n * gs.n).fill(0); gs.over = false; gs.last = -1; gs.path = []; gs.moves = 0;
            gs.turn = diff === 'hard' ? 2 : 1;
            gs.msg = gs.turn === 1 ? 'You are red: join the top and bottom edges. Tap any hexagon.' : 'You are red: join the top and bottom edges. The computer starts.';
            if (gs.turn === 2) NK.after(700, _hxCpu);
        },
        view: _hxView,
        rules: [
            'You are <b>red</b>: build a connected chain of red hexagons from the <b>top edge to the bottom edge</b>.',
            'The computer is <b>blue</b> and joins the <b>left and right</b> edges.',
            'Take turns claiming one empty hexagon. Hexagons that touch along a side are connected.',
            'Someone always wins: the two chains cannot both be blocked. Two cells that share two empty neighbors make a strong "bridge" that is hard to cut.',
            'No clock. Keyboard: arrow keys move between hexagons, Enter claims one.'],
        css: `.hx-b{position:relative;width:min(100%,34rem,max(18rem,calc((100vh - 300px) * 1.55)));margin:0 auto}
.hx-svg{display:block;width:100%;height:auto}
#gameContent .nk button.hx-c{position:absolute}
.hx-c{border-radius:50%;border:0;padding:0;background:transparent;cursor:pointer;--nk-r:50%}
.hx-c:disabled{cursor:default}
.hx-keys{display:flex;justify-content:center;gap:16px;flex-wrap:wrap;font-weight:800;margin:6px 0 0}
.hx-keys i{display:inline-block;width:14px;height:14px;border-radius:3px;vertical-align:-1px;margin-right:4px}`,
    });
}
const _hxNb = (n, i) => { const r = Math.floor(i / n), c = i % n; return _HX_N.map(([a, d]) => [r + a, c + d]).filter(([y, x]) => y >= 0 && y < n && x >= 0 && x < n).map(([y, x]) => y * n + x); };
// fewest empty cells player p still needs to join its edges (0 = joined); also returns the path
function _hxDist(b, n, p) {
    const INF = 1e9, d = Array(n * n).fill(INF), prev = Array(n * n).fill(-1), cost = (i) => (b[i] === p ? 0 : b[i] ? INF : 1);
    const q = [];   // small boards: a simple 0-1 BFS with a deque
    for (let k = 0; k < n; k++) { const i = p === 1 ? k : k * n; const w = cost(i); if (w < INF && w < d[i]) { d[i] = w; w ? q.push(i) : q.unshift(i); } }
    while (q.length) { const i = q.shift(); for (const j of _hxNb(n, i)) { const w = cost(j); if (w >= INF) continue; if (d[i] + w < d[j]) { d[j] = d[i] + w; prev[j] = i; w ? q.push(j) : q.unshift(j); } } }
    let best = INF, end = -1; for (let k = 0; k < n; k++) { const i = p === 1 ? (n - 1) * n + k : k * n + n - 1; if (d[i] < best) { best = d[i]; end = i; } }
    const path = []; for (let i = end; i >= 0; i = prev[i]) path.push(i);
    return { d: best, path };
}
function _hxWon(b, n, p) { const r = _hxDist(b, n, p); return r.d === 0 ? r.path : null; }
function hxTap(i) {
    const gs = gameState.hex; if (gs.over || gs.turn !== 1 || gs.b[i]) return;
    gs.b[i] = 1; gs.last = i; gs.moves++; if (typeof sfxFlip === 'function') sfxFlip();
    const w = _hxWon(gs.b, gs.n, 1); if (w) return _hxEnd(gs, 1, w);
    gs.turn = 2; gs.msg = 'The computer is thinking...'; NK.render('hex'); NK.after(600, _hxCpu);
}
function _hxEval(b, n) { return _hxDist(b, n, 1).d - _hxDist(b, n, 2).d; }   // from blue's side: bigger is better
function _hxCpu() {
    const gs = gameState.hex; if (gs.over || gs.turn !== 2) return; const n = gs.n, b = gs.b;
    const empt = b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
    // candidates: cells on either side's shortest path, plus neighbors of stones
    const cand = new Set([..._hxDist(b, n, 1).path, ..._hxDist(b, n, 2).path].filter((i) => !b[i]));
    b.forEach((v, i) => { if (v) _hxNb(n, i).forEach((j) => { if (!b[j]) cand.add(j); }); });
    if (!cand.size) empt.forEach((i) => cand.add(i));
    if (!b.some(Boolean)) cand.clear(), cand.add(Math.floor(n / 2) * n + Math.floor(n / 2));
    let scored = [...cand].map((i) => { b[i] = 2; const v = _hxEval(b, n) + Math.random() * 0.3; b[i] = 0; return [i, v]; }).sort((a, z) => z[1] - a[1]);
    if (gs.diff === 'hard') {
        scored = scored.slice(0, 8).map(([i]) => { b[i] = 2; let worst = Infinity; const reps = new Set([..._hxDist(b, n, 1).path].filter((j) => !b[j])); for (const j of reps) { b[j] = 1; worst = Math.min(worst, _hxEval(b, n)); b[j] = 0; } b[i] = 0; return [i, worst === Infinity ? 99 : worst + Math.random() * 0.2]; }).sort((a, z) => z[1] - a[1]);
    }
    let pick = scored[0][0];
    if (gs.diff === 'easy' && scored.length > 2 && Math.random() < 0.4) pick = scored[1 + Math.floor(Math.random() * 2)][0];
    b[pick] = 2; gs.last = pick; if (typeof sfxFlip === 'function') sfxFlip();
    const w = _hxWon(b, n, 2); if (w) return _hxEnd(gs, 2, w);
    gs.turn = 1; const need = _hxDist(b, n, 1).d;
    gs.msg = `The computer played row ${Math.floor(pick / n) + 1}, column ${pick % n + 1}. You need ${NK.pl(need, 'more hexagon')} to join top and bottom.`;
    NK.render('hex');
}
function _hxEnd(gs, who, path) {
    gs.over = true; gs.turn = 0; gs.path = path; gs.msg = who === 1 ? 'Top joined to bottom: you win!' : 'The computer joined left to right.';
    NK.render('hex'); if (who === 1 && typeof sfxCorrect === 'function') sfxCorrect();
    NK.finish('hex', who === 1, who === 1 ? `Your red chain joined top and bottom in ${NK.pl(gs.moves, 'move')}.` : 'The computer\'s blue chain got across first. A rematch is one tap away.');
}
function hxNew() { initHex(); }
function _hxView(gs) {
    const n = gs.n, W = 100 / (1.5 * n - 0.5 + 1), H = W * 2 / Math.sqrt(3), ox = W * 0.5, oy = H * 0.7, VW = 100, VH = oy * 2 + ((n - 1) * 0.75 + 1) * H;
    const cx = (r, c) => ox + (c + r * 0.5) * W + W / 2, cy = (r, c) => oy + r * H * 0.75 + H / 2;
    const hexPts = (x, y, s) => [0, 1, 2, 3, 4, 5].map((k) => { const a = Math.PI / 180 * (60 * k - 30); return `${(x + s * Math.cos(a)).toFixed(2)},${(y + s * Math.sin(a)).toFixed(2)}`; }).join(' ');
    // edge bands: red top and bottom, blue left and right
    const tl = [cx(0, 0) - W / 2, cy(0, 0) - H / 2], tr = [cx(0, n - 1) + W / 2, cy(0, n - 1) - H / 2], bl = [cx(n - 1, 0) - W / 2, cy(n - 1, 0) + H / 2], br = [cx(n - 1, n - 1) + W / 2, cy(n - 1, n - 1) + H / 2];
    const band = (a, z, dx, dy, col) => `<polygon points="${a[0]},${a[1]} ${z[0]},${z[1]} ${z[0] + dx},${z[1] + dy} ${a[0] + dx},${a[1] + dy}" fill="${col}"/>`;
    let svg = band(tl, tr, 0, -H * 0.45, '#dc2626') + band(bl, br, 0, H * 0.45, '#dc2626') + band(tl, bl, -W * 0.55, 0, '#2563eb') + band(tr, br, W * 0.55, 0, '#2563eb'), btn = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        const i = r * n + c, v = gs.b[i], x = cx(r, c), y = cy(r, c), onPath = gs.path.includes(i);
        svg += `<polygon points="${hexPts(x, y, H / 2 * 0.97)}" fill="${v === 1 ? '#ef4444' : v === 2 ? '#3b82f6' : '#fef3c7'}" stroke="${onPath ? '#16a34a' : gs.last === i ? '#facc15' : '#92400e'}" stroke-width="${onPath || gs.last === i ? 0.9 : 0.35}"/>`;
        btn += `<button type="button" class="nk-cell hx-c" style="left:${x / VW * 100}%;top:${y / VH * 100}%;width:${W * 0.92}%;height:${(W * 0.92 * VW / VH).toFixed(2)}%;margin:-${(W * 0.46).toFixed(2)}% 0 0 -${(W * 0.46).toFixed(2)}%" onclick="hxTap(${i})" data-k="h${i}"${!v && !btn.includes('data-first') ? ' data-first' : ''} aria-label="row ${r + 1} column ${c + 1}: ${v === 1 ? 'red, yours' : v === 2 ? 'blue, computer' : 'empty'}${gs.last === i ? ', last move' : ''}"${!gs.over && !v ? '' : ' disabled'}></button>`;   // empty cells stay focusable while the computer moves; hxTap ignores taps until it is your turn
    }
    const me = _hxDist(gs.b, n, 1).d, cpu = _hxDist(gs.b, n, 2).d;
    return `<div class="nk-top"><span>${gs.over ? 'Game over' : gs.turn === 1 ? 'Your move (red)' : "Computer's move"}</span><span>You need: <b>${me}</b></span><span>Computer needs: <b>${cpu}</b></span></div>
      <div class="hx-b"><svg class="hx-svg" viewBox="0 0 ${VW} ${VH.toFixed(2)}" aria-hidden="true">${svg}</svg>${btn}</div>
      <div class="hx-keys"><span><i style="background:#dc2626"></i>You: top to bottom</span><span><i style="background:#2563eb"></i>Computer: left to right</span></div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('rotate-ccw') + 'New game', 'hxNew()', { k: 'restart' })}</div>`;
}
