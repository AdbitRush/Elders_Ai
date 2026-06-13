// ═══════════════════════════════════════════════════════════════════════════════
// GAME 4: WORD SEARCH (with adjacency validation)
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
    const al=currentLang==='he'?'אבגדהוזחטיכלמנסעפצקרשת':'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for(let r=0;r<size;r++)for(let c=0;c<size;c++)if(grid[r][c]==='')grid[r][c]=al[Math.floor(Math.random()*al.length)];
    state.selectedCells=[]; state.foundWords=0; state.words=words;
    let html=`<div class="flex flex-col md:flex-row gap-8 items-center"><div class="bg-slate-800 border-4 border-slate-600 p-2 md:p-4 rounded-xl shadow-lg"><div class="grid gap-1 text-xl font-bold font-mono" style="grid-template-columns:repeat(${size},minmax(0,1fr));">`;
    grid.forEach((row,r)=>row.forEach((l,c)=>{html+=`<div class="ws-cell w-9 h-9 md:w-11 md:h-11 flex items-center justify-center border border-slate-600 rounded-lg bg-slate-700 text-slate-100 hover:bg-slate-600" data-r="${r}" data-c="${c}" onclick="clickWsCell(this,'${l}',${r},${c})">${l}</div>`;}));
    html+=`</div></div><div class="flex flex-col gap-3 text-lg font-bold w-40 text-center" id="ws-wordlist">`;
    words.forEach(w=>{html+=`<div class="bg-slate-100 p-2.5 rounded-lg border text-gray-500" id="word-${w}">${w}</div>`;});
    container.innerHTML=html+`</div></div>`;
}
function clickWsCell(el,letter,r,c) {
    if(el.classList.contains('found'))return;
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
    if(matched){sfxCorrect();state.selectedCells.forEach(x=>{x.el.classList.remove('selected');x.el.classList.add('found');});const we=document.getElementById(`word-${matched}`);if(we){we.classList.replace('bg-slate-100','bg-green-100');we.classList.replace('text-gray-500','text-green-700');}state.words=state.words.filter(w=>w!==matched);state.selectedCells=[];if(state.words.length===0)setTimeout(()=>levelComplete(),500);}
}
