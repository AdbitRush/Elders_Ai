// ═══════════════════════════════════════════════════════════════════════════════
// LEVEL PROGRESSION SYSTEM  (js/levels.js)
// Persistent per-game levels: resume where you left off, scale difficulty with
// level, celebrate milestones, show level chips on home cards.
// Usage: Levels.get(id)                 → highest level reached (localStorage)
//        Levels.saveReached(id, lvl)    → record progress (only ever goes up)
//        Levels.count(id, base, step, max) → count-type param grown by level
//        Levels.speed(id, baseMs, minMs)   → delay-type param shrunk by level
//        Levels.isMilestone(lvl)        → every 5th level = big celebration
//        Levels.injectBadges()          → level chips on .premium-card[data-game]
// ═══════════════════════════════════════════════════════════════════════════════

const Levels = (() => {
  const KEY = 'gg_levels';

  function _all() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
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
    } catch (e) {}
  }

  function resetAll() { try { localStorage.removeItem(KEY); } catch (e) {} }

  // Level of the game currently being played (games call this in init)
  function cur(id) {
    try { return Math.max(1, gameState[id].level || 1); } catch (e) { return 1; }
  }

  // Count-type param: grows by `step` per level, capped at `max`
  function count(id, base, step, max) {
    return Math.min(max, Math.round(base + (cur(id) - 1) * step));
  }

  // Delay-type param: 7% faster per level, floored at minMs
  function speed(id, baseMs, minMs) {
    return Math.max(minMs, Math.round(baseMs * Math.pow(0.93, cur(id) - 1)));
  }

  function isMilestone(lvl) { return lvl > 0 && lvl % 5 === 0; }

  // Gold level chip on every home card (skip untouched games)
  function injectBadges() {
    const isHe = (typeof currentLang !== 'undefined') ? currentLang === 'he' : true;
    document.querySelectorAll('.premium-card[data-game]').forEach(card => {
      const id = card.dataset.game;
      const l = get(id);
      let chip = card.querySelector('.gg-level-chip');
      if (l <= 1) { if (chip) chip.remove(); return; }
      if (!chip) {
        chip = document.createElement('div');
        chip.className = 'gg-level-chip';
        card.appendChild(chip);
      }
      chip.textContent = '⭐ ' + (isHe ? 'שלב ' : 'Lv ') + l;
    });
  }

  return { get, saveReached, resetAll, cur, count, speed, isMilestone, injectBadges };
})();
