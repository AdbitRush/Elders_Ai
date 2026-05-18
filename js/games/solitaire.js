// ═══════════════════════════════════════════════════════════════════════════════
// GAME 8: SOLITAIRE
// ═══════════════════════════════════════════════════════════════════════════════
function initSolitaire(container) {
    const state=gameState.solitaire,po=[[1,12],[2,11],[3,10],[4,9],[5,8],[6,7],[13,13]];
    const pc=Math.min(5+state.level,10); let dc=[];
    for(let i=0;i<pc;i++){const p=po[Math.floor(Math.random()*po.length)];dc.push(p[0]);if(p[0]!==13)dc.push(p[1]);}
    const deck=shuffle(dc).map(v=>{let l=v;if(v===1)l='A';if(v===11)l='J';if(v===12)l='Q';if(v===13)l='K';return{val:v,label:l,suit:Math.random()>.5?'♥':'♠'};});
    state.cards=deck; state.selected=null; state.removed=0;
    let html=`<div class="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3">`;
    deck.forEach((card,i)=>{html+=`<div id="sol-card-${i}" class="playing-card w-16 h-24 md:w-20 md:h-28 text-2xl ${card.suit==='♥'?'red-suit':'black-suit'}" onclick="clickSolitaire(${i})"><div class="flex flex-col items-center"><span>${card.label}</span><span class="text-xl">${card.suit}</span></div></div>`;});
    container.innerHTML=html+`</div>`;
}
function clickSolitaire(i){
    const state=gameState.solitaire,el=document.getElementById(`sol-card-${i}`),card=state.cards[i];
    if(el.style.visibility==='hidden')return;
    if(card.val===13){sfxCorrect();el.style.visibility='hidden';state.removed++;checkSolitaireWin();return;}
    if(!state.selected){state.selected={index:i,el,val:card.val};el.classList.add('selected');}
    else if(state.selected.index===i){el.classList.remove('selected');state.selected=null;}
    else if(state.selected.val+card.val===13){sfxCorrect();el.style.visibility='hidden';state.selected.el.style.visibility='hidden';state.selected=null;state.removed+=2;checkSolitaireWin();}
    else{sfxWrong();state.selected.el.classList.remove('selected');state.selected={index:i,el,val:card.val};el.classList.add('selected');}
}
function checkSolitaireWin(){if(gameState.solitaire.removed>=gameState.solitaire.cards.length)setTimeout(()=>levelComplete(),500);}
