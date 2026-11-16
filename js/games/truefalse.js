function initTrueFalse(c) {
  const gs = gameState.truefalse;
  const _d = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
  gs.pool = shuffle([...i18nData[currentLang].tf_pool]);
  gs.idx = 0;
  gs.perLevel = _d === 'easy' ? 6 : _d === 'hard' ? 12 : 8;
  gs.score = 0;
  _tfNext(c);
}
function _tfNext(c) {
  if (!gameState.active || gameState.currentId !== 'truefalse')
    return;
  const gs = gameState.truefalse;
  gs._locked = false;
  if (gs.idx >= gs.perLevel) {
    gs._sessionScore = {
      correct: gs.score,
      total: gs.perLevel
    };
    levelComplete();
    return;
  }
  const item = gs.pool[gs.idx % gs.pool.length];
  const isHe = false;
  const jt = n => (Math.abs(Math.sin((n + 1) * 12.9898 + (gs.idx + 1) * 4.137)) * 5).toFixed(1);
  const pts = [];
  let k = 0;
  for (let x = 0; x <= 100; x += 5)
    pts.push(`${ x }% ${ jt(k++) }px`);
  for (let y = 6; y <= 94; y += 8)
    pts.push(`calc(100% - ${ jt(k++) }px) ${ y }%`);
  for (let x = 100; x >= 0; x -= 5)
    pts.push(`${ x }% calc(100% - ${ jt(k++) }px)`);
  for (let y = 94; y >= 6; y -= 8)
    pts.push(`${ jt(k++) }px ${ y }%`);
  let dots = '';
  for (let i = 0; i < gs.perLevel; i++)
    dots += `<i class="tf-dot ${ i < gs.idx ? 'tf-dot-done' : i === gs.idx ? 'tf-dot-now' : '' }"></i>`;
  const sprig = `<svg class="tf-sprig" viewBox="0 0 120 14" width="120" height="14" aria-hidden="true" focusable="false"><path d="M4 7h40M76 7h40" stroke="#a8763e" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M60 1c5 3 5 9 0 12c-5-3-5-9 0-12z" fill="#7fa05a"/><circle cx="50" cy="7" r="2" fill="#c1643c"/><circle cx="70" cy="7" r="2" fill="#c1643c"/></svg>`;
  const css = `
.tf-scene{position:relative;overflow:hidden;box-sizing:border-box;margin-inline:auto;padding:14px 14px 0;border-radius:22px;border:1px solid #e6cfa2;background:linear-gradient(180deg,#fdf3dc 0%,#fbe9c6 60%,#f8ddb2 100%);color:#3b2a1a}
.tf-scene *{box-sizing:border-box}
.tf-scene>*{position:relative;z-index:1}
.tf-scene .tf-hill{position:absolute;z-index:0;left:0;right:0;bottom:0;width:100%;height:128px;display:block}
.tf-scene .tf-top{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}
.tf-scene .tf-plaque{display:inline-block;padding:6px 16px;min-width:3.4em;border-radius:9px;font-size:1.3rem;line-height:1.35;font-weight:700;color:#fff6df;white-space:nowrap;border:2px solid #4d2f16;background:repeating-linear-gradient(91deg,rgba(255,255,255,.07) 0 2px,rgba(0,0,0,0) 2px 11px),linear-gradient(180deg,#8a5c33,#6b4526);box-shadow:inset 0 1px 0 rgba(255,255,255,.25),0 2px 4px rgba(70,40,10,.3);text-shadow:0 1px 0 rgba(0,0,0,.35)}
.tf-scene .tf-plaque.text-green-600{color:#d9f4bd}
.tf-scene .tf-dots{display:flex;justify-content:center;align-items:center;gap:6px;min-height:18px;margin-bottom:14px}
.tf-scene .tf-dot{display:block;flex:none;width:12px;height:12px;border-radius:50%;border:2px solid #c39a68;background:rgba(255,255,255,.45)}
.tf-scene .tf-dot-done{background:#a8623a;border-color:#8a4c2a}
.tf-scene .tf-dot-now{width:18px;height:18px;border:3px solid #d99a1c;background:#fff3c9;transition:background-color .2s,border-color .2s}
.tf-scene.tf-ok .tf-dot-now{background:#3f8a4c;border-color:#2c6b39}
.tf-scene.tf-no .tf-dot-now{background:#c1643c;border-color:#96421f}
.tf-scene .tf-page{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;min-height:190px;padding:30px 26px;filter:drop-shadow(0 3px 5px rgba(90,55,20,.32));transition:filter .25s ease}
.tf-scene .tf-paper{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(150,110,60,.04) 0 1px,rgba(0,0,0,0) 1px 4px),radial-gradient(ellipse at 30% 18%,#fffbf1 0%,#f8edd0 58%,#efdcb1 100%);transition:background-color .25s}
.tf-scene .tf-frame{position:absolute;inset:13px;border:1.5px solid rgba(140,95,50,.45);border-radius:6px;pointer-events:none}
.tf-scene .tf-sprig,.tf-scene .tf-text,.tf-scene .tf-stamp{position:relative}
.tf-scene .tf-sprig{display:block;flex:none;max-width:60%}
.tf-scene .tf-text{font-family:Georgia,'Palatino Linotype','Book Antiqua','Frank Ruehl','David','Times New Roman',serif;font-size:clamp(1.5rem,5vw,2rem);line-height:1.5;font-weight:700;color:#3b2a1a;text-align:center;overflow-wrap:anywhere}
.tf-scene .tf-stamp{position:absolute;top:10px;inset-inline-end:10px;width:54px;height:54px;opacity:0;transform:rotate(-10deg) scale(.6);transition:opacity .18s ease,transform .18s ease;pointer-events:none}
.tf-scene .tf-stamp svg{position:absolute;inset:0;width:100%;height:100%;display:none}
.tf-scene.tf-ok .tf-stamp,.tf-scene.tf-no .tf-stamp{opacity:1;transform:rotate(-10deg) scale(1)}
.tf-scene.tf-ok .tf-stamp .tf-st-ok,.tf-scene.tf-no .tf-stamp .tf-st-no{display:block}
.tf-scene.tf-ok .tf-page{filter:drop-shadow(0 0 16px rgba(240,176,40,.95)) drop-shadow(0 3px 5px rgba(90,55,20,.25))}
.tf-scene.tf-ok .tf-paper{background-color:#fff0b8;background-blend-mode:multiply}
.tf-scene.tf-no .tf-page{animation:tf-shake .42s ease both}
.tf-scene.tf-no .tf-paper{background-color:#f6cdb9;background-blend-mode:multiply}
.tf-scene .tf-signs{display:flex;gap:16px;justify-content:center;align-items:stretch;margin-top:22px;padding-bottom:44px}
.tf-scene .tf-sign{position:relative;flex:1 1 0;min-width:0;max-width:210px;min-height:72px;margin:0;padding:12px 10px;display:inline-flex;align-items:center;justify-content:center;gap:.4em;flex-wrap:wrap;font:inherit;font-size:1.5rem;line-height:1.2;font-weight:800;color:#fffdf2;text-shadow:0 1px 0 rgba(0,0,0,.4);border-radius:14px;border:3px solid #1f4d29;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:inset 0 2px 0 rgba(255,255,255,.22),0 4px 0 rgba(60,35,10,.45),0 8px 12px rgba(60,35,10,.22);transition:transform .12s ease,box-shadow .2s ease,opacity .2s ease,filter .2s ease}
.tf-scene .tf-sign svg{flex:none;width:1.15em;height:1.15em}
.tf-scene .tf-sign::before{content:'';position:absolute;inset:5px;border-radius:9px;border:2px solid rgba(255,248,220,.38);pointer-events:none}
.tf-scene .tf-sign::after{content:'';position:absolute;top:100%;left:50%;width:16px;height:30px;margin-top:3px;transform:translateX(-50%);border-radius:0 0 3px 3px;background:linear-gradient(90deg,#6b4526,#93643a 45%,#6b4526);box-shadow:0 2px 3px rgba(60,35,10,.25);pointer-events:none}
.tf-scene .tf-sign-true{border-color:#1f4d29;background:repeating-linear-gradient(92deg,rgba(255,255,255,.06) 0 2px,rgba(0,0,0,0) 2px 10px),linear-gradient(180deg,#418c4e,#2c6b39)}
.tf-scene .tf-sign-false{border-color:#7a3216;background:repeating-linear-gradient(92deg,rgba(255,255,255,.06) 0 2px,rgba(0,0,0,0) 2px 10px),linear-gradient(180deg,#c0603a,#a04626)}
.tf-scene .tf-sign:active{transform:translateY(3px);box-shadow:inset 0 2px 0 rgba(255,255,255,.22),0 1px 0 rgba(60,35,10,.45),0 3px 6px rgba(60,35,10,.22)}
.tf-scene .tf-sign:focus-visible{outline:4px solid #1a365d;outline-offset:3px}
@media (hover:hover){.tf-scene:not(.tf-ok):not(.tf-no) .tf-sign:hover{filter:brightness(1.08)}}
.tf-scene.tf-ok .tf-sign,.tf-scene.tf-no .tf-sign{cursor:default}
.tf-scene.tf-ok .tf-sign:not(.tf-picked){opacity:.6}
.tf-scene.tf-ok .tf-sign.tf-picked,.tf-scene.tf-no .tf-sign.tf-right{box-shadow:0 0 0 4px #f6c453,0 0 22px 6px rgba(245,180,40,.85),0 4px 0 rgba(60,35,10,.45)}
.tf-scene.tf-no .tf-sign.tf-picked{opacity:.5;filter:saturate(.55)}
@keyframes tf-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}45%{transform:translateX(5px)}70%{transform:translateX(-3px)}88%{transform:translateX(2px)}}
@media (max-width:380px){.tf-scene{padding:12px 10px 0}.tf-scene .tf-page{padding:28px 20px}.tf-scene .tf-signs{gap:10px}.tf-scene .tf-sign{font-size:1.4rem;padding:12px 6px}.tf-scene .tf-plaque{padding:6px 12px}}
@media (prefers-reduced-motion:reduce){.tf-scene .tf-page,.tf-scene.tf-no .tf-page{animation:none}.tf-scene .tf-sign,.tf-scene .tf-stamp,.tf-scene .tf-page{transition:none}.tf-scene .tf-sign:active{transform:none}}
`;
  c.innerHTML = `<div class="tf-scene max-w-xl w-full text-center">
        <style>${ css }</style>
        <svg class="tf-hill" viewBox="0 0 400 128" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 62C70 30 150 28 230 50C300 68 350 60 400 40V128H0Z" fill="#b9d295"/><path d="M0 92C90 62 170 70 250 84C320 96 365 90 400 78V128H0Z" fill="#94b96f"/><path d="M0 116C100 100 220 104 400 110V128H0Z" fill="#7da25a"/></svg>
        <div class="tf-top"><span class="tf-plaque">${ gt('Q') } ${ gs.idx + 1 }/${ gs.perLevel }</span><span class="tf-plaque text-green-600">&#10003; ${ gs.score }</span></div>
        <div class="tf-dots" aria-hidden="true">${ dots }</div>
        <div class="tf-page">
            <div class="tf-paper" style="clip-path:polygon(${ pts.join(',') })"></div>
            <div class="tf-frame"></div>
            ${ sprig }
            <div class="tf-text">${ item.s }</div>
            ${ sprig }
            <div class="tf-stamp" aria-hidden="true">
                <svg class="tf-st-ok" viewBox="0 0 54 54" focusable="false"><circle cx="27" cy="27" r="23" fill="#eef7df" stroke="#2c6b39" stroke-width="4"/><path d="M16 28l8 8l15-17" fill="none" stroke="#2c6b39" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <svg class="tf-st-no" viewBox="0 0 54 54" focusable="false"><circle cx="27" cy="27" r="23" fill="#fbe7dc" stroke="#a04626" stroke-width="4"/><path d="M18 18l18 18M36 18l-18 18" fill="none" stroke="#a04626" stroke-width="5.5" stroke-linecap="round"/></svg>
            </div>
        </div>
        <div class="tf-signs">
            <button onclick="answerTF(true,${ item.a })" class="tf-sign tf-sign-true" data-tf="true">${ Icon.ui('check', { sw: 3 }) } ${ gt('True') }</button>
            <button onclick="answerTF(false,${ item.a })" class="tf-sign tf-sign-false" data-tf="false">${ Icon.ui('x', { sw: 3 }) } ${ gt('False') }</button>
        </div>
    </div>`;
}
function answerTF(sel, correct) {
  if (!gameState.active || gameState.currentId !== 'truefalse')
    return;
  const gs = gameState.truefalse;
  if (gs._locked)
    return;
  gs._locked = true;
  if (sel === correct) {
    sfxCorrect();
    gs.score++;
  } else
    sfxWrong();
  gs.idx++;
  try {
    const root = document.getElementById('gameContent');
    const scene = root && root.querySelector ? root.querySelector('.tf-scene') : null;
    if (scene) {
      scene.classList.add(sel === correct ? 'tf-ok' : 'tf-no');
      const picked = scene.querySelector('[data-tf="' + sel + '"]');
      if (picked)
        picked.classList.add('tf-picked');
      const right = scene.querySelector('[data-tf="' + correct + '"]');
      if (right)
        right.classList.add('tf-right');
      const sc = scene.querySelector('.text-green-600');
      if (sc)
        sc.textContent = '\u2713 ' + gs.score;
    }
  } catch (e) {
  }
  setTimeout(() => _tfNext(document.getElementById('gameContent')), sel === correct ? 350 : 800);
}