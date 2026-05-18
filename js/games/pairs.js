// ═══════════════════════════════════════════════════════════════════════════════
// GAME 12: OPPOSITES PAIRS
// ═══════════════════════════════════════════════════════════════════════════════
function initPairs(container){
    const state=gameState.pairs;
    const pool=i18nData[currentLang].pairs_pool;
    const count=Math.min(3+Math.floor(state.level/2),6);
    const selected=shuffle([...pool]).slice(0,count);
    state.pairs_data=selected; state.selectedA=null; state.matched=0; state.total=count;
    // Build flat list: A words + B words shuffled together
    const all=[...selected.map((p,i)=>({text:p.a,type:'a',idx:i})),...selected.map((p,i)=>({text:p.b,type:'b',idx:i}))];
    shuffle(all);
    let html=`<div class="flex flex-wrap justify-center gap-3 max-w-lg" id="pairsGrid">`;
    all.forEach((item,i)=>{html+=`<button id="pc-${i}" class="pair-chip" data-idx="${item.idx}" data-type="${item.type}" onclick="clickPair(${i})">${item.text}</button>`;});
    container.innerHTML=html+`</div>`;
}
function clickPair(i){
    const state=gameState.pairs;
    const el=document.getElementById(`pc-${i}`);
    if(el.classList.contains('matched'))return;
    const type=el.dataset.type,idx=parseInt(el.dataset.idx);
    if(!state.selectedA){state.selectedA={el,idx,type};el.classList.add(type==='a'?'selected-a':'selected-b');}
    else{
        const prev=state.selectedA;
        if(prev.el===el){el.classList.remove('selected-a','selected-b');state.selectedA=null;return;}
        if(prev.idx===idx&&prev.type!==type){
            sfxCorrect(); prev.el.classList.remove('selected-a','selected-b'); prev.el.classList.add('matched'); el.classList.add('matched');
            state.selectedA=null; state.matched++;
            if(state.matched===state.total)setTimeout(()=>levelComplete(),500);
        } else {
            sfxWrong(); el.classList.add('wrong'); prev.el.classList.add('wrong');
            setTimeout(()=>{el.classList.remove('wrong','selected-a','selected-b');prev.el.classList.remove('wrong','selected-a','selected-b');state.selectedA=null;},600);
        }
    }
}
