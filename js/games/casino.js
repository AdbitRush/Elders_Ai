// ═══════════════════════════════════════════════════════════════════════════════
// CASINO (2026-11, nostalgia batch 3) — the old fishing card game, you against the computer, in its simple family
// form (no builds). Four cards each and four on the table; when the hands are empty, four more each, until the deck is
// used up. On your turn play one card from your hand:
//   CAPTURE table cards of the same rank, and/or groups of number cards that add up to your card (Ace = 1;
//   a picture card captures only picture cards of its own rank); or TRAIL: lay the card on the table.
// Clearing the whole table is a sweep. The last player to capture takes what is left at the end.
// Points: most cards 3, most spades 1, Big Casino (10 of diamonds) 2, Little Casino (2 of spades) 1, each Ace 1,
// each sweep 1. Higher total wins. Easy: the computer often misses its best capture. No money, no clock.
// ═══════════════════════════════════════════════════════════════════════════════
const _csName = (c) => `${['', 'Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'][c.r]} of ${['spades', 'hearts', 'diamonds', 'clubs'][c.s]}`;
// can the chosen table cards be split into groups that each match card c?
function _csValid(c, take) {
    if (!take.length) return false;
    if (c.r > 10) return take.every((t) => t.r === c.r);
    if (take.some((t) => t.r > 10 || t.r > c.r)) return false;
    const v = take.map((t) => t.r).sort((a, b) => b - a), used = v.map(() => false);
    const fill = (need, from) => { if (!need) return used.every(Boolean) || fill(c.r, 0); for (let i = from; i < v.length; i++) if (!used[i] && v[i] <= need) { used[i] = true; if (fill(need - v[i], need - v[i] ? i + 1 : 0)) return true; used[i] = false; } return false; };
    return fill(c.r, 0);
}
// every capture card c could make (as lists of table indexes), largest first
function _csCaptures(c, table) {
    const out = [], n = table.length;
    for (let m = 1; m < 1 << n; m++) { const take = table.filter((_, i) => m & (1 << i)); if (_csValid(c, take)) out.push([...Array(n).keys()].filter((i) => m & (1 << i))); }
    return out.sort((a, b) => b.length - a.length);
}
const _csWorth = (cards) => cards.reduce((a, c) => a + 1 + (c.s === 0 ? 0.6 : 0) + (c.r === 1 ? 2 : 0) + (c.r === 10 && c.s === 2 ? 4 : 0) + (c.r === 2 && c.s === 0 ? 2 : 0), 0);
function initCasino() {
    NK.start('casino', {
        setup(gs, diff) {
            const d = GameKit.deck(); d.forEach((c) => (c.up = true));
            gs.diff = diff; gs.deck = d; gs.table = d.splice(0, 4); gs.hands = [d.splice(0, 4), d.splice(0, 4)]; gs.got = [[], []]; gs.sweeps = [0, 0]; gs.lastCap = -1;
            gs.turn = 0; gs.sel = -1; gs.pick = []; gs.over = false; gs.cpuSaid = '';
            gs.msg = 'Tap a card in your hand, then the table cards it captures, then Take. Or tap Trail to lay it down.';
        },
        view: _csView,
        keys: { KeyT: () => csTake(), KeyL: () => csTrail() },
        rules: [
            'Play one card from your hand each turn. To <b>capture</b>, take table cards of the <b>same rank</b>, and/or groups of number cards that <b>add up</b> to your card (Ace counts 1). A 9 can take a 9, or a 5 and a 4, or both at once.',
            'Picture cards (Jack, Queen, King) capture only picture cards of their own rank.',
            'If you cannot or do not want to capture, <b>trail</b>: lay your card on the table.',
            'Clearing the whole table is a <b>sweep</b> (1 point). The last player to capture takes what is left at the end.',
            'Points: most cards 3, most spades 1, Big Casino (10♦) 2, Little Casino (2♠) 1, each Ace 1, each sweep 1. Higher total wins. This is the simple family game, without builds.',
            'No money, no clock. Keyboard: arrow keys and Enter, T takes, L trails.'],
        css: `.cs-t{--w:clamp(44px,13vw,70px)}
.cs-row{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;min-height:calc(var(--w)*1.4);margin:4px 0 8px}
#gameContent .nk button.cs-b{background:none;border:0;padding:0;--nk-r:9px;display:block}
.cs-b:disabled{cursor:default}
.cs-b.cs-sel .gk-card{outline:4px solid #fbbf24;outline-offset:1px;transform:translateY(-4px)}
.cs-b.cs-pk .gk-card{outline:4px solid #60a5fa;outline-offset:1px}
.cs-cpu{display:flex;justify-content:center;gap:4px}
.cs-sc{display:grid;grid-template-columns:auto 1fr 1fr;gap:2px 12px;max-width:24rem;margin:8px auto 0;font-size:1rem}
.cs-sc b{text-align:right}
@media (prefers-reduced-motion:reduce){.cs-b.cs-sel .gk-card{transform:none}}`,
    });
}
function csCard(i) {
    const gs = gameState.casino; if (gs.over || gs.turn !== 0) return;
    gs.sel = gs.sel === i ? -1 : i; gs.pick = [];
    if (gs.sel >= 0) { const c = gs.hands[0][i], caps = _csCaptures(c, gs.table); gs.msg = caps.length ? `${_csName(c)} picked. Tap the table cards it captures (${caps[0].length === 1 && caps.length === 1 ? 'there is one capture' : 'there is a capture'}), then Take.` : `${_csName(c)} picked. It captures nothing on the table: tap Trail to lay it down.`; }
    else gs.msg = '';
    NK.render('casino');
}
function csTable(j) {
    const gs = gameState.casino; if (gs.over || gs.turn !== 0) return;
    if (gs.sel < 0) { gs.msg = 'Pick a card from your hand first.'; return NK.render('casino'); }
    const k = gs.pick.indexOf(j); if (k >= 0) gs.pick.splice(k, 1); else gs.pick.push(j);
    const c = gs.hands[0][gs.sel], take = gs.pick.map((x) => gs.table[x]);
    gs.msg = !gs.pick.length ? '' : _csValid(c, take) ? `${NK.pl(take.length, 'card')} picked: a good capture. Tap Take.` : `Picked so far: ${take.map((t) => ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][t.r]).join(' + ')}. Not a capture for the ${_csName(c)} yet.`;
    NK.render('casino');
}
function _csCapture(gs, who, i, idx) {
    const c = gs.hands[who].splice(i, 1)[0], taken = idx.map((x) => gs.table[x]);
    gs.table = gs.table.filter((_, x) => !idx.includes(x)); gs.got[who].push(c, ...taken); gs.lastCap = who;
    const sweep = !gs.table.length; if (sweep) gs.sweeps[who]++;
    return { c, taken, sweep };
}
function csTake() {
    const gs = gameState.casino; if (gs.over || gs.turn !== 0 || gs.sel < 0) return;
    const c = gs.hands[0][gs.sel], take = gs.pick.map((x) => gs.table[x]);
    if (!_csValid(c, take)) { gs.msg = gs.pick.length ? `That is not a capture for the ${_csName(c)}. Groups must add up to ${c.r > 10 ? 'its rank (picture cards take only their own rank)' : c.r}.` : 'Tap the table cards to capture first.'; if (typeof sfxWrong === 'function') sfxWrong(); return NK.render('casino'); }
    const r = _csCapture(gs, 0, gs.sel, gs.pick.slice()); if (typeof sfxFlip === 'function') sfxFlip();
    gs.sel = -1; gs.pick = []; gs.msg = `You captured ${NK.pl(r.taken.length, 'card')} with the ${_csName(r.c)}${r.sweep ? ': a sweep!' : '.'}`;
    _csNext(gs);
}
function csTrail() {
    const gs = gameState.casino; if (gs.over || gs.turn !== 0 || gs.sel < 0) return;
    const c = gs.hands[0].splice(gs.sel, 1)[0]; gs.table.push(c); gs.sel = -1; gs.pick = []; if (typeof sfxFlip === 'function') sfxFlip();
    gs.msg = `You trailed the ${_csName(c)}.`; _csNext(gs);
}
function _csNext(gs) {
    gs.turn = 1; NK.render('casino'); NK.after(900, _csCpu);
}
function _csCpu() {
    const gs = gameState.casino; if (gs.over || gs.turn !== 1) return;
    const h = gs.hands[1]; let best = null;
    h.forEach((c, i) => _csCaptures(c, gs.table).forEach((idx) => { const cards = [c, ...idx.map((x) => gs.table[x])], v = _csWorth(cards) + (idx.length === gs.table.length ? 3 : 0); if (!best || v > best.v) best = { i, idx, v }; }));
    if (best && gs.diff === 'easy' && Math.random() < 0.45) { const opts = []; h.forEach((c, i) => _csCaptures(c, gs.table).forEach((idx) => opts.push({ i, idx }))); best = opts[opts.length - 1]; }
    if (best) { const r = _csCapture(gs, 1, best.i, best.idx); gs.cpuSaid = `The computer captured ${r.taken.map(_csName).join(', ')} with the ${_csName(r.c)}${r.sweep ? ': a sweep' : ''}.`; }
    else { let i = 0; h.forEach((c, j) => { if (_csWorth([c]) < _csWorth([h[i]]) || (_csWorth([c]) === _csWorth([h[i]]) && c.r < h[i].r)) i = j; }); const c = h.splice(i, 1)[0]; gs.table.push(c); gs.cpuSaid = `The computer trailed the ${_csName(c)}.`; }
    if (typeof sfxFlip === 'function') sfxFlip();
    // deal again when both hands are empty; end when the deck is used up too
    if (!gs.hands[0].length && !gs.hands[1].length) {
        if (!gs.deck.length) return _csEnd(gs);
        gs.hands = [gs.deck.splice(0, 4), gs.deck.splice(0, 4)]; gs.cpuSaid += ' Four new cards each.';
    }
    gs.turn = 0; gs.msg = gs.cpuSaid + ' Your turn.'; NK.render('casino');
}
function _csScore(gs) {
    const s = [0, 1].map((w) => { const g = gs.got[w]; return { cards: g.length, spades: g.filter((c) => c.s === 0).length, big: g.some((c) => c.r === 10 && c.s === 2) ? 2 : 0, little: g.some((c) => c.r === 2 && c.s === 0) ? 1 : 0, aces: g.filter((c) => c.r === 1).length, sweeps: gs.sweeps[w] }; });
    const pts = s.map((x, w) => (x.cards > s[1 - w].cards ? 3 : 0) + (x.spades > s[1 - w].spades ? 1 : 0) + x.big + x.little + x.aces + x.sweeps);
    return { s, pts };
}
function _csEnd(gs) {
    if (gs.table.length && gs.lastCap >= 0) { gs.got[gs.lastCap].push(...gs.table); gs.cpuSaid += ` ${gs.lastCap === 0 ? 'You take' : 'The computer takes'} the last ${NK.pl(gs.table.length, 'card')} on the table.`; gs.table = []; }
    gs.over = true; gs.turn = -1; const { pts } = _csScore(gs), win = pts[0] > pts[1];
    gs.msg = `${gs.cpuSaid} Final points: you ${pts[0]}, computer ${pts[1]}.`;
    NK.render('casino'); if (win && typeof sfxCorrect === 'function') sfxCorrect();
    NK.finish('casino', win, win ? `You won ${pts[0]} points to ${pts[1]}.` : pts[0] === pts[1] ? `A tie at ${pts[0]} points each.` : `The computer won ${pts[1]} to ${pts[0]}. A rematch is one tap away.`);
}
function csNew() { initCasino(); }
function _csView(gs) {
    const my = gs.turn === 0 && !gs.over;
    const table = gs.table.map((c, j) => `<button type="button" class="nk-cell cs-b${gs.pick.includes(j) ? ' cs-pk' : ''}" onclick="csTable(${j})" data-k="t${c.r}_${c.s}" aria-label="table card: ${_csName(c)}${gs.pick.includes(j) ? ', picked to capture' : ''}" aria-pressed="${gs.pick.includes(j)}"${my ? '' : ' disabled'}>${GameKit.card(c)}</button>`).join('') || '<span class="gk-label">The table is empty</span>';
    const hand = gs.hands[0].map((c, i) => `<button type="button" class="nk-cell cs-b${gs.sel === i ? ' cs-sel' : ''}" onclick="csCard(${i})" data-k="h${c.r}_${c.s}"${i === 0 ? ' data-first' : ''} aria-label="your card: ${_csName(c)}${gs.sel === i ? ', picked' : ''}"${my ? '' : ' disabled'}>${GameKit.card(c)}</button>`).join('');
    const { s, pts } = _csScore(gs);
    const sc = `<div class="cs-sc"><span></span><b>You</b><b>Computer</b><span>Cards taken</span><b>${s[0].cards}</b><b>${s[1].cards}</b><span>Spades</span><b>${s[0].spades}</b><b>${s[1].spades}</b><span>Aces, Casinos, sweeps</span><b>${s[0].aces + s[0].big + s[0].little + s[0].sweeps}</b><b>${s[1].aces + s[1].big + s[1].little + s[1].sweeps}</b><span>Points so far</span><b>${pts[0]}</b><b>${pts[1]}</b></div>`;
    return `<div class="nk-top"><span>Deck: <b>${gs.deck.length}</b></span><span>${gs.over ? 'Game over' : my ? 'Your turn' : "Computer's turn"}</span><span>Points: <b>${pts[0]}</b> to <b>${pts[1]}</b></span></div>
      <div class="gk-table cs-t">
        <div class="cs-cpu" role="img" aria-label="computer holds ${NK.pl(gs.hands[1].length, 'card')}">${gs.hands[1].map(() => GameKit.card({ r: 1, s: 0, up: false })).join('')}</div>
        <div class="gk-label">Table</div><div class="cs-row">${table}</div>
        <div class="gk-label">Your hand</div><div class="cs-row">${hand}</div></div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn('Take', 'csTake()', { k: 'take', cls: 'gk-primary', disabled: !my || gs.sel < 0 })}${NK.btn('Trail', 'csTrail()', { k: 'trail', disabled: !my || gs.sel < 0 })}${NK.btn(NK.icon('rotate-ccw') + 'New game', 'csNew()', { k: 'restart' })}</div>
      ${sc}`;
}
