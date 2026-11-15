// ═══════════════════════════════════════════════════════════════════════════════
// MINESWEEPER (2026-10, wave 2) — clear the field without opening a mine.
// The first square you open is always safe (and opens an area). Numbers count the mines in the 8 squares around.
// Big squares; a "Flag" switch (no long-press needed) marks a suspected mine. Easy 8x8/8, normal 9x9/10, hard 10x10/16.
// Open every safe square = "Well Done!"; opening a mine shows the field and ends it as "Nice try".
// Visuals (2026-11): a garden — checkered grass squares, warm sand where opened, red garden flags and
// pebble mines drawn in inline SVG, picket fence, win glow / loss mute. Presentation only; logic untouched.
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
    // classic number colours, darkened where needed to stay bold on sand
    const COL = ['', '#1d4ed8', '#14632f', '#b91c1c', '#6d28d9', '#9a3412', '#0b5a70', '#1d1b18', '#57534e'];
    // inline art (no external assets): garden flag, pebble mine, little spade
    const FLAG = (cls) => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><ellipse cx="9" cy="21" rx="5.5" ry="1.8" fill="#6b4a2a"/><path d="M8.5 3.6V21" stroke="#4a2f14" stroke-width="2.2" stroke-linecap="round"/><path d="M9.6 4.2 20.5 8.4 9.6 12.8Z" fill="#d42a1f" stroke="#8f1510" stroke-width="1.3" stroke-linejoin="round"/></svg>`;
    const PEB = (cls) => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><ellipse cx="12" cy="19.6" rx="8" ry="2.1" fill="rgba(40,25,10,.3)"/><ellipse cx="12" cy="12.4" rx="8.6" ry="7.4" fill="#59524c" stroke="#2c2723" stroke-width="1.3"/><ellipse cx="9" cy="9.4" rx="3.3" ry="1.9" fill="#aaa298" opacity=".85"/><circle cx="15.6" cy="14.6" r="1" fill="#3a342f"/><circle cx="12.4" cy="16.4" r=".7" fill="#3a342f"/></svg>`;
    const SPADE = `<svg class="ms-ui" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 3.2h6M12 3.2V12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M7.4 11.6h9.2v3.6c0 2.8-2.3 4.8-4.6 5.9-2.3-1.1-4.6-3.1-4.6-5.9Z" fill="currentColor"/></svg>`;
    let cells = '', flags = 0;
    for (let r = 0; r < gs.n; r++) for (let c = 0; c < gs.n; c++) {
        if (gs.flag[r][c]) flags++;
        const o = gs.open[r][c], mine = gs.over && gs.mine && gs.mine[r][c], k = o ? _msNear(r, c) : 0;
        const boom = gs.boom && gs.boom[0] === r && gs.boom[1] === c;
        const inner = o ? (k ? `<span style="color:${COL[k]}">${k}</span>` : '') : mine ? PEB('ms-ic ms-bomb') : gs.flag[r][c] ? FLAG('ms-ic ms-flag') : '';
        cells += `<button type="button" class="gk-cell ms-c ${(r + c) % 2 ? 'ms-b' : 'ms-a'}${o ? ' ms-o' : ''}${!o && mine ? ' ms-mine' : ''}${boom ? ' ms-boom' : ''}" onclick="msTap(${r},${c})" aria-label="row ${r + 1} column ${c + 1}${o ? ', ' + k : gs.flag[r][c] ? ', flagged' : ''}">${inner}</button>`;
    }
    const state = (gs.over ? (gs.boom ? ' ms-lost' : ' ms-won') : '') + (gs.mode === 'flag' && !gs.over ? ' ms-flagging' : '');
    el.innerHTML = `<div class="ms${state}" dir="ltr">
      <div class="ms-top"><span>${PEB('ms-ui')} ${gs.mines} mines</span><span>${FLAG('ms-ui ms-flag')} ${flags} flagged</span></div>
      <div class="ms-mode" role="group" aria-label="What a tap does">
        <button type="button" class="ms-m ms-m-open" aria-pressed="${gs.mode === 'open'}" onclick="msMode('open')">${SPADE} Open</button>
        <button type="button" class="ms-m ms-m-flag" aria-pressed="${gs.mode === 'flag'}" onclick="msMode('flag')">${FLAG('ms-ui')} Flag</button></div>
      <svg class="ms-fence" width="100%" height="22" aria-hidden="true" focusable="false"><defs><pattern id="ms-pk" width="18" height="22" patternUnits="userSpaceOnUse"><path d="M4 22V7.5L9 2l5 5.5V22Z" fill="#fdf6e4" stroke="#b39566" stroke-width="1.2" stroke-linejoin="round"/></pattern></defs><rect x="0" y="11" width="100%" height="4.5" fill="#eadfc4" stroke="#b39566" stroke-width="1"/><rect x="0" y="0" width="100%" height="22" fill="url(#ms-pk)"/></svg>
      <div class="ms-grid" style="grid-template-columns:repeat(${gs.n},1fr)">${cells}</div>
      <div class="cw-msg" role="status">${gs.msg || '&nbsp;'}</div>
    </div>
    <style>
      .ms{width:100%;box-sizing:border-box;max-width:34rem;margin:0 auto;color:#2b1b0d}
      .ms *{box-sizing:border-box}
      .ms-ui{width:1.35em;height:1.35em;flex:none;display:block}
      /* counters */
      .ms-top{display:flex;justify-content:space-between;gap:8px;font-weight:800;font-size:1.15rem;margin-bottom:10px}
      .ms-top span{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:6px 12px;border-radius:12px;background:#fff8e6;border:2px solid #c9a46a;box-shadow:0 2px 0 rgba(120,85,40,.25)}
      /* Open / Flag switch — one track, the active side is filled and raised */
      .ms-mode{display:flex;gap:4px;justify-content:center;margin:0 auto 12px;padding:4px;max-width:26rem;border-radius:18px;background:#eadcbd;border:3px solid #7a5a36;box-shadow:inset 0 2px 3px rgba(90,60,25,.3)}
      .ms-m{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:54px;flex:1;border-radius:12px;border:2px solid transparent;background:transparent;color:#2b1b0d;font-weight:900;font-size:1.2rem;cursor:pointer;padding:0 8px;touch-action:manipulation}
      .ms-m[aria-pressed="true"]{color:#fff;border-color:rgba(0,0,0,.35);box-shadow:0 3px 0 rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.3)}
      .ms-m-open[aria-pressed="true"]{background:#24552f}
      .ms-m-flag[aria-pressed="true"]{background:#a3211a}
      .ms-m-flag[aria-pressed="true"] path:last-child{fill:#fff;stroke:#fff}
      .ms-m[aria-pressed="true"]::after{content:"";width:.5em;height:.9em;margin:0 0 .2em .2em;border:solid #fff;border-width:0 .2em .2em 0;transform:rotate(45deg)}
      .ms-m:focus-visible{outline:3px solid #1d4ed8;outline-offset:2px}
      /* garden */
      .ms-fence{display:block;margin:0 0 -3px;position:relative;z-index:1}
      .ms-grid{display:grid;gap:0;background:#7a5a36;padding:4px;border-radius:12px;overflow:hidden;box-shadow:0 5px 12px rgba(70,45,15,.3);transition:box-shadow .4s ease;user-select:none;-webkit-user-select:none}
      .ms .ms-c{--g:#9ccd79;aspect-ratio:1;min-width:0;min-height:0;margin:0;padding:0;border:0;border-radius:0;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#1d1b18;touch-action:manipulation;
        font:900 clamp(1.4rem,5.5vw,1.75rem)/1 system-ui,sans-serif;
        background:radial-gradient(circle at 24% 30%,rgba(35,95,30,.2) 0 1.4px,transparent 2px),radial-gradient(circle at 72% 62%,rgba(35,95,30,.18) 0 1.4px,transparent 2px),radial-gradient(circle at 46% 84%,rgba(255,255,255,.22) 0 1.2px,transparent 1.8px),linear-gradient(rgba(255,255,255,.24),rgba(255,255,255,0) 55%),var(--g);
        box-shadow:inset 0 -3px 0 rgba(30,75,20,.3),inset 0 1px 0 rgba(255,255,255,.4)}
      .ms .ms-c.ms-b{--g:#88bd66}
      .ms .ms-c.ms-o{--g:#f7ebcc;background:var(--g);box-shadow:inset 0 2px 3px rgba(120,85,40,.2);cursor:default}
      .ms .ms-c.ms-o.ms-b{--g:#efdfb6}
      .ms .ms-c.ms-mine{--g:#cfb283;background:var(--g);box-shadow:inset 0 2px 4px rgba(90,60,25,.4)}
      .ms .ms-c.ms-mine.ms-b{--g:#c4a674}
      .ms .ms-c.ms-boom{background:#f0a08c;box-shadow:inset 0 0 0 3px #a3211a}
      .ms .ms-c:focus-visible{outline:3px solid #1d4ed8;outline-offset:-3px;position:relative;z-index:1}
      @media (hover:hover){.ms:not(.ms-won):not(.ms-lost) .ms-c:not(.ms-o):hover{filter:brightness(1.08)}}
      .ms-ic{display:block;margin:auto;width:74%;height:74%;pointer-events:none}.ms-flag{color:#b91c1c}.ms-bomb{color:#1d1b18}
      .ms-c span{pointer-events:none}
      /* state in the scene */
      .ms-flagging .ms-grid{background:#a3211a;box-shadow:0 0 0 3px #a3211a,0 5px 12px rgba(70,45,15,.3)}
      .ms-won .ms-grid{background:#e0a92a;box-shadow:0 0 0 4px #f5c84b,0 0 36px 10px rgba(245,195,70,.75);animation:msglow 1.8s ease-in-out 2}
      .ms-won .ms-c:not(.ms-o){cursor:default}
      @keyframes msglow{50%{box-shadow:0 0 0 4px #ffe08a,0 0 50px 16px rgba(250,208,95,.9)}}
      .ms-lost .ms-c:not(.ms-boom){filter:saturate(.35) brightness(.96);cursor:default}
      .ms-lost .ms-fence{filter:grayscale(.6)}
      .ms .cw-msg{text-align:center;font-weight:800;font-size:1.1rem;margin:10px 0;min-height:1.5em}
      @media (prefers-reduced-motion:reduce){.ms-won .ms-grid{animation:none}.ms-grid{transition:none}}
    </style>`;
}
