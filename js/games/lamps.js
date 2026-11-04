// ═══════════════════════════════════════════════════════════════════════════════
// LAMPLIGHTER (2026-11, nostalgia batch 3) — the "light up" grid puzzle of puzzle magazines. Put lamps in white
// squares so every white square is lit. A lamp lights its whole row and column until a dark wall stops it. Two lamps
// may never shine on each other. A number on a wall says how many lamps touch it on its four sides.
// Each puzzle is made by placing walls and then a real set of lamps, so it always has an answer; any answer that
// follows the rules is accepted. Tap a square: lamp, then a dot ("no lamp here"), then empty. Easy 6x6, normal 8x8,
// hard 10x10. No clock.
// ═══════════════════════════════════════════════════════════════════════════════
const _LM_D = [[0, 1], [0, -1], [1, 0], [-1, 0]];
function _lmMake(n) {
    for (let t = 0; t < 50; t++) {
        const W = Array.from({ length: n }, () => Array(n).fill(false));
        // walls in rotational symmetry, like the magazine grids
        for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (!W[r][c] && Math.random() < 0.11) { W[r][c] = true; W[n - 1 - r][n - 1 - c] = true; }
        const lamp = Array.from({ length: n }, () => Array(n).fill(false));
        const lit = (g, r, c) => { if (g[r][c]) return true; for (const [dr, dc] of _LM_D) for (let y = r + dr, x = c + dc; y >= 0 && y < n && x >= 0 && x < n && !W[y][x]; y += dr, x += dc) if (g[y][x]) return true; return false; };
        for (const k of shuffle([...Array(n * n).keys()])) { const r = Math.floor(k / n), c = k % n; if (!W[r][c] && !lit(lamp, r, c)) lamp[r][c] = true; }
        const num = W.map((row, r) => row.map((w, c) => (w ? _LM_D.filter(([a, b]) => lamp[r + a] && lamp[r + a][c + b]).length : -1)));
        const walls = W.flat().filter(Boolean).length;
        if (walls < n * n * 0.12 || walls > n * n * 0.26) continue;
        // a few walls stay blank, as in the paper puzzles; every lamp-touching wall keeps its number
        const show = num.map((row) => row.map((v) => (v > 0 ? v : v === 0 && Math.random() < 0.6 ? 0 : -1)));
        return { n, W, lamp, show };
    }
    return null;
}
function initLamps() {
    NK.start('lamps', {
        setup(gs, diff) {
            const n = diff === 'easy' ? 6 : diff === 'hard' ? 10 : 8;
            let P = null; while (!P) P = _lmMake(n);
            gs.P = P; gs.n = n; gs.g = Array.from({ length: n }, () => Array(n).fill(0)); gs.over = false; gs.hints = 0;
            gs.msg = 'Tap a white square to put a lamp there. Light every white square.';
        },
        view: _lmView,
        keys: { KeyH: () => lmHint() },
        rules: [
            'Put <b>lamps</b> in white squares until <b>every white square is lit</b>.',
            'A lamp lights its whole row and column, up to the nearest dark wall.',
            'Two lamps may <b>never shine on each other</b>. A lamp in trouble turns red.',
            'A number on a wall is how many lamps sit right next to it (above, below, left, right). Walls with no number can have any.',
            'Tap a square once for a lamp, again for a dot that means "no lamp here", again to clear. Hint places one lamp. Any answer that follows the rules wins. No clock.',
            'Keyboard: arrow keys and Enter, H for a hint.'],
        css: `.lm-b{display:grid;gap:2px;background:#334155;padding:4px;border-radius:10px;max-width:min(100%,32rem,max(18rem,calc(100vh - 300px)));margin:0 auto}
.lm-s{aspect-ratio:1;border:0;padding:0;min-width:0;display:flex;align-items:center;justify-content:center;background:#f1f5f9;cursor:pointer;--nk-r:3px;position:relative}
.lm-s.lm-lit{background:#fef08a}
.lm-w{aspect-ratio:1;display:flex;align-items:center;justify-content:center;background:#1e293b;color:#fff;font:900 clamp(.95rem,4vw,1.5rem) Georgia,serif;border-radius:3px}
.lm-w.lm-ok{color:#86efac}.lm-w.lm-bad{color:#fca5a5;box-shadow:inset 0 0 0 3px #f87171}
.lm-s svg{width:70%;height:70%;color:#a16207}
.lm-s.lm-clash{background:#fecaca}.lm-s.lm-clash svg{color:#b91c1c}
.lm-dot{width:18%;height:18%;border-radius:50%;background:#64748b}`,
    });
}
// which squares each lamp lights, and which lamps see each other
function _lmLight(gs) {
    const { n, W } = gs.P, lit = Array.from({ length: n }, () => Array(n).fill(false)), clash = Array.from({ length: n }, () => Array(n).fill(false));
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (gs.g[r][c] === 1) {
        lit[r][c] = true;
        for (const [dr, dc] of _LM_D) for (let y = r + dr, x = c + dc; y >= 0 && y < n && x >= 0 && x < n && !W[y][x]; y += dr, x += dc) { lit[y][x] = true; if (gs.g[y][x] === 1) clash[r][c] = true; }
    }
    return { lit, clash };
}
const _lmAround = (gs, r, c) => _LM_D.filter(([a, b]) => gs.g[r + a] && gs.g[r + a][c + b] === 1).length;
function lmTap(r, c) {
    const gs = gameState.lamps; if (gs.over || gs.P.W[r][c]) return;
    gs.g[r][c] = (gs.g[r][c] + 1) % 3; if (gs.g[r][c] === 1 && typeof sfxFlip === 'function') sfxFlip();
    _lmAfter(gs, gs.g[r][c] === 1 ? 'Lamp placed.' : gs.g[r][c] === 2 ? 'Marked: no lamp here.' : 'Square cleared.');
}
function _lmAfter(gs, said) {
    const { n, W, show } = gs.P, { lit, clash } = _lmLight(gs);
    let dark = 0, clashes = 0, badNum = 0;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) { if (W[r][c]) { if (show[r][c] >= 0 && _lmAround(gs, r, c) !== show[r][c]) badNum++; } else { if (!lit[r][c]) dark++; if (clash[r][c]) clashes++; } }
    if (!dark && !clashes && !badNum) {
        gs.over = true; gs.msg = 'Every square is lit and no lamp shines on another. Solved!'; NK.render('lamps'); if (typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('lamps', true, `Lamplighter ${n} x ${n} solved with ${NK.pl(gs.g.flat().filter((v) => v === 1).length, 'lamp')}${gs.hints ? ` (${NK.pl(gs.hints, 'hint')})` : ''}.`);
    }
    gs.msg = clashes ? `${said} Two lamps shine on each other (shown in red).` : `${said} ${NK.pl(dark, 'white square')} still dark.`;
    NK.render('lamps');
}
function lmHint() {
    const gs = gameState.lamps; if (gs.over) return; const { n, lamp } = gs.P;
    // first take away a lamp that is not in the planned answer and clashes; otherwise add a planned lamp
    const { clash } = _lmLight(gs);
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (gs.g[r][c] === 1 && !lamp[r][c] && clash[r][c]) { gs.g[r][c] = 2; gs.hints++; return _lmAfter(gs, `Hint: the lamp in row ${r + 1}, column ${c + 1} came out.`); }
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (lamp[r][c] && gs.g[r][c] !== 1) {
        // clear any of the player's lamps that this one would shine on
        for (const [dr, dc] of _LM_D) for (let y = r + dr, x = c + dc; y >= 0 && y < n && x >= 0 && x < n && !gs.P.W[y][x]; y += dr, x += dc) if (gs.g[y][x] === 1) gs.g[y][x] = 0;
        gs.g[r][c] = 1; gs.hints++; return _lmAfter(gs, `Hint: a lamp goes in row ${r + 1}, column ${c + 1}.`);
    }
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (gs.g[r][c] === 1 && !lamp[r][c]) { gs.g[r][c] = 0; gs.hints++; return _lmAfter(gs, `Hint: the lamp in row ${r + 1}, column ${c + 1} came out.`); }
}
function lmClear() { const gs = gameState.lamps; if (gs.over) return; gs.g = gs.g.map((row) => row.map(() => 0)); gs.msg = 'All lamps taken away.'; NK.render('lamps'); }
function lmNew() { initLamps(); }
function _lmView(gs) {
    const { n, W, show } = gs.P, { lit, clash } = _lmLight(gs), bulb = Icon.svg('lightbulb', { size: '100%', sw: 2.2, fill: true, fillOpacity: 0.85 });
    let h = '', first = true;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        if (W[r][c]) { const v = show[r][c], k = _lmAround(gs, r, c); h += `<span class="lm-w${v >= 0 ? (k === v ? ' lm-ok' : k > v ? ' lm-bad' : '') : ''}" role="img" aria-label="wall${v >= 0 ? ' needing ' + v + ', has ' + k : ''}">${v >= 0 ? v : ''}</span>`; continue; }
        const v = gs.g[r][c], cls = `nk-cell lm-s${lit[r][c] ? ' lm-lit' : ''}${v === 1 && clash[r][c] ? ' lm-clash' : ''}`;
        h += `<button type="button" class="${cls}" onclick="lmTap(${r},${c})" data-k="s${r}_${c}"${first ? ' data-first' : ''} aria-label="row ${r + 1} column ${c + 1}: ${v === 1 ? 'lamp' + (clash[r][c] ? ', shines on another lamp' : '') : v === 2 ? 'marked no lamp' : lit[r][c] ? 'lit' : 'dark'}"${gs.over ? ' disabled' : ''}>${v === 1 ? bulb : v === 2 ? '<span class="lm-dot"></span>' : ''}</button>`;
        first = false;
    }
    const whites = W.flat().filter((w) => !w).length, litN = lit.flat().filter((x, i) => x && !W.flat()[i]).length;
    return `<div class="nk-top"><span>Lit: <b>${litN}</b> of ${whites}</span><span>Hints: <b>${gs.hints}</b></span></div>
      <div class="lm-b" style="grid-template-columns:repeat(${n},1fr)">${h}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('lightbulb') + 'Hint', 'lmHint()', { k: 'hint', disabled: gs.over })}${NK.btn('Clear all', 'lmClear()', { k: 'clear', disabled: gs.over })}${NK.btn(NK.icon('rotate-ccw') + 'New puzzle', 'lmNew()', { k: 'restart' })}</div>`;
}
