// ═══════════════════════════════════════════════════════════════════════════════
// GAME 11: WORD UNSCRAMBLE — 7-word session
// ═══════════════════════════════════════════════════════════════════════════════
function initUnscramble(container){
    const state=gameState.unscramble;
    state._sq=7; state._si=0; state._ss=0;
    _unscrambleNext(container);
}
function _unscrambleNext(container){
    if(!gameState.active||gameState.currentId!=='unscramble')return;
    const state=gameState.unscramble;
    if(state._si>=state._sq){state._sessionScore={correct:state._ss,total:state._sq};levelComplete();return;}
    const pool=i18nData[currentLang].unscramble_pool;
    const item=pool[Math.floor(Math.random()*pool.length)];
    const word=item.word, letters=shuffle(word.split(''));
    state.word=word; state.answer=[]; state.letterEls=letters;
    const isHe=currentLang==='he';
    let tilesHtml=letters.map((l,i)=>`<span class="letter-tile" id="lt-${i}" onclick="pickLetter('${l}',${i})">${l}</span>`).join('');
    let ansHtml=word.split('').map((_,i)=>`<span class="answer-tile" id="at-${i}">&nbsp;</span>`).join('');
    container.innerHTML=`<div class="text-center">
        <div class="flex justify-between text-sm font-bold text-gray-400 mb-4 px-2">
            <span>${isHe?'מילה':'Word'} ${state._si+1}/${state._sq}</span>
            <span class="text-green-600">&#10003; ${state._ss}</span>
        </div>
        <div class="text-gray-400 text-base mb-4">${isHe?'רמז':'Hint'}: <span class="font-semibold text-gray-600">${item.hint}</span></div>
        <div class="flex flex-wrap justify-center gap-1 mb-8">${tilesHtml}</div>
        <div class="flex flex-wrap justify-center gap-1 mb-6 min-h-[60px]">${ansHtml}</div>
        <button onclick="clearUnscramble()" class="px-5 py-2 bg-gray-100 rounded-xl text-gray-600 font-bold hover:bg-gray-200 transition text-sm">${isHe?'נקה':'Clear'}</button>
    </div>`;
}
function pickLetter(letter,idx){
    const state=gameState.unscramble;
    const el=document.getElementById(`lt-${idx}`);
    if(el.classList.contains('used'))return;
    sfxFlip(); el.classList.add('used');
    state.answer.push({letter,idx});
    const pos=state.answer.length-1;
    const atEl=document.getElementById(`at-${pos}`); if(atEl)atEl.innerText=letter;
    if(state.answer.length===state.word.length){
        const formed=state.answer.map(x=>x.letter).join('');
        setTimeout(()=>{
            if(formed===state.word){
                sfxCorrect(); state._ss++;
                setTimeout(()=>{state._si++;_unscrambleNext(document.getElementById('gameContent'));},400);
            } else {
                sfxWrong(); clearUnscramble();
            }
        },300);
    }
}
function clearUnscramble(){
    const state=gameState.unscramble;
    state.answer=[];
    state.letterEls.forEach((_,i)=>{const el=document.getElementById(`lt-${i}`);if(el)el.classList.remove('used');});
    state.word.split('').forEach((_,i)=>{const el=document.getElementById(`at-${i}`);if(el)el.innerText=' ';});
}
