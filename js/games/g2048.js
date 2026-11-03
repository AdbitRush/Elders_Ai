// ═══════════════════════════════════════════════════════════════════════════════
// 2048 (2026-10, wave 2) — slide the tiles; two equal tiles join into one.
// Big arrow buttons, swipe on the board, or the keyboard arrows. Undo one move at a time.
// The goal grows with the level and the difficulty (easy 128 / normal 256 / hard 512 on Level 1, doubling each level
// up to 2048). Reach it = "Well Done!"; a full board with no moves left first = "Nice try".
// ═══════════════════════════════════════════════════════════════════════════════
function init2048(container) {
    const gs = gameState.g2048;
    const diff = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
    const base = diff === 'easy' ? 128 : diff === 'hard' ? 512 : 256;
    gs.goal = Math.min(2048, base * Math.pow(2, (gs.level || 1) - 1));
    gs.b = Array.from({ length: 4 }, () => Array(4).fill(0)); gs.score = 0; gs.over = false; gs.hist = [];
    _g2Add(); _g2Add();
    const onKey = (e) => {
        if (gameState.currentId !== 'g2048') return;
        const d = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ArrowDown: 'd' }[e.key];
        if (d) { g2Move(d); e.preventDefault(); }
    };
    document.addEventListener('keydown', onKey);
    window._gameCleanup = () => document.removeEventListener('keydown', onKey);
    _g2Render();
}
function _g2Add() {
    const gs = gameState.g2048, free = [];
    gs.b.forEach((row, r) => row.forEach((v, c) => { if (!v) free.push([r, c]); }));
    if (!free.length) return;
    const [r, c] = free[Math.floor(Math.random() * free.length)];
    gs.b[r][c] = Math.random() < 0.9 ? 2 : 4; gs.fresh = r * 4 + c;
}
function _g2Slide(line) {   // slide one line toward index 0
    const v = line.filter((x) => x), out = []; let gain = 0;
    for (let i = 0; i < v.length; i++) { if (v[i] === v[i + 1]) { out.push(v[i] * 2); gain += v[i] * 2; i++; } else out.push(v[i]); }
    while (out.length < 4) out.push(0);
    return { out, gain };
}
function _g2Can() { const b = gameState.g2048.b; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { if (!b[r][c]) return true; if (c < 3 && b[r][c] === b[r][c + 1]) return true; if (r < 3 && b[r][c] === b[r + 1][c]) return true; } return false; }
function g2Move(d) {
    const gs = gameState.g2048; if (gs.over) return;
    const b = gs.b, nb = b.map((r) => r.slice()); let gain = 0;
    for (let i = 0; i < 4; i++) {
        let line = d === 'l' || d === 'r' ? b[i].slice() : b.map((r) => r[i]);
        if (d === 'r' || d === 'd') line.reverse();
        const s = _g2Slide(line); gain += s.gain; let o = s.out;
        if (d === 'r' || d === 'd') o = o.reverse();
        for (let j = 0; j < 4; j++) { if (d === 'l' || d === 'r') nb[i][j] = o[j]; else nb[j][i] = o[j]; }
    }
    if (nb.every((r, i) => r.every((v, j) => v === b[i][j]))) { gs.msg = 'Nothing moves that way. Try another direction.'; return _g2Render(); }
    gs.hist.push({ b: b.map((r) => r.slice()), score: gs.score }); if (gs.hist.length > 50) gs.hist.shift();
    gs.b = nb; gs.score += gain; gs.msg = ''; _g2Add();
    if (gain && typeof sfxFlip === 'function') sfxFlip();
    const top = Math.max(...gs.b.flat());
    if (top >= gs.goal) { gs.over = true; _g2Render(); if (typeof sfxCorrect === 'function') sfxCorrect(); return GameKit.finish('g2048', true, `You made the ${gs.goal} tile! Score ${gs.score}.`); }
    if (!_g2Can()) { gs.over = true; gs.msg = 'No moves left.'; _g2Render(); return GameKit.finish('g2048', false, `No moves left. Your biggest tile was ${top} (goal ${gs.goal}).`); }
    _g2Render();
}
function g2Undo() { const gs = gameState.g2048; if (gs.over || !gs.hist.length) return; const h = gs.hist.pop(); gs.b = h.b; gs.score = h.score; gs.fresh = -1; gs.msg = 'Move undone.'; _g2Render(); }
function _g2Render() {
    const gs = gameState.g2048, el = document.getElementById('gameContent');
    if (!el || gameState.currentId !== 'g2048') return;
    const C = { 2: '#fff3d6', 4: '#ffe2a8', 8: '#ffbf69', 16: '#ff9f43', 32: '#ff7b54', 64: '#e8553f', 128: '#f4d35e', 256: '#e9c46a', 512: '#d4a017', 1024: '#7fb069', 2048: '#2a9d8f' };
    const tiles = gs.b.flat().map((v, i) => `<div class="g2-t${i === gs.fresh ? ' g2-new' : ''}" style="background:${v ? C[v] || '#264653' : 'rgba(255,250,240,.35)'};color:${v >= 128 ? '#fff' : '#2b1b0d'};font-size:${v >= 1024 ? 'clamp(1.2rem,6vw,2rem)' : 'clamp(1.6rem,8vw,2.6rem)'}">${v || ''}</div>`).join('');
    const arrow = (d, s, l) => `<button type="button" class="g2-a" onclick="g2Move('${d}')" aria-label="${l}">${s}</button>`;
    el.innerHTML = `<div class="g2" dir="ltr">
      <div class="g2-top"><span>Goal: <b>${gs.goal}</b></span><span>Score: <b>${gs.score}</b></span></div>
      <div class="g2-board" id="g2-board">${tiles}</div>
      <div class="cw-msg" role="status">${gs.msg || '&nbsp;'}</div>
      <div class="g2-pad">${arrow('u', '▲', 'up')}<div class="g2-mid">${arrow('l', '◀', 'left')}${GameKit.btn('Undo', 'g2Undo()', { disabled: !gs.hist.length || gs.over })}${arrow('r', '▶', 'right')}</div>${arrow('d', '▼', 'down')}</div>
    </div>
    <style>
      .g2{width:100%;box-sizing:border-box;max-width:26rem;margin:0 auto;color:#2b1b0d}
      .g2-top{display:flex;justify-content:space-between;font-size:1.2rem;margin-bottom:8px}
      .g2-board{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;background:#b08d5c;padding:8px;border-radius:14px;touch-action:none;user-select:none}
      .g2-t{aspect-ratio:1;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:900;font-family:system-ui,sans-serif}
      .g2-new{animation:g2pop .18s ease-out}@keyframes g2pop{from{transform:scale(.6)}to{transform:scale(1)}}
      @media (prefers-reduced-motion:reduce){.g2-new{animation:none}}
      .g2-pad{display:flex;flex-direction:column;align-items:center;gap:6px;margin-top:4px}
      .g2-mid{display:flex;gap:6px;align-items:center}
      .g2-a{width:72px;height:60px;border-radius:14px;border:3px solid #92400e;background:#f59e0b;color:#2a1700;font-size:1.6rem;font-weight:900;cursor:pointer}
      .g2 .gk-btn{border-color:#c9a46a}
      .cw-msg{text-align:center;font-weight:800;margin:8px 0;min-height:1.5em}
    </style>`;
    // swipe on the board
    const bd = document.getElementById('g2-board'); let sx = 0, sy = 0;
    bd.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    bd.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return; g2Move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u')); });
}
