// ═══════════════════════════════════════════════════════════════════════════════
// GARDEN HOSE (2026-11, nostalgia batch 3) — the turn-the-pipes puzzle. A garden is laid with pieces of hose, all
// turned the wrong way. Tap a piece to turn it a quarter turn. Water flows from the faucet through every piece that
// lines up. Win when every piece is joined to the faucet and no hose end is left open, so every flower is watered.
// The layout is a random tree of hose grown from the faucet, so there is always an answer; any arrangement that
// joins everything with no open end is accepted. Easy 4x4, normal 5x5, hard 6x6. Moves are counted; no clock.
// A piece's openings are bits: 1 up, 2 right, 4 down, 8 left.
// ═══════════════════════════════════════════════════════════════════════════════
const _HS_D = [[-1, 0, 1, 4], [0, 1, 2, 8], [1, 0, 4, 1], [0, -1, 8, 2]];   // dr, dc, my side, their side
const _hsRot = (m, k) => { for (let i = 0; i < k; i++) m = ((m << 1) | (m >> 3)) & 15; return m; };
function _hsMake(n) {
    for (let t = 0; t < 50; t++) {
        const m = Array.from({ length: n }, () => Array(n).fill(0)), src = [Math.floor(n / 2), Math.floor(n / 2)], inT = new Set([src.join()]);
        const edge = [];   // random spanning tree (randomized Prim), avoiding big crossroads so pieces stay readable
        const add = (r, c) => _HS_D.forEach(([dr, dc, a, b]) => { const y = r + dr, x = c + dc; if (y >= 0 && y < n && x >= 0 && x < n) edge.push([r, c, y, x, a, b]); });
        add(...src);
        while (edge.length) {
            const [r, c, y, x, a, b] = edge.splice(Math.floor(Math.random() * edge.length), 1)[0];
            if (inT.has(y + ',' + x)) continue;
            const bits = (v) => [1, 2, 4, 8].filter((q) => v & q).length;
            if (bits(m[r][c]) >= 3 && Math.random() < 0.85 && edge.some((e) => bits(m[e[0]][e[1]]) < 3 && !inT.has(e[2] + ',' + e[3]))) { edge.push([r, c, y, x, a, b]); continue; }
            m[r][c] |= a; m[y][x] |= b; inT.add(y + ',' + x); add(y, x);
        }
        if (inT.size < n * n) continue;
        const ends = m.flat().filter((v) => [1, 2, 4, 8].includes(v)).length;
        if (ends < n) continue;
        // scramble: every piece that can look different is turned 1-3 quarter turns
        const g = m.map((row) => row.map((v) => _hsRot(v, v === 5 || v === 10 ? 1 : 1 + Math.floor(Math.random() * 3))));   // a straight piece looks the same after a half turn
        return { n, src, sol: m, g };
    }
    return null;
}
// which pieces get water, and is any hose end left open?
function _hsFlow(n, g, src) {
    const wet = Array.from({ length: n }, () => Array(n).fill(false)), st = [src]; wet[src[0]][src[1]] = true; let leaks = 0;
    while (st.length) {
        const [r, c] = st.pop();
        for (const [dr, dc, a, b] of _HS_D) {
            if (!(g[r][c] & a)) continue;
            const y = r + dr, x = c + dc;
            if (y < 0 || y >= n || x < 0 || x >= n || !(g[y][x] & b)) { leaks++; continue; }
            if (!wet[y][x]) { wet[y][x] = true; st.push([y, x]); }
        }
    }
    return { wet, leaks, count: wet.flat().filter(Boolean).length };
}
function initHose() {
    NK.start('hose', {
        setup(gs, diff) {
            const n = diff === 'easy' ? 4 : diff === 'hard' ? 6 : 5;
            let P = null; while (!P) P = _hsMake(n);
            gs.P = P; gs.n = n; gs.g = P.g.map((row) => row.slice()); gs.moves = 0; gs.over = false;
            gs.msg = 'Tap a piece of hose to turn it. Join every piece to the faucet so every flower gets water.';
        },
        view: _hsView,
        rules: [
            'The garden is laid with pieces of hose, all turned the wrong way. The <b>faucet</b> is in the blue square.',
            'Tap a piece to turn it a <b>quarter turn</b> clockwise. Water runs through every piece that lines up with the faucet.',
            'Win when <b>every piece carries water</b> and <b>no hose end is left open</b>. Then every flower at the end of a line is watered.',
            'Moves are counted, but there is no clock and no limit.',
            'Keyboard: arrow keys move, Enter turns a piece.'],
        css: `.hs-b{display:grid;gap:0;background:#65a30d;padding:6px;border-radius:14px;box-shadow:inset 0 0 0 3px #3f6212;max-width:min(100%,30rem,max(18rem,calc(100vh - 300px)));margin:0 auto}
.hs-s{aspect-ratio:1;border:0;padding:0;min-width:0;background:#84cc16;cursor:pointer;--nk-r:6px;box-shadow:inset 0 0 0 1px rgba(63,98,18,.45)}
.hs-s.hs-src{background:#7dd3fc}
.hs-s svg{width:100%;height:100%;display:block;transition:transform .15s}
@media (prefers-reduced-motion:reduce){.hs-s svg{transition:none}}`,
    });
}
function hsTap(r, c) {
    const gs = gameState.hose; if (gs.over) return;
    gs.g[r][c] = _hsRot(gs.g[r][c], 1); gs.moves++; if (typeof sfxFlip === 'function') sfxFlip();
    const F = _hsFlow(gs.n, gs.g, gs.P.src), all = gs.n * gs.n;
    if (F.count === all && !F.leaks) {
        gs.over = true; gs.msg = 'Water reaches every piece and every flower. The garden is watered!'; NK.render('hose'); if (typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('hose', true, `Garden ${gs.n} x ${gs.n} watered in ${NK.pl(gs.moves, 'turn')}.`);
    }
    gs.msg = F.count === all ? `Every piece has water, but ${NK.pl(F.leaks, 'hose end')} ${F.leaks === 1 ? 'is' : 'are'} still open.` : `Water reaches ${F.count} of ${all} pieces.`;
    NK.render('hose');
}
function hsNew() { initHose(); }
function _hsPiece(m, wet, src, flower) {
    const col = wet ? '#0284c7' : '#a8a29e', edge = wet ? '#075985' : '#57534e', arms = { 1: 'M50 50V0', 2: 'M50 50H100', 4: 'M50 50V100', 8: 'M50 50H0' };
    let d = ''; for (const q of [1, 2, 4, 8]) if (m & q) d += arms[q];
    let s = `<path d="${d}" stroke="${edge}" stroke-width="26" stroke-linecap="${flower ? 'round' : 'butt'}" fill="none"/><path d="${d}" stroke="${col}" stroke-width="16" stroke-linecap="${flower ? 'round' : 'butt'}" fill="none"/>`;
    if (src) s += `<circle cx="50" cy="50" r="22" fill="#e2e8f0" stroke="#334155" stroke-width="5"/><rect x="40" y="18" width="20" height="16" rx="4" fill="#334155"/><circle cx="50" cy="50" r="8" fill="#0284c7"/>`;
    else if (flower) s += `<g transform="translate(50 50)">${[0, 72, 144, 216, 288].map((a) => `<ellipse rx="9" ry="15" transform="rotate(${a}) translate(0 -14)" fill="${wet ? '#f472b6' : '#d6d3d1'}" stroke="${wet ? '#9d174d' : '#78716c'}" stroke-width="2.5"/>`).join('')}<circle r="9" fill="${wet ? '#facc15' : '#a8a29e'}" stroke="#713f12" stroke-width="2.5"/></g>`;
    else s += `<circle cx="50" cy="50" r="9" fill="${edge}"/>`;
    return `<svg viewBox="0 0 100 100" aria-hidden="true">${s}</svg>`;
}
const _HS_NAME = (m) => { const o = ['up', 'right', 'down', 'left'].filter((_, i) => m & (1 << i)); return o.length === 1 ? 'flower, hose goes ' + o[0] : 'hose joining ' + o.join(', '); };
function _hsView(gs) {
    const n = gs.n, F = _hsFlow(n, gs.g, gs.P.src);
    let h = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        const m = gs.g[r][c], src = r === gs.P.src[0] && c === gs.P.src[1], flower = [1, 2, 4, 8].includes(m), wet = F.wet[r][c];
        h += `<button type="button" class="nk-cell hs-s${src ? ' hs-src' : ''}" onclick="hsTap(${r},${c})" data-k="s${r}_${c}"${r === 0 && c === 0 ? ' data-first' : ''} aria-label="row ${r + 1} column ${c + 1}: ${src ? 'faucet, ' : ''}${_HS_NAME(m)}, ${wet ? 'has water' : 'dry'}"${gs.over ? ' disabled' : ''}>${_hsPiece(m, wet, src, flower && !src)}</button>`;
    }
    let fw = 0, ft = 0; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) { const m = gs.g[r][c]; if ([1, 2, 4, 8].includes(m) && !(r === gs.P.src[0] && c === gs.P.src[1])) { ft++; if (F.wet[r][c]) fw++; } }
    return `<div class="nk-top"><span>Flowers watered: <b>${fw}</b> of ${ft}</span><span>Turns: <b>${gs.moves}</b></span></div>
      <div class="hs-b" style="grid-template-columns:repeat(${n},1fr)">${h}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('rotate-ccw') + 'New garden', 'hsNew()', { k: 'restart' })}</div>`;
}
