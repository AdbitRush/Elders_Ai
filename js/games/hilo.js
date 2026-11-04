// ═══════════════════════════════════════════════════════════════════════════════
// HIGH-LOW LADDER (2026-11, nostalgia batch 3) — the kitchen-table guessing game with one deck. A card is face up:
// will the next card be higher or lower? Each right guess climbs one rung of a ten-rung ladder. A card of the same
// rank is a tie and costs nothing. A wrong guess costs a life. Ace is low, King is high.
// Skill: the deck is never reshuffled, so the cards already seen tell you what is left. Easy shows how many higher
// and lower cards remain (3 lives); normal shows the seen cards (3 lives); hard gives no help (2 lives).
// Once per game you may Swap the face-up card for the next one without guessing. No money, no clock.
// ═══════════════════════════════════════════════════════════════════════════════
const _hlRk = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const _hlName = (c) => `${['', 'Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'][c.r]} of ${['spades', 'hearts', 'diamonds', 'clubs'][c.s]}`;
function initHilo() {
    NK.start('hilo', {
        setup(gs, diff) {
            const d = GameKit.deck(); d.forEach((c) => (c.up = true));
            gs.diff = diff; gs.deck = d; gs.cur = d.pop(); gs.seen = [gs.cur]; gs.rung = 0; gs.lives = diff === 'hard' ? 2 : 3; gs.swap = true; gs.over = false; gs.flash = '';
            gs.msg = `The ${_hlName(gs.cur)} is up. Will the next card be higher or lower?`;
        },
        view: _hlView,
        keys: { ArrowUp: () => hlGuess(1), ArrowDown: () => hlGuess(-1), KeyS: () => hlSwap() },
        rules: (gs) => [
            'A card is face up. Guess whether the <b>next card</b> will be <b>higher</b> or <b>lower</b>. Ace is low, King is high.',
            'A right guess climbs one rung. Reach the <b>top of the ladder (10 rungs)</b> to win.',
            `A wrong guess costs a life (you have ${gs.diff === 'hard' ? 2 : 3}). The same rank again is a tie: no rung, no life lost.`,
            'The deck is never reshuffled, so the cards you have seen tell you what is left. ' + (gs.diff === 'easy' ? 'On this level the game counts the higher and lower cards for you.' : gs.diff === 'normal' ? 'On this level the seen cards are listed.' : 'On this level you keep count yourself.'),
            'Once per game, <b>Swap</b> trades the face-up card for the next one without a guess. No money, no clock. Keyboard: Up arrow = higher, Down arrow = lower, S = swap.'],
        css: `.hl-t{--w:clamp(70px,22vw,110px)}
.hl-row{display:flex;align-items:center;justify-content:center;gap:18px}
.hl-lad{display:flex;flex-direction:column-reverse;gap:3px;width:clamp(70px,18vw,96px)}
.hl-rg{height:clamp(14px,3.2vw,22px);border-radius:5px;background:rgba(255,247,230,.14);border:2px solid rgba(255,247,230,.35);font:800 .75rem system-ui,sans-serif;color:#fde7c4;display:flex;align-items:center;justify-content:center}
.hl-rg.hl-on{background:#f59e0b;border-color:#fde68a;color:#2a1700}
.hl-mid{display:flex;flex-direction:column;align-items:center;gap:8px}
.hl-lives{font-weight:800;color:#fde7c4;font-size:1.05rem}
.hl-lives i{display:inline-block;width:14px;height:14px;border-radius:50%;background:#ef4444;margin:0 2px;vertical-align:-2px}
.hl-lives i.hl-off{background:transparent;border:2px solid #fca5a5}
.hl-odds{display:flex;gap:10px;justify-content:center;font-weight:800;color:#fff;margin-top:4px}
.hl-odds span{background:rgba(0,0,0,.25);border-radius:10px;padding:4px 10px}
.hl-seen{display:grid;grid-template-columns:repeat(13,minmax(0,1fr));gap:2px;margin:10px 0 0;font:800 clamp(.62rem,2.6vw,.85rem) system-ui,sans-serif;text-align:center}
.hl-seen span{min-width:0;overflow:hidden;background:rgba(255,247,230,.9);color:#1c1917;border-radius:4px;padding:2px 0}
.hl-seen span.hl-gone{background:rgba(0,0,0,.25);color:rgba(255,247,230,.45);text-decoration:line-through}
.hl-big .gk-btn{min-width:min(9rem,42%);font-size:1.2rem}
.hl-fl{font-weight:900;font-size:1.2rem;min-height:1.6em;text-align:center}
.hl-fl.hl-good{color:#86efac}.hl-fl.hl-bad{color:#fca5a5}`,
    });
}
const _hlCounts = (gs) => { let hi = 0, lo = 0, eq = 0; gs.deck.forEach((c) => (c.r > gs.cur.r ? hi++ : c.r < gs.cur.r ? lo++ : eq++)); return { hi, lo, eq }; };
function hlGuess(dir) {
    const gs = gameState.hilo; if (gs.over) return;
    const prev = gs.cur, next = gs.deck.pop(); gs.cur = next; gs.seen.push(next); if (typeof sfxFlip === 'function') sfxFlip();
    const said = `${_hlName(next)} after the ${_hlName(prev)}`;
    if (next.r === prev.r) { gs.flash = 'Tie'; gs.cls = ''; gs.msg = `${said}: a tie. No rung, no life lost.`; }
    else if ((next.r > prev.r) === (dir > 0)) { gs.rung++; gs.flash = 'Right!'; gs.cls = 'hl-good'; gs.msg = `${said}: right! Up to rung ${gs.rung}.`; if (typeof sfxCorrect === 'function' && gs.rung < 10) { /* quiet climb */ } }
    else { gs.lives--; gs.flash = 'Wrong'; gs.cls = 'hl-bad'; gs.msg = `${said}: not this time. ${NK.pl(gs.lives, 'life', 'lives')} left.`; if (typeof sfxWrong === 'function') sfxWrong(); }
    _hlEnd(gs);
}
function hlSwap() {
    const gs = gameState.hilo; if (gs.over || !gs.swap) return;
    gs.swap = false; const prev = gs.cur; gs.cur = gs.deck.pop(); gs.seen.push(gs.cur); gs.flash = 'Swapped'; gs.cls = '';
    gs.msg = `Swapped the ${_hlName(prev)} for the ${_hlName(gs.cur)}. That was your one swap.`; _hlEnd(gs);
}
function _hlEnd(gs) {
    if (gs.rung >= 10 || gs.lives <= 0 || !gs.deck.length) {
        gs.over = true; const win = gs.rung >= 10;
        gs.msg = win ? 'Top of the ladder!' : gs.lives <= 0 ? `Out of lives on rung ${gs.rung}.` : `The deck ran out on rung ${gs.rung}.`;
        NK.render('hilo'); if (win && typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('hilo', win, win ? `All 10 rungs climbed with ${NK.pl(gs.lives, 'life', 'lives')} to spare, ${gs.seen.length} cards seen.` : `You reached rung ${gs.rung} of 10. A fresh deck is one tap away.`);
    }
    NK.render('hilo');
}
function hlNew() { initHilo(); }
function _hlView(gs) {
    const lad = [...Array(10).keys()].map((k) => `<span class="hl-rg${k < gs.rung ? ' hl-on' : ''}">${k + 1}</span>`).join('');
    const lives = [...Array(gs.diff === 'hard' ? 2 : 3).keys()].map((k) => `<i class="${k < gs.lives ? '' : 'hl-off'}"></i>`).join('');
    const C = _hlCounts(gs);
    const odds = gs.diff === 'easy' && !gs.over ? `<div class="hl-odds" aria-live="off"><span>Higher left: ${C.hi}</span><span>Lower left: ${C.lo}</span><span>Same: ${C.eq}</span></div>` : '';
    const seenCount = {}; gs.seen.forEach((c) => (seenCount[c.r] = (seenCount[c.r] || 0) + 1));
    const seen = gs.diff === 'normal' ? `<div class="gk-label">Cards seen (4 of each rank in a deck)</div><div class="hl-seen">${[...Array(13).keys()].map((k) => { const r = k + 1, n = seenCount[r] || 0; return `<span class="${n >= 4 ? 'hl-gone' : ''}" aria-label="${_hlRk[r]}: ${n} of 4 seen">${_hlRk[r]}<br>${n}/4</span>`; }).join('')}</div>` : '';
    return `<div class="nk-top"><span>Rung: <b>${gs.rung}</b> of 10</span><span>Deck: <b>${gs.deck.length}</b></span></div>
      <div class="gk-table hl-t"><div class="hl-row">
        <div class="hl-lad" role="img" aria-label="ladder: rung ${gs.rung} of 10">${lad}</div>
        <div class="hl-mid"><span role="img" aria-label="face-up card: ${_hlName(gs.cur)}">${GameKit.card(gs.cur)}</span><div class="hl-fl ${gs.cls || ''}" aria-hidden="true">${gs.flash}</div><div class="hl-lives" role="img" aria-label="${NK.pl(gs.lives, 'life', 'lives')} left">Lives ${lives}</div></div>
      </div>${odds}${seen}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns hl-big">${NK.btn(NK.icon('arrow-up') + 'Higher', 'hlGuess(1)', { k: 'hi', cls: 'gk-primary', disabled: gs.over })}${NK.btn(NK.icon('arrow-down') + 'Lower', 'hlGuess(-1)', { k: 'lo', cls: 'gk-primary', disabled: gs.over })}</div>
      <div class="gk-btns">${NK.btn(NK.icon('shuffle') + (gs.swap ? 'Swap (once)' : 'Swap used'), 'hlSwap()', { k: 'swap', disabled: gs.over || !gs.swap })}${NK.btn(NK.icon('rotate-ccw') + 'New deck', 'hlNew()', { k: 'restart' })}</div>`;
}
