// ═══════════════════════════════════════════════════════════════════════════════
// GAME 5: SIMON
// ═══════════════════════════════════════════════════════════════════════════════
function initSimon(container) {
    if(!gameState.simon.sequence)gameState.simon.sequence=[];
    gameState.simon.userIndex=0; gameState.simon.waitingForUser=false;
    const colors=[{id:0,c:'bg-red-500'},{id:1,c:'bg-blue-500'},{id:2,c:'bg-green-500'},{id:3,c:'bg-yellow-400'}];
    let html=`<div class="flex flex-col items-center gap-5 w-full"><div id="simon-score" class="text-2xl font-bold text-slate-700">רמה 1...</div><div class="grid grid-cols-2 gap-4 max-w-xs w-full">`;
    colors.forEach(col=>{html+=`<div id="simon-${col.id}" class="simon-btn w-28 h-28 md:w-36 md:h-36 rounded-2xl ${col.c}" onclick="clickSimon(${col.id})"></div>`;});
    html+=`</div></div>`;
    container.innerHTML=html;
    setTimeout(()=>playSimonSequence(),800);
}
async function playSimonSequence() {
    if(!gameState.active)return;
    const state=gameState.simon; state.waitingForUser=false; state.userIndex=0;
    state.sequence.push(Math.floor(Math.random()*4));
    const scEl=document.getElementById('simon-score');
    if(scEl){scEl.innerText=`רמה ${state.sequence.length}...`;scEl.style.color='';}
    for(let i=0;i<state.sequence.length;i++){if(!gameState.active)return;await new Promise(r=>setTimeout(r,500));await flashSimon(state.sequence[i]);}
    if(!gameState.active)return; state.waitingForUser=true;
    if(scEl) scEl.innerText=`רמה ${state.sequence.length} — תורך! 👆`;
}
async function flashSimon(id) {
    if(!gameState.active)return;
    const el=document.getElementById(`simon-${id}`);
    el.classList.add('active'); _tone(220+id*110,0.25);
    await new Promise(r=>setTimeout(r,400)); el.classList.remove('active');
}
function clickSimon(id) {
    const state=gameState.simon; if(!state.waitingForUser)return;
    flashSimon(id);
    if(id===state.sequence[state.userIndex]){
        state.userIndex++;
        if(state.userIndex===state.sequence.length){
            state.waitingForUser=false;
            const lv=state.sequence.length;
            const scEl=document.getElementById('simon-score');
            if(scEl){scEl.innerText=`✓ רמה ${lv}!`;scEl.style.color='#16a34a';}
            sfxCorrect();
            setTimeout(()=>{if(scEl)scEl.style.color='';playSimonSequence();},700);
        }
    } else {
        sfxWrong();
        state.waitingForUser=false;
        const score=state.sequence.length;
        state.sequence=[];
        const gc=document.getElementById('gameContent');
        if(gc.firstElementChild) gc.firstElementChild.classList.add('bg-red-50');
        setTimeout(()=>{
            const hs=checkHS('simon',score);
            Retention.recordWin();
            gc.innerHTML=`<div class="text-center py-8 px-4 max-w-sm mx-auto"><div style="font-size:4rem">🎉</div><div class="text-3xl font-bold mt-3 text-slate-800">כל הכבוד!</div><div class="text-xl mt-3 text-gray-600">הגעת לרמה <strong class="text-[#1a365d] text-2xl">${score}</strong></div>${hs?`<div class="mt-2 text-amber-600 font-bold text-lg">⭐ שיא אישי חדש!</div>`:''}<div class="flex gap-3 justify-center mt-6 flex-wrap"><button onclick="loadGame('simon')" class="btn-premium py-3 px-8 rounded-xl font-bold">שחק שוב</button><button onclick="showHome()" class="bg-gray-200 hover:bg-gray-300 py-3 px-8 rounded-xl font-bold text-gray-700 transition">תפריט</button></div></div>`;
        },800);
    }
}
