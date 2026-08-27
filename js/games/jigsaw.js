// ═══════════════════════════════════════════════════════════════════════════
// GAME: JIGSAW PUZZLE (פאזל ג'יקסו) — v3
//
// The shapes are the whole game, so they are built the way a die-cut jigsaw
// actually is: one tab profile, traced along each edge through that edge's own
// direction and outward normal, with the two pieces at a seam reading the same
// shared decision. See the geometry section for why the previous version could
// never interlock.
// ═══════════════════════════════════════════════════════════════════════════
var JIGSAW_STATE = {};

function initJigsaw(container) {
  const S = JIGSAW_STATE;
  S.pieces = 12;
  S.img = null;
  S.dragIdx = -1;
  S.DEFAULTS = [
    { name: 'Sunset beach', file: 'images/jigsaw/bg0.jpg' },
    { name: 'Mountain lake', file: 'images/jigsaw/bg1.jpg' },
    { name: 'Flower garden', file: 'images/jigsaw/bg2.jpg' },
    { name: 'Sailing ship', file: 'images/jigsaw/bg3.jpg' },
    { name: 'Forest path', file: 'images/jigsaw/bg4.jpg' },
    { name: 'Old town street', file: 'images/jigsaw/bg5.jpg' }
  ];
  S.defaultIdx = Math.floor(Math.random() * S.DEFAULTS.length);
  renderSetup(container);
}

// ── Setup screen ───────────────────────────────────────────────────────────
function renderSetup(container) {
  const S = JIGSAW_STATE;
  const isHe = (typeof currentLang !== 'undefined' && currentLang === 'he');
  const L = {
    title: isHe ? '🧩 פאזל ג\'יקסו' : '🧩 Jigsaw Puzzle',
    choose: isHe ? 'בחרו מספר חלקים' : 'Choose piece count',
    img: isHe ? 'בחרו תמונה' : 'Choose an image',
    upload: isHe ? '📤 העלאת תמונה מהמכשיר' : '📤 Upload a photo',
    camera: isHe ? '📷 צילום במצלמה' : '📷 Take a photo',
    start: isHe ? '🚀 התחילו!' : '🚀 Start!',
    builtin: isHe ? 'או בחרו תמונה יפה:' : 'Or pick a pretty picture:'
  };

  const counts = [6, 12, 24, 48, 96];
  let chips = '';
  counts.forEach(c => { chips += `<button class="jig-chip ${c === S.pieces ? 'active' : ''}" data-n="${c}" onclick="jigsawSetPieces(${c})">${c}</button>`; });

  let thumbs = '';
  S.DEFAULTS.forEach((d, i) => {
    thumbs += `<div class="jig-thumb ${i === S.defaultIdx ? 'active' : ''}" onclick="jigsawPickDefault(${i})">
      <img src="${d.file}" alt="${d.name}" loading="lazy" onerror="this.style.display='none'">
    </div>`;
  });

  container.innerHTML = `
  <style>
    .jig-wrap{max-width:640px;margin:0 auto;text-align:center;font-family:inherit}
    .jig-title{font-size:1.5rem;font-weight:800;color:var(--accent,#f6c048);margin-bottom:18px}
    .jig-label{font-size:1rem;font-weight:700;color:#94a3b8;margin:18px 0 8px}
    .jig-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
    .jig-chip{padding:10px 18px;border-radius:9999px;background:rgba(255,255,255,0.08);border:2px solid rgba(255,255,255,0.15);color:#e2e8f0;font-weight:800;font-size:1rem;cursor:pointer;transition:all .2s}
    .jig-chip.active{background:linear-gradient(135deg,#d97706,#fbbf24);color:#3b2503;border-color:#fbbf24;transform:scale(1.06)}
    .jig-btns{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:14px}
    .jig-btn{padding:12px 20px;border-radius:14px;font-weight:800;font-size:0.95rem;cursor:pointer;border:none;transition:all .2s;box-shadow:0 4px 14px rgba(0,0,0,.3)}
    .jig-btn-up{background:linear-gradient(135deg,#0e5a8a,#1a75b3);color:#fff}
    .jig-btn-cam{background:linear-gradient(135deg,#6d28d9,#8b5cf6);color:#fff}
    .jig-btn-go{background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;font-size:1.1rem;padding:14px 34px;margin-top:16px}
    .jig-btn:hover{transform:translateY(-2px);filter:brightness(1.1)}
    .jig-thumbs{display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px;margin-top:10px}
    .jig-thumb{border-radius:12px;overflow:hidden;border:3px solid transparent;cursor:pointer;transition:all .2s;background:rgba(255,255,255,0.06)}
    .jig-thumb img{width:100%;height:64px;object-fit:cover;display:block}
    .jig-thumb.active{border-color:#fbbf24;box-shadow:0 0 0 3px rgba(251,191,36,.35)}
    .jig-thumb:hover{transform:scale(1.05)}
    .jig-preview{display:none;margin:12px auto 0;border-radius:14px;overflow:hidden;max-width:320px;box-shadow:0 8px 30px rgba(0,0,0,.5)}
    .jig-preview img{width:100%;display:block}
  </style>
  <div class="jig-wrap">
    <div class="jig-title">${L.title}</div>
    <div class="jig-label">${L.choose}</div>
    <div class="jig-chips">${chips}</div>
    <div class="jig-label">${L.img}</div>
    <div class="jig-btns">
      <button class="jig-btn jig-btn-up" onclick="jigsawUpload()">${L.upload}</button>
      <button class="jig-btn jig-btn-cam" onclick="jigsawCamera()">${L.camera}</button>
    </div>
    <div class="jig-preview" id="jigPreview"><img id="jigPreviewImg" alt="preview"></div>
    <div class="jig-label">${L.builtin}</div>
    <div class="jig-thumbs">${thumbs}</div>
    <button class="jig-btn jig-btn-go" onclick="jigsawStart()">${L.start}</button>
  </div>`;
}

function jigsawSetPieces(n) {
  JIGSAW_STATE.pieces = n;
  document.querySelectorAll('.jig-chip').forEach(c => c.classList.toggle('active', parseInt(c.dataset.n) === n));
}
function jigsawPickDefault(i) {
  const S = JIGSAW_STATE;
  S.defaultIdx = i; S.img = null;
  document.querySelectorAll('.jig-thumb').forEach((t, k) => t.classList.toggle('active', k === i));
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
  inp.type = 'file'; inp.accept = 'image/*'; inp.capture = 'environment';
  inp.onchange = () => { if (inp.files && inp.files[0]) jigsawLoadFile(inp.files[0]); };
  inp.click();
}
function jigsawLoadFile(file) {
  const fr = new FileReader();
  fr.onload = e => {
    JIGSAW_STATE.img = e.target.result;
    const pv = document.getElementById('jigPreview');
    const im = document.getElementById('jigPreviewImg');
    if (im) im.src = e.target.result;
    if (pv) pv.style.display = 'block';
    document.querySelectorAll('.jig-thumb').forEach(t => t.classList.remove('active'));
  };
  fr.readAsDataURL(file);
}

// ═══ Piece geometry ════════════════════════════════════════════════════════
//
// One normalised jigsaw tab. `u` runs 0→1 along the edge, `v` is perpendicular
// and positive means "sticking out of the piece". Straight run, pinched neck,
// round head, then the mirror image: the waist (0.24 wide) is wider than the
// neck (0.12), which is what stops a placed piece sliding back out.
//
// The profile is SYMMETRIC about u = 0.5, and that is load-bearing. The two
// pieces meeting at a seam walk it in opposite directions — one top-to-bottom,
// the other bottom-to-top — so an asymmetric profile would trace two different
// curves and the pieces would never mate.
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
// That is the trick: no piece needs to know anything about its neighbour, it
// just looks up the seam they share.
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

// Trace one edge. Everything goes through the edge's own direction and outward
// normal, so all four sides run the same code.
//
// This is what v2 got wrong. It applied the tab offset as a fixed "+y is out",
// which is only true on the bottom edge — on the top edge a tab pointed down,
// into the piece. It also derived the tab width from (x2 - x1), which is
// negative on the edges walked right-to-left, flipping the shape inside out.
// Both disappear once the offset is expressed along a normal.
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

// Convert a piece Path2D to an SVG path string (for slot outline hints).
function jigsawPathToSVG(r, c, rows, cols, pw, ph, pad, seams) {
  const x0 = pad, y0 = pad, x1 = pad + pw, y1 = pad + ph;
  const top    = r > 0        ? -seams.h[r - 1][c] : 0;
  const right  = c < cols - 1 ?  seams.v[r][c]     : 0;
  const bottom = r < rows - 1 ?  seams.h[r][c]     : 0;
  const left   = c > 0        ? -seams.v[r][c - 1] : 0;
  const pts = [[x0, y0]];
  // sample the same bezier curve jigEdge draws, at fixed u steps
  function edgePts(x1, y1, x2, y2, sign) {
    if (!sign) { pts.push([x2, y2]); return; }
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len;
    const nx = uy, ny = -ux;
    const h = len * JIG_TAB_H * sign;
    const px = (u, v) => x1 + ux * u * len + nx * v * h;
    const py = (u, v) => y1 + uy * u * len + ny * v * h;
    // approximate each bezier segment with points
    for (const t of JIG_TAB) {
      const steps = 6;
      // cubic bezier from current point to (px(t4),py(t5)) with controls
      const c1 = [px(t[0], t[1]), py(t[0], t[1])];
      const c2 = [px(t[2], t[3]), py(t[2], t[3])];
      const e  = [px(t[4], t[5]), py(t[4], t[5])];
      const s0 = pts[pts.length - 1];
      for (let i = 1; i <= steps; i++) {
        const u = i / steps;
        const a = (1-u)*(1-u)*(1-u), b = 3*(1-u)*(1-u)*u, cc = 3*(1-u)*u*u, dd = u*u*u;
        pts.push([a*s0[0]+b*c1[0]+cc*c2[0]+dd*e[0], a*s0[1]+b*c1[1]+cc*c2[1]+dd*e[1]]);
      }
    }
  }
  edgePts(x0, y0, x1, y0, top);
  edgePts(x1, y0, x1, y1, right);
  edgePts(x1, y1, x0, y1, bottom);
  edgePts(x0, y1, x0, y0, left);
  let d = 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
  return d + ' Z';
}

// ── Build & start ──────────────────────────────────────────────────────────
function jigsawStart() {
  const S = JIGSAW_STATE;
  const container = document.getElementById('gameContent');
  const isHe = (typeof currentLang !== 'undefined' && currentLang === 'he');

  let imgSrc = S.img;
  if (!imgSrc) imgSrc = S.DEFAULTS[S.defaultIdx].file;

  const dims = { 6: [2, 3], 12: [3, 4], 24: [4, 6], 48: [6, 8], 96: [8, 12] };
  const [rows, cols] = dims[S.pieces] || [3, 4];
  S.rows = rows; S.cols = cols;
  S.solved = false; S.dragIdx = -1; S.placedCount = 0;

  const img = new Image();
  img.onload = () => {
    const cw = 800, ch = 600;
    const canvas = document.createElement('canvas');
    canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext('2d');
    const ir = img.width / img.height, cr = cw / ch;
    let sw, sh, sx, sy;
    if (ir > cr) { sh = img.height; sw = img.height * cr; sx = (img.width - sw) / 2; sy = 0; }
    else { sw = img.width; sh = img.width / cr; sx = 0; sy = (img.height - sh) / 2; }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
    S.srcCanvas = canvas;
    S.srcData = canvas.toDataURL('image/jpeg', 0.82);
    buildJigsawBoard(container, isHe);
  };
  img.onerror = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 600;
    const ctx = canvas.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 800, 600);
    g.addColorStop(0, '#0e5a8a'); g.addColorStop(1, '#d97706');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 800, 600);
    S.srcCanvas = canvas;
    S.srcData = canvas.toDataURL('image/jpeg', 0.82);
    buildJigsawBoard(container, isHe);
  };
  img.src = imgSrc;
}

function buildJigsawBoard(container, isHe) {
  const S = JIGSAW_STATE;
  const { rows, cols } = S;
  const n = rows * cols;
  const pw = 800 / cols, ph = 600 / rows;

  // A tab reaches JIG_TAB_MAX of its edge's length perpendicular to that edge,
  // so the widest reach on any side is set by the LONGER edge. One padding
  // value covers all four.
  const pad = Math.ceil(Math.max(pw, ph) * JIG_TAB_MAX) + 2;
  S.seams = jigsawSeams(rows, cols, (Date.now() ^ (rows * 73856093) ^ (cols * 19349663)) >>> 0);

  // Fine. A first pass at 4% of the cell drew silver bands down every seam
  // that read as chrome piping rather than cut cardboard.
  const bevel = Math.max(1.2, Math.min(pw, ph) * 0.018);

  const pieces = [];
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / cols), c = i % cols;
    const pc = document.createElement('canvas');
    pc.width = Math.ceil(pw + pad * 2);
    pc.height = Math.ceil(ph + pad * 2);
    const g = pc.getContext('2d');
    const path = jigsawPathFor(r, c, rows, cols, pw, ph, pad, S.seams);

    g.save();
    g.clip(path);
    g.drawImage(S.srcCanvas, 0, 0, 800, 600, -c * pw + pad, -r * ph + pad, 800, 600);
    // Bevel: a light rim offset toward the light and a dark one away from it,
    // both stroked INSIDE the clip so only the inner half lands — which is how
    // a moulded cardboard edge actually catches the light.
    g.lineJoin = 'round';
    g.lineWidth = bevel * 1.6;
    g.translate(-bevel * 0.55, -bevel * 0.55);
    g.strokeStyle = 'rgba(255,255,255,0.30)';
    g.stroke(path);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clip(path);
    g.translate(bevel * 0.55, bevel * 0.55);
    g.strokeStyle = 'rgba(0,0,0,0.32)';
    g.stroke(path);
    g.restore();

    // Crisp silhouette so a piece reads against the image behind it.
    g.save();
    g.lineWidth = 1.3;
    g.strokeStyle = 'rgba(12,20,34,0.55)';
    g.stroke(path);
    g.restore();

    pieces.push({ idx: i, r, c, data: pc.toDataURL('image/png') });
  }

  const shuffled = pieces.map(p => ({ ...p }));
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  S.piecesArr = shuffled;
  S.board = new Array(n).fill(null);

  // The piece canvas is (pw + 2·pad) × (ph + 2·pad) but the slot is pw × ph, so
  // the overhang is a DIFFERENT percentage horizontally and vertically whenever
  // the cell is not square. v2 used the horizontal figure for both, which
  // squashed every tab on the short axis.
  const padX = (pad / pw * 100).toFixed(3);
  const padY = (pad / ph * 100).toFixed(3);
  const wPct = ((pw + pad * 2) / pw * 100).toFixed(3);
  const hPct = ((ph + pad * 2) / ph * 100).toFixed(3);

  const L = {
    restart: isHe ? '🔄 פאזל חדש' : '🔄 New puzzle',
    newimg: isHe ? '📷 תמונה אחרת' : '📷 Different image',
    peek: isHe ? '👁️ הצצה לתמונה' : '👁️ Peek at the picture',
    help: isHe ? '💡 עזרה' : '💡 Help',
    tip: isHe ? 'גררו חלק אל הלוח, או הקישו על חלק ואז על המקום'
              : 'Drag a piece onto the board, or tap a piece then tap a spot'
  };

  let boardHtml = `<div class="jig-board" id="jigBoard"><img class="jig-ghost" id="jigGhost" src="${S.srcData}" alt="">`;
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / cols), c = i % cols;
    // faint outline of THIS slot's shape so pieces can be matched by shape
    boardHtml += `<div class="jig-slot" data-slot="${i}" data-drop="true">
      <svg class="jig-slot-outline" viewBox="0 0 ${(pw + pad * 2).toFixed(1)} ${(ph + pad * 2).toFixed(1)}" preserveAspectRatio="none">${jigsawPathToSVG(r, c, rows, cols, pw, ph, pad, S.seams)}</svg>
    </div>`;
  }
  boardHtml += '</div>';

  let trayHtml = '<div class="jig-tray" id="jigTray">';
  shuffled.forEach((p, si) => {
    trayHtml += `<div class="jig-piece" data-piece="${si}" draggable="true">
      <img src="${p.data}" alt="piece" draggable="false"></div>`;
  });
  trayHtml += '</div>';

  container.innerHTML = `
  <style>
    .jig-board{display:grid;grid-template-columns:repeat(${cols},1fr);gap:0;max-width:520px;margin:0 auto;position:relative;border-radius:10px;background:rgba(255,255,255,0.04);box-shadow:0 10px 34px rgba(0,0,0,.55),inset 0 0 0 2px rgba(255,255,255,.07);direction:ltr}
    /* The finished picture, barely there — the same help a box lid gives you.
       Hidden by default so the empty board stays clean; the 💡 Help button
       turns it (and the slot outlines) on. */
    .jig-ghost{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;opacity:0;border-radius:10px;pointer-events:none;transition:opacity .25s;z-index:0}
    .jig-board.help-on .jig-ghost{opacity:.07}
    .jig-board.peeking .jig-ghost{opacity:.72}
    .jig-slot{aspect-ratio:${pw.toFixed(4)}/${ph.toFixed(4)};position:relative;z-index:1}
    /* faint shape outline so pieces can be matched by shape — only with Help on */
    .jig-slot-outline{position:absolute;left:-${padX}%;top:-${padY}%;width:${wPct}%;height:${hPct}%;pointer-events:none;opacity:0;transition:opacity .25s}
    .jig-board.help-on .jig-slot-outline{opacity:.16}
    .jig-slot-outline path{fill:rgba(255,255,255,0.05);stroke:#ffffff;stroke-width:1.5}
    .jig-slot.has-piece .jig-slot-outline{display:none}
    /* The piece overhangs its slot by the tab depth on every side. */
    .jig-slot img{position:absolute;left:-${padX}%;top:-${padY}%;width:${wPct}%;height:${hPct}%;max-width:none;object-fit:fill;pointer-events:none}
    @keyframes jigSnap{0%{transform:scale(1.13)}60%{transform:scale(.97)}100%{transform:scale(1)}}
    .jig-slot.snap img{animation:jigSnap .28s cubic-bezier(.2,.9,.3,1.2)}
    @keyframes jigShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
    .jig-slot.shake{animation:jigShake .45s ease}
    .jig-tray{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:16px;max-width:560px;margin-left:auto;margin-right:auto;direction:ltr}
    /* tray pieces: big enough that the shape + tabs are clearly visible
       (canvas includes transparent pad; shape ≈61% of it) */
    .jig-piece{width:112px;height:112px;cursor:grab;transition:transform .15s,opacity .2s;touch-action:none;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 5px 9px rgba(0,0,0,.55));direction:ltr}
    /* contain, so a piece shows its whole shape — tabs included — undistorted */
    .jig-piece img{width:100%;height:100%;object-fit:contain;pointer-events:none;display:block}
    .jig-piece:hover{transform:scale(1.09)}
    .jig-piece.dragging{opacity:.4;transform:scale(1.1)}
    .jig-piece.used{display:none}
    .jig-piece.selected{outline:3px solid #fbbf24;outline-offset:2px;border-radius:8px}
    .jig-progress{display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:12px}
    .jig-bar{flex:1;max-width:260px;height:10px;background:rgba(255,255,255,.12);border-radius:9999px;overflow:hidden}
    .jig-fill{height:100%;background:linear-gradient(90deg,#16a34a,#22c55e);border-radius:9999px;transition:width .3s}
    .jig-count{font-weight:800;color:#f6c048}
    .jig-tip{color:#94a3b8;font-size:.85rem;margin:10px 0 6px}
    .jig-actions{display:flex;gap:10px;justify-content:center;margin-top:14px;flex-wrap:wrap}
    .jig-act{padding:12px 18px;border-radius:12px;font-weight:800;font-size:.9rem;cursor:pointer;border:none;transition:all .2s;box-shadow:0 3px 12px rgba(0,0,0,.3);min-height:48px}
    .jig-act-a{background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff}
    .jig-act-b{background:linear-gradient(135deg,#0e5a8a,#1a75b3);color:#fff}
    .jig-act-c{background:rgba(255,255,255,.10);color:#e2e8f0;border:2px solid rgba(255,255,255,.22)}
    .jig-act:hover{transform:translateY(-2px);filter:brightness(1.1)}
    .jig-act.on{background:linear-gradient(135deg,#d97706,#fbbf24);color:#3b2503;border-color:#fbbf24;box-shadow:0 0 0 3px rgba(251,191,36,.35)}
    @media (min-width:820px){
      .jig-layout{display:flex;gap:20px;align-items:flex-start;justify-content:center}
      .jig-board{flex:0 0 520px}
      .jig-tray{flex:1;max-width:340px;margin-top:0;align-content:flex-start;max-height:470px;overflow-y:auto;padding-right:4px}
    }
  </style>
  <div class="jig-wrap">
    <div class="jig-progress"><div class="jig-bar"><div class="jig-fill" id="jigFill" style="width:0%"></div></div><span class="jig-count" id="jigCount">0/${n}</span></div>
    <div class="jig-tip">${L.tip}</div>
    <div class="jig-layout">
      ${boardHtml}
      ${trayHtml}
    </div>
    <div class="jig-actions">
      <button class="jig-act jig-act-c" id="jigHelp">${L.help}</button>
      <button class="jig-act jig-act-c" id="jigPeek">${L.peek}</button>
      <button class="jig-act jig-act-a" onclick="jigsawRestart()">${L.restart}</button>
      <button class="jig-act jig-act-b" onclick="jigsawNewImage()">${L.newimg}</button>
    </div>
  </div>`;

  wireJigsawEvents();
}

function wireJigsawEvents() {
  const S = JIGSAW_STATE;

  // Help: toggle the shape outlines + faint picture on the empty board.
  // Off by default so the board is clean; press 💡 עזרה to see where pieces go.
  const help = document.getElementById('jigHelp');
  const board = document.getElementById('jigBoard');
  if (help && board) {
    help.addEventListener('click', () => {
      const on = board.classList.toggle('help-on');
      help.classList.toggle('on', on);
    });
  }

  // Peek: hold it down to see the picture, let go and it fades out.
  const peek = document.getElementById('jigPeek');
  if (peek && board) {
    const on = e => { e.preventDefault(); board.classList.add('peeking'); };
    const off = () => board.classList.remove('peeking');
    peek.addEventListener('pointerdown', on);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => peek.addEventListener(ev, off));
  }

  document.querySelectorAll('.jig-piece').forEach(piece => {
    piece.addEventListener('dragstart', e => {
      const si = parseInt(piece.dataset.piece);
      if (S.piecesArr[si].placed !== undefined) { e.preventDefault(); return; }
      S.dragIdx = si;
      piece.classList.add('dragging');
      if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(si)); } catch (x) {} }
    });
    piece.addEventListener('dragend', () => {
      S.dragIdx = -1;
      piece.classList.remove('dragging');
    });
    // Touch/pointer drag — HTML5 drag and drop does not exist on phones.
    piece.addEventListener('pointerdown', function (e) {
      const si = parseInt(piece.dataset.piece);
      if (S.piecesArr[si].placed !== undefined) return;
      S._pd = { si: si, x: e.clientX, y: e.clientY, moved: false, t: Date.now() };
      piece.setPointerCapture && piece.setPointerCapture(e.pointerId);
    });
    piece.addEventListener('pointermove', function (e) {
      if (!S._pd) return;
      const dx = e.clientX - S._pd.x, dy = e.clientY - S._pd.y;
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) S._pd.moved = true;
      if (S._pd.moved && S._pd.ghost) {
        S._pd.ghost.style.left = (e.clientX - S._pd.ghost.offsetWidth / 2) + 'px';
        S._pd.ghost.style.top = (e.clientY - S._pd.ghost.offsetHeight / 2) + 'px';
      } else if (S._pd.moved && !S._pd.ghost) {
        const g = piece.cloneNode(true);
        g.style.position = 'fixed';
        g.style.zIndex = '9999';
        g.style.pointerEvents = 'none';
        g.style.width = '76px'; g.style.height = '76px';
        g.style.left = (e.clientX - 38) + 'px';
        g.style.top = (e.clientY - 38) + 'px';
        g.style.filter = 'drop-shadow(0 8px 16px rgba(0,0,0,0.6))';
        g.style.opacity = '0.9';
        document.body.appendChild(g);
        S._pd.ghost = g;
        piece.style.opacity = '0.35';
      }
      e.preventDefault && e.preventDefault();
    });
    piece.addEventListener('pointerup', function (e) {
      if (!S._pd) return;
      const pd = S._pd; S._pd = null;
      if (pd.ghost) { pd.ghost.remove(); piece.style.opacity = ''; }
      if (!pd.moved) return;   // a tap, not a drag — the click handler has it
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const slotEl = el && el.closest ? el.closest('.jig-slot') : null;
      if (slotEl) placeJigsawPiece(pd.si, parseInt(slotEl.dataset.slot));
    });
    piece.addEventListener('click', () => {
      const si = parseInt(piece.dataset.piece);
      if (S.piecesArr[si].placed !== undefined) return;
      S.selected = (S.selected === si) ? -1 : si;
      document.querySelectorAll('.jig-piece').forEach((el, i) => el.classList.toggle('selected', i === S.selected));
    });
  });

  document.querySelectorAll('.jig-slot').forEach(slot => {
    slot.addEventListener('dragover', e => { e.preventDefault(); });
    slot.addEventListener('drop', e => {
      e.preventDefault();
      const slotIdx = parseInt(slot.dataset.slot);
      let si = S.dragIdx;
      if (si < 0 && e.dataTransfer) {
        try { si = parseInt(e.dataTransfer.getData('text/plain')); } catch (x) {}
      }
      if (si >= 0) placeJigsawPiece(si, slotIdx);
      S.dragIdx = -1;
    });
    slot.addEventListener('click', () => {
      const slotIdx = parseInt(slot.dataset.slot);
      if (S.board[slotIdx] !== null && S.selected < 0) { unplaceJigsawPiece(slotIdx); return; }
      if (S.selected >= 0) {
        const p = S.piecesArr[S.selected];
        const before = p ? (p.placed !== undefined) : true;
        placeJigsawPiece(S.selected, slotIdx);
        const after = p ? (p.placed !== undefined) : true;
        if (after && !before) {
          S.selected = -1;
          document.querySelectorAll('.jig-piece').forEach(el => el.classList.remove('selected'));
        }
      }
    });
  });
}

function placeJigsawPiece(pieceIdx, slotIdx) {
  const S = JIGSAW_STATE;
  const p = S.piecesArr[pieceIdx];
  if (!p || p.placed !== undefined) return;
  if (S.board[slotIdx] !== null) return;

  // A piece only fits its own slot. Wrong one → shake it off; a win is only
  // reachable when every piece sits in its true position.
  if (p.idx !== slotIdx) {
    if (typeof sfxWrong === 'function') sfxWrong(); else if (typeof sfxFlip === 'function') sfxFlip();
    const slot = document.querySelector(`.jig-slot[data-slot="${slotIdx}"]`);
    if (slot) {
      slot.classList.remove('shake');
      void slot.offsetWidth;
      slot.classList.add('shake');
      setTimeout(() => slot.classList.remove('shake'), 500);
    }
    return;
  }

  S.board[slotIdx] = p.idx;
  p.placed = slotIdx;

  const slot = document.querySelector(`.jig-slot[data-slot="${slotIdx}"]`);
  if (slot) {
    const existing = slot.querySelector('img');
    if (existing) existing.remove();
    const im = document.createElement('img');
    im.src = p.data; im.alt = 'piece';
    // Pieces placed earlier sit ABOVE later ones, so their tabs stay visible
    // over their neighbours — the way the first piece down does on a table.
    im.style.zIndex = String(1000 - S.placedCount);
    slot.appendChild(im);
    slot.classList.add('has-piece');
    slot.classList.remove('snap');
    void slot.offsetWidth;
    slot.classList.add('snap');
    setTimeout(() => slot.classList.remove('snap'), 320);
  }
  if (typeof sfxClick === 'function') sfxClick(); else if (typeof sfxFlip === 'function') sfxFlip();

  const trayEl = document.querySelector(`.jig-piece[data-piece="${pieceIdx}"]`);
  if (trayEl) trayEl.classList.add('used');

  S.placedCount++;
  jigsawUpdateProgress();
  if (S.placedCount === S.board.length) jigsawWin();
}

// Return a placed piece to the tray (tap a filled slot).
function unplaceJigsawPiece(slotIdx) {
  const S = JIGSAW_STATE;
  const pidx = S.board[slotIdx];
  if (pidx === null || pidx === undefined) return;
  const piece = S.piecesArr.find(p => p.idx === pidx);
  if (!piece) return;
  delete piece.placed;
  S.board[slotIdx] = null;
  S.placedCount = Math.max(0, S.placedCount - 1);

  const slot = document.querySelector(`.jig-slot[data-slot="${slotIdx}"]`);
  if (slot) {
    const im = slot.querySelector('img');
    if (im) im.remove();
    slot.classList.remove('has-piece');
  }
  const trayEl = document.querySelector(`.jig-piece[data-piece="${S.piecesArr.indexOf(piece)}"]`);
  if (trayEl) trayEl.classList.remove('used');
  jigsawUpdateProgress();
}

function jigsawUpdateProgress() {
  const S = JIGSAW_STATE;
  const fill = document.getElementById('jigFill');
  const cnt = document.getElementById('jigCount');
  if (fill) fill.style.width = (S.placedCount / S.board.length * 100) + '%';
  if (cnt) cnt.textContent = `${S.placedCount}/${S.board.length}`;
}

function jigsawWin() {
  const S = JIGSAW_STATE;
  if (S.solved) return;
  S.solved = true;
  // Reward: the seams fade and the picture comes up whole.
  const board = document.getElementById('jigBoard');
  if (board) {
    board.classList.add('peeking');
    const ghost = document.getElementById('jigGhost');
    if (ghost) ghost.style.opacity = '1';
  }
  if (typeof sfxWin === 'function') sfxWin();
  if (typeof launchConfetti === 'function') { launchConfetti(); setTimeout(launchConfetti, 350); }
  setTimeout(() => { if (typeof levelComplete === 'function') levelComplete(); }, 900);
}

function jigsawRestart() {
  const S = JIGSAW_STATE;
  S.img = null;   // same picture, freshly cut
  if (S.srcCanvas) {
    const container = document.getElementById('gameContent');
    const isHe = (typeof currentLang !== 'undefined' && currentLang === 'he');
    S.solved = false; S.placedCount = 0; S.selected = -1;
    buildJigsawBoard(container, isHe);
  } else jigsawStart();
}

function jigsawNewImage() {
  const S = JIGSAW_STATE;
  S.img = null;
  renderSetup(document.getElementById('gameContent'));
}
