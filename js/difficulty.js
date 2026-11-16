const Difficulty = (() => {
  const KEY = 'gg_difficulty';
  const LEVELS = [
    'easy',
    'normal',
    'hard'
  ];
  function get() {
    const v = localStorage.getItem(KEY);
    return LEVELS.includes(v) ? v : 'normal';
  }
  function set(d) {
    if (!LEVELS.includes(d))
      return;
    localStorage.setItem(KEY, d);
    document.dispatchEvent(new CustomEvent('difficulty-changed', { detail: d }));
  }
  function multiplier() {
    switch (get()) {
    case 'easy':
      return 0.65;
    case 'hard':
      return 1.5;
    default:
      return 1;
    }
  }
  function pairsCount(base) {
    return Math.round(base * multiplier());
  }
  function speed(baseMs) {
    switch (get()) {
    case 'easy':
      return Math.round(baseMs * 1.5);
    case 'hard':
      return Math.round(baseMs * 0.6);
    default:
      return baseMs;
    }
  }
  function mistakes(base) {
    switch (get()) {
    case 'easy':
      return base + 2;
    case 'hard':
      return Math.max(1, base - 2);
    default:
      return base;
    }
  }
  const LABELS = {
    en: {
      easy: 'Easy',
      normal: 'Normal',
      hard: 'Hard'
    }
  };
  function renderSelector(container) {
    const lang = typeof currentLang !== 'undefined' && LABELS[currentLang] ? currentLang : 'he';
    const current = get();
    const L = LABELS[lang];
    const labels = {
      easy: '\uD83D\uDFE2 ' + L.easy,
      normal: '\uD83D\uDD35 ' + L.normal,
      hard: '\uD83D\uDD34 ' + L.hard
    };
    container.innerHTML = `
      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:center">
        ${ LEVELS.map(d => `
          <button
            class="diff-btn ${ d }${ current === d ? ' active' : '' }"
            onclick="Difficulty.set('${ d }');Difficulty.renderSelector(this.closest('[data-diff]'))"
            aria-pressed="${ current === d }">
            ${ labels[d] }
          </button>`).join('') }
      </div>`;
    container.setAttribute('data-diff', '1');
  }
  return {
    get,
    set,
    multiplier,
    pairsCount,
    speed,
    mistakes,
    renderSelector
  };
})();