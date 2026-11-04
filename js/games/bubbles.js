// ═══════════════════════════════════════════════════════════════════════════════
// BUBBLE POP (2026-11, nostalgia batch 3) — the aim-and-shoot bubble arcade game, at your own pace. Tap the board to
// aim (a dotted guide shows the path, bouncing off the side walls), then tap Shoot. A bubble that touches two or more
// of its own color makes a group of three or more, and the group pops; bubbles left hanging with nothing above them
// drop too. Clear the board to win. Every few shots the ceiling comes down one row; if bubbles reach the line at the
// bottom, the round is over. Easy: 4 colors, ceiling every 8 shots. Normal: 5 colors, every 7. Hard: 5 colors, every 5,
// a shorter aiming guide. Each color also has its own symbol. No clock.
// Grid: C columns; odd rows are shifted half a bubble right and hold C - 1 bubbles. Units: 1 = one bubble width.
// ═══════════════════════════════════════════════════════════════════════════════
const _BB_C = 8, _BB_ROWS = 13;
const _BB_COL = [['#dc2626', 'red', '♥'], ['#2563eb', 'blue', '◆'], ['#16a34a', 'green', '♣'], ['#ca8a04', 'yellow', '★'], ['#9333ea', 'purple', '●']];
function initBubbles() {
    NK.start('bubbles', {
        setup(gs, diff) {
            gs.diff = diff; gs.k = diff === 'easy' ? 4 : 5; gs.every = diff === 'easy' ? 8 : diff === 'hard' ? 5 : 7; gs.guide = diff === 'hard' ? 6 : 30;
            gs.g = Array.from({ length: _BB_ROWS }, (_, r) => Array(_BB_C - (r % 2)).fill(-1)); gs.shift = 0;
            for (let r = 0; r < 5; r++) for (let c = 0; c < gs.g[r].length; c++) gs.g[r][c] = Math.floor(Math.random() * gs.k);
            gs.shots = 0; gs.popped = 0; gs.ang = -Math.PI / 2; gs.over = false; gs.cur = _bbPick(gs); gs.next = _bbPick(gs); gs.trail = null;
            gs.msg = 'Tap the board to aim, then tap Shoot. Three or more of a color pop.';
        },
        view: _bbView,
        keys: { Space: () => bbShoot(), KeyS: () => bbShoot() },
        arrows(dir) { if (dir === 'left' || dir === 'right') { const gs = gameState.bubbles; gs.ang = Math.max(-Math.PI + 0.18, Math.min(-0.18, gs.ang + (dir === 'left' ? -0.06 : 0.06))); NK.render('bubbles'); return true; } return false; },
        rules: (gs) => [
            'Tap anywhere on the board to <b>aim</b>: the dotted guide shows where the bubble will go, bouncing off the side walls. Then tap <b>Shoot</b>.',
            'When the bubble stops, any group of <b>three or more</b> of its color that it touches pops. Bubbles left hanging with nothing holding them up drop as well.',
            `Clear every bubble to win. Every ${gs.every} shots the ceiling comes down one row; if a bubble reaches the dashed line at the bottom, the round is over.`,
            'The next bubble is shown beside the shooter. Each color has its own symbol too.',
            'No clock. Keyboard: Left and Right arrows aim, Space or S shoots.'],
        css: `.bb-w{position:relative;width:min(100%,26rem,max(16rem,calc((100vh - 300px) * .62)));margin:0 auto;background:linear-gradient(#1e3a8a,#172554);border-radius:16px;box-shadow:inset 0 0 0 4px #1e40af;touch-action:manipulation;cursor:crosshair}
.bb-svg{display:block;width:100%;height:auto}
.bb-row{display:flex;justify-content:center;align-items:center;gap:14px;margin:8px 0 0;font-weight:800}`,
    });
}
function _bbColorsLeft(gs) { const s = new Set(); gs.g.forEach((row) => row.forEach((v) => { if (v >= 0) s.add(v); })); return [...s]; }
function _bbPick(gs) { const left = gs.g ? _bbColorsLeft(gs) : []; const pool = left.length ? left : [...Array(gs.k).keys()]; return pool[Math.floor(Math.random() * pool.length)]; }
// centers in bubble units
const _bbX = (r, c) => c + 0.5 + (r % 2 ? 0.5 : 0);
const _bbY = (gs, r) => 0.5 + (r + gs.shift) * 0.866;
function _bbNb(gs, r, c) {
    const odd = r % 2, out = [[r, c - 1], [r, c + 1]];
    for (const dr of [-1, 1]) for (const dc of odd ? [0, 1] : [-1, 0]) out.push([r + dr, c + dc]);
    return out.filter(([y, x]) => y >= 0 && y < _BB_ROWS && x >= 0 && x < gs.g[y].length);
}
const _BB_H = (gs) => 0.5 + (_BB_ROWS) * 0.866 + 1.6;   // board height in units
// trace the shot: returns { pts (for the guide), hit: [r, c] cell where it stops }
function _bbTrace(gs, maxLen) {
    let x = _BB_C / 2, y = _BB_H(gs) - 0.8, dx = Math.cos(gs.ang), dy = Math.sin(gs.ang); const pts = [[x, y]], step = 0.12; let len = 0;
    for (let k = 0; k < 2000; k++) {
        x += dx * step; y += dy * step; len += step;
        if (x < 0.5) { x = 1 - x; dx = -dx; pts.push([x, y]); } if (x > _BB_C - 0.5) { x = 2 * (_BB_C - 0.5) - x; dx = -dx; pts.push([x, y]); }
        let touch = y <= 0.5 + gs.shift * 0.866;
        if (!touch) for (let r = 0; r < _BB_ROWS && !touch; r++) for (let c = 0; c < gs.g[r].length; c++) if (gs.g[r][c] >= 0 && Math.hypot(_bbX(r, c) - x, _bbY(gs, r) - y) < 0.86) { touch = true; break; }
        if (touch || (maxLen && len > maxLen)) { pts.push([x, y]); if (maxLen && len > maxLen && !touch) return { pts }; break; }
    }
    // snap to the nearest empty cell
    let best = null, bd = 1e9;
    for (let r = 0; r < _BB_ROWS; r++) for (let c = 0; c < gs.g[r].length; c++) { if (gs.g[r][c] >= 0) continue; const d = Math.hypot(_bbX(r, c) - x, _bbY(gs, r) - y); if (d < bd && (r === 0 || _bbNb(gs, r, c).some(([y2, x2]) => gs.g[y2][x2] >= 0) || bd > 2)) { bd = d; best = [r, c]; } }
    return { pts, hit: best };
}
function bbAim(e) {
    const gs = gameState.bubbles; if (gs.over) return;
    const b = e.currentTarget.getBoundingClientRect(), ux = (e.clientX - b.left) / b.width * _BB_C, uy = (e.clientY - b.top) / b.height * _BB_H(gs);
    const a = Math.atan2(uy - (_BB_H(gs) - 0.8), ux - _BB_C / 2); gs.ang = Math.max(-Math.PI + 0.18, Math.min(-0.18, a > 0 ? (a > Math.PI / 2 ? -Math.PI + 0.18 : -0.18) : a));
    gs.msg = 'Aim set. Tap Shoot, or tap again to change the aim.'; NK.render('bubbles');
}
function bbShoot() {
    const gs = gameState.bubbles; if (gs.over) return;
    const T = _bbTrace(gs); if (!T.hit) return; const [r, c] = T.hit; gs.g[r][c] = gs.cur; gs.shots++; gs.trail = T.pts; if (typeof sfxFlip === 'function') sfxFlip();
    // the group of the same color
    const col = gs.cur, grp = [[r, c]], seen = new Set([r + ',' + c]);
    for (let h = 0; h < grp.length; h++) for (const [y, x] of _bbNb(gs, ...grp[h])) if (!seen.has(y + ',' + x) && gs.g[y][x] === col) { seen.add(y + ',' + x); grp.push([y, x]); }
    let said = '';
    if (grp.length >= 3) {
        grp.forEach(([y, x]) => (gs.g[y][x] = -1));
        // drop anything no longer joined to the ceiling
        const hold = new Set(), st = []; gs.g[0].forEach((v, x) => { if (v >= 0) { hold.add('0,' + x); st.push([0, x]); } });
        while (st.length) { const [y, x] = st.pop(); for (const [y2, x2] of _bbNb(gs, y, x)) if (gs.g[y2][x2] >= 0 && !hold.has(y2 + ',' + x2)) { hold.add(y2 + ',' + x2); st.push([y2, x2]); } }
        let dropped = 0; gs.g.forEach((row, y) => row.forEach((v, x) => { if (v >= 0 && !hold.has(y + ',' + x)) { row[x] = -1; dropped++; } }));
        gs.popped += grp.length + dropped; said = `Pop! ${grp.length} ${_BB_COL[col][1]}${dropped ? ` and ${dropped} more dropped` : ''}.`;
        if (typeof sfxCorrect === 'function' && dropped) sfxCorrect();
    } else said = `Stuck to the ${grp.length === 2 ? 'other ' + _BB_COL[col][1] + ' one' : 'cluster'}.`;
    if (!_bbColorsLeft(gs).length) { gs.over = true; gs.msg = 'The board is clear!'; NK.render('bubbles'); if (typeof sfxCorrect === 'function') sfxCorrect(); return NK.finish('bubbles', true, `Every bubble popped in ${NK.pl(gs.shots, 'shot')}.`); }
    if (gs.shots % gs.every === 0) { gs.shift++; said += ' The ceiling came down a row.'; }
    // lost if any bubble crosses the bottom line
    const low = gs.g.some((row, y) => row.some((v) => v >= 0 && _bbY(gs, y) > _BB_H(gs) - 2.2));
    if (low) { gs.over = true; gs.msg = said + ' The bubbles reached the line.'; NK.render('bubbles'); return NK.finish('bubbles', false, `${gs.popped} bubbles popped before they reached the line. A new board is one tap away.`); }
    gs.cur = gs.next; gs.next = _bbPick(gs); if (!_bbColorsLeft(gs).includes(gs.cur)) gs.cur = _bbPick(gs);
    gs.msg = said + ` ${gs.every - (gs.shots % gs.every)} shots until the ceiling drops.`;
    NK.render('bubbles');
}
function bbNew() { initBubbles(); }
const _bbBall = (x, y, k, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${_BB_COL[k][0]}" stroke="rgba(255,255,255,.75)" stroke-width=".06"/><text x="${x}" y="${y + r * 0.36}" font-size="${r * 1.05}" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif">${_BB_COL[k][2]}</text>`;
function _bbView(gs) {
    const H = _BB_H(gs); let s = `<rect x="0" y="0" width="${_BB_C}" height="${(gs.shift * 0.866).toFixed(3)}" fill="#0f172a"/>`;
    s += `<line x1="0" y1="${H - 2.2}" x2="${_BB_C}" y2="${H - 2.2}" stroke="#fca5a5" stroke-width=".05" stroke-dasharray=".2 .15"/>`;
    gs.g.forEach((row, r) => row.forEach((v, c) => { if (v >= 0) s += _bbBall(_bbX(r, c), _bbY(gs, r), v, 0.47); }));
    if (!gs.over) { const T = _bbTrace(gs, gs.guide); s += `<polyline points="${T.pts.map((p) => p.map((v) => v.toFixed(2)).join(',')).join(' ')}" fill="none" stroke="#fde68a" stroke-width=".07" stroke-dasharray=".12 .18"/>`; }
    s += _bbBall(_BB_C / 2, H - 0.8, gs.cur, 0.47) + `<g opacity=".85">${_bbBall(_BB_C / 2 + 1.6, H - 0.6, gs.next, 0.32)}</g>`;
    const left = gs.g.flat().filter((v) => v >= 0).length;
    return `<div class="nk-top"><span>Bubbles left: <b>${left}</b></span><span>Shots: <b>${gs.shots}</b></span><span>Ceiling drops in: <b>${gs.every - (gs.shots % gs.every)}</b></span></div>
      <div class="bb-w" onclick="bbAim(event)" role="img" aria-label="bubble board, ${left} bubbles; your bubble is ${_BB_COL[gs.cur][1]}, next ${_BB_COL[gs.next][1]}"><svg class="bb-svg" viewBox="0 0 ${_BB_C} ${H.toFixed(2)}" aria-hidden="true">${s}</svg></div>
      <div class="bb-row"><span>Shooting: ${_BB_COL[gs.cur][2]} ${_BB_COL[gs.cur][1]}</span><span>Next: ${_BB_COL[gs.next][2]} ${_BB_COL[gs.next][1]}</span></div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('arrow-left'), 'gameState.bubbles.ang=Math.max(-Math.PI+0.18,gameState.bubbles.ang-0.08);NK.render(\'bubbles\')', { k: 'al', label: 'aim left', disabled: gs.over })}${NK.btn(NK.icon('crosshair') + 'Shoot', 'bbShoot()', { k: 'shoot', cls: 'gk-primary', disabled: gs.over })}${NK.btn(NK.icon('arrow-right'), 'gameState.bubbles.ang=Math.min(-0.18,gameState.bubbles.ang+0.08);NK.render(\'bubbles\')', { k: 'ar', label: 'aim right', disabled: gs.over })}${NK.btn(NK.icon('rotate-ccw') + 'New board', 'bbNew()', { k: 'restart' })}</div>`;
}
