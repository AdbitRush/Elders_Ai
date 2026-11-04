// ═══════════════════════════════════════════════════════════════════════════════
// MOON LANDING (2026-11, nostalgia batch 2) — after the turn-by-turn lunar landing games typed out on school and
// office computer terminals around 1969, years before arcade versions had a joystick. Entirely turn-based.
// Each turn you choose a throttle (0-10) and fire for 5 seconds. The Moon pulls you down at 1.62 m/s per second;
// each throttle step pushes up 0.5 m/s per second (so about 3 just holds your speed) and burns 1 unit of fuel a second.
// Touch down at or below the safe speed to win: easy 5 m/s, normal 3, hard 2. Fuel: easy 340, normal 280, hard 230
// (a careful pilot needs about 195 from the starting 800 m at 40 m/s; tuned by simulation).
// Easy and normal show what the chosen throttle would do this turn; hard leaves the sums to you.
// The log below prints each turn like the old paper terminals did.
// ═══════════════════════════════════════════════════════════════════════════════
const _ML_G = 1.62, _ML_K = 0.5, _ML_T = 5;
function _mlStep(h, v, B, fuel) {
    // the burn stops when the fuel runs out part way through the turn
    const tb = B > 0 ? Math.min(_ML_T, fuel / B) : 0;
    let t = 0, used = 0;
    for (const [dt, b] of [[tb, B], [_ML_T - tb, 0]]) {
        if (dt <= 0) continue;
        const a = _ML_G - _ML_K * b;   // downward acceleration
        // h - v t - a t^2 / 2 = 0  ->  touchdown inside this piece?
        let td = null;
        if (Math.abs(a) < 1e-9) { if (v > 0 && h / v <= dt) td = h / v; }
        else { const d = v * v + 2 * a * h; if (d >= 0) [(-v + Math.sqrt(d)) / a, (-v - Math.sqrt(d)) / a].forEach((x) => { if (x > 1e-9 && x <= dt && (td === null || x < td)) td = x; }); }
        if (td !== null) return { h: 0, v: v + a * td, t: t + td, used: used + b * td, landed: true };
        h -= v * dt + 0.5 * a * dt * dt; v += a * dt; t += dt; used += b * dt;
    }
    return { h, v, t, used, landed: false };
}
function initMoonLand() {
    NK.start('moonland', {
        setup(gs, diff) {
            gs.diff = diff; gs.safe = diff === 'easy' ? 5 : diff === 'hard' ? 2 : 3;
            gs.fuel = diff === 'easy' ? 340 : diff === 'hard' ? 230 : 280;
            gs.h = 800; gs.v = 40; gs.B = 3; gs.turn = 0; gs.log = []; gs.over = false; gs.flame = 0;
            gs.msg = `You are 800 m above the surface, falling at 40 m/s. Land at ${gs.safe} m/s or slower. Pick a throttle and press Fire.`;
        },
        view: _mlView,
        keys: Object.assign({ KeyF: () => mlFire(), Minus: () => mlSet(gameState.moonland.B - 1), Equal: () => mlSet(gameState.moonland.B + 1), NumpadSubtract: () => mlSet(gameState.moonland.B - 1), NumpadAdd: () => mlSet(gameState.moonland.B + 1), Digit0: () => mlSet(0), Numpad0: () => mlSet(0) }, NK.digits((n) => mlSet(n), 9)),
        rules: (gs) => [
            'Each turn lasts <b>5 seconds</b> of flight. Choose a <b>throttle</b> from 0 to 10, then press <b>Fire</b>.',
            'The Moon pulls you down a little faster every second. Each throttle step pushes back. A throttle of <b>about 3</b> roughly holds your speed; more slows you down, less lets you speed up.',
            'Throttle uses fuel: 1 unit per second for each step (throttle 10 for a whole turn uses 50). With no fuel, the engine stops.',
            `Touch down at <b>${gs.safe} m/s or slower</b> for a safe landing. Faster is a crash.`,
            'A good plan: fall freely for a while, then slow down steadily as the ground gets close. Fuel left over is a bonus to brag about.',
            gs.diff === 'hard' ? 'On hard, no forecast is shown: work it out from the log.' : 'The forecast line shows what your chosen throttle would do this turn.',
            'No clock: the lander waits for you. Keyboard: 0 to 9 set the throttle, + and - adjust it, F or Enter fires.'],
        enter() { mlFire(); },
        css: `.ml-scene{position:relative;max-width:min(100%,30rem);margin:0 auto;border-radius:16px;overflow:hidden;background:linear-gradient(#0b1026,#1e2a55);aspect-ratio:3/2}
.ml-scene svg{display:block;width:100%;height:100%}
.ml-gauges{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,5.6rem),1fr));gap:8px;margin:10px auto 0;max-width:30rem}
.ml-g{background:#fff3d6;border:2px solid #e8cfa8;border-radius:12px;padding:6px 8px;text-align:center}
.ml-g small{display:block;font-weight:800;color:#4a3420;font-size:.9rem;white-space:nowrap}.ml-g b{font:900 clamp(1.05rem,5.2vw,1.45rem)/1.2 Georgia,serif;white-space:nowrap}
.ml-g.ml-warn{border-color:#b91c1c;background:#fee2e2}
.ml-thr{display:flex;align-items:center;justify-content:center;gap:10px;margin:12px 0 4px;flex-wrap:wrap}
.ml-thr .ml-val{font:900 2.2rem/1 Georgia,serif;min-width:2.2em;text-align:center}
.ml-bar{display:flex;gap:3px;justify-content:center;margin:4px 0}.ml-bar i{width:clamp(14px,4vw,22px);height:16px;border-radius:3px;background:#e8cfa8}.ml-bar i.on{background:#f59e0b}
.ml-fc{text-align:center;font-size:1.05rem;color:#4a3420;min-height:1.5em}
@media (max-width:480px){.ml-log{font-size:.8rem!important}}
.ml-log{font:700 .98rem/1.45 "Courier New",monospace;background:#fffdf5;border:2px solid #e8cfa8;border-radius:12px;padding:8px 10px;margin-top:10px;overflow-x:auto;white-space:pre;color:#2b1b0d}`,
    });
}
function mlSet(b) { const gs = gameState.moonland; if (gs.over) return; gs.B = Math.max(0, Math.min(10, b)); NK.render('moonland'); }
function mlFire() {
    const gs = gameState.moonland; if (gs.over) return;
    const B = gs.fuel > 0 ? gs.B : 0;
    const r = _mlStep(gs.h, gs.v, B, gs.fuel);
    gs.turn++; gs.fuel = Math.max(0, gs.fuel - r.used); gs.flame = B;
    gs.log.push({ t: gs.turn, h: r.h, v: r.v, f: gs.fuel, b: B });
    gs.h = r.h; gs.v = r.v;
    if (typeof sfxFlip === 'function') sfxFlip();
    if (r.landed) {
        gs.over = true; const sp = Math.abs(r.v), ok = sp <= gs.safe;
        gs.msg = ok ? `Touchdown at ${sp.toFixed(1)} m/s - a safe landing, with ${Math.round(gs.fuel)} fuel to spare!` : `Touchdown at ${sp.toFixed(1)} m/s - too fast (safe is ${gs.safe} m/s or less). The lander is dented.`;
        NK.render('moonland');
        if (ok && typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('moonland', ok, ok ? `Landed at ${sp.toFixed(1)} m/s after ${NK.pl(gs.turn, 'turn')}, ${Math.round(gs.fuel)} fuel left.` : `Came down at ${sp.toFixed(1)} m/s; safe is ${gs.safe} or slower. Try slowing down a turn earlier.`);
    }
    gs.msg = gs.v < 0 ? 'You are going UP. Ease off the throttle.' : gs.fuel <= 0 ? 'Out of fuel - the engine is silent. Hold on...' : `Turn ${gs.turn} done. Choose the next throttle.`;
    NK.render('moonland');
}
function mlRestart() { initMoonLand(); }
function _mlView(gs) {
    const fc = !gs.over && gs.diff !== 'hard' ? _mlStep(gs.h, gs.v, gs.fuel > 0 ? gs.B : 0, gs.fuel) : null;
    const y = 18 + (1 - Math.min(gs.h, 900) / 900) * 150;   // lander height in the picture (0..800 m)
    const flame = gs.over ? 0 : gs.flame;
    const lander = `<g transform="translate(150 ${y.toFixed(1)})">${flame ? `<path d="M-7 14 L0 ${14 + 4 + flame * 2.4} L7 14 Z" fill="#fbbf24" stroke="#f97316" stroke-width="1.5"/>` : ''}<path d="M-12 6 h24 l4 10 h-32 z" fill="#d1d5db" stroke="#111827" stroke-width="1.5"/><circle cx="0" cy="-2" r="10" fill="#e5e7eb" stroke="#111827" stroke-width="1.5"/><circle cx="0" cy="-3" r="4" fill="#60a5fa"/><path d="M-14 16 l-6 9 M14 16 l6 9" stroke="#111827" stroke-width="2"/></g>`;
    const stars = '<g fill="#fff">' + [[20, 20], [60, 45], [100, 15], [210, 30], [260, 12], [280, 60], [40, 90], [240, 85], [180, 55]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="1.2"/>`).join('') + '</g>';
    const ground = `<path d="M0 185 Q40 178 70 186 T140 184 T210 187 T300 182 V200 H0 Z" fill="#9ca3af" stroke="#4b5563"/><ellipse cx="60" cy="191" rx="14" ry="3" fill="#6b7280"/><ellipse cx="230" cy="193" rx="18" ry="3" fill="#6b7280"/>`;
    const warn = gs.v > 15 && gs.h < 250;
    const bar = Array.from({ length: 10 }, (_, i) => `<i class="${i < gs.B ? 'on' : ''}"></i>`).join('');
    const log = ['TURN  ALTITUDE   SPEED    FUEL  THROTTLE', ...gs.log.slice(-6).map((l) => `${String(l.t).padStart(4)}  ${(l.h.toFixed(0) + ' m').padStart(8)}  ${(l.v.toFixed(1) + ' m/s').padStart(9)}  ${String(Math.round(l.f)).padStart(5)}  ${String(l.b).padStart(5)}`)].join('\n');
    return `<div class="ml-scene"><svg viewBox="0 0 300 200" role="img" aria-label="the lander, ${Math.round(gs.h)} meters up">${stars}${ground}${lander}</svg></div>
      <div class="ml-gauges"><div class="ml-g"><small>Altitude</small><b>${Math.round(gs.h)} m</b></div><div class="ml-g${warn ? ' ml-warn' : ''}"><small>Falling at</small><b>${gs.v.toFixed(1)} m/s</b></div><div class="ml-g${gs.fuel < 50 ? ' ml-warn' : ''}"><small>Fuel</small><b>${Math.round(gs.fuel)}</b></div></div>
      ${gs.over ? '' : `<div class="ml-thr">${NK.btn('<span style="font-size:1.6rem;font-weight:900">-</span>', 'mlSet(gameState.moonland.B-1)', { k: 'minus', label: 'less throttle' })}<span class="ml-val" aria-live="polite" aria-label="throttle ${gs.B}">${gs.B}</span>${NK.btn('<span style="font-size:1.6rem;font-weight:900">+</span>', 'mlSet(gameState.moonland.B+1)', { k: 'plus', label: 'more throttle' })}</div>
      <div class="ml-bar" aria-hidden="true">${bar}</div>
      <div class="gk-btns">${NK.btn('Off (0)', 'mlSet(0)', { k: 'b0', pressed: gs.B === 0 })}${NK.btn('Hold (3)', 'mlSet(3)', { k: 'b3', pressed: gs.B === 3 })}${NK.btn('Full (10)', 'mlSet(10)', { k: 'b10', pressed: gs.B === 10 })}</div>
      <div class="ml-fc">${fc ? (fc.landed ? `Forecast: touchdown this turn at ${Math.abs(fc.v).toFixed(1)} m/s.` : `Forecast: ${Math.round(fc.h)} m up, falling at ${fc.v.toFixed(1)} m/s, ${Math.round(Math.max(0, gs.fuel - fc.used))} fuel left.`) : ''}</div>`}
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${gs.over ? '' : NK.btn(NK.icon('rocket') + 'Fire for 5 seconds', 'mlFire()', { cls: 'gk-primary', k: 'fire' })}${NK.btn(NK.icon('rotate-ccw') + 'New landing', 'mlRestart()', { k: 'restart' })}</div>
      <div class="ml-log" aria-label="flight log">${gs.log.length ? log : '<span style="white-space:normal">The flight log prints here, one line per turn.</span>'}</div>`;
}
