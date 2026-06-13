// ═══════════════════════════════════════════════════════════════════════════════
// GAME 10: NUMBER SEQUENCE
// ═══════════════════════════════════════════════════════════════════════════════
const _SEQ_GENERATORS = [
    (lvl) => { const step=2+lvl,s=Math.floor(Math.random()*10)+1; return {seq:[s,s+step,s+2*step,s+3*step],next:s+4*step,type:'+'} },
    (lvl) => { const step=1+Math.floor(lvl/2),s=Math.floor(Math.random()*8)+10+lvl*2; return {seq:[s,s-step,s-2*step,s-3*step],next:s-4*step,type:'-'} },
    ()    => { const m=2,s=Math.floor(Math.random()*4)+1; return {seq:[s,s*m,s*m*m,s*m*m*m],next:s*m*m*m*m,type:'×2'} },
    (lvl) => { const a=1+Math.floor(Math.random()*3),b=2+Math.floor(Math.random()*3); return {seq:[a,b,a+b,a+b+b],next:b+a+b+b,type:'fib'} },
    (lvl) => { const step=5+lvl*2,s=Math.floor(Math.random()*5)+1; return {seq:[s,s+step,s+2*step,s+3*step],next:s+4*step,type:'+'} },
];
function initNumSeq(container){
    const gs=gameState.numseq;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    gs._sq=_d==='easy'?6:_d==='hard'?14:10; gs._si=0; gs._ss=0;
    _numseqNext(container);
}
function _numseqNext(container){
    if(!gameState.active||gameState.currentId!=='numseq')return;
    const gs=gameState.numseq;
    if(gs._si>=gs._sq){gs._sessionScore={correct:gs._ss,total:gs._sq};levelComplete();return;}
    const gen=_SEQ_GENERATORS[Math.floor(Math.random()*_SEQ_GENERATORS.length)];
    const {seq,next}=gen(gs.level);
    let opts=new Set([next]);
    while(opts.size<4){const d=next+(Math.floor(Math.random()*10)-5);if(d!==next&&d>0)opts.add(d);}
    const optsArr=shuffle(Array.from(opts));
    const isHe=currentLang==='he';
    container.innerHTML=`<div class="w-full max-w-sm mx-auto text-center">
        <div class="flex justify-between text-sm font-bold text-gray-400 mb-5">
            <span>${isHe?'שאלה':'Q'} ${gs._si+1}/${gs._sq}</span>
            <span class="text-green-600">✓ ${gs._ss}</span>
        </div>
        <div class="flex items-center gap-2 md:gap-4 mb-10 flex-wrap justify-center">
            ${seq.map(n=>`<div class="w-14 h-14 md:w-18 md:h-18 bg-slate-100 border-2 border-slate-300 rounded-xl flex items-center justify-center text-2xl md:text-3xl font-bold text-slate-800">${n}</div>`).join('<span class="text-gray-400 font-bold">→</span>')}
            <span class="text-gray-400 font-bold">→</span>
            <div class="w-14 h-14 md:w-18 md:h-18 bg-amber-50 border-2 border-dashed border-amber-400 rounded-xl flex items-center justify-center text-2xl font-bold text-amber-400">?</div>
        </div>
        <div class="grid grid-cols-2 gap-4">
            ${optsArr.map(opt=>`<button onclick="answerNumSeq(${opt},${next})" class="bg-blue-50 border-2 border-blue-200 hover:border-blue-500 text-3xl font-bold py-5 rounded-2xl transition shadow-sm active:scale-95">${opt}</button>`).join('')}
        </div></div>`;
}
function answerNumSeq(sel,cor){
    if(!gameState.active||gameState.currentId!=='numseq')return;
    const gs=gameState.numseq;
    const btn=event.target;
    if(sel===cor){
        sfxCorrect(); gs._ss++;
        btn.classList.replace('bg-blue-50','bg-green-100'); btn.classList.replace('border-blue-200','border-green-400');
        setTimeout(()=>{gs._si++;_numseqNext(document.getElementById('gameContent'));},500);
    } else {
        sfxWrong();
        btn.classList.replace('bg-blue-50','bg-red-100'); btn.classList.replace('border-blue-200','border-red-300');
        setTimeout(()=>{btn.classList.replace('bg-red-100','bg-blue-50');btn.classList.replace('border-red-300','border-blue-200');},600);
    }
}
