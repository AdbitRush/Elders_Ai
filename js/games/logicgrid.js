// ═══════════════════════════════════════════════════════════════════════════════
// LOGIC GRID (2026-11, nostalgia batch 2) — the "who has which" deduction puzzles of puzzle magazines, set on an
// imaginary street of neighbors. Solo, no clock.
// Every puzzle is generated: a random answer is chosen, clues are drawn until a solver finds exactly one answer
// that fits them all, then any clue that is not needed is dropped. So every puzzle can be solved by reasoning alone.
// Fill in the answer table: pick a square (a neighbor and a category), then tap an option. "Cross out" mode marks
// options you have ruled out instead. Tap a clue to tick it off. Check counts wrong answers; Hint fills one in.
// Easy: 3 neighbors x 2 categories. Normal: 4 x 2 (with house numbers). Hard: 4 x 3.
// ═══════════════════════════════════════════════════════════════════════════════
const _LG_NAMES = ['Ruth', 'Walter', 'Dorothy', 'Frank', 'Helen', 'George'];
const _LG_CATS = {
    pet: { title: 'Pet', items: ['cat', 'dog', 'canary', 'goldfish', 'rabbit'], np: (x) => `the ${x} owner` },
    pie: { title: 'Pie', items: ['apple', 'cherry', 'peach', 'pecan', 'pumpkin'], np: (x) => `the ${x} pie fan` },
    hobby: { title: 'Hobby', items: ['bowling', 'gardening', 'knitting', 'fishing', 'checkers'], np: (x) => `the one who loves ${x}` },
    car: { title: 'Car', items: ['red', 'blue', 'green', 'white', 'yellow'], np: (x) => `the owner of the ${x} car` },
    house: { title: 'House', items: ['12', '14', '16', '18', '20'], np: (x) => `the neighbor at number ${x}`, ordered: true },
};
function _lgPerms(n) { const out = []; (function go(a, rest) { if (!rest.length) { out.push(a); return; } rest.forEach((x, i) => go(a.concat(x), rest.slice(0, i).concat(rest.slice(i + 1)))); })([], [...Array(n).keys()]); return out; }
// a full answer: A[c][person] = item index; c = category index
function _lgHolds(cl, A) {
    const who = (c, x) => A[c].indexOf(x);   // person holding item x of category c
    const p = (t) => (t.c < 0 ? t.x : who(t.c, t.x));   // c < 0: a person by name
    switch (cl.k) {
        case 'is': return p(cl.a) === p(cl.b);
        case 'not': return p(cl.a) !== p(cl.b);
        case 'higher': { const h = cl.h; const pa = p(cl.a), pb = p(cl.b); return pa !== pb && +A[h][pa] > +A[h][pb]; }
    }
}
function _lgSolve(n, cats, clues) {
    const P = _lgPerms(n), sols = [];
    (function go(c, A) {
        if (sols.length > 1) return;
        if (c === cats.length) { if (clues.every((cl) => _lgHolds(cl, A))) sols.push(A.map((x) => x.slice())); return; }
        for (const pm of P) { A[c] = pm; if (clues.every((cl) => !_lgDone(cl, c) || _lgHolds(cl, A))) go(c + 1, A); }
        A.length = c;
    })(0, []);
    return sols;
}
// a clue can be tested once every category it mentions is assigned
function _lgDone(cl, c) { return Math.max(cl.a.c, cl.b.c, cl.h ?? -1) <= c; }
function _lgText(cl, cats) {
    const t = (r) => (r.c < 0 ? _LG_NAMES[r.x] : _LG_CATS[cats[r.c]].np(_LG_CATS[cats[r.c]].items[r.x]));
    const cap = (s) => s[0].toUpperCase() + s.slice(1);
    if (cl.k === 'is') return `${cap(t(cl.a))} is ${t(cl.b)}.`;
    if (cl.k === 'not') return `${cap(t(cl.a))} is not ${t(cl.b)}.`;
    return `${cap(t(cl.a))} lives at a higher house number than ${t(cl.b)}.`;
}
function _lgMake(diff) {
    const n = diff === 'easy' ? 3 : 4;
    let cats = shuffle(['pet', 'pie', 'hobby', 'car']).slice(0, diff === 'hard' ? 3 : 2);
    if (diff === 'normal') cats = [cats[0], 'house'];
    if (diff === 'hard' && Math.random() < .5) cats[2] = 'house';
    const A = cats.map(() => shuffle([...Array(n).keys()]));
    // house numbers are always 12, 14, 16, 18 in order of item index
    const H = cats.indexOf('house');
    const ref = (c) => ({ c, x: c < 0 ? Math.floor(Math.random() * n) : Math.floor(Math.random() * n) });
    const randClue = () => {
        const r = Math.random();
        if (H >= 0 && r < 0.25) { let a = ref(Math.random() < .5 ? -1 : Math.floor(Math.random() * cats.length)), b = ref(Math.floor(Math.random() * cats.length)); if (a.c === H || b.c === H) return null; return { k: 'higher', a, b, h: H }; }
        const c1 = Math.random() < .45 ? -1 : Math.floor(Math.random() * cats.length); let c2 = Math.floor(Math.random() * cats.length); if (c2 === c1) return null;
        const a = ref(c1), b = ref(c2);
        return { k: Math.random() < (diff === 'easy' ? .35 : .25) ? 'is' : 'not', a, b };
    };
    const truth = (cl) => _lgHolds(cl, A);
    let clues = [];
    for (let k = 0; k < 400; k++) {
        const cl = randClue(); if (!cl || !truth(cl)) continue;
        const key = JSON.stringify(cl); if (clues.some((x) => JSON.stringify(x) === key)) continue;
        clues.push(cl);
        if (clues.length >= 3 && _lgSolve(n, cats, clues).length === 1) break;
    }
    if (_lgSolve(n, cats, clues).length !== 1) return null;
    // drop clues that are not needed
    for (let i = clues.length - 1; i >= 0; i--) { const t = clues.slice(0, i).concat(clues.slice(i + 1)); if (_lgSolve(n, cats, t).length === 1) clues = t; }
    return { n, cats, A, clues: shuffle(clues) };
}
function initLogicGrid() {
    NK.start('logicgrid', {
        setup(gs, diff) {
            let P = null; while (!P) P = _lgMake(diff);
            gs.P = P; gs.ans = P.cats.map(() => Array(P.n).fill(-1)); gs.out = P.cats.map(() => Array.from({ length: P.n }, () => [])); gs.tick = [];
            gs.sel = [0, 0]; gs.mode = 'choose'; gs.over = false; gs.hints = 0;
            gs.msg = 'Read the clues, then pick a square in the table and tap an answer.';
        },
        view: _lgView,
        keys: { KeyX: () => lgMode(), KeyC: () => lgCheck() },
        rules: [
            'Each neighbor has exactly one of each thing (one pet, one pie, and so on), and no two neighbors share one.',
            'Read the clues. Every puzzle has exactly <b>one</b> answer that fits all of them, and it can be found by reasoning - no guessing needed.',
            'Tap a square in the table (a neighbor and a category), then tap an option below to choose it.',
            'Switch to <b>Cross out</b> to mark options you have ruled out for that neighbor; they show as small crossed words.',
            'Tap a clue to tick it off when you have used it. <b>Check</b> counts wrong answers; <b>Hint</b> fills in one square.',
            'When every square is filled correctly, the puzzle is solved. No clock. Keyboard: arrows and Enter, X switches mode, C checks.'],
        css: `.lg-clues{background:#fffdf5;border:3px solid #e8cfa8;border-radius:14px;padding:6px;margin-bottom:10px}
.lg-clue{display:flex;gap:10px;align-items:flex-start;width:100%;text-align:left;background:transparent;border:0;padding:8px 6px;font:600 1.08rem/1.4 system-ui,sans-serif;color:#2b1b0d;cursor:pointer;--nk-r:8px;--nk-bw:0}
.lg-clue b{flex:0 0 auto;min-width:1.6em;color:#7c2d12}
.lg-clue.lg-t{color:#8a7560;text-decoration:line-through}
.lg-tab{display:grid;gap:4px;align-items:stretch}
.lg-h{font-weight:900;color:#4a3420;padding:4px;text-align:center;align-self:end}
.lg-n{font-weight:900;color:#2b1b0d;display:flex;align-items:center;font-size:1.08rem}
.lg-c{min-height:56px;border:2px solid #e8cfa8;background:#fff;color:#1d4ed8;font:800 1.02rem/1.15 system-ui,sans-serif;cursor:pointer;padding:4px;--nk-r:10px;--nk-bw:2px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-width:0;overflow-wrap:anywhere}
.lg-c.lg-s{border-color:#b45309;background:#fde68a}
.lg-c.lg-bad{border-color:#b91c1c;background:#fee2e2;color:#b91c1c}
.lg-c small{font-weight:600;font-size:.78rem;color:#6b5640;text-decoration:line-through}
.lg-opts{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:10px 0}
.lg-opts .gk-btn.lg-x{text-decoration:line-through;color:#6b5640}
.lg-opts .gk-btn.lg-used{opacity:.6}`,
    });
}
function lgSel(c, p) { const gs = gameState.logicgrid; if (gs.over) return; gs.sel = [c, p]; gs.msg = ''; NK.render('logicgrid'); }
function lgMode() { const gs = gameState.logicgrid; if (gs.over) return; gs.mode = gs.mode === 'choose' ? 'cross' : 'choose'; gs.msg = gs.mode === 'cross' ? 'Cross out mode: tap an option to rule it out (tap again to bring it back).' : 'Choose mode: tap an option to write it in.'; NK.render('logicgrid'); }
function lgTick(i) { const gs = gameState.logicgrid; const k = gs.tick.indexOf(i); if (k >= 0) gs.tick.splice(k, 1); else gs.tick.push(i); NK.render('logicgrid'); }
function lgOpt(x) {
    const gs = gameState.logicgrid; if (gs.over) return;
    const [c, p] = gs.sel;
    if (gs.mode === 'cross') { const o = gs.out[c][p], k = o.indexOf(x); if (k >= 0) o.splice(k, 1); else { o.push(x); if (gs.ans[c][p] === x) gs.ans[c][p] = -1; } return NK.render('logicgrid'); }
    // choosing x for p takes it away from anyone else who had it
    gs.ans[c] = gs.ans[c].map((v, q) => (v === x && q !== p ? -1 : v));
    gs.ans[c][p] = gs.ans[c][p] === x ? -1 : x;
    gs.bad = null;
    if (typeof sfxFlip === 'function') sfxFlip();
    _lgDoneCheck();
}
function _lgDoneCheck() {
    const gs = gameState.logicgrid;
    if (gs.ans.every((r) => r.every((v) => v >= 0))) {
        const wrong = gs.ans.reduce((a, r, c) => a + r.filter((v, p) => v !== gs.P.A[c][p]).length, 0);
        if (!wrong) {
            gs.over = true; gs.msg = 'Every answer fits every clue. Solved!'; NK.render('logicgrid');
            if (typeof sfxCorrect === 'function') sfxCorrect();
            return NK.finish('logicgrid', true, `Logic puzzle solved${gs.hints ? ` with ${NK.pl(gs.hints, 'hint')}` : ' by reasoning alone'}!`);
        }
        gs.msg = `The table is full, but ${NK.pl(wrong, 'answer')} ${wrong === 1 ? 'does' : 'do'} not fit the clues yet.`;
    } else {
        // move to the next empty square
        const [c, p] = gs.sel; if (gs.ans[c][p] >= 0) { for (let k = 1; k <= gs.P.n * gs.P.cats.length; k++) { const idx = (c * gs.P.n + p + k) % (gs.P.n * gs.P.cats.length), cc = Math.floor(idx / gs.P.n), pp = idx % gs.P.n; if (gs.ans[cc][pp] < 0) { gs.sel = [cc, pp]; break; } } }
    }
    NK.render('logicgrid');
}
function lgCheck() {
    const gs = gameState.logicgrid; if (gs.over) return;
    gs.bad = gs.ans.map((r, c) => r.map((v, p) => v >= 0 && v !== gs.P.A[c][p]));
    const n = gs.bad.flat().filter(Boolean).length;
    gs.msg = n ? `${NK.pl(n, 'answer')} marked in red ${n === 1 ? 'is' : 'are'} not right.` : 'Everything filled in so far is right.';
    NK.render('logicgrid');
}
function lgHint() {
    const gs = gameState.logicgrid; if (gs.over) return;
    for (let c = 0; c < gs.P.cats.length; c++) for (let p = 0; p < gs.P.n; p++) if (gs.ans[c][p] !== gs.P.A[c][p]) {
        gs.hints++; gs.sel = [c, p]; const x = gs.P.A[c][p];
        gs.ans[c] = gs.ans[c].map((v) => (v === x ? -1 : v)); gs.ans[c][p] = x; gs.msg = 'Hint: one square filled in.'; return _lgDoneCheck();
    }
}
function lgNew() { initLogicGrid(); }
function _lgView(gs) {
    const { n, cats, clues } = gs.P;
    const cl = clues.map((c, i) => `<button type="button" class="nk-cell lg-clue${gs.tick.includes(i) ? ' lg-t' : ''}" onclick="lgTick(${i})" data-k="cl${i}" aria-pressed="${gs.tick.includes(i)}"><b>${i + 1}.</b><span>${_lgText(c, cats)}</span></button>`).join('');
    let tab = `<span></span>${cats.map((c) => `<span class="lg-h">${_LG_CATS[c].title}</span>`).join('')}`;
    for (let p = 0; p < n; p++) {
        tab += `<span class="lg-n">${_LG_NAMES[p]}</span>`;
        cats.forEach((c, ci) => {
            const v = gs.ans[ci][p], it = _LG_CATS[c].items, sel = gs.sel[0] === ci && gs.sel[1] === p, bad = gs.bad && gs.bad[ci][p];
            const outs = gs.out[ci][p].map((x) => it[x]).join(' ');
            tab += `<button type="button" class="nk-cell lg-c${sel ? ' lg-s' : ''}${bad ? ' lg-bad' : ''}" onclick="lgSel(${ci},${p})" data-k="a${ci}_${p}"${ci === 0 && p === 0 ? ' data-first' : ''} aria-label="${_LG_NAMES[p]}, ${_LG_CATS[c].title}: ${v >= 0 ? it[v] : 'not filled in'}"${gs.over ? ' disabled' : ''}>${v >= 0 ? it[v] : '?'}${outs ? `<small>${outs}</small>` : ''}</button>`;
        });
    }
    const [sc, sp] = gs.sel, scat = _LG_CATS[cats[sc]];
    const opts = scat.items.slice(0, n).map((x, i) => NK.btn(x, `lgOpt(${i})`, { k: 'o' + i, cls: (gs.out[sc][sp].includes(i) ? 'lg-x' : '') + (gs.ans[sc][sp] === i ? ' gk-primary' : gs.ans[sc].includes(i) ? ' lg-used' : ''), disabled: gs.over })).join('');
    return `<div class="lg-clues" aria-label="clues">${cl}</div>
      <div class="lg-tab" style="grid-template-columns:auto repeat(${cats.length},1fr)">${tab}</div>
      <div class="nk-top" style="justify-content:center;margin-top:10px"><span>${_LG_NAMES[sp]} - ${scat.title}:</span></div>
      <div class="lg-opts">${opts}</div>
      <div class="gk-btns">${NK.btn(gs.mode === 'choose' ? 'Mode: Choose' : 'Mode: Cross out', 'lgMode()', { k: 'mode', pressed: gs.mode === 'cross' })}${NK.btn('Check', 'lgCheck()', { k: 'check', disabled: gs.over })}${NK.btn(NK.icon('lightbulb') + 'Hint', 'lgHint()', { k: 'hint', disabled: gs.over })}${NK.btn(NK.icon('rotate-ccw') + 'New puzzle', 'lgNew()', { k: 'restart' })}</div>
      ${NK.msg(gs.msg)}`;
}
