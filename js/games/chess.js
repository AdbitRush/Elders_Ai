// ═══════════════════════════════════════════════════════════════════════════════
// CHESS (2026-11, nostalgia batch 2) — park-bench and kitchen-table chess against a patient computer. No clock.
// Full rules: castling, en passant, promotion (you choose the piece), check, checkmate, stalemate, the 50-move rule,
// threefold repetition and insufficient material. You play white and move first. "Take back" undoes your last
// move (and the computer's reply) as often as you like. Legal squares are dotted once a piece is picked.
// The pieces are simple original drawings (SVG), not a font.
// Computer: easy searches 1 move ahead and often plays a random reasonable move; normal 2 moves; hard 3 moves
// plus captures to the end of an exchange. The move generator is checked against the standard "perft" counts
// (tools/preview/chess-perft.js).
// Squares: 0 = a8 ... 63 = h1. Pieces: 'PNBRQK' white, 'pnbrqk' black, '' empty.
// ═══════════════════════════════════════════════════════════════════════════════
const _CH_N = [-17, -15, -10, -6, 6, 10, 15, 17], _CH_K = [-9, -8, -7, -1, 1, 7, 8, 9];
const _CH_V = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
// simple piece-square bonus (white's view, a8 first)
const _CH_PST = {
    p: [0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0],
    n: [-50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50],
    b: [-20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10, -10, -10, -10, -10, -10, -20],
    r: [0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0],
    q: Array(64).fill(0), k: [-30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20],
};
const _chW = (p) => p && p === p.toUpperCase();
const _chCol = (p) => (!p ? '' : _chW(p) ? 'w' : 'b');
function _chStart() {
    const r = 'rnbqkbnr'.split('');
    return { b: [...r, ...Array(8).fill('p'), ...Array(32).fill(''), ...Array(8).fill('P'), ...r.map((x) => x.toUpperCase())], t: 'w', c: 'KQkq', ep: -1, hm: 0, fm: 1 };
}
function _chFromFen(f) {
    const [pos, t, c, ep, hm, fm] = f.split(' '), b = [];
    for (const ch of pos.replace(/\//g, '')) { if (/\d/.test(ch)) for (let i = 0; i < +ch; i++) b.push(''); else b.push(ch); }
    const sq = (s) => (s === '-' ? -1 : (8 - +s[1]) * 8 + s.charCodeAt(0) - 97);
    return { b, t, c: c === '-' ? '' : c, ep: sq(ep), hm: +hm || 0, fm: +fm || 1 };
}
// is square s attacked by side `by`?
function _chAttacked(b, s, by) {
    const r = s >> 3, c = s & 7, W = by === 'w';
    const pr = r + (W ? 1 : -1);   // a white pawn attacks upward (from a larger row number)
    if (pr >= 0 && pr < 8) for (const dc of [-1, 1]) { const cc = c + dc; if (cc >= 0 && cc < 8 && b[pr * 8 + cc] === (W ? 'P' : 'p')) return true; }
    for (const [dr, dc] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) { const rr = r + dr, cc = c + dc; if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && b[rr * 8 + cc] === (W ? 'N' : 'n')) return true; }
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { if (!dr && !dc) continue; const rr = r + dr, cc = c + dc; if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && b[rr * 8 + cc] === (W ? 'K' : 'k')) return true; }
    for (const [dr, dc, kinds] of [[-1, 0, 'rq'], [1, 0, 'rq'], [0, -1, 'rq'], [0, 1, 'rq'], [-1, -1, 'bq'], [-1, 1, 'bq'], [1, -1, 'bq'], [1, 1, 'bq']]) {
        let rr = r + dr, cc = c + dc;
        while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) { const p = b[rr * 8 + cc]; if (p) { if (_chCol(p) === by && kinds.includes(p.toLowerCase())) return true; break; } rr += dr; cc += dc; }
    }
    return false;
}
function _chPseudo(S) {
    const b = S.b, me = S.t, out = [], add = (f, t, x) => out.push(Object.assign({ f, t }, x || {}));
    for (let s = 0; s < 64; s++) {
        const p = b[s]; if (!p || _chCol(p) !== me) continue;
        const k = p.toLowerCase(), r = s >> 3, c = s & 7;
        if (k === 'p') {
            const d = me === 'w' ? -1 : 1, r1 = r + d, last = me === 'w' ? 0 : 7, startR = me === 'w' ? 6 : 1;
            const push = (t, x) => { if ((t >> 3) === last) ['q', 'r', 'b', 'n'].forEach((q) => add(s, t, Object.assign({ pr: q }, x))); else add(s, t, x); };
            if (r1 >= 0 && r1 < 8 && !b[r1 * 8 + c]) { push(r1 * 8 + c); if (r === startR && !b[(r + 2 * d) * 8 + c]) add(s, (r + 2 * d) * 8 + c, { dbl: 1 }); }
            for (const dc of [-1, 1]) { const cc = c + dc; if (cc < 0 || cc > 7 || r1 < 0 || r1 > 7) continue; const t = r1 * 8 + cc; if (b[t] && _chCol(b[t]) !== me) push(t, { x: 1 }); else if (t === S.ep) add(s, t, { ep: 1, x: 1 }); }
        } else if (k === 'n' || k === 'k') {
            const D = k === 'n' ? [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]] : [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
            for (const [dr, dc] of D) { const rr = r + dr, cc = c + dc; if (rr < 0 || rr > 7 || cc < 0 || cc > 7) continue; const t = rr * 8 + cc; if (!b[t] || _chCol(b[t]) !== me) add(s, t, b[t] ? { x: 1 } : null); }
            if (k === 'k') {
                const W = me === 'w', home = W ? 60 : 4, o = W ? 'b' : 'w';
                if (s === home && !_chAttacked(b, home, o)) {
                    if (S.c.includes(W ? 'K' : 'k') && !b[home + 1] && !b[home + 2] && b[home + 3] === (W ? 'R' : 'r') && !_chAttacked(b, home + 1, o) && !_chAttacked(b, home + 2, o)) add(s, home + 2, { cs: 'k' });
                    if (S.c.includes(W ? 'Q' : 'q') && !b[home - 1] && !b[home - 2] && !b[home - 3] && b[home - 4] === (W ? 'R' : 'r') && !_chAttacked(b, home - 1, o) && !_chAttacked(b, home - 2, o)) add(s, home - 2, { cs: 'q' });
                }
            }
        } else {
            const D = k === 'b' ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] : k === 'r' ? [[-1, 0], [1, 0], [0, -1], [0, 1]] : [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]];
            for (const [dr, dc] of D) { let rr = r + dr, cc = c + dc; while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) { const t = rr * 8 + cc; if (b[t]) { if (_chCol(b[t]) !== me) add(s, t, { x: 1 }); break; } add(s, t); rr += dr; cc += dc; } }
        }
    }
    return out;
}
function _chApply(S, m) {
    const b = S.b.slice(), p = b[m.f], W = S.t === 'w';
    b[m.t] = m.pr ? (W ? m.pr.toUpperCase() : m.pr) : p; b[m.f] = '';
    if (m.ep) b[m.t + (W ? 8 : -8)] = '';
    if (m.cs === 'k') { b[m.t - 1] = b[m.t + 1]; b[m.t + 1] = ''; }
    if (m.cs === 'q') { b[m.t + 1] = b[m.t - 2]; b[m.t - 2] = ''; }
    let c = S.c;
    const strip = (x) => (c = c.replace(x, ''));
    if (p === 'K') { strip('K'); strip('Q'); } if (p === 'k') { strip('k'); strip('q'); }
    [[63, 'K'], [56, 'Q'], [7, 'k'], [0, 'q']].forEach(([sq, f]) => { if (m.f === sq || m.t === sq) strip(f); });
    return { b, t: W ? 'b' : 'w', c, ep: m.dbl ? (m.f + m.t) / 2 : -1, hm: p.toLowerCase() === 'p' || m.x ? 0 : S.hm + 1, fm: S.fm + (W ? 0 : 1) };
}
const _chKing = (b, side) => b.indexOf(side === 'w' ? 'K' : 'k');
const _chInCheck = (S, side) => _chAttacked(S.b, _chKing(S.b, side), side === 'w' ? 'b' : 'w');
function _chLegal(S) { return _chPseudo(S).filter((m) => !_chInCheck(_chApply(S, m), S.t)); }
function _chPerft(S, d) { if (!d) return 1; let n = 0; for (const m of _chLegal(S)) n += _chPerft(_chApply(S, m), d - 1); return n; }
const _chKey = (S) => S.b.map((x) => x || '.').join('') + S.t + S.c + S.ep;
function _chEval(S) {
    let s = 0;
    for (let i = 0; i < 64; i++) { const p = S.b[i]; if (!p) continue; const k = p.toLowerCase(), v = _CH_V[k] + _CH_PST[k][_chW(p) ? i : (7 - (i >> 3)) * 8 + (i & 7)]; s += _chW(p) ? v : -v; }
    return S.t === 'w' ? s : -s;   // from the side to move
}
function _chOrder(S, ms) { return ms.map((m) => [m, (m.x ? 10 * _CH_V[(S.b[m.t] || 'p').toLowerCase()] - _CH_V[S.b[m.f].toLowerCase()] : 0) + (m.pr ? 800 : 0)]).sort((a, b) => b[1] - a[1]).map((x) => x[0]); }
function _chQuiet(S, a, z, d) {
    const st = _chEval(S); if (st >= z) return st; if (st > a) a = st; if (d <= 0) return a;
    for (const m of _chOrder(S, _chLegal(S).filter((m) => m.x || m.pr))) { const v = -_chQuiet(_chApply(S, m), -z, -a, d - 1); if (v >= z) return v; if (v > a) a = v; }
    return a;
}
function _chSearch(S, d, a, z, q) {
    const ms = _chLegal(S);
    if (!ms.length) return { v: _chInCheck(S, S.t) ? -100000 - d : 0 };
    if (d === 0) return { v: q ? _chQuiet(S, a, z, 4) : _chEval(S) };
    let best = { v: -1e9, m: ms[0] };
    for (const m of _chOrder(S, ms)) {
        const v = -_chSearch(_chApply(S, m), d - 1, -z, -a, q).v;
        if (v > best.v) best = { v, m };
        if (v > a) a = v; if (a >= z) break;
    }
    return best;
}
function _chInsufficient(b) { const p = b.filter(Boolean).map((x) => x.toLowerCase()).filter((x) => x !== 'k'); return !p.length || (p.length === 1 && (p[0] === 'n' || p[0] === 'b')); }
// --- pieces: small original SVG drawings (viewBox 0 0 40 40) ---
const _CH_SVG = {
    p: '<circle cx="20" cy="13" r="6"/><path d="M14 21 h12 l3 11 h-18 z"/><rect x="9" y="32" width="22" height="4" rx="1.5"/>',
    r: '<path d="M11 8 h4 v4 h3 v-4 h4 v4 h3 v-4 h4 v8 l-3 3 v11 h-15 v-11 l-3 -3 z"/><rect x="8" y="32" width="24" height="4" rx="1.5"/>',
    n: '<path d="M13 32 c-1 -6 2 -10 6 -13 l-7 2 c-2 -1 -2 -3 0 -5 l7 -7 c2 -3 6 -3 8 -1 c5 4 6 12 4 24 z"/><circle cx="21" cy="12" r="1.6" class="e"/><rect x="9" y="32" width="22" height="4" rx="1.5"/>',
    b: '<path d="M20 5 c5 5 8 10 6 15 c-1 3 -3 4 -6 4 c-3 0 -5 -1 -6 -4 c-2 -5 1 -10 6 -15 z"/><path d="M15 26 h10 l2 6 h-14 z"/><rect x="9" y="32" width="22" height="4" rx="1.5"/><path d="M20 10 v8 M16.5 14 h7" class="e"/>',
    q: '<path d="M8 13 l5 13 h14 l5 -13 l-7 6 l-5 -11 l-5 11 z"/><circle cx="8" cy="12" r="2.4"/><circle cx="32" cy="12" r="2.4"/><circle cx="20" cy="6" r="2.4"/><path d="M12 26 h16 l1 6 h-18 z"/><rect x="8" y="32" width="24" height="4" rx="1.5"/>',
    k: '<path d="M18 3 h4 v4 h4 v4 h-4 v4 h-4 v-4 h-4 v-4 h4 z"/><path d="M10 18 c0 -4 20 -4 20 0 l-3 10 h-14 z"/><path d="M12 28 h16 l1 4 h-18 z"/><rect x="8" y="32" width="24" height="4" rx="1.5"/>',
};
const _chPiece = (p) => `<svg viewBox="0 0 40 40" class="ch-pc ${_chW(p) ? 'ch-wp' : 'ch-bp'}" aria-hidden="true">${_CH_SVG[p.toLowerCase()]}</svg>`;
const _CH_NAME = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
const _chSq = (i) => 'abcdefgh'[i & 7] + (8 - (i >> 3));
function initChess() {
    NK.start('chess', {
        setup(gs, diff) {
            gs.diff = diff; gs.S = _chStart(); gs.hist = []; gs.reps = {}; gs.reps[_chKey(gs.S)] = 1;
            gs.sel = -1; gs.last = null; gs.over = false; gs.promo = null; gs.thinking = false; gs.mine = 0;
            gs.msg = 'You play white. Tap a piece, then a dotted square.';
        },
        view: _chView,
        keys: { KeyT: () => chUndo() },
        rules: [
            'You play <b>white</b> (from the bottom) and move first. Tap one of your pieces: the squares it may move to are dotted. Tap one to move.',
            'All the usual rules apply: castling (move the king two squares toward a rook), en passant, and promotion - when a pawn reaches the far side you pick its new piece.',
            'A king in <b>check</b> is ringed in red; you must get out of check. Checkmate wins. Stalemate, three repetitions of a position, 50 moves without a capture or pawn move, or too few pieces to mate are draws.',
            '<b>Take back</b> undoes your last move and the computer\'s reply, as often as you like. There is no clock.',
            'Keyboard: arrow keys move around the board, Enter picks and moves, T takes back.'],
        css: `.ch-wrap{max-width:min(100%,32rem,max(18rem,calc(100vh - 300px)));margin:0 auto}
.ch-board{display:grid;grid-template-columns:repeat(8,1fr);border:6px solid #6b4220;border-radius:10px;overflow:hidden}
.ch-sq{aspect-ratio:1;border:0;padding:0;display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer;--nk-r:0;min-width:0}
.ch-l{background:#f3e2c2}.ch-d{background:#b07b4f}
.ch-sq:disabled{cursor:default}
.ch-sel{box-shadow:inset 0 0 0 4px #1d4ed8}
.ch-last{background-image:linear-gradient(rgba(250,204,21,.45),rgba(250,204,21,.45))}
.ch-chk{box-shadow:inset 0 0 0 5px #dc2626}
.ch-dot::before{content:"";position:absolute;width:28%;height:28%;border-radius:50%;background:rgba(21,128,61,.75)}
.ch-cap::before{content:"";position:absolute;inset:6%;border-radius:50%;border:4px solid rgba(21,128,61,.8)}
.ch-pc{width:86%;height:86%;position:relative}
.ch-wp{fill:#fffdf7;stroke:#1d1712;stroke-width:1.6}.ch-wp .e{fill:none;stroke:#1d1712}
.ch-bp{fill:#2b1f17;stroke:#fffaf1;stroke-width:1.2}.ch-bp .e{fill:none;stroke:#fffaf1}
.ch-files{display:grid;grid-template-columns:repeat(8,1fr);text-align:center;font-weight:800;color:#4a3420;margin-top:2px}
.ch-promo{display:flex;gap:8px;justify-content:center;margin:10px 0}
.ch-promo .gk-btn{padding:4px 10px}.ch-promo svg{width:40px;height:40px}
.ch-cap-row{display:flex;flex-wrap:wrap;gap:2px;min-height:26px;align-items:center}.ch-cap-row svg{width:24px;height:24px}`,
    });
}
function _chTaken(gs) {
    const start = 'rnbqkbnrppppppppPPPPPPPPRNBQKBNR'.split(''), have = gs.S.b.filter(Boolean), out = { w: [], b: [] };
    const cnt = {}; have.forEach((p) => (cnt[p] = (cnt[p] || 0) + 1));
    const left = {}; start.forEach((p) => (left[p] = (left[p] || 0) + 1));
    Object.keys(left).forEach((p) => { const miss = left[p] - (cnt[p] || 0); for (let i = 0; i < miss; i++) (_chW(p) ? out.w : out.b).push(p); });
    return out;
}
function _chView(gs) {
    const S = gs.S, my = S.t === 'w' && !gs.over && !gs.thinking && !gs.promo;
    const legal = gs.sel >= 0 ? _chLegal(S).filter((m) => m.f === gs.sel) : [];
    const chk = _chInCheck(S, S.t) ? _chKing(S.b, S.t) : -1;
    let sq = '';
    for (let i = 0; i < 64; i++) {
        const p = S.b[i], r = i >> 3, c = i & 7, lg = legal.find((m) => m.t === i);
        const cls = 'nk-cell ch-sq ' + ((r + c) % 2 ? 'ch-d' : 'ch-l') + (gs.sel === i ? ' ch-sel' : '') + (gs.last && (gs.last.f === i || gs.last.t === i) ? ' ch-last' : '') + (chk === i ? ' ch-chk' : '') + (lg ? (p || lg.ep ? ' ch-cap' : ' ch-dot') : '');
        const lab = `${_chSq(i)}${p ? ', ' + (_chW(p) ? 'white ' : 'black ') + _CH_NAME[p.toLowerCase()] : ''}${lg ? ', you can move here' : ''}${chk === i ? ', in check' : ''}`;
        sq += `<button type="button" class="${cls}" onclick="chTap(${i})" data-k="q${i}"${i === 52 ? ' data-first' : ''} aria-label="${lab}"${my ? '' : ' disabled'}>${p ? _chPiece(p) : ''}</button>`;
    }
    const tk = _chTaken(gs);
    const promo = gs.promo ? `<div class="ch-promo" role="group" aria-label="choose the new piece">${['q', 'r', 'b', 'n'].map((q) => NK.btn(_chPiece(q.toUpperCase()) + _CH_NAME[q], `chPromo('${q}')`, { k: 'pr' + q })).join('')}</div>` : '';
    return `<div class="nk-top"><span>${gs.over ? 'Game over' : gs.thinking ? "Computer's move..." : S.t === 'w' ? 'Your move (white)' : "Computer's move"}</span><span>Move ${S.fm}</span></div>
      <div class="ch-cap-row" aria-label="pieces you have taken">${tk.b.map(_chPiece).join('')}</div>
      <div class="ch-wrap"><div class="ch-board">${sq}</div><div class="ch-files" aria-hidden="true">${'abcdefgh'.split('').map((x) => `<span>${x}</span>`).join('')}</div></div>
      <div class="ch-cap-row" aria-label="pieces the computer has taken">${tk.w.map(_chPiece).join('')}</div>
      ${promo}${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('undo-2') + 'Take back', 'chUndo()', { k: 'undo', disabled: !gs.hist.length || gs.thinking || gs.over })}${NK.btn(NK.icon('rotate-ccw') + 'New game', 'chRestart()', { k: 'restart' })}</div>`;
}
function chRestart() { initChess(); }
function chTap(i) {
    const gs = gameState.chess, S = gs.S; if (gs.over || gs.thinking || gs.promo || S.t !== 'w') return;
    const p = S.b[i];
    if (gs.sel >= 0) {
        const ms = _chLegal(S).filter((m) => m.f === gs.sel && m.t === i);
        if (ms.length) {
            if (ms.length > 1) { gs.promo = ms; gs.msg = 'Your pawn reached the far side. Choose its new piece.'; return NK.render('chess'); }
            _chMine(); return _chMove(ms[0]);
        }
    }
    if (p && _chW(p)) {
        const n = _chLegal(S).filter((m) => m.f === i).length;
        gs.sel = gs.sel === i ? -1 : i;
        gs.msg = gs.sel < 0 ? 'Tap a piece to move.' : n ? `Your ${_CH_NAME[p.toLowerCase()]} on ${_chSq(i)}: tap a dotted square.` : `The ${_CH_NAME[p.toLowerCase()]} on ${_chSq(i)} has no legal move${_chInCheck(S, 'w') ? ' - your king is in check' : ''}.`;
        return NK.render('chess');
    }
    gs.msg = gs.sel >= 0 ? 'That move is not allowed. The dotted squares are the choices.' : 'Tap one of your white pieces first.';
    NK.render('chess');
}
function _chMine() { const gs = gameState.chess; gs.mine = (gs.mine || 0) + 1; }
function chPromo(q) { const gs = gameState.chess; if (!gs.promo) return; const m = gs.promo.find((x) => x.pr === q); gs.promo = null; if (m) { _chMine(); _chMove(m); } }
function _chMove(m) {
    const gs = gameState.chess;
    gs.hist.push({ S: gs.S, last: gs.last, reps: Object.assign({}, gs.reps) });
    const mover = gs.S.b[m.f], cap = m.ep ? 'p' : gs.S.b[m.t];
    gs.S = _chApply(gs.S, m); gs.last = m; gs.sel = -1;
    gs.reps[_chKey(gs.S)] = (gs.reps[_chKey(gs.S)] || 0) + 1;
    if (typeof sfxFlip === 'function') sfxFlip();
    const who = _chW(mover) ? 'You' : 'The computer';
    let t = `${who} moved the ${_CH_NAME[mover.toLowerCase()]} ${_chSq(m.f)} to ${_chSq(m.t)}${cap ? ` and took a ${_CH_NAME[cap.toLowerCase()]}` : ''}${m.cs ? ' (castling)' : ''}${m.pr ? ` - promoted to a ${_CH_NAME[m.pr]}` : ''}.`;
    if (_chEnd(t)) return;
    if (_chInCheck(gs.S, gs.S.t)) t += gs.S.t === 'w' ? ' Your king is in check!' : ' Check!';
    if (gs.S.t === 'b') { gs.thinking = true; gs.msg = t + ' The computer is thinking...'; NK.render('chess'); return NK.after(350, _chCpu); }
    gs.msg = t + ' Your move.'; NK.render('chess');
}
function _chEnd(t) {
    const gs = gameState.chess, S = gs.S, ms = _chLegal(S);
    let res = null;
    if (!ms.length) res = _chInCheck(S, S.t) ? (S.t === 'b' ? ['win', 'Checkmate - you win!'] : ['lose', 'Checkmate - the computer wins.']) : ['draw', 'Stalemate: no legal move, but no check. A draw.'];
    else if (gs.reps[_chKey(S)] >= 3) res = ['draw', 'The same position came up three times: a draw.'];
    else if (S.hm >= 100) res = ['draw', '50 moves each with no capture or pawn move: a draw.'];
    else if (_chInsufficient(S.b)) res = ['draw', 'Not enough pieces left to checkmate: a draw.'];
    if (!res) return false;
    gs.over = true; gs.thinking = false; gs.msg = t + ' ' + res[1]; NK.render('chess');
    if (res[0] === 'win' && typeof sfxCorrect === 'function') sfxCorrect();
    NK.finish('chess', res[0] === 'win', res[0] === 'win' ? `Checkmate after ${NK.pl(gs.mine, 'move')} of yours!` : res[1] + (res[0] === 'lose' ? ' Take your time next game - there is no clock.' : ''));
    return true;
}
function _chCpu() {
    const gs = gameState.chess; if (gs.over || gs.S.t !== 'b') return;
    const S = gs.S, ms = _chLegal(S);
    let m;
    if (gs.diff === 'easy' && Math.random() < 0.4) { const caps = ms.filter((x) => x.x); m = (caps.length && Math.random() < .5 ? caps : ms)[Math.floor(Math.random() * (caps.length && Math.random() < .5 ? caps.length : ms.length))] || ms[0]; }
    else m = _chSearch(S, gs.diff === 'easy' ? 1 : gs.diff === 'hard' ? 3 : 2, -1e9, 1e9, gs.diff === 'hard').m;
    if (!m) m = ms[0];
    gs.thinking = false;
    _chMove(m);
}
function chUndo() {
    const gs = gameState.chess; if (gs.thinking || gs.over || !gs.hist.length) return;
    // back to the last position where it was your move
    let h = gs.hist.pop(); while (h.S.t !== 'w' && gs.hist.length) h = gs.hist.pop();
    gs.S = h.S; gs.last = h.last; gs.reps = h.reps; gs.sel = -1; gs.promo = null; gs.over = false; gs.mine = Math.max(0, (gs.mine || 0) - 1);
    gs.msg = 'Move taken back. Your move.'; NK.render('chess');
}
