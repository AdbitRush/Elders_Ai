// ═══════════════════════════════════════════════════════════════════════════════
// STATISTICS & SCOREBOARD  (js/stats.js)
// Usage: Stats.renderScoreboard(container)  or  Stats.showModal()
// ═══════════════════════════════════════════════════════════════════════════════

const Stats = (() => {
  const ALL_GAMES = [
    'memory','oddoneout','math','wordsearch','simon','sudoku','shapes',
    'solitaire','trivia','numseq','unscramble','pairs','truefalse','flags',
    'proverbs','hangman','recall','tetris'
  ];

  // Map game id → display label (bilingual lookup via t())
  const TITLE_KEYS = {
    memory:'game_memory_title', oddoneout:'game_odd_title', math:'game_math_title',
    wordsearch:'game_words_title', simon:'game_simon_title', sudoku:'game_sudoku_title',
    shapes:'game_shapes_title', solitaire:'game_solitaire_title', trivia:'game_trivia_title',
    numseq:'game_numseq_title', unscramble:'game_unscrbl_title', pairs:'game_pairs_title',
    truefalse:'game_tf_title', flags:'game_flags_title', proverbs:'game_proverbs_title',
    hangman:'game_hangman_title', recall:'game_recall_title', tetris:'game_tetris_title',
  };

  function getAllScores() {
    return ALL_GAMES.map(id => ({
      id,
      hs: parseInt(localStorage.getItem('gg_hs_' + id) || '0'),
      label: (typeof t === 'function' ? t(TITLE_KEYS[id]) : null) || id,
    }));
  }

  function clearScore(id) {
    localStorage.removeItem('gg_hs_' + id);
  }

  function clearAll() {
    ALL_GAMES.forEach(clearScore);
    localStorage.removeItem('gg_streak');
    localStorage.removeItem('gg_today_count');
    localStorage.removeItem('gg_total_games');
    localStorage.removeItem('gg_last_date');
  }

  function summary() {
    const scores = getAllScores();
    const played  = scores.filter(s => s.hs > 0).length;
    const total   = parseInt(localStorage.getItem('gg_total_games') || '0');
    const streak  = parseInt(localStorage.getItem('gg_streak') || '0');
    return { played, total, streak, scores };
  }

  function renderScoreboard(container) {
    const isHe = (typeof currentLang !== 'undefined') ? currentLang === 'he' : true;
    const { played, total, streak, scores } = summary();
    const sorted = [...scores].sort((a, b) => b.hs - a.hs);
    const hasAny = sorted.some(s => s.hs > 0);

    container.innerHTML = `
      <div style="width:100%;max-width:520px;margin:0 auto">
        <h2 style="font-size:1.5rem;font-weight:800;color:#1a365d;margin-bottom:1rem;text-align:center">
          ${isHe ? '📊 לוח שיאים' : '📊 Scoreboard'}
        </h2>

        <!-- Summary pills -->
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:1.5rem">
          <span style="background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;padding:4px 14px;border-radius:9999px;font-size:0.85rem;font-weight:700">
            🎮 ${isHe ? 'סה״כ' : 'Total'}: ${total}
          </span>
          <span style="background:#fefce8;border:1px solid #fde68a;color:#92400e;padding:4px 14px;border-radius:9999px;font-size:0.85rem;font-weight:700">
            🔥 ${streak} ${isHe ? 'ימים' : 'days'}
          </span>
          <span style="background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;padding:4px 14px;border-radius:9999px;font-size:0.85rem;font-weight:700">
            ✅ ${played}/18 ${isHe ? 'משחקים' : 'games'}
          </span>
        </div>

        ${!hasAny
          ? `<p style="text-align:center;color:#94a3b8;font-size:0.95rem">${isHe ? 'שחקו משחק כלשהו כדי להתחיל לצבור שיאים!' : 'Play any game to start earning high scores!'}</p>`
          : sorted.map(s => `
            <div class="stats-row" style="margin-bottom:8px;direction:${isHe?'rtl':'ltr'}">
              <span style="font-weight:600;color:#1e293b;font-size:0.95rem">${s.label}</span>
              ${s.hs > 0
                ? `<span class="stats-badge">🏅 ${s.hs}</span>`
                : `<span style="color:#94a3b8;font-size:0.8rem">${isHe ? '—' : '—'}</span>`
              }
            </div>`).join('')
        }

        <button
          onclick="Stats.clearAll();Stats.renderScoreboard(this.closest('[data-stats]'))"
          style="margin-top:1.5rem;width:100%;background:#fef2f2;border:1px solid #fecaca;color:#991b1b;border-radius:0.75rem;padding:0.6rem;font-weight:700;cursor:pointer;font-size:0.85rem">
          ${isHe ? '🗑️ אפס את כל השיאים' : '🗑️ Reset all scores'}
        </button>
      </div>
    `;
    container.setAttribute('data-stats', '1');
  }

  function showModal() {
    let overlay = document.getElementById('stats-modal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'stats-modal';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:200;display:flex;align-items:center;justify-content:center;padding:1rem';
      overlay.innerHTML = `
        <div style="background:#fff;border-radius:1.5rem;padding:2rem;max-width:560px;width:100%;max-height:85vh;overflow-y:auto;position:relative;box-shadow:0 32px 80px rgba(0,0,0,0.6)">
          <button onclick="document.getElementById('stats-modal').remove()"
            style="position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.4rem;cursor:pointer;color:#64748b" aria-label="Close">✕</button>
          <div id="stats-content"></div>
        </div>`;
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
    renderScoreboard(document.getElementById('stats-content'));
  }

  return { getAllScores, clearScore, clearAll, summary, renderScoreboard, showModal };
})();
