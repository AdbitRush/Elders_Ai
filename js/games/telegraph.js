const _TG_CODE = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..'
};
const _TG_MSG = {
  easy: [
    'SOS',
    'HELLO',
    'HOME',
    'STOP',
    'LOVE',
    'CAKE',
    'RAIN',
    'MAIL',
    'SONG',
    'BOAT',
    'FARM',
    'TRAIN',
    'SNOW',
    'BABY',
    'GOLD'
  ],
  normal: [
    'ALL WELL',
    'HOME SOON',
    'BABY BOY',
    'COME HOME',
    'GOOD NEWS',
    'MISS YOU',
    'ARRIVE MONDAY',
    'SEND HELP',
    'WE WON',
    'SNOW DEEP',
    'HAPPY BIRTHDAY',
    'TRAIN LATE'
  ],
  hard: [
    'ARRIVED SAFE STOP',
    'MEET AT NOON',
    'WEDDING IN JUNE',
    'CROPS ARE IN',
    'WIRE MONEY SOON',
    'ALL ABOARD AT TEN',
    'BRING THE QUILT',
    'BACK BY FRIDAY',
    'THE COW HAD TWINS',
    'ROOF FIXED STOP'
  ]
};
function initTelegraph() {
  NK.start('telegraph', {
    setup(gs, diff) {
      gs.diff = diff;
      gs.list = shuffle(_TG_MSG[diff].slice()).slice(0, 5);
      gs.k = 0;
      gs.over = false;
      gs.peeks = 0;
      gs.misses = 0;
      gs.chart = diff === 'easy';
      const used = new Set(gs.list.join('').replace(/ /g, ''));
      gs.chartSet = diff === 'easy' ? Object.keys(_TG_CODE) : shuffle(Object.keys(_TG_CODE).filter(L => !used.has(L))).slice(0, 5).concat([...used]).sort();
      _tgLoad(gs);
    },
    view: _tgView,
    keys: Object.assign({ Backspace: () => tgType('') }, Object.fromEntries('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(L => [
      'Key' + L,
      () => tgType(L)
    ]))),
    rules: gs => [
      'A telegram arrives in <b>Morse code</b>: each letter is a short pattern of dots (short beeps) and dashes (long beeps). Letters are separated by gaps; a slash / marks a space between words.',
      'Type the plain letters, or tap them on the letter board. A wrong letter is shown in red and does not count; try another.',
      gs.diff === 'easy' ? 'The code chart is open for you.' : gs.diff === 'normal' ? 'The chart shows the letters in this shift\'s telegrams, plus a few others.' : 'The chart is closed: open it whenever you need it (each look is counted).',
      'Tap <b>Play beeps</b> to hear the telegram tapped out. A handy start: E is a single dot, T is a single dash, and S O S is ... --- ...',
      'Five telegrams a shift. No clock. Keyboard: letter keys type, Backspace undoes the last letter.'
    ],
    css: `.tg-scene{display:block;width:100%;height:clamp(160px,30vw,210px);border:2px solid #5f3d20;border-radius:12px;margin:0 0 14px;background:#d8bb88;box-shadow:0 3px 0 #3f2713}
.tg-scene .tg-lever{transform-origin:357px 127px;transition:transform .04s linear}
.tg-scene .tg-arm{transition:transform .04s linear}
.tg-scene .tg-sig{opacity:0}
.tg-scene.tg-down .tg-lever{transform:rotate(-4deg)}
.tg-scene.tg-down .tg-arm{transform:translateY(3px)}
.tg-scene.tg-down .tg-sig{opacity:1}
.tg-paper{position:relative;background:linear-gradient(180deg,#fdf6e0,#f5e8c4);border:1px solid #c9b383;border-radius:6px;padding:18px 16px 18px;box-shadow:0 2px 0 #c9b383,0 8px 18px rgba(74,46,23,.18);color:#2a1c12}
.tg-paper::before{content:"";position:absolute;inset:6px;border:1px solid rgba(120,53,15,.28);border-radius:3px;pointer-events:none}
.tg-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:4px 12px;font:800 1.05rem Georgia,'Times New Roman',serif;letter-spacing:.1em;color:#78350f}
.tg-title{text-align:center;font:900 clamp(1.35rem,5vw,1.75rem) Georgia,'Times New Roman',serif;letter-spacing:.28em;color:#4a2e17;padding:6px 0 8px;margin:4px 0 0;border-bottom:2px dashed #b89b6a}
.tg-form{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px 12px;font:italic 1.05rem Georgia,'Times New Roman',serif;color:#5f3d20;padding:8px 0;margin:0 0 16px;border-bottom:1px solid #d6c39a}
.tg-words{display:flex;flex-wrap:wrap;gap:16px 20px;justify-content:center;direction:ltr;padding:2px 0 4px}
.tg-word{display:flex;flex-wrap:wrap;gap:12px 20px;justify-content:center;max-width:100%}
.tg-l{display:flex;flex-direction:column;align-items:center;gap:8px;min-width:2.5rem}
.tg-code{display:inline-flex;align-items:center;gap:.24em;min-height:1.5rem;font:900 clamp(1.05rem,4.2vw,1.45rem) ui-monospace,Menlo,monospace;color:#78350f;white-space:nowrap}
.tg-code i,.tg-chart code i{display:inline-block;flex:none;width:.52em;height:.52em;border-radius:50%;background:#1c1917}
.tg-code i.tg-h,.tg-chart code i.tg-h{width:1.3em;height:.42em;border-radius:.21em}
.tg-box{width:2.5rem;height:2.8rem;border-bottom:3px solid #78350f;font:italic 900 1.75rem Georgia,'Times New Roman',serif;display:flex;align-items:flex-end;justify-content:center;color:#1e3a8a}
.tg-box.tg-cur{background:#fde68a;border-bottom-color:#b45309;border-radius:6px 6px 0 0;box-shadow:inset 0 0 0 2px rgba(180,83,9,.35)}
.tg-box.tg-bad{color:#b91c1c;background:#fee2e2;border-bottom-color:#b91c1c;box-shadow:inset 0 0 0 2px rgba(185,28,28,.35)}
.tg-stamp{width:max-content;max-width:100%;margin:16px 0 0;margin-inline:auto 8px;padding:4px 14px;border:3px double #166534;border-radius:6px;color:#166534;font:900 1.1rem Georgia,'Times New Roman',serif;letter-spacing:.2em;transform:rotate(-4deg)}
.tg-kb{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;max-width:31rem;margin:14px auto 0;padding:10px;background:linear-gradient(180deg,#7a5230,#5f3d20);border-radius:12px;box-shadow:inset 0 2px 0 rgba(255,255,255,.16),0 3px 0 #3f2713}
#gameContent .nk .tg-kb .gk-btn{min-width:0;padding:0;min-height:52px;font:900 1.3rem Georgia,'Times New Roman',serif;color:#3b2410;background:linear-gradient(180deg,#f8e8c4,#e2c58f);border:1px solid #8a6a3b;border-radius:7px;box-shadow:0 3px 0 #2f1c0d,inset 0 1px 0 rgba(255,255,255,.75);text-shadow:0 1px 0 rgba(255,255,255,.65)}
#gameContent .nk .tg-kb .gk-btn:hover:not(:disabled){background:linear-gradient(180deg,#fdf1d6,#ecd3a3)}
#gameContent .nk .tg-kb .gk-btn:active:not(:disabled){transform:translateY(2px);box-shadow:0 1px 0 #2f1c0d,inset 0 1px 0 rgba(255,255,255,.75)}
#gameContent .nk .tg-kb .gk-btn:focus-visible{outline:3px solid #fde68a;outline-offset:1px}
#gameContent .nk .tg-kb .gk-btn:disabled,#gameContent .nk .tg-kb .gk-btn[aria-disabled="true"]{opacity:.55}
.tg-chart{position:relative;display:grid;grid-template-columns:repeat(auto-fill,minmax(6.4rem,1fr));gap:4px 14px;max-width:35rem;margin:24px auto 0;padding:24px 16px 14px;background:linear-gradient(180deg,#fffaf0,#f8eed6);border:1px solid #c9b383;border-radius:6px;box-shadow:0 2px 0 #c9b383,0 6px 14px rgba(74,46,23,.18);font-size:1.1rem;color:#2a1c12}
.tg-chart::before{content:"";position:absolute;top:-9px;left:50%;margin-left:-9px;width:18px;height:18px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#f6d98a,#b8862f 60%,#7a5a1e);box-shadow:0 2px 3px rgba(0,0,0,.35)}
.tg-chart span{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:5px 6px;border-bottom:1px dotted #b89b6a;direction:ltr}
.tg-chart b{font:900 1.25rem Georgia,'Times New Roman',serif;color:#78350f}
.tg-chart code{display:inline-flex;align-items:center;gap:.22em;font-size:1.1rem}
@media (prefers-reduced-motion:no-preference){.tg-box.tg-bad{animation:tg-nudge .28s ease-out}.tg-stamp{animation:tg-press .3s ease-out}}
@keyframes tg-nudge{0%,100%{transform:translateX(0)}30%{transform:translateX(-3px)}65%{transform:translateX(3px)}}
@keyframes tg-press{0%{opacity:0;transform:rotate(-4deg) scale(1.25)}100%{opacity:1;transform:rotate(-4deg) scale(1)}}
@media (prefers-reduced-motion:reduce){.tg-scene .tg-lever,.tg-scene .tg-arm{transition:none}.tg-scene.tg-down .tg-lever,.tg-scene.tg-down .tg-arm{transform:none}#gameContent .nk .tg-kb .gk-btn:active:not(:disabled){transform:none}}`
  });
}
function _tgLoad(gs) {
  gs.msgText = gs.list[gs.k];
  gs.pos = 0;
  gs.got = '';
  gs.bad = '';
  gs.done = false;
  gs.msg = `Telegram ${ gs.k + 1 } of 5 has arrived. Decode it letter by letter.`;
}
const _tgLetters = gs => gs.msgText.replace(/ /g, '');
function tgType(L) {
  const gs = gameState.telegraph;
  if (gs.over || gs.done)
    return;
  const want = _tgLetters(gs);
  if (!L) {
    if (gs.bad)
      gs.bad = '';
    else if (gs.pos) {
      gs.pos--;
      gs.got = gs.got.slice(0, -1);
    }
    gs.msg = '';
    return NK.render('telegraph');
  }
  if (L === want[gs.pos]) {
    gs.got += L;
    gs.pos++;
    gs.bad = '';
    if (typeof sfxFlip === 'function')
      sfxFlip();
  } else {
    gs.bad = L;
    gs.misses++;
    gs.msg = `${ L } is ${ _TG_CODE[L] }, but this letter is ${ _TG_CODE[want[gs.pos]] }. Try again.`;
    if (typeof sfxWrong === 'function')
      sfxWrong();
    return NK.render('telegraph');
  }
  if (gs.pos === want.length) {
    gs.done = true;
    if (typeof sfxCorrect === 'function')
      sfxCorrect();
    gs.msg = `Decoded: "${ gs.msgText }".`;
    if (gs.k === 4) {
      gs.over = true;
      NK.render('telegraph');
      return NK.finish('telegraph', true, `Five telegrams decoded${ gs.misses ? ` with ${ NK.pl(gs.misses, 'wrong letter') }` : ' without a wrong letter' }${ gs.peeks ? `, ${ NK.pl(gs.peeks, 'look') } at the chart` : '' }.`);
    }
  } else
    gs.msg = '';
  NK.render('telegraph');
}
function tgNext() {
  const gs = gameState.telegraph;
  if (gs.over || !gs.done)
    return;
  gs.k++;
  _tgLoad(gs);
  NK.render('telegraph');
}
function tgChart() {
  const gs = gameState.telegraph;
  gs.chart = !gs.chart;
  if (gs.chart && gs.diff === 'hard')
    gs.peeks++;
  NK.render('telegraph');
}
function tgPlay() {
  const gs = gameState.telegraph;
  let A;
  try {
    A = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    return;
  }
  const u = 0.09;
  let t = A.currentTime + 0.05;
  const marks = [];
  const beep = len => {
    const o = A.createOscillator(), g = A.createGain();
    o.frequency.value = 660;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.18, t + 0.01);
    g.gain.setValueAtTime(0.18, t + len - 0.01);
    g.gain.linearRampToValueAtTime(0, t + len);
    o.connect(g);
    g.connect(A.destination);
    o.start(t);
    o.stop(t + len + 0.02);
    marks.push([
      t,
      len
    ]);
    t += len + u;
  };
  for (const ch of gs.msgText) {
    if (ch === ' ') {
      t += u * 4;
      continue;
    }
    for (const s of _TG_CODE[ch])
      beep(s === '.' ? u : u * 3);
    t += u * 2;
  }
  const now = A.currentTime, press = on => () => {
      const el = document.querySelector('.tg-scene');
      if (el)
        el.classList.toggle('tg-down', on);
    };
  for (const [s, len] of marks) {
    setTimeout(press(true), (s - now) * 1000);
    setTimeout(press(false), (s + len - now) * 1000);
  }
  setTimeout(() => A.close && A.close(), (t - A.currentTime + 0.5) * 1000);
}
function tgNew() {
  initTelegraph();
}
function _tgView(gs) {
  const ink = c => [...c].map(s => s === '.' ? '<i></i>' : '<i class="tg-h"></i>').join('');
  const say = c => c.replace(/\./g, 'dot ').replace(/-/g, 'dash ').trim();
  let idx = 0;
  const words = gs.msgText.split(' ').map(w => `<div class="tg-word">${ [...w].map(L => {
    const i = idx++, shown = i < gs.pos ? L : i === gs.pos && gs.bad ? gs.bad : '';
    return `<div class="tg-l"><span class="tg-code" aria-label="letter ${ i + 1 }: ${ say(_TG_CODE[L]) }">${ ink(_TG_CODE[L]) }</span><span class="tg-box${ i === gs.pos && !gs.done ? ' tg-cur' : '' }${ i === gs.pos && gs.bad ? ' tg-bad' : '' }" aria-hidden="true">${ shown }</span></div>`;
  }).join('') }</div>`).join('<div class="tg-l" aria-hidden="true"><span class="tg-code">/</span></div>');
  const kb = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(L => NK.btn(L, `tgType('${ L }')`, {
    k: 'L' + L,
    disabled: gs.over || gs.done
  })).join('') + NK.btn(Icon.svg('delete', {
    size: '22px',
    sw: 2.4
  }), 'tgType(\'\')', {
    k: 'L_',
    label: 'undo last letter',
    disabled: gs.over || gs.done
  });
  const chart = gs.chart ? `<div class="tg-chart">${ gs.chartSet.map(L => `<span><b>${ L }</b><code aria-label="${ say(_TG_CODE[L]) }">${ ink(_TG_CODE[L]) }</code></span>`).join('') }</div>` : '';
  const filed = gs.k + (gs.done ? 1 : 0);
  const glow = (0.24 + 0.14 * filed).toFixed(2), dim = (0.2 - 0.04 * filed).toFixed(2);
  const sky = [
    '#bfdbe8',
    '#c9dcd9',
    '#dcd9bf',
    '#ecd09e',
    '#e8b27f',
    '#a98fa8'
  ][filed];
  const stripes = Array.from({ length: 21 }, (_, i) => `<rect x="${ i * 32 }" y="0" width="2" height="108" fill="#b99a66" opacity=".22"/>`).join('');
  const panels = Array.from({ length: 8 }, (_, i) => `<rect x="${ i * 80 + 6 }" y="119" width="68" height="26" rx="2" fill="none" stroke="#6e4522" stroke-width="2"/>`).join('');
  const holes = [
    0,
    1,
    2,
    3,
    4
  ].map(i => {
    const x = 130 + i * 30;
    return `<rect x="${ x }" y="28" width="28" height="58" rx="2" fill="#3f2713"${ i === filed && !gs.over ? ' stroke="#f2c66d" stroke-width="2" stroke-dasharray="4 3"' : '' }/>` + (i < filed ? `<rect x="${ x + 3 }" y="66" width="22" height="17" rx="1.5" fill="#fdf6e3" stroke="#b89b6a"/><path d="M${ x + 3 } 66l11 9 11-9" fill="none" stroke="#b89b6a" stroke-width="1.2"/><circle cx="${ x + 14 }" cy="76" r="3.2" fill="#b4442f"/>` : '');
  }).join('');
  const scene = `<svg class="tg-scene" viewBox="0 0 640 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="The telegraph office: ${ filed } of 5 telegrams decoded and filed in the pigeonholes">
<defs>
<linearGradient id="tgWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ead7ae"/><stop offset="1" stop-color="#d8bb88"/></linearGradient>
<linearGradient id="tgDesk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#96653a"/><stop offset="1" stop-color="#6e4522"/></linearGradient>
<linearGradient id="tgBrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6dc95"/><stop offset=".55" stop-color="#c79a3c"/><stop offset="1" stop-color="#8f6a22"/></linearGradient>
<radialGradient id="tgGlow"><stop offset="0" stop-color="#fff0b8" stop-opacity=".95"/><stop offset=".45" stop-color="#ffe19a" stop-opacity=".4"/><stop offset="1" stop-color="#ffe19a" stop-opacity="0"/></radialGradient>
</defs>
<rect width="640" height="150" fill="url(#tgWall)"/>${ stripes }
<rect x="24" y="18" width="84" height="84" rx="3" fill="#6e4522"/><rect x="31" y="25" width="70" height="70" fill="${ sky }"/><circle cx="78" cy="${ 42 + filed * 8 }" r="8" fill="#f6c453"/><path d="M66 25v70M31 60h70" stroke="#6e4522" stroke-width="4"/><rect x="18" y="100" width="96" height="7" rx="2" fill="#5f3d20"/>
<g transform="translate(6 0)"><rect x="124" y="22" width="160" height="70" rx="3" fill="#7a5230"/><rect x="124" y="22" width="160" height="4" rx="2" fill="#96653a"/>${ holes }</g>
<rect y="112" width="640" height="38" fill="#9a6b3c"/><rect y="108" width="640" height="6" fill="#6e4522"/>${ panels }
<rect y="150" width="640" height="50" fill="url(#tgDesk)"/><rect y="150" width="640" height="4" fill="#b98950"/><rect y="188" width="640" height="12" fill="#55341a"/>
<ellipse cx="320" cy="170" rx="200" ry="20" fill="#ffe7a0" opacity="${ (glow * 0.3).toFixed(2) }"/>
<path d="M566 150l14-32 14 32" fill="none" stroke="#55341a" stroke-width="5" stroke-linecap="round"/>
<circle cx="580" cy="118" r="27" fill="#f4ead0" stroke="#b89b6a" stroke-width="2"/><circle cx="580" cy="118" r="19" fill="none" stroke="#d6c39a" stroke-width="2"/><circle cx="580" cy="118" r="11" fill="none" stroke="#d6c39a" stroke-width="2"/><circle cx="580" cy="118" r="5" fill="#6e4522"/>
<path d="M560 137C548 158 520 167 480 168L250 172C236 172 230 178 222 185" fill="none" stroke="#b89b6a" stroke-width="12" stroke-linecap="round"/>
<path d="M560 137C548 158 520 167 480 168L250 172C236 172 230 178 222 185" fill="none" stroke="#f8efd6" stroke-width="9.5" stroke-linecap="round"/>
<path d="M472 168.2L262 171.8" stroke="#2a1c12" stroke-width="2.6" stroke-dasharray="3 5 9 5 3 5 3 10 9 5 9 5 3 10"/>
<rect x="296" y="140" width="128" height="12" rx="3" fill="#55341a"/><rect x="296" y="140" width="128" height="3" rx="1.5" fill="#7a5230"/>
<rect x="309" y="133" width="10" height="7" rx="1" fill="url(#tgBrass)"/><circle class="tg-sig" cx="314" cy="132" r="6" fill="#fff3b0"/>
<rect x="351" y="118" width="12" height="22" rx="2" fill="url(#tgBrass)"/>
<g class="tg-lever"><rect x="304" y="124" width="108" height="6" rx="3" fill="url(#tgBrass)"/><rect x="312" y="112" width="4" height="13" fill="#2a1c12"/><ellipse cx="314" cy="110" rx="14" ry="5.5" fill="#1f1410"/><ellipse cx="310" cy="108.5" rx="6" ry="1.6" fill="#6b5a4e"/><rect x="398" y="115" width="5" height="10" fill="url(#tgBrass)"/><circle cx="400.5" cy="114" r="4" fill="url(#tgBrass)"/></g>
<circle cx="357" cy="127" r="3" fill="#6e4f16"/>
<path d="M424 147C429 142 432 148 436 147" fill="none" stroke="#2a1c12" stroke-width="2.5"/>
<g transform="translate(-10 0)"><rect x="444" y="142" width="72" height="10" rx="3" fill="#55341a"/><rect x="444" y="142" width="72" height="3" rx="1.5" fill="#7a5230"/>
<rect x="452" y="119" width="17" height="23" rx="3" fill="#8a4b2a"/><rect x="475" y="119" width="17" height="23" rx="3" fill="#8a4b2a"/><path d="M452 125h17M452 131h17M452 137h17M475 125h17M475 131h17M475 137h17" stroke="#5f2f17" stroke-width="1.5"/>
<rect x="499" y="102" width="6" height="40" rx="1" fill="url(#tgBrass)"/><rect class="tg-arm" x="447" y="110" width="58" height="5" rx="2" fill="url(#tgBrass)"/></g>
<rect width="640" height="200" fill="#2b1d12" opacity="${ dim }"/>
<circle cx="320" cy="62" r="170" fill="url(#tgGlow)" opacity="${ glow }"/>
<path d="M320 0v30" stroke="#2a1c12" stroke-width="2.5"/><path d="M296 54Q320 22 344 54Z" fill="#2f5d50"/><rect x="294" y="52" width="52" height="4" rx="2" fill="#1f4037"/><circle cx="320" cy="59" r="6" fill="#fff3c4" opacity="${ Math.min(1, 0.5 + 0.1 * filed).toFixed(2) }"/>
</svg>`;
  return `<div class="nk-top"><span>Telegram <b>${ gs.k + 1 }</b> of 5</span><span>Wrong letters: <b>${ gs.misses }</b></span>${ gs.diff === 'hard' ? `<span>Chart looks: <b>${ gs.peeks }</b></span>` : '' }</div>
      ${ scene }
      <div class="tg-paper"><div class="tg-head"><span>TELEGRAPH OFFICE</span><span>No. ${ 101 + gs.k }</span></div><div class="tg-title" aria-hidden="true">TELEGRAM</div><div class="tg-form" aria-hidden="true"><span>Received by wire</span><span>${ NK.pl(_tgLetters(gs).length, 'letter') }</span></div><div class="tg-words" aria-label="telegram in Morse code, ${ _tgLetters(gs).length } letters; ${ gs.pos } decoded${ gs.got ? ': ' + gs.got : '' }">${ words }</div>${ gs.done ? '<div class="tg-stamp" aria-hidden="true">DECODED</div>' : '' }</div>
      ${ NK.msg(gs.msg) }
      <div class="tg-kb" role="group" aria-label="letters">${ kb }</div>
      <div class="gk-btns">${ gs.done && !gs.over ? NK.btn(NK.icon('arrow-right') + 'Next telegram', 'tgNext()', {
    k: 'next',
    cls: 'gk-primary'
  }) : '' }${ NK.btn(NK.icon('volume-2') + 'Play beeps', 'tgPlay()', { k: 'play' }) }${ gs.diff === 'easy' ? '' : NK.btn(gs.chart ? 'Close the chart' : 'Open the chart', 'tgChart()', {
    k: 'chart',
    pressed: gs.chart
  }) }${ NK.btn(NK.icon('rotate-ccw') + 'New shift', 'tgNew()', { k: 'restart' }) }</div>${ chart }`;
}