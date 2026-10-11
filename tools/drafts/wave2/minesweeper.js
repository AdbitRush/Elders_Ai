// ═══════════════════════════════════════════════════════════════════════════════
// MINESWEEPER (2026-10, wave 2) — clear the field without opening a mine.
// The first square you open is always safe (and opens an area). Numbers count the mines in the 8 squares around.
// Big squares; a "Flag" switch (no long-press needed) marks a suspected mine. Easy 8x8/8, normal 9x9/10, hard 10x10/16.
// Open every safe square = "Well Done!"; opening a mine shows the field and ends it as "Nice try".
// ═══════════════════════════════════════════════════════════════════════════════
function initMinesweeper(container) {
    const gs = gameState.minesweeper;
    const diff = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
    const [n, m] = diff === 'easy' ? [8, 8] : diff === 'hard' ? [10, 16] : [9, 10];
    gs.n = n; gs.mines = m; gs.mine = null; gs.open = Array.from({ length: n }, () => Array(n).fill(false));
    gs.flag = Array.from({ length: n }, () => Array(n).fill(false)); gs.mode = 'open'; gs.over = false; gs.boom = null;
    gs.msg = 'Tap any square to start. The first one is always safe.';
    _msRender();
}
function _msLay(r0, c0) {
    const gs = gameState.minesweeper, n = gs.n;
    gs.mine = Array.from({ length: n }, () => Array(n).fill(false));
    const cells = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (Math.abs(r - r0) > 1 || Math.abs(c - c0) > 1) cells.push([r, c]);
    shuffle(cells).slice(0, gs.mines).forEach(([r, c]) => { gs.mine[r][c] = true; });
}
function _msNear(r, c) { const gs = gameState.minesweeper; let k = 0; for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const a = r + dr, b = c + dc; if ((dr || dc) && a >= 0 && b >= 0 && a < gs.n && b < gs.n && gs.mine[a][b]) k++; } return k; }
function msMode(m) { const gs = gameState.minesweeper; gs.mode = m; gs.msg = m === 'flag' ? 'Flag mode: tap a square to mark (or unmark) a mine.' : 'Open mode: tap a square to open it.'; _msRender(); }
function msTap(r, c) {
    const gs = gameState.minesweeper; if (gs.over || gs.open[r][c]) return;
    if (gs.mode === 'flag') { if (!gs.mine) return; gs.flag[r][c] = !gs.flag[r][c]; if (typeof sfxClick === 'function') sfxClick(); return _msRender(); }
    if (gs.flag[r][c]) { gs.msg = 'That square is flagged. Switch to Flag and tap it to unflag first.'; return _msRender(); }
    if (!gs.mine) _msLay(r, c);
    if (gs.mine[r][c]) {
        gs.over = true; gs.boom = [r, c]; gs.msg = 'Boom! That was a mine.'; if (typeof sfxWrong === 'function') sfxWrong();
        _msRender();
        const left = _msLeft();
        return GameKit.finish('minesweeper', false, `You hit a mine with ${left} safe square${left === 1 ? '' : 's'} still to open.`);
    }
    const stack = [[r, c]];
    while (stack.length) {
        const [a, b] = stack.pop(); if (gs.open[a][b]) continue;
        gs.open[a][b] = true; gs.flag[a][b] = false;
        if (_msNear(a, b) === 0) for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const x = a + dr, y = b + dc; if (x >= 0 && y >= 0 && x < gs.n && y < gs.n && !gs.open[x][y] && !gs.mine[x][y]) stack.push([x, y]); }
    }
    if (typeof sfxFlip === 'function') sfxFlip();
    gs.msg = '';
    if (!_msLeft()) { gs.over = true; gs.msg = 'Field cleared!'; _msRender(); if (typeof sfxCorrect === 'function') sfxCorrect(); return GameKit.finish('minesweeper', true, `You cleared all ${gs.n * gs.n - gs.mines} safe squares.`); }
    _msRender();
}
function _msLeft() { const gs = gameState.minesweeper; let k = 0; for (let r = 0; r < gs.n; r++) for (let c = 0; c < gs.n; c++) if (!gs.open[r][c] && !(gs.mine && gs.mine[r][c])) k++; return k; }
function _msRender() {
    const gs = gameState.minesweeper, el = document.getElementById('gameContent');
    if (!el || gameState.currentId !== 'minesweeper') return;
    const COL = ['', '#1d4ed8', '#15803d', '#b91c1c', '#6d28d9', '#9a3412', '#0e7490', '#1d1b18', '#57534e'];
    let cells = '', flags = 0;
    for (let r = 0; r < gs.n; r++) for (let c = 0; c < gs.n; c++) {
        if (gs.flag[r][c]) flags++;
        const o = gs.open[r][c], mine = gs.over && gs.mine && gs.mine[r][c], k = o ? _msNear(r, c) : 0;
        const boom = gs.boom && gs.boom[0] === r && gs.boom[1] === c;
        const inner = o ? (k ? `<span style="color:${COL[k]}">${k}</span>` : '') : mine ? '💣' : gs.flag[r][c] ? '🚩' : '';
        cells += `<button type="button" class="ms-c${o ? ' ms-o' : ''}${boom ? ' ms-boom' : ''}" onclick="msTap(${r},${c})" aria-label="row ${r + 1} column ${c + 1}${o ? ', ' + k : gs.flag[r][c] ? ', flagged' : ''}">${inner}</button>`;
    }
    el.innerHTML = `<div class="ms" dir="ltr">
      <div class="ms-top"><span>💣 ${gs.mines} mines</span><span>🚩 ${flags} flagged</span></div>
      <div class="ms-mode" role="group" aria-label="What a tap does">
        <button type="button" class="ms-m" aria-pressed="${gs.mode === 'open'}" onclick="msMode('open')">⛏️ Open</button>
        <button type="button" class="ms-m" aria-pressed="${gs.mode === 'flag'}" onclick="msMode('flag')">🚩 Flag</button></div>
      <div class="ms-grid" style="grid-template-columns:repeat(${gs.n},1fr)">${cells}</div>
      <div class="cw-msg" role="status">${gs.msg || '&nbsp;'}</div>
    </div>
    <style>
      .ms{max-width:34rem;margin:0 auto;color:#2b1b0d}
      .ms-top{display:flex;justify-content:space-between;font-weight:800;font-size:1.15rem;margin-bottom:8px}
      .ms-mode{display:flex;gap:8px;justify-content:center;margin-bottom:10px}
      .ms-m{min-height:52px;flex:1;max-width:12rem;border-radius:14px;border:3px solid #c9a46a;background:#fffdf7;color:#2b1b0d;font-weight:900;font-size:1.15rem;cursor:pointer}
      .ms-m[aria-pressed="true"]{background:#2b1b0d;color:#fff6e8;border-color:#2b1b0d}
      .ms-grid{display:grid;gap:3px;background:#8a6a43;padding:4px;border-radius:10px}
      .ms-c{aspect-ratio:1;min-width:0;border:0;border-radius:5px;background:linear-gradient(#e9d3a8,#d6b98a);box-shadow:inset 0 -3px 0 rgba(0,0,0,.18);font:900 clamp(1rem,5vw,1.5rem)/1 system-ui,sans-serif;cursor:pointer;padding:0;color:#1d1b18}
      .ms-c.ms-o{background:#fffaf0;box-shadow:none;cursor:default}
      .ms-c.ms-boom{background:#fca5a5}
      .cw-msg{text-align:center;font-weight:800;margin:10px 0;min-height:1.5em}
    </style>`;
}
