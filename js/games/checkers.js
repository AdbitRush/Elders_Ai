// ═══════════════════════════════════════════════════════════════════════════════
// CHECKERS vs COMPUTER (2026-10, wave 1) — American checkers on the dark squares of an 8x8 board.
// You are red (bottom) and move first. Jumps are mandatory and multi-jumps continue; reaching the far row crowns a king.
// The computer looks ahead (Easy 1 move, Normal 3, Hard 5) with a simple material score.
// You win when the computer has no pieces or no legal move; you lose the other way round. 80 moves without a capture = draw.
// ═══════════════════════════════════════════════════════════════════════════════
function initCheckers(container) {
    GameKit.css();
    const gs = gameState.checkers;
    // board[r][c]: 0 empty, 1 red man, 2 red king, -1 white man, -2 white king. Row 0 = top (computer side).
    gs.b = Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => ((r + c) % 2 === 1) ? (r < 3 ? -1 : r > 4 ? 1 : 0) : 0));
    gs.turn = 1; gs.sel = null; gs.chain = null; gs.quiet = 0; gs.busy = false; gs.msg = 'Your move: you are red.';
    const d = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
    gs.depth = d === 'easy' ? 1 : d === 'hard' ? 5 : 3;
    _ckRender();
}
const _CK_DIRS = { 1: [[-1, -1], [-1, 1]], '-1': [[1, -1], [1, 1]], K: [[-1, -1], [-1, 1], [1, -1], [1, 1]] };
function _ckDirs(p) { return Math.abs(p) === 2 ? _CK_DIRS.K : _CK_DIRS[p > 0 ? 1 : '-1']; }
function _ckIn(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }
// all moves for `side` (1 red / -1 white): captures only if any capture exists. A move = {from:[r,c], path:[[r,c]...], caps:[[r,c]...]}
function _ckMoves(b, side, only) {
    const caps = [], plain = [];
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
        const p = b[r][c]; if (!p || Math.sign(p) !== side) continue;
        if (only && (only[0] !== r || only[1] !== c)) continue;
        _ckJumps(b, r, c, p, [], [], caps, [r, c]);
        if (!only) for (const [dr, dc] of _ckDirs(p)) { const nr = r + dr, nc = c + dc; if (_ckIn(nr, nc) && !b[nr][nc]) plain.push({ from: [r, c], path: [[nr, nc]], caps: [] }); }
    }
    return caps.length ? caps : plain;
}
function _ckJumps(b, r, c, p, path, capd, out, from) {
    let any = false;
    for (const [dr, dc] of _ckDirs(p)) {
        const mr = r + dr, mc = c + dc, lr = r + 2 * dr, lc = c + 2 * dc;
        if (!_ckIn(lr, lc) || b[lr][lc] || !b[mr][mc] || Math.sign(b[mr][mc]) === Math.sign(p) || capd.some(x => x[0] === mr && x[1] === mc)) continue;
        any = true;
        const crowned = Math.abs(p) === 1 && (lr === 0 || lr === 7);
        const nb = b.map(row => row.slice()); nb[r][c] = 0; nb[lr][lc] = p;
        const np = path.concat([[lr, lc]]), nc = capd.concat([[mr, mc]]);
        if (crowned) out.push({ from, path: np, caps: nc });            // crowning ends the move
        else _ckJumps(nb, lr, lc, p, np, nc, out, from);
    }
    if (!any && path.length) out.push({ from, path, caps: capd });
}
function _ckApply(b, m) {
    const nb = b.map(row => row.slice()); const [r, c] = m.from; let p = nb[r][c]; nb[r][c] = 0;
    for (const [cr, cc] of m.caps) nb[cr][cc] = 0;
    const [er, ec] = m.path[m.path.length - 1];
    if (p === 1 && er === 0) p = 2; if (p === -1 && er === 7) p = -2;
    nb[er][ec] = p; return nb;
}
function _ckScore(b) { let s = 0; for (const row of b) for (const p of row) s += p === 1 ? 10 : p === 2 ? 17 : p === -1 ? -10 : p === -2 ? -17 : 0; return s; }
function _ckSearch(b, side, depth, alpha, beta) {
    const ms = _ckMoves(b, side);
    if (!ms.length) return side === 1 ? -1000 - depth : 1000 + depth;   // side to move has lost
    if (depth === 0) return _ckScore(b);
    if (side === -1) { let best = Infinity; for (const m of ms) { best = Math.min(best, _ckSearch(_ckApply(b, m), 1, depth - 1, alpha, beta)); beta = Math.min(beta, best); if (beta <= alpha) break; } return best; }
    let best = -Infinity; for (const m of ms) { best = Math.max(best, _ckSearch(_ckApply(b, m), -1, depth - 1, alpha, beta)); alpha = Math.max(alpha, best); if (beta <= alpha) break; } return best;
}
function _ckAiMove() {
    const gs = gameState.checkers; if (!gameState.active || gameState.currentId !== 'checkers') return;
    const ms = _ckMoves(gs.b, -1);
    if (!ms.length) return _ckEnd(true);
    let best = null, bv = Infinity;
    for (const m of shuffle(ms.slice())) { const v = _ckSearch(_ckApply(gs.b, m), 1, gs.depth - 1, -Infinity, Infinity); if (v < bv) { bv = v; best = m; } }
    gs.b = _ckApply(gs.b, best); gs.last = best; gs.quiet = best.caps.length ? 0 : gs.quiet + 1;
    best.caps.length ? sfxWrong() : sfxFlip();
    gs.turn = 1; gs.busy = false; gs.msg = best.caps.length ? `The computer jumped ${best.caps.length === 1 ? 'one piece' : best.caps.length + ' pieces'}. Your move.` : 'Your move.';
    if (!_ckMoves(gs.b, 1).length) { _ckRender(); return _ckEnd(false); }
    if (gs.quiet >= 80) { _ckRender(); return GameKit.finish('checkers', false, 'A draw: 80 moves without a capture.'); }
    _ckRender();
}
function _ckCount(b, side) { let n = 0; for (const row of b) for (const p of row) if (Math.sign(p) === side) n++; return n; }
function _ckEnd(win) {
    const gs = gameState.checkers; gs.over = true;
    GameKit.finish('checkers', win, win ? `You won with ${_ckCount(gs.b, 1)} piece${_ckCount(gs.b, 1) === 1 ? '' : 's'} left.` : 'The computer won this game.');
}
function ckTap(r, c) {
    const gs = gameState.checkers; if (!gameState.active || gameState.currentId !== 'checkers' || gs.turn !== 1 || gs.busy || gs.over) return;
    const legal = _ckMoves(gs.b, 1, gs.chain ? gs.chain.at : null);
    const p = gs.b[r][c];
    if (p > 0 && !gs.chain) {
        if (!legal.some(m => m.from[0] === r && m.from[1] === c)) { gs.msg = legal.length && legal[0].caps.length ? 'You have a jump: you must take it.' : 'That piece cannot move.'; sfxWrong(); gs.sel = null; return _ckRender(); }
        gs.sel = [r, c]; sfxFlip(); return _ckRender();
    }
    if (!gs.sel) return;
    // a step of a legal move from the selected piece to (r,c)
    const step = gs.chain ? gs.chain.n : 0;
    const cand = legal.filter(m => m.from[0] === gs.sel[0] && m.from[1] === gs.sel[1] && m.path[step] && m.path[step][0] === r && m.path[step][1] === c
        && (!gs.chain || JSON.stringify(m.path.slice(0, step)) === JSON.stringify(gs.chain.done)));
    if (!cand.length) { sfxWrong(); gs.msg = 'Not a legal square.'; return _ckRender(); }
    const full = cand.find(m => m.path.length === step + 1);
    if (full && cand.length === 1) {
        gs.b = _ckApply(gs.b, full); gs.quiet = full.caps.length ? 0 : gs.quiet + 1; gs.sel = null; gs.chain = null; sfxCorrect();
        if (!_ckMoves(gs.b, -1).length) { _ckRender(); return _ckEnd(true); }
        gs.turn = -1; gs.busy = true; gs.msg = 'The computer is thinking…'; _ckRender(); setTimeout(_ckAiMove, 650); return;
    }
    // part of a multi-jump: show the piece on the landing square, keep jumping
    gs.chain = { at: gs.sel, n: step + 1, done: (gs.chain ? gs.chain.done : []).concat([[r, c]]) };
    gs.msg = 'Keep jumping!'; sfxCorrect(); _ckRender();
}
function _ckRender() {
    const gs = gameState.checkers, el = document.getElementById('gameContent');
    if (!el || gameState.currentId !== 'checkers') return;
    const legal = gs.turn === 1 ? _ckMoves(gs.b, 1) : [];
    const step = gs.chain ? gs.chain.n : 0;
    const targets = gs.sel ? legal.filter(m => m.from[0] === gs.sel[0] && m.from[1] === gs.sel[1] && (!gs.chain || JSON.stringify(m.path.slice(0, step)) === JSON.stringify(gs.chain.done))).map(m => m.path[step] && m.path[step].join(',')) : [];
    const movable = new Set(legal.map(m => m.from.join(',')));
    let cells = '';
    // during a multi-jump, show the moving piece where it has landed so far
    const view = gs.chain ? (() => { const b = gs.b.map(r => r.slice()); const [sr, sc] = gs.sel, p = b[sr][sc]; b[sr][sc] = 0; const [lr, lc] = gs.chain.done[gs.chain.done.length - 1]; b[lr][lc] = p; return b; })() : gs.b;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
        const dark = (r + c) % 2 === 1, p = view[r][c], k = r + ',' + c;
        const isSel = gs.sel && ((gs.chain && gs.chain.done.length && gs.chain.done[gs.chain.done.length - 1].join(',') === k) || (!gs.chain && gs.sel.join(',') === k));
        const piece = p ? `<span class="ck-p ${p > 0 ? 'ck-red' : 'ck-white'}${isSel ? ' ck-sel' : ''}${p > 0 && !gs.sel && movable.has(k) ? ' ck-can' : ''}">${Math.abs(p) === 2 ? Icon.ui('crown') : ''}</span>` : '';
        cells += `<div class="ck-sq ${dark ? 'ck-dark' : 'ck-light'}${targets.includes(k) ? ' ck-target' : ''}"${dark ? ` onclick="ckTap(${r},${c})"` : ''}>${piece}</div>`;
    }
    el.innerHTML = `<div class="gk-wood ck" dir="ltr">
      <div class="gk-status">${gs.msg}</div>
      <div class="ck-board">${cells}</div>
      <div class="gk-label">You: ${_ckCount(gs.b, 1)} · Computer: ${_ckCount(gs.b, -1)}</div>
    </div>
    <style>.ck .ck-board{display:grid;grid-template-columns:repeat(8,1fr);width:min(100%,560px);aspect-ratio:1;margin:0 auto;border:6px solid #3b2410;border-radius:8px;overflow:hidden}
    .ck .ck-sq{position:relative;display:flex;align-items:center;justify-content:center}.ck .ck-light{background:#f3e3c3}.ck .ck-dark{background:#7a4a24;cursor:pointer}
    .ck .ck-target::after{content:'';position:absolute;width:34%;height:34%;border-radius:50%;background:#fde68a;box-shadow:0 0 0 4px #f59e0b}
    .ck .ck-p{width:80%;height:80%;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:clamp(14px,4vw,30px);box-shadow:0 3px 0 rgba(0,0,0,.35),inset 0 0 0 4px rgba(255,255,255,.18)}
    .ck .ck-red{background:#c62828;color:#ffe08a}.ck .ck-white{background:#f8f4ea;color:#7a4a24;border:2px solid #cdbf9f}
    .ck .ck-sel{outline:4px solid #fbbf24;outline-offset:2px}.ck .ck-can{box-shadow:0 0 0 3px #fde68a,0 3px 0 rgba(0,0,0,.35)}</style>`;
}
