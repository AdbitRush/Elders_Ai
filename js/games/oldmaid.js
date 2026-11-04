// ═══════════════════════════════════════════════════════════════════════════════
// OLD MAID (2026-11, nostalgia batch 3) — the family card game, you and two computer players. One Queen is taken out
// of the deck, so one Queen (the Old Maid) can never be paired. Everyone throws away pairs (two cards of the same
// rank), then takes turns drawing one face-down card from the player on the left. A pair is thrown away at once.
// Whoever is left holding the Old Maid at the end loses; everyone else is safe. Easy: one computer player is
// careless and keeps its cards in order, so the Old Maid is easier to spot by where it sits. Normal and hard: the
// computers shuffle their hands after each turn. Hard adds a third computer player.
// Your cards are sorted, but the Old Maid may be in your hand too: when a player draws from you, they pick blind.
// ═══════════════════════════════════════════════════════════════════════════════
const _omRk = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const _omName = (c) => `${['', 'Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'][c.r]} of ${['spades', 'hearts', 'diamonds', 'clubs'][c.s]}`;
function initOldmaid() {
    NK.start('oldmaid', {
        setup(gs, diff) {
            const d = GameKit.deck().filter((c) => !(c.r === 12 && c.s === 3)); d.forEach((c) => (c.up = true));
            gs.diff = diff; gs.n = diff === 'hard' ? 4 : 3; gs.names = ['You', 'Rose', 'Walt', 'June'].slice(0, gs.n);
            gs.hands = [...Array(gs.n)].map(() => []); d.forEach((c, i) => gs.hands[i % gs.n].push(c));
            const thrown = gs.hands.map((h) => _omPairs(h)); _omSort(gs.hands[0]);
            gs.out = gs.hands.map(() => false); gs.turn = 0; gs.over = false; gs.lastDrawn = null; gs.pairs = thrown.slice();
            gs.msg = `Pairs thrown away: you ${thrown[0]}, ${gs.names.slice(1).map((n, i) => `${n} ${thrown[i + 1]}`).join(', ')}. Draw a card from ${gs.names[_omFrom(gs, 0)]}'s hand.`;
        },
        view: _omView,
        rules: (gs) => [
            'One Queen has been taken out of the deck, so the last Queen, the <b>Old Maid</b>, can never be paired.',
            'Everyone throws away <b>pairs</b> (two cards of the same rank). Then, in turn, each player draws one face-down card from the next player\'s hand. A new pair is thrown away at once.',
            'A player whose hand is empty is safe. <b>Whoever is left holding the Old Maid loses</b>; everyone else wins.',
            'On your turn, tap any face-down card in the other player\'s hand. The others will draw blind from yours.',
            gs.diff === 'easy' ? 'On this level Rose never shuffles her hand, so watch where the Old Maid goes.' : 'The computer players shuffle their hands after every turn.',
            'No money, no clock. Keyboard: arrow keys and Enter on the face-down cards.'],
        css: `.om-t{--w:clamp(36px,10.4vw,60px)}
.om-p{margin:2px 0 10px}
.om-nm{font:800 1rem system-ui,sans-serif;color:#fde7c4;text-align:center;margin-bottom:4px}
.om-nm b{color:#fff}
.om-fan{display:flex;justify-content:center;flex-wrap:wrap;gap:3px}
#gameContent .nk button.om-b{background:none;border:0;padding:0;--nk-r:9px;display:block}
.om-b:disabled{cursor:default}
.om-b:not(:disabled):hover .gk-card{transform:translateY(-5px)}
.om-mine{display:flex;flex-wrap:wrap;gap:4px;justify-content:center}
.om-mine .gk-card.om-new{outline:4px solid #60a5fa;outline-offset:1px}
.om-safe{font-weight:800;color:#86efac;text-align:center}
@media (prefers-reduced-motion:reduce){.om-b:not(:disabled):hover .gk-card{transform:none}}`,
    });
}
function _omSort(h) { h.sort((a, b) => a.r - b.r || a.s - b.s); }
function _omPairs(h) { let k = 0; for (let i = 0; i < h.length; i++) for (let j = i + 1; j < h.length; j++) if (h[i].r === h[j].r) { h.splice(j, 1); h.splice(i, 1); i = -1; k++; break; } return k; }
// the next player still in the game after p
function _omNext(gs, p) { for (let k = 1; k <= gs.n; k++) { const q = (p + k) % gs.n; if (!gs.out[q]) return q; } return p; }
const _omFrom = (gs, p) => _omNext(gs, p);   // you draw from the player on your left (the next one round)
function _omDrawFrom(gs, taker, giver, idx) {
    const c = gs.hands[giver].splice(idx, 1)[0], h = gs.hands[taker], m = h.findIndex((x) => x.r === c.r);
    let paired = false; if (m >= 0) { h.splice(m, 1); paired = true; } else h.push(c);
    if (taker === 0) _omSort(h);
    if (giver !== 0 && (gs.diff !== 'easy' || giver !== 1)) gs.hands[giver] = shuffle(gs.hands[giver]);
    if (taker !== 0 && (gs.diff !== 'easy' || taker !== 1)) gs.hands[taker] = shuffle(gs.hands[taker]);
    [taker, giver].forEach((q) => { if (!gs.hands[q].length) gs.out[q] = true; });
    return { c, paired };
}
function omDraw(i) {
    const gs = gameState.oldmaid; if (gs.over || gs.turn !== 0) return;
    const from = _omFrom(gs, 0), r = _omDrawFrom(gs, 0, from, i); if (typeof sfxFlip === 'function') sfxFlip();
    gs.lastDrawn = r.paired ? null : r.c;
    gs.msg = r.c.r === 12 && !r.paired ? `You drew the ${_omName(r.c)}... the Old Maid! Hope someone takes it from you.` : r.paired ? `You drew the ${_omName(r.c)} and made a pair. Thrown away.` : `You drew the ${_omName(r.c)}. No pair yet.`;
    _omAfter(gs, 0);
}
function _omAfter(gs, p) {
    const left = gs.out.filter((x) => !x).length;
    if (left <= 1) return _omEnd(gs);
    gs.turn = _omNext(gs, p);
    if (gs.turn === 0) { gs.msg += ` Your turn: draw from ${gs.names[_omFrom(gs, 0)]}.`; return NK.render('oldmaid'); }
    NK.render('oldmaid'); NK.after(1100, _omCpu);
}
function _omCpu() {
    const gs = gameState.oldmaid; if (gs.over || gs.turn === 0) return;
    const p = gs.turn, from = _omFrom(gs, p), r = _omDrawFrom(gs, p, from, Math.floor(Math.random() * gs.hands[from].length));
    if (typeof sfxFlip === 'function') sfxFlip();
    gs.msg = from === 0 ? `${gs.names[p]} drew your ${_omName(r.c)}${r.paired ? ' and made a pair' : ''}.` : `${gs.names[p]} drew a card from ${gs.names[from]}${r.paired ? ' and made a pair' : ''}.`;
    if (from === 0 && gs.lastDrawn === r.c) gs.lastDrawn = null;
    _omAfter(gs, p);
}
function _omEnd(gs) {
    gs.over = true; const loser = gs.out.findIndex((x) => !x), win = loser !== 0;
    gs.msg = win ? `${gs.names[loser]} is left holding the Old Maid. You are safe!` : 'You are left holding the Old Maid.';
    NK.render('oldmaid'); if (win && typeof sfxCorrect === 'function') sfxCorrect();
    NK.finish('oldmaid', win, win ? `Safe! ${gs.names[loser]} was left with the Old Maid.` : 'You were left with the Old Maid this time. A new deal is one tap away.');
}
function omNew() { initOldmaid(); }
function _omView(gs) {
    const from = _omFrom(gs, 0), my = gs.turn === 0 && !gs.over;
    const opp = gs.names.slice(1).map((nm, k) => { const p = k + 1, h = gs.hands[p], pick = my && p === from;
        const fan = gs.over ? h.map((c) => GameKit.card(c)).join('') : h.map((_, i) => pick ? `<button type="button" class="nk-cell om-b" onclick="omDraw(${i})" data-k="d${i}"${i === 0 ? ' data-first' : ''} aria-label="${nm}'s card ${i + 1} of ${h.length}, face down"><span>${GameKit.card({ r: 1, s: 0, up: false })}</span></button>` : GameKit.card({ r: 1, s: 0, up: false })).join('');
        return `<div class="om-p"><div class="om-nm">${nm}: <b>${NK.pl(h.length, 'card')}</b>${gs.turn === p && !gs.over ? ' (drawing)' : ''}${pick ? ' (draw from here)' : ''}</div>${gs.out[p] ? `<div class="om-safe">Out and safe</div>` : `<div class="om-fan" role="group" aria-label="${nm}'s hand">${fan}</div>`}</div>`; }).join('');
    const mine = gs.hands[0].map((c) => GameKit.card(c, { cls: gs.lastDrawn === c ? 'om-new' : '' })).join('');
    return `<div class="nk-top"><span>Your cards: <b>${gs.hands[0].length}</b></span><span>${gs.over ? 'Game over' : my ? 'Your turn' : `${gs.names[gs.turn]}'s turn`}</span></div>
      <div class="gk-table om-t">${opp}<div class="om-nm">Your hand</div>${gs.out[0] ? '<div class="om-safe">Your hand is empty: you are safe!</div>' : `<div class="om-mine" role="list" aria-label="your hand: ${gs.hands[0].map((c) => _omRk[c.r]).join(', ')}">${mine}</div>`}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('rotate-ccw') + 'New deal', 'omNew()', { k: 'restart' })}</div>`;
}
