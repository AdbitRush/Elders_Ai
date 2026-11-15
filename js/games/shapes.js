// ═══════════════════════════════════════════════════════════════════════════════
// GAME 7: SHAPES
// ═══════════════════════════════════════════════════════════════════════════════
// Solid shapes, each its own colour (Lucide outlines filled in). Matching is by id; the picture is only what you see.
// Scene: wooden toy blocks on a soft play mat, a felt board with shadow cut-outs, a painted wooden arrow between.
// All styling is scoped under .tb-scene and shipped with the render (no globals, no assets). The state classes
// toggled by selectShape/dropShape (border-amber-500, border-green-500, border-red-400, border-dashed) drive the scene.
const _SHAPES=[['circle','#0369a1'],['square','#15803d'],['triangle','#c62828'],['star','#a16207'],['diamond','#7e22ce'],
    ['hexagon','#c2410c'],['moon','#4338ca'],['heart','#be185d'],['pentagon','#0f766e'],['cloud','#475569']];
const _shapeSvg=(s)=>`<span class="shp" style="color:${s[1]}">${Icon.svg(s[0],{size:'100%',fill:true,fillOpacity:1,sw:1.5})}</span>`;
function initShapes(container) {
    const state=gameState.shapes;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    const _adj=_d==='easy'?-1:_d==='hard'?2:0;
    const count=Math.min(Math.max(2,4+Math.floor(state.level/3)+_adj),_d==='hard'?10:8);
    const items=shuffle([..._SHAPES]).slice(0,count).map((s,id)=>({id,icon:_shapeSvg(s)}));
    state.selected=null; state.placed=0; state.total=count; state.items=items;
    const gc=count>4?'tb-g3':'tb-g2';
    const dropItems=shuffle([...items]);
    const css=`
.tb-scene{box-sizing:border-box;width:100%;container-type:inline-size;padding:8px;border-radius:24px;border:6px solid #b17a43;
  background:linear-gradient(180deg,#fcf4e5,#f3e6cf);box-shadow:inset 0 0 0 2px rgba(255,236,200,.7),inset 0 4px 10px rgba(90,55,20,.18),0 6px 14px rgba(70,42,14,.2);
  -webkit-tap-highlight-color:transparent;--tb-s:min(72px,19vw)}
.tb-scene *{box-sizing:border-box}
.tb-wrap{counter-reset:tbp;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px}
.tb-mat{position:relative;max-width:100%;padding:16px;border-radius:26px;border:3px solid #a9cdc4;background-color:#d3e7e1;
  background-image:linear-gradient(45deg,rgba(255,255,255,.32) 25%,transparent 25% 75%,rgba(255,255,255,.32) 75%),linear-gradient(45deg,rgba(255,255,255,.32) 25%,transparent 25% 75%,rgba(255,255,255,.32) 75%);
  background-size:48px 48px;background-position:0 0,24px 24px;box-shadow:inset 0 0 0 5px rgba(255,255,255,.45),0 5px 12px rgba(70,50,20,.16)}
.tb-mat::before{content:'';position:absolute;inset:7px;border:2px dashed rgba(60,115,105,.5);border-radius:18px;pointer-events:none}
.tb-grid{position:relative;display:grid;gap:14px;justify-content:center}
.tb-g2{grid-template-columns:repeat(2,var(--tb-s))}
.tb-g3{grid-template-columns:repeat(3,var(--tb-s))}
.tb-scene .tb-block{position:relative;width:var(--tb-s);height:var(--tb-s);display:flex;align-items:center;justify-content:center;border:3px solid #b98a55;border-radius:16px;cursor:pointer;
  touch-action:manipulation;-webkit-user-select:none;user-select:none;
  background:repeating-linear-gradient(96deg,rgba(150,100,45,.1) 0 2px,transparent 2px 9px),linear-gradient(180deg,#fdf2db,#f0d9ae);
  box-shadow:inset 0 2px 0 rgba(255,255,255,.75),0 5px 0 #a87a48,0 9px 9px rgba(60,35,10,.26)}
.tb-scene .tb-block.border-amber-500{transform:translateY(-5px);border-color:#a85f00;background:linear-gradient(180deg,#fff5cf,#ffdf8a);
  box-shadow:inset 0 2px 0 rgba(255,255,255,.8),0 5px 0 #a87a48,0 0 0 4px #e0900a,0 15px 14px rgba(60,35,10,.3),0 0 22px 7px rgba(240,180,40,.6)}
.tb-scene .shp{position:static;display:block;width:56%;height:56%;line-height:0}
.tb-scene .shp svg{display:block;width:100%;height:100%}
.tb-scene .shp::before{content:'';position:absolute;inset:5px;border:3px solid currentColor;border-radius:10px;opacity:.5;pointer-events:none}
.tb-board{position:relative;max-width:100%;padding:9px;border-radius:18px;
  background:repeating-linear-gradient(92deg,rgba(70,38,12,.12) 0 2px,rgba(255,225,170,.08) 2px 7px,rgba(70,38,12,.05) 7px 11px),linear-gradient(180deg,#b9814a,#96602f);
  box-shadow:inset 0 2px 0 #cf9b62,inset 0 -2px 0 rgba(60,30,8,.35),0 6px 14px rgba(70,42,14,.26)}
.tb-felt{position:relative;padding:14px 14px 10px;border-radius:11px;background-color:#e6d8b8;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .35 0 0 0 0 .22 0 0 0 0 .08 0 0 0 .28 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  box-shadow:inset 0 0 0 2px rgba(60,35,10,.35),inset 0 5px 12px rgba(70,45,15,.22)}
.tb-scene .tb-slot{position:relative;width:var(--tb-s);height:var(--tb-s);display:flex;align-items:center;justify-content:center;border:3px dashed #8f7850;border-radius:16px;cursor:pointer;
  touch-action:manipulation;background:#f1e8d3;box-shadow:inset 0 3px 7px rgba(70,45,15,.3),inset 0 -1px 0 rgba(255,255,255,.6)}
.tb-scene .tb-slot .shp-slot{display:flex;align-items:center;justify-content:center;width:100%;height:100%;pointer-events:none;-webkit-user-select:none;user-select:none}
.tb-scene .tb-slot.border-dashed .shp-slot{opacity:.6;filter:brightness(.62) saturate(.85)}
.tb-scene .tb-slot.border-dashed .shp::before{display:none}
.tb-wrap:has(.tb-block.border-amber-500) .tb-slot.border-dashed{border-color:#a85f00;background:#fbf1d6}
.tb-scene .tb-slot.border-green-500{counter-increment:tbp;border:3px solid #c98a00;cursor:default;
  background:repeating-linear-gradient(96deg,rgba(150,100,45,.1) 0 2px,transparent 2px 9px),linear-gradient(180deg,#fff7de,#f6dfa6);
  box-shadow:inset 0 2px 0 rgba(255,255,255,.8),0 3px 0 #a87a48,0 0 0 3px rgba(240,180,40,.55),0 0 18px 5px rgba(240,180,40,.5)}
.tb-scene .tb-slot.border-green-500::after{content:'\\2713';position:absolute;top:-10px;right:-10px;width:26px;height:26px;border-radius:50%;background:#2f7d32;color:#fff;
  font-size:17px;font-weight:800;line-height:26px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.35),0 0 0 2px #fff7de}
.tb-scene .tb-slot.border-red-400{border:3px solid #c0392b;background:#f7d6ce;box-shadow:inset 0 2px 5px rgba(120,30,20,.2),0 0 0 4px rgba(192,57,43,.28)}
.tb-tag{display:flex;align-items:center;justify-content:center;gap:7px;width:max-content;margin:12px auto 0;padding:2px 16px;border-radius:999px;direction:ltr;
  background:linear-gradient(180deg,#fcedd2,#eed3a4);border:2px solid #b5854f;color:#472c12;font-size:1.3rem;font-weight:800;line-height:1.35;font-variant-numeric:tabular-nums;
  box-shadow:0 2px 0 #a3743f,0 4px 5px rgba(60,35,10,.2)}
.tb-tag svg{display:block;width:22px;height:22px;flex:none}
.tb-tag::after{content:counter(tbp) " / " attr(data-total)}
.tb-board:not(:has(.tb-slot.border-dashed)){box-shadow:inset 0 2px 0 #cf9b62,0 0 0 4px rgba(240,180,40,.7),0 0 26px 8px rgba(240,180,40,.55)}
.tb-board:not(:has(.tb-slot.border-dashed)) .tb-tag{background:linear-gradient(180deg,#fff0b0,#f5c23c);border-color:#c98a00}
.tb-arrow{flex:none;width:64px;height:60px;display:flex;align-items:center;justify-content:center;transform:rotate(90deg)}
.tb-arrow svg{display:block;width:62px;height:42px;filter:drop-shadow(0 3px 3px rgba(60,35,10,.3))}
.tb-wrap:has(.tb-block.border-amber-500) .tb-arrow svg{filter:drop-shadow(0 0 7px rgba(240,170,20,.95)) drop-shadow(0 3px 3px rgba(60,35,10,.3))}
@container (min-width:440px){.tb-g3{grid-template-columns:repeat(4,var(--tb-s))}}
@container (min-width:720px){
  .tb-wrap{flex-direction:row;gap:16px}
  .tb-g3{grid-template-columns:repeat(3,var(--tb-s))}
  .tb-arrow{transform:none}
  .tb-he .tb-arrow{transform:scaleX(-1)}
}
@container (min-width:960px){.tb-wrap{--tb-s:80px}.tb-g3{grid-template-columns:repeat(4,var(--tb-s))}}
@media (hover:hover){.tb-scene .tb-block:hover{filter:brightness(1.04)}}
@media (prefers-reduced-motion:no-preference){
  .tb-scene .tb-block{transition:transform .15s ease,box-shadow .15s ease}
  .tb-scene .tb-slot{transition:background-color .2s ease,border-color .2s ease}
  .tb-wrap:has(.tb-block.border-amber-500) .tb-slot.border-dashed{animation:tb-hint 1.5s ease-in-out infinite}
  .tb-wrap:has(.tb-block.border-amber-500) .tb-arrow svg{animation:tb-nudge 1.2s ease-in-out infinite}
  .tb-scene .tb-slot.border-green-500{animation:tb-pop .45s cubic-bezier(.3,1.4,.5,1) both}
  .tb-scene .tb-slot.border-red-400{animation:tb-no .38s ease-in-out both}
}
@keyframes tb-hint{0%,100%{box-shadow:inset 0 3px 7px rgba(70,45,15,.3),0 0 0 0 rgba(224,144,10,0)}50%{box-shadow:inset 0 3px 7px rgba(70,45,15,.3),0 0 0 4px rgba(224,144,10,.4)}}
@keyframes tb-nudge{0%,100%{transform:translateX(0)}50%{transform:translateX(6px)}}
@keyframes tb-pop{0%{transform:scale(.82)}55%{transform:scale(1.09) translateY(-3px)}100%{transform:none}}
@keyframes tb-no{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}50%{transform:translateX(4px)}75%{transform:translateX(-2px)}}
`;
    let html=`<style>${css}</style><div class="tb-scene${currentLang==='he'?' tb-he':''}"><div class="tb-wrap">
        <div class="tb-mat"><div id="shapePick" class="tb-grid ${gc}">${items.map(i=>`<div onclick="selectShape(${i.id},this)" class="tb-block">${i.icon}</div>`).join('')}</div></div>
        <span class="tb-arrow" aria-hidden="true"><svg viewBox="0 0 96 64"><path d="M7 22H54V8L90 32 54 56V42H7Z" fill="#e2a052" stroke="#8a5a2b" stroke-width="4" stroke-linejoin="round"/><path d="M14 28H50M14 36H44" stroke="#b9772f" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M60 18 80 32 60 46Z" fill="#d9603b"/><path d="M12 25H52" stroke="#f6cf8f" stroke-width="2" stroke-linecap="round" fill="none"/></svg></span>
        <div class="tb-board"><div class="tb-felt">
            <div id="shapeDrop" class="tb-grid ${gc}">${dropItems.map(i=>`<div onclick="dropShape(${i.id},this)" data-target="${i.id}" class="tb-slot border-dashed"><span class="shp-slot opacity-25 select-none pointer-events-none">${i.icon}</span></div>`).join('')}</div>
            <div class="tb-tag" aria-hidden="true" data-total="${count}"><svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8Z" fill="#f2b632" stroke="#8a5a2b" stroke-width="1.5" stroke-linejoin="round"/></svg></div>
        </div></div>
    </div></div>`;
    container.innerHTML=html;
}
function selectShape(id,el){document.querySelectorAll('#shapePick div').forEach(d=>d.classList.remove('border-amber-500','bg-amber-50'));el.classList.add('border-amber-500','bg-amber-50');gameState.shapes.selected={id,icon:el.innerHTML,el};}
function dropShape(id,el){
    const state=gameState.shapes; if(!state.selected)return;
    if(state.selected.id===id){sfxCorrect();el.innerHTML=`<span class="shp-slot">${state.selected.icon}</span>`;el.classList.remove('border-dashed');el.classList.add('border-solid','border-green-500','bg-green-50');state.selected.el.style.visibility='hidden';state.selected=null;state.placed++;if(state.placed===state.total)setTimeout(()=>levelComplete(),500);}
    else{sfxWrong();el.classList.add('border-red-400');setTimeout(()=>el.classList.remove('border-red-400'),400);}
}
 
