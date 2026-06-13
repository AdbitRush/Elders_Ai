// ═══════════════════════════════════════════════════════════════════════════════
// GAME 1: MEMORY
// ═══════════════════════════════════════════════════════════════════════════════
function initMemory(container) {
    const state=gameState.memory;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    const base=3+Math.floor(state.level/2);
    const adjusted=_d==='easy'?Math.max(2,base-1):_d==='hard'?base+2:base;
    state.pairs=Math.min(adjusted,12); state.flipped=[]; state.matched=0;
    const icons=shuffle([...ALL_EMOJIS]).slice(0,state.pairs);
    const cards=shuffle([...icons,...icons]);
    let html=`<div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full max-w-2xl">`;
    cards.forEach((icon,i)=>{html+=`<div class="aspect-square relative text-3xl md:text-5xl"><div class="card-inner w-full h-full" data-val="${icon}" id="m-card-${i}" onclick="flipMemory(${i})"><div class="card-face w-full h-full absolute bg-slate-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center">?</div><div class="card-face card-back w-full h-full absolute bg-white border-4 border-slate-700 rounded-xl shadow-md flex items-center justify-center">${icon}</div></div></div>`;});
    container.innerHTML=html+`</div>`;
}
function flipMemory(i) {
    const card=document.getElementById(`m-card-${i}`),state=gameState.memory;
    if(state.flipped.length===2||card.classList.contains('flipped')||card.classList.contains('matched'))return;
    sfxFlip(); card.classList.add('flipped'); state.flipped.push(card);
    if(state.flipped.length===2){
        const[c1,c2]=state.flipped;
        if(c1.dataset.val===c2.dataset.val){c1.classList.add('matched');c2.classList.add('matched');sfxCorrect();state.matched++;state.flipped=[];if(state.matched===state.pairs)setTimeout(()=>levelComplete(),600);}
        else{setTimeout(()=>{c1.classList.remove('flipped');c2.classList.remove('flipped');state.flipped=[];},1000);}
    }
}
