// ═══════════════════════════════════════════════════════════════════════════════
// GAME 27: KLONDIKE SOLITAIRE — the classic. Senior-friendly click-to-move
// (no dragging): tap a card, tap where it goes. Undo, Hint, Draw 1/3.
// Difficulty: easy = draw 1 + unlimited redeals, normal = draw 1,
//             hard = draw 3 + 3 redeals.
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
    s.undo.push(JSON.stringify({stock: s.stock, waste: s.waste, f: s.f, t: s.t, redeals: s.redeals}));
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
    return `<div class="kl-card kl-up ${red}${isSel}" onclick="klTap('${where}',${pi},${ci})">` +
           `<span>${KL_LABEL[c.v]}</span><span>${KL_SUITS[c.s]}</span></div>`;
}

function _klRender(container) {
    const s = gameState.klondike;
    const he = (typeof currentLang !== 'undefined' && currentLang === 'he');
    const L = he ? {undo:'↩️ ביטול', hint:'💡 רמז', deal:'🔄 חלוקה חדשה', moves:'מהלכים'}
                 : {undo:'↩️ Undo', hint:'💡 Hint', deal:'🔄 New deal', moves:'Moves'};
    let h = `<style>
      .kl-board{direction:ltr;max-width:860px;margin:0 auto;user-select:none}
      .kl-row{display:flex;gap:8px;justify-content:center;margin-bottom:14px;flex-wrap:nowrap}
      .kl-pile{width:11.5%;min-width:52px;min-height:84px;border-radius:10px;position:relative}
      .kl-slot{border:2px dashed rgba(255,255,255,.35);background:rgba(255,255,255,.05)}
      .kl-card{width:100%;aspect-ratio:5/7;border-radius:10px;box-shadow:0 2px 5px rgba(0,0,0,.35);
        display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
        font-weight:800;font-size:clamp(15px,2.6vw,26px);cursor:pointer;background:#fff}
      .kl-down{background:repeating-linear-gradient(45deg,#1e3a8a,#1e3a8a 6px,#2c4fae 6px,#2c4fae 12px);border:2px solid #172a63}
      .kl-red{color:#dc2626}.kl-black{color:#1f2937}
      .kl-sel{outline:4px solid #f6c048;outline-offset:-2px;transform:translateY(-4px)}
      .kl-stack .kl-card{position:absolute;left:0;right:0}
      .kl-bar{display:flex;gap:10px;justify-content:center;margin-bottom:14px;flex-wrap:wrap}
      .kl-btn{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.3);color:#f8fafc;
        border-radius:10px;padding:10px 18px;font-weight:700;cursor:pointer;font-size:1rem}
      .kl-btn:hover{background:rgba(246,192,72,.25)}
      .kl-count{color:#cbd5e1;font-size:.95rem;align-self:center}
    </style><div class="kl-board">`;

    h += `<div class="kl-bar">
      <button class="kl-btn" onclick="klUndo()">${L.undo}</button>
      <button class="kl-btn" onclick="klHint()">${L.hint}</button>
      <button class="kl-btn" onclick="initKlondike(document.getElementById('gameContent'))">${L.deal}</button>
      <span class="kl-count">${L.moves}: ${s.moves}</span></div>`;

    // top row: stock, waste, gap, 4 foundations
    h += `<div class="kl-row">`;
    h += `<div class="kl-pile">` + (s.stock.length
        ? `<div class="kl-card kl-down" onclick="klDraw()"></div>`
        : `<div class="kl-pile kl-slot" style="width:100%;height:100%;position:absolute" onclick="klDraw()"></div><div style="min-height:84px"></div>`) + `</div>`;
    const w = s.waste[s.waste.length - 1];
    h += `<div class="kl-pile">` + (w ? _klCardHtml(w, 'w', 0, s.waste.length - 1, s.sel) : `<div class="kl-slot" style="width:100%;height:100%;position:absolute"></div><div style="min-height:84px"></div>`) + `</div>`;
    h += `<div class="kl-pile" style="visibility:hidden"></div>`;
    for (let i = 0; i < 4; i++) {
        const top = s.f[i][s.f[i].length - 1];
        h += `<div class="kl-pile" onclick="klTap('f',${i},-1)">` + (top
            ? _klCardHtml(top, 'f', i, s.f[i].length - 1, s.sel)
            : `<div class="kl-slot" style="width:100%;height:100%;position:absolute;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.4);font-size:1.4rem">${KL_SUITS[i]}</div><div style="min-height:84px"></div>`) + `</div>`;
    }
    h += `</div>`;

    // tableau
    const maxLen = Math.max(6, ...s.t.map(p => p.length));
    h += `<div class="kl-row" style="align-items:flex-start">`;
    for (let pi = 0; pi < 7; pi++) {
        const pile = s.t[pi];
        const height = 84 + (pile.length ? (pile.length - 1) * 28 : 0);
        h += `<div class="kl-pile kl-stack" style="min-height:${height}px" onclick="if(event.target===this)klTap('t',${pi},-1)">`;
        if (!pile.length) h += `<div class="kl-slot" style="width:100%;min-height:84px;position:absolute" onclick="klTap('t',${pi},-1)"></div>`;
        pile.forEach((c, ci) => {
            h += `<div style="position:absolute;top:${ci * 28}px;left:0;right:0">${_klCardHtml(c, 't', pi, ci, s.sel)}</div>`;
        });
        h += `</div>`;
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
