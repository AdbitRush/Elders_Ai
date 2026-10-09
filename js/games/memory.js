// ═══════════════════════════════════════════════════════════════════════════════
// GAME 1: MEMORY
// ═══════════════════════════════════════════════════════════════════════════════
function initMemory(container) {
    const state=gameState.memory;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    const base=3+Math.floor(state.level/2);
    const adjusted=_d==='easy'?Math.max(2,base-1):_d==='hard'?base+2:base;
    // Always a full, even grid (2026-10-09): 8, 12, 16, 20 or 24 cards. Odd pair counts left an orphan card
    // (6 cards laid out 5+1). The column count divides the card count exactly; css/warm.css widens it on desktop.
    state.pairs=Math.min(12,Math.max(4,adjusted+(adjusted%2))); state.flipped=[]; state.matched=0;
    const icons=shuffle([...ALL_EMOJIS]).slice(0,state.pairs);
    const cards=shuffle([...icons,...icons]);
    const n=cards.length, wide=n===20?5:n===24?6:4;
    let html=`<div class="mem-grid grid gap-3 md:gap-4 w-full mx-auto" data-cards="${n}" style="grid-template-columns:repeat(4,minmax(0,1fr));--mem-cols:${wide}">`;
    cards.forEach((icon,i)=>{html+=`<div class="aspect-square relative text-3xl md:text-5xl"><div class="card-inner w-full h-full" data-val="${icon}" id="m-card-${i}" onclick="flipMemory(${i})"><div class="card-face mem-back w-full h-full absolute rounded-xl shadow-md flex items-center justify-center">${Icon.svg('brain',{size:'46%',sw:1.7})}</div><div class="card-face card-back mem-face w-full h-full absolute bg-white border-4 border-slate-700 rounded-xl shadow-md flex items-center justify-center">${Icon.sym(icon,{size:'100%'})}</div></div></div>`;});
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
