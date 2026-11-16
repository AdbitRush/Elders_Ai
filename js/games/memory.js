function initMemory(container) {
  const state = gameState.memory;
  const _d = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
  const base = 3 + Math.floor(state.level / 2);
  const adjusted = _d === 'easy' ? Math.max(2, base - 1) : _d === 'hard' ? base + 2 : base;
  state.pairs = Math.min(12, Math.max(4, adjusted + adjusted % 2));
  state.flipped = [];
  state.matched = 0;
  const ART = [
    'Red convertible',
    'Milkshake',
    'Jukebox',
    'Apple pie',
    'Rotary telephone',
    'Baseball and glove',
    'Cardinal',
    'Lighthouse',
    'School bus',
    'Tabletop radio',
    'Picnic basket',
    'Box camera'
  ];
  const icons = shuffle(ART.map((_, k) => k + 1)).slice(0, state.pairs);
  const cards = shuffle([
    ...icons,
    ...icons
  ]);
  const n = cards.length, wide = n === 20 ? 5 : n === 24 ? 6 : 4;
  let rays = '', tips = '';
  for (let k = 0; k < 16; k++) {
    const a = k * Math.PI / 8, len = k % 2 ? 19 : 30, cx = Math.cos(a), sy = Math.sin(a);
    rays += `<line x1="${ (50 + cx * 8).toFixed(1) }" y1="${ (50 + sy * 8).toFixed(1) }" x2="${ (50 + cx * len).toFixed(1) }" y2="${ (50 + sy * len).toFixed(1) }"/>`;
    if (!(k % 2))
      tips += `<circle cx="${ (50 + cx * len).toFixed(1) }" cy="${ (50 + sy * len).toFixed(1) }" r="2.3"/>`;
  }
  const spark = [
    [
      20,
      20
    ],
    [
      80,
      20
    ],
    [
      20,
      80
    ],
    [
      80,
      80
    ]
  ].map(([x, y]) => `<path transform="translate(${ x } ${ y })" d="M0-6.5L1.6-1.6 6.5 0 1.6 1.6 0 6.5-1.6 1.6-6.5 0-1.6-1.6Z"/>`).join('');
  const back = `<svg class="mem-burst" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><rect width="100" height="100" fill="#a8432a"/><rect x="6" y="6" width="88" height="88" rx="9" fill="#8f3520" stroke="#f6e3b4" stroke-width="2"/><rect x="10.5" y="10.5" width="79" height="79" rx="6" fill="none" stroke="#d9a441" stroke-width="1"/><g stroke="#f2c14e" stroke-width="2.4" stroke-linecap="round">${ rays }</g><g fill="#f6e3b4">${ tips }</g><g fill="#8fc4b2">${ spark }</g><circle cx="50" cy="50" r="6.5" fill="#f2c14e"/><circle cx="50" cy="50" r="2.6" fill="#8f3520"/></svg>`;
  const css = `<style>
.mem-grid{--mem-band:clamp(20px,5vw,34px);--mem-rug:clamp(7px,2vw,14px);--mem-pad:clamp(10px,2.6vw,22px);position:relative;isolation:isolate;box-sizing:border-box;padding:calc(var(--mem-band) + var(--mem-rug) + var(--mem-pad)) calc(var(--mem-rug) + var(--mem-pad)) calc(var(--mem-rug) + var(--mem-pad))}
.mem-grid::before,.mem-grid::after{content:"";position:absolute;pointer-events:none}
.mem-grid::before{inset:0;z-index:-2;border-radius:20px;box-shadow:0 3px 12px rgba(40,20,5,.28);background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'%3E%3Crect width='28' height='28' fill='%23f1e2c0'/%3E%3Cpath d='M14 5l4 9-4 9-4-9z' fill='%23d9a441'/%3E%3Ccircle cx='0' cy='14' r='2.2' fill='%237aa79a'/%3E%3Ccircle cx='28' cy='14' r='2.2' fill='%237aa79a'/%3E%3C/svg%3E") left top/var(--mem-band) var(--mem-band) repeat-x,linear-gradient(#5c3618,#5c3618) left var(--mem-band)/100% 4px no-repeat,repeating-linear-gradient(45deg,rgba(255,255,255,.06) 0 6px,rgba(255,255,255,0) 6px 12px),repeating-linear-gradient(-45deg,rgba(0,0,0,.07) 0 6px,rgba(0,0,0,0) 6px 12px),#2f5d57}
.mem-grid::after{z-index:-1;inset:calc(var(--mem-band) + var(--mem-rug)) var(--mem-rug) var(--mem-rug);border:3px solid #5c3618;border-radius:16px;background:linear-gradient(100deg,rgba(255,255,255,.09),rgba(255,255,255,0) 42%,rgba(0,0,0,.12)),repeating-linear-gradient(94deg,rgba(60,30,10,.2) 0 1px,rgba(60,30,10,0) 1px 9px,rgba(255,220,170,.07) 9px 10px,rgba(255,220,170,0) 10px 23px),linear-gradient(180deg,#a8703f,#8a5730 55%,#7a4a27);box-shadow:inset 0 0 0 2px rgba(240,200,120,.4),inset 0 0 36px rgba(40,18,4,.35),0 6px 14px rgba(30,12,2,.45)}
.mem-grid .card-inner{cursor:pointer}
.mem-grid .card-face{box-sizing:border-box;border-radius:12px;box-shadow:0 3px 6px rgba(30,12,2,.5)}
.mem-grid .mem-back{overflow:hidden;background:#a8432a;border:3px solid #f6e3b4}
.mem-grid .mem-burst{display:block;width:100%;height:100%}
.mem-grid .mem-face{background:#fffaf0;border-color:#6b4423;overflow:hidden}
.mem-grid .card-inner.matched{cursor:default}
.mem-grid .card-inner.matched .mem-face{border-color:#e0a526;box-shadow:0 0 0 3px #f7d774,0 0 16px 5px rgba(247,196,70,.6);animation:mem-gold 1.4s ease-out 1}
.mem-grid .card-inner.matched .mem-face::after{content:"";position:absolute;top:3px;inset-inline-end:3px;width:26%;max-width:30px;aspect-ratio:1;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='11' fill='%23fff7dc' stroke='%238a5a0a' stroke-width='1.5'/%3E%3Cpath d='M12 4.5l2.2 4.7 5.1.6-3.8 3.5 1 5-4.5-2.5-4.5 2.5 1-5-3.8-3.5 5.1-.6z' fill='%23e0a526' stroke='%238a5a0a' stroke-width='1' stroke-linejoin='round'/%3E%3C/svg%3E") center/contain no-repeat}
@keyframes mem-gold{0%{box-shadow:0 0 0 3px #f7d774,0 0 0 0 rgba(247,196,70,.9)}45%{box-shadow:0 0 0 5px #f7d774,0 0 30px 12px rgba(247,196,70,.75)}100%{box-shadow:0 0 0 3px #f7d774,0 0 16px 5px rgba(247,196,70,.6)}}
@media (hover:hover){.mem-grid .card-inner:not(.flipped):not(.matched):hover .mem-back{border-color:#ffe9a8;box-shadow:0 5px 10px rgba(30,12,2,.55),0 0 0 2px rgba(255,233,168,.55)}}
@media (prefers-reduced-motion:reduce){.mem-grid .card-inner{transition-duration:.01s!important}.mem-grid .card-inner.matched .mem-face{animation:none}}
</style>`;
  let html = `<div class="mem-grid grid gap-3 md:gap-4 w-full mx-auto" data-cards="${ n }" style="grid-template-columns:repeat(4,minmax(0,1fr));--mem-cols:${ wide }">`;
  cards.forEach((icon, i) => {
    html += `<div class="aspect-square relative text-3xl md:text-5xl"><div class="card-inner w-full h-full" data-val="${ icon }" id="m-card-${ i }" onclick="flipMemory(${ i })"><div class="card-face mem-back w-full h-full absolute rounded-xl shadow-md flex items-center justify-center">${ back }</div><div class="card-face card-back mem-face w-full h-full absolute bg-white border-4 border-slate-700 rounded-xl shadow-md flex items-center justify-center"><img class="mem-art" src="images/art/pair-${ icon }.webp" alt="${ ART[icon - 1] }" draggable="false" decoding="async"></div></div></div>`;
  });
  container.innerHTML = css + html + `</div>`;
}
function flipMemory(i) {
  const card = document.getElementById(`m-card-${ i }`), state = gameState.memory;
  if (state.flipped.length === 2 || card.classList.contains('flipped') || card.classList.contains('matched'))
    return;
  sfxFlip();
  card.classList.add('flipped');
  state.flipped.push(card);
  if (state.flipped.length === 2) {
    const [c1, c2] = state.flipped;
    if (c1.dataset.val === c2.dataset.val) {
      c1.classList.add('matched');
      c2.classList.add('matched');
      sfxCorrect();
      state.matched++;
      state.flipped = [];
      if (state.matched === state.pairs)
        setTimeout(() => levelComplete(), 600);
    } else {
      setTimeout(() => {
        c1.classList.remove('flipped');
        c2.classList.remove('flipped');
        state.flipped = [];
      }, 1000);
    }
  }
}