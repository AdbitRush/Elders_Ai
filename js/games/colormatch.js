// ═══════════════════════════════════════════════════════════════════════════════
// GAME 19: COLOR MATCH (Stroop) — tap the INK color, not the word
// ═══════════════════════════════════════════════════════════════════════════════
const _CM_COLORS=[
    {id:'red',    he:'אדום',  en:'Red',    hex:'#ef4444'},
    {id:'blue',   he:'כחול',  en:'Blue',   hex:'#3b82f6'},
    {id:'green',  he:'ירוק',  en:'Green',  hex:'#22c55e'},
    {id:'yellow', he:'צהוב',  en:'Yellow', hex:'#eab308'},
    {id:'purple', he:'סגול',  en:'Purple', hex:'#a855f7'},
    {id:'orange', he:'כתום',  en:'Orange', hex:'#f97316'},
];
function initColorMatch(container){
    const gs=gameState.colormatch;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    gs._sq=(typeof Levels!=='undefined')?Levels.count('colormatch',_d==='easy'?6:_d==='hard'?10:8,0.5,20):8;
    gs._si=0; gs._ss=0;
    _cmNext(container);
}
function _cmNext(container){
    if(!gameState.active||gameState.currentId!=='colormatch')return;
    const gs=gameState.colormatch;
    if(gs._si>=gs._sq){gs._sessionScore={correct:gs._ss,total:gs._sq};levelComplete();return;}
    const isHe=currentLang==='he';
    // Higher levels use more colors (4 → 6)
    const nColors=Math.min(_CM_COLORS.length,4+Math.floor(((gs.level||1)-1)/4));
    const palette=shuffle([..._CM_COLORS]).slice(0,nColors);
    const word=palette[Math.floor(Math.random()*palette.length)];
    let ink=palette[Math.floor(Math.random()*palette.length)];
    // From level 2 on, force the tricky mismatch most of the time
    if((gs.level||1)>1&&Math.random()<0.8){const others=palette.filter(c=>c.id!==word.id);ink=others[Math.floor(Math.random()*others.length)];}
    gs._answer=ink.id;
    let html=`<div class="max-w-xl w-full text-center">
      <div class="flex justify-between text-sm font-bold text-gray-400 mb-2"><span>${isHe?'סיבוב':'Round'} ${gs._si+1}/${gs._sq}</span><span class="text-green-600">✓ ${gs._ss}</span></div>
      <p class="text-lg text-gray-500 mb-4 font-bold">${isHe?'באיזה צבע המילה צבועה? (לא מה כתוב!)':'What COLOR is the word painted in? (not what it says!)'}</p>
      <div class="text-6xl md:text-7xl font-black mb-10 py-8 bg-white rounded-2xl shadow-inner" style="color:${ink.hex}">${isHe?word.he:word.en}</div>
      <div class="grid grid-cols-2 gap-4">`;
    shuffle([...palette]).forEach(c=>{
        html+=`<button onclick="_cmAnswer('${c.id}')" class="text-white text-2xl font-bold p-5 rounded-xl shadow-md transition hover:scale-105" style="background:${c.hex}">${isHe?c.he:c.en}</button>`;
    });
    container.innerHTML=html+`</div></div>`;
}
function _cmAnswer(id){
    const gs=gameState.colormatch;
    const isC=id===gs._answer;
    if(isC){sfxCorrect();gs._ss++;}else sfxWrong();
    gs._si++;
    setTimeout(()=>_cmNext(document.getElementById('gameContent')),isC?350:800);
}
