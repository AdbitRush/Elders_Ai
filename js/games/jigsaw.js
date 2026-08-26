// ═══════════════════════════════════════════════════════════════════════════
// GAME: JIGSAW PUZZLE (פאזל ג'יקסו) — v2
// - Real interlocking jigsaw shapes (bumps & indents, no plain squares)
// - Pieces tray arranged AROUND the board (sides on wide, below on narrow)
// - Drag & drop pieces onto the board (mouse + touch)
// - Board shows piece outlines as a hint on easy/medium; blank on hard
// - Choose piece count: 6 / 12 / 24 / 48 / 96
// - Upload your own photo (file or camera) → becomes the puzzle
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
  JIGSAW_STATE.defaultIdx = i; JIGSAW_STATE.img = null;
  document.querySelectorAll('.jig-thumb').forEach((t, ti) => t.classList.toggle('active', ti === i));
  const pv = document.getElementById('jigPreview'); if (pv) pv.style.display = 'none';
}
function jigsawUpload() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*';
  input.onchange = () => { if (input.files && input.files[0]) jigsawLoadFile(input.files[0]); };
  input.click();
}
function jigsawCamera() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*'; input.capture = 'environment';
  input.onchange = () => { if (input.files && input.files[0]) jigsawLoadFile(input.files[0]); };
  input.click();
}
function jigsawLoadFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    JIGSAW_STATE.img = e.target.result;
    const pv = document.getElementById('jigPreview');
    const pi = document.getElementById('jigPreviewImg');
    if (pv && pi) { pi.src = JIGSAW_STATE.img; pv.style.display = 'block'; }
    document.querySelectorAll('.jig-thumb').forEach(t => t.classList.remove('active'));
  };
  reader.readAsDataURL(file);
}

// ── Jigsaw shape geometry ──────────────────────────────────────────────────
// Builds a closed path for cell (r,c) with BIG, prominent interlocking
// bumps/indents. The bump decision for the seam between two neighbours is
// shared, so the right edge of (r,c) and left edge of (r,c+1) always interlock.
// Edge pieces have a FLAT outer side (frame) — bumps only on inner seams.
function jigsawPathFor(ctx, r, c, rows, cols, pw, ph, pad, tab) {
  const ox = pad, oy = pad;
  // tab decisions — deterministic, shared along each seam
  const rightBump = (c < cols - 1) ? (((r * 31 + c * 17) % 2) === 0) : false;
  const bottomBump = (r < rows - 1) ? ((((r + 50) * 31 + c * 17) % 2) === 0) : false;
  const leftBump = (c > 0) ? !((((r * 31 + (c - 1) * 17) % 2) === 0)) : false;
  const topBump = (r > 0) ? !(((((r - 1) + 50) * 31 + c * 17) % 2) === 0) : false;

  function edge(x1, y1, x2, y2, bump, horiz) {
    if (horiz) {
      const mx = (x1 + x2) / 2;
      if (bump) { ctx.lineTo(mx - tab, y1); ctx.bezierCurveTo(mx - tab, y1 - tab * 1.6, mx + tab, y1 - tab * 1.6, mx + tab, y1); }
      else      { ctx.lineTo(mx - tab, y1); ctx.bezierCurveTo(mx - tab, y1 + tab * 0.9, mx + tab, y1 + tab * 0.9, mx + tab, y1); }
      ctx.lineTo(x2, y2);
    } else {
      const my = (y1 + y2) / 2;
      if (bump) { ctx.lineTo(x1, my - tab); ctx.bezierCurveTo(x1 + tab * 1.6, my - tab, x1 + tab * 1.6, my + tab, x1, my + tab); }
      else      { ctx.lineTo(x1, my - tab); ctx.bezierCurveTo(x1 - tab * 0.9, my - tab, x1 - tab * 0.9, my + tab, x1, my + tab); }
      ctx.lineTo(x2, y2);
    }
  }
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  edge(ox, oy, ox + pw, oy, topBump, true);
  edge(ox + pw, oy, ox + pw, oy + ph, rightBump, false);
  edge(ox + pw, oy + ph, ox, oy + ph, bottomBump, true);
  edge(ox, oy + ph, ox, oy, leftBump, false);
  ctx.closePath();
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
    buildJigsawBoard(container, isHe);
  };
  img.src = imgSrc;
}

function buildJigsawBoard(container, isHe) {
  const S = JIGSAW_STATE;
  const { rows, cols } = S;
  const n = rows * cols;
  const pw = 800 / cols, ph = 600 / rows;
  const tab = Math.min(pw, ph) * 0.30;   // BIG prominent bumps
  const pad = Math.ceil(tab) + 6;

  // generate piece canvases (PNG keeps transparency for the tabs)
  const pieces = [];
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / cols), c = i % cols;
    const pc = document.createElement('canvas');
    pc.width = Math.ceil(pw + pad * 2);
    pc.height = Math.ceil(ph + pad * 2);
    const pctx = pc.getContext('2d');
    jigsawPathFor(pctx, r, c, rows, cols, pw, ph, pad, tab);
    pctx.save();
    pctx.clip();
    pctx.drawImage(S.srcCanvas, 0, 0, 800, 600, -c * pw + pad, -r * ph + pad, 800, 600);
    pctx.restore();
    // crisp edge
    pctx.save();
    jigsawPathFor(pctx, r, c, rows, cols, pw, ph, pad, tab);
    pctx.lineWidth = 1.5;
    pctx.strokeStyle = 'rgba(255,255,255,0.35)';
    pctx.stroke();
    pctx.restore();
    pieces.push({ idx: i, r, c, data: pc.toDataURL('image/png') });
  }
  const shuffled = pieces.map(p => ({ ...p }));
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  S.piecesArr = shuffled;
  S.board = new Array(n).fill(null);

  // difficulty → hint level: fewer pieces = full outlines; many = blank board
  const hint = (S.pieces <= 24) ? 'outline' : (S.pieces <= 48 ? 'faint' : 'blank');
  S.hint = hint;

  // pad displayed as % of slot (canvas is pw+2pad, shape is pw)
  const padPct = ((pad) / pw * 100).toFixed(2);
  // ══ CRITICAL: slot aspect must match the PIECE CANVAS (pw+2pad × ph+2pad),
  // not cols/rows — otherwise the bumps get stretched and never interlock. ══
  const slotAR = ((pw + pad * 2) / (ph + pad * 2)).toFixed(4);

  const L = {
    done: isHe ? '🎉 כל הכבוד! השלמתם את הפאזל!' : '🎉 Well done! Puzzle complete!',
    restart: isHe ? '🔄 פאזל חדש' : '🔄 New puzzle',
    newimg: isHe ? '📷 תמונה אחרת' : '📷 Different image',
    tip: isHe ? 'גררו חלק אל הלוח, או הקישו על חלק ואז על המקום' : 'Drag a piece onto the board, or tap a piece then tap a spot'
  };

  // board slots — clean board, NO shape hints (they were confusing/stretched)
  let boardHtml = '<div class="jig-board" id="jigBoard">';
  for (let i = 0; i < n; i++) {
    boardHtml += `<div class="jig-slot" data-slot="${i}" data-drop="true"></div>`;
  }
  boardHtml += '</div>';

  // pieces tray — positioned around the board
  let trayHtml = '<div class="jig-tray" id="jigTray">';
  shuffled.forEach((p, si) => {
    trayHtml += `<div class="jig-piece" data-piece="${si}" draggable="true">
      <img src="${p.data}" alt="piece" draggable="false">
    </div>`;
  });
  trayHtml += '</div>';

  container.innerHTML = `
  <style>
    .jig-board{display:grid;grid-template-columns:repeat(${cols},1fr);gap:0;max-width:520px;margin:0 auto;position:relative;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.5);background:rgba(255,255,255,0.03)}
    .jig-slot{aspect-ratio:${slotAR};position:relative;background:rgba(255,255,255,0.03)}
    .jig-slot img{position:absolute;left:calc(-${padPct}%);top:calc(-${padPct}%);width:calc(100% + ${padPct * 2}%);height:calc(100% + ${padPct * 2}%);max-width:none;object-fit:fill;z-index:2}
    .jig-slot.has-piece{background:transparent}
    /* feedback: shake on wrong placement (no correct-slot reveal) */
    @keyframes jigShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
    .jig-slot.shake{animation:jigShake .45s ease}
    .jig-tray{display:flex;flex-wrap:wrap;gap:7px;justify-content:center;margin-top:16px;max-width:560px;margin-left:auto;margin-right:auto}
    .jig-piece{width:74px;height:74px;cursor:grab;transition:transform .15s,opacity .2s;touch-action:none;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 4px 8px rgba(0,0,0,.5))}
    .jig-piece img{width:100%;height:100%;object-fit:fill;pointer-events:none;display:block}
    .jig-piece:hover{transform:scale(1.07)}
    .jig-piece.dragging{opacity:.4;transform:scale(1.1)}
    .jig-piece.used{display:none}
    .jig-piece.selected{outline:3px solid #fbbf24;border-radius:8px}
    .jig-progress{display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:12px}
    .jig-bar{flex:1;max-width:260px;height:10px;background:rgba(255,255,255,.12);border-radius:9999px;overflow:hidden}
    .jig-fill{height:100%;background:linear-gradient(90deg,#16a34a,#22c55e);border-radius:9999px;transition:width .3s}
    .jig-count{font-weight:800;color:#f6c048}
    .jig-tip{color:#94a3b8;font-size:.85rem;margin:10px 0 6px}
    .jig-actions{display:flex;gap:10px;justify-content:center;margin-top:14px}
    .jig-act{padding:10px 18px;border-radius:12px;font-weight:800;font-size:.9rem;cursor:pointer;border:none;transition:all .2s;box-shadow:0 3px 12px rgba(0,0,0,.3)}
    .jig-act-a{background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff}
    .jig-act-b{background:linear-gradient(135deg,#0e5a8a,#1a75b3);color:#fff}
    .jig-act:hover{transform:translateY(-2px);filter:brightness(1.1)}
    /* side tray on wide screens */
    @media (min-width:820px){
      .jig-layout{display:flex;gap:20px;align-items:flex-start;justify-content:center}
      .jig-board{flex:0 0 520px}
      .jig-tray{flex:1;max-width:220px;margin-top:0;align-content:flex-start;max-height:420px;overflow-y:auto}
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
      <button class="jig-act jig-act-a" onclick="jigsawRestart()">${L.restart}</button>
      <button class="jig-act jig-act-b" onclick="jigsawNewImage()">${L.newimg}</button>
    </div>
  </div>`;

  wireJigsawEvents();
}

// SVG outline of a piece's jigsaw shape (used as a hint on empty slots)
function jigsawOutlineSVG(r, c, rows, cols, pw, ph, pad, tab, padPct) {
  // replicate the path maths on a temp ctx to extract points
  const cv = document.createElement('canvas');
  const ctx = cv.getContext('2d');
  jigsawPathFor(ctx, r, c, rows, cols, pw, ph, pad, tab);
  // canvas Path2D has no point extraction — build the SVG path manually
  const ox = pad, oy = pad;
  const rightBump = (c < cols - 1) ? (((r * 31 + c * 17) % 2) === 0) : false;
  const bottomBump = (r < rows - 1) ? ((((r + 50) * 31 + c * 17) % 2) === 0) : false;
  const leftBump = (c > 0) ? !((((r * 31 + (c - 1) * 17) % 2) === 0)) : false;
  const topBump = (r > 0) ? !(((((r - 1) + 50) * 31 + c * 17) % 2) === 0) : false;
  function seg(x1, y1, x2, y2, bump, horiz) {
    let s = '';
    if (horiz) {
      const mx = (x1 + x2) / 2;
      s += `L${(mx - tab).toFixed(1)},${y1.toFixed(1)} `;
      if (bump) s += `C${(mx - tab).toFixed(1)},${(y1 - tab * 1.6).toFixed(1)} ${(mx + tab).toFixed(1)},${(y1 - tab * 1.6).toFixed(1)} ${(mx + tab).toFixed(1)},${y1.toFixed(1)} `;
      else      s += `C${(mx - tab).toFixed(1)},${(y1 + tab * 0.9).toFixed(1)} ${(mx + tab).toFixed(1)},${(y1 + tab * 0.9).toFixed(1)} ${(mx + tab).toFixed(1)},${y1.toFixed(1)} `;
      s += `L${x2.toFixed(1)},${y2.toFixed(1)} `;
    } else {
      const my = (y1 + y2) / 2;
      s += `L${x1.toFixed(1)},${(my - tab).toFixed(1)} `;
      if (bump) s += `C${(x1 + tab * 1.6).toFixed(1)},${(my - tab).toFixed(1)} ${(x1 + tab * 1.6).toFixed(1)},${(my + tab).toFixed(1)} ${x1.toFixed(1)},${(my + tab).toFixed(1)} `;
      else      s += `C${(x1 - tab * 0.9).toFixed(1)},${(my - tab).toFixed(1)} ${(x1 - tab * 0.9).toFixed(1)},${(my + tab).toFixed(1)} ${x1.toFixed(1)},${(my + tab).toFixed(1)} `;
      s += `L${x2.toFixed(1)},${y2.toFixed(1)} `;
    }
    return s;
  }
  let d = `M${ox.toFixed(1)},${oy.toFixed(1)} `;
  d += seg(ox, oy, ox + pw, oy, topBump, true);
  d += seg(ox + pw, oy, ox + pw, oy + ph, rightBump, false);
  d += seg(ox + pw, oy + ph, ox, oy + ph, bottomBump, true);
  d += seg(ox, oy + ph, ox, oy, leftBump, false);
  d += 'Z';
  return `<path d="${d}"/>`;
}

// ── Events: drag & drop + tap-to-place ─────────────────────────────────────
function wireJigsawEvents() {
  const S = JIGSAW_STATE;
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
    // ── Touch/pointer drag (mobile!) — HTML5 drag doesn't work on phones ──
    piece.addEventListener('pointerdown', function (e) {
      const si = parseInt(piece.dataset.piece);
      if (S.piecesArr[si].placed !== undefined) return;
      // long-press threshold: immediate grab feels like scroll; 120ms is enough
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
        // create floating ghost of the piece following the finger
        const g = piece.cloneNode(true);
        g.style.position = 'fixed';
        g.style.zIndex = '9999';
        g.style.pointerEvents = 'none';
        g.style.width = '74px'; g.style.height = '74px';
        g.style.left = (e.clientX - 37) + 'px';
        g.style.top = (e.clientY - 37) + 'px';
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
      if (!pd.moved) return; // it was a tap → handled by click handler
      // find the slot under the finger
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const slotEl = el && el.closest ? el.closest('.jig-slot') : null;
      if (slotEl) {
        const slotIdx = parseInt(slotEl.dataset.slot);
        placeJigsawPiece(pd.si, slotIdx);
      }
    });
    piece.addEventListener('click', () => {
      const si = parseInt(piece.dataset.piece);
      if (S.piecesArr[si].placed !== undefined) return;
      S.selected = (S.selected === si) ? -1 : si;
      document.querySelectorAll('.jig-piece').forEach((el, i) => el.classList.toggle('selected', i === S.selected));
      // NOTE: no correct-slot hint on select — it would reveal the answer
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
      // tap a FILLED slot → return that piece to the tray (allows fixing)
      if (S.board[slotIdx] !== null && S.selected < 0) {
        unplaceJigsawPiece(slotIdx);
        return;
      }
      if (S.selected >= 0) {
        const p = S.piecesArr[S.selected];
        const before = p ? (p.placed !== undefined) : true;
        placeJigsawPiece(S.selected, slotIdx);
        const after = p ? (p.placed !== undefined) : true;
        if (after && !before) {
          // success → clear selection
          S.selected = -1;
          document.querySelectorAll('.jig-piece').forEach(el => el.classList.remove('selected'));
        }
        // failure → keep selection so the user can try another slot
      }
    });
  });
}

function placeJigsawPiece(pieceIdx, slotIdx) {
  const S = JIGSAW_STATE;
  const p = S.piecesArr[pieceIdx];
  if (!p || p.placed !== undefined) return;
  if (S.board[slotIdx] !== null) return;

  // ═══ CORRECTNESS CHECK ═══════════════════════════════════════════════
  // A piece only fits its own slot (piece.idx === slotIdx). Wrong piece →
  // reject with feedback; win is only possible when every piece is in its
  // true position.
  if (p.idx !== slotIdx) {
    if (typeof sfxWrong === 'function') sfxWrong(); else if (typeof sfxFlip === 'function') sfxFlip();
    const slot = document.querySelector(`.jig-slot[data-slot="${slotIdx}"]`);
    if (slot) {
      slot.classList.remove('shake');
      void slot.offsetWidth; // restart animation
      slot.classList.add('shake');
      setTimeout(() => slot.classList.remove('shake'), 500);
    }
    const trayEl = document.querySelector(`.jig-piece[data-piece="${pieceIdx}"]`);
    if (trayEl) {
      trayEl.classList.remove('selected');
    }
    S.selected = -1;
    return;
  }
  // ═════════════════════════════════════════════════════════════════════

  S.board[slotIdx] = p.idx;
  p.placed = slotIdx;

  const slot = document.querySelector(`.jig-slot[data-slot="${slotIdx}"]`);
  if (slot) {
    const existing = slot.querySelector('img');
    if (existing) existing.remove();
    const im = document.createElement('img');
    im.src = p.data; im.alt = 'piece';
    slot.appendChild(im);
    slot.classList.add('has-piece');
  }
  const trayEl = document.querySelector(`.jig-piece[data-piece="${pieceIdx}"]`);
  if (trayEl) trayEl.classList.add('used');

  S.placedCount++;
  const fill = document.getElementById('jigFill');
  const cnt = document.getElementById('jigCount');
  if (fill) fill.style.width = (S.placedCount / S.board.length * 100) + '%';
  if (cnt) cnt.textContent = `${S.placedCount}/${S.board.length}`;

  if (S.placedCount === S.board.length) jigsawWin();
}

// Return a placed piece back to the tray (tap a filled slot)
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

  const fill = document.getElementById('jigFill');
  const cnt = document.getElementById('jigCount');
  if (fill) fill.style.width = (S.placedCount / S.board.length * 100) + '%';
  if (cnt) cnt.textContent = `${S.placedCount}/${S.board.length}`;
}

function jigsawWin() {
  const S = JIGSAW_STATE;
  if (S.solved) return;
  S.solved = true;
  const isHe = (typeof currentLang !== 'undefined' && currentLang === 'he');
  if (typeof sfxWin === 'function') sfxWin();
  if (typeof launchConfetti === 'function') { launchConfetti(); setTimeout(launchConfetti, 350); }
  setTimeout(() => { if (typeof levelComplete === 'function') levelComplete(); }, 600);
}

function jigsawRestart() {
  const S = JIGSAW_STATE;
  S.img = null; // same image: keep srcCanvas
  if (S.srcCanvas) {
    const container = document.getElementById('gameContent');
    const isHe = (typeof currentLang !== 'undefined' && currentLang === 'he');
    buildJigsawBoard(container, isHe);
  } else jigsawStart();
}
function jigsawNewImage() {
  const S = JIGSAW_STATE;
  S.img = null;
  const container = document.getElementById('gameContent');
  renderSetup(container);
}
