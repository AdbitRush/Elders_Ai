// ═══════════════════════════════════════════════════════════════════════════════
// KNIGHT'S TOUR (2026-11, nostalgia batch 3) — the classic chess-board puzzle: move a knight so that it lands on every
// square exactly once. The knight moves in an L: two squares one way, then one square to the side.
// Easy 5x5 (starting in a corner, which always has a tour), normal 6x6, hard 7x7 (any starting square you choose).
// Squares the knight can reach are dotted; visited squares show their number. Undo; Hint suggests the move with the
// fewest onward exits (Warnsdorff's old rule of thumb), which usually finishes the tour. If you get stuck, Undo.
// ═══════════════════════════════════════════════════════════════════════════════
const _KT_D = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
function initKnightTour() {
    NK.start('knightour', {
        setup(gs, diff) {
            gs.n = diff === 'easy' ? 5 : diff === 'hard' ? 7 : 6;
            gs.v = Array.from({ length: gs.n }, () => Array(gs.n).fill(0)); gs.path = [];
            if (diff === 'easy') { gs.v[0][0] = 1; gs.path.push([0, 0]); }
            gs.over = false; gs.hints = 0; gs.stuck = false;
            gs.msg = gs.path.length ? 'The knight starts in the corner. Tap a dotted square to jump.' : 'Tap any square to put the knight down there.';
        },
        view: _ktView,
        keys: { KeyU: () => ktUndo(), KeyH: () => ktHint() },
        rules: (gs) => [
            `Visit every one of the ${gs.n * gs.n} squares <b>exactly once</b> with the knight.`,
            'The knight moves in an <b>L</b>: two squares across or down, then one square to the side. It jumps over anything in the way.',
            'The squares it can reach next are dotted. Tap one to jump. Visited squares show the order they were visited.',
            'If the knight has nowhere to go before the board is full, press Undo and try another route.',
            'Hint uses an old rule of thumb: go where there are the fewest ways onward. No clock. Keyboard: arrows and Enter, U undo, H hint.'],
        css: `.kt-b{display:grid;border:5px solid #6b4220;border-radius:8px;max-width:min(100%,30rem,max(18rem,calc(100vh - 290px)));margin:0 auto}
.kt-s{aspect-ratio:1;border:0;padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer;--nk-r:0;min-width:0;position:relative;font:900 clamp(.85rem,3.4vw,1.2rem) system-ui;color:#4a3420}
.kt-l{background:#f3e2c2}.kt-d{background:#d8b88f}
.kt-v{background:#bfdbfe!important;color:#1e3a8a}
.kt-k{background:#fde68a!important;box-shadow:inset 0 0 0 4px #b45309}
.kt-k svg{width:70%;height:70%;color:#2b1b0d}
.kt-t::after{content:"";position:absolute;width:30%;height:30%;border-radius:50%;background:#15803d;opacity:.75}
.kt-h::after{background:#f59e0b!important;opacity:1;width:38%;height:38%}`,
    });
}
const _ktMoves = (gs, r, c) => _KT_D.map(([a, b]) => [r + a, c + b]).filter(([y, x]) => y >= 0 && y < gs.n && x >= 0 && x < gs.n && !gs.v[y][x]);
function ktTap(r, c) {
    const gs = gameState.knightour; if (gs.over) return;
    if (!gs.path.length) { gs.v[r][c] = 1; gs.path.push([r, c]); gs.msg = 'The knight is down. Tap a dotted square.'; return NK.render('knightour'); }
    const [pr, pc] = gs.path[gs.path.length - 1];
    if (gs.v[r][c]) { gs.msg = `Square ${gs.v[r][c]} has already been visited.`; return NK.render('knightour'); }
    if (!_ktMoves(gs, pr, pc).some(([y, x]) => y === r && x === c)) { gs.msg = 'A knight cannot jump there. Pick a dotted square.'; return NK.render('knightour'); }
    gs.path.push([r, c]); gs.v[r][c] = gs.path.length; gs.hint = null;
    if (typeof sfxFlip === 'function') sfxFlip();
    if (gs.path.length === gs.n * gs.n) {
        gs.over = true; gs.msg = 'Every square visited - a complete knight\'s tour!'; NK.render('knightour'); if (typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('knightour', true, `Knight's tour of the ${gs.n} x ${gs.n} board complete${gs.hints ? ` (${NK.pl(gs.hints, 'hint')})` : ''}!`);
    }
    const next = _ktMoves(gs, r, c).length;
    gs.stuck = !next;
    gs.msg = next ? `${gs.path.length} of ${gs.n * gs.n} squares.` : `Stuck after ${gs.path.length} squares: no unvisited square is a knight's move away. Press Undo and try another way.`;
    NK.render('knightour');
}
function ktUndo() { const gs = gameState.knightour; if (gs.over || gs.path.length <= 1) return; const [r, c] = gs.path.pop(); gs.v[r][c] = 0; gs.stuck = false; gs.hint = null; gs.msg = 'Jump taken back.'; NK.render('knightour'); }
function ktHint() {
    const gs = gameState.knightour; if (gs.over || !gs.path.length) return;
    const [r, c] = gs.path[gs.path.length - 1], ms = _ktMoves(gs, r, c);
    if (!ms.length) { gs.msg = 'No move from here. Undo first.'; return NK.render('knightour'); }
    ms.sort((a, b) => _ktMoves(gs, ...a).length - _ktMoves(gs, ...b).length); gs.hint = ms[0]; gs.hints++;
    gs.msg = 'Hint: the square with an orange dot has the fewest ways onward.'; NK.render('knightour');
}
function ktGiveUp() { const gs = gameState.knightour; if (gs.over) return; gs.over = true; gs.msg = `The tour ends at ${gs.path.length} of ${gs.n * gs.n} squares.`; NK.render('knightour'); NK.finish('knightour', false, `${gs.path.length} of ${gs.n * gs.n} squares visited. The Hint rule (fewest ways onward) is a good guide.`); }
function ktNew() { initKnightTour(); }
function _ktView(gs) {
    const n = gs.n, last = gs.path[gs.path.length - 1], tg = last && !gs.over ? _ktMoves(gs, ...last) : [];
    let sq = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        const v = gs.v[r][c], here = last && last[0] === r && last[1] === c, t = tg.some(([y, x]) => y === r && x === c), h = gs.hint && gs.hint[0] === r && gs.hint[1] === c;
        sq += `<button type="button" class="nk-cell kt-s ${(r + c) % 2 ? 'kt-d' : 'kt-l'}${v ? ' kt-v' : ''}${here ? ' kt-k' : ''}${t ? ' kt-t' : ''}${h ? ' kt-h' : ''}" onclick="ktTap(${r},${c})" data-k="s${r}_${c}"${r === 0 && c === 0 ? ' data-first' : ''} aria-label="row ${r + 1} column ${c + 1}${here ? ', the knight' : v ? ', visited ' + v : t ? ', you can jump here' : ''}"${gs.over ? ' disabled' : ''}>${here ? `<span style="font:900 1.6rem Georgia,serif;color:#2b1b0d">${v}</span>` : v || ''}</button>`;
    }
    return `<div class="nk-top"><span>Visited: <b>${gs.path.length}</b> of ${n * n}</span><span>Hints: <b>${gs.hints}</b></span></div>
      <div class="kt-b" style="grid-template-columns:repeat(${n},1fr)">${sq}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('undo-2') + 'Undo', 'ktUndo()', { k: 'undo', disabled: gs.over || gs.path.length <= 1 })}${NK.btn(NK.icon('lightbulb') + 'Hint', 'ktHint()', { k: 'hint', disabled: gs.over || !gs.path.length })}${gs.stuck ? NK.btn('Give up', 'ktGiveUp()', { k: 'giveup' }) : ''}${NK.btn(NK.icon('rotate-ccw') + 'New board', 'ktNew()', { k: 'restart' })}</div>`;
}
