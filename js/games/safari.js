// ═══════════════════════════════════════════════════════════════════════════════
// GAME 26: LIVING SAFARI — a living animal world. Animals roam a savanna;
// find and tap the requested one. Attention + reaction, pure spectacle.
// ═══════════════════════════════════════════════════════════════════════════════
const _SF_ANIMALS=[
    // e = stable id; k = photo images/safari/<k>.jpg (Pexels, see credits.html)
    {e:'🦒',k:'giraffe',he:'ג׳ירפה',en:'Giraffe'},{e:'🦁',k:'lion',he:'אריה',en:'Lion'},{e:'🐘',k:'elephant',he:'פיל',en:'Elephant'},
    {e:'🦓',k:'zebra',he:'זברה',en:'Zebra'},{e:'🦏',k:'rhino',he:'קרנף',en:'Rhino'},{e:'🐆',k:'cheetah',he:'ברדלס',en:'Cheetah'},
    {e:'🦩',k:'flamingo',he:'פלמינגו',en:'Flamingo'},{e:'🐒',k:'monkey',he:'קוף',en:'Monkey'},{e:'🦜',k:'parrot',he:'תוכי',en:'Parrot'},
    {e:'🐢',k:'turtle',he:'צב',en:'Turtle'},{e:'🦅',k:'eagle',he:'עיט',en:'Eagle'},{e:'🐊',k:'crocodile',he:'תנין',en:'Crocodile'},
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
        <span class="text-sm font-bold text-gray-400">${gt('Round', 'סיבוב')} <span id="sf-round">1</span>/${gs._rounds}</span>
        <span id="sf-task" class="text-lg md:text-xl font-black text-amber-300"></span>
        <span class="text-sm font-bold text-green-400">✓ <span id="sf-score">0</span></span>
      </div>
      <div id="sf-world" dir="ltr" style="position:relative;height:min(58vh,460px);border-radius:22px;overflow:hidden;cursor:pointer;
        background:#d9b77a url(images/safari/savanna.jpg) center 40%/cover;box-shadow:0 24px 60px -22px rgba(0,0,0,.6)">
      </div>
    </div>
    <style>
      .sf-a{position:absolute;width:clamp(80px,18vw,104px);height:clamp(80px,18vw,104px);margin:-6px 0 0 -6px;user-select:none;transition:transform .18s;
        border-radius:50%;border:4px solid #fff;overflow:hidden;background:#fff;box-shadow:0 6px 14px rgba(0,0,0,.4)}
      .sf-a img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}
      @keyframes sfPop{0%{transform:scale(1)}45%{transform:scale(1.9) rotate(-8deg)}100%{transform:scale(0);opacity:0}}
      .sf-spark{position:absolute;font-size:30px;color:#f59e0b;pointer-events:none;animation:sfPop .7s ease forwards;filter:drop-shadow(0 1px 2px rgba(0,0,0,.5))}
      .sf-t{display:inline-block;width:1.9em;height:1.9em;border-radius:50%;border:3px solid #fff;object-fit:cover;vertical-align:middle;box-shadow:0 2px 6px rgba(0,0,0,.3);margin:0 .2em}
    </style>`;
    const world=document.getElementById('sf-world');
    const pool=shuffle([..._SF_ANIMALS]).slice(0,gs._nAnimals);
    pool.forEach((a,i)=>{
        const el=document.createElement('div');
        el.className='sf-a'; el.innerHTML=`<img src="images/safari/${a.k}.jpg" alt="${isHe?a.he:a.en}" draggable="false">`; el.dataset.id=a.e;
        el.onclick=(ev)=>{ev.stopPropagation();_sfTap(a.e,el);};
        world.appendChild(el);
        gs._sprites.push({a,el,x:8+Math.random()*80,y:38+Math.random()*52,
            vx:(Math.random()<.5?-1:1)*gs._speed*(0.6+Math.random()*0.8),
            vy:(Math.random()<.5?-1:1)*gs._speed*0.25,
            bob:Math.random()*6.28});
    });
    // Phones (2026-10-10): 58 px moving animals that overlap made 2 of 6 taps miss. Now they are 80 px+, the animal
    // asked for is always drawn on top (_sfNextTarget), and a tap on the grass counts for the nearest animal if it
    // is within one animal's width - a slightly-off tap on a moving target is still a hit.
    world.addEventListener('click',(ev)=>{
        let best=null,bd=Infinity;
        gs._sprites.forEach(s=>{const r=s.el.getBoundingClientRect();const d=Math.hypot(ev.clientX-(r.left+r.width/2),ev.clientY-(r.top+r.height/2));if(d<bd){bd=d;best=s;}});
        if(best&&bd<=best.el.getBoundingClientRect().width)_sfTap(best.a.e,best.el);
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
    gs._sprites.forEach(s=>{s.el.style.zIndex=s.a.e===pick.e?'5':'1';});
    const t=document.getElementById('sf-task');
    if(t) t.innerHTML=(gt('Find the ', 'מצאו את '))+`<img class="sf-t" src="images/safari/${pick.k}.jpg" alt=""> ${isHe?pick.he:pick.en}!`;
}
function _sfTap(id, el){
    const gs=gameState.safari;
    if(gs._ri>=gs._rounds)return;   // the last find is in: taps during the win animation must not count again
    if(id!==gs._target){sfxWrong();el.style.transform='scale(.8)';setTimeout(()=>el.style.transform='',200);return;}
    sfxCorrect(); gs._found++; gs._ri++;
    const world=document.getElementById('sf-world');
    ['sparkles','star','sparkles'].forEach((s,i)=>{
        const sp=document.createElement('div');
        sp.className='sf-spark'; sp.innerHTML=Icon.svg(s,{size:'1em',fill:true,fillOpacity:.6});
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
