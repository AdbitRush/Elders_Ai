// ═══════════════════════════════════════════════════════════════════════════════
// MANCALA (2026-11, nostalgia batch) — the stone-sowing board game (the Kalah rules sold in boxed sets in the
// 1950s-70s, and far older than that), against a patient computer. No clock: the computer waits for you.
// Board: 6 pits each + one store each. You own the bottom row (left to right) and the store on the RIGHT.
// Rules: pick one of your pits, take all its stones and drop one in each pit counter-clockwise, including your
// store, skipping the computer's store. Last stone in your store = another turn. Last stone in an EMPTY pit of your
// own = capture it and the stones straight across. When one side is empty, the other side's stones go to their
// owner's store. More stones in your store wins.
// Easy: 3 stones per pit, the computer looks one move ahead. Normal: 4 stones, two moves. Hard: 4 stones, five moves.
// Pits are numbered 0-5 (yours), 6 = your store, 7-12 (computer, drawn right to left on top), 13 = computer store.
// ═══════════════════════════════════════════════════════════════════════════════
function initMancala(container) {
    if (window._gameCleanup) { window._gameCleanup(); window._gameCleanup = null; }   // New game calls init directly: drop the previous game's listeners and timers
    const gs = gameState.mancala;
    const diff = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
    gs.diff = diff;
    gs.depth = diff === 'easy' ? 1 : diff === 'hard' ? 5 : 2;
    const n = diff === 'easy' ? 3 : 4;
    gs.b = [n, n, n, n, n, n, 0, n, n, n, n, n, n, 0];
    gs.turn = 0; gs.over = false; gs.last = null; gs.busy = false; gs.moves = 0;
    gs.msg = 'Your turn. Tap one of your pits (the ones with a gold rim).';
    clearTimeout(gs._t);
    const onKey = (e) => {
        if (gameState.currentId !== 'mancala' || gs.over || GameKit.keyBlocked(e)) return;
        const k = +e.key; if (k >= 1 && k <= 6) { if (!e.repeat) mcTap(k - 1); e.preventDefault(); }
    };
    document.addEventListener('keydown', onKey);
    window._gameCleanup = () => { document.removeEventListener('keydown', onKey); clearTimeout(gs._t); };
    _mcRender();
}
// sow from pit i for player p (0 = you, 1 = computer) on board b (mutated). Returns {again, cap, end}
function _mcSow(b, i, p) {
    let s = b[i]; b[i] = 0; let j = i; const skip = p === 0 ? 13 : 6;
    while (s > 0) { j = (j + 1) % 14; if (j === skip) continue; b[j]++; s--; }
    const store = p === 0 ? 6 : 13, mine = p === 0 ? (j >= 0 && j <= 5) : (j >= 7 && j <= 12);
    let cap = 0;
    if (mine && b[j] === 1 && b[12 - j] > 0) { cap = b[12 - j] + 1; b[store] += cap; b[j] = 0; b[12 - j] = 0; }
    const end = _mcSideEmpty(b);
    if (end) { for (let k = 0; k < 6; k++) { b[6] += b[k]; b[k] = 0; b[13] += b[k + 7]; b[k + 7] = 0; } }
    return { again: j === store && !end, cap, end, last: j };
}
function _mcSideEmpty(b) { let a = 0, c = 0; for (let k = 0; k < 6; k++) { a += b[k]; c += b[k + 7]; } return a === 0 || c === 0; }
// computer search: score = computer store - your store (+ a little for stones on its side)
function _mcEval(b) { let mine = 0, yours = 0; for (let k = 0; k < 6; k++) { yours += b[k]; mine += b[k + 7]; } return (b[13] - b[6]) * 4 + (mine - yours) * 0.25; }
function _mcSearch(b, p, d) {
    if (d === 0 || _mcSideEmpty(b)) return { v: _mcEval(b) };
    let best = null;
    const pits = p === 1 ? [12, 11, 10, 9, 8, 7] : [0, 1, 2, 3, 4, 5];
    for (const i of pits) {
        if (!b[i]) continue;
        const nb = b.slice(); const r = _mcSow(nb, i, p);
        const nxt = r.end ? { v: _mcEval(nb) } : _mcSearch(nb, r.again ? p : 1 - p, r.again ? d : d - 1);
        if (!best || (p === 1 ? nxt.v > best.v : nxt.v < best.v)) best = { v: nxt.v, i };
    }
    return best || { v: _mcEval(b) };
}
function mcTap(i) {
    const gs = gameState.mancala;
    if (gs.over || gs.busy || gs.turn !== 0) return;
    if (i < 0 || i > 5) return;
    if (!gs.b[i]) { gs.msg = 'That pit is empty. Pick a pit with stones in it.'; return _mcRender(); }
    gs.moves++;
    _mcPlay(0, i);
}
function _mcPlay(p, i) {
    const gs = gameState.mancala;
    const n = gs.b[i];
    const r = _mcSow(gs.b, i, p);
    gs.last = { p, i, land: r.last };
    if (typeof sfxFlip === 'function') sfxFlip();
    const who = p === 0 ? 'You' : 'The computer';
    let m = `${who} sowed ${n} stone${n === 1 ? '' : 's'} from pit ${p === 0 ? i + 1 : 13 - i}.`;
    if (r.cap) m += ` ${p === 0 ? 'You capture' : 'It captures'} ${r.cap} stones!`;
    if (r.end) return _mcEnd(m);
    if (r.again) { m += p === 0 ? ' Last stone in your store: go again!' : ' Its last stone landed in its store, so it goes again.'; }
    gs.turn = r.again ? p : 1 - p;
    if (gs.turn === 0) { gs.msg = m + (r.again ? '' : ' Your turn.'); return _mcRender(); }
    gs.msg = m + ' The computer is thinking...'; gs.busy = true; _mcRender();
    gs._t = setTimeout(_mcComputer, 1100);
}
function _mcComputer() {
    const gs = gameState.mancala;
    if (gameState.currentId !== 'mancala' || gs.over) return;
    gs.busy = false;
    let i;
    if (gs.diff === 'easy' && Math.random() < 0.35) { const ok = [7, 8, 9, 10, 11, 12].filter((k) => gs.b[k]); i = ok[Math.floor(Math.random() * ok.length)]; }
    else i = _mcSearch(gs.b.slice(), 1, gs.depth).i;
    _mcPlay(1, i);
}
function _mcEnd(m) {
    const gs = gameState.mancala; gs.over = true; gs.busy = false;
    const y = gs.b[6], c = gs.b[13];
    const res = y > c ? 'win' : y < c ? 'lose' : 'tie';
    gs.msg = m + ` Game over: you ${y}, computer ${c}.`;
    _mcRender();
    if (res === 'win' && typeof sfxCorrect === 'function') sfxCorrect();
    GameKit.finish('mancala', res === 'win', res === 'win' ? `You won ${y} to ${c}!` : res === 'tie' ? `A tie, ${y} to ${c}. So close!` : `The computer won ${c} to ${y}. A rematch is one tap away.`);
}
function mcRestart() { initMancala(document.getElementById('gameContent')); }
function _mcStones(n) {
    if (n === 0) return '';
    const shown = Math.min(n, 12), cols = ['#b45309', '#1d4ed8', '#15803d', '#be123c', '#6d28d9'];
    let s = ''; for (let k = 0; k < shown; k++) s += `<i style="background:${cols[k % 5]}"></i>`;
    return `<span class="mc-st" aria-hidden="true">${s}</span>`;
}
function _mcRender() {
    const gs = gameState.mancala, el = document.getElementById('gameContent');
    if (!el || gameState.currentId !== 'mancala') return;
    const b = gs.b, L = gs.last;
    const land = (k) => (L && L.land === k ? ' mc-land' : '');
    const can = gs.turn === 0 && !gs.over && !gs.busy;
    // one grid, two layouts: wide = the classic long board; narrow (phones) = the board turned upright
    const pos = (w, n) => `style="--wr:${w[0]};--wc:${w[1]};--nr:${n[0]};--nc:${n[1]}"`;
    let cells = '';
    for (let k = 7; k <= 12; k++) cells += `<div class="mc-pit mc-cpu${land(k)}" ${pos([1, 14 - k], [14 - k, 2])} aria-label="computer pit, ${b[k]} stones"><b>${b[k]}</b>${_mcStones(b[k])}</div>`;
    for (let k = 0; k <= 5; k++) cells += `<button type="button" class="mc-pit mc-me${land(k)}${can && b[k] ? ' mc-go' : ''}" ${pos([2, k + 2], [k + 2, 1])} onclick="mcTap(${k})" aria-label="your pit ${k + 1}, ${b[k]} stones"${can && b[k] ? '' : ' aria-disabled="true"'}><b>${b[k]}</b>${_mcStones(b[k])}<small>${k + 1}</small></button>`;
    cells += `<div class="mc-store${land(13)}" ${pos(['1 / 3', 1], [1, '1 / 3'])} aria-label="computer store, ${b[13]} stones"><span>Computer</span><b>${b[13]}</b></div>`;
    cells += `<div class="mc-store mc-mine${land(6)}" ${pos(['1 / 3', 8], [8, '1 / 3'])} aria-label="your store, ${b[6]} stones"><span>You</span><b>${b[6]}</b></div>`;
    const _fk = GameKit.focusKey(el);
    el.innerHTML = `<div class="mc" dir="ltr">
      <div class="mc-score"><span>Computer: <b>${b[13]}</b></span><span>You: <b>${b[6]}</b></span></div>
      <div class="mc-board">${cells}</div>
      <div class="mc-way"><span class="mc-w1">Your stones travel to the right along the bottom row, into your store, then along the top row.</span><span class="mc-w2">Your pits are on the left. Stones travel down your side, into your store at the bottom, then up the computer's side.</span></div>
      <div class="mc-msg" role="status" aria-live="polite">${gs.msg}</div>
      <div class="gk-btns">${GameKit.btn(GameKit.icon('rotate-ccw') + 'New game', 'mcRestart()')}</div>
      <details class="mc-rules"><summary>How to play</summary><ul>
        <li>Your six pits have a <b>gold rim</b> and are numbered 1 to 6. Your store is the big cup marked <b>You</b>.</li>
        <li>Tap a pit (or press 1 to 6). Its stones are dropped one at a time into the next pits: along your side, into your store, then along the computer's side (the arrows under the board show the way). The computer's store is skipped.</li>
        <li>Last stone lands in <b>your store</b>? You go again.</li>
        <li>Last stone lands in an <b>empty pit of yours</b>? You capture it and every stone in the pit straight above.</li>
        <li>When one row is empty, the game ends. Each player keeps the stones still on their side. The fuller store wins.</li>
        <li>There is no clock. Take all the time you like.</li></ul></details>
    </div>
    <style>
      .mc{width:100%;box-sizing:border-box;max-width:46rem;margin:0 auto;color:#2b1b0d}
      .mc-score{display:flex;justify-content:space-between;font-size:1.2rem;margin:4px 2px 10px}
      .mc-board{display:grid;grid-template-columns:minmax(52px,.9fr) repeat(6,1fr) minmax(52px,.9fr);grid-template-rows:auto auto;gap:7px;background:linear-gradient(160deg,#9a6531,#6b4220);border-radius:22px;padding:10px;box-shadow:inset 0 0 0 3px #4d2f15}
      .mc-board>*{grid-row:var(--wr);grid-column:var(--wc)}
      .mc-way{text-align:center;font-size:1rem;color:#4a3420;margin-top:8px}.mc-w2{display:none}
      .mc-pit{position:relative;aspect-ratio:1/1.1;min-height:52px;border-radius:50%/45%;background:radial-gradient(circle at 50% 40%,#4d2f15,#2e1b0b);border:3px solid #3a230f;color:#fff7e6;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2px;min-width:0;box-sizing:border-box;font:inherit}
      .mc-pit b{font-size:clamp(1.25rem,4.6vw,1.9rem);line-height:1;font-weight:900}
      .mc-pit small{position:absolute;bottom:-2px;right:2px;font-size:.8rem;font-weight:800;color:#fde7c4}
      button.mc-pit{cursor:pointer}
      .mc-me.mc-go{border-color:#fbbf24;box-shadow:0 0 0 2px #fbbf24}
      .mc-me[aria-disabled]{opacity:.8}
      .mc-land{box-shadow:0 0 0 4px #fde68a!important}
      .mc-st{display:flex;flex-wrap:wrap;justify-content:center;gap:2px;max-width:80%;margin-top:3px}
      .mc-st i{width:clamp(5px,1.4vw,9px);height:clamp(5px,1.4vw,9px);border-radius:50%;border:1px solid rgba(255,255,255,.6)}
      .mc-store{border-radius:40px;min-height:64px;background:radial-gradient(ellipse at 50% 40%,#4d2f15,#2e1b0b);border:3px solid #3a230f;color:#fff7e6;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;flex:0 0 auto}
      .mc-store span{font-size:.8rem;font-weight:800;color:#fde7c4;text-transform:uppercase;letter-spacing:.03em}
      .mc-store b{font-size:clamp(1.6rem,5vw,2.4rem);font-weight:900}
      .mc-msg{text-align:center;font-weight:800;font-size:1.15rem;margin:12px 4px;min-height:3em}
      .mc .gk-btn{border-color:#c9a46a}
      .mc-rules{background:#fff3d6;border:2px solid #e8cfa8;border-radius:14px;padding:10px 14px;margin-top:6px;font-size:1.05rem}
      .mc-rules summary{font-weight:800;cursor:pointer;min-height:44px;display:flex;align-items:center}
      .mc-rules li{margin:6px 0 6px 1.1em;list-style:disc}
      .mc-mine{box-shadow:inset 0 0 0 3px #fbbf24}
      @media (max-width:600px){
        .mc-board{grid-template-columns:1fr 1fr;grid-template-rows:auto repeat(6,auto) auto;max-width:22rem;margin:0 auto}
        .mc-board>*{grid-row:var(--nr);grid-column:var(--nc)}
        .mc-pit{aspect-ratio:auto;min-height:58px;border-radius:30px;flex-direction:row;gap:8px}
        .mc-st{max-width:55%;margin:0}
        .mc-pit small{bottom:auto;right:auto;left:12px}
        .mc-store{flex-direction:row;gap:12px;min-height:58px}
        .mc-w1{display:none}.mc-w2{display:inline}
      }
      #gameContent .mc button.mc-pit{border-radius:50%/45%!important;border-width:3px!important;overflow:visible}#gameContent .mc button.mc-pit:hover{transform:none}#gameContent .mc button.mc-pit::after{display:none}
      @media (max-width:600px){#gameContent .mc button.mc-pit{border-radius:30px!important}}
    </style>`;
    GameKit.restoreFocus(el, _fk);
}
