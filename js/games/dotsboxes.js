// ═══════════════════════════════════════════════════════════════════════════════
// DOTS AND BOXES (2026-11, nostalgia batch) — the pencil-and-paper game from school notebooks and restaurant
// placemats, against the computer. No clock.
// Take turns drawing one line between two neighbouring dots. Whoever draws the fourth side of a box owns it and
// must draw another line. When every line is drawn, the player with more boxes wins (a tie is not a win).
// Two taps per line on purpose: the first tap picks the line (gold, dashed), the second tap - or the Draw button -
// draws it. Fat fingers never draw the wrong line. Every line's tap area is a diamond around it, so the whole
// board is tappable even on a 320 px phone.
// Easy: 3x3 boxes, the computer sometimes misses a box. Normal: 4x4. Hard: 5x5, and when it must give boxes
// away it gives the fewest it can.
// Lines: h[r][c] (r = 0..n, c = 0..n-1) between dots (r,c)-(r,c+1); v[r][c] (r = 0..n-1, c = 0..n) between (r,c)-(r+1,c).
// ═══════════════════════════════════════════════════════════════════════════════
function initDotsBoxes(container) {
    const gs = gameState.dotsboxes;
    const diff = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
    const n = diff === 'easy' ? 3 : diff === 'hard' ? 5 : 4;
    gs.n = n; gs.diff = diff;
    gs.h = Array.from({ length: n + 1 }, () => Array(n).fill(0));   // 0 = empty, 1 = you, 2 = computer
    gs.v = Array.from({ length: n }, () => Array(n + 1).fill(0));
    gs.box = Array.from({ length: n }, () => Array(n).fill(0));
    gs.turn = 0; gs.sel = null; gs.over = false; gs.lastCpu = []; gs.score = [0, 0];
    gs.msg = 'Your turn. Tap between two dots to pick a line.';
    clearTimeout(gs._t);
    window._gameCleanup = () => clearTimeout(gs._t);
    _dbRender();
}
const _dbKey = (e) => e.t + e.r + '_' + e.c;
function _dbAll(gs) {
    const o = [];
    for (let r = 0; r <= gs.n; r++) for (let c = 0; c < gs.n; c++) o.push({ t: 'h', r, c });
    for (let r = 0; r < gs.n; r++) for (let c = 0; c <= gs.n; c++) o.push({ t: 'v', r, c });
    return o;
}
const _dbGet = (s, e) => s[e.t][e.r][e.c];
// boxes next to a line
function _dbBoxesOf(n, e) {
    const o = [];
    if (e.t === 'h') { if (e.r > 0) o.push([e.r - 1, e.c]); if (e.r < n) o.push([e.r, e.c]); }
    else { if (e.c > 0) o.push([e.r, e.c - 1]); if (e.c < n) o.push([e.r, e.c]); }
    return o;
}
const _dbSides = (s, r, c) => (s.h[r][c] ? 1 : 0) + (s.h[r + 1][c] ? 1 : 0) + (s.v[r][c] ? 1 : 0) + (s.v[r][c + 1] ? 1 : 0);
const _dbFree = (s) => _dbAll(s).filter((e) => !_dbGet(s, e));
// draw line e for player p (1 or 2) on state s; returns the boxes it closed
function _dbApply(s, e, p) {
    s[e.t][e.r][e.c] = p; let closed = 0;
    for (const [r, c] of _dbBoxesOf(s.n, e)) if (_dbSides(s, r, c) === 4 && !s.box[r][c]) { s.box[r][c] = p; closed++; }
    return closed;
}
const _dbCompletes = (s, e) => _dbBoxesOf(s.n, e).some(([r, c]) => _dbSides(s, r, c) === 3);
const _dbGivesThird = (s, e) => _dbBoxesOf(s.n, e).some(([r, c]) => _dbSides(s, r, c) === 2);
const _dbClone = (s) => ({ n: s.n, h: s.h.map((x) => x.slice()), v: s.v.map((x) => x.slice()), box: s.box.map((x) => x.slice()) });
// how many boxes the other player can take in a row after we draw e
function _dbGiveaway(s, e) {
    const t = _dbClone(s); _dbApply(t, e, 2); let got = 0;
    for (;;) { const m = _dbFree(t).find((x) => _dbCompletes(t, x)); if (!m) break; got += _dbApply(t, m, 1); }
    return got;
}
function _dbCpuPick(gs) {
    const free = _dbFree(gs), pick = (a) => a[Math.floor(Math.random() * a.length)];
    const win = free.filter((e) => _dbCompletes(gs, e));
    if (win.length && !(gs.diff === 'easy' && Math.random() < 0.3)) return pick(win);
    const safe = free.filter((e) => !_dbCompletes(gs, e) && !_dbGivesThird(gs, e));
    if (safe.length && !(gs.diff === 'easy' && Math.random() < 0.35)) return pick(safe);
    if (gs.diff === 'easy' || (gs.diff === 'normal' && Math.random() < 0.4)) return pick(free);
    let best = null, bv = 1e9;
    for (const e of free) { const g = _dbGiveaway(gs, e); if (g < bv) { bv = g; best = e; } }
    return best;
}
function dbTap(t, r, c) {
    const gs = gameState.dotsboxes;
    if (gs.over || gs.turn !== 0) return;
    const e = { t, r, c };
    if (_dbGet(gs, e)) { gs.msg = 'That line is already drawn. Pick an empty one.'; return _dbRender(); }
    if (gs.sel && _dbKey(gs.sel) === _dbKey(e)) return dbDraw();
    gs.sel = e; gs.msg = 'Line picked (gold). Tap it again, or press Draw line.';
    if (typeof sfxClick === 'function') sfxClick();
    _dbRender();
}
function dbDraw() {
    const gs = gameState.dotsboxes;
    if (gs.over || gs.turn !== 0 || !gs.sel) return;
    const e = gs.sel; gs.sel = null; gs.lastCpu = [];
    const got = _dbApply(gs, e, 1);
    if (typeof sfxFlip === 'function') sfxFlip();
    if (got) { gs.score[0] += got; if (typeof sfxCorrect === 'function') sfxCorrect(); }
    if (_dbDone(gs)) return _dbEnd();
    if (got) { gs.msg = `You closed ${got === 1 ? 'a box' : got + ' boxes'}! Draw another line.`; return _dbRender(); }
    gs.turn = 1; gs.msg = 'The computer is drawing a line...'; _dbRender();
    gs._t = setTimeout(_dbCpu, 900);
}
function _dbCpu() {
    const gs = gameState.dotsboxes;
    if (gameState.currentId !== 'dotsboxes' || gs.over) return;
    const e = _dbCpuPick(gs); const got = _dbApply(gs, e, 2);
    gs.lastCpu.push(_dbKey(e));
    if (typeof sfxFlip === 'function') sfxFlip();
    if (got) gs.score[1] += got;
    if (_dbDone(gs)) return _dbEnd();
    if (got) { gs.msg = `The computer closed ${got === 1 ? 'a box' : got + ' boxes'} and goes again...`; _dbRender(); gs._t = setTimeout(_dbCpu, 900); return; }
    gs.turn = 0;
    gs.msg = `The computer drew the line shown in blue${gs.lastCpu.length > 1 ? ' (its lines this turn glow)' : ''}. Your turn.`;
    _dbRender();
}
const _dbDone = (gs) => _dbFree(gs).length === 0;
function _dbEnd() {
    const gs = gameState.dotsboxes; gs.over = true; gs.sel = null;
    const [y, c] = gs.score;
    gs.msg = `All lines drawn. You ${y} boxes, computer ${c}.`;
    _dbRender();
    GameKit.finish('dotsboxes', y > c, y > c ? `You won ${y} boxes to ${c}!` : y === c ? `A tie, ${y} boxes each. So close!` : `The computer won ${c} boxes to ${y}. Try again any time.`);
}
function dbRestart() { initDotsBoxes(document.getElementById('gameContent')); }
function _dbRender() {
    const gs = gameState.dotsboxes, el = document.getElementById('gameContent');
    if (!el || gameState.currentId !== 'dotsboxes') return;
    const n = gs.n, u = 100 / n;   // one box = u % of the board
    let html = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        const o = gs.box[r][c];
        if (o) html += `<div class="db-box db-o${o}" style="left:${c * u}%;top:${r * u}%;width:${u}%;height:${u}%"><span>${o === 1 ? 'You' : 'C'}</span></div>`;
    }
    const can = gs.turn === 0 && !gs.over;
    for (const e of _dbAll(gs)) {
        const who = _dbGet(gs, e), k = _dbKey(e);
        const cx = e.t === 'h' ? (e.c + 0.5) * u : e.c * u, cy = e.t === 'h' ? e.r * u : (e.r + 0.5) * u;
        const cls = 'db-e db-' + e.t + (who ? ' db-w' + who : '') + (gs.sel && _dbKey(gs.sel) === k ? ' db-sel' : '') + (gs.lastCpu.includes(k) ? ' db-last' : '');
        const name = e.t === 'h' ? `line across, row ${e.r + 1}, between dots ${e.c + 1} and ${e.c + 2}` : `line down, column ${e.c + 1}, between dots ${e.r + 1} and ${e.r + 2}`;
        // the outer columns' tap areas stay inside the game card, which clips what passes its edge (capped at 56 px wide, still above the 44 px minimum)
        const outer = e.t === 'v' && (e.c === 0 || e.c === n);
        const st = outer ? `left:calc(${cx}% - min(${u / 2}%, 28px));top:${cy - u / 2}%;width:min(${u}%, 56px);height:${u}%` : `left:${cx - u / 2}%;top:${cy - u / 2}%;width:${u}%;height:${u}%`;
        html += who ? `<div class="${cls}" style="${st}"><i></i></div>`
            : `<button type="button" class="${cls}" style="${st}" onclick="dbTap('${e.t}',${e.r},${e.c})" aria-label="${name}"${can ? '' : ' disabled'}><i></i></button>`;
    }
    for (let r = 0; r <= n; r++) for (let c = 0; c <= n; c++) html += `<b class="db-dot" style="left:${c * u}%;top:${r * u}%"></b>`;
    const _fk = GameKit.focusKey(el);
    el.innerHTML = `<div class="db" dir="ltr">
      <div class="db-score"><span class="db-you">You: <b>${gs.score[0]}</b></span><span>${gs.over ? 'Game over' : gs.turn === 0 ? 'Your turn' : "Computer's turn"}</span><span class="db-cpu">Computer: <b>${gs.score[1]}</b></span></div>
      <div class="db-paper"><div class="db-board">${html}</div></div>
      <div class="db-msg" role="status" aria-live="polite">${gs.msg}</div>
      <div class="gk-btns">${GameKit.btn(GameKit.icon('pen-line') + 'Draw line', 'dbDraw()', { cls: 'gk-primary', disabled: !gs.sel || !can })}${GameKit.btn(GameKit.icon('rotate-ccw') + 'New game', 'dbRestart()')}</div>
      <details class="db-rules"><summary>How to play</summary><ul>
        <li>Take turns drawing one line between two dots that sit side by side (across or down, never slanted).</li>
        <li>Tap near a line to pick it - it turns gold. Tap it again, or press <b>Draw line</b>, to draw it.</li>
        <li>Draw the fourth side of a box and the box is yours (<b>You</b>). Then you must draw another line.</li>
        <li>The computer's lines are blue and its boxes say <b>C</b>.</li>
        <li>Tip: try not to draw the third side of a box - that hands it to the other player.</li>
        <li>When every line is drawn, the most boxes wins. There is no clock.</li>
        <li>Keyboard: arrow keys move between lines, Enter picks a line, Enter again draws it.</li></ul></details>
    </div>
    <style>
      .db{width:100%;box-sizing:border-box;max-width:34rem;margin:0 auto;color:#2b1b0d}
      .db-score{display:flex;justify-content:space-between;gap:8px;font-size:1.15rem;margin:4px 2px 10px;flex-wrap:wrap}
      .db-you b{color:#9a3412}.db-cpu b{color:#1d4ed8}
      .db-paper{background:#fffdf5;background-image:repeating-linear-gradient(0deg,transparent 0 27px,#dbe7f5 27px 28px);border:3px solid #e8cfa8;border-radius:16px;padding:clamp(18px,6%,34px);box-shadow:0 6px 18px -10px rgba(0,0,0,.4)}
      .db-board{position:relative;width:100%;aspect-ratio:1;margin:0 auto}
      @media (min-width:640px){.db-board{max-width:min(100%,52vh)}}
      .db-dot{position:absolute;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:#2b1b0d;pointer-events:none;z-index:3}
      .db-e{position:absolute;padding:0;margin:0;border:0;background:transparent;clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%);cursor:pointer;z-index:2;display:block}
      .db-e:disabled{cursor:default}
      .db-e i{position:absolute;left:50%;top:50%;border-radius:4px;transform:translate(-50%,-50%);background:transparent}
      .db-h i{width:100%;height:8px}.db-v i{height:100%;width:8px}
      button.db-e:not(:disabled):hover i{background:rgba(180,83,9,.25)}
      .db-e:focus-visible{outline:none!important}.db-e:focus-visible i{background:#b45309;box-shadow:0 0 0 3px #fde68a}
      .db-sel i{background:repeating-linear-gradient(90deg,#d97706 0 10px,#fbbf24 10px 16px)!important;box-shadow:0 0 0 3px #fde68a}
      .db-v.db-sel i{background:repeating-linear-gradient(0deg,#d97706 0 10px,#fbbf24 10px 16px)!important}
      .db-w1 i{background:#9a3412}.db-w2 i{background:#1d4ed8}
      .db-last i{box-shadow:0 0 0 4px #93c5fd}
      .db-box{position:absolute;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:clamp(.95rem,3.6vw,1.4rem);z-index:1;box-sizing:border-box;padding:6px}
      .db-box span{display:flex;align-items:center;justify-content:center;width:100%;height:100%;border-radius:6px}
      .db-o1 span{background:#fed7aa;color:#7c2d12}.db-o2 span{background:#dbeafe;color:#1e3a8a;background-image:repeating-linear-gradient(45deg,transparent 0 6px,rgba(29,78,216,.12) 6px 9px)}
      .db-msg{text-align:center;font-weight:800;font-size:1.15rem;margin:12px 4px;min-height:3em}
      .db .gk-btn{border-color:#c9a46a}
      .db-rules{background:#fff3d6;border:2px solid #e8cfa8;border-radius:14px;padding:10px 14px;margin-top:6px;font-size:1.05rem}
      .db-rules summary{font-weight:800;cursor:pointer;min-height:44px;display:flex;align-items:center}
      .db-rules li{margin:6px 0 6px 1.1em;list-style:disc}
      #gameContent .db button.db-e,#gameContent .db button.db-e:hover,#gameContent .db button.db-e:active{position:absolute;transform:none;box-shadow:none;border-radius:0!important;border-width:0!important;overflow:visible;transition:none}
      #gameContent .db button.db-e::after{display:none}
    </style>`;
    GameKit.restoreFocus(el, _fk);
}
