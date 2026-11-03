// ═══════════════════════════════════════════════════════════════════════════════
// SPOT THE DIFFERENCE on vintage photos (2026-10, wave 2). Real 1976-1978 American street and boardwalk photos by
// John Margolies (Library of Congress, Roadside America archive - public domain; credited on credits.html).
// The second picture is changed in the browser: 5 spots where the photo has detail get a color swap, a patch copied
// from next door, a mirrored patch or a lighter/darker patch - each checked to differ clearly from the original.
// Tap a difference on either picture. Hint flashes one. All 5 found = "Well Done!"; Give up shows them = "Nice try".
// ═══════════════════════════════════════════════════════════════════════════════
const SD_PHOTOS = [
  ['images/spotdiff/asbury-park-1978.jpg', 'Asbury Park, New Jersey, 1978'],
  ['images/spotdiff/seaside-heights-1978.jpg', 'Boardwalk street, Seaside Heights, New Jersey, 1978'],
  ['images/spotdiff/ocean-city-1978.jpg', 'Boardwalk, Ocean City, New Jersey, 1978'],
  ['images/spotdiff/deposit-ny-1977.jpg', 'Front Street, Deposit, New York, 1977'],
  ['images/spotdiff/alta-vista-1976.jpg', 'Main Street, Alta Vista, Kansas, 1976'],
  ['images/spotdiff/solvang-1976.jpg', 'Street view, Solvang, California, 1976'],
  ['images/spotdiff/keansburg-1978.jpg', 'Amusement park entry, Keansburg, New Jersey, 1978'],
  ['images/spotdiff/skeeball-1978.jpg', 'Arcade, Seaside Park, New Jersey, 1978'],
  ['images/spotdiff/basketball-toss-1978.jpg', 'Basketball toss, Seaside Heights, New Jersey, 1978'],
  ['images/spotdiff/drive-in-houston-1977.jpg', 'Airline Drive-In, Houston, Texas, 1977'],
];
function initSpotDiff(container) {
    const gs = gameState.spotdiff;
    const seenK = 'gg_sd_seen'; let seen = []; try { seen = JSON.parse(localStorage.getItem(seenK)) || []; } catch (e) {}
    let pick = SD_PHOTOS.findIndex((_, i) => !seen.includes(i)); if (pick < 0) { seen = []; pick = Math.floor(Math.random() * SD_PHOTOS.length); }
    try { localStorage.setItem(seenK, JSON.stringify(seen.concat(pick))); } catch (e) {}
    gs.photo = SD_PHOTOS[pick]; gs.spots = []; gs.found = []; gs.over = false; gs.miss = 0; gs.hints = 0; gs.ready = false;
    gs.msg = 'Loading the photo...';
    _sdRender();
    const img = new Image();
    img.onload = () => { if (gameState.currentId !== 'spotdiff' || gs.photo[0] !== SD_PHOTOS[pick][0]) return; _sdMake(img); };
    img.onerror = () => { gs.msg = 'The photo could not be loaded. Check your connection and try again.'; _sdRender(); };
    img.src = gs.photo[0] + (typeof ASSET_V !== 'undefined' ? '?v=' + ASSET_V : '');
}
function _sdMake(img) {
    const gs = gameState.spotdiff, W = img.naturalWidth, H = img.naturalHeight;
    const a = document.createElement('canvas'); a.width = W; a.height = H; const ca = a.getContext('2d'); ca.drawImage(img, 0, 0);
    const b = document.createElement('canvas'); b.width = W; b.height = H; const cb = b.getContext('2d'); cb.drawImage(img, 0, 0);
    const R = Math.round(W * 0.055);
    const src = ca.getImageData(0, 0, W, H).data;
    // candidate spots ranked by detail (pixel variance), away from the edges
    const cand = [];
    for (let y = R * 1.5; y < H - R * 1.5; y += R * 0.7) for (let x = R * 1.5; x < W - R * 1.5; x += R * 0.7) {
        let s = 0, s2 = 0, k = 0;
        for (let dy = -R; dy <= R; dy += 4) for (let dx = -R; dx <= R; dx += 4) { const i = ((Math.round(y + dy)) * W + Math.round(x + dx)) * 4; const v = src[i] * 0.3 + src[i + 1] * 0.59 + src[i + 2] * 0.11; s += v; s2 += v * v; k++; }
        cand.push({ x: Math.round(x), y: Math.round(y), v: s2 / k - (s / k) * (s / k) + Math.random() * 200 });
    }
    cand.sort((p, q) => q.v - p.v);
    const kinds = shuffle(['swap', 'clone', 'mirror', 'shade', 'swap', 'clone']);
    const diffOf = (x, y) => { const o = ca.getImageData(x - R, y - R, 2 * R, 2 * R).data, n = cb.getImageData(x - R, y - R, 2 * R, 2 * R).data; let d = 0, k = 0; for (let i = 0; i < o.length; i += 16) { d += Math.abs(o[i] - n[i]) + Math.abs(o[i + 1] - n[i + 1]) + Math.abs(o[i + 2] - n[i + 2]); k++; } return d / k / 3; };
    const circle = (ctx, x, y) => { ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.clip(); };
    for (const c of cand) {
        if (gs.spots.length >= 5) break;
        if (gs.spots.some((s) => Math.hypot(s.x - c.x, s.y - c.y) < R * 3.2)) continue;
        for (let t = 0; t < 3; t++) {
            const kind = kinds[(gs.spots.length + t) % kinds.length];
            const before = cb.getImageData(c.x - R, c.y - R, 2 * R, 2 * R);
            circle(cb, c.x, c.y);
            if (kind === 'swap') { const d = cb.getImageData(c.x - R, c.y - R, 2 * R, 2 * R); for (let i = 0; i < d.data.length; i += 4) { const r = d.data[i]; d.data[i] = d.data[i + 2]; d.data[i + 2] = d.data[i + 1]; d.data[i + 1] = r; } const tmp = document.createElement('canvas'); tmp.width = tmp.height = 2 * R; tmp.getContext('2d').putImageData(d, 0, 0); cb.drawImage(tmp, c.x - R, c.y - R); }
            else if (kind === 'clone') { const off = (c.x + R * 2.4 < W - R ? 1 : -1) * R * 2.4; cb.drawImage(a, c.x - R + off, c.y - R, 2 * R, 2 * R, c.x - R, c.y - R, 2 * R, 2 * R); }
            else if (kind === 'mirror') { cb.translate(c.x * 2, 0); cb.scale(-1, 1); cb.drawImage(a, c.x - R, c.y - R, 2 * R, 2 * R, c.x - R, c.y - R, 2 * R, 2 * R); }
            else { cb.fillStyle = Math.random() < 0.5 ? 'rgba(0,0,0,.45)' : 'rgba(255,255,255,.5)'; cb.fillRect(c.x - R, c.y - R, 2 * R, 2 * R); }
            cb.restore();
            if (diffOf(c.x, c.y) >= 28) { gs.spots.push({ x: c.x / W, y: c.y / H, r: R / W, kind }); break; }
            cb.putImageData(before, c.x - R, c.y - R);   // too subtle: undo and try another kind
        }
    }
    gs.urlA = a.toDataURL('image/jpeg', 0.86); gs.urlB = b.toDataURL('image/jpeg', 0.86); gs.ratio = H / W;
    gs.ready = true; gs.msg = `Find the ${gs.spots.length} differences. Tap them on either picture.`;
    _sdRender();
}
function sdTap(ev, which) {
    const gs = gameState.spotdiff; if (gs.over || !gs.ready) return;
    const r = ev.currentTarget.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
    const i = gs.spots.findIndex((s, k) => !gs.found.includes(k) && Math.hypot(s.x - x, (s.y - y) * gs.ratio) < s.r * 1.6);
    if (i < 0) {
        if (gs.spots.some((s, k) => gs.found.includes(k) && Math.hypot(s.x - x, (s.y - y) * gs.ratio) < s.r * 1.6)) return;
        gs.miss++; gs.msg = 'Not there - look again.'; if (typeof sfxWrong === 'function') sfxWrong(); return _sdRender();
    }
    gs.found.push(i); if (typeof sfxCorrect === 'function') sfxCorrect();
    const left = gs.spots.length - gs.found.length;
    if (!left) { gs.over = true; gs.msg = 'You found them all!'; _sdRender(); return GameKit.finish('spotdiff', true, `All ${gs.spots.length} differences found${gs.hints ? ` (${gs.hints} with a hint)` : ''}. Photo: ${gs.photo[1]}.`); }
    gs.msg = `Found one! ${left} to go.`; _sdRender();
}
function sdHint() {
    const gs = gameState.spotdiff; if (gs.over || !gs.ready) return;
    const i = gs.spots.findIndex((_, k) => !gs.found.includes(k)); if (i < 0) return;
    gs.hints++; gs.flash = i; gs.msg = 'Look inside the dashed circle.'; _sdRender();
    setTimeout(() => { if (gs.flash === i) { gs.flash = null; _sdRender(); } }, 2600);
}
function sdGiveUp() { const gs = gameState.spotdiff; if (gs.over || !gs.ready) return; gs.over = true; gs.reveal = true; gs.msg = 'Here they are.'; _sdRender(); GameKit.finish('spotdiff', false, `You found ${gs.found.length} of ${gs.spots.length}. The rest are circled on the pictures.`); }
function _sdRender() {
    const gs = gameState.spotdiff, el = document.getElementById('gameContent');
    if (!el || gameState.currentId !== 'spotdiff') return;
    const marks = gs.spots.map((s, k) => {
        const on = gs.found.includes(k), fl = gs.flash === k, rv = gs.reveal && !on;
        if (!on && !fl && !rv) return '';
        return `<span class="sd-m${on ? '' : ' sd-hint'}" style="left:${(s.x - s.r * 1.3) * 100}%;top:${(s.y - s.r * 1.3 / gs.ratio) * 100}%;width:${s.r * 260}%;height:${s.r * 260 / gs.ratio}%"></span>`;
    }).join('');
    const pic = (url, w, label) => `<div class="sd-p" onclick="sdTap(event,${w})" role="img" aria-label="${label}"><img src="${url}" alt="" draggable="false">${marks}</div>`;
    el.innerHTML = `<div class="sd" dir="ltr">
      <div class="sd-top"><span>Found <b>${gs.found.length}</b> of ${gs.spots.length || 5}</span><span class="sd-cap">${QuizKit.esc(gs.photo[1])}</span></div>
      ${gs.ready ? `<div class="sd-pics">${pic(gs.urlA, 0, 'original photo')}${pic(gs.urlB, 1, 'changed photo')}</div>` : '<div class="sd-wait">Loading...</div>'}
      <div class="cw-msg" role="status">${gs.msg}</div>
      <div class="gk-btns">${GameKit.btn('Hint', 'sdHint()', { disabled: !gs.ready || gs.over })}${GameKit.btn('Give up', 'sdGiveUp()', { disabled: !gs.ready || gs.over })}</div>
      <div class="sd-credit">Photo: John Margolies, Roadside America archive, Library of Congress (public domain).</div>
    </div>
    <style>
      .sd{width:100%;box-sizing:border-box;max-width:70rem;margin:0 auto;color:#2b1b0d}
      .sd-top{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;font-size:1.15rem;margin-bottom:8px}
      .sd-cap{font-style:italic;color:#4a3420}
      .sd-pics{display:grid;gap:10px}
      @media(min-width:900px){.sd-pics{grid-template-columns:1fr 1fr}}
      .sd-p{position:relative;border:4px solid #fffdf7;box-shadow:0 2px 8px rgba(0,0,0,.25);border-radius:6px;overflow:hidden;cursor:crosshair;touch-action:manipulation;user-select:none;line-height:0}
      .sd-p img{width:100%;height:auto;display:block;pointer-events:none}
      .sd-m{position:absolute;border:5px solid #16a34a;border-radius:50%;box-shadow:0 0 0 3px #fff;pointer-events:none}
      .sd-m.sd-hint{border:5px dashed #f59e0b}
      .sd-wait{padding:60px;text-align:center;font-weight:800}
      .sd .gk-btn{border-color:#c9a46a}
      .cw-msg{text-align:center;font-weight:800;margin:10px 0;min-height:1.5em}
      .sd-credit{text-align:center;font-size:.9rem;color:#5b3f22}
    </style>`;
}
