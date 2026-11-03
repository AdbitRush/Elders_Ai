// ═══════════════════════════════════════════════════════════════════════════════
// GIN RUMMY vs COMPUTER (2026-10, wave 1) — one hand per game, standard rules.
// 10 cards each. On your turn draw (deck or discard pile), then discard one. Melds: sets (3-4 of a rank) and runs
// (3+ in a row, same suit; ace low). Deadwood = cards in no meld (A=1, 2-10 face value, J/Q/K=10).
// Knock when your deadwood is 10 or less; gin = 0. The other player may lay off deadwood on the knocker's melds
// (not on gin). Lower deadwood wins the hand; if the knocker is not lower, it is an undercut. If only two cards are
// left in the deck, the hand is a draw. Your hand is sorted into melds automatically.
// ═══════════════════════════════════════════════════════════════════════════════
function initGinRummy(container) {
    GameKit.css();
    const gs = gameState.ginrummy;
    const d = GameKit.deck();
    gs.me = d.splice(0, 10); gs.cpu = d.splice(0, 10); gs.me.forEach(c => c.up = true);
    const up = d.pop(); up.up = true; gs.disc = [up]; gs.stock = d;
    gs.phase = 'draw'; gs.taken = null; gs.turn = 0; gs.busy = false; gs.over = false; gs.knockAsk = false;
    const lv = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
    gs.cpuKnock = lv === 'easy' ? 3 : lv === 'hard' ? 10 : 7;
    gs.msg = 'Your turn: draw from the deck or take the top discard.';
    _grRender();
}
const _grVal = (c) => Math.min(10, c.r);
// all melds that can be made from these cards (as arrays of card ids)
function _grMelds(cards) {
    const out = [];
    const byR = {}; cards.forEach(c => (byR[c.r] = byR[c.r] || []).push(c));
    for (const r in byR) { const g = byR[r]; if (g.length >= 3) { if (g.length === 4) { out.push(g.map(c => c.id)); for (let x = 0; x < 4; x++) out.push(g.filter((_, i) => i !== x).map(c => c.id)); } else out.push(g.map(c => c.id)); } }
    for (let s = 0; s < 4; s++) {
        const su = cards.filter(c => c.s === s).sort((a, b) => a.r - b.r);
        for (let i = 0; i < su.length; i++) {
            const run = [su[i]];
            for (let j = i + 1; j < su.length && su[j].r === run[run.length - 1].r + 1; j++) { run.push(su[j]); if (run.length >= 3) out.push(run.map(c => c.id)); }
        }
    }
    return out;
}
// the best arrangement: melds chosen to leave the least deadwood
function _grBest(cards) {
    const melds = _grMelds(cards), byId = {}; cards.forEach(c => byId[c.id] = c);
    let best = { dw: cards.reduce((a, c) => a + _grVal(c), 0), melds: [] };
    const rec = (start, used, chosen) => {
        const dw = cards.filter(c => !used.has(c.id)).reduce((a, c) => a + _grVal(c), 0);
        if (dw < best.dw) best = { dw, melds: chosen.slice() };
        for (let i = start; i < melds.length; i++) {
            if (melds[i].some(id => used.has(id))) continue;
            melds[i].forEach(id => used.add(id)); chosen.push(melds[i]);
            rec(i + 1, used, chosen);
            chosen.pop(); melds[i].forEach(id => used.delete(id));
        }
    };
    rec(0, new Set(), []);
    best.melds = best.melds.map(m => m.map(id => byId[id]));
    const inMeld = new Set(best.melds.flat().map(c => c.id));
    best.dead = cards.filter(c => !inMeld.has(c.id));
    return best;
}
// lay off the defender's deadwood onto the knocker's melds (repeat while anything fits)
function _grLayoff(knockMelds, dead) {
    const melds = knockMelds.map(m => m.slice()); let left = dead.slice(), moved = true;
    while (moved) {
        moved = false;
        for (const c of left.slice()) {
            for (const m of melds) {
                const isSet = m.every(x => x.r === m[0].r);
                let fits = false;
                if (isSet) fits = c.r === m[0].r && m.length < 4;
                else { const rs = m.map(x => x.r).sort((a, b) => a - b); fits = c.s === m[0].s && (c.r === rs[0] - 1 || c.r === rs[rs.length - 1] + 1); }
                if (fits) { m.push(c); left = left.filter(x => x.id !== c.id); moved = true; break; }
            }
        }
    }
    return left;
}
function grDraw(from) {
    const gs = gameState.ginrummy; if (gs.turn !== 0 || gs.phase !== 'draw' || gs.over) return;
    let c;
    if (from === 'disc') { c = gs.disc.pop(); gs.taken = c.id; }
    else { c = gs.stock.pop(); gs.taken = null; }
    c.up = true; gs.me.push(c); gs.phase = 'discard'; sfxFlip();
    gs.msg = `You took the ${GameKit.RANKS[c.r]}${GameKit.SUITS[c.s]}. Now tap a card to discard.`;
    _grRender();
}
function grDiscard(id) {
    const gs = gameState.ginrummy; if (gs.turn !== 0 || gs.phase !== 'discard' || gs.over) return;
    if (id === gs.taken) { gs.msg = 'You cannot throw back the card you just took from the pile.'; sfxWrong(); return _grRender(); }
    const i = gs.me.findIndex(c => c.id === id); const c = gs.me.splice(i, 1)[0]; gs.disc.push(c); gs.taken = null; sfxCorrect();
    const b = _grBest(gs.me);
    if (b.dw <= 10) { gs.knockAsk = true; gs.phase = 'knock'; gs.msg = b.dw === 0 ? 'Gin! Your deadwood is 0. Knock now?' : `Your deadwood is ${b.dw}. Knock now, or keep playing?`; return _grRender(); }
    _grToCpu();
}
function grKnock(yes) {
    const gs = gameState.ginrummy; if (gs.phase !== 'knock') return;
    gs.knockAsk = false; if (yes) return _grShowdown(0); _grToCpu();
}
function _grToCpu() {
    const gs = gameState.ginrummy; gs.phase = 'wait'; gs.turn = 1; gs.busy = true;
    if (gs.stock.length <= 2) { gs.over = true; _grRender(); return GameKit.finish('ginrummy', false, 'A draw: the deck ran down to two cards with no knock.'); }
    gs.msg = 'The computer is playing…'; _grRender(); setTimeout(_grCpu, 1000);
}
function _grCpu() {
    const gs = gameState.ginrummy; if (!gameState.active || gameState.currentId !== 'ginrummy' || gs.over) return;
    const top = gs.disc[gs.disc.length - 1];
    const bestAfter = (hand) => { let best = null; for (const c of hand) { const rest = hand.filter(x => x !== c); const b = _grBest(rest); if (!best || b.dw < best.dw) best = { dw: b.dw, c }; } return best; };
    const now = _grBest(gs.cpu).dw;
    const withTop = bestAfter(gs.cpu.concat([top]));
    let took = 'deck', drawn;
    if (withTop && withTop.c !== top && withTop.dw < now) { drawn = gs.disc.pop(); took = 'pile'; }
    else drawn = gs.stock.pop();
    gs.cpu.push(drawn);
    // throw the card whose loss leaves the least deadwood (never the card just taken from the pile); ties: the higher card
    let pick = null;
    for (const c of gs.cpu) {
        if (took === 'pile' && c === drawn) continue;
        const dwx = _grBest(gs.cpu.filter(x => x !== c)).dw;
        if (!pick || dwx < pick.dw || (dwx === pick.dw && _grVal(c) > _grVal(pick.c))) pick = { dw: dwx, c };
    }
    const disc = pick.c;
    gs.cpu = gs.cpu.filter(c => c !== disc); disc.up = true; gs.disc.push(disc);
    const dw = _grBest(gs.cpu).dw;
    gs.msg = `The computer took ${took === 'pile' ? `your ${GameKit.RANKS[drawn.r]}${GameKit.SUITS[drawn.s]} from the pile` : 'a card from the deck'} and threw the ${GameKit.RANKS[disc.r]}${GameKit.SUITS[disc.s]}.`;
    sfxFlip();
    if (dw <= gs.cpuKnock) return _grShowdown(1);
    gs.turn = 0; gs.busy = false; gs.phase = 'draw';
    if (gs.stock.length <= 2) { gs.over = true; _grRender(); return GameKit.finish('ginrummy', false, 'A draw: the deck ran down to two cards with no knock.'); }
    gs.msg += ' Your turn: draw.'; _grRender();
}
function _grShowdown(knocker) {
    const gs = gameState.ginrummy; gs.over = true; gs.busy = false;
    const K = _grBest(knocker === 0 ? gs.me : gs.cpu), D = _grBest(knocker === 0 ? gs.cpu : gs.me);
    const gin = K.dw === 0;
    const dDead = gin ? D.dead : _grLayoff(K.melds, D.dead);
    const dDw = dDead.reduce((a, c) => a + _grVal(c), 0);
    const who = knocker === 0 ? 'You' : 'The computer';
    let meWin, text;
    if (gin) { meWin = knocker === 0; text = `${who} went gin! ${knocker === 0 ? 'The computer' : 'You'} had ${dDw} deadwood.`; }
    else if (K.dw < dDw) { meWin = knocker === 0; text = `${who} knocked with ${K.dw}; ${knocker === 0 ? 'the computer' : 'you'} had ${dDw} after laying off.`; }
    else { meWin = knocker === 1; text = `Undercut! ${who} knocked with ${K.dw}, but ${knocker === 0 ? 'the computer' : 'you'} had only ${dDw}.`; }
    gs.reveal = true; gs.msg = text; _grRender();
    GameKit.finish('ginrummy', meWin, text);
}
function _grRender() {
    const gs = gameState.ginrummy, el = document.getElementById('gameContent');
    if (!el || gameState.currentId !== 'ginrummy') return;
    const C = GameKit.card, b = _grBest(gs.me);
    const canDiscard = gs.turn === 0 && gs.phase === 'discard';
    const cardH = (c) => C(c, { onclick: canDiscard ? `grDiscard(${c.id})` : '', hint: c.id === gs.taken });
    const groups = b.melds.map(m => `<div class="gr-meld">${m.sort((x, y) => x.r - y.r).map(cardH).join('')}</div>`).join('');
    const dead = b.dead.sort((x, y) => x.s - y.s || x.r - y.r).map(cardH).join('');
    const top = gs.disc[gs.disc.length - 1];
    const cpuShow = gs.reveal ? gs.cpu.map(c => (c.up = true, C(c))).join('') : gs.cpu.map(() => C({ up: false }, { down: true })).join('');
    el.innerHTML = `<div class="gk-table gr" dir="ltr">
      <div class="gk-status">${gs.msg}</div>
      <div class="gk-label">Computer: ${gs.cpu.length} cards</div>
      <div class="gk-row gr-cpu">${cpuShow}</div>
      <div class="gk-row gr-mid">
        <div class="gr-pile">${C({ up: false }, { down: true, onclick: gs.turn === 0 && gs.phase === 'draw' ? "grDraw('stock')" : '' })}<div class="gk-label">Deck (${gs.stock.length})</div></div>
        <div class="gr-pile">${top ? C(top, { onclick: gs.turn === 0 && gs.phase === 'draw' ? "grDraw('disc')" : '' }) : C(null)}<div class="gk-label">Discard</div></div>
      </div>
      ${gs.knockAsk ? `<div class="gk-btns">${GameKit.btn(GameKit.icon('hammer') + 'Knock', 'grKnock(true)', { cls: 'gk-primary' })}${GameKit.btn('Keep playing', 'grKnock(false)')}</div>` : ''}
      <div class="gk-label gk-big">Your hand · deadwood ${b.dw}${b.dw <= 10 ? ' (you may knock after discarding)' : ''}</div>
      <div class="gr-hand">${groups}${dead ? `<div class="gr-dead">${dead}</div>` : ''}</div>
    </div>
    <style>.gk-table.gr{--w:clamp(42px,9.6vw,70px)}.gr .gr-cpu .gk-card{--w:28px}.gr .gr-cpu{gap:2px}.gr .gr-mid{gap:24px;margin:12px 0}
    .gr .gr-pile{display:flex;flex-direction:column;align-items:center}
    .gr .gr-hand{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
    .gr .gr-meld{display:flex;gap:3px;padding:5px;border-radius:12px;background:rgba(253,230,138,.22);box-shadow:inset 0 0 0 2px #fde68a}
    .gr .gr-dead{display:flex;gap:3px;flex-wrap:wrap;padding:5px}</style>`;
}
