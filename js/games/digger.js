// ═══════════════════════════════════════════════════════════════════
// TUNNEL DIGGER (2026-11) — after the tunnelling arcade games of the early 1980s home computers: dig through the earth,
// collect the gems, drop sacks of gold, keep away from the creatures. Original rules text, drawings and generated levels.
// Turn-based on purpose: nothing moves until you do, so it needs planning and no fast reactions.
// Each turn: you step (digging if needed) -> sacks settle -> creatures step along tunnels towards you.
// A sack with nothing under it wobbles for one turn, then falls one square a turn. It flattens whatever it lands on.
// A sack that falls two squares or more bursts into gold. You can push a sack sideways into a free or earthy square.
// Creatures only walk in tunnels. Easy: 1 creature, moves on 1 turn in 2. Normal: 2, moves on 3 turns in 4. Hard: 3, moves every turn, 2 lives.
// (Rates and lives were set by simulating a simple careful player; see tools/preview/sim-digger.js.)
// ═══════════════════════════════════════════════════════════════════
const _DG_W = 11, _DG_H = 9;
const _DG_DIR = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const _dgAt = (W, H, x, y) => x >= 0 && y >= 0 && x < W && y < H;

// The rules, free of the page, so the balance can be simulated. rnd() returns 0..1.
function _dgNew(diff, level, rnd) {
    const W = _DG_W, H = _DG_H, lv = Math.max(1, level || 1);
    const pick = (n) => Math.floor(rnd() * n);
    const cfg = { easy: [1, 2, 4], normal: [2, 4, 3], hard: [3, 0, 2] }[diff] || [2, 3, 3];
    const crea = Math.min(cfg[0] + Math.floor((lv - 1) / 3), 4);
    const g = { W, H, dug: Array.from({ length: H }, () => Array(W).fill(false)), gems: [], sacks: [], gold: [], cr: [], px: 5, py: 8, sx: 5, sy: 8, lives: cfg[2], cycle: cfg[1], crea, respawn: [], score: 0, turn: 0, over: false, won: false };
    for (let x = 0; x < W; x++) g.dug[0][x] = true;                // the creatures' tunnel along the top
    g.dug[8][5] = true;
    // two shafts down from the top tunnel, so creatures can come looking early and the safe ground is never the whole field
    const shaftA = 1 + pick(3), shaftB = W - 2 - pick(3), depthA = 3 + pick(2), depthB = 3 + pick(2);
    for (let y = 1; y <= depthA; y++) g.dug[y][shaftA] = true;
    for (let y = 1; y <= depthB; y++) g.dug[y][shaftB] = true;
    const used = new Set(['5,8', '4,8', '6,8', '5,7']);
    for (let y = 1; y <= 5; y++) { used.add(shaftA + ',' + y); used.add(shaftB + ',' + y); }
    const place = (n, yMin, yMax, avoidEdge, out) => { let tries = 0; while (out.length < n && tries++ < 400) { const x = pick(W), y = yMin + pick(yMax - yMin + 1), k = x + ',' + y; if (used.has(k)) continue; if (avoidEdge && (x === 0 || x === W - 1)) continue; used.add(k); out.push({ x, y }); } };
    place(Math.min(3 + Math.floor(lv / 2), 6), 2, 5, true, g.sacks);
    g.sacks.forEach((s) => { s.wob = false; s.fell = 0; s.falling = false; });
    place(Math.min(6 + lv, 14), 1, 8, false, g.gems);
    for (let i = 0; i < crea; i++) g.cr.push({ x: [0, W - 1, 5, 2][i], y: 0 });
    return g;
}
const _dgFree = (g, x, y) => _dgAt(g.W, g.H, x, y) && g.dug[y][x] && !g.sacks.some((s) => s.x === x && s.y === y);
// creature path: breadth-first through tunnels towards the digger; returns the next square or null
function _dgNext(g, c) {
    const seen = new Set([c.x + ',' + c.y]), q = [[c.x, c.y, null]];
    while (q.length) { const [x, y, first] = q.shift(); if (x === g.px && y === g.py) return first;
        for (const k of ['up', 'left', 'down', 'right']) { const [dx, dy] = _DG_DIR[k], nx = x + dx, ny = y + dy, key = nx + ',' + ny; if (seen.has(key) || !_dgFree(g, nx, ny)) continue; seen.add(key); q.push([nx, ny, first || [nx, ny]]); } }
    return null;
}
// One turn. dir null means wait. Returns { moved, ev: [] } and changes g. A refused move costs no turn.
function _dgTurn(g, dir) {
    const ev = []; if (g.over) return { moved: false, ev };
    if (dir) { const [dx, dy] = _DG_DIR[dir], nx = g.px + dx, ny = g.py + dy;
        if (!_dgAt(g.W, g.H, nx, ny)) return { moved: false, ev: ['wall'] };
        const sack = g.sacks.find((s) => s.x === nx && s.y === ny);
        if (sack) { if (dy !== 0) return { moved: false, ev: ['sackblock'] };
            const bx = nx + dx; if (!_dgAt(g.W, g.H, bx, ny) || g.sacks.some((s) => s.x === bx && s.y === ny) || g.cr.some((c) => c.x === bx && c.y === ny)) return { moved: false, ev: ['sackstuck'] };
            sack.x = bx; g.dug[ny][bx] = true; g.gems = g.gems.filter((m) => { if (m.x === bx && m.y === ny) { g.score += 25; ev.push('gem'); return false; } return true; }); sack.wob = false; ev.push('push'); }
        g.px = nx; g.py = ny; if (!g.dug[ny][nx]) { g.dug[ny][nx] = true; ev.push('dig'); }
        const gi = g.gems.findIndex((m) => m.x === nx && m.y === ny); if (gi >= 0) { g.gems.splice(gi, 1); g.score += 25; ev.push('gem'); }
        const au = g.gold.findIndex((m) => m.x === nx && m.y === ny); if (au >= 0) { g.gold.splice(au, 1); g.score += 100; ev.push('gold'); }
    }
    g.turn++;
    if (_dgHit(g)) return _dgLose(g, ev, 'caught');
    if (!g.gems.length) { g.over = true; g.won = true; g.score += 200 + g.lives * 50; ev.push('win'); return { moved: true, ev }; }
    // sacks: bottom row first, so a stack settles in order
    [...g.sacks].sort((a, b) => b.y - a.y).forEach((s) => {
        const canFall = s.y + 1 < g.H && g.dug[s.y + 1][s.x] && !g.sacks.some((o) => o !== s && o.x === s.x && o.y === s.y + 1);
        if (s.falling) {
            if (canFall) { s.y++; s.fell++;
                const before = g.cr.length; g.cr = g.cr.filter((c) => !(c.x === s.x && c.y === s.y)); const n = before - g.cr.length; if (n) { g.score += 250 * n; ev.push('flat'); for (let i = 0; i < n; i++) g.respawn.push(g.turn + 14); }
                if (g.px === s.x && g.py === s.y) ev.push('sacked');
                const gi = g.gems.findIndex((m) => m.x === s.x && m.y === s.y); if (gi >= 0) { g.gems.splice(gi, 1); g.score += 25; ev.push('gem'); }
                const au = g.gold.findIndex((m) => m.x === s.x && m.y === s.y); if (au >= 0) g.gold.splice(au, 1);
            }
            const still = s.y + 1 < g.H && g.dug[s.y + 1][s.x] && !g.sacks.some((o) => o !== s && o.x === s.x && o.y === s.y + 1);
            if (!still) { s.falling = false; if (s.fell >= 2) { g.sacks = g.sacks.filter((o) => o !== s); g.gold.push({ x: s.x, y: s.y }); ev.push('burst'); } s.fell = 0; }
        } else if (canFall) { if (s.wob) { s.wob = false; s.falling = true; } else { s.wob = true; ev.push('wobble'); } }
        else s.wob = false;
    });
    if (ev.includes('sacked')) return _dgLose(g, ev, 'sack');
    if (!g.gems.length) { g.over = true; g.won = true; g.score += 200 + g.lives * 50; ev.push('win'); return { moved: true, ev }; }
    g.respawn = g.respawn.filter((t) => { if (t <= g.turn && _dgFree(g, g.W >> 1, 0)) { g.cr.push({ x: g.W >> 1, y: 0 }); ev.push('respawn'); return false; } return true; });
    if (!g.cycle || g.turn % g.cycle !== 0) {        // creatures rest on the last turn of each cycle; cycle 0 never rests
        const taken = new Set(g.cr.map((c) => c.x + ',' + c.y));
        g.cr.forEach((c) => { const n = _dgNext(g, c); if (n && (!taken.has(n[0] + ',' + n[1]))) { taken.delete(c.x + ',' + c.y); c.x = n[0]; c.y = n[1]; taken.add(c.x + ',' + c.y); } });
    }
    if (_dgHit(g)) return _dgLose(g, ev, 'caught');
    return { moved: true, ev };
}
const _dgHit = (g) => g.cr.some((c) => c.x === g.px && c.y === g.py);
function _dgLose(g, ev, why) {
    g.lives--; ev.push(why);
    if (g.lives <= 0) { g.over = true; ev.push('lost'); return { moved: true, ev }; }
    // back to the start; creatures go back to the top tunnel, so a life never ends with an instant second catch
    g.px = g.sx; g.py = g.sy; g.dug[g.py][g.px] = true; g.sacks = g.sacks.filter((s) => !(s.x === g.px && s.y === g.py));
    g.cr.forEach((c, i) => { c.x = [0, g.W - 1, 5, 2][i % 4]; c.y = 0; });
    ev.push('reset');
    return { moved: true, ev };
}

function initDigger() {
    NK.start('digger', {
        setup(gs, diff) {
            const lv = gs.level || 1; gs.diff = diff; gs.g = _dgNew(diff, lv, Math.random);
            gs.msg = `Collect all ${gs.g.gems.length} gems. Nothing moves until you do.`;
        },
        view: _dgView,
        arrows(dir) { dgMove(dir); return true; },
        keys: { Space: () => dgMove(null), KeyW: () => dgMove(null) },
        enter() { dgMove(null); },
        rules: (gs) => [
            'Use the <b>arrow buttons</b> or arrow keys, or tap a square next to the digger. You dig as you go. <b>Nothing moves until you do</b>, so take all the time you like.',
            'Collect <b>every gem</b> to finish the level. Gems are worth 25 points.',
            '<b>Creatures</b> only walk along tunnels, and every tunnel you dig is one they can use. If one reaches you, you lose a life and go back to the start.',
            'A <b>sack</b> with nothing under it wobbles for one turn, then falls. It flattens anything it lands on, you included. Dig under one, then step aside.',
            'A sack that falls two squares or more <b>bursts into gold</b>, worth 100 points. Flattening a creature is worth 250, though another comes along later.',
            'Push a sack by walking into it from the side. Sacks cannot be pushed up or down.',
            `This level: ${NK.pl(gs.g.crea, 'creature')}, moving ${gs.g.cycle === 2 ? 'every other turn' : gs.g.cycle === 4 ? 'three turns out of four' : 'every turn'}.`,
            'Keyboard: arrow keys move. Space or W waits a turn.'],
        css: `.dg-wrap{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:center}
.dg-b{position:relative;display:grid;grid-template-columns:repeat(${_DG_W},1fr);width:min(100%,30rem);flex:0 1 30rem;background:#5b3a1e;border:4px solid #2f1d0d;border-radius:10px;overflow:hidden;touch-action:manipulation}
.dg-c{aspect-ratio:1;position:relative;background:#7a4f28;background-image:radial-gradient(circle at 30% 30%,#8e6232 8%,transparent 9%),radial-gradient(circle at 70% 65%,#654020 7%,transparent 8%)}
.dg-c.dg-t{background:#1f150c;background-image:none}
.dg-c svg{position:absolute;inset:4%;width:92%;height:92%;display:block}
.dg-pad{display:grid;grid-template-columns:repeat(3,64px);grid-template-rows:repeat(3,60px);gap:6px;justify-content:center;flex:0 0 auto}
.dg-pad .gk-btn{min-width:0;min-height:0;width:100%;height:100%;padding:0;font-size:1.5rem;justify-content:center}
.dg-wait{font-size:1rem!important;font-weight:800}
.dg-stats{font-weight:800}.dg-stats b{font-size:1.25em}
.dg-key{display:flex;flex-wrap:wrap;gap:4px 14px;justify-content:center;font-size:1rem;margin:6px 0 0}.dg-key span{display:inline-flex;align-items:center;gap:5px}.dg-key svg{width:22px;height:22px}
.dg-wob svg{animation:dg-wob .35s ease-in-out 2}
@keyframes dg-wob{0%,100%{transform:rotate(0)}30%{transform:rotate(-8deg)}70%{transform:rotate(8deg)}}
@media (prefers-reduced-motion:reduce){.dg-wob svg{animation:none}}`,
    });
}
const _dgArt = {
    me: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8" fill="#fde68a" stroke="#111" stroke-width="1.5"/><path d="M4 11a8 8 0 0 1 16 0z" fill="#f59e0b" stroke="#111" stroke-width="1.5"/><rect x="2.5" y="10" width="19" height="2.4" rx="1.2" fill="#b45309"/><circle cx="9" cy="15" r="1.3"/><circle cx="15" cy="15" r="1.3"/></svg>',
    gem: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12l4 6-10 11L2 10z" fill="#5eead4" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/><path d="M2 10h20M8.5 10 12 21l3.5-11M6 4l2.5 6L12 4l3.5 6L18 4" fill="none" stroke="#0f766e" stroke-width="1"/></svg>',
    sack: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6l-1.5 4c4 1.5 6.5 5 6.5 9 0 3.5-3 5-8 5s-8-1.500-8-5c0-4 2.500-7.500 6.500-9z" fill="#d6b27a" stroke="#fff7e6" stroke-width="1.5" stroke-linejoin="round"/><path d="M9.500 7h5" stroke="#5b3a1e" stroke-width="1.6"/><text x="12" y="17.500" text-anchor="middle" font-size="9" font-weight="900" fill="#5b3a1e">$</text></svg>',
    gold: '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="8" cy="17" rx="6" ry="3.500" fill="#fbbf24" stroke="#fff7e6"/><ellipse cx="16" cy="17" rx="6" ry="3.500" fill="#f59e0b" stroke="#fff7e6"/><ellipse cx="12" cy="11" rx="6" ry="3.500" fill="#fde047" stroke="#fff7e6"/></svg>',
    cr: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V11a8 8 0 0 1 16 0v10l-2.700-2.500L14.700 21 12 18.500 9.300 21l-2.600-2.500z" fill="#e11d48" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/><circle cx="9" cy="11" r="2.500" fill="#fff"/><circle cx="15" cy="11" r="2.500" fill="#fff"/><circle cx="9.500" cy="11.500" r="1.200"/><circle cx="15.500" cy="11.500" r="1.200"/></svg>',
};
function _dgView(gs) {
    const g = gs.g; let cells = '';
    for (let y = 0; y < g.H; y++) for (let x = 0; x < g.W; x++) {
        const s = g.sacks.find((o) => o.x === x && o.y === y); let a = '';
        if (g.px === x && g.py === y) a = _dgArt.me; else if (g.cr.some((c) => c.x === x && c.y === y)) a = _dgArt.cr; else if (s) a = _dgArt.sack; else if (g.gems.some((m) => m.x === x && m.y === y)) a = _dgArt.gem; else if (g.gold.some((m) => m.x === x && m.y === y)) a = _dgArt.gold;
        cells += `<div class="dg-c${g.dug[y][x] ? ' dg-t' : ''}${s && (s.wob || s.falling) ? ' dg-wob' : ''}" data-x="${x}" data-y="${y}">${a}</div>`;
    }
    const near = g.cr.length ? Math.min(...g.cr.map((c) => Math.abs(c.x - g.px) + Math.abs(c.y - g.py))) : null;
    const sum = `Digger at column ${g.px + 1}, row ${g.py + 1}. ${NK.pl(g.gems.length, 'gem')} left. ${near === null ? 'No creatures about.' : 'Nearest creature ' + NK.pl(near, 'square') + ' away.'}`;
    const pad = (d, ic, lb) => NK.btn(ic, `dgMove('${d}')`, { k: 'dg-' + d, label: lb, disabled: g.over });
    return `<div class="nk-top dg-stats"><span>Gems left: <b>${g.gems.length}</b></span><span>Lives: <b>${g.lives}</b></span><span>Score: <b>${g.score}</b></span></div>
      <div class="dg-wrap"><div class="dg-b" role="img" aria-label="${sum}" onclick="dgTapBoard(event)">${cells}</div>
      <div class="dg-pad"><span></span>${pad('up', '&#8593;', 'Dig up')}<span></span>${pad('left', '&#8592;', 'Dig left')}${NK.btn('Wait', 'dgMove(null)', { k: 'dg-wait', cls: 'dg-wait', label: 'Wait one turn', disabled: g.over })}${pad('right', '&#8594;', 'Dig right')}<span></span>${pad('down', '&#8595;', 'Dig down')}<span></span></div></div>
      <div class="dg-key" aria-hidden="true"><span>${_dgArt.me}You</span><span>${_dgArt.gem}Gem</span><span>${_dgArt.sack}Sack</span><span>${_dgArt.gold}Gold</span><span>${_dgArt.cr}Creature</span></div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('rotate-ccw') + 'New level', 'initDigger()', { k: 'restart' })}</div>`;
}
function dgTapBoard(e) {
    const c = e.target.closest && e.target.closest('.dg-c'); if (!c) return; const g = gameState.digger.g;
    const dx = +c.dataset.x - g.px, dy = +c.dataset.y - g.py; if (!dx && !dy) return dgMove(null);
    dgMove(Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
}
function dgMove(dir) {
    const gs = gameState.digger, g = gs.g; if (!g || g.over) return;
    const r = _dgTurn(g, dir), ev = r.ev, has = (x) => ev.includes(x);
    if (!r.moved) { gs.msg = has('wall') ? 'The edge of the field. No digging that way.' : has('sackblock') ? 'A sack is in the way. Sacks can only be pushed sideways.' : 'That sack is stuck: something is behind it.'; if (typeof sfxWrong === 'function') sfxWrong(); return NK.render('digger'); }
    if (has('win')) { gs.msg = `All gems collected! Score ${g.score}.`; NK.render('digger'); if (typeof sfxCorrect === 'function') sfxCorrect(); return NK.finish('digger', true, `All the gems collected in ${NK.pl(g.turn, 'turn')}, with ${NK.pl(g.lives, 'life', 'lives')} left. Score ${g.score}.`); }
    if (has('lost')) { gs.msg = has('sack') ? 'The sack landed on you, and that was the last life.' : 'A creature caught you, and that was the last life.'; NK.render('digger'); return NK.finish('digger', false, `Out of lives with ${NK.pl(g.gems.length, 'gem')} still in the ground. Score ${g.score}.`); }
    if (has('reset')) gs.msg = `${has('sack') ? 'A sack landed on you' : 'A creature caught you'}. Back to the start, ${NK.pl(g.lives, 'life', 'lives')} left.`;
    else if (has('flat')) gs.msg = 'Flattened a creature! 250 points.';
    else if (has('burst')) gs.msg = 'The sack burst into gold. Worth 100 points.';
    else if (has('gold')) gs.msg = 'Gold! 100 points.';
    else if (has('gem')) gs.msg = g.gems.length === 1 ? 'A gem! One more to go.' : `A gem! ${g.gems.length} more to go.`;
    else if (has('wobble')) gs.msg = 'A sack is wobbling. It falls next turn: do not stand under it.';
    else if (has('respawn')) gs.msg = 'Another creature has come down the top tunnel.';
    else if (has('push')) gs.msg = 'You pushed the sack.';
    else gs.msg = 'Keep digging.';
    if (typeof sfxFlip === 'function' && (has('gem') || has('gold') || has('flat'))) sfxFlip();
    NK.render('digger');
}
