// ═══════════════════════════════════════════════════════════════════════════════
// MAGIC SQUARE (2026-11, nostalgia batch 3) — the puzzle-book classic: fill the grid with each number once so that
// every row, every column and both corner-to-corner diagonals add up to the same "magic" total.
// Easy: 3x3 (numbers 1-9, total 15) with two numbers given. Normal: 3x3 with one given. Hard: 4x4 (1-16, total 34)
// with six given, taken from a real magic square, so it can always be finished. Any correct filling counts.
// Tap a square, then a number. Line totals turn green when they reach the magic total. No clock.
// ═══════════════════════════════════════════════════════════════════════════════
const _MS_BASE = { 3: [8, 1, 6, 3, 5, 7, 4, 9, 2], 4: [16, 3, 2, 13, 5, 10, 11, 8, 9, 6, 7, 12, 4, 15, 14, 1] };
function _msVariant(n) {
    // a random symmetry of the base square (rotations, mirror) plus, for 4x4, the "complement" 17 - x
    let g = _MS_BASE[n].slice();
    const rot = (a) => a.map((_, i) => a[(n - 1 - (i % n)) * n + Math.floor(i / n)]), mir = (a) => a.map((_, i) => a[Math.floor(i / n) * n + (n - 1 - (i % n))]);
    for (let k = Math.floor(Math.random() * 4); k > 0; k--) g = rot(g);
    if (Math.random() < 0.5) g = mir(g);
    if (n === 4 && Math.random() < 0.5) g = g.map((x) => 17 - x);
    return g;
}
const _msLines = (n) => { const L = []; for (let i = 0; i < n; i++) { L.push([...Array(n).keys()].map((j) => i * n + j)); L.push([...Array(n).keys()].map((j) => j * n + i)); } L.push([...Array(n).keys()].map((j) => j * n + j), [...Array(n).keys()].map((j) => j * n + n - 1 - j)); return L; };
function initMagicSq() {
    NK.start('magicsq', {
        setup(gs, diff) {
            gs.n = diff === 'hard' ? 4 : 3; gs.N = gs.n * gs.n; gs.magic = gs.n * (gs.N + 1) / 2;
            const sol = _msVariant(gs.n), giv = shuffle([...Array(gs.N).keys()]).slice(0, diff === 'easy' ? 2 : diff === 'hard' ? 6 : 1);
            gs.g = Array(gs.N).fill(0); gs.given = {}; giv.forEach((i) => { gs.g[i] = sol[i]; gs.given[i] = 1; });
            gs.sel = gs.g.findIndex((x) => !x); gs.over = false; gs.sol = sol;
            gs.msg = `Use each number from 1 to ${gs.N} once. Every row, column and diagonal must add up to ${gs.magic}.`;
        },
        view: _msView,
        keys: Object.assign({ Backspace: () => msNum(0), Delete: () => msNum(0) }, NK.digits((d) => msNum(d), 9)),
        arrows(dir) { const gs = gameState.magicsq, n = gs.n, r = Math.floor(gs.sel / n), c = gs.sel % n, [dr, dc] = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] }[dir]; const rr = r + dr, cc = c + dc; if (rr >= 0 && rr < n && cc >= 0 && cc < n) { gs.sel = rr * n + cc; NK.render('magicsq'); } return true; },
        rules: (gs) => [
            `Put each number from <b>1 to ${gs.N}</b> into the grid once.`,
            `Every <b>row</b>, every <b>column</b> and both <b>diagonals</b> must add up to <b>${gs.magic}</b>.`,
            'Tap a square, then a number below. A number already used elsewhere moves to the new square. Grey numbers are given.',
            'The totals at the ends of each line turn green when they reach the magic number.',
            gs.n === 3 ? 'Tip: in a 3 x 3 magic square the middle square is always 5.' : 'Tip: in this 4 x 4 square the four corners also add up to 34.',
            'No clock. Keyboard: arrows move, digits type (on 4 x 4, use the number buttons for 10-16), Backspace clears.'],
        css: `.ms-wrap{display:grid;gap:6px;max-width:26rem;margin:0 auto;align-items:center}
.ms-c{aspect-ratio:1;border:3px solid #c9a46a;background:#fffdf5;font:900 clamp(1.4rem,7vw,2.2rem) Georgia,serif;color:#1d4ed8;cursor:pointer;padding:0;--nk-r:10px;--nk-bw:3px;min-width:0}
.ms-c.ms-g{color:#2b1b0d;background:#f3ead8}.ms-c.ms-s{border-color:#b45309;background:#fde68a}
.ms-sum{font:800 1rem system-ui;text-align:center;color:#6b5640}.ms-sum.ms-ok{color:#15803d}.ms-sum.ms-hi{color:#b91c1c}
.ms-pad{display:grid;grid-template-columns:repeat(var(--pc),1fr);gap:6px;max-width:26rem;margin:12px auto 0}
.ms-pad .gk-btn{font-size:1.2rem;padding:0;min-width:0}
.ms-pad .gk-btn.ms-used{opacity:.5}`,
    });
}
function msSel(i) { const gs = gameState.magicsq; if (gs.over) return; gs.sel = i; gs.msg = gs.given[i] ? 'That number is given.' : ''; NK.render('magicsq'); }
function msNum(v) {
    const gs = gameState.magicsq; if (gs.over || gs.sel < 0 || v > gs.N) return;
    if (gs.given[gs.sel]) { gs.msg = 'That square is given.'; return NK.render('magicsq'); }
    if (v) { const j = gs.g.indexOf(v); if (j >= 0 && j !== gs.sel) { if (gs.given[j]) { gs.msg = `${v} is a given number in another square.`; return NK.render('magicsq'); } gs.g[j] = 0; } }
    gs.g[gs.sel] = v;
    if (gs.g.every(Boolean) && _msLines(gs.n).every((l) => l.reduce((a, i) => a + gs.g[i], 0) === gs.magic)) {
        gs.over = true; gs.msg = `Every line adds up to ${gs.magic}. A magic square!`; NK.render('magicsq'); if (typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('magicsq', true, `Magic square complete: every line makes ${gs.magic}.`);
    }
    if (v) { const nx = gs.g.findIndex((x, i) => !x && !gs.given[i]); if (nx >= 0) gs.sel = nx; }
    gs.msg = gs.g.every(Boolean) ? 'The grid is full, but some lines do not add up yet. Move numbers around.' : '';
    NK.render('magicsq');
}
function msHint() {
    const gs = gameState.magicsq; if (gs.over) return;
    // keep the player's numbers that agree with the stored solution's symmetry class? simplest: fill one square from the solution
    const i = gs.g.findIndex((x, k) => x !== gs.sol[k] && !gs.given[k]); if (i < 0) return;
    const j = gs.g.indexOf(gs.sol[i]); if (j >= 0) gs.g[j] = 0;
    gs.g[i] = gs.sol[i]; gs.given[i] = 1; gs.sel = gs.g.findIndex((x, k) => !x && !gs.given[k]);
    gs.msg = `Hint: ${gs.sol[i]} belongs there (now fixed).`;
    if (gs.g.every(Boolean)) return msNum(gs.g[gs.sel] || 0) || NK.render('magicsq');
    NK.render('magicsq');
}
function msNew() { initMagicSq(); }
function _msView(gs) {
    const n = gs.n, sum = (l) => l.reduce((a, i) => a + gs.g[i], 0), full = (l) => l.every((i) => gs.g[i]);
    const cls = (l) => { const s = sum(l); return full(l) && s === gs.magic ? ' ms-ok' : s > gs.magic ? ' ms-hi' : ''; };
    const L = _msLines(n); let cells = '';
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) { const i = r * n + c; cells += `<button type="button" class="nk-cell ms-c${gs.given[i] ? ' ms-g' : ''}${gs.sel === i ? ' ms-s' : ''}" onclick="msSel(${i})" data-k="c${i}"${i === 0 ? ' data-first' : ''} aria-label="row ${r + 1} column ${c + 1}: ${gs.g[i] || 'empty'}"${gs.over ? ' disabled' : ''}>${gs.g[i] || ''}</button>`; }
        cells += `<span class="ms-sum${cls(L[r * 2])}" aria-label="row total ${sum(L[r * 2])}">${sum(L[r * 2])}</span>`;
    }
    for (let c = 0; c < n; c++) cells += `<span class="ms-sum${cls(L[c * 2 + 1])}" aria-label="column total ${sum(L[c * 2 + 1])}">${sum(L[c * 2 + 1])}</span>`;
    cells += `<span class="ms-sum${cls(L[2 * n])}" title="diagonals">${sum(L[2 * n])} / ${sum(L[2 * n + 1])}</span>`;
    const pad = [...Array(gs.N).keys()].map((k) => NK.btn(String(k + 1), `msNum(${k + 1})`, { k: 'n' + (k + 1), cls: gs.g.includes(k + 1) ? 'ms-used' : '', disabled: gs.over })).join('') + NK.btn(Icon.svg('delete', { size: '24px', sw: 2.4 }), 'msNum(0)', { k: 'n0', label: 'clear the square', disabled: gs.over });
    return `<div class="nk-top"><span>Magic total: <b>${gs.magic}</b></span><span>Diagonals shown bottom right</span></div>
      <div class="ms-wrap" style="grid-template-columns:repeat(${n},1fr) 3rem">${cells}</div>
      <div class="ms-pad" style="--pc:${n === 3 ? 5 : 6}">${pad}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('lightbulb') + 'Hint', 'msHint()', { k: 'hint', disabled: gs.over })}${NK.btn(NK.icon('rotate-ccw') + 'New puzzle', 'msNew()', { k: 'restart' })}</div>`;
}
