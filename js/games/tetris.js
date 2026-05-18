// ═══════════════════════════════════════════════════════════════════════════════
// GAME 18: TETRIS
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

window.initTetris=function(container){
    if(window._gameCleanup){window._gameCleanup();window._gameCleanup=null;}
    const isHe=window.currentLang==='he';
    container.style.cssText='display:flex;flex-direction:column;align-items:center;gap:12px;padding:8px 0';
    const scoreEl=document.createElement('div');
    scoreEl.style.cssText='color:#00f0f0;font-size:14px;font-weight:700;letter-spacing:0.1em;text-align:center';
    scoreEl.innerHTML=`<span>${isHe?'ניקוד':'SCORE'}: <b id="tet-score">0</b></span> &nbsp; <span>${isHe?'שורות':'LINES'}: <b id="tet-lines">0</b></span> &nbsp; <span>${isHe?'רמה':'LEVEL'}: <b id="tet-level">1</b></span>`;
    const canvas=document.createElement('canvas');
    canvas.width=COLS*SZ; canvas.height=ROWS*SZ;
    canvas.style.cssText='border:2px solid #00f0f0;border-radius:6px;box-shadow:0 0 20px rgba(0,240,240,0.4);display:block;touch-action:none';
    const ctx=canvas.getContext('2d');
    // touch controls row
    const btnRow=document.createElement('div');
    btnRow.style.cssText='display:flex;gap:8px;margin-top:4px';
    const mkBtn=(lbl,fn)=>{const b=document.createElement('button');b.textContent=lbl;b.style.cssText='min-width:52px;height:44px;background:#0d1f3c;border:1px solid #00f0f0;border-radius:8px;color:#00f0f0;font-size:20px;cursor:pointer;touch-action:manipulation';b.addEventListener('pointerdown',e=>{e.preventDefault();fn();});return b;};
    btnRow.append(mkBtn('←',()=>move(-1)),mkBtn('↻',()=>doRotate()),mkBtn('→',()=>move(1)),mkBtn('↓',()=>drop()));
    container.append(scoreEl,canvas,btnRow);

    const board=Array.from({length:ROWS},()=>Array(COLS).fill(null));
    let cur=newPiece(),next=newPiece(),score=0,lines=0,level=1,gameOver=false,raf=null;

    function valid(sh,px,py){for(let r=0;r<sh.length;r++)for(let c=0;c<sh[r].length;c++){if(!sh[r][c])continue;const nx=px+c,ny=py+r;if(nx<0||nx>=COLS||ny>=ROWS)return false;if(ny>=0&&board[ny][nx])return false;}return true;}
    function lock(){for(let r=0;r<cur.shape.length;r++)for(let c=0;c<cur.shape[r].length;c++){if(!cur.shape[r][c])continue;const y=cur.y+r;if(y<0){gameOver=true;return;} board[y][cur.x+c]=cur.color;}
        let cleared=0;for(let r=ROWS-1;r>=0;r--){if(board[r].every(c=>c)){board.splice(r,1);board.unshift(Array(COLS).fill(null));cleared++;r++;}}
        lines+=cleared;score+=cleared?[0,100,300,500,800][cleared]*level:0;level=1+Math.floor(lines/10);
        document.getElementById('tet-score').textContent=score;
        document.getElementById('tet-lines').textContent=lines;
        document.getElementById('tet-level').textContent=level;
        if(cleared>=1)window.sfxCorrect&&sfxCorrect();
        cur=next;next=newPiece();if(!valid(cur.shape,cur.x,cur.y))gameOver=true;}
    function draw(){
        ctx.fillStyle='#050d1a';ctx.fillRect(0,0,canvas.width,canvas.height);
        // grid lines
        ctx.strokeStyle='#0a1f35';ctx.lineWidth=0.5;
        for(let r=0;r<=ROWS;r++){ctx.beginPath();ctx.moveTo(0,r*SZ);ctx.lineTo(COLS*SZ,r*SZ);ctx.stroke();}
        for(let c=0;c<=COLS;c++){ctx.beginPath();ctx.moveTo(c*SZ,0);ctx.lineTo(c*SZ,ROWS*SZ);ctx.stroke();}
        // board
        board.forEach((row,r)=>row.forEach((col,c)=>{if(!col)return;ctx.fillStyle=col;ctx.fillRect(c*SZ+1,r*SZ+1,SZ-2,SZ-2);ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(c*SZ+1,r*SZ+1,SZ-2,4);ctx.fillRect(c*SZ+1,r*SZ+1,4,SZ-2);}));
        // ghost
        let gy=cur.y;while(valid(cur.shape,cur.x,gy+1))gy++;
        if(gy>cur.y){cur.shape.forEach((row,r)=>row.forEach((v,c)=>{if(!v)return;ctx.fillStyle='rgba(255,255,255,0.08)';ctx.fillRect((cur.x+c)*SZ+1,(gy+r)*SZ+1,SZ-2,SZ-2);}));}
        // current piece
        cur.shape.forEach((row,r)=>row.forEach((v,c)=>{if(!v)return;ctx.fillStyle=cur.color;ctx.fillRect((cur.x+c)*SZ+1,(cur.y+r)*SZ+1,SZ-2,SZ-2);ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fillRect((cur.x+c)*SZ+1,(cur.y+r)*SZ+1,SZ-2,4);ctx.fillRect((cur.x+c)*SZ+1,(cur.y+r)*SZ+1,4,SZ-2);}));
        if(gameOver){ctx.fillStyle='rgba(5,13,26,0.8)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#00f0f0';ctx.font='bold 22px monospace';ctx.textAlign='center';ctx.fillText(isHe?'משחק נגמר':'GAME OVER',canvas.width/2,canvas.height/2-20);ctx.font='15px monospace';ctx.fillStyle='#ffffff';ctx.fillText(`${isHe?'ניקוד':'Score'}: ${score}`,canvas.width/2,canvas.height/2+10);}
    }
    function move(dx){if(valid(cur.shape,cur.x+dx,cur.y))cur.x+=dx;}
    function doRotate(){const r=rotate(cur.shape);if(valid(r,cur.x,cur.y)){cur.shape=r;}else if(valid(r,cur.x-1,cur.y)){cur.shape=r;cur.x--;}else if(valid(r,cur.x+1,cur.y)){cur.shape=r;cur.x++;}}
    function drop(){if(valid(cur.shape,cur.x,cur.y+1))cur.y++;else lock();}
    function hardDrop(){while(valid(cur.shape,cur.x,cur.y+1))cur.y++;lock();}

    let lastT=0,dropInterval=Math.max(100,800-level*60);
    function loop(t){if(gameOver){
        if(score>0&&window.gameState&&window.gameState.tetris){window.gameState.tetris._sessionScore=score;}
        draw();
        // auto-restart or show home after delay
        setTimeout(()=>{if(window.gameState&&window.gameState.active&&window.gameState.currentId==='tetris')window.levelComplete&&levelComplete();},1800);
        return;}
        dropInterval=Math.max(100,800-((window.gameState&&window.gameState.tetris&&window.gameState.tetris.level)||1)*60);
        if(t-lastT>dropInterval){drop();lastT=t;}
        draw();raf=requestAnimationFrame(loop);}
    raf=requestAnimationFrame(loop);

    // keyboard
    function onKey(e){if(!window.gameState||window.gameState.currentId!=='tetris')return;
        if(e.key==='ArrowLeft')move(-1);else if(e.key==='ArrowRight')move(1);else if(e.key==='ArrowUp')doRotate();else if(e.key==='ArrowDown')drop();else if(e.key===' ')hardDrop();else return;e.preventDefault();}
    document.addEventListener('keydown',onKey);
    // swipe
    let tx0=0,ty0=0;
    canvas.addEventListener('pointerdown',e=>{tx0=e.clientX;ty0=e.clientY;});
    canvas.addEventListener('pointerup',e=>{const dx=e.clientX-tx0,dy=e.clientY-ty0;if(Math.abs(dx)<5&&Math.abs(dy)<5){doRotate();return;}if(Math.abs(dx)>Math.abs(dy)){move(dx>0?1:-1);}else{if(dy>0)drop();}});

    window._gameCleanup=()=>{if(raf)cancelAnimationFrame(raf);document.removeEventListener('keydown',onKey);};
};
})();
