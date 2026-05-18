// ═══════════════════════════════════════════════════════════════════════════════
// GAME 13: TRUE / FALSE
// ═══════════════════════════════════════════════════════════════════════════════
function initTrueFalse(c) {
    const gs = gameState.truefalse;
    gs.pool = shuffle([...i18nData[currentLang].tf_pool]);
    gs.idx = 0; gs.perLevel = 8; gs.score = 0;
    _tfNext(c);
}
function _tfNext(c) {
    if(!gameState.active || gameState.currentId !== 'truefalse') return;
    const gs = gameState.truefalse;
    if(gs.idx >= gs.perLevel) { gs._sessionScore={correct:gs.score,total:gs.perLevel}; levelComplete(); return; }
    const item = gs.pool[gs.idx % gs.pool.length];
    const isHe = currentLang === 'he';
    c.innerHTML = `<div class="max-w-xl w-full text-center">
        <div class="flex justify-between text-sm font-bold text-gray-400 mb-4"><span>${isHe?'שאלה':'Q'} ${gs.idx+1}/${gs.perLevel}</span><span class="text-green-600">&#10003; ${gs.score}</span></div>
        <div class="text-2xl md:text-3xl font-bold text-[#1a365d] bg-blue-50 border border-blue-200 p-6 rounded-2xl mb-8 leading-relaxed">${item.s}</div>
        <div class="flex gap-4 justify-center">
            <button onclick="answerTF(true,${item.a})" class="flex-1 py-5 text-xl font-bold rounded-2xl bg-green-500 text-white hover:bg-green-600 active:scale-95 transition shadow-lg" style="max-width:180px">${isHe?'✅ נכון':'✅ True'}</button>
            <button onclick="answerTF(false,${item.a})" class="flex-1 py-5 text-xl font-bold rounded-2xl bg-red-500 text-white hover:bg-red-600 active:scale-95 transition shadow-lg" style="max-width:180px">${isHe?'❌ לא נכון':'❌ False'}</button>
        </div>
    </div>`;
}
function answerTF(sel, correct) {
    if(!gameState.active || gameState.currentId !== 'truefalse') return;
    const gs = gameState.truefalse;
    if(sel === correct) { sfxCorrect(); gs.score++; } else sfxWrong();
    gs.idx++;
    setTimeout(() => _tfNext(document.getElementById('gameContent')), sel===correct ? 350 : 800);
}
