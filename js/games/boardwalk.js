// ═══════════════════════════════════════════════════════════════════════════════
// BOARDWALK ROLL (2026-11, nostalgia batch) — an original take on the ball-rolling lanes of seaside arcades and
// county fairs. Nine balls a game. Turn-based: nothing moves until you press Roll, so there is no time pressure.
// (An optional "Moving aim" switch makes the aim mark swing side to side, arcade style. It is off by default.)
// You place the aim mark (arrows, or tap the board), then Roll. Every lane leans a little: the ball drifts the
// same way each time in one game (a new lean every game). Where your balls land stays marked, so you can see the
// lean and correct for it - that is the skill. A small random wobble is added to every ball.
// Rings (radius in board units): 50 = 13, 40 = 30, 30 = 50, 20 = 74, 10 = 104; two small 100 cups in the top corners. Off the rings = 0.
// Goal: easy 220, normal 270, hard 310 (a simulated player who corrects for the lean averages 360-410). Lean: easy small, normal medium, hard large; the wobble grows a little too.
// Board coordinates: SVG viewBox 0 0 300 420; the ring board is the top part, the lane runs down to the start.
// ═══════════════════════════════════════════════════════════════════════════════
const _BW = { cx: 150, cy: 128, rings: [[13, 50], [30, 40], [50, 30], [74, 20], [104, 10]], cups: [[34, 30], [266, 30]], cupR: 13, balls: 9 };
function initBoardwalk(container) {
    const gs = gameState.boardwalk;
    const diff = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
    const lean = diff === 'easy' ? 14 : diff === 'hard' ? 34 : 24;
    gs.goal = diff === 'easy' ? 220 : diff === 'hard' ? 310 : 270;
    gs.wob = diff === 'easy' ? 6 : diff === 'hard' ? 10 : 8;
    const a = Math.random() * Math.PI * 2, m = lean * (0.6 + Math.random() * 0.4);
    gs.drift = [Math.round(Math.cos(a) * m), Math.round(Math.sin(a) * m * 0.7)];
    gs.aim = [_BW.cx, _BW.cy]; gs.shots = []; gs.score = 0; gs.over = false; gs.rolling = false;
    try { gs.swing = localStorage.getItem('gg_bw_swing') === '1'; } catch (e) { gs.swing = false; }
    gs.msg = 'Move the aim mark with the arrow buttons (or tap the board), then press Roll. The lane may lean a little.';
    _bwStopSwing(gs);
    const onKey = (e) => {
        if (gameState.currentId !== 'boardwalk' || gs.over) return;
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        const k = e.key, step = e.shiftKey ? 2 : 6;
        const mv = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[k];
        if (mv) { bwMove(mv[0], mv[1]); }
        else if (k === 'Enter' || k === ' ') { if (e.target && e.target.tagName === 'BUTTON' && e.target.closest('#gameContent')) e.target.click(); else bwRoll(); }
        else return;
        e.preventDefault(); e.stopPropagation();   // this game owns the arrow keys (the shared arrow-key focus helper is skipped)
    };
    window.addEventListener('keydown', onKey, true);
    window._gameCleanup = () => { window.removeEventListener('keydown', onKey, true); _bwStopSwing(gs); cancelAnimationFrame(gs._raf); };
    _bwRender();
    if (gs.swing) _bwStartSwing(gs);
}
function _bwPoints(x, y) {
    for (const [cx, cy] of _BW.cups) if (Math.hypot(x - cx, y - cy) <= _BW.cupR) return 100;
    const d = Math.hypot(x - _BW.cx, y - _BW.cy);
    for (const [r, p] of _BW.rings) if (d <= r) return p;
    return 0;
}
const _bwClamp = (v, a, b) => Math.max(a, Math.min(b, v));
function bwMove(dx, dy) {
    const gs = gameState.boardwalk; if (gs.over || gs.rolling) return;
    gs.aim = [_bwClamp(gs.aim[0] + dx, 14, 286), _bwClamp(gs.aim[1] + dy, 14, 250)];
    _bwDrawAim();
}
function bwSetAim(ev) {
    const gs = gameState.boardwalk; if (gs.over || gs.rolling || gs.swing) return;
    const svg = document.querySelector('.bw-svg'); if (!svg) return;
    const r = svg.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * 300, y = (ev.clientY - r.top) / r.height * 420;
    if (y > 262) return;   // the lane itself is not a target
    gs.aim = [_bwClamp(x, 14, 286), _bwClamp(y, 14, 250)];
    _bwDrawAim();
}
function _bwDrawAim() {
    const gs = gameState.boardwalk, m = document.getElementById('bw-aim');
    if (m) m.setAttribute('transform', `translate(${gs.aim[0].toFixed(1)},${gs.aim[1].toFixed(1)})`);
    const p = document.getElementById('bw-aimpts'); if (p) p.textContent = `The aim mark is on: ${_bwPoints(gs.aim[0], gs.aim[1]) || 'no ring'}${_bwPoints(gs.aim[0], gs.aim[1]) ? ' points' : ''}`;
}
function _bwGauss() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function bwRoll() {
    const gs = gameState.boardwalk; if (gs.over || gs.rolling) return;
    _bwStopSwing(gs);
    const tx = _bwClamp(gs.aim[0] + gs.drift[0] + _bwGauss() * gs.wob, 4, 296), ty = _bwClamp(gs.aim[1] + gs.drift[1] + _bwGauss() * gs.wob, 4, 258);
    const pts = _bwPoints(tx, ty);
    gs.rolling = true;
    const shot = { aim: gs.aim.slice(), at: [tx, ty], pts };
    if (typeof sfxFlip === 'function') sfxFlip();
    const done = () => {
        gs.rolling = false; gs.shots.push(shot); gs.score += pts;
        if (pts >= 40 && typeof sfxCorrect === 'function') sfxCorrect();
        const dx = tx - shot.aim[0], dy = ty - shot.aim[1];
        const way = [Math.abs(dx) > 5 ? (dx > 0 ? 'right' : 'left') : '', Math.abs(dy) > 5 ? (dy > 0 ? 'short (lower)' : 'long (higher)') : ''].filter(Boolean).join(' and ');
        const left = _BW.balls - gs.shots.length;
        gs.msg = (pts === 100 ? '100 - right in the cup! ' : pts ? `${pts} points. ` : 'Off the rings - 0 points. ')
            + (way ? `That ball landed ${way} of your aim.` : 'It landed close to your aim.')
            + (left ? ` ${left} ball${left === 1 ? '' : 's'} left.` : '');
        if (!left) return _bwEnd();
        _bwRender();
        if (gs.swing) _bwStartSwing(gs);
    };
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    _bwRender();
    const ball = document.getElementById('bw-ball');
    if (!ball || reduce) return done();
    const t0 = performance.now(), D = 950, sx = 150, sy = 404;
    const step = (now) => {
        if (gameState.currentId !== 'boardwalk') return;
        const t = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - t, 2);
        // up the lane, a hop off the ramp, then a drop into the ring
        const x = sx + (tx - sx) * e, y = sy + (ty - sy) * e, hop = Math.sin(Math.min(1, Math.max(0, (t - 0.45) / 0.55)) * Math.PI) * 0.45;
        ball.setAttribute('cx', x.toFixed(1)); ball.setAttribute('cy', y.toFixed(1)); ball.setAttribute('r', (11 * (1 + hop) * (1 - 0.35 * e)).toFixed(1));
        if (t < 1) gs._raf = requestAnimationFrame(step); else done();
    };
    gs._raf = requestAnimationFrame(step);
}
function _bwEnd() {
    const gs = gameState.boardwalk; gs.over = true;
    const win = gs.score >= gs.goal;
    try { const b = +localStorage.getItem('gg_bw_best') || 0; if (gs.score > b) localStorage.setItem('gg_bw_best', gs.score); } catch (e) {}
    gs.msg = `All ${_BW.balls} balls rolled: ${gs.score} points (goal ${gs.goal}).`;
    _bwRender();
    GameKit.finish('boardwalk', win, win ? `${gs.score} points with ${_BW.balls} balls - prize-ticket territory!` : `${gs.score} points; the goal was ${gs.goal}. The next lane will lean a different way.`);
}
function bwToggleSwing() {
    const gs = gameState.boardwalk; if (gs.over) return;
    gs.swing = !gs.swing;
    try { localStorage.setItem('gg_bw_swing', gs.swing ? '1' : '0'); } catch (e) {}
    _bwStopSwing(gs);
    gs.msg = gs.swing ? 'Moving aim is on: the mark swings side to side. Press Roll when it is where you want it. Up and down still set the distance.' : 'Moving aim is off. Nothing moves until you press Roll.';
    _bwRender();
    if (gs.swing) _bwStartSwing(gs);
}
function _bwStartSwing(gs) {
    _bwStopSwing(gs); let dir = 1;
    gs._sw = setInterval(() => {
        if (gameState.currentId !== 'boardwalk' || gs.over || gs.rolling) return;
        let x = gs.aim[0] + dir * 2.2; if (x > 280 || x < 20) { dir = -dir; x = _bwClamp(x, 20, 280); }
        gs.aim[0] = x; _bwDrawAim();
    }, 30);
}
function _bwStopSwing(gs) { clearInterval(gs._sw); gs._sw = null; }
function bwRestart() { initBoardwalk(document.getElementById('gameContent')); }
function _bwRender() {
    const gs = gameState.boardwalk, el = document.getElementById('gameContent');
    if (!el || gameState.currentId !== 'boardwalk') return;
    const { cx, cy } = _BW;
    const ringCols = ['#b91c1c', '#9a3412', '#854d0e', '#166534', '#1d4ed8'];   // ring labels: 5.4:1 or better on the cream rings (bold, large)
    let rings = '';
    for (let i = _BW.rings.length - 1; i >= 0; i--) { const [r, p] = _BW.rings[i]; rings += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${i % 2 ? '#fff7e6' : '#fde7c4'}" stroke="${ringCols[i]}" stroke-width="5"/>`; }
    const labels = _BW.rings.map(([r, p], i) => `<text x="${cx}" y="${i ? cy - r + 15 : cy + 7}" class="bw-lab" fill="${ringCols[i]}">${p}</text>`).join('');
    const cups = _BW.cups.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${_BW.cupR + 3}" fill="#fff7e6" stroke="#7e22ce" stroke-width="5"/><text x="${x}" y="${y + 6}" class="bw-lab bw-sm" fill="#6b21a8">100</text>`).join('');
    const marks = gs.shots.map((s, i) => `<g class="bw-mk"><line x1="${s.aim[0]}" y1="${s.aim[1]}" x2="${s.at[0]}" y2="${s.at[1]}" stroke="#4a3420" stroke-width="1.5" stroke-dasharray="3 3"/><circle cx="${s.at[0]}" cy="${s.at[1]}" r="8" fill="#1f2937" stroke="#fff" stroke-width="2"/><text x="${s.at[0]}" y="${s.at[1] + 4}" class="bw-n">${i + 1}</text></g>`).join('');
    const [ax, ay] = gs.aim;
    const left = _BW.balls - gs.shots.length;
    const balls = Array.from({ length: _BW.balls }, (_, i) => `<span class="bw-b${i < gs.shots.length ? ' bw-used' : ''}" aria-hidden="true"></span>`).join('');
    const ap = _bwPoints(ax, ay);
    const pad = (lab, f, icon) => `<button type="button" class="bw-pad" onclick="${f}" aria-label="${lab}"${gs.over || gs.rolling ? ' disabled' : ''}>${Icon.svg(icon, { size: '28px', sw: 3 })}</button>`;
    el.innerHTML = `<div class="bw" dir="ltr">
      <div class="bw-top"><span>Score <b>${gs.score}</b></span><span>Goal <b>${gs.goal}</b></span><span class="bw-balls" aria-label="${left} balls left">${balls}</span></div>
      <div class="bw-msg" role="status" aria-live="polite">${gs.msg}</div>
      <div class="bw-wrap">
        <svg class="bw-svg" viewBox="0 0 300 420" onclick="bwSetAim(event)" role="img" aria-label="ring board and lane">
          <defs><linearGradient id="bw-lane" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c48a4a"/><stop offset="1" stop-color="#8a5a2b"/></linearGradient></defs>
          <rect x="0" y="0" width="300" height="262" rx="18" fill="#fffaf1" stroke="#6b4220" stroke-width="6"/>
          ${rings}${labels}${cups}
          <path d="M60 262 L240 262 L270 420 L30 420 Z" fill="url(#bw-lane)" stroke="#6b4220" stroke-width="4"/>
          <path d="M150 268 L150 416" stroke="#fde7c4" stroke-width="2" stroke-dasharray="8 8"/>
          <path d="M110 300 h80 M100 340 h100 M90 380 h120" stroke="rgba(255,247,230,.35)" stroke-width="2"/>
          ${marks}
          <g id="bw-aim" transform="translate(${ax},${ay})" ${gs.over ? 'style="display:none"' : ''}><circle r="13" fill="none" stroke="#111827" stroke-width="3.5"/><circle r="13" fill="none" stroke="#fbbf24" stroke-width="1.5"/><path d="M-21 0h10M11 0h10M0 -21v10M0 11v10" stroke="#111827" stroke-width="3.5" stroke-linecap="round"/></g>
          ${gs.rolling ? '<circle id="bw-ball" cx="150" cy="404" r="11" fill="#7c2d12" stroke="#fff7e6" stroke-width="3"/>' : gs.over ? '' : '<circle cx="150" cy="404" r="11" fill="#7c2d12" stroke="#fff7e6" stroke-width="3"/>'}
        </svg>
        <div class="bw-ctl">
          <div class="bw-pads"><span></span>${pad('aim further up', 'bwMove(0,-6)', 'arrow-up')}<span></span>${pad('aim left', 'bwMove(-6,0)', 'arrow-left')}${GameKit.btn('Roll', 'bwRoll()', { cls: 'gk-primary bw-roll', disabled: gs.over || gs.rolling })}${pad('aim right', 'bwMove(6,0)', 'arrow-right')}<span></span>${pad('aim further down', 'bwMove(0,6)', 'arrow-down')}<span></span></div>
          <div class="bw-aimpts" id="bw-aimpts">The aim mark is on: ${ap ? ap + ' points' : 'no ring'}</div>
        </div>
      </div>
      <div class="gk-btns">${GameKit.btn((gs.swing ? 'Moving aim: ON' : 'Moving aim: OFF'), 'bwToggleSwing()', { disabled: gs.over })}${GameKit.btn(GameKit.icon('rotate-ccw') + 'New game', 'bwRestart()')}</div>
      <details class="bw-rules"><summary>How to play</summary><ul>
        <li>Put the aim mark where you want the ball to land: use the arrow buttons, the arrow keys, or tap the board.</li>
        <li>Press <b>Roll</b> (or Enter). Rings score 50 in the middle, then 40, 30, 20, 10. The small cups in the top corners score 100.</li>
        <li>Each lane <b>leans</b> a little, the same way for the whole game. Your balls stay on the board with a dotted line back to where you aimed - aim the other way to make up for it.</li>
        <li>Nine balls a game. Reach the goal score to win.</li>
        <li>Nothing moves until you press Roll. For an arcade feel, switch on <b>Moving aim</b>: the mark swings and you roll when it is right.</li></ul></details>
    </div>
    <style>
      .bw{width:100%;box-sizing:border-box;max-width:46rem;margin:0 auto;color:#2b1b0d}
      .bw-top{display:flex;justify-content:space-between;align-items:center;font-size:1.15rem;margin:0 2px 10px;gap:8px;flex-wrap:wrap}
      .bw-balls{display:inline-flex;gap:4px}
      .bw-b{width:16px;height:16px;border-radius:50%;background:#7c2d12;border:2px solid #4d2f15}.bw-b.bw-used{background:transparent;border:2px dashed #a08360}
      .bw-wrap{display:flex;gap:16px;align-items:center;justify-content:center}
      .bw-svg{width:min(100%,360px);height:auto;max-height:62vh;display:block;cursor:crosshair;touch-action:manipulation;flex:0 1 auto}
      .bw-lab{font:900 15px Georgia,serif;text-anchor:middle;pointer-events:none}.bw-sm{font-size:12px}
      .bw-n{font:800 10px sans-serif;fill:#fff;text-anchor:middle;pointer-events:none}
      .bw-mk{pointer-events:none}
      .bw-ctl{display:flex;flex-direction:column;align-items:center;gap:8px;flex:0 0 auto}
      .bw-pads{display:grid;grid-template-columns:repeat(3,64px);grid-template-rows:repeat(3,64px);gap:6px}
      .bw-pad{border-radius:14px;border:2px solid #c9a46a;background:#fff7e6;color:#3b1d0e;display:flex;align-items:center;justify-content:center;cursor:pointer}
      .bw-pad:disabled,.bw .gk-btn:disabled{opacity:.45}
      .bw-roll{min-width:64px;padding:0;font-size:1.15rem}
      .bw-aimpts{font-weight:700;font-size:1rem;color:#4a3420;text-align:center;min-height:1.4em}
      .bw-msg{text-align:center;font-weight:800;font-size:1.1rem;margin:0 4px 10px;min-height:3em;background:#fff3d6;border-radius:12px;padding:8px 10px}
      .bw .gk-btn{border-color:#c9a46a}
      .bw-rules{background:#fff3d6;border:2px solid #e8cfa8;border-radius:14px;padding:10px 14px;margin-top:6px;font-size:1.05rem}
      .bw-rules summary{font-weight:800;cursor:pointer;min-height:44px;display:flex;align-items:center}
      .bw-rules li{margin:6px 0 6px 1.1em;list-style:disc}
      @media (max-width:640px){.bw-wrap{flex-direction:column;gap:8px}.bw-svg{max-height:52vh}}
      #gameContent .bw button.bw-pad{border-radius:14px!important}#gameContent .bw button.bw-pad:hover{transform:none}
    </style>`;
}
