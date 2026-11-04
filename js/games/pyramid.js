// ═══════════════════════════════════════════════════════════════════════════════
// PYRAMID SOLITAIRE (2026-11, nostalgia batch 3) — 28 cards dealt face up in a pyramid of seven rows. Remove pairs of
// uncovered cards that add up to 13 (Ace 1, Jack 11, Queen 12); a King is 13 on its own. A card is uncovered when no
// card in the row below overlaps it. The stock turns one card at a time onto a waste pile, whose top card can pair
// too. Easy: three passes through the stock, uncovered pairs glow, goal 10 cards or fewer left. Normal: three passes, goal 5. Hard: two passes, goal 2.
// Clearing the whole pyramid is the best result. Undo is free. No clock.
// Pyramid index: row r (0..6) has r+1 cards; card (r, i) is covered by (r+1, i) and (r+1, i+1).
// ═══════════════════════════════════════════════════════════════════════════════
const _pyV = (c) => c.r;   // Ace 1 ... King 13
function initPyramid() {
    NK.start('pyramid', {
        setup(gs, diff) {
            const d = GameKit.deck(); d.forEach((c) => (c.up = true));
            gs.diff = diff; gs.pyr = [...Array(7).keys()].map((r) => d.splice(0, r + 1)); gs.stock = d; gs.waste = []; gs.passes = diff === 'hard' ? 2 : 3; gs.pass = 1; gs.goal = diff === 'easy' ? 10 : diff === 'hard' ? 2 : 5;
            gs.sel = null; gs.hist = []; gs.over = false; gs.glow = diff === 'easy';
            gs.msg = 'Tap two uncovered cards that add up to 13. A King goes away by itself.';
        },
        view: _pyView,
        keys: { KeyD: () => pyDraw(), KeyU: () => pyUndo() },
        rules: (gs) => [
            'Remove cards in <b>pairs that add up to 13</b>: Ace and Queen, 2 and Jack, 3 and 10, 4 and 9, 5 and 8, 6 and 7. A <b>King</b> (13) goes away on its own.',
            'Only <b>uncovered</b> cards can be used: no card from the row below may lie on top of them.',
            'Tap the stock to turn a card onto the waste pile. The top card of the waste pile can pair with an uncovered card.',
            `When the stock runs out you may turn the waste pile over and go through it again: ${gs.passes === 1 ? 'one pass in all on this level' : gs.passes === 2 ? 'two passes in all on this level' : 'three passes in all'}.`,
            `Goal: ${gs.goal ? `leave <b>${gs.goal} or fewer</b> cards in the pyramid` : 'clear the <b>whole pyramid</b>'}. Undo is free.`, 'No clock. Keyboard: arrow keys and Enter, D turns a card, U undoes.'],
        css: `.py-t{--w:clamp(34px,10.4vw,64px)}
.py-p{display:flex;flex-direction:column;align-items:center;margin:2px 0 10px}
.py-r{display:flex;gap:3px;justify-content:center}
.py-r+.py-r{margin-top:calc(var(--w)*-0.78)}
.py-gap{width:var(--w);height:calc(var(--w)*1.4);flex:0 0 auto}
#gameContent .nk button.py-b{background:none;border:0;padding:0;--nk-r:9px;display:block;flex:0 0 auto}
.py-b:disabled{cursor:default}
.py-b.py-cov .gk-card{filter:brightness(.82)}
.py-b.py-glow .gk-card{outline:3px dashed #fde68a;outline-offset:1px}
.py-b.py-sel .gk-card{outline:4px solid #fbbf24;outline-offset:1px;transform:translateY(-4px)}
.py-mid{display:flex;justify-content:center;gap:24px;align-items:flex-end}
.py-pl{display:flex;flex-direction:column;align-items:center;gap:4px;font-weight:800;color:#fde7c4}
@media (prefers-reduced-motion:reduce){.py-b.py-sel .gk-card{transform:none}}`,
    });
}
const _pyFree = (gs, r, i) => gs.pyr[r][i] && (r === 6 || (!gs.pyr[r + 1][i] && !gs.pyr[r + 1][i + 1]));
// the cards you can use right now, as references: ['p', r, i] or ['w']
function _pyAvail(gs) { const out = []; gs.pyr.forEach((row, r) => row.forEach((c, i) => { if (_pyFree(gs, r, i)) out.push(['p', r, i]); })); if (gs.waste.length) out.push(['w']); return out; }
const _pyCard = (gs, ref) => (ref[0] === 'w' ? gs.waste[gs.waste.length - 1] : gs.pyr[ref[1]][ref[2]]);
const _pySame = (a, b) => a && b && a.join() === b.join();
const _pyName = (c) => `${['', 'Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'][c.r]} of ${['spades', 'hearts', 'diamonds', 'clubs'][c.s]}`;
function _pyPairs(gs) { const a = _pyAvail(gs), out = []; a.forEach((x, i) => { const cx = _pyCard(gs, x); if (cx.r === 13) out.push([x]); for (let j = i + 1; j < a.length; j++) if (cx.r + _pyCard(gs, a[j]).r === 13) out.push([x, a[j]]); }); return out; }
function pyTap(ref) {
    const gs = gameState.pyramid; if (gs.over) return; const c = _pyCard(gs, ref);
    if (ref[0] === 'p' && !_pyFree(gs, ref[1], ref[2])) { gs.msg = 'That card is still covered by the row below.'; return NK.render('pyramid'); }
    if (c.r === 13) return _pyRemove(gs, [ref], `The ${_pyName(c)} goes away on its own.`);
    if (!gs.sel) { gs.sel = ref; gs.msg = `${_pyName(c)} picked: it needs a ${['', 'Queen', 'Jack', '10', '9', '8', '7', '6', '5', '4', '3', '2', 'Ace'][c.r]}.`; return NK.render('pyramid'); }
    if (_pySame(gs.sel, ref)) { gs.sel = null; gs.msg = ''; return NK.render('pyramid'); }
    const a = _pyCard(gs, gs.sel);
    if (a.r + c.r !== 13) { gs.msg = `${_pyName(a)} and ${_pyName(c)} make ${a.r + c.r}, not 13.`; gs.sel = ref; if (typeof sfxWrong === 'function') sfxWrong(); return NK.render('pyramid'); }
    _pyRemove(gs, [gs.sel, ref], `${_pyName(a)} and ${_pyName(c)} make 13.`);
}
function _pyRemove(gs, refs, said) {
    gs.hist.push(JSON.stringify([gs.pyr, gs.stock, gs.waste, gs.pass]));
    // take the waste card last so the indexes of pyramid cards stay put
    refs.forEach((x) => { if (x[0] === 'p') gs.pyr[x[1]][x[2]] = null; }); if (refs.some((x) => x[0] === 'w')) gs.waste.pop();
    gs.sel = null; if (typeof sfxFlip === 'function') sfxFlip(); gs.msg = said; _pyCheck(gs);
}
function pyDraw() {
    const gs = gameState.pyramid; if (gs.over) return; gs.sel = null;
    if (!gs.stock.length) {
        if (gs.pass >= gs.passes || !gs.waste.length) { gs.msg = 'The stock is used up.'; return NK.render('pyramid'); }
        gs.hist.push(JSON.stringify([gs.pyr, gs.stock, gs.waste, gs.pass])); gs.stock = gs.waste.reverse(); gs.waste = []; gs.pass++; gs.msg = `Waste pile turned over: pass ${gs.pass} of ${gs.passes}.`; return NK.render('pyramid');
    }
    gs.hist.push(JSON.stringify([gs.pyr, gs.stock, gs.waste, gs.pass])); gs.waste.push(gs.stock.pop()); if (typeof sfxFlip === 'function') sfxFlip();
    gs.msg = `Turned the ${_pyName(gs.waste[gs.waste.length - 1])}.`; _pyCheck(gs);
}
function pyUndo() { const gs = gameState.pyramid; if (gs.over || !gs.hist.length) return; [gs.pyr, gs.stock, gs.waste, gs.pass] = JSON.parse(gs.hist.pop()); gs.sel = null; gs.msg = 'Last move taken back.'; NK.render('pyramid'); }
function _pyLeft(gs) { return gs.pyr.flat().filter(Boolean).length; }
function _pyCheck(gs) {
    const left = _pyLeft(gs);
    const stuck = !_pyPairs(gs).length && !gs.stock.length && (gs.pass >= gs.passes || !gs.waste.length);
    if (!left || stuck) {
        gs.over = true; gs.msg = !left ? 'The pyramid is cleared!' : `No more moves. ${NK.pl(left, 'card')} left in the pyramid.`;
        const win = left <= gs.goal; NK.render('pyramid'); if (win && typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('pyramid', win, !left ? `Pyramid cleared on pass ${gs.pass} of ${gs.passes}!` : win ? `Only ${NK.pl(left, 'card')} left: inside the goal of ${gs.goal}.` : `${NK.pl(left, 'card')} left in the pyramid (goal: ${gs.goal || 'clear it'}). A fresh deal is one tap away.`);
    }
    NK.render('pyramid');
}
function pyGlow() { const gs = gameState.pyramid; gs.glow = !gs.glow; NK.render('pyramid'); }
function pyNew() { initPyramid(); }
function _pyView(gs) {
    const glow = gs.glow ? _pyPairs(gs).flat() : [], has = (ref) => glow.some((x) => _pySame(x, ref));
    const rows = gs.pyr.map((row, r) => `<div class="py-r">${row.map((c, i) => {
        if (!c) return '<span class="py-gap"></span>';
        const free = _pyFree(gs, r, i), ref = ['p', r, i], sel = _pySame(gs.sel, ref);
        return `<button type="button" class="nk-cell py-b${free ? '' : ' py-cov'}${sel ? ' py-sel' : ''}${has(ref) && !sel ? ' py-glow' : ''}" onclick="pyTap(['p',${r},${i}])" data-k="p${r}_${i}"${r === 0 ? ' data-first' : ''} aria-label="row ${r + 1}, ${_pyName(c)}${free ? '' : ', covered'}${sel ? ', picked' : ''}"${gs.over || !free ? ' disabled' : ''}>${GameKit.card(c)}</button>`;
    }).join('')}</div>`).join('');
    const top = gs.waste[gs.waste.length - 1], wsel = _pySame(gs.sel, ['w']);
    const stockLab = gs.stock.length ? `stock, ${NK.pl(gs.stock.length, 'card')}` : gs.pass < gs.passes && gs.waste.length ? 'stock empty: tap to turn the waste pile over' : 'stock used up';
    const stock = `<button type="button" class="nk-cell py-b" onclick="pyDraw()" data-k="stock" aria-label="${stockLab}"${gs.over || (!gs.stock.length && (gs.pass >= gs.passes || !gs.waste.length)) ? ' disabled' : ''}>${gs.stock.length ? GameKit.card({ r: 1, s: 0, up: false }) : GameKit.card(null, { label: gs.pass < gs.passes && gs.waste.length ? '↻' : '' })}</button>`;
    const waste = top ? `<button type="button" class="nk-cell py-b${wsel ? ' py-sel' : ''}${has(['w']) && !wsel ? ' py-glow' : ''}" onclick="pyTap(['w'])" data-k="waste" aria-label="waste pile, ${_pyName(top)}${wsel ? ', picked' : ''}"${gs.over ? ' disabled' : ''}>${GameKit.card(top)}</button>` : GameKit.card(null, { label: '' });
    return `<div class="nk-top"><span>Pyramid: <b>${_pyLeft(gs)}</b> of 28 left</span><span>Goal: <b>${gs.goal ? gs.goal + ' or fewer' : 'clear it'}</b></span><span>Pass <b>${gs.pass}</b> of ${gs.passes}</span></div>
      <div class="gk-table py-t"><div class="py-p">${rows}</div>
        <div class="py-mid"><div class="py-pl">${stock}Stock (${gs.stock.length})</div><div class="py-pl">${waste}Waste</div></div></div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('undo-2') + 'Undo', 'pyUndo()', { k: 'undo', disabled: gs.over || !gs.hist.length })}${NK.btn(gs.glow ? 'Hide pairs' : 'Show pairs', 'pyGlow()', { k: 'hint', pressed: gs.glow })}${NK.btn(NK.icon('rotate-ccw') + 'New deal', 'pyNew()', { k: 'restart' })}</div>`;
}
