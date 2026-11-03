// ═══════════════════════════════════════════════════════════════════════════════
// BACKGAMMON vs COMPUTER (2026-10, wave 1) — standard rules, no doubling cube.
// You move from point 24 down to 1 and bear off from your home (1-6); the computer moves the other way.
// Legal moves follow the rules: enter from the bar first, a point with 2+ opposing checkers is blocked, a single
// opposing checker (a blot) is hit to the bar, bear off only with all 15 home, use both dice when you can (all four on
// doubles), and when only one die can be played it must be the larger. Roll, tap a checker, tap a highlighted point.
// ═══════════════════════════════════════════════════════════════════════════════
function initBackgammon(container) {
    GameKit.css();
    const gs = gameState.backgammon;
    const pts = Array(26).fill(0);   // 1..24; >0 = your checkers, <0 = the computer's
    pts[24] = 2; pts[13] = 5; pts[8] = 3; pts[6] = 5; pts[1] = -2; pts[12] = -5; pts[17] = -3; pts[19] = -5;
    gs.st = { pts, bar: [0, 0], off: [0, 0] };   // index 0 = you, 1 = computer
    gs.dice = []; gs.left = []; gs.seqs = []; gs.done = []; gs.from = null; gs.turn = 0; gs.busy = false;
    const d = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal'; gs.level = gs.level || 1; gs.ai = d;
    gs.msg = 'Tap Roll to start. You play the dark checkers, moving toward your home at the bottom right.';
    _bgRender();
}
const _BG_SIDE = [1, -1];
function _bgClone(st) { return { pts: st.pts.slice(), bar: st.bar.slice(), off: st.off.slice() }; }
function _bgAllHome(st, s) {
    if (st.bar[s]) return false;
    for (let p = 1; p <= 24; p++) { const v = st.pts[p] * _BG_SIDE[s]; if (v > 0 && (s === 0 ? p > 6 : p < 19)) return false; }
    return true;
}
// one checker, one die. from: point 1..24 or 'bar'. Returns {from,to,die} with to = point or 'off', or null.
function _bgOne(st, s, from, die) {
    const sg = _BG_SIDE[s];
    if (st.bar[s] && from !== 'bar') return null;
    let to;
    if (from === 'bar') { if (!st.bar[s]) return null; to = s === 0 ? 25 - die : die; }
    else { if (st.pts[from] * sg <= 0) return null; to = s === 0 ? from - die : from + die; }
    if (to >= 1 && to <= 24) { if (st.pts[to] * sg <= -2) return null; return { from, to, die }; }
    if (from === 'bar' || !_bgAllHome(st, s)) return null;
    // bearing off: exact, or a higher die from the farthest checker
    const exact = s === 0 ? to === 0 : to === 25;
    if (!exact) {
        for (let p = 1; p <= 24; p++) { const v = st.pts[p] * sg; if (v <= 0) continue; if (s === 0 ? p > from : p < from) return null; }
    }
    return { from, to: 'off', die };
}
function _bgDo(st, s, m) {
    const n = _bgClone(st), sg = _BG_SIDE[s];
    if (m.from === 'bar') n.bar[s]--; else n.pts[m.from] -= sg;
    if (m.to === 'off') n.off[s]++;
    else { if (n.pts[m.to] * sg === -1) { n.pts[m.to] = 0; n.bar[1 - s]++; m.hit = true; } n.pts[m.to] += sg; }
    return n;
}
function _bgFroms(st, s) { const f = st.bar[s] ? ['bar'] : []; if (!st.bar[s]) for (let p = 1; p <= 24; p++) if (st.pts[p] * _BG_SIDE[s] > 0) f.push(p); return f; }
// every legal full turn: sequences of moves of maximal length (with the larger-die rule)
function _bgSeqs(st, s, dice) {
    const out = [];
    const rec = (cur, left, seq) => {
        let moved = false;
        const tried = new Set();
        for (let i = 0; i < left.length; i++) {
            const die = left[i]; if (tried.has(die)) continue; tried.add(die);
            for (const f of _bgFroms(cur, s)) {
                const m = _bgOne(cur, s, f, die); if (!m) continue;
                moved = true; const mm = Object.assign({}, m);
                rec(_bgDo(cur, s, mm), left.slice(0, i).concat(left.slice(i + 1)), seq.concat([mm]));
            }
        }
        if (!moved) out.push({ seq, st: cur });
    };
    rec(st, dice, []);
    const max = Math.max(0, ...out.map(o => o.seq.length));
    let best = out.filter(o => o.seq.length === max);
    if (max === 1 && dice.length === 2 && dice[0] !== dice[1]) { const hi = Math.max(...dice); if (best.some(o => o.seq[0].die === hi)) best = best.filter(o => o.seq[0].die === hi); }
    return best;
}
function _bgPip(st, s) { let n = st.bar[s] * 25; for (let p = 1; p <= 24; p++) { const v = st.pts[p] * _BG_SIDE[s]; if (v > 0) n += v * (s === 0 ? p : 25 - p); } return n; }
function _bgEval(st) {   // from the computer's point of view: higher is better for it
    let v = (_bgPip(st, 0) - _bgPip(st, 1)) + st.off[1] * 6 + st.bar[0] * 12 - st.bar[1] * 12;
    for (let p = 1; p <= 24; p++) {
        const c = -st.pts[p];
        if (c === 1) { let risk = 0; for (let q = 1; q <= 24; q++) if (st.pts[q] > 0 && q > p && q - p <= 12) risk++; if (st.bar[0]) risk++; v -= 3 + risk * 1.5; }
        if (c >= 2 && p >= 19) v += 3;
    }
    return v;
}
function bgRoll() {
    const gs = gameState.backgammon; if (gs.turn !== 0 || gs.busy || gs.dice.length || gs.over) return;
    const a = 1 + Math.floor(Math.random() * 6), b = 1 + Math.floor(Math.random() * 6);
    gs.dice = [a, b]; gs.left = a === b ? [a, a, a, a] : [a, b]; gs.done = []; gs.from = null; gs.start = _bgClone(gs.st);
    gs.seqs = _bgSeqs(gs.st, 0, gs.left);
    sfxFlip();
    if (!gs.seqs[0].seq.length) { gs.msg = `You rolled ${a} and ${b}: no legal move. The computer plays.`; _bgRender(); return setTimeout(_bgEndTurn, 1600); }
    gs.msg = `You rolled ${a} and ${b}${a === b ? ' (doubles: four moves)' : ''}. Tap a checker to move.`;
    _bgRender();
}
function _bgNext() {   // legal next single moves, given the moves already made this turn
    const gs = gameState.backgammon, k = gs.done.length;
    const same = (x, y) => x.from === y.from && x.to === y.to && x.die === y.die;
    return gs.seqs.filter(o => gs.done.every((d, i) => same(d, o.seq[i]))).map(o => o.seq[k]).filter(Boolean);
}
function bgTap(where) {
    const gs = gameState.backgammon; if (gs.turn !== 0 || gs.busy || !gs.dice.length || gs.over) return;
    const next = _bgNext();
    if (gs.from !== null) {
        const m = next.find(x => x.from === gs.from && x.to === where);
        if (m) {
            gs.st = _bgDo(gs.st, 0, Object.assign({}, m)); gs.done.push(m); gs.from = null; sfxCorrect();
            if (gs.st.off[0] === 15) { _bgRender(); return GameKit.finish('backgammon', true, gs.st.off[1] === 0 ? 'You bore off all 15 - a gammon!' : 'You bore off all 15 first.'); }
            if (!_bgNext().length) { gs.msg = 'Turn done. The computer plays…'; _bgRender(); return setTimeout(_bgEndTurn, 900); }
            gs.msg = 'Keep going: ' + gs.left.filter((_, i) => i >= gs.done.length).length + ' move(s) left.';
            return _bgRender();
        }
    }
    if (next.some(x => x.from === where)) { gs.from = where; sfxFlip(); gs.msg = 'Now tap a highlighted point.'; }
    else { gs.from = null; sfxWrong(); gs.msg = gs.st.bar[0] ? 'You must enter your checker from the bar first.' : 'That checker cannot move with these dice.'; }
    _bgRender();
}
function bgUndo() { const gs = gameState.backgammon; if (gs.turn !== 0 || !gs.done.length) return sfxWrong(); gs.st = _bgClone(gs.start); gs.done = []; gs.from = null; gs.msg = 'Moves taken back. Tap a checker.'; sfxFlip(); _bgRender(); }
function _bgEndTurn() {
    const gs = gameState.backgammon; if (!gameState.active || gameState.currentId !== 'backgammon') return;
    gs.dice = []; gs.done = []; gs.from = null; gs.turn = 1; gs.busy = true; _bgRender();
    setTimeout(() => {
        if (!gameState.active || gameState.currentId !== 'backgammon') return;
        const a = 1 + Math.floor(Math.random() * 6), b = 1 + Math.floor(Math.random() * 6);
        const seqs = _bgSeqs(gs.st, 1, a === b ? [a, a, a, a] : [a, b]);
        let pick = seqs[Math.floor(Math.random() * seqs.length)];
        if (gs.ai !== 'easy') { let bv = -Infinity; for (const o of seqs) { const v = _bgEval(o.st) + (gs.ai === 'hard' ? 0 : Math.random() * 2); if (v > bv) { bv = v; pick = o; } } }
        gs.st = pick.st; gs.dice = [a, b];
        const hits = pick.seq.filter(m => m.hit).length;
        gs.msg = `The computer rolled ${a} and ${b}` + (pick.seq.length ? (hits ? ` and hit ${hits === 1 ? 'one of your checkers' : hits + ' of your checkers'}!` : '.') : ' and could not move.') + ' Your roll.';
        hits ? sfxWrong() : sfxFlip();
        gs.turn = 0; gs.busy = false; gs.compDice = [a, b]; gs.dice = [];
        if (gs.st.off[1] === 15) { _bgRender(); return GameKit.finish('backgammon', false, `The computer bore off first. You had ${gs.st.off[0]} off.`); }
        _bgRender();
    }, 900);
}
function _bgRender() {
    const gs = gameState.backgammon, el = document.getElementById('gameContent');
    if (!el || gameState.currentId !== 'backgammon') return;
    const st = gs.st, next = gs.turn === 0 && gs.dice.length ? _bgNext() : [];
    const froms = new Set(next.map(m => String(m.from))), tos = new Set(next.filter(m => m.from === gs.from).map(m => String(m.to)));
    const stack = (n, cls) => { const k = Math.abs(n); if (!k) return ''; let h = ''; for (let i = 0; i < Math.min(k, 5); i++) h += `<span class="bg-ck ${cls}">${i === 4 && k > 5 ? k : ''}</span>`; return h; };
    const point = (p, top) => {
        const v = st.pts[p], cls = v > 0 ? 'bg-me' : 'bg-cpu';
        const hl = (froms.has(String(p)) && gs.from === null ? ' bg-can' : '') + (gs.from === p ? ' bg-from' : '') + (tos.has(String(p)) ? ' bg-to' : '');
        return `<div class="bg-pt ${top ? 'bg-top' : 'bg-bot'} ${p % 2 ? 'bg-a' : 'bg-b'}${hl}" onclick="bgTap(${p})"><span class="bg-n">${p}</span><div class="bg-stack">${stack(v, cls)}</div></div>`;
    };
    const topRow = [13, 14, 15, 16, 17, 18].map(p => point(p, true)).join('') + `<div class="bg-bar" onclick="bgTap('bar')">${stack(-st.bar[1], 'bg-cpu')}</div>` + [19, 20, 21, 22, 23, 24].map(p => point(p, true)).join('');
    const botRow = [12, 11, 10, 9, 8, 7].map(p => point(p, false)).join('') + `<div class="bg-bar${froms.has('bar') && gs.from === null ? ' bg-can' : ''}${gs.from === 'bar' ? ' bg-from' : ''}" onclick="bgTap('bar')">${stack(st.bar[0], 'bg-me')}</div>` + [6, 5, 4, 3, 2, 1].map(p => point(p, false)).join('');
    const die = (n) => `<span class="bg-die">${n}</span>`;
    const shown = gs.dice.length ? gs.dice : (gs.compDice || []);
    el.innerHTML = `<div class="gk-wood bg" dir="ltr">
      <div class="gk-status">${gs.msg}</div>
      <div class="bg-board"><div class="bg-row">${topRow}</div><div class="bg-mid">${shown.map(die).join('')}</div><div class="bg-row">${botRow}</div></div>
      <div class="bg-off"><div class="bg-offbox${tos.has('off') ? ' bg-to' : ''}" onclick="bgTap('off')">${GameKit.icon('house')}Bear off here · you: ${st.off[0]}/15</div><div class="gk-label">Computer off: ${st.off[1]}/15</div></div>
      <div class="gk-btns">${GameKit.btn(GameKit.icon('dices') + 'Roll', 'bgRoll()', { cls: 'gk-primary', disabled: gs.turn !== 0 || gs.dice.length > 0 || gs.busy })}${GameKit.btn(GameKit.icon('undo-2') + 'Take back', 'bgUndo()', { disabled: !gs.done.length })}</div>
    </div>
    <style>.bg .bg-board{background:#2c5a3a;border:6px solid #3b2410;border-radius:10px;padding:6px;max-width:720px;margin:0 auto}
    .bg .bg-row{display:grid;grid-template-columns:repeat(6,1fr) .8fr repeat(6,1fr);gap:2px;height:clamp(150px,34vw,230px)}
    .bg .bg-mid{display:flex;justify-content:center;gap:10px;min-height:44px;align-items:center}
    .bg .bg-pt{position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;border-radius:4px}
    .bg .bg-top{justify-content:flex-start}.bg .bg-bot{justify-content:flex-end}
    .bg .bg-pt::before{content:'';position:absolute;inset:0;clip-path:polygon(0 0,100% 0,50% 88%);z-index:0}
    .bg .bg-bot::before{clip-path:polygon(50% 12%,100% 100%,0 100%)}
    .bg .bg-a::before{background:#c9a26b}.bg .bg-b::before{background:#8c3b26}
    .bg .bg-stack{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:1px}.bg .bg-bot .bg-stack{flex-direction:column-reverse}
    .bg .bg-ck{width:min(28px,6.2vw);height:min(28px,6.2vw);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:.8rem;box-shadow:0 2px 0 rgba(0,0,0,.4)}
    .bg .bg-me{background:#3b1d0e;color:#fde7c4;border:2px solid #fde7c4}.bg .bg-cpu{background:#fff7e6;color:#3b1d0e;border:2px solid #8a6a4a}
    .bg .bg-n{position:relative;z-index:1;font-size:.7rem;font-weight:800;color:#fff7e6;opacity:.85}
    .bg .bg-bar{background:#3b2410;border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer}
    .bg .bg-can{box-shadow:inset 0 0 0 3px #fde68a}.bg .bg-from{box-shadow:inset 0 0 0 4px #fbbf24}.bg .bg-to{box-shadow:inset 0 0 0 4px #4ade80;background:rgba(74,222,128,.18)}
    .bg .bg-die{width:44px;height:44px;border-radius:9px;background:#fff7e6;color:#3b1d0e;font-weight:900;font-size:1.5rem;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 0 rgba(0,0,0,.4)}
    .bg .bg-off{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;max-width:720px;margin:10px auto 0}
    .bg .bg-offbox{min-height:52px;padding:8px 16px;border-radius:12px;border:2px dashed #fde7c4;font-weight:800;display:flex;align-items:center;cursor:pointer}</style>`;
}
