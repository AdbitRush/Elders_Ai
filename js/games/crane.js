const _CN_PR = [
  [
    'teddy bear',
    '#b45309'
  ],
  [
    'rubber duck',
    '#facc15'
  ],
  [
    'bouncy ball',
    '#ef4444'
  ],
  [
    'plush star',
    '#a855f7'
  ],
  [
    'toy frog',
    '#22c55e'
  ],
  [
    'little whale',
    '#3b82f6'
  ],
  [
    'kitten',
    '#f97316'
  ],
  [
    'penguin',
    '#334155'
  ]
];
function initCrane() {
  NK.start('crane', {
    setup(gs, diff) {
      gs.diff = diff;
      gs.tok = diff === 'normal' ? 9 : 10;
      gs.goal = diff === 'hard' ? 4 : 3;
      gs.won = [];
      gs.x = 50;
      gs.state = 'idle';
      gs.over = false;
      const kinds = shuffle(_CN_PR.map((p, i) => i));
      gs.pr = [];
      for (let k = 0; k < 6; k++) {
        let x;
        let t = 0;
        do
          x = 20 + Math.random() * 74;
        while (t++ < 80 && gs.pr.some(p => Math.abs(p.x - x) < 13));
        if (gs.pr.some(p => Math.abs(p.x - x) < 13))
          continue;
        gs.pr.push({
          x,
          k: kinds[k % kinds.length],
          w: 0.75 + Math.random() * 0.5
        });
      }
      gs.msg = `Slide the claw over a prize and press Drop. Land ${ gs.goal } prizes with ${ gs.tok } free tokens.`;
    },
    view: _cnView,
    keys: {
      Space: () => cnDrop(),
      KeyD: () => cnDrop()
    },
    arrows(dir) {
      if (dir === 'left' || dir === 'right') {
        cnMove(dir === 'left' ? -1 : 1);
        return true;
      }
      return false;
    },
    rules: gs => [
      'Slide the claw with the arrow buttons (or the arrow keys), then press <b>Drop</b>. Each drop uses one free token.',
      'A prize right under the middle of the claw is grabbed firmly and carried to the chute. A prize caught near the edge of the claw may slip; a miss can nudge a prize a little.',
      'Heavier-looking prizes slip more easily. The shadow under the claw shows exactly where it will come down.',
      `Land <b>${ gs.goal } prizes</b> with your <b>${ gs.tok } tokens</b> to win the round. No money, no clock.`,
      'Keyboard: Left and Right arrows slide the claw, Space or D drops.'
    ],
    css: `.cn-box{position:relative;width:min(100%,28rem,max(20rem,calc((100vh - 430px) * .95)));margin:0 auto;border-radius:20px;padding:12px;background:repeating-linear-gradient(92deg,rgba(255,255,255,.035) 0 3px,rgba(0,0,0,.03) 3px 7px),linear-gradient(160deg,#8f623f,#74492b 55%,#5e3a21);box-shadow:inset 0 0 0 2px #5a3820,inset 0 0 0 5px #c9a55a,inset 0 0 0 6px #7a5a22,0 10px 24px rgba(60,35,15,.28)}
.cn-svg{display:block;width:100%;height:auto;border-radius:10px;background:#f6ead2;box-shadow:0 0 0 2px #c9a55a,0 0 0 3px #6b4a1c;direction:ltr;font-family:inherit}
.cn-won{display:flex;gap:8px;justify-content:center;align-items:stretch;flex-wrap:wrap;margin:12px 0 0;padding:8px 8px 12px;min-height:5.9rem;border-radius:10px;background:linear-gradient(#fcf4e2,#f1dfc0);box-shadow:inset 0 -7px 0 #b8893a,inset 0 -8px 0 #7a5a22,inset 0 2px 5px rgba(60,35,15,.25);font-weight:800;font-size:1rem;line-height:1.15;color:#3a2618}
.cn-won span,.cn-won i{flex:1 1 4.4rem;max-width:6.5rem;min-height:4.6rem;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;text-align:center;border-radius:10px}
.cn-won span svg{display:block;width:3.6rem;height:3.6rem;overflow:visible}
.cn-won i{border:2px dashed #c4a876}
.cn-won .cn-new{animation:cn-pop .4s .85s backwards}
.cn-tok{display:flex;gap:.3rem;justify-content:center;flex-wrap:wrap;margin:10px 0 2px;padding:8px;border-radius:10px;background:rgba(38,21,9,.38);box-shadow:inset 0 2px 4px rgba(0,0,0,.35)}
.cn-tok i{width:1.5rem;height:1.5rem;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fdeeb8,#dcae4c 55%,#a87a26);box-shadow:inset 0 0 0 2px #b8893a,inset 0 0 0 4px rgba(255,243,200,.5),0 1px 2px rgba(0,0,0,.4)}
.cn-tok i.cn-spent{background:none;box-shadow:inset 0 0 0 2px rgba(252,244,226,.28)}
.cn-low i:not(.cn-spent){box-shadow:inset 0 0 0 2px #b8893a,inset 0 0 0 4px rgba(255,243,200,.5),0 0 0 3px #f2b38a}
.cn-ctl{display:flex;justify-content:center;gap:12px;margin:14px 0 0;direction:ltr}
.cn-ctl .gk-btn{min-width:72px;min-height:56px;font-size:1.15rem}
.cn-ctl .gk-primary{min-width:116px}
.cn-slide{animation:cn-slide .16s ease-out}
.cn-a-down{animation:cn-drop .62s ease-in-out}
.cn-a-up{animation:cn-up .78s ease-in-out}
.cn-a-rest{animation:cn-drop .4s ease-out}
.cn-a-cx{animation:cn-cx 1.5s ease-in-out}
.cn-a-cy{animation:cn-cy 1.5s ease-in-out}
.cn-grip{animation:cn-grip .78s ease-in-out}
.cn-open{animation:cn-open .4s ease-out}
.cn-cgrip{animation:cn-cgrip 1.5s linear}
.cn-snug{animation:cn-snug .78s ease-in-out}
.cn-ghost{opacity:0;animation:cn-ghost 1.5s ease-in}
.cn-roll{transform-box:fill-box;transform-origin:50% 100%;animation:cn-roll .7s cubic-bezier(.2,.7,.3,1)}
.cn-fall{animation:cn-fall .55s ease-in}
@keyframes cn-slide{from{transform:translateX(var(--dx))}}
@keyframes cn-drop{from{transform:translateY(var(--dy))}}
@keyframes cn-up{0%,28%{transform:translateY(var(--dy))}}
@keyframes cn-cx{0%{transform:translateX(0)}38%,58%{transform:translateX(var(--dx))}100%{transform:translateX(0)}}
@keyframes cn-cy{0%,62%{transform:translateY(var(--dy))}}
@keyframes cn-grip{0%{transform:rotate(20deg)}28%,100%{transform:rotate(0deg)}}
@keyframes cn-open{0%{transform:rotate(-20deg)}}
@keyframes cn-cgrip{0%,40%{transform:rotate(-20deg)}50%,100%{transform:rotate(0deg)}}
@keyframes cn-snug{0%{transform:translate(var(--dx),var(--dy))}28%,100%{transform:translate(0,0)}}
@keyframes cn-ghost{0%,40%{opacity:1;transform:translateY(0)}58%{opacity:1;transform:translateY(var(--fall))}61%,100%{opacity:0;transform:translateY(var(--fall))}}
@keyframes cn-roll{0%{transform:translateX(var(--dx)) rotate(var(--rot))}}
@keyframes cn-fall{0%{transform:translate(var(--dx),var(--dy))}72%{transform:translate(0,0)}86%{transform:translate(0,-1.6px)}}
@keyframes cn-pop{from{transform:scale(.4);opacity:0}}
@media (prefers-reduced-motion:reduce){.cn-box *{animation:none!important}}`
  });
}
function cnMove(d) {
  const gs = gameState.crane;
  if (gs.over || gs.state !== 'idle')
    return;
  gs.x = Math.max(8, Math.min(96, gs.x + d * 4));
  const p = _cnUnder(gs);
  gs.msg = p ? `Over the ${ _CN_PR[p.k][0] }${ Math.abs(p.x - gs.x) <= 3 ? ', right in the middle' : '' }.` : '';
  NK.render('crane');
}
const _cnUnder = gs => gs.pr.reduce((best, p) => Math.abs(p.x - gs.x) < 9 && (!best || Math.abs(p.x - gs.x) < Math.abs(best.x - gs.x)) ? p : best, null);
function cnDrop() {
  const gs = gameState.crane;
  if (gs.over || gs.state !== 'idle' || !gs.tok)
    return;
  gs.tok--;
  gs.state = 'down';
  gs.msg = 'Down comes the claw...';
  if (typeof sfxFlip === 'function')
    sfxFlip();
  NK.render('crane');
  NK.after(700, () => {
    const p = _cnUnder(gs), off = p ? Math.abs(p.x - gs.x) : 99;
    const firm = gs.diff === 'easy' ? 0.97 : gs.diff === 'hard' ? 0.8 : 0.9, edge = gs.diff === 'easy' ? 0.55 : gs.diff === 'hard' ? 0.2 : 0.35;
    let chance = !p ? 0 : off <= 3 ? firm / p.w : off <= 6 ? edge / p.w : 0.05;
    gs.hold = p && Math.random() < Math.min(0.98, chance) ? p : null;
    gs.state = 'up';
    if (!gs.hold && p) {
      p.x = Math.max(14, Math.min(94, p.x + (p.x >= gs.x ? 1 : -1) * (2 + Math.random() * 4)));
    }
    gs.msg = gs.hold ? `Got the ${ _CN_PR[gs.hold.k][0] }! Lifting...` : p ? `The claw closed ${ off <= 6 ? 'on the edge of' : 'beside' } the ${ _CN_PR[p.k][0] } and it slipped away.` : 'The claw closed on nothing.';
    NK.render('crane');
    NK.after(800, () => {
      if (gs.hold && Math.random() < (gs.diff === 'hard' ? 0.18 : gs.diff === 'normal' ? 0.08 : 0)) {
        gs.msg = `Oh! The ${ _CN_PR[gs.hold.k][0] } slipped on the way up.`;
        gs.hold = null;
      }
      if (gs.hold) {
        gs.pr = gs.pr.filter(x => x !== gs.hold);
        gs.won.push(gs.hold.k);
        gs.msg = `The ${ _CN_PR[gs.hold.k][0] } drops down the chute! ${ gs.won.length } of ${ gs.goal }.`;
        if (typeof sfxCorrect === 'function')
          sfxCorrect();
      } else if (typeof sfxWrong === 'function')
        sfxWrong();
      gs.hold = null;
      gs.state = 'idle';
      if (gs.won.length >= gs.goal) {
        gs.over = true;
        NK.render('crane');
        return NK.finish('crane', true, `${ NK.pl(gs.won.length, 'prize') } landed with ${ NK.pl(gs.tok, 'token') } to spare: ${ gs.won.map(k => _CN_PR[k][0]).join(', ') }.`);
      }
      if (!gs.tok) {
        gs.over = true;
        gs.msg += ' No tokens left.';
        NK.render('crane');
        return NK.finish('crane', false, `${ gs.won.length } of ${ gs.goal } prizes landed. A fresh handful of tokens is one tap away.`);
      }
      if (!gs.pr.length) {
        gs.over = true;
        NK.render('crane');
        return NK.finish('crane', false, 'The box is empty.');
      }
      gs.msg += ` ${ NK.pl(gs.tok, 'token') } left.`;
      NK.render('crane');
    });
  });
}
function cnNew() {
  initCrane();
}
function _cnToy(p, y) {
  const [, col] = _CN_PR[p.k], x = +p.x.toFixed(2), r = +(4.6 * p.w + 1.6).toFixed(2), L = '#3a2618', N = 'stroke="none"';
  const eye = (ex, ey, s) => `<circle cx="${ ex }" cy="${ ey }" r="${ s }" fill="${ L }" ${ N }/><circle cx="${ +(ex + s * 0.35).toFixed(3) }" cy="${ +(ey - s * 0.35).toFixed(3) }" r="${ +(s * 0.36).toFixed(3) }" fill="#fff" ${ N }/>`;
  const eyes = (ex, ey, s = 0.12) => eye(-ex, ey, s) + eye(ex, ey, s);
  const smile = (sy, sw = 0.24) => `<path d="M${ -sw } ${ sy } q${ sw } ${ +(sw * 0.8).toFixed(3) } ${ sw * 2 } 0" fill="none" stroke-width=".08" stroke-linecap="round"/>`;
  const shine = (sx, sy, rx, ry) => `<ellipse cx="${ sx }" cy="${ sy }" rx="${ rx }" ry="${ ry }" fill="#fff" opacity=".3" ${ N }/>`;
  const blush = (bx, by) => `<circle cx="${ -bx }" cy="${ by }" r=".13" fill="#f472b6" opacity=".45" ${ N }/><circle cx="${ bx }" cy="${ by }" r=".13" fill="#f472b6" opacity=".45" ${ N }/>`;
  let a = '';
  switch (p.k) {
  case 0:
    a = `<circle cx="-.68" cy="-1.68" r=".34" fill="${ col }"/><circle cx=".68" cy="-1.68" r=".34" fill="${ col }"/><circle cx="-.68" cy="-1.68" r=".17" fill="#f3d9b1" ${ N }/><circle cx=".68" cy="-1.68" r=".17" fill="#f3d9b1" ${ N }/>` + `<circle cx="0" cy="-1" r="1" fill="${ col }"/>${ shine(-0.38, -1.58, 0.3, 0.15) }` + `<ellipse cx="-.5" cy="-.12" rx=".32" ry=".17" fill="#f3d9b1" stroke-width=".07"/><ellipse cx=".5" cy="-.12" rx=".32" ry=".17" fill="#f3d9b1" stroke-width=".07"/>` + `<ellipse cx="0" cy="-.74" rx=".42" ry=".33" fill="#f3d9b1" stroke-width=".06"/><ellipse cx="0" cy="-.88" rx=".13" ry=".09" fill="${ L }" ${ N }/>${ smile(-0.7, 0.16) }${ eyes(0.4, -1.2) }`;
    break;
  case 1:
    a = `<path d="M-.72 -.95 L-1.12 -1.34 L-.5 -1.15 Z" fill="${ col }"/><path d="M.74 -1.52 Q1.22 -1.5 1.2 -1.33 Q1.1 -1.2 .76 -1.24 Z" fill="#ea8a1a"/>` + `<ellipse cx="-.05" cy="-.6" rx=".98" ry=".6" fill="${ col }"/><circle cx=".28" cy="-1.38" r=".56" fill="${ col }"/>${ shine(0.08, -1.66, 0.2, 0.11) }` + `<path d="M-.58 -.7 Q-.1 -.16 .42 -.62" fill="none" stroke-width=".08" stroke-linecap="round"/>${ eye(0.5, -1.5, 0.11) }`;
    break;
  case 2:
    a = `<circle cx="0" cy="-1" r="1" fill="${ col }"/><path d="M-.98 -1.18 Q0 -.62 .98 -1.18 L.96 -.76 Q0 -.18 -.96 -.76 Z" fill="#fff4dc" stroke-width=".05"/>${ shine(-0.4, -1.58, 0.27, 0.15) }<circle cx="0" cy="-1" r="1" fill="none"/>`;
    break;
  case 3: {
      let pts = '';
      for (let i = 0; i < 10; i++) {
        const an = (-90 + 36 * i) * Math.PI / 180, q = i % 2 ? 0.42 : 0.85;
        pts += `${ (Math.cos(an) * q).toFixed(3) },${ (-1 + Math.sin(an) * q).toFixed(3) } `;
      }
      a = `<polygon points="${ pts }" fill="${ L }" stroke-width=".5"/><polygon points="${ pts }" fill="${ col }" stroke="${ col }" stroke-width=".32"/>${ shine(-0.14, -1.5, 0.16, 0.1) }${ eyes(0.24, -1.04, 0.1) }${ blush(0.42, -0.9) }${ smile(-0.86, 0.15) }`;
      break;
    }
  case 4:
    a = `<ellipse cx="-.62" cy="-.1" rx=".34" ry=".14" fill="${ col }"/><ellipse cx=".62" cy="-.1" rx=".34" ry=".14" fill="${ col }"/><ellipse cx="0" cy="-.72" rx="1" ry=".72" fill="${ col }"/>` + `<ellipse cx="0" cy="-.42" rx=".6" ry=".34" fill="#dcf7c8" opacity=".85" ${ N }/><circle cx="-.46" cy="-1.36" r=".33" fill="${ col }"/><circle cx=".46" cy="-1.36" r=".33" fill="${ col }"/>` + `<circle cx="-.46" cy="-1.36" r=".22" fill="#fff" stroke-width=".05"/><circle cx=".46" cy="-1.36" r=".22" fill="#fff" stroke-width=".05"/>${ eyes(0.46, -1.36, 0.11) }` + `<path d="M-.5 -.86 Q0 -.56 .5 -.86" fill="none" stroke-width=".08" stroke-linecap="round"/>`;
    break;
  case 5:
    a = `<path d="M.72 -.7 Q1 -.95 1 -1.3 Q.82 -1.45 .74 -1.74 Q1.02 -1.7 1.1 -1.48 Q1.22 -1.68 1.42 -1.66 Q1.42 -1.3 1.2 -1.12 Q1.1 -.8 .85 -.5 Z" fill="${ col }"/>` + `<ellipse cx="-.08" cy="-.7" rx=".98" ry=".7" fill="${ col }"/><path d="M-1 -.5 Q-.1 -.28 .82 -.48 Q.5 -.02 -.08 -.02 Q-.7 -.02 -1 -.5 Z" fill="#e3effd" ${ N }/><ellipse cx="-.08" cy="-.7" rx=".98" ry=".7" fill="none"/>` + `${ shine(-0.3, -1.16, 0.3, 0.12) }<path d="M-.3 -1.46 q-.05 -.3 -.3 -.36 M-.3 -1.46 q.05 -.3 .3 -.36" fill="none" stroke="#7fb4e6" stroke-width=".11" stroke-linecap="round"/>` + `${ eye(-0.55, -0.9, 0.11) }<path d="M-.84 -.64 q.16 .17 .38 .05" fill="none" stroke-width=".08" stroke-linecap="round"/>`;
    break;
  case 6:
    a = `<path d="M-.9 -1.3 L-.82 -2.02 L-.25 -1.78 Z" fill="${ col }"/><path d="M.9 -1.3 L.82 -2.02 L.25 -1.78 Z" fill="${ col }"/><path d="M-.76 -1.5 L-.72 -1.82 L-.46 -1.72 Z" fill="#fbcfe8" ${ N }/><path d="M.76 -1.5 L.72 -1.82 L.46 -1.72 Z" fill="#fbcfe8" ${ N }/>` + `<circle cx="0" cy="-.98" r=".98" fill="${ col }"/><path d="M0 -1.9 v.28 M-.26 -1.85 l.04 .25 M.26 -1.85 l-.04 .25" fill="none" stroke="#c2540a" stroke-width=".1" stroke-linecap="round"/>` + `<ellipse cx="0" cy="-.7" rx=".4" ry=".28" fill="#ffedd5" ${ N }/><path d="M-.09 -.87 h.18 l-.09 .1 Z" fill="#e8799a" stroke-width=".04"/>` + `<path d="M0 -.77 q-.1 .16 -.22 .06 M0 -.77 q.1 .16 .22 .06" fill="none" stroke-width=".07" stroke-linecap="round"/><path d="M-.52 -.76 h-.36 M-.52 -.66 l-.34 .08 M.52 -.76 h.36 M.52 -.66 l.34 .08" fill="none" stroke-width=".05" opacity=".7" stroke-linecap="round"/>${ eyes(0.4, -1.14) }`;
    break;
  default:
    a = `<ellipse cx="-.34" cy="-.07" rx=".27" ry=".1" fill="#f59e0b" stroke-width=".06"/><ellipse cx=".34" cy="-.07" rx=".27" ry=".1" fill="#f59e0b" stroke-width=".06"/>` + `<ellipse cx="-.84" cy="-.9" rx=".17" ry=".46" transform="rotate(14 -.84 -.9)" fill="${ col }"/><ellipse cx=".84" cy="-.9" rx=".17" ry=".46" transform="rotate(-14 .84 -.9)" fill="${ col }"/>` + `<ellipse cx="0" cy="-1.02" rx=".82" ry=".96" fill="${ col }"/><path d="M0 -1.64 Q-.62 -1.62 -.56 -.82 Q-.5 -.14 0 -.14 Q.5 -.14 .56 -.82 Q.62 -1.62 0 -1.64 Z" fill="#fdf8ee" ${ N }/>` + `${ shine(-0.42, -1.6, 0.16, 0.1) }${ eyes(0.24, -1.34, 0.1) }<path d="M-.13 -1.18 h.26 l-.13 .17 Z" fill="#f59e0b" stroke-width=".05"/>${ blush(0.36, -1.08) }`;
  }
  return `<g transform="translate(${ x } ${ y }) scale(${ r })" stroke="${ L }" stroke-width=".09" stroke-linejoin="round">${ a }</g>`;
}
function _cnView(gs) {
  const floor = 70, topY = 14, liftY = 26, downY = floor - 14, f = n => +n.toFixed(2);
  const clawY = gs.state === 'idle' ? topY : gs.state === 'down' ? downY : liftY, hold = gs.hold;
  const total = gs.diff === 'normal' ? 9 : 10, wonAll = gs.won.length >= gs.goal, lost = gs.over && !wonAll;
  const rad = w => 4.6 * w + 1.6;
  const sig = [
    gs.tok,
    gs.x,
    gs.state,
    gs.won.length,
    gs.over,
    gs.msg
  ].join('|');
  let m = _cnView.m;
  if (!m || m.sig !== sig) {
    const pv = m && m.tok === gs.tok ? m : null, fx = {};
    if (pv && gs.state === 'idle' && pv.st === 'idle' && pv.n === gs.won.length && pv.x !== gs.x && Math.abs(pv.x - gs.x) <= 4.01)
      fx.slide = pv.x - gs.x;
    if (pv && gs.state === 'idle' && pv.st === 'up') {
      if (gs.won.length > pv.n)
        fx.carry = {
          k: gs.won[gs.won.length - 1],
          w: pv.hw || 1
        };
      else {
        fx.settle = 1;
        if (pv.hi >= 0 && gs.pr[pv.hi])
          fx.fall = pv.hi;
      }
    }
    if (pv && gs.state === 'up' && pv.st === 'down')
      fx.roll = gs.pr.map((p, i) => pv.px[i] === undefined ? 0 : pv.px[i] - p.x);
    m = _cnView.m = {
      sig,
      tok: gs.tok,
      x: gs.x,
      st: gs.state,
      n: gs.won.length,
      px: gs.pr.map(p => p.x),
      hi: hold ? gs.pr.indexOf(hold) : -1,
      hw: hold ? hold.w : 0,
      fx
    };
  }
  const fx = m.fx, under = gs.over ? null : _cnUnder(gs), aim = gs.state === 'idle' && !gs.over;
  const slide = fx.slide ? ` class="cn-slide" style="--dx:${ f(fx.slide) }px"` : '';
  const lamp = wonAll ? 1 : lost ? 0.12 : f(0.35 + 0.45 * gs.tok / total);
  let s = `<defs><linearGradient id="cn-g-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdf6e6"/><stop offset="1" stop-color="#f0dcba"/></linearGradient>` + `<radialGradient id="cn-g-lamp" cx=".5" cy="0" r=".8"><stop offset="0" stop-color="#ffe49a"/><stop offset="1" stop-color="#ffe49a" stop-opacity="0"/></radialGradient>` + `<linearGradient id="cn-g-brass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3d98f"/><stop offset=".5" stop-color="#c99a3c"/><stop offset="1" stop-color="#96701f"/></linearGradient>` + `<linearGradient id="cn-g-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5a36"/><stop offset="1" stop-color="#5c3920"/></linearGradient>` + `<linearGradient id="cn-g-felt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#98b9aa"/><stop offset="1" stop-color="#6f9685"/></linearGradient>` + `<clipPath id="cn-clip"><rect x="-200" y="7" width="500" height="140"/></clipPath></defs>`;
  s += `<rect width="100" height="82" fill="url(#cn-g-wall)"/>`;
  for (let i = 10; i < 100; i += 10)
    s += `<line x1="${ i }" y1="4" x2="${ i }" y2="64" stroke="#e7d3aa" stroke-width=".4"/>`;
  s += `<rect width="100" height="64" fill="url(#cn-g-lamp)" opacity="${ lamp }"/>`;
  s += `<rect width="100" height="4.4" fill="#6f3138"/><rect y="4.1" width="100" height=".6" fill="url(#cn-g-brass)"/>`;
  for (let i = 0; i < gs.goal; i++) {
    const bx = f(50 + (i - (gs.goal - 1) / 2) * 9), on = i < gs.won.length;
    s += (on ? `<circle cx="${ bx }" cy="2.2" r="2.7" fill="#ffe49a" opacity=".45"/>` : '') + `<circle cx="${ bx }" cy="2.2" r="1.45" fill="${ on ? '#ffd768' : '#a98b6a' }" stroke="${ on ? '#b07d12' : '#6b4a2c' }" stroke-width=".35"/>`;
  }
  s += `<rect y="5.6" width="100" height="1.5" fill="url(#cn-g-brass)"/><rect y="6.9" width="100" height=".35" fill="#6b4a1c" opacity=".6"/>`;
  s += `<rect y="63.5" width="100" height="7.5" fill="url(#cn-g-felt)"/><rect y="63.5" width="100" height=".5" fill="#c3d8cc"/>`;
  s += `<rect x="1.6" y="29" width="9.8" height="27.5" rx="1.4" fill="#fcf2dc" stroke="#8c2f39" stroke-width=".6"/><text transform="translate(8.7 42.8) rotate(-90)" text-anchor="middle" font-size="6" font-weight="800" letter-spacing=".4" fill="#8c2f39">CHUTE</text>`;
  s += `<path d="M6.5 58 v5 m-2.4 -2.4 l2.4 2.6 l2.4 -2.6" fill="none" stroke="#8c2f39" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="6.5" cy="67.6" rx="5.6" ry="2.1" fill="#33211a" stroke="url(#cn-g-brass)" stroke-width=".8"/>`;
  s += `<g${ slide }>${ aim ? `<line x1="${ gs.x }" y1="${ topY + 10 }" x2="${ gs.x }" y2="68.4" stroke="#6b4a2c" stroke-width=".5" stroke-dasharray="1.2 1.6" opacity=".45"/>` : '' }<ellipse cx="${ gs.x }" cy="${ floor - 0.8 }" rx="5" ry="1.3" fill="#2b1a0e" opacity=".24"/></g>`;
  gs.pr.forEach(p => {
    if (p === hold)
      return;
    const r = rad(p.w);
    if (aim && p === under)
      s += Math.abs(p.x - gs.x) <= 3 ? `<ellipse cx="${ f(p.x) }" cy="${ floor - 0.7 }" rx="${ f(r + 2.4) }" ry="2.1" fill="#f6c945" opacity=".6" stroke="#a8750f" stroke-width=".6"/>` : `<ellipse cx="${ f(p.x) }" cy="${ floor - 0.7 }" rx="${ f(r + 2.4) }" ry="2.1" fill="none" stroke="#a8750f" stroke-width=".55" stroke-dasharray="1.5 1.4" opacity=".85"/>`;
    s += `<ellipse cx="${ f(p.x) }" cy="${ floor - 0.7 }" rx="${ f(r * 1.05) }" ry="1.2" fill="#2b1a0e" opacity=".17"/>`;
  });
  s += `<rect y="${ floor + 0.4 }" width="100" height="11.6" fill="url(#cn-g-wood)"/><rect y="${ floor + 0.4 }" width="100" height="1" fill="url(#cn-g-brass)"/><circle cx="3" cy="76.6" r=".9" fill="url(#cn-g-brass)"/><circle cx="97" cy="76.6" r=".9" fill="url(#cn-g-brass)"/>`;
  const named = hold || under;
  if (named) {
    const nm = _CN_PR[named.k][0], w = nm.length * 3.25 + 7, cx = f(Math.max(w / 2 + 5, Math.min(95 - w / 2, gs.x)));
    s += `<g${ slide }><rect x="${ f(cx - w / 2) }" y="72.5" width="${ f(w) }" height="8.3" rx="1.6" fill="#fcf2dc" stroke="#a8750f" stroke-width=".5"/><text x="${ cx }" y="78.7" text-anchor="middle" font-size="5.7" font-weight="700" fill="#3a2618">${ nm }</text></g>`;
  }
  gs.pr.forEach((p, i) => {
    if (p === hold)
      return;
    let t = _cnToy(p, floor);
    const dx = fx.roll ? fx.roll[i] : 0;
    if (dx)
      t = `<g class="cn-roll" style="--dx:${ f(dx) }px;--rot:${ dx < 0 ? -38 : 38 }deg">${ t }</g>`;
    else if (fx.fall === i)
      t = `<g class="cn-fall" style="--dx:${ f(gs.x - p.x) }px;--dy:${ f(liftY + 2 * rad(p.w) + 1.5 - floor) }px">${ t }</g>`;
    s += t;
  });
  const open = gs.state === 'idle' || gs.state === 'down';
  const gcl = gs.state === 'up' ? 'cn-grip' : fx.carry ? 'cn-cgrip' : fx.settle ? 'cn-open' : '';
  const finger = `<g transform="rotate(${ open ? 20 : 0 })"><g${ gcl ? ` class="${ gcl }"` : '' }><path d="M0 0 Q-5.4 2.4 -4.8 6.4 L-2.7 10.4" fill="none" stroke="#33282a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M0 0 Q-5.4 2.4 -4.8 6.4 L-2.7 10.4" fill="none" stroke="#9aa1a8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="-2.7" cy="10.4" r="1.05" fill="#33282a"/></g></g>`;
  let cargo = '';
  if (hold) {
    const r = rad(hold.w);
    cargo = `<g class="cn-snug" style="--dx:${ f(hold.x - gs.x) }px;--dy:${ f(floor - (downY + 2 * r + 1.5)) }px">${ _cnToy({
      ...hold,
      x: 0
    }, f(2 * r + 1.5)) }</g>`;
  } else if (fx.carry) {
    const r = rad(fx.carry.w);
    cargo = `<g class="cn-ghost" style="--fall:${ f(67.6 - (liftY + 2 * r + 1.5)) }px">${ _cnToy({
      k: fx.carry.k,
      w: fx.carry.w,
      x: 0
    }, f(2 * r + 1.5)) }</g>`;
  }
  const ycl = gs.state === 'down' ? [
    'cn-a-down',
    topY - downY
  ] : gs.state === 'up' ? [
    'cn-a-up',
    downY - liftY
  ] : fx.carry ? [
    'cn-a-cy',
    liftY - topY
  ] : fx.settle ? [
    'cn-a-rest',
    liftY - topY
  ] : null;
  const xcl = fx.carry ? ` class="cn-a-cx" style="--dx:${ f(6.5 - gs.x) }px"` : slide;
  s += `<g${ xcl }><g clip-path="url(#cn-clip)"><g${ ycl ? ` class="${ ycl[0] }" style="--dy:${ ycl[1] }px"` : '' }>` + `<line x1="${ gs.x }" y1="-90" x2="${ gs.x }" y2="${ clawY }" stroke="#4a3f38" stroke-width=".8"/>` + `<g transform="translate(${ gs.x } ${ clawY })"><path d="M0 0 v8.6" stroke="#4d4548" stroke-width="1.4" stroke-linecap="round"/>${ cargo }${ finger }<g transform="scale(-1 1)">${ finger }</g><rect x="-2.8" y="-2.5" width="5.6" height="3.9" rx="1.1" fill="url(#cn-g-brass)" stroke="#6b4a1c" stroke-width=".5"/></g>` + `</g></g><rect x="${ gs.x - 5 }" y="4.3" width="10" height="5" rx="1.4" fill="#5a4636" stroke="#33211a" stroke-width=".5"/><circle cx="${ gs.x - 3 }" cy="6.3" r="1.15" fill="url(#cn-g-brass)" stroke="#6b4a1c" stroke-width=".3"/><circle cx="${ gs.x + 3 }" cy="6.3" r="1.15" fill="url(#cn-g-brass)" stroke="#6b4a1c" stroke-width=".3"/></g>`;
  s += `<path d="M62 0 H78 L50 82 H34 Z" fill="#fff" opacity=".08"/><path d="M83 0 h5 L60 82 h-5 Z" fill="#fff" opacity=".07"/><rect x=".6" y=".6" width="98.8" height="80.8" rx="2" fill="none" stroke="#fff" stroke-width=".5" opacity=".3"/>`;
  if (lost)
    s += `<rect width="100" height="82" fill="#2b1a0e" opacity=".14"/>`;
  let shelf = gs.won.map((k, i) => `<span${ fx.carry && i === gs.won.length - 1 ? ' class="cn-new"' : '' }><svg viewBox="-8 -14.5 16 15.5" aria-hidden="true">${ _cnToy({
    k,
    w: 1,
    x: 0
  }, 0) }</svg>${ _CN_PR[k][0] }</span>`).join('');
  for (let i = gs.won.length; i < gs.goal; i++)
    shelf += '<i aria-hidden="true"></i>';
  let coins = '';
  for (let i = 0; i < total; i++)
    coins += i < gs.tok ? '<i></i>' : '<i class="cn-spent"></i>';
  const busy = gs.over || gs.state !== 'idle';
  return `<div class="nk-top"><span>Tokens: <b>${ gs.tok }</b></span><span>Prizes: <b>${ gs.won.length }</b> of ${ gs.goal }</span></div>
      <div class="cn-box"><svg class="cn-svg" viewBox="0 0 100 82" role="img" aria-label="claw at ${ Math.round(gs.x) } percent across; prizes at ${ gs.pr.map(p => Math.round(p.x)).join(', ') } percent">${ s }</svg>
      <div class="cn-won">${ shelf }</div>
      <div class="cn-tok${ gs.tok <= 2 && !wonAll ? ' cn-low' : '' }" aria-hidden="true">${ coins }</div></div>
      <div class="cn-ctl">${ NK.btn(NK.icon('arrow-left'), 'cnMove(-1)', {
    k: 'left',
    label: 'slide left',
    disabled: busy
  }) }${ NK.btn('Drop', 'cnDrop()', {
    k: 'drop',
    cls: 'gk-primary',
    disabled: busy || !gs.tok
  }) }${ NK.btn(NK.icon('arrow-right'), 'cnMove(1)', {
    k: 'right',
    label: 'slide right',
    disabled: busy
  }) }</div>
      ${ NK.msg(gs.msg) }
      <div class="gk-btns">${ NK.btn(NK.icon('rotate-ccw') + 'New round', 'cnNew()', { k: 'restart' }) }</div>`;
}