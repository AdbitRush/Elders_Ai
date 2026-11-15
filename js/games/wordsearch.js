// ═══════════════════════════════════════════════════════════════════════════════
// GAME 4: WORD SEARCH (with adjacency validation)
// Visuals (2026-11 overhaul): a warm paper card. All styling is scoped under .ws-wrap and shipped inline with the
// board, so it needs no site CSS. The grid's direction is deliberately not set here: it keeps whatever it had.
// ═══════════════════════════════════════════════════════════════════════════════
function initWordSearch(container) {
    const state=gameState.wordsearch,pool=i18nData[currentLang].ws_pool;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    const _sAdj=_d==='easy'?-1:_d==='hard'?1:0;
    const size=Math.max(5,6+Math.min(Math.floor(state.level/5),2)+_sAdj);
    const fittingPool=pool.filter(w=>[...w].length<=size);
    const _wAdj=_d==='easy'?-1:_d==='hard'?1:0;
    const wc=Math.min(Math.max(2,4+Math.floor(state.level/3)+_wAdj),_d==='hard'?8:6);
    const candidates=shuffle([...fittingPool]).slice(0,wc*2);
    let grid=Array(size).fill(null).map(()=>Array(size).fill(''));
    const placedWords=[];
    candidates.forEach(word=>{
        if(placedWords.length>=wc)return;
        const chars=[...word];
        let placed=false,att=0;
        while(!placed&&att<100){
            const isH=Math.random()>.5,r=Math.floor(Math.random()*size),c=Math.floor(Math.random()*size);
            if(isH&&c+chars.length<=size){let ok=true;for(let i=0;i<chars.length;i++)if(grid[r][c+i]!==''&&grid[r][c+i]!==chars[i])ok=false;if(ok){for(let i=0;i<chars.length;i++)grid[r][c+i]=chars[i];placed=true;}}
            else if(!isH&&r+chars.length<=size){let ok=true;for(let i=0;i<chars.length;i++)if(grid[r+i][c]!==''&&grid[r+i][c]!==chars[i])ok=false;if(ok){for(let i=0;i<chars.length;i++)grid[r+i][c]=chars[i];placed=true;}}
            att++;
        }
        if(placed)placedWords.push(word);
    });
    const words=placedWords;
    const al=currentLang==='he'?'אבגדהוזחטיכלמנסעפצקרשת':(currentLang==='el'?'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ':'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    for(let r=0;r<size;r++)for(let c=0;c<size;c++)if(grid[r][c]==='')grid[r][c]=al[Math.floor(Math.random()*al.length)];
    state.selectedCells=[]; state.foundWords=0; state.words=words;
    const css=`<style>
.ws-wrap{display:flex;flex-direction:column;align-items:center;gap:24px;width:100%}
.ws-wrap .ws-paper{box-sizing:border-box;width:min(100%,calc(${size}*50px + 28px));padding:clamp(4px,2.2vw,14px);border-radius:14px;border:1px solid #d9c49a;background:repeating-linear-gradient(7deg,rgba(150,115,60,.045) 0 1px,transparent 1px 5px),repeating-linear-gradient(96deg,rgba(150,115,60,.04) 0 1px,transparent 1px 7px),linear-gradient(180deg,#fdf7e6,#f8edd2);box-shadow:inset 0 1px 0 #fff,0 2px 0 #e6d5ae,0 10px 22px rgba(90,60,20,.22);transition:box-shadow .7s}
.ws-wrap .ws-paper.ws-won{box-shadow:inset 0 1px 0 #fff,0 0 0 4px rgba(255,205,96,.65),0 0 32px 8px rgba(255,190,80,.6)}
.ws-wrap .ws-grid{display:grid;gap:clamp(1px,.6vw,4px);font-family:Georgia,'Times New Roman','David',serif;font-weight:700;font-size:clamp(1.4rem,5.2vw,1.8rem);line-height:1;-webkit-user-select:none;user-select:none}
.ws-wrap .ws-cell{aspect-ratio:1;min-width:0;display:flex;align-items:center;justify-content:center;border-radius:9px;color:#33241a;background:rgba(255,255,255,.6);box-shadow:inset 0 0 0 1px rgba(140,105,60,.3);cursor:pointer;transition:background-color .18s,box-shadow .18s;-webkit-tap-highlight-color:transparent}
@media (hover:hover){.ws-wrap .ws-cell:hover{background:#fff1c4}}
.ws-wrap .ws-c0{--ws-hl:rgba(244,184,44,.5)}.ws-wrap .ws-c1{--ws-hl:rgba(233,122,92,.42)}.ws-wrap .ws-c2{--ws-hl:rgba(136,176,92,.46)}.ws-wrap .ws-c3{--ws-hl:rgba(216,122,154,.4)}
.ws-wrap .ws-c4{--ws-hl:rgba(96,172,164,.42)}.ws-wrap .ws-c5{--ws-hl:rgba(164,134,196,.4)}.ws-wrap .ws-c6{--ws-hl:rgba(238,150,56,.5)}.ws-wrap .ws-c7{--ws-hl:rgba(186,140,92,.5)}
.ws-wrap .ws-cell.found{color:#2a1a0c!important;background:linear-gradient(var(--ws-hl,rgba(244,184,44,.5)),var(--ws-hl,rgba(244,184,44,.5))),#fffaf0!important;box-shadow:inset 0 0 0 1.5px rgba(90,60,30,.4)!important}
.ws-wrap .ws-cell.found.ws-cross{box-shadow:inset 0 0 0 2px rgba(90,60,30,.55),inset 0 0 0 4px rgba(255,250,235,.9),inset 0 0 0 5.5px rgba(90,60,30,.4)!important}
.ws-wrap .ws-cell.selected{color:#2a1a0c!important;background:#ffe08a!important;box-shadow:inset 0 0 0 2.5px #b7791f,0 1px 4px rgba(120,80,20,.35)!important}
.ws-wrap .ws-cell.bg-red-500{color:#2a1a0c!important;background:#eba692!important;box-shadow:inset 0 0 0 2.5px #b4452c!important}
.ws-wrap .ws-tags{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;max-width:24rem}
.ws-wrap .ws-tag{position:relative;display:inline-flex;align-items:center;gap:6px;padding:9px 16px;padding-inline-start:30px;border-radius:8px;border:1px solid #d6bf92;background:#fff8e6;color:#3a2a1c;font:700 1.25rem Georgia,'Times New Roman','David',serif;letter-spacing:.04em;box-shadow:0 2px 4px rgba(90,60,20,.18);transition:background-color .3s,color .3s}
.ws-wrap .ws-tag::before{content:"";position:absolute;inset-inline-start:10px;top:50%;width:9px;height:9px;margin-top:-4.5px;border-radius:50%;background:#e4d5b4;box-shadow:inset 0 1px 2px rgba(60,40,10,.55)}
.ws-wrap .ws-tag.bg-green-100{color:#4f4032;background:linear-gradient(var(--ws-hl),var(--ws-hl)),#fff8e6;text-decoration:line-through;text-decoration-thickness:2px;text-decoration-color:rgba(70,45,20,.65)}
.ws-wrap .ws-tag svg{flex:none;color:#2f6b2f}
@media (min-width:768px){.ws-wrap{flex-direction:row;justify-content:center;align-items:flex-start;gap:32px}.ws-wrap .ws-tags{flex-direction:column;align-items:stretch;width:11rem}}
@media (prefers-reduced-motion:reduce){.ws-wrap .ws-paper,.ws-wrap .ws-cell,.ws-wrap .ws-tag{transition:none}}
</style>`;
    let html=css+`<div class="ws-wrap flex flex-col md:flex-row gap-8 items-center"><div class="ws-paper"><div class="ws-grid grid" style="grid-template-columns:repeat(${size},minmax(0,1fr));">`;
    grid.forEach((row,r)=>row.forEach((l,c)=>{html+=`<div class="ws-cell" data-r="${r}" data-c="${c}" onclick="clickWsCell(this,'${l}',${r},${c})">${l}</div>`;}));
    html+=`</div></div><div class="ws-tags" id="ws-wordlist">`;
    words.forEach((w,i)=>{html+=`<div class="ws-tag ws-c${i%8} bg-slate-100 text-gray-500" data-hl="${i%8}" id="word-${w}">${w}</div>`;});
    container.innerHTML=html+`</div></div>`;
}
function clickWsCell(el,letter,r,c) {
    // A found cell stays tappable: words may cross on a shared letter, and with the old early return a second word
    // through an already-found letter (MUSIC and SPRING sharing the S) could never be completed.
    const state=gameState.wordsearch;
    if(el.classList.contains('selected')){el.classList.remove('selected');state.selectedCells=state.selectedCells.filter(x=>x.el!==el);return;}
    if(state.selectedCells.length>0&&!_wsValid(state.selectedCells,r,c)){sfxWrong();el.classList.add('bg-red-500');setTimeout(()=>el.classList.remove('bg-red-500'),300);state.selectedCells.forEach(x=>x.el.classList.remove('selected'));state.selectedCells=[];return;}
    el.classList.add('selected'); state.selectedCells.push({el,char:letter,r,c}); checkWordSearch();
}
function _wsValid(cells,nr,nc) {
    if(cells.length===0)return true;
    if(cells.length===1){const l=cells[0];return Math.abs(nr-l.r)+Math.abs(nc-l.c)===1;}
    const sameRow=cells.every(x=>x.r===cells[0].r),sameCol=cells.every(x=>x.c===cells[0].c);
    if(!sameRow&&!sameCol)return false;
    const rs=cells.map(x=>x.r),cs=cells.map(x=>x.c);
    if(sameRow)return nr===cells[0].r&&(nc===Math.min(...cs)-1||nc===Math.max(...cs)+1);
    return nc===cells[0].c&&(nr===Math.min(...rs)-1||nr===Math.max(...rs)+1);
}
function checkWordSearch() {
    const state=gameState.wordsearch,cur=state.selectedCells.map(x=>x.char).join(''),curR=state.selectedCells.map(x=>x.char).reverse().join('');
    const matched=state.words.includes(cur)?cur:state.words.includes(curR)?curR:null;
    if(matched){
        sfxCorrect();
        const we=document.getElementById(`word-${matched}`);
        // Presentation only: each found word takes the colour of its paper tag; a letter shared by two found words
        // keeps its first colour and gets a double ring.
        const hl='ws-c'+(we&&we.dataset&&we.dataset.hl!=null?we.dataset.hl:0);
        state.selectedCells.forEach(x=>{x.el.classList.remove('selected');if(x.el.classList.contains('found'))x.el.classList.add('ws-cross');else x.el.classList.add(hl);x.el.classList.add('found');});
        if(we){we.classList.replace('bg-slate-100','bg-green-100');we.classList.replace('text-gray-500','text-green-700');we.insertAdjacentHTML('afterbegin',Icon.ui('check',{sw:3})+' ');}
        state.words=state.words.filter(w=>w!==matched);state.selectedCells=[];
        if(state.words.length===0){
            const paper=typeof document.querySelector==='function'?document.querySelector('.ws-paper'):null;
            if(paper)paper.classList.add('ws-won');
            setTimeout(()=>levelComplete(),500);
        }
    }
}
