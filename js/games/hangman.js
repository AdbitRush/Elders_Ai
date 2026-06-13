// ═══════════════════════════════════════════════════════════════════════════════
// GAME 16: HANGMAN
// ═══════════════════════════════════════════════════════════════════════════════
const _HE_KB = ['א','ב','ג','ד','ה','ו','ז','ח','ט','י','כ','ל','מ','נ','ס','ע','פ','צ','ק','ר','ש','ת'];
const _EN_KB = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const _HM_NORM = {'ך':'כ','ם':'מ','ן':'נ','ף':'פ','ץ':'צ'};
function _hmNorm(ch) { return _HM_NORM[ch] || ch; }

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
function _hmRender(c) {
    const gs = gameState.hangman;
    const isHe = currentLang === 'he';
    const kb = isHe ? _HE_KB : _EN_KB;
    const hmParts = [
        `<circle cx="80" cy="36" r="13" stroke="#1a365d" stroke-width="3" fill="none" ${gs.wrong<1?'style="display:none"':''}/>`,
        `<line x1="80" y1="49" x2="80" y2="90" stroke="#1a365d" stroke-width="3" stroke-linecap="round" ${gs.wrong<2?'style="display:none"':''}/>`,
        `<line x1="80" y1="63" x2="57" y2="82" stroke="#1a365d" stroke-width="3" stroke-linecap="round" ${gs.wrong<3?'style="display:none"':''}/>`,
        `<line x1="80" y1="63" x2="103" y2="82" stroke="#1a365d" stroke-width="3" stroke-linecap="round" ${gs.wrong<4?'style="display:none"':''}/>`,
        `<line x1="80" y1="90" x2="57" y2="115" stroke="#1a365d" stroke-width="3" stroke-linecap="round" ${gs.wrong<5?'style="display:none"':''}/>`,
        `<line x1="80" y1="90" x2="103" y2="115" stroke="#1a365d" stroke-width="3" stroke-linecap="round" ${gs.wrong<6?'style="display:none"':''}/>`,
    ].join('');
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
            <svg viewBox="0 0 140 130" width="120" height="120" style="min-width:110px;flex-shrink:0">
                <line x1="10" y1="128" x2="130" y2="128" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>
                <line x1="30" y1="128" x2="30" y2="5" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>
                <line x1="30" y1="5" x2="80" y2="5" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>
                <line x1="80" y1="5" x2="80" y2="23" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
                ${hmParts}
            </svg>
            <div class="text-center flex-1">
                <div class="text-base text-gray-500 mb-2">${isHe?'רמז':'Hint'}: <span class="font-bold text-[#b7791f]">${gs.hint}</span></div>
                <div class="flex flex-wrap justify-center items-end gap-1 my-3" ${isHe?'dir="rtl"':''}>${blanks}</div>
                <div class="text-sm font-bold mt-2" style="color:${livesColor}">${isHe?'שגיאות':'Mistakes'}: ${gs.wrong}/${gs.maxWrong}</div>
                ${gameOver ? `<div class="mt-3 font-bold text-lg text-red-600">${isHe?'המילה הייתה: ':'The word was: '}<span class="text-[#1a365d]">${gs.word}</span></div>
                <button onclick="_hmNext()" class="mt-3 py-3 px-6 rounded-xl bg-[#1a365d] text-white font-bold text-base hover:bg-[#2c5282] transition">${isHe?'🔄 מילה חדשה':'🔄 New Word'}</button>` : ''}
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
    } else { gs.wrong++; sfxWrong(); }
    _hmRender(document.getElementById('gameContent'));
}
function _hmNext() {
    if(!gameState.active) return;
    const gs = gameState.hangman;
    gs.wordIdx = (gs.wordIdx||0) + 1;
    _hmStart(document.getElementById('gameContent'));
}
