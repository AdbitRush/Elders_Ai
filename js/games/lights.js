// ═══════════════════════════════════════════════════════════════════════════════
// LIGHT SWITCH PUZZLE (2026-11, nostalgia batch 2) — in the spirit of the light-grid puzzles on the electronic
// handheld games of the late 1970s. Solo, no clock.
// Pressing a lamp switches it AND its neighbors above, below, left and right (on <-> off). Turn every lamp off.
// Each puzzle is made by pressing random lamps on a dark board, so it can always be solved; "Par" is the fewest
// presses that solve it (computed exactly). Undo, Start over, and a Hint that points at one press of a real solution (worked out
// by elimination over on/off arithmetic, so it is always right).
// Easy 3x3, normal 4x4, hard 5x5. Lit lamps show a sun symbol and "ON", so color is never the only signal.
// ═══════════════════════════════════════════════════════════════════════════════
function initLights() {
    NK.start('lights', {
        setup(gs, diff) {
            gs.n = diff === 'easy' ? 3 : diff === 'hard' ? 5 : 4;
            const N = gs.n * gs.n, k = diff === 'easy' ? 3 : diff === 'hard' ? 7 : 5;
            do {
                gs.on = Array(N).fill(false);
                const presses = new Set(); while (presses.size < k) presses.add(Math.floor(Math.random() * N));
                presses.forEach((i) => _ltPress(gs, i));
                gs.par = _ltMinPar(gs, presses.size);
            } while (gs.on.every((x) => !x));
            gs.start = gs.on.slice(); gs.moves = 0; gs.hist = []; gs.hint = -1; gs.over = false;
            gs.msg = 'Turn every lamp off. Each press also switches the lamps next to it.';
        },
        view: _ltView,
        keys: { KeyU: () => ltUndo(), KeyH: () => ltHint() },
        rules: [
            'The goal is a dark board: every lamp <b>off</b>.',
            'Pressing a lamp switches it, and also the lamps right above, below, left and right of it. On becomes off, off becomes on. Lamps in the corners and along the edges have fewer neighbors.',
            'Pressing the same lamp twice puts everything back, and the order of presses does not matter.',
            '<b>Par</b> is the fewest presses that can solve this puzzle. Matching it is a fine finish, but any finish counts.',
            'Undo takes back a press. Hint rings one lamp that belongs to a real solution from where you are now.',
            'There is no clock. Keyboard: arrows move, Enter presses a lamp, U undoes, H gives a hint.'],
        css: `.lt-board{display:grid;gap:8px;background:#2b1b0d;padding:12px;border-radius:18px;max-width:min(100%,26rem);margin:0 auto;box-shadow:inset 0 0 0 3px #4d2f15}
.lt-l{aspect-ratio:1;border:0;--nk-r:50%;border-radius:50%;background:radial-gradient(circle at 50% 40%,#4b4038,#2a221c);color:#bfb3a5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font:800 .85rem system-ui,sans-serif;cursor:pointer;min-width:0;padding:0}
.lt-on{background:radial-gradient(circle at 50% 40%,#fff9c4,#facc15 55%,#ca8a04);color:#422006;box-shadow:0 0 18px 4px rgba(250,204,21,.55)!important}
.lt-l.lt-hint{outline:5px dashed #60a5fa;outline-offset:2px}
.lt-l:disabled{cursor:default}`,
    });
}
const _ltNb = (n, i) => { const r = Math.floor(i / n), c = i % n, o = [i]; if (r) o.push(i - n); if (r < n - 1) o.push(i + n); if (c) o.push(i - 1); if (c < n - 1) o.push(i + 1); return o; };
function _ltPress(gs, i) { _ltNb(gs.n, i).forEach((j) => (gs.on[j] = !gs.on[j])); }
// solve A x = on over GF(2) (Gauss-Jordan). Returns {x, nulls} - one solution (free variables 0) and a basis of the
// presses that change nothing (none on 3x3, 4 on 4x4, 2 on 5x5) - or null if unsolvable (never, by construction).
function _ltSolve(n, on) {
    const N = n * n, M = [];
    for (let j = 0; j < N; j++) { const row = Array(N + 1).fill(0); _ltNb(n, j).forEach((i) => (row[i] = 1)); row[N] = on[j] ? 1 : 0; M.push(row); }
    let r = 0; const piv = [];
    for (let c = 0; c < N && r < N; c++) {
        let p = r; while (p < N && !M[p][c]) p++; if (p === N) continue;
        [M[r], M[p]] = [M[p], M[r]];
        for (let k = 0; k < N; k++) if (k !== r && M[k][c]) for (let x = c; x <= N; x++) M[k][x] ^= M[r][x];
        piv.push(c); r++;
    }
    for (let k = r; k < N; k++) if (M[k][N]) return null;
    const x = Array(N).fill(0); piv.forEach((c, k) => (x[c] = M[k][N]));
    const nulls = [];
    for (let f = 0; f < N; f++) if (!piv.includes(f)) { const v = Array(N).fill(0); v[f] = 1; piv.forEach((c, k) => (v[c] = M[k][f])); nulls.push(v); }
    return { x, nulls };
}
// the fewest presses that solve the board: the plain solution plus every mix of the null vectors
function _ltBest(n, on) {
    const S = _ltSolve(n, on); if (!S) return null;
    let best = S.x, bc = S.x.reduce((a, b) => a + b, 0);
    for (let m = 1; m < 1 << S.nulls.length; m++) {
        const v = S.x.slice(); S.nulls.forEach((nv, k) => { if (m >> k & 1) nv.forEach((b, i) => (v[i] ^= b)); });
        const c = v.reduce((a, b) => a + b, 0); if (c < bc) { bc = c; best = v; }
    }
    return best;
}
function _ltMinPar(gs, fallback) { const b = _ltBest(gs.n, gs.on); return b ? b.reduce((a, c) => a + c, 0) : fallback; }
function ltTap(i) {
    const gs = gameState.lights; if (gs.over) return;
    gs.hist.push(gs.on.slice()); _ltPress(gs, i); gs.moves++; gs.hint = -1;
    if (typeof sfxFlip === 'function') sfxFlip();
    const left = gs.on.filter(Boolean).length;
    if (!left) {
        gs.over = true; gs.msg = `All dark in ${gs.moves} press${gs.moves === 1 ? '' : 'es'}!`; NK.render('lights');
        if (typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('lights', true, `Every lamp off in ${gs.moves} press${gs.moves === 1 ? '' : 'es'} (par ${gs.par}).${gs.moves <= gs.par ? ' That is par!' : ''}`);
    }
    gs.msg = `${left} lamp${left === 1 ? '' : 's'} still on.`;
    NK.render('lights');
}
function ltUndo() { const gs = gameState.lights; if (gs.over || !gs.hist.length) return; gs.on = gs.hist.pop(); gs.moves = Math.max(0, gs.moves - 1); gs.hint = -1; gs.msg = 'Press taken back.'; NK.render('lights'); }
function ltHint() {
    const gs = gameState.lights; if (gs.over) return;
    const x = _ltBest(gs.n, gs.on);
    gs.hint = x ? x.findIndex(Boolean) : -1;
    gs.msg = gs.hint >= 0 ? 'Try the lamp ringed in blue. It is part of a solution from here.' : 'No hint available.';
    NK.render('lights');
}
function ltReset() { const gs = gameState.lights; if (gs.over) return; gs.on = gs.start.slice(); gs.hist = []; gs.moves = 0; gs.hint = -1; gs.msg = 'Back to the start of this puzzle.'; NK.render('lights'); }
function ltNew() { initLights(); }
function _ltView(gs) {
    const lamps = gs.on.map((v, i) => `<button type="button" class="nk-cell lt-l${v ? ' lt-on' : ''}${gs.hint === i ? ' lt-hint' : ''}" onclick="ltTap(${i})" data-k="l${i}"${i === 0 ? ' data-first' : ''} aria-label="lamp row ${Math.floor(i / gs.n) + 1} column ${i % gs.n + 1}, ${v ? 'on' : 'off'}" aria-pressed="${v}"${gs.over ? ' disabled' : ''}>${v ? Icon.svg('sun', { size: '42%', sw: 2.4 }) + '<span>ON</span>' : '<span>off</span>'}</button>`).join('');
    return `<div class="nk-top"><span>Lamps on: <b>${gs.on.filter(Boolean).length}</b></span><span>Presses: <b>${gs.moves}</b></span><span>Par: <b>${gs.par}</b></span></div>
      <div class="lt-board" style="grid-template-columns:repeat(${gs.n},1fr)">${lamps}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('undo-2') + 'Undo', 'ltUndo()', { k: 'undo', disabled: !gs.hist.length || gs.over })}${NK.btn(NK.icon('lightbulb') + 'Hint', 'ltHint()', { k: 'hint', disabled: gs.over })}${NK.btn('Start over', 'ltReset()', { k: 'reset', disabled: gs.over })}${NK.btn(NK.icon('rotate-ccw') + 'New puzzle', 'ltNew()', { k: 'new' })}</div>`;
}
