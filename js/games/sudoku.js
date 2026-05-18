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
    const sol=_sudokuGen9();
    const holes=Math.min(25+gs.level*3,52);
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
        <div style="color:#93c5fd;font-size:13px;font-weight:700;letter-spacing:0.05em">${isHe?'רמה':'LEVEL'} ${gameState.sudoku.level} &nbsp;·&nbsp; ${isHe?'בחרו תא ואז מספר':'TAP A CELL, THEN A NUMBER'}</div>
        <div style="display:grid;grid-template-columns:repeat(9,${sz});border:3px solid #3b82f6;border-radius:10px;overflow:hidden;box-shadow:0 0 30px rgba(59,130,246,0.25)">${cells}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">${numBtns}<button onclick="fillSudoku9(0)" style="width:40px;height:40px;background:#1a0a0a;border:1px solid #7f1d1d;border-radius:8px;color:#f87171;font-size:16px;font-weight:700;cursor:pointer" onmouseover="this.style.background='#7f1d1d'" onmouseout="this.style.background='#1a0a0a'">✕</button></div>
    </div>`;
}
function selectSudoku9(r,c){gameState.sudoku.sr=r;gameState.sudoku.sc=c;_sudokuRender(document.getElementById('gameContent'));}
function fillSudoku9(num) {
    const gs=gameState.sudoku;
    const r=gs.sr,c=gs.sc;
    if(r===-1||c===-1||gs.given[r][c])return;
    gs.filled[r][c]=num;
    if(num>0&&gs.sol[r][c]===num)sfxCorrect();else if(num>0)sfxWrong();
    let win=num>0;
    if(win)for(let rr=0;rr<9;rr++)for(let cc=0;cc<9;cc++)if(gs.filled[rr][cc]!==gs.sol[rr][cc])win=false;
    if(win)setTimeout(()=>levelComplete(),600);else _sudokuRender(document.getElementById('gameContent'));
}
