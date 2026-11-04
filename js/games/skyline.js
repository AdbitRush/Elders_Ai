// ═══════════════════════════════════════════════════════════════════════════════
// CITY SKYLINE (2026-11, nostalgia batch 3) — the "skyscrapers" logic puzzle from puzzle magazines. Each square holds
// a building 1 to n stories tall; every row and column has each height once. A number around the edge tells how
// many buildings you can see from there, looking along the row or column: a taller building hides shorter ones
// behind it. Generated from a random Latin square; clues are removed while a solver still finds exactly one answer.
// Easy 4x4, normal 5x5, hard 5x5 with fewer clues. Buildings are drawn as little towers as well as numbers.
// ═══════════════════════════════════════════════════════════════════════════════
const _skSee = (line) => { let m = 0, s = 0; for (const h of line) if (h > m) { m = h; s++; } return s; };
function _skClues(L, n) {
    const col = (c) => L.map((r) => r[c]);
    return { top: [...Array(n).keys()].map((c) => _skSee(col(c))), bot: [...Array(n).keys()].map((c) => _skSee(col(c).reverse())), left: L.map((r) => _skSee(r)), right: L.map((r) => _skSee(r.slice().reverse())) };
}
function _skCount(n, C, giv, limit) {
    const g = Array.from({ length: n }, () => Array(n).fill(0)); let cnt = 0;
    const fits = (line, a, b) => { const full = line.every(Boolean); if (!full) return true; return (!a || _skSee(line) === a) && (!b || _skSee(line.slice().reverse()) === b); };
    (function go(k) {
        if (cnt >= limit) return; if (k === n * n) { cnt++; return; }
        const r = Math.floor(k / n), c = k % n;
        for (let v = 1; v <= n; v++) {
            if (giv[k] && giv[k] !== v) continue;
            if (g[r].includes(v) || g.some((row) => row[c] === v)) continue;
            g[r][c] = v;
            const okR = c < n - 1 || fits(g[r], C.left[r], C.right[r]), colL = g.map((row) => row[c]), okC = r < n - 1 || fits(colL, C.top[c], C.bot[c]);
            if (okR && okC) go(k + 1);
            g[r][c] = 0; if (cnt >= limit) return;
        }
    })(0);
    return cnt;
}
function _skMake(diff) {
    const n = diff === 'easy' ? 4 : 5;
    for (let t = 0; t < 30; t++) {
        const L = _cmLatinSk(n), full = _skClues(L, n), C = JSON.parse(JSON.stringify(full)), giv = {};
        const slots = shuffle(['top', 'bot', 'left', 'right'].flatMap((s) => [...Array(n).keys()].map((i) => [s, i])));
        const keep = diff === 'hard' ? 0.3 : diff === 'easy' ? 0.6 : 0.45;
        if (_skCount(n, C, giv, 2) !== 1) continue;
        for (const [s, i] of slots) { const v = C[s][i]; C[s][i] = 0; if (_skCount(n, C, giv, 2) !== 1) C[s][i] = v; }
        // easy/normal: put some removed clues back so the puzzle is gentler
        const removed = slots.filter(([s, i]) => !C[s][i]); shuffle(removed).slice(0, Math.round(removed.length * keep)).forEach(([s, i]) => (C[s][i] = full[s][i]));
        return { n, L, C };
    }
    return null;
}
function _cmLatinSk(n) { const base = [...Array(n).keys()].map((r) => [...Array(n).keys()].map((c) => ((r + c) % n) + 1)); const rows = shuffle([...Array(n).keys()]), cols = shuffle([...Array(n).keys()]), sym = shuffle([...Array(n).keys()].map((x) => x + 1)); return rows.map((r) => cols.map((c) => sym[base[r][c] - 1])); }
function initSkyline() {
    NK.start('skyline', {
        setup(gs, diff) {
            let P = null; while (!P) P = _skMake(diff);
            gs.P = P; gs.n = P.n; gs.g = Array.from({ length: P.n }, () => Array(P.n).fill(0)); gs.sel = [0, 0]; gs.over = false; gs.hints = 0; gs.bad = null;
            gs.msg = 'Each edge number says how many buildings you can see from there. Taller ones hide shorter ones behind them.';
        },
        view: _skView,
        keys: Object.assign({ Backspace: () => skyNum(0), Delete: () => skyNum(0), Digit0: () => skyNum(0) }, NK.digits((d) => skyNum(d), 5)),
        arrows(dir) { const gs = gameState.skyline, [dr, dc] = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] }[dir], r = gs.sel[0] + dr, c = gs.sel[1] + dc; if (r >= 0 && r < gs.n && c >= 0 && c < gs.n) { gs.sel = [r, c]; NK.render('skyline'); } return true; },
        rules: (gs) => [
            `Each square holds a building <b>1 to ${gs.n}</b> stories tall. Every row and column has each height once.`,
            'A number at the edge says <b>how many buildings you can see</b> looking in from that side. A taller building hides every shorter one behind it.',
            `So a 1 means the tallest building (${gs.n}) is right at that edge, and a ${gs.n} means the buildings rise one by one: 1, 2, 3...`,
            'Tap a square, then a height. Check marks wrong squares; Hint fills one. Every puzzle has exactly one answer.',
            'No clock. Keyboard: arrows move, digits write, Backspace clears.'],
        css: `.sky-g{display:grid;gap:3px;max-width:min(100%,30rem,max(18rem,calc(100vh - 300px)));margin:0 auto;align-items:center;justify-items:center}
.sky-cl{font:900 clamp(1rem,4.4vw,1.4rem) Georgia,serif;color:#7c2d12;width:100%;text-align:center}
.sky-c{position:relative;width:100%;aspect-ratio:1;border:2px solid #94a3b8;background:linear-gradient(#e0f2fe,#f8fafc);border-radius:6px;cursor:pointer;padding:0;--nk-r:6px;--nk-bw:2px;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;min-width:0}
.sky-c b{position:absolute;top:2px;left:0;right:0;font:900 clamp(1rem,4.6vw,1.5rem) Georgia,serif;color:#0f172a;text-shadow:0 0 3px #fff}
.sky-tw{width:46%;background:repeating-linear-gradient(0deg,#475569 0 5px,#facc15 5px 7px,#475569 7px 12px);border-radius:2px 2px 0 0}
.sky-c.sky-s{border-color:#b45309;box-shadow:0 0 0 3px #fde68a}.sky-c.sky-bad b{color:#b91c1c}.sky-c.sky-wr{box-shadow:inset 0 0 0 3px #b91c1c}
.sky-pad{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:12px 0 0}.sky-pad .gk-btn{min-width:52px;font-size:1.3rem}`,
    });
}
function skySel(r, c) { const gs = gameState.skyline; if (gs.over) return; gs.sel = [r, c]; gs.msg = ''; NK.render('skyline'); }
function skyNum(v) {
    const gs = gameState.skyline; if (gs.over || v > gs.n) return;
    const [r, c] = gs.sel; gs.g[r][c] = v; gs.bad = null;
    if (gs.g.every((row, rr) => row.every((x, cc) => x === gs.P.L[rr][cc]))) {
        gs.over = true; gs.msg = 'The whole skyline fits every clue. Solved!'; NK.render('skyline'); if (typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('skyline', true, `City Skyline ${gs.n} x ${gs.n} solved${gs.hints ? ` (${NK.pl(gs.hints, 'hint')})` : ''}!`);
    }
    if (v) { for (let k = 1; k <= gs.n * gs.n; k++) { const i = (r * gs.n + c + k) % (gs.n * gs.n); if (!gs.g[Math.floor(i / gs.n)][i % gs.n]) { gs.sel = [Math.floor(i / gs.n), i % gs.n]; break; } } }
    gs.msg = gs.g.every((row) => row.every(Boolean)) ? 'The grid is full, but a clue is not met yet. Try Check.' : '';
    NK.render('skyline');
}
function skyCheck() { const gs = gameState.skyline; if (gs.over) return; gs.bad = gs.g.map((row, r) => row.map((v, c) => v && v !== gs.P.L[r][c])); const k = gs.bad.flat().filter(Boolean).length; gs.msg = k ? `${NK.pl(k, 'building')} ${k === 1 ? 'is' : 'are'} wrong (ringed in red).` : 'Everything so far is right.'; NK.render('skyline'); }
function skyHint() { const gs = gameState.skyline; if (gs.over) return; for (let r = 0; r < gs.n; r++) for (let c = 0; c < gs.n; c++) if (gs.g[r][c] !== gs.P.L[r][c]) { gs.hints++; gs.sel = [r, c]; return skyNum(gs.P.L[r][c]); } }
function skyNew() { initSkyline(); }
function _skView(gs) {
    const { n, C } = gs.P, cl = (v, lab) => `<span class="sky-cl" aria-label="${lab}${v ? ': see ' + v : ': no clue'}">${v || ''}</span>`;
    const dup = (r, c) => { const v = gs.g[r][c]; return v && (gs.g[r].filter((x) => x === v).length > 1 || gs.g.filter((row) => row[c] === v).length > 1); };
    let h = '<span></span>' + C.top.map((v, c) => cl(v, `from the top, column ${c + 1}`)).join('') + '<span></span>';
    for (let r = 0; r < n; r++) {
        h += cl(C.left[r], `from the left, row ${r + 1}`);
        for (let c = 0; c < n; c++) { const v = gs.g[r][c], s = gs.sel[0] === r && gs.sel[1] === c; h += `<button type="button" class="nk-cell sky-c${s ? ' sky-s' : ''}${dup(r, c) ? ' sky-bad' : ''}${gs.bad && gs.bad[r][c] ? ' sky-wr' : ''}" onclick="skySel(${r},${c})" data-k="c${r}_${c}"${r === 0 && c === 0 ? ' data-first' : ''} aria-label="row ${r + 1} column ${c + 1}: ${v ? v + ' stories' : 'empty'}"${gs.over ? ' disabled' : ''}>${v ? `<span class="sky-tw" style="height:${v / n * 62}%"></span><b>${v}</b>` : ''}</button>`; }
        h += cl(C.right[r], `from the right, row ${r + 1}`);
    }
    h += '<span></span>' + C.bot.map((v, c) => cl(v, `from the bottom, column ${c + 1}`)).join('') + '<span></span>';
    const pad = [...Array(n).keys()].map((k) => NK.btn(String(k + 1), `skyNum(${k + 1})`, { k: 'n' + (k + 1), disabled: gs.over })).join('') + NK.btn(Icon.svg('delete', { size: '24px', sw: 2.4 }), 'skyNum(0)', { k: 'n0', label: 'clear', disabled: gs.over });
    return `<div class="nk-top"><span>City: <b>${n} x ${n}</b></span><span>Hints: <b>${gs.hints}</b></span></div>
      <div class="sky-g" style="grid-template-columns:2rem repeat(${n},1fr) 2rem">${h}</div>
      <div class="sky-pad">${pad}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn('Check', 'skyCheck()', { k: 'check', disabled: gs.over })}${NK.btn(NK.icon('lightbulb') + 'Hint', 'skyHint()', { k: 'hint', disabled: gs.over })}${NK.btn(NK.icon('rotate-ccw') + 'New city', 'skyNew()', { k: 'restart' })}</div>`;
}
