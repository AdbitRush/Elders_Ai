// ═══════════════════════════════════════════════════════════════════════════════
// FENCE LOOP (2026-11, nostalgia batch 3) — the loop-drawing puzzle of puzzle magazines. Draw one fence that runs
// along the dotted lines and closes up into a single loop, with no branches and no crossings. A number in a square
// says how many of that square's four sides are fence. The loop is grown as the outline of a random patch of squares
// with no holes, so a solution always exists; any loop that fits every number is accepted.
// Tap a gap between two dots: fence, then an X ("no fence here"), then empty. Easy 5x5 with every number shown,
// normal 6x6, hard 7x7 with fewer numbers. No clock.
// Edges: horizontal h[r][c] (r 0..n, c 0..n-1) is the top side of square (r,c); vertical v[r][c] (r 0..n-1,
// c 0..n) is the left side of square (r,c).
// ═══════════════════════════════════════════════════════════════════════════════
function _flEdges(n, inR) {
    const at = (r, c) => r >= 0 && r < n && c >= 0 && c < n && inR[r][c];
    const h = Array.from({ length: n + 1 }, (_, r) => [...Array(n).keys()].map((c) => (at(r - 1, c) !== at(r, c) ? 1 : 0)));
    const v = Array.from({ length: n }, (_, r) => [...Array(n + 1).keys()].map((c) => (at(r, c - 1) !== at(r, c) ? 1 : 0)));
    return { h, v };
}
// is the set of "on" edges one single closed loop? (every dot used 0 or 2 times, and all used edges connected)
function _flLoop(n, h, v) {
    const deg = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0)), on = [];
    for (let r = 0; r <= n; r++) for (let c = 0; c < n; c++) if (h[r][c] === 1) { deg[r][c]++; deg[r][c + 1]++; on.push([r, c, r, c + 1]); }
    for (let r = 0; r < n; r++) for (let c = 0; c <= n; c++) if (v[r][c] === 1) { deg[r][c]++; deg[r + 1][c]++; on.push([r, c, r + 1, c]); }
    if (!on.length || deg.some((row) => row.some((d) => d && d !== 2))) return { ok: false, deg };
    const adj = new Map(), k = (r, c) => r * (n + 1) + c;
    on.forEach(([a, b, c, d]) => { [[k(a, b), k(c, d)], [k(c, d), k(a, b)]].forEach(([x, y]) => { if (!adj.has(x)) adj.set(x, []); adj.get(x).push(y); }); });
    const start = adj.keys().next().value, seen = new Set([start]), st = [start];
    while (st.length) { const x = st.pop(); adj.get(x).forEach((y) => { if (!seen.has(y)) { seen.add(y); st.push(y); } }); }
    return { ok: seen.size === adj.size, deg };
}
function _flMake(diff) {
    const n = diff === 'easy' ? 5 : diff === 'hard' ? 7 : 6;
    for (let t = 0; t < 100; t++) {
        const inR = Array.from({ length: n }, () => Array(n).fill(false)), target = Math.round(n * n * (0.4 + Math.random() * 0.15));
        inR[Math.floor(Math.random() * n)][Math.floor(Math.random() * n)] = true; let size = 1;
        for (let k = 0; k < 4000 && size < target; k++) {
            const r = Math.floor(Math.random() * n), c = Math.floor(Math.random() * n);
            if (inR[r][c] || ![[0, 1], [0, -1], [1, 0], [-1, 0]].some(([a, b]) => inR[r + a] && inR[r + a][c + b])) continue;
            inR[r][c] = true; const { h, v } = _flEdges(n, inR);
            if (_flLoop(n, h, v).ok) size++; else inR[r][c] = false;   // keeps the outline a single loop: no holes, no pinches
        }
        if (size < target * 0.8) continue;
        const { h, v } = _flEdges(n, inR), num = [...Array(n).keys()].map((r) => [...Array(n).keys()].map((c) => h[r][c] + h[r + 1][c] + v[r][c] + v[r][c + 1]));
        const keep = diff === 'easy' ? 1 : diff === 'hard' ? 0.55 : 0.75;
        const show = num.map((row) => row.map((x) => (Math.random() < keep ? x : -1)));
        return { n, h, v, show };
    }
    return null;
}
function initFenceloop() {
    NK.start('fenceloop', {
        setup(gs, diff) {
            let P = null; while (!P) P = _flMake(diff);
            gs.P = P; gs.n = P.n; gs.h = P.h.map((row) => row.map(() => 0)); gs.v = P.v.map((row) => row.map(() => 0)); gs.over = false; gs.hints = 0;
            gs.msg = 'Tap the gap between two dots to put up a piece of fence.';
        },
        view: _flView,
        keys: { KeyH: () => flHint() },
        rules: [
            'Draw <b>one fence</b> along the lines between the dots. It must close up into a <b>single loop</b>: no branches, no crossings, no loose ends.',
            'A number in a square says <b>how many of its four sides</b> are fence. Squares with no number can have any.',
            'Tap a gap once for fence, again for an X that means "no fence here", again to clear.',
            'A number turns green when it has exactly that many sides, red when it has too many.',
            'Hint puts up or takes down one piece. Any loop that fits every number wins. No clock. Keyboard: arrow keys and Enter, H for a hint.'],
        css: `.fl-b{position:relative;width:min(100%,30rem,max(18rem,calc(100vh - 300px)));aspect-ratio:1;margin:0 auto;background:#fefce8;border-radius:14px;box-shadow:inset 0 0 0 3px #a16207}
.fl-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.fl-n{position:absolute;transform:translate(-50%,-50%);font:900 clamp(1.05rem,4.8vw,1.6rem) Georgia,serif;color:#1c1917;pointer-events:none}
.fl-n.fl-ok{color:#15803d}.fl-n.fl-bad{color:#b91c1c}
#gameContent .nk button.fl-e{position:absolute}
.fl-e{border:0;padding:0;background:transparent;cursor:pointer;--nk-r:8px;display:flex;align-items:center;justify-content:center;z-index:2}
.fl-e:hover{background:rgba(161,98,7,.12)}
.fl-x{font:900 1rem sans-serif;color:#b91c1c}`,
    });
}
function flTap(t, r, c) {
    const gs = gameState.fenceloop; if (gs.over) return; const A = t === 'h' ? gs.h : gs.v;
    A[r][c] = (A[r][c] + 1) % 3; if (A[r][c] === 1 && typeof sfxFlip === 'function') sfxFlip();
    _flAfter(gs, A[r][c] === 1 ? 'Fence up.' : A[r][c] === 2 ? 'Marked: no fence here.' : 'Gap cleared.');
}
const _flSides = (gs, r, c) => [gs.h[r][c], gs.h[r + 1][c], gs.v[r][c], gs.v[r][c + 1]].filter((x) => x === 1).length;
function _flAfter(gs, said) {
    const { n, show } = gs.P, L = _flLoop(n, gs.h, gs.v);
    let bad = 0; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (show[r][c] >= 0 && _flSides(gs, r, c) !== show[r][c]) bad++;
    if (L.ok && !bad) {
        gs.over = true; gs.msg = 'One closed fence that fits every number. Solved!'; NK.render('fenceloop'); if (typeof sfxCorrect === 'function') sfxCorrect();
        const len = gs.h.flat().concat(gs.v.flat()).filter((x) => x === 1).length;
        return NK.finish('fenceloop', true, `Fence Loop ${n} x ${n} closed with ${len} pieces of fence${gs.hints ? ` (${NK.pl(gs.hints, 'hint')})` : ''}.`);
    }
    const branch = L.deg.some((row) => row.some((d) => d > 2));
    gs.msg = branch ? `${said} The fence branches at a dot: three or four pieces meet there.` : !bad && !L.ok ? `${said} Every number fits; now close the fence into one loop.` : `${said} ${NK.pl(bad, 'number')} still to match.`;
    NK.render('fenceloop');
}
function flHint() {
    const gs = gameState.fenceloop; if (gs.over) return; const P = gs.P;
    for (const [t, A, S] of [['h', gs.h, P.h], ['v', gs.v, P.v]]) for (let r = 0; r < A.length; r++) for (let c = 0; c < A[r].length; c++) if ((A[r][c] === 1) !== (S[r][c] === 1)) {
        A[r][c] = S[r][c] ? 1 : 2; gs.hints++; return _flAfter(gs, `Hint: ${S[r][c] ? 'a fence piece went up' : 'a fence piece came down'}.`);
    }
}
function flClear() { const gs = gameState.fenceloop; if (gs.over) return; gs.h = gs.h.map((row) => row.map(() => 0)); gs.v = gs.v.map((row) => row.map(() => 0)); gs.msg = 'All fence taken down.'; NK.render('fenceloop'); }
function flNew() { initFenceloop(); }
function _flView(gs) {
    const { n, show } = gs.P, u = 90 / n, o = 5, X = (c) => o + c * u;   // board coordinates in percent, with a 5% margin
    let svg = '', btn = '', nums = '', first = true;
    for (let r = 0; r <= n; r++) for (let c = 0; c < n; c++) {
        const s = gs.h[r][c]; if (s === 1) svg += `<line x1="${X(c)}" y1="${X(r)}" x2="${X(c + 1)}" y2="${X(r)}" stroke="#7c2d12" stroke-width="1.6" stroke-linecap="round"/>`;
        btn += `<button type="button" class="nk-cell fl-e" style="left:${X(c + 0.5)}%;top:${X(r)}%;width:${u * 0.8}%;height:${Math.min(u * 0.45, 9)}%;margin:-${Math.min(u * 0.45, 9) / 2}% 0 0 -${u * 0.4}%" onclick="flTap('h',${r},${c})" data-k="h${r}_${c}"${first ? ' data-first' : ''} aria-label="side between dots, row ${r + 1}, gap ${c + 1} across: ${s === 1 ? 'fence' : s === 2 ? 'no fence' : 'open'}"${gs.over ? ' disabled' : ''}>${s === 2 ? '<span class="fl-x" aria-hidden="true">×</span>' : ''}</button>`; first = false;
    }
    for (let r = 0; r < n; r++) for (let c = 0; c <= n; c++) {
        const s = gs.v[r][c]; if (s === 1) svg += `<line x1="${X(c)}" y1="${X(r)}" x2="${X(c)}" y2="${X(r + 1)}" stroke="#7c2d12" stroke-width="1.6" stroke-linecap="round"/>`;
        btn += `<button type="button" class="nk-cell fl-e" style="left:${X(c)}%;top:${X(r + 0.5)}%;height:${u * 0.8}%;width:${Math.min(u * 0.45, 9)}%;margin:-${u * 0.4}% 0 0 -${Math.min(u * 0.45, 9) / 2}%" onclick="flTap('v',${r},${c})" data-k="v${r}_${c}" aria-label="side between dots, column ${c + 1}, gap ${r + 1} down: ${s === 1 ? 'fence' : s === 2 ? 'no fence' : 'open'}"${gs.over ? ' disabled' : ''}>${s === 2 ? '<span class="fl-x" aria-hidden="true">×</span>' : ''}</button>`;
    }
    for (let r = 0; r <= n; r++) for (let c = 0; c <= n; c++) svg += `<circle cx="${X(c)}" cy="${X(r)}" r="1.1" fill="#44403c"/>`;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (show[r][c] >= 0) { const k = _flSides(gs, r, c); nums += `<span class="fl-n${k === show[r][c] ? ' fl-ok' : k > show[r][c] ? ' fl-bad' : ''}" style="left:${X(c + 0.5)}%;top:${X(r + 0.5)}%" role="img" aria-label="square row ${r + 1} column ${c + 1}: needs ${show[r][c]} sides, has ${k}">${show[r][c]}</span>`; }
    const pieces = gs.h.flat().concat(gs.v.flat()).filter((x) => x === 1).length;
    return `<div class="nk-top"><span>Fence pieces: <b>${pieces}</b></span><span>Hints: <b>${gs.hints}</b></span></div>
      <div class="fl-b"><svg class="fl-svg" viewBox="0 0 100 100" aria-hidden="true">${svg}</svg>${nums}${btn}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('lightbulb') + 'Hint', 'flHint()', { k: 'hint', disabled: gs.over })}${NK.btn('Clear all', 'flClear()', { k: 'clear', disabled: gs.over })}${NK.btn(NK.icon('rotate-ccw') + 'New puzzle', 'flNew()', { k: 'restart' })}</div>`;
}
