// ═══════════════════════════════════════════════════════════════════════════════
// NUMBER PYRAMID (2026-11, nostalgia batch 3) — the newspaper number puzzle: every brick is the SUM of the two bricks
// right under it. Some bricks are given; work out the rest. Easy: 4 rows, normal 5, hard 6 (bigger numbers).
// Each puzzle is made from a random bottom row; bricks are revealed until simple step-by-step reasoning (two of
// three numbers in a little triangle give the third) fills the whole pyramid, so it never needs guessing.
// Tap a brick, type the number with the pad, press Enter (or OK). No clock.
// ═══════════════════════════════════════════════════════════════════════════════
function _npBuild(rows, maxBase) {
    const base = Array.from({ length: rows }, () => 1 + Math.floor(Math.random() * maxBase));
    const P = [base]; for (let r = 1; r < rows; r++) P.push(P[r - 1].slice(1).map((x, i) => P[r - 1][i] + x));
    return P;   // P[0] = bottom row
}
function _npSolves(P, known) {
    const K = P.map((row, r) => row.map((_, i) => known.has(r + ',' + i)));
    for (let changed = true; changed;) {
        changed = false;
        for (let r = 1; r < P.length; r++) for (let i = 0; i < P[r].length; i++) {
            const t = K[r][i], a = K[r - 1][i], b = K[r - 1][i + 1], n = (t ? 1 : 0) + (a ? 1 : 0) + (b ? 1 : 0);
            if (n === 2) { K[r][i] = K[r - 1][i] = K[r - 1][i + 1] = true; changed = true; }
        }
    }
    return K.every((row) => row.every(Boolean));
}
function initNumPyramid() {
    NK.start('numpyramid', {
        setup(gs, diff) {
            gs.rows = diff === 'easy' ? 4 : diff === 'hard' ? 6 : 5;
            gs.P = _npBuild(gs.rows, diff === 'hard' ? 15 : diff === 'easy' ? 6 : 9);
            const all = []; gs.P.forEach((row, r) => row.forEach((_, i) => all.push(r + ',' + i)));
            const known = new Set();
            for (const k of shuffle(all)) { if (_npSolves(gs.P, known)) break; known.add(k); }
            // drop any given that is not needed
            for (const k of shuffle([...known])) { known.delete(k); if (!_npSolves(gs.P, known)) known.add(k); }
            gs.given = known; gs.v = {}; known.forEach((k) => (gs.v[k] = gs.P[+k.split(',')[0]][+k.split(',')[1]]));
            gs.sel = all.find((k) => !known.has(k)); gs.entry = ''; gs.over = false; gs.wrong = 0;
            gs.msg = 'Each brick is the sum of the two bricks under it. Tap an empty brick and type its number.';
        },
        view: _npView,
        enter() { npOk(); },
        keys: Object.assign({ Enter: (e) => { const t = e.target; if (t && t.closest && t.tagName === 'BUTTON' && !t.closest('.np-p, .np-pad')) t.click(); else npOk(); }, Backspace: () => npKey('del'), Digit0: () => npKey('0'), Numpad0: () => npKey('0'), NumpadEnter: () => npOk() }, NK.digits((d) => npKey(String(d)), 9)),
        rules: [
            'Every brick holds the <b>sum of the two bricks directly under it</b>.',
            'Some bricks are given. Fill in all the others.',
            'In any little triangle of three bricks, if you know two numbers you can work out the third: add the two lower ones, or take one lower brick away from the top one.',
            'Tap an empty brick, type its number on the pad, and press OK. A wrong number is pointed out and not kept.',
            'No guessing is ever needed. No clock. Keyboard: arrows and Enter on bricks; digits type, Backspace deletes, Enter enters.'],
        css: `.np-p{display:flex;flex-direction:column-reverse;align-items:center;gap:4px;margin:0 auto 8px}
.np-row{display:flex;gap:4px;justify-content:center}
.np-b{width:clamp(44px,12.5vw,68px);height:46px;border:2px solid #7c2d12;background:#fed7aa;border-radius:6px;font:900 clamp(1rem,4vw,1.3rem) system-ui;color:#1d4ed8;cursor:pointer;padding:0;--nk-r:6px;--nk-bw:2px}
.np-b.np-g{background:#f3e2c2;color:#2b1b0d}.np-b.np-s{background:#fde68a;box-shadow:0 0 0 3px #1d4ed8}
.np-entry{font:900 1.6rem Georgia,serif;text-align:center;min-height:1.4em;background:#fffdf5;border:3px solid #c9a46a;border-radius:12px;max-width:12rem;margin:6px auto;padding:4px}
.np-pad{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;max-width:20rem;margin:0 auto}
.np-pad .gk-btn{font-size:1.25rem;padding:0;min-width:0}`,
    });
}
function npSel(k) { const gs = gameState.numpyramid; if (gs.over) return; gs.sel = k; gs.entry = ''; gs.msg = gs.given.has(k) ? 'That brick is given.' : gs.v[k] ? 'This brick is filled in. Type a new number to change it.' : ''; NK.render('numpyramid'); }
function npKey(k) { const gs = gameState.numpyramid; if (gs.over) return; if (k === 'del') gs.entry = gs.entry.slice(0, -1); else if (gs.entry.length < 4) gs.entry = (gs.entry + k).replace(/^0+(?=\d)/, ''); NK.render('numpyramid'); }
function npOk() {
    const gs = gameState.numpyramid; if (gs.over || !gs.sel) return;
    if (gs.given.has(gs.sel)) { gs.msg = 'That brick is given.'; return NK.render('numpyramid'); }
    const v = parseInt(gs.entry, 10); if (!v) { gs.msg = 'Type a number first.'; return NK.render('numpyramid'); }
    const [r, i] = gs.sel.split(',').map(Number);
    if (v !== gs.P[r][i]) { gs.wrong++; gs.entry = ''; gs.msg = `${v} does not fit there. Check a little triangle where you know two numbers.`; if (typeof sfxWrong === 'function') sfxWrong(); return NK.render('numpyramid'); }
    gs.v[gs.sel] = v; gs.entry = ''; if (typeof sfxFlip === 'function') sfxFlip();
    const left = []; gs.P.forEach((row, rr) => row.forEach((_, ii) => { if (!gs.v[rr + ',' + ii]) left.push(rr + ',' + ii); }));
    if (!left.length) { gs.over = true; gs.msg = 'The whole pyramid adds up. Done!'; NK.render('numpyramid'); if (typeof sfxCorrect === 'function') sfxCorrect(); return NK.finish('numpyramid', true, `Pyramid of ${gs.rows} rows complete${gs.wrong ? ` (${NK.pl(gs.wrong, 'wrong try', 'wrong tries')})` : ' with no wrong tries'}.`); }
    gs.sel = left[0]; gs.msg = 'Right.'; NK.render('numpyramid');
}
function npNew() { initNumPyramid(); }
function _npView(gs) {
    const rows = gs.P.map((row, r) => `<div class="np-row">${row.map((_, i) => { const k = r + ',' + i, g = gs.given.has(k); return `<button type="button" class="nk-cell np-b${g ? ' np-g' : ''}${gs.sel === k ? ' np-s' : ''}" onclick="npSel('${k}')" data-k="b${r}_${i}"${r === 0 && i === 0 ? ' data-first' : ''} aria-label="row ${r + 1} from the bottom, brick ${i + 1}: ${gs.v[k] || 'empty'}${g ? ', given' : ''}"${gs.over ? ' disabled' : ''}>${gs.v[k] || ''}</button>`; }).join('')}</div>`).join('');
    const pad = ['7', '8', '9', 'del', '4', '5', '6', '0', '1', '2', '3', 'ok'].map((k) => (k === 'ok' ? NK.btn('OK', 'npOk()', { cls: 'gk-primary', k: 'ok', disabled: gs.over || !gs.entry }) : NK.btn(k === 'del' ? Icon.svg('delete', { size: '24px', sw: 2.4 }) : k, `npKey('${k}')`, { k: 'k' + k, label: k === 'del' ? 'delete' : k, disabled: gs.over }))).join('');
    const filled = Object.keys(gs.v).length, total = gs.P.reduce((a, r) => a + r.length, 0);
    return `<div class="nk-top"><span>Bricks: <b>${filled}</b> of ${total}</span><span>Wrong tries: <b>${gs.wrong}</b></span></div>
      <div class="np-p">${rows}</div>
      <div class="np-entry" aria-live="polite" aria-label="number being typed">${gs.entry || '&nbsp;'}</div>
      <div class="np-pad">${pad}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('rotate-ccw') + 'New pyramid', 'npNew()', { k: 'restart' })}</div>`;
}
