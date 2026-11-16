// ═══════════════════════════════════════════════════════════════════════════
// GAME: JIGSAW PUZZLE (פאזל ג'יקסו) — v4 "loose pieces on a table"
//
// Player feedback drove this version: no tray, no boxed tiles. Real die-cut
// pieces lie scattered on and around the board, a faint copy of the picture is
// printed on the board as a placement guide, and a piece clicks home only when
// it is dropped on its own spot. Anything dropped elsewhere simply stays where
// it was put, ready to be picked up again.
//
// Integration contract (unchanged): initJigsaw(container) is the entry point,
// the game renders into #gameContent, reads currentLang / Difficulty / Icon,
// listens for 'difficulty-changed', and calls sfx*, launchConfetti and
// levelComplete when they exist.
// ═══════════════════════════════════════════════════════════════════════════
var JIGSAW_STATE = {};

// ── Small helpers ──────────────────────────────────────────────────────────
function jigIsHe() {
  return (typeof currentLang !== 'undefined' && currentLang === 'he');
}
function jigIcon(name) {
  try {
    if (typeof Icon !== 'undefined' && Icon && typeof Icon.ui === 'function') return Icon.ui(name) || '';
  } catch (e) {}
  return '';
}
function jigSfx() {
  for (let i = 0; i < arguments.length; i++) {
    const fn = (typeof window !== 'undefined') ? window[arguments[i]] : null;
    if (typeof fn === 'function') { try { fn(); } catch (e) {} return; }
  }
}
function jigClamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

// Hebrew and English, exactly the two languages production shipped; every
// other site language falls back to English, as before.
const JIG_TEXT = {
  en: {
    title: 'Jigsaw Puzzle',
    choose: 'How many pieces?',
    diff: 'Current difficulty',
    diffNames: { easy: 'Easy', normal: 'Normal', hard: 'Hard' },
    img: 'Choose a picture',
    upload: 'Upload a photo',
    camera: 'Take a photo',
    start: 'Start puzzle',
    builtin: 'Or pick a pretty picture:',
    yourPhoto: 'Your photo',
    tip: 'Drag each piece onto the faint picture. It clicks into place in the right spot.',
    tipTap: 'You can also tap a piece, then tap where it goes.',
    tipKeys: 'Keyboard: Tab to a piece, then move it with the arrow keys.',
    hint: 'Hint',
    peek: 'Show picture',
    spread: 'Spread out',
    restart: 'New puzzle',
    newimg: 'Different picture',
    table: 'Puzzle table',
    pieces: 'pieces',
    piece: 'Puzzle piece',
    of: 'of',
    loose: 'not placed yet. Arrow keys move it.',
    placed: 'in place',
    selected: 'Piece picked. Tap where it goes.',
    snapped: 'Piece in place.',
    hintSay: 'This piece goes in row {r}, column {c}.',
    done: 'Puzzle complete! Well done.'
  },
  he: {
    title: 'פאזל ג\'יקסו',
    choose: 'כמה חלקים?',
    diff: 'רמת קושי נוכחית',
    diffNames: { easy: 'קל', normal: 'רגיל', hard: 'קשה' },
    img: 'בחרו תמונה',
    upload: 'העלאת תמונה מהמכשיר',
    camera: 'צילום במצלמה',
    start: 'התחילו!',
    builtin: 'או בחרו תמונה יפה:',
    yourPhoto: 'התמונה שלכם',
    tip: 'גררו כל חלק אל התמונה הדהויה. במקום הנכון הוא ננעל במקומו.',
    tipTap: 'אפשר גם להקיש על חלק ואז להקיש על המקום שלו.',
    tipKeys: 'מקלדת: Tab לבחירת חלק, ומקשי החצים להזזה.',
    hint: 'רמז',
    peek: 'הצגת התמונה',
    spread: 'פיזור החלקים',
    restart: 'פאזל חדש',
    newimg: 'תמונה אחרת',
    table: 'שולחן הפאזל',
    pieces: 'חלקים',
    piece: 'חלק פאזל',
    of: 'מתוך',
    loose: 'עדיין לא במקום. מקשי החצים מזיזים אותו.',
    placed: 'במקום',
    selected: 'החלק נבחר. הקישו על המקום שלו.',
    snapped: 'החלק במקום.',
    hintSay: 'החלק הזה שייך לשורה {r}, עמודה {c}.',
    done: 'הפאזל הושלם! כל הכבוד.'
  }
};
function jigL() { return jigIsHe() ? JIG_TEXT.he : JIG_TEXT.en; }

function initJigsaw(container) {
  const S = JIGSAW_STATE;
  S.pieces = null;   // null = derive from global difficulty; user chips override
  S.img = null;
  S.imgEl = null;
  S.drag = null;
  S.selected = -1;
  S.DEFAULTS = [
    { name: 'Palm beach', he: 'חוף דקלים', file: 'images/jigsaw/bg0.jpg' },
    { name: 'Mountain lake', he: 'אגם הררי', file: 'images/jigsaw/bg1.jpg' },
    { name: 'Tulip field', he: 'שדה צבעונים', file: 'images/jigsaw/bg2.jpg' },
    { name: 'Hot-air balloons', he: 'כדורים פורחים', file: 'images/jigsaw/bg3.jpg' },
    { name: 'Forest path', he: 'שביל ביער', file: 'images/jigsaw/bg4.jpg' },
    { name: 'Colorful houses', he: 'בתים צבעוניים', file: 'images/jigsaw/bg5.jpg' },
    { name: 'Garden path', he: 'שביל בגינה', file: 'images/jigsaw/bg6.jpg' }
  ];
  S.defaultIdx = Math.floor(Math.random() * S.DEFAULTS.length);
  renderSetup(container);
}

// ── Shared styles ──────────────────────────────────────────────────────────
// The game paints its own warm panel with its own ink, so text contrast never
// depends on whatever the host page happens to put behind it. Dark variant
// follows the app's data-theme switch.
function jigsawCss() {
  return `
    .jig-wrap{--jg-bg:#fdf6e9;--jg-ink:#2a1a0c;--jg-ink2:#4a3418;--jg-line:#a97c3f;--jg-card:#ffffff;--jg-hot:#92400e;--jg-hot-ink:#ffffff;
      max-width:1100px;margin:0 auto;padding:14px 12px 16px;background:var(--jg-bg);color:var(--jg-ink);border-radius:18px;
      text-align:center;font-family:inherit;box-sizing:border-box;font-size:1.1rem;line-height:1.4}
    :root[data-theme="dark"] .jig-wrap{--jg-bg:#2a1d13;--jg-ink:#fff6e8;--jg-ink2:#f3e2c7;--jg-line:#a98554;--jg-card:#3a2a1d;--jg-hot:#f6b545;--jg-hot-ink:#2a1700}
    .jig-wrap{width:100%;min-width:0;max-width:100%;overflow-wrap:anywhere}
    .jig-wrap *{box-sizing:border-box;min-width:0}
    .jig-btn,.jig-act{max-width:100%;white-space:normal}
    .jig-preview{width:100%}
    .jig-preview img{height:auto;object-fit:contain}
    .jig-wrap *{box-sizing:border-box}
    .jig-wrap svg{vertical-align:-.15em}
    .jig-setup{max-width:700px}
    .jig-title{font-size:1.7rem;font-weight:800;color:var(--jg-ink);margin-bottom:10px}
    .jig-label{font-size:1.2rem;font-weight:800;color:var(--jg-ink);margin:20px 0 10px}
    .jig-chips{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
    .jig-diffhint{font-size:1rem;color:var(--jg-ink2);margin-top:10px}
    .jig-chip{min-width:64px;min-height:56px;padding:10px 18px;border-radius:9999px;background:var(--jg-card);border:3px solid var(--jg-line);
      color:var(--jg-ink);font:inherit;font-weight:800;font-size:1.3rem;cursor:pointer}
    .jig-chip.active{background:var(--jg-hot);color:var(--jg-hot-ink);border-color:var(--jg-hot)}
    .jig-btns{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
    .jig-btn{min-height:56px;padding:12px 22px;border-radius:14px;font:inherit;font-weight:800;font-size:1.1rem;cursor:pointer;border:none;
      color:#fff;box-shadow:0 3px 10px rgba(0,0,0,.25)}
    .jig-btn-up{background:#1e4f8a}
    .jig-btn-cam{background:#5b21b6}
    .jig-btn-go{background:#166534;font-size:1.35rem;min-height:64px;padding:14px 44px;margin-top:20px}
    .jig-thumbs{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:10px}
    .jig-thumb{padding:0;border-radius:12px;overflow:hidden;border:4px solid transparent;cursor:pointer;background:var(--jg-card);display:block;width:100%}
    .jig-thumb img{width:100%;height:96px;object-fit:cover;display:block}
    .jig-thumb.active{border-color:var(--jg-hot);box-shadow:0 0 0 3px var(--jg-hot)}
    .jig-preview{display:none;margin:14px auto 0;border-radius:14px;overflow:hidden;max-width:320px;border:4px solid var(--jg-hot)}
    .jig-preview img{width:100%;display:block}
    .jig-wrap button:focus-visible{outline:4px solid #ffb300;outline-offset:3px}

    .jig-top{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;justify-content:center}
    .jig-progress{display:flex;align-items:center;gap:10px;flex:1 1 200px;max-width:340px;min-width:0}
    .jig-bar{flex:1;height:14px;background:var(--jg-card);border:2px solid var(--jg-line);border-radius:9999px;overflow:hidden;direction:ltr}
    .jig-fill{height:100%;width:0;background:#15803d;transition:width .3s}
    .jig-count{font-weight:800;font-size:1.25rem;color:var(--jg-ink);white-space:nowrap;direction:ltr}
    .jig-actions{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
    .jig-act{min-height:50px;padding:8px 14px;border-radius:12px;font:inherit;font-weight:800;font-size:1.02rem;cursor:pointer;
      background:var(--jg-card);color:var(--jg-ink);border:3px solid var(--jg-line)}
    .jig-act-a{background:#166534;color:#fff;border-color:#166534}
    .jig-act-b{background:#1e4f8a;color:#fff;border-color:#1e4f8a}
    .jig-act.on{background:var(--jg-hot);color:var(--jg-hot-ink);border-color:var(--jg-hot)}
    .jig-tip{color:var(--jg-ink2);font-size:1.05rem;margin:10px 4px 0}
    .jig-tip .jig-keys{display:none}
    @media (hover:hover) and (pointer:fine){.jig-tip .jig-keys{display:inline}.jig-tip .jig-taps{display:none}}

    /* The table: green felt, the board printed with a faint copy of the picture. */
    .jig-table{position:relative;width:100%;margin:10px auto 0;border-radius:14px;overflow:hidden;direction:ltr;
      background:#1f5a45;background-image:radial-gradient(ellipse at 50% 35%,#2d7a5e 0%,#1f5a45 60%,#17463a 100%);
      box-shadow:inset 0 0 0 3px rgba(0,0,0,.3);user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;
      -webkit-tap-highlight-color:transparent}
    .jig-board{position:absolute;background:#fbf3e4;box-shadow:0 0 0 2px #fff,0 0 0 4px rgba(0,0,0,.5)}
    .jig-guide,.jig-full,.jig-hintcv{position:absolute;left:0;top:0;display:block;pointer-events:none}
    .jig-full{opacity:0;transition:opacity .35s;z-index:100000;box-shadow:0 0 0 2px #fff,0 0 0 4px rgba(0,0,0,.5)}
    .jig-table.peeking .jig-full,.jig-table.solved .jig-full{opacity:1}
    .jig-hintcv{z-index:5;opacity:0}
    .jig-hintcv.on{animation:jigPulse .6s ease-in-out 5 alternate}
    @keyframes jigPulse{from{opacity:.2}to{opacity:1}}
    /* Pieces are canvases cut to shape; the white hairline + dark shadow keep
       them readable on felt, on the guide and on each other. */
    .jig-piece{position:absolute;left:0;top:0;display:block;pointer-events:none;outline:none;
      filter:drop-shadow(0 0 1px rgba(255,255,255,.95)) drop-shadow(0 3px 4px rgba(0,0,0,.6))}
    /* The host theme (warm.css) still styles .jig-piece as the old tray tile:
       html[data-game="jigsaw"] #gameContent .jig-piece{background:#fffdf7;border-color:…}.
       A piece is now a transparent canvas cut to shape, so the box must be
       invisible. Out-specify that selector (1,2,2 vs 1,2,1) and mark the reset
       !important so it holds whatever order the stylesheets load in. */
    html #gameContent .jig-table canvas.jig-piece{background:transparent !important;background-image:none !important;
      border:0 !important;border-radius:0 !important;box-shadow:none !important;padding:0 !important}
    .jig-piece.placed{filter:none}
    .jig-piece.moving{transition:transform .2s ease-out}
    .jig-piece.dragging{filter:drop-shadow(0 0 1px #fff) drop-shadow(0 10px 12px rgba(0,0,0,.7))}
    .jig-piece.selected,.jig-piece.hinted,.jig-piece:focus-visible{filter:drop-shadow(0 0 2px #fff) drop-shadow(0 0 5px #ffc400) drop-shadow(0 0 6px #ffc400)}
    .jig-piece.flash{animation:jigFlash .5s ease-out}
    @keyframes jigFlash{0%{filter:brightness(1.7)}100%{filter:brightness(1)}}
    .jig-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
    @media (max-width:520px){
      .jig-wrap{padding:10px 6px 10px;border-radius:14px}
      .jig-act{padding:8px 11px;font-size:1rem}
      .jig-thumbs{grid-template-columns:repeat(auto-fill,minmax(100px,1fr))}
      .jig-thumb img{height:78px}
    }
    @media (prefers-reduced-motion:reduce){
      .jig-piece.moving,.jig-full,.jig-fill{transition:none}
      .jig-piece.flash{animation:none}
    }`;
}

// ── Setup screen ───────────────────────────────────────────────────────────
function renderSetup(container) {
  const S = JIGSAW_STATE;
  if (!container) return;
  const isHe = jigIsHe();
  const T = jigL();
  // Global difficulty (easy/normal/hard from the main screen) picks the default
  // piece count; the chips let the player override for this round.
  const _diff = (typeof Difficulty !== 'undefined' && Difficulty && typeof Difficulty.get === 'function') ? Difficulty.get() : 'normal';
  const _diffMap = { easy: 6, normal: 12, hard: 48 };
  if (!S.pieces) S.pieces = _diffMap[_diff] || 12;
  if (!JIGSAW_STATE._diffBound) {
    JIGSAW_STATE._diffBound = true;
    document.addEventListener('difficulty-changed', () => {
      const gc = document.getElementById('gameContent');
      if (gc && gc.querySelector('.jig-chips')) { JIGSAW_STATE.pieces = null; renderSetup(gc); }
    });
  }
  const _diffLabel = T.diffNames[_diff] || T.diffNames.normal;
  const diffHint = `${T.diff}: <b>${_diffLabel}</b> · ${T.diffNames.easy} = 6 · ${T.diffNames.normal} = 12 · ${T.diffNames.hard} = 48`;

  const counts = [6, 12, 24, 48, 96];
  let chips = '';
  counts.forEach(c => {
    const on = c === S.pieces;
    chips += `<button type="button" class="jig-chip ${on ? 'active' : ''}" data-n="${c}" aria-pressed="${on}" aria-label="${c} ${T.pieces}" onclick="jigsawSetPieces(${c})">${c}</button>`;
  });

  let thumbs = '';
  S.DEFAULTS.forEach((d, i) => {
    const on = (i === S.defaultIdx && !S.img);
    const nm = isHe ? d.he : d.name;
    thumbs += `<button type="button" class="jig-thumb ${on ? 'active' : ''}" aria-pressed="${on}" aria-label="${nm}" onclick="jigsawPickDefault(${i})">
      <img src="${d.file}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
    </button>`;
  });

  container.innerHTML = `
  <style>${jigsawCss()}</style>
  <div class="jig-wrap jig-setup">
    <div class="jig-title">${jigIcon('puzzle')} ${T.title}</div>
    <div class="jig-label">${T.choose}</div>
    <div class="jig-chips">${chips}</div>
    <div class="jig-diffhint">${diffHint}</div>
    <div class="jig-label">${T.img}</div>
    <div class="jig-btns">
      <button type="button" class="jig-btn jig-btn-up" onclick="jigsawUpload()">${jigIcon('upload')} ${T.upload}</button>
      <button type="button" class="jig-btn jig-btn-cam" onclick="jigsawCamera()">${jigIcon('camera')} ${T.camera}</button>
    </div>
    <div class="jig-preview" id="jigPreview"><img id="jigPreviewImg" alt="${T.yourPhoto}"></div>
    <div class="jig-label">${T.builtin}</div>
    <div class="jig-thumbs">${thumbs}</div>
    <button type="button" class="jig-btn jig-btn-go" onclick="jigsawStart()">${jigIcon('play')} ${T.start}</button>
  </div>`;

  if (S.img) {
    const pv = document.getElementById('jigPreview');
    const im = document.getElementById('jigPreviewImg');
    if (im) im.src = S.img;
    if (pv) pv.style.display = 'block';
  }
}

function jigsawSetPieces(n) {
  JIGSAW_STATE.pieces = n;
  document.querySelectorAll('.jig-chip').forEach(c => {
    const on = parseInt(c.dataset.n, 10) === n;
    c.classList.toggle('active', on);
    c.setAttribute('aria-pressed', String(on));
  });
}
function jigsawPickDefault(i) {
  const S = JIGSAW_STATE;
  S.defaultIdx = i; S.img = null;
  document.querySelectorAll('.jig-thumb').forEach((t, k) => {
    t.classList.toggle('active', k === i);
    t.setAttribute('aria-pressed', String(k === i));
  });
  const pv = document.getElementById('jigPreview'); if (pv) pv.style.display = 'none';
}
function jigsawUpload() {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = () => { if (inp.files && inp.files[0]) jigsawLoadFile(inp.files[0]); };
  inp.click();
}
function jigsawCamera() {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*'; inp.setAttribute('capture', 'environment');
  inp.onchange = () => { if (inp.files && inp.files[0]) jigsawLoadFile(inp.files[0]); };
  inp.click();
}
function jigsawLoadFile(file) {
  if (!file) return;
  const fr = new FileReader();
  fr.onload = e => {
    JIGSAW_STATE.img = e.target.result;
    const pv = document.getElementById('jigPreview');
    const im = document.getElementById('jigPreviewImg');
    if (im) im.src = e.target.result;
    if (pv) pv.style.display = 'block';
    document.querySelectorAll('.jig-thumb').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-pressed', 'false');
    });
  };
  fr.readAsDataURL(file);
}

// ═══ Piece geometry ════════════════════════════════════════════════════════
//
// One normalised jigsaw tab. `u` runs 0→1 along the edge, `v` is perpendicular
// and positive means "sticking out of the piece". Straight run, pinched neck,
// round head, then the mirror image: the waist (0.24 wide) is wider than the
// neck (0.12), which is what makes it read as a real interlocking knob.
//
// The profile is SYMMETRIC about u = 0.5, and that is load-bearing. The two
// pieces meeting at a seam walk it in opposite directions, so an asymmetric
// profile would trace two different curves and the pieces would never mate.
const JIG_TAB = [
  [0.20, 0.00, 0.30, 0.00, 0.38, 0.00],
  [0.42, 0.00, 0.44, 0.06, 0.44, 0.12],
  [0.44, 0.21, 0.36, 0.24, 0.38, 0.32],
  [0.40, 0.41, 0.47, 0.45, 0.50, 0.45],
  [0.53, 0.45, 0.60, 0.41, 0.62, 0.32],
  [0.64, 0.24, 0.56, 0.21, 0.56, 0.12],
  [0.56, 0.06, 0.58, 0.00, 0.62, 0.00],
  [0.70, 0.00, 0.80, 0.00, 1.00, 0.00]
];
const JIG_TAB_H = 0.50;          // crown sits at 0.45 × this ≈ 0.22 of the edge
const JIG_TAB_MAX = 0.45 * JIG_TAB_H;

// Every seam is decided once, and both of its pieces read that one decision.
function jigsawSeams(rows, cols, seed) {
  let s = (seed >>> 0) || 1;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const v = [], h = [];
  for (let r = 0; r < rows; r++) {
    v[r] = [];
    for (let c = 0; c < cols - 1; c++) v[r][c] = rnd() < 0.5 ? 1 : -1;
  }
  for (let r = 0; r < rows - 1; r++) {
    h[r] = [];
    for (let c = 0; c < cols; c++) h[r][c] = rnd() < 0.5 ? 1 : -1;
  }
  return { v, h };
}

// Trace one edge through its own direction and outward normal, so all four
// sides run the same code.
function jigEdge(path, x1, y1, x2, y2, sign) {
  if (!sign) { path.lineTo(x2, y2); return; }
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len;   // along the edge
  const nx = uy, ny = -ux;              // outward, for a clockwise walk with y down
  const h = len * JIG_TAB_H * sign;
  const px = (u, v) => x1 + ux * u * len + nx * v * h;
  const py = (u, v) => y1 + uy * u * len + ny * v * h;
  for (let i = 0; i < JIG_TAB.length; i++) {
    const t = JIG_TAB[i];
    path.bezierCurveTo(px(t[0], t[1]), py(t[0], t[1]),
                       px(t[2], t[3]), py(t[2], t[3]),
                       px(t[4], t[5]), py(t[4], t[5]));
  }
}

// The closed outline of one piece. Outer edges of the puzzle get sign 0, which
// draws them dead straight — a real jigsaw has a flat border.
function jigsawPathFor(r, c, rows, cols, pw, ph, pad, seams) {
  const x0 = pad, y0 = pad, x1 = pad + pw, y1 = pad + ph;
  const top    = r > 0        ? -seams.h[r - 1][c] : 0;
  const right  = c < cols - 1 ?  seams.v[r][c]     : 0;
  const bottom = r < rows - 1 ?  seams.h[r][c]     : 0;
  const left   = c > 0        ? -seams.v[r][c - 1] : 0;
  const p = new Path2D();
  p.moveTo(x0, y0);
  jigEdge(p, x0, y0, x1, y0, top);
  jigEdge(p, x1, y0, x1, y1, right);
  jigEdge(p, x1, y1, x0, y1, bottom);
  jigEdge(p, x0, y1, x0, y0, left);
  p.closePath();
  return p;
}

// ── Build & start ──────────────────────────────────────────────────────────
function jigsawStart() {
  const S = JIGSAW_STATE;
  let imgSrc = S.img;
  if (!imgSrc) imgSrc = S.DEFAULTS[S.defaultIdx].file;

  const img = new Image();
  img.onload = () => { S.imgEl = img; jigsawBegin(); };
  img.onerror = () => {
    // Picture missing or unreadable: still give them a playable puzzle.
    const canvas = document.createElement('canvas');
    canvas.width = 1200; canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 1200, 1200);
    g.addColorStop(0, '#0e5a8a'); g.addColorStop(0.5, '#f4e3c6'); g.addColorStop(1, '#d97706');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1200, 1200);
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(150 + (i % 3) * 450, 150 + Math.floor(i / 3) * 450, 90 + i * 8, 0, Math.PI * 2); ctx.fill(); }
    S.imgEl = canvas;
    jigsawBegin();
  };
  img.src = imgSrc;
}

// Fit the whole picture for this screen and cut a fresh puzzle from it.
// Narrow screens get an upright (3:4) board with the grid turned to match, so
// a 12-piece puzzle on a 390px phone has pieces well over 100px across instead
// of the ~85px a landscape board would allow.
function jigsawBegin() {
  const S = JIGSAW_STATE;
  const container = document.getElementById('gameContent');
  if (!container || !S.imgEl) return;

  const dims = { 6: [2, 3], 12: [3, 4], 24: [4, 6], 48: [6, 8], 96: [8, 12] };
  let rc = dims[S.pieces] || [3, 4];
  let rows = rc[0], cols = rc[1];
  const availW = container.clientWidth || window.innerWidth || 360;
  S.portrait = availW < 620;
  if (S.portrait) { const t = rows; rows = cols; cols = t; }
  S.rows = rows; S.cols = cols;

  const cw = S.portrait ? 900 : 1200, ch = S.portrait ? 1200 : 900;
  const canvas = document.createElement('canvas');
  canvas.width = cw; canvas.height = ch;
  const ctx = canvas.getContext('2d');
  const img = S.imgEl;
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  // Keep every edge of the chosen photo. A narrow board must not crop away
  // people or objects from a landscape upload (and vice versa).
  const scale = Math.min(cw / iw, ch / ih);
  const dw = iw * scale, dh = ih * scale;
  ctx.fillStyle = '#fbf3e4'; ctx.fillRect(0, 0, cw, ch);
  try { ctx.drawImage(img, 0, 0, iw, ih, (cw - dw) / 2, (ch - dh) / 2, dw, dh); } catch (e) {}
  S.srcCanvas = canvas;

  S.seams = jigsawSeams(rows, cols, (Date.now() ^ (rows * 73856093) ^ (cols * 19349663)) >>> 0);
  buildJigsawBoard(container, jigIsHe());
}

function buildJigsawBoard(container, isHe) {
  const S = JIGSAW_STATE;
  if (!container) return;
  const T = jigL();
  const rows = S.rows, cols = S.cols;
  const n = rows * cols;

  S.solved = false; S.placedCount = 0; S.selected = -1; S.drag = null; S.z = 10;
  S.board = new Array(n).fill(null);
  clearTimeout(S._hintT);

  const pieces = [];
  for (let i = 0; i < n; i++) pieces.push({ idx: i, r: Math.floor(i / cols), c: i % cols, x: 0, y: 0, z: 0 });
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = pieces[i]; pieces[i] = pieces[j]; pieces[j] = t;
  }
  S.piecesArr = pieces;

  container.innerHTML = `
  <style>${jigsawCss()}</style>
  <div class="jig-wrap jig-play">
    <div class="jig-top">
      <div class="jig-progress"><span class="jig-count" id="jigCount">0 / ${n}</span><div class="jig-bar"><div class="jig-fill" id="jigFill"></div></div></div>
      <div class="jig-actions">
        <button type="button" class="jig-act" id="jigHelp">${jigIcon('lightbulb')} ${T.hint}</button>
        <button type="button" class="jig-act" id="jigPeek" aria-pressed="false">${jigIcon('eye')} ${T.peek}</button>
        <button type="button" class="jig-act" id="jigSpread">${jigIcon('shuffle')} ${T.spread}</button>
        <button type="button" class="jig-act jig-act-a" onclick="jigsawRestart()">${jigIcon('rotate-ccw')} ${T.restart}</button>
        <button type="button" class="jig-act jig-act-b" onclick="jigsawNewImage()">${jigIcon('camera')} ${T.newimg}</button>
      </div>
    </div>
    <div class="jig-tip">${T.tip} <span class="jig-taps">${T.tipTap}</span><span class="jig-keys">${T.tipKeys}</span></div>
    <div class="jig-table" id="jigTable" role="group" aria-label="${T.table}">
      <div class="jig-board" id="jigBoard"><canvas class="jig-guide" id="jigGuide"></canvas></div>
      <canvas class="jig-hintcv" id="jigHintCv"></canvas>
      <canvas class="jig-full" id="jigFull"></canvas>
    </div>
    <div class="jig-sr" id="jigLive" aria-live="polite"></div>
  </div>`;

  const table = document.getElementById('jigTable');
  const full = document.getElementById('jigFull');
  pieces.forEach((p, si) => {
    const cv = document.createElement('canvas');
    cv.className = 'jig-piece';
    cv.setAttribute('data-piece', String(si));
    cv.setAttribute('role', 'button');
    cv.tabIndex = 0;
    p.el = cv;
    table.insertBefore(cv, full);
    jigsawLabel(p, si);
  });

  jigsawLayout(true);
  wireJigsawEvents();
  jigsawUpdateProgress();
}

function jigsawLabel(p, si) {
  const S = JIGSAW_STATE, T = jigL();
  if (!p || !p.el) return;
  if (si === undefined) si = S.piecesArr.indexOf(p);
  p.el.setAttribute('aria-label', `${T.piece} ${si + 1} ${T.of} ${S.piecesArr.length}, ${p.placed !== undefined ? T.placed : T.loose}`);
}
function jigsawSay(msg) {
  const live = document.getElementById('jigLive');
  if (live) live.textContent = msg;
}

// ── Layout ─────────────────────────────────────────────────────────────────
// Everything is measured from the table's real width, so the same code serves
// a wide desktop (board in the middle, loose pieces down both sides) and a
// phone (board edge to edge, loose pieces on it and in a strip beneath).
function jigsawLayout(scatter) {
  const S = JIGSAW_STATE;
  const table = document.getElementById('jigTable');
  if (!table || !S.piecesArr || !S.srcCanvas) return;
  const rows = S.rows, cols = S.cols;
  const tableW = Math.max(120, Math.floor(table.clientWidth || ((window.innerWidth || 360) - 24)));
  const vh = window.innerHeight || 700;
  const aspect = S.portrait ? 3 / 4 : 4 / 3;       // board width / height
  const edge = 8;
  const side = tableW >= 620;
  let bw = side
    ? Math.min(tableW * 0.6, Math.max(300, vh - 230) * aspect)
    : Math.min(tableW - edge * 2, Math.max(280, vh * 0.62) * aspect);
  // Whole-pixel cells keep every seam crisp.
  const cw = Math.max(10, Math.floor(bw / cols));
  const ch = Math.max(10, Math.floor(bw / aspect / rows));
  bw = cw * cols;
  const bh = ch * rows;
  const pad = Math.ceil(Math.max(cw, ch) * JIG_TAB_MAX) + 3;
  const bx = Math.round((tableW - bw) / 2), by = edge;
  const tableH = side ? bh + edge * 2
                      : bh + edge * 2 + Math.round(Math.max(ch * 1.25, bh * 0.34, 96));
  const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
  const prev = S.m;
  S.m = { tableW, tableH, bx, by, bw, bh, cw, ch, pad, dpr, edge };
  const m = S.m;

  table.style.height = tableH + 'px';
  const board = document.getElementById('jigBoard');
  board.style.left = bx + 'px'; board.style.top = by + 'px';
  board.style.width = bw + 'px'; board.style.height = bh + 'px';

  S.piecesArr.forEach(p => {
    p.path = jigsawPathFor(p.r, p.c, rows, cols, cw, ch, pad, S.seams);
    jigsawDrawPiece(p);
  });
  jigsawDrawGuide();

  if (scatter || !prev) {
    jigsawScatter(false);
  } else {
    // Resize: keep every loose piece at the same relative spot on the table.
    S.piecesArr.forEach(p => {
      if (p.placed === undefined) {
        p.x = (p.x / prev.tableW) * tableW;
        p.y = (p.y / prev.tableH) * tableH;
        jigsawClampPiece(p);
      }
    });
  }
  S.piecesArr.forEach(p => {
    if (p.placed !== undefined) { p.x = bx + p.c * cw; p.y = by + p.r * ch; }
    jigsawPosition(p);
  });
  const hint = document.getElementById('jigHintCv');
  if (hint) hint.classList.remove('on');
}

function jigsawDrawPiece(p) {
  const S = JIGSAW_STATE, m = S.m, cv = p.el;
  const w = m.cw + m.pad * 2, h = m.ch + m.pad * 2;
  cv.width = Math.ceil(w * m.dpr); cv.height = Math.ceil(h * m.dpr);
  cv.style.width = (cv.width / m.dpr) + 'px'; cv.style.height = (cv.height / m.dpr) + 'px';
  const g = cv.getContext('2d');
  g.setTransform(m.dpr, 0, 0, m.dpr, 0, 0);
  const bevel = Math.max(1.2, Math.min(m.cw, m.ch) * 0.02);

  g.save();
  g.clip(p.path);
  g.drawImage(S.srcCanvas, 0, 0, S.srcCanvas.width, S.srcCanvas.height,
              m.pad - p.c * m.cw, m.pad - p.r * m.ch, m.bw, m.bh);
  // Bevel: light inner rim on the upper-left, dark on the lower-right, both
  // stroked inside the clip so the piece looks like pressed cardboard.
  g.lineJoin = 'round';
  g.lineWidth = bevel * 1.6;
  g.save(); g.translate(bevel * 0.55, bevel * 0.55);
  g.strokeStyle = 'rgba(255,255,255,0.38)'; g.stroke(p.path); g.restore();
  g.save(); g.translate(-bevel * 0.55, -bevel * 0.55);
  g.strokeStyle = 'rgba(0,0,0,0.36)'; g.stroke(p.path); g.restore();
  g.restore();

  // Crisp dark cut line so the shape is unmistakable.
  g.lineJoin = 'round';
  g.lineWidth = 1.5;
  g.strokeStyle = 'rgba(24,14,4,0.85)';
  g.stroke(p.path);
}

// The board: cream card, the picture printed faintly on it, and every cut
// line drawn in so shapes can be matched as well as colours.
function jigsawDrawGuide() {
  const S = JIGSAW_STATE, m = S.m;
  const src = S.srcCanvas;
  const guide = document.getElementById('jigGuide');
  const full = document.getElementById('jigFull');
  if (guide) {
    guide.width = Math.ceil(m.bw * m.dpr); guide.height = Math.ceil(m.bh * m.dpr);
    guide.style.width = m.bw + 'px'; guide.style.height = m.bh + 'px';
    const g = guide.getContext('2d');
    g.setTransform(m.dpr, 0, 0, m.dpr, 0, 0);
    g.fillStyle = '#fbf3e4'; g.fillRect(0, 0, m.bw, m.bh);
    g.globalAlpha = 0.36;
    g.drawImage(src, 0, 0, src.width, src.height, 0, 0, m.bw, m.bh);
    g.globalAlpha = 1;
    g.strokeStyle = 'rgba(74,46,12,0.30)';
    g.lineWidth = 1;
    S.piecesArr.forEach(p => {
      g.save();
      g.translate(p.c * m.cw - m.pad, p.r * m.ch - m.pad);
      g.stroke(p.path);
      g.restore();
    });
  }
  if (full) {
    full.width = Math.ceil(m.bw * m.dpr); full.height = Math.ceil(m.bh * m.dpr);
    full.style.width = m.bw + 'px'; full.style.height = m.bh + 'px';
    full.style.left = m.bx + 'px'; full.style.top = m.by + 'px';
    const g = full.getContext('2d');
    g.drawImage(src, 0, 0, src.width, src.height, 0, 0, full.width, full.height);
  }
}

function jigsawClampPiece(p) {
  const m = JIGSAW_STATE.m;
  p.x = jigClamp(p.x, m.edge, Math.max(m.edge, m.tableW - m.cw - m.edge));
  p.y = jigClamp(p.y, m.edge, Math.max(m.edge, m.tableH - m.ch - m.edge));
}
function jigsawPosition(p) {
  const m = JIGSAW_STATE.m;
  p.el.style.transform = 'translate3d(' + Math.round(p.x - m.pad) + 'px,' + Math.round(p.y - m.pad) + 'px,0)';
  p.el.style.zIndex = String(p.placed !== undefined ? 1 : p.z);
}
function jigsawRaise(p) {
  const S = JIGSAW_STATE;
  p.z = ++S.z;
  p.el.style.zIndex = String(p.z);
}
function jigsawGlide(p) {
  p.el.classList.add('moving');
  clearTimeout(p._mt);
  p._mt = setTimeout(() => p.el.classList.remove('moving'), 260);
}
// How close a drop must be to count. Generous (a third of a piece) because the
// audience should never have to hunt for a pixel, but always under half a cell
// so the neighbouring spot can never claim the piece.
function jigsawTol() {
  const m = JIGSAW_STATE.m, s = Math.min(m.cw, m.ch);
  return Math.min(s * 0.48, Math.max(14, s * 0.34));
}
function jigsawHome(p) {
  const m = JIGSAW_STATE.m;
  return { x: m.bx + p.c * m.cw, y: m.by + p.r * m.ch };
}

// Spread the loose pieces over the table: beside/below the board where there
// is room, on the board itself where there is not. Each piece takes the best
// of several random spots (the one farthest from pieces already down), which
// avoids piles without looking arranged.
function jigsawScatter(animate) {
  const S = JIGSAW_STATE, m = S.m;
  if (!m) return;
  const loose = S.piecesArr.filter(p => p.placed === undefined);
  if (!loose.length) return;
  const minX = m.edge, maxX = Math.max(m.edge, m.tableW - m.cw - m.edge);
  const minY = m.edge, maxY = Math.max(m.edge, m.tableH - m.ch - m.edge);
  const zones = [];
  const addZone = (x0, x1, y0, y1) => {
    x0 = jigClamp(x0, minX, maxX); x1 = jigClamp(x1, minX, maxX);
    y0 = jigClamp(y0, minY, maxY); y1 = jigClamp(y1, minY, maxY);
    if (x1 < x0) x1 = x0;
    if (y1 < y0) y1 = y0;
    zones.push({ x0, x1, y0, y1, w: (x1 - x0 + m.cw * 0.4) * (y1 - y0 + m.ch * 0.4) });
  };
  if (m.bx - minX > m.cw * 0.3) addZone(minX, m.bx - m.cw * 0.7, minY, maxY);
  if (m.tableW - (m.bx + m.bw) > m.cw * 0.3) addZone(m.bx + m.bw - m.cw * 0.3, maxX, minY, maxY);
  if (m.tableH - (m.by + m.bh) > m.ch * 0.3) addZone(minX, maxX, m.by + m.bh - m.ch * 0.3, maxY);
  const zoneSum = zones.reduce((a, z) => a + z.w, 0);
  const offArea = m.tableW * m.tableH - m.bw * m.bh;
  const pOff = zones.length ? jigClamp(offArea / (loose.length * m.cw * m.ch), 0.4, 1) : 0;
  const tol = jigsawTol() * 1.6;

  const order = loose.slice();
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = order[i]; order[i] = order[j]; order[j] = t;
  }
  const done = [];
  order.forEach(p => {
    const home = jigsawHome(p);
    let best = null, bestScore = -Infinity;
    for (let k = 0; k < 14; k++) {
      let x, y;
      if (Math.random() < pOff) {
        let pick = Math.random() * zoneSum, z = zones[0];
        for (let i = 0; i < zones.length; i++) { z = zones[i]; pick -= z.w; if (pick <= 0) break; }
        x = z.x0 + Math.random() * (z.x1 - z.x0);
        y = z.y0 + Math.random() * (z.y1 - z.y0);
      } else {
        x = minX + Math.random() * (maxX - minX);
        y = minY + Math.random() * (maxY - minY);
      }
      let score = 1e9;
      for (let i = 0; i < done.length; i++) {
        const dx = (done[i].x - x) / m.cw, dy = (done[i].y - y) / m.ch;
        const d = dx * dx + dy * dy;
        if (d < score) score = d;
      }
      // Never leave a piece lying on its own spot looking placed when it is not.
      if (Math.hypot(x - home.x, y - home.y) < tol) score = -1;
      score += Math.random() * 0.02;
      if (score > bestScore) { bestScore = score; best = { x, y }; }
    }
    p.x = best.x; p.y = best.y;
    done.push(best);
    p.z = ++S.z;
    if (animate) jigsawGlide(p);
    jigsawPosition(p);
  });
}

// Which loose piece is under this table point? Tested against the true cut
// outline, top-most first, so tabs and holes behave the way they look.
function jigsawHit(x, y) {
  const S = JIGSAW_STATE, m = S.m;
  if (!m || !S.piecesArr) return null;
  if (!S._hitCtx) S._hitCtx = document.createElement('canvas').getContext('2d');
  const ctx = S._hitCtx;
  const w = m.cw + m.pad * 2, h = m.ch + m.pad * 2;
  const probe = (qx, qy) => {
    let best = null;
    for (let i = 0; i < S.piecesArr.length; i++) {
      const p = S.piecesArr[i];
      if (p.placed !== undefined) continue;
      const lx = qx - (p.x - m.pad), ly = qy - (p.y - m.pad);
      if (lx < 0 || ly < 0 || lx > w || ly > h) continue;
      if (best && p.z < best.z) continue;
      if (ctx.isPointInPath(p.path, lx, ly)) best = p;
    }
    return best;
  };
  let hit = probe(x, y);
  if (hit) return hit;
  // A fingertip is not a pixel: forgive a near miss.
  const r = 9, d = 6.5;
  const around = [[r, 0], [-r, 0], [0, r], [0, -r], [d, d], [-d, d], [d, -d], [-d, -d]];
  for (let i = 0; i < around.length; i++) {
    const p = probe(x + around[i][0], y + around[i][1]);
    if (p && (!hit || p.z > hit.z)) hit = p;
  }
  return hit;
}

function jigsawSelect(si) {
  const S = JIGSAW_STATE;
  S.selected = si;
  S.piecesArr.forEach((p, i) => p.el.classList.toggle('selected', i === si));
  if (si >= 0) { jigsawRaise(S.piecesArr[si]); jigsawSay(jigL().selected); }
}

// Drop test: close enough to its own spot → lock it in. Returns true if placed.
function jigsawTrySnap(p, tol) {
  const S = JIGSAW_STATE;
  if (!p || p.placed !== undefined) return false;
  const home = jigsawHome(p);
  if (Math.hypot(p.x - home.x, p.y - home.y) <= (tol || jigsawTol())) {
    placeJigsawPiece(S.piecesArr.indexOf(p), p.idx);
    return true;
  }
  return false;
}

// Tap-to-place: with a piece picked, a tap on the table sends it there. A tap
// inside the piece's own spot seats it; anywhere else it just moves and stays
// picked, so the player can simply try again.
function jigsawMoveSelectedTo(x, y) {
  const S = JIGSAW_STATE, m = S.m;
  const p = S.piecesArr[S.selected];
  if (!p || p.placed !== undefined) { jigsawSelect(-1); return; }
  const cc = Math.floor((x - m.bx) / m.cw), rr = Math.floor((y - m.by) / m.ch);
  jigsawRaise(p);
  jigsawGlide(p);
  if (rr === p.r && cc === p.c) {
    placeJigsawPiece(S.selected, p.idx);
    return;
  }
  p.x = x - m.cw / 2; p.y = y - m.ch / 2;
  jigsawClampPiece(p);
  jigsawPosition(p);
  jigsawTrySnap(p, jigsawTol() * 0.6);
}

function wireJigsawEvents() {
  const S = JIGSAW_STATE;
  const table = document.getElementById('jigTable');
  if (!table) return;
  const T = jigL();
  const pointOf = (cx, cy) => {
    const r = table.getBoundingClientRect();
    return { x: cx - r.left, y: cy - r.top };
  };
  const setPeek = on => {
    table.classList.toggle('peeking', on);
    const b = document.getElementById('jigPeek');
    if (b) { b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }
  };

  // Touch: block page scrolling only when the finger lands on a piece (or a
  // piece is picked and the tap is a placement). Bare felt still scrolls.
  table.addEventListener('touchstart', e => {
    if (S.solved || table.classList.contains('peeking')) return;
    const t = e.changedTouches && e.changedTouches[0];
    if (!t) return;
    const pt = pointOf(t.clientX, t.clientY);
    if (S.drag || S.selected >= 0 || jigsawHit(pt.x, pt.y)) { if (e.cancelable) e.preventDefault(); }
  }, { passive: false });

  table.addEventListener('pointerdown', e => {
    if (S.solved) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (table.classList.contains('peeking')) { setPeek(false); return; }
    if (S.drag) return;                       // a second finger: ignore
    const pt = pointOf(e.clientX, e.clientY);
    // With a piece picked, a tap on that piece's own spot seats it even if
    // other loose pieces happen to be lying there.
    if (S.selected >= 0) {
      const sp = S.piecesArr[S.selected], m = S.m;
      if (sp && sp.placed === undefined &&
          Math.floor((pt.x - m.bx) / m.cw) === sp.c && Math.floor((pt.y - m.by) / m.ch) === sp.r) {
        e.preventDefault(); jigsawMoveSelectedTo(pt.x, pt.y); return;
      }
    }
    const p = jigsawHit(pt.x, pt.y);
    if (!p) {
      if (S.selected >= 0) { e.preventDefault(); jigsawMoveSelectedTo(pt.x, pt.y); }
      return;
    }
    e.preventDefault();
    S.drag = { p: p, id: e.pointerId, ox: pt.x - p.x, oy: pt.y - p.y, sx: e.clientX, sy: e.clientY, moved: false };
    p.el.classList.remove('moving');
    p.el.classList.add('dragging');
    jigsawRaise(p);
    try { table.setPointerCapture(e.pointerId); } catch (x) {}
    try { p.el.focus({ preventScroll: true }); } catch (x) {}
    table.style.cursor = 'grabbing';
  });

  table.addEventListener('pointermove', e => {
    const d = S.drag;
    if (!d) {
      if (e.pointerType === 'mouse' && !S.solved) {
        const pt = pointOf(e.clientX, e.clientY);
        table.style.cursor = jigsawHit(pt.x, pt.y) ? 'grab' : '';
      }
      return;
    }
    if (e.pointerId !== d.id) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 6) d.moved = true;
    if (d.moved) {
      const pt = pointOf(e.clientX, e.clientY);
      d.p.x = pt.x - d.ox; d.p.y = pt.y - d.oy;
      jigsawClampPiece(d.p);
      jigsawPosition(d.p);
    }
    e.preventDefault();
  });

  const endDrag = (e, cancelled) => {
    const d = S.drag;
    if (!d || (e && e.pointerId !== d.id)) return;
    S.drag = null;
    table.style.cursor = '';
    d.p.el.classList.remove('dragging');
    try { table.releasePointerCapture(d.id); } catch (x) {}
    const si = S.piecesArr.indexOf(d.p);
    if (d.moved) {
      if (S.selected >= 0) jigsawSelect(-1);
      // Right spot → snaps and locks. Anywhere else → it stays where dropped.
      jigsawTrySnap(d.p);
    } else if (!cancelled) {
      jigsawSelect(S.selected === si ? -1 : si);   // a tap picks / un-picks
    }
  };
  table.addEventListener('pointerup', e => endDrag(e, false));
  table.addEventListener('pointercancel', e => endDrag(e, true));

  // Keyboard: Tab to a piece, arrows move it (Shift = small steps), and it
  // locks in when it reaches its spot. Enter/Space picks it, Escape lets go.
  table.addEventListener('keydown', e => {
    const el = e.target;
    if (!el || !el.classList || !el.classList.contains('jig-piece') || S.solved) return;
    // Ctrl / Cmd / Alt combinations belong to the browser and OS (Alt+Left = Back, etc.).
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const si = parseInt(el.getAttribute('data-piece'), 10);
    const p = S.piecesArr[si];
    if (!p || p.placed !== undefined) return;
    const m = S.m;
    const big = Math.max(8, Math.round(Math.min(m.cw, m.ch) / 3));
    const step = e.shiftKey ? 4 : big;
    let dx = 0, dy = 0;
    if (e.key === 'ArrowLeft') dx = -step;
    else if (e.key === 'ArrowRight') dx = step;
    else if (e.key === 'ArrowUp') dy = -step;
    else if (e.key === 'ArrowDown') dy = step;
    else if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      e.stopPropagation();   // keep it from kbnav.js's document-level handler
      jigsawSelect(S.selected === si ? -1 : si);
      return;
    } else if (e.key === 'Escape') {
      if (S.selected >= 0) { e.preventDefault(); jigsawSelect(-1); }
      return;
    } else return;
    e.preventDefault();
    // kbnav.js listens on document, ignores defaultPrevented, and blurs the
    // focused element after every arrow. The piece owns its arrows: stop here.
    e.stopPropagation();
    if (table.classList.contains('peeking')) setPeek(false);
    p.x += dx; p.y += dy;
    jigsawClampPiece(p);
    jigsawRaise(p);
    jigsawGlide(p);
    jigsawPosition(p);
    // Tighter than a mouse drop, so a piece merely passing by does not stick,
    // yet always reachable: the big step can land within 0.71 of a step.
    jigsawTrySnap(p, Math.min(jigsawTol(), Math.max(6, big * 0.78)));
  });

  const help = document.getElementById('jigHelp');
  if (help) help.addEventListener('click', () => { setPeek(false); jigsawHint(); });
  const peek = document.getElementById('jigPeek');
  if (peek) peek.addEventListener('click', () => { if (!S.solved) setPeek(!table.classList.contains('peeking')); });
  const spread = document.getElementById('jigSpread');
  if (spread) spread.addEventListener('click', () => { if (S.solved) return; setPeek(false); jigsawSelect(-1); jigsawScatter(true); });

  // Rotating the phone or resizing the window re-fits the table in place.
  if (!S._resizeBound) {
    S._resizeBound = true;
    window.addEventListener('resize', () => {
      clearTimeout(S._rt);
      S._rt = setTimeout(() => {
        const t = document.getElementById('jigTable');
        if (!t || !S.m || !S.piecesArr) return;
        if (Math.abs(Math.floor(t.clientWidth) - S.m.tableW) < 2) return;
        if (S.drag) { S.drag.p.el.classList.remove('dragging'); S.drag = null; }
        jigsawLayout(false);
      }, 180);
    });
  }
}

// Hint: light up one loose piece and pulse the outline of where it belongs.
function jigsawHint() {
  const S = JIGSAW_STATE, m = S.m;
  if (S.solved || !m) return;
  let p = S.selected >= 0 ? S.piecesArr[S.selected] : null;
  if (!p || p.placed !== undefined) {
    const act = document.activeElement;
    p = S.piecesArr.find(q => q.el === act && q.placed === undefined) || null;
  }
  if (!p) {
    const loose = S.piecesArr.filter(q => q.placed === undefined);
    if (!loose.length) return;
    p = loose.reduce((a, b) => (b.z > a.z ? b : a));
  }
  const cv = document.getElementById('jigHintCv');
  if (!cv) return;
  const w = m.cw + m.pad * 2, h = m.ch + m.pad * 2;
  cv.width = Math.ceil(w * m.dpr); cv.height = Math.ceil(h * m.dpr);
  cv.style.width = (cv.width / m.dpr) + 'px'; cv.style.height = (cv.height / m.dpr) + 'px';
  const g = cv.getContext('2d');
  g.setTransform(m.dpr, 0, 0, m.dpr, 0, 0);
  g.fillStyle = 'rgba(255,196,0,0.45)'; g.fill(p.path);
  g.lineJoin = 'round';
  g.lineWidth = 5; g.strokeStyle = '#ffffff'; g.stroke(p.path);
  g.lineWidth = 3; g.strokeStyle = '#b45309'; g.stroke(p.path);
  const home = jigsawHome(p);
  cv.style.transform = 'translate3d(' + (home.x - m.pad) + 'px,' + (home.y - m.pad) + 'px,0)';
  cv.classList.remove('on'); void cv.offsetWidth; cv.classList.add('on');

  S.piecesArr.forEach(q => q.el.classList.remove('hinted'));
  p.el.classList.add('hinted');
  jigsawRaise(p);
  // If the piece is lying on top of its own destination, slide it aside so
  // the outline can be seen.
  if (Math.abs(p.x - home.x) < m.cw * 0.8 && Math.abs(p.y - home.y) < m.ch * 0.8) {
    p.x = home.x + (home.x + m.cw * 1.9 < m.tableW ? m.cw * 0.95 : -m.cw * 0.95);
    p.y = home.y + (home.y + m.ch * 1.9 < m.tableH ? m.ch * 0.6 : -m.ch * 0.6);
    jigsawClampPiece(p); jigsawGlide(p); jigsawPosition(p);
  }
  jigsawSay(jigL().hintSay.replace('{r}', p.r + 1).replace('{c}', p.c + 1));
  clearTimeout(S._hintT);
  S._hintT = setTimeout(() => {
    cv.classList.remove('on');
    p.el.classList.remove('hinted');
  }, 3200);
}

// Seat piece `pieceIdx` (index into piecesArr) in board slot `slotIdx`.
// A piece only fits its own slot; anything else is refused and the piece
// stays loose on the table.
function placeJigsawPiece(pieceIdx, slotIdx) {
  const S = JIGSAW_STATE;
  const p = S.piecesArr && S.piecesArr[pieceIdx];
  if (!p || p.placed !== undefined) return false;
  if (S.board[slotIdx] !== null) return false;
  if (p.idx !== slotIdx) { jigSfx('sfxWrong', 'sfxFlip'); return false; }

  S.board[slotIdx] = p.idx;
  p.placed = slotIdx;
  const home = jigsawHome(p);
  p.x = home.x; p.y = home.y;

  const el = p.el;
  const hadFocus = (document.activeElement === el);
  el.classList.remove('dragging', 'selected', 'hinted');
  el.classList.add('placed');
  jigsawGlide(p);
  jigsawPosition(p);
  el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), 520);
  el.tabIndex = -1;
  jigsawLabel(p, pieceIdx);
  if (S.selected === pieceIdx) S.selected = -1;
  const hint = document.getElementById('jigHintCv');
  if (hint) hint.classList.remove('on');

  jigSfx('sfxClick', 'sfxFlip');
  S.placedCount++;
  jigsawUpdateProgress();
  jigsawSay(`${jigL().snapped} ${S.placedCount} / ${S.board.length}`);

  if (S.placedCount === S.board.length) { jigsawWin(); return true; }
  if (hadFocus) {
    // Keyboard players carry straight on with the next loose piece.
    const n = S.piecesArr.length;
    for (let k = 1; k < n; k++) {
      const q = S.piecesArr[(pieceIdx + k) % n];
      if (q.placed === undefined) { try { q.el.focus({ preventScroll: true }); } catch (x) {} break; }
    }
  }
  return true;
}

// Lift a seated piece back onto the table (kept for callers of the old API).
function unplaceJigsawPiece(slotIdx) {
  const S = JIGSAW_STATE;
  if (!S.board || S.solved) return;
  const pidx = S.board[slotIdx];
  if (pidx === null || pidx === undefined) return;
  const p = S.piecesArr.find(q => q.idx === pidx);
  if (!p) return;
  delete p.placed;
  S.board[slotIdx] = null;
  S.placedCount = Math.max(0, S.placedCount - 1);
  const m = S.m;
  p.el.classList.remove('placed');
  p.el.tabIndex = 0;
  p.x = m.edge + Math.random() * Math.max(1, m.tableW - m.cw - m.edge * 2);
  p.y = m.tableH - m.ch - m.edge - Math.random() * m.ch * 0.3;
  jigsawClampPiece(p);
  jigsawRaise(p); jigsawGlide(p); jigsawPosition(p);
  jigsawLabel(p);
  jigsawUpdateProgress();
}

function jigsawUpdateProgress() {
  const S = JIGSAW_STATE;
  if (!S.board) return;
  const fill = document.getElementById('jigFill');
  const cnt = document.getElementById('jigCount');
  if (fill) fill.style.width = (S.placedCount / S.board.length * 100) + '%';
  if (cnt) cnt.textContent = `${S.placedCount} / ${S.board.length}`;
}

function jigsawWin() {
  const S = JIGSAW_STATE;
  if (S.solved) return;
  S.solved = true;
  // Reward: the seams fade and the picture comes up whole.
  const table = document.getElementById('jigTable');
  if (table) { table.classList.remove('peeking'); table.classList.add('solved'); table.style.cursor = ''; }
  jigsawSay(jigL().done);
  jigSfx('sfxWin');
  if (typeof launchConfetti === 'function') { launchConfetti(); setTimeout(launchConfetti, 350); }
  setTimeout(() => { if (typeof levelComplete === 'function') levelComplete(); }, 900);
}

// Same picture, freshly cut and scattered.
function jigsawRestart() {
  const S = JIGSAW_STATE;
  if (S.imgEl) jigsawBegin();
  else jigsawStart();
}

function jigsawNewImage() {
  const S = JIGSAW_STATE;
  S.img = null;
  S.imgEl = null;
  renderSetup(document.getElementById('gameContent'));
}