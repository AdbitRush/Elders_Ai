// ═══════════════════════════════════════════════════════════════════════════════
// CHEESE CHASE (2026-11, nostalgia batch 3) — an original take on the maze-chase arcade games, made turn by turn so
// nothing is ever rushed: the cats move only when you move. Guide the mouse through the pantry maze and eat every
// crumb. Two cats (three on hard) step after your steps, heading for the mouse: on easy one step in three, on normal
// every other step, on hard every other step with a third cat. Lives: 5 (4 on hard). A cat that catches the mouse costs a life and everyone goes back to the start; crumbs eaten
// stay eaten. The four cheese wedges in the middle of each side send the cats running home for 8 steps. No clock.
// Grid: odd rows/columns are open cells of a random maze with a few extra gaps knocked out so there are loops.
// ═══════════════════════════════════════════════════════════════════════════════
function _mcMaze(cw, ch) {
    const W = cw * 2 + 1, H = ch * 2 + 1, g = Array(W * H).fill(1), st = [[0, 0]], seen = new Set(['0,0']); g[W + 1] = 0;
    while (st.length) {
        const [x, y] = st[st.length - 1], nb = shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]]).map(([a, b]) => [x + a, y + b]).filter(([a, b]) => a >= 0 && a < cw && b >= 0 && b < ch && !seen.has(a + ',' + b));
        if (!nb.length) { st.pop(); continue; }
        const [a, b] = nb[0]; seen.add(a + ',' + b); g[(b * 2 + 1) * W + a * 2 + 1] = 0; g[(y + b + 1) * W + x + a + 1] = 0; st.push([a, b]);
    }
    // knock out extra walls for loops
    for (let k = 0; k < cw * ch * 0.35; k++) { const x = 1 + Math.floor(Math.random() * (W - 2)), y = 1 + Math.floor(Math.random() * (H - 2)); if (g[y * W + x] && ((x % 2 === 1 && y % 2 === 0) || (x % 2 === 0 && y % 2 === 1))) g[y * W + x] = 0; }
    return { W, H, g };
}
function initMuncher() {
    NK.start('muncher', {
        setup(gs, diff) {
            gs.diff = diff; const M = _mcMaze(7, 7); Object.assign(gs, M);
            gs.start = gs.W + 1; gs.catStart = [(gs.H - 2) * gs.W + gs.W - 2, (gs.H - 2) * gs.W + 1, gs.W + gs.W - 2].slice(0, diff === 'hard' ? 3 : 2);
            gs.crumb = new Set(); gs.cheese = new Set([7 * gs.W + 1, 7 * gs.W + gs.W - 2, gs.W + 7, (gs.H - 2) * gs.W + 7]);   // odd rows and columns are always open: the middle of each side
            gs.g.forEach((v, i) => { if (!v && i !== gs.start && !gs.cheese.has(i)) gs.crumb.add(i); });
            gs.total = gs.crumb.size; gs.lives = diff === 'hard' ? 4 : 5; gs.maxLives = gs.lives; gs.over = false; gs.steps = 0; gs.scared = 0; gs.caught = 0;
            _mcReset(gs); gs.msg = 'Eat every crumb. The cats move only when you do. Cheese makes them run home.';
        },
        view: _mcView,
        arrows(dir) { mcStep({ up: -gameState.muncher.W, down: gameState.muncher.W, left: -1, right: 1 }[dir]); return true; },
        rules: (gs) => [
            'Guide the <b>mouse</b> through the pantry and eat <b>every crumb</b>.',
            'Nothing moves until you do: after each step of yours, every cat takes a step toward the mouse' + (gs.diff === 'easy' ? ' (on easy, only one step in three)' : gs.diff === 'normal' ? ' (on normal, every other step)' : ' (on hard, every other step, but there are three cats)') + '.',
            `If a cat catches the mouse you lose a life (you have ${gs.maxLives}) and everyone goes back to the start. Crumbs you have eaten stay eaten.`,
            'The <b>cheese wedges</b> scare the cats: for 8 steps they run back home, and touching one sends it home at once.',
            'Move with the arrow buttons, the arrow keys, or by tapping a square next to the mouse. No clock.'],
        css: `.mc-b{display:grid;gap:0;max-width:min(100%,30rem,max(16rem,calc(100vh - 380px)));margin:0 auto;background:#1e1b4b;border-radius:12px;overflow:hidden;box-shadow:0 0 0 4px #312e81}
.mc-s{aspect-ratio:1;border:0;padding:0;min-width:0;position:relative;display:flex;align-items:center;justify-content:center;background:#fef3c7;--nk-r:0}
.mc-w{background:#4338ca;border-radius:3px}
.mc-cr::after{content:"";width:22%;height:22%;border-radius:50%;background:#b45309}
.mc-ch::after{content:"";width:62%;height:50%;background:#facc15;clip-path:polygon(0 100%,100% 100%,100% 0);border-radius:2px}
.mc-s svg{width:88%;height:88%;position:absolute}
.mc-pad{display:grid;grid-template-columns:repeat(3,64px);grid-template-rows:repeat(2,56px);gap:6px;justify-content:center;margin:12px 0 0}
.mc-pad .gk-btn{min-width:0;padding:0}
.mc-lv i{display:inline-block;width:14px;height:14px;border-radius:50%;background:#9ca3af;margin:0 2px;vertical-align:-2px}.mc-lv i.mc-off{background:transparent;border:2px solid #9ca3af}`,
    });
}
function _mcReset(gs) { gs.pl = gs.start; gs.cats = gs.catStart.slice(); gs.scared = 0; }
function _mcNext(gs, from, to) {   // first step from `from` toward `to` along the maze (breadth-first)
    const prev = new Map([[from, -1]]), q = [from];
    for (let h = 0; h < q.length; h++) { const i = q[h]; if (i === to) break; for (const d of [1, -1, gs.W, -gs.W]) { const j = i + d; if (!gs.g[j] && !prev.has(j)) { prev.set(j, i); q.push(j); } } }
    if (!prev.has(to)) return from; let i = to; while (prev.get(i) !== from && prev.get(i) !== -1) i = prev.get(i); return i;
}
function mcStep(d) {
    const gs = gameState.muncher; if (gs.over || !d) return;
    const n = gs.pl + d; if (gs.g[n]) return;
    gs.pl = n; gs.steps++; let said = '';
    if (gs.crumb.delete(n)) { if (typeof sfxFlip === 'function' && gs.crumb.size % 6 === 0) sfxFlip(); }
    if (gs.cheese.delete(n)) { gs.scared = 8; said = ' Cheese! The cats run home.'; if (typeof sfxCorrect === 'function') sfxCorrect(); }
    if (!gs.crumb.size) { gs.over = true; gs.msg = 'Every crumb eaten. What a feast!'; NK.render('muncher'); return NK.finish('muncher', true, `All ${gs.total} crumbs eaten in ${gs.steps} steps with ${NK.pl(gs.lives, 'life', 'lives')} left.`); }
    if (_mcHit(gs)) return;
    // the cats step
    const moveCats = gs.diff === 'hard' ? gs.steps % 2 === 0 : gs.diff === 'easy' ? gs.steps % 3 === 0 : gs.steps % 2 === 0;   // easy: one step in three, normal: every other step, hard: three in four
    if (moveCats) gs.cats = gs.cats.map((c, k) => {
        if (gs.scared) return _mcNext(gs, c, gs.catStart[k]);
        if (Math.random() < (gs.diff === 'easy' ? 0.5 : gs.diff === 'hard' ? 0.3 : 0.35)) { const opts = [1, -1, gs.W, -gs.W].map((x) => c + x).filter((j) => !gs.g[j]); return opts[Math.floor(Math.random() * opts.length)]; }
        return _mcNext(gs, c, gs.pl);
    });
    if (gs.scared) gs.scared--;
    if (_mcHit(gs)) return;
    const near = gs.cats.some((c) => Math.abs((c % gs.W) - (gs.pl % gs.W)) + Math.abs(Math.floor(c / gs.W) - Math.floor(gs.pl / gs.W)) <= 2);
    gs.msg = `${gs.crumb.size} crumbs left.${said}${gs.scared ? ` Cats scared for ${gs.scared} more steps.` : near ? ' A cat is close!' : ''}`;
    NK.render('muncher');
}
function _mcHit(gs) {
    const k = gs.cats.indexOf(gs.pl); if (k < 0) return false;
    if (gs.scared) { gs.cats[k] = gs.catStart[k]; gs.msg = 'You chased a scared cat all the way home!'; NK.render('muncher'); return true; }
    gs.lives--; gs.caught++; if (typeof sfxWrong === 'function') sfxWrong();
    if (!gs.lives) { gs.over = true; gs.msg = 'Caught one time too many.'; NK.render('muncher'); NK.finish('muncher', false, `The cats won this time, with ${gs.crumb.size} of ${gs.total} crumbs left. A new pantry is one tap away.`); return true; }
    _mcReset(gs); gs.msg = `A cat caught the mouse! ${NK.pl(gs.lives, 'life', 'lives')} left. Back to the start; your eaten crumbs stay eaten.`; NK.render('muncher'); return true;
}
function mcTap(i) { const gs = gameState.muncher, d = i - gs.pl; if ([1, -1, gs.W, -gs.W].includes(d) && (Math.abs(d) !== 1 || Math.floor(i / gs.W) === Math.floor(gs.pl / gs.W))) mcStep(d); }
function mcNew() { initMuncher(); }
const _MC_MOUSE = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="12" cy="12" r="7" fill="#d1d5db" stroke="#374151" stroke-width="2"/><circle cx="28" cy="12" r="7" fill="#d1d5db" stroke="#374151" stroke-width="2"/><ellipse cx="20" cy="24" rx="12" ry="11" fill="#9ca3af" stroke="#374151" stroke-width="2"/><circle cx="15" cy="22" r="2" fill="#111827"/><circle cx="25" cy="22" r="2" fill="#111827"/><circle cx="20" cy="28" r="2.4" fill="#f472b6"/></svg>';
const _mcCat = (sc) => `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M7 12 L11 3 L17 10 Z M33 12 L29 3 L23 10 Z" fill="${sc ? '#93c5fd' : '#ea580c'}" stroke="#431407" stroke-width="2"/><circle cx="20" cy="22" r="13" fill="${sc ? '#bfdbfe' : '#fb923c'}" stroke="#431407" stroke-width="2"/><circle cx="15" cy="20" r="2.4" fill="#111827"/><circle cx="25" cy="20" r="2.4" fill="#111827"/><path d="M16 28 q4 3 8 0" fill="none" stroke="#431407" stroke-width="2"/></svg>`;
function _mcView(gs) {
    let h = '';
    for (let i = 0; i < gs.W * gs.H; i++) {
        const w = gs.g[i], cat = gs.cats.includes(i), me = gs.pl === i, cr = gs.crumb.has(i), ch = gs.cheese.has(i);
        const lab = w ? 'wall' : me ? 'the mouse' : cat ? (gs.scared ? 'a scared cat' : 'a cat') : cr ? 'crumb' : ch ? 'cheese' : 'empty';
        h += w ? '<span class="mc-s mc-w" aria-hidden="true"></span>' : `<button type="button" class="nk-cell mc-s${cr && !me && !cat ? ' mc-cr' : ''}${ch && !me && !cat ? ' mc-ch' : ''}" onclick="mcTap(${i})" data-k="c${i}"${me ? ' data-first' : ''} tabindex="-1" aria-label="${lab}"${gs.over ? ' disabled' : ''}>${me ? _MC_MOUSE : cat ? _mcCat(gs.scared) : ''}</button>`;
    }
    const lives = [...Array(gs.maxLives).keys()].map((k) => `<i class="${k < gs.lives ? '' : 'mc-off'}"></i>`).join('');
    const pad = `<div class="mc-pad" role="group" aria-label="move the mouse"><span></span>${NK.btn(NK.icon('arrow-up'), `mcStep(-${gs.W})`, { k: 'up', label: 'up', disabled: gs.over })}<span></span>${NK.btn(NK.icon('arrow-left'), 'mcStep(-1)', { k: 'left', label: 'left', disabled: gs.over })}${NK.btn(NK.icon('arrow-down'), `mcStep(${gs.W})`, { k: 'down', label: 'down', disabled: gs.over })}${NK.btn(NK.icon('arrow-right'), 'mcStep(1)', { k: 'right', label: 'right', disabled: gs.over })}</div>`;
    return `<div class="nk-top"><span>Crumbs left: <b>${gs.crumb.size}</b> of ${gs.total}</span><span class="mc-lv" role="img" aria-label="${NK.pl(gs.lives, 'life', 'lives')}">Lives ${lives}</span><span>Steps: <b>${gs.steps}</b></span></div>
      <div class="mc-b" style="grid-template-columns:repeat(${gs.W},1fr)">${h}</div>${pad}
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('rotate-ccw') + 'New pantry', 'mcNew()', { k: 'restart' })}</div>`;
}
