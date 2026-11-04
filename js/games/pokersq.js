// ═══════════════════════════════════════════════════════════════════════════════
// POKER SQUARES (2026-11, nostalgia batch 3) — the newspaper patience game. Twenty-five cards are turned one at a
// time, and each must go into an empty square of a 5x5 grid. When the grid is full, each of the five rows and five
// columns is scored as a poker hand (American points): royal flush 100, straight flush 75, four of a kind 50,
// full house 25, flush 20, straight 15, three of a kind 10, two pair 5, one pair 2. A card cannot move once placed.
// No money and no betting: it is a solitaire for points. Goal: easy 40 points, normal 60, hard 90.
// Easy also shows what each row and column is worth so far. No clock.
// ═══════════════════════════════════════════════════════════════════════════════
const _PQ_GOAL = { easy: 40, normal: 60, hard: 90 };
const _PQ_PTS = { 'royal flush': 100, 'straight flush': 75, 'four of a kind': 50, 'full house': 25, flush: 20, straight: 15, 'three of a kind': 10, 'two pair': 5, 'one pair': 2, '': 0 };
const _pqName = (c) => `${['', 'Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'][c.r]} of ${['spades', 'hearts', 'diamonds', 'clubs'][c.s]}`;
function _pqHand(cards) {   // cards: up to 5; partial lines are scored by their pairs only
    const cs = cards.filter(Boolean), cnt = {}; cs.forEach((c) => (cnt[c.r] = (cnt[c.r] || 0) + 1));
    const groups = Object.values(cnt).sort((a, b) => b - a);
    if (cs.length === 5) {
        const fl = cs.every((c) => c.s === cs[0].s), rs = cs.map((c) => c.r).sort((a, b) => a - b);
        const st = groups.length === 5 && (rs[4] - rs[0] === 4 || rs.join() === '1,10,11,12,13');
        if (st && fl) return rs[0] === 1 && rs[4] === 13 ? 'royal flush' : 'straight flush';
        if (groups[0] === 4) return 'four of a kind'; if (groups[0] === 3 && groups[1] === 2) return 'full house';
        if (fl) return 'flush'; if (st) return 'straight';
    }
    if (groups[0] === 4) return 'four of a kind'; if (groups[0] === 3 && groups[1] === 2) return 'full house';
    if (groups[0] === 3) return 'three of a kind'; if (groups[0] === 2 && groups[1] === 2) return 'two pair'; if (groups[0] === 2) return 'one pair';
    return '';
}
function initPokersq() {
    NK.start('pokersq', {
        setup(gs, diff) {
            const d = GameKit.deck(); d.forEach((c) => (c.up = true));
            gs.diff = diff; gs.goal = _PQ_GOAL[diff]; gs.show = diff === 'easy'; gs.g = Array(25).fill(null); gs.deck = d.slice(0, 25); gs.cur = gs.deck.pop(); gs.over = false; gs.last = -1;
            gs.msg = 'Tap an empty square to place the card. Build poker hands across every row and down every column.';
        },
        view: _pqView,
        rules: (gs) => [
            'Twenty-five cards are turned one at a time. Put each one into any <b>empty square</b>. Once placed, a card stays.',
            'When the grid is full, every <b>row</b> and every <b>column</b> is scored as a poker hand.',
            'Points: royal flush 100, straight flush 75, four of a kind 50, full house 25, flush 20, straight 15, three of a kind 10, two pair 5, one pair 2.',
            'A good plan: keep some columns for one suit (flushes) while the rows collect pairs.',
            `Goal for this level: <b>${gs.goal} points</b>. No money, no betting, no clock. Keyboard: arrow keys and Enter on the squares.`],
        css: `.pq-t{--w:clamp(40px,12.2vw,66px)}
.pq-g{display:grid;grid-template-columns:repeat(5,var(--w)) auto;gap:6px;justify-content:center;align-items:center}
#gameContent .nk button.pq-b{background:none;border:0;padding:0;--nk-r:9px;display:block}
.pq-b:disabled{cursor:default}
.pq-b.pq-last .gk-card{outline:3px solid #93c5fd;outline-offset:1px}
.pq-v{font:800 clamp(.7rem,2.8vw,.9rem) system-ui,sans-serif;color:#fde7c4;text-align:center;line-height:1.15;min-width:2.6rem}
.pq-v b{display:block;font-size:1.05rem;color:#fff}
.pq-v.pq-z b{color:#a7c4b0}
.pq-mid{display:flex;justify-content:center;align-items:center;gap:16px;margin:12px 0 4px;color:#fde7c4;font-weight:800}
.pq-tab{display:grid;grid-template-columns:1fr auto;gap:2px 14px;max-width:22rem;margin:8px auto 0;font-size:1rem}
.pq-tab span:nth-child(even){text-align:right;font-weight:800}`,
    });
}
function _pqLines(gs) {
    const rows = [0, 1, 2, 3, 4].map((r) => gs.g.slice(r * 5, r * 5 + 5)), cols = [0, 1, 2, 3, 4].map((c) => [0, 1, 2, 3, 4].map((r) => gs.g[r * 5 + c]));
    return { rows: rows.map(_pqHand), cols: cols.map(_pqHand) };
}
const _pqTotal = (L) => L.rows.concat(L.cols).reduce((a, h) => a + _PQ_PTS[h], 0);
function pqPlace(i) {
    const gs = gameState.pokersq; if (gs.over || gs.g[i] || !gs.cur) return;
    gs.g[i] = gs.cur; gs.last = i; const c = gs.cur; if (typeof sfxFlip === 'function') sfxFlip();
    gs.cur = gs.deck.length && gs.g.some((x) => !x) ? gs.deck.pop() : null;
    if (!gs.cur) {
        gs.over = true; gs.show = true; const L = _pqLines(gs), t = _pqTotal(L), win = t >= gs.goal;
        gs.msg = `The grid is full: ${t} points (goal ${gs.goal}).`;
        NK.render('pokersq'); if (win && typeof sfxCorrect === 'function') sfxCorrect();
        const best = L.rows.concat(L.cols).sort((a, b) => _PQ_PTS[b] - _PQ_PTS[a])[0];
        return NK.finish('pokersq', win, `${t} points${best ? `; best line: ${best}` : ''}. ${win ? `Goal of ${gs.goal} reached!` : `The goal was ${gs.goal}. A fresh deck is one tap away.`}`);
    }
    gs.msg = `${_pqName(c)} placed in row ${Math.floor(i / 5) + 1}, column ${i % 5 + 1}. Next: the ${_pqName(gs.cur)}.`;
    NK.render('pokersq');
}
function pqShow() { const gs = gameState.pokersq; gs.show = !gs.show; NK.render('pokersq'); }
function pqNew() { initPokersq(); }
function _pqView(gs) {
    const L = _pqLines(gs), val = (h, lab) => `<span class="pq-v${_PQ_PTS[h] ? '' : ' pq-z'}" aria-label="${lab}: ${h || 'nothing yet'}, ${_PQ_PTS[h]} points">${gs.show ? `${h || '–'}<b>${_PQ_PTS[h]}</b>` : ''}</span>`;
    let g = '';
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) { const i = r * 5 + c, x = gs.g[i];
            g += x ? `<span class="pq-b${gs.last === i ? ' pq-last' : ''}" role="img" aria-label="row ${r + 1} column ${c + 1}: ${_pqName(x)}" style="display:block">${GameKit.card(x)}</span>`
                : `<button type="button" class="nk-cell pq-b" onclick="pqPlace(${i})" data-k="s${i}"${!g.includes('data-first') ? ' data-first' : ''} aria-label="row ${r + 1} column ${c + 1}: empty, place the card here"${gs.over ? ' disabled' : ''}>${GameKit.card(null, { label: '' })}</button>`; }
        g += val(L.rows[r], `row ${r + 1}`);
    }
    g += L.cols.map((h, c) => val(h, `column ${c + 1}`)).join('') + `<span class="pq-v"><b>${gs.show ? _pqTotal(L) : ''}</b>${gs.show ? 'total' : ''}</span>`;
    const tab = Object.entries(_PQ_PTS).filter(([k]) => k).map(([k, v]) => `<span>${k.charAt(0).toUpperCase() + k.slice(1)}</span><span>${v}</span>`).join('');
    return `<div class="nk-top"><span>Placed: <b>${gs.g.filter(Boolean).length}</b> of 25</span><span>Goal: <b>${gs.goal}</b> points</span></div>
      <div class="gk-table pq-t">
        <div class="pq-mid">${gs.cur ? `<span role="img" aria-label="card to place: ${_pqName(gs.cur)}">${GameKit.card(gs.cur, { sel: true })}</span><span>Place this card</span>` : '<span>Grid complete</span>'}</div>
        <div class="pq-g">${g}</div></div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(gs.show ? 'Hide line scores' : 'Show line scores', 'pqShow()', { k: 'hint', pressed: gs.show, disabled: gs.over })}${NK.btn(NK.icon('rotate-ccw') + 'New deck', 'pqNew()', { k: 'restart' })}</div>
      <details class="nk-rules"><summary>Points table</summary><div class="pq-tab">${tab}</div></details>`;
}
