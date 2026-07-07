// ═══════════════════════════════════════════════════════════════════════════════
// GAME 26: LIVING SAFARI — a living animal world. Animals roam a savanna;
// find and tap the requested one. Attention + reaction, pure spectacle.
// ═══════════════════════════════════════════════════════════════════════════════
const _SF_ANIMALS=[
    {e:'🦒',he:'ג׳ירפה',en:'Giraffe'},{e:'🦁',he:'אריה',en:'Lion'},{e:'🐘',he:'פיל',en:'Elephant'},
    {e:'🦓',he:'זברה',en:'Zebra'},{e:'🦏',he:'קרנף',en:'Rhino'},{e:'🐆',he:'ברדלס',en:'Cheetah'},
    {e:'🦩',he:'פלמינגו',en:'Flamingo'},{e:'🐒',he:'קוף',en:'Monkey'},{e:'🦜',he:'תוכי',en:'Parrot'},
    {e:'🐢',he:'צב',en:'Turtle'},{e:'🦅',he:'עיט',en:'Eagle'},{e:'🐊',he:'תנין',en:'Crocodile'},
];
function initSafari(container){
    const gs=gameState.safari;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    const lvl=gs.level||1;
    gs._rounds=_d==='easy'?5:_d==='hard'?8:6;
    gs._nAnimals=Math.min(_SF_ANIMALS.length, (_d==='easy'?5:_d==='hard'?8:6)+Math.floor((lvl-1)/2));
    gs._speed=(_d==='easy'?0.35:_d==='hard'?0.9:0.55)+lvl*0.08;
    gs._ri=0; gs._found=0; gs._sprites=[]; gs._raf=null;
    const isHe=currentLang==='he';
    container.innerHTML=`<div class="max-w-3xl w-full">
      <div class="flex justify-between items-center mb-3">
        <span class="text-sm font-bold text-gray-400">${isHe?'סיבוב':'Round'} <span id="sf-round">1</span>/${gs._rounds}</span>
        <span id="sf-task" class="text-lg md:text-xl font-black text-amber-300"></span>
        <span class="text-sm font-bold text-green-400">✓ <span id="sf-score">0</span></span>
      </div>
      <div id="sf-world" dir="ltr" style="position:relative;height:min(58vh,460px);border-radius:22px;overflow:hidden;cursor:pointer;
        background:linear-gradient(180deg,#7dd3fc 0%,#fde68a 46%,#d9a552 62%,#b98a3f 100%);box-shadow:0 24px 60px -22px rgba(0,0,0,.6)">
        <div style="position:absolute;top:18px;left:26px;font-size:52px;filter:drop-shadow(0 0 24px rgba(255,200,0,.8));animation:floaty 6s ease-in-out infinite">☀️</div>
        <div style="position:absolute;top:34px;right:16%;font-size:40px;opacity:.9;animation:sfCloud 38s linear infinite">☁️</div>
        <div style="position:absolute;top:70px;right:55%;font-size:30px;opacity:.75;animation:sfCloud 52s linear infinite">☁️</div>
        <div style="position:absolute;bottom:34%;left:6%;font-size:56px">🌳</div>
        <div style="position:absolute;bottom:30%;right:8%;font-size:64px">🌳</div>
        <div style="position:absolute;bottom:6%;left:32%;font-size:26px">🌾</div>
        <div style="position:absolute;bottom:10%;right:30%;font-size:26px">🌾</div>
        <div style="position:absolute;bottom:4%;left:60%;font-size:24px">🌿</div>
      </div>
    </div>
    <style>
      @keyframes sfCloud{from{transform:translateX(12vw)}to{transform:translateX(-70vw)}}
      .sf-a{position:absolute;font-size:44px;user-select:none;transition:transform .18s;line-height:1;
        filter:drop-shadow(0 6px 8px rgba(0,0,0,.35))}
      .sf-a:hover{transform:scale(1.22)}
      @keyframes sfPop{0%{transform:scale(1)}45%{transform:scale(1.9) rotate(-8deg)}100%{transform:scale(0);opacity:0}}
      .sf-spark{position:absolute;font-size:30px;pointer-events:none;animation:sfPop .7s ease forwards}
    </style>`;
    const world=document.getElementById('sf-world');
    const pool=shuffle([..._SF_ANIMALS]).slice(0,gs._nAnimals);
    pool.forEach((a,i)=>{
        const el=document.createElement('div');
        el.className='sf-a'; el.textContent=a.e; el.dataset.id=a.e;
        el.onclick=(ev)=>{ev.stopPropagation();_sfTap(a.e,el);};
        world.appendChild(el);
        gs._sprites.push({a,el,x:8+Math.random()*80,y:38+Math.random()*52,
            vx:(Math.random()<.5?-1:1)*gs._speed*(0.6+Math.random()*0.8),
            vy:(Math.random()<.5?-1:1)*gs._speed*0.25,
            bob:Math.random()*6.28});
    });
    _sfNextTarget();
    const step=()=>{
        if(!gameState.active||gameState.currentId!=='safari'){cancelAnimationFrame(gs._raf);return;}
        gs._sprites.forEach(s=>{
            s.x+=s.vx*0.14; s.y+=s.vy*0.14; s.bob+=0.05;
            if(s.x<2||s.x>90){s.vx*=-1;s.x=Math.max(2,Math.min(90,s.x));}
            if(s.y<36||s.y>88){s.vy*=-1;s.y=Math.max(36,Math.min(88,s.y));}
            if(Math.random()<0.004){s.vx*=-1;}
            s.el.style.left=s.x+'%';
            s.el.style.top=(s.y+Math.sin(s.bob)*1.6)+'%';
            s.el.style.transform=`scaleX(${s.vx<0?-1:1})`;
        });
        gs._raf=requestAnimationFrame(step);
    };
    gs._raf=requestAnimationFrame(step);
}
function _sfNextTarget(){
    const gs=gameState.safari, isHe=currentLang==='he';
    const pick=gs._sprites[Math.floor(Math.random()*gs._sprites.length)].a;
    gs._target=pick.e;
    const t=document.getElementById('sf-task');
    if(t) t.innerHTML=(isHe?'מצאו את ':'Find the ')+`<span style="font-size:1.5em">${pick.e}</span> ${isHe?pick.he:pick.en}!`;
}
function _sfTap(id, el){
    const gs=gameState.safari;
    if(id!==gs._target){sfxWrong();el.style.transform='scale(.8)';setTimeout(()=>el.style.transform='',200);return;}
    sfxCorrect(); gs._found++; gs._ri++;
    const world=document.getElementById('sf-world');
    ['✨','⭐','💫'].forEach((s,i)=>{
        const sp=document.createElement('div');
        sp.className='sf-spark'; sp.textContent=s;
        sp.style.left=`calc(${el.style.left} + ${(i-1)*24}px)`; sp.style.top=el.style.top;
        world.appendChild(sp); setTimeout(()=>sp.remove(),750);
    });
    const sc=document.getElementById('sf-score'); if(sc)sc.textContent=gs._found;
    const rd=document.getElementById('sf-round'); if(rd)rd.textContent=Math.min(gs._ri+1,gs._rounds);
    if(gs._ri>=gs._rounds){
        cancelAnimationFrame(gs._raf);
        gs._sessionScore={correct:gs._found,total:gs._rounds};
        setTimeout(()=>levelComplete(),650);
        return;
    }
    _sfNextTarget();
}
