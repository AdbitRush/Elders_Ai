// ═══════════════════════════════════════════════════════════════════════════════
// GAME 3: QUICK MATH — 10-question session
// ═══════════════════════════════════════════════════════════════════════════════
function initMath(container) {
    const gs=gameState.math;
    gs._sq=10; gs._si=0; gs._ss=0;
    _mathNext(container);
}
function _mathNext(container) {
    if(!gameState.active||gameState.currentId!=='math')return;
    const gs=gameState.math;
    if(gs._si>=gs._sq){gs._sessionScore={correct:gs._ss,total:gs._sq};levelComplete();return;}
    const maxVal=10+(gs.level*3),isAdd=Math.random()>0.4;
    let a,b,answer;
    if(isAdd){a=Math.floor(Math.random()*maxVal)+1;b=Math.floor(Math.random()*maxVal)+1;answer=a+b;}
    else{a=Math.floor(Math.random()*maxVal)+5;b=Math.floor(Math.random()*a);answer=a-b;}
    let opts=new Set([answer]);
    while(opts.size<4){const f=answer+(Math.floor(Math.random()*9)-4);if(f>=0&&f!==answer)opts.add(f);}
    const optsArr=shuffle(Array.from(opts));
    const isHe=currentLang==='he';
    container.innerHTML=`<div class="w-full max-w-sm mx-auto text-center">
        <div class="flex justify-between text-sm font-bold text-gray-400 mb-5">
            <span>${isHe?'שאלה':'Q'} ${gs._si+1}/${gs._sq}</span>
            <span class="text-green-600">✓ ${gs._ss}</span>
        </div>
        <div class="text-6xl font-bold mb-10 text-slate-800" dir="ltr">${a} ${isAdd?'+':'-'} ${b} = ?</div>
        <div class="grid grid-cols-2 gap-5 w-full">
            ${optsArr.map(opt=>`<button onclick="answerMath(${opt},${answer})" class="bg-blue-50 border-2 border-blue-200 hover:border-blue-500 text-3xl font-bold py-6 rounded-2xl transition shadow-sm active:scale-95">${opt}</button>`).join('')}
        </div></div>`;
}
function answerMath(sel,cor) {
    if(!gameState.active||gameState.currentId!=='math')return;
    const gs=gameState.math;
    const btn=event.target;
    if(sel===cor){
        sfxCorrect(); gs._ss++;
        btn.classList.replace('bg-blue-50','bg-green-100'); btn.classList.replace('border-blue-200','border-green-400');
        setTimeout(()=>{gs._si++;_mathNext(document.getElementById('gameContent'));},500);
    } else {
        sfxWrong();
        btn.classList.replace('bg-blue-50','bg-red-100'); btn.classList.replace('border-blue-200','border-red-300');
        setTimeout(()=>{btn.classList.replace('bg-red-100','bg-blue-50');btn.classList.replace('border-red-300','border-blue-200');},600);
    }
}
