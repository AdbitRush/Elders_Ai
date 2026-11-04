// ═══════════════════════════════════════════════════════════════════════════════
// CAMPGROUND (2026-11, nostalgia batch 3) — the tents-and-trees grid puzzle. Every tree has its own tent right next
// to it (above, below, left or right). Tents never touch each other, not even at a corner. The numbers along the
// edge say how many tents are in that row or column. Each puzzle is grown from a real camp, so it always has an
// answer; any answer that follows the rules is accepted (the tree-to-tent pairing is checked with a matching).
// Tap a square: tent, then grass ("no tent here"), then empty. Easy 6x6, normal 8x8, hard 10x10. No clock.
// ═══════════════════════════════════════════════════════════════════════════════
const _TN_D = [[0, 1], [0, -1], [1, 0], [-1, 0]];
function _tnMake(n) {
    const want = Math.round(n * n * 0.19);
    for (let t = 0; t < 200; t++) {
        const tent = Array.from({ length: n }, () => Array(n).fill(false)), tree = Array.from({ length: n }, () => Array(n).fill(false));
        let k = 0;
        for (const i of shuffle([...Array(n * n).keys()])) {
            if (k >= want) break;
            const r = Math.floor(i / n), c = i % n; if (tent[r][c] || tree[r][c]) continue;
            let touch = false; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (tent[r + a] && tent[r + a][c + b]) touch = true; if (touch) continue;
            const spots = shuffle(_TN_D.map(([a, b]) => [r + a, c + b]).filter(([y, x]) => y >= 0 && y < n && x >= 0 && x < n && !tent[y][x] && !tree[y][x]));
            if (!spots.length) continue;
            tent[r][c] = true; tree[spots[0][0]][spots[0][1]] = true; k++;
        }
        if (k < want) continue;
        return { n, tent, tree, rows: tent.map((row) => row.filter(Boolean).length), cols: [...Array(n).keys()].map((c) => tent.filter((row) => row[c]).length) };
    }
    return null;
}
function initTents() {
    NK.start('tents', {
        setup(gs, diff) {
            const n = diff === 'easy' ? 6 : diff === 'hard' ? 10 : 8;
            let P = null; while (!P) P = _tnMake(n);
            gs.P = P; gs.n = n; gs.g = Array.from({ length: n }, () => Array(n).fill(0)); gs.over = false; gs.hints = 0;
            gs.msg = 'Tap a square next to a tree to pitch a tent. Every tree needs its own tent.';
        },
        view: _tnView,
        keys: { KeyH: () => tnHint() },
        rules: [
            'Every <b>tree</b> has exactly one <b>tent</b> of its own, right beside it: above, below, left or right (not slanting).',
            'Tents <b>never touch</b> each other, not even corner to corner.',
            'The numbers at the top and left say <b>how many tents</b> go in that column or row.',
            'Tap a square once for a tent, again for grass (meaning "no tent here"), again to clear. Tents that touch turn red.',
            'Hint pitches one tent. Any camp that follows the rules wins. No clock. Keyboard: arrow keys and Enter, H for a hint.'],
        css: `.tn-b{display:grid;gap:2px;max-width:min(100%,32rem,max(18rem,calc(100vh - 300px)));margin:0 auto;align-items:center;justify-items:center}
.tn-cl{font:900 clamp(.95rem,4vw,1.35rem) Georgia,serif;color:#14532d;width:100%;text-align:center;border-radius:6px}
.tn-cl.tn-full{color:#9ca3af}.tn-cl.tn-over{color:#b91c1c;background:#fee2e2}
.tn-s{width:100%;aspect-ratio:1;border:0;padding:0;min-width:0;display:flex;align-items:center;justify-content:center;background:#ecfccb;cursor:pointer;--nk-r:4px;box-shadow:inset 0 0 0 1px #a3b18a}
.tn-s.tn-g{background:#bef264}
.tn-t{width:100%;aspect-ratio:1;display:flex;align-items:center;justify-content:center;background:#d9f99d;border-radius:4px;color:#166534}
.tn-t svg,.tn-s svg{width:76%;height:76%}
.tn-s.tn-tent{color:#c2410c}.tn-s.tn-bad{background:#fecaca;color:#991b1b}
.tn-grass{font:900 1.1rem sans-serif;color:#4d7c0f}`,
    });
}
// can the tents be paired one-to-one with the trees, each tent beside its tree? (simple augmenting-path matching)
function _tnMatch(gs) {
    const { n, tree } = gs.P, trees = [], tents = new Map();
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) { if (tree[r][c]) trees.push([r, c]); if (gs.g[r][c] === 1) tents.set(r * n + c, -1); }
    if (trees.length !== tents.size) return false;
    const tryT = (i, seen) => { const [r, c] = trees[i]; for (const [a, b] of _TN_D) { const y = r + a, x = c + b, k = y * n + x; if (y < 0 || y >= n || x < 0 || x >= n || !tents.has(k) || seen.has(k)) continue; seen.add(k); if (tents.get(k) < 0 || tryT(tents.get(k), seen)) { tents.set(k, i); return true; } } return false; };
    return trees.every((_, i) => tryT(i, new Set()));
}
const _tnTouch = (gs, r, c) => { for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if ((a || b) && gs.g[r + a] && gs.g[r + a][c + b] === 1) return true; return false; };
const _tnNextTree = (gs, r, c) => _TN_D.some(([a, b]) => gs.P.tree[r + a] && gs.P.tree[r + a][c + b]);
function tnTap(r, c) {
    const gs = gameState.tents; if (gs.over || gs.P.tree[r][c]) return;
    gs.g[r][c] = (gs.g[r][c] + 1) % 3;
    if (gs.g[r][c] === 1 && typeof sfxFlip === 'function') sfxFlip();
    _tnAfter(gs, gs.g[r][c] === 1 ? (_tnNextTree(gs, r, c) ? 'Tent pitched.' : 'Tent pitched, but it has no tree beside it.') : gs.g[r][c] === 2 ? 'Marked as grass.' : 'Square cleared.');
}
function _tnAfter(gs, said) {
    const { n, rows, cols } = gs.P, rN = gs.g.map((row) => row.filter((v) => v === 1).length), cN = [...Array(n).keys()].map((c) => gs.g.filter((row) => row[c] === 1).length);
    const touching = gs.g.some((row, r) => row.some((v, c) => v === 1 && _tnTouch(gs, r, c)));
    if (!touching && rN.every((v, i) => v === rows[i]) && cN.every((v, i) => v === cols[i]) && _tnMatch(gs)) {
        gs.over = true; gs.msg = 'Every tree has its own tent and the counts all match. Happy camping!'; NK.render('tents'); if (typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('tents', true, `Campground ${n} x ${n} solved: ${NK.pl(rows.reduce((a, b) => a + b, 0), 'tent')} pitched${gs.hints ? ` (${NK.pl(gs.hints, 'hint')})` : ''}.`);
    }
    const placed = rN.reduce((a, b) => a + b, 0), need = rows.reduce((a, b) => a + b, 0);
    gs.msg = touching ? `${said} Two tents are touching (shown in red).` : placed === need ? `${said} All ${need} tents are out, but a count or a tree pairing is not right yet.` : `${said} ${placed} of ${need} tents pitched.`;
    NK.render('tents');
}
function tnHint() {
    const gs = gameState.tents; if (gs.over) return; const { n, tent } = gs.P;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (gs.g[r][c] === 1 && !tent[r][c] && _tnTouch(gs, r, c)) { gs.g[r][c] = 2; gs.hints++; return _tnAfter(gs, `Hint: the tent in row ${r + 1}, column ${c + 1} came down.`); }
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (tent[r][c] && gs.g[r][c] !== 1) {
        for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if ((a || b) && gs.g[r + a] && gs.g[r + a][c + b] === 1) gs.g[r + a][c + b] = 0;
        gs.g[r][c] = 1; gs.hints++; return _tnAfter(gs, `Hint: a tent goes in row ${r + 1}, column ${c + 1}.`);
    }
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (gs.g[r][c] === 1 && !tent[r][c]) { gs.g[r][c] = 0; gs.hints++; return _tnAfter(gs, `Hint: the tent in row ${r + 1}, column ${c + 1} came down.`); }
}
function tnFill() {
    // the paper-puzzle shortcut: mark grass on every empty square that is not beside any tree
    const gs = gameState.tents; if (gs.over) return; let k = 0;
    gs.g.forEach((row, r) => row.forEach((v, c) => { if (!v && !gs.P.tree[r][c] && !_tnNextTree(gs, r, c)) { row[c] = 2; k++; } }));
    gs.msg = k ? `${NK.pl(k, 'square')} with no tree beside ${k === 1 ? 'it' : 'them'} marked as grass.` : 'Every square away from the trees is already marked.'; NK.render('tents');
}
function tnClear() { const gs = gameState.tents; if (gs.over) return; gs.g = gs.g.map((row) => row.map(() => 0)); gs.msg = 'Camp cleared.'; NK.render('tents'); }
function tnNew() { initTents(); }
function _tnView(gs) {
    const { n, tree, rows, cols } = gs.P, treeI = Icon.svg('tree-pine', { size: '100%', sw: 2, fill: true, fillOpacity: 0.55 }), tentI = Icon.svg('tent', { size: '100%', sw: 2.2, fill: true, fillOpacity: 0.35 });
    const rN = gs.g.map((row) => row.filter((v) => v === 1).length), cN = [...Array(n).keys()].map((c) => gs.g.filter((row) => row[c] === 1).length);
    const cl = (need, have, lab) => `<span class="tn-cl${have === need ? ' tn-full' : have > need ? ' tn-over' : ''}" aria-label="${lab}: ${need} tents, ${have} pitched">${need}</span>`;
    let h = '<span></span>' + cols.map((v, c) => cl(v, cN[c], `column ${c + 1}`)).join(''), first = true;
    for (let r = 0; r < n; r++) {
        h += cl(rows[r], rN[r], `row ${r + 1}`);
        for (let c = 0; c < n; c++) {
            if (tree[r][c]) { h += `<span class="tn-t" role="img" aria-label="row ${r + 1} column ${c + 1}: tree">${treeI}</span>`; continue; }
            const v = gs.g[r][c], bad = v === 1 && _tnTouch(gs, r, c);
            h += `<button type="button" class="nk-cell tn-s${v === 2 ? ' tn-g' : ''}${v === 1 ? ' tn-tent' : ''}${bad ? ' tn-bad' : ''}" onclick="tnTap(${r},${c})" data-k="s${r}_${c}"${first ? ' data-first' : ''} aria-label="row ${r + 1} column ${c + 1}: ${v === 1 ? 'tent' + (bad ? ', touching another tent' : '') : v === 2 ? 'grass' : 'empty'}"${gs.over ? ' disabled' : ''}>${v === 1 ? tentI : v === 2 ? '<span class="tn-grass" aria-hidden="true">"</span>' : ''}</button>`;
            first = false;
        }
    }
    const placed = rN.reduce((a, b) => a + b, 0), need = rows.reduce((a, b) => a + b, 0);
    return `<div class="nk-top"><span>Tents: <b>${placed}</b> of ${need}</span><span>Hints: <b>${gs.hints}</b></span></div>
      <div class="tn-b" style="grid-template-columns:1.8rem repeat(${n},1fr)">${h}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('lightbulb') + 'Hint', 'tnHint()', { k: 'hint', disabled: gs.over })}${NK.btn('Grass away from trees', 'tnFill()', { k: 'fill', disabled: gs.over })}${NK.btn('Clear all', 'tnClear()', { k: 'clear', disabled: gs.over })}${NK.btn(NK.icon('rotate-ccw') + 'New camp', 'tnNew()', { k: 'restart' })}</div>`;
}
