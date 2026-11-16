(function () {
  const RANKS = [
    '',
    'A',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K'
  ];
  const SUITS = [
    '\u2660',
    '\u2665',
    '\u2666',
    '\u2663'
  ];
  const isRed = s => s === 1 || s === 2;
  const TXT = '︎';
  function deck(opts) {
    opts = opts || {};
    const suits = opts.suits || [
        0,
        1,
        2,
        3
      ], copies = opts.copies || 1, out = [];
    for (let k = 0; k < copies; k++)
      for (const s of suits)
        for (let r = 1; r <= 13; r++)
          out.push({
            r,
            s,
            up: false,
            id: out.length
          });
    return shuffle(out);
  }
  function card(c, o) {
    o = o || {};
    const on = o.onclick ? ` onclick="${ o.onclick }"` : '';
    if (!c)
      return `<div class="gk-slot${ o.cls ? ' ' + o.cls : '' }"${ on }>${ o.label || '' }</div>`;
    if (o.down || !c.up)
      return `<div class="gk-card gk-down${ o.cls ? ' ' + o.cls : '' }"${ on } aria-label="face-down card"></div>`;
    const red = isRed(c.s) ? ' gk-red' : '';
    const sel = o.sel ? ' gk-sel' : '', hint = o.hint ? ' gk-hint' : '';
    const label = RANKS[c.r] + (o.rankOnly ? '' : SUITS[c.s]);
    return `<div class="gk-card gk-up${ red }${ sel }${ hint }${ o.cls ? ' ' + o.cls : '' }"${ on } aria-label="${ label }">` + `<span class="gk-tl"><span class="gk-r">${ RANKS[c.r] }</span>${ o.rankOnly ? '' : `<span class="gk-ts">${ SUITS[c.s] }${ TXT }</span>` }</span>` + (o.rankOnly ? '' : `<span class="gk-s">${ SUITS[c.s] }${ TXT }</span>`) + `</div>`;
  }
  function finish(id, win, text) {
    if (!gameState.active || gameState.currentId !== id)
      return;
    gameState[id]._outcome = {
      win: !!win,
      text: text || ''
    };
    setTimeout(() => {
      if (gameState.active && gameState.currentId === id)
        levelComplete();
    }, win ? 500 : 900);
  }
  const btn = (label, onclick, o) => (css(), `<button type="button" class="gk-btn${ o && o.cls ? ' ' + o.cls : '' }" onclick="${ onclick }"${ o && o.disabled ? ' disabled' : '' }${ o && o.id ? ` id="${ o.id }"` : '' }>${ label }</button>`);
  const icon = n => typeof Icon !== 'undefined' ? Icon.ui(n) + ' ' : '';
  const svg = s => `url("data:image/svg+xml,${ encodeURIComponent(s) }")`;
  const FELT = svg('<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'.9\' numOctaves=\'2\' stitchTiles=\'stitch\'/><feColorMatrix values=\'0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(#n)\' opacity=\'.5\'/></svg>');
  const BACK = svg('<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\'><rect width=\'20\' height=\'20\' fill=\'#7a1828\'/><path d=\'M-1-1L21 21M21-1L-1 21\' stroke=\'#d9b163\' stroke-width=\'1.7\'/><g fill=\'#f0cf86\'><circle cx=\'10\' cy=\'0\' r=\'1.7\'/><circle cx=\'10\' cy=\'20\' r=\'1.7\'/><circle cx=\'0\' cy=\'10\' r=\'1.7\'/><circle cx=\'20\' cy=\'10\' r=\'1.7\'/></g></svg>');
  function css() {
    if (document.getElementById('gk-css'))
      return;
    const st = document.createElement('style');
    st.id = 'gk-css';
    st.textContent = `
.gk-table,.gk-wood{--w:clamp(46px,11.5vw,96px);width:100%;box-sizing:border-box}
/* the felt table. background is !important on purpose: adding gk-table to a board that still carries its own
   green (inline style or per-game CSS) must win, so every game gets the same felt without touching its code */
.gk-table{background:radial-gradient(ellipse 80% 62% at 50% 30%,rgba(255,255,255,.10),rgba(255,255,255,0) 72%),radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0) 50%,rgba(0,0,0,.36) 100%),${ FELT } #1c6240 !important;border-radius:18px;padding:12px;box-shadow:inset 0 0 0 3px #113b26,inset 0 0 0 4px rgba(255,236,190,.20),inset 0 4px 20px rgba(0,0,0,.45),0 12px 30px -14px rgba(0,0,0,.6);color:#fff7e6}
.gk-wood{background:linear-gradient(160deg,#8a5a2b,#6b4220);border-radius:18px;padding:12px;box-shadow:inset 0 0 0 3px #4d2f15,inset 0 4px 18px rgba(0,0,0,.3),0 12px 30px -14px rgba(0,0,0,.55);color:#fff7e6}
.gk-status{font-size:1.15rem;font-weight:800;text-align:center;min-height:1.6em;margin:6px 0 10px;color:#fff7e6;text-shadow:0 1px 2px rgba(0,0,0,.55)}
.gk-row{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;align-items:flex-start}

/* ---- cards. Size comes only from --w (set by the table default or by GameKit.fit); border stays 2px so no layout moves ---- */
.gk-card,.gk-slot{width:var(--w,clamp(46px,11.5vw,96px));height:calc(var(--w,clamp(46px,11.5vw,96px))*1.4);border-radius:clamp(6px,calc(var(--w,60px)*.17),12px);flex:0 0 auto;position:relative;user-select:none;-webkit-user-select:none;cursor:pointer;-webkit-tap-highlight-color:transparent}
/* face: warm white paper, cream inner border, a dark hairline + layered soft shadows so it reads as a physical card */
.gk-card.gk-up{background:linear-gradient(180deg,#fffefa,#fbf5e6);border:2px solid #eadcb9;color:#17140f;box-shadow:0 0 0 1px rgba(58,40,12,.42),0 1px 1px rgba(0,0,0,.30),0 3px 7px rgba(0,0,0,.30);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;line-height:1;overflow:hidden;font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-variant-numeric:lining-nums}
/* top strip: must stay inside the 0.4 x --w that shows when .gk-col overlaps cards, so it sits tight to the top edge */
.gk-card .gk-tl{display:flex;align-items:baseline;justify-content:center;gap:calc(var(--w,60px)*.02);width:100%;padding-top:0;line-height:.9;white-space:nowrap}
.gk-card .gk-r{font-size:calc(var(--w,60px)*.42);font-weight:800;letter-spacing:-.05em}
.gk-card .gk-ts,.gk-card .gk-s{font-family:'Segoe UI Symbol','Apple Symbols','Noto Sans Symbols2','Noto Sans Symbols','DejaVu Sans','Arial Unicode MS',sans-serif;font-variant-emoji:text;font-weight:400}
.gk-card .gk-ts{font-size:calc(var(--w,60px)*.34)}
/* the big suit fills and centres in whatever is left under the strip */
.gk-card .gk-s{font-size:calc(var(--w,60px)*.72);flex:1 1 auto;display:flex;align-items:center;justify-content:center;margin-top:0;padding-bottom:calc(var(--w,60px)*.05)}
.gk-card.gk-red{color:#b3141c}
/* back: burgundy margin, thin gold frame, gold diamond lattice inside */
.gk-card.gk-down{background:${ BACK } 50% 50%/calc(var(--w,60px)*.24) calc(var(--w,60px)*.24) #7a1828;border:2px solid #f4e6c4;box-shadow:inset 0 0 0 calc(var(--w,60px)*.05) #6d1322,inset 0 0 0 calc(var(--w,60px)*.05 + 1.5px) #e6c275,0 0 0 1px rgba(40,10,10,.5),0 1px 1px rgba(0,0,0,.30),0 3px 7px rgba(0,0,0,.30)}
/* empty place: pressed into the felt */
.gk-slot{border:2px dashed rgba(255,244,214,.62);background:rgba(0,0,0,.17);box-shadow:inset 0 2px 7px rgba(0,0,0,.30);display:flex;align-items:center;justify-content:center;color:rgba(255,247,230,.85);font-weight:800;font-size:calc(var(--w,60px)*.36)}

/* ---- interaction states (transparent outlines turn solid in Windows high-contrast mode, where shadows vanish) ---- */
/* legal-move hint: soft green pulse */
.gk-hint,.gk-card.gk-hint,.gk-slot.gk-hint{outline:3px solid transparent;outline-offset:1px;box-shadow:0 0 0 3px #46e08d,0 0 12px 4px rgba(150,255,190,.6),0 2px 5px rgba(0,0,0,.3);animation:gk-pulse 1.7s ease-in-out infinite}
@keyframes gk-pulse{0%,100%{box-shadow:0 0 0 3px #35d07f,0 0 4px 1px rgba(150,255,190,.30),0 2px 5px rgba(0,0,0,.3)}50%{box-shadow:0 0 0 4px #6bf5ab,0 0 18px 7px rgba(150,255,190,.85),0 2px 5px rgba(0,0,0,.3)}}
/* selected: lifts, warm gold ring and glow */
.gk-sel{transform:translateY(min(-4px,calc(var(--w,60px)*-.09)));outline:3px solid transparent;outline-offset:1px}
.gk-sel,.gk-card.gk-sel,.gk-slot.gk-sel{border-color:#f0a400;box-shadow:0 0 0 3px #ffbe1a,0 0 16px 5px rgba(255,200,60,.75),0 9px 14px rgba(0,0,0,.42);animation:none}
/* keyboard focus: white ring inside a deep-blue ring, obvious on felt, wood and paper alike */
.gk-card:focus-visible,.gk-slot:focus-visible,.gk-btn:focus-visible{outline:4px solid #fff;outline-offset:2px;box-shadow:0 0 0 9px #0b3d91;animation:none}

.gk-btn{min-height:52px;min-width:52px;padding:8px 18px;border-radius:14px;border:2px solid #fde7c4;background:#fff7e6;color:#3b1d0e;font-weight:800;font-size:1.05rem;cursor:pointer;display:inline-flex;align-items:center;gap:6px;justify-content:center;box-shadow:0 2px 0 rgba(0,0,0,.28),0 4px 10px -4px rgba(0,0,0,.4)}
.gk-btn:disabled{opacity:.45;cursor:default}
.gk-btn.gk-primary{background:#f59e0b;border-color:#92400e;color:#2a1700}
.gk-btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:10px 0}
.gk-col{display:flex;flex-direction:column;align-items:center;min-height:calc(var(--w,60px)*1.4)}
.gk-col .gk-card+.gk-card{margin-top:calc(var(--w,60px)*-1.0)}
.gk-col.gk-tight .gk-card+.gk-card{margin-top:calc(var(--w,60px)*-1.12)}
/* tight columns show only 0.28 x --w of a covered card: shrink that strip so the rank is whole instead of cut in half */
.gk-col.gk-tight .gk-card:not(:last-child) .gk-r{font-size:calc(var(--w,60px)*.30)}
.gk-col.gk-tight .gk-card:not(:last-child) .gk-ts{font-size:calc(var(--w,60px)*.25)}
.gk-hand{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
.gk-label{font-size:.95rem;font-weight:800;color:#fde7c4;text-align:center;margin:4px 0;text-shadow:0 1px 2px rgba(0,0,0,.45)}
.gk-big{font-size:1.3rem}
@media (prefers-reduced-motion:reduce){.gk-sel{transform:none}.gk-hint,.gk-card.gk-hint,.gk-slot.gk-hint{animation:none}}`;
    document.head.appendChild(st);
  }
  function fit(sel, cols, gap, max, min) {
    const t = document.querySelector(sel);
    if (!t)
      return;
    const cs = getComputedStyle(t), inner = t.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    t.style.setProperty('--w', Math.max(min || 28, Math.min(max, Math.floor((inner - gap * (cols - 1)) / cols))) + 'px');
  }
  let rz;
  window.addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => {
      if (typeof gameState !== 'undefined' && gameState.active && window['_fitNow_' + gameState.currentId])
        window['_fitNow_' + gameState.currentId]();
    }, 150);
  });
  function keyBlocked(e) {
    if (e.ctrlKey || e.metaKey || e.altKey)
      return true;
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))
      return true;
    const m = document.getElementById('gameMenu');
    if (m && !m.classList.contains('hidden'))
      return true;
    const d = document.getElementById('modal');
    if (d && !d.classList.contains('hidden'))
      return true;
    return false;
  }
  function focusKey(el) {
    const a = document.activeElement;
    if (!a || !el.contains(a))
      return null;
    if (a.getAttribute('role') === 'status')
      return '@status';
    return a.getAttribute('onclick');
  }
  function restoreFocus(el, key) {
    if (!key)
      return;
    const n = key === '@status' ? null : [...el.querySelectorAll('[onclick]')].find(x => x.getAttribute('onclick') === key && !x.disabled);
    if (n) {
      n.focus({ preventScroll: true });
      return;
    }
    const st = el.querySelector('[role="status"]');
    if (st) {
      st.setAttribute('tabindex', '-1');
      st.focus({ preventScroll: true });
    }
  }
  window.GameKit = {
    RANKS,
    SUITS,
    isRed,
    deck,
    card,
    finish,
    btn,
    icon,
    css,
    fit,
    keyBlocked,
    focusKey,
    restoreFocus
  };
}());
(function () {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[c]));
  const T = {
    en: {
      start: 'Start',
      decade: 'Which years?',
      topic: 'Which topic?',
      all: 'All',
      q: 'Question',
      right: 'Right!',
      wrong: 'Not quite.',
      was: 'The answer is',
      next: 'Next',
      last: 'See my score',
      pool: n => `${ n } questions in this mix`
    }
  };
  const L = () => T[currentLang] || T.en;
  const key = it => {
    let h = 0;
    const s = it.q + '|' + it.a;
    for (let i = 0; i < s.length; i++)
      h = h * 31 + s.charCodeAt(i) | 0;
    return (h >>> 0).toString(36);
  };
  const store = {
    get(k, d) {
      try {
        return JSON.parse(localStorage.getItem(k)) || d;
      } catch (e) {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch (e) {
      }
    }
  };
  const cfgs = {};
  const SVG = (cls, body) => `<svg class="${ cls }" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ body }</svg>`;
  const P_OK = 'M5 12.6l4.6 4.6L19 7.4', P_BAD = 'M6.6 6.6l10.8 10.8M17.4 6.6L6.6 17.4';
  const ICON = {
    mark: SVG('qk-mark', `<path class="qk-m-ok" d="${ P_OK }"/><path class="qk-m-bad" d="${ P_BAD }"/>`),
    tick: SVG('qk-tick', `<path d="${ P_OK }"/>`),
    arrow: SVG('qk-arr', '<path d="M8 4.5l11.5 7.5L8 19.5z"/>'),
    pin: SVG('qk-pin', '<ellipse cx="12.6" cy="18.6" rx="6.4" ry="2.4" fill="rgba(60,35,10,.28)"/><circle cx="12" cy="11" r="7.6" fill="#b4472f"/><circle cx="12" cy="11" r="7.6" fill="none" stroke="#7d2c1b" stroke-width="1.4"/><circle cx="9.4" cy="8.3" r="2.3" fill="#eba28c"/>'),
    exOk: SVG('qk-exi', `<circle cx="12" cy="12" r="10.4" class="qk-exi-disc"/><path class="qk-exi-line" d="${ P_OK }"/>`),
    exBad: SVG('qk-exi', `<circle cx="12" cy="12" r="10.4" class="qk-exi-disc"/><path class="qk-exi-line" d="${ P_BAD }"/>`),
    defs: '<svg class="qk-defs" width="0" height="0" aria-hidden="true" focusable="false"><filter id="qk-deckle" x="-4%" y="-8%" width="108%" height="116%"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter></svg>'
  };
  function css() {
    if (document.getElementById('qk-css'))
      return;
    const st = document.createElement('style');
    st.id = 'qk-css';
    st.textContent = `
.qk{width:100%;box-sizing:border-box;max-width:44rem;margin:0 auto;color:var(--w-table-ink,#2b1b0d);position:relative}
.qk *,.qk *::before,.qk *::after{box-sizing:border-box}
.qk button{font-family:inherit;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.qk button:focus-visible{outline:4px solid #1d4f8f;outline-offset:3px}
.qk svg{flex:none}
.qk-defs{position:absolute;width:0;height:0;overflow:hidden;pointer-events:none}

/* top strip: a slim wooden plank with the question number, the score and one pip per question */
.qk-top{display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px 12px;font-weight:800;font-size:1.05rem;line-height:1.2;color:#fff3dc;margin:0 0 20px;padding:10px 14px 12px;border-radius:14px;border:2px solid #4a2c12;background-color:#7a4d29;background-image:repeating-linear-gradient(91deg,rgba(255,236,200,.07) 0 2px,rgba(255,236,200,0) 2px 11px),linear-gradient(180deg,#8d5c34,#6c4223);box-shadow:inset 0 1px 0 rgba(255,236,200,.28),0 3px 8px rgba(50,28,8,.28)}
.qk-num{min-width:0}
.qk-score{justify-self:end;padding:3px 12px;border-radius:999px;background:#fff6e2;border:2px solid #4a2c12;color:var(--w-ok,#1b6e3c);font-weight:900;white-space:nowrap}
.qk-prog{grid-column:1 / -1;display:flex;align-items:center;gap:4px;height:16px}
.qk-pip{flex:1 1 0;min-width:3px;height:8px;border-radius:4px;background:rgba(40,20,5,.5);box-shadow:inset 0 1px 2px rgba(0,0,0,.45)}
.qk-pip.qk-pip-done{background:#f0c869;box-shadow:inset 0 -2px 0 rgba(120,70,10,.35)}
.qk-pip.qk-pip-now{height:16px;background:#fff6e2;box-shadow:0 0 0 2px #4a2c12}

/* question card: cream paper, deckle fringe behind a clean face, soft drop shadow */
.qk-card{position:relative;isolation:isolate;border-radius:16px;padding:26px 20px;font-size:clamp(1.3rem,4.6vw,1.75rem);font-weight:800;line-height:1.4;text-align:center;margin:0 4px 22px;color:#2b1b0d;box-shadow:0 10px 22px rgba(50,28,8,.24),0 2px 5px rgba(50,28,8,.2);overflow-wrap:break-word}
.qk-card::before{content:"";position:absolute;inset:-5px;z-index:-1;border-radius:18px;background:#e6cf9f;filter:url(#qk-deckle)}
.qk-card::after{content:"";position:absolute;inset:0;z-index:-1;border-radius:16px;background-color:#fff6e0;background-image:linear-gradient(180deg,#fffaf0,#fdeecb);box-shadow:inset 0 0 0 1px rgba(170,125,60,.35),inset 0 0 26px rgba(214,170,95,.28)}
.qk-card .qk-sub{display:block;font-size:.72em;font-weight:700;color:#5b3f22;margin-top:8px}
.qk-card img{display:block;margin:0 auto 14px;max-width:100%;max-height:42vh;border-radius:8px;border:6px solid #fffdf7;outline:1px solid #cfb181;background:#efe3cc;box-shadow:0 3px 8px rgba(50,28,8,.25)}
.qk-credit{font-size:.8rem;font-weight:600;color:#5b4326;margin-top:6px}

/* answers: four large numbered buttons, warm muted colours, a solid lower edge that presses in */
.qk-opts{display:grid;gap:14px;counter-reset:qk-n}
@media (min-width:640px){.qk-opts{grid-template-columns:1fr 1fr}}
.qk-opt{--qk-b:#8a6a3a;counter-increment:qk-n;display:flex;align-items:center;gap:12px;width:100%;min-height:64px;margin:0;padding:10px 14px;border-radius:16px;border:3px solid var(--qk-b);background-image:linear-gradient(180deg,rgba(255,255,255,.5),rgba(255,255,255,0) 58%);font-size:1.25rem;font-weight:800;color:var(--w-q-ink,#1f1406);cursor:pointer;text-align:start;line-height:1.25;box-shadow:0 4px 0 var(--qk-b),0 8px 12px rgba(50,28,8,.2)}
.qk-opt:nth-child(4n+1){background-color:var(--w-q1,#f4d68f);--qk-b:var(--w-q1b,#9c6a12)}
.qk-opt:nth-child(4n+2){background-color:var(--w-q2,#cfe0b6);--qk-b:var(--w-q2b,#56773a)}
.qk-opt:nth-child(4n+3){background-color:var(--w-q3,#c8d9e8);--qk-b:var(--w-q3b,#476a8c)}
.qk-opt:nth-child(4n+4){background-color:var(--w-q4,#f0c8b9);--qk-b:var(--w-q4b,#9f5038)}
.qk-opt::before{content:counter(qk-n);flex:none;display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:rgba(255,253,246,.82);border:2px solid var(--qk-b);font-size:1.1rem;font-weight:900;line-height:1}
.qk-lab{flex:1 1 auto;min-width:0;overflow-wrap:anywhere}
.qk-mark{display:none;width:42px;height:42px;padding:6px;border-radius:50%;background:#fffdf6;fill:none;stroke:currentColor;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}
.qk-mark path{display:none}
.qk-opt:not([disabled]):hover{filter:brightness(1.04)}
.qk-opt:not([disabled]):active{transform:translateY(3px);box-shadow:0 1px 0 var(--qk-b),0 2px 4px rgba(50,28,8,.2)}
.qk-opt[disabled]{cursor:default;opacity:.7;box-shadow:none;transform:translateY(2px)}
.qk-opt.qk-ok,.qk-opt.qk-bad{opacity:1;transform:none;background-image:none;color:#fff!important}
.qk-opt.qk-ok::before,.qk-opt.qk-bad::before{display:none}
.qk-opt.qk-ok .qk-mark,.qk-opt.qk-bad .qk-mark{display:block}
.qk-opt.qk-ok{background-color:var(--w-ok,#1b6e3c)!important;border-color:var(--w-ok,#1b6e3c)!important;box-shadow:0 0 0 4px #fff6e0,0 0 0 7px var(--w-ok,#1b6e3c),0 0 22px 8px rgba(120,170,70,.55)}
.qk-opt.qk-ok .qk-mark{color:var(--w-ok,#1b6e3c)}
.qk-opt.qk-ok .qk-m-ok{display:inline}
.qk-opt.qk-bad{background-color:var(--w-bad,#a2382b)!important;border:3px dashed #fff3dc!important;box-shadow:0 0 0 3px var(--w-bad,#a2382b)}
.qk-opt.qk-bad .qk-mark{color:var(--w-bad,#a2382b)}
.qk-opt.qk-bad .qk-m-bad{display:inline}

/* explanation: a note card pinned under the answers */
.qk-ex{position:relative;display:grid;grid-template-columns:auto 1fr;gap:4px 12px;align-items:start;margin:34px 4px 0;background-color:#fffaf0;background-image:linear-gradient(180deg,#fffdf7,#fbefd2);border:2px solid #dcc391;border-inline-start:10px solid var(--w-ok,#1b6e3c);border-radius:6px 14px 14px 6px;padding:22px 16px 16px;font-size:1.15rem;line-height:1.5;color:#2b1b0d;box-shadow:0 8px 16px rgba(50,28,8,.2),0 2px 4px rgba(50,28,8,.18)}
.qk-ex.qk-exbad{border-inline-start-color:var(--w-bad,#a2382b)}
.qk-ex b{grid-column:2;font-size:1.25rem;line-height:1.35}
.qk-ex>div{grid-column:2}
.qk-pin{position:absolute;top:-17px;left:50%;width:34px;height:34px;margin-left:-17px}
.qk-exi{grid-column:1;grid-row:1 / span 2;width:36px;height:36px;margin-top:-2px;color:var(--w-ok,#1b6e3c)}
.qk-exbad .qk-exi{color:var(--w-bad,#a2382b)}
.qk-exi-disc{fill:currentColor}
.qk-exi-line{fill:none;stroke:#fffdf6;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}

/* Next / Start */
.qk-next{display:flex;justify-content:center;margin-top:20px;padding-bottom:6px}
.qk-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:60px;min-width:180px;padding:10px 28px;border-radius:16px;border:3px solid #7c3a0a;background-color:#f0a52b;background-image:linear-gradient(180deg,#f9c765,#e8951c);color:#2a1700;font-weight:900;font-size:1.3rem;line-height:1.2;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 5px 0 #7c3a0a,0 10px 14px rgba(50,28,8,.25)}
.qk-btn:not([disabled]):hover{filter:brightness(1.05)}
.qk-btn:not([disabled]):active{transform:translateY(4px);box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 1px 0 #7c3a0a,0 2px 4px rgba(50,28,8,.25)}
.qk-btn[disabled]{cursor:default;background:#d9cbb2;border:3px dashed #8a7556;color:#5b4a33;box-shadow:none}
.qk-arr{width:20px;height:20px;fill:currentColor}
[dir="rtl"] .qk-arr{transform:scaleX(-1)}
.qk[dir="ltr"] .qk-arr{transform:none}
.qk[dir="rtl"] .qk-arr{transform:scaleX(-1)}

/* picker: a cream board with wooden tags */
.qk-pick{padding:20px 14px 18px;border-radius:20px;border:2px solid #dcc391;background-color:#fff6e0;background-image:linear-gradient(180deg,#fffaf0,#fbecc8);box-shadow:0 10px 22px rgba(50,28,8,.22),0 2px 5px rgba(50,28,8,.18)}
.qk-pick h4{display:flex;align-items:center;gap:12px;font-size:1.3rem;font-weight:900;margin:4px 0 14px;text-align:center;color:#2b1b0d;line-height:1.3}
.qk-pick h4::before,.qk-pick h4::after{content:"";flex:1 1 0;height:2px;border-radius:2px;background:#d3b579}
.qk-chips{display:flex;flex-wrap:wrap;gap:12px 10px;justify-content:center;margin-bottom:22px}
.qk-chip{display:inline-flex;align-items:center;gap:10px;min-height:56px;margin:0;padding:8px 18px 8px 14px;padding-inline:14px 18px;border-radius:10px 14px 14px 10px;border:3px solid #8f6230;background-color:#e9c88f;background-image:repeating-linear-gradient(92deg,rgba(120,75,25,.09) 0 2px,rgba(120,75,25,0) 2px 9px),linear-gradient(180deg,#f3dcae,#e0bb7e);color:#2b1b0d;font-weight:800;font-size:1.15rem;line-height:1.2;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 4px 0 #8f6230,0 7px 10px rgba(50,28,8,.2)}
.qk-chip::before{content:"";flex:none;width:14px;height:14px;border-radius:50%;background:#5b3a17;box-shadow:inset 0 2px 2px rgba(0,0,0,.55),0 1px 0 rgba(255,255,255,.5)}
.qk-tick{display:none;width:24px;height:24px;padding:3px;border-radius:50%;background:#fff6e0;fill:none;stroke:#2b1b0d;stroke-width:3.6;stroke-linecap:round;stroke-linejoin:round}
.qk-chip:hover{filter:brightness(1.04)}
.qk-chip:active{transform:translateY(3px);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 1px 0 #8f6230}
.qk-chip[aria-pressed="true"]{transform:translateY(3px);border-color:#3f2609;background-color:#bd8c4d;background-image:repeating-linear-gradient(92deg,rgba(70,40,10,.12) 0 2px,rgba(70,40,10,0) 2px 9px),linear-gradient(180deg,#b58445,#c6965a);color:#1f1205;font-weight:900;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:4px;box-shadow:inset 0 4px 7px rgba(40,20,0,.5),inset 0 -1px 0 rgba(255,236,200,.35)}
.qk-chip[aria-pressed="true"]::before{display:none}
.qk-chip[aria-pressed="true"] .qk-tick{display:block}
.qk-count{text-align:center;font-weight:700;font-size:1.05rem;color:#5b3f22;margin:-6px 0 4px}

@media (max-width:400px){
  .qk-card{padding:22px 14px;margin-inline:3px}
  .qk-opt{padding:10px 12px;gap:10px}
  .qk-chip{font-size:1.1rem;padding-inline:12px 14px}
  .qk-ex{padding-inline:12px}
}
@media (prefers-reduced-motion:no-preference){
  .qk-opt,.qk-chip,.qk-btn{transition:transform .12s ease,box-shadow .12s ease,filter .12s ease}
  .qk-ex{animation:qk-note .28s ease-out both}
  @keyframes qk-note{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
}
@media (forced-colors:active){
  .qk-opt.qk-ok{outline:4px solid Highlight;outline-offset:2px}
  .qk-chip[aria-pressed="true"]{outline:3px solid Highlight;outline-offset:2px}
}`;
    document.head.appendChild(st);
  }
  function pool(cfg, pick) {
    return cfg.items.filter(it => (!pick.d || pick.d === 'all' || it.d === pick.d) && (!pick.t || pick.t === 'all' || it.t === pick.t));
  }
  function choose(cfg, list, n) {
    const diff = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
    const ok = diff === 'easy' ? [
      1,
      2
    ] : diff === 'hard' ? [
      2,
      3
    ] : [
      1,
      2,
      3
    ];
    const seenK = 'gg_qk_seen_' + cfg.id, seen = new Set(store.get(seenK, []));
    let cand = list.filter(it => ok.includes(it.lv || 2));
    if (cand.length < n)
      cand = list.slice();
    let fresh = cand.filter(it => !seen.has(key(it)));
    if (fresh.length < n) {
      cand.forEach(it => seen.delete(key(it)));
      const last = new Set(store.get(seenK + '_last', []));
      fresh = cand.filter(it => !last.has(key(it)));
      if (fresh.length < n)
        fresh = cand.slice();
    }
    let out = shuffle(fresh.slice());
    if (diff === 'easy')
      out.sort((a, b) => (a.lv || 2) - (b.lv || 2));
    out = shuffle(out.slice(0, n));
    out.forEach(it => seen.add(key(it)));
    store.set(seenK, [...seen].slice(-2000));
    store.set(seenK + '_last', out.map(key));
    return out;
  }
  function start(container, cfg) {
    css();
    cfgs[cfg.id] = cfg;
    const gs = gameState[cfg.id];
    gs.pick = Object.assign({
      d: 'all',
      t: 'all'
    }, store.get('gg_qk_pick_' + cfg.id, {}));
    if (cfg.decades || cfg.topics)
      renderPick(cfg.id);
    else
      go(cfg.id);
    const onKey = e => {
      if (!gameState.active || gameState.currentId !== cfg.id || e.target.closest && e.target.closest('input,select,textarea'))
        return;
      const s = gameState[cfg.id];
      if (s.phase === 'ask' && /^[1-4]$/.test(e.key)) {
        answer(cfg.id, +e.key - 1);
        e.preventDefault();
      } else if (s.phase === 'shown' && (e.key === 'Enter' || e.key === ' ')) {
        next(cfg.id);
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = window._gameCleanup;
    window._gameCleanup = () => {
      document.removeEventListener('keydown', onKey);
      if (prev)
        prev();
    };
  }
  function el() {
    return document.getElementById('gameContent');
  }
  function live(id) {
    return gameState.active && gameState.currentId === id && el();
  }
  function renderPick(id) {
    const cfg = cfgs[id], gs = gameState[id], l = L();
    gs.phase = 'pick';
    if (!live(id))
      return;
    const chips = (list, field, fn) => `<div class="qk-chips">${ [[
        'all',
        l.all
      ]].concat(list).map(([k, lab]) => `<button type="button" class="qk-chip" aria-pressed="${ gs.pick[field] === k }" onclick="QuizKit.setPick('${ id }','${ field }','${ k }')">${ ICON.tick }${ esc(lab) }</button>`).join('') }</div>`;
    const n = pool(cfg, gs.pick).length;
    el().innerHTML = `<div class="qk qk-pick">
      ${ cfg.decades ? `<h4>${ l.decade }</h4>${ chips(cfg.decades, 'd') }` : '' }
      ${ cfg.topics ? `<h4>${ l.topic }</h4>${ chips(cfg.topics, 't') }` : '' }
      <div class="qk-count">${ l.pool(n) }</div>
      <div class="qk-next"><button type="button" class="qk-btn" onclick="QuizKit.go('${ id }')"${ n ? '' : ' disabled' }>${ l.start }${ ICON.arrow }</button></div></div>`;
  }
  function setPick(id, field, k) {
    const gs = gameState[id];
    gs.pick[field] = k;
    if (!pool(cfgs[id], gs.pick).length)
      gs.pick[field === 'd' ? 't' : 'd'] = 'all';
    store.set('gg_qk_pick_' + id, gs.pick);
    renderPick(id);
  }
  function go(id) {
    const cfg = cfgs[id], gs = gameState[id];
    const diff = typeof Difficulty !== 'undefined' ? Difficulty.get() : 'normal';
    const n = (cfg.n || {
      easy: 8,
      normal: 10,
      hard: 12
    })[diff] || 10;
    gs.questions = choose(cfg, pool(cfg, gs.pick || {}), n).map(it => {
      const opts = shuffle([it.a].concat(shuffle(it.w.slice()).slice(0, 3)));
      if (cfg.sortOpts === 'num')
        opts.sort((a, b) => parseFloat(String(a).replace(/[^0-9.]/g, '')) - parseFloat(String(b).replace(/[^0-9.]/g, '')));
      return {
        it,
        opts,
        ans: opts.indexOf(it.a)
      };
    });
    gs.current = 0;
    gs.score = 0;
    render(id);
  }
  function render(id) {
    const cfg = cfgs[id], gs = gameState[id], l = L();
    if (!live(id))
      return;
    if (gs.current >= gs.questions.length) {
      gs.phase = 'done';
      gs._sessionScore = {
        correct: gs.score,
        total: gs.questions.length
      };
      return levelComplete();
    }
    gs.phase = 'ask';
    gs._locked = false;
    const Q = gs.questions[gs.current], it = Q.it;
    const ask = cfg.ask ? cfg.ask(it) : esc(it.q);
    const pips = gs.questions.map((q, k) => `<i class="qk-pip${ k < gs.current ? ' qk-pip-done' : k === gs.current ? ' qk-pip-now' : '' }"></i>`).join('');
    el().innerHTML = `<div class="qk" dir="${ 'ltr' }">${ ICON.defs }
      <div class="qk-top"><span class="qk-num">${ l.q } ${ gs.current + 1 }/${ gs.questions.length }</span><span class="qk-score">✓ ${ gs.score }</span><span class="qk-prog" aria-hidden="true">${ pips }</span></div>
      <div class="qk-card">${ ask }</div>
      <div class="qk-opts">${ Q.opts.map((o, i) => `<button type="button" class="qk-opt" onclick="QuizKit.answer('${ id }',${ i })"><span class="qk-lab">${ esc(o) }</span>${ ICON.mark }</button>`).join('') }</div>
      <div id="qk-after"></div></div>`;
  }
  function answer(id, i) {
    const gs = gameState[id], l = L();
    if (!live(id) || gs.phase !== 'ask' || gs._locked)
      return;
    gs._locked = true;
    gs.phase = 'shown';
    const Q = gs.questions[gs.current], ok = i === Q.ans;
    if (ok) {
      gs.score++;
      if (typeof sfxCorrect === 'function')
        sfxCorrect();
    } else if (typeof sfxWrong === 'function')
      sfxWrong();
    const bs = el().querySelectorAll('.qk-opt');
    bs.forEach((b, k) => {
      b.disabled = true;
      if (k === Q.ans)
        b.classList.add('qk-ok');
      else if (k === i)
        b.classList.add('qk-bad');
    });
    const last = gs.current + 1 >= gs.questions.length;
    const ex = Q.it.x ? `<div>${ esc(Q.it.x) }</div>` : '';
    document.getElementById('qk-after').innerHTML = `<div class="qk-ex${ ok ? '' : ' qk-exbad' }" role="status">${ ICON.pin }${ ok ? ICON.exOk : ICON.exBad }<b>${ ok ? l.right : l.wrong + ' ' + l.was + ' ' + esc(Q.it.a) + '.' }</b>${ ex }</div>
      <div class="qk-next"><button type="button" class="qk-btn" onclick="QuizKit.next('${ id }')">${ last ? l.last : l.next }${ ICON.arrow }</button></div>`;
    const nb = el().querySelector('.qk-next .qk-btn');
    if (nb && nb.scrollIntoView)
      nb.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
  }
  function next(id) {
    const gs = gameState[id];
    if (!live(id) || gs.phase !== 'shown')
      return;
    gs.current++;
    render(id);
    const top = el().querySelector('.qk');
    if (top && top.scrollIntoView && window.scrollY > top.getBoundingClientRect().top + window.scrollY)
      top.scrollIntoView({ block: 'start' });
  }
  const rows = r => r.map(([d, t, lv, q, a, w, x]) => ({
    d,
    t,
    lv,
    q,
    a,
    w,
    x
  }));
  window.QuizKit = {
    start,
    setPick,
    go,
    answer,
    next,
    rows,
    esc
  };
}());