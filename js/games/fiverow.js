// ═══════════════════════════════════════════════════════════════════════════════
// FIVE IN A ROW (2026-11, nostalgia batch 3) — the old pencil-and-paper and go-board game. You (dark stones) and the
// computer (light) take turns putting a stone on any empty point. The first to make an unbroken line of FIVE across,
// down or slanting wins. You move first. Board 11x11 on easy and normal, 13x13 on hard.
// Computer: it scores every empty point by the lines it would make or block. Easy: it often plays the second-best
// point and ignores your threes. Normal: it blocks and builds. Hard: it also weighs double threats. No clock.
// ═══════════════════════════════════════════════════════════════════════════════
const _FR_D = [[0, 1], [1, 0], [1, 1], [1, -1]];
function initFiverow() {
    NK.start('fiverow', {
        setup(gs, diff) {
            gs.diff = diff; gs.n = diff === 'hard' ? 13 : 11; gs.b = Array(gs.n * gs.n).fill(0); gs.turn = 1; gs.over = false; gs.last = -1; gs.line = []; gs.moves = 0;
            gs.msg = 'You are dark and go first. Tap any point. Make five in a row before the computer does.';
        },
        view: _frView,
        rules: [
            'You play <b>dark</b> stones and go first; the computer plays light ones.',
            'Take turns putting one stone on any empty point. Stones never move and are never taken.',
            'The first to make an unbroken line of <b>five</b>, across, down or slanting, wins.',
            'Watch for an open line of three with both ends free: if you do not block one end, it can become an unstoppable four.',
            'No clock. Keyboard: arrow keys move around the board, Enter places a stone.'],
        css: `.fr-b{display:grid;gap:0;background:#e9c88f;padding:2.5%;border-radius:12px;box-shadow:inset 0 0 0 3px #a16207,0 3px 0 #7c4a0a;max-width:min(100%,32rem,max(18rem,calc(100vh - 290px)));margin:0 auto;background-image:linear-gradient(#e9c88f,#dcb576)}
.fr-s{aspect-ratio:1;border:0;padding:0;min-width:0;cursor:pointer;position:relative;--nk-r:50%;--lc:rgba(124,74,10,.8);background:linear-gradient(var(--lc),var(--lc)) center/1.5px 100% no-repeat,linear-gradient(var(--lc),var(--lc)) center/100% 1.5px no-repeat}
.fr-s.fr-l0{background:linear-gradient(var(--lc),var(--lc)) center/1.5px 100% no-repeat,linear-gradient(var(--lc),var(--lc)) right center/50% 1.5px no-repeat}
.fr-s.fr-r0{background:linear-gradient(var(--lc),var(--lc)) center/1.5px 100% no-repeat,linear-gradient(var(--lc),var(--lc)) left center/50% 1.5px no-repeat}
.fr-s.fr-t0{background:linear-gradient(var(--lc),var(--lc)) center bottom/1.5px 50% no-repeat,linear-gradient(var(--lc),var(--lc)) center/100% 1.5px no-repeat}
.fr-s.fr-b0{background:linear-gradient(var(--lc),var(--lc)) center top/1.5px 50% no-repeat,linear-gradient(var(--lc),var(--lc)) center/100% 1.5px no-repeat}
.fr-s:disabled{cursor:default}
.fr-st{position:absolute;inset:8%;border-radius:50%;z-index:1}
.fr-1{background:radial-gradient(circle at 35% 30%,#57534e,#0c0a09 70%);box-shadow:0 1px 2px rgba(0,0,0,.5)}
.fr-2{background:radial-gradient(circle at 35% 30%,#fff,#e7e5e4 70%);box-shadow:0 1px 2px rgba(0,0,0,.45)}
.fr-last .fr-st::after{content:"";position:absolute;inset:34%;border-radius:50%;background:#dc2626}
.fr-win .fr-st{box-shadow:0 0 0 3px #16a34a}`,
    });
}
function _frRun(b, n, i, p, dr, dc) { const r = Math.floor(i / n), c = i % n; let k = 0, y = r + dr, x = c + dc; while (y >= 0 && y < n && x >= 0 && x < n && b[y * n + x] === p) { k++; y += dr; x += dc; } return { k, open: y >= 0 && y < n && x >= 0 && x < n && !b[y * n + x] }; }
function _frFive(b, n, i, p) {
    for (const [dr, dc] of _FR_D) { const a = _frRun(b, n, i, p, dr, dc), z = _frRun(b, n, i, p, -dr, -dc); if (a.k + z.k + 1 >= 5) { const r = Math.floor(i / n), c = i % n, line = [i]; for (let s = 1; s <= a.k; s++) line.push((r + dr * s) * n + c + dc * s); for (let s = 1; s <= z.k; s++) line.push((r - dr * s) * n + c - dc * s); return line; } }
    return null;
}
// how good is point i for player p (lines it makes)
function _frVal(b, n, i, p) {
    let v = 0, threes = 0;
    for (const [dr, dc] of _FR_D) {
        const a = _frRun(b, n, i, p, dr, dc), z = _frRun(b, n, i, p, -dr, -dc), len = a.k + z.k + 1, opens = (a.open ? 1 : 0) + (z.open ? 1 : 0);
        if (len >= 5) v += 100000; else if (len === 4) v += opens === 2 ? 20000 : opens ? 4000 : 0; else if (len === 3) { v += opens === 2 ? 1500 : opens ? 200 : 0; if (opens === 2) threes++; } else if (len === 2) v += opens === 2 ? 60 : opens ? 15 : 0; else v += opens;
    }
    return { v, threes };
}
function frTap(i) {
    const gs = gameState.fiverow; if (gs.over || gs.turn !== 1) return;
    if (gs.b[i]) { gs.msg = 'That point is taken.'; return NK.render('fiverow'); }
    gs.b[i] = 1; gs.last = i; gs.moves++; if (typeof sfxFlip === 'function') sfxFlip();
    const w = _frFive(gs.b, gs.n, i, 1); if (w) return _frEnd(gs, 1, w);
    if (!gs.b.includes(0)) return _frEnd(gs, 0, []);
    gs.turn = 2; gs.msg = 'The computer is thinking...'; NK.render('fiverow'); NK.after(600, _frCpu); NK.after(4000, _frWatch);
}
function _frCpu() {
    const gs = gameState.fiverow; if (gs.over || gs.turn !== 2) return; const n = gs.n, b = gs.b;
    const near = (i) => { const r = Math.floor(i / n), c = i % n; for (let a = -2; a <= 2; a++) for (let d = -2; d <= 2; d++) { const y = r + a, x = c + d; if (y >= 0 && y < n && x >= 0 && x < n && b[y * n + x]) return true; } return false; };
    const opts = [];
    for (let i = 0; i < b.length; i++) if (!b[i] && near(i)) {
        const me = _frVal(b, n, i, 2), you = _frVal(b, n, i, 1);
        let v = me.v * 1.1 + you.v * (gs.diff === 'easy' ? 0.45 : 1);
        if (gs.diff === 'hard') v += (me.threes >= 2 ? 15000 : 0) + (you.threes >= 2 ? 12000 : 0);
        if (gs.diff === 'easy' && you.v >= 1500 && you.v < 20000) v -= 1200;   // easy misses open threes
        const r = Math.floor(i / n), c = i % n; v += 4 - (Math.abs(r - (n - 1) / 2) + Math.abs(c - (n - 1) / 2)) * 0.3;
        opts.push([i, v]);
    }
    if (!opts.length) { const c = Math.floor(n * n / 2); opts.push([b[c] ? b.indexOf(0) : c, 0]); }
    opts.sort((a, z) => z[1] - a[1]);
    const pick = gs.diff === 'easy' && opts.length > 1 && Math.random() < 0.35 && opts[0][1] < 90000 ? opts[1][0] : opts[0][0];
    b[pick] = 2; gs.last = pick; if (typeof sfxFlip === 'function') sfxFlip();
    const w = _frFive(b, n, pick, 2); if (w) return _frEnd(gs, 2, w);
    if (!b.includes(0)) return _frEnd(gs, 0, []);
    gs.turn = 1; const r = Math.floor(pick / n), c = pick % n;
    const threat = opts[0][1] >= 20000 ? ' Careful: it has four in a line!' : _frVal(b, n, pick, 2).v >= 1500 ? ' Watch that line.' : '';
    gs.msg = `The computer played row ${r + 1}, column ${c + 1}.${threat} Your turn.`;
    NK.render('fiverow');
}
function _frWatch() {
    const gs = gameState.fiverow; if (gs.over || gs.turn !== 2) return;
    try { _frCpu(); } catch (e) {}
    if (gs.over || gs.turn !== 2) return;   // the retry recovered
    gs.turn = 1; gs.msg = 'The computer hesitated - your turn again.'; NK.render('fiverow');
}
function _frEnd(gs, who, line) {
    gs.over = true; gs.turn = 0; gs.line = line;
    gs.msg = who === 1 ? 'Five in a row! You win.' : who === 2 ? 'The computer made five in a row.' : 'The board is full: a draw.';
    NK.render('fiverow'); if (who === 1 && typeof sfxCorrect === 'function') sfxCorrect();
    NK.finish('fiverow', who === 1, who === 1 ? `Five in a row in ${NK.pl(gs.moves, 'move')}!` : who === 2 ? 'The computer got five first. A rematch is one tap away.' : 'A full board and no winner: a draw.');
}
function frNew() { initFiverow(); }
function _frView(gs) {
    const n = gs.n, my = gs.turn === 1 && !gs.over, mid = Math.floor(n / 2);
    let h = '';
    for (let i = 0; i < n * n; i++) {
        const r = Math.floor(i / n), c = i % n, v = gs.b[i];
        const cls = `nk-cell fr-s${c === 0 ? ' fr-l0' : ''}${c === n - 1 ? ' fr-r0' : ''}${r === 0 ? ' fr-t0' : ''}${r === n - 1 ? ' fr-b0' : ''}${gs.last === i ? ' fr-last' : ''}${gs.line.includes(i) ? ' fr-win' : ''}`;
        h += `<button type="button" class="${cls}" onclick="frTap(${i})" data-k="p${i}"${r === mid && c === mid ? ' data-first' : ''} aria-label="row ${r + 1} column ${c + 1}: ${v === 1 ? 'your stone' : v === 2 ? "computer's stone" : 'empty'}${gs.last === i ? ', last move' : ''}"${my && !v ? '' : ' disabled'}>${v ? `<span class="fr-st fr-${v}"></span>` : ''}</button>`;
    }
    return `<div class="nk-top"><span>${gs.over ? 'Game over' : my ? 'Your move (dark)' : "Computer's move"}</span><span>Board ${n} x ${n}</span></div>
      <div class="fr-b" style="grid-template-columns:repeat(${n},1fr)">${h}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('rotate-ccw') + 'New game', 'frNew()', { k: 'restart' })}</div>`;
}
