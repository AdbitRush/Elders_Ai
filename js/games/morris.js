// ═══════════════════════════════════════════════════════════════════════════════
// NINE MEN'S MORRIS (2026-11, nostalgia batch 2) — the very old "mill" board game (boards are scratched into
// medieval church benches), against a patient computer. No clock.
// Board: 24 points on three nested squares joined at the middles. Each side has 9 pieces.
// 1) Placing: take turns putting a piece on any empty point.  2) Moving: slide a piece along a line to the next
// empty point.  3) Flying: a side down to 3 pieces may jump to any empty point.
// Three in a row along a line = a MILL: remove one of the other side's pieces (not one in a mill, unless all are).
// A side with only 2 pieces, or with no legal move, loses. 40 moves in the moving stage with no mill = a draw.
// Computer: easy looks 1 move ahead (and sometimes wanders), normal 2, hard 3.
// ═══════════════════════════════════════════════════════════════════════════════
const _MO_XY = [[0, 0], [0, 3], [0, 6], [1, 1], [1, 3], [1, 5], [2, 2], [2, 3], [2, 4], [3, 0], [3, 1], [3, 2], [3, 4], [3, 5], [3, 6], [4, 2], [4, 3], [4, 4], [5, 1], [5, 3], [5, 5], [6, 0], [6, 3], [6, 6]];
const _MO_MILLS = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11], [12, 13, 14], [15, 16, 17], [18, 19, 20], [21, 22, 23],
  [0, 9, 21], [3, 10, 18], [6, 11, 15], [1, 4, 7], [16, 19, 22], [8, 12, 17], [5, 13, 20], [2, 14, 23]];
const _MO_ADJ = (() => { const a = Array.from({ length: 24 }, () => []); _MO_MILLS.forEach(([x, y, z]) => { a[x].push(y); a[y].push(x, z); a[z].push(y); }); return a; })();
const _moInMill = (b, i) => b[i] && _MO_MILLS.some((m) => m.includes(i) && m.every((j) => b[j] === b[i]));
const _moCount = (b, p) => b.filter((x) => x === p).length;
// removable pieces of player p: not in a mill, unless every one is
function _moRemovable(b, p) { const all = b.map((v, i) => (v === p ? i : -1)).filter((i) => i >= 0); const free = all.filter((i) => !_moInMill(b, i)); return free.length ? free : all; }
// all moves for player p: {from (-1 = place), to, rem (-1 = none)}
function _moMoves(s, p) {
    const b = s.b, out = [], flying = s.hand[p] === 0 && _moCount(b, p) === 3;
    const steps = [];
    if (s.hand[p] > 0) for (let i = 0; i < 24; i++) { if (!b[i]) steps.push([-1, i]); }
    else for (let i = 0; i < 24; i++) if (b[i] === p) (flying ? [...Array(24).keys()] : _MO_ADJ[i]).forEach((j) => { if (!b[j]) steps.push([i, j]); });
    for (const [f, t] of steps) {
        const nb = b.slice(); if (f >= 0) nb[f] = 0; nb[t] = p;
        if (_MO_MILLS.some((m) => m.includes(t) && m.every((j) => nb[j] === p))) _moRemovable(nb, 3 - p).forEach((r) => out.push({ from: f, to: t, rem: r }));
        else out.push({ from: f, to: t, rem: -1 });
    }
    return out;
}
function _moApply(s, m, p) { const b = s.b.slice(); if (m.from >= 0) b[m.from] = 0; b[m.to] = p; if (m.rem >= 0) b[m.rem] = 0; const hand = s.hand.slice(); if (m.from < 0) hand[p]--; return { b, hand }; }
function _moLost(s, p) { return (s.hand[p] === 0 && _moCount(s.b, p) < 3) || !_moMoves(s, p).length; }
function _moEval(s) {
    const n2 = _moCount(s.b, 2) + s.hand[2], n1 = _moCount(s.b, 1) + s.hand[1];
    let two = 0; _MO_MILLS.forEach((m) => { const v = m.map((j) => s.b[j]); const a = v.filter((x) => x === 2).length, c = v.filter((x) => x === 1).length, e = v.filter((x) => !x).length; if (a === 2 && e === 1) two++; if (c === 2 && e === 1) two--; });
    return (n2 - n1) * 20 + two * 4;
}
function _moSearch(s, p, d, a, z) {
    if (_moLost(s, p)) return { v: p === 2 ? -9999 - d : 9999 + d };
    if (d === 0) return { v: _moEval(s) };
    let ms = _moMoves(s, p); if (ms.length > 60) ms = ms.filter((m) => m.rem >= 0).concat(ms.filter((m) => m.rem < 0).sort(() => Math.random() - .5).slice(0, 40));
    let best = { v: p === 2 ? -1e9 : 1e9, m: ms[0] };
    for (const m of ms) {
        const v = _moSearch(_moApply(s, m, p), 3 - p, d - 1, a, z).v;
        if (p === 2 ? v > best.v : v < best.v) best = { v, m };
        if (p === 2) a = Math.max(a, v); else z = Math.min(z, v);
        if (a >= z) break;
    }
    return best;
}
function initMorris() {
    NK.start('morris', {
        setup(gs, diff) {
            gs.diff = diff; gs.depth = diff === 'easy' ? 1 : diff === 'hard' ? 3 : 2;
            gs.b = Array(24).fill(0); gs.hand = [0, 9, 9]; gs.turn = 1; gs.sel = -1; gs.removing = false; gs.over = false;
            gs.quiet = 0; gs.last = null;
            gs.msg = 'Placing: tap any empty point to put down one of your 9 pieces.';
        },
        view: _moView,
        rules: [
            'You play the <b>dark</b> pieces and go first; the computer plays light. Each side has 9 pieces.',
            '<b>Placing:</b> take turns putting one piece on any empty point.',
            '<b>Moving:</b> once all pieces are down, tap one of yours, then an empty point next to it along a line.',
            '<b>Mill:</b> three of your pieces in a straight line along the drawn lines. Making a mill lets you <b>remove</b> one computer piece (not one in a mill, unless all of them are).',
            '<b>Flying:</b> a side with only 3 pieces left may move a piece to any empty point.',
            'A side with only 2 pieces, or with no move, loses. 40 moves in a row with no mill is a draw. No clock.',
            'Keyboard: arrow keys move between points, Enter picks and places.'],
        css: `.mo-wrap{position:relative;max-width:min(100%,27rem);margin:0 auto;aspect-ratio:1;background:#e9c98f;border-radius:18px;box-shadow:inset 0 0 0 4px #8a5a2b,0 8px 18px -10px rgba(0,0,0,.5)}
.mo-svg{position:absolute;inset:7%;width:86%;height:86%}
.mo-pt{position:absolute;width:15.5%;height:15.5%;margin:-7.75% 0 0 -7.75%;border:0;background:transparent;padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer;--nk-r:50%}
.mo-pt:disabled{cursor:default}
.mo-dot{width:26%;height:26%;border-radius:50%;background:#4d2f15}
.mo-pc{width:64%;height:64%;border-radius:50%;box-shadow:0 3px 0 rgba(0,0,0,.35)}
.mo-p1{background:radial-gradient(circle at 35% 30%,#6b5848,#1d1712 70%)}
.mo-p2{background:radial-gradient(circle at 35% 30%,#fff,#e8dcc4 70%);border:2px solid #b49a70;box-sizing:border-box}
.mo-sel .mo-pc{box-shadow:0 0 0 4px #fff,0 0 0 7px #1d4ed8}
.mo-tgt .mo-dot{width:44%;height:44%;background:#bbf7d0;border:3px dashed #15803d}
.mo-rem .mo-pc{outline:4px dashed #b91c1c;outline-offset:2px}
.mo-last .mo-pc,.mo-last .mo-dot{box-shadow:0 0 0 3px #f59e0b}
#gameContent .nk button.mo-pt{position:absolute}
.mo-hand{display:inline-flex;flex-wrap:wrap;gap:3px;align-items:center}.mo-hand i{width:14px;height:14px;border-radius:50%;display:inline-block}`,
    });
}
const _moPhase = (gs, p) => (gs.hand[p] > 0 ? 'placing' : _moCount(gs.b, p) === 3 ? 'flying' : 'moving');
function _moView(gs) {
    const my = gs.turn === 1 && !gs.over;
    const rem = my && gs.removing ? _moRemovable(gs.b, 2) : [];
    let tg = [];
    if (my && !gs.removing && gs.sel >= 0) tg = (_moPhase(gs, 1) === 'flying' ? [...Array(24).keys()] : _MO_ADJ[gs.sel]).filter((j) => !gs.b[j]);
    const pts = _MO_XY.map(([r, c], i) => {
        const v = gs.b[i];
        const cls = 'nk-cell mo-pt' + (gs.sel === i ? ' mo-sel' : '') + (tg.includes(i) ? ' mo-tgt' : '') + (rem.includes(i) ? ' mo-rem' : '') + (gs.last && (gs.last.to === i) ? ' mo-last' : '');
        const lab = `point ${i + 1}, ${v === 1 ? 'your piece' : v === 2 ? 'computer piece' : 'empty'}${rem.includes(i) ? ', can be removed' : tg.includes(i) ? ', you can move here' : ''}`;
        return `<button type="button" class="${cls}" style="left:${7 + c * 86 / 6}%;top:${7 + r * 86 / 6}%" onclick="moTap(${i})" data-k="p${i}"${i === 0 ? ' data-first' : ''} aria-label="${lab}"${my ? '' : ' disabled'}>${v ? `<span class="mo-pc mo-p${v}"></span>` : '<span class="mo-dot"></span>'}</button>`;
    }).join('');
    const L = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    const svg = `<svg class="mo-svg" viewBox="0 0 6 6" aria-hidden="true"><g stroke="#4d2f15" stroke-width=".07" fill="none"><rect x="0" y="0" width="6" height="6"/><rect x="1" y="1" width="4" height="4"/><rect x="2" y="2" width="2" height="2"/>${L(3, 0, 3, 2)}${L(3, 4, 3, 6)}${L(0, 3, 2, 3)}${L(4, 3, 6, 3)}</g></svg>`;
    const hand = (p) => `<span class="mo-hand" aria-label="${gs.hand[p]} to place">${('<i class="mo-p' + p + '"></i>').repeat(gs.hand[p])}</span>`;
    return `<div class="nk-top"><span>You: <b>${_moCount(gs.b, 1)}</b> on board ${hand(1)}</span><span>Computer: <b>${_moCount(gs.b, 2)}</b> ${hand(2)}</span></div>
      <div class="nk-top" style="justify-content:center"><b>${gs.over ? 'Game over' : gs.turn === 1 ? (gs.removing ? 'Remove a computer piece' : 'Your turn: ' + _moPhase(gs, 1)) : "Computer's turn"}</b></div>
      <div class="mo-wrap">${svg}${pts}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('rotate-ccw') + 'New game', 'moRestart()', { k: 'restart' })}</div>`;
}
function moRestart() { initMorris(); }
function moTap(i) {
    const gs = gameState.morris; if (gs.over || gs.turn !== 1) return;
    if (gs.removing) {
        if (gs.b[i] !== 2) { gs.msg = 'You made a mill: tap one of the computer\'s pieces (ringed in red) to remove it.'; return NK.render('morris'); }
        if (!_moRemovable(gs.b, 2).includes(i)) { gs.msg = 'That piece is part of a mill and is protected. Pick one ringed in red.'; return NK.render('morris'); }
        gs.b[i] = 0; gs.removing = false; gs.quiet = 0;
        if (typeof sfxCorrect === 'function') sfxCorrect();
        gs.msg = 'Piece removed.'; return _moAfter(1);
    }
    const ph = _moPhase(gs, 1);
    if (ph === 'placing') {
        if (gs.b[i]) { gs.msg = 'That point is taken. Tap an empty point.'; return NK.render('morris'); }
        gs.b[i] = 1; gs.hand[1]--; gs.last = { to: i };
        return _moLanded(i);
    }
    if (gs.b[i] === 1) { gs.sel = gs.sel === i ? -1 : i; gs.msg = gs.sel < 0 ? 'Piece put down. Tap one of your pieces.' : (ph === 'flying' ? 'You have 3 pieces, so this one can fly to any empty point.' : 'Now tap a green point next to it.'); return NK.render('morris'); }
    if (gs.sel < 0) { gs.msg = 'First tap one of your own (dark) pieces.'; return NK.render('morris'); }
    if (gs.b[i]) { gs.msg = 'That point is taken.'; return NK.render('morris'); }
    if (ph !== 'flying' && !_MO_ADJ[gs.sel].includes(i)) { gs.msg = 'A piece moves one step along a line, to the next point. The green points are the choices.'; return NK.render('morris'); }
    gs.b[gs.sel] = 0; gs.b[i] = 1; gs.last = { to: i }; gs.sel = -1;
    _moLanded(i);
}
function _moLanded(i) {
    const gs = gameState.morris;
    if (typeof sfxFlip === 'function') sfxFlip();
    if (_moInMill(gs.b, i)) { gs.removing = true; gs.msg = 'A mill! Tap a computer piece ringed in red to remove it.'; return NK.render('morris'); }
    gs.msg = '';
    _moAfter(1);
}
function _moAfter(p) {
    const gs = gameState.morris;
    if (gs.hand[1] === 0 && gs.hand[2] === 0) gs.quiet++;   // moves in the moving stage since the last mill
    const o = 3 - p, s = { b: gs.b, hand: gs.hand };
    if (_moLost(s, o)) return _moEnd(p === 1, p === 1 ? (_moCount(gs.b, 2) + gs.hand[2] < 3 ? 'The computer is down to 2 pieces.' : 'The computer has no move left.') : (_moCount(gs.b, 1) + gs.hand[1] < 3 ? 'You are down to 2 pieces.' : 'You have no move left.'));
    if (gs.quiet >= 80) return _moEnd(null, '40 moves each without a mill.');
    gs.turn = o;
    if (o === 1) { gs.msg = (gs.msg ? gs.msg + ' ' : '') + 'Your turn: ' + (_moPhase(gs, 1) === 'placing' ? 'place a piece.' : _moPhase(gs, 1) === 'flying' ? 'you have 3 pieces, so you may fly.' : 'move a piece.'); return NK.render('morris'); }
    gs.msg = (gs.msg ? gs.msg + ' ' : '') + 'The computer is thinking...'; NK.render('morris');
    NK.after(800, _moCpu);
}
function _moCpu() {
    const gs = gameState.morris; if (gs.over || gs.turn !== 2) return;
    const s = { b: gs.b, hand: gs.hand }, ms = _moMoves(s, 2);
    let m;
    if (gs.diff === 'easy' && Math.random() < 0.35) m = ms[Math.floor(Math.random() * ms.length)];
    else m = _moSearch(s, 2, gs.depth, -1e9, 1e9).m;
    const n = _moApply(s, m, 2); gs.b = n.b; gs.hand = n.hand; gs.last = { to: m.to };
    if (typeof sfxFlip === 'function') sfxFlip();
    if (m.rem >= 0) gs.quiet = 0;
    gs.msg = (m.from < 0 ? `The computer placed a piece on point ${m.to + 1}.` : `The computer moved from point ${m.from + 1} to ${m.to + 1}.`) + (m.rem >= 0 ? ` It made a mill and removed your piece from point ${m.rem + 1}.` : '');
    _moAfter(2);
}
function _moEnd(win, why) {
    const gs = gameState.morris; gs.over = true; gs.removing = false; gs.sel = -1;
    gs.msg = why + (win ? ' You win!' : win === false ? ' The computer wins.' : ' A draw.');
    NK.render('morris');
    if (win && typeof sfxCorrect === 'function') sfxCorrect();
    NK.finish('morris', !!win, win ? `You won! ${why}` : win === false ? `The computer won this time. ${why}` : `A draw: ${why}`);
}
