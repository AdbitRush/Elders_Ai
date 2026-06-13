// ═══════════════════════════════════════════════════════════════════════════════
// GAME 9: TRIVIA
// ═══════════════════════════════════════════════════════════════════════════════
function initTrivia(container){
    const state=gameState.trivia;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    const _tq=_d==='easy'?6:_d==='hard'?12:10;
    state.questions=shuffle([...i18nData[currentLang].trivia_pool]).slice(0,_tq);
    state.current=0; state.score=0; renderTriviaQuestion(container);
}
function renderTriviaQuestion(container){
    if(!gameState.active)return;
    const state=gameState.trivia;
    if(state.current>=state.questions.length){state._sessionScore={correct:state.score,total:state.questions.length};levelComplete();return;}
    const q=state.questions[state.current];
    const isHe=currentLang==='he';
    let html=`<div class="max-w-xl w-full"><div class="flex justify-between text-sm font-bold text-gray-400 mb-2"><span>${isHe?'שאלה':'Question'} ${state.current+1}/${state.questions.length}</span><span class="text-green-600">✓ ${state.score}</span></div><h3 class="text-2xl md:text-3xl font-bold mb-8 text-center text-[#1a365d] bg-blue-50 p-5 rounded-xl">${q.q}</h3><div class="flex flex-col gap-3">`;
    q.opts.forEach((opt,idx)=>{html+=`<button onclick="answerTrivia(${idx},${q.a})" class="bg-white border-2 border-gray-200 hover:border-[#b7791f] text-xl p-4 rounded-xl text-right md:text-center transition shadow-sm">${opt}</button>`;});
    container.innerHTML=html+`</div></div>`;
}
function answerTrivia(sel,cor){
    const isC=sel===cor;
    if(isC){sfxCorrect();gameState.trivia.score++;}else sfxWrong();
    event.target.classList.replace('border-gray-200',isC?'border-green-500':'border-red-500');
    event.target.classList.add(isC?'bg-green-50':'bg-red-50');
    setTimeout(()=>{gameState.trivia.current++;renderTriviaQuestion(document.getElementById('gameContent'));},700);
}
