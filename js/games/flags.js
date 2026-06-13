// ═══════════════════════════════════════════════════════════════════════════════
// GAME 14: FLAG QUIZ
// ═══════════════════════════════════════════════════════════════════════════════
function initFlags(c) {
    const gs = gameState.flags;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    gs.pool = shuffle([...i18nData[currentLang].flags_pool]);
    gs.idx = 0; gs.perLevel = _d==='easy'?6:_d==='hard'?14:10; gs.score = 0;
    _flagNext(c);
}
function _flagNext(c) {
    if(!gameState.active || gameState.currentId !== 'flags') return;
    const gs = gameState.flags;
    if(gs.idx >= gs.perLevel) { gs._sessionScore={correct:gs.score,total:gs.perLevel}; levelComplete(); return; }
    const item = gs.pool[gs.idx % gs.pool.length];
    const isHe = currentLang === 'he';
    c.innerHTML = `<div class="max-w-md w-full text-center">
        <div class="flex justify-between text-sm font-bold text-gray-400 mb-4"><span>${isHe?'שאלה':'Q'} ${gs.idx+1}/${gs.perLevel}</span><span class="text-green-600">&#10003; ${gs.score}</span></div>
        <div class="text-8xl mb-6 select-none leading-none" style="font-family:serif;font-size:clamp(4rem,20vw,8rem)">${item.flag}</div>
        <div class="flex flex-col gap-3">${item.opts.map((o,i)=>`<button onclick="answerFlag(${i},${item.a})" class="py-4 text-xl font-bold rounded-xl border-2 border-gray-200 bg-white hover:border-[#b7791f] hover:bg-amber-50 active:scale-95 transition">${o}</button>`).join('')}</div>
    </div>`;
}
function answerFlag(sel, correct) {
    if(!gameState.active || gameState.currentId !== 'flags') return;
    const gs = gameState.flags;
    if(sel === correct) { sfxCorrect(); gs.score++; } else sfxWrong();
    gs.idx++;
    setTimeout(() => _flagNext(document.getElementById('gameContent')), sel===correct ? 350 : 800);
}
