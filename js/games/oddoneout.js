// ═══════════════════════════════════════════════════════════════════════════════
// GAME 2: ODD ONE OUT — 10-round session
// ═══════════════════════════════════════════════════════════════════════════════
function initOddOneOut(container) {
    const gs=gameState.oddoneout;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    gs._sq=_d==='easy'?6:_d==='hard'?14:10; gs._si=0; gs._ss=0;
    _oddNext(container);
}
function _oddNext(container) {
    if(!gameState.active||gameState.currentId!=='oddoneout')return;
    const gs=gameState.oddoneout;
    if(gs._si>=gs._sq){gs._sessionScore={correct:gs._ss,total:gs._sq};levelComplete();return;}
    const p=ODD_SETS[Math.floor(Math.random()*ODD_SETS.length)];
    const main=p[0],odd=p[Math.floor(Math.random()*(p.length-1))+1],oi=Math.floor(Math.random()*16);
    const isHe=currentLang==='he';
    let html=`<div class="w-full max-w-sm mx-auto">
        <div class="flex justify-between text-sm font-bold text-gray-400 mb-4">
            <span>${isHe?'סיבוב':'Round'} ${gs._si+1}/${gs._sq}</span>
            <span class="text-green-600">✓ ${gs._ss}</span>
        </div>
        <div class="grid grid-cols-4 gap-3 bg-gray-50 p-4 rounded-2xl border">`;
    for(let i=0;i<16;i++){const isOdd=(i===oi);html+=`<div onclick="clickOdd(${isOdd},this)" class="w-14 h-14 md:w-18 md:h-18 bg-white border shadow-sm rounded-xl flex items-center justify-center text-3xl md:text-4xl cursor-pointer hover:bg-amber-50 transition hover:scale-105 active:scale-95">${isOdd?odd:main}</div>`;}
    container.innerHTML=html+`</div></div>`;
}
function clickOdd(isOdd, el) {
    if(!gameState.active||gameState.currentId!=='oddoneout')return;
    const gs=gameState.oddoneout;
    if(isOdd){
        sfxCorrect(); gs._ss++;
        el.classList.replace('bg-white','bg-green-100');
        setTimeout(()=>{gs._si++;_oddNext(document.getElementById('gameContent'));},500);
    } else {
        sfxWrong();
        el.classList.replace('bg-white','bg-red-100');
        setTimeout(()=>el.classList.replace('bg-red-100','bg-white'),400);
    }
}
