// ═══════════════════════════════════════════════════════════════════════════════
// GAME 15: PROVERBS
// ═══════════════════════════════════════════════════════════════════════════════
function initProverbs(c) {
    const gs = gameState.proverbs;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    gs.pool = shuffle([...i18nData[currentLang].proverbs_pool]);
    gs.idx = 0; gs.perLevel = _d==='easy'?4:_d==='hard'?9:6; gs.score = 0;
    _provNext(c);
}
function _provNext(c) {
    if(!gameState.active || gameState.currentId !== 'proverbs') return;
    const gs = gameState.proverbs;
    if(gs.idx >= gs.perLevel) { gs._sessionScore={correct:gs.score,total:gs.perLevel}; levelComplete(); return; }
    const item = gs.pool[gs.idx % gs.pool.length];
    const isHe = currentLang === 'he';
    c.innerHTML = `<div class="max-w-xl w-full text-center">
        <div class="flex justify-between text-sm font-bold text-gray-400 mb-4"><span>${isHe?'פתגם':'Proverb'} ${gs.idx+1}/${gs.perLevel}</span><span class="text-green-600">&#10003; ${gs.score}</span></div>
        <div class="text-xl md:text-2xl font-bold text-[#1a365d] bg-amber-50 border border-amber-200 p-6 rounded-2xl mb-8 leading-relaxed italic">"${item.q}"</div>
        <div class="grid grid-cols-2 gap-3">${item.opts.map((o,i)=>`<button onclick="answerProv(${i},${item.a})" class="py-4 px-3 text-lg font-bold rounded-xl border-2 border-gray-200 bg-white hover:border-[#1a365d] hover:bg-blue-50 active:scale-95 transition">${o}</button>`).join('')}</div>
    </div>`;
}
function answerProv(sel, correct) {
    if(!gameState.active || gameState.currentId !== 'proverbs') return;
    const gs = gameState.proverbs;
    if(sel === correct) { sfxCorrect(); gs.score++; } else sfxWrong();
    gs.idx++;
    setTimeout(() => _provNext(document.getElementById('gameContent')), sel===correct ? 350 : 800);
}
