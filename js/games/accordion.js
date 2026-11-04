// ═══════════════════════════════════════════════════════════════════════════════
// ACCORDION (2026-11, nostalgia batch 3) — the old patience game that folds a long row of cards into a few piles.
// Deal cards one at a time into a row. A pile may jump onto the pile right before it, or onto the pile three places
// before it, when their top cards match in suit or in rank. The whole pile moves, so the row closes up like an
// accordion. Folding the deck into one pile is the legend; the goal here depends on the level: easy 12 piles or
// fewer, normal 8 or fewer, hard 5 or fewer. Undo is free on easy and normal. No clock.
// ═══════════════════════════════════════════════════════════════════════════════
const _AC_GOAL = { easy: 12, normal: 8, hard: 5 };
const _acName = (c) => `${['', 'Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'][c.r]} of ${['spades', 'hearts', 'diamonds', 'clubs'][c.s]}`;
function initAccordion() {
    NK.start('accordion', {
        setup(gs, diff) {
            const d = GameKit.deck(); d.forEach((c) => (c.up = true));
            gs.diff = diff; gs.goal = _AC_GOAL[diff]; gs.stock = d; gs.row = []; gs.sel = -1; gs.hist = []; gs.over = false; gs.glow = diff === 'easy';
            for (let k = 0; k < 4; k++) gs.row.push([gs.stock.pop()]);
            gs.msg = 'Tap a pile, then the pile 1 or 3 places before it, if the top cards share a suit or a rank. Tap Deal for the next card.';
        },
        view: _acView,
        keys: { KeyD: () => acDeal(), KeyU: () => acUndo() },
        rules: (gs) => [
            'Cards are dealt one at a time into a long row. Each card starts its own <b>pile</b>; only the top card of a pile counts.',
            'A pile may jump onto the pile <b>right before it</b>, or onto the pile <b>three places before it</b>, if their top cards have the <b>same suit</b> or the <b>same rank</b>.',
            'The whole pile moves, and the row closes up. Keep dealing until the deck is used, folding the row as you go.',
            `Goal for this level: finish with <b>${gs.goal} piles or fewer</b>. One single pile is the old legend.`,
            `${gs.diff === 'hard' ? 'No undo on this level.' : 'Undo is free.'} No clock. Keyboard: arrow keys and Enter, D deals, U undoes.`],
        css: `.ac-t{--w:clamp(38px,11vw,64px)}
.ac-row{display:flex;flex-wrap:wrap;gap:8px 5px;justify-content:center;padding:4px 0 8px}
#gameContent .nk button.ac-b{background:none;border:0;padding:0;--nk-r:9px;display:block;position:relative}
.ac-b:disabled{cursor:default}
.ac-b.ac-sel .gk-card{outline:4px solid #fbbf24;outline-offset:1px;transform:translateY(-4px)}
.ac-b.ac-to .gk-card{outline:3px dashed #fde68a;outline-offset:1px}
.ac-n{position:absolute;right:-4px;bottom:-6px;min-width:22px;height:22px;border-radius:11px;background:#1e3a8a;color:#fff;font:800 .8rem system-ui,sans-serif;display:flex;align-items:center;justify-content:center;padding:0 4px;box-shadow:0 0 0 2px #fde7c4}
.ac-mid{display:flex;justify-content:center;align-items:center;gap:14px;margin-top:4px;font-weight:800;color:#fde7c4}
@media (prefers-reduced-motion:reduce){.ac-b.ac-sel .gk-card{transform:none}}`,
    });
}
const _acTop = (p) => p[p.length - 1];
const _acOk = (a, b) => a.r === b.r || a.s === b.s;
function _acTargets(gs, i) { return [i - 1, i - 3].filter((j) => j >= 0 && _acOk(_acTop(gs.row[i]), _acTop(gs.row[j]))); }
function _acAnyMove(gs) { return gs.row.some((_, i) => _acTargets(gs, i).length); }
function acTap(i) {
    const gs = gameState.accordion; if (gs.over) return;
    if (gs.sel < 0) {
        const t = _acTargets(gs, i); gs.sel = i;
        gs.msg = t.length ? `${_acName(_acTop(gs.row[i]))} picked. Tap the dashed pile${t.length > 1 ? ' you want' : ''} to put it on.` : `${_acName(_acTop(gs.row[i]))} picked, but it matches neither the pile before it nor the one three before. Tap it again to let go.`;
        return NK.render('accordion');
    }
    if (gs.sel === i) { gs.sel = -1; gs.msg = ''; return NK.render('accordion'); }
    const from = gs.sel;
    if (!_acTargets(gs, from).includes(i)) {
        const d = from - i;
        gs.msg = d !== 1 && d !== 3 ? 'A pile can only go onto the pile 1 or 3 places before it.' : `${_acName(_acTop(gs.row[from]))} and ${_acName(_acTop(gs.row[i]))} share neither a suit nor a rank.`;
        if (typeof sfxWrong === 'function') sfxWrong(); gs.sel = -1; return NK.render('accordion');
    }
    if (gs.diff !== 'hard') gs.hist.push(JSON.stringify([gs.row, gs.stock]));
    const mover = gs.row[from]; gs.row[i] = gs.row[i].concat(mover); gs.row.splice(from, 1); gs.sel = -1;
    if (typeof sfxFlip === 'function') sfxFlip();
    gs.msg = `${_acName(_acTop(mover))} jumped ${from - i === 1 ? 'one place' : 'three places'}. ${NK.pl(gs.row.length, 'pile')} now.`;
    _acCheck(gs);
}
function acDeal() {
    const gs = gameState.accordion; if (gs.over) return;
    if (!gs.stock.length) { gs.msg = 'The deck is all dealt.'; return NK.render('accordion'); }
    if (gs.diff !== 'hard') gs.hist.push(JSON.stringify([gs.row, gs.stock]));
    gs.row.push([gs.stock.pop()]); gs.sel = -1; if (typeof sfxFlip === 'function') sfxFlip();
    gs.msg = `Dealt the ${_acName(_acTop(gs.row[gs.row.length - 1]))}.`; _acCheck(gs);
}
function acUndo() { const gs = gameState.accordion; if (gs.over || !gs.hist.length) return; [gs.row, gs.stock] = JSON.parse(gs.hist.pop()); gs.sel = -1; gs.msg = 'Last move taken back.'; NK.render('accordion'); }
function _acCheck(gs) {
    if (!gs.stock.length && !_acAnyMove(gs)) {
        gs.over = true; const n = gs.row.length, win = n <= gs.goal;
        gs.msg = n === 1 ? 'The whole deck in one pile: the legend!' : `No more moves: ${NK.pl(n, 'pile')} (goal ${gs.goal} or fewer).`;
        NK.render('accordion'); if (win && typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('accordion', win, win ? `The deck folded into ${NK.pl(n, 'pile')}${n === 1 ? ': the legend!' : ` (goal ${gs.goal} or fewer).`}` : `${NK.pl(n, 'pile')} left; the goal was ${gs.goal} or fewer. A fresh deck is one tap away.`);
    }
    NK.render('accordion');
}
function acGlow() { const gs = gameState.accordion; gs.glow = !gs.glow; NK.render('accordion'); }
function acNew() { initAccordion(); }
function _acView(gs) {
    const to = gs.sel >= 0 ? _acTargets(gs, gs.sel) : [], movable = gs.glow && gs.sel < 0 ? gs.row.map((_, i) => _acTargets(gs, i).length > 0) : [];
    const piles = gs.row.map((p, i) => { const c = _acTop(p), s = gs.sel === i;
        return `<button type="button" class="nk-cell ac-b${s ? ' ac-sel' : ''}${to.includes(i) || movable[i] ? ' ac-to' : ''}" onclick="acTap(${i})" data-k="p${i}"${i === 0 ? ' data-first' : ''} aria-label="pile ${i + 1}: ${_acName(c)}${p.length > 1 ? `, ${p.length} cards` : ''}${s ? ', picked' : to.includes(i) ? ', can take the picked pile' : movable[i] ? ', can move' : ''}"${gs.over ? ' disabled' : ''}>${GameKit.card(c)}${p.length > 1 ? `<span class="ac-n" aria-hidden="true">${p.length}</span>` : ''}</button>`; }).join('');
    return `<div class="nk-top"><span>Piles: <b>${gs.row.length}</b> (goal ${gs.goal})</span><span>Deck: <b>${gs.stock.length}</b></span></div>
      <div class="gk-table ac-t"><div class="ac-row">${piles}</div>
        <div class="ac-mid">${NK.btn('Deal a card', 'acDeal()', { k: 'deal', cls: 'gk-primary', disabled: gs.over || !gs.stock.length })}<span>${gs.stock.length} left in the deck</span></div></div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${gs.diff === 'hard' ? '' : NK.btn(NK.icon('undo-2') + 'Undo', 'acUndo()', { k: 'undo', disabled: gs.over || !gs.hist.length })}${NK.btn(gs.glow ? 'Hide moves' : 'Show moves', 'acGlow()', { k: 'hint', pressed: gs.glow })}${NK.btn(NK.icon('rotate-ccw') + 'New deck', 'acNew()', { k: 'restart' })}</div>`;
}
