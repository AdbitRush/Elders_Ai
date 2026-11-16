function _mcMaze(cw, ch) {
  const W = cw * 2 + 1, H = ch * 2 + 1, g = Array(W * H).fill(1), st = [[
        0,
        0
      ]], seen = new Set(['0,0']);
  g[W + 1] = 0;
  while (st.length) {
    const [x, y] = st[st.length - 1], nb = shuffle([
        [
          1,
          0
        ],
        [
          -1,
          0
        ],
        [
          0,
          1
        ],
        [
          0,
          -1
        ]
      ]).map(([a, b]) => [
        x + a,
        y + b
      ]).filter(([a, b]) => a >= 0 && a < cw && b >= 0 && b < ch && !seen.has(a + ',' + b));
    if (!nb.length) {
      st.pop();
      continue;
    }
    const [a, b] = nb[0];
    seen.add(a + ',' + b);
    g[(b * 2 + 1) * W + a * 2 + 1] = 0;
    g[(y + b + 1) * W + x + a + 1] = 0;
    st.push([
      a,
      b
    ]);
  }
  for (let k = 0; k < cw * ch * 0.35; k++) {
    const x = 1 + Math.floor(Math.random() * (W - 2)), y = 1 + Math.floor(Math.random() * (H - 2));
    if (g[y * W + x] && (x % 2 === 1 && y % 2 === 0 || x % 2 === 0 && y % 2 === 1))
      g[y * W + x] = 0;
  }
  return {
    W,
    H,
    g
  };
}
function initMuncher() {
  NK.start('muncher', {
    setup(gs, diff) {
      gs.diff = diff;
      const M = _mcMaze(7, 7);
      Object.assign(gs, M);
      gs.start = gs.W + 1;
      gs.catStart = [
        (gs.H - 2) * gs.W + gs.W - 2,
        (gs.H - 2) * gs.W + 1,
        gs.W + gs.W - 2
      ].slice(0, diff === 'hard' ? 3 : 2);
      gs.crumb = new Set();
      gs.cheese = new Set([
        7 * gs.W + 1,
        7 * gs.W + gs.W - 2,
        gs.W + 7,
        (gs.H - 2) * gs.W + 7
      ]);
      gs.g.forEach((v, i) => {
        if (!v && i !== gs.start && !gs.cheese.has(i))
          gs.crumb.add(i);
      });
      gs.total = gs.crumb.size;
      gs.lives = diff === 'hard' ? 4 : 5;
      gs.maxLives = gs.lives;
      gs.over = false;
      gs.steps = 0;
      gs.scared = 0;
      gs.caught = 0;
      _mcReset(gs);
      gs.msg = 'Eat every crumb. The cats move only when you do. Cheese makes them run home.';
    },
    view: _mcView,
    arrows(dir) {
      mcStep({
        up: -gameState.muncher.W,
        down: gameState.muncher.W,
        left: -1,
        right: 1
      }[dir]);
      return true;
    },
    rules: gs => [
      'Guide the <b>mouse</b> through the pantry and eat <b>every crumb</b>.',
      'Nothing moves until you do: after each step of yours, every cat takes a step toward the mouse' + (gs.diff === 'easy' ? ' (on easy, only one step in three)' : gs.diff === 'normal' ? ' (on normal, every other step)' : ' (on hard, every other step, but there are three cats)') + '.',
      `If a cat catches the mouse you lose a life (you have ${ gs.maxLives }) and everyone goes back to the start. Crumbs you have eaten stay eaten.`,
      'The <b>cheese wedges</b> scare the cats: for 8 steps they run back home, and touching one sends it home at once.',
      'Move with the arrow buttons, the arrow keys, or by tapping a square next to the mouse. No clock.'
    ],
    css: `.mc-top{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.6rem 1rem;font-size:1.05rem;line-height:1.3;margin-bottom:.75rem}
.mc-chalk{display:inline-block;background:#2f4a3c;color:#f7f3e3;border:4px solid #8a5a2e;border-radius:10px;padding:.3rem .85rem .5rem;box-shadow:inset 0 0 0 1px rgba(0,0,0,.3),0 2px 4px rgba(60,35,10,.25)}
.mc-chalk b{font-size:1.35rem;color:#ffe9a3}
.mc-bar{display:block;height:.4rem;margin-top:.3rem;border-radius:99px;background:rgba(255,255,255,.24);overflow:hidden}
.mc-bar i{display:block;height:100%;border-radius:99px;background:#ffe9a3}
.mc-lv{display:inline-flex;align-items:flex-end;gap:.3rem;padding:0 .55rem .2rem;border-bottom:.4rem solid #9a6534;border-radius:0 0 5px 5px;box-shadow:0 4px 3px -2px rgba(60,35,10,.4)}
.mc-lv i{display:inline-block;width:1.75rem;height:1.5rem;margin:0}
.mc-lv i svg{display:block;width:100%;height:100%}
.mc-lv i.mc-off{opacity:.3;filter:grayscale(1)}
.mc-stp{background:#fff8e6;color:#3b2a17;border:2px solid #d8c08f;border-radius:10px;padding:.3rem .85rem}
.mc-stp b{font-size:1.2rem}
.mc-fr{max-width:min(100%,34rem,max(17rem,calc(100vh - 400px)));margin:0 auto;padding:0 .55rem .55rem;border-radius:16px;background:linear-gradient(180deg,#b07a44,#8a5a2e);box-shadow:0 0 0 3px #6b4320,0 6px 14px rgba(60,35,10,.3);direction:ltr}
.mc-fr.mc-dg{box-shadow:0 0 0 3px #6b4320,0 0 0 8px #e9a63c,0 6px 14px rgba(60,35,10,.3)}
.mc-fr.mc-sd{box-shadow:0 0 0 3px #6b4320,0 0 0 8px #9dbfe3,0 6px 14px rgba(60,35,10,.3)}
.mc-fr.mc-win{box-shadow:0 0 0 3px #6b4320,0 0 0 8px #f0cb4a,0 6px 14px rgba(60,35,10,.3)}
.mc-fr.mc-lost .mc-b{filter:saturate(.5) brightness(.93)}
.mc-sc{height:1.6rem;display:flex;align-items:center;justify-content:center;gap:.35rem;visibility:hidden}
.mc-sc.mc-on{visibility:visible}
.mc-sc i{width:1.05rem;height:.85rem;background:#ffdc55;clip-path:polygon(0 100%,100% 100%,100% 0)}
.mc-sc i.mc-off{background:rgba(255,255,255,.3)}
.mc-in{position:relative;aspect-ratio:1;border-radius:8px;overflow:hidden;box-shadow:0 0 0 2px #6b4320}
.mc-b{position:absolute;inset:0;display:grid;gap:0;background:#f6e9cd}
.mc-s{border:0;padding:0;margin:0;min-width:0;min-height:0;position:relative;display:flex;align-items:center;justify-content:center;background:#f6e9cd;border-radius:0;--nk-r:0}
button.mc-s{cursor:pointer;-webkit-tap-highlight-color:transparent}
button.mc-s:disabled{cursor:default;opacity:1}
.mc-s:focus-visible{outline:3px solid #1d4ed8;outline-offset:-3px;z-index:6}
.mc-big{background:#fcf4e1;box-shadow:inset 0 0 0 1px rgba(150,110,50,.2)}
.mc-w{z-index:1}
.mc-wh{background:linear-gradient(180deg,#bd864e,#9a6534 55%,#7a4d25);box-shadow:0 2px 2px rgba(70,40,10,.32)}
.mc-wv{background:linear-gradient(90deg,#bd864e,#9a6534 55%,#7a4d25);box-shadow:0 2px 2px rgba(70,40,10,.32)}
.mc-wp{background:#96622f;box-shadow:0 2px 2px rgba(70,40,10,.32)}
.mc-hm{background-image:radial-gradient(ellipse 42% 30% at 50% 66%,#cf5f53 0,#cf5f53 76%,#8e2f27 80%,#8e2f27 97%,transparent 100%)}
.mc-st{background-image:radial-gradient(ellipse 42% 30% at 50% 66%,#e2c594 0,#e2c594 76%,#a9824e 80%,#a9824e 97%,transparent 100%)}
.mc-cr::after{content:"";width:27%;aspect-ratio:1;border-radius:46% 54% 50% 42%;background:radial-gradient(circle at 35% 30%,#ffd76a,#e09a17 72%);box-shadow:0 0 0 1.5px #8a5300;position:relative;z-index:1}
.mc-nx.mc-cr::after{width:48%}
.mc-ch{background-image:radial-gradient(circle,#fff0a8 0,#fff0a8 38%,rgba(255,240,168,0) 70%)}
.mc-s>svg{position:absolute;pointer-events:none}
.mc-ch>svg{width:80%;height:80%;left:10%;top:10%}
.mc-go{z-index:3;background-color:#fff1b5;box-shadow:inset 0 0 0 2px rgba(196,132,28,.55)}
.mc-go::before{content:"";position:absolute;inset:0}
.mc-gr::before{right:-100%}.mc-gl::before{left:-100%}.mc-gu::before{top:-100%}.mc-gd::before{bottom:-100%}
.mc-me,.mc-cat{z-index:4}
.mc-me>svg,.mc-cat>svg{width:106%;height:106%;left:-3%;top:-3%;filter:drop-shadow(0 1.5px 1px rgba(60,35,10,.4))}
.mc-nx.mc-me>svg,.mc-nx.mc-cat>svg{width:192.7%;left:-46.4%}
.mc-ny.mc-me>svg,.mc-ny.mc-cat>svg{height:192.7%;top:-46.4%}
.mc-nr{background-image:radial-gradient(circle,rgba(238,150,30,.6) 0,rgba(238,150,30,.6) 42%,rgba(238,150,30,0) 72%)}
.mc-nr .mc-ln{transform:scale(1.07);transform-origin:20px 38px}
.mc-pp{transform:translate(var(--lx,0px),var(--ly,0px))}
.mm-w,.mm-h,.mm-s{display:none}
.mc-wry .mm-w{display:inline}
.mc-joy .mm-e,.mc-sad .mm-e{display:none}
.mc-joy .mm-h,.mc-sad .mm-s{display:inline}
.mc-fl .mm-t{transform:scaleX(-1);transform-origin:20px 20px}
.mc-pf{transform-box:fill-box;transform-origin:center;opacity:.85}
.mc-pad{display:grid;grid-template-columns:repeat(3,72px);grid-template-rows:repeat(2,60px);gap:8px;justify-content:center;margin:14px 0 0;direction:ltr}
.mc-pad .gk-btn{min-width:0;padding:0}
@keyframes mc-hop{from{transform:translate(var(--hx,0%),var(--hy,0%))}to{transform:none}}
@keyframes mc-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7%)}}
@keyframes mc-glow{0%,100%{opacity:.35}50%{opacity:.9}}
@keyframes mc-puff{0%{opacity:.9;transform:scale(.6)}100%{opacity:0;transform:scale(1.6)}}
@keyframes mc-joy{0%,100%{transform:translateY(0)}50%{transform:translateY(-6%)}}
@media (prefers-reduced-motion:no-preference){
.mc-fr{transition:box-shadow .3s}
.mc-bar i{transition:width .3s}
.mc-hop>svg{animation:mc-hop .2s ease-out}
.mc-ch>svg{animation:mc-bob 3s ease-in-out infinite;animation-delay:var(--mc-t,0s)}
.mc-eg{animation:mc-glow 1.5s ease-in-out infinite;animation-delay:var(--mc-t,0s)}
.mc-pf{animation:mc-puff 1.5s ease-out infinite;animation-delay:var(--mc-t,0s)}
.mc-win .mc-me>svg{animation:mc-joy 1.5s ease-in-out infinite;animation-delay:var(--mc-t,0s)}
}`
  });
}
function _mcReset(gs) {
  gs.pl = gs.start;
  gs.cats = gs.catStart.slice();
  gs.scared = 0;
}
function _mcNext(gs, from, to) {
  const prev = new Map([[
        from,
        -1
      ]]), q = [from];
  for (let h = 0; h < q.length; h++) {
    const i = q[h];
    if (i === to)
      break;
    for (const d of [
        1,
        -1,
        gs.W,
        -gs.W
      ]) {
      const j = i + d;
      if (!gs.g[j] && !prev.has(j)) {
        prev.set(j, i);
        q.push(j);
      }
    }
  }
  if (!prev.has(to))
    return from;
  let i = to;
  while (prev.get(i) !== from && prev.get(i) !== -1)
    i = prev.get(i);
  return i;
}
function mcStep(d) {
  const gs = gameState.muncher;
  if (gs.over || !d)
    return;
  const n = gs.pl + d;
  if (gs.g[n])
    return;
  gs.pl = n;
  gs.steps++;
  let said = '';
  if (gs.crumb.delete(n)) {
    if (typeof sfxFlip === 'function' && gs.crumb.size % 6 === 0)
      sfxFlip();
  }
  if (gs.cheese.delete(n)) {
    gs.scared = 8;
    said = ' Cheese! The cats run home.';
    if (typeof sfxCorrect === 'function')
      sfxCorrect();
  }
  if (!gs.crumb.size) {
    gs.over = true;
    gs.msg = 'Every crumb eaten. What a feast!';
    NK.render('muncher');
    return NK.finish('muncher', true, `All ${ gs.total } crumbs eaten in ${ gs.steps } steps with ${ NK.pl(gs.lives, 'life', 'lives') } left.`);
  }
  if (_mcHit(gs))
    return;
  const moveCats = gs.diff === 'hard' ? gs.steps % 2 === 0 : gs.diff === 'easy' ? gs.steps % 3 === 0 : gs.steps % 2 === 0;
  if (moveCats)
    gs.cats = gs.cats.map((c, k) => {
      if (gs.scared)
        return _mcNext(gs, c, gs.catStart[k]);
      if (Math.random() < (gs.diff === 'easy' ? 0.5 : gs.diff === 'hard' ? 0.3 : 0.35)) {
        const opts = [
          1,
          -1,
          gs.W,
          -gs.W
        ].map(x => c + x).filter(j => !gs.g[j]);
        return opts[Math.floor(Math.random() * opts.length)];
      }
      return _mcNext(gs, c, gs.pl);
    });
  if (gs.scared)
    gs.scared--;
  if (_mcHit(gs))
    return;
  const near = gs.cats.some(c => Math.abs(c % gs.W - gs.pl % gs.W) + Math.abs(Math.floor(c / gs.W) - Math.floor(gs.pl / gs.W)) <= 2);
  gs.msg = `${ gs.crumb.size } crumbs left.${ said }${ gs.scared ? ` Cats scared for ${ gs.scared } more steps.` : near ? ' A cat is close!' : '' }`;
  NK.render('muncher');
}
function _mcHit(gs) {
  const k = gs.cats.indexOf(gs.pl);
  if (k < 0)
    return false;
  if (gs.scared) {
    gs.cats[k] = gs.catStart[k];
    gs.msg = 'You chased a scared cat all the way home!';
    NK.render('muncher');
    return true;
  }
  gs.lives--;
  gs.caught++;
  if (typeof sfxWrong === 'function')
    sfxWrong();
  if (!gs.lives) {
    gs.over = true;
    gs.msg = 'Caught one time too many.';
    NK.render('muncher');
    NK.finish('muncher', false, `The cats won this time, with ${ gs.crumb.size } of ${ gs.total } crumbs left. A new pantry is one tap away.`);
    return true;
  }
  _mcReset(gs);
  gs.msg = `A cat caught the mouse! ${ NK.pl(gs.lives, 'life', 'lives') } left. Back to the start; your eaten crumbs stay eaten.`;
  NK.render('muncher');
  return true;
}
function mcTap(i) {
  const gs = gameState.muncher, d = i - gs.pl;
  if ([
      1,
      -1,
      gs.W,
      -gs.W
    ].includes(d) && (Math.abs(d) !== 1 || Math.floor(i / gs.W) === Math.floor(gs.pl / gs.W)))
    mcStep(d);
}
function mcNew() {
  initMuncher();
}
const _MC_MOUSE = '<svg viewBox="0 0 40 40" aria-hidden="true">' + '<path class="mm-t" d="M30 33q8 0 6.5-9" fill="none" stroke="#3f342d" stroke-width="4.2" stroke-linecap="round"/><path class="mm-t" d="M30 33q8 0 6.5-9" fill="none" stroke="#e7a3a0" stroke-width="2.2" stroke-linecap="round"/>' + '<circle cx="10.5" cy="13" r="7.6" fill="#bdb1a5" stroke="#3f342d" stroke-width="1.6"/><circle cx="10.5" cy="13" r="4.2" fill="#f4bdb8"/>' + '<circle cx="29.5" cy="13" r="7.6" fill="#bdb1a5" stroke="#3f342d" stroke-width="1.6"/><circle cx="29.5" cy="13" r="4.2" fill="#f4bdb8"/>' + '<ellipse cx="20" cy="26" rx="13" ry="11.5" fill="#cdc2b6" stroke="#3f342d" stroke-width="1.6"/><ellipse cx="20" cy="31.4" rx="7.5" ry="5.2" fill="#f3ece3"/>' + '<g class="mm-w"><circle cx="15" cy="22.5" r="3.7" fill="#fff" stroke="#3f342d" stroke-width=".9"/><circle cx="25" cy="22.5" r="3.7" fill="#fff" stroke="#3f342d" stroke-width=".9"/></g>' + '<g class="mm-e"><g class="mc-pp"><circle cx="15" cy="22.5" r="2.4" fill="#1f1a17"/><circle cx="25" cy="22.5" r="2.4" fill="#1f1a17"/><circle cx="15.8" cy="21.7" r=".8" fill="#fff"/><circle cx="25.8" cy="21.7" r=".8" fill="#fff"/></g></g>' + '<path class="mm-h" d="M12.6 23.4q2.4-3.2 4.8 0M22.6 23.4q2.4-3.2 4.8 0M17.4 31q2.6 2.2 5.2 0" fill="none" stroke="#1f1a17" stroke-width="1.6" stroke-linecap="round"/>' + '<path class="mm-s" d="M12.6 22q2.4 3 4.8 0M22.6 22q2.4 3 4.8 0" fill="none" stroke="#1f1a17" stroke-width="1.6" stroke-linecap="round"/>' + '<path d="M16.5 28.4l-8-1.5M16.5 29.6l-8 1.6M23.5 28.4l8-1.5M23.5 29.6l8 1.6" fill="none" stroke="#3f342d" stroke-width=".8" stroke-linecap="round"/>' + '<ellipse cx="20" cy="27.6" rx="2.2" ry="1.8" fill="#e06f84" stroke="#3f342d" stroke-width=".8"/></svg>';
const _mcCat = (sc, near, k) => {
  const O = '#3b2415', P = sc ? [
      '#bcd0e6',
      '#8ea9c8',
      '#f1f6fb'
    ] : [
      [
        '#e8903f',
        '#b9621d',
        '#fde6c8'
      ],
      [
        '#99a0a8',
        '#646b73',
        '#f0f2f4'
      ],
      [
        '#9a6a48',
        '#63402a',
        '#f3e0cc'
      ]
    ][k % 3 || 0];
  const eye = x => sc ? `<circle cx="${ x }" cy="15" r="3.3" fill="#fff" stroke="${ O }" stroke-width="1"/><circle cx="${ x }" cy="15" r="1.2" fill="#1f1a17"/>` : `${ near ? `<circle class="mc-eg" cx="${ x }" cy="15" r="4.8" fill="#ffd21f" opacity=".6"/>` : '' }<ellipse cx="${ x }" cy="15" rx="2.8" ry="3.1" fill="${ near ? '#ffe24a' : '#f6efc2' }" stroke="${ O }" stroke-width="1"/><ellipse class="mc-pp" cx="${ x }" cy="15" rx="1.2" ry="2.3" fill="#1f1a17"/>`;
  return '<svg viewBox="0 0 40 40" aria-hidden="true">' + (sc ? '<circle class="mc-pf" cx="5" cy="36" r="3.4" fill="#eadfc8" stroke="#b59f7c" stroke-width=".8"/><circle class="mc-pf" cx="35.5" cy="35" r="2.8" fill="#eadfc8" stroke="#b59f7c" stroke-width=".8"/><circle class="mc-pf" cx="9" cy="32.5" r="2.1" fill="#eadfc8" stroke="#b59f7c" stroke-width=".8"/>' : '') + '<g class="mc-ln">' + `<path d="M29 35q9-1 6-11" fill="none" stroke="${ O }" stroke-width="5.6" stroke-linecap="round"/><path d="M29 35q9-1 6-11" fill="none" stroke="${ P[1] }" stroke-width="3.2" stroke-linecap="round"/>` + `<ellipse cx="20" cy="30" rx="10.5" ry="8.5" fill="${ P[0] }" stroke="${ O }" stroke-width="1.6"/><ellipse cx="20" cy="32" rx="5" ry="5.4" fill="${ P[2] }"/>` + `<ellipse cx="15.5" cy="37.2" rx="3.4" ry="2" fill="${ P[2] }" stroke="${ O }" stroke-width="1.2"/><ellipse cx="24.5" cy="37.2" rx="3.4" ry="2" fill="${ P[2] }" stroke="${ O }" stroke-width="1.2"/>` + (sc ? `<path d="M10 13L4.5 7l10.5 1zM30 13l5.5-6L25 8z" fill="${ P[0] }" stroke="${ O }" stroke-width="1.6" stroke-linejoin="round"/>` : `<path d="M10 12l.5-9.5L18 7.5zM30 12l-.5-9.5L22 7.5z" fill="${ P[0] }" stroke="${ O }" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 9.5l.2-4L15.5 8zM28 9.5l-.2-4L24.5 8z" fill="#f2a9a0"/>`) + `<ellipse cx="20" cy="15.5" rx="11" ry="9.5" fill="${ P[0] }" stroke="${ O }" stroke-width="1.6"/>` + `<path d="M20 7v3.6M16.4 7.8l.7 3M23.6 7.8l-.7 3" fill="none" stroke="${ P[1] }" stroke-width="1.7" stroke-linecap="round"/>` + `<ellipse cx="20" cy="20.2" rx="5" ry="3.5" fill="${ P[2] }"/>` + eye(15.2) + eye(24.8) + `<path d="M14.5 20l-6-1M14.5 21.2l-6 1.4M25.5 20l6-1M25.5 21.2l6 1.4" fill="none" stroke="${ O }" stroke-width=".8" stroke-linecap="round"/>` + `<path d="M18.7 18.6h2.6L20 20.3z" fill="#d9697a" stroke="${ O }" stroke-width=".5" stroke-linejoin="round"/>` + (sc ? `<ellipse cx="20" cy="22.3" rx="1.3" ry="1.5" fill="${ O }"/>` : `<path d="M20 20.3q-1.6 2-3.4.8M20 20.3q1.6 2 3.4.8" fill="none" stroke="${ O }" stroke-width="1.1" stroke-linecap="round"/>`) + '</g></svg>';
};
function _mcView(gs) {
  const W = gs.W, H = gs.H, X = i => i % W, Y = i => Math.floor(i / W), sg = v => (v > 0) - (v < 0);
  const mem = _mcView.mem || (_mcView.mem = {
    pl: -1,
    cats: [],
    lx: 0,
    ly: 0,
    f: 1
  });
  const hop = (a, b) => {
    const d = b - a;
    return d === 1 ? '--hx:-34%;--hy:0%;' : d === -1 ? '--hx:34%;--hy:0%;' : d === W ? '--hx:0%;--hy:-34%;' : d === -W ? '--hx:0%;--hy:34%;' : '';
  };
  const live = !gs.over, won = gs.over && !gs.crumb.size, lost = gs.over && !won;
  const dist = c => Math.abs(X(c) - X(gs.pl)) + Math.abs(Y(c) - Y(gs.pl));
  const nearK = gs.cats.map(c => live && !gs.scared && dist(c) <= 2), danger = nearK.some(Boolean);
  const mHop = hop(mem.pl, gs.pl);
  if (mHop) {
    const d = gs.pl - mem.pl;
    mem.lx = Math.abs(d) === 1 ? d : 0;
    mem.ly = Math.abs(d) === 1 ? 0 : sg(d);
    if (mem.lx)
      mem.f = mem.lx;
  }
  let lx = mem.lx, ly = mem.ly;
  if (danger) {
    const c = gs.cats.filter((_, k) => nearK[k]).sort((a, b) => dist(a) - dist(b))[0];
    lx = sg(X(c) - X(gs.pl));
    ly = sg(Y(c) - Y(gs.pl));
  }
  const wedge = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M4 25L27 10l9 8z" fill="#ffe487" stroke="#7a4a05" stroke-width="1.8" stroke-linejoin="round"/><path d="M4 25l32-7v14H4z" fill="#f6bd2b" stroke="#7a4a05" stroke-width="1.8" stroke-linejoin="round"/><circle cx="13" cy="28" r="2.2" fill="#d8961a"/><circle cx="23.5" cy="25.5" r="1.7" fill="#d8961a"/><circle cx="30.5" cy="28.5" r="2" fill="#d8961a"/></svg>';
  const life = '<svg viewBox="0 0 24 20" aria-hidden="true"><circle cx="5.6" cy="6" r="4.8" fill="#bdb1a5" stroke="#3f342d" stroke-width="1.3"/><circle cx="18.4" cy="6" r="4.8" fill="#bdb1a5" stroke="#3f342d" stroke-width="1.3"/><circle cx="5.6" cy="6" r="2.3" fill="#f4bdb8"/><circle cx="18.4" cy="6" r="2.3" fill="#f4bdb8"/><ellipse cx="12" cy="12" rx="8.2" ry="7" fill="#cdc2b6" stroke="#3f342d" stroke-width="1.3"/><circle cx="9" cy="10.6" r="1.4" fill="#1f1a17"/><circle cx="15" cy="10.6" r="1.4" fill="#1f1a17"/><ellipse cx="12" cy="14.4" rx="1.6" ry="1.3" fill="#e06f84"/></svg>';
  let h = '';
  for (let i = 0; i < gs.W * gs.H; i++) {
    const w = gs.g[i], cat = gs.cats.includes(i), me = gs.pl === i, cr = gs.crumb.has(i), ch = gs.cheese.has(i), x = X(i), y = Y(i);
    if (w) {
      const post = x % 2 === 0 && y % 2 === 0;
      let st = '';
      if (post) {
        const U = y === 0 || gs.g[i - W], D = y === H - 1 || gs.g[i + W], L = x === 0 || gs.g[i - 1], R = x === W - 1 || gs.g[i + 1], r = (a, b) => a || b ? '0' : '45%';
        st = ` style="border-radius:${ r(U, L) } ${ r(U, R) } ${ r(D, R) } ${ r(D, L) }"`;
      }
      h += `<span class="mc-s mc-w ${ post ? 'mc-wp' : y % 2 === 0 ? 'mc-wh' : 'mc-wv' }" aria-hidden="true"${ st }></span>`;
      continue;
    }
    const lab = me ? 'the mouse' : cat ? gs.scared ? 'a scared cat' : 'a cat' : cr ? 'crumb' : ch ? 'cheese' : 'empty';
    const k = gs.cats.indexOf(i), d = i - gs.pl, go = live && [
        1,
        -1,
        W,
        -W
      ].includes(d) && (Math.abs(d) !== 1 || y === Y(gs.pl));
    let cls = x % 2 === 0 ? ' mc-nx' : y % 2 === 0 ? ' mc-ny' : ' mc-big', sty = '';
    if (i === gs.start)
      cls += ' mc-st';
    else if (gs.catStart.includes(i))
      cls += ' mc-hm';
    if (go)
      cls += ' mc-go ' + (d === 1 ? 'mc-gr' : d === -1 ? 'mc-gl' : d === W ? 'mc-gd' : 'mc-gu');
    if (me) {
      cls += ' mc-me' + (won ? ' mc-joy' : lost ? ' mc-sad' : danger ? ' mc-wry' : '') + (mem.f < 0 ? ' mc-fl' : '') + (mHop ? ' mc-hop' : '');
      sty = `${ mHop }--lx:${ lx * 1.1 }px;--ly:${ ly * 0.9 }px`;
    } else if (cat) {
      const cHop = hop(mem.cats[k], i), to = gs.scared ? gs.catStart[k] : gs.pl;
      cls += ' mc-cat' + (nearK[k] ? ' mc-nr' : '') + (cHop ? ' mc-hop' : '');
      sty = `${ cHop }--lx:${ sg(X(to) - x) * 1.2 }px;--ly:${ sg(Y(to) - y) * 0.6 }px`;
    }
    h += `<button type="button" class="nk-cell mc-s${ cls }${ cr && !me && !cat ? ' mc-cr' : '' }${ ch && !me && !cat ? ' mc-ch' : '' }" onclick="mcTap(${ i })" data-k="c${ i }"${ me ? ' data-first' : '' } tabindex="-1" aria-label="${ lab }"${ sty ? ` style="${ sty }"` : '' }${ gs.over ? ' disabled' : '' }>${ me ? _MC_MOUSE : cat ? _mcCat(gs.scared, nearK[k], k) : ch ? wedge : '' }</button>`;
  }
  mem.pl = gs.pl;
  mem.cats = gs.cats.slice();
  const lives = [...Array(gs.maxLives).keys()].map(k => `<i class="${ k < gs.lives ? '' : 'mc-off' }">${ life }</i>`).join('');
  const pips = [...Array(8).keys()].map(k => `<i class="${ k < gs.scared ? '' : 'mc-off' }"></i>`).join('');
  const track = `repeat(${ (W - 1) / 2 },minmax(0,.55fr) minmax(0,1fr)) minmax(0,.55fr)`, trackY = `repeat(${ (H - 1) / 2 },minmax(0,.55fr) minmax(0,1fr)) minmax(0,.55fr)`;
  const pad = `<div class="mc-pad" role="group" aria-label="move the mouse"><span></span>${ NK.btn(NK.icon('arrow-up'), `mcStep(-${ gs.W })`, {
    k: 'up',
    label: 'up',
    disabled: gs.over
  }) }<span></span>${ NK.btn(NK.icon('arrow-left'), 'mcStep(-1)', {
    k: 'left',
    label: 'left',
    disabled: gs.over
  }) }${ NK.btn(NK.icon('arrow-down'), `mcStep(${ gs.W })`, {
    k: 'down',
    label: 'down',
    disabled: gs.over
  }) }${ NK.btn(NK.icon('arrow-right'), 'mcStep(1)', {
    k: 'right',
    label: 'right',
    disabled: gs.over
  }) }</div>`;
  return `<div class="nk-top mc-top"><span class="mc-chalk">Crumbs left: <b>${ gs.crumb.size }</b> of ${ gs.total }<i class="mc-bar" aria-hidden="true"><i style="width:${ gs.total ? Math.round((gs.total - gs.crumb.size) / gs.total * 100) : 0 }%"></i></i></span><span class="mc-lv" role="img" aria-label="${ NK.pl(gs.lives, 'life', 'lives') }">Lives ${ lives }</span><span class="mc-stp">Steps: <b>${ gs.steps }</b></span></div>
      <div class="mc-fr${ won ? ' mc-win' : lost ? ' mc-lost' : gs.scared ? ' mc-sd' : danger ? ' mc-dg' : '' }"><div class="mc-sc${ gs.scared && live ? ' mc-on' : '' }" aria-hidden="true">${ pips }</div><div class="mc-in"><div class="mc-b" style="grid-template-columns:${ track };grid-template-rows:${ trackY };--mc-t:-${ Date.now() % 3000 }ms">${ h }</div></div></div>${ pad }
      ${ NK.msg(gs.msg) }
      <div class="gk-btns">${ NK.btn(NK.icon('rotate-ccw') + 'New pantry', 'mcNew()', { k: 'restart' }) }</div>`;
}