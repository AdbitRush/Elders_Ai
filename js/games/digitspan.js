// ═══════════════════════════════════════════════════════════════════════════════
// GAME 20: DIGIT SPAN — memorize a number, type it back
// ═══════════════════════════════════════════════════════════════════════════════
function initDigitSpan(container){
    const gs=gameState.digitspan;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    const _adj=_d==='easy'?-1:_d==='hard'?1:0;
    gs._len=Math.min(9,Math.max(3,3+Math.floor(((gs.level||1)-1)/2)+_adj));  // digits per number
    gs._sq=5; gs._si=0; gs._ss=0;
    _dsNext(container);
}
function _dsNext(container){
    if(!gameState.active||gameState.currentId!=='digitspan')return;
    const gs=gameState.digitspan;
    if(gs._si>=gs._sq){gs._sessionScore={correct:gs._ss,total:gs._sq};levelComplete();return;}
    const isHe=currentLang==='he';
    let num='';
    for(let i=0;i<gs._len;i++)num+=Math.floor(Math.random()*10);
    gs._target=num; gs._input='';
    const showMs=1200+gs._len*450;
    container.innerHTML=`<div class="max-w-xl w-full text-center">
      <div class="flex justify-between text-sm font-bold text-gray-400 mb-2"><span>${isHe?'סיבוב':'Round'} ${gs._si+1}/${gs._sq}</span><span class="text-green-600">✓ ${gs._ss}</span></div>
      <p class="text-lg text-gray-500 mb-4 font-bold">${isHe?'זכרו את המספר!':'Memorize the number!'}</p>
      <div id="ds-display" class="text-6xl md:text-7xl font-black tracking-widest py-10 bg-blue-50 text-[#1a365d] rounded-2xl shadow-inner" dir="ltr">${num}</div>
      <div id="ds-pad" class="hidden"></div>
    </div>`;
    setTimeout(()=>_dsShowPad(),showMs);
}
function _dsShowPad(){
    if(!gameState.active||gameState.currentId!=='digitspan')return;
    const gs=gameState.digitspan;
    const isHe=currentLang==='he';
    document.getElementById('ds-display').innerHTML=`<span id="ds-typed" class="text-[#b7791f]">&nbsp;</span>`;
    const pad=document.getElementById('ds-pad');
    pad.classList.remove('hidden');
    let html=`<p class="text-lg text-gray-500 my-4 font-bold">${isHe?'הקלידו את המספר:':'Type the number:'}</p><div class="grid grid-cols-3 gap-3 max-w-xs mx-auto" dir="ltr">`;
    [1,2,3,4,5,6,7,8,9].forEach(d=>{html+=`<button onclick="_dsKey(${d})" class="bg-white border-2 border-gray-300 text-3xl font-bold py-4 rounded-xl shadow-sm hover:border-[#b7791f] transition">${d}</button>`;});
    html+=`<button onclick="_dsKey(-1)" class="bg-red-50 border-2 border-red-200 text-2xl font-bold py-4 rounded-xl">⌫</button>
           <button onclick="_dsKey(0)" class="bg-white border-2 border-gray-300 text-3xl font-bold py-4 rounded-xl shadow-sm hover:border-[#b7791f] transition">0</button>
           <button onclick="_dsKey(-2)" class="bg-green-600 text-white text-2xl font-bold py-4 rounded-xl">✓</button>`;
    pad.innerHTML=html+`</div>`;
}
function _dsKey(d){
    const gs=gameState.digitspan;
    if(d===-1){gs._input=gs._input.slice(0,-1);}
    else if(d===-2){
        const isC=gs._input===gs._target;
        if(isC){sfxCorrect();gs._ss++;}else sfxWrong();
        const el=document.getElementById('ds-typed');
        if(el&&!isC){el.innerHTML=`<span class="text-red-500 line-through">${gs._input||'—'}</span> <span class="text-green-600">${gs._target}</span>`;}
        gs._si++;
        setTimeout(()=>_dsNext(document.getElementById('gameContent')),isC?400:1600);
        return;
    }
    else if(gs._input.length<gs._len+2){gs._input+=d;}
    const el=document.getElementById('ds-typed');
    if(el)el.innerText=gs._input||' ';
}
