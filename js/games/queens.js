// ═══════════════════════════════════════════════════════════════════════════════
// EIGHT QUEENS (2026-11, nostalgia batch 3) — the old chess-board puzzle: place queens so that no two attack each
// other (same row, column or diagonal). Easy: 6 queens on 6x6 with the attacked squares shaded. Normal: 8 on 8x8,
// shaded. Hard: 8 on 8x8, no shading, and two queens already fixed in place (always part of a real solution).
// Tap a square to place or remove a queen. Hint adds one queen that still leads to a full solution. No clock.
// ═══════════════════════════════════════════════════════════════════════════════
function _qnSolve(n, fixed) {
    // backtracking by rows; fixed = {row: col}
    const col = Array(n).fill(-1), out = [];
    (function go(r) {
        if (out.length) return;
        if (r === n) { out.push(col.slice()); return; }
        const opts = fixed[r] !== undefined ? [fixed[r]] : shuffle([...Array(n).keys()]);
        for (const c of opts) { if (col.slice(0, r).some((cc, rr) => cc === c || Math.abs(cc - c) === r - rr)) continue; col[r] = c; go(r + 1); col[r] = -1; }
    })(0);
    return out[0] || null;
}
function initQueens() {
    NK.start('queens', {
        setup(gs, diff) {
            gs.n = diff === 'easy' ? 6 : 8; gs.shade = diff !== 'hard';
            gs.q = []; gs.fixed = [];
            if (diff === 'hard') { const s = _qnSolve(8, {}); const rows = shuffle([...Array(8).keys()]).slice(0, 2); gs.fixed = rows.map((r) => [r, s[r]]); gs.q = gs.fixed.map((x) => x.slice()); }
            gs.over = false; gs.hints = 0;
            gs.msg = `Place ${gs.n} queens so that no two share a row, a column or a diagonal.`;
        },
        view: _qnView,
        keys: { KeyH: () => qnHint() },
        rules: (gs) => [
            `Place <b>${gs.n} queens</b> on the ${gs.n} x ${gs.n} board.`,
            'A queen attacks every square in its <b>row</b>, its <b>column</b> and both <b>diagonals</b>. No queen may attack another.',
            'Tap an empty square to place a queen; tap a queen to take it away.',
            gs.shade ? 'Squares that a queen already attacks are shaded, and queens in conflict are ringed in red.' : 'On hard there is no shading, and two queens are fixed in place (marked with a pin).',
            'Hint places one queen that still leads to a full solution. No clock. Keyboard: arrow keys and Enter, H for a hint.'],
        css: `.qn-b{display:grid;gap:0;border:5px solid #6b4220;border-radius:8px;max-width:min(100%,30rem,max(18rem,calc(100vh - 290px)));margin:0 auto}
.qn-s{aspect-ratio:1;border:0;padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer;--nk-r:0;min-width:0;position:relative}
.qn-l{background:#f3e2c2}.qn-d{background:#b07b4f}
.qn-at.qn-l{background:#e8d1a8}.qn-at.qn-d{background:#946240}
.qn-at::after{content:"";position:absolute;width:20%;height:20%;border-radius:50%;background:rgba(43,27,13,.35)}
.qn-s svg{width:72%;height:72%}
.qn-bad{box-shadow:inset 0 0 0 4px #dc2626}
.qn-fx::before{content:"";position:absolute;top:6%;right:8%;width:16%;height:16%;border-radius:50%;background:#1d4ed8;border:2px solid #fff}`,
    });
}
const _qnAtt = (a, b) => a[0] === b[0] || a[1] === b[1] || Math.abs(a[0] - b[0]) === Math.abs(a[1] - b[1]);
const _qnIdx = (gs, r, c) => gs.q.findIndex((x) => x[0] === r && x[1] === c);
function qnTap(r, c) {
    const gs = gameState.queens; if (gs.over) return;
    const i = _qnIdx(gs, r, c);
    if (i >= 0) { if (gs.fixed.some((x) => x[0] === r && x[1] === c)) { gs.msg = 'That queen is fixed in place for this puzzle.'; return NK.render('queens'); } gs.q.splice(i, 1); gs.msg = 'Queen taken away.'; return NK.render('queens'); }
    if (gs.q.length >= gs.n) { gs.msg = `All ${gs.n} queens are on the board. Take one away first.`; return NK.render('queens'); }
    gs.q.push([r, c]); if (typeof sfxFlip === 'function') sfxFlip();
    const bad = gs.q.filter((a, k) => gs.q.some((b, j) => j !== k && _qnAtt(a, b))).length;
    if (gs.q.length === gs.n && !bad) {
        gs.over = true; gs.msg = `All ${gs.n} queens are safe. Solved!`; NK.render('queens'); if (typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('queens', true, `${gs.n} queens placed with none attacking another${gs.hints ? ` (${NK.pl(gs.hints, 'hint')})` : ''}.`);
    }
    gs.msg = bad ? `${NK.pl(bad, 'queen')} ${bad === 1 ? 'is' : 'are'} under attack.` : `${gs.q.length} of ${gs.n} queens placed, all safe so far.`;
    NK.render('queens');
}
function qnHint() {
    const gs = gameState.queens; if (gs.over) return;
    // keep the queens that fit together with some full solution; find one that extends them
    const fx = {}; gs.q.forEach(([r, c]) => (fx[r] = c));
    const rowsOk = Object.keys(fx).length === gs.q.length;
    const s = rowsOk ? _qnSolve(gs.n, fx) : null;
    if (!s) { gs.msg = 'The queens on the board cannot all be part of one solution. Take one or two away (the ringed ones are a good start).'; return NK.render('queens'); }
    const r = [...Array(gs.n).keys()].find((x) => fx[x] === undefined); gs.hints++;
    return qnTap(r, s[r]);
}
function qnClear() { const gs = gameState.queens; if (gs.over) return; gs.q = gs.fixed.map((x) => x.slice()); gs.msg = 'Board cleared.'; NK.render('queens'); }
function qnNew() { initQueens(); }
function _qnView(gs) {
    const n = gs.n, crown = Icon.svg('crown', { size: '100%', sw: 2.2, fill: true, fillOpacity: 1 });
    let sq = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        const qi = _qnIdx(gs, r, c), has = qi >= 0, at = !has && gs.shade && gs.q.some((x) => _qnAtt(x, [r, c]));
        const bad = has && gs.shade && gs.q.some((x, j) => j !== qi && _qnAtt(x, [r, c])), fx = gs.fixed.some((x) => x[0] === r && x[1] === c);
        sq += `<button type="button" class="nk-cell qn-s ${(r + c) % 2 ? 'qn-d' : 'qn-l'}${at ? ' qn-at' : ''}${bad ? ' qn-bad' : ''}${fx ? ' qn-fx' : ''}" onclick="qnTap(${r},${c})" data-k="s${r}_${c}"${r === 0 && c === 0 ? ' data-first' : ''} aria-label="row ${r + 1} column ${c + 1}${has ? ', queen' : at ? ', attacked' : ''}${fx ? ', fixed' : ''}"${gs.over ? ' disabled' : ''} style="color:${(r + c) % 2 ? '#fff7e6' : '#2b1b0d'}">${has ? crown : ''}</button>`;
    }
    return `<div class="nk-top"><span>Queens: <b>${gs.q.length}</b> of ${n}</span><span>Hints: <b>${gs.hints}</b></span></div>
      <div class="qn-b" style="grid-template-columns:repeat(${n},1fr)">${sq}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('lightbulb') + 'Hint', 'qnHint()', { k: 'hint', disabled: gs.over })}${NK.btn('Clear board', 'qnClear()', { k: 'clear', disabled: gs.over })}${NK.btn(NK.icon('rotate-ccw') + 'New puzzle', 'qnNew()', { k: 'restart' })}</div>`;
}
