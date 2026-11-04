// ═══════════════════════════════════════════════════════════════════════════════
// STAR HOP (2026-11, nostalgia batch 3) — the star-board marble game for two: race all your marbles from your home
// point of the star into the point straight across, against the computer. A marble moves to a neighboring hole, or
// HOPS over any marble next to it into the empty hole right behind, and may keep hopping in one turn. Nothing is
// captured. First to fill the far point wins; after 80 turns (120 on the full star) more marbles home wins. Easy and normal: a small star with 6 marbles each (easy computer is
// careless). Hard: the full 121-hole star with 10 marbles each. Taps are forgiving: a tap near a hole counts.
// Holes use cube coordinates (x, y, z), x + y + z = 0. The star is two big triangles: all coordinates <= S, or all
// >= -S (S = 3 small, 4 full). Your home is the point where x < -S; your goal is the point where x > S.
// ═══════════════════════════════════════════════════════════════════════════════
const _SH_D = [[1, -1, 0], [1, 0, -1], [-1, 1, 0], [-1, 0, 1], [0, 1, -1], [0, -1, 1]];
function _shBoard(S) {
    const pts = [];
    for (let x = -2 * S; x <= 2 * S; x++) for (let y = -2 * S; y <= 2 * S; y++) { const z = -x - y; if (Math.abs(z) > 2 * S) continue; if ((x <= S && y <= S && z <= S) || (x >= -S && y >= -S && z >= -S)) pts.push([x, y, z]); }
    return pts;
}
function initStarhop() {
    NK.start('starhop', {
        setup(gs, diff) {
            gs.diff = diff; gs.S = diff === 'hard' ? 4 : 3; gs.pts = _shBoard(gs.S); gs.idx = new Map(gs.pts.map((p, i) => [p.join(), i]));
            gs.b = gs.pts.map(([x]) => (x < -gs.S ? 1 : x > gs.S ? 2 : 0)); gs.turn = 1; gs.sel = -1; gs.over = false; gs.last = []; gs.moves = 0; gs.limit = gs.S === 3 ? 80 : 120;
            gs.msg = 'You are blue, at the bottom point. Tap a marble, then a dotted hole. Hop over marbles to go far.';
        },
        view: _shView,
        rules: (gs) => [
            `Race all ${gs.S === 3 ? 6 : 10} of your <b>blue</b> marbles from the bottom point of the star into the <b>top point</b>. The computer races its red marbles the other way.`,
            'A marble moves one step to a <b>neighboring</b> empty hole, or <b>hops</b> over a marble right next to it (yours or the computer\'s) into the empty hole just behind.',
            'In one turn you may make <b>several hops in a row</b>, but not a step and a hop. Tap the marble, then any dotted hole: the game finds the hops.',
            'Nothing is ever captured. The first to fill the far point wins (a computer marble still sitting at home in your goal does not block you).',
            `After ${gs.limit} turns each, whoever has more marbles home wins. Taps are forgiving: a tap near a hole counts. No clock. Keyboard: arrow keys move between holes, Enter picks and moves.`],
        css: `.sh-b{position:relative;width:min(100%,32rem,max(18rem,calc((100vh - 290px) * .92)));margin:0 auto;background:radial-gradient(circle at 50% 45%,#fef3c7,#fcd34d 75%);border-radius:24px;box-shadow:inset 0 0 0 4px #b45309;touch-action:manipulation}
.sh-svg{display:block;width:100%;height:auto}
#gameContent .nk button.sh-h{position:absolute}
.sh-h{border-radius:50%;border:0;padding:0;background:transparent;pointer-events:none;--nk-r:50%}
.sh-hint{font-weight:800;text-align:center;margin:6px 0 0}`,
    });
}
const _shNb = (gs, i, d) => { const [x, y, z] = gs.pts[i], k = gs.idx.get([x + d[0], y + d[1], z + d[2]].join()); return k === undefined ? -1 : k; };
// all holes marble i can reach this turn: steps, and chains of hops (with the path for each)
function _shReach(gs, i) {
    const out = new Map();
    for (const d of _SH_D) { const j = _shNb(gs, i, d); if (j >= 0 && !gs.b[j]) out.set(j, [i, j]); }
    const q = [[i, [i]]], seen = new Set([i]);
    while (q.length) { const [a, path] = q.shift(); for (const d of _SH_D) { const m = _shNb(gs, a, d); if (m < 0 || !gs.b[m]) continue; const t = _shNb(gs, m, d); if (t < 0 || gs.b[t] || t === i || seen.has(t)) continue; seen.add(t); const np = path.concat(t); if (!out.has(t)) out.set(t, np); q.push([t, np]); } }
    return out;
}
function _shGoal(gs, p, i) { const x = gs.pts[i][0]; return p === 1 ? x > gs.S : x < -gs.S; }
function _shWon(gs, p) {
    const goal = gs.pts.map((_, i) => i).filter((i) => _shGoal(gs, p, i));
    return goal.every((i) => gs.b[i] === p || (gs.b[i] === 3 - p)) && goal.some((i) => gs.b[i] === p) && gs.b.every((v, i) => v !== p || _shGoal(gs, p, i));
}
function shTap(i) {
    const gs = gameState.starhop; if (gs.over || gs.turn !== 1) return;
    if (gs.b[i] === 1) { gs.sel = gs.sel === i ? -1 : i; const n = gs.sel >= 0 ? _shReach(gs, i).size : 0; gs.msg = gs.sel < 0 ? '' : n ? 'Now tap a dotted hole.' : 'That marble cannot move right now.'; return NK.render('starhop'); }
    if (gs.sel < 0) { gs.msg = 'Tap one of your blue marbles first.'; return NK.render('starhop'); }
    const R = _shReach(gs, gs.sel);
    if (!R.has(i)) { gs.msg = gs.b[i] ? 'That hole is taken.' : 'The marble cannot reach that hole this turn.'; if (typeof sfxWrong === 'function') sfxWrong(); return NK.render('starhop'); }
    const path = R.get(i); gs.b[gs.sel] = 0; gs.b[i] = 1; gs.last = path; gs.sel = -1; gs.moves++; if (typeof sfxFlip === 'function') sfxFlip();
    if (_shWon(gs, 1)) return _shEnd(gs, 1);
    gs.turn = 2; gs.msg = path.length > 2 ? `${NK.pl(path.length - 1, 'hop')}! The computer is thinking...` : 'The computer is thinking...'; NK.render('starhop'); NK.after(700, _shCpu);
}
function shBoard(e) {
    const gs = gameState.starhop; if (gs.over || gs.turn !== 1) return;
    const b = e.currentTarget.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height, L = _shLay(gs);
    let best = -1, bd = 1e9; gs.pts.forEach((_, i) => { const [px, py] = L.at(i), d = Math.hypot(px / L.W - x, (py / L.H - y) * L.H / L.W); if (d < bd) { bd = d; best = i; } });
    if (best >= 0 && bd < L.step / L.W * 0.62) shTap(best);
}
function _shCpu() {
    const gs = gameState.starhop; if (gs.over || gs.turn !== 2) return;
    // red wants small x. Score a move by how far it goes, plus a push for marbles left far behind
    const opts = [];
    gs.b.forEach((v, i) => { if (v !== 2) return; _shReach(gs, i).forEach((path, t) => {
        const gain = gs.pts[i][0] - gs.pts[t][0], back = gs.pts[i][0] + gs.S, inGoal = _shGoal(gs, 2, i);
        let s = gain * 10 + (gain > 0 ? back * 0.8 : 0) - (inGoal && !_shGoal(gs, 2, t) ? 50 : 0) + (_shGoal(gs, 2, t) && !inGoal ? 6 : 0) - Math.abs(gs.pts[t][1] - gs.pts[t][2]) * 0.4;
        opts.push([i, t, path, s + Math.random()]); }); });
    if (!opts.length) { gs.turn = 1; gs.msg = 'The computer has no move. Your turn.'; return NK.render('starhop'); }
    opts.sort((a, z) => z[3] - a[3]);
    const pick = gs.diff === 'easy' && opts.length > 2 && Math.random() < 0.45 ? opts[1 + Math.floor(Math.random() * Math.min(4, opts.length - 1))] : opts[0];
    gs.b[pick[0]] = 0; gs.b[pick[1]] = 2; gs.last = pick[2]; if (typeof sfxFlip === 'function') sfxFlip();
    if (_shWon(gs, 2)) return _shEnd(gs, 2);
    if (gs.moves >= gs.limit) {   // turn limit: more marbles home wins; a tie goes to whoever has come further
        const home = (p) => gs.b.filter((v, i) => v === p && _shGoal(gs, p, i)).length, far = (p) => gs.b.reduce((a, v, i) => a + (v === p ? (p === 1 ? gs.pts[i][0] : -gs.pts[i][0]) : 0), 0);
        const a = home(1), b = home(2); return _shEnd(gs, a > b || (a === b && far(1) > far(2)) ? 1 : 2, `Turn ${gs.limit} reached: you have ${a} marbles home, the computer ${b}.`);
    }
    gs.turn = 1; const inG = gs.b.filter((v, i) => v === 1 && _shGoal(gs, 1, i)).length;
    gs.msg = `The computer ${pick[2].length > 2 ? `hopped ${NK.pl(pick[2].length - 1, 'time')}` : 'stepped'} (shown in yellow). You have ${inG} of ${gs.S === 3 ? 6 : 10} marbles home. Your turn.`;
    NK.render('starhop');
}
function _shEnd(gs, who, said) {
    gs.over = true; gs.turn = 0; gs.msg = said ? `${said} ${who === 1 ? 'You win!' : 'The computer wins.'}` : who === 1 ? 'Every blue marble is home. You win!' : 'The computer filled the far point first.';
    NK.render('starhop'); if (who === 1 && typeof sfxCorrect === 'function') sfxCorrect();
    NK.finish('starhop', who === 1, said ? gs.msg : who === 1 ? `All your marbles home in ${NK.pl(gs.moves, 'move')}.` : 'The computer got all its marbles home first. A rematch is one tap away.');
}
function shNew() { initStarhop(); }
function _shLay(gs) {   // screen positions; your home at the bottom
    const s3 = Math.sqrt(3), raw = gs.pts.map(([x, y]) => [s3 * (y + x / 2), -1.5 * x]);
    const minX = Math.min(...raw.map((p) => p[0])), maxX = Math.max(...raw.map((p) => p[0])), minY = Math.min(...raw.map((p) => p[1])), maxY = Math.max(...raw.map((p) => p[1]));
    const pad = 1.2, sc = 100 / (maxX - minX + pad * 2), W = 100, H = (maxY - minY + pad * 2) * sc;
    return { W, H, step: s3 * sc, at: (i) => [(raw[i][0] - minX + pad) * sc, (raw[i][1] - minY + pad) * sc] };
}
function _shView(gs) {
    const L = _shLay(gs), R = gs.sel >= 0 ? _shReach(gs, gs.sel) : new Map(), r = L.step * 0.36;
    let svg = '', btn = '';
    // the two goal points, lightly tinted
    gs.pts.forEach((_, i) => { const [x, y] = L.at(i); if (_shGoal(gs, 1, i)) svg += `<circle cx="${x}" cy="${y}" r="${r * 1.45}" fill="#bfdbfe"/>`; else if (_shGoal(gs, 2, i)) svg += `<circle cx="${x}" cy="${y}" r="${r * 1.45}" fill="#fecaca"/>`; });
    if (gs.last.length > 1) svg += `<polyline points="${gs.last.map((i) => L.at(i).join(',')).join(' ')}" fill="none" stroke="#ca8a04" stroke-width="${r * 0.35}" stroke-linejoin="round" stroke-linecap="round" opacity=".85"/>`;
    gs.pts.forEach((_, i) => {
        const [x, y] = L.at(i), v = gs.b[i], dot = R.has(i);
        svg += v ? `<circle cx="${x}" cy="${y}" r="${r}" fill="${v === 1 ? 'url(#shB)' : 'url(#shR)'}" stroke="${gs.sel === i ? '#111827' : 'rgba(0,0,0,.45)'}" stroke-width="${gs.sel === i ? r * 0.35 : r * 0.12}"/>` : `<circle cx="${x}" cy="${y}" r="${r * 0.42}" fill="#92400e" opacity=".7"/>${dot ? `<circle cx="${x}" cy="${y}" r="${r * 0.62}" fill="#16a34a"/>` : ''}`;
        if (v === 1 || dot) btn += `<button type="button" class="nk-cell sh-h" style="left:${x / L.W * 100}%;top:${y / L.H * 100}%;width:${L.step / L.W * 92}%;height:${L.step / L.H * 92}%;margin:-${L.step / L.W * 46}% 0 0 -${L.step / L.W * 46}%" onclick="event.stopPropagation();shTap(${i})" data-k="h${i}"${v === 1 && !btn.includes('data-first') ? ' data-first' : ''} aria-label="${v === 1 ? 'your marble' + (gs.sel === i ? ', picked' : '') : 'empty hole, you can move here'}${_shGoal(gs, 1, i) ? ', in your goal' : ''}"${gs.turn === 1 && !gs.over ? '' : ' disabled'}></button>`;
    });
    const home = gs.b.filter((v, i) => v === 1 && _shGoal(gs, 1, i)).length, cHome = gs.b.filter((v, i) => v === 2 && _shGoal(gs, 2, i)).length, N = gs.S === 3 ? 6 : 10;
    return `<div class="nk-top"><span>Your marbles home: <b>${home}</b> of ${N}</span><span>Computer: <b>${cHome}</b> of ${N}</span><span>Turn <b>${gs.moves + 1}</b> of ${gs.limit}</span></div>
      <div class="sh-b" onclick="shBoard(event)"><svg class="sh-svg" viewBox="0 0 ${L.W} ${L.H.toFixed(2)}" aria-hidden="true"><defs><radialGradient id="shB" cx=".35" cy=".3"><stop offset="0" stop-color="#bfdbfe"/><stop offset=".7" stop-color="#1d4ed8"/></radialGradient><radialGradient id="shR" cx=".35" cy=".3"><stop offset="0" stop-color="#fecaca"/><stop offset=".7" stop-color="#b91c1c"/></radialGradient></defs>${svg}</svg>${btn}</div>
      <div class="sh-hint">Blue (you): bottom to top · Red: top to bottom</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('rotate-ccw') + 'New game', 'shNew()', { k: 'restart' })}</div>`;
}
