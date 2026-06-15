// ═══════════════════════════════════════════════════════════════════════════════
// FAVORITES — pin/unpin games + last-played timestamps on cards
// ═══════════════════════════════════════════════════════════════════════════════
const Favorites = (() => {
  const FAV_KEY = 'gg_favs';
  const LP_PRE  = 'gg_lp_';

  function get() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch { return []; }
  }

  function toggle(id) {
    const favs = get();
    const idx  = favs.indexOf(id);
    if (idx >= 0) favs.splice(idx, 1); else favs.unshift(id);
    localStorage.setItem(FAV_KEY, JSON.stringify(favs.slice(0, 6)));
    injectButtons();
  }

  function recordPlay(id) {
    localStorage.setItem(LP_PRE + id, new Date().toISOString().slice(0, 10));
  }

  function _lastPlayed(id) {
    const v = localStorage.getItem(LP_PRE + id);
    if (!v) return '';
    const isHe  = typeof currentLang !== 'undefined' ? currentLang === 'he' : true;
    const today = new Date().toISOString().slice(0, 10);
    const diff  = Math.round((new Date(today) - new Date(v)) / 86400000);
    if (diff === 0) return isHe ? 'שיחקתם היום ✓' : 'Played today ✓';
    if (diff === 1) return isHe ? 'אתמול' : 'Yesterday';
    return isHe ? `לפני ${diff} ימים` : `${diff}d ago`;
  }

  function injectButtons() {
    const favs = get();
    document.querySelectorAll('.premium-card').forEach(card => {
      const m = card.getAttribute('onclick')?.match(/loadGame\('(\w+)'\)/);
      if (!m) return;
      const id = m[1];

      card.querySelector('.pin-btn')?.remove();
      card.querySelector('.last-played-label')?.remove();

      const pinned = favs.includes(id);
      const pin = document.createElement('button');
      pin.className = 'pin-btn' + (pinned ? ' pinned' : '');
      pin.setAttribute('aria-label', pinned ? 'Remove from favourites' : 'Add to favourites');
      pin.innerHTML = pinned ? '❤️' : '🤍';
      pin.onclick = e => { e.stopPropagation(); toggle(id); };
      card.appendChild(pin);

      const lbl = _lastPlayed(id);
      if (lbl) {
        const inner = card.querySelector('.p-5');
        if (inner) {
          const p = document.createElement('p');
          p.className = 'last-played-label';
          p.textContent = lbl;
          inner.appendChild(p);
        }
      }
    });

    // Float pinned cards to top via CSS order (works in both grid and flex)
    const grid = document.getElementById('homeScreen');
    if (grid) {
      grid.querySelectorAll('.premium-card').forEach(card => {
        const m  = card.getAttribute('onclick')?.match(/loadGame\('(\w+)'\)/);
        const id  = m?.[1];
        const ord = id ? favs.indexOf(id) : -1;
        card.style.order = ord >= 0 ? String(ord) : '99';
      });
    }
  }

  return { get, toggle, recordPlay, injectButtons };
})();
