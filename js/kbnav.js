// ═══════════════════════════════════════════════════════════════════════════════
// kbnav.js — universal keyboard arrow navigation for every tap-based game.
// Arrow keys move a visible focus ring across the active game's clickable cells
// (any element with onclick inside #gameContent); Enter/Space activates it.
// Spatial: picks the nearest element in the pressed direction. Games with their
// own keyboard (Tetris) are skipped. Touch/tap still works everywhere unchanged.
// ═══════════════════════════════════════════════════════════════════════════════
(function(){
  const ROOT_ID = 'gameContent';
  const SKIP = new Set(['tetris']);          // has its own arrow handling
  let els = [], fi = -1, lastGame = null;

  const root = () => document.getElementById(ROOT_ID);
  const game = () => (typeof gameState !== 'undefined' && gameState.active) ? gameState.currentId : null;

  function scan(){
    const r = root();
    els = r ? [...r.querySelectorAll('[onclick]')].filter(el => {
      if (el.disabled) return false;
      const b = el.getBoundingClientRect();
      return b.width > 4 && b.height > 4;     // visible & sized
    }) : [];
    if (fi >= els.length) fi = els.length - 1;
  }

  function paint(){
    els.forEach((el, i) => {
      if (i === fi){ el.style.outline = '3px solid #f6c048'; el.style.outlineOffset = '2px'; el.style.borderRadius = el.style.borderRadius || '8px'; }
      else if (el.style.outline){ el.style.outline = ''; el.style.outlineOffset = ''; }
    });
    if (fi >= 0 && els[fi]) els[fi].scrollIntoView({ block:'nearest', inline:'nearest' });
  }

  function move(dir){
    if (!els.length) scan();
    if (!els.length) return;
    if (fi < 0){ fi = 0; paint(); return; }
    const c = els[fi].getBoundingClientRect();
    const cx = c.left + c.width/2, cy = c.top + c.height/2;
    let best = -1, bestScore = Infinity;
    els.forEach((el, i) => {
      if (i === fi) return;
      const r = el.getBoundingClientRect();
      const dx = (r.left + r.width/2) - cx, dy = (r.top + r.height/2) - cy;
      let ok = false, along = 0, perp = 0;
      if (dir === 'right'){ ok = dx > 4;  along = dx;  perp = Math.abs(dy); }
      else if (dir === 'left'){ ok = dx < -4; along = -dx; perp = Math.abs(dy); }
      else if (dir === 'down'){ ok = dy > 4;  along = dy;  perp = Math.abs(dx); }
      else if (dir === 'up'){ ok = dy < -4; along = -dy; perp = Math.abs(dx); }
      if (!ok) return;
      const score = along + perp * 2;         // aligned + nearby wins
      if (score < bestScore){ bestScore = score; best = i; }
    });
    if (best >= 0){ fi = best; paint(); }
  }

  function activate(){ if (fi >= 0 && els[fi]) els[fi].click(); }

  document.addEventListener('keydown', e => {
    const g = game();
    if (!g || SKIP.has(g)) return;
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    switch (e.key){
      case 'ArrowRight': move('right'); break;
      case 'ArrowLeft':  move('left');  break;
      case 'ArrowDown':  move('down');  break;
      case 'ArrowUp':    move('up');    break;
      case 'Enter': case ' ': activate(); break;
      default: return;
    }
    e.preventDefault();
  });

  // Re-scan when the active game re-renders; reset focus on game change.
  const r = root();
  if (r){
    new MutationObserver(() => {
      const g = game();
      if (!g || SKIP.has(g)){ els = []; fi = -1; return; }
      if (g !== lastGame){ lastGame = g; fi = -1; }   // fresh game → no focus until an arrow
      scan();
      if (fi >= 0) paint();
    }).observe(r, { childList:true, subtree:true });
  }
})();
