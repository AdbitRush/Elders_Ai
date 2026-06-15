// ═══════════════════════════════════════════════════════════════════════════════
// BRAIN HEALTH SCORE — composite metric: variety + streak + volume + mastery
// ═══════════════════════════════════════════════════════════════════════════════
const BrainScore = (() => {
  const ALL = ['memory','oddoneout','math','wordsearch','simon','sudoku','shapes','solitaire',
               'trivia','numseq','unscramble','pairs','truefalse','flags','proverbs','hangman','recall','tetris'];

  function compute() {
    const total  = parseInt(localStorage.getItem('gg_total_games') || '0');
    const streak = parseInt(localStorage.getItem('gg_streak') || '0');
    let uniqueGames = 0, hsSum = 0;
    ALL.forEach(id => {
      const v = parseInt(localStorage.getItem('gg_hs_' + id) || '0');
      if (v > 0) { uniqueGames++; hsSum += Math.min(v, 10); }
    });
    const variety  = (uniqueGames / 18) * 35;
    const streakPt = (Math.min(streak, 30) / 30) * 30;
    const volume   = (Math.min(total, 100) / 100) * 20;
    const mastery  = (hsSum / (18 * 10)) * 15;
    return Math.round(Math.min(100, variety + streakPt + volume + mastery));
  }

  function renderWidget(container) {
    const score = compute();
    const isHe  = typeof currentLang !== 'undefined' ? currentLang === 'he' : true;
    const label  = isHe ? 'בריאות מוח' : 'Brain Health';
    container.innerHTML = `
      <div id="brain-score-widget">
        <span style="font-size:0.78rem;color:#6ee7b7;font-weight:700">🧠 ${label}</span>
        <div id="brain-score-bar-wrap"><div id="brain-score-bar" style="width:0%"></div></div>
        <span style="font-size:0.82rem;font-weight:800;color:#34d399">${score}</span>
      </div>`;
    setTimeout(() => {
      const bar = document.getElementById('brain-score-bar');
      if (bar) bar.style.width = score + '%';
    }, 250);
  }

  return { compute, renderWidget };
})();
