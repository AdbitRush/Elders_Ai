// ═══════════════════════════════════════════════════════════════════════════════
// PEG JUMP PUZZLE (2026-11, nostalgia batch) — the wooden peg puzzle left on diner and restaurant tables, and the
// older cross-shaped peg solitaire board. A solo puzzle, no clock.
// A peg jumps over a neighbouring peg into an empty hole straight beyond it; the jumped peg is removed.
// The game ends when no jump is left. Fewer pegs left = better. The goal depends on the level:
//   Triangle (15 holes): easy 3 or fewer, normal 2, hard 1.   Cross (33 holes): easy 5, normal 3, hard 1.
// Easy and normal start on the triangle, hard on the cross; either board can be picked at any time.
// Undo as often as you like; Hint shows a jump that still reaches the goal when it can find one quickly.
// Holes are indexed 0..N-1; JUMPS[i] = [[over, to], ...] precomputed per board.
// ═══════════════════════════════════════════════════════════════════════════════
const _PJ_BOARDS = (() => {
    // triangle: rows 0-4, row r has r+1 holes; neighbours (r,c±1), (r±1,c), (r±1,c±1 same sign)
    const tri = [], ti = {};
    for (let r = 0; r < 5; r++) for (let c = 0; c <= r; c++) { ti[r + ',' + c] = tri.length; tri.push({ r, c, x: (c - r / 2 + 2) / 4, y: r / 4 }); }
    const triDirs = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1]];
    // cross: 7x7 without the 2x2 corners; orthogonal neighbours
    const cr = [], ci = {};
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) { if ((r < 2 || r > 4) && (c < 2 || c > 4)) continue; ci[r + ',' + c] = cr.length; cr.push({ r, c, x: c / 6, y: r / 6 }); }
    const crDirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    const jumps = (cells, idx, dirs) => cells.map((h) => dirs.map(([dr, dc]) => [idx[(h.r + dr) + ',' + (h.c + dc)], idx[(h.r + 2 * dr) + ',' + (h.c + 2 * dc)]]).filter(([o, t]) => o !== undefined && t !== undefined));
    return {
        tri: { key: 'tri', name: 'Triangle', cells: tri, jumps: jumps(tri, ti, triDirs), start: 0, goal: { easy: 3, normal: 2, hard: 1 } },
        cross: { key: 'cross', name: 'Cross', cells: cr, jumps: jumps(cr, ci, crDirs), start: ci['3,3'], goal: { easy: 5, normal: 3, hard: 1 } },
    };
})();
function initPegJump(container, boardKey) {
    const gs = gameState.pegjump;
    const diff = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
    gs.diff = diff;
    gs.bk = boardKey || gs.bk || (diff === 'hard' ? 'cross' : 'tri');
    const B = _PJ_BOARDS[gs.bk];
    gs.goal = B.goal[diff] || B.goal.normal;
    gs.p = B.cells.map((_, i) => i !== B.start);
    gs.sel = -1; gs.hist = []; gs.over = false; gs.hint = null;
    gs.msg = `Tap a peg that can jump. Goal: ${gs.goal === 1 ? 'just 1 peg' : gs.goal + ' pegs or fewer'} left.`;
    _pjRender();
}
const _pjMovesFrom = (gs, i) => (gs.p[i] ? _PJ_BOARDS[gs.bk].jumps[i].filter(([o, t]) => gs.p[o] && !gs.p[t]) : []);
const _pjAnyMove = (gs) => gs.p.some((_, i) => _pjMovesFrom(gs, i).length);
const _pjCount = (gs) => gs.p.filter(Boolean).length;
function pjTap(i) {
    const gs = gameState.pegjump; if (gs.over) return;
    gs.hint = null;
    if (gs.p[i]) {
        if (gs.sel === i) { gs.sel = -1; gs.msg = 'Peg put down. Tap a peg that can jump.'; return _pjRender(); }
        if (!_pjMovesFrom(gs, i).length) { gs.sel = -1; gs.msg = 'That peg has no jump right now. A peg needs a peg next to it and an empty hole just beyond.'; return _pjRender(); }
        gs.sel = i; gs.msg = 'Now tap a green ring to jump there.';
        if (typeof sfxClick === 'function') sfxClick();
        return _pjRender();
    }
    if (gs.sel < 0) { gs.msg = 'First tap a peg, then the empty hole it should jump into.'; return _pjRender(); }
    const mv = _pjMovesFrom(gs, gs.sel).find(([, t]) => t === i);
    if (!mv) { gs.msg = 'The peg can only land two holes away, straight over another peg. Try a green ring.'; return _pjRender(); }
    _pjJump(gs.sel, mv[0], i);
}
function _pjJump(from, over, to) {
    const gs = gameState.pegjump;
    gs.hist.push(gs.p.slice());
    gs.p[from] = false; gs.p[over] = false; gs.p[to] = true; gs.sel = -1;
    if (typeof sfxFlip === 'function') sfxFlip();
    const left = _pjCount(gs);
    if (!_pjAnyMove(gs)) return _pjEnd();
    gs.msg = `${left} pegs left. Keep going.`;
    _pjRender();
}
const _PJ_RATING = (n) => (n === 1 ? 'Puzzle master!' : n === 2 ? 'Very sharp.' : n === 3 ? 'Good going.' : n <= 5 ? 'A fair finish.' : 'Every game is a fresh start.');
function _pjEnd() {
    const gs = gameState.pegjump, left = _pjCount(gs);
    gs.over = true;
    const win = left <= gs.goal;
    gs.msg = `No jumps left. ${left} peg${left === 1 ? '' : 's'} remaining: ${_PJ_RATING(left)}${win ? '' : ' You can Undo and try another way.'}`;
    _pjRender();
    if (win && typeof sfxCorrect === 'function') sfxCorrect();
    // a missed goal does not end the session at once: Undo stays available. "See result" closes it honestly.
    if (win) GameKit.finish('pegjump', true, `${left} peg${left === 1 ? '' : 's'} left on the ${_PJ_BOARDS[gs.bk].name.toLowerCase()} board. ${_PJ_RATING(left)}`);
}
function pjFinish() {
    const gs = gameState.pegjump; if (!gs.over) return;
    const left = _pjCount(gs);
    GameKit.finish('pegjump', left <= gs.goal, `${left} pegs left; the goal was ${gs.goal}. ${_PJ_RATING(left)}`);
}
function pjUndo() {
    const gs = gameState.pegjump; if (!gs.hist.length) return;
    if (gs.over && _pjCount(gs) <= gs.goal) return;   // a win already went to the end screen
    gs.p = gs.hist.pop(); gs.over = false; gs.sel = -1; gs.hint = null;
    gs.msg = `Jump taken back. ${_pjCount(gs)} pegs on the board.`;
    _pjRender();
}
function pjBoard(k) { if (_PJ_BOARDS[k]) initPegJump(document.getElementById('gameContent'), k); }
function pjRestart() { initPegJump(document.getElementById('gameContent'), gameState.pegjump.bk); }
// search for a jump that still reaches the goal (bounded, so a hint never freezes the page)
function _pjSolve(p, J, goal, budget) {
    const seen = new Set(); let nodes = 0;
    const key = (a) => a.map((x) => (x ? 1 : 0)).join('');
    function dfs(a, cnt) {
        if (cnt <= goal) return [];
        if (++nodes > budget) throw 0;
        const k = key(a); if (seen.has(k)) return null; seen.add(k);
        for (let i = 0; i < a.length; i++) if (a[i]) for (const [o, t] of J[i]) if (a[o] && !a[t]) {
            a[i] = false; a[o] = false; a[t] = true;
            const r = dfs(a, cnt - 1);
            a[i] = true; a[o] = true; a[t] = false;
            if (r) return [[i, o, t]].concat(r);
        }
        return null;
    }
    try { return dfs(p.slice(), p.filter(Boolean).length); } catch (e) { return undefined; }
}
function pjHint() {
    const gs = gameState.pegjump; if (gs.over) return;
    const J = _PJ_BOARDS[gs.bk].jumps;
    const path = _pjSolve(gs.p, J, gs.goal, 60000);
    if (path && path.length) { gs.hint = path[0]; gs.sel = path[0][0]; gs.msg = 'Hint: this peg can jump to the gold ring and you can still reach the goal.'; }
    else if (path === null) { gs.msg = 'From here the goal can no longer be reached. Try Undo a few times.'; gs.hint = null; }
    else {
        const i = gs.p.findIndex((_, k) => _pjMovesFrom(gs, k).length); const m = _pjMovesFrom(gs, i)[0];
        gs.hint = [i, m[0], m[1]]; gs.sel = i; gs.msg = 'Here is a jump you can make (the board is too big to check it all the way to the end).';
    }
    _pjRender();
}
function _pjRender() {
    const gs = gameState.pegjump, el = document.getElementById('gameContent');
    if (!el || gameState.currentId !== 'pegjump') return;
    const B = _PJ_BOARDS[gs.bk], tri = gs.bk === 'tri';
    const targets = gs.sel >= 0 ? _pjMovesFrom(gs, gs.sel).map(([, t]) => t) : [];
    const holes = B.cells.map((h, i) => {
        const peg = gs.p[i], tgt = targets.includes(i), hint = gs.hint && gs.hint[2] === i;
        const cls = 'pj-h' + (peg ? ' pj-peg' : '') + (gs.sel === i ? ' pj-sel' : '') + (tgt ? ' pj-tgt' : '') + (hint ? ' pj-hint' : '');
        const lab = (peg ? 'peg' : 'empty hole') + `, row ${h.r + 1}, place ${h.c + 1}` + (tgt ? ', you can jump here' : '');
        return `<button type="button" class="${cls}" style="left:${h.x * 100}%;top:${h.y * 100}%" onclick="pjTap(${i})" aria-label="${lab}"${gs.over ? ' disabled' : ''}><span></span></button>`;
    }).join('');
    const left = _pjCount(gs);
    const _fk = GameKit.focusKey(el);
    el.innerHTML = `<div class="pj" dir="ltr">
      <div class="pj-pick" role="group" aria-label="Board">${GameKit.btn('Triangle (15)', "pjBoard('tri')", { cls: tri ? 'gk-primary' : '' })}${GameKit.btn('Cross (33)', "pjBoard('cross')", { cls: tri ? '' : 'gk-primary' })}</div>
      <div class="pj-top"><span>Pegs left: <b>${left}</b></span><span>Goal: <b>${gs.goal}</b> or fewer</span></div>
      <div class="pj-wood pj-${gs.bk}"><div class="pj-board">${holes}</div></div>
      <div class="pj-msg" role="status" aria-live="polite">${gs.msg}</div>
      <div class="gk-btns">${GameKit.btn(GameKit.icon('undo-2') + 'Undo', 'pjUndo()', { disabled: !gs.hist.length || (gs.over && left <= gs.goal) })}${gs.over ? '' : GameKit.btn(GameKit.icon('lightbulb') + 'Hint', 'pjHint()')}${GameKit.btn(GameKit.icon('rotate-ccw') + 'Start over', 'pjRestart()')}${gs.over && left > gs.goal ? GameKit.btn('Finish', 'pjFinish()', { cls: 'gk-primary' }) : ''}</div>
      <details class="pj-rules"><summary>How to play</summary><ul>
        <li>Tap a peg. Green rings show where it can jump.</li>
        <li>A peg jumps <b>over one neighboring peg</b> into the <b>empty hole right behind it</b>, in a straight line. The peg it jumps over is taken off.</li>
        <li>${tri ? 'On the triangle, pegs jump along the rows and along both slanting lines.' : 'On the cross, pegs jump across and up or down, never slanting.'}</li>
        <li>When no peg can jump, the puzzle is over. Leave as few pegs as you can: 1 is the best there is.</li>
        <li>Undo takes back a jump. There is no clock and no limit on Undo.</li>
        <li>Keyboard: arrow keys move between holes, Enter picks a peg or jumps.</li></ul></details>
    </div>
    <style>
      .pj{width:100%;box-sizing:border-box;max-width:34rem;margin:0 auto;color:#2b1b0d}
      .pj-pick{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:10px}
      .pj-top{display:flex;justify-content:space-between;font-size:1.15rem;margin:0 2px 10px;gap:8px}
      .pj-wood{background:linear-gradient(160deg,#c48a4a,#8a5a2b);border-radius:22px;box-shadow:inset 0 0 0 3px #6b4220,0 8px 20px -10px rgba(0,0,0,.5);padding:calc(var(--s) * .62)}
      .pj-tri{--s:clamp(46px,14vw,80px);width:fit-content;margin:0 auto;clip-path:polygon(50% 0,100% 100%,0 100%);border-radius:0;padding:calc(var(--s)*1.05) calc(var(--s)*.75) calc(var(--s)*.55)}
      .pj-cross{--s:clamp(34px,11vw,62px);padding:calc(var(--s) * .5)}
      .pj-board{position:relative;margin:0 auto}
      .pj-tri .pj-board{width:calc(var(--s) * 4);height:calc(var(--s) * 3.46)}
      .pj-cross .pj-board{width:calc(var(--s) * 6);height:calc(var(--s) * 6)}
      .pj-h{position:absolute;width:var(--s);height:var(--s);margin:calc(var(--s) / -2) 0 0 calc(var(--s) / -2);border:0;background:transparent;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:50%}
      .pj-h span{width:calc(var(--s) * .46);height:calc(var(--s) * .46);flex:0 0 auto;border-radius:50%;background:radial-gradient(circle at 50% 35%,#2e1b0b,#4d2f15);box-shadow:inset 0 3px 4px rgba(0,0,0,.6)}
      .pj-peg span{width:calc(var(--s) * .7);height:calc(var(--s) * .7);background:radial-gradient(circle at 38% 32%,#fff3c4,#f2b84b 45%,#b45309);box-shadow:0 3px 0 #7c2d12,0 5px 6px rgba(0,0,0,.35)}
      .pj-sel span{transform:translateY(-4px);box-shadow:0 0 0 4px #fff,0 0 0 7px #1d4ed8,0 7px 8px rgba(0,0,0,.4)}
      .pj-tgt span{width:calc(var(--s) * .66);height:calc(var(--s) * .66);background:#dcfce7;box-shadow:0 0 0 4px #15803d;border:3px dashed #15803d;box-sizing:border-box}
      .pj-hint span{box-shadow:0 0 0 5px #f59e0b!important}
      .pj-h:disabled{cursor:default}
      .pj-msg{text-align:center;font-weight:800;font-size:1.15rem;margin:12px 4px;min-height:3em}
      .pj .gk-btn{border-color:#c9a46a}
      .pj-rules{background:#fff3d6;border:2px solid #e8cfa8;border-radius:14px;padding:10px 14px;margin-top:6px;font-size:1.05rem}
      .pj-rules summary{font-weight:800;cursor:pointer;min-height:44px;display:flex;align-items:center}
      .pj-rules li{margin:6px 0 6px 1.1em;list-style:disc}
      @media (prefers-reduced-motion:reduce){.pj-sel span{transform:none}}
      #gameContent .pj button.pj-h,#gameContent .pj button.pj-h:hover,#gameContent .pj button.pj-h:active{position:absolute;transform:none;box-shadow:none;border-radius:50%!important;border-width:0!important;overflow:visible;transition:none}
      #gameContent .pj button.pj-h::after{display:none}
    </style>`;
    GameKit.restoreFocus(el, _fk);
}
