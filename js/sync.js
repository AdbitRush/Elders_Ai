// ═══════════════════════════════════════════════════════════════════════════════
// CLOUD SYNC  (js/sync.js)
// Supabase anonymous auth — syncs scores/streak/achievements across devices.
// Works entirely via CDN (no build step).
//
// Setup:
//   1. Create a Supabase project → run supabase_schema.sql
//   2. Fill in SUPABASE_URL and SUPABASE_ANON_KEY below
//   3. That's it — init() is called on page load, push() after every win
// ═══════════════════════════════════════════════════════════════════════════════
const Sync = (() => {

  // ── ⚙️  Config — fill these in ─────────────────────────────────────────────
  const SUPABASE_URL      = '';   // https://xxxx.supabase.co
  const SUPABASE_ANON_KEY = '';   // your project's anon / public key
  // ────────────────────────────────────────────────────────────────────────────

  const ALL_GAMES = [
    'memory','oddoneout','math','wordsearch','simon','sudoku','shapes',
    'solitaire','trivia','numseq','unscramble','pairs','truefalse','flags',
    'proverbs','hangman','recall','tetris',
  ];

  let _db    = null;
  let _ready = false;
  let _uid   = null;
  let _pushTimer = null;

  // ── Snapshot current localStorage state ───────────────────────────────────
  function _snapshot() {
    const scores = {};
    ALL_GAMES.forEach(id => {
      const v = parseInt(localStorage.getItem('gg_hs_' + id) || '0');
      if (v > 0) scores[id] = v;
    });
    return {
      name:         localStorage.getItem('gg_name') || '',
      avatar:       localStorage.getItem('gg_avatar') || '⭐',
      streak:       parseInt(localStorage.getItem('gg_streak') || '0'),
      total_games:  parseInt(localStorage.getItem('gg_total_games') || '0'),
      last_date:    localStorage.getItem('gg_last_date') || '',
      achievements: JSON.parse(localStorage.getItem('gg_achievements') || '[]'),
      lang:         typeof currentLang !== 'undefined' ? currentLang : 'he',
      brain_score:  typeof BrainScore !== 'undefined' ? BrainScore.compute() : 0,
      scores,
    };
  }

  // ── Merge remote row into localStorage (max wins everywhere) ──────────────
  function _merge(row) {
    if (!row) return;

    // Name / avatar: only fill if blank locally
    if (row.name && !localStorage.getItem('gg_name'))
      localStorage.setItem('gg_name', row.name);
    if (row.avatar && !localStorage.getItem('gg_avatar'))
      localStorage.setItem('gg_avatar', row.avatar);
    if (row.lang && !localStorage.getItem('gg_lang'))
      localStorage.setItem('gg_lang', row.lang);

    // Numeric: take max
    const localStreak = parseInt(localStorage.getItem('gg_streak') || '0');
    const localTotal  = parseInt(localStorage.getItem('gg_total_games') || '0');
    if ((row.streak || 0) > localStreak)
      localStorage.setItem('gg_streak', String(row.streak));
    if ((row.total_games || 0) > localTotal)
      localStorage.setItem('gg_total_games', String(row.total_games));

    // last_date: take newer of the two
    const remDate   = row.last_date || '';
    const localDate = localStorage.getItem('gg_last_date') || '';
    if (remDate > localDate)
      localStorage.setItem('gg_last_date', remDate);

    // Scores: take max per game
    const rScores = row.scores || {};
    Object.entries(rScores).forEach(([id, v]) => {
      const local = parseInt(localStorage.getItem('gg_hs_' + id) || '0');
      if (v > local) localStorage.setItem('gg_hs_' + id, String(v));
    });

    // Achievements: union (never lose a badge)
    const localAch = new Set(JSON.parse(localStorage.getItem('gg_achievements') || '[]'));
    (row.achievements || []).forEach(a => localAch.add(a));
    localStorage.setItem('gg_achievements', JSON.stringify([...localAch]));

    _refreshUI();
  }

  function _refreshUI() {
    if (typeof Retention !== 'undefined')     Retention.renderBar();
    if (typeof refreshHSBadges === 'function') refreshHSBadges();
    if (typeof Profile !== 'undefined')        Profile.updateGreetingEl();
    if (typeof BrainScore !== 'undefined') {
      const slot = document.getElementById('brain-score-slot');
      if (slot) BrainScore.renderWidget(slot);
    }
  }

  // ── Push local state → Supabase (debounced 1.5 s) ─────────────────────────
  function push() {
    if (!_ready || !_uid) return;
    clearTimeout(_pushTimer);
    _pushTimer = setTimeout(async () => {
      const payload = { ..._snapshot(), id: _uid, updated_at: new Date().toISOString() };
      const { error } = await _db.from('user_progress').upsert(payload, { onConflict: 'id' });
      if (error) console.warn('[Sync] push error:', error.message);
    }, 1500);
  }

  // ── Pull remote → local ────────────────────────────────────────────────────
  async function pull() {
    if (!_ready || !_uid) return;
    const { data, error } = await _db
      .from('user_progress').select('*').eq('id', _uid).maybeSingle();
    if (!error) _merge(data);
  }

  // ── Optional: link email to anonymous account (call from UI) ──────────────
  async function linkEmail(email) {
    if (!_ready) return { error: 'Sync not connected' };
    const { error } = await _db.auth.updateUser({ email });
    return error ? { error: error.message } : { ok: true };
  }

  // ── Indicator dot (shown in nav when connected) ────────────────────────────
  function _showDot(state) {
    let dot = document.getElementById('sync-dot');
    if (!dot) {
      dot = document.createElement('span');
      dot.id = 'sync-dot';
      dot.title = 'Cloud sync';
      dot.style.cssText = 'width:7px;height:7px;border-radius:50%;display:inline-block;flex-shrink:0;transition:background 0.4s';
      // Insert next to the 📊 button in nav
      const nav = document.querySelector('nav .flex.gap-4');
      if (nav) nav.prepend(dot);
    }
    dot.style.background = state === 'ok' ? '#4ade80' : state === 'err' ? '#f87171' : '#fbbf24';
    dot.style.boxShadow  = state === 'ok' ? '0 0 6px #4ade80' : 'none';
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  async function init() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
    if (typeof supabase === 'undefined') {
      console.warn('[Sync] Supabase SDK not loaded.'); return;
    }

    _showDot('pending');
    _db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Restore existing session or create a new anonymous one
    const { data: { session } } = await _db.auth.getSession();
    if (session?.user) {
      _uid = session.user.id;
    } else {
      const { data, error } = await _db.auth.signInAnonymously();
      if (error || !data?.user) { _showDot('err'); return; }
      _uid = data.user.id;
    }

    _ready = true;
    _showDot('ok');

    // Pull remote first (inherit best scores from other devices), then push local
    await pull();
    await push();

    // Keep session fresh
    _db.auth.onAuthStateChange((_event, s) => { if (s?.user) _uid = s.user.id; });
  }

  return { init, push, pull, linkEmail };
})();
