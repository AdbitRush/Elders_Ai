// ═══════════════════════════════════════════════════════════════════════════════
// CROSS SUMS (2026-11, nostalgia batch 2) — the number crossword of American puzzle magazines: every run of white
// squares adds up to the clue in the dark square before it, and no digit repeats within a run. Solo, no clock.
// Each puzzle is generated: a template is filled with random digits (no repeats in a run), the sums become the clues,
// and a solver checks that the answer is unique. If it is not, a few squares are given as starters until it is.
// Tap a square, then a digit (or type it). The selected runs and their possible digit sets are shown (not on hard).
// Repeats inside a run are marked at once; "Check" marks wrong squares; Hint fills one square.
// Easy 5x5, normal 6x6, hard 7x7 grids (including the clue row and column).
// ═══════════════════════════════════════════════════════════════════════════════
const _KS_T = {
    easy: [['#####', '#..##', '#...#', '##...', '###..'], ['#####', '##..#', '#...#', '#...#', '#..##']],
    normal: [['######', '#..#..', '#.....', '##..##', '#.....', '#..#..']],
    hard: [['#######', '#..#...', '#......', '##..#..', '#..#..#', '#......', '#...#..'], ['#######', '#...#..', '#......', '##...##', '#..#...', '#......', '##..#..']],
};
function _ksRuns(t) {
    const R = t.length, C = t[0].length, runs = [];
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
        if (t[r][c] !== '#') continue;
        for (const [dr, dc, dir] of [[0, 1, 'a'], [1, 0, 'd']]) {
            const cells = []; let y = r + dr, x = c + dc;
            while (y < R && x < C && t[y][x] === '.') { cells.push(y * C + x); y += dr; x += dc; }
            if (cells.length) runs.push({ r, c, dir, cells });
        }
    }
    return runs;
}
// count solutions (stop at 2) for sums on the template; `given` fixes some cells
function _ksCount(t, runs, sums, given) {
    const C = t[0].length, cells = [...new Set(runs.flatMap((x) => x.cells))].sort((a, b) => a - b);
    const of = {}; runs.forEach((x, k) => x.cells.forEach((i) => (of[i] = of[i] || []).push(k)));
    const v = {}, used = runs.map(() => 0), sum = runs.map(() => 0), left = runs.map((x) => x.cells.length);
    let n = 0;
    const ok = (k) => { const L = left[k], rem = sums[k] - sum[k]; if (L === 0) return rem === 0; let lo = 0, hi = 0, a = 0, b = 0; for (let d = 1; d <= 9 && a < L; d++) if (!(used[k] >> d & 1)) { lo += d; a++; } for (let d = 9; d >= 1 && b < L; d--) if (!(used[k] >> d & 1)) { hi += d; b++; } return a === L && rem >= lo && rem <= hi; };
    (function go(p) {
        if (n > 1) return;
        if (p === cells.length) { n++; return; }
        const i = cells[p], ks = of[i];
        for (let d = 1; d <= 9; d++) {
            if (given[i] && given[i] !== d) continue;
            if (ks.some((k) => used[k] >> d & 1)) continue;
            ks.forEach((k) => { used[k] |= 1 << d; sum[k] += d; left[k]--; });
            if (ks.every(ok)) { v[i] = d; go(p + 1); }
            ks.forEach((k) => { used[k] &= ~(1 << d); sum[k] -= d; left[k]++; });
            if (n > 1) return;
        }
    })(0);
    return n;
}
function _ksFill(t, runs) {
    const C = t[0].length, cells = [...new Set(runs.flatMap((x) => x.cells))];
    const of = {}; runs.forEach((x, k) => x.cells.forEach((i) => (of[i] = of[i] || []).push(k)));
    const v = {};
    const ok = (i, d) => of[i].every((k) => runs[k].cells.every((j) => v[j] !== d));
    return (function go(p) { if (p === cells.length) return true; const i = cells[p]; for (const d of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) { if (!ok(i, d)) continue; v[i] = d; if (go(p + 1)) return true; delete v[i]; } return false; })(0) ? v : null;
}
function _ksMake(diff) {
    const list = _KS_T[diff] || _KS_T.normal;
    for (let tries = 0; tries < 40; tries++) {
        const t = list[Math.floor(Math.random() * list.length)], runs = _ksRuns(t), sol = _ksFill(t, runs);
        if (!sol) continue;
        const sums = runs.map((x) => x.cells.reduce((a, i) => a + sol[i], 0));
        const given = {};
        let n = _ksCount(t, runs, sums, given);
        const cells = shuffle(Object.keys(sol).map(Number));
        while (n > 1 && cells.length) { const i = cells.pop(); given[i] = sol[i]; n = _ksCount(t, runs, sums, given); }
        if (n === 1 && Object.keys(given).length <= (diff === 'easy' ? 3 : diff === 'hard' ? 6 : 4)) return { t, runs, sums, sol, given };
    }
    return null;
}
// digit sets that make `s` in `L` different digits
function _ksCombos(s, L) { const out = []; (function go(d, left, acc, sum) { if (acc.length === L) { if (sum === s) out.push(acc.join('+')); return; } for (let x = d; x <= 9; x++) { if (sum + x > s) break; go(x + 1, left - 1, acc.concat(x), sum + x); } })(1, L, [], 0); return out; }
function initCrossSums() {
    NK.start('crosssums', {
        setup(gs, diff) {
            gs.diff = diff; let P = null; while (!P) P = _ksMake(diff);
            gs.P = P; gs.C = P.t[0].length; gs.v = {}; Object.keys(P.given).forEach((i) => (gs.v[i] = P.given[i]));
            gs.sel = +Object.keys(P.sol).find((i) => !P.given[i]); gs.bad = {}; gs.over = false; gs.hints = 0;
            gs.msg = 'Tap a white square, then a digit. Each run must add up to its clue, with no digit twice.';
        },
        view: _ksView,
        keys: Object.assign({ Backspace: () => ksDigit(0), Delete: () => ksDigit(0), Digit0: () => ksDigit(0), Numpad0: () => ksDigit(0) }, NK.digits((n) => ksDigit(n), 9)),
        arrows(dir) { ksMove(dir); return true; },
        rules: [
            'Every clue square has a number above the slash (for the run of white squares going <b>across</b> to its right) and/or below it (for the run going <b>down</b> beneath it).',
            'Fill each white square with a digit from <b>1 to 9</b> so that every run adds up to its clue.',
            '<b>No digit may repeat</b> within a run. A repeat is marked in red straight away.',
            'Small runs are the place to start: 3 in two squares can only be 1+2, and 17 in two squares can only be 8+9.',
            'The eraser key clears a square. The panel under the grid lists the digit sets that fit the selected runs (not on hard). Check marks wrong squares; Hint fills one in.',
            'No clock. Keyboard: arrow keys move, 1-9 write, 0 or Backspace erases.'],
        css: `.ks-grid{display:grid;gap:2px;background:#2b1b0d;padding:3px;border-radius:10px;max-width:min(100%,30rem);margin:0 auto}
.ks-b{aspect-ratio:1;background:#3d2a17;position:relative;color:#fff7e6;font:800 clamp(.72rem,2.8vw,1rem)/1 system-ui,sans-serif;overflow:hidden}
.ks-b.ks-clue{background:linear-gradient(to top right,#3d2a17 calc(50% - 1px),#c9a46a 50%,#3d2a17 calc(50% + 1px))}
.ks-b .a{position:absolute;top:8%;right:10%}.ks-b .d{position:absolute;bottom:8%;left:10%}
.ks-w{aspect-ratio:1;background:#fffdf5;border:0;padding:0;font:900 clamp(1.25rem,5.5vw,1.9rem)/1 Georgia,serif;color:#1d4ed8;cursor:pointer;--nk-r:3px;min-width:0}
.ks-w.ks-g{color:#2b1b0d;background:#f3ead8}
.ks-w.ks-run{background:#fef3c7}.ks-w.ks-sel{background:#fde68a;box-shadow:inset 0 0 0 3px #b45309}
.ks-w.ks-bad{color:#b91c1c;background:#fee2e2}
.ks-pad{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;max-width:24rem;margin:10px auto 0}
.ks-pad .gk-btn{font-size:1.35rem;min-height:54px;padding:0;min-width:0}
.ks-info{text-align:center;font-size:1.02rem;color:#4a3420;margin-top:8px;min-height:1.4em}`,
    });
}
const _ksRunsOf = (gs, i) => gs.P.runs.map((x, k) => (x.cells.includes(i) ? k : -1)).filter((k) => k >= 0);
function _ksDupes(gs) {
    const bad = {};
    gs.P.runs.forEach((x) => { const seen = {}; x.cells.forEach((i) => { const d = gs.v[i]; if (!d) return; (seen[d] = seen[d] || []).push(i); }); Object.values(seen).forEach((l) => { if (l.length > 1) l.forEach((i) => (bad[i] = 1)); }); });
    return bad;
}
function ksSel(i) { const gs = gameState.crosssums; if (gs.over) return; gs.sel = i; gs.msg = gs.P.given[i] ? 'That square was given as a starter.' : ''; NK.render('crosssums'); }
function ksMove(dir) {
    const gs = gameState.crosssums; if (gs.over) return;
    const C = gs.C, R = gs.P.t.length, [dr, dc] = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] }[dir];
    let r = Math.floor(gs.sel / C), c = gs.sel % C;
    for (;;) { r += dr; c += dc; if (r < 0 || r >= R || c < 0 || c >= C) return; if (gs.P.t[r][c] === '.') { gs.sel = r * C + c; return NK.render('crosssums'); } }
}
function ksDigit(d) {
    const gs = gameState.crosssums; if (gs.over || gs.sel < 0) return;
    if (gs.P.given[gs.sel]) { gs.msg = 'That square was given as a starter.'; return NK.render('crosssums'); }
    if (d) gs.v[gs.sel] = d; else delete gs.v[gs.sel];
    gs.bad = {};
    const cells = Object.keys(gs.P.sol).map(Number);
    if (cells.every((i) => gs.v[i])) {
        const okAll = gs.P.runs.every((x, k) => x.cells.reduce((a, i) => a + gs.v[i], 0) === gs.P.sums[k]) && !Object.keys(_ksDupes(gs)).length;
        if (okAll) {
            gs.over = true; gs.msg = 'Every run adds up. Solved!'; NK.render('crosssums');
            if (typeof sfxCorrect === 'function') sfxCorrect();
            return NK.finish('crosssums', true, `Cross Sums solved${gs.hints ? ` with ${NK.pl(gs.hints, 'hint')}` : ' without a hint'}!`);
        }
        gs.msg = 'All squares are filled, but some runs do not add up yet. Try Check.';
    } else if (d) {
        // auto-advance along the current across run
        const k = _ksRunsOf(gs, gs.sel).find((k) => gs.P.runs[k].dir === 'a'), run = k !== undefined ? gs.P.runs[k].cells : [];
        const nx = run.find((i) => i > gs.sel && !gs.v[i]); if (nx !== undefined) gs.sel = nx;
        gs.msg = '';
    }
    NK.render('crosssums');
}
function ksCheck() {
    const gs = gameState.crosssums; if (gs.over) return;
    gs.bad = {}; let n = 0; Object.keys(gs.v).forEach((i) => { if (gs.v[i] !== gs.P.sol[i]) { gs.bad[i] = 1; n++; } });
    gs.msg = n ? `${NK.pl(n, 'square')} ${n === 1 ? 'is' : 'are'} not right (marked red).` : 'Everything filled in so far is right.';
    NK.render('crosssums');
}
function ksHint() {
    const gs = gameState.crosssums; if (gs.over) return;
    const cells = Object.keys(gs.P.sol).map(Number), i = cells.find((x) => gs.v[x] !== gs.P.sol[x] && x === gs.sel) ?? cells.find((x) => gs.v[x] !== gs.P.sol[x]);
    if (i === undefined) return; gs.hints++; gs.sel = i; gs.msg = 'Hint: one square filled in.';
    ksDigit(gs.P.sol[i]);
}
function ksNew() { initCrossSums(); }
function _ksView(gs) {
    const { t, runs, sums } = gs.P, R = t.length, C = gs.C;
    const clue = {}; runs.forEach((x, k) => { const id = x.r * C + x.c; clue[id] = clue[id] || {}; clue[id][x.dir] = sums[k]; });
    const selRuns = gs.sel >= 0 ? _ksRunsOf(gs, gs.sel) : [], inRun = new Set(selRuns.flatMap((k) => runs[k].cells));
    const dup = _ksDupes(gs);
    let cells = '';
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
        const i = r * C + c;
        if (t[r][c] === '#') { const q = clue[i]; cells += q ? `<span class="ks-b ks-clue" aria-label="clue${q.a ? ', across ' + q.a : ''}${q.d ? ', down ' + q.d : ''}">${q.a ? `<span class="a">${q.a}</span>` : ''}${q.d ? `<span class="d">${q.d}</span>` : ''}</span>` : '<span class="ks-b"></span>'; continue; }
        const v = gs.v[i], cls = 'nk-cell ks-w' + (gs.P.given[i] ? ' ks-g' : '') + (inRun.has(i) ? ' ks-run' : '') + (gs.sel === i ? ' ks-sel' : '') + (dup[i] || gs.bad[i] ? ' ks-bad' : '');
        cells += `<button type="button" class="${cls}" onclick="ksSel(${i})" data-k="w${i}" aria-label="row ${r} column ${c}${v ? ', ' + v : ', empty'}${gs.P.given[i] ? ', given' : ''}"${gs.over ? ' disabled' : ''}>${v || ''}</button>`;
    }
    const info = gs.diff === 'hard' || gs.over ? '' : selRuns.map((k) => { const x = runs[k], cs = _ksCombos(sums[k], x.cells.length); return `${x.dir === 'a' ? 'Across' : 'Down'} ${sums[k]} in ${x.cells.length}: ${cs.length > 4 ? cs.length + ' ways' : cs.join(', ')}`; }).join(' · ');
    const pad = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => NK.btn(String(d), `ksDigit(${d})`, { k: 'd' + d, disabled: gs.over })).join('') + NK.btn(Icon.svg('delete', { size: '26px', sw: 2.4 }), 'ksDigit(0)', { k: 'd0', label: 'erase', disabled: gs.over });
    return `<div class="nk-top"><span>Squares filled: <b>${Object.keys(gs.v).length}</b> of ${Object.keys(gs.P.sol).length}</span><span>Hints: <b>${gs.hints}</b></span></div>
      <div class="ks-grid" style="grid-template-columns:repeat(${C},1fr)">${cells}</div>
      <div class="ks-info">${info}</div>
      <div class="ks-pad">${pad}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn('Check', 'ksCheck()', { k: 'check', disabled: gs.over })}${NK.btn(NK.icon('lightbulb') + 'Hint', 'ksHint()', { k: 'hint', disabled: gs.over })}${NK.btn(NK.icon('rotate-ccw') + 'New puzzle', 'ksNew()', { k: 'restart' })}</div>`;
}
