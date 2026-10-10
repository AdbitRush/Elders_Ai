// ═══════════════════════════════════════════════════════════════════════════════
// CRAZY EIGHTS vs COMPUTER (2026-10, wave 1) — 7 cards each. Play a card that matches the top card's suit or rank.
// An 8 is wild: play it on anything and name the next suit. No match? Draw one card; if it fits you may play it,
// otherwise your turn passes. First to empty their hand wins. If the deck runs out, the discards are reshuffled.
// ═══════════════════════════════════════════════════════════════════════════════
function initCrazyEights(container) {
    GameKit.css();
    const gs = gameState.crazy8;
    const d = GameKit.deck();
    gs.me = d.splice(0, 7); gs.cpu = d.splice(0, 7);
    let top = d.pop(); while (top.r === 8) { d.unshift(top); top = d.pop(); }   // the starter is never an 8
    gs.pile = [top]; gs.stock = d; gs.suit = top.s; gs.turn = 0; gs.busy = false; gs.drew = false; gs.choose = false; gs.over = false;
    gs.me.forEach(c => c.up = true); top.up = true;
    gs.msg = 'Your turn: match the suit or the rank.';
    _c8Sort(); _c8Render();
}
function _c8Sort() { gameState.crazy8.me.sort((a, b) => a.s - b.s || a.r - b.r); }
function _c8Fits(c) { const gs = gameState.crazy8, t = gs.pile[gs.pile.length - 1]; return c.r === 8 || c.s === gs.suit || c.r === t.r; }
function _c8Draw(hand) {
    const gs = gameState.crazy8;
    if (!gs.stock.length) { const top = gs.pile.pop(); gs.stock = shuffle(gs.pile.map(c => (c.up = false, c))); gs.pile = [top]; }
    const c = gs.stock.pop(); if (c) { if (hand === gs.me) c.up = true; hand.push(c); } return c;
}
function c8Tap(i) {
    const gs = gameState.crazy8; if (gs.turn !== 0 || gs.busy || gs.choose || gs.over) return;
    const c = gs.me[i];
    if (!_c8Fits(c)) { gs.msg = `That doesn't match. Play a ${GameKit.SUITS[gs.suit]} or a ${GameKit.RANKS[gs.pile[gs.pile.length - 1].r]}, an 8, or draw.`; sfxWrong(); return _c8Render(); }
    gs.me.splice(i, 1); gs.pile.push(c); gs.suit = c.s; sfxCorrect();
    if (!gs.me.length) { gs.over = true; _c8Render(); return GameKit.finish('crazy8', true, 'You played your last card first!'); }
    if (c.r === 8) { gs.choose = true; gs.msg = 'Wild eight! Choose the next suit.'; return _c8Render(); }
    _c8EndTurn();
}
function c8Suit(s) { const gs = gameState.crazy8; if (!gs.choose) return; gs.suit = s; gs.choose = false; _c8EndTurn(); }
function c8Draw() {
    const gs = gameState.crazy8; if (gs.turn !== 0 || gs.busy || gs.choose || gs.over) return;
    if (gs.drew) { gs.msg = 'You passed.'; return _c8EndTurn(); }
    const c = _c8Draw(gs.me); gs.drew = true; sfxFlip(); _c8Sort();
    gs.msg = c && _c8Fits(c) ? `You drew the ${GameKit.RANKS[c.r]}${GameKit.SUITS[c.s]}: it fits! Play it, or tap Pass.` : 'No match. Tap Pass to end your turn.';
    _c8Render();
}
function _c8EndTurn() {
    const gs = gameState.crazy8; gs.drew = false; gs.turn = 1; gs.busy = true; _c8Render(); setTimeout(_c8Cpu, 1000);
}
function _c8Cpu() {
    const gs = gameState.crazy8; if (!gameState.active || gameState.currentId !== 'crazy8' || gs.over) return;
    const pickFrom = () => {
        const fit = gs.cpu.map((c, i) => ({ c, i })).filter(o => _c8Fits(o.c));
        // keep eights for last; prefer the suit it holds most of
        const plain = fit.filter(o => o.c.r !== 8);
        const pool = plain.length ? plain : fit;
        if (!pool.length) return null;
        const cnt = [0, 0, 0, 0]; gs.cpu.forEach(c => cnt[c.s]++);
        pool.sort((a, b) => cnt[b.c.s] - cnt[a.c.s] || b.c.r - a.c.r); return pool[0];
    };
    let o = pickFrom(), drew = false;
    if (!o) { _c8Draw(gs.cpu); drew = true; o = pickFrom(); }
    if (o) {
        const c = gs.cpu.splice(o.i, 1)[0]; c.up = true; gs.pile.push(c); gs.suit = c.s;
        let note = `The computer ${drew ? 'drew, then ' : ''}played the ${GameKit.RANKS[c.r]}${GameKit.SUITS[c.s]}`;
        if (c.r === 8) { const cnt = [0, 0, 0, 0]; gs.cpu.forEach(x => cnt[x.s]++); gs.suit = cnt.indexOf(Math.max(...cnt)); note += ` and chose ${GameKit.SUITS[gs.suit]}`; }
        gs.msg = note + '. Your turn.'; sfxFlip();
        if (!gs.cpu.length) { gs.over = true; gs.busy = false; _c8Render(); return GameKit.finish('crazy8', false, `The computer went out first. You had ${gs.me.length} card${gs.me.length === 1 ? '' : 's'} left.`); }
    } else gs.msg = 'The computer drew and passed. Your turn.';
    gs.turn = 0; gs.busy = false; _c8Render();
}
function _c8Render() {
    const gs = gameState.crazy8, el = document.getElementById('gameContent');
    if (!el || gameState.currentId !== 'crazy8') return;
    const C = GameKit.card, top = gs.pile[gs.pile.length - 1];
    const hand = gs.me.map((c, i) => C(c, { onclick: `c8Tap(${i})`, hint: gs.turn === 0 && !gs.choose && _c8Fits(c) })).join('');
    const suits = gs.choose ? `<div class="gk-btns">${[0, 1, 2, 3].map(s => GameKit.btn(`<span style="font-size:1.6rem;color:${GameKit.isRed(s) ? '#c62828' : '#1d1b18'}">${GameKit.SUITS[s]}</span>`, `c8Suit(${s})`, { cls: 'gk-primary' })).join('')}</div>` : '';
    el.innerHTML = `<div class="gk-table c8" dir="ltr">
      <div class="gk-status">${gs.msg}</div>
      <div class="gk-label">Computer: ${gs.cpu.length} card${gs.cpu.length === 1 ? '' : 's'}</div>
      <div class="gk-row c8-cpu">${gs.cpu.map(() => C({ up: false }, { down: true })).join('')}</div>
      <div class="gk-row c8-mid">${C({ up: false }, { down: true, onclick: 'c8Draw()' })}${C(top)}<div class="gk-label c8-suit">Suit to play:<br><span style="font-size:2rem;color:${GameKit.isRed(gs.suit) ? '#ffb4a8' : '#fff7e6'}">${GameKit.SUITS[gs.suit]}</span></div></div>
      ${suits}
      <div class="gk-label gk-big">Your hand</div>
      <div class="gk-hand">${hand}</div>
      <div class="gk-btns">${GameKit.btn(gs.drew ? 'Pass' : GameKit.icon('layers') + 'Draw a card', 'c8Draw()', { cls: 'gk-primary', disabled: gs.turn !== 0 || gs.choose || gs.over })}</div>
    </div>
    <style>.gk-table.c8{--w:clamp(48px,13vw,78px)}.c8 .c8-cpu{gap:2px}.c8 .c8-cpu .gk-card{--w:26px}.c8 .c8-mid{gap:18px;align-items:center;margin:12px 0}</style>`;
}
