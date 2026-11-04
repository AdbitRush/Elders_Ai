// ═══════════════════════════════════════════════════════════════════════════════
// CALCULATION (2026-11, nostalgia batch 3) — the patience game of counting in steps, also called Broken Intervals.
// Four foundations start with an Ace, a 2, a 3 and a 4 (any suits). They build up in steps of 1, 2, 3 and 4:
//   A 2 3 4 5 6 7 8 9 10 J Q K  /  2 4 6 8 10 Q A 3 5 7 9 J K  /  3 6 9 Q 2 5 8 J A 4 7 10 K  /  4 8 Q 3 7 J 2 6 10 A 5 9 K
// (after King, count on from Ace again; Jack 11, Queen 12, King 13). Suits never matter. Turn the stock one card at a
// time: each card must go onto a foundation it fits, or onto one of four waste piles. Only the top of a waste pile
// can move, and only to a foundation. Goal: easy 30 cards on the foundations, normal 40, hard all 52 (with no undo).
// ═══════════════════════════════════════════════════════════════════════════════
const _CA_GOAL = { easy: 30, normal: 40, hard: 52 };
const _caRk = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const _caName = (c) => `${['', 'Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'][c.r]} of ${['spades', 'hearts', 'diamonds', 'clubs'][c.s]}`;
function initCalculation() {
    NK.start('calculation', {
        setup(gs, diff) {
            const d = GameKit.deck(); d.forEach((c) => (c.up = true));
            gs.f = [1, 2, 3, 4].map((r) => { const i = d.findIndex((c) => c.r === r); return [d.splice(i, 1)[0]]; });
            gs.stock = d; gs.cur = gs.stock.pop(); gs.w = [[], [], [], []]; gs.sel = 'cur'; gs.hist = []; gs.over = false; gs.diff = diff; gs.goal = _CA_GOAL[diff];
            gs.msg = 'Put the turned card on a foundation it fits, or on a waste pile. Suits never matter.';
        },
        view: _caView,
        keys: { KeyU: () => caUndo(), Digit1: () => caF(0), Digit2: () => caF(1), Digit3: () => caF(2), Digit4: () => caF(3) },
        rules: (gs) => [
            'The four <b>foundations</b> start with an Ace, a 2, a 3 and a 4. Each one counts up in its own steps: by <b>1s</b>, by <b>2s</b>, by <b>3s</b> and by <b>4s</b>. After a King, count on from Ace (Jack 11, Queen 12, King 13).',
            'The little line under each foundation shows the card it needs next. Suits never matter.',
            'Each card turned from the stock must go somewhere: onto a foundation it fits, or onto one of the four <b>waste piles</b>.',
            'Tap <b>Put here</b> under a waste pile to put the turned card there. The top card of a waste pile may move onto a foundation at any time: tap it, then tap the foundation.',
            `Goal for this level: <b>${gs.goal}</b> cards on the foundations${gs.goal === 52 ? ' (every card)' : ''}. ${gs.diff === 'hard' ? 'No undo on this level.' : 'Undo is free.'} No clock. Keys 1-4 send the picked card to a foundation; U undoes.`],
        css: `.ca-t{--w:clamp(44px,13.5vw,74px)}
.ca-row{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;justify-items:center}
.ca-lab{font:800 .9rem system-ui,sans-serif;color:#fde7c4;text-align:center;margin:3px 0 0;line-height:1.25}
.ca-lab b{display:block;font-size:1.15rem;color:#fff}
#gameContent .nk button.ca-b{background:none;border:0;padding:0;--nk-r:9px;display:block}
.ca-b:disabled{cursor:default}
.ca-b.ca-sel .gk-card{outline:4px solid #fbbf24;outline-offset:1px;transform:translateY(-4px)}
.ca-b.ca-fit .gk-card,.ca-b.ca-fit .gk-slot{outline:3px dashed #fde68a;outline-offset:1px}
.ca-w{display:flex;flex-direction:column;align-items:center;min-height:calc(var(--w)*2.2)}
.ca-w .gk-card+.gk-card,.ca-w .gk-card+.ca-b,.ca-w .ca-b+.gk-card{margin-top:calc(var(--w)*-1.08)}
.ca-wc{display:flex;flex-direction:column;align-items:center;gap:6px}
#gameContent .nk .ca-put{min-width:0;padding:6px 8px;font-size:.92rem;min-height:44px}
.ca-mid{display:flex;justify-content:center;align-items:flex-end;gap:18px;margin:12px 0}
.ca-pl{display:flex;flex-direction:column;align-items:center;gap:4px;font-weight:800;color:#fde7c4}
@media (prefers-reduced-motion:reduce){.ca-b.ca-sel .gk-card{transform:none}}`,
    });
}
const _caNeed = (gs, k) => { const f = gs.f[k], t = f[f.length - 1]; return f.length >= 13 ? 0 : ((t.r - 1 + k + 1) % 13) + 1; };
const _caOn = (gs) => gs.f.reduce((a, f) => a + f.length, 0);
const _caSelCard = (gs) => (gs.sel === 'cur' ? gs.cur : typeof gs.sel === 'number' ? gs.w[gs.sel][gs.w[gs.sel].length - 1] : null);
const _caSave = (gs) => { if (gs.diff !== 'hard') gs.hist.push(JSON.stringify([gs.f, gs.stock, gs.cur, gs.w])); };
function _caTurn(gs) { gs.cur = gs.stock.length ? gs.stock.pop() : null; gs.sel = gs.cur ? 'cur' : null; }
function caPick(src) {   // src: 'cur' or a waste pile index
    const gs = gameState.calculation; if (gs.over) return;
    if (typeof src === 'number' && !gs.w[src].length) return;
    gs.sel = gs.sel === src ? (gs.cur ? 'cur' : null) : src;
    const c = _caSelCard(gs); gs.msg = c ? `${_caName(c)} picked. Tap a foundation it fits${gs.sel === 'cur' ? ', or Put here under a waste pile' : ''}.` : '';
    NK.render('calculation');
}
function caW(i) {
    const gs = gameState.calculation; if (gs.over || !gs.cur) return;
    if (gs.sel !== 'cur') { gs.sel = 'cur'; }
    _caSave(gs); gs.w[i].push(gs.cur); const c = gs.cur; _caTurn(gs); if (typeof sfxFlip === 'function') sfxFlip();
    gs.msg = `${_caName(c)} onto waste pile ${i + 1}.`; _caCheck(gs);
}
function caF(k) {
    const gs = gameState.calculation; if (gs.over) return; const c = _caSelCard(gs);
    if (!c) { gs.msg = 'Pick a card first: the turned card or the top of a waste pile.'; return NK.render('calculation'); }
    const need = _caNeed(gs, k);
    if (c.r !== need) { gs.msg = need ? `Foundation ${k + 1} counts by ${k + 1}s and needs a ${_caRk[need]} next, not a ${_caRk[c.r]}.` : `Foundation ${k + 1} is finished.`; if (typeof sfxWrong === 'function') sfxWrong(); return NK.render('calculation'); }
    _caSave(gs); gs.f[k].push(c);
    if (gs.sel === 'cur') _caTurn(gs); else { gs.w[gs.sel].pop(); gs.sel = gs.cur ? 'cur' : null; }
    if (typeof sfxFlip === 'function') sfxFlip();
    gs.msg = `${_caName(c)} onto foundation ${k + 1}.`; _caCheck(gs);
}
function caUndo() { const gs = gameState.calculation; if (gs.over || !gs.hist.length) return; [gs.f, gs.stock, gs.cur, gs.w] = JSON.parse(gs.hist.pop()); gs.sel = gs.cur ? 'cur' : null; gs.msg = 'Last move taken back.'; NK.render('calculation'); }
function _caCheck(gs) {
    const on = _caOn(gs);
    const wasteMoves = gs.w.some((p) => p.length && [0, 1, 2, 3].some((k) => _caNeed(gs, k) === p[p.length - 1].r));
    if (on === 52 || (!gs.cur && !wasteMoves)) {
        gs.over = true; const win = on >= gs.goal;
        gs.msg = on === 52 ? 'All four foundations reach the King!' : `No more moves: ${on} of 52 cards on the foundations.`;
        NK.render('calculation'); if (win && typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('calculation', win, on === 52 ? 'Every card counted home: all 52 on the foundations!' : win ? `${on} of 52 cards on the foundations (goal ${gs.goal}).` : `${on} of 52 cards on the foundations; the goal was ${gs.goal}. A fresh deck is one tap away.`);
    }
    NK.render('calculation');
}
function caNew() { initCalculation(); }
function _caView(gs) {
    const sc = _caSelCard(gs), fits = (k) => sc && _caNeed(gs, k) === sc.r;
    const found = gs.f.map((f, k) => { const t = f[f.length - 1], need = _caNeed(gs, k);
        return `<div><button type="button" class="nk-cell ca-b${fits(k) ? ' ca-fit' : ''}" onclick="caF(${k})" data-k="f${k}"${k === 0 ? ' data-first' : ''} aria-label="foundation ${k + 1}, counts by ${k + 1}s, top ${_caName(t)}, ${need ? 'needs ' + _caRk[need] : 'finished'}"${gs.over ? ' disabled' : ''}>${GameKit.card(t)}</button>
          <div class="ca-lab">by ${k + 1}s<b>${need ? 'next ' + _caRk[need] : 'done'}</b></div></div>`; }).join('');
    const waste = gs.w.map((p, i) => { const s = gs.sel === i;
        const under = p.slice(0, -1).map((c) => GameKit.card(c)).join('');
        const top = p.length ? `<button type="button" class="nk-cell ca-b${s ? ' ca-sel' : ''}" onclick="caPick(${i})" data-k="w${i}" aria-label="waste pile ${i + 1}, top ${_caName(p[p.length - 1])}, ${p.length} cards${s ? ', picked' : ''}"${gs.over ? ' disabled' : ''}>${GameKit.card(p[p.length - 1])}</button>`
            : `<button type="button" class="nk-cell ca-b${gs.sel === 'cur' ? ' ca-fit' : ''}" onclick="caW(${i})" data-k="w${i}" aria-label="waste pile ${i + 1}, empty: put the turned card here"${gs.over || !gs.cur ? ' disabled' : ''}>${GameKit.card(null, { label: String(i + 1) })}</button>`;
        const put = NK.btn('Put here', `caW(${i})`, { k: 'put' + i, cls: 'ca-put', label: `put the turned card on waste pile ${i + 1}`, disabled: gs.over || !gs.cur });
        return `<div class="ca-wc"><div class="ca-w">${under}${top}</div>${put}</div>`; }).join('');
    const cur = gs.cur ? `<button type="button" class="nk-cell ca-b${gs.sel === 'cur' ? ' ca-sel' : ''}" onclick="caPick('cur')" data-k="cur" aria-label="turned card, ${_caName(gs.cur)}${gs.sel === 'cur' ? ', picked' : ''}"${gs.over ? ' disabled' : ''}>${GameKit.card(gs.cur)}</button>` : GameKit.card(null, { label: '' });
    return `<div class="nk-top"><span>On foundations: <b>${_caOn(gs)}</b> of 52 (goal ${gs.goal})</span><span>Stock: <b>${gs.stock.length}</b></span></div>
      <div class="gk-table ca-t"><div class="ca-row">${found}</div>
        <div class="ca-mid"><div class="ca-pl">${GameKit.card(gs.stock.length ? { r: 1, s: 0, up: false } : null, { label: '0' })}Stock</div><div class="ca-pl">${cur}Turned card</div></div>
        <div class="gk-label">Waste piles</div><div class="ca-row">${waste}</div></div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${gs.diff === 'hard' ? '' : NK.btn(NK.icon('undo-2') + 'Undo', 'caUndo()', { k: 'undo', disabled: gs.over || !gs.hist.length })}${NK.btn(NK.icon('rotate-ccw') + 'New deck', 'caNew()', { k: 'restart' })}</div>`;
}
