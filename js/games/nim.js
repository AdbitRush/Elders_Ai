// ═══════════════════════════════════════════════════════════════════════════════
// NIM ROWS (2026-11, nostalgia batch 3) — the old take-away game played with matches on a bar or kitchen table.
// Rows of 1, 3, 5 and 7 sticks. On your turn take one or more sticks from ONE row. Whoever takes the LAST stick
// loses (the old "leave the last one" rule). You and the computer alternate; a match is first to 3 games, and the
// first move alternates. Easy: the computer often slips. Normal: it plays well and sometimes slips. Hard: it plays
// perfectly whenever it can, so you must find the winning moves (hint: think of each row in binary 1-2-4).
// Tap a stick to take it and every stick to its right in that row, then Take. No clock.
// ═══════════════════════════════════════════════════════════════════════════════
function initNim() {
    NK.start('nim', {
        setup(gs, diff) { gs.diff = diff; gs.wins = [0, 0]; gs.game = 0; gs.over = false; _nmNewGame(gs); },
        view: _nmView,
        keys: { KeyT: () => nmTake() },
        rules: [
            'Four rows of sticks: 1, 3, 5 and 7. Players take turns.',
            'On your turn take <b>one or more sticks from one row</b>. Tap a stick: it and every stick to its right in that row are marked. Then tap <b>Take</b>.',
            'Whoever takes the <b>last stick loses</b>. Leave the last one for the computer!',
            'A match is first to <b>3 games</b>. The first move alternates between you and the computer.',
            'No clock. Keyboard: arrow keys move between sticks, Enter marks, T takes.'],
        css: `.nm-b{background:linear-gradient(#8b5a2b,#6b4220);border-radius:16px;padding:14px 10px;box-shadow:inset 0 0 0 3px #4a2c14;max-width:30rem;margin:0 auto}
.nm-r{display:flex;justify-content:center;gap:clamp(6px,2.4vw,14px);min-height:clamp(70px,20vw,104px);align-items:center}
.nm-r+.nm-r{border-top:2px dashed rgba(255,231,196,.25)}
#gameContent .nk button.nm-s{width:clamp(22px,6.4vw,34px);height:clamp(62px,17vw,92px);border:0;padding:0;background:none;cursor:pointer;--nk-r:8px;position:relative}
.nm-s span{position:absolute;left:30%;right:30%;top:16%;bottom:0;border-radius:3px;background:linear-gradient(90deg,#f5deb3,#e8c98f 60%,#c9a56a)}
.nm-s span::before{content:"";position:absolute;left:-30%;right:-30%;top:-22%;height:26%;border-radius:50%;background:radial-gradient(circle at 40% 35%,#f87171,#b91c1c)}
.nm-s.nm-mk span{background:linear-gradient(90deg,#bfdbfe,#93c5fd);transform:translateY(-8px)}
.nm-s.nm-mk span::before{background:radial-gradient(circle at 40% 35%,#93c5fd,#1d4ed8)}
.nm-gone{width:clamp(22px,6.4vw,34px);height:clamp(62px,17vw,92px);display:inline-block;border-bottom:3px solid rgba(255,231,196,.25)}
.nm-sc{display:flex;justify-content:center;gap:18px;font-weight:800;font-size:1.1rem;margin:10px 0 0}
@media (prefers-reduced-motion:reduce){.nm-s.nm-mk span{transform:none}}`,
    });
}
function _nmNewGame(gs) {
    gs.rows = [1, 3, 5, 7]; gs.mark = null; gs.turn = gs.game % 2 ? 1 : 0; gs.game++; gs.done = false;
    gs.msg = `Game ${gs.game}. ${gs.turn === 0 ? 'You go first.' : 'The computer goes first.'} Whoever takes the last stick loses.`;
    if (gs.turn === 1) NK.after(1000, _nmCpu);
}
function nmMark(r, k) {   // mark stick k (0-based from the left) and every stick after it in row r
    const gs = gameState.nim; if (gs.over || gs.done || gs.turn !== 0) return;
    gs.mark = gs.mark && gs.mark[0] === r && gs.mark[1] === k ? null : [r, k];
    const n = gs.mark ? gs.rows[r] - k : 0;
    gs.msg = gs.mark ? `${NK.pl(n, 'stick')} marked in row ${r + 1}. Tap Take, or tap another stick to change it.` : '';
    NK.render('nim');
}
function nmTake() {
    const gs = gameState.nim; if (gs.over || gs.done || gs.turn !== 0) return;
    if (!gs.mark) { gs.msg = 'Tap a stick first to mark what you will take.'; return NK.render('nim'); }
    const [r, k] = gs.mark, n = gs.rows[r] - k; gs.rows[r] = k; gs.mark = null; if (typeof sfxFlip === 'function') sfxFlip();
    gs.msg = `You took ${NK.pl(n, 'stick')} from row ${r + 1}.`;
    if (_nmLeft(gs) === 0) return _nmGameEnd(gs, 1);   // you took the last one
    gs.turn = 1; NK.render('nim'); NK.after(1000, _nmCpu);
}
const _nmLeft = (gs) => gs.rows.reduce((a, b) => a + b, 0);
// best move for misere Nim: [row, newCount] or null if every move loses
function _nmBest(rows) {
    const big = rows.filter((x) => x > 1).length;
    for (let r = 0; r < rows.length; r++) for (let k = 0; k < rows[r]; k++) {
        const t = rows.slice(); t[r] = k; const b2 = t.filter((x) => x > 1).length, ones = t.filter((x) => x === 1).length, x = t.reduce((a, v) => a ^ v, 0);
        if (b2 === 0 ? ones % 2 === 1 && t.some(Boolean) : x === 0) return [r, k];
    }
    return null;
}
function _nmCpu() {
    const gs = gameState.nim; if (gs.over || gs.done || gs.turn !== 1) return;
    const slip = gs.diff === 'easy' ? 0.5 : gs.diff === 'normal' ? 0.2 : 0;
    let mv = Math.random() < slip ? null : _nmBest(gs.rows);
    if (!mv) {   // no winning move (or a slip): a random take, but never the very last stick if it can be avoided
        const rs = gs.rows.map((v, i) => i).filter((i) => gs.rows[i]), r = rs[Math.floor(Math.random() * rs.length)], left = _nmLeft(gs);
        const take = left === gs.rows[r] ? Math.max(1, gs.rows[r] - 1) : 1 + Math.floor(Math.random() * Math.min(3, gs.rows[r]));
        mv = [r, gs.rows[r] - take];
    }
    const [r, k] = mv, n = gs.rows[r] - k; gs.rows[r] = k; if (typeof sfxFlip === 'function') sfxFlip();
    gs.msg = `The computer took ${NK.pl(n, 'stick')} from row ${r + 1}.`;
    if (_nmLeft(gs) === 0) return _nmGameEnd(gs, 0);
    gs.turn = 0; gs.msg += _nmLeft(gs) === 1 ? ' Only one stick is left, and it is your turn...' : ' Your turn.'; NK.render('nim');
}
function _nmGameEnd(gs, winner) {
    gs.wins[winner]++; gs.done = true; gs.turn = -1;
    gs.msg += winner === 0 ? ' The computer had to take the last stick: you win this game!' : ' You took the last stick: the computer wins this game.';
    if (winner === 0 && typeof sfxCorrect === 'function') sfxCorrect();
    if (gs.wins[0] >= 3 || gs.wins[1] >= 3) {
        gs.over = true; const win = gs.wins[0] >= 3; NK.render('nim');
        return NK.finish('nim', win, win ? `You won the match ${gs.wins[0]} games to ${gs.wins[1]}.` : `The computer won the match ${gs.wins[1]} to ${gs.wins[0]}. A rematch is one tap away.`);
    }
    NK.render('nim');
}
function nmNext() { const gs = gameState.nim; if (gs.over || !gs.done) return; _nmNewGame(gs); NK.render('nim'); }
function nmNew() { initNim(); }
function _nmView(gs) {
    const my = gs.turn === 0 && !gs.done && !gs.over;
    const rows = gs.rows.map((n, r) => { let h = '';
        for (let k = 0; k < n; k++) { const mk = gs.mark && gs.mark[0] === r && k >= gs.mark[1];
            h += `<button type="button" class="nk-cell nm-s${mk ? ' nm-mk' : ''}" onclick="nmMark(${r},${k})" data-k="s${r}_${k}"${r === 3 && k === 0 ? ' data-first' : ''} aria-label="row ${r + 1}, stick ${k + 1} of ${n}${mk ? ', marked to take' : ''}"${my ? '' : ' disabled'}><span></span></button>`; }
        for (let k = n; k < [1, 3, 5, 7][r]; k++) h += '<span class="nm-gone" aria-hidden="true"></span>';
        return `<div class="nm-r" role="group" aria-label="row ${r + 1}: ${NK.pl(n, 'stick')}">${h}</div>`; }).join('');
    return `<div class="nk-top"><span>Game <b>${gs.game}</b></span><span>${gs.over ? 'Match over' : gs.done ? 'Game over' : my ? 'Your turn' : "Computer's turn"}</span><span>Sticks left: <b>${_nmLeft(gs)}</b></span></div>
      <div class="nm-b">${rows}</div>
      <div class="nm-sc"><span>You: ${gs.wins[0]}</span><span>Computer: ${gs.wins[1]}</span><span>(first to 3)</span></div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${gs.done && !gs.over ? NK.btn('Next game', 'nmNext()', { k: 'next', cls: 'gk-primary' }) : NK.btn('Take', 'nmTake()', { k: 'take', cls: 'gk-primary', disabled: !my || !gs.mark })}${NK.btn(NK.icon('rotate-ccw') + 'New match', 'nmNew()', { k: 'restart' })}</div>`;
}
