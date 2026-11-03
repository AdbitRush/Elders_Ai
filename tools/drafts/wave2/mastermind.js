// ═══════════════════════════════════════════════════════════════════════════════
// MASTERMIND (2026-10, wave 2) — classic code-breaking. The computer hides a code of colored pegs; you have 10 tries.
// After each try: ● = right color in the right place, ○ = right color in the wrong place (also said in words).
// Every color also has its own symbol, so the game never depends on telling colors apart.
// Easy: 4 pegs, 5 colors, no repeats. Normal: 4 pegs, 6 colors, no repeats. Hard: 4 pegs, 6 colors, repeats allowed.
// Breaking the code = "Well Done!"; ten tries without it = "Nice try" (and the code is shown).
// ═══════════════════════════════════════════════════════════════════════════════
const _MM_COLORS = [['#dc2626', '★', 'red star'], ['#2563eb', '●', 'blue circle'], ['#16a34a', '▲', 'green triangle'], ['#facc15', '◆', 'yellow diamond'], ['#9333ea', '♥', 'purple heart'], ['#f97316', '■', 'orange square']];
function initMastermind(container) {
    const gs = gameState.mastermind;
    const diff = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
    gs.k = diff === 'easy' ? 5 : 6; gs.rep = diff === 'hard'; gs.tries = 10;
    const pool = [...Array(gs.k).keys()];
    gs.code = gs.rep ? Array.from({ length: 4 }, () => Math.floor(Math.random() * gs.k)) : shuffle(pool).slice(0, 4);
    gs.rows = []; gs.cur = []; gs.over = false;
    gs.msg = `Pick 4 pegs${gs.rep ? ' (a color can repeat)' : ' (no color repeats)'}, then tap Try.`;
    _mmRender();
}
function mmPick(i) {
    const gs = gameState.mastermind; if (gs.over || gs.cur.length >= 4) return;
    if (!gs.rep && gs.cur.includes(i)) { gs.msg = 'In this game no color is used twice.'; return _mmRender(); }
    gs.cur.push(i); gs.msg = ''; if (typeof sfxClick === 'function') sfxClick(); _mmRender();
}
function mmBack() { const gs = gameState.mastermind; if (gs.over) return; gs.cur.pop(); _mmRender(); }
function mmTry() {
    const gs = gameState.mastermind; if (gs.over || gs.cur.length !== 4) return;
    const g = gs.cur.slice(); let black = 0, white = 0;
    const cr = [], gr = [];
    g.forEach((v, i) => { if (v === gs.code[i]) black++; else { cr.push(gs.code[i]); gr.push(v); } });
    gr.forEach((v) => { const j = cr.indexOf(v); if (j >= 0) { white++; cr.splice(j, 1); } });
    gs.rows.push({ g, black, white }); gs.cur = [];
    if (black === 4) { gs.over = true; gs.msg = 'You broke the code!'; _mmRender(); if (typeof sfxCorrect === 'function') sfxCorrect(); return GameKit.finish('mastermind', true, `Code broken in ${gs.rows.length} ${gs.rows.length === 1 ? 'try' : 'tries'}.`); }
    if (gs.rows.length >= gs.tries) { gs.over = true; gs.msg = 'Out of tries. The code was shown above.'; _mmRender(); return GameKit.finish('mastermind', false, `The code was: ${gs.code.map((c) => _MM_COLORS[c][2]).join(', ')}.`); }
    gs.msg = `${black} in the right place, ${white} right color in the wrong place. ${gs.tries - gs.rows.length} tries left.`;
    if (typeof sfxFlip === 'function') sfxFlip();
    _mmRender();
}
function _mmPeg(c, big) { const C = _MM_COLORS[c]; return `<span class="mm-peg${big ? ' mm-big' : ''}" style="background:${C[0]}" aria-label="${C[2]}">${C[1]}</span>`; }
function _mmRender() {
    const gs = gameState.mastermind, el = document.getElementById('gameContent');
    if (!el || gameState.currentId !== 'mastermind') return;
    const rows = gs.rows.map((r, i) => `<div class="mm-row"><span class="mm-n">${i + 1}</span>${r.g.map((c) => _mmPeg(c)).join('')}<span class="mm-fb" aria-label="${r.black} right place, ${r.white} wrong place">${'●'.repeat(r.black)}${'○'.repeat(r.white)}${r.black + r.white ? '' : '–'}</span></div>`).join('');
    const cur = [0, 1, 2, 3].map((i) => (gs.cur[i] !== undefined ? _mmPeg(gs.cur[i], true) : '<span class="mm-peg mm-big mm-empty">?</span>')).join('');
    const pal = _MM_COLORS.slice(0, gs.k).map((C, i) => `<button type="button" class="mm-pick" onclick="mmPick(${i})" aria-label="${C[2]}">${_mmPeg(i, true)}</button>`).join('');
    el.innerHTML = `<div class="mm" dir="ltr">
      ${gs.over ? `<div class="mm-code"><b>The code:</b> ${gs.code.map((c) => _mmPeg(c, true)).join('')}</div>` : ''}
      <div class="mm-rows">${rows || '<div class="mm-none">Your tries will appear here.</div>'}</div>
      ${gs.over ? '' : `<div class="mm-cur">${cur}</div>
      <div class="mm-pal">${pal}</div>
      <div class="gk-btns">${GameKit.btn('Undo peg', 'mmBack()', { disabled: !gs.cur.length })}${GameKit.btn('Try', 'mmTry()', { cls: 'gk-primary', disabled: gs.cur.length !== 4 })}</div>`}
      <div class="cw-msg" role="status">${gs.msg}</div>
      <div class="mm-key">● right color, right place &nbsp; ○ right color, wrong place</div>
    </div>
    <style>
      .mm{max-width:30rem;margin:0 auto;color:#2b1b0d}
      .mm-rows{background:#6b4220;border-radius:14px;padding:8px;display:flex;flex-direction:column;gap:6px}
      .mm-row{display:flex;align-items:center;gap:6px;background:rgba(255,250,240,.12);border-radius:10px;padding:4px 8px}
      .mm-n{color:#fde7c4;font-weight:800;width:1.6em}
      .mm-fb{margin-left:auto;color:#fff7e6;font-size:1.3rem;letter-spacing:2px;min-width:4.5em;text-align:right}
      .mm-none{color:#fde7c4;text-align:center;padding:10px;font-weight:700}
      .mm-peg{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;color:#fff;font-size:1.1rem;font-weight:900;text-shadow:0 1px 2px rgba(0,0,0,.6);border:2px solid rgba(0,0,0,.25);flex:0 0 auto}
      .mm-peg.mm-big{width:52px;height:52px;font-size:1.5rem}
      .mm-empty{background:#fffdf7!important;color:#a08360;text-shadow:none;border:3px dashed #c9a46a}
      .mm-cur{display:flex;gap:10px;justify-content:center;margin:14px 0 10px}
      .mm-pal{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
      .mm-pick{background:none;border:0;padding:2px;cursor:pointer;border-radius:50%}
      .mm-code{display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;margin-bottom:10px;font-size:1.15rem}
      .mm .gk-btn{border-color:#c9a46a}
      .cw-msg{text-align:center;font-weight:800;margin:10px 0;min-height:1.5em}
      .mm-key{text-align:center;font-size:1rem;color:#4a3420}
    </style>`;
}
