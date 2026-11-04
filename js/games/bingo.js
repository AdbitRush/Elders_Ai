// ═══════════════════════════════════════════════════════════════════════════════
// BINGO NIGHT (2026-11, nostalgia batch 2) — American 75-ball bingo as played in fire halls, church basements and
// community centers, against computer players at other tables. No clock: the next ball comes when YOU press for it.
// Cards: 5x5, columns B 1-15, I 16-30, N 31-45 (free center), G 46-60, O 61-75. Each game has one pattern:
// any line (across, down or corner to corner), four corners, a small "postage stamp" (2x2 in a corner) or an X.
// Daub (tap) the called numbers on your cards yourself. When a card completes the pattern, press BINGO! before
// asking for the next ball. The other players daub automatically and call as soon as they have it; if one of them
// calls first (or on the same ball you skip), they win. Bingo is mostly luck - the skill is careful daubing.
// Easy: 3 cards vs 2 players. Normal: 2 cards vs 2 players. Hard: 2 cards vs 4 players.
// The flashboard shows every number called so far, so a missed daub can always be caught up.
// ═══════════════════════════════════════════════════════════════════════════════
const _BG_L = 'BINGO';
const _BG_PATTERNS = {
    line: { name: 'any line', help: 'five in a row across, down, or corner to corner; the free center counts', test: (m) => { const L = []; for (let i = 0; i < 5; i++) { L.push([0, 1, 2, 3, 4].map((j) => i * 5 + j)); L.push([0, 1, 2, 3, 4].map((j) => j * 5 + i)); } L.push([0, 6, 12, 18, 24], [4, 8, 12, 16, 20]); return L.some((l) => l.every((x) => m[x])); } },
    corners: { name: 'four corners', help: 'all four corner squares', test: (m) => [0, 4, 20, 24].every((x) => m[x]) },
    stamp: { name: 'postage stamp', help: 'a 2 x 2 block in any corner', test: (m) => [[0, 1, 5, 6], [3, 4, 8, 9], [15, 16, 20, 21], [18, 19, 23, 24]].some((q) => q.every((x) => m[x])) },
    x: { name: 'the letter X', help: 'both corner-to-corner lines', test: (m) => [0, 6, 12, 18, 24, 4, 8, 16, 20].every((x) => m[x]) },
};
function _bgCard() {
    const cols = [0, 1, 2, 3, 4].map((c) => shuffle(Array.from({ length: 15 }, (_, k) => c * 15 + k + 1)).slice(0, 5));
    const nums = []; for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) nums.push(r === 2 && c === 2 ? 0 : cols[c][r]);
    return { nums, daub: nums.map((n) => n === 0) };
}
function initBingo() {
    NK.start('bingo', {
        setup(gs, diff) {
            const nc = diff === 'easy' ? 3 : 2, np = diff === 'hard' ? 4 : 2;
            const keys = Object.keys(_BG_PATTERNS); gs.pat = keys[Math.floor(Math.random() * keys.length)];
            gs.cards = Array.from({ length: nc }, _bgCard); gs.others = Array.from({ length: np }, _bgCard);
            gs.bag = shuffle(Array.from({ length: 75 }, (_, i) => i + 1)); gs.called = []; gs.over = false; gs.pending = -1;
            gs.names = ['Table 2', 'Table 3', 'Table 4', 'Table 5'].slice(0, np);
            gs.msg = `Tonight's pattern: <b>${_BG_PATTERNS[gs.pat].name}</b> (${_BG_PATTERNS[gs.pat].help}). Press Call the next ball.`;
        },
        view: _bgView,
        keys: { KeyN: () => bgNext(), KeyB: () => bgClaim() },
        rules: (gs) => [
            'Each card has five columns: <b>B</b> 1-15, <b>I</b> 16-30, <b>N</b> 31-45, <b>G</b> 46-60, <b>O</b> 61-75. The middle square is free.',
            `This game's pattern is <b>${_BG_PATTERNS[gs.pat].name}</b>: ${_BG_PATTERNS[gs.pat].help}.`,
            'Press <b>Call the next ball</b>. If the number is on one of your cards, tap it to daub it. The board of called numbers shows everything called so far.',
            'When a card has the pattern, press <b>BINGO!</b> before calling the next ball.',
            'The players at the other tables daub automatically and call the moment they have it. If one of them calls first, they win the game.',
            'Bingo is mostly luck; careful daubing is the skill. A wrong BINGO! call is simply checked and nothing is lost. No clock.',
            'Keyboard: N calls the next ball, B calls BINGO!, arrow keys and Enter daub.'],
        css: `.bg-ball{display:flex;align-items:center;justify-content:center;gap:14px;margin:2px 0 4px}
.bg-b{width:72px;height:72px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#f2e6cf 70%);border:5px solid #b91c1c;display:flex;flex-direction:column;align-items:center;justify-content:center;font:900 1.9rem/1 Georgia,serif;color:#1d1b18;box-shadow:0 4px 10px rgba(0,0,0,.25)}
.bg-b small{font:900 1rem system-ui,sans-serif;color:#b91c1c}
.bg-cards{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
.bg-card{background:#fffdf5;border:3px solid #1d4ed8;border-radius:14px;padding:6px;width:min(100%,19rem);box-sizing:border-box}
.bg-card.bg-win{border-color:#15803d;box-shadow:0 0 0 4px #bbf7d0}
.bg-g{display:grid;grid-template-columns:repeat(5,1fr);gap:3px}
.bg-h{text-align:center;font:900 1.3rem Georgia,serif;color:#fff;background:#1d4ed8;border-radius:6px;padding:2px 0}
.bg-c{aspect-ratio:1;border:2px solid #cbd5e1;background:#fff;color:#1d1b18;font:800 clamp(1.05rem,4.2vw,1.35rem)/1 system-ui,sans-serif;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;min-width:0;--nk-r:8px;--nk-bw:2px;position:relative}
.bg-c.bg-d{background:#fecaca;color:#7f1d1d;border-color:#b91c1c}
.bg-c.bg-d::before{content:"";position:absolute;inset:14%;border-radius:50%;background:rgba(220,38,38,.45)}
.bg-c span{position:relative}
.bg-c.bg-free{background:#fde68a;font-size:.8rem;cursor:default}
.bg-board{display:grid;grid-template-columns:auto repeat(15,1fr);gap:2px;font:700 .8rem system-ui,sans-serif;background:#fff3d6;border:2px solid #e8cfa8;border-radius:12px;padding:6px;margin-top:12px}
.bg-board b{color:#1d4ed8;font-size:.95rem;text-align:center}
.bg-board span{text-align:center;color:#a08360;padding:2px 0;border-radius:4px}
.bg-board span.on{background:#b91c1c;color:#fff}
.bg-others{display:flex;flex-wrap:wrap;gap:6px 14px;justify-content:center;font-size:1rem;color:#4a3420;margin-top:8px}
.bg-sp{display:none}
@media (max-width:480px){.bg-board{gap:2px;padding:5px;font-size:.85rem;grid-template-columns:auto repeat(8,1fr)}.bg-board b{grid-row:span 2;align-self:center;padding-right:4px}.bg-sp{display:block}}
.bg-bar{position:sticky;top:76px;z-index:20;background:var(--w-table,#fffaf1);padding:4px 0 2px;border-bottom:2px solid #e8cfa8;margin-bottom:8px}`,
    });
}
const _bgLetter = (n) => _BG_L[Math.floor((n - 1) / 15)];
function _bgView(gs) {
    const last = gs.called[gs.called.length - 1];
    const P = _BG_PATTERNS[gs.pat];
    const cards = gs.cards.map((cd, ci) => {
        const win = P.test(cd.daub);
        const cells = cd.nums.map((n, i) => n === 0 ? '<span class="nk-cell bg-c bg-free" aria-label="free square">FREE</span>'
            : `<button type="button" class="nk-cell bg-c${cd.daub[i] ? ' bg-d' : ''}" onclick="bgDaub(${ci},${i})" data-k="c${ci}_${i}"${ci === 0 && i === 0 ? ' data-first' : ''} aria-pressed="${cd.daub[i]}" aria-label="${_bgLetter(n)} ${n}${cd.daub[i] ? ', daubed' : ''}"${gs.over ? ' disabled' : ''}><span>${n}</span></button>`).join('');
        return `<div class="bg-card${win ? ' bg-win' : ''}" aria-label="card ${ci + 1}"><div class="bg-g">${[..._BG_L].map((l) => `<span class="bg-h">${l}</span>`).join('')}${cells}</div></div>`;
    }).join('');
    const calledSet = new Set(gs.called);
    let board = '';
    for (let c = 0; c < 5; c++) board += `<b>${_BG_L[c]}</b>` + Array.from({ length: 15 }, (_, k) => { const n = c * 15 + k + 1; return `<span class="${calledSet.has(n) ? 'on' : ''}">${n}</span>`; }).join('') + '<i class="bg-sp"></i>';
    const near = gs.others.map((o, k) => `${gs.names[k]}: ${o.daub.filter(Boolean).length - 1} daubed`).join(' · ');
    return `<div class="nk-top"><span>Pattern: <b>${P.name}</b></span><span>Balls called: <b>${gs.called.length}</b></span></div>
      <div class="bg-bar"><div class="bg-ball" aria-live="polite">${last ? `<span class="bg-b" aria-label="last ball ${_bgLetter(last)} ${last}"><small>${_bgLetter(last)}</small>${last}</span>` : '<span class="bg-b" style="border-color:#a08360"><small>&nbsp;</small>?</span>'}</div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('play') + 'Call the next ball', 'bgNext()', { cls: 'gk-primary', k: 'next', disabled: gs.over })}${NK.btn(NK.icon('party-popper') + 'BINGO!', 'bgClaim()', { k: 'claim', disabled: gs.over })}</div></div>
      <div class="bg-cards">${cards}</div>
      <div class="bg-others">${near}</div>
      <div class="bg-board" aria-label="numbers called so far">${board}</div>
      <div class="gk-btns">${NK.btn(NK.icon('rotate-ccw') + 'New game', 'bgRestart()', { k: 'restart' })}</div>`;
}
function bgRestart() { initBingo(); }
function bgDaub(ci, i) {
    const gs = gameState.bingo; if (gs.over) return;
    const cd = gs.cards[ci], n = cd.nums[i];
    if (cd.daub[i]) { cd.daub[i] = false; gs.msg = `Daub taken off ${_bgLetter(n)} ${n}.`; return NK.render('bingo'); }
    if (!gs.called.includes(n)) { gs.msg = `${_bgLetter(n)} ${n} has not been called yet. Only daub numbers on the board of called numbers.`; return NK.render('bingo'); }
    cd.daub[i] = true; if (typeof sfxFlip === 'function') sfxFlip();
    gs.msg = `Daubed ${_bgLetter(n)} ${n}.` + (_BG_PATTERNS[gs.pat].test(cd.daub) ? ' That card has the pattern - press BINGO!' : '');
    NK.render('bingo');
}
function bgNext() {
    const gs = gameState.bingo; if (gs.over) return;
    // a claim waved at another table on the last ball wins once you move on
    if (gs.pending !== undefined && gs.pending >= 0) return _bgEnd(false, `${gs.names[gs.pending]} called BINGO! first.`);
    // the other tables call on the ball that completes their card: if one has it now, it wins before the next ball
    const n = gs.bag.pop(); gs.called.push(n);
    gs.others.forEach((o) => o.nums.forEach((x, i) => { if (x === n) o.daub[i] = true; }));
    const w = gs.others.findIndex((o) => _BG_PATTERNS[gs.pat].test(o.daub));
    if (typeof sfxClick === 'function') sfxClick();
    if (w >= 0) {
        // you still get the chance to call on the same ball: the hall checks every claim on this ball
        gs.pending = w;
        gs.msg = `${_bgLetter(n)} ${n}! Somebody at ${gs.names[w]} is waving a card... If you have it too, press BINGO! now; calling the next ball lets them win.`;
        return NK.render('bingo');
    }
    gs.msg = `${_bgLetter(n)} ${n}. ` + (gs.cards.some((cd) => cd.nums.includes(n)) ? 'It is on one of your cards - daub it.' : 'Not on your cards.');
    NK.render('bingo');
}
function bgClaim() {
    const gs = gameState.bingo; if (gs.over) return;
    if (!gs.called.length) { gs.msg = 'No balls have been called yet.'; return NK.render('bingo'); }
    const P = _BG_PATTERNS[gs.pat];
    const ok = gs.cards.findIndex((cd) => P.test(cd.daub) && cd.nums.every((x, i) => !cd.daub[i] || x === 0 || gs.called.includes(x)));
    if (ok < 0) {
        const could = gs.cards.some((cd) => P.test(cd.nums.map((x) => x === 0 || gs.called.includes(x))));
        gs.msg = could ? 'Not yet - one of your cards could have it, but a called number is not daubed. Check the called board.' : `Not yet - no card has ${P.name} daubed. Nothing is lost; keep going.`;
        return NK.render('bingo');
    }
    const tie = gs.pending !== undefined && gs.pending >= 0;
    _bgEnd(true, tie ? `You and ${gs.names[gs.pending]} called on the same ball - in this hall that is a shared win.` : `Card ${ok + 1} has ${P.name} after ${NK.pl(gs.called.length, 'ball')}.`);
}
function _bgEnd(win, why) {
    const gs = gameState.bingo; gs.over = true;
    gs.msg = (win ? 'BINGO! ' : '') + why;
    NK.render('bingo');
    if (win && typeof sfxCorrect === 'function') sfxCorrect();
    NK.finish('bingo', win, win ? `Bingo! ${why}` : `${why} Bingo is mostly luck - the next card might be yours.`);
}
