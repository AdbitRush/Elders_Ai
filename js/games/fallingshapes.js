// ═══════════════════════════════════════════════════════════════════════════════
// FALLING SHAPES (working title — PROPOSED, review only, not catalog inventory)
// An original falling-blocks design for Dear Old Days.
//
// Rights-aware design choices (see review notes):
//  - Original shape family of six pieces sized 3-5 cells (trio, nook, block,
//    cross, cup, rail) - NOT the standard seven tetrominoes.
//  - Board is 12 x 16 - NOT the classic 10 x 20 proportions.
//  - Own felt-craft palette; no Tetris Guideline colour mapping.
//  - Two-shape "Up next" queue, flat landing-patch hint (no dashed ghost copy),
//    own scoring values, own wording (Points / Rows / Round, Spin, Place).
//  - No music; no branded name/logo. Renaming alone is not a legal guarantee.
// Mechanics (fall, rotate, clear full rows) are functional ideas; the
// presentation here is deliberately distinct.
//
// Self-contained: works without site globals; uses window.fx/* when present.
// Exposes window.initFallingShapes(container) in the site module convention.
// ═══════════════════════════════════════════════════════════════════════════════
(function(){
const COLS=12,ROWS=16,SZ=26;
// Original family: mixed sizes 3-5 cells. Names are internal.
const PIECES=[
    {shape:[[1,1,1]],color:'#c96f4a'},                    // trio   - terracotta
    {shape:[[1,0],[1,1]],color:'#4e7d6b'},                // nook   - sage
    {shape:[[1,1],[1,1]],color:'#d9a441'},                // block  - marigold
    {shape:[[0,1,0],[1,1,1],[0,1,0]],color:'#7a6a9e'},    // cross  - dusty violet
    {shape:[[1,0,1],[1,1,1]],color:'#3f7e8c'},            // cup    - deep teal
    {shape:[[1,1,1,1,1]],color:'#8c4f68'},                // rail   - plum
];
function rotate(m){return m[0].map((_,i)=>m.map(r=>r[i]).reverse());}
const _fx=()=>window.fx||{burst(){},lineSweep(){},fireworks(){},flash(){},shake(){},text(){},buzz(){}};

// ── Felt-piece painting helpers ────────────────────────────────────────────────
function _mix(hex,to,amt){
    const n=parseInt(hex.slice(1),16);
    const ch=v=>Math.round(v+(to-v)*amt);
    return 'rgb('+ch(n>>16&255)+','+ch(n>>8&255)+','+ch(n&255)+')';
}
function _rr(g,x,y,w,h,r){
    g.beginPath();g.moveTo(x+r,y);
    g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);
    g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();
}
// one felt tile with a stitched edge - a deliberately different look from the
// wooden blocks of the existing catalog game and from any branded presentation
function _painter(g){
    const cache={};
    return function(px,py,color,lift){
        let k=cache[color];
        if(!k){
            const gr=g.createLinearGradient(0,1,0,SZ-1);
            gr.addColorStop(0,_mix(color,255,.34));gr.addColorStop(.5,color);gr.addColorStop(1,_mix(color,0,.18));
            k=cache[color]={body:gr,edge:_mix(color,0,.5),stitch:_mix(color,255,.72)};
        }
        g.save();g.translate(px,py);
        if(lift){g.shadowColor='rgba(40,30,15,0.4)';g.shadowBlur=5;g.shadowOffsetY=2;}
        _rr(g,1.5,1.5,SZ-3,SZ-3,7);g.fillStyle=k.body;g.fill();
        g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;
        g.lineWidth=1;g.strokeStyle=k.edge;g.stroke();
        // stitched inner border
        if(g.setLineDash)g.setLineDash([3,3]);
        g.lineWidth=1.4;g.strokeStyle=k.stitch;g.globalAlpha=.8;
        _rr(g,5,5,SZ-10,SZ-10,4);g.stroke();
        g.restore();
    };
}

window.initFallingShapes=function(container,opts){
    opts=opts||{};
    const T=(en,he)=>(opts.lang==='he'?he:en);
    if(window._gameCleanup){window._gameCleanup();window._gameCleanup=null;}
    const _calm=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    container.style.cssText='display:flex;flex-direction:column;align-items:center;gap:12px;padding:8px 0;width:100%';

    // ── Score tiles (Points / Rows / Round - own wording) ──────────────────────
    const _tile='flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px 9px;background:var(--fs-paper,#fffaf2);border:1px solid var(--fs-line,#d8c9b4);border-radius:12px;box-shadow:0 2px 5px rgba(90,70,40,.10);color:#7a6a52;font-size:15px;font-weight:700;letter-spacing:.04em;line-height:1.25';
    const _val='display:block;color:var(--fs-ink,#2c2418);font-size:26px;font-weight:800;line-height:1.1;font-variant-numeric:tabular-nums';
    const scoreEl=document.createElement('div');
    scoreEl.style.cssText='display:flex;gap:8px;justify-content:center;width:100%;max-width:440px;box-sizing:border-box;text-align:center';
    scoreEl.innerHTML='<span style="'+_tile+'">'+T('POINTS','נקודות')+' <b id="fs-points" style="'+_val+'">0</b></span>'
        +'<span style="'+_tile+'">'+T('ROWS','שורות')+' <b id="fs-rows" style="'+_val+'">0</b></span>'
        +'<span style="'+_tile+'">'+T('ROUND','סיבוב')+' <b id="fs-round" style="'+_val+'">1</b></span>';

    // ── Board canvas (12 x 16 - own proportions) ───────────────────────────────
    const canvas=document.createElement('canvas');
    canvas.width=COLS*SZ;canvas.height=ROWS*SZ;
    // The third min() term guarantees board + frame + Up-next panel fit within the viewport width
    canvas.style.cssText='height:min(52vh,520px,calc((100vw - 170px)*4/3));height:min(52dvh,520px,calc((100vw - 170px)*4/3));width:auto;max-width:100%;aspect-ratio:'+COLS+'/'+ROWS+';border-radius:8px;display:block;touch-action:none';
    canvas.setAttribute('role','img');
    canvas.setAttribute('aria-label',T('Falling Shapes board','לוח Falling Shapes'));
    const ctx=canvas.getContext('2d');
    const paint=_painter(ctx);

    // craft-table mat frame
    const frame=document.createElement('div');
    frame.style.cssText='flex:0 0 auto;padding:9px;border-radius:16px;background:linear-gradient(160deg,#e8dcc4,#d6c5a3 60%,#c4b08a);box-shadow:0 6px 16px rgba(80,60,30,.20),inset 0 1px 0 rgba(255,250,235,.7)';
    frame.append(canvas);

    // ── Up-next panel: shows TWO upcoming shapes ───────────────────────────────
    const nextBox=document.createElement('div');
    nextBox.style.cssText='flex:0 0 auto;width:104px;box-sizing:border-box;padding:8px 8px 10px;background:var(--fs-paper,#fffaf2);border:1px solid var(--fs-line,#d8c9b4);border-radius:12px;box-shadow:0 2px 5px rgba(90,70,40,.10);text-align:center';
    const nextLbl=document.createElement('div');
    nextLbl.textContent=T('UP NEXT','הבאים');
    nextLbl.style.cssText='color:#7a6a52;font-size:16px;font-weight:700;letter-spacing:.04em;line-height:1.3;margin-bottom:6px';
    const nextCv=document.createElement('canvas');
    nextCv.width=5*SZ+16;nextCv.height=7*SZ+16;
    nextCv.setAttribute('role','img');nextCv.setAttribute('aria-label',T('Next two shapes','שני החלקים הבאים'));
    nextCv.style.cssText='display:block;width:100%;height:auto;aspect-ratio:'+nextCv.width+'/'+nextCv.height+';border-radius:8px;background:#f3ead9;box-shadow:inset 0 2px 5px rgba(90,70,40,.18)';
    const nctx=nextCv.getContext('2d');
    const paintNext=_painter(nctx);
    nextBox.append(nextLbl,nextCv);

    const stage=document.createElement('div');
    stage.style.cssText='display:flex;align-items:flex-start;justify-content:center;gap:10px;width:100%;max-width:100%;box-sizing:border-box';
    stage.append(frame,nextBox);

    // ── Large labelled touch controls (senior-friendly) ────────────────────────
    const pad=document.createElement('div');
    pad.style.cssText='display:grid;grid-template-columns:repeat(5,1fr);gap:8px;width:100%;max-width:440px;box-sizing:border-box;padding-bottom:4px';
    const _btnUp='0 4px 0 #a8916c,0 7px 10px rgba(80,60,30,.18),inset 0 1px 0 rgba(255,255,255,.6)';
    const _btnDown='0 1px 0 #a8916c,inset 0 2px 6px rgba(80,60,30,.35)';
    function mkBtn(html,fn,o){
        o=o||{};
        const b=document.createElement('button');
        b.innerHTML=html;if(o.key)b.dataset.b=o.key;if(o.label)b.setAttribute('aria-label',o.label);
        b.style.cssText='min-height:64px;background:linear-gradient(180deg,#fbf3e1,#efdfc0 55%,#e2cda6);border:2px solid #a8916c;border-radius:14px;color:#3d2f1c;font-size:15px;font-weight:800;line-height:1.15;padding:4px 2px;cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;box-shadow:'+_btnUp+';transition:'+(_calm?'none':'transform .06s,box-shadow .12s');
        let holdT=null,repT=null;
        const press=()=>{b.style.transform='translateY(3px)';b.style.boxShadow=_btnDown;};
        const release=()=>{b.style.transform='';b.style.boxShadow=_btnUp;if(holdT)clearTimeout(holdT);if(repT)clearInterval(repT);holdT=repT=null;};
        b.addEventListener('pointerdown',e=>{e.preventDefault();if(b.disabled)return;press();fn();_fx().buzz(12);
            if(o.repeat){holdT=setTimeout(()=>{repT=setInterval(fn,o.repeat);},280);}});
        ['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,release));
        return b;
    }
    const arrow=(ch,word)=>ch+'<br><span style="font-size:13px;font-weight:700">'+word+'</span>';
    pad.append(
        mkBtn(arrow('◀',T('Left','שמאל')),()=>move(-1),{repeat:120,key:'left',label:'Move left'}),
        mkBtn(arrow('⟳',T('Spin','סובב')),()=>doRotate(),{key:'rotate',label:'Rotate'}),
        mkBtn(arrow('▶',T('Right','ימין')),()=>move(1),{repeat:120,key:'right',label:'Move right'}),
        mkBtn(arrow('▼',T('Down','מטה')),()=>softDrop(),{repeat:70,key:'down',label:'Move down'}),
        mkBtn(arrow('⤓',T('Place','הנח')),()=>hardDrop(),{key:'drop',label:'Place now'})
    );

    const bar=document.createElement('div');
    bar.style.cssText='display:flex;gap:10px;justify-content:center;flex-wrap:wrap';
    function mkTop(lbl,fn,key,primary){
        const b=document.createElement('button');b.type='button';b.dataset.b=key;b.textContent=lbl;
        b.style.cssText='min-height:52px;padding:10px 26px;border-radius:14px;font-size:19px;font-weight:800;cursor:pointer;touch-action:manipulation;'
            +(primary?'background:#214c40;color:#fff;border:2px solid #214c40':'background:var(--fs-paper,#fffaf2);color:#214c40;border:2px solid #214c40');
        b.addEventListener('click',fn);return b;
    }
    const startBtn=mkTop(T('Start','התחל'),()=>togglePause(),'start',true);
    const restartBtn=mkTop(T('Restart','מחדש'),()=>{if(window._gameCleanup){window._gameCleanup();window._gameCleanup=null;}container.innerHTML='';window.initFallingShapes(container,opts);},'restart',false);
    bar.append(startBtn,restartBtn);

    const hint=document.createElement('div');
    hint.textContent=T('On the board: drag to move · swipe down to drop · tap to spin. Keyboard: arrows + space.',
        'על הלוח: גררו להזזה · החליקו מטה להפלה · נגיעה לסיבוב. מקלדת: חצים + רווח.');
    hint.style.cssText='color:var(--fs-ink,#2c2418);opacity:.85;font-size:17px;text-align:center;max-width:420px;line-height:1.5';

    container.append(scoreEl,bar,stage,pad,hint);

    // ── Game state ─────────────────────────────────────────────────────────────
    const board=Array.from({length:ROWS},()=>Array(COLS).fill(null));
    let bag=[];
    function newPiece(){
        if(!bag.length){bag=PIECES.map((_,i)=>i);for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}}
        const p=PIECES[bag.pop()];
        return{shape:p.shape.map(r=>[...r]),color:p.color,x:Math.floor((COLS-p.shape[0].length)/2),y:0};
    }
    let cur=newPiece(),nextA=newPiece(),nextB=newPiece();
    let score=0,rowsCleared=0,round=1,gameOver=false,raf=null,paused=true,started=false;

    function togglePause(){
        if(gameOver)return;
        paused=!paused;
        if(!paused&&!started){started=true;scoreEl.scrollIntoView({block:'start',behavior:_calm?'auto':'smooth'});}
        startBtn.textContent=paused?T(started?'Resume':'Start',started?'המשך':'התחל'):T('Pause','השהה');
        startBtn.style.background=paused?'#214c40':'#a34228';
        startBtn.style.borderColor=paused?'#214c40':'#a34228';
        lastT=performance.now();
    }

    function rowScreen(r){const rc=canvas.getBoundingClientRect();const s=rc.width/canvas.width;return{top:rc.top+r*SZ*s,left:rc.left,width:rc.width,height:SZ*s};}
    function boardCenter(){const rc=canvas.getBoundingClientRect();return{x:rc.left+rc.width/2,y:rc.top+rc.height/2};}

    function valid(sh,px,py){for(let r=0;r<sh.length;r++)for(let c=0;c<sh[r].length;c++){if(!sh[r][c])continue;const nx=px+c,ny=py+r;if(nx<0||nx>=COLS||ny>=ROWS)return false;if(ny>=0&&board[ny][nx])return false;}return true;}

    function cellCount(sh){let n=0;sh.forEach(r=>r.forEach(v=>{if(v)n++;}));return n;}

    function lock(){
        // points for simply placing a shape: 5 per cell
        score+=cellCount(cur.shape)*5;
        for(let r=0;r<cur.shape.length;r++)for(let c=0;c<cur.shape[r].length;c++){if(!cur.shape[r][c])continue;const y=cur.y+r;if(y<0){gameOver=true;return;}board[y][cur.x+c]=cur.color;}
        const full=[];for(let r=0;r<ROWS;r++){if(board[r].every(c=>c))full.push(r);}
        if(full.length){
            full.forEach(r=>_fx().lineSweep(rowScreen(r),['#ffffff','#d9a441','#c96f4a','#4e7d6b']));
            const prevRound=round;
            for(let i=full.length-1;i>=0;i--){board.splice(full[i],1);board.unshift(Array(COLS).fill(null));}
            const n=full.length;
            const gained=[0,100,300,700,1400,2200][Math.min(n,5)]*round;   // own scoring values
            rowsCleared+=n;score+=gained;round=1+Math.floor(rowsCleared/8);
            document.getElementById('fs-points').textContent=score;
            document.getElementById('fs-rows').textContent=rowsCleared;
            document.getElementById('fs-round').textContent=round;
            const bc=boardCenter();
            _fx().text(bc.x,bc.y-20,'+'+gained,'#214c40');
            _fx().flash('#d9a441',200);
            if(!_calm)_fx().shake(canvas,6);
            window.sfxCorrect&&sfxCorrect();
            if(n>=3){_fx().fireworks(n);window.sfxWin&&sfxWin();}
            if(round>prevRound){_fx().fireworks(6);_fx().text(bc.x,bc.y+40,T('Round ','סיבוב ')+round+'!','#a34228');window.sfxWin&&sfxWin();}
        }else{
            document.getElementById('fs-points').textContent=score;
        }
        cur=nextA;nextA=nextB;nextB=newPiece();
        if(!valid(cur.shape,cur.x,cur.y))gameOver=true;
    }

    // ── Painting ───────────────────────────────────────────────────────────────
    const W=canvas.width,H=canvas.height;
    const _bg=ctx.createLinearGradient(0,0,0,H);
    _bg.addColorStop(0,'#f7f0e1');_bg.addColorStop(1,'#efe5d0');   // light craft mat
    let _nextShown=null;
    function veil(alpha,title,sub){
        ctx.fillStyle='rgba(60,48,28,'+alpha+')';ctx.fillRect(0,0,W,H);
        const ph=sub?118:82,pw=W-30,px=15,py=H/2-ph/2;
        ctx.save();ctx.shadowColor='rgba(40,30,15,0.4)';ctx.shadowBlur=14;ctx.shadowOffsetY=4;
        _rr(ctx,px,py,pw,ph,14);ctx.fillStyle='#fffaf2';ctx.fill();ctx.restore();
        _rr(ctx,px,py,pw,ph,14);ctx.lineWidth=3;ctx.strokeStyle='#214c40';ctx.stroke();
        ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillStyle='#214c40';ctx.font='bold 26px Georgia,serif';
        ctx.fillText(title,W/2,sub?py+42:H/2+1,pw-18);
        if(sub){ctx.fillStyle='#7a6a52';ctx.font='bold 20px Georgia,serif';ctx.fillText(sub,W/2,py+84,pw-18);}
        ctx.textBaseline='alphabetic';
    }
    function drawNext(){
        _nextShown=nextA.color+nextB.color;
        nctx.clearRect(0,0,nextCv.width,nextCv.height);
        [nextA,nextB].forEach((p,i)=>{
            const sh=p.shape;
            const cell=SZ*0.82;
            const ox=(nextCv.width-sh[0].length*cell)/2, oy=i===0?8:8+3.6*SZ;
            nctx.save();nctx.translate(ox,oy);nctx.scale(cell/SZ,cell/SZ);
            sh.forEach((row,r)=>row.forEach((v,c)=>{if(v)paintNext(c*SZ,r*SZ,p.color,false);}));
            nctx.restore();
        });
    }
    function draw(){
        ctx.fillStyle=_bg;ctx.fillRect(0,0,W,H);
        // soft checkerboard mat + faint grid
        ctx.fillStyle='rgba(120,95,55,0.05)';
        for(let r=0;r<ROWS;r++)for(let c=(r%2);c<COLS;c+=2)ctx.fillRect(c*SZ,r*SZ,SZ,SZ);
        ctx.strokeStyle='rgba(120,95,55,0.12)';ctx.lineWidth=1;ctx.beginPath();
        for(let r=1;r<ROWS;r++){ctx.moveTo(0,r*SZ+.5);ctx.lineTo(W,r*SZ+.5);}
        for(let c=1;c<COLS;c++){ctx.moveTo(c*SZ+.5,0);ctx.lineTo(c*SZ+.5,H);}
        ctx.stroke();
        board.forEach((row,r)=>row.forEach((col,c)=>{if(!col)return;paint(c*SZ,r*SZ,col,false);}));
        // landing patch: flat soft tint where the shape would rest (not a dashed outline)
        let gy=cur.y;while(valid(cur.shape,cur.x,gy+1))gy++;
        if(gy>cur.y){
            ctx.save();ctx.fillStyle='rgba(90,70,40,0.14)';
            cur.shape.forEach((row,r)=>row.forEach((v,c)=>{if(!v)return;_rr(ctx,(cur.x+c)*SZ+4,(gy+r)*SZ+4,SZ-8,SZ-8,5);ctx.fill();}));
            ctx.restore();
        }
        cur.shape.forEach((row,r)=>row.forEach((v,c)=>{if(!v)return;paint((cur.x+c)*SZ,(cur.y+r)*SZ,cur.color,true);}));
        if(_nextShown!==nextA.color+nextB.color)drawNext();
        if(gameOver){veil(0.82,T('All done!','המשחק נגמר'),T('Points','נקודות')+': '+score);}
    }

    function move(dx){if(gameOver||paused)return;if(valid(cur.shape,cur.x+dx,cur.y))cur.x+=dx;}
    function doRotate(){if(gameOver||paused)return;const r=rotate(cur.shape);
        if(valid(r,cur.x,cur.y))cur.shape=r;
        else if(valid(r,cur.x-1,cur.y)){cur.shape=r;cur.x--;}
        else if(valid(r,cur.x+1,cur.y)){cur.shape=r;cur.x++;}
        window.sfxFlip&&sfxFlip();}
    function softDrop(){if(gameOver||paused)return;if(valid(cur.shape,cur.x,cur.y+1))cur.y++;else lock();}
    function hardDrop(){if(gameOver||paused)return;let d=0;while(valid(cur.shape,cur.x,cur.y+1)){cur.y++;d++;}
        if(d>0){_fx().buzz(18);if(!_calm)_fx().shake(canvas,4);}lock();}

    let lastT=0,dropInterval=Math.max(140,950-(round-1)*70);   // gentle pace for seniors
    function loop(t){
        if(gameOver){draw();return;}
        dropInterval=Math.max(140,950-(round-1)*70);
        if(!paused&&t-lastT>dropInterval){softDrop();lastT=t;}
        draw();
        if(paused)veil(0.6,started?T('Paused','מושהה'):T('Press Start','לחצו התחל'));
        raf=requestAnimationFrame(loop);
    }
    raf=requestAnimationFrame(loop);

    // ── Keyboard ───────────────────────────────────────────────────────────────
    function onKey(e){
        if(opts.activeCheck&&!opts.activeCheck())return;
        if(e.key==='Enter'||e.key==='p'||e.key==='P'){togglePause();e.preventDefault();return;}
        if(e.key==='ArrowLeft')move(-1);else if(e.key==='ArrowRight')move(1);
        else if(e.key==='ArrowUp')doRotate();else if(e.key==='ArrowDown')softDrop();
        else if(e.key===' ')hardDrop();else return;e.preventDefault();
    }
    document.addEventListener('keydown',onKey);
    function onVis(){if(document.hidden&&!paused&&!gameOver)togglePause();}
    document.addEventListener('visibilitychange',onVis);

    // ── Board gestures: drag to move, swipe down to drop, tap to spin ──────────
    let sx=0,sy=0,lastY=0,moved=false,dragging=false;
    const cellPx=()=>{const rc=canvas.getBoundingClientRect();return rc.width/COLS;};
    canvas.addEventListener('pointerdown',e=>{e.preventDefault();dragging=true;sx=e.clientX;sy=e.clientY;lastY=e.clientY;moved=false;});
    canvas.addEventListener('pointermove',e=>{
        if(!dragging)return;e.preventDefault();
        const cp=cellPx();
        const dxCells=Math.trunc((e.clientX-sx)/cp);
        if(dxCells!==0){move(dxCells>0?1:-1);sx+=(dxCells>0?1:-1)*cp;moved=true;}
        if(e.clientY-lastY>cp){softDrop();lastY=e.clientY;moved=true;}
    });
    canvas.addEventListener('pointerup',e=>{
        dragging=false;
        const dx=e.clientX-sx,dy=e.clientY-sy;
        if(!moved&&Math.abs(dx)<10&&Math.abs(dy)<10){doRotate();return;}
        if(!moved&&dy<-40&&Math.abs(dy)>Math.abs(dx))hardDrop();
    });
    canvas.addEventListener('pointercancel',()=>{dragging=false;});

    window._gameCleanup=()=>{if(raf)cancelAnimationFrame(raf);document.removeEventListener('keydown',onKey);document.removeEventListener('visibilitychange',onVis);};
};
})();
