// ═══════════════════════════════════════════════════════════════════════════════
// GAME 12: OPPOSITES PAIRS
// Presentation: maple word tiles on a walnut table. Logic unchanged.
// ═══════════════════════════════════════════════════════════════════════════════
function initPairs(container){
    const state=gameState.pairs;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    const _adj=_d==='easy'?-1:_d==='hard'?2:0;
    const pool=i18nData[currentLang].pairs_pool;
    const count=Math.min(Math.max(2,3+Math.floor(state.level/2)+_adj),_d==='hard'?8:6);
    const selected=shuffle([...pool]).slice(0,count);
    state.pairs_data=selected; state.selectedA=null; state.matched=0; state.total=count;
    const all=[...selected.map((p,i)=>({text:p.a,type:'a',idx:i})),...selected.map((p,i)=>({text:p.b,type:'b',idx:i}))];
    shuffle(all);

    // ── Scene styles (scoped to this game; injected with the markup) ──────────
    const css=`
.bp-pairs-table{counter-reset:bp-pairs-m;box-sizing:border-box;width:100%;max-width:34rem;margin:0 auto;padding:20px 14px 14px;border-radius:26px;
  background:
    repeating-linear-gradient(92deg,rgba(255,255,255,.04) 0 2px,rgba(0,0,0,0) 2px 9px,rgba(0,0,0,.06) 9px 11px,rgba(0,0,0,0) 11px 23px),
    radial-gradient(120% 90% at 50% 0%,#8b5b37 0%,#70462a 55%,#5a371d 100%);
  box-shadow:inset 0 2px 0 rgba(255,255,255,.2),inset 0 -8px 16px rgba(0,0,0,.3),0 10px 24px rgba(60,35,15,.28)}
.bp-pairs-table #pairsGrid{display:flex;flex-wrap:wrap;justify-content:center;align-items:stretch;gap:14px 12px;max-width:none;margin:0;padding:0}
#pairsGrid .pair-chip{position:relative;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;
  min-height:64px;min-width:128px;max-width:100%;margin:0;padding:12px 22px;border:0;border-radius:16px;
  font:inherit;font-size:clamp(1.35rem,5.2vw,1.6rem);font-weight:800;line-height:1.2;letter-spacing:.01em;color:#38200e;text-align:center;
  cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;opacity:1;filter:none;
  background:
    repeating-linear-gradient(88deg,rgba(120,72,24,.08) 0 1px,rgba(0,0,0,0) 1px 7px,rgba(120,72,24,.05) 7px 9px,rgba(0,0,0,0) 9px 17px),
    linear-gradient(180deg,#fcebc9 0%,#f1d5a3 55%,#e3bf85 100%);
  box-shadow:inset 0 2px 0 rgba(255,255,255,.8),inset 0 -3px 0 rgba(140,90,40,.3),inset 0 0 0 1px rgba(120,75,30,.35),0 5px 0 #a47238,0 10px 14px rgba(25,12,4,.42);
  transform:translateY(0);animation:none;transition:transform .2s ease,box-shadow .2s ease,filter .2s ease}
#pairsGrid .pair-chip .bp-pair-word{display:block;overflow-wrap:anywhere;pointer-events:none}
#pairsGrid .pair-chip:focus{outline:none}
#pairsGrid .pair-chip:focus-visible{outline:3px solid #fff3c4;outline-offset:4px}
@media (hover:hover){#pairsGrid .pair-chip:not(.matched):hover{filter:brightness(1.05)}}
#pairsGrid .pair-chip:not(.matched):active{transform:translateY(3px);box-shadow:inset 0 2px 0 rgba(255,255,255,.8),inset 0 -3px 0 rgba(140,90,40,.3),inset 0 0 0 1px rgba(120,75,30,.35),0 2px 0 #a47238,0 4px 8px rgba(25,12,4,.4)}

/* Side A picked: honey tint, lifted */
#pairsGrid .pair-chip.selected-a{color:#3a2204;transform:translateY(-5px);
  background:
    repeating-linear-gradient(88deg,rgba(130,80,0,.08) 0 1px,rgba(0,0,0,0) 1px 7px,rgba(130,80,0,.05) 7px 9px,rgba(0,0,0,0) 9px 17px),
    linear-gradient(180deg,#ffe9a3 0%,#fbcf5f 55%,#f1b638 100%);
  box-shadow:inset 0 2px 0 rgba(255,255,255,.85),inset 0 -3px 0 rgba(150,90,0,.3),inset 0 0 0 3px #a86200,0 6px 0 #a86a12,0 16px 20px rgba(25,12,4,.5)}
/* Side B picked: terracotta tint, lifted */
#pairsGrid .pair-chip.selected-b{color:#3d1408;transform:translateY(-5px);
  background:
    repeating-linear-gradient(88deg,rgba(130,50,20,.08) 0 1px,rgba(0,0,0,0) 1px 7px,rgba(130,50,20,.05) 7px 9px,rgba(0,0,0,0) 9px 17px),
    linear-gradient(180deg,#ffd6c2 0%,#f7ab8c 55%,#ea8f6c 100%);
  box-shadow:inset 0 2px 0 rgba(255,255,255,.8),inset 0 -3px 0 rgba(140,50,20,.3),inset 0 0 0 3px #9c3a1b,0 6px 0 #a4512f,0 16px 20px rgba(25,12,4,.5)}

/* Matched: settles onto the table with a warm glow and a check */
#pairsGrid .pair-chip.matched{color:#3b3211;cursor:default;transform:translateY(3px);
  background:linear-gradient(180deg,#fffbe6 0%,#f6edc4 55%,#eadf9f 100%);
  box-shadow:inset 0 2px 0 rgba(255,255,255,.9),inset 0 0 0 1px rgba(150,125,50,.4),0 2px 0 #b59a55,0 0 0 3px rgba(255,217,120,.9),0 0 20px 5px rgba(255,205,100,.5);
  animation:bp-pairs-settle .55s ease-out 1}
#pairsGrid .pair-chip .bp-pair-check{position:absolute;top:-11px;inset-inline-end:-8px;width:30px;height:30px;opacity:0;transform:scale(.4);
  pointer-events:none;filter:drop-shadow(0 2px 2px rgba(25,12,4,.35));transition:opacity .3s ease .1s,transform .3s ease .1s}
#pairsGrid .pair-chip.matched .bp-pair-check{opacity:1;transform:scale(1)}

/* Wrong: soft clay tint and a gentle shake */
#pairsGrid .pair-chip.wrong{color:#451509;transform:translateY(0);
  background:linear-gradient(180deg,#f9ddd0 0%,#ecbba6 55%,#dfa089 100%);
  box-shadow:inset 0 2px 0 rgba(255,255,255,.75),inset 0 0 0 3px #96361d,0 5px 0 #9a5a40,0 10px 14px rgba(25,12,4,.42);
  animation:bp-pairs-shake .45s ease-in-out 1}

@keyframes bp-pairs-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}45%{transform:translateX(5px)}70%{transform:translateX(-3px)}88%{transform:translateX(2px)}}
@keyframes bp-pairs-settle{0%{transform:translateY(-5px)}60%{transform:translateY(4px)}100%{transform:translateY(3px)}}

/* Progress plaque: pairs found / total (counted in CSS from the matched tiles) */
#pairsGrid .pair-chip.matched[data-type="a"]{counter-increment:bp-pairs-m}
.bp-pairs-plaque{display:flex;align-items:center;justify-content:center;gap:10px;width:-moz-fit-content;width:fit-content;min-height:46px;margin:20px auto 0;padding:6px 20px;border-radius:12px;
  color:#38200e;font-size:1.4rem;font-weight:800;line-height:1.2;
  background:
    repeating-linear-gradient(90deg,rgba(120,72,24,.09) 0 1px,rgba(0,0,0,0) 1px 8px),
    linear-gradient(180deg,#f3d9a8 0%,#dcb779 100%);
  box-shadow:inset 0 2px 0 rgba(255,255,255,.7),inset 0 0 0 1px rgba(110,70,25,.45),0 3px 0 #8c5f2d,0 6px 10px rgba(25,12,4,.4)}
.bp-pairs-plaque svg{width:26px;height:26px;flex:none}
.bp-pairs-tally{display:inline-flex;gap:.35em;direction:ltr;unicode-bidi:isolate}
.bp-pairs-num::before{content:counter(bp-pairs-m)}

@media (prefers-reduced-motion:reduce){
  #pairsGrid .pair-chip,#pairsGrid .pair-chip .bp-pair-check{transition:none!important;animation:none!important}
}`;
    const check=`<svg class="bp-pair-check" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="11" fill="#3f8f4a" stroke="#fffbe6" stroke-width="2"/><path d="M7 12.5l3.4 3.4L17.2 9" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    let html=`<div class="bp-pairs-table"><style>${css}</style><div class="flex flex-wrap justify-center gap-3 max-w-lg" id="pairsGrid">`;
    all.forEach((item,i)=>{html+=`<button id="pc-${i}" class="pair-chip" data-idx="${item.idx}" data-type="${item.type}" onclick="clickPair(${i})"><span class="bp-pair-word">${item.text}</span>${check}</button>`;});
    container.innerHTML=html+`</div><div class="bp-pairs-plaque" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><circle cx="12" cy="12" r="11" fill="#3f8f4a"/><path d="M7 12.5l3.4 3.4L17.2 9" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="bp-pairs-tally"><span class="bp-pairs-num"></span><span>/</span><span>${count}</span></span></div></div>`;
}
function clickPair(i){
    const state=gameState.pairs;
    const el=document.getElementById(`pc-${i}`);
    if(el.classList.contains('matched'))return;
    const type=el.dataset.type,idx=parseInt(el.dataset.idx);
    if(!state.selectedA){state.selectedA={el,idx,type};el.classList.add(type==='a'?'selected-a':'selected-b');}
    else{
        const prev=state.selectedA;
        if(prev.el===el){el.classList.remove('selected-a','selected-b');state.selectedA=null;return;}
        if(prev.idx===idx&&prev.type!==type){
            sfxCorrect(); prev.el.classList.remove('selected-a','selected-b'); prev.el.classList.add('matched'); el.classList.add('matched');
            state.selectedA=null; state.matched++;
            if(state.matched===state.total)setTimeout(()=>levelComplete(),500);
        } else {
            sfxWrong(); el.classList.add('wrong'); prev.el.classList.add('wrong');
            setTimeout(()=>{el.classList.remove('wrong','selected-a','selected-b');prev.el.classList.remove('wrong','selected-a','selected-b');state.selectedA=null;},600);
        }
    }
}
