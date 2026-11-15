// ═══════════════════════════════════════════════════════════════════════════════
// GAME 17: WORD RECALL
// Presentation: study = cards pinned on a cork board; test = cards laid on a
// cloth-covered table, picked cards lift; Check = wooden stamp
// ═══════════════════════════════════════════════════════════════════════════════
// Scene styles live on the existing function object (no new global name).
initRecall._css=`<style>
.rcl-scene{margin-inline:auto;color:#3b2a1a}
.rcl-scene .rcl-steps{display:flex;justify-content:center;align-items:center;gap:8px;margin-bottom:10px;font-size:1.3rem;font-weight:700;color:#6b5a48}
.rcl-scene .rcl-step{padding:4px 14px;border:2px solid #cdb891;border-radius:999px;background:#fbf3e0}
.rcl-scene .rcl-step.rcl-cur{border-color:#1a365d;background:#1a365d;color:#fff;font-weight:800}
.rcl-scene .rcl-dash{width:22px;height:3px;border-radius:2px;background:#cdb891}
.rcl-scene .rcl-title{margin-bottom:12px;font-size:1.45rem;font-weight:800;line-height:1.3;color:#1a365d}
.rcl-scene .rcl-board{margin-bottom:18px;padding:20px 12px 14px;border:10px solid #7b4f27;border-radius:14px;background:radial-gradient(circle at 20% 30%,rgba(90,55,20,.22) 0 1.5px,transparent 2px) 0 0/22px 22px,radial-gradient(circle at 70% 65%,rgba(255,238,205,.3) 0 1.5px,transparent 2px) 0 0/31px 31px,#c8975f;box-shadow:inset 0 0 0 2px #5a3819,inset 0 6px 14px rgba(60,30,5,.35),0 8px 18px rgba(70,40,10,.2)}
.rcl-scene .rcl-table{margin-bottom:10px;padding:10px;border-radius:18px;background:repeating-linear-gradient(91deg,rgba(0,0,0,.07) 0 2px,transparent 2px 17px),linear-gradient(180deg,#96663a,#75491f);box-shadow:inset 0 2px 0 rgba(255,255,255,.2),0 8px 18px rgba(70,40,10,.25)}
.rcl-scene .rcl-cloth{padding:16px 10px;border:3px dotted #fff;border-radius:12px;background:repeating-linear-gradient(0deg,rgba(183,121,31,.06) 0 14px,transparent 14px 28px),repeating-linear-gradient(90deg,rgba(183,121,31,.06) 0 14px,transparent 14px 28px),#f8eedb;box-shadow:0 0 0 4px #f8eedb,0 3px 8px 4px rgba(40,20,0,.3)}
.rcl-scene .rcl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:14px 10px}
.rcl-scene .rcl-card{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-width:0;min-height:112px;padding:12px 6px 10px;border:4px solid #eadbb9;border-radius:12px;background:#fffdf7;box-shadow:0 3px 5px rgba(50,25,5,.3)}
.rcl-scene .rcl-card .rc-ic{display:flex;align-items:center;justify-content:center;min-height:2.6rem;font-size:2.4rem;line-height:1;pointer-events:none}
.rcl-scene .rcl-card .rc-ic>svg{width:2.6rem;height:2.6rem}
.rcl-scene .rcl-word{font-size:1.3rem;font-weight:800;line-height:1.2;color:#3b2a1a;text-align:center;overflow-wrap:anywhere;pointer-events:none}
.rcl-scene .rcl-pin:nth-child(odd){transform:rotate(-1.2deg)}
.rcl-scene .rcl-pin:nth-child(even){transform:rotate(1deg)}
.rcl-scene .rcl-pin::before{content:'';position:absolute;top:-11px;left:50%;width:18px;height:18px;margin-left:-9px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#ffab9c,#c0392b 60%,#7d1f14);box-shadow:0 3px 3px rgba(0,0,0,.4)}
.rcl-scene .recall-item{cursor:pointer;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease,background-color .15s ease}
.rcl-scene .recall-item:hover{border-color:#d9b877}
.rcl-scene .recall-item:focus-visible{outline:4px solid #1a365d;outline-offset:3px}
.rcl-scene .recall-item.rcl-on{border-color:#b7791f;background:#fff3cf;transform:translateY(-6px) rotate(-1deg);box-shadow:0 12px 16px rgba(50,25,5,.38)}
.rcl-scene .recall-item.rcl-on::after{content:'✓';position:absolute;top:-14px;inset-inline-end:-10px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:50%;border:3px solid #fff;background:#b7791f;color:#fff;font-size:1.35rem;font-weight:800;line-height:1;box-shadow:0 2px 4px rgba(0,0,0,.3)}
.rcl-scene .rcl-count{margin:14px 0 0;font-size:1.3rem;font-weight:700;color:#4a3320}
.rcl-scene .rcl-count b{display:inline-block;min-width:1.9em;padding:0 8px;border-radius:999px;background:#b7791f;color:#fff;font-weight:800;font-variant-numeric:tabular-nums}
.rcl-scene .rcl-timer{display:inline-flex;align-items:center;gap:8px;padding:8px 22px;border:3px solid #b7791f;border-radius:999px;background:#fff1c9;color:#6b3d00;font-size:1.4rem;font-weight:800;font-variant-numeric:tabular-nums}
.rcl-scene .rcl-drain{width:min(220px,70%);height:8px;margin:8px auto 16px;border-radius:999px;background:#ead9b5;overflow:hidden}
.rcl-scene .rcl-drain i{display:block;height:100%;border-radius:999px;background:#b7791f;animation:rclDrain 4s linear forwards}
.rcl-scene .rcl-go{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:60px;padding:14px 30px;border:0;border-radius:14px;background:#1a365d;color:#fff;font:inherit;font-size:1.4rem;font-weight:800;cursor:pointer;box-shadow:0 5px 0 #0f2340,0 9px 14px rgba(15,35,64,.3);transition:transform .12s ease,box-shadow .12s ease}
.rcl-scene .rcl-stamp{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:60px;margin-top:34px;padding:14px 36px;border:0;border-bottom:6px solid #a3271c;border-radius:10px;background:repeating-linear-gradient(90deg,rgba(0,0,0,.07) 0 2px,transparent 2px 13px),linear-gradient(180deg,#a9743a,#75491f);color:#fff8e6;font:inherit;font-size:1.45rem;font-weight:800;cursor:pointer;box-shadow:inset 0 2px 0 rgba(255,255,255,.25),0 6px 0 #4e3019,0 12px 14px rgba(40,20,0,.3);transition:transform .12s ease,box-shadow .12s ease}
.rcl-scene .rcl-stamp::before{content:'';position:absolute;top:-22px;left:50%;width:48px;height:22px;margin-left:-24px;border-radius:16px 16px 3px 3px;background:linear-gradient(180deg,#8a5a2b,#5a3819);box-shadow:inset 0 3px 0 rgba(255,255,255,.2)}
.rcl-scene .rcl-go:active{transform:translateY(4px);box-shadow:0 1px 0 #0f2340}
.rcl-sc
ene .rcl-stamp:active{transform:translateY(5px);box-shadow:0 1px 0 #4e3019}
.rcl-scene .rcl-go:focus-visible,.rcl-scene .rcl-stamp:focus-visible{outline:4px solid #b7791f;outline-offset:4px}
.rcl-scene .rcl-stamp:focus-visible{outline-color:#1a365d}
#gameContent .rcl-note{max-width:420px;margin:20px auto 0;padding:16px 14px;border:3px dashed #b7791f;border-radius:12px;background:#fff8e1;color:#7a2e0e;font-size:1.45rem;font-weight:800;line-height:1.35;text-align:center;box-shadow:0 4px 8px rgba(70,40,10,.15)}
#gameContent .rcl-note .rcl-again{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:58px;margin-top:12px;padding:12px 28px;border:0;border-radius:14px;background:#1a365d;color:#fff;font:inherit;font-size:1.35rem;font-weight:800;cursor:pointer;box-shadow:0 5px 0 #0f2340}
@keyframes rclDrain{from{width:100%}to{width:0}}
@media (prefers-reduced-motion:reduce){.rcl-scene .recall-item,.rcl-scene .rcl-go,.rcl-scene .rcl-stamp{transition:none}.rcl-scene .recall-item.rcl-on{transform:none}.rcl-scene .rcl-go:active,.rcl-scene .rcl-stamp:active{transform:none}.rcl-scene .rcl-drain{display:none}.rcl-scene .rcl-timer{margin-bottom:16px}}
</style>`;
function initRecall(c) {
    if(!gameState.active) return;
    const gs = gameState.recall;
    const level = gs.level || 1;
    const _d=typeof Difficulty!=='undefined'?Difficulty.get():'normal';
    const _adj=_d==='easy'?-1:_d==='hard'?2:0;
    const showCount = Math.min(Math.max(2, 3 + level + _adj), _d==='hard'?10:8);
    const pool = shuffle([...i18nData[currentLang].recall_pool]);
    gs.targets = pool.slice(0, showCount);
    gs.distractors = pool.slice(showCount, showCount + showCount + 2);
    gs.selected = new Set();
    gs._diff = _d;
    _recallStudy(c);
}
function _recallStudy(c) {
    const gs = gameState.recall;
    const isHe = currentLang === 'he';
    const _d = gs._diff || 'normal';
    const items = gs.targets.map(it => {
        const [em, ...words] = it.split(' ');
        return `<div class="rcl-card rcl-pin"><div class="rc-ic">${Icon.sym(em)}</div><div class="rcl-word">${words.join(' ')}</div></div>`;
    }).join('');
    // Hard mode: auto-advance after 4 seconds instead of user clicking
    const autoMs = _d==='hard' ? 4000 : 0;
    c.innerHTML = `<div class="max-w-xl w-full text-center rcl-scene rcl-study">${initRecall._css}
        <div class="rcl-steps"><span class="rcl-step rcl-cur">1 · ${gt('Study', 'לימוד')}</span><span class="rcl-dash" aria-hidden="true"></span><span class="rcl-step">2 · ${gt('Recall', 'היזכרות')}</span></div>
        <div class="rcl-title">${Icon.ui('book-open')} ${gt('Study these items:', 'זכרו את הפריטים האלה:')}</div>
        <div class="rcl-board"><div class="rcl-grid">${items}</div></div>
        ${autoMs>0
          ? `<div><div id="recall-timer" class="rcl-timer" role="timer">${Icon.ui('timer')} ${isHe?`${autoMs/1000} שניות...`:`${autoMs/1000}s...`}</div></div>
             <div class="rcl-drain" aria-hidden="true"><i style="animation-duration:${autoMs}ms"></i></div>
             <button id="recall-go-btn" onclick="_recallTest()" class="rcl-go">${Icon.ui('circle-check')} ${gt('Got them! Continue', 'זכרתי! קדימה')}</button>`
          : `<button onclick="_recallTest()" class="rcl-go">${Icon.ui('circle-check')} ${gt('Got them! Continue', 'זכרתי! קדימה')}</button>`
        }
    </div>`;
    if(autoMs>0) {
        let secs=autoMs/1000;
        const timer=document.getElementById('recall-timer');
        if(gs._iv)clearInterval(gs._iv);
        const iv=gs._iv=setInterval(()=>{
            secs--;
            if(timer)timer.innerHTML=Icon.ui('timer')+' '+(isHe?`${secs} שניות...`:`${secs}s...`);
            if(secs<=0){clearInterval(iv);gs._iv=null;_recallTest();}
        },1000);
    }
}
function _recallTest() {
    if(!gameState.active || gameState.currentId !== 'recall') return;   // a countdown left running must not draw into another game
    const gs = gameState.recall;
    // Hard mode: pressing "Got them!" early must stop the countdown, or at 0 it redrew the test and wiped the picks
    if(gs._iv){clearInterval(gs._iv);gs._iv=null;}
    const isHe = currentLang === 'he';
    gs.selected = new Set();
    gs._all = shuffle([...gs.targets, ...gs.distractors]);
    const itemsHtml = gs._all.map((it, i) => {
        const [em, ...words] = it.split(' ');
        return `<div onclick="_toggleRecall(${i},this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.click();}" role="button" tabindex="0" aria-pressed="false" class="recall-item rcl-card border-2 border-gray-200"><div class="rc-ic" style="pointer-events:none">${Icon.sym(em)}</div><div class="rcl-word">${words.join(' ')}</div></div>`;
    }).join('');
    const c = document.getElementById('gameContent');
    c.innerHTML = `<div class="max-w-xl w-full text-center rcl-scene rcl-test">${initRecall._css}
        <div class="rcl-steps"><span class="rcl-step">1 · ${gt('Study', 'לימוד')}</span><span class="rcl-dash" aria-hidden="true"></span><span class="rcl-step rcl-cur">2 · ${gt('Recall', 'היזכרות')}</span></div>
        <div class="rcl-title">${Icon.ui('search')} ${gt('Select the items you saw:', 'בחרו את הפריטים שראיתם:')}</div>
        <div class="rcl-table"><div class="rcl-cloth"><div class="rcl-grid">${itemsHtml}</div></div></div>
        <div class="rcl-count" aria-live="polite">${gt('Selected', 'נבחרו')}: <b id="recall-count">0</b></div>
        <button onclick="_checkRecall()" class="rcl-stamp">${Icon.ui('circle-check')} ${gt('Check', 'בדיקה')}</button>
    </div>`;
}
function _toggleRecall(idx, el) {
    const gs = gameState.recall;
    if(gs.selected.has(idx)) { gs.selected.delete(idx); el.classList.remove('border-blue-500','bg-blue-100'); el.classList.add('border-gray-200'); }
    else { gs.selected.add(idx); el.classList.add('border-blue-500','bg-blue-100'); el.classList.remove('border-gray-200'); }
    // scene state: lifted card with warm border + running count
    const on
 = gs.selected.has(idx);
    el.classList.toggle('rcl-on', on);
    el.setAttribute('aria-pressed', on ? 'true' : 'false');
    const n = document.getElementById('recall-count'); if(n) n.textContent = gs.selected.size;
}
function _checkRecall() {
    if(!gameState.active) return;
    const gs = gameState.recall;
    const isHe = currentLang === 'he';
    const targetSet = new Set(gs.targets);
    let correct = 0, wrong = 0;
    gs.selected.forEach(i => { if(targetSet.has(gs._all[i])) correct++; else wrong++; });
    const missed = gs.targets.length - correct;
    if(wrong === 0 && missed === 0) { sfxWin(); setTimeout(()=>levelComplete(), 400); }
    else if(correct >= Math.ceil(gs.targets.length * 0.7) && wrong <= 1) { sfxCorrect(); setTimeout(()=>levelComplete(), 400); }
    else {
        sfxWrong();
        const c = document.getElementById('gameContent');
        const msg = isHe ? `מצאתם ${correct} מתוך ${gs.targets.length}` : `Found ${correct} of ${gs.targets.length}`;
        const old = c.querySelector('.rcl-note'); if(old) old.remove();   // a second Check replaces the note instead of stacking
        const info = document.createElement('div');
        info.className = 'mt-4 text-orange-600 font-bold text-lg rcl-note';
        info.innerHTML = `${msg}<br><button onclick="initRecall(document.getElementById('gameContent'))" class="rcl-again">${Icon.ui('rotate-ccw')} ${gt('Try Again', 'נסו שוב')}</button>`;
        c.appendChild(info);
    }
}
 

