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
    const gs=gameState.oddoneout; gs._locked=false;
    if(gs._si>=gs._sq){gs._sessionScore={correct:gs._ss,total:gs._sq};levelComplete();return;}
    const p=ODD_SETS[Math.floor(Math.random()*ODD_SETS.length)];
    const main=p[0],odd=p[Math.floor(Math.random()*(p.length-1))+1],oi=Math.floor(Math.random()*16);
    const isHe=currentLang==='he';
 
    // ── presentation only (no extra Math.random calls, no new globals) ──
    // Round progress grows in the planter: finished rounds bloom, the current one sprouts.
    let bed='';
    for(let i=0;i<gs._sq;i++){
        bed+=i<gs._si
            ? `<svg class="odd-plant" viewBox="0 0 20 30" focusable="false"><path d="M10 29V13" stroke="#3f7d33" stroke-width="2.4" stroke-linecap="round"/><path d="M10 22c-5 0-7-3-7-5c4-1 7 1 7 5z" fill="#5c9a44"/><g fill="#f4bc36" stroke="#a8721a" stroke-width=".8"><circle cx="10" cy="4.2" r="3.4"/><circle cx="15" cy="7.8" r="3.4"/><circle cx="13.1" cy="13.6" r="3.4"/><circle cx="6.9" cy="13.6" r="3.4"/><circle cx="5" cy="7.8" r="3.4"/></g><circle cx="10" cy="9.4" r="3.2" fill="#a8562c"/></svg>`
            : i===gs._si
            ? `<svg class="odd-plant odd-plant-now" viewBox="0 0 20 30" focusable="false"><path d="M10 29V14" stroke="#3f7d33" stroke-width="2.6" stroke-linecap="round"/><path d="M10 17C4 17 1.5 13 1.5 9.5C7 8.5 10 12 10 17z" fill="#5c9a44"/><path d="M10 15c6 0 8.5-4 8.5-7.5C13 6.5 10 10 10 15z" fill="#78b356"/></svg>`
            : `<svg class="odd-plant" viewBox="0 0 20 30" focusable="false"><ellipse cx="10" cy="23.5" rx="3.6" ry="2.6" fill="#e6d3a8" stroke="#8a6a3c" stroke-width="1"/></svg>`;
    }
    const css=`
.odd-scene{position:relative;box-sizing:border-box;max-width:960px;--odd-bed-h:clamp(50px,6vw,76px);--odd-soil-h:clamp(15px,1.8vw,22px);padding:clamp(12px,1.6vw,20px) clamp(10px,2vw,24px) clamp(14px,1.8vw,22px);border-radius:clamp(22px,2.4vw,30px);border:clamp(2px,.25vw,3px) solid #7a5230;color:#3b2a1a;background:repeating-linear-gradient(180deg,rgba(0,0,0,0) 0 46px,rgba(70,40,15,.38) 46px 48px),repeating-linear-gradient(91deg,rgba(255,255,255,.07) 0 2px,rgba(0,0,0,0) 2px 13px),linear-gradient(180deg,#d1a068,#b98450);box-shadow:inset 0 2px 0 rgba(255,255,255,.25),0 6px 14px rgba(70,40,10,.25)}
.odd-scene *{box-sizing:border-box}
.odd-scene .odd-top{position:relative;z-index:0;display:flex;justify-content:space-between;align-items:flex-start;gap:clamp(10px,1.4vw,18px)}
.odd-scene .odd-marker{position:relative;display:inline-block;padding:clamp(6px,.8vw,10px) clamp(14px,1.8vw,22px);min-width:3.2em;text-align:center;border-radius:clamp(9px,1vw,12px);font-size:clamp(1.3rem,2.2vw,1.9rem);line-height:1.35;font-weight:700;white-space:nowrap;color:#fff6df;text-shadow:0 1px 0 rgba(0,0,0,.35);border:2px solid #40260f;background:repeating-linear-gradient(91deg,rgba(255,255,255,.07) 0 2px,rgba(0,0,0,0) 2px 11px),linear-gradient(180deg,#80532c,#5f3b1e);box-shadow:inset 0 1px 0 rgba(255,255,255,.25),0 2px 4px rgba(50,25,5,.35)}

.odd-scene .odd-marker.text-green-600{color:#d9f4bd}
.odd-scene .odd-marker::after{content:'';position:absolute;top:100%;left:50%;width:clamp(12px,1.4vw,18px);height:calc(var(--odd-bed-h) - var(--odd-soil-h) - 1px);margin-top:2px;transform:translateX(-50%);border-radius:0 0 2px 2px;background:linear-gradient(90deg,#5f3b1e,#8a5c33 45%,#5f3b1e)}
.odd-scene .odd-bed{position:relative;z-index:1;display:flex;justify-content:center;align-items:flex-end;gap:clamp(2px,.4vw,5px);height:var(--odd-bed-h);margin:0 0 clamp(14px,1.6vw,20px);padding:0 8px calc(var(--odd-soil-h) - 3px)}
.odd-scene .odd-bed::after{content:'';position:absolute;left:0;right:0;bottom:0;height:var(--odd-soil-h);border-radius:8px;border:2px solid #3d2410;background:radial-gradient(circle at 12% 40%,rgba(255,255,255,.14) 0 1.5px,rgba(0,0,0,0) 2px),radial-gradient(circle at 58% 62%,rgba(255,255,255,.12) 0 1.5px,rgba(0,0,0,0) 2px),radial-gradient(circle at 86% 35%,rgba(255,255,255,.12) 0 1.5px,rgba(0,0,0,0) 2px),linear-gradient(180deg,#6a4426,#4d2f17)}
.odd-scene .odd-plant{position:relative;display:block;flex:1 1 0;min-width:0;max-width:clamp(22px,2.9vw,34px);height:clamp(30px,3.9vw,46px)}
.odd-scene .odd-plant-now{max-width:clamp(26px,3.4vw,40px);height:clamp(36px,4.6vw,55px);transform-origin:50% 100%;animation:odd-sway 2.8s ease-in-out infinite}
.odd-scene .odd-cloth{position:relative;z-index:1;max-width:46rem;margin-inline:auto;padding:clamp(11px,1.6vw,20px);border-radius:clamp(14px,1.6vw,20px);border:1px solid #9db08a;background:repeating-linear-gradient(0deg,rgba(104,140,96,.30) 0 22px,rgba(0,0,0,0) 22px 44px),repeating-linear-gradient(90deg,rgba(104,140,96,.30) 0 22px,rgba(0,0,0,0) 22px 44px),#fbf5e3;box-shadow:0 3px 0 rgba(70,40,10,.28),0 8px 14px rgba(70,40,10,.28)}
.odd-scene .odd-cloth::before{content:'';position:absolute;inset:4px;border-radius:10px;border:2px dashed rgba(255,255,255,.85);pointer-events:none}
.odd-scene .odd-grid{position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(9px,1.2vw,15px)}
.odd-scene .odd-tile{position:relative;display:block;width:auto;height:auto;min-height:60px;aspect-ratio:1/1.1;overflow:hidden;border-radius:clamp(10px,1.2vw,14px);border:clamp(2px,.25vw,3px) solid #b08552;background:linear-gradient(180deg,#fffbf2,#f7ecd3);box-shadow:0 2px 0 #9a7242,0 4px 8px rgba(70,40,10,.28);cursor:pointer;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;transition:opacity .25s ease,filter .25s ease,transform .15s ease,box-shadow .2s ease,border-color .2s ease}
.odd-scene .odd-tile::before{content:'';position:absolute;left:0;right:0;top:0;height:17%;background:linear-gradient(180deg,#cc6f45,#b55a33);border-bottom:2px dashed #f7ecd3}
.odd-scene .odd-ico{position:absolute;top:25%;bottom:8%;left:12%;right:12%;display:flex;align-items:center;justify-content:center;pointer-events:none}
.odd-scene .odd-ico svg{display:block;max-width:100%;max-height:100%}
@media (hover:hover){.odd-scene .odd-tile.bg-white:hover{transform:translateY(-3px);box-shadow:0 5px 0 #9a7242,0 9px 12px rgba(70,40,10,.3)}}
.odd-scene .odd-tile:active{transform:scale(.96)}
.odd-scene .odd-tile.bg-green-100{z-index:2;border-color:#d4920f;background:radial-gradient(circle at 50% 58%,#fffbe0 0%,#ffe79a 70%,#f9d264 100%);box-shadow:0 0 0 4px rgba(246,196,83,.75),0 0 24px 8px rgba(245,180,40,.9);animation:odd-bounce .46s ease both}
.odd-scene .odd-tile.bg-red-100{opacity:.42;filter:saturate(.45);transform:none}
.odd-scene .odd-grid:has(.bg-green-100) .odd-tile:not(.bg-green-100){opacity:.75;cursor:default}
@keyframes odd-bounce{0%{transform:translateY(0)}35%{transform:translateY(-9px)}62%{transform:translateY(0)}80%{transform:translateY(-3px)}100%{transform:translateY(0)}}
@keyframes odd-sway{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
@media (min-width:640px){.odd-scene .odd-tile{aspect-ratio:1.4/1}}
@media (max-width:380px){.odd-scene{padding:10px 8px 12px}.odd-scene .odd-cloth{padding:9px}.odd-scene .odd-grid{gap:7px}.odd-scene .odd-marker{padding:6px 11px}}
@media (prefers-reduced-motion:reduce){.odd-scene .odd-plant-now,.odd-scene .odd-tile.bg-green-100{animation:none}.odd-scene .odd-tile{transition:opacity .25s ease,filter .25s ease}.odd-scene .odd-tile:active,.odd-scene .odd-tile.bg-white:hover{transform:none}}
`;
 
    let html=`<div class="odd-scene w-full mx-auto">
        <style>${css}</style>
        <div class="odd-top">
            <span class="odd-marker">${gt('Round', 'סיבוב')} ${gs._si+1}/${gs._sq}</span>
            <span id="oddScore" class="odd-marker text-green-600">✓ ${gs._ss}</span>
        </div>
        <div class="odd-bed" aria-hidden="true">${bed}</div>

        <div class="odd-cloth"><div class="odd-grid grid grid-cols-4">`;
    for(let i=0;i<16;i++){const isOdd=(i===oi);html+=`<div onclick="clickOdd(${isOdd},this)" class="odd-tile bg-white cursor-pointer"><span class="odd-ico">${Icon.sym(isOdd?odd:main,{size:'100%'})}</span></div>`;}
    container.innerHTML=html+`</div></div></div>`;
}
function clickOdd(isOdd, el) {
    if(!gameState.active||gameState.currentId!=='oddoneout')return;
    const gs=gameState.oddoneout;
    if(gs._locked)return;   // one answer per round: a double-tap scored twice and skipped a round
    if(isOdd){
        gs._locked=true; sfxCorrect(); gs._ss++;
        const sc=document.getElementById('oddScore'); if(sc)sc.textContent='✓ '+gs._ss;
        el.classList.replace('bg-white','bg-green-100');
        setTimeout(()=>{gs._si++;_oddNext(document.getElementById('gameContent'));},500);
    } else {
        sfxWrong();
        el.classList.replace('bg-white','bg-red-100');
        setTimeout(()=>el.classList.replace('bg-red-100','bg-white'),400);
    }
}