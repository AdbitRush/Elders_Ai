// ═══════════════════════════════════════════════════════════════════════════════
// GAME 22: QUICK COUNT — how many target emojis are in the grid?
// ═══════════════════════════════════════════════════════════════════════════════
const _CNT_EMOJIS=['🦋','🌸','🍎','⭐','🐟','🍀','☀️','🎈','🐦','🍇'];
function initCounting(container){
    const gs=gameState.counting;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    gs._sq=(typeof Levels!=='undefined')?Levels.count('counting',_d==='easy'?5:_d==='hard'?9:7,0.5,14):7;
    gs._si=0; gs._ss=0;
    _cntNext(container);
}
function _cntNext(container){
    if(!gameState.active||gameState.currentId!=='counting')return;
    const gs=gameState.counting;
    if(gs._si>=gs._sq){gs._sessionScore={correct:gs._ss,total:gs._sq};levelComplete();return;}
    const isHe=currentLang==='he';
    const lvl=gs.level||1;
    const gridSize=Math.min(48,16+lvl*3);                 // grid grows with level
    const nKinds=Math.min(_CNT_EMOJIS.length,3+Math.floor(lvl/3));
    const kinds=shuffle([..._CNT_EMOJIS]).slice(0,nKinds);
    const target=kinds[0];
    const targetCount=3+Math.floor(Math.random()*Math.min(9,3+lvl));
    const cells=[];
    for(let i=0;i<targetCount;i++)cells.push(target);
    while(cells.length<gridSize){cells.push(kinds[1+Math.floor(Math.random()*(nKinds-1))]);}
    gs._answer=targetCount;
    const opts=new Set([targetCount]);
    while(opts.size<4){const d=targetCount+Math.ceil(Math.random()*3)*(Math.random()<0.5?-1:1);if(d>0)opts.add(d);}
    let html=`<div class="max-w-2xl w-full text-center">
      <div class="flex justify-between text-sm font-bold text-gray-400 mb-2"><span>${isHe?'סיבוב':'Round'} ${gs._si+1}/${gs._sq}</span><span class="text-green-600">✓ ${gs._ss}</span></div>
      <p class="text-xl text-gray-600 mb-4 font-bold">${isHe?`כמה ${target} יש בתמונה?`:`How many ${target} do you see?`}</p>
      <div class="bg-white rounded-2xl p-5 mb-6 shadow-inner text-3xl md:text-4xl leading-relaxed" style="letter-spacing:.35rem">${shuffle(cells).join('')}</div>
      <div class="grid grid-cols-4 gap-3">`;
    shuffle([...opts]).forEach(o=>{
        html+=`<button onclick="_cntAnswer(this,${o})" class="bg-white border-2 border-gray-200 hover:border-[#b7791f] text-3xl font-bold p-4 rounded-xl transition shadow-sm">${o}</button>`;
    });
    container.innerHTML=html+`</div></div>`;
}
function _cntAnswer(btn,val){
    const gs=gameState.counting;
    const isC=val===gs._answer;
    if(isC){sfxCorrect();gs._ss++;}else sfxWrong();
    btn.classList.replace('border-gray-200',isC?'border-green-500':'border-red-500');
    btn.classList.add(isC?'bg-green-50':'bg-red-50');
    gs._si++;
    setTimeout(()=>_cntNext(document.getElementById('gameContent')),isC?450:1100);
}
