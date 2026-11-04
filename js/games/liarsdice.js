// ═══════════════════════════════════════════════════════════════════════════════
// LIAR'S DICE (2026-11, nostalgia batch 3) — the old bluffing dice game, you against two computer players.
// Everyone shakes five dice under a cup and looks only at their own. In turn, each player raises the bid: a claim
// such as "at least four 5s" among ALL the dice on the table. 1s are wild and count as any number. A raise must
// claim more dice, or the same number of a higher face. Instead of raising you may call "Liar!": all cups are
// lifted. If there are fewer dice than claimed, the bidder loses a die; otherwise the caller loses one. Lose all
// your dice and you are out. Last player with dice wins. Easy: the computers bluff badly. Hard: they count well.
// No money, no clock. Bids cannot be made on 1s (they are wild).
// ═══════════════════════════════════════════════════════════════════════════════
const _LD_NM = ['You', 'Hank', 'Dot'];
function initLiarsdice() {
    NK.start('liarsdice', {
        setup(gs, diff) {
            gs.diff = diff; gs.n = [5, 5, 5]; gs.over = false; gs.start = 0; gs.log = [];
            _ldRound(gs, 0);
        },
        view: _ldView,
        keys: { KeyL: () => ldCall() },
        rules: [
            'Everyone has <b>five dice</b> under a cup and sees only their own.',
            'Each turn, raise the <b>bid</b>: a claim like "at least four 5s" among <b>all</b> the dice on the table, yours and everyone else\'s.',
            '<b>1s are wild</b>: they count as any number. Bids are made on 2s to 6s.',
            'A raise must claim <b>more dice</b>, or the <b>same number of a higher face</b>. Or call <b>Liar!</b> on the last bid.',
            'When someone calls Liar, all cups are lifted. Too few dice: the bidder loses a die. Enough dice: the caller loses one. Lose all five and you are out; the last player with dice wins.',
            'Tip: on average a third of the other players\' dice match any face (counting wild 1s). No money, no clock. Keyboard: Tab and Enter, L calls Liar.'],
        css: `.ld-t{background:radial-gradient(ellipse at 50% 30%,#7f1d1d,#450a0a 75%);border-radius:18px;padding:14px;box-shadow:inset 0 0 0 3px #2a0606;color:#fff7e6}
.ld-op{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}
.ld-pl{background:rgba(0,0,0,.25);border-radius:12px;padding:8px;text-align:center;font-weight:800}
.ld-pl.ld-now{box-shadow:0 0 0 3px #fbbf24}
.ld-pl.ld-out{opacity:.45}
.ld-cups{display:flex;gap:4px;justify-content:center;flex-wrap:wrap;margin-top:6px;min-height:34px}
.ld-cup{width:30px;height:30px;border-radius:6px;background:#a16207;box-shadow:inset 0 -4px 0 rgba(0,0,0,.3)}
.ld-sm{width:32px;height:32px;background:#fffdf7;border-radius:7px;padding:2px;border:2px solid #78350f}
.ld-sm.ld-hit{box-shadow:0 0 0 3px #4ade80}
.ld-mine{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.ld-big{width:clamp(48px,13vw,62px);height:clamp(48px,13vw,62px);background:#fffdf7;border-radius:12px;padding:5px;border:3px solid #78350f;box-shadow:0 3px 0 #451a03}
.ld-big.ld-hit{box-shadow:0 0 0 4px #4ade80}
.ld-bid{text-align:center;font:900 1.35rem Georgia,serif;margin:10px 0 4px;color:#fde68a}
.ld-ctl{display:flex;flex-direction:column;align-items:center;gap:8px;margin-top:10px}
.ld-q{display:flex;align-items:center;gap:10px;font:900 1.6rem Georgia,serif}
.ld-faces{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
#gameContent .nk button.ld-f{width:52px;height:52px;padding:4px;border-radius:12px;border:3px solid #d6d3d1;background:#fffdf7;--nk-r:12px;--nk-bw:3px}
.ld-f.ld-on{border-color:#f59e0b;box-shadow:0 0 0 3px #fde68a}
.ld-f svg,.ld-sm svg,.ld-big svg{width:100%;height:100%;display:block}`,
    });
}
const _ldFace = (v) => `<svg viewBox="0 0 100 100" aria-hidden="true">${({ 1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[26, 26], [50, 50], [74, 74]], 4: [[28, 28], [72, 28], [28, 72], [72, 72]], 5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]], 6: [[28, 24], [72, 24], [28, 50], [72, 50], [28, 76], [72, 76]] })[v].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="${v === 1 ? '#b91c1c' : '#1c1917'}"/>`).join('')}</svg>`;
const _ldWord = (q, f) => `${q} ${['', 'one', 'two', 'three', 'four', 'five', 'six'][f]}${q === 1 ? '' : f === 6 ? 'es' : 's'}`.replace('sixs', 'sixes');
function _ldRound(gs, first) {
    gs.d = gs.n.map((k) => [...Array(k)].map(() => 1 + Math.floor(Math.random() * 6)).sort());
    gs.bid = null; gs.turn = first; gs.reveal = null; gs.q = 1; gs.f = 2;
    while (!gs.n[gs.turn]) gs.turn = (gs.turn + 1) % 3;
    gs.msg = (gs.msg ? gs.msg + ' ' : '') + `New round. ${gs.turn === 0 ? 'You bid first.' : `${_LD_NM[gs.turn]} bids first.`}`;
    if (gs.turn !== 0) NK.after(1100, _ldCpu);
}
const _ldTotal = (gs) => gs.n.reduce((a, b) => a + b, 0);
const _ldCount = (gs, f) => gs.d.flat().filter((v) => v === f || v === 1).length;
const _ldHigher = (b, q, f) => !b || q > b.q || (q === b.q && f > b.f);
function _ldNextP(gs, p) { let q = p; do q = (q + 1) % 3; while (!gs.n[q]); return q; }
function ldQ(dq) { const gs = gameState.liarsdice; if (gs.over || gs.turn !== 0) return; gs.q = Math.max(1, Math.min(_ldTotal(gs), gs.q + dq)); NK.render('liarsdice'); }
function ldF(f) { const gs = gameState.liarsdice; if (gs.over || gs.turn !== 0) return; gs.f = f; NK.render('liarsdice'); }
function ldBid() {
    const gs = gameState.liarsdice; if (gs.over || gs.turn !== 0) return;
    if (!_ldHigher(gs.bid, gs.q, gs.f)) { gs.msg = `Your bid must beat ${_ldWord(gs.bid.q, gs.bid.f)}: more dice, or the same number of a higher face.`; if (typeof sfxWrong === 'function') sfxWrong(); return NK.render('liarsdice'); }
    gs.bid = { q: gs.q, f: gs.f, p: 0 }; if (typeof sfxFlip === 'function') sfxFlip();
    gs.msg = `You bid ${_ldWord(gs.q, gs.f)}.`; gs.turn = _ldNextP(gs, 0); NK.render('liarsdice'); NK.after(1200, _ldCpu);
}
function ldCall() { const gs = gameState.liarsdice; if (gs.over || gs.turn !== 0 || !gs.bid) return; _ldShow(gs, 0); }
function _ldShow(gs, caller) {
    const b = gs.bid, have = _ldCount(gs, b.f), loser = have >= b.q ? caller : b.p;
    gs.reveal = { f: b.f, have, loser }; gs.n[loser]--; if (typeof sfxFlip === 'function') sfxFlip();
    gs.msg = `${_LD_NM[caller]} ${caller === 0 ? 'call' : 'calls'} "Liar!" on ${_ldWord(b.q, b.f)}. There ${have === 1 ? 'is' : 'are'} ${have} (wild 1s included). ${_LD_NM[loser]} ${loser === 0 ? 'lose' : 'loses'} a die.`;
    if (loser === 0 && typeof sfxWrong === 'function') sfxWrong();
    if (!gs.n[0]) { gs.over = true; gs.turn = -1; NK.render('liarsdice'); return NK.finish('liarsdice', false, 'Your last die is gone. A new game is one tap away.'); }
    if (gs.n.filter(Boolean).length === 1) { gs.over = true; gs.turn = -1; gs.msg += ' You are the last player with dice. You win!'; NK.render('liarsdice'); if (typeof sfxCorrect === 'function') sfxCorrect(); return NK.finish('liarsdice', true, `Last player standing with ${NK.pl(gs.n[0], 'die', 'dice')} left.`); }
    gs.turn = -2; NK.render('liarsdice');
}
function ldNext() { const gs = gameState.liarsdice; if (gs.over || gs.turn !== -2) return; const l = gs.reveal.loser; gs.msg = ''; _ldRound(gs, gs.n[l] ? l : _ldNextP(gs, l)); NK.render('liarsdice'); }
function _ldCpu() {
    const gs = gameState.liarsdice; if (gs.over || gs.turn <= 0) return; const p = gs.turn, mine = gs.d[p], others = _ldTotal(gs) - mine.length;
    const est = (f) => mine.filter((v) => v === f || v === 1).length + others / 3;
    const b = gs.bid, margin = gs.diff === 'easy' ? 1.6 : gs.diff === 'hard' ? 0.4 : 0.9;
    if (b && b.q > est(b.f) + margin) return _ldShow(gs, p);
    // raise: the face it holds most of, at the lowest legal quantity; sometimes a small bluff
    let best = null;
    for (let f = 2; f <= 6; f++) { let q = b ? (f > b.f ? b.q : b.q + 1) : Math.max(1, Math.floor(est(f) - 0.5)); const conf = est(f) - q; if (!best || conf > best.conf) best = { q, f, conf }; }
    if (b && best.conf < -margin - (gs.diff === 'easy' ? 1 : 0.3)) return _ldShow(gs, p);
    if (gs.diff === 'easy' && Math.random() < 0.3) best.q += 1;
    gs.bid = { q: best.q, f: best.f, p }; if (typeof sfxFlip === 'function') sfxFlip();
    gs.msg = `${_LD_NM[p]} bids ${_ldWord(best.q, best.f)}.`; gs.turn = _ldNextP(gs, p);
    if (gs.turn === 0) { gs.q = gs.bid.q; gs.f = gs.bid.f; gs.msg += ' Raise, or call Liar!'; return NK.render('liarsdice'); }
    NK.render('liarsdice'); NK.after(1200, _ldCpu);
}
function ldNew() { initLiarsdice(); }
function _ldView(gs) {
    const my = gs.turn === 0 && !gs.over, R = gs.reveal && gs.turn === -2 ? gs.reveal : null, hit = (v) => R && (v === R.f || v === 1);
    const op = [1, 2].map((p) => `<div class="ld-pl${gs.turn === p ? ' ld-now' : ''}${gs.n[p] ? '' : ' ld-out'}"><div>${_LD_NM[p]}: ${gs.n[p] ? NK.pl(gs.n[p], 'die', 'dice') : 'out'}</div><div class="ld-cups" role="img" aria-label="${_LD_NM[p]}'s dice${R || gs.over ? ': ' + gs.d[p].join(', ') : ', hidden'}">${(R || gs.over ? gs.d[p].map((v) => `<span class="ld-sm${hit(v) ? ' ld-hit' : ''}">${_ldFace(v)}</span>`) : gs.d[p].map(() => '<span class="ld-cup"></span>')).join('')}</div></div>`).join('');
    const mine = gs.d[0].map((v) => `<span class="ld-big${hit(v) ? ' ld-hit' : ''}">${_ldFace(v)}</span>`).join('');
    const bid = gs.bid ? `${gs.bid.p === 0 ? 'Your' : _LD_NM[gs.bid.p] + "'s"} bid: ${_ldWord(gs.bid.q, gs.bid.f)}` : 'No bid yet';
    const ctl = my ? `<div class="ld-ctl"><div class="ld-q">${NK.btn('−', 'ldQ(-1)', { k: 'qm', label: 'one fewer' })}<span aria-live="off">${gs.q}</span>${NK.btn('+', 'ldQ(1)', { k: 'qp', label: 'one more' })}</div>
        <div class="ld-faces" role="group" aria-label="face to bid">${[2, 3, 4, 5, 6].map((f) => `<button type="button" class="nk-cell ld-f${gs.f === f ? ' ld-on' : ''}" onclick="ldF(${f})" data-k="f${f}" aria-label="${f}s" aria-pressed="${gs.f === f}">${_ldFace(f)}</button>`).join('')}</div></div>` : '';
    return `<div class="nk-top"><span>Dice on the table: <b>${_ldTotal(gs)}</b></span><span>${gs.over ? 'Game over' : my ? 'Your turn' : gs.turn === -2 ? 'Cups lifted' : `${_LD_NM[gs.turn]}'s turn`}</span></div>
      <div class="ld-t"><div class="ld-op">${op}</div><div class="ld-bid">${bid}</div><div class="gk-label">Your dice (${gs.n[0]})</div><div class="ld-mine" role="img" aria-label="your dice: ${gs.d[0].join(', ')}">${mine}</div></div>
      ${ctl}${NK.msg(gs.msg)}
      <div class="gk-btns">${my ? NK.btn(`Bid ${_ldWord(gs.q, gs.f)}`, 'ldBid()', { k: 'bid', cls: 'gk-primary' }) + NK.btn('Liar!', 'ldCall()', { k: 'liar', disabled: !gs.bid }) : ''}${gs.turn === -2 && !gs.over ? NK.btn('Next round', 'ldNext()', { k: 'next', cls: 'gk-primary' }) : ''}${NK.btn(NK.icon('rotate-ccw') + 'New game', 'ldNew()', { k: 'restart' })}</div>`;
}
