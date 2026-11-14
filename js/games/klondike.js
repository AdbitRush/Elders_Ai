// ═══════════════════════════════════════════════════════════════════════════════
// GAME 27: KLONDIKE SOLITAIRE — the classic. Senior-friendly click-to-move
// (no dragging): tap a card, tap where it goes. Undo, Hint, Draw 1/3.
// Difficulty: easy = draw 1 + unlimited redeals, normal = draw 1,
//             hard = draw 3 + 3 redeals.
// Visuals (2026-11 overhaul): warm felt card-table in a wood rim, cream paper
// cards with inline-SVG suits, burgundy lattice backs. Logic is unchanged.
// ═══════════════════════════════════════════════════════════════════════════════

const KL_SUITS = ['♥','♦','♠','♣'];          // 0,1 red — 2,3 black
const KL_LABEL = ['','A','2','3','4','5','6','7','8','9','10','J','Q','K'];

function _klNew() {
    const deck = [];
    for (let s = 0; s < 4; s++) for (let v = 1; v <= 13; v++) deck.push({v, s, up: false});
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    const t = [[], [], [], [], [], [], []];
    for (let col = 0; col < 7; col++) {
        for (let n = 0; n <= col; n++) t[col].push(deck.pop());
        t[col][t[col].length - 1].up = true;
    }
    return {stock: deck, waste: [], f: [[], [], [], []], t,
            sel: null, undo: [], redeals: 0, moves: 0};
}

function _klRed(c) { return c.s < 2; }

function initKlondike(container) {
    const _d = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
    const st = _klNew();
    st.draw = _d === 'hard' ? 3 : 1;
    st.maxRedeals = _d === 'hard' ? 3 : Infinity;
    gameState.klondike = Object.assign(gameState.klondike || {level: 1}, st);
    _klRender(container);
}

function _klSnapshot() {
    const s = gameState.klondike;
    s.undo.push(JSON.stringify({stock: s.stock, waste: s.waste, f: s.f, t: s.t, redeals: s.redeals, moves: s.moves}));   // moves too: Undo takes the move back, so the counter goes back with it
    if (s.undo.length > 100) s.undo.shift();
}

function klUndo() {
    const s = gameState.klondike;
    if (!s.undo.length) { sfxWrong(); return; }
    const prev = JSON.parse(s.undo.pop());
    Object.assign(s, prev); s.sel = null; sfxFlip();
    _klRender(document.getElementById('gameContent'));
}

function _klCardHtml(c, where, pi, ci, sel) {
    if (!c.up) return `<div class="kl-card kl-down" onclick="klTap('${where}',${pi},${ci})"></div>`;
    const red = _klRed(c) ? 'kl-red' : 'kl-black';
    const isSel = sel && sel.where === where && sel.pi === pi && ci >= sel.ci ? ' kl-sel' : '';
    const lbl = KL_LABEL[c.v];
    const corner = `<b${c.v === 10 ? ' class="kl-ten"' : ''}>${lbl}</b>${_klCardHtml.suit(c.s)}`;
    const mid = c.v > 10 ? _klCardHtml.face(c) : _klCardHtml.suit(c.s);
    return `<div class="kl-card kl-up ${red}${isSel}${c.v === 1 ? ' kl-ace' : ''}" aria-label="${lbl}${KL_SUITS[c.s]}" onclick="klTap('${where}',${pi},${ci})">` +
           `<span class="kl-cn">${corner}</span><span class="kl-mid">${mid}</span><span class="kl-cn kl-cn2">${corner}</span></div>`;
}

// Inline-SVG art (kept as properties of _klCardHtml so no new global names are introduced).
// Suit shapes on a 24x24 grid, index-matched to KL_SUITS: heart, diamond, spade, club.
_klCardHtml.paths = [
    '<path d="M12 21.2C5.4 16 2 12.6 2 8.4A5.2 5.2 0 0 1 12 6.3 5.2 5.2 0 0 1 22 8.4C22 12.6 18.6 16 12 21.2z"/>',
    '<path d="M12 1.5C14.5 5.5 17 9 20.5 12 17 15 14.5 18.5 12 22.5 9.5 18.5 7 15 3.5 12 7 9 9.5 5.5 12 1.5z"/>',
    '<path d="M12 2C9 6.5 2.5 9.8 2.5 14.6A4.6 4.6 0 0 0 10.9 16.9C10.7 19 10 20.6 8.6 22H15.4C14 20.6 13.3 19 13.1 16.9A4.6 4.6 0 0 0 21.5 14.6C21.5 9.8 15 6.5 12 2z"/>',
    '<circle cx="12" cy="7.2" r="4.7"/><circle cx="6.7" cy="14.2" r="4.7"/><circle cx="17.3" cy="14.2" r="4.7"/><circle cx="12" cy="12.4" r="2.6"/><path d="M12 10.5c-.1 6-.9 9.4-3.4 11.5h6.8c-2.5-2.1-3.3-5.5-3.4-11.5z"/>'
];
_klCardHtml.suit = function (s) {
    return `<svg class="kl-suit" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">${_klCardHtml.paths[s]}</svg>`;
};
// Court cards: a framed gold panel with a crown (K: cross, Q: pearls, J: coronet) over the suit.
_klCardHtml.face = function (c) {
    const gold = 'fill="#cf9d33" stroke="#7a5a12" stroke-width=".7" stroke-linejoin="round"';
    const band = `<rect x="10" y="18.4" width="20" height="2.6" rx="1" ${gold}/>`;
    const crown = `<path d="M10 18 8.5 9l6 4.5L20 7l5.5 6.5 6-4.5L30 18z" ${gold}/>`;
    const top = c.v === 13 ? crown + band + '<path d="M20 2.4v4.6M18 4.2h4" fill="none" stroke="#7a5a12" stroke-width="1.3" stroke-linecap="round"/>'
              : c.v === 12 ? crown + band + `<circle cx="8.5" cy="8.3" r="1.6" ${gold}/><circle cx="20" cy="6.1" r="1.6" ${gold}/><circle cx="31.5" cy="8.3" r="1.6" ${gold}/>`
              : `<path d="M10.5 18v-6l4.7 3 4.8-4 4.8 4 4.7-3v6z" ${gold}/>` + band;
    return `<svg class="kl-face" viewBox="0 0 40 40" aria-hidden="true" focusable="false">` +
           `<rect x="1.5" y="1.5" width="37" height="37" rx="5" fill="#f8ebc8" stroke="currentColor" stroke-width="1.3"/>` +
           `<rect x="4.3" y="4.3" width="31.4" height="31.4" rx="3.2" fill="none" stroke="#c9a35a" stroke-width=".8"/>` +
           top + `<g fill="currentColor" transform="translate(13.3 22.2) scale(.56)">${_klCardHtml.paths[c.s]}</g></svg>`;
};

function _klRender(container) {
    const s = gameState.klondike;
    const he = (typeof currentLang !== 'undefined' && currentLang === 'he');
    const L = he ? {undo:Icon.ui('undo-2')+' ביטול', hint:Icon.ui('lightbulb')+' רמז', deal:Icon.ui('rotate-ccw')+' חלוקה חדשה', moves:'מהלכים'}
                 : {undo:Icon.ui('undo-2')+' Undo', hint:Icon.ui('lightbulb')+' Hint', deal:Icon.ui('rotate-ccw')+' New deal', moves:'Moves'};
    let h = `<style>
      /* ── table ─────────────────────────────────────────────────────────── */
      .kl-board{direction:ltr;max-width:860px;margin:0 auto;user-select:none;-webkit-user-select:none;box-sizing:border-box;
        --kl-fs:clamp(18px,3.4vw,28px);            /* corner rank size: never under 18px */
        --kl-up:calc(var(--kl-fs) * 1.36);         /* stack offset under a face-up card */
        --kl-dn:calc(var(--kl-fs) * .5);           /* stack offset under a face-down card */
        --kl-gap:clamp(3px,1.2vw,12px);
        --kl-r:clamp(5px,1.2vw,11px);
        padding:clamp(8px,2.2vw,22px) clamp(5px,2vw,22px) clamp(14px,3vw,28px);
        border:clamp(5px,1.3vw,11px) solid #70472a;border-radius:clamp(14px,3vw,26px);
        background:
          radial-gradient(ellipse at 50% 30%,rgba(255,255,255,.13),rgba(255,255,255,0) 62%),
          repeating-linear-gradient(45deg,rgba(255,255,255,.022) 0 2px,rgba(255,255,255,0) 2px 4px),
          repeating-linear-gradient(-45deg,rgba(0,0,0,.03) 0 2px,rgba(0,0,0,0) 2px 4px),
          #236c4d;
        box-shadow:inset 0 0 0 2px rgba(0,0,0,.28),inset 0 0 80px rgba(0,0,0,.42),0 0 0 2px #4a2d16,0 12px 28px rgba(0,0,0,.32);
        font-family:system-ui,-apple-system,"Segoe UI",Arial,sans-serif}
      .kl-board *{box-sizing:border-box}
      .kl-row{display:flex;gap:var(--kl-gap);justify-content:center;margin-bottom:clamp(12px,2.6vw,20px);flex-wrap:nowrap}
      .kl-row:last-child{margin-bottom:0}
      .kl-pile{flex:1 1 0;min-width:0;max-width:108px;border-radius:var(--kl-r);position:relative}

      /* ── empty places ──────────────────────────────────────────────────── */
      .kl-slot{width:100%;aspect-ratio:5/7;border-radius:var(--kl-r);border:2px dashed rgba(255,244,214,.6);
        background:rgba(0,0,0,.16);box-shadow:inset 0 2px 8px rgba(0,0,0,.3);
        display:flex;align-items:center;justify-content:center;color:rgba(255,244,214,.5);cursor:pointer}
      .kl-slot .kl-suit,.kl-slot .kl-ico{width:52%;height:auto;aspect-ratio:1/1;color:#fff4d6;opacity:.5}
      .kl-slot-k{position:absolute;top:0;left:0;right:0;font-weight:800;font-size:clamp(22px,5vw,44px);color:rgba(255,244,214,.38)}
      .kl-sizer{width:100%;aspect-ratio:5/7;pointer-events:none}

      /* ── cards ─────────────────────────────────────────────────────────── */
      .kl-card{width:100%;aspect-ratio:5/7;border-radius:var(--kl-r);position:relative;overflow:hidden;cursor:pointer;
        font-weight:800;font-size:var(--kl-fs);line-height:1;font-variant-numeric:lining-nums;
        box-shadow:0 1px 1px rgba(30,15,0,.3),0 3px 6px rgba(20,10,0,.3)}
      .kl-up{border:1px solid #cdbb91;
        background:
          repeating-linear-gradient(0deg,rgba(125,95,40,.035) 0 1px,rgba(125,95,40,0) 1px 3px),
          repeating-linear-gradient(90deg,rgba(125,95,40,.025) 0 1px,rgba(125,95,40,0) 1px 4px),
          linear-gradient(150deg,#fffdf7 0%,#fbf4e2 55%,#f3e8cd 100%)}
      .kl-red{color:#b3141c}.kl-black{color:#1b1a1f}
      .kl-down{border:clamp(2px,.45vw,4px) solid #fbf3e0;
        background:
          repeating-linear-gradient(45deg,rgba(255,232,190,.2) 0 2px,rgba(255,232,190,0) 2px 9px),
          repeating-linear-gradient(-45deg,rgba(255,232,190,.2) 0 2px,rgba(255,232,190,0) 2px 9px),
          linear-gradient(160deg,#8f3140,#681c2a);
        box-shadow:inset 0 0 0 1.5px #d2ae62,0 1px 1px rgba(30,15,0,.3),0 3px 6px rgba(20,10,0,.3)}
      .kl-down::after{content:"";position:absolute;left:50%;top:50%;width:36%;aspect-ratio:1/1;
        transform:translate(-50%,-50%) rotate(45deg);background:#741f2e;border:2px solid #e3c47c;border-radius:3px;
        box-shadow:0 0 0 2px #741f2e}
      .kl-suit{display:block;fill:currentColor}
      .kl-cn{position:absolute;top:.13em;left:.15em;display:flex;align-items:center;gap:.05em}
      .kl-cn b{font-weight:800}
      .kl-cn .kl-suit{width:.72em;height:.72em;flex:none}
      .kl-ten{letter-spacing:-.07em;margin-right:.05em}
      .kl-cn2{top:auto;left:auto;right:.15em;bottom:.13em;transform:rotate(180deg)}
      .kl-mid{position:absolute;left:0;right:0;top:50%;height:30%;transform:translateY(-50%);
        display:flex;align-items:center;justify-content:center;pointer-events:none}
      .kl-mid svg{height:100%;width:auto;aspect-ratio:1/1;display:block}
      .kl-mid .kl-suit{filter:drop-shadow(0 1px 0 rgba(255,255,255,.7))}
      @media (min-width:600px){.kl-mid{height:42%}.kl-ace .kl-mid{height:50%}}

      /* selected: lift + thick two-tone ring + deeper shadow (not colour alone) */
      .kl-sel{transform:translateY(-4px);z-index:2;
        box-shadow:0 0 0 4px #f6c048,0 0 0 6px #2a1a08,0 12px 18px rgba(0,0,0,.5);animation:kl-lift .16s ease-out}
      @keyframes kl-lift{from{transform:translateY(0)}to{transform:translateY(-4px)}}
      .kl-stack .kl-card{position:absolute;left:0;right:0}
      .kl-badge{position:absolute;left:50%;bottom:8%;transform:translateX(-50%);pointer-events:none;
        min-width:2em;padding:.18em .5em;border-radius:999px;background:rgba(32,10,14,.88);color:#fff4d6;
        border:1px solid #e3c47c;font-weight:800;font-size:clamp(14px,2.3vw,17px);line-height:1;text-align:center}

      /* ── toolbar ───────────────────────────────────────────────────────── */
      .kl-bar{display:flex;gap:10px;justify-content:center;align-items:center;margin-bottom:clamp(12px,2.6vw,20px);flex-wrap:wrap}
      .kl-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:10px 20px;
        background:linear-gradient(#fffaf0,#f4e3bd);border:2px solid #a9792f;color:#3b2a12;border-radius:14px;
        font:inherit;font-weight:800;font-size:1.08rem;line-height:1.2;cursor:pointer;
        box-shadow:0 3px 0 #7d5720,0 5px 10px rgba(0,0,0,.25)}
      .kl-btn:hover{background:linear-gradient(#fff3d3,#f1d695)}
      .kl-btn:active{transform:translateY(2px);box-shadow:0 1px 0 #7d5720,0 2px 4px rgba(0,0,0,.25)}
      .kl-btn:focus-visible{outline:4px solid #fff;outline-offset:2px}
      .kl-count{display:inline-flex;align-items:center;min-height:48px;padding:8px 18px;border-radius:14px;
        background:rgba(0,0,0,.28);border:1px solid rgba(255,244,214,.4);color:#fff4d6;font-weight:800;font-size:1.08rem}

      /* ── how to play ───────────────────────────────────────────────────── */
      .kl-help{margin:0 auto clamp(12px,2.6vw,20px);background:linear-gradient(#fffaf0,#f8ecd0);border:2px solid #c9a35a;
        border-radius:14px;padding:6px 16px;color:#3b2a12;font-size:1.08rem;line-height:1.55;box-shadow:0 4px 10px rgba(0,0,0,.25)}
      .kl-help summary{cursor:pointer;font-weight:800;font-size:1.18rem;min-height:48px;display:flex;align-items:center;gap:8px;list-style:none}
      .kl-help summary::-webkit-details-marker{display:none}
      .kl-help summary::after{content:"+";margin-left:auto;font-size:1.6rem;line-height:1;color:#8a5a14}
      .kl-help[open] summary::after{content:"\\2212"}
      .kl-help summary:focus-visible{outline:3px solid #8a5a14;outline-offset:2px;border-radius:8px}
      .kl-help ul{margin:4px 0 10px 1.2em;padding:0}.kl-help li{margin:6px 0}
      .kl-ex{display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-weight:700;padding:10px 0 8px;border-top:1px solid #dcc48e}
      .kl-ex-card{display:inline-flex;align-items:center;justify-content:center;gap:3px;width:58px;height:80px;border-radius:9px;
        background:linear-gradient(150deg,#fffdf7,#f3e8cd);border:1px solid #cdbb91;font-size:1.5rem;font-weight:900;line-height:1;
        box-shadow:0 2px 5px rgba(40,20,0,.3)}
      .kl-ex-card .kl-suit{width:.78em;height:.78em}
      .kl-ex-arrow{font-size:1.9rem;line-height:1;color:#8a5a14}

      @media (max-width:480px){
        .kl-btn{padding:8px 14px;font-size:1rem;gap:6px}.kl-count{padding:8px 14px;font-size:1rem}
        .kl-help{padding:4px 12px;font-size:1.02rem}
        .kl-sel{transform:translateY(-3px);box-shadow:0 0 0 3px #f6c048,0 0 0 5px #2a1a08,0 9px 14px rgba(0,0,0,.5);animation:none}
        .kl-badge{bottom:5%;padding:.14em .4em}
      }
      @media (prefers-reduced-motion:reduce){
        .kl-sel{animation:none}.kl-btn:active{transform:none}
      }
    </style><div class="kl-board">`;

    // How to play (2026-10-10 review: the tableau, empty-column and stock rules were missing). Open on the first
    // visit, then remembered as folded; a worked example shows a legal move.
    let helpOpen = true; try { helpOpen = !localStorage.getItem('gg_kl_help_seen'); localStorage.setItem('gg_kl_help_seen', '1'); } catch (e) {}
    const ex = (lbl, suit, red) => `<span class="kl-ex-card ${red ? 'kl-red' : 'kl-black'}">${lbl}${_klCardHtml.suit(suit)}</span>`;
    h += `<details class="kl-help"${helpOpen ? ' open' : ''}><summary>${Icon.ui('book-open')} How to play</summary>
      <ul>
        <li><b>Goal:</b> move all 52 cards to the four home piles at the top right, each suit from Ace up to King.</li>
        <li><b>Columns:</b> build down in <b>alternating colors</b> - a red 7 goes on a black 8, a black 6 on a red 7.</li>
        <li>You can move a whole face-up run at once. When you uncover a face-down card, it turns over.</li>
        <li><b>Empty column:</b> only a King (or a run that starts with a King) can go there.</li>
        <li><b>The deck</b> (top left): tap it to turn a card onto the pile next to it; you may play that card. When the deck is empty, tap its spot to turn the pile back over.${s.draw === 3 ? ' On Hard, three cards turn at a time and you can go through the deck three more times.' : ''}</li>
        <li><b>Tap to move:</b> tap a card, then tap where it goes. Tap a card twice to send it home if it fits.</li>
      </ul>
      <div class="kl-ex"><span>Example:</span>${ex('8', 2, false)}<span class="kl-ex-arrow">←</span>${ex('7', 0, true)}<span>The red 7♥ can go on the black 8♠.</span></div>
    </details>`;
    h += `<div class="kl-bar"${he ? ' dir="rtl"' : ''}>
      <button class="kl-btn" onclick="klUndo()">${L.undo}</button>
      <button class="kl-btn" onclick="klHint()">${L.hint}</button>
      <button class="kl-btn" onclick="initKlondike(document.getElementById('gameContent'))">${L.deal}</button>
      <span class="kl-count">${L.moves}: ${s.moves}</span></div>`;

    // top row: stock, waste, gap, 4 foundations
    const canRedeal = s.waste.length && s.redeals < s.maxRedeals;
    const stockIco = canRedeal
        ? `<svg class="kl-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12a7 7 0 1 1-2.2-5.1"/><path d="M17.6 2.6v4.8h-4.8"/></svg>`
        : `<svg class="kl-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="7.5"/><path d="M6.8 17.2 17.2 6.8"/></svg>`;
    h += `<div class="kl-row">`;
    h += `<div class="kl-pile">` + (s.stock.length
        ? `<div class="kl-card kl-down" onclick="klDraw()"></div><span class="kl-badge">${s.stock.length}</span>`
        : `<div class="kl-slot" onclick="klDraw()">${stockIco}</div>`) + `</div>`;
    const w = s.waste[s.waste.length - 1];
    h += `<div class="kl-pile">` + (w ? _klCardHtml(w, 'w', 0, s.waste.length - 1, s.sel) : `<div class="kl-slot" style="cursor:default"></div>`) + `</div>`;
    h += `<div class="kl-pile" style="visibility:hidden"></div>`;
    for (let i = 0; i < 4; i++) {
        const top = s.f[i][s.f[i].length - 1];
        h += `<div class="kl-pile" onclick="klTap('f',${i},-1)">` + (top
            ? _klCardHtml(top, 'f', i, s.f[i].length - 1, s.sel)
            : `<div class="kl-slot">${_klCardHtml.suit(i)}</div>`) + `</div>`;
    }
    h += `</div>`;

    // tableau: cards are absolutely positioned; face-down cards overlap more tightly than face-up ones.
    // An invisible in-flow sizer (same offset as the last card) gives the column its height at any card size.
    h += `<div class="kl-row" style="align-items:flex-start">`;
    for (let pi = 0; pi < 7; pi++) {
        const pile = s.t[pi];
        let dn = 0, up = 0, top = '0px';
        h += `<div class="kl-pile kl-stack" onclick="if(event.target===this)klTap('t',${pi},-1)">`;
        if (!pile.length) h += `<div class="kl-slot kl-slot-k" onclick="klTap('t',${pi},-1)">K</div>`;
        pile.forEach((c, ci) => {
            top = `calc(${dn} * var(--kl-dn) + ${up} * var(--kl-up))`;
            h += `<div style="position:absolute;top:${top};left:0;right:0">${_klCardHtml(c, 't', pi, ci, s.sel)}</div>`;
            if (c.up) up++; else dn++;
        });
        h += `<div class="kl-sizer" style="margin-top:${top}"></div></div>`;
    }
    h += `</div></div>`;
    container.innerHTML = h;
}

function klDraw() {
    const s = gameState.klondike;
    _klSnapshot(); s.sel = null;
    if (s.stock.length) {
        for (let i = 0; i < s.draw && s.stock.length; i++) {
            const c = s.stock.pop(); c.up = true; s.waste.push(c);
        }
        sfxFlip();
    } else if (s.waste.length) {
        if (s.redeals >= s.maxRedeals) { s.undo.pop(); sfxWrong(); return; }
        s.stock = s.waste.reverse().map(c => (c.up = false, c)); s.waste = [];
        s.redeals++; sfxFlip();
    } else { s.undo.pop(); return; }
    s.moves++;
    _klRender(document.getElementById('gameContent'));
}

function _klCanFoundation(c, fi) {
    const s = gameState.klondike, f = s.f[fi];
    return f.length ? (f[f.length - 1].s === c.s && f[f.length - 1].v === c.v - 1) : (c.v === 1 && c.s === fi);
}

function _klCanTableau(c, pi) {
    const s = gameState.klondike, p = s.t[pi];
    if (!p.length) return c.v === 13;
    const top = p[p.length - 1];
    return top.up && _klRed(top) !== _klRed(c) && top.v === c.v + 1;
}

function _klTake(sel) {
    const s = gameState.klondike;
    if (sel.where === 'w') return [s.waste.pop()];
    return s.t[sel.pi].splice(sel.ci);
}

function _klAfterMove() {
    const s = gameState.klondike;
    s.t.forEach(p => { if (p.length && !p[p.length - 1].up) p[p.length - 1].up = true; });
    s.sel = null; s.moves++;
    if (s.f.every(f => f.length === 13)) { sfxWin(); setTimeout(() => levelComplete(), 500); return; }
    _klRender(document.getElementById('gameContent'));
}

function klTap(where, pi, ci) {
    const s = gameState.klondike;
    const sel = s.sel;

    if (!sel) {  // select source
        if (where === 'w' && s.waste.length) { s.sel = {where: 'w', pi: 0, ci: s.waste.length - 1}; }
        else if (where === 't' && ci >= 0 && s.t[pi][ci] && s.t[pi][ci].up) { s.sel = {where: 't', pi, ci}; }
        else return;
        sfxFlip(); _klRender(document.getElementById('gameContent')); return;
    }

    const srcCard = sel.where === 'w' ? s.waste[s.waste.length - 1] : s.t[sel.pi][sel.ci];
    const single = sel.where === 'w' || sel.ci === s.t[sel.pi].length - 1;

    // tap the selected card again → try auto-foundation
    if (sel.where === where && sel.pi === pi && (where === 'w' || ci === sel.ci)) {
        if (single) for (let fi = 0; fi < 4; fi++) if (_klCanFoundation(srcCard, fi)) {
            _klSnapshot(); s.undo[s.undo.length-1] = s.undo[s.undo.length-1]; // snapshot before take
            const snap = s.undo.pop(); s.undo.push(snap);
            _klTake(sel); s.f[fi].push(srcCard); sfxCorrect(); _klAfterMove(); return;
        }
        s.sel = null; _klRender(document.getElementById('gameContent')); return;
    }

    if (where === 'f' && single && _klCanFoundation(srcCard, pi)) {
        _klSnapshot(); _klTake(sel); s.f[pi].push(srcCard); sfxCorrect(); _klAfterMove(); return;
    }
    if (where === 't' && _klCanTableau(srcCard, pi)) {
        _klSnapshot(); const run = _klTake(sel); s.t[pi].push(...run); sfxCorrect(); _klAfterMove(); return;
    }
    // illegal → reselect if tapping another face-up card, else clear
    if (where === 't' && ci >= 0 && s.t[pi][ci] && s.t[pi][ci].up) { s.sel = {where: 't', pi, ci}; }
    else if (where === 'w' && s.waste.length) { s.sel = {where: 'w', pi: 0, ci: s.waste.length - 1}; }
    else { s.sel = null; sfxWrong(); }
    _klRender(document.getElementById('gameContent'));
}

function klHint() {
    const s = gameState.klondike;
    // 1) any top card → foundation
    const tops = [];
    if (s.waste.length) tops.push({where: 'w', pi: 0, ci: s.waste.length - 1, c: s.waste[s.waste.length - 1]});
    s.t.forEach((p, pi) => { if (p.length && p[p.length - 1].up) tops.push({where: 't', pi, ci: p.length - 1, c: p[p.length - 1]}); });
    for (const t of tops) for (let fi = 0; fi < 4; fi++)
        if (_klCanFoundation(t.c, fi)) { s.sel = {where: t.where, pi: t.pi, ci: t.ci}; sfxFlip(); _klRender(document.getElementById('gameContent')); return; }
    // 2) any face-up run head → tableau
    for (let pi = 0; pi < 7; pi++) {
        const p = s.t[pi];
        for (let ci = 0; ci < p.length; ci++) {
            if (!p[ci].up) continue;
            for (let ti = 0; ti < 7; ti++) {
                if (ti === pi) continue;
                if (_klCanTableau(p[ci], ti) && !(ci === 0 && p[ci].v === 13)) {
                    s.sel = {where: 't', pi, ci}; sfxFlip(); _klRender(document.getElementById('gameContent')); return;
                }
            }
        }
    }
    // 3) waste → tableau
    if (s.waste.length) { const c = s.waste[s.waste.length - 1];
        for (let ti = 0; ti < 7; ti++) if (_klCanTableau(c, ti)) {
            s.sel = {where: 'w', pi: 0, ci: s.waste.length - 1}; sfxFlip(); _klRender(document.getElementById('gameContent')); return; } }
    sfxWrong();  // no move found → draw
}
