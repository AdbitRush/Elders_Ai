// ═══════════════════════════════════════════════════════════════════════════════
// DROP QUOTE (2026-11, nostalgia batch 3) — the newspaper puzzle where a saying is written into a grid row by row
// and then every letter "drops" out of its column into a pile below. Put each letter back into its own column to
// rebuild the saying. Dark squares are the spaces between words; a word can run on to the next row. Letters in a
// pile can go in any square of that column, in any order. Sayings are old proverbs (no author to quote).
// Easy: 9 columns, first word given. Normal: 11 columns. Hard: 13 columns, longer sayings. No clock.
// ═══════════════════════════════════════════════════════════════════════════════
const _DQ_SAY = [
    ['A PENNY SAVED IS A PENNY EARNED', 0], ['THE EARLY BIRD CATCHES THE WORM', 0], ['ALL THAT GLITTERS IS NOT GOLD', 0],
    ['A WATCHED POT NEVER BOILS', 0], ['MANY HANDS MAKE LIGHT WORK', 0], ['WELL BEGUN IS HALF DONE', 0], ['STILL WATERS RUN DEEP', 0],
    ['LOOK BEFORE YOU LEAP', 0], ['HASTE MAKES WASTE', 0], ['NO NEWS IS GOOD NEWS', 0], ['OLD HABITS DIE HARD', 0],
    ['BETTER LATE THAN NEVER', 0], ['TWO HEADS ARE BETTER THAN ONE', 0], ['PRACTICE MAKES PERFECT', 0], ['ACTIONS SPEAK LOUDER THAN WORDS', 0],
    ['MAKE HAY WHILE THE SUN SHINES', 1], ['ROME WAS NOT BUILT IN A DAY', 1], ['EVERY CLOUD HAS A SILVER LINING', 1],
    ['BIRDS OF A FEATHER FLOCK TOGETHER', 1], ['A FRIEND IN NEED IS A FRIEND INDEED', 1], ['THE PEN IS MIGHTIER THAN THE SWORD', 1],
    ['WHERE THERE IS A WILL THERE IS A WAY', 1], ['DO NOT PUT ALL YOUR EGGS IN ONE BASKET', 1], ['A STITCH IN TIME SAVES NINE', 1],
    ['YOU CAN LEAD A HORSE TO WATER BUT YOU CANNOT MAKE IT DRINK', 2], ['DO NOT COUNT YOUR CHICKENS BEFORE THEY ARE HATCHED', 2],
    ['THE GRASS IS ALWAYS GREENER ON THE OTHER SIDE OF THE FENCE', 2], ['IF AT FIRST YOU DO NOT SUCCEED TRY TRY AGAIN', 2],
    ['A BIRD IN THE HAND IS WORTH TWO IN THE BUSH', 2], ['DO NOT JUDGE A BOOK BY ITS COVER', 2], ['AN OUNCE OF PREVENTION IS WORTH A POUND OF CURE', 2],
    ['THE SQUEAKY WHEEL GETS THE GREASE', 2], ['WHEN IN ROME DO AS THE ROMANS DO', 2], ['PEOPLE WHO LIVE IN GLASS HOUSES SHOULD NOT THROW STONES', 2],
];
const _dqNice = (say) => (say.charAt(0) + say.slice(1).toLowerCase()).replace(/\brom(e|ans)\b/g, (m) => 'R' + m.slice(1));   // sentence case, keeping Rome
function _dqMake(diff) {
    const w = diff === 'easy' ? 9 : diff === 'hard' ? 13 : 11, tier = diff === 'easy' ? 0 : diff === 'hard' ? 2 : 1;
    const pool = _DQ_SAY.filter(([, t]) => t === tier), say = pool[Math.floor(Math.random() * pool.length)][0];
    // lay the saying into rows; a space that lands at the start of a row is dropped
    const cells = []; for (const ch of say) { if (ch === ' ' && cells.length % w === 0) continue; cells.push(ch); }
    while (cells.length % w) cells.push('#');
    const rows = cells.length / w, ans = [...Array(rows).keys()].map((r) => cells.slice(r * w, r * w + w).map((ch) => (ch === ' ' ? '#' : ch)));
    const piles = [...Array(w).keys()].map((c) => ans.map((row) => row[c]).filter((ch) => ch !== '#').sort());
    return { w, rows, ans, piles, say };
}
function initDropquote() {
    NK.start('dropquote', {
        setup(gs, diff) {
            const P = _dqMake(diff); gs.P = P; gs.over = false; gs.hints = 0; gs.bad = null;
            gs.g = P.ans.map((row) => row.map((ch) => (ch === '#' ? '#' : '')));
            gs.given = P.ans.map((row) => row.map(() => false));
            if (diff === 'easy') { let k = 0; outer: for (let r = 0; r < P.rows; r++) for (let c = 0; c < P.w; c++) { if (P.ans[r][c] === '#') break outer; gs.g[r][c] = P.ans[r][c]; gs.given[r][c] = true; k++; } }
            gs.sel = _dqNext(gs, 0, -1) || [0, 0];
            gs.msg = 'Each pile under the grid holds the letters of that column. Tap a square, then one of its letters.';
        },
        view: _dqView,
        keys: Object.assign({ Backspace: () => dqPut(''), Delete: () => dqPut('') }, Object.fromEntries('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((L) => ['Key' + L, () => dqPut(L, true)]))),
        arrows(dir) { const gs = gameState.dropquote, [dr, dc] = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] }[dir]; let [r, c] = gs.sel;
            for (let k = 0; k < 20; k++) { r += dr; c += dc; if (r < 0 || r >= gs.P.rows || c < 0 || c >= gs.P.w) return true; if (gs.g[r][c] !== '#') { gs.sel = [r, c]; NK.render('dropquote'); return true; } } return true; },
        rules: [
            'A saying was written into the grid row by row, then every letter <b>dropped down</b> out of its column into the pile beneath it.',
            'Put the letters back. Each letter can only go in <b>its own column</b>, but in any square of that column.',
            '<b>Dark squares</b> are the spaces between words. A long word can run on to the start of the next row.',
            'Tap a square, then a letter from that column\'s pile (the big buttons). Letters you have used are greyed out in the pile.',
            'Check marks wrong letters; Hint fills one square. No clock. Keyboard: arrow keys move, letter keys write, Backspace clears.'],
        css: `.dq-g{display:grid;gap:2px;max-width:min(100%,34rem);margin:0 auto}
.dq-c{aspect-ratio:1;border:2px solid #57534e;background:#fff;padding:0;min-width:0;font:900 clamp(.85rem,3.9vw,1.45rem) Georgia,serif;color:#1c1917;cursor:pointer;--nk-r:3px;--nk-bw:2px}
.dq-c.dq-s{background:#fef3c7;border-color:#b45309;box-shadow:0 0 0 3px #fbbf24}
.dq-c.dq-col{background:#fffbeb}
.dq-c.dq-gv{color:#475569}
.dq-c.dq-wr{color:#b91c1c;box-shadow:inset 0 0 0 3px #f87171}
.dq-k{aspect-ratio:1;background:#292524;border-radius:3px}
.dq-p{display:grid;gap:2px;max-width:min(100%,34rem);margin:6px auto 0;align-items:start}
.dq-pc{display:flex;flex-direction:column;align-items:center;font:800 clamp(.65rem,2.9vw,.95rem) ui-monospace,monospace;line-height:1.15;color:#44403c;background:#f5f5f4;border-radius:4px;padding:2px 0}
.dq-pc.dq-pcs{background:#fde68a;color:#1c1917}
.dq-pc s{color:#a8a29e;text-decoration:none;opacity:.55}
.dq-pad{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:12px 0 0}
.dq-pad .gk-btn{min-width:54px;font:900 1.35rem Georgia,serif}
.dq-done{text-align:center;font:italic 700 1.25rem Georgia,serif;color:#14532d;margin:10px 0 0}`,
    });
}
const _dqLeft = (gs, c) => { const left = gs.P.piles[c].slice(); gs.g.forEach((row) => { const ch = row[c]; if (ch && ch !== '#') { const i = left.indexOf(ch); if (i >= 0) left.splice(i, 1); } }); return left; };
function _dqNext(gs, r, c) {   // next empty square in reading order after (r,c)
    const { w, rows } = gs.P; for (let i = r * w + c + 1; i < w * rows; i++) { const y = Math.floor(i / w), x = i % w; if (gs.g[y][x] === '') return [y, x]; }
    for (let i = 0; i < w * rows; i++) { const y = Math.floor(i / w), x = i % w; if (gs.g[y][x] === '') return [y, x]; }
    return null;
}
function dqSel(r, c) { const gs = gameState.dropquote; if (gs.over || gs.g[r][c] === '#') return; gs.sel = [r, c]; gs.msg = ''; NK.render('dropquote'); }
function dqPut(L, typed) {
    const gs = gameState.dropquote; if (gs.over) return; const [r, c] = gs.sel;
    if (gs.given[r][c]) { gs.msg = 'That letter was given. Pick another square.'; return NK.render('dropquote'); }
    if (L) {
        const left = _dqLeft(gs, c); if (gs.g[r][c]) left.push(gs.g[r][c]);
        if (!left.includes(L)) { gs.msg = `There is no ${L} left in this column's pile.`; if (typed && typeof sfxWrong === 'function') sfxWrong(); return NK.render('dropquote'); }
    }
    gs.g[r][c] = L; gs.bad = null;
    if (gs.g.every((row, y) => row.every((ch, x) => ch === gs.P.ans[y][x]))) {
        gs.over = true; gs.msg = 'Every letter is back in place. Solved!'; NK.render('dropquote'); if (typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('dropquote', true, `"${_dqNice(gs.P.say)}."${gs.hints ? ` (${NK.pl(gs.hints, 'hint')})` : ''}`);
    }
    if (L) { const nx = _dqNext(gs, r, c); if (nx) gs.sel = nx; }
    gs.msg = gs.g.every((row) => row.every((ch) => ch)) ? 'The grid is full, but some letters are in the wrong rows. Try Check.' : '';
    NK.render('dropquote');
}
function dqCheck() { const gs = gameState.dropquote; if (gs.over) return; gs.bad = gs.g.map((row, r) => row.map((ch, c) => ch && ch !== '#' && ch !== gs.P.ans[r][c])); const k = gs.bad.flat().filter(Boolean).length; gs.msg = k ? `${NK.pl(k, 'letter')} ${k === 1 ? 'is' : 'are'} in the wrong place (shown in red).` : 'Every letter so far is right.'; NK.render('dropquote'); }
function dqHint() {
    const gs = gameState.dropquote; if (gs.over) return; const { w, rows, ans } = gs.P, [sr, sc] = gs.sel;
    const order = [[sr, sc]]; for (let i = 0; i < w * rows; i++) order.push([Math.floor(i / w), i % w]);
    for (const [r, c] of order) if (gs.g[r][c] !== ans[r][c]) {
        const L = ans[r][c]; gs.g[r][c] = '';
        // the right letter may be sitting in a wrong square of this column: take it out of there first
        if (!_dqLeft(gs, c).includes(L)) for (let y = 0; y < rows; y++) if (gs.g[y][c] === L && ans[y][c] !== L) { gs.g[y][c] = ''; break; }
        gs.hints++; gs.sel = [r, c]; dqPut(L); gs.given[r][c] = true; return;
    }
}
function dqNew() { initDropquote(); }
function _dqView(gs) {
    const { w, rows, piles } = gs.P, [sr, sc] = gs.sel;
    let g = '';
    for (let r = 0; r < rows; r++) for (let c = 0; c < w; c++) {
        const ch = gs.g[r][c]; if (ch === '#') { g += '<span class="dq-k" aria-hidden="true"></span>'; continue; }
        const s = r === sr && c === sc;
        g += `<button type="button" class="nk-cell dq-c${s ? ' dq-s' : c === sc ? ' dq-col' : ''}${gs.given[r][c] ? ' dq-gv' : ''}${gs.bad && gs.bad[r][c] ? ' dq-wr' : ''}" onclick="dqSel(${r},${c})" data-k="c${r}_${c}"${!g.includes('data-first') ? ' data-first' : ''} aria-label="row ${r + 1} column ${c + 1}: ${ch || 'empty'}${gs.given[r][c] ? ', given' : ''}"${gs.over ? ' disabled' : ''}>${ch}</button>`;
    }
    const pileHtml = piles.map((p, c) => { const left = _dqLeft(gs, c).slice(); const out = p.map((L) => { const i = left.indexOf(L); if (i >= 0) { left.splice(i, 1); return `<span>${L}</span>`; } return `<s>${L}</s>`; });
        return `<div class="dq-pc${c === sc ? ' dq-pcs' : ''}" aria-hidden="true">${out.join('')}</div>`; }).join('');
    const left = [...new Set(_dqLeft(gs, sc))];
    const pad = left.map((L) => NK.btn(L, `dqPut('${L}')`, { k: 'L' + L, disabled: gs.over })).join('') + NK.btn(Icon.svg('delete', { size: '24px', sw: 2.4 }), "dqPut('')", { k: 'L_', label: 'clear square', disabled: gs.over });
    const filled = gs.g.flat().filter((ch) => ch && ch !== '#').length, total = gs.P.ans.flat().filter((ch) => ch !== '#').length;
    return `<div class="nk-top"><span>Letters placed: <b>${filled}</b> of ${total}</span><span>Hints: <b>${gs.hints}</b></span></div>
      <div class="dq-g" style="grid-template-columns:repeat(${w},1fr)">${g}</div>
      <div class="dq-p" style="grid-template-columns:repeat(${w},1fr)">${pileHtml}</div>
      ${gs.over ? `<div class="dq-done">"${_dqNice(gs.P.say)}."</div>` : `<div class="dq-pad" role="group" aria-label="letters left for column ${sc + 1}">${pad}</div>`}
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn('Check', 'dqCheck()', { k: 'check', disabled: gs.over })}${NK.btn(NK.icon('lightbulb') + 'Hint', 'dqHint()', { k: 'hint', disabled: gs.over })}${NK.btn(NK.icon('rotate-ccw') + 'New saying', 'dqNew()', { k: 'restart' })}</div>`;
}
