// ═══════════════════════════════════════════════════════════════════════════════
// GO FISH vs COMPUTER (2026-10, wave 1) — 7 cards each. On your turn ask for a rank you hold (tap one of its cards).
// If the computer has any, it hands them all over and you go again. If not: "Go fish!" - draw a card; if it is the
// rank you asked for, you go again. Four of a kind make a book. When a hand runs empty it draws a card (if any left).
// The game ends when all 13 books are made; more books wins. The computer remembers what you asked for (Normal/Hard).
// ═══════════════════════════════════════════════════════════════════════════════
function initGoFish(container) {
    GameKit.css();
    const gs = gameState.gofish;
    const d = GameKit.deck();
    gs.me = d.splice(0, 7); gs.cpu = d.splice(0, 7); gs.stock = d; gs.me.forEach(c => c.up = true);
    gs.books = [[], []]; gs.asked = []; gs.turn = 0; gs.busy = false; gs.over = false;
    const lv = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal'; gs.memory = lv === 'easy' ? 0 : lv === 'hard' ? 1 : .6;
    _gfBooks(0); _gfBooks(1);
    gs.msg = 'Your turn: tap a card to ask the computer for that rank.';
    _gfRender();
}
const _GF_NAMES = ['', 'Aces', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes', 'Sevens', 'Eights', 'Nines', 'Tens', 'Jacks', 'Queens', 'Kings'];
const _gfR = (r) => _GF_NAMES[r];
function _gfHand(s) { const gs = gameState.gofish; return s === 0 ? gs.me : gs.cpu; }
function _gfBooks(s) {
    const gs = gameState.gofish, h = _gfHand(s), made = [];
    for (let r = 1; r <= 13; r++) { if (h.filter(c => c.r === r).length === 4) { gs.books[s].push(r); made.push(r); } }
    if (made.length) { const keep = h.filter(c => !made.includes(c.r)); h.length = 0; h.push(...keep); }
    return made;
}
function _gfRefill(s) { const gs = gameState.gofish, h = _gfHand(s); if (!h.length && gs.stock.length) { const c = gs.stock.pop(); if (s === 0) c.up = true; h.push(c); } }
function _gfDone() {
    const gs = gameState.gofish;
    if (gs.books[0].length + gs.books[1].length < 13) return false;
    gs.over = true; _gfRender();
    const a = gs.books[0].length, b = gs.books[1].length;
    GameKit.finish('gofish', a > b, a > b ? `You won ${a} books to ${b}!` : `The computer won ${b} books to ${a}.`);
    return true;
}
function gfAsk(r) {
    const gs = gameState.gofish; if (gs.turn !== 0 || gs.busy || gs.over) return;
    if (!gs.me.some(c => c.r === r)) return;
    gs.asked.push(r);
    const got = gs.cpu.filter(c => c.r === r);
    let again = false;
    if (got.length) {
        gs.cpu = gs.cpu.filter(c => c.r !== r); got.forEach(c => c.up = true); gs.me.push(...got);
        gs.msg = `The computer had ${got.length === 1 ? 'one' : got.length} - you got ${got.length === 1 ? 'it' : 'them'}! Go again.`; again = true; sfxCorrect();
    } else {
        const c = gs.stock.pop();
        if (c) { c.up = true; gs.me.push(c); again = c.r === r; gs.msg = `Go fish! You drew the ${GameKit.RANKS[c.r]}${GameKit.SUITS[c.s]}${again ? ' - the one you asked for! Go again.' : '.'}`; }
        else gs.msg = 'Go fish! But the deck is empty.';
        again ? sfxCorrect() : sfxFlip();
    }
    const made = _gfBooks(0); if (made.length) gs.msg += ` Book of ${_gfR(made[0])}!`;
    _gfRefill(0); _gfRefill(1);
    if (_gfDone()) return;
    if (again && gs.me.length) return _gfRender();
    gs.turn = 1; gs.busy = true; _gfRender(); setTimeout(_gfCpu, 1300);
}
function _gfCpu() {
    const gs = gameState.gofish; if (!gameState.active || gameState.currentId !== 'gofish' || gs.over) return;
    _gfRefill(1);
    if (!gs.cpu.length) { gs.turn = 0; gs.busy = false; _gfRefill(0); if (_gfDone()) return; gs.msg = 'The computer has no cards. Your turn.'; return _gfRender(); }
    // remembered asks first (ranks you asked for that it also holds), else the rank it holds most of
    const has = [...new Set(gs.cpu.map(c => c.r))];
    const remembered = has.filter(r => gs.asked.includes(r) && Math.random() < gs.memory);
    const cnt = (r) => gs.cpu.filter(c => c.r === r).length;
    const r = remembered.length ? remembered[0] : has.sort((a, b) => cnt(b) - cnt(a))[0];
    const got = gs.me.filter(c => c.r === r);
    let again = false, note;
    if (got.length) { gs.me = gs.me.filter(c => c.r !== r); gs.cpu.push(...got); note = `The computer asked for ${_gfR(r)} and took ${got.length === 1 ? 'your one' : 'your ' + got.length}.`; again = true; sfxWrong(); gs.asked = gs.asked.filter(x => x !== r); }
    else { const c = gs.stock.pop(); if (c) gs.cpu.push(c); again = !!c && c.r === r; note = `The computer asked for ${_gfR(r)}. You said "Go fish!"${again ? ' It drew one anyway.' : ''}`; sfxFlip(); }
    const made = _gfBooks(1); if (made.length) note += ` It made a book of ${_gfR(made[0])}.`;
    _gfRefill(0); _gfRefill(1);
    gs.msg = note;
    if (_gfDone()) return;
    if (again && gs.cpu.length) { _gfRender(); return setTimeout(_gfCpu, 1500); }
    gs.turn = 0; gs.busy = false;
    if (!gs.me.length) { gs.msg += ' You have no cards left and the deck is empty.'; gs.turn = 1; gs.busy = true; _gfRender(); return setTimeout(_gfCpu, 1500); }
    gs.msg += ' Your turn.'; _gfRender();
}
function _gfRender() {
    const gs = gameState.gofish, el = document.getElementById('gameContent');
    if (!el || gameState.currentId !== 'gofish') return;
    const C = GameKit.card;
    gs.me.sort((a, b) => a.r - b.r || a.s - b.s);
    const hand = gs.me.map(c => C(c, { onclick: `gfAsk(${c.r})`, hint: gs.turn === 0 && !gs.busy })).join('');
    const books = (s) => gs.books[s].map(r => `<span class="gf-book">${GameKit.RANKS[r]}</span>`).join('') || '<span class="gk-label">none yet</span>';
    el.innerHTML = `<div class="gk-table gf" dir="ltr">
      <div class="gk-status">${gs.msg}</div>
      <div class="gk-label">Computer: ${gs.cpu.length} cards · books ${books(1)}</div>
      <div class="gk-row gf-cpu">${gs.cpu.map(() => C({ up: false }, { down: true })).join('')}</div>
      <div class="gk-row gf-mid">${gs.stock.length ? C({ up: false }, { down: true }) : C(null)}<div class="gk-label">Pond: ${gs.stock.length} card${gs.stock.length === 1 ? '' : 's'}</div></div>
      <div class="gk-label gk-big">Your books: ${books(0)}</div>
      <div class="gk-hand">${hand}</div>
    </div>
    <style>.gk-table.gf{--w:clamp(46px,12vw,76px)}.gf .gf-cpu .gk-card{--w:26px}.gf .gf-cpu{gap:2px}.gf .gf-mid{gap:14px;align-items:center;margin:12px 0}
    .gf .gf-book{display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:30px;padding:0 6px;margin:0 2px;border-radius:8px;background:#fff7e6;color:#3b1d0e;font-weight:900;font-family:Georgia,serif}</style>`;
}
