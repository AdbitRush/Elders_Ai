// ═══════════════════════════════════════════════════════════════════════════════
// FOUR IN A ROW (2026-11, nostalgia batch 2) — the vertical drop-the-checker game, against the computer.
// 7 columns x 6 rows. Take turns dropping a checker into a column; it falls to the lowest empty space.
// Four of your color in a line (across, up and down, or slanting) wins. A full board with no line is a draw.
// Two-step drop on purpose: tap a column (or press 1-7) to pick it - a ghost checker shows where it will land -
// then tap it again or press Drop. Easy: the computer looks 2 moves ahead and sometimes drifts; normal 4; hard 6.
// Board: b[r][c], r = 0 top .. 5 bottom; 1 = you (red), 2 = computer (yellow).
// ═══════════════════════════════════════════════════════════════════════════════
const _FR_R = 6, _FR_C = 7;
const _frDrop = (b, c) => { for (let r = _FR_R - 1; r >= 0; r--) if (!b[r][c]) return r; return -1; };
function _frLine(b, p) {
    const D = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (let r = 0; r < _FR_R; r++) for (let c = 0; c < _FR_C; c++) {
        if (b[r][c] !== p) continue;
        for (const [dr, dc] of D) {
            const cells = [[r, c]];
            for (let k = 1; k < 4; k++) { const rr = r + dr * k, cc = c + dc * k; if (rr < 0 || rr >= _FR_R || cc < 0 || cc >= _FR_C || b[rr][cc] !== p) break; cells.push([rr, cc]); }
            if (cells.length === 4) return cells;
        }
    }
    return null;
}
function _frScore(b) {
    // windows of 4: 3 of mine + empty = strong; center column bonus
    let s = 0; const D = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (let r = 0; r < _FR_R; r++) { if (b[r][3] === 2) s += 3; else if (b[r][3] === 1) s -= 3; }
    for (let r = 0; r < _FR_R; r++) for (let c = 0; c < _FR_C; c++) for (const [dr, dc] of D) {
        const er = r + dr * 3, ec = c + dc * 3; if (er < 0 || er >= _FR_R || ec < 0 || ec >= _FR_C) continue;
        let m = 0, o = 0; for (let k = 0; k < 4; k++) { const v = b[r + dr * k][c + dc * k]; if (v === 2) m++; else if (v === 1) o++; }
        if (m && o) continue;
        if (m === 3) s += 6; else if (m === 2) s += 2; if (o === 3) s -= 8; else if (o === 2) s -= 2;
    }
    return s;
}
function _frSearch(b, d, p, a, z) {
    if (_frLine(b, 2)) return { v: 10000 + d };
    if (_frLine(b, 1)) return { v: -10000 - d };
    const cols = [3, 2, 4, 1, 5, 0, 6].filter((c) => _frDrop(b, c) >= 0);
    if (!cols.length) return { v: 0 };
    if (d === 0) return { v: _frScore(b) };
    let best = { v: p === 2 ? -1e9 : 1e9, c: cols[0] };
    for (const c of cols) {
        const r = _frDrop(b, c); b[r][c] = p;
        const v = _frSearch(b, d - 1, 3 - p, a, z).v; b[r][c] = 0;
        if (p === 2 ? v > best.v : v < best.v) best = { v, c };
        if (p === 2) a = Math.max(a, v); else z = Math.min(z, v);
        if (a >= z) break;
    }
    return best;
}
function initFourRow() {
    NK.start('fourrow', {
        setup(gs, diff) {
            gs.diff = diff; gs.depth = diff === 'easy' ? 2 : diff === 'hard' ? 6 : 4;
            gs.b = Array.from({ length: _FR_R }, () => Array(_FR_C).fill(0));
            gs.turn = 1; gs.sel = -1; gs.over = false; gs.last = null; gs.win = null; gs.moves = 0;
            gs.msg = 'You are red. Tap a column to choose it, then tap it again (or press Drop).';
        },
        view: _frView,
        keys: Object.assign(NK.digits((n) => frPick(n - 1), 7)),
        arrows(dir) {
            const gs = gameState.fourrow; if (gs.over || gs.turn !== 1) return false;
            if (dir === 'left' || dir === 'right') { let c = gs.sel < 0 ? 3 : gs.sel + (dir === 'left' ? -1 : 1); c = Math.max(0, Math.min(6, c)); frPick(c, true); return true; }
            if (dir === 'down' && gs.sel >= 0) { frDrop(); return true; }
            return false;
        },
        enter() { if (gameState.fourrow.sel >= 0) frDrop(); },
        rules: [
            'You play <b>red</b> and go first. The computer plays <b>yellow</b>.',
            'Pick a column. Your checker drops to the lowest empty space in it. A see-through checker shows where it will land.',
            'Tap the same column again, or press <b>Drop</b>, to let it go. Picking first means a slip of the finger never drops the wrong checker.',
            'Get <b>four of your checkers in a line</b> - across, up and down, or slanting - to win. Block the computer when it has three in a line.',
            'If the board fills up with no line of four, the game is a draw. There is no clock.',
            'Keyboard: 1 to 7 pick a column, left and right arrows move the choice, Down arrow or Enter drops.'],
        css: `.fr-wrap{max-width:min(100%,31rem);margin:0 auto}
.fr-board{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;background:#1d4ed8;padding:8px;border-radius:16px;box-shadow:inset 0 -6px 0 rgba(0,0,0,.25)}
.fr-col{display:grid;grid-template-rows:repeat(6,1fr);gap:4px;padding:3px;border:0;background:transparent;cursor:pointer;--nk-r:10px;min-width:0}
.fr-col.fr-sel{background:rgba(253,230,138,.35)}
.fr-col:disabled{cursor:default}
.fr-h{aspect-ratio:1;border-radius:50%;background:#fffaf1;box-shadow:inset 0 3px 4px rgba(0,0,0,.35)}
.fr-p1{background:radial-gradient(circle at 35% 30%,#f87171,#b91c1c 70%)}
.fr-p2{background:radial-gradient(circle at 35% 30%,#fde68a,#d97706 70%)}
.fr-ghost{background:repeating-radial-gradient(circle,#fecaca 0 4px,#fff 4px 8px);box-shadow:0 0 0 3px #b91c1c}
.fr-win{box-shadow:0 0 0 4px #fff,0 0 0 7px #15803d}
.fr-last{box-shadow:0 0 0 3px #fff}
.fr-nums{display:grid;grid-template-columns:repeat(7,1fr);padding:0 8px;text-align:center;font-weight:800;color:#4a3420;margin-top:4px}
.fr-key{display:inline-flex;gap:6px;align-items:center}.fr-key i{display:inline-block;width:18px;height:18px;border-radius:50%}`,
    });
}
function _frView(gs) {
    const can = gs.turn === 1 && !gs.over, ghostR = gs.sel >= 0 ? _frDrop(gs.b, gs.sel) : -1;
    const winSet = new Set((gs.win || []).map(([r, c]) => r + ',' + c));
    let cols = '';
    for (let c = 0; c < _FR_C; c++) {
        let holes = '';
        for (let r = 0; r < _FR_R; r++) {
            const v = gs.b[r][c];
            const cls = 'fr-h' + (v ? ' fr-p' + v : can && c === gs.sel && r === ghostR ? ' fr-ghost' : '') + (winSet.has(r + ',' + c) ? ' fr-win' : '') + (gs.last && gs.last[0] === r && gs.last[1] === c ? ' fr-last' : '');
            holes += `<span class="${cls}"></span>`;
        }
        const full = _frDrop(gs.b, c) < 0;
        cols += `<button type="button" class="nk-cell fr-col${c === gs.sel && can ? ' fr-sel' : ''}" onclick="frPick(${c})" data-k="col${c}"${c === 3 ? ' data-first' : ''} aria-label="column ${c + 1}${full ? ', full' : ''}${c === gs.sel ? ', chosen' : ''}"${can ? '' : ' disabled'}>${holes}</button>`;
    }
    return `<div class="nk-top"><span class="fr-key"><i class="fr-p1"></i> You (red)</span><span>${gs.over ? 'Game over' : gs.turn === 1 ? 'Your turn' : "Computer's turn"}</span><span class="fr-key"><i class="fr-p2"></i> Computer</span></div>
      <div class="fr-wrap"><div class="fr-board">${cols}</div><div class="fr-nums" aria-hidden="true">${[1, 2, 3, 4, 5, 6, 7].map((n) => `<span>${n}</span>`).join('')}</div></div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('arrow-down') + 'Drop', 'frDrop()', { cls: 'gk-primary', k: 'drop', disabled: !can || gs.sel < 0 })}${NK.btn(NK.icon('rotate-ccw') + 'New game', 'frRestart()', { k: 'restart' })}</div>`;
}
function frRestart() { initFourRow(); }
function frPick(c, viaArrow) {
    const gs = gameState.fourrow; if (gs.over || gs.turn !== 1 || c < 0 || c > 6) return;
    if (_frDrop(gs.b, c) < 0) { gs.msg = `Column ${c + 1} is full. Pick another one.`; return NK.render('fourrow'); }
    if (gs.sel === c && !viaArrow) return frDrop();
    gs.sel = c; gs.msg = `Column ${c + 1} chosen. Tap it again or press Drop.`;
    NK.render('fourrow');
}
function frDrop() {
    const gs = gameState.fourrow; if (gs.over || gs.turn !== 1 || gs.sel < 0) return;
    const c = gs.sel, r = _frDrop(gs.b, c); if (r < 0) return;
    gs.b[r][c] = 1; gs.last = [r, c]; gs.sel = -1; gs.moves++;
    if (typeof sfxFlip === 'function') sfxFlip();
    if (_frCheck(1)) return;
    gs.turn = 2; gs.msg = 'The computer is choosing a column...'; NK.render('fourrow');
    NK.after(700, _frCpu);
}
function _frCpu() {
    const gs = gameState.fourrow; if (gs.over) return;
    const cols = [0, 1, 2, 3, 4, 5, 6].filter((c) => _frDrop(gs.b, c) >= 0);
    let c = _frSearch(gs.b.map((x) => x.slice()), gs.depth, 2, -1e9, 1e9).c;
    if (gs.diff === 'easy' && Math.random() < 0.3) {
        // a gentle drift, but never past a move that wins or blocks a win
        const urgent = cols.find((k) => { const b = gs.b.map((x) => x.slice()), r = _frDrop(b, k); b[r][k] = 2; if (_frLine(b, 2)) return true; b[r][k] = 1; return !!_frLine(b, 1); });
        if (urgent === undefined) c = cols[Math.floor(Math.random() * cols.length)];
    }
    const r = _frDrop(gs.b, c); gs.b[r][c] = 2; gs.last = [r, c];
    if (typeof sfxFlip === 'function') sfxFlip();
    if (_frCheck(2)) return;
    gs.turn = 1; gs.msg = `The computer dropped into column ${c + 1} (ringed in white). Your turn.`;
    NK.render('fourrow');
}
function _frCheck(p) {
    const gs = gameState.fourrow, line = _frLine(gs.b, p);
    if (line) {
        gs.over = true; gs.win = line;
        gs.msg = p === 1 ? 'Four in a row - you win!' : 'The computer made four in a row (ringed in green).';
        NK.render('fourrow');
        if (p === 1 && typeof sfxCorrect === 'function') sfxCorrect();
        NK.finish('fourrow', p === 1, p === 1 ? `Four in a row in ${gs.moves} move${gs.moves === 1 ? "" : "s"}!` : 'The computer got four in a row this time. Try again whenever you like.');
        return true;
    }
    if (gs.b[0].every(Boolean)) {
        gs.over = true; gs.msg = 'The board is full - a draw.'; NK.render('fourrow');
        NK.finish('fourrow', false, 'A draw: the board filled up with no line of four.');
        return true;
    }
    return false;
}
