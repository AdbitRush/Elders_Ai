// ═══════════════════════════════════════════════════════════════════════════════
// GAME 18: TETRIS  —  mobile-first controls + celebration FX (window.fx.*)
// ═══════════════════════════════════════════════════════════════════════════════
(function(){
const COLS=10,ROWS=20,SZ=28;
const PIECES=[
    {shape:[[1,1,1,1]],color:'#00f0f0'},           // I
    {shape:[[1,1],[1,1]],color:'#f0f000'},          // O
    {shape:[[0,1,0],[1,1,1]],color:'#a000f0'},      // T
    {shape:[[0,1,1],[1,1,0]],color:'#00f000'},      // S
    {shape:[[1,1,0],[0,1,1]],color:'#f00000'},      // Z
    {shape:[[1,0,0],[1,1,1]],color:'#0000f0'},      // J
    {shape:[[0,0,1],[1,1,1]],color:'#f0a000'},      // L
];
function rotate(m){return m[0].map((_,i)=>m.map(r=>r[i]).reverse());}
function newPiece(){const p=PIECES[Math.floor(Math.random()*PIECES.length)];return{shape:[...p.shape.map(r=>[...r])],color:p.color,x:Math.floor((COLS-p.shape[0].length)/2),y:0};}
const _fx = ()=>window.fx || {burst(){},lineSweep(){},fireworks(){},flash(){},shake(){},text(){},buzz(){}};

window.initTetris=function(container){
    if(window._gameCleanup){window._gameCleanup();window._gameCleanup=null;}
    const isHe=window.currentLang==='he';
    container.style.cssText='display:flex;flex-direction:column;align-items:center;gap:10px;padding:8px 0;width:100%';

    const scoreEl=document.createElement('div');
    scoreEl.style.cssText='color:#00f0f0;font-size:15px;font-weight:700;letter-spacing:0.08em;text-align:center';
    scoreEl.innerHTML=`<span>${isHe?'ניקוד':'SCORE'}: <b id="tet-score">0</b></span> &nbsp; <span>${isHe?'שורות':'LINES'}: <b id="tet-lines">0</b></span> &nbsp; <span>${isHe?'רמה':'LEVEL'}: <b id="tet-level">1</b></span>`;

    const canvas=document.createElement('canvas');
    canvas.width=COLS*SZ; canvas.height=ROWS*SZ;
    // Responsive: fills width on phones, capped on desktop. Crisp because the
    // internal buffer is fixed and the browser scales the element.
    canvas.style.cssText='width:min(90vw,300px);height:auto;aspect-ratio:'+COLS+'/'+ROWS+';border:2px solid #00f0f0;border-radius:8px;box-shadow:0 0 26px rgba(0,240,240,0.45);display:block;touch-action:none;image-rendering:auto';
    const ctx=canvas.getContext('2d');

    // ── Big, senior-friendly touch controls ────────────────────────────────────
    const pad=document.createElement('div');
    pad.style.cssText='display:grid;grid-template-columns:repeat(4,1fr);gap:10px;width:min(92vw,360px);margin-top:2px';
    function mkBtn(lbl,fn,opts){
        opts=opts||{};
        const b=document.createElement('button');
        b.textContent=lbl;
        b.style.cssText='height:64px;background:linear-gradient(180deg,#123a63,#0c1f3c);border:2px solid #00f0f0;border-radius:14px;color:#7ffcff;font-size:30px;font-weight:700;cursor:pointer;touch-action:none;user-select:none;-webkit-tap-highlight-color:transparent;box-shadow:0 0 14px rgba(0,240,240,.22),inset 0 1px 0 rgba(255,255,255,.15);transition:transform .06s,box-shadow .12s;'+(opts.span?('grid-column:span '+opts.span):'');
        let holdT=null,repT=null;
        const press=()=>{ b.style.transform='scale(.93)'; b.style.boxShadow='0 0 24px rgba(0,240,240,.6),inset 0 2px 6px rgba(0,0,0,.4)'; };
        const release=()=>{ b.style.transform=''; b.style.boxShadow='0 0 14px rgba(0,240,240,.22),inset 0 1px 0 rgba(255,255,255,.15)'; if(holdT)clearTimeout(holdT); if(repT)clearInterval(repT); holdT=repT=null; };
        b.addEventListener('pointerdown',e=>{ e.preventDefault(); if(b.disabled)return; press(); fn(); _fx().buzz(12);
            if(opts.repeat){ holdT=setTimeout(()=>{ repT=setInterval(()=>{fn();},opts.repeat); },260); } });
        ['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,release));
        return b;
    }
    pad.append(
        mkBtn('◀',()=>move(-1),{repeat:110}),
        mkBtn('⟳',()=>doRotate()),
        mkBtn('▶',()=>move(1),{repeat:110}),
        mkBtn('▼',()=>drop(),{repeat:60})
    );
    const dropBtn=mkBtn(isHe?'⤓ הפלה':'⤓ DROP',()=>hardDrop(),{span:4});
    dropBtn.style.fontSize='22px'; dropBtn.style.height='54px'; dropBtn.style.letterSpacing='.08em';
    const hint=document.createElement('div');
    hint.textContent=isHe?'💡 החליקו על הלוח: ימין/שמאל להזזה · מטה להפלה · נגיעה לסיבוב':'💡 Swipe the board: left/right to move · down to drop · tap to rotate';
    hint.style.cssText='color:#5a7ba0;font-size:12px;text-align:center;max-width:340px;line-height:1.5';

    container.append(scoreEl,canvas,pad,dropBtn,hint);

    const board=Array.from({length:ROWS},()=>Array(COLS).fill(null));
    let cur=newPiece(),next=newPiece(),score=0,lines=0,level=1,gameOver=false,raf=null;

    // screen rect for a board row (for spark placement), accounting for CSS scaling
    function rowScreen(r){ const rc=canvas.getBoundingClientRect(); const s=rc.width/canvas.width; return {top:rc.top+r*SZ*s, left:rc.left, width:rc.width, height:SZ*s}; }
    function boardCenter(){ const rc=canvas.getBoundingClientRect(); return {x:rc.left+rc.width/2, y:rc.top+rc.height/2}; }

    function valid(sh,px,py){for(let r=0;r<sh.length;r++)for(let c=0;c<sh[r].length;c++){if(!sh[r][c])continue;const nx=px+c,ny=py+r;if(nx<0||nx>=COLS||ny>=ROWS)return false;if(ny>=0&&board[ny][nx])return false;}return true;}

    function lock(){
        for(let r=0;r<cur.shape.length;r++)for(let c=0;c<cur.shape[r].length;c++){if(!cur.shape[r][c])continue;const y=cur.y+r;if(y<0){gameOver=true;return;} board[y][cur.x+c]=cur.color;}
        // find full rows first (so we can spark them at their real screen position)
        const full=[];for(let r=0;r<ROWS;r++){if(board[r].every(c=>c))full.push(r);}
        if(full.length){
            full.forEach(r=>_fx().lineSweep(rowScreen(r),['#ffffff','#00f0f0','#ffd700','#7ffcff']));
            const prevLevel=level;
            for(let i=full.length-1;i>=0;i--){board.splice(full[i],1);board.unshift(Array(COLS).fill(null));}
            const cleared=full.length;
            const gained=[0,100,300,500,800][cleared]*level;
            lines+=cleared;score+=gained;level=1+Math.floor(lines/10);
            document.getElementById('tet-score').textContent=score;
            document.getElementById('tet-lines').textContent=lines;
            document.getElementById('tet-level').textContent=level;
            const bc=boardCenter();
            _fx().text(bc.x,bc.y-20,(cleared===4?(isHe?'טטריס! ':'TETRIS! ')+'+':'+')+gained, cleared===4?'#ff6b6b':'#ffd700');
            _fx().flash(cleared>=3?'#00f0f0':'#123a63', 220);
            _fx().shake(canvas, cleared>=3?12:7);
            window.sfxCorrect&&sfxCorrect();
            if(cleared>=3){ _fx().fireworks(cleared); window.sfxWin&&sfxWin(); }
            if(level>prevLevel){ _fx().fireworks(7); _fx().text(bc.x,bc.y+40,(isHe?'רמה ':'LEVEL ')+level+'! ⭐','#4ecdc4'); window.sfxWin&&sfxWin(); }
        }
        cur=next;next=newPiece();if(!valid(cur.shape,cur.x,cur.y))gameOver=true;
    }

    function draw(){
        ctx.fillStyle='#050d1a';ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.strokeStyle='#0a1f35';ctx.lineWidth=0.5;
        for(let r=0;r<=ROWS;r++){ctx.beginPath();ctx.moveTo(0,r*SZ);ctx.lineTo(COLS*SZ,r*SZ);ctx.stroke();}
        for(let c=0;c<=COLS;c++){ctx.beginPath();ctx.moveTo(c*SZ,0);ctx.lineTo(c*SZ,ROWS*SZ);ctx.stroke();}
        board.forEach((row,r)=>row.forEach((col,c)=>{if(!col)return;ctx.fillStyle=col;ctx.fillRect(c*SZ+1,r*SZ+1,SZ-2,SZ-2);ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(c*SZ+1,r*SZ+1,SZ-2,4);ctx.fillRect(c*SZ+1,r*SZ+1,4,SZ-2);}));
        // ghost
        let gy=cur.y;while(valid(cur.shape,cur.x,gy+1))gy++;
        if(gy>cur.y){cur.shape.forEach((row,r)=>row.forEach((v,c)=>{if(!v)return;ctx.fillStyle='rgba(255,255,255,0.08)';ctx.fillRect((cur.x+c)*SZ+1,(gy+r)*SZ+1,SZ-2,SZ-2);}));}
        // current piece — glowing
        ctx.save();ctx.shadowColor=cur.color;ctx.shadowBlur=16;
        cur.shape.forEach((row,r)=>row.forEach((v,c)=>{if(!v)return;ctx.fillStyle=cur.color;ctx.fillRect((cur.x+c)*SZ+1,(cur.y+r)*SZ+1,SZ-2,SZ-2);ctx.fillStyle='rgba(255,255,255,0.35)';ctx.fillRect((cur.x+c)*SZ+1,(cur.y+r)*SZ+1,SZ-2,4);ctx.fillRect((cur.x+c)*SZ+1,(cur.y+r)*SZ+1,4,SZ-2);}));
        ctx.restore();
        if(gameOver){ctx.fillStyle='rgba(5,13,26,0.82)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#00f0f0';ctx.font='bold 22px monospace';ctx.textAlign='center';ctx.fillText(isHe?'משחק נגמר':'GAME OVER',canvas.width/2,canvas.height/2-20);ctx.font='15px monospace';ctx.fillStyle='#ffffff';ctx.fillText(`${isHe?'ניקוד':'Score'}: ${score}`,canvas.width/2,canvas.height/2+10);}
    }

    function move(dx){if(gameOver)return;if(valid(cur.shape,cur.x+dx,cur.y)){cur.x+=dx;}}
    function doRotate(){if(gameOver)return;const r=rotate(cur.shape);if(valid(r,cur.x,cur.y)){cur.shape=r;}else if(valid(r,cur.x-1,cur.y)){cur.shape=r;cur.x--;}else if(valid(r,cur.x+1,cur.y)){cur.shape=r;cur.x++;}window.sfxFlip&&sfxFlip();}
    function drop(){if(gameOver)return;if(valid(cur.shape,cur.x,cur.y+1))cur.y++;else lock();}
    function hardDrop(){if(gameOver)return;let d=0;while(valid(cur.shape,cur.x,cur.y+1)){cur.y++;d++;}const bc=boardCenter();if(d>0){_fx().buzz(20);_fx().shake(canvas,5);}lock();}

    const _dtet=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    const _baseDrop=_dtet==='easy'?1100:_dtet==='hard'?500:800;
    let lastT=0,dropInterval=Math.max(100,_baseDrop-level*60);
    function loop(t){if(gameOver){
        if(score>0&&window.gameState&&window.gameState.tetris){window.gameState.tetris._sessionScore=score;}
        draw();
        setTimeout(()=>{if(window.gameState&&window.gameState.active&&window.gameState.currentId==='tetris')window.levelComplete&&levelComplete();},1800);
        return;}
        dropInterval=Math.max(100,_baseDrop-level*60);
        if(t-lastT>dropInterval){drop();lastT=t;}
        draw();raf=requestAnimationFrame(loop);}
    raf=requestAnimationFrame(loop);

    // ── Keyboard (PC) ───────────────────────────────────────────────────────────
    function onKey(e){if(!window.gameState||window.gameState.currentId!=='tetris')return;
        if(e.key==='ArrowLeft')move(-1);else if(e.key==='ArrowRight')move(1);else if(e.key==='ArrowUp')doRotate();else if(e.key==='ArrowDown')drop();else if(e.key===' ')hardDrop();else return;e.preventDefault();}
    document.addEventListener('keydown',onKey);

    // ── Touch on the board: continuous drag to move, swipe-down to drop, tap to rotate
    let sx=0,sy=0,lastY=0,moved=false,dragging=false;
    const cellPx=()=>{const rc=canvas.getBoundingClientRect();return rc.width/COLS;};
    canvas.addEventListener('pointerdown',e=>{e.preventDefault();dragging=true;sx=e.clientX;sy=e.clientY;lastY=e.clientY;moved=false;});
    canvas.addEventListener('pointermove',e=>{
        if(!dragging)return;e.preventDefault();
        const cp=cellPx();
        const dxCells=Math.trunc((e.clientX-sx)/cp);
        if(dxCells!==0){ move(dxCells>0?1:-1); sx+=(dxCells>0?1:-1)*cp; moved=true; }
        if(e.clientY-lastY>cp){ drop(); lastY=e.clientY; moved=true; }
    });
    canvas.addEventListener('pointerup',e=>{
        dragging=false;
        const dx=e.clientX-sx,dy=e.clientY-sy;
        if(!moved && Math.abs(dx)<10 && Math.abs(dy)<10){ doRotate(); return; }   // tap = rotate
        if(!moved && dy < -40 && Math.abs(dy)>Math.abs(dx)){ hardDrop(); }          // quick swipe up = hard drop
    });
    canvas.addEventListener('pointercancel',()=>{dragging=false;});

    window._gameCleanup=()=>{if(raf)cancelAnimationFrame(raf);document.removeEventListener('keydown',onKey);};
};
})();
