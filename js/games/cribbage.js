// ═══════════════════════════════════════════════════════════════════════════════
// CRIBBAGE (2026-11, nostalgia batch 3) — the pegging card game of porches, cabins and break rooms, two hands, you
// against the computer, to 61 points (the old "short game" once round the board). Each hand:
//   DEAL six cards each; each player puts two in the CRIB, which belongs to the dealer. Cut a STARTER card (a Jack
//   gives the dealer 2, "his heels").
//   THE PLAY: take turns laying cards, keeping a running count that may not pass 31. Score 2 for making 15 or 31,
//   2 for a pair (6 for three, 12 for four), and a run of three or more cards in any order scores its length. Cannot
//   play? Say Go; the other player keeps going, and the last card before a reset scores 1.
//   THE SHOW: hands are counted with the starter (non-dealer first, then dealer, then the crib): 2 for each 15,
//   2 for each pair, run length for each run, 4 for a flush in the hand (5 with the starter), 1 for the Jack of the
//   starter's suit ("his nobs"). The game counts everything and shows how.
// Easy: the computer keeps careless crib cards and pegs plainly. Normal: it plans its discards. Hard: game to 121.
// ═══════════════════════════════════════════════════════════════════════════════
const _cbV = (c) => Math.min(10, c.r);
const _cbRk = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const _cbName = (c) => `${['', 'Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'][c.r]} of ${['spades', 'hearts', 'diamonds', 'clubs'][c.s]}`;
// count a hand with the starter; returns { total, parts: [[label, pts]] }
function _cbCount(hand, starter, crib) {
    const all = starter ? hand.concat([starter]) : hand.slice(), parts = [];
    let f = 0; for (let m = 1; m < 1 << all.length; m++) { let s = 0; for (let i = 0; i < all.length; i++) if (m & (1 << i)) s += _cbV(all[i]); if (s === 15) f++; }
    if (f) parts.push([`${NK.pl(f, 'fifteen')}`, f * 2]);
    let pr = 0; for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) if (all[i].r === all[j].r) pr++;
    if (pr) parts.push([`${NK.pl(pr, 'pair')}`, pr * 2]);
    const cnt = Array(15).fill(0); all.forEach((c) => cnt[c.r]++); let best = 0, mult = 0;
    for (let lo = 1; lo <= 13; lo++) { let len = 0, mu = 1; while (lo + len <= 13 && cnt[lo + len]) { mu *= cnt[lo + len]; len++; } if (len >= 3 && len > best) { best = len; mult = mu; } }
    if (best) parts.push([`${mult > 1 ? mult + ' runs' : 'a run'} of ${best}`, best * mult]);
    if (hand.length === 4 && hand.every((c) => c.s === hand[0].s)) { const five = starter && starter.s === hand[0].s; if (!crib || five) parts.push([five ? 'a five-card flush' : 'a flush', five ? 5 : 4]); }
    if (starter && hand.some((c) => c.r === 11 && c.s === starter.s)) parts.push(['his nobs (the Jack of the starter\'s suit)', 1]);
    return { total: parts.reduce((a, p) => a + p[1], 0), parts };
}
// points for laying the last card of `pile` (the cards since the last reset)
function _cbPeg(pile) {
    const n = pile.length, sum = pile.reduce((a, c) => a + _cbV(c), 0), parts = [];
    if (sum === 15) parts.push(['fifteen', 2]); if (sum === 31) parts.push(['thirty-one', 2]);
    let k = 1; while (k < n && pile[n - 1 - k].r === pile[n - 1].r) k++;
    if (k >= 2) parts.push([k === 2 ? 'a pair' : k === 3 ? 'three of a kind' : 'four of a kind', { 2: 2, 3: 6, 4: 12 }[k]]);
    for (let L = n; L >= 3; L--) { const rs = pile.slice(n - L).map((c) => c.r).sort((a, b) => a - b); if (rs.every((r, i) => !i || r === rs[i - 1] + 1)) { parts.push([`a run of ${L}`, L]); break; } }
    return parts;
}
function initCribbage() {
    NK.start('cribbage', {
        setup(gs, diff) { gs.diff = diff; gs.goal = diff === 'hard' ? 121 : 61; gs.sc = [0, 0]; gs.dealer = 1; gs.over = false; gs.handNo = 0; _cbDeal(gs); },
        view: _cbView,
        rules: (gs) => [
            `First to <b>${gs.goal} points</b> wins. You and the computer take turns to deal. Each player gets six cards and puts <b>two in the crib</b>, which counts for the dealer.`,
            'A <b>starter</b> card is cut. If it is a Jack, the dealer pegs 2.',
            '<b>The play:</b> take turns laying a card and adding to the count, never past 31. Score 2 for making exactly 15 or 31, 2 for a pair (6 for three, 12 for four), and a run of 3 or more (any order) scores its length. If you cannot play, the game says <b>Go</b> for you; the last card before the count resets scores 1.',
            '<b>The show:</b> each hand is counted with the starter: 2 for each 15, 2 per pair, run length per run, 4 for a flush (5 with the starter), 1 for his nobs. The crib goes to the dealer. The game does all the counting and shows how.',
            'No money, no clock. Keyboard: arrow keys and Enter on your cards.'],
        css: `.cb-t{--w:clamp(44px,13.4vw,70px)}
.cb-row{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;min-height:calc(var(--w)*1.4)}
#gameContent .nk button.cb-b{background:none;border:0;padding:0;--nk-r:9px;display:block}
.cb-b:disabled{cursor:default}
.cb-b.cb-pk .gk-card{outline:4px solid #fbbf24;outline-offset:1px;transform:translateY(-6px)}
.cb-b.cb-no .gk-card{filter:brightness(.7)}
.cb-mid{display:flex;justify-content:center;align-items:center;gap:16px;margin:10px 0;flex-wrap:wrap}
.cb-cnt{font:900 2rem Georgia,serif;color:#fde68a;min-width:3.5rem;text-align:center}
.cb-pile{display:flex;gap:0}.cb-pile .gk-card+.gk-card{margin-left:calc(var(--w)*-.6)}
.cb-board{background:linear-gradient(#b45309,#92400e);border-radius:14px;padding:10px 12px;margin:0 0 10px;box-shadow:inset 0 0 0 3px #78350f;color:#fff7e6;font-weight:800}
.cb-track{position:relative;height:16px;border-radius:8px;background:repeating-linear-gradient(90deg,#fde7c4 0 2px,transparent 2px calc(100% / 61 * 5));margin:4px 0 8px}
.cb-peg{position:absolute;top:50%;width:18px;height:18px;border-radius:50%;transform:translate(-50%,-50%);border:2px solid #fff}
.cb-show{background:#fffbeb;border:2px solid #fde7c4;border-radius:14px;padding:10px 14px;margin:10px 0}
.cb-show h4{margin:0 0 4px;font-size:1.1rem}.cb-show ul{margin:0 0 6px;padding-left:1.2rem}
@media (prefers-reduced-motion:reduce){.cb-b.cb-pk .gk-card{transform:none}}`,
    });
}
function _cbDeal(gs) {
    const d = GameKit.deck(); d.forEach((c) => (c.up = true));
    gs.dealer = 1 - gs.dealer; gs.handNo++; gs.hands = [d.splice(0, 6), d.splice(0, 6)]; gs.deck = d; gs.crib = []; gs.starter = null;
    gs.hands[0].sort((a, b) => a.r - b.r || a.s - b.s); gs.pick = []; gs.phase = 'discard'; gs.show = null;
    gs.msg = `Hand ${gs.handNo}. ${gs.dealer === 0 ? 'You deal: the crib is yours.' : 'The computer deals: the crib is its.'} Pick two cards for the crib.`;
}
function _cbCpuDiscard(gs) {
    const h = gs.hands[1]; let best = null;
    for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) {
        const keep = h.filter((_, k) => k !== i && k !== j), toss = [h[i], h[j]];
        let v = _cbCount(keep, null).total; const cv = _cbCount(toss, null).total + (_cbV(toss[0]) + _cbV(toss[1]) === 5 ? 1 : 0) + (toss.some((c) => c.r === 5) ? 1 : 0);
        v += gs.diff === 'easy' ? 0 : gs.dealer === 1 ? cv : -cv;
        if (gs.diff === 'easy') v += Math.random() * 3;
        if (!best || v > best.v) best = { v, i, j };
    }
    return [best.i, best.j];
}
function cbCard(i) {
    const gs = gameState.cribbage; if (gs.over) return;
    if (gs.phase === 'discard') { const k = gs.pick.indexOf(i); if (k >= 0) gs.pick.splice(k, 1); else if (gs.pick.length < 2) gs.pick.push(i); else { gs.pick.shift(); gs.pick.push(i); } gs.msg = gs.pick.length === 2 ? 'Two picked. Tap Send to crib.' : 'Pick two cards for the crib.'; return NK.render('cribbage'); }
    if (gs.phase === 'play' && gs.turn === 0) {
        const c = gs.hands[0][i]; if (gs.count + _cbV(c) > 31) { gs.msg = `That would take the count past 31 (it is ${gs.count}).`; if (typeof sfxWrong === 'function') sfxWrong(); return NK.render('cribbage'); }
        _cbLay(gs, 0, i);
    }
}
function cbCrib() {
    const gs = gameState.cribbage; if (gs.over || gs.phase !== 'discard' || gs.pick.length !== 2) return;
    gs.crib.push(...gs.pick.map((i) => gs.hands[0][i])); gs.hands[0] = gs.hands[0].filter((_, i) => !gs.pick.includes(i)); gs.pick = [];
    const [a, b] = _cbCpuDiscard(gs); gs.crib.push(gs.hands[1][a], gs.hands[1][b]); gs.hands[1] = gs.hands[1].filter((_, k) => k !== a && k !== b);
    gs.keep = [gs.hands[0].slice(), gs.hands[1].slice()];   // for the show
    gs.starter = gs.deck[Math.floor(Math.random() * gs.deck.length)];
    let said = `The starter is the ${_cbName(gs.starter)}.`;
    if (gs.starter.r === 11) { said += ` His heels: ${gs.dealer === 0 ? 'you peg' : 'the computer pegs'} 2.`; if (_cbAdd(gs, gs.dealer, 2)) return; }
    gs.phase = 'play'; gs.count = 0; gs.pile = []; gs.played = []; gs.turn = 1 - gs.dealer; gs.goSaid = [false, false]; gs.lastPlayer = -1;
    gs.msg = said + (gs.turn === 0 ? ' You lead: tap a card.' : ' The computer leads.');
    if (typeof sfxFlip === 'function') sfxFlip(); NK.render('cribbage'); if (gs.turn === 1) NK.after(900, () => _cbCpu(gs));
}
function _cbAdd(gs, who, pts) {
    gs.sc[who] = Math.min(gs.goal, gs.sc[who] + pts);
    if (gs.sc[who] >= gs.goal) { gs.over = true; const win = who === 0; gs.msg += win ? ` You reach ${gs.goal}. You win!` : ` The computer reaches ${gs.goal}.`; NK.render('cribbage'); if (win && typeof sfxCorrect === 'function') sfxCorrect(); NK.finish('cribbage', win, win ? `You won ${gs.sc[0]} to ${gs.sc[1]}.` : `The computer won ${gs.sc[1]} to ${gs.sc[0]}. A rematch is one tap away.`); return true; }
    return false;
}
const _cbCan = (gs, p) => gs.hands[p].some((c) => gs.count + _cbV(c) <= 31);
function _cbLay(gs, p, i) {
    const c = gs.hands[p].splice(i, 1)[0]; gs.pile.push(c); gs.played.push({ p, c }); gs.count += _cbV(c); gs.lastPlayer = p; if (typeof sfxFlip === 'function') sfxFlip();
    const parts = _cbPeg(gs.pile), pts = parts.reduce((a, x) => a + x[1], 0);
    gs.msg = `${p === 0 ? 'You lay' : 'The computer lays'} the ${_cbName(c)}: count ${gs.count}.${pts ? ` ${parts.map((x) => x[0]).join(' and ')}: ${pts} for ${p === 0 ? 'you' : 'the computer'}.` : ''}`;
    if (pts && _cbAdd(gs, p, pts)) return;
    if (gs.count === 31) return _cbReset(gs, false);
    _cbNextTurn(gs, p);
}
function _cbNextTurn(gs, p) {
    const o = 1 - p;
    if (!gs.hands[0].length && !gs.hands[1].length) { if (gs.count !== 31) { gs.msg += ` Last card: 1 for ${gs.lastPlayer === 0 ? 'you' : 'the computer'}.`; if (_cbAdd(gs, gs.lastPlayer, 1)) return; } return _cbShow(gs); }
    if (_cbCan(gs, o)) { gs.turn = o; }
    else if (_cbCan(gs, p)) { gs.turn = p; gs.msg += ` ${o === 0 ? 'You cannot play: Go.' : 'The computer says Go.'}`; }
    else return _cbReset(gs, true);
    NK.render('cribbage'); if (gs.turn === 1) NK.after(900, () => _cbCpu(gs));
}
function _cbReset(gs, go) {
    if (go) { gs.msg += ` Nobody can play: 1 for ${gs.lastPlayer === 0 ? 'you' : 'the computer'} for the last card.`; if (_cbAdd(gs, gs.lastPlayer, 1)) return; }
    gs.count = 0; gs.pile = []; gs.msg += ' The count starts again at 0.';
    if (!gs.hands[0].length && !gs.hands[1].length) return _cbShow(gs);
    const nx = 1 - gs.lastPlayer; gs.turn = gs.hands[nx].length ? nx : gs.lastPlayer;
    NK.render('cribbage'); if (gs.turn === 1) NK.after(900, () => _cbCpu(gs));
}
function _cbCpu(gs) {
    if (gameState.cribbage !== gs || gs.over || gs.phase !== 'play' || gs.turn !== 1) return;
    const h = gs.hands[1]; let best = -1, bv = -1e9;
    h.forEach((c, i) => { if (gs.count + _cbV(c) > 31) return; const pile = gs.pile.concat([c]), pts = _cbPeg(pile).reduce((a, x) => a + x[1], 0), nc = gs.count + _cbV(c);
        let v = pts * 10 + (gs.diff === 'easy' ? Math.random() * 6 : 0) - (nc === 5 || nc === 21 ? 3 : 0) + (gs.diff === 'easy' ? 0 : _cbV(c) * 0.1); if (v > bv) { bv = v; best = i; } });
    if (best < 0) return _cbNextTurn(gs, 0);
    _cbLay(gs, 1, best);
}
function _cbShow(gs) {
    const non = 1 - gs.dealer, A = _cbCount(gs.keep[non], gs.starter), B = _cbCount(gs.keep[gs.dealer], gs.starter), C = _cbCount(gs.crib, gs.starter, true);
    gs.phase = 'show'; gs.show = [[non, 'hand', gs.keep[non], A], [gs.dealer, 'hand', gs.keep[gs.dealer], B], [gs.dealer, 'crib', gs.crib, C]];
    gs.msg = 'The play is over. Now the show: every hand counted with the starter.';
    for (const [who, , , R] of gs.show) if (_cbAdd(gs, who, R.total)) return;
    NK.render('cribbage');
}
function cbNext() { const gs = gameState.cribbage; if (gs.over || gs.phase !== 'show') return; _cbDeal(gs); NK.render('cribbage'); }
function cbNew() { initCribbage(); }
function _cbView(gs) {
    const peg = (v, col) => `<span class="cb-peg" style="left:${v / gs.goal * 100}%;background:${col}"></span>`;
    const board = `<div class="cb-board"><div>You: ${gs.sc[0]} · Computer: ${gs.sc[1]} · Game to ${gs.goal}</div><div class="cb-track" role="img" aria-label="you ${gs.sc[0]}, computer ${gs.sc[1]}">${peg(gs.sc[1], '#1d4ed8')}${peg(gs.sc[0], '#dc2626')}</div></div>`;
    const my = !gs.over && (gs.phase === 'discard' || (gs.phase === 'play' && gs.turn === 0));
    const hand = gs.hands[0].map((c, i) => { const no = gs.phase === 'play' && gs.count + _cbV(c) > 31;
        return `<button type="button" class="nk-cell cb-b${gs.pick.includes(i) ? ' cb-pk' : ''}${no ? ' cb-no' : ''}" onclick="cbCard(${i})" data-k="h${c.r}_${c.s}"${i === 0 ? ' data-first' : ''} aria-label="${_cbName(c)}${gs.pick.includes(i) ? ', picked for the crib' : ''}${no ? ', would pass 31' : ''}"${my ? '' : ' disabled'}>${GameKit.card(c)}</button>`; }).join('');
    const cpu = gs.hands[1].map(() => GameKit.card({ r: 1, s: 0, up: false })).join('');
    const mid = gs.phase === 'discard' ? `<span class="gk-label">Crib: ${gs.dealer === 0 ? 'yours' : "the computer's"}</span>` : `<span role="img" aria-label="starter: ${gs.starter ? _cbName(gs.starter) : 'none'}">${gs.starter ? GameKit.card(gs.starter) : ''}</span><span class="cb-cnt" aria-label="count ${gs.count || 0}">${gs.phase === 'play' ? gs.count : ''}</span><span class="cb-pile">${(gs.pile || []).map((c) => GameKit.card(c)).join('')}</span>`;
    const show = gs.show ? gs.show.map(([who, what, cards, R]) => `<div class="cb-show"><h4>${who === 0 ? 'Your' : "The computer's"} ${what}: ${R.total}</h4><div class="cb-row" style="--w:clamp(34px,9vw,48px);min-height:0">${cards.map((c) => GameKit.card(c)).join('')}</div><ul>${R.parts.length ? R.parts.map(([l, p]) => `<li>${l}: ${p}</li>`).join('') : '<li>nothing to count: 19, as the old players say</li>'}</ul></div>`).join('') : '';
    return `<div class="nk-top"><span>Hand <b>${gs.handNo}</b></span><span>${gs.over ? 'Game over' : gs.phase === 'discard' ? 'Choose your crib cards' : gs.phase === 'play' ? (gs.turn === 0 ? 'Your turn to lay' : "Computer's turn") : 'The show'}</span></div>
      ${board}
      <div class="gk-table cb-t"><div class="cb-row" role="img" aria-label="computer holds ${NK.pl(gs.hands[1].length, 'card')}" style="--w:clamp(30px,8vw,44px);min-height:0">${cpu}</div>
        <div class="cb-mid">${mid}</div><div class="gk-label">Your hand</div><div class="cb-row">${hand}</div></div>
      ${NK.msg(gs.msg)}${show}
      <div class="gk-btns">${gs.phase === 'discard' && !gs.over ? NK.btn('Send to crib', 'cbCrib()', { k: 'crib', cls: 'gk-primary', disabled: gs.pick.length !== 2 }) : ''}${gs.phase === 'show' && !gs.over ? NK.btn('Next hand', 'cbNext()', { k: 'next', cls: 'gk-primary' }) : ''}${NK.btn(NK.icon('rotate-ccw') + 'New game', 'cbNew()', { k: 'restart' })}</div>`;
}
