// ═══════════════════════════════════════════════════════════════════════════════
// 15-PUZZLE (2026-10, wave 2) — the sliding-tile puzzle from the toy box. Put the numbers back in order.
// Tap a tile in the same row or column as the gap and it slides (with the tiles between). Arrow keys work too.
// Easy = 3x3 (8-puzzle), normal and hard = 4x4 (hard is shuffled longer). Always solvable: shuffled by real moves.
// Solving ends the game ("Well Done!" with the move count); there is no way to lose, only to give up (= "Nice try").
// ═══════════════════════════════════════════════════════════════════════════════
function initFifteen(container) {
    const gs = gameState.fifteen;
    const diff = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
    gs.n = diff === 'easy' ? 3 : 4;
    const N = gs.n * gs.n;
    gs.t = Array.from({ length: N }, (_, i) => (i + 1) % N);   // 0 = the gap, last
    let gap = N - 1, prev = -1;
    const steps = diff === 'hard' ? 400 : diff === 'easy' ? 80 : 200;
    for (let k = 0; k < steps || _ftSolved(); k++) {   // random real moves, never undoing the last one
        const nb = _ftNb(gap).filter((x) => x !== prev);
        const x = nb[Math.floor(Math.random() * nb.length)];
        gs.t[gap] = gs.t[x]; gs.t[x] = 0; prev = gap; gap = x;
    }
    gs.moves = 0; gs.over = false;
    const onKey = (e) => {
        if (gameState.currentId !== 'fifteen' || gs.over) return;
        const g = gs.t.indexOf(0), n = gs.n, r = Math.floor(g / n), c = g % n;
        // the arrow moves a tile INTO the gap from the opposite side
        const tgt = { ArrowLeft: c < n - 1 ? g + 1 : -1, ArrowRight: c > 0 ? g - 1 : -1, ArrowUp: r < n - 1 ? g + n : -1, ArrowDown: r > 0 ? g - n : -1 }[e.key];
        if (tgt !== undefined) { if (tgt >= 0) ftTap(tgt); e.preventDefault(); }
    };
    document.addEventListener('keydown', onKey);
    window._gameCleanup = () => document.removeEventListener('keydown', onKey);
    _ftRender();
}
function _ftNb(i) { const n = gameState.fifteen.n, r = Math.floor(i / n), c = i % n, o = []; if (r) o.push(i - n); if (r < n - 1) o.push(i + n); if (c) o.push(i - 1); if (c < n - 1) o.push(i + 1); return o; }
function _ftSolved() { const t = gameState.fifteen.t; return t.every((v, i) => v === (i + 1) % t.length); }
function ftTap(i) {
    const gs = gameState.fifteen; if (gs.over) return;
    const n = gs.n, g = gs.t.indexOf(0), gr = Math.floor(g / n), gc = g % n, r = Math.floor(i / n), c = i % n;
    if (r !== gr && c !== gc) { gs.msg = 'Only tiles in the same row or column as the gap can slide.'; return _ftRender(); }
    const step = r === gr ? (c < gc ? -1 : 1) : (r < gr ? -n : n);
    for (let p = g; p !== i; p += step) { gs.t[p] = gs.t[p + step]; gs.t[p + step] = 0; }
    gs.moves++; gs.msg = ''; if (typeof sfxFlip === 'function') sfxFlip();
    if (_ftSolved()) { gs.over = true; _ftRender(); if (typeof sfxCorrect === 'function') sfxCorrect(); return GameKit.finish('fifteen', true, `Solved in ${gs.moves} move${gs.moves === 1 ? '' : 's'}!`); }
    _ftRender();
}
function ftGiveUp() { const gs = gameState.fifteen; if (gs.over) return; gs.over = true; gs.t = gs.t.map((_, i) => (i + 1) % gs.t.length); _ftRender(); GameKit.finish('fifteen', false, 'Here is the finished puzzle. A new shuffle is one tap away.'); }
function _ftRender() {
    const gs = gameState.fifteen, el = document.getElementById('gameContent');
    if (!el || gameState.currentId !== 'fifteen') return;
    const tiles = gs.t.map((v, i) => v ? `<button type="button" class="ft-t${v === i + 1 ? ' ft-ok' : ''}" onclick="ftTap(${i})" aria-label="tile ${v}">${v}</button>` : '<div class="ft-gap" aria-label="gap"></div>').join('');
    el.innerHTML = `<div class="ft" dir="ltr">
      <div class="g2-top"><span>Moves: <b>${gs.moves}</b></span><span>Goal: 1 to ${gs.t.length - 1} in order</span></div>
      <div class="ft-board" style="grid-template-columns:repeat(${gs.n},1fr)">${tiles}</div>
      <div class="cw-msg" role="status">${gs.msg || 'Tap a tile next to the gap - or further along the same row or column.'}</div>
      <div class="gk-btns">${GameKit.btn('Give up', 'ftGiveUp()')}</div>
    </div>
    <style>
      .ft{max-width:26rem;margin:0 auto;color:#2b1b0d}
      .g2-top{display:flex;justify-content:space-between;font-size:1.15rem;margin-bottom:8px;gap:8px}
      .ft-board{display:grid;gap:6px;background:#6b4220;padding:8px;border-radius:14px}
      .ft-t{aspect-ratio:1;border-radius:10px;border:0;background:linear-gradient(#fff7e6,#f0d9b0);box-shadow:inset 0 -5px 0 rgba(0,0,0,.18);font:900 clamp(1.8rem,9vw,2.8rem)/1 Georgia,serif;color:#2b1b0d;cursor:pointer;min-width:0}
      .ft-t.ft-ok{background:linear-gradient(#e6f7e6,#bfe3bf)}
      .ft-gap{aspect-ratio:1}
      .ft .gk-btn{border-color:#c9a46a}
      .cw-msg{text-align:center;font-weight:700;margin:10px 0;min-height:1.5em}
    </style>`;
}
