// ═══════════════════════════════════════════════════════════════════════════════
// KINGS IN THE CORNER (2026-11, nostalgia batch 3) — the family card game, you against the computer. Four piles sit
// face up beside the deck (north, east, south, west) and the four corners wait for Kings. Piles build DOWN in
// alternating colors (a red 6 on a black 7). On your turn draw one card, then play as many as you like:
//   a card from your hand onto a pile it fits · a King into an empty corner · any card into an empty side space ·
//   a whole side pile onto another pile, when its bottom card fits that pile's top card.
// First to empty the hand wins. Easy: the computer plays at most two cards a turn and the places your card fits
// glow. Normal: the computer plays everything it can; glow on. Hard: glow off. No clock.
// Pile index: 0-3 sides (N, E, S, W), 4-7 corners (NW, NE, SE, SW).
// ═══════════════════════════════════════════════════════════════════════════════
const _KC_POS = ['north', 'east', 'south', 'west', 'top-left corner', 'top-right corner', 'bottom-right corner', 'bottom-left corner'];
const _kcName = (c) => `${['', 'Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'][c.r]} of ${['spades', 'hearts', 'diamonds', 'clubs'][c.s]}`;
const _kcRed = (c) => c.s === 1 || c.s === 2;
function _kcFits(piles, p, c) {   // can card c go on pile p?
    const pl = piles[p];
    if (!pl.length) return p < 4 ? true : c.r === 13;
    const t = pl[pl.length - 1]; return t.r === c.r + 1 && _kcRed(t) !== _kcRed(c);
}
function initKingscorner() {
    NK.start('kingscorner', {
        setup(gs, diff) {
            const d = GameKit.deck(); d.forEach((c) => (c.up = true));
            gs.diff = diff; gs.glow = diff !== 'hard'; gs.hands = [d.splice(0, 7), d.splice(0, 7)]; gs.piles = [...Array(8)].map(() => []);
            for (let p = 0; p < 4; p++) { const c = d.pop(); gs.piles[c.r === 13 ? 4 + p : p].push(c); }
            gs.stock = d; gs.turn = 0; gs.sel = null; gs.over = false; gs.acted = false; gs.idle = 0;
            _kcSort(gs.hands[0]); _kcDraw(gs, 0);
            gs.msg = `You drew the ${_kcName(gs.hands[0][gs.drawn])}. Tap a card, then a pile it fits. Tap End turn when you are done.`;
        },
        view: _kcView,
        keys: { KeyE: () => kcEnd() },
        rules: (gs) => [
            'Four piles lie face up beside the deck, and the <b>corners</b> wait for Kings. Piles build <b>down in alternating colors</b>: a red 6 on a black 7, a black Jack on a red Queen.',
            'On your turn you draw one card, then play as many as you like: a card from your hand onto a pile it fits; a <b>King</b> into an empty corner; <b>any card</b> into an empty side space.',
            'You may also move a <b>whole side pile</b> onto another pile when the pile\'s bottom card fits the other pile\'s top card. Tap the pile, then where it goes. This opens a side space.',
            'Tap <b>End turn</b> when you are done. The first player with an empty hand wins. If the deck is gone and neither player can play, fewer cards wins.',
            `${gs.glow ? 'The places your picked card fits are dashed.' : 'On this level nothing is highlighted.'} No clock. Keyboard: arrow keys and Enter, E ends your turn.`],
        css: `.kc-t{--w:clamp(44px,13vw,70px)}
.kc-board{display:grid;grid-template-columns:repeat(3,auto);gap:8px 14px;justify-content:center;align-items:center;justify-items:center;margin:6px 0 10px}
#gameContent .nk button.kc-b{background:none;border:0;padding:0;--nk-r:9px;display:block;position:relative}
.kc-b:disabled{cursor:default}
.kc-b.kc-sel .gk-card,.kc-b.kc-sel .gk-slot{outline:4px solid #fbbf24;outline-offset:1px;transform:translateY(-4px)}
.kc-b.kc-to .gk-card,.kc-b.kc-to .gk-slot{outline:3px dashed #fde68a;outline-offset:1px}
.kc-from{position:absolute;left:50%;bottom:-9px;transform:translateX(-50%);background:#1e3a8a;color:#fff;border-radius:8px;font:800 .72rem system-ui,sans-serif;padding:1px 6px;white-space:nowrap;box-shadow:0 0 0 2px #fde7c4}
.kc-hand{display:flex;flex-wrap:wrap;gap:5px;justify-content:center}
.kc-cpu{display:flex;justify-content:center;gap:3px;margin-bottom:6px}
.kc-cpu .gk-card{--w:clamp(22px,6vw,34px)}
.kc-st{display:flex;flex-direction:column;align-items:center;font:800 .85rem system-ui,sans-serif;color:#fde7c4;gap:2px}
@media (prefers-reduced-motion:reduce){.kc-b.kc-sel .gk-card{transform:none}}`,
    });
}
function _kcSort(h) { h.sort((a, b) => a.r - b.r || a.s - b.s); }
function _kcDraw(gs, who) { gs.drawn = -1; if (!gs.stock.length) return null; const c = gs.stock.pop(); gs.hands[who].push(c); if (who === 0) { _kcSort(gs.hands[0]); gs.drawn = gs.hands[0].indexOf(c); } return c; }
// can side pile p move onto pile q?
const _kcPileFits = (piles, p, q) => p < 4 && p !== q && piles[p].length && (piles[q].length ? _kcFits(piles, q, piles[p][0]) : q >= 4 && piles[p][0].r === 13);
function kcCard(i) {
    const gs = gameState.kingscorner; if (gs.over || gs.turn !== 0) return;
    gs.sel = gs.sel && gs.sel[0] === 'h' && gs.sel[1] === i ? null : ['h', i];
    const c = gs.hands[0][i]; gs.msg = gs.sel ? `${_kcName(c)} picked. Tap a pile it fits${c.r === 13 ? ', or an empty corner' : ''}.` : '';
    NK.render('kingscorner');
}
function kcPile(p) {
    const gs = gameState.kingscorner; if (gs.over || gs.turn !== 0) return;
    if (!gs.sel) { if (p < 4 && gs.piles[p].length) { gs.sel = ['p', p]; gs.msg = `The ${_KC_POS[p]} pile (bottom card ${_kcName(gs.piles[p][0])}) picked. Tap the pile to put it on.`; } else gs.msg = 'Pick a card from your hand first.'; return NK.render('kingscorner'); }
    if (gs.sel[0] === 'p') {
        const from = gs.sel[1];
        if (from === p) { gs.sel = null; gs.msg = ''; return NK.render('kingscorner'); }
        if (!_kcPileFits(gs.piles, from, p)) { gs.msg = `The ${_KC_POS[from]} pile starts with the ${_kcName(gs.piles[from][0])}, which does not fit there.`; gs.sel = null; if (typeof sfxWrong === 'function') sfxWrong(); return NK.render('kingscorner'); }
        gs.piles[p] = gs.piles[p].concat(gs.piles[from]); gs.piles[from] = []; gs.sel = null; if (typeof sfxFlip === 'function') sfxFlip();
        gs.acted = true; gs.msg = `Pile moved. The ${_KC_POS[from]} space is open for any card.`; return NK.render('kingscorner');
    }
    const i = gs.sel[1], c = gs.hands[0][i];
    if (!_kcFits(gs.piles, p, c)) {
        const pl = gs.piles[p]; gs.msg = !pl.length ? 'Only a King can start a corner.' : `The ${_kcName(c)} does not fit on the ${_kcName(pl[pl.length - 1])}: it must be one lower and the other color.`;
        if (typeof sfxWrong === 'function') sfxWrong(); return NK.render('kingscorner');
    }
    gs.piles[p].push(gs.hands[0].splice(i, 1)[0]); gs.sel = null; gs.drawn = -1; gs.acted = true; if (typeof sfxFlip === 'function') sfxFlip();
    if (!gs.hands[0].length) return _kcEnd(gs, 0);
    gs.msg = `${_kcName(c)} played. ${NK.pl(gs.hands[0].length, 'card')} left in your hand.`; NK.render('kingscorner');
}
function kcEnd() {
    const gs = gameState.kingscorner; if (gs.over || gs.turn !== 0) return;
    gs.idle = !gs.stock.length && !gs.acted ? gs.idle + 1 : 0; if (gs.idle >= 2) return _kcStall(gs);
    gs.turn = 1; gs.sel = null; gs.msg = 'The computer draws and plays...'; NK.render('kingscorner'); NK.after(900, _kcCpu);
}
function _kcCpu() {
    const gs = gameState.kingscorner; if (gs.over || gs.turn !== 1) return;
    const h = gs.hands[1]; _kcDraw(gs, 1); let plays = 0; const max = gs.diff === 'easy' ? 2 : 99, log = [];
    for (let guard = 0; guard < 60 && plays < max; guard++) {
        let did = false;
        // 1) move side piles together (frees a space)
        for (let p = 0; p < 4 && !did; p++) for (let q = 0; q < 8 && !did; q++) if (_kcPileFits(gs.piles, p, q) && gs.piles[q].length + (q >= 4 ? 1 : 0) > 0) { gs.piles[q] = gs.piles[q].concat(gs.piles[p]); gs.piles[p] = []; did = true; log.push('moved a pile'); }
        // 2) a card onto a non-empty pile or a King into a corner, highest card first
        if (!did) { const order = h.map((c, i) => i).sort((a, b) => h[b].r - h[a].r);
            for (const i of order) { const c = h[i], p = [4, 5, 6, 7, 0, 1, 2, 3].find((q) => (gs.piles[q].length || (q >= 4 && c.r === 13)) && _kcFits(gs.piles, q, c)); if (p !== undefined) { gs.piles[p].push(h.splice(i, 1)[0]); did = true; plays++; log.push(_kcName(c)); break; } } }
        // 3) fill an empty side with the highest card
        if (!did) { const p = [0, 1, 2, 3].find((q) => !gs.piles[q].length); if (p !== undefined && h.length) { let i = 0; h.forEach((c, j) => { if (c.r > h[i].r) i = j; }); const c = h.splice(i, 1)[0]; gs.piles[p].push(c); did = true; plays++; log.push(_kcName(c)); } }
        if (!did || !h.length) break;
    }
    if (!h.length) return _kcEnd(gs, 1);
    gs.idle = !gs.stock.length && !log.length ? gs.idle + 1 : 0; if (gs.idle >= 2) return _kcStall(gs);
    gs.turn = 0; gs.acted = false; const dc = _kcDraw(gs, 0);
    gs.msg = `${plays ? `The computer played ${log.filter((x) => x !== 'moved a pile').join(', ') || 'nothing new'}${log.includes('moved a pile') ? ' and moved a pile' : ''}.` : 'The computer could not play.'} It has ${NK.pl(h.length, 'card')}. ${dc ? `You drew the ${_kcName(dc)}.` : 'The deck is empty.'} Your turn.`;
    NK.render('kingscorner');
}
function _kcEnd(gs, who) {
    gs.over = true; gs.turn = -1; const left = gs.hands[1 - who].length;
    gs.msg = who === 0 ? `Your hand is empty. You win! The computer still held ${NK.pl(left, 'card')}.` : `The computer emptied its hand first. You still held ${NK.pl(left, 'card')}.`;
    NK.render('kingscorner'); if (who === 0 && typeof sfxCorrect === 'function') sfxCorrect();
    NK.finish('kingscorner', who === 0, who === 0 ? `You went out first; the computer was left with ${NK.pl(left, 'card')}.` : `The computer went out first. A new deal is one tap away.`);
}
// the deck is empty and neither player could play: fewer cards in hand wins
function _kcStall(gs) {
    gs.over = true; gs.turn = -1; const a = gs.hands[0].length, b = gs.hands[1].length, win = a < b;
    gs.msg = `The deck is empty and nobody can play. You hold ${a}, the computer ${b}.`;
    NK.render('kingscorner'); if (win && typeof sfxCorrect === 'function') sfxCorrect();
    NK.finish('kingscorner', win, win ? `Nobody could play on, and you held fewer cards: ${a} to ${b}.` : a === b ? `A draw: ${a} cards each when play stopped.` : `Play stopped with you holding ${a} cards to the computer's ${b}.`);
}
function kcNew() { initKingscorner(); }
function _kcView(gs) {
    const my = gs.turn === 0 && !gs.over, sel = gs.sel;
    const targets = !my || !gs.glow || !sel ? [] : sel[0] === 'h' ? [0, 1, 2, 3, 4, 5, 6, 7].filter((p) => _kcFits(gs.piles, p, gs.hands[0][sel[1]])) : [0, 1, 2, 3, 4, 5, 6, 7].filter((q) => _kcPileFits(gs.piles, sel[1], q));
    const pile = (p) => { const pl = gs.piles[p], t = pl[pl.length - 1], s = sel && sel[0] === 'p' && sel[1] === p;
        return `<button type="button" class="nk-cell kc-b${s ? ' kc-sel' : ''}${targets.includes(p) ? ' kc-to' : ''}" onclick="kcPile(${p})" data-k="p${p}"${p === 0 ? ' data-first' : ''} aria-label="${_KC_POS[p]}: ${t ? `${_kcName(t)} on top${pl.length > 1 ? `, bottom card ${_kcName(pl[0])}, ${pl.length} cards` : ''}` : p < 4 ? 'empty space, any card' : 'empty corner, Kings only'}${s ? ', picked' : ''}"${my ? '' : ' disabled'}>${t ? GameKit.card(t) : GameKit.card(null, { label: p < 4 ? '' : 'K' })}${pl.length > 1 ? `<span class="kc-from" aria-hidden="true">from ${['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][pl[0].r]}</span>` : ''}</button>`; };
    const stock = `<div class="kc-st" role="img" aria-label="deck, ${NK.pl(gs.stock.length, 'card')}">${gs.stock.length ? GameKit.card({ r: 1, s: 0, up: false }) : GameKit.card(null, { label: '0' })}Deck ${gs.stock.length}</div>`;
    const hand = gs.hands[0].map((c, i) => { const s = sel && sel[0] === 'h' && sel[1] === i;
        return `<button type="button" class="nk-cell kc-b${s ? ' kc-sel' : ''}${gs.drawn === i ? ' kc-to' : ''}" onclick="kcCard(${i})" data-k="h${c.r}_${c.s}" aria-label="your card: ${_kcName(c)}${gs.drawn === i ? ', just drawn' : ''}${s ? ', picked' : ''}"${my ? '' : ' disabled'}>${GameKit.card(c)}</button>`; }).join('');
    const cpu = gs.hands[1].map(() => GameKit.card({ r: 1, s: 0, up: false })).join('');
    return `<div class="nk-top"><span>Your cards: <b>${gs.hands[0].length}</b></span><span>${gs.over ? 'Game over' : gs.turn === 0 ? 'Your turn' : "Computer's turn"}</span><span>Computer: <b>${gs.hands[1].length}</b></span></div>
      <div class="gk-table kc-t">
        <div class="kc-cpu" role="img" aria-label="computer holds ${NK.pl(gs.hands[1].length, 'card')}">${cpu}</div>
        <div class="kc-board">${pile(4)}${pile(0)}${pile(5)}${pile(3)}${stock}${pile(1)}${pile(7)}${pile(2)}${pile(6)}</div>
        <div class="gk-label">Your hand</div><div class="kc-hand">${hand}</div></div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn('End turn', 'kcEnd()', { k: 'end', cls: 'gk-primary', disabled: !my })}${NK.btn(NK.icon('rotate-ccw') + 'New deal', 'kcNew()', { k: 'restart' })}</div>`;
}
