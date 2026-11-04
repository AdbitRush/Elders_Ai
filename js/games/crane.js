// ═══════════════════════════════════════════════════════════════════════════════
// CLAW CRANE (2026-11, nostalgia batch 3) — the glass-box prize grabber from the diner and the boardwalk, at your
// own pace and with free play tokens (no money). Slide the claw left and right, then press Drop. The claw comes down,
// closes, and lifts: a prize hung close to the middle of the claw comes up and goes to the chute; a prize caught off
// center may slip, and a nudged prize rolls a little. Win the round by landing the target number of prizes with your
// tokens. Easy: 3 prizes in 10 tokens, a steady claw. Normal: 3 in 9. Hard: 4 in 10, a slippery claw. No clock.
// Positions are in 0..100 across the floor of the box; the claw moves in steps of 4.
// ═══════════════════════════════════════════════════════════════════════════════
const _CN_PR = [['teddy bear', '#b45309'], ['rubber duck', '#facc15'], ['bouncy ball', '#ef4444'], ['plush star', '#a855f7'], ['toy frog', '#22c55e'], ['little whale', '#3b82f6'], ['kitten', '#f97316'], ['penguin', '#334155']];
function initCrane() {
    NK.start('crane', {
        setup(gs, diff) {
            gs.diff = diff; gs.tok = diff === 'normal' ? 9 : 10; gs.goal = diff === 'hard' ? 4 : 3; gs.won = []; gs.x = 50; gs.state = 'idle'; gs.over = false;
            const kinds = shuffle(_CN_PR.map((p, i) => i)); gs.pr = [];
            for (let k = 0; k < 6; k++) { let x; let t = 0; do x = 20 + Math.random() * 74; while (t++ < 80 && gs.pr.some((p) => Math.abs(p.x - x) < 13)); if (gs.pr.some((p) => Math.abs(p.x - x) < 13)) continue; gs.pr.push({ x, k: kinds[k % kinds.length], w: 0.75 + Math.random() * 0.5 }); }
            gs.msg = `Slide the claw over a prize and press Drop. Land ${gs.goal} prizes with ${gs.tok} free tokens.`;
        },
        view: _cnView,
        keys: { Space: () => cnDrop(), KeyD: () => cnDrop() },
        arrows(dir) { if (dir === 'left' || dir === 'right') { cnMove(dir === 'left' ? -1 : 1); return true; } return false; },
        rules: (gs) => [
            'Slide the claw with the arrow buttons (or the arrow keys), then press <b>Drop</b>. Each drop uses one free token.',
            'A prize right under the middle of the claw is grabbed firmly and carried to the chute. A prize caught near the edge of the claw may slip; a miss can nudge a prize a little.',
            'Heavier-looking prizes slip more easily. The shadow under the claw shows exactly where it will come down.',
            `Land <b>${gs.goal} prizes</b> with your <b>${gs.tok} tokens</b> to win the round. No money, no clock.`,
            'Keyboard: Left and Right arrows slide the claw, Space or D drops.'],
        css: `.cn-box{position:relative;width:min(100%,28rem,max(18rem,calc((100vh - 330px) * .95)));margin:0 auto;border-radius:18px;background:linear-gradient(#fda4af,#fb7185);padding:10px;box-shadow:inset 0 0 0 4px #be123c}
.cn-svg{display:block;width:100%;height:auto;border-radius:10px;background:linear-gradient(#e0f2fe,#bae6fd 60%,#7dd3fc)}
.cn-ctl{display:flex;justify-content:center;gap:10px;margin:12px 0 0}
.cn-ctl .gk-btn{min-width:64px}
.cn-won{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:6px 0 0;font-weight:800;min-height:28px}
.cn-won span{background:#fff7e6;border:2px solid #fde7c4;border-radius:999px;padding:2px 10px}`,
    });
}
function cnMove(d) { const gs = gameState.crane; if (gs.over || gs.state !== 'idle') return; gs.x = Math.max(8, Math.min(96, gs.x + d * 4)); const p = _cnUnder(gs); gs.msg = p ? `Over the ${_CN_PR[p.k][0]}${Math.abs(p.x - gs.x) <= 3 ? ', right in the middle' : ''}.` : ''; NK.render('crane'); }
const _cnUnder = (gs) => gs.pr.reduce((best, p) => (Math.abs(p.x - gs.x) < 9 && (!best || Math.abs(p.x - gs.x) < Math.abs(best.x - gs.x)) ? p : best), null);
function cnDrop() {
    const gs = gameState.crane; if (gs.over || gs.state !== 'idle' || !gs.tok) return;
    gs.tok--; gs.state = 'down'; gs.msg = 'Down comes the claw...'; if (typeof sfxFlip === 'function') sfxFlip(); NK.render('crane');
    NK.after(700, () => {
        const p = _cnUnder(gs), off = p ? Math.abs(p.x - gs.x) : 99;
        const firm = gs.diff === 'easy' ? 0.97 : gs.diff === 'hard' ? 0.8 : 0.9, edge = gs.diff === 'easy' ? 0.55 : gs.diff === 'hard' ? 0.2 : 0.35;
        let chance = !p ? 0 : off <= 3 ? firm / p.w : off <= 6 ? edge / p.w : 0.05;
        gs.hold = p && Math.random() < Math.min(0.98, chance) ? p : null; gs.state = 'up';
        if (!gs.hold && p) { p.x = Math.max(14, Math.min(94, p.x + (p.x >= gs.x ? 1 : -1) * (2 + Math.random() * 4))); }
        gs.msg = gs.hold ? `Got the ${_CN_PR[gs.hold.k][0]}! Lifting...` : p ? `The claw closed ${off <= 6 ? 'on the edge of' : 'beside'} the ${_CN_PR[p.k][0]} and it slipped away.` : 'The claw closed on nothing.';
        NK.render('crane');
        NK.after(800, () => {
            if (gs.hold && Math.random() < (gs.diff === 'hard' ? 0.18 : gs.diff === 'normal' ? 0.08 : 0)) { gs.msg = `Oh! The ${_CN_PR[gs.hold.k][0]} slipped on the way up.`; gs.hold = null; }
            if (gs.hold) { gs.pr = gs.pr.filter((x) => x !== gs.hold); gs.won.push(gs.hold.k); gs.msg = `The ${_CN_PR[gs.hold.k][0]} drops down the chute! ${gs.won.length} of ${gs.goal}.`; if (typeof sfxCorrect === 'function') sfxCorrect(); }
            else if (typeof sfxWrong === 'function') sfxWrong();
            gs.hold = null; gs.state = 'idle';
            if (gs.won.length >= gs.goal) { gs.over = true; NK.render('crane'); return NK.finish('crane', true, `${NK.pl(gs.won.length, 'prize')} landed with ${NK.pl(gs.tok, 'token')} to spare: ${gs.won.map((k) => _CN_PR[k][0]).join(', ')}.`); }
            if (!gs.tok) { gs.over = true; gs.msg += ' No tokens left.'; NK.render('crane'); return NK.finish('crane', false, `${gs.won.length} of ${gs.goal} prizes landed. A fresh handful of tokens is one tap away.`); }
            if (!gs.pr.length) { gs.over = true; NK.render('crane'); return NK.finish('crane', false, 'The box is empty.'); }
            gs.msg += ` ${NK.pl(gs.tok, 'token')} left.`; NK.render('crane');
        });
    });
}
function cnNew() { initCrane(); }
function _cnToy(p, y) {
    const [, col] = _CN_PR[p.k], x = p.x, r = 4.6 * p.w + 1.6;
    return `<g><circle cx="${x}" cy="${y - r}" r="${r}" fill="${col}" stroke="#1c1917" stroke-width=".7"/><circle cx="${x - r * 0.38}" cy="${y - r * 1.15}" r="${r * 0.13}" fill="#1c1917"/><circle cx="${x + r * 0.38}" cy="${y - r * 1.15}" r="${r * 0.13}" fill="#1c1917"/><path d="M${x - r * 0.3} ${y - r * 0.7} q${r * 0.3} ${r * 0.25} ${r * 0.6} 0" stroke="#1c1917" stroke-width=".6" fill="none"/></g>`;
}
function _cnView(gs) {
    const floor = 70, clawY = gs.state === 'idle' ? 12 : gs.state === 'down' ? floor - 14 : 24, hold = gs.hold;
    let s = `<rect x="0" y="${floor}" width="100" height="12" fill="#f9a8d4"/><rect x="0" y="0" width="12" height="82" fill="#fecdd3" opacity=".7"/><text x="6" y="${floor - 2}" font-size="3.4" text-anchor="middle" fill="#9f1239" font-weight="800">CHUTE</text>`;
    s += `<line x1="0" y1="5" x2="100" y2="5" stroke="#475569" stroke-width="1.6"/><rect x="${gs.x - 4}" y="3" width="8" height="4" rx="1" fill="#334155"/><line x1="${gs.x}" y1="7" x2="${gs.x}" y2="${clawY}" stroke="#475569" stroke-width=".8"/>`;
    s += `<ellipse cx="${gs.x}" cy="${floor + 1}" rx="5" ry="1.2" fill="rgba(0,0,0,.18)"/>`;
    gs.pr.forEach((p) => { if (p !== hold) s += _cnToy(p, floor); });
    if (hold) s += _cnToy({ ...hold, x: gs.x }, clawY + 15);
    const open = gs.state === 'idle' || (gs.state === 'down');
    s += `<g stroke="#1e293b" stroke-width="1.4" fill="none" stroke-linecap="round"><path d="M${gs.x} ${clawY} l${open ? -6 : -3} 5 l${open ? 1 : 2} 5"/><path d="M${gs.x} ${clawY} l${open ? 6 : 3} 5 l${open ? -1 : -2} 5"/></g><circle cx="${gs.x}" cy="${clawY}" r="1.8" fill="#64748b"/>`;
    const busy = gs.over || gs.state !== 'idle';
    return `<div class="nk-top"><span>Tokens: <b>${gs.tok}</b></span><span>Prizes: <b>${gs.won.length}</b> of ${gs.goal}</span></div>
      <div class="cn-box"><svg class="cn-svg" viewBox="0 0 100 82" role="img" aria-label="claw at ${Math.round(gs.x)} percent across; prizes at ${gs.pr.map((p) => Math.round(p.x)).join(', ')} percent">${s}</svg></div>
      <div class="cn-won">${gs.won.map((k) => `<span>${_CN_PR[k][0]}</span>`).join('')}</div>
      <div class="cn-ctl">${NK.btn(NK.icon('arrow-left'), 'cnMove(-1)', { k: 'left', label: 'slide left', disabled: busy })}${NK.btn('Drop', 'cnDrop()', { k: 'drop', cls: 'gk-primary', disabled: busy || !gs.tok })}${NK.btn(NK.icon('arrow-right'), 'cnMove(1)', { k: 'right', label: 'slide right', disabled: busy })}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('rotate-ccw') + 'New round', 'cnNew()', { k: 'restart' })}</div>`;
}
