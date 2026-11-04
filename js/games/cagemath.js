// ═══════════════════════════════════════════════════════════════════════════════
// CAGE MATH (2026-11, nostalgia batch 3) — the arithmetic grid puzzle of newspaper puzzle pages: fill the grid so
// that every row and column has each number once, and the numbers in every outlined "cage" make its target with
// its sign (+ add, - subtract, x multiply, / divide; the bigger number first for - and /).
// Every puzzle is generated (random Latin square, random cages) and a solver keeps only puzzles with exactly one
// answer. Easy 4x4 with + only, normal 5x5 with + - x, hard 6x6 with all four signs. Tap a square, then a number.
// ═══════════════════════════════════════════════════════════════════════════════
function _cmLatin(n) {
    const base = [...Array(n).keys()].map((r) => [...Array(n).keys()].map((c) => ((r + c) % n) + 1));
    const rows = shuffle([...Array(n).keys()]), cols = shuffle([...Array(n).keys()]), sym = shuffle([...Array(n).keys()].map((x) => x + 1));
    return rows.map((r) => cols.map((c) => sym[base[r][c] - 1]));
}
function _cmCages(n, maxSize) {
    const id = Array.from({ length: n }, () => Array(n).fill(-1)), cages = [];
    for (const k of shuffle([...Array(n * n).keys()])) {
        const r = Math.floor(k / n), c = k % n; if (id[r][c] >= 0) continue;
        const size = 1 + Math.floor(Math.random() * maxSize), cells = [[r, c]]; id[r][c] = cages.length;
        while (cells.length < size) {
            const opts = []; cells.forEach(([y, x]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const yy = y + a, xx = x + b; if (yy >= 0 && yy < n && xx >= 0 && xx < n && id[yy][xx] < 0) opts.push([yy, xx]); }));
            if (!opts.length) break; const [yy, xx] = opts[Math.floor(Math.random() * opts.length)]; id[yy][xx] = cages.length; cells.push([yy, xx]);
        }
        cages.push({ cells });
    }
    return { id, cages };
}
const _cmOk = (cg, vals) => { const v = vals; switch (cg.op) {
    case '': return v[0] === cg.t; case '+': return v.reduce((a, b) => a + b, 0) === cg.t; case 'x': return v.reduce((a, b) => a * b, 1) === cg.t;
    case '-': return Math.abs(v[0] - v[1]) === cg.t; case '/': return Math.max(...v) / Math.min(...v) === cg.t; } };
const _cmCould = (cg, vals, n) => { // partial check: can the rest still reach the target?
    const left = cg.cells.length - vals.length; if (!left) return _cmOk(cg, vals);
    if (cg.op === '+') { const s = vals.reduce((a, b) => a + b, 0); return s + left <= cg.t && s + left * n >= cg.t; }
    if (cg.op === 'x') { const p = vals.reduce((a, b) => a * b, 1); return cg.t % p === 0; }
    return true;
};
function _cmCount(n, cages, id, limit) {
    const g = Array.from({ length: n }, () => Array(n).fill(0)); let cnt = 0;
    const order = []; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) order.push([r, c]);
    (function go(k) {
        if (cnt >= limit) return; if (k === order.length) { cnt++; return; }
        const [r, c] = order[k], cg = cages[id[r][c]];
        for (let v = 1; v <= n; v++) {
            if (g[r].includes(v) || g.some((row) => row[c] === v)) continue;
            g[r][c] = v; const vals = cg.cells.map(([y, x]) => g[y][x]).filter(Boolean);
            if (_cmCould(cg, vals, n)) go(k + 1);
            g[r][c] = 0; if (cnt >= limit) return;
        }
    })(0);
    return cnt;
}
function _cmMake(diff) {
    const n = diff === 'easy' ? 4 : diff === 'hard' ? 6 : 5, ops = diff === 'easy' ? ['+'] : diff === 'hard' ? ['+', '-', 'x', '/'] : ['+', '-', 'x'];
    for (let t = 0; t < 60; t++) {
        const L = _cmLatin(n), { id, cages } = _cmCages(n, diff === 'hard' ? 3 : 3);
        cages.forEach((cg) => {
            const v = cg.cells.map(([r, c]) => L[r][c]);
            if (v.length === 1) { cg.op = ''; cg.t = v[0]; return; }
            let pool = ops.filter((o) => (o === '-' || o === '/' ? v.length === 2 : true)).filter((o) => o !== '/' || Math.max(...v) % Math.min(...v) === 0);
            if (!pool.length) pool = ['+'];
            cg.op = pool[Math.floor(Math.random() * pool.length)];
            cg.t = cg.op === '+' ? v.reduce((a, b) => a + b, 0) : cg.op === 'x' ? v.reduce((a, b) => a * b, 1) : cg.op === '-' ? Math.abs(v[0] - v[1]) : Math.max(...v) / Math.min(...v);
        });
        if (cages.filter((c) => c.cells.length === 1).length > n) continue;   // not too many free numbers
        if (_cmCount(n, cages, id, 2) === 1) return { n, L, id, cages };
    }
    return null;
}
function initCageMath() {
    NK.start('cagemath', {
        setup(gs, diff) {
            let P = null; while (!P) P = _cmMake(diff);
            gs.P = P; gs.n = P.n; gs.g = Array.from({ length: P.n }, () => Array(P.n).fill(0)); gs.sel = [0, 0]; gs.over = false; gs.hints = 0; gs.bad = null;
            gs.msg = `Fill the grid: each number 1 to ${P.n} once in every row and column, and every cage makes its target.`;
        },
        view: _cmView,
        keys: Object.assign({ Backspace: () => cmNum(0), Delete: () => cmNum(0), Digit0: () => cmNum(0) }, NK.digits((d) => cmNum(d), 6)),
        arrows(dir) { const gs = gameState.cagemath, [dr, dc] = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] }[dir], r = gs.sel[0] + dr, c = gs.sel[1] + dc; if (r >= 0 && r < gs.n && c >= 0 && c < gs.n) { gs.sel = [r, c]; NK.render('cagemath'); } return true; },
        rules: (gs) => [
            `Each row and each column holds every number from <b>1 to ${gs.n}</b> exactly once.`,
            'Thick lines mark the <b>cages</b>. The numbers in a cage must make the target in its corner with the sign shown: <b>+</b> add them, <b>x</b> multiply them, <b>-</b> the difference of two, <b>/</b> one divided by the other.',
            'A cage of one square simply shows its number.',
            'Tap a square, then a number (or type it). Numbers repeated in a row or column turn red. Check shows wrong squares; Hint fills one.',
            'Every puzzle has exactly one answer. No clock. Keyboard: arrows move, digits write, Backspace clears.'],
        css: `.cm-g{display:grid;max-width:min(100%,30rem,max(18rem,calc(100vh - 300px)));margin:0 auto;border:4px solid #2b1b0d;background:#2b1b0d;gap:1px}
.cm-c{position:relative;aspect-ratio:1;border:0;background:#fffdf5;font:900 clamp(1.3rem,6vw,2rem) Georgia,serif;color:#1d4ed8;cursor:pointer;padding:0;--nk-r:0;min-width:0}
.cm-c .cm-t{position:absolute;top:2px;left:4px;font:800 clamp(.7rem,2.6vw,.95rem) system-ui;color:#2b1b0d}
.cm-c.cm-s{background:#fde68a}.cm-c.cm-bad{color:#b91c1c;background:#fee2e2}.cm-c.cm-wr{box-shadow:inset 0 0 0 3px #b91c1c}
.cm-pad{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;max-width:28rem;margin:12px auto 0}
.cm-pad .gk-btn{font-size:1.3rem;padding:0;min-width:52px;flex:0 0 auto}`,
    });
}
function cmSel(r, c) { const gs = gameState.cagemath; if (gs.over) return; gs.sel = [r, c]; gs.msg = ''; NK.render('cagemath'); }
function cmNum(v) {
    const gs = gameState.cagemath; if (gs.over || v > gs.n) return;
    const [r, c] = gs.sel; gs.g[r][c] = v; gs.bad = null;
    if (gs.g.every((row, rr) => row.every((x, cc) => x === gs.P.L[rr][cc]))) {
        gs.over = true; gs.msg = 'Every row, column and cage works out. Solved!'; NK.render('cagemath'); if (typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('cagemath', true, `Cage Math ${gs.n} x ${gs.n} solved${gs.hints ? ` (${NK.pl(gs.hints, 'hint')})` : ''}!`);
    }
    if (v) { for (let k = 1; k <= gs.n * gs.n; k++) { const i = (r * gs.n + c + k) % (gs.n * gs.n), rr = Math.floor(i / gs.n), cc = i % gs.n; if (!gs.g[rr][cc]) { gs.sel = [rr, cc]; break; } } }
    gs.msg = gs.g.every((row) => row.every(Boolean)) ? 'The grid is full but something is off. Try Check.' : '';
    NK.render('cagemath');
}
function cmCheck() { const gs = gameState.cagemath; if (gs.over) return; gs.bad = gs.g.map((row, r) => row.map((v, c) => v && v !== gs.P.L[r][c])); const n = gs.bad.flat().filter(Boolean).length; gs.msg = n ? `${NK.pl(n, 'square')} ${n === 1 ? 'is' : 'are'} wrong (ringed in red).` : 'Everything so far is right.'; NK.render('cagemath'); }
function cmHint() { const gs = gameState.cagemath; if (gs.over) return; for (let r = 0; r < gs.n; r++) for (let c = 0; c < gs.n; c++) if (gs.g[r][c] !== gs.P.L[r][c]) { gs.hints++; gs.sel = [r, c]; return cmNum(gs.P.L[r][c]); } }
function cmNew() { initCageMath(); }
function _cmView(gs) {
    const { n, id, cages } = gs.P;
    const dup = (r, c) => { const v = gs.g[r][c]; return v && (gs.g[r].filter((x) => x === v).length > 1 || gs.g.filter((row) => row[c] === v).length > 1); };
    let cells = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        const k = id[r][c], cg = cages[k], first = cg.cells.reduce((a, b) => (b[0] < a[0] || (b[0] === a[0] && b[1] < a[1]) ? b : a));
        const bt = r === 0 || id[r - 1][c] !== k ? 4 : 0, bl = c === 0 || id[r][c - 1] !== k ? 4 : 0, bb = r === n - 1 || id[r + 1][c] !== k ? 4 : 0, br = c === n - 1 || id[r][c + 1] !== k ? 4 : 0;
        const lab = first[0] === r && first[1] === c ? `<span class="cm-t">${cg.t}${cg.op === 'x' ? '×' : cg.op === '/' ? '÷' : cg.op === '-' ? '−' : cg.op}</span>` : '';
        const sel = gs.sel[0] === r && gs.sel[1] === c;
        cells += `<button type="button" class="nk-cell cm-c${sel ? ' cm-s' : ''}${dup(r, c) ? ' cm-bad' : ''}${gs.bad && gs.bad[r][c] ? ' cm-wr' : ''}" style="margin:${bt ? 3 : 0}px ${br ? 3 : 0}px ${bb ? 3 : 0}px ${bl ? 3 : 0}px" onclick="cmSel(${r},${c})" data-k="c${r}_${c}"${r === 0 && c === 0 ? ' data-first' : ''} aria-label="row ${r + 1} column ${c + 1}${lab ? `, cage ${cg.t} ${cg.op === 'x' ? 'times' : cg.op === '/' ? 'divide' : cg.op === '-' ? 'minus' : cg.op === '+' ? 'plus' : ''}` : ''}: ${gs.g[r][c] || 'empty'}"${gs.over ? ' disabled' : ''}>${lab}${gs.g[r][c] || ''}</button>`;
    }
    const pad = [...Array(n).keys()].map((k) => NK.btn(String(k + 1), `cmNum(${k + 1})`, { k: 'n' + (k + 1), disabled: gs.over })).join('') + NK.btn(Icon.svg('delete', { size: '24px', sw: 2.4 }), 'cmNum(0)', { k: 'n0', label: 'clear', disabled: gs.over });
    return `<div class="nk-top"><span>Grid: <b>${n} x ${n}</b></span><span>Hints: <b>${gs.hints}</b></span></div>
      <div class="cm-g" style="grid-template-columns:repeat(${n},1fr)">${cells}</div>
      <div class="cm-pad">${pad}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn('Check', 'cmCheck()', { k: 'check', disabled: gs.over })}${NK.btn(NK.icon('lightbulb') + 'Hint', 'cmHint()', { k: 'hint', disabled: gs.over })}${NK.btn(NK.icon('rotate-ccw') + 'New puzzle', 'cmNew()', { k: 'restart' })}</div>`;
}
