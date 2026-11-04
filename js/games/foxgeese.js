// ═══════════════════════════════════════════════════════════════════════════════
// FOX AND GEESE (2026-11, nostalgia batch 3) — the old farmhouse hunt game on a cross-shaped board of 33 points.
// You play the geese, the computer is the fox. Moves go along the lines (no slanting).
// Geese move one step left, right or up (toward the top arm), never back down. The fox moves one step any way, or
// JUMPS a goose next to it onto the empty point right behind, taking that goose; it may keep jumping.
// The geese win by trapping the fox so it cannot move. The fox wins when only 7 geese are left (too few to trap it),
// when the geese have no move, or when it is still free after 80 goose moves (easy) or 70 (normal, hard). Easy: 15 geese and a hasty fox. Normal: 13 geese. Hard: 13 geese, the fox looks a
// move ahead. No clock.
// Points are (row, column) on a 7x7 grid; a point exists when its row or column is 2, 3 or 4.
// ═══════════════════════════════════════════════════════════════════════════════
const _FG_ON = (r, c) => r >= 0 && r < 7 && c >= 0 && c < 7 && ((r >= 2 && r <= 4) || (c >= 2 && c <= 4));
const _FG_D = [[-1, 0], [1, 0], [0, -1], [0, 1]];
function initFoxgeese() {
    NK.start('foxgeese', {
        setup(gs, diff) {
            gs.diff = diff; gs.geese = [];
            for (let c = 0; c < 7; c++) gs.geese.push([4, c]); for (const r of [5, 6]) for (const c of [2, 3, 4]) gs.geese.push([r, c]);
            if (diff === 'easy') gs.geese.push([3, 0], [3, 6]);
            gs.start = gs.geese.length; gs.limit = diff === 'easy' ? 80 : 70; gs.gm = 0; gs.fox = [2, 3]; gs.sel = -1; gs.turn = 0; gs.over = false; gs.last = null; gs.jumps = [];
            gs.msg = 'You are the geese. Tap a goose, then a dotted point. Geese never step back down. Trap the fox!';
        },
        view: _fgView,
        rules: (gs) => [
            'You play the <b>geese</b>; the computer is the <b>fox</b>. Moves go along the lines, one point at a time, never slanting.',
            'A goose moves <b>left, right or up</b>, never back down.',
            'The fox moves any way along a line, or <b>jumps</b> a goose next to it onto the empty point right behind and takes it. It may jump again.',
            `Trap the fox so it cannot move, and the geese win. If only 7 geese are left, if the geese cannot move, or if the fox is still free after ${gs.limit} goose moves, the fox wins. You start with ${gs.start}.`,
            'Tip: move in a solid line, and never leave a gap behind a goose that the fox can jump into. No clock. Keyboard: arrow keys and Enter.'],
        css: `.fg-b{position:relative;width:min(100%,30rem,max(18rem,calc(100vh - 300px)));aspect-ratio:1;margin:0 auto;background:radial-gradient(circle at 50% 40%,#d9f99d,#a3e635);border-radius:18px;box-shadow:inset 0 0 0 4px #4d7c0f}
.fg-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
#gameContent .nk button.fg-p{position:absolute}
.fg-p{width:12.5%;height:12.5%;margin:-6.25% 0 0 -6.25%;border-radius:50%;border:0;padding:0;background:transparent;cursor:pointer;--nk-r:50%;display:flex;align-items:center;justify-content:center;z-index:2}
.fg-p:disabled{cursor:default}
.fg-g{width:80%;height:80%;border-radius:50%;background:radial-gradient(circle at 38% 32%,#fff,#e5e7eb 65%,#9ca3af);border:3px solid #374151;display:flex;align-items:center;justify-content:center}
.fg-g svg{width:70%;height:70%;color:#c2410c}
.fg-f{width:88%;height:88%;border-radius:50%;background:radial-gradient(circle at 38% 32%,#fdba74,#ea580c 70%);border:3px solid #7c2d12;display:flex;align-items:center;justify-content:center;color:#fff;font:900 clamp(.9rem,4vw,1.4rem) Georgia,serif}
.fg-sel .fg-g{box-shadow:0 0 0 4px #1d4ed8}
.fg-dot::after{content:"";width:32%;height:32%;border-radius:50%;background:rgba(29,78,216,.8)}
.fg-last .fg-f{box-shadow:0 0 0 4px #fde047}
.fg-hole{width:22%;height:22%;border-radius:50%;background:#4d7c0f}`,
    });
}
const _fgAt = (gs, r, c) => gs.geese.findIndex(([y, x]) => y === r && x === c);
const _fgEmpty = (gs, r, c) => _FG_ON(r, c) && _fgAt(gs, r, c) < 0 && !(gs.fox[0] === r && gs.fox[1] === c);
function _fgGooseMoves(gs, i) { const [r, c] = gs.geese[i]; return [[-1, 0], [0, -1], [0, 1]].map(([a, b]) => [r + a, c + b]).filter(([y, x]) => _fgEmpty(gs, y, x)); }
function _fgFoxMoves(gs) {   // [[r, c, jumped goose index or -1]]
    const [r, c] = gs.fox, out = [];
    for (const [a, b] of _FG_D) {
        if (_fgEmpty(gs, r + a, c + b)) out.push([r + a, c + b, -1]);
        else { const g = _fgAt(gs, r + a, c + b); if (g >= 0 && _fgEmpty(gs, r + 2 * a, c + 2 * b)) out.push([r + 2 * a, c + 2 * b, g]); }
    }
    return out;
}
function fgTap(r, c) {
    const gs = gameState.foxgeese; if (gs.over || gs.turn !== 0) return;
    const g = _fgAt(gs, r, c);
    if (g >= 0) { gs.sel = gs.sel === g ? -1 : g; gs.msg = gs.sel < 0 ? '' : _fgGooseMoves(gs, g).length ? 'Now tap a dotted point.' : 'That goose has nowhere to go (geese never step back down).'; return NK.render('foxgeese'); }
    if (gs.sel < 0) { gs.msg = 'Tap one of your geese first.'; return NK.render('foxgeese'); }
    const ok = _fgGooseMoves(gs, gs.sel).some(([y, x]) => y === r && x === c);
    if (!ok) { gs.msg = 'A goose moves one point left, right or up, onto an empty point.'; if (typeof sfxWrong === 'function') sfxWrong(); return NK.render('foxgeese'); }
    gs.geese[gs.sel] = [r, c]; gs.sel = -1; gs.gm++; if (typeof sfxFlip === 'function') sfxFlip();
    if (!_fgFoxMoves(gs).length) return _fgEnd(gs, true, 'The fox is trapped and cannot move. The geese win!');
    if (gs.gm >= gs.limit) return _fgEnd(gs, false, `${gs.limit} goose moves and the fox is still free: it slips away into the woods.`);
    gs.turn = 1; gs.msg = 'The fox is thinking...'; NK.render('foxgeese'); NK.after(800, _fgFox);
}
function _fgScore(gs) {   // fox's view: geese taken, room to move, and jumps it threatens
    const ms = _fgFoxMoves(gs); return (gs.start - gs.geese.length) * 30 + ms.length * 3 + ms.filter((m) => m[2] >= 0).length * 8 - (ms.length ? 0 : 500);
}
function _fgFox() {
    const gs = gameState.foxgeese; if (gs.over || gs.turn !== 1) return;
    let taken = 0;
    for (let chain = 0; chain < 12; chain++) {
        const ms = _fgFoxMoves(gs), jumps = ms.filter((m) => m[2] >= 0);
        if (chain > 0 && !jumps.length) break;
        let pick;
        if (jumps.length) pick = jumps[Math.floor(Math.random() * jumps.length)];
        else {
            const sim = (m) => { const save = [gs.fox, gs.geese]; gs.fox = [m[0], m[1]]; let v = _fgScore(gs);
                if (gs.diff === 'hard') { let worst = Infinity; gs.geese.forEach((_, i) => _fgGooseMoves(gs, i).forEach((to) => { const keep = gs.geese[i]; gs.geese = gs.geese.slice(); gs.geese[i] = to; worst = Math.min(worst, _fgScore(gs)); gs.geese = save[1]; void keep; })); if (worst < Infinity) v = v * 0.3 + worst; }
                [gs.fox, gs.geese] = save; return v; };
            pick = gs.diff === 'easy' && Math.random() < 0.5 ? ms[Math.floor(Math.random() * ms.length)] : ms.map((m) => [m, sim(m) + Math.random()]).sort((a, b) => b[1] - a[1])[0][0];
        }
        gs.jumps.push(gs.fox.slice()); gs.fox = [pick[0], pick[1]];
        if (pick[2] >= 0) { gs.geese.splice(pick[2], 1); taken++; } else break;
    }
    gs.last = gs.fox.slice(); if (typeof sfxFlip === 'function') sfxFlip();
    if (gs.geese.length <= 7) return _fgEnd(gs, false, `The fox has taken ${gs.start - gs.geese.length} geese. Too few are left to trap it.`);
    if (!gs.geese.some((_, i) => _fgGooseMoves(gs, i).length)) return _fgEnd(gs, false, 'The geese have no move left. The fox wins.');
    gs.turn = 0; gs.jumps = [];
    gs.msg = taken ? `The fox jumped and took ${NK.pl(taken, 'goose', 'geese')}! ${gs.geese.length} geese left.` : `The fox moved. Your turn. ${gs.geese.length} geese.`;
    NK.render('foxgeese');
}
function _fgEnd(gs, win, said) {
    gs.over = true; gs.turn = -1; gs.msg = said; NK.render('foxgeese'); if (win && typeof sfxCorrect === 'function') sfxCorrect();
    NK.finish('foxgeese', win, win ? `The fox is trapped, with ${gs.geese.length} of ${gs.start} geese still standing.` : `${said} A new hunt is one tap away.`);
}
function fgNew() { initFoxgeese(); }
function _fgView(gs) {
    const P = (v) => 8 + v * 14;   // 7 points across 8%..92%
    let lines = '';
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) { if (!_FG_ON(r, c)) continue; if (_FG_ON(r, c + 1)) lines += `<line x1="${P(c)}" y1="${P(r)}" x2="${P(c + 1)}" y2="${P(r)}"/>`; if (_FG_ON(r + 1, c)) lines += `<line x1="${P(c)}" y1="${P(r)}" x2="${P(c)}" y2="${P(r + 1)}"/>`; }
    const dots = gs.sel >= 0 && gs.turn === 0 ? _fgGooseMoves(gs, gs.sel) : [], my = gs.turn === 0 && !gs.over, bird = Icon.svg('bird', { size: '100%', sw: 2.2 });
    let pts = '', first = true;
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
        if (!_FG_ON(r, c)) continue;
        const g = _fgAt(gs, r, c), fox = gs.fox[0] === r && gs.fox[1] === c, dot = dots.some(([y, x]) => y === r && x === c);
        const inner = fox ? '<span class="fg-f" aria-hidden="true">F</span>' : g >= 0 ? `<span class="fg-g" aria-hidden="true">${bird}</span>` : dot ? '' : '<span class="fg-hole" aria-hidden="true"></span>';
        const lab = `row ${r + 1}, column ${c + 1}: ${fox ? 'the fox' : g >= 0 ? 'goose' + (gs.sel === g ? ', picked' : '') : dot ? 'empty, your goose can move here' : 'empty'}`;
        pts += `<button type="button" class="nk-cell fg-p${g >= 0 && gs.sel === g ? ' fg-sel' : ''}${dot ? ' fg-dot' : ''}${fox && gs.last ? ' fg-last' : ''}" style="left:${P(c)}%;top:${P(r)}%" onclick="fgTap(${r},${c})" data-k="p${r}_${c}"${g >= 0 && first ? ' data-first' : ''} aria-label="${lab}"${my && !fox ? '' : ' disabled'}>${inner}</button>`;
        if (g >= 0) first = false;
    }
    return `<div class="nk-top"><span>Geese: <b>${gs.geese.length}</b> of ${gs.start}</span><span>${gs.over ? 'Hunt over' : my ? 'Your move' : "The fox's move"}</span><span>Goose moves: <b>${gs.gm}</b> of ${gs.limit}</span></div>
      <div class="fg-b"><svg class="fg-svg" viewBox="0 0 100 100" aria-hidden="true"><g stroke="#4d7c0f" stroke-width="1.2" stroke-linecap="round">${lines}</g></svg>${pts}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('rotate-ccw') + 'New hunt', 'fgNew()', { k: 'restart' })}</div>`;
}
