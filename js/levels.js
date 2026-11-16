const Levels = (() => {
  const KEY = 'gg_levels';
  function _all() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch (e) {
      return {};
    }
  }
  function get(id) {
    return Math.max(1, parseInt(_all()[id], 10) || 1);
  }
  function saveReached(id, lvl) {
    try {
      const a = _all();
      if ((parseInt(a[id], 10) || 1) < lvl) {
        a[id] = lvl;
        localStorage.setItem(KEY, JSON.stringify(a));
      }
    } catch (e) {
    }
  }
  function resetAll() {
    try {
      localStorage.removeItem(KEY);
    } catch (e) {
    }
  }
  function cur(id) {
    try {
      return Math.max(1, gameState[id].level || 1);
    } catch (e) {
      return 1;
    }
  }
  function count(id, base, step, max) {
    return Math.min(max, Math.round(base + (cur(id) - 1) * step));
  }
  function speed(id, baseMs, minMs) {
    return Math.max(minMs, Math.round(baseMs * Math.pow(0.93, cur(id) - 1)));
  }
  function isMilestone(lvl) {
    return lvl > 0 && lvl % 5 === 0;
  }
  function injectBadges() {
    const isHe = false;
    document.querySelectorAll('.premium-card[data-game]').forEach(card => {
      const id = card.dataset.game;
      const l = get(id);
      let chip = card.querySelector('.gg-level-chip');
      if (l <= 1) {
        if (chip)
          chip.remove();
        return;
      }
      if (!chip) {
        chip = document.createElement('div');
        chip.className = 'gg-level-chip';
        card.appendChild(chip);
      }
      chip.textContent = '\u2B50 ' + 'Lv ' + l;
    });
  }
  return {
    get,
    saveReached,
    resetAll,
    cur,
    count,
    speed,
    isMilestone,
    injectBadges
  };
})();