// ═══════════════════════════════════════════════════════════════════════════════
// GAME 16: HANGMAN
// ═══════════════════════════════════════════════════════════════════════════════
const _HE_KB = ['א','ב','ג','ד','ה','ו','ז','ח','ט','י','כ','ל','מ','נ','ס','ע','פ','צ','ק','ר','ש','ת'];
const _EN_KB = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
// Greek words need a Greek keyboard: with A-Z every Greek word was unwinnable (Μ is not M).
const _EL_KB = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ'.split('');
const _HM_NORM = {'ך':'כ','ם':'מ','ן':'נ','ף':'פ','ץ':'צ','ς':'Σ'};
// final letters fold to their key; accents fold too (Ά -> Α, É -> E), so an accented word is never unwinnable
function _hmNorm(ch) { return _HM_NORM[ch] || ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase(); }
function _hmKb() { return currentLang === 'he' ? _HE_KB : currentLang === 'el' ? _EL_KB : _EN_KB; }

function initHangman(c) {
    const gs = gameState.hangman;
    if(!gs.pool || gs.level === 1) {
        gs.pool = shuffle([...i18nData[currentLang].hangman_pool]);
        gs.wordIdx = 0;
    } else {
        gs.wordIdx = (gs.wordIdx||0) + 1;
    }
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    gs._diff=_d;
    _hmStart(c);
}
function _hmStart(c) {
    const gs = gameState.hangman;
    const item = gs.pool[gs.wordIdx % gs.pool.length];
    gs.word = item.word;
    gs.hint = item.hint;
    gs.guessed = new Set();
    gs.wrong = 0;
    const _d=gs._diff||'normal';
    gs.maxWrong = _d==='easy'?8:_d==='hard'?4:6;
    _hmRender(c);
}
// The picture (2026-10-10, Or: keep the game, lose the gallows). A bunch of balloons, one per allowed mistake;
// each wrong letter lets one float away. The one that just left is drawn rising and fading, the earlier ones are gone.
const _HM_COLORS = ['#e11d48', '#f59e0b', '#16a34a', '#2563eb', '#9333ea', '#ea580c', '#0891b2', '#db2777'];
function _hmBalloons(gs) {
    const n = gs.maxWrong, left = n - gs.wrong, sp = Math.min(17, 128 / n);
    // balloons leave from the outside of the bunch inwards, alternating sides
    const order = []; for (let a = 0, b = n - 1; a <= b; a++, b--) { order.push(a); if (b !== a) order.push(b); }
    const gone = new Set(order.slice(0, gs.wrong)), flying = gs._fly ? order[gs.wrong - 1] : -1;
    let strings = '', balloons = '';
    for (let i = 0; i < n; i++) {
        if (gone.has(i) && i !== flying) continue;
        const off = i - (n - 1) / 2, cx = 80 + off * sp, cy = 40 + Math.abs(off) * 5 + (i % 2) * 9, col = _HM_COLORS[i % _HM_COLORS.length];
        const cls = i === flying ? ' class="hm-fly"' : '';
        balloons += `<g${cls}><path d="M${cx},${cy + 16} Q${cx + 3},${(cy + 132) / 2} 80,124" stroke="#8a6a4a" stroke-width="1.6" fill="none"/>`
            + `<ellipse cx="${cx}" cy="${cy}" rx="12" ry="15.5" fill="${col}" stroke="rgba(0,0,0,.25)" stroke-width="1"/>`
            + `<ellipse cx="${cx - 4}" cy="${cy - 6}" rx="3" ry="5" fill="#fff" opacity=".55"/>`
            + `<path d="M${cx - 3},${cy + 17} l3,-2.5 l3,2.5 z" fill="${col}"/></g>`;
    }
    gs._fly = false;
    return `<svg viewBox="0 0 160 140" width="150" height="132" class="hm-pic" role="img" aria-label="${left} / ${n}" style="min-width:130px;flex-shrink:0;overflow:visible">
                ${balloons}
                <path d="M72,124 q8,7 16,0 q-8,-4 -16,0z" fill="#b45309"/>
                <circle cx="80" cy="124" r="3" fill="#92400e"/>
            </svg>
            <style>.hm-fly{animation:hmFly 1.1s ease-in forwards}@keyframes hmFly{to{transform:translateY(-120px) rotate(-8deg);opacity:0}}
            @media (prefers-reduced-motion:reduce){.hm-fly{animation:none;opacity:0}}</style>`;
}
function _hmRender(c) {
    const gs = gameState.hangman;
    const isHe = currentLang === 'he';
    const kb = _hmKb();
    const blanks = [...gs.word].map(ch => {
        const revealed = gs.guessed.has(_hmNorm(ch));
        return revealed
            ? `<span style="margin:0 4px;font-size:2rem;font-weight:bold;color:#1a365d;border-bottom:4px solid #1a365d;min-width:32px;display:inline-block;text-align:center">${ch}</span>`
            : `<span style="margin:0 4px;font-size:2rem;border-bottom:4px solid #94a3b8;min-width:32px;display:inline-block;text-align:center">&nbsp;</span>`;
    }).join('');
    const gameOver = gs.wrong >= gs.maxWrong;
    const letterBtns = kb.map(l => {
        const used = gs.guessed.has(l);
        const found = used && [...gs.word].some(ch => _hmNorm(ch) === l);
        const missed = used && !found;
        return `<button onclick="guessLetter('${l}')" ${used?'disabled':''} class="m-0.5 rounded-lg font-bold transition text-sm ${missed?'bg-red-100 text-red-400 border border-red-200 cursor-default':found?'bg-green-100 text-green-600 border border-green-200 cursor-default':'bg-gray-100 hover:bg-[#1a365d] hover:text-white border border-gray-300 active:scale-95'}" style="width:clamp(32px,8vw,42px);height:clamp(32px,8vw,42px)">${l}</button>`;
    }).join('');
    const livesColor=gs.wrong>=gs.maxWrong-1?'#ef4444':gs.wrong>=gs.maxWrong-2?'#f59e0b':'#64748b';
    c.innerHTML = `<div class="w-full max-w-2xl">
        <div class="flex flex-col md:flex-row gap-4 items-center justify-center mb-4">
            ${_hmBalloons(gs)}
            <div class="text-center flex-1">
                <div class="text-base text-gray-500 mb-2">${gt('Hint', 'רמז')}: <span class="font-bold text-[#b7791f]">${gs.hint}</span></div>
                <div class="flex flex-wrap justify-center items-end gap-1 my-3" ${isHe?'dir="rtl"':''}>${blanks}</div>
                <div class="text-sm font-bold mt-2" style="color:${livesColor}">${gt('Mistakes', 'שגיאות')}: ${gs.wrong}/${gs.maxWrong}</div>
                ${gameOver ? `<div class="mt-3 font-bold text-lg text-red-600">${gt('The word was: ', 'המילה הייתה: ')}<span class="text-[#1a365d]">${gs.word}</span></div>
                <button onclick="_hmNext()" class="mt-3 py-3 px-6 rounded-xl bg-[#1a365d] text-white font-bold text-base hover:bg-[#2c5282] transition">${Icon.ui('rotate-ccw')} ${gt('New Word', 'מילה חדשה')}</button>` : ''}
            </div>
        </div>
        ${!gameOver ? `<div class="flex flex-wrap justify-center mt-2">${letterBtns}</div>` : ''}
    </div>`;
}
function guessLetter(l) {
    if(!gameState.active || gameState.currentId !== 'hangman') return;
    const gs = gameState.hangman;
    if(gs.guessed.has(l)) return;
    gs.guessed.add(l);
    const found = [...gs.word].some(ch => _hmNorm(ch) === l);
    if(found) {
        sfxCorrect();
        if([...gs.word].every(ch => gs.guessed.has(_hmNorm(ch)))) { setTimeout(()=>levelComplete(), 500); return; }
    } else { gs.wrong++; gs._fly = true; sfxWrong(); }
    _hmRender(document.getElementById('gameContent'));
}
function _hmNext() {
    if(!gameState.active) return;
    const gs = gameState.hangman;
    gs.wordIdx = (gs.wordIdx||0) + 1;
    _hmStart(document.getElementById('gameContent'));
}
