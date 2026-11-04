// ═══════════════════════════════════════════════════════════════════════════════
// WATER JUGS (2026-11, nostalgia batch 3) — the old measuring puzzle from puzzle books: with jugs that have no marks,
// measure out an exact amount. Fill a jug at the tap, empty it, or pour one jug into another until the first is
// empty or the second is full. Three puzzles per game, each harder than the last (a full search gives the fewest
// steps, "par"). Any finish counts. Undo, Start over. No clock.
// ═══════════════════════════════════════════════════════════════════════════════
const _JG_SETS = {
    easy: [{ cap: [3, 5], goal: 4 }, { cap: [4, 7], goal: 2 }, { cap: [5, 8], goal: 6 }],
    normal: [{ cap: [3, 5], goal: 4 }, { cap: [4, 9], goal: 6 }, { cap: [8, 5, 3], goal: 4, start: [8, 0, 0], noTap: true }],
    hard: [{ cap: [5, 11], goal: 7 }, { cap: [8, 5, 3], goal: 4, start: [8, 0, 0], noTap: true, both: true }, { cap: [6, 13, 4], goal: 9 }],
};
function _jgPar(P) {
    const key = (v) => v.join(','), start = P.start || P.cap.map(() => 0), seen = new Map([[key(start), 0]]), q = [start];
    for (let h = 0; h < q.length; h++) {
        const v = q[h], d = seen.get(key(v));
        if (_jgDone(P, v)) return d;
        for (const n of _jgNext(P, v)) { const k = key(n); if (!seen.has(k)) { seen.set(k, d + 1); q.push(n); } }
    }
    return -1;
}
const _jgDone = (P, v) => (P.both ? v.filter((x) => x === P.goal).length >= 2 : v.includes(P.goal));
function _jgNext(P, v) {
    const out = [];
    v.forEach((x, i) => {
        if (!P.noTap) { if (x < P.cap[i]) { const n = v.slice(); n[i] = P.cap[i]; out.push(n); } if (x > 0) { const n = v.slice(); n[i] = 0; out.push(n); } }
        v.forEach((y, j) => { if (i === j || !x || y === P.cap[j]) return; const t = Math.min(x, P.cap[j] - y), n = v.slice(); n[i] -= t; n[j] += t; out.push(n); });
    });
    return out;
}
function initJugs() {
    NK.start('jugs', {
        setup(gs, diff) {
            gs.set = _JG_SETS[diff] || _JG_SETS.normal; gs.k = 0; gs.steps = []; gs.over = false; gs.src = -1;
            _jgLoad(gs);
        },
        view: _jgView,
        keys: { KeyU: () => jgUndo() },
        rules: (gs) => [
            'Each jug has no marks: you only know when it is <b>full</b> or <b>empty</b>.',
            '<b>Fill</b> a jug at the tap, <b>Empty</b> it out, or <b>Pour</b>: tap one jug, then another, and water flows until the first is empty or the second is full.',
            'Some puzzles have no tap: you start with one jug full and can only pour between jugs.',
            'Reach the amount asked for in any jug. Three puzzles make a game. Par is the fewest steps possible; any finish counts.',
            'Undo and Start over are always there. No clock.'],
        css: `.jg-row{display:flex;gap:clamp(10px,4vw,28px);justify-content:center;align-items:flex-end;margin:6px 0 4px;flex-wrap:wrap}
.jg-j{display:flex;flex-direction:column;align-items:center;gap:6px}
.jg-glass{position:relative;width:clamp(70px,20vw,96px);border:4px solid #475569;border-top:0;border-radius:0 0 16px 16px;background:#f8fafc;overflow:hidden;cursor:pointer;padding:0;--nk-r:0 0 16px 16px;--nk-bw:0 4px 4px 4px}
.jg-glass.jg-src{box-shadow:0 0 0 4px #f59e0b}
.jg-w{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(#60a5fa,#1d4ed8);transition:height .25s}
.jg-ticks{position:absolute;inset:0;background:repeating-linear-gradient(to top,transparent 0 calc(var(--u) - 1px),rgba(71,85,105,.25) calc(var(--u) - 1px) var(--u))}
.jg-lab{font-weight:900;font-size:1.15rem}.jg-cap{font-size:.95rem;color:#4a3420;font-weight:700}
.jg-acts{display:flex;gap:6px}.jg-acts .gk-btn{min-width:0;padding:6px 10px;font-size:.95rem}
.jg-goal{text-align:center;font:900 1.3rem Georgia,serif;color:#7c2d12;margin-bottom:6px}`,
    });
}
function _jgLoad(gs) {
    const P = gs.set[gs.k]; gs.P = P; gs.v = (P.start || P.cap.map(() => 0)).slice(); gs.hist = []; gs.src = -1; gs.par = _jgPar(P);
    gs.msg = `Puzzle ${gs.k + 1} of 3: ${P.both ? `get ${P.goal} cups in two jugs at once` : `measure exactly ${P.goal} cups in any jug`}.`;
}
function _jgDo(gs, nv, m) {
    gs.hist.push(gs.v.slice()); gs.v = nv; gs.src = -1;
    if (typeof sfxFlip === 'function') sfxFlip();
    if (_jgDone(gs.P, gs.v)) {
        gs.steps.push(gs.hist.length);
        if (typeof sfxCorrect === 'function') sfxCorrect();
        if (gs.k >= 2) { gs.over = true; gs.msg = `${m} Puzzle 3 solved - all three done!`; NK.render('jugs'); return NK.finish('jugs', true, `All three measured, in ${gs.steps.join(', ')} steps (par ${gs.set.map(_jgPar).join(', ')}).`); }
        gs.solved = true; gs.msg = `${m} Solved in ${NK.pl(gs.hist.length, 'step')} (par ${gs.par}). Press Next puzzle.`; return NK.render('jugs');
    }
    gs.msg = m; NK.render('jugs');
}
function jgFill(i) { const gs = gameState.jugs; if (gs.over || gs.solved || gs.P.noTap) return; if (gs.v[i] === gs.P.cap[i]) { gs.msg = 'That jug is already full.'; return NK.render('jugs'); } const n = gs.v.slice(); n[i] = gs.P.cap[i]; _jgDo(gs, n, `Filled the ${gs.P.cap[i]}-cup jug.`); }
function jgEmpty(i) { const gs = gameState.jugs; if (gs.over || gs.solved || gs.P.noTap) return; if (!gs.v[i]) { gs.msg = 'That jug is already empty.'; return NK.render('jugs'); } const n = gs.v.slice(); n[i] = 0; _jgDo(gs, n, `Emptied the ${gs.P.cap[i]}-cup jug.`); }
function jgPick(i) {
    const gs = gameState.jugs; if (gs.over || gs.solved) return;
    if (gs.src < 0) { if (!gs.v[i]) { gs.msg = 'That jug is empty - nothing to pour.'; return NK.render('jugs'); } gs.src = i; gs.msg = `Pour from the ${gs.P.cap[i]}-cup jug into which jug?`; return NK.render('jugs'); }
    if (gs.src === i) { gs.src = -1; gs.msg = 'Pour cancelled.'; return NK.render('jugs'); }
    const a = gs.src, t = Math.min(gs.v[a], gs.P.cap[i] - gs.v[i]);
    if (!t) { gs.src = -1; gs.msg = 'That jug is full already.'; return NK.render('jugs'); }
    const n = gs.v.slice(); n[a] -= t; n[i] += t; _jgDo(gs, n, `Poured ${NK.pl(t, 'cup')} from the ${gs.P.cap[a]} into the ${gs.P.cap[i]}.`);
}
function jgUndo() { const gs = gameState.jugs; if (gs.over || gs.solved || !gs.hist.length) return; gs.v = gs.hist.pop(); gs.src = -1; gs.msg = 'Step taken back.'; NK.render('jugs'); }
function jgReset() { const gs = gameState.jugs; if (gs.over || gs.solved) return; _jgLoad(gs); gs.msg = 'Back to the start of this puzzle.'; NK.render('jugs'); }
function jgNext() { const gs = gameState.jugs; if (!gs.solved || gs.over) return; gs.solved = false; gs.k++; _jgLoad(gs); NK.render('jugs'); }
function jgNew() { initJugs(); }
function _jgView(gs) {
    const P = gs.P, maxC = Math.max(...P.cap), can = !gs.over && !gs.solved;
    const jugs = P.cap.map((c, i) => `<div class="jg-j"><span class="jg-lab" aria-live="polite">${gs.v[i]} / ${c}</span>
      <button type="button" class="nk-cell jg-glass${gs.src === i ? ' jg-src' : ''}" style="height:${40 + c / maxC * 150}px;--u:${150 / maxC}px" onclick="jgPick(${i})" data-k="j${i}"${i === 0 ? ' data-first' : ''} aria-label="${c}-cup jug holding ${gs.v[i]}; tap to pour from or into it"${can ? '' : ' disabled'}><span class="jg-w" style="height:${gs.v[i] / c * 100}%"></span><span class="jg-ticks"></span></button>
      <span class="jg-cap">${c}-cup jug</span>
      ${P.noTap ? '' : `<span class="jg-acts">${NK.btn('Fill', `jgFill(${i})`, { k: 'f' + i, disabled: !can })}${NK.btn('Empty', `jgEmpty(${i})`, { k: 'e' + i, disabled: !can })}</span>`}</div>`).join('');
    return `<div class="nk-top"><span>Puzzle <b>${gs.k + 1}</b> of 3</span><span>Steps: <b>${gs.hist.length}</b> (par ${gs.par})</span></div>
      <div class="jg-goal">Goal: ${P.both ? `${P.goal} cups in two of the jugs` : `exactly ${P.goal} cups`}</div>
      <div class="jg-row">${jugs}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${gs.solved ? NK.btn('Next puzzle', 'jgNext()', { cls: 'gk-primary', k: 'next' }) : ''}${NK.btn(NK.icon('undo-2') + 'Undo', 'jgUndo()', { k: 'undo', disabled: !can || !gs.hist.length })}${NK.btn('Start over', 'jgReset()', { k: 'reset', disabled: !can })}${NK.btn(NK.icon('rotate-ccw') + 'New game', 'jgNew()', { k: 'restart' })}</div>`;
}
