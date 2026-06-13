// ═══════════════════════════════════════════════════════════════════════════════
// GAME 5: SIMON — neon glow + bilingual + difficulty speed
// ═══════════════════════════════════════════════════════════════════════════════
function initSimon(container) {
    if(!gameState.simon.sequence)gameState.simon.sequence=[];
    gameState.simon.userIndex=0; gameState.simon.waitingForUser=false;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    gameState.simon._diff=_d;
    const isHe=currentLang==='he';
    const colors=[
        {id:0,color:'#ef4444',glow:'rgba(239,68,68,0.7)'},
        {id:1,color:'#3b82f6',glow:'rgba(59,130,246,0.7)'},
        {id:2,color:'#22c55e',glow:'rgba(34,197,94,0.7)'},
        {id:3,color:'#eab308',glow:'rgba(234,179,8,0.7)'}
    ];
    let html=`<div style="display:flex;flex-direction:column;align-items:center;gap:20px;width:100%">
        <div id="simon-score" style="font-size:20px;font-weight:800;color:#1e293b;letter-spacing:0.05em">${isHe?'רמה 1...':'Level 1...'}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:280px;width:100%">`;
    colors.forEach(col=>{
        html+=`<div id="simon-${col.id}" onclick="clickSimon(${col.id})"
            style="width:100%;aspect-ratio:1;border-radius:20px;background:${col.color};filter:brightness(0.55);cursor:pointer;transition:filter 0.15s,transform 0.1s,box-shadow 0.15s;box-shadow:0 4px 12px rgba(0,0,0,0.3)"
            onmousedown="this.style.transform='scale(0.94)'" onmouseup="this.style.transform='scale(1)'"></div>`;
    });
    html+=`</div></div>`;
    container.innerHTML=html;
    container._simonColors=colors;
    setTimeout(()=>playSimonSequence(),800);
}
async function playSimonSequence() {
    if(!gameState.active)return;
    const isHe=currentLang==='he';
    const state=gameState.simon; state.waitingForUser=false; state.userIndex=0;
    const _d=state._diff||'normal';
    const gap=_d==='easy'?700:_d==='hard'?300:500;
    state.sequence.push(Math.floor(Math.random()*4));
    const scEl=document.getElementById('simon-score');
    if(scEl){scEl.innerText=isHe?`רמה ${state.sequence.length}...`:`Level ${state.sequence.length}...`; scEl.style.color='';}
    for(let i=0;i<state.sequence.length;i++){if(!gameState.active)return;await new Promise(r=>setTimeout(r,gap));await flashSimon(state.sequence[i],_d);}
    if(!gameState.active)return; state.waitingForUser=true;
    if(scEl) scEl.innerText=isHe?`רמה ${state.sequence.length} — תורך! 👆`:`Level ${state.sequence.length} — Your turn! 👆`;
}
async function flashSimon(id,_d='normal') {
    if(!gameState.active)return;
    const el=document.getElementById(`simon-${id}`);
    const dur=_d==='easy'?600:_d==='hard'?250:400;
    const glows=['rgba(239,68,68,0.8)','rgba(59,130,246,0.8)','rgba(34,197,94,0.8)','rgba(234,179,8,0.8)'];
    el.style.filter='brightness(1.4)'; el.style.boxShadow=`0 0 28px 8px ${glows[id]},0 4px 12px rgba(0,0,0,0.3)`; _tone(220+id*110,0.25);
    await new Promise(r=>setTimeout(r,dur));
    el.style.filter='brightness(0.55)'; el.style.boxShadow='0 4px 12px rgba(0,0,0,0.3)';
}
function clickSimon(id) {
    const isHe=currentLang==='he';
    const state=gameState.simon; if(!state.waitingForUser)return;
    flashSimon(id, state._diff||'normal');
    if(id===state.sequence[state.userIndex]){
        state.userIndex++;
        if(state.userIndex===state.sequence.length){
            state.waitingForUser=false;
            const lv=state.sequence.length;
            const scEl=document.getElementById('simon-score');
            if(scEl){scEl.innerText=`✓ ${isHe?`רמה ${lv}!`:`Level ${lv}!`}`; scEl.style.color='#16a34a';}
            sfxCorrect();
            setTimeout(()=>{if(scEl)scEl.style.color='';playSimonSequence();},700);
        }
    } else {
        sfxWrong();
        state.waitingForUser=false;
        const score=state.sequence.length;
        state.sequence=[];
        const gc=document.getElementById('gameContent');
        setTimeout(()=>{
            const hs=checkHS('simon',score);
            Retention.recordWin();
            gc.innerHTML=`<div class="text-center py-8 px-4 max-w-sm mx-auto">
                <div style="font-size:4rem">🎉</div>
                <div class="text-3xl font-bold mt-3 text-slate-800">${isHe?'כל הכבוד!':'Great job!'}</div>
                <div class="text-xl mt-3 text-gray-600">${isHe?`הגעת לרמה`:'You reached level'} <strong class="text-[#1a365d] text-2xl">${score}</strong></div>
                ${hs?`<div class="mt-2 text-amber-600 font-bold text-lg">${isHe?'⭐ שיא אישי חדש!':'⭐ New personal best!'}</div>`:''}
                <div id="simon-share" class="mt-3"></div>
                <div class="flex gap-3 justify-center mt-6 flex-wrap">
                    <button onclick="loadGame('simon')" class="btn-premium py-3 px-8 rounded-xl font-bold">${isHe?'שחק שוב':'Play Again'}</button>
                    <button onclick="showHome()" class="bg-gray-200 hover:bg-gray-300 py-3 px-8 rounded-xl font-bold text-gray-700 transition">${isHe?'תפריט':'Menu'}</button>
                </div></div>`;
            if(typeof Share!=='undefined'){const sd=document.getElementById('simon-share');if(sd)Share.renderBtn(sd,'simon',score);}
        },800);
    }
}
