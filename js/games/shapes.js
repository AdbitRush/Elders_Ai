// ═══════════════════════════════════════════════════════════════════════════════
// GAME 7: SHAPES
// ═══════════════════════════════════════════════════════════════════════════════
// Solid shapes, each its own colour (Lucide outlines filled in). Matching is by id; the picture is only what you see.
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
    const gc=count>4?'grid-cols-3 md:grid-cols-4':'grid-cols-2';
    const dropItems=shuffle([...items]);
    let html=`<div class="flex flex-col md:flex-row justify-around w-full items-center gap-10">
        <div id="shapePick" class="grid ${gc} gap-6">${items.map(i=>`<div onclick="selectShape(${i.id},this)" class="w-16 h-16 md:w-20 md:h-20 bg-white border-4 border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:border-amber-500 transition shadow-sm">${i.icon}</div>`).join('')}</div>
        <div class="text-4xl text-gray-300 hidden md:block">${Icon.ui(currentLang==='he'?'arrow-left':'arrow-right',{size:'1em'})}</div>
        <div id="shapeDrop" class="grid ${gc} gap-6">${dropItems.map(i=>`<div onclick="dropShape(${i.id},this)" data-target="${i.id}" class="w-16 h-16 md:w-20 md:h-20 border-4 border-dashed border-gray-300 rounded-2xl flex items-center justify-center cursor-pointer"><span class="shp-slot opacity-25 select-none pointer-events-none">${i.icon}</span></div>`).join('')}</div>
    </div>`;
    container.innerHTML=html;
}
function selectShape(id,el){document.querySelectorAll('#shapePick div').forEach(d=>d.classList.remove('border-amber-500','bg-amber-50'));el.classList.add('border-amber-500','bg-amber-50');gameState.shapes.selected={id,icon:el.innerHTML,el};}
function dropShape(id,el){
    const state=gameState.shapes; if(!state.selected)return;
    if(state.selected.id===id){sfxCorrect();el.innerHTML=`<span class="shp-slot">${state.selected.icon}</span>`;el.classList.remove('border-dashed');el.classList.add('border-solid','border-green-500','bg-green-50');state.selected.el.style.visibility='hidden';state.selected=null;state.placed++;if(state.placed===state.total)setTimeout(()=>levelComplete(),500);}
    else{sfxWrong();el.classList.add('border-red-400');setTimeout(()=>el.classList.remove('border-red-400'),400);}
}
