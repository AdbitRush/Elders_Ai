// ═══════════════════════════════════════════════════════════════════════════════
// GAME 6: SUDOKU 9×9
// ═══════════════════════════════════════════════════════════════════════════════
function _sudokuGen9() {
    const base=[[1,2,3,4,5,6,7,8,9],[4,5,6,7,8,9,1,2,3],[7,8,9,1,2,3,4,5,6],
                [2,3,4,5,6,7,8,9,1],[5,6,7,8,9,1,2,3,4],[8,9,1,2,3,4,5,6,7],
                [3,4,5,6,7,8,9,1,2],[6,7,8,9,1,2,3,4,5],[9,1,2,3,4,5,6,7,8]];
    const nm=shuffle([1,2,3,4,5,6,7,8,9]);
    let g=base.map(row=>row.map(v=>nm[v-1]));
    for(let b=0;b<3;b++){const p=shuffle([0,1,2]);const sl=g.slice(b*3,b*3+3);g[b*3]=sl[p[0]];g[b*3+1]=sl[p[1]];g[b*3+2]=sl[p[2]];}
    for(let b=0;b<3;b++){const p=shuffle([0,1,2]);g=g.map(row=>{const n=[...row];n[b*3]=row[b*3+p[0]];n[b*3+1]=row[b*3+p[1]];n[b*3+2]=row[b*3+p[2]];return n;});}
    return g;
}
function initSudoku(container) {
    const gs=gameState.sudoku;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    const _hAdj=_d==='easy'?-10:_d==='hard'?10:0;
    const sol=_sudokuGen9();
    const holes=Math.min(Math.max(15,25+gs.level*3+_hAdj),56);
    const puz=sol.map(r=>[...r]);
    const given=Array(9).fill(null).map(()=>Array(9).fill(true));
    let rem=0;
    for(const pos of shuffle([...Array(81).keys()])){if(rem>=holes)break;const r=Math.floor(pos/9),c=pos%9;puz[r][c]=0;given[r][c]=false;rem++;}
    gs.sol=sol; gs.filled=puz; gs.given=given; gs.sr=-1; gs.sc=-1;
    _sudokuRender(container);
}
function _sudokuRender(c) {
    if(!gameState.active||gameState.currentId!=='sudoku')return;
    const gs=gameState.sudoku;
    const sr=gs.sr,sc_=gs.sc,sbr=sr>=0?Math.floor(sr/3):-1,sbc=sc_>=0?Math.floor(sc_/3):-1;
    const svn=sr>=0&&sc_>=0?gs.filled[sr][sc_]:0;
    const sz='clamp(34px,9.8vw,44px)';
    let cells='';
    for(let r=0;r<9;r++){
        for(let cc=0;cc<9;cc++){
            const v=gs.filled[r][cc];
            const isSel=r===sr&&cc===sc_;
            const inGrp=r===sr||cc===sc_||(Math.floor(r/3)===sbr&&Math.floor(cc/3)===sbc);
            const isSameN=!isSel&&svn>0&&v===svn;
            const isGiven=gs.given[r][cc];
            let conflict=false;
            if(v>0&&!isGiven){for(let i=0;i<9;i++){if(i!==cc&&gs.filled[r][i]===v)conflict=true;if(i!==r&&gs.filled[i][cc]===v)conflict=true;}const br=Math.floor(r/3),bc=Math.floor(cc/3);for(let dr=0;dr<3;dr++)for(let dc=0;dc<3;dc++){const nr=br*3+dr,nc=bc*3+dc;if((nr!==r||nc!==cc)&&gs.filled[nr][nc]===v)conflict=true;}}
            const borderR=(cc===2||cc===5)?'3px solid #3b82f6':'1px solid #1e3a5f';
            const borderB=(r===2||r===5)?'3px solid #3b82f6':'1px solid #1e3a5f';
            let bg=isSel?'#1d4ed8':isSameN?'#1e3a8a':inGrp?'#0f2040':'#0a1628';
            let color=conflict?'#f87171':isGiven?'#f0f4ff':'#60a5fa';
            let fw=isGiven?'800':'600';
            let fs='clamp(13px,3vw,17px)';
            cells+=`<div onclick="selectSudoku9(${r},${cc})" style="width:${sz};height:${sz};background:${bg};border-right:${borderR};border-bottom:${borderB};display:flex;align-items:center;justify-content:center;cursor:pointer;user-select:none;transition:background 0.15s;font-size:${fs};color:${color};font-weight:${fw}">${v||''}</div>`;
        }
    }
    const numBtns=[1,2,3,4,5,6,7,8,9].map(n=>`<button onclick="fillSudoku9(${n})" style="width:40px;height:40px;background:#0f2040;border:1px solid #1e3a5f;border-radius:8px;color:#93c5fd;font-size:16px;font-weight:700;cursor:pointer;transition:background 0.15s" onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#0f2040'">${n}</button>`).join('');
    const isHe=currentLang==='he';
    c.innerHTML=`<div style="display:flex;flex-direction:column;align-items:center;gap:16px">
        <div style="color:#93c5fd;font-size:13px;font-weight:700;letter-spacing:0.05em">${gt('LEVEL', 'רמה')} ${gameState.sudoku.level} &nbsp;·&nbsp; ${gt('TAP A CELL, THEN A NUMBER', 'בחרו תא ואז מספר')}</div>
        <div style="display:grid;grid-template-columns:repeat(9,${sz});border:3px solid #3b82f6;border-radius:10px;overflow:hidden;box-shadow:0 0 30px rgba(59,130,246,0.25)">${cells}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">${numBtns}<button onclick="fillSudoku9(0)" style="width:40px;height:40px;background:#1a0a0a;border:1px solid #7f1d1d;border-radius:8px;color:#f87171;font-size:16px;font-weight:700;cursor:pointer" onmouseover="this.style.background='#7f1d1d'" onmouseout="this.style.background='#1a0a0a'">✕</button></div>
    </div>`;
}
function selectSudoku9(r,c){gameState.sudoku.sr=r;gameState.sudoku.sc=c;_sudokuRender(document.getElementById('gameContent'));}
// Is placing `v` at (r,c) legal — no repeat in its row, column or 3×3 box?
// This is the actual rule of sudoku, and it is what the grid is judged on.
function _sudokuLegal(g,r,c,v){
    if(!v)return true;
    for(let i=0;i<9;i++){
        if(i!==c&&g[r][i]===v)return false;
        if(i!==r&&g[i][c]===v)return false;
    }
    const br=Math.floor(r/3)*3, bc=Math.floor(c/3)*3;
    for(let dr=0;dr<3;dr++)for(let dc=0;dc<3;dc++){
        const nr=br+dr,nc=bc+dc;
        if((nr!==r||nc!==c)&&g[nr][nc]===v)return false;
    }
    return true;
}
// Solved = every cell filled and every placement legal.
function _sudokuSolved(g){
    for(let r=0;r<9;r++)for(let c=0;c<9;c++){
        if(!g[r][c])return false;
        if(!_sudokuLegal(g,r,c,g[r][c]))return false;
    }
    return true;
}
function fillSudoku9(num) {
    const gs=gameState.sudoku;
    const r=gs.sr,c=gs.sc;
    if(r===-1||c===-1||gs.given[r][c])return;
    gs.filled[r][c]=num;

    // Judged against the RULES, not against the one solution we happened to
    // generate. The puzzle is made by punching holes at random with no
    // uniqueness check, so at higher levels (up to 56 holes, i.e. 25 givens) it
    // very often has more than one valid solution. The old test compared the
    // grid cell by cell to gs.sol, which meant a player who filled in a
    // different but perfectly correct grid was told nothing — no win, no
    // explanation, and no conflict shown anywhere on the board, because their
    // answer was in fact legal. The same comparison drove the per-move sound,
    // so a legal digit could be answered with the "wrong" buzzer.
    if(num>0) (_sudokuLegal(gs.filled,r,c,num) ? sfxCorrect() : sfxWrong());

    if(_sudokuSolved(gs.filled)) setTimeout(()=>levelComplete(),600);
    else _sudokuRender(document.getElementById('gameContent'));
}
