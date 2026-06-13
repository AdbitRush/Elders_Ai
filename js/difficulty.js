// ═══════════════════════════════════════════════════════════════════════════════
// DIFFICULTY SYSTEM  (js/difficulty.js)
// Provides Easy / Normal / Hard that game modules read at init time.
// Usage: Difficulty.get() → 'easy'|'normal'|'hard'
//        Difficulty.pairsCount(base) → adjusted pair count
//        Difficulty.speed(baseMs) → adjusted delay ms
//        Difficulty.renderSelector(container) → inserts 3 pill buttons
// ═══════════════════════════════════════════════════════════════════════════════

const Difficulty = (() => {
  const KEY = 'gg_difficulty';
  const LEVELS = ['easy', 'normal', 'hard'];

  function get() {
    const v = localStorage.getItem(KEY);
    return LEVELS.includes(v) ? v : 'normal';
  }

  function set(d) {
    if (!LEVELS.includes(d)) return;
    localStorage.setItem(KEY, d);
    document.dispatchEvent(new CustomEvent('difficulty-changed', { detail: d }));
  }

  // How much harder/easier a numeric param gets
  function multiplier() {
    switch (get()) {
      case 'easy': return 0.65;
      case 'hard': return 1.5;
      default:     return 1.0;
    }
  }

  // Pair counts (memory, shapes …)
  function pairsCount(base) {
    return Math.round(base * multiplier());
  }

  // Delays (simon flash speed, recall timer …)  — inverted: easy = slower
  function speed(baseMs) {
    switch (get()) {
      case 'easy': return Math.round(baseMs * 1.5);
      case 'hard': return Math.round(baseMs * 0.6);
      default:     return baseMs;
    }
  }

  // Allowed mistakes (hangman, simon …)
  function mistakes(base) {
    switch (get()) {
      case 'easy': return base + 2;
      case 'hard': return Math.max(1, base - 2);
      default:     return base;
    }
  }

  function renderSelector(container) {
    const isHe = (typeof currentLang !== 'undefined') ? currentLang === 'he' : true;
    const current = get();
    const labels = {
      easy:   isHe ? '🟢 קל'    : '🟢 Easy',
      normal: isHe ? '🔵 רגיל'  : '🔵 Normal',
      hard:   isHe ? '🔴 קשה'   : '🔴 Hard',
    };
    container.innerHTML = `
      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:center">
        ${LEVELS.map(d => `
          <button
            class="diff-btn ${d}${current === d ? ' active' : ''}"
            onclick="Difficulty.set('${d}');Difficulty.renderSelector(this.closest('[data-diff]'))"
            aria-pressed="${current === d}">
            ${labels[d]}
          </button>`).join('')}
      </div>`;
    container.setAttribute('data-diff', '1');
  }

  return { get, set, multiplier, pairsCount, speed, mistakes, renderSelector };
})();
