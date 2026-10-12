// ═══════════════════════════════════════════════════════════════════════════════
// GAME 22: QUICK COUNT — how many target emojis are in the grid?
// 2026-10-12: it is QUICK count now. Each round has a visible countdown (easy 20 s, normal 14 s, hard 10 s); a right
// answer scores 100 points + 10 per second left; time running out counts as a miss and shows the answer. The session
// still passes at 60% right answers (shared end screen); the result line gives the points and the average time.
// ═══════════════════════════════════════════════════════════════════════════════
const _CNT_EMOJIS=['🍎','🌸','⭐','🐟','🍀','🎈','🐦','🍇']; // keys into Icon.SYM: eight shapes in eight clearly different colours
const _CNT_SECS={easy:20,normal:14,hard:10};
function initCounting(container){
    const gs=gameState.counting;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    gs._sq=(typeof Levels!=='undefined')?Levels.count('counting',_d==='easy'?5:_d==='hard'?9:7,0.5,14):7;
    gs._si=0; gs._ss=0; gs._pts=0; gs._times=[]; gs._secs=_CNT_SECS[_d]||14;
    const prev=window._gameCleanup;
    window._gameCleanup=()=>{clearInterval(gs._tick);if(prev)prev();};
    _cntNext(container);
}
function _cntNext(container){
    const gs=gameState.counting; clearInterval(gs._tick);
    if(!gameState.active||gameState.currentId!=='counting')return;
    gs._locked=false;
    if(gs._si>=gs._sq){
        const n=gs._sq, avg=gs._times.length?(gs._times.reduce((a,b)=>a+b,0)/gs._times.length):0;
        const isHe=currentLang==='he';
        const txt=isHe?`${gs._ss} מתוך ${n} נכונות · ${gs._pts} נקודות · ממוצע ${avg.toFixed(1)} שניות לתשובה`
                      :`${gs._ss} of ${n} right · ${gs._pts} points · ${avg.toFixed(1)} s per answer on average`;
        gs._sessionScore={correct:gs._ss,total:n};
        return GameKit.finish('counting', gs._ss/n>=PASS_RATIO, txt);
    }
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
      <div class="flex justify-between text-sm font-bold text-gray-400 mb-2"><span>${gt('Round', 'סיבוב')} ${gs._si+1}/${gs._sq}</span><span class="cnt-pts">${gt('Points', 'נקודות')}: ${gs._pts}</span><span class="text-green-600">✓ ${gs._ss}</span></div>
      <div class="cnt-timer" role="timer" aria-live="off"><div class="cnt-bar" id="cnt-bar"></div><span id="cnt-sec">${gs._secs}</span></div>
      <p class="text-xl text-gray-600 mb-4 font-bold">${isHe?`כמה ${Icon.sym(target,{cls:'cnt-q'})} יש בתמונה?`:`How many ${Icon.sym(target,{cls:'cnt-q'})} do you see?`}</p>
      <div class="cnt-field bg-white rounded-2xl p-5 mb-6 shadow-inner">${shuffle(cells).map(e=>Icon.sym(e)).join('')}</div>
      <div class="grid grid-cols-4 gap-3">`;
    shuffle([...opts]).forEach(o=>{
        html+=`<button onclick="_cntAnswer(this,${o})" data-v="${o}" class="bg-white border-2 border-gray-200 hover:border-[#b7791f] text-3xl font-bold p-4 rounded-xl transition shadow-sm">${o}</button>`;
    });
    container.innerHTML=html+`</div></div>
    <style>.cnt-timer{position:relative;height:30px;border-radius:999px;background:#efe3cc;border:2px solid #c9a46a;overflow:hidden;margin:0 0 12px}
    .cnt-bar{position:absolute;inset:0 auto 0 0;width:100%;background:#16a34a;transition:width .25s linear}
    .cnt-bar.cnt-low{background:#dc2626}
    #cnt-sec{position:relative;font-weight:900;font-size:1.1rem;line-height:26px;color:#1f1406}
    .cnt-pts{color:#92400e}
    @media (prefers-reduced-motion:reduce){.cnt-bar{transition:none}}</style>`;
    gs._t0=Date.now();
    gs._tick=setInterval(()=>{
        if(!gameState.active||gameState.currentId!=='counting'||gs._locked){clearInterval(gs._tick);return;}
        const left=Math.max(0,gs._secs-(Date.now()-gs._t0)/1000);
        const bar=document.getElementById('cnt-bar'),sec=document.getElementById('cnt-sec');
        if(bar){bar.style.width=(left/gs._secs*100)+'%';bar.classList.toggle('cnt-low',left<=gs._secs*0.3);}
        if(sec)sec.textContent=Math.ceil(left);
        if(left<=0)_cntTimeUp();
    },250);
}
function _cntTimeUp(){
    const gs=gameState.counting; if(gs._locked)return; gs._locked=true; clearInterval(gs._tick);
    sfxWrong(); gs._times.push(gs._secs);
    const right=document.querySelector(`#gameContent [data-v="${gs._answer}"]`);
    if(right){right.classList.replace('border-gray-200','border-green-500');right.classList.add('bg-green-50');}
    const sec=document.getElementById('cnt-sec'); if(sec)sec.textContent=gt("Time's up!",'נגמר הזמן!');
    gs._si++;
    setTimeout(()=>_cntNext(document.getElementById('gameContent')),1400);
}
function _cntAnswer(btn,val){
    const gs=gameState.counting;
    if(gs._locked)return;gs._locked=true;  // one answer per round
    clearInterval(gs._tick);
    const took=Math.min(gs._secs,(Date.now()-gs._t0)/1000);
    gs._times.push(took);
    const isC=val===gs._answer;
    if(isC){sfxCorrect();gs._ss++;gs._pts+=100+Math.round(Math.max(0,gs._secs-took))*10;}else sfxWrong();
    btn.classList.replace('border-gray-200',isC?'border-green-500':'border-red-500');
    btn.classList.add(isC?'bg-green-50':'bg-red-50');
    gs._si++;
    setTimeout(()=>_cntNext(document.getElementById('gameContent')),isC?450:1100);
}
