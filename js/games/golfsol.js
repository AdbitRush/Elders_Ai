// ═══════════════════════════════════════════════════════════════════════════════
// GOLF SOLITAIRE (2026-11, nostalgia batch 3) — the quick patience game. Seven columns of five cards, all face up.
// Move the bottom card of any column onto the pile if it is one higher or one lower than the pile's top card (suits
// don't matter). Stuck? Turn the next card from the stock onto the pile. Like golf, the score is the number of cards
// left in the columns and lower is better. Easy: King and Ace connect, par 8, undo. Normal: King and Ace connect,
// par 4, undo. Hard: nothing goes on a King, par 0 (clear every column), no undo. Under par wins. No clock.
// ═══════════════════════════════════════════════════════════════════════════════
const _GS_PAR = { easy: 8, normal: 4, hard: 0 };
const _gsName = (c) => `${['', 'Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'][c.r]} of ${['spades', 'hearts', 'diamonds', 'clubs'][c.s]}`;
function initGolfsol() {
    NK.start('golfsol', {
        setup(gs, diff) {
            const d = GameKit.deck(); d.forEach((c) => (c.up = true));
            gs.diff = diff; gs.wrap = diff !== 'hard'; gs.par = _GS_PAR[diff];
            gs.cols = [...Array(7).keys()].map(() => d.splice(0, 5)); gs.pile = [d.pop()]; gs.stock = d; gs.hist = []; gs.over = false; gs.hint = diff === 'easy';
            gs.msg = 'Tap a bottom card that is one higher or one lower than the pile. Suits do not matter.';
        },
        view: _gsView,
        keys: { KeyD: () => gsDraw(), KeyU: () => gsUndo() },
        rules: (gs) => [
            'Seven columns of five cards are dealt face up. Only the <b>bottom card</b> of each column can move.',
            'Move it onto the <b>pile</b> if it is <b>one higher or one lower</b> than the pile\'s top card. Suits do not matter: a 7 can go on a 6 or an 8.',
            gs.wrap ? 'On this level the King and the Ace connect: an Ace may go on a King and a King on an Ace.' : 'On this level nothing goes on a King, and a King cannot go on an Ace.',
            'When nothing fits, tap the <b>stock</b> to turn its next card onto the pile.',
            `The score is the number of cards left in the columns. Par for this level is <b>${gs.par}</b>: finish at or under par to win.${gs.diff === 'hard' ? '' : ' Undo is free.'}`,
            'Keyboard: arrow keys and Enter on the cards, D draws, U undoes.'],
        css: `.gs-cols{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;justify-items:center;margin:4px 0 12px}
.gs-t{--w:clamp(34px,10.6vw,74px)}
.gs-mid{display:flex;justify-content:center;align-items:flex-end;gap:22px}
.gs-pl{display:flex;flex-direction:column;align-items:center;gap:4px;font-weight:800;color:#fde7c4}
#gameContent .nk button.gs-b{background:none;border:0;padding:0;--nk-r:9px;display:block}
.gs-b:disabled{cursor:default}
.gs-b.gs-can .gk-card{outline:3px dashed #fde68a;outline-offset:1px}`,
    });
}
const _gsFits = (gs, c) => { const t = gs.pile[gs.pile.length - 1], d = Math.abs(c.r - t.r); if (!gs.wrap && t.r === 13) return false; return d === 1 || (gs.wrap && d === 12); };
const _gsLeft = (gs) => gs.cols.reduce((a, c) => a + c.length, 0);
function gsTap(i) {
    const gs = gameState.golfsol; if (gs.over) return; const col = gs.cols[i], c = col[col.length - 1]; if (!c) return;
    if (!_gsFits(gs, c)) { const t = gs.pile[gs.pile.length - 1]; gs.msg = `The ${_gsName(c)} does not fit on the ${_gsName(t)}. It must be one higher or one lower.`; if (typeof sfxWrong === 'function') sfxWrong(); return NK.render('golfsol'); }
    gs.hist.push(JSON.stringify([gs.cols, gs.pile, gs.stock])); gs.pile.push(col.pop()); if (typeof sfxFlip === 'function') sfxFlip();
    gs.msg = `${_gsName(c)} onto the pile.`; _gsCheck(gs);
}
function gsDraw() {
    const gs = gameState.golfsol; if (gs.over) return;
    if (!gs.stock.length) { gs.msg = 'The stock is empty.'; return NK.render('golfsol'); }
    gs.hist.push(JSON.stringify([gs.cols, gs.pile, gs.stock])); gs.pile.push(gs.stock.pop()); if (typeof sfxFlip === 'function') sfxFlip();
    gs.msg = `Turned the ${_gsName(gs.pile[gs.pile.length - 1])}.`; _gsCheck(gs);
}
function gsUndo() { const gs = gameState.golfsol; if (gs.over || gs.diff === 'hard' || !gs.hist.length) return; [gs.cols, gs.pile, gs.stock] = JSON.parse(gs.hist.pop()); gs.msg = 'Last move taken back.'; NK.render('golfsol'); }
function _gsCheck(gs) {
    const left = _gsLeft(gs), canMove = gs.cols.some((col) => col.length && _gsFits(gs, col[col.length - 1]));
    if (!left || (!canMove && !gs.stock.length)) {
        gs.over = true; const win = left <= gs.par;
        gs.msg = !left ? 'Every column is cleared!' : `No more moves. ${NK.pl(left, 'card')} left (par ${gs.par}).`;
        NK.render('golfsol'); if (win && typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('golfsol', win, !left ? `All 35 cards cleared${gs.stock.length ? ` with ${NK.pl(gs.stock.length, 'card')} still in the stock` : ''}!` : win ? `${NK.pl(left, 'card')} left: at or under par (${gs.par}).` : `${NK.pl(left, 'card')} left; par was ${gs.par}. Another deal is one tap away.`);
    }
    if (!canMove) gs.msg += ' Nothing fits now: turn a card from the stock.';
    NK.render('golfsol');
}
function gsHint() { const gs = gameState.golfsol; gs.hint = !gs.hint; NK.render('golfsol'); }
function gsNew() { initGolfsol(); }
function _gsView(gs) {
    const top = gs.pile[gs.pile.length - 1];
    const cols = gs.cols.map((col, i) => {
        const can = col.length && _gsFits(gs, col[col.length - 1]);
        const cards = col.map((c, j) => (j === col.length - 1 ? `<button type="button" class="nk-cell gs-b${gs.hint && can ? ' gs-can' : ''}" onclick="gsTap(${i})" data-k="c${i}"${i === 0 ? ' data-first' : ''} aria-label="column ${i + 1}, bottom card ${_gsName(c)}${can ? ', fits the pile' : ''}"${gs.over ? ' disabled' : ''}>${GameKit.card(c)}</button>` : GameKit.card(c))).join('');
        return `<div class="gk-col">${cards || GameKit.card(null, { label: '' })}</div>`;
    }).join('');
    const stock = `<button type="button" class="nk-cell gs-b" onclick="gsDraw()" data-k="stock" aria-label="stock, ${NK.pl(gs.stock.length, 'card')} left"${gs.over || !gs.stock.length ? ' disabled' : ''}>${gs.stock.length ? GameKit.card({ r: 1, s: 0, up: false }) : GameKit.card(null, { label: '0' })}</button>`;
    return `<div class="nk-top"><span>In the columns: <b>${_gsLeft(gs)}</b> (par ${gs.par})</span><span>Stock: <b>${gs.stock.length}</b></span></div>
      <div class="gk-table gs-t"><div class="gs-cols">${cols}</div>
        <div class="gs-mid"><div class="gs-pl">${stock}Stock</div><div class="gs-pl"><span role="img" aria-label="pile, top card ${_gsName(top)}">${GameKit.card(top)}</span>Pile</div></div></div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${gs.diff === 'hard' ? '' : NK.btn(NK.icon('undo-2') + 'Undo', 'gsUndo()', { k: 'undo', disabled: gs.over || !gs.hist.length })}${NK.btn(gs.hint ? 'Hide fits' : 'Show fits', 'gsHint()', { k: 'hint', pressed: gs.hint })}${NK.btn(NK.icon('rotate-ccw') + 'New deal', 'gsNew()', { k: 'restart' })}</div>`;
}
