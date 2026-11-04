// ═══════════════════════════════════════════════════════════════════════════════
// SIX-CARD GOLF (2026-11, nostalgia batch 2) — the kitchen-table card game where low scores win, three "holes"
// against the computer. No clock.
// Each player has six cards face down in two rows of three. To start, turn two of yours face up.
// On a turn: take the top DISCARD, or draw from the STOCK. Swap the card you took with any of your six (face up or
// down); the replaced card goes face up on the discard pile. A card drawn from the stock may instead be thrown away,
// and then you turn one of your face-down cards up.
// When one player has all six face up, everyone else gets one last turn, then the hole is scored:
// Ace 1, 2 = minus 2, 3-10 face value, Jack and Queen 10, King 0. Two equal cards in the same COLUMN score 0.
// After 3 holes the lower total wins (a tie is not a win). Computer: easy is careless, normal and hard plan pairs
// (hard also keeps track of what is still to come).
// ═══════════════════════════════════════════════════════════════════════════════
const _gfVal = (c) => (c.r === 2 ? -2 : c.r === 13 ? 0 : c.r >= 11 ? 10 : c.r);
function _gfScore(h) { let s = 0; for (let col = 0; col < 3; col++) { const a = h[col], b = h[col + 3]; s += a.r === b.r ? 0 : _gfVal(a) + _gfVal(b); } return s; }
function _gfShown(h) { let s = 0; for (let col = 0; col < 3; col++) { const a = h[col], b = h[col + 3]; if (a.up && b.up && a.r === b.r) continue; if (a.up) s += _gfVal(a); if (b.up) s += _gfVal(b); } return s; }
function initGolf() {
    NK.start('golf', {
        setup(gs, diff) {
            gs.diff = diff; gs.hole = 1; gs.tot = [0, 0]; gs.cards = []; gs.over = false;
            _gfDeal(gs);
        },
        view: _gfView,
        keys: { KeyS: () => gfStock(), KeyD: () => gfDiscardPile() },
        rules: [
            'You and the computer each have <b>six cards</b> in two rows. Low scores win, as in golf.',
            'To begin, tap <b>two of your cards</b> to turn them face up.',
            'On your turn, take the top card of the <b>discard pile</b>, or draw from the <b>stock</b>. Then tap one of your six cards to <b>swap</b> it; the old card goes on the discard pile.',
            'A card drawn from the stock may be thrown away instead (tap the discard pile); then turn up one of your face-down cards.',
            'Scores: Ace 1, <b>2 is minus 2</b>, 3 to 10 as shown, Jack and Queen 10, <b>King 0</b>. Two equal cards in the same column score <b>0</b>.',
            'When someone has all six cards face up, the other player gets one last turn and the hole is scored. Three holes; the lower total wins. No clock.',
            'Keyboard: arrow keys move between cards, Enter picks; S draws from the stock, D takes the discard.'],
        css: `.gf-t{--w:clamp(44px,13vw,70px)}
.gf-hand{display:grid;grid-template-columns:repeat(3,auto);gap:8px;justify-content:center}
.gf-slot{background:transparent;border:0;padding:0;cursor:pointer;--nk-r:10px;display:block}
.gf-slot:disabled{cursor:default}
.gf-slot.gf-pair .gk-card{box-shadow:0 0 0 3px #86efac}
.gf-mid{display:flex;gap:18px;justify-content:center;align-items:flex-end;margin:12px 0}
.gf-pile{display:flex;flex-direction:column;align-items:center;gap:4px;font-weight:800;color:#fde7c4;font-size:.95rem}
.gf-hold{display:flex;flex-direction:column;align-items:center;gap:4px;font-weight:800;color:#fde68a;font-size:.95rem}
.gf-lab{text-align:center;font-weight:800;color:#fde7c4;margin:4px 0}
.gf-score{display:grid;grid-template-columns:auto repeat(3,1fr) auto;gap:4px 10px;font-size:1.05rem;background:#fff3d6;border:2px solid #e8cfa8;border-radius:12px;padding:8px 12px;margin-top:10px}
.gf-score .h{font-weight:800;color:#4a3420}`,
    });
}
function _gfDeal(gs) {
    gs.deck = GameKit.deck(); gs.hands = [[], []];
    for (let i = 0; i < 6; i++) { gs.hands[0].push(gs.deck.pop()); gs.hands[1].push(gs.deck.pop()); }
    const d = gs.deck.pop(); d.up = true; gs.disc = [d];
    gs.phase = 'flip'; gs.flips = 0; gs.hold = null; gs.from = null; gs.mustFlip = false; gs.last = -1; gs.ender = -1; gs.turn = 0;
    // the computer turns up two of its cards
    const c = shuffle([0, 1, 2, 3, 4, 5]).slice(0, 2); c.forEach((i) => (gs.hands[1][i].up = true));
    gs.msg = `Hole ${gs.hole} of 3. Tap two of your cards to turn them face up.`;
}
function gfStock() {
    const gs = gameState.golf; if (gs.over || gs.turn !== 0 || gs.phase !== 'play' || gs.hold || gs.mustFlip) return;
    if (!gs.deck.length) _gfRefill(gs);
    gs.hold = gs.deck.pop(); gs.hold.up = true; gs.from = 'stock';
    gs.msg = `You drew the ${_gfName(gs.hold)}. Tap one of your cards to swap it, or tap the discard pile to throw it away.`;
    NK.render('golf');
}
function gfDiscardPile() {
    const gs = gameState.golf; if (gs.over || gs.turn !== 0 || gs.phase !== 'play' || gs.mustFlip) return;
    if (gs.hold && gs.from === 'stock') {   // throw the drawn card away, then flip one
        gs.disc.push(gs.hold); gs.hold = null;
        if (gs.hands[0].every((c) => c.up)) return _gfEndTurn(0, 'You threw it away.');
        gs.mustFlip = true; gs.msg = 'Thrown away. Now tap one of your face-down cards to turn it up.';
        return NK.render('golf');
    }
    if (gs.hold) { gs.msg = 'A card taken from the discard pile must be swapped into your cards.'; return NK.render('golf'); }
    gs.hold = gs.disc.pop(); gs.from = 'disc';
    gs.msg = `You took the ${_gfName(gs.hold)}. Tap one of your cards to swap it.`;
    NK.render('golf');
}
function gfSlot(i) {
    const gs = gameState.golf; if (gs.over || gs.turn !== 0) return;
    const h = gs.hands[0], c = h[i];
    if (gs.phase === 'flip') {
        if (c.up) { gs.msg = 'That one is already face up. Pick a face-down card.'; return NK.render('golf'); }
        c.up = true; gs.flips++;
        if (gs.flips >= 2) { gs.phase = 'play'; gs.msg = 'Your turn: take the top discard, or draw from the stock.'; }
        else gs.msg = 'One more.';
        if (typeof sfxFlip === 'function') sfxFlip();
        return NK.render('golf');
    }
    if (gs.mustFlip) {
        if (c.up) { gs.msg = 'Pick a card that is still face down.'; return NK.render('golf'); }
        c.up = true; gs.mustFlip = false; if (typeof sfxFlip === 'function') sfxFlip();
        return _gfEndTurn(0, `You turned up the ${_gfName(c)}.`);
    }
    if (!gs.hold) { gs.msg = 'First take a card: the top discard, or one from the stock.'; return NK.render('golf'); }
    const old = h[i]; old.up = true; h[i] = gs.hold; gs.hold = null; gs.disc.push(old); gs.last = i;
    if (typeof sfxFlip === 'function') sfxFlip();
    _gfEndTurn(0, `Swapped: the ${_gfName(old)} went to the discard pile.`);
}
function _gfRefill(gs) { const top = gs.disc.pop(); gs.deck = shuffle(gs.disc.map((c) => ({ ...c, up: false }))); gs.disc = [top]; }
const _gfName = (c) => ({ 1: 'Ace', 11: 'Jack', 12: 'Queen', 13: 'King' }[c.r] || String(c.r)) + ' of ' + ['spades', 'hearts', 'diamonds', 'clubs'][c.s];
function _gfEndTurn(p, m) {
    const gs = gameState.golf;
    if (gs.ender >= 0 && gs.ender !== p) return _gfHoleEnd(m);           // that was the last turn
    if (gs.ender < 0 && gs.hands[p].every((c) => c.up)) { gs.ender = p; m += p === 0 ? ' All your cards are up: the computer gets one last turn.' : ' All the computer\'s cards are up: you get one last turn.'; }
    gs.turn = 1 - p;
    if (gs.turn === 0) { gs.msg = m + ' Your turn: take the top discard, or draw from the stock.'; return NK.render('golf'); }
    gs.msg = m + ' The computer is thinking...'; NK.render('golf');
    NK.after(1000, _gfCpu);
}
// the computer's choice: how much a card helps in slot i (column score before minus after; unknown cards count u)
function _gfCol(a, b, u) { if (a.up && b.up && a.r === b.r) return 0; return (a.up ? _gfVal(a) : u) + (b.up ? _gfVal(b) : u); }
function _gfGain(h, i, card, u) { const j = i < 3 ? i + 3 : i - 3; return _gfCol(h[i], h[j], u) - _gfCol({ ...card, up: true }, h[j], u); }
function _gfCpu() {
    const gs = gameState.golf; if (gs.over || gs.turn !== 1) return;
    const h = gs.hands[1], careless = gs.diff === 'easy' && Math.random() < 0.35, unknown = gs.diff === 'hard' ? 4.5 : 5.5;
    const best = (card) => { let bi = -1, bg = -1e9; for (let i = 0; i < 6; i++) { const g = _gfGain(h, i, card, unknown); if (g > bg) { bg = g; bi = i; } } return [bi, bg]; };
    const top = gs.disc[gs.disc.length - 1];
    let [i, g] = best(top), card, from = 'disc';
    if (careless || g < 2) { if (!gs.deck.length) _gfRefill(gs); card = gs.deck.pop(); card.up = true; from = 'stock';[i, g] = best(card); }
    else card = gs.disc.pop();
    let m;
    // do not end the hole while clearly behind
    const wouldEnd = (j) => h.every((c, k) => c.up || k === j);
    const behind = _gfShown(h) > _gfShown(gs.hands[0]) + 4;
    if (from === 'stock' && (g < 1 || (behind && wouldEnd(i) && gs.ender < 0))) {
        gs.disc.push(card);
        const down = h.map((c, k) => (c.up ? -1 : k)).filter((k) => k >= 0);
        const safe = down.filter((k) => !behind || !wouldEnd(k));
        if (down.length && !(behind && !safe.length && gs.ender < 0)) { const k = (safe.length ? safe : down)[0]; h[k].up = true; gs.last = -1; m = `The computer drew the ${_gfName(card)}, threw it away and turned up its ${_gfName(h[k])}.`; }
        else m = `The computer drew the ${_gfName(card)} and threw it away.`;
    } else {
        const old = h[i]; old.up = true; h[i] = card; gs.disc.push(old);
        m = `The computer took the ${_gfName(card)} from the ${from === 'stock' ? 'stock' : 'discard pile'} and swapped out its ${_gfName(old)}.`;
    }
    if (typeof sfxFlip === 'function') sfxFlip();
    _gfEndTurn(1, m);
}
function _gfHoleEnd(m) {
    const gs = gameState.golf;
    gs.hands.forEach((h) => h.forEach((c) => (c.up = true)));
    const s = [_gfScore(gs.hands[0]), _gfScore(gs.hands[1])];
    gs.cards.push(s); gs.tot[0] += s[0]; gs.tot[1] += s[1];
    gs.phase = 'scored'; gs.turn = -1;
    if (gs.hole >= 3) {
        gs.over = true; const [y, c] = gs.tot;
        gs.msg = `${m} Hole 3: you ${s[0]}, computer ${s[1]}. Final: you ${y}, computer ${c}.`;
        NK.render('golf');
        if (y < c && typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('golf', y < c, y < c ? `You won the round of golf, ${y} to ${c} (low wins)!` : y === c ? `All square at ${y} each.` : `The computer won, ${c} to ${y}. Pairs in a column are the secret.`);
    }
    gs.msg = `${m} Hole ${gs.hole}: you ${s[0]}, computer ${s[1]}. Press Next hole.`;
    NK.render('golf');
}
function gfNextHole() { const gs = gameState.golf; if (gs.over || gs.phase !== 'scored') return; gs.hole++; _gfDeal(gs); NK.render('golf'); }
function gfRestart() { initGolf(); }
function _gfView(gs) {
    const card = (c, o) => GameKit.card(c, o || {});
    const pairCols = (h) => [0, 1, 2].filter((col) => h[col].up && h[col + 3].up && h[col].r === h[col + 3].r);
    const myPairs = pairCols(gs.hands[0]), cpuPairs = pairCols(gs.hands[1]);
    const canSlot = gs.turn === 0 && !gs.over && (gs.phase === 'flip' || gs.mustFlip || gs.hold);
    const mine = gs.hands[0].map((c, i) => `<button type="button" class="nk-cell gf-slot${myPairs.includes(i % 3) ? ' gf-pair' : ''}" onclick="gfSlot(${i})" data-k="s${i}"${i === 0 ? ' data-first' : ''} aria-label="your card ${i + 1}: ${c.up ? _gfName(c) : 'face down'}"${canSlot ? '' : ' disabled'}>${card(c, { sel: gs.last === i })}</button>`).join('');
    const cpu = gs.hands[1].map((c, i) => `<span class="gf-slot${cpuPairs.includes(i % 3) ? ' gf-pair' : ''}" aria-label="computer card: ${c.up ? _gfName(c) : 'face down'}">${card(c)}</span>`).join('');
    const top = gs.disc[gs.disc.length - 1];
    const play = gs.turn === 0 && gs.phase === 'play' && !gs.over;
    const stock = `<button type="button" class="nk-cell gf-slot" onclick="gfStock()" data-k="stock" aria-label="draw from the stock"${play && !gs.hold && !gs.mustFlip ? '' : ' disabled'}>${card({ r: 1, s: 0, up: false })}</button>`;
    const disc = `<button type="button" class="nk-cell gf-slot" onclick="gfDiscardPile()" data-k="disc" aria-label="discard pile${top ? ', ' + _gfName(top) : ''}"${play && !gs.mustFlip && (!gs.hold || gs.from === 'stock') ? '' : ' disabled'}>${top ? card(top) : card(null, { label: '' })}</button>`;
    const rows = [0, 1, 2].map((k) => gs.cards[k] || [null, null]);
    return `<div class="nk-top"><span>Hole <b>${gs.hole}</b> of 3</span><span>You: <b>${gs.tot[0]}</b></span><span>Computer: <b>${gs.tot[1]}</b></span></div>
      <div class="gk-table gf-t">
        <div class="gf-lab">Computer (showing ${_gfShown(gs.hands[1])})</div><div class="gf-hand">${cpu}</div>
        <div class="gf-mid"><div class="gf-pile">${stock}Stock</div><div class="gf-pile">${disc}Discard</div>${gs.hold ? `<div class="gf-hold">${card(gs.hold, { sel: true })}In your hand</div>` : ''}</div>
        <div class="gf-hand">${mine}</div><div class="gf-lab">You (showing ${_gfShown(gs.hands[0])})</div>
      </div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${gs.phase === 'scored' && !gs.over ? NK.btn('Next hole', 'gfNextHole()', { cls: 'gk-primary', k: 'next' }) : ''}${NK.btn(NK.icon('rotate-ccw') + 'New game', 'gfRestart()', { k: 'restart' })}</div>
      <div class="gf-score"><span class="h">Hole</span><span class="h">1</span><span class="h">2</span><span class="h">3</span><span class="h">Total</span>
        <span class="h">You</span>${rows.map((r) => `<span>${r[0] ?? '–'}</span>`).join('')}<b>${gs.tot[0]}</b>
        <span class="h">Computer</span>${rows.map((r) => `<span>${r[1] ?? '–'}</span>`).join('')}<b>${gs.tot[1]}</b></div>`;
}
