// ═══════════════════════════════════════════════════════════════════════════════
// MATE IN ONE (2026-11, nostalgia batch 3) — the newspaper chess column's puzzle: the side to move can checkmate in
// one move. Find it. Positions come from computer self-play with this site's Chess engine and were kept only when
// there is exactly one mating move (several other legal moves always exist). Easy: endgames with few pieces.
// Normal: 8-15 pieces. Hard: 16 or more. Five puzzles a round; a wrong move is taken back. No clock.
// ═══════════════════════════════════════════════════════════════════════════════
const _M1_POS = {   // positions with exactly one mating move, found by self-play with the Chess engine
    easy: [
        "8/3Q4/1k6/8/8/8/1P6/5QK1 w - - 0 1",
        "6k1/2p5/6q1/4n3/8/4b2K/8/q7 b - - 0 1",
        "1k6/8/8/8/8/p7/7q/K7 b - - 0 1",
        "6k1/4P3/8/8/1r3p2/3q4/8/2K5 b - - 0 1",
        "4k3/8/8/8/5p2/3q4/2r5/1K6 b - - 0 1",
        "6k1/8/8/8/5p2/3q4/2r5/1K6 b - - 0 1",
        "7k/8/8/6Q1/p7/3R4/8/1K6 w - - 0 1",
        "8/6k1/7p/4nb2/8/8/7K/1qq5 b - - 0 1",
        "7k/8/4B3/8/8/P3Q3/1P6/1K6 w - - 0 1",
        "3k4/1Q6/8/5R2/6P1/8/7P/6K1 w - - 0 1",
        "6k1/R7/8/8/Q7/8/1P6/6K1 w - - 0 1",
        "1k6/8/p2q1r2/K7/8/8/8/8 b - - 0 1",
        "6k1/3R4/8/6p1/8/8/8/4R1K1 w - - 0 1",
        "6k1/8/8/4P3/8/6b1/1rP3P1/6K1 b - - 0 1",
        "7k/8/8/7p/7P/3K4/8/q3q3 b - - 0 1",
        "6k1/8/8/7K/8/8/6q1/4rq2 b - - 0 1",
        "6k1/8/8/8/7K/8/4r1q1/5q2 b - - 0 1",
        "6k1/7p/7p/4K3/1q6/3q4/2r5/8 b - - 0 1",
        "k7/2Q5/8/8/8/1B6/7P/6K1 w - - 0 1",
        "5k2/2Q5/8/4P2p/7P/8/8/6KQ w - - 0 1",
        "4N3/8/7k/7p/7P/8/1Q6/6KQ w - - 0 1",
        "4N3/7k/5Q2/7p/7P/8/8/6KQ w - - 0 1",
        "6k1/8/8/3bn3/8/K7/8/3q2q1 b - - 0 1",
        "8/1RQ4Q/4k3/8/8/8/2P5/6K1 w - - 0 1",
        "1k6/7R/5p2/8/8/8/3Q4/6K1 w - - 0 1",
        "1k6/8/8/6p1/6p1/8/4pr2/6K1 b - - 0 1",
        "8/7k/p7/8/4b3/8/7K/5q2 b - - 0 1",
        "7k/Q7/8/8/6P1/8/1P4K1/5R2 w - - 0 1",
        "6Q1/8/7k/8/1Q6/8/1P6/6K1 w - - 0 1",
        "6Q1/8/8/8/7k/8/1P6/2Q3K1 w - - 0 1",
        "6k1/8/8/7q/8/8/7q/1K2b3 b - - 0 1",
        "6k1/3R4/8/8/8/5Q1P/P7/6K1 w - - 0 1",
        "1k6/8/4qb2/8/8/5K2/8/4q3 b - - 0 1",
        "1k6/p7/r7/2p2q2/8/8/1K6/4q3 b - - 0 1",
        "1k6/8/Q7/6p1/8/8/P4B2/3R2K1 w - - 0 1",
        "1k6/8/Q7/8/P5p1/8/5B2/3R2K1 w - - 0 1",
        "6k1/p4p2/8/8/8/3R3K/6r1/4q3 b - - 0 1",
        "6k1/p2R1p2/8/8/8/7K/8/4q1r1 b - - 0 1",
        "8/p2R1pk1/8/8/8/8/7K/4q1r1 b - - 0 1",
        "7k/p4R2/8/8/8/8/7K/4q1r1 b - - 0 1"],
    normal: [
        "6k1/qp6/p4p1p/5P2/P7/7P/4r3/1K6 b - - 0 1",
        "1k6/6p1/p3p3/4p3/4b3/6P1/7K/r7 b - - 0 1",
        "Q1Q5/6k1/8/8/4BB2/5P2/P7/1K1R4 w - - 0 1",
        "7k/p4Rpp/3r4/3B4/3P4/3P4/7K/8 w - - 0 1",
        "8/8/6k1/3B4/1B5Q/8/P4R1P/2R4K w - - 0 1",
        "5rk1/p6p/p7/2P5/8/8/5p1P/7K b - - 0 1",
        "Q7/4k3/2Q5/1N6/8/4B3/6PP/6K1 w - - 0 1",
        "3k4/1Q6/8/8/8/4B3/2N2QPP/6K1 w - - 0 1",
        "6Q1/1p6/1k6/8/2B5/8/PP2p3/1K1R4 b - - 0 1",
        "5k2/R7/8/3N2p1/3PP3/3B3R/1PP2P2/3QK3 w - - 0 1",
        "2r3k1/5p1p/7p/3P4/1b2b3/8/5P2/3K4 b - - 0 1",
        "rk6/6p1/8/7p/7P/1q6/6K1/q7 b - - 0 1",
        "r4k1r/p3q2p/4b3/1p6/7P/8/2P2PP1/5KR1 b - - 0 1",
        "3Qr1k1/2R5/7p/1p6/1P4P1/8/6PP/6K1 w - - 0 1",
        "6k1/7p/1P4b1/4p3/7K/2r5/4qr2/8 b - - 0 1",
        "6Q1/5R2/3k4/2p5/2B2P2/8/1PP2P2/4K3 w - - 0 1",
        "rk6/8/p6p/3p4/3B2P1/5K1P/P1QP4/4R3 w - - 0 1",
        "4r1k1/2p2ppp/p7/8/4R3/5P1P/P1K2P2/R7 w - - 0 1",
        "4k3/rpp2p2/7p/8/1b6/1P6/2P2Pq1/3K4 b - - 0 1",
        "1k6/2p2pp1/8/1p6/1P2B1P1/6P1/R1P2P2/4K1R1 w - - 0 1",
        "2b5/1p1k1pq1/3p2pp/8/1P6/8/2r2PPP/5K1R b - - 0 1",
        "2b5/1p1k1p2/3p1qpp/8/1P3P2/8/2r3PP/5K1R b - - 0 1",
        "2b5/3k1p2/1p1p1qpp/8/1P3P2/8/2r3PP/6KR b - - 0 1",
        "8/7k/4B3/4B3/8/5Q2/1PP2P2/1RK5 w - - 0 1",
        "7k/p5pr/2p5/8/1p5B/8/PPP3PP/1R3RK1 w - - 0 1",
        "3r2k1/6p1/p7/2P4p/b7/8/5r2/7K b - - 0 1",
        "5k2/5B2/5Pp1/2P1N3/8/8/4K2P/1rB4R w - - 0 1",
        "6r1/p6k/P7/3p4/1p6/8/1r6/4K3 b - - 0 1",
        "6k1/2p1P3/Q7/8/8/2B4P/P7/6KR w - - 0 1",
        "4rkr1/6pp/p7/P1p5/5n2/8/RPP3b1/1K6 b - - 0 1",
        "4rkr1/6pp/p7/P1pb4/5n2/8/1PP5/RK6 b - - 0 1",
        "3r4/k7/7p/2P5/6P1/4b3/PP6/K7 b - - 0 1",
        "k7/4R3/5B2/8/1P5Q/8/6PP/2K5 w - - 0 1",
        "6k1/1p3p2/8/3b4/8/2b2p2/5q2/7K b - - 0 1",
        "1k2r3/2p5/7p/8/5np1/8/5r2/1K6 b - - 0 1",
        "k7/p2R1p2/P7/1P6/7p/7P/8/6K1 w - - 0 1",
        "k7/p4p2/P7/1P6/7p/7P/8/2R3K1 w - - 0 1",
        "k7/p7/P4p2/1PR5/7p/7P/8/6K1 w - - 0 1",
        "k7/p1R5/P4p2/1P6/7p/7P/8/7K w - - 0 1",
        "k7/p5R1/P7/1P3p2/7p/7P/8/7K w - - 0 1"],
    hard: [
        "r3kb1r/ppp1pppp/8/3q4/4P1bP/8/PPP2PP1/R1B1KB1R b KQkq - 0 1",
        "r2qkb1r/pp1b1ppp/2p1p3/4K3/N7/8/PPP2nPP/R1B2B1R b kq - 0 1",
        "r3qrk1/pbp2ppp/p7/8/P4B2/P4P2/2P2PPP/4R1K1 b - - 0 1",
        "r3kb1r/p1p2ppp/5p2/8/2P4P/5b2/PP3P1R/R3KB2 b Qkq - 0 1",
        "N1b1kq1r/pp2pp1p/8/7p/PP1Q4/8/2P1PPPP/1R2KB1R w K - 0 1",
        "1rb1kbnr/3p1pp1/pp1QN3/8/8/8/PPP1PPP1/R1B1KB2 w Q - 0 1",
        "r1b1kb1r/pp1p1pB1/5n2/4p3/3N4/1P6/P1P1PPP1/R2Q1K2 b kq - 0 1",
        "r1b1kb2/pp1p1p2/5B2/4p2r/3N4/1P6/P1P1PPP1/R2Q1K2 b q - 0 1",
        "r1bqk2r/ppp2ppp/8/4p3/1B6/5P2/P1P3PP/R4BKR b kq - 0 1",
        "3qk1r1/7p/bp3p2/5P2/1b6/2P3P1/P4P1P/R3K2R b KQ - 0 1",
        "r1bq1bnr/ppppkppp/8/8/P2Q1B2/2N5/1PP1PPPP/R3KB1R w KQ - 0 1",
        "5br1/kp2ppp1/4b3/4P2p/8/6P1/P2q2P1/RK6 b - - 0 1",
        "2bqk2r/2p2p1p/8/1P2b3/2P1p3/8/1P2KPPP/r4B1R b k - 0 1",
        "2bq1rk1/1p4bp/6p1/4p3/3pP3/P5K1/2P3NP/2R2B1R b - - 0 1",
        "6kr/p1p4p/8/3PP3/1p6/1P6/P1P2Q1P/1RK4R w - - 0 1",
        "r1b1kb1r/pp2pppp/8/3n4/3PP3/5N2/P3KPPP/R1q2B1R b kq - 0 1",
        "2b1kb1r/2q2ppp/5n2/1p1Pp3/8/8/1P1NPPPP/4KB1R b Kk - 0 1",
        "q4rk1/2p5/3b1pp1/pp6/5NN1/1P6/P1PPPP2/2RQK3 b - - 0 1",
        "6k1/2p5/3b1rp1/pp6/4qN2/1P6/P1PPPP2/R2QK3 b - - 0 1",
        "4kb1r/2pbpppp/4q3/1B6/8/5P1P/RPP2PPR/5K2 w k - 0 1",
        "1rb2bnQ/ppp1p1p1/4kp2/8/1P6/6P1/P1P1PP1P/q1B1KBNR b K - 0 1",
        "r2qk2r/ppp2pp1/4P2p/8/6b1/4n3/1BP2PPP/1R2KB1R b Kkq - 0 1",
        "r1bqkb1r/pp3ppp/2p1p3/6B1/N2Qp3/8/PPP1P1PP/R3KBNR w KQkq - 0 1",
        "r3k2r/p1b2pp1/1p2p2p/P3q2P/8/8/2P2P2/7K b kq - 0 1",
        "r2k1b1r/pp1bppp1/5N1p/8/8/8/PPP1PPPP/R1BQKB1R w KQ - 0 1",
        "rk3b1r/pp1Qppp1/5N1p/8/8/6P1/PPP1PP1P/R1B1KB1R w KQ - 0 1"],
};
// "One Move to Mate": a round of five puzzles. Uses the Chess game's rules engine (js/games/chess.js), loaded first.
function initMate1() {
    const go = () => NK.start('mate1', {
        setup(gs, diff) {
            gs.diff = diff; gs.list = shuffle(_M1_POS[diff].slice()).slice(0, 5); gs.k = 0; gs.tries = 0; gs.misses = 0; gs.hints = 0; gs.over = false;
            _m1Load(gs);
        },
        view: _m1View,
        keys: { KeyH: () => m1Hint() },
        rules: (gs) => [
            'Each puzzle is a real position from a game. The side to move can give <b>checkmate in one move</b>: find it.',
            'The side to move is always at the bottom of the board, and the line above the board says whether that is White or Black.',
            'Tap a piece, then a dotted square. A move that is not mate is taken back, and you can try again.',
            'Checkmate: the king is attacked and has no way out: it cannot move, nothing can block, and the attacker cannot be taken.',
            `Five puzzles a round. ${gs.diff === 'easy' ? 'Easy puzzles have few pieces on the board.' : gs.diff === 'hard' ? 'Hard puzzles come from busy middle games.' : 'Normal puzzles come from late in the game.'} Hint shows which piece moves. No clock. Keyboard: arrow keys and Enter, H for a hint.`],
        css: `.m1-wrap{max-width:min(100%,32rem,max(18rem,calc(100vh - 320px)));margin:0 auto}
.m1-board{display:grid;grid-template-columns:repeat(8,1fr);border:6px solid #6b4220;border-radius:10px;overflow:hidden}
.m1-sq{aspect-ratio:1;border:0;padding:0;display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer;--nk-r:0;min-width:0}
.m1-l{background:#f3e2c2}.m1-d{background:#b07b4f}
.m1-sq:disabled{cursor:default}
.m1-sel{box-shadow:inset 0 0 0 4px #1d4ed8}
.m1-hint{box-shadow:inset 0 0 0 4px #f59e0b}
.m1-last{background-image:linear-gradient(rgba(250,204,21,.45),rgba(250,204,21,.45))}
.m1-chk{box-shadow:inset 0 0 0 5px #dc2626}
.m1-mate{box-shadow:inset 0 0 0 6px #dc2626;background-image:linear-gradient(rgba(220,38,38,.25),rgba(220,38,38,.25))}
.m1-dot::before{content:"";position:absolute;width:28%;height:28%;border-radius:50%;background:rgba(21,128,61,.75)}
.m1-cap::before{content:"";position:absolute;inset:6%;border-radius:50%;border:4px solid rgba(21,128,61,.8)}
.m1-sq .ch-pc{width:86%;height:86%;position:relative}
.m1-sq .ch-wp{fill:#fffdf7;stroke:#1d1712;stroke-width:1.6}.m1-sq .ch-wp .e{fill:none;stroke:#1d1712}
.m1-sq .ch-bp{fill:#2b1f17;stroke:#fffaf1;stroke-width:1.2}.m1-sq .ch-bp .e{fill:none;stroke:#fffaf1}
.m1-files{display:grid;grid-template-columns:repeat(8,1fr);text-align:center;font-weight:800;color:#6b4220;margin-top:2px}
.m1-side{display:flex;align-items:center;justify-content:center;gap:8px;font-weight:800;font-size:1.15rem;margin:0 0 6px}
.m1-side i{display:inline-block;width:18px;height:18px;border-radius:50%;border:2px solid #1d1712}
.m1-dots{display:flex;gap:6px;justify-content:center}.m1-dots i{width:14px;height:14px;border-radius:50%;background:#e7e5e4;border:2px solid #a8a29e}.m1-dots i.m1-ok{background:#16a34a;border-color:#14532d}.m1-dots i.m1-now{border-color:#b45309;background:#fde68a}`,
    });
    if (typeof _chLegal === 'function') return go();
    return ensureGameLoaded('chess').then((ok) => { if (ok) go(); });
}
function _m1Load(gs) {
    gs.S = _chFromFen(gs.list[gs.k]); gs.sel = -1; gs.solved = false; gs.last = null; gs.hint = -1;
    gs.mates = _chLegal(gs.S).filter((m) => { const N = _chApply(gs.S, m); return _chInCheck(N, N.t) && !_chLegal(N).length; });
    gs.msg = `Puzzle ${gs.k + 1} of 5. ${gs.S.t === 'w' ? 'White' : 'Black'} to move and checkmate in one.`;
}
const _m1View = (gs) => {
    const S = gs.S, flip = S.t === 'b', my = !gs.over && !gs.solved;
    const legal = gs.sel >= 0 ? _chLegal(S).filter((m) => m.f === gs.sel) : [];
    const chk = _chInCheck(S, S.t) ? _chKing(S.b, S.t) : -1, mate = gs.solved ? _chKing(S.b, S.t) : -1;
    const side = (p) => (p === p.toUpperCase() ? 'w' : 'b');
    let sq = '';
    for (let v = 0; v < 64; v++) {
        const i = flip ? 63 - v : v, p = S.b[i], r = i >> 3, c = i & 7, lg = legal.find((m) => m.t === i);
        const cls = 'nk-cell m1-sq ' + ((r + c) % 2 ? 'm1-d' : 'm1-l') + (gs.sel === i ? ' m1-sel' : '') + (gs.hint === i && gs.sel !== i ? ' m1-hint' : '') + (gs.last && (gs.last.f === i || gs.last.t === i) ? ' m1-last' : '') + (mate === i ? ' m1-mate' : chk === i ? ' m1-chk' : '') + (lg ? (p || lg.ep ? ' m1-cap' : ' m1-dot') : '');
        const lab = `${_chSq(i)}${p ? ', ' + (side(p) === 'w' ? 'white ' : 'black ') + _CH_NAME[p.toLowerCase()] : ''}${lg ? ', you can move here' : ''}${mate === i ? ', checkmated' : ''}`;
        sq += `<button type="button" class="${cls}" onclick="m1Tap(${i})" data-k="q${i}"${v === 52 ? ' data-first' : ''} aria-label="${lab}"${my ? '' : ' disabled'}>${p ? _chPiece(p) : ''}</button>`;
    }
    const files = (flip ? 'hgfedcba' : 'abcdefgh').split('').map((x) => `<span>${x}</span>`).join('');
    const dots = gs.list.map((_, k) => `<i class="${k < gs.k || (k === gs.k && gs.solved) ? 'm1-ok' : k === gs.k ? 'm1-now' : ''}"></i>`).join('');
    return `<div class="nk-top"><span>Puzzle <b>${gs.k + 1}</b> of 5</span><span class="m1-dots" role="img" aria-label="${gs.k + (gs.solved ? 1 : 0)} of 5 solved">${dots}</span><span>Hints: <b>${gs.hints}</b></span></div>
      <div class="m1-side"><i style="background:${S.t === 'w' ? '#fffdf7' : '#2b1f17'}"></i>${S.t === 'w' ? 'White' : 'Black'} to move: mate in one</div>
      <div class="m1-wrap"><div class="m1-board">${sq}</div><div class="m1-files" aria-hidden="true">${files}</div></div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${gs.solved && !gs.over ? NK.btn(NK.icon('arrow-right') + 'Next puzzle', 'm1Next()', { k: 'next', cls: 'gk-primary' }) : NK.btn(NK.icon('lightbulb') + 'Hint', 'm1Hint()', { k: 'hint', disabled: !my })}${NK.btn(NK.icon('rotate-ccw') + 'New round', 'm1New()', { k: 'restart' })}</div>`;
};
function m1Tap(i) {
    const gs = gameState.mate1; if (gs.over || gs.solved) return; const S = gs.S, p = S.b[i], mine = p && (p === p.toUpperCase() ? 'w' : 'b') === S.t;
    if (gs.sel >= 0 && !mine) {
        const ms = _chLegal(S).filter((m) => m.f === gs.sel && m.t === i);
        if (!ms.length) { gs.sel = -1; gs.msg = 'That piece cannot move there.'; return NK.render('mate1'); }
        gs.tries++;
        const win = ms.find((m) => gs.mates.includes(m)) || gs.mates.find((m) => m.f === gs.sel && m.t === i);
        if (win) {
            gs.S = _chApply(S, win); gs.last = win; gs.solved = true; gs.sel = -1; if (typeof sfxCorrect === 'function') sfxCorrect();
            gs.msg = `Checkmate! ${_CH_NAME[S.b[win.f].toLowerCase()].replace(/^./, (x) => x.toUpperCase())} to ${_chSq(win.t)}.`;
            if (gs.k === 4) { gs.over = true; NK.render('mate1'); return NK.finish('mate1', true, `All five mates found${gs.misses ? ` (${NK.pl(gs.misses, 'try', 'tries')} that were not mate)` : ' on the first try each time'}${gs.hints ? `, ${NK.pl(gs.hints, 'hint')}` : ''}.`); }
            return NK.render('mate1');
        }
        const N = _chApply(S, ms[0]); gs.misses++; gs.sel = -1; if (typeof sfxWrong === 'function') sfxWrong();
        gs.msg = _chInCheck(N, N.t) ? 'That is check, but the king can still escape. Try again.' : 'That is not even check. Try again: look for a move that attacks the king.';
        return NK.render('mate1');
    }
    if (mine) { gs.sel = gs.sel === i ? -1 : i; const n = gs.sel >= 0 ? _chLegal(S).filter((m) => m.f === i).length : 0; gs.msg = gs.sel < 0 ? '' : n ? `${_CH_NAME[p.toLowerCase()].replace(/^./, (x) => x.toUpperCase())} picked: tap a dotted square.` : 'That piece has no legal moves.'; return NK.render('mate1'); }
    gs.msg = `Pick one of the ${S.t === 'w' ? 'white' : 'black'} pieces first.`; NK.render('mate1');
}
function m1Hint() { const gs = gameState.mate1; if (gs.over || gs.solved) return; gs.hint = gs.mates[0].f; gs.hints++; gs.msg = `Hint: the ${_CH_NAME[gs.S.b[gs.hint].toLowerCase()]} on ${_chSq(gs.hint)} gives the mate.`; NK.render('mate1'); }
function m1Next() { const gs = gameState.mate1; if (gs.over || !gs.solved) return; gs.k++; _m1Load(gs); NK.render('mate1'); }
function m1New() { initMate1(); }
