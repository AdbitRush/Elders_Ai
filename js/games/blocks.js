// ═══════════════════════════════════════════════════════════════════════════════
// GAME 18: BLOCKS  —  mobile-first controls + celebration FX (window.fx.*)
// Presentation: warm wooden toy blocks on a walnut board, paper score tiles,
// wooden control buttons, labeled "Next" preview. Pure canvas + inline CSS.
// ═══════════════════════════════════════════════════════════════════════════════
(function(){
const COLS=10,ROWS=20,SZ=28;
const PIECES=[
    {shape:[[1,1,1,1]],color:'#d9952f'},           // I  amber
    {shape:[[1,1],[1,1]],color:'#efcb63'},          // O  butter
    {shape:[[0,1,0],[1,1,1]],color:'#b07aa3'},      // T  dusty plum
    {shape:[[0,1,1],[1,1,0]],color:'#8aa655'},      // S  olive
    {shape:[[1,1,0],[0,1,1]],color:'#cc5c3e'},      // Z  terracotta
    {shape:[[1,0,0],[1,1,1]],color:'#6a93b8'},      // J  soft blue
    {shape:[[0,0,1],[1,1,1]],color:'#4fa399'},      // L  sage teal
];
function rotate(m){return m[0].map((_,i)=>m.map(r=>r[i]).reverse());}
function newPiece(){const p=PIECES[Math.floor(Math.random()*PIECES.length)];return{shape:[...p.shape.map(r=>[...r])],color:p.color,x:Math.floor((COLS-p.shape[0].length)/2),y:0};}
const _fx = ()=>window.fx || {burst(){},lineSweep(){},fireworks(){},flash(){},shake(){},text(){},buzz(){}};

// ── Drawing helpers (presentation only) ─────────────────────────────────────────
// mix a #rrggbb colour toward white (to=255) or black (to=0) by amt 0..1
function _mix(hex,to,amt){
    const n=parseInt(hex.slice(1),16);
    const ch=v=>Math.round(v+(to-v)*amt);
    return 'rgb('+ch(n>>16&255)+','+ch(n>>8&255)+','+ch(n&255)+')';
}
// rounded-rect path (no ctx.roundRect: older phones/tablets lack it)
function _rr(g,x,y,w,h,r){
    g.beginPath();g.moveTo(x+r,y);
    g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);
    g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();
}
// one painter per 2d context: draws a single wooden toy block at pixel (px,py)
function _painter(g){
    const cache={};
    return function(px,py,color,lift){
        let k=cache[color];
        if(!k){
            const gr=g.createLinearGradient(0,1,0,SZ-1);
            gr.addColorStop(0,_mix(color,255,.28));gr.addColorStop(.45,color);gr.addColorStop(1,_mix(color,0,.22));
            k=cache[color]={body:gr,edge:_mix(color,0,.45),hi:_mix(color,255,.6),lo:_mix(color,0,.32)};
        }
        g.save();g.translate(px,py);
        if(lift){g.shadowColor='rgba(20,10,0,0.45)';g.shadowBlur=5;g.shadowOffsetY=2;}   // soft drop shadow, not a glow
        _rr(g,1.5,1.5,SZ-3,SZ-3,6);g.fillStyle=k.body;g.fill();
        g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;
        g.lineWidth=1;g.strokeStyle=k.edge;g.stroke();
        g.globalAlpha=.55;_rr(g,5,4,SZ-10,4,2);g.fillStyle=k.hi;g.fill();          // top highlight
        g.globalAlpha=.5;_rr(g,5,SZ-7.5,SZ-10,3,1.5);g.fillStyle=k.lo;g.fill();    // bottom shading
        g.restore();
    };
}

window.initBlocks=function(container){
    if(window._gameCleanup){window._gameCleanup();window._gameCleanup=null;}
    const isHe=currentLang==='he';   // let globals from index.html: not on window
    const _calm=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    container.style.cssText='display:flex;flex-direction:column;align-items:center;gap:10px;padding:8px 0;width:100%';

    // ── Score tiles (paper cards) ───────────────────────────────────────────────
    const _tile='flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;gap:1px;padding:6px 4px 7px;background:linear-gradient(180deg,#fffaf0,#f6ead2);border:1px solid #dcc59a;border-radius:12px;box-shadow:0 2px 5px rgba(90,55,15,.12);color:#6b4a22;font-size:14px;font-weight:700;letter-spacing:.03em;line-height:1.25';
    const _val='display:block;color:var(--w-table-ink,#2a1a0c);font-size:24px;font-weight:800;letter-spacing:0;line-height:1.1;font-variant-numeric:tabular-nums';
    const scoreEl=document.createElement('div');
    scoreEl.style.cssText='display:flex;gap:8px;justify-content:center;width:100%;max-width:420px;box-sizing:border-box;text-align:center';
    scoreEl.innerHTML=`<span style="${_tile}">${gt('SCORE', 'ניקוד')} <b id="tet-score" style="${_val}">0</b></span><span style="${_tile}">${gt('LINES', 'שורות')} <b id="tet-lines" style="${_val}">0</b></span><span style="${_tile}">${gt('LEVEL', 'רמה')} <b id="tet-level" style="${_val}">1</b></span>`;

    const canvas=document.createElement('canvas');
    canvas.width=COLS*SZ; canvas.height=ROWS*SZ;
    // Responsive: fills width on phones, capped on desktop. Crisp because the
    // internal buffer is fixed and the browser scales the element.
    // The third min() term leaves room for the Next box beside the board on narrow phones.
    canvas.style.cssText='height:min(46vh,560px,calc(200vw - 360px));height:min(46dvh,560px,calc(200vw - 360px));width:auto;max-width:100%;aspect-ratio:'+COLS+'/'+ROWS+';border-radius:7px;display:block;touch-action:none;image-rendering:auto';
    const ctx=canvas.getContext('2d');
    const paint=_painter(ctx);

    // wooden frame around the board (the canvas itself carries no border, so
    // rowScreen()/cellPx() map 1:1 onto the playfield)
    const frame=document.createElement('div');
    frame.style.cssText='flex:0 0 auto;padding:8px;border-radius:14px;background:linear-gradient(160deg,#bb8750,#93602f 55%,#7c4f26);box-shadow:0 6px 16px rgba(70,40,10,.28),inset 0 1px 0 rgba(255,236,200,.5),inset 0 -2px 0 rgba(50,28,8,.35)';
    frame.append(canvas);

    // ── Next piece preview ──────────────────────────────────────────────────────
    const nextBox=document.createElement('div');
    nextBox.style.cssText='flex:0 0 auto;width:88px;box-sizing:border-box;padding:7px 7px 9px;background:linear-gradient(180deg,#fffaf0,#f6ead2);border:1px solid #dcc59a;border-radius:12px;box-shadow:0 2px 5px rgba(90,55,15,.12);text-align:center';
    const nextLbl=document.createElement('div');
    nextLbl.textContent=gt('NEXT', 'הבא');
    nextLbl.style.cssText='color:#6b4a22;font-size:15px;font-weight:700;letter-spacing:.03em;line-height:1.3;margin-bottom:5px';
    const nextCv=document.createElement('canvas');
    nextCv.width=4*SZ+16; nextCv.height=2*SZ+20;
    nextCv.setAttribute('role','img'); nextCv.setAttribute('aria-label',gt('Next piece', 'החלק הבא'));
    nextCv.style.cssText='display:block;width:100%;height:auto;aspect-ratio:'+nextCv.width+'/'+nextCv.height+';border-radius:8px;background:#35271c;box-shadow:inset 0 2px 5px rgba(0,0,0,.35)';
    const nctx=nextCv.getContext('2d');
    const paintNext=_painter(nctx);
    nextBox.append(nextLbl,nextCv);

    const stage=document.createElement('div');
    stage.style.cssText='display:flex;align-items:flex-start;justify-content:center;gap:10px;width:100%;max-width:100%;box-sizing:border-box';
    stage.append(frame,nextBox);

    // ── Big, senior-friendly touch controls ────────────────────────────────────
    const pad=document.createElement('div');
    pad.style.cssText='display:grid;grid-template-columns:repeat(5,1fr);gap:8px;width:100%;max-width:420px;box-sizing:border-box;margin-top:2px;padding-bottom:5px';  // 100% of the card, not 94vw: at 320 px 94vw ran 6 px past the card on each side
    const _btnUp='0 4px 0 #8a5a2b,0 7px 10px rgba(70,40,10,.22),inset 0 1px 0 rgba(255,255,255,.65)';
    const _btnDown='0 1px 0 #8a5a2b,inset 0 2px 6px rgba(70,40,10,.4)';
    function mkBtn(lbl,fn,opts){
        opts=opts||{};
        const b=document.createElement('button');
        b.textContent=lbl; if(opts.key)b.dataset.b=opts.key; if(opts.label)b.setAttribute('aria-label',opts.label);
        b.style.cssText='height:64px;background:linear-gradient(180deg,#f7e2b4,#e2b56c 55%,#cf9a4c);border:2px solid #8a5a2b;border-radius:14px;color:#3a240f;font-size:30px;font-weight:700;line-height:1;padding:0;cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;box-shadow:'+_btnUp+';transition:'+(_calm?'none':'transform .06s,box-shadow .12s')+';'+(opts.span?('grid-column:span '+opts.span):'');
        let holdT=null,repT=null;
        const press=()=>{ b.style.transform='translateY(3px)'; b.style.boxShadow=_btnDown; };
        const release=()=>{ b.style.transform=''; b.style.boxShadow=_btnUp; if(holdT)clearTimeout(holdT); if(repT)clearInterval(repT); holdT=repT=null; };
        b.addEventListener('pointerdown',e=>{ e.preventDefault(); if(b.disabled)return; press(); fn(); _fx().buzz(12);
            if(opts.repeat){ holdT=setTimeout(()=>{ repT=setInterval(()=>{fn();},opts.repeat); },260); } });
        ['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,release));
        return b;
    }
    pad.append(
        mkBtn('◀',()=>move(-1),{repeat:110,key:'left',label:'Move left'}),
        mkBtn('⟳',()=>doRotate(),{key:'rotate',label:'Rotate'}),
        mkBtn('▶',()=>move(1),{repeat:110,key:'right',label:'Move right'}),
        mkBtn('▼',()=>drop(),{repeat:60,key:'down',label:'Move down'}),
        mkBtn('⤓',()=>hardDrop(),{key:'drop',label:'Drop'})
    );
    pad.querySelectorAll('button').forEach(b=>{b.style.height='60px';});
    // Start / Pause and Restart: the game waits for Start, and can be paused at any time (2026-10-10 review)
    const bar=document.createElement('div');
    bar.style.cssText='display:flex;gap:10px;justify-content:center;flex-wrap:wrap';
    const mkTop=(lbl,fn,key)=>{const b=document.createElement('button');b.type='button';b.dataset.b=key;b.className='gk-btn'+(key==='start'?' gk-primary':'');b.innerHTML=lbl;b.addEventListener('click',fn);return b;};
    const startBtn=mkTop(Icon.ui('play')+' '+gt('Start', 'התחל'),()=>togglePause(),'start');
    const restartBtn=mkTop(Icon.ui('rotate-ccw')+' '+gt('Restart', 'מחדש'),()=>{ if(window._gameCleanup){window._gameCleanup();window._gameCleanup=null;} container.innerHTML=''; window.initBlocks(container); },'restart');
    bar.append(startBtn,restartBtn);
    const hint=document.createElement('div');
    hint.innerHTML=Icon.ui('lightbulb')+' ';hint.append(gt('Swipe the board: left/right to move · down to drop · tap to rotate', 'החליקו על הלוח: ימין/שמאל להזזה · מטה להפלה · נגיעה לסיבוב'));
    hint.style.cssText='color:var(--w-table-ink,#2a1a0c);opacity:.9;font-size:16px;text-align:center;max-width:360px;line-height:1.5';

    if(typeof GameKit!=='undefined')GameKit.css();
    container.append(scoreEl,bar,stage,pad,hint);

    const board=Array.from({length:ROWS},()=>Array(COLS).fill(null));
    let cur=newPiece(),next=newPiece(),score=0,lines=0,level=1,gameOver=false,raf=null,paused=true,started=false;
    function togglePause(){ if(gameOver)return; paused=!paused; if(!paused&&!started){started=true; scoreEl.scrollIntoView({block:'start',behavior:'smooth'});}
        startBtn.innerHTML=(paused?Icon.ui('play')+' '+gt(started?'Resume':'Start', started?'המשך':'התחל'):Icon.ui('pause')+' '+gt('Pause', 'השהה'));
        startBtn.classList.toggle('gk-primary',paused); lastT=performance.now(); }

    // screen rect for a board row (for spark placement), accounting for CSS scaling
    function rowScreen(r){ const rc=canvas.getBoundingClientRect(); const s=rc.width/canvas.width; return {top:rc.top+r*SZ*s, left:rc.left, width:rc.width, height:SZ*s}; }
    function boardCenter(){ const rc=canvas.getBoundingClientRect(); return {x:rc.left+rc.width/2, y:rc.top+rc.height/2}; }

    function valid(sh,px,py){for(let r=0;r<sh.length;r++)for(let c=0;c<sh[r].length;c++){if(!sh[r][c])continue;const nx=px+c,ny=py+r;if(nx<0||nx>=COLS||ny>=ROWS)return false;if(ny>=0&&board[ny][nx])return false;}return true;}

    function lock(){
        for(let r=0;r<cur.shape.length;r++)for(let c=0;c<cur.shape[r].length;c++){if(!cur.shape[r][c])continue;const y=cur.y+r;if(y<0){gameOver=true;return;} board[y][cur.x+c]=cur.color;}
        // find full rows first (so we can spark them at their real screen position)
        const full=[];for(let r=0;r<ROWS;r++){if(board[r].every(c=>c))full.push(r);}
        if(full.length){
            full.forEach(r=>_fx().lineSweep(rowScreen(r),['#ffffff','#c98a2b','#ffd700','#7ffcff']));
            const prevLevel=level;
            for(let i=full.length-1;i>=0;i--){board.splice(full[i],1);board.unshift(Array(COLS).fill(null));}
            const cleared=full.length;
            const gained=[0,100,300,500,800][cleared]*level;
            lines+=cleared;score+=gained;level=1+Math.floor(lines/10);
            document.getElementById('tet-score').textContent=score;
            document.getElementById('tet-lines').textContent=lines;
            document.getElementById('tet-level').textContent=level;
            const bc=boardCenter();
            _fx().text(bc.x,bc.y-20,(cleared===4?(gt('FOUR LINES! ', 'ארבע שורות! '))+'+':'+')+gained, cleared===4?'#ff6b6b':'#ffd700');
            _fx().flash(cleared>=3?'#c98a2b':'#123a63', 220);
            _fx().shake(canvas, cleared>=3?12:7);
            window.sfxCorrect&&sfxCorrect();
            if(cleared>=3){ _fx().fireworks(cleared); window.sfxWin&&sfxWin(); }
            if(level>prevLevel){ _fx().fireworks(7); _fx().text(bc.x,bc.y+40,(gt('LEVEL ', 'רמה '))+level+'! ⭐','#4ecdc4'); window.sfxWin&&sfxWin(); }
        }
        cur=next;next=newPiece();if(!valid(cur.shape,cur.x,cur.y))gameOver=true;
    }

    // ── Painting ────────────────────────────────────────────────────────────────
    const W=canvas.width,H=canvas.height;
    const _bg=ctx.createLinearGradient(0,0,0,H);
    _bg.addColorStop(0,'#3d2d20');_bg.addColorStop(1,'#2e2118');
    let _nextShown=null;
    // cream paper card with centred text, used by the Start / Paused / Game-over veils
    function veil(alpha,title,sub){
        ctx.fillStyle='rgba(42,26,12,'+alpha+')';ctx.fillRect(0,0,W,H);
        const ph=sub?112:76,pw=W-36,px=18,py=H/2-ph/2;
        ctx.save();ctx.shadowColor='rgba(20,10,0,0.45)';ctx.shadowBlur=14;ctx.shadowOffsetY=4;
        _rr(ctx,px,py,pw,ph,14);ctx.fillStyle='#fdf5e2';ctx.fill();ctx.restore();
        _rr(ctx,px,py,pw,ph,14);ctx.lineWidth=3;ctx.strokeStyle='#c98a2b';ctx.stroke();
        ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillStyle='#2a1a0c';ctx.font='bold 30px sans-serif';
        ctx.fillText(title,W/2,sub?py+40:H/2+1,pw-20);
        if(sub){ctx.fillStyle='#6b4a22';ctx.font='bold 23px sans-serif';ctx.fillText(sub,W/2,py+81,pw-20);}
        ctx.textBaseline='alphabetic';
    }
    function drawNext(){
        _nextShown=next;
        nctx.clearRect(0,0,nextCv.width,nextCv.height);
        const sh=next.shape,ox=(nextCv.width-sh[0].length*SZ)/2,oy=(nextCv.height-sh.length*SZ)/2;
        sh.forEach((row,r)=>row.forEach((v,c)=>{if(v)paintNext(ox+c*SZ,oy+r*SZ,next.color,false);}));
    }

    function draw(){
        // walnut playfield, faint alternating columns (helps line a piece up), soft grid
        ctx.fillStyle=_bg;ctx.fillRect(0,0,W,H);
        ctx.fillStyle='rgba(255,236,200,0.035)';
        for(let c=0;c<COLS;c+=2)ctx.fillRect(c*SZ,0,SZ,H);
        ctx.strokeStyle='rgba(255,232,196,0.11)';ctx.lineWidth=1;
        ctx.beginPath();
        for(let r=1;r<ROWS;r++){ctx.moveTo(0,r*SZ+.5);ctx.lineTo(W,r*SZ+.5);}
        for(let c=1;c<COLS;c++){ctx.moveTo(c*SZ+.5,0);ctx.lineTo(c*SZ+.5,H);}
        ctx.stroke();
        board.forEach((row,r)=>row.forEach((col,c)=>{if(!col)return;paint(c*SZ,r*SZ,col,false);}));
        // ghost — subtle dashed outline where the piece will land
        let gy=cur.y;while(valid(cur.shape,cur.x,gy+1))gy++;
        if(gy>cur.y){
            ctx.save();ctx.lineWidth=1.5;ctx.strokeStyle='rgba(255,240,214,0.42)';ctx.fillStyle='rgba(255,240,214,0.09)';
            if(ctx.setLineDash)ctx.setLineDash([4,3]);
            cur.shape.forEach((row,r)=>row.forEach((v,c)=>{if(!v)return;_rr(ctx,(cur.x+c)*SZ+3,(gy+r)*SZ+3,SZ-6,SZ-6,5);ctx.fill();ctx.stroke();}));
            ctx.restore();
        }
        // current piece — lifted off the board by a soft shadow
        cur.shape.forEach((row,r)=>row.forEach((v,c)=>{if(!v)return;paint((cur.x+c)*SZ,(cur.y+r)*SZ,cur.color,true);}));
        if(_nextShown!==next)drawNext();
        if(gameOver){veil(0.8,gt('GAME OVER', 'משחק נגמר'),`${gt('Score', 'ניקוד')}: ${score}`);}
    }

    function move(dx){if(gameOver||paused)return;if(valid(cur.shape,cur.x+dx,cur.y)){cur.x+=dx;}}
    function doRotate(){if(gameOver||paused)return;const r=rotate(cur.shape);if(valid(r,cur.x,cur.y)){cur.shape=r;}else if(valid(r,cur.x-1,cur.y)){cur.shape=r;cur.x--;}else if(valid(r,cur.x+1,cur.y)){cur.shape=r;cur.x++;}window.sfxFlip&&sfxFlip();}
    function drop(){if(gameOver||paused)return;if(valid(cur.shape,cur.x,cur.y+1))cur.y++;else lock();}
    function hardDrop(){if(gameOver||paused)return;let d=0;while(valid(cur.shape,cur.x,cur.y+1)){cur.y++;d++;}const bc=boardCenter();if(d>0){_fx().buzz(20);_fx().shake(canvas,5);}lock();}

    const _dtet=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    const _baseDrop=_dtet==='easy'?1100:_dtet==='hard'?500:800;
    let lastT=0,dropInterval=Math.max(100,_baseDrop-level*60);
    function loop(t){if(gameOver){
        // the end screen judges a Falling Blocks game by lines cleared (0 lines = "Nice try", no level-up)
        gameState.blocks._blocksLines=lines;
        draw();
        setTimeout(()=>{if(gameState.active&&gameState.currentId==='blocks')levelComplete();},1800);
        return;}
        dropInterval=Math.max(100,_baseDrop-level*60);
        if(!paused&&t-lastT>dropInterval){drop();lastT=t;}
        draw();
        if(paused){veil(0.6,started?gt('Paused', 'מושהה'):gt('Press Start', 'לחצו התחל'));}
        raf=requestAnimationFrame(loop);}
    raf=requestAnimationFrame(loop);

    // ── Keyboard (PC) ───────────────────────────────────────────────────────────
    function onKey(e){if(gameState.currentId!=='blocks')return;
        if(e.key==='Enter'||e.key==='p'||e.key==='P'){togglePause();e.preventDefault();return;}
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
