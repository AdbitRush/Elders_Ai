// ═══════════════════════════════════════════════════════════════════════════════
// PICK-UP STICKS (2026-11, nostalgia batch 2) — the toy-box game of a dropped bundle of thin colored sticks.
// Solo, no clock: your eyes do the work, not your fingers.
// Take the sticks away one at a time. Only a stick with NOTHING lying on top of it can be lifted cleanly; lifting a
// covered one "jiggles" the pile. Clear the whole pile with fewer than 3 jiggles to win. Points are just for fun:
// yellow 1, green 2, blue 3, red 5, and the one black stick 10.
// Tapping near a stick picks it (shown with a white glow); press Pick up to lift it. Left/right arrows step
// through the sticks. Easy 12 sticks (with a "Show free sticks" help), normal 18, hard 24.
// Sticks are line segments drawn in order: a later stick lies on top of an earlier one wherever they cross.
// ═══════════════════════════════════════════════════════════════════════════════
const _SK_KIND = [['#facc15', '#713f12', 'yellow', 1], ['#16a34a', '#052e16', 'green', 2], ['#2563eb', '#172554', 'blue', 3], ['#dc2626', '#450a0a', 'red', 5]];
function _skCross(a, b) {
    // segments within 9 units of each other count as touching (the sticks are thick)
    const d = (p, q, r) => { const vx = r[0] - q[0], vy = r[1] - q[1], L = vx * vx + vy * vy, t = Math.max(0, Math.min(1, ((p[0] - q[0]) * vx + (p[1] - q[1]) * vy) / L)); return Math.hypot(p[0] - q[0] - t * vx, p[1] - q[1] - t * vy); };
    const o = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
    if (o(a.p, a.q, b.p) !== o(a.p, a.q, b.q) && o(b.p, b.q, a.p) !== o(b.p, b.q, a.q)) return true;
    return Math.min(d(a.p, b.p, b.q), d(a.q, b.p, b.q), d(b.p, a.p, a.q), d(b.q, a.p, a.q)) < 9;
}
function initSticks() {
    NK.start('sticks', {
        setup(gs, diff) {
            const n = diff === 'easy' ? 12 : diff === 'hard' ? 24 : 18;
            gs.help = diff === 'easy'; gs.showFree = false;
            gs.st = Array.from({ length: n }, (_, i) => {
                // both ends stay on the board (14 units in from the edge), so no crossing is ever hidden
                const a = Math.random() * Math.PI, L = 150 + Math.random() * 70, hx = Math.abs(Math.cos(a)) * L / 2, hy = Math.abs(Math.sin(a)) * L / 2;
                const cx = 14 + hx + Math.random() * (272 - 2 * hx), cy = 14 + hy + Math.random() * (272 - 2 * hy);
                const k = i === Math.floor(n / 2) ? 4 : [0, 0, 0, 1, 1, 2, 2, 3][Math.floor(Math.random() * 8)];
                return { p: [cx - Math.cos(a) * L / 2, cy - Math.sin(a) * L / 2], q: [cx + Math.cos(a) * L / 2, cy + Math.sin(a) * L / 2], k, gone: false };
            });
            gs.sel = -1; gs.jig = 0; gs.pts = 0; gs.over = false; gs.lastJig = -1;
            gs.msg = 'Tap a stick, then press Pick up. Only lift sticks with nothing on top of them.';
        },
        view: _skView,
        arrows(dir) { if (dir === 'left' || dir === 'right') { skStep(dir === 'right' ? 1 : -1); return true; } return false; },
        enter() { skLift(); },
        keys: { KeyP: () => skLift() },
        rules: (gs) => [
            'Lift the sticks away one at a time. A stick can be lifted cleanly only if <b>no other stick lies on top of it</b> anywhere along its length.',
            'Lifting a stick that is covered <b>jiggles</b> the pile (it stays put). Clear every stick with <b>fewer than 3 jiggles</b> to win.',
            'Tap on or near a stick: it glows white. Check it is the one you meant, then press <b>Pick up</b>.',
            'Look closely where two sticks cross: the one drawn on top is the one you can see unbroken.',
            'Points, just for fun: yellow 1, green 2, blue 3, red 5, black 10.',
            (gs.help ? 'On easy, <b>Show free sticks</b> outlines the sticks you can lift right now. ' : '') + 'No clock. Keyboard: left and right arrows step through the sticks, Enter or P lifts.'],
        css: `.sk-wrap{max-width:min(100%,30rem);margin:0 auto}
.sk-svg{width:100%;height:auto;display:block;background:radial-gradient(circle at 50% 40%,#fdf6e3,#efe0bd);border:3px solid #c9a46a;border-radius:16px;touch-action:manipulation;cursor:pointer}
.sk-jig{display:inline-flex;gap:4px}.sk-jig i{width:16px;height:16px;border-radius:50%;border:2px solid #b91c1c;display:inline-block}.sk-jig i.on{background:#b91c1c}`,
    });
}
const _skKind = (k) => (k === 4 ? ['#111827', '#000', 'black', 10] : _SK_KIND[k]);
const _skFree = (gs, i) => gs.st.every((s, j) => j <= i || s.gone || !_skCross(gs.st[i], s));
function skTapSvg(ev) {
    const gs = gameState.sticks; if (gs.over) return;
    const svg = ev.currentTarget, m = svg.getScreenCTM().inverse(), x = m.a * ev.clientX + m.c * ev.clientY + m.e, y = m.b * ev.clientX + m.d * ev.clientY + m.f;   // screen -> board units
    let best = -1, bd = 1e9;
    gs.st.forEach((s, i) => {
        if (s.gone) return;
        const vx = s.q[0] - s.p[0], vy = s.q[1] - s.p[1], t = Math.max(0, Math.min(1, ((x - s.p[0]) * vx + (y - s.p[1]) * vy) / (vx * vx + vy * vy)));
        const d = Math.hypot(x - s.p[0] - t * vx, y - s.p[1] - t * vy);
        if (d < bd - 0.5 || (Math.abs(d - bd) <= 0.5 && i > best)) { bd = d; best = i; }
    });
    if (best < 0 || bd > 22) { gs.sel = -1; gs.msg = 'No stick there. Tap right on a stick.'; return NK.render('sticks'); }
    gs.sel = best; gs.msg = `The ${_skKind(gs.st[best].k)[2]} stick glows white. Press Pick up to lift it.`;
    NK.render('sticks');
}
function skStep(d) {
    const gs = gameState.sticks; if (gs.over) return;
    const live = gs.st.map((s, i) => (s.gone ? -1 : i)).filter((i) => i >= 0); if (!live.length) return;
    const k = live.indexOf(gs.sel); gs.sel = live[(k < 0 ? 0 : k + d + live.length) % live.length];
    gs.msg = `The ${_skKind(gs.st[gs.sel].k)[2]} stick glows white.`; NK.render('sticks');
}
function skLift() {
    const gs = gameState.sticks; if (gs.over) return;
    if (gs.sel < 0) { gs.msg = 'First tap a stick to pick it.'; return NK.render('sticks'); }
    const i = gs.sel, s = gs.st[i];
    if (!_skFree(gs, i)) {
        gs.jig++; gs.lastJig = i; if (typeof sfxWrong === 'function') sfxWrong();
        if (gs.jig >= 3) { gs.over = true; gs.msg = 'Jiggle! That is three - the pile has had enough for this round.'; NK.render('sticks'); return NK.finish('sticks', false, `Three jiggles with ${NK.pl(gs.st.filter((x) => !x.gone).length, 'stick')} left. Look for sticks with nothing crossing over them.`); }
        gs.msg = `Jiggle! Another stick lies on top of that one. ${NK.pl(3 - gs.jig, 'jiggle')} left before the round ends.`;
        return NK.render('sticks');
    }
    s.gone = true; gs.pts += _skKind(s.k)[3]; gs.sel = -1; gs.lastJig = -1;
    if (typeof sfxFlip === 'function') sfxFlip();
    const left = gs.st.filter((x) => !x.gone).length;
    if (!left) { gs.over = true; gs.msg = `Pile cleared with ${NK.pl(gs.jig, 'jiggle')}: ${gs.pts} points!`; NK.render('sticks'); if (typeof sfxCorrect === 'function') sfxCorrect(); return NK.finish('sticks', true, `All sticks lifted, ${NK.pl(gs.jig, 'jiggle')}, ${NK.pl(gs.pts, 'point')}.`); }
    gs.msg = `Lifted the ${_skKind(s.k)[2]} stick (+${_skKind(s.k)[3]}). ${NK.pl(left, 'stick')} to go.`;
    NK.render('sticks');
}
function skFreeToggle() { const gs = gameState.sticks; if (!gs.help || gs.over) return; gs.showFree = !gs.showFree; NK.render('sticks'); }
function skNew() { initSticks(); }
function _skView(gs) {
    let lines = '';
    gs.st.forEach((s, i) => {
        if (s.gone) return;
        const [c, dark] = _skKind(s.k), sel = gs.sel === i, free = gs.showFree && _skFree(gs, i);
        const xy = `x1="${s.p[0].toFixed(1)}" y1="${s.p[1].toFixed(1)}" x2="${s.q[0].toFixed(1)}" y2="${s.q[1].toFixed(1)}"`;
        lines += (sel ? `<line ${xy} stroke="#fff" stroke-width="17" stroke-linecap="round"/><line ${xy} stroke="#1d4ed8" stroke-width="12" stroke-linecap="round"/>` : free ? `<line ${xy} stroke="#15803d" stroke-width="13" stroke-linecap="round" stroke-dasharray="6 4"/>` : '')
            + `<line ${xy} stroke="${dark}" stroke-width="8" stroke-linecap="round"/><line ${xy} stroke="${c}" stroke-width="5" stroke-linecap="round"/>`;
    });
    const left = gs.st.filter((x) => !x.gone).length;
    const jig = [0, 1, 2].map((k) => `<i class="${k < gs.jig ? 'on' : ''}"></i>`).join('');
    return `<div class="nk-top"><span>Sticks left: <b>${left}</b></span><span>Points: <b>${gs.pts}</b></span><span class="sk-jig" aria-label="${gs.jig} jiggles of 3">Jiggles ${jig}</span></div>
      <div class="sk-wrap"><svg class="sk-svg" viewBox="0 0 300 300" onclick="skTapSvg(event)" role="img" aria-label="the pile of sticks, ${left} left">${lines}</svg></div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('arrow-left'), 'skStep(-1)', { k: 'prev', label: 'previous stick', disabled: gs.over })}${NK.btn('Pick up', 'skLift()', { cls: 'gk-primary', k: 'lift', disabled: gs.over || gs.sel < 0 })}${NK.btn(NK.icon('arrow-right'), 'skStep(1)', { k: 'next', label: 'next stick', disabled: gs.over })}</div>
      <div class="gk-btns">${gs.help ? NK.btn(gs.showFree ? 'Hide free sticks' : 'Show free sticks', 'skFreeToggle()', { k: 'free', pressed: gs.showFree, disabled: gs.over }) : ''}${NK.btn(NK.icon('rotate-ccw') + 'New pile', 'skNew()', { k: 'restart' })}</div>`;
}
