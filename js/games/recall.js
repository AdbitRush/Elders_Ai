// ═══════════════════════════════════════════════════════════════════════════════
// GAME 17: WORD RECALL
// ═══════════════════════════════════════════════════════════════════════════════
function initRecall(c) {
    if(!gameState.active) return;
    const gs = gameState.recall;
    const level = gs.level || 1;
    const showCount = Math.min(3 + level, 8);
    const pool = shuffle([...i18nData[currentLang].recall_pool]);
    gs.targets = pool.slice(0, showCount);
    gs.distractors = pool.slice(showCount, showCount + showCount + 2);
    gs.selected = new Set();
    _recallStudy(c);
}
function _recallStudy(c) {
    const gs = gameState.recall;
    const isHe = currentLang === 'he';
    const items = gs.targets.map(it => {
        const [em, ...words] = it.split(' ');
        return `<div class="flex flex-col items-center gap-1 p-3 bg-white rounded-xl border-2 border-blue-200 shadow-sm"><div style="font-size:2.2rem">${em}</div><div class="text-sm font-bold text-gray-700 text-center">${words.join(' ')}</div></div>`;
    }).join('');
    c.innerHTML = `<div class="max-w-xl w-full text-center">
        <div class="text-xl font-bold text-[#1a365d] mb-3">${isHe?'📖 זכרו את הפריטים האלה:':'📖 Study these items:'}</div>
        <div class="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">${items}</div>
        <button onclick="_recallTest()" class="py-4 px-8 rounded-xl bg-[#1a365d] text-white font-bold text-xl hover:bg-[#2c5282] transition shadow-lg">${isHe?'✅ זכרתי! קדימה':'✅ Got them! Continue'}</button>
    </div>`;
}
function _recallTest() {
    if(!gameState.active) return;
    const gs = gameState.recall;
    const isHe = currentLang === 'he';
    gs.selected = new Set();
    gs._all = shuffle([...gs.targets, ...gs.distractors]);
    const itemsHtml = gs._all.map((it, i) => {
        const [em, ...words] = it.split(' ');
        return `<div onclick="_toggleRecall(${i},this)" class="recall-item flex flex-col items-center gap-1 p-3 bg-white rounded-xl border-2 border-gray-200 shadow-sm cursor-pointer hover:border-blue-400 hover:bg-blue-50 active:scale-95 transition select-none"><div style="font-size:2rem;pointer-events:none">${em}</div><div class="text-xs font-bold text-gray-600 text-center pointer-events-none">${words.join(' ')}</div></div>`;
    }).join('');
    const c = document.getElementById('gameContent');
    c.innerHTML = `<div class="max-w-xl w-full text-center">
        <div class="text-xl font-bold text-[#1a365d] mb-3">${isHe?'🔍 בחרו את הפריטים שראיתם:':'🔍 Select the items you saw:'}</div>
        <div class="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">${itemsHtml}</div>
        <button onclick="_checkRecall()" class="py-4 px-8 rounded-xl bg-[#b7791f] text-white font-bold text-xl hover:opacity-90 active:scale-95 transition shadow-lg">${isHe?'✅ בדיקה':'✅ Check'}</button>
    </div>`;
}
function _toggleRecall(idx, el) {
    const gs = gameState.recall;
    if(gs.selected.has(idx)) { gs.selected.delete(idx); el.classList.remove('border-blue-500','bg-blue-100'); el.classList.add('border-gray-200'); }
    else { gs.selected.add(idx); el.classList.add('border-blue-500','bg-blue-100'); el.classList.remove('border-gray-200'); }
}
function _checkRecall() {
    if(!gameState.active) return;
    const gs = gameState.recall;
    const isHe = currentLang === 'he';
    const targetSet = new Set(gs.targets);
    let correct = 0, wrong = 0;
    gs.selected.forEach(i => { if(targetSet.has(gs._all[i])) correct++; else wrong++; });
    const missed = gs.targets.length - correct;
    if(wrong === 0 && missed === 0) { sfxWin(); setTimeout(()=>levelComplete(), 400); }
    else if(correct >= Math.ceil(gs.targets.length * 0.7) && wrong <= 1) { sfxCorrect(); setTimeout(()=>levelComplete(), 400); }
    else {
        sfxWrong();
        const c = document.getElementById('gameContent');
        const msg = isHe ? `מצאתם ${correct} מתוך ${gs.targets.length}` : `Found ${correct} of ${gs.targets.length}`;
        const info = document.createElement('div');
        info.className = 'mt-4 text-orange-600 font-bold text-lg';
        info.innerHTML = `${msg}<br><button onclick="initRecall(document.getElementById('gameContent'))" class="mt-3 py-3 px-6 rounded-xl bg-[#1a365d] text-white font-bold text-base hover:bg-[#2c5282] transition">${isHe?'🔄 נסו שוב':'🔄 Try Again'}</button>`;
        c.appendChild(info);
    }
}
