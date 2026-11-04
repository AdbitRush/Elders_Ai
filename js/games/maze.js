// ═══════════════════════════════════════════════════════════════════════════════
// PLACEMAT MAZE (2026-11, nostalgia batch 2) — the pencil maze printed on diner placemats and kids' menus.
// Solo, no clock, no way to lose.
// Guide the little car from the gate (top left) to the diner (bottom right). Every maze has exactly one route
// (a "perfect" maze, carved by a random depth-first walk). An arrow press drives along the corridor until the next
// turn-off or dead end, so a long hallway is one press. Tapping a square in a straight, open line from the car drives
// there. Your trail is drawn as you go; the finish reports your presses and how long the true route is.
// Easy 7x7, normal 10x10, hard 13x13. walls[r][c] = {n,e,s,w} true = wall.
// ═══════════════════════════════════════════════════════════════════════════════
function initMaze() {
    NK.start('maze', {
        setup(gs, diff) {
            const n = diff === 'easy' ? 7 : diff === 'hard' ? 13 : 10;
            gs.n = n; gs.w = _mzCarve(n); gs.pos = [0, 0]; gs.trail = new Set(['0,0']); gs.moves = 0; gs.over = false;
            gs.best = _mzRoute(gs).length - 1;
            gs.msg = 'Drive the car to the diner in the bottom right corner. Use the arrow buttons, or tap a square in a straight open line.';
        },
        view: _mzView,
        arrows(dir) { mzGo(dir); return true; },
        rules: [
            'Drive the <b>car</b> from the gate in the top left to the <b>diner</b> in the bottom right. Dark lines are walls.',
            'Each arrow press drives along the hallway until the next turn-off or dead end, so long hallways take one press.',
            'You can also tap a square that the car can see in a straight line (no wall in between) to drive straight there.',
            'Your trail is drawn in orange. Dead ends are part of the fun: just drive back.',
            'There is only one true route. No clock, and no way to lose.',
            'Keyboard: the arrow keys drive the car.'],
        css: `.mz-wrap{max-width:min(100%,32rem);margin:0 auto}
.mz-paper{background:#fffdf5;border:3px solid #e8cfa8;border-radius:16px;padding:10px}
.mz-grid{display:grid;position:relative;background:#fffdf5}
.mz-c{aspect-ratio:1;border-style:solid!important;border-color:#2b1b0d!important;box-sizing:border-box;background:transparent;padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer;--nk-r:0;min-width:0}
.mz-c.mz-t{background:#fed7aa}
.mz-c.mz-reach{background:#e0f2fe}
.mz-c.mz-t.mz-reach{background:#fbd5a5}
.mz-c svg{width:78%;height:78%}
.mz-car{color:#b91c1c}.mz-goal{color:#15803d}
.mz-pad{display:grid;grid-template-columns:repeat(3,64px);grid-template-rows:repeat(2,58px);grid-template-areas:". u ." "l d r";gap:6px;justify-content:center;margin-top:10px}
.mz-pad .gk-btn{padding:0;min-width:64px;width:100%;height:100%}
.mz-pad>:nth-child(1){grid-area:u}.mz-pad>:nth-child(2){grid-area:l}.mz-pad>:nth-child(3){grid-area:d}.mz-pad>:nth-child(4){grid-area:r}`,
    });
}
function _mzCarve(n) {
    const w = Array.from({ length: n }, () => Array.from({ length: n }, () => ({ n: true, e: true, s: true, w: true })));
    const seen = Array.from({ length: n }, () => Array(n).fill(false));
    const st = [[0, 0]]; seen[0][0] = true;
    const D = [[-1, 0, 'n', 's'], [0, 1, 'e', 'w'], [1, 0, 's', 'n'], [0, -1, 'w', 'e']];
    while (st.length) {
        const [r, c] = st[st.length - 1];
        const opts = D.filter(([dr, dc]) => { const rr = r + dr, cc = c + dc; return rr >= 0 && rr < n && cc >= 0 && cc < n && !seen[rr][cc]; });
        if (!opts.length) { st.pop(); continue; }
        const [dr, dc, a, b] = opts[Math.floor(Math.random() * opts.length)];
        w[r][c][a] = false; w[r + dr][c + dc][b] = false; seen[r + dr][c + dc] = true; st.push([r + dr, c + dc]);
    }
    return w;
}
const _MZ_D = { up: [-1, 0, 'n'], down: [1, 0, 's'], left: [0, -1, 'w'], right: [0, 1, 'e'] };
function _mzExits(gs, r, c) { const x = gs.w[r][c]; return ['n', 'e', 's', 'w'].filter((d) => !x[d]).length; }
function _mzRoute(gs) {
    const n = gs.n, prev = {}, q = [[0, 0]]; prev['0,0'] = null;
    while (q.length) {
        const [r, c] = q.shift(); if (r === n - 1 && c === n - 1) break;
        for (const k in _MZ_D) { const [dr, dc, d] = _MZ_D[k]; if (gs.w[r][c][d]) continue; const key = (r + dr) + ',' + (c + dc); if (key in prev) continue; prev[key] = r + ',' + c; q.push([r + dr, c + dc]); }
    }
    const path = []; let k = (n - 1) + ',' + (n - 1); while (k) { path.push(k); k = prev[k]; } return path.reverse();
}
function mzGo(dir) {
    const gs = gameState.maze; if (gs.over) return;
    const [dr, dc, d] = _MZ_D[dir]; let [r, c] = gs.pos;
    if (gs.w[r][c][d]) { gs.msg = `There is a wall ${dir === 'up' ? 'above' : dir === 'down' ? 'below' : 'to the ' + dir}. Try another way.`; return NK.render('maze'); }
    // drive until a turn-off, a dead end, a wall ahead or the diner
    for (;;) {
        r += dr; c += dc; gs.trail.add(r + ',' + c);
        if (r === gs.n - 1 && c === gs.n - 1) break;
        if (gs.w[r][c][d] || _mzExits(gs, r, c) > 2) break;
    }
    _mzArrive(gs, r, c);
}
function mzTap(r, c) {
    const gs = gameState.maze; if (gs.over) return;
    const [pr, pc] = gs.pos; if (r === pr && c === pc) return;
    const line = _mzLine(gs);
    if (!line.has(r + ',' + c)) { gs.msg = 'The car can only drive straight to a square it can see - no walls and no corners in between. The light blue squares are in reach.'; return NK.render('maze'); }
    const dr = Math.sign(r - pr), dc = Math.sign(c - pc); let rr = pr, cc = pc;
    while (rr !== r || cc !== c) { rr += dr; cc += dc; gs.trail.add(rr + ',' + cc); }
    _mzArrive(gs, r, c);
}
function _mzArrive(gs, r, c) {
    gs.pos = [r, c]; gs.moves++;
    if (typeof sfxFlip === 'function') sfxFlip();
    if (r === gs.n - 1 && c === gs.n - 1) {
        gs.over = true; gs.msg = `You reached the diner in ${gs.moves} move${gs.moves === 1 ? '' : 's'}!`; NK.render('maze');
        if (typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('maze', true, `Made it to the diner in ${gs.moves} move${gs.moves === 1 ? "" : "s"}. The true route is ${gs.best} squares long.`);
    }
    const ex = _mzExits(gs, r, c);
    gs.msg = ex === 1 ? 'A dead end. Drive back and try another hallway.' : ex > 2 ? 'A turn-off here. Which way now?' : 'Keep going.';
    NK.render('maze');
}
// squares visible in a straight open line from the car
function _mzLine(gs) {
    const out = new Set(), [r0, c0] = gs.pos;
    for (const k in _MZ_D) { const [dr, dc, d] = _MZ_D[k]; let r = r0, c = c0; while (!gs.w[r][c][d]) { r += dr; c += dc; out.add(r + ',' + c); } }
    return out;
}
function mzNew() { initMaze(); }
function _mzView(gs) {
    const n = gs.n, line = gs.over ? new Set() : _mzLine(gs), bw = n > 10 ? 2 : 3;   // each wall is drawn on both cells
    let cells = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        const x = gs.w[r][c], here = gs.pos[0] === r && gs.pos[1] === c, goal = r === n - 1 && c === n - 1, k = r + ',' + c;
        const st = `--nk-bw:${x.n ? bw : 0}px ${x.e ? bw : 0}px ${x.s ? bw : 0}px ${x.w ? bw : 0}px`;   // walls (the kit's cell reset reads --nk-bw)
        const inner = here ? `<span class="mz-car">${Icon.svg('car', { size: '100%', sw: 2.6, fill: true, fillOpacity: .25 })}</span>` : goal ? `<span class="mz-goal">${Icon.svg('coffee', { size: '100%', sw: 2.4 })}</span>` : '';
        const lab = here ? 'the car is here' : goal ? 'the diner' : line.has(k) ? 'in a straight line from the car' : 'square';
        cells += `<button type="button" class="nk-cell mz-c${gs.trail.has(k) ? ' mz-t' : ''}${line.has(k) ? ' mz-reach' : ''}" style="${st}" onclick="mzTap(${r},${c})" data-k="m${r}_${c}" aria-label="row ${r + 1} column ${c + 1}, ${lab}" tabindex="-1"${gs.over ? ' disabled' : ''}>${inner}</button>`;
    }
    const pad = (d, ic, lab, cls) => NK.btn(Icon.svg(ic, { size: '28px', sw: 3 }), `mzGo('${d}')`, { k: 'go' + d, label: lab, cls, disabled: gs.over });
    return `<div class="nk-top"><span>Moves: <b>${gs.moves}</b></span><span>Maze: ${n} x ${n}</span></div>
      <div class="mz-wrap"><div class="mz-paper"><div class="mz-grid" style="grid-template-columns:repeat(${n},1fr)">${cells}</div></div>
      <div class="mz-pad">${pad('up', 'arrow-up', 'drive up')}${pad('left', 'arrow-left', 'drive left')}${pad('down', 'arrow-down', 'drive down')}${pad('right', 'arrow-right', 'drive right')}</div></div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('rotate-ccw') + 'New maze', 'mzNew()', { k: 'new' })}</div>`;
}
