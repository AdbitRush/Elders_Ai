// ═══════════════════════════════════════════════════════════════════════════════
// REVERSI (2026-11, nostalgia batch 2) — the 19th-century disc-flipping board game, against a patient computer.
// 8x8 board. You are dark and move first. Place a disc so that it closes a straight line (across, down or slanting)
// of the computer's discs between it and another of yours: every closed-in disc flips to your color. A move must
// flip at least one disc. No move? You pass. Game over when neither side can move; more discs wins.
// Legal squares show a small ring; "Show my moves" can hide them. Easy: the computer picks a random legal square
// half the time. Normal: it looks one move ahead with a corner-loving square map. Hard: three moves ahead.
// Board index = r * 8 + c; 1 = you (dark), 2 = computer (light), 0 = empty.
// ═══════════════════════════════════════════════════════════════════════════════
const _RV_W = [
  100, -20, 10, 5, 5, 10, -20, 100,
  -20, -40, -2, -2, -2, -2, -40, -20,
  10, -2, 1, 1, 1, 1, -2, 10,
  5, -2, 1, 0, 0, 1, -2, 5,
  5, -2, 1, 0, 0, 1, -2, 5,
  10, -2, 1, 1, 1, 1, -2, 10,
  -20, -40, -2, -2, -2, -2, -40, -20,
  100, -20, 10, 5, 5, 10, -20, 100];
const _RV_D = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
function _rvFlips(b, i, p) {
    if (b[i]) return [];
    const r0 = Math.floor(i / 8), c0 = i % 8, o = 3 - p, out = [];
    for (const [dr, dc] of _RV_D) {
        const line = []; let r = r0 + dr, c = c0 + dc;
        while (r >= 0 && r < 8 && c >= 0 && c < 8 && b[r * 8 + c] === o) { line.push(r * 8 + c); r += dr; c += dc; }
        if (line.length && r >= 0 && r < 8 && c >= 0 && c < 8 && b[r * 8 + c] === p) out.push(...line);
    }
    return out;
}
const _rvMoves = (b, p) => { const m = []; for (let i = 0; i < 64; i++) if (!b[i] && _rvFlips(b, i, p).length) m.push(i); return m; };
function _rvApply(b, i, p) { const nb = b.slice(), f = _rvFlips(b, i, p); nb[i] = p; f.forEach((x) => (nb[x] = p)); return nb; }
function _rvEval(b) {
    let s = 0, n2 = 0, n1 = 0;
    for (let i = 0; i < 64; i++) { if (b[i] === 2) { s += _RV_W[i]; n2++; } else if (b[i] === 1) { s -= _RV_W[i]; n1++; } }
    return s + (_rvMoves(b, 2).length - _rvMoves(b, 1).length) * 3 + (n1 + n2 > 54 ? (n2 - n1) * 4 : 0);
}
function _rvSearch(b, p, d, a, z) {
    const ms = _rvMoves(b, p);
    if (d === 0) return { v: _rvEval(b) };
    if (!ms.length) {
        if (!_rvMoves(b, 3 - p).length) { const n2 = b.filter((x) => x === 2).length, n1 = b.filter((x) => x === 1).length; return { v: (n2 - n1) * 1000 }; }
        return { v: _rvSearch(b, 3 - p, d - 1, a, z).v };
    }
    let best = { v: p === 2 ? -1e9 : 1e9, i: ms[0] };
    for (const i of ms) {
        const v = _rvSearch(_rvApply(b, i, p), 3 - p, d - 1, a, z).v;
        if (p === 2 ? v > best.v : v < best.v) best = { v, i };
        if (p === 2) a = Math.max(a, v); else z = Math.min(z, v);
        if (a >= z) break;
    }
    return best;
}
function initReversi() {
    NK.start('reversi', {
        setup(gs, diff) {
            gs.diff = diff; gs.b = Array(64).fill(0); gs.b[27] = gs.b[36] = 2; gs.b[28] = gs.b[35] = 1;
            gs.turn = 1; gs.over = false; gs.last = -1; gs.flipped = [];
            if (gs.hints === undefined) gs.hints = true;
            gs.msg = 'You are dark. Tap a square with a ring to place a disc.';
        },
        view: _rvView,
        keys: { KeyH: () => rvHints() },
        rules: [
            'You play the <b>dark</b> discs and go first. The computer plays the light ones.',
            'Place a disc so that one or more light discs are <b>trapped in a straight line</b> between your new disc and another dark disc (across, up and down, or slanting). All the trapped discs flip to dark.',
            'Every move must flip at least one disc. Squares where you can move show a small ring.',
            'If you have no move, you pass (the game does it for you). When neither side can move, the game ends.',
            'The player with more discs wins. There is no clock.',
            'Keyboard: arrow keys move around the board, Enter places a disc, H shows or hides the rings.'],
        css: `.rv-board{display:grid;grid-template-columns:repeat(8,1fr);gap:3px;background:#1f5c38;padding:6px;border-radius:14px;box-shadow:inset 0 0 0 3px #174a2c;max-width:min(100%,30rem);margin:0 auto}
.rv-sq{aspect-ratio:1;background:#2f7d4f;display:flex;align-items:center;justify-content:center;padding:0;min-width:0;cursor:pointer;--nk-r:5px}
.rv-sq:disabled{cursor:default}
.rv-d{width:82%;height:82%;border-radius:50%;box-shadow:0 2px 0 rgba(0,0,0,.35)}
.rv-p1{background:radial-gradient(circle at 35% 30%,#5b4a3a,#1d1712 70%)}
.rv-p2{background:radial-gradient(circle at 35% 30%,#ffffff,#e8dcc4 70%);border:2px solid #cbb994;box-sizing:border-box}
.rv-hint{width:30%;height:30%;border-radius:50%;border:3px solid #fde68a}
.rv-last{box-shadow:inset 0 0 0 3px #fbbf24}
.rv-flip .rv-d{outline:3px solid #93c5fd;outline-offset:1px}
.rv-score{display:inline-flex;align-items:center;gap:6px}.rv-score i{display:inline-block;width:18px;height:18px;border-radius:50%}`,
    });
}
function _rvView(gs) {
    const my = gs.turn === 1 && !gs.over, ms = my ? _rvMoves(gs.b, 1) : [];
    const n1 = gs.b.filter((x) => x === 1).length, n2 = gs.b.filter((x) => x === 2).length;
    let cells = '';
    for (let i = 0; i < 64; i++) {
        const v = gs.b[i], legal = ms.includes(i), r = Math.floor(i / 8), c = i % 8;
        const cls = 'nk-cell rv-sq' + (i === gs.last ? ' rv-last' : '') + (gs.flipped.includes(i) ? ' rv-flip' : '');
        const inner = v ? `<span class="rv-d rv-p${v}"></span>` : legal && gs.hints ? '<span class="rv-hint"></span>' : '';
        const lab = `row ${r + 1} column ${c + 1}, ${v === 1 ? 'dark' : v === 2 ? 'light' : legal ? 'empty, you can play here' : 'empty'}`;
        cells += `<button type="button" class="${cls}" onclick="rvTap(${i})" data-k="q${i}"${i === 19 ? ' data-first' : ''} aria-label="${lab}"${gs.over ? ' disabled' : ''}>${inner}</button>`;
    }
    return `<div class="nk-top"><span class="rv-score"><i class="rv-p1"></i> You: <b>${n1}</b></span><span>${gs.over ? 'Game over' : gs.turn === 1 ? 'Your turn' : "Computer's turn"}</span><span class="rv-score"><i class="rv-p2"></i> Computer: <b>${n2}</b></span></div>
      <div class="rv-board">${cells}</div>${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(gs.hints ? 'Hide my moves' : 'Show my moves', 'rvHints()', { k: 'hints', pressed: gs.hints })}${NK.btn(NK.icon('rotate-ccw') + 'New game', 'rvRestart()', { k: 'restart' })}</div>`;
}
function rvHints() { const gs = gameState.reversi; gs.hints = !gs.hints; NK.render('reversi'); }
function rvRestart() { initReversi(); }
function rvTap(i) {
    const gs = gameState.reversi; if (gs.over || gs.turn !== 1) return;
    if (gs.b[i]) { gs.msg = 'That square is taken. Pick an empty square with a ring.'; return NK.render('reversi'); }
    const f = _rvFlips(gs.b, i, 1);
    if (!f.length) { gs.msg = 'A disc there would not trap any light discs. Try a square with a ring.'; if (typeof sfxWrong === 'function') sfxWrong(); return NK.render('reversi'); }
    gs.b = _rvApply(gs.b, i, 1); gs.last = i; gs.flipped = f;
    if (typeof sfxFlip === 'function') sfxFlip();
    gs.msg = `You flipped ${f.length} disc${f.length === 1 ? '' : 's'}.`;
    _rvNext(2);
}
function _rvNext(p) {
    const gs = gameState.reversi;
    const pm = _rvMoves(gs.b, p), om = _rvMoves(gs.b, 3 - p);
    if (!pm.length && !om.length) return _rvEnd();
    if (!pm.length) { gs.msg += p === 2 ? ' The computer has no move and passes. Your turn again.' : ' You have no move, so you pass.'; p = 3 - p; }
    gs.turn = p;
    if (p === 1) { gs.msg += gs.msg.endsWith('again.') ? '' : ' Your turn.'; return NK.render('reversi'); }
    gs.msg += ' The computer is thinking...';
    NK.render('reversi');
    NK.after(800, _rvCpu);
}
function _rvCpu() {
    const gs = gameState.reversi; if (gs.over || gs.turn !== 2) return;
    const ms = _rvMoves(gs.b, 2);
    let i;
    if (gs.diff === 'easy' && Math.random() < 0.5) i = ms[Math.floor(Math.random() * ms.length)];
    else i = _rvSearch(gs.b, 2, gs.diff === 'hard' ? 3 : 1, -1e9, 1e9).i;
    const f = _rvFlips(gs.b, i, 2);
    gs.b = _rvApply(gs.b, i, 2); gs.last = i; gs.flipped = f;
    if (typeof sfxFlip === 'function') sfxFlip();
    gs.msg = `The computer played row ${Math.floor(i / 8) + 1}, column ${i % 8 + 1} and flipped ${f.length} (outlined in blue).`;
    _rvNext(1);
}
function _rvEnd() {
    const gs = gameState.reversi; gs.over = true;
    const n1 = gs.b.filter((x) => x === 1).length, n2 = gs.b.filter((x) => x === 2).length;
    gs.msg = `No moves left. You ${n1}, computer ${n2}.`;
    NK.render('reversi');
    if (n1 > n2 && typeof sfxCorrect === 'function') sfxCorrect();
    NK.finish('reversi', n1 > n2, n1 > n2 ? `You won ${n1} to ${n2}!` : n1 === n2 ? `A tie at ${n1} each.` : `The computer won ${n2} to ${n1}. A rematch is one tap away.`);
}
