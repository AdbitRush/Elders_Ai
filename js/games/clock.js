// ═══════════════════════════════════════════════════════════════════════════════
// GAME 21: CLOCK READING — read the analog clock, pick the right time
// ═══════════════════════════════════════════════════════════════════════════════
function initClock(container){
    const gs=gameState.clock;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    gs._sq=(typeof Levels!=='undefined')?Levels.count('clock',_d==='easy'?5:_d==='hard'?10:7,0.5,15):7;
    gs._si=0; gs._ss=0;
    _clkNext(container);
}
function _clkFmt(h,m){return `${h}:${String(m).padStart(2,'0')}`;}
function _clkSvg(h,m){
    const hDeg=(h%12)*30+m*0.5, mDeg=m*6;
    let ticks='';
    for(let i=0;i<12;i++){const a=i*30*Math.PI/180;
        ticks+=`<line x1="${100+82*Math.sin(a)}" y1="${100-82*Math.cos(a)}" x2="${100+90*Math.sin(a)}" y2="${100-90*Math.cos(a)}" stroke="#1a365d" stroke-width="${i%3===0?5:2}"/>`;
        const n=i===0?12:i;
        ticks+=`<text x="${100+68*Math.sin(a)}" y="${100-68*Math.cos(a)+7}" text-anchor="middle" font-size="19" font-weight="bold" fill="#1a365d">${n}</text>`;}
    return `<svg viewBox="0 0 200 200" class="w-56 h-56 md:w-64 md:h-64 mx-auto">
      <circle cx="100" cy="100" r="96" fill="#fff" stroke="#1a365d" stroke-width="6"/>${ticks}
      <line x1="100" y1="100" x2="${100+45*Math.sin(hDeg*Math.PI/180)}" y2="${100-45*Math.cos(hDeg*Math.PI/180)}" stroke="#1a365d" stroke-width="8" stroke-linecap="round"/>
      <line x1="100" y1="100" x2="${100+68*Math.sin(mDeg*Math.PI/180)}" y2="${100-68*Math.cos(mDeg*Math.PI/180)}" stroke="#b7791f" stroke-width="5" stroke-linecap="round"/>
      <circle cx="100" cy="100" r="7" fill="#1a365d"/></svg>`;
}
function _clkNext(container){
    if(!gameState.active||gameState.currentId!=='clock')return;
    const gs=gameState.clock;
    if(gs._si>=gs._sq){gs._sessionScore={correct:gs._ss,total:gs._sq};levelComplete();return;}
    const isHe=currentLang==='he';
    // Levels 1-4: quarter hours · 5-9: 5-min steps · 10+: any minute
    const lvl=gs.level||1;
    const step=lvl<5?15:lvl<10?5:1;
    const h=1+Math.floor(Math.random()*12);
    const m=Math.floor(Math.random()*(60/step))*step;
    gs._answer=_clkFmt(h,m);
    const opts=new Set([gs._answer]);
    while(opts.size<4){
        const dh=Math.random()<0.5?h:1+Math.floor(Math.random()*12);
        const dm=Math.floor(Math.random()*(60/step))*step;
        opts.add(_clkFmt(dh,dm));
    }
    let html=`<div class="max-w-xl w-full text-center">
      <div class="flex justify-between text-sm font-bold text-gray-400 mb-2"><span>${isHe?'שעון':'Clock'} ${gs._si+1}/${gs._sq}</span><span class="text-green-600">✓ ${gs._ss}</span></div>
      <p class="text-lg text-gray-500 mb-4 font-bold">${isHe?'מה השעה?':'What time is it?'}</p>
      <div class="bg-blue-50 rounded-2xl py-6 mb-8 shadow-inner">${_clkSvg(h,m)}</div>
      <div class="grid grid-cols-2 gap-4" dir="ltr">`;
    shuffle([...opts]).forEach(o=>{
        html+=`<button onclick="_clkAnswer(this,'${o}')" class="bg-white border-2 border-gray-200 hover:border-[#b7791f] text-3xl font-bold p-5 rounded-xl transition shadow-sm">${o}</button>`;
    });
    container.innerHTML=html+`</div></div>`;
}
function _clkAnswer(btn,val){
    const gs=gameState.clock;
    const isC=val===gs._answer;
    if(isC){sfxCorrect();gs._ss++;}else sfxWrong();
    btn.classList.replace('border-gray-200',isC?'border-green-500':'border-red-500');
    btn.classList.add(isC?'bg-green-50':'bg-red-50');
    gs._si++;
    setTimeout(()=>_clkNext(document.getElementById('gameContent')),isC?450:1000);
}
