// ═══════════════════════════════════════════════════════════════════════════════
// CLOUD SYNC  (js/sync.js)  — progress that follows the player between devices
// ═══════════════════════════════════════════════════════════════════════════════
//
// SETUP (two values, then it turns itself on):
//   1. Create a project at supabase.com
//   2. SQL Editor → paste supabase_schema.sql → Run
//   3. Settings → API → copy "Project URL" and the "anon public" key into
//      SUPABASE_URL / SUPABASE_ANON_KEY below
//
// Until those are filled in this file does nothing at all: no network calls, no
// buttons, no errors. The game works exactly as it does today, offline, out of
// localStorage. Nothing here is load-bearing.
//
// ── HOW IT WORKS, AND WHY NOT THE OBVIOUS WAY ────────────────────────────────
//
// The previous version used supabase.auth.signInAnonymously(). That gives each
// BROWSER its own anonymous user, so a phone got a different user than a laptop
// and therefore a different row. It could back a device up; it could never move
// progress to another device, which is the entire point.
//
// So: identity is a secret uuid this browser generates once and keeps. To bring
// a second device in, the player asks for a 6-character code and types it there.
// No email, no password, no account. The audience is people in their seventies
// and eighties — a sign-up form is where they stop, and a forgotten password is
// a support call nobody is there to answer.
//
// The code lives 30 minutes. Losing the device without pairing another loses the
// progress, and that is the honest trade for having no account to recover.
//
// ── SAFETY ───────────────────────────────────────────────────────────────────
//
// Merging is max-wins on every counter and union on achievements, both here and
// in SQL. Sync can raise a number; it can never lower one. A device that has
// been offline for a month cannot push stale zeros over good scores, and two
// devices used the same day cannot erase each other.
//
// Every call is wrapped and every failure is silent apart from the status dot.
// If Supabase is down, slow, or blocked, the game keeps working from
// localStorage exactly as if sync had never been configured.

const Sync = (() => {

  // ── ⚙️  Config — fill these two in ──────────────────────────────────────────
  const SUPABASE_URL      = '';   // https://xxxxxxxx.supabase.co
  const SUPABASE_ANON_KEY = '';   // the "anon public" key — safe in a public page
  // ────────────────────────────────────────────────────────────────────────────

  const ID_KEY = 'gg_sync_id';
  let _db = null, _id = null, _ready = false, _pushTimer = null;

  const configured = () => !!(SUPABASE_URL && SUPABASE_ANON_KEY);

  // The list of games comes from window.GAME_IDS, the same array index.html and
  // the scoreboard use. It was hard-coded here at 18 games, so the nine newest
  // would have synced no scores at all — the same drift that hit the scoreboard
  // and the skill badges. Never copy this list.
  const gameIds = () =>
    (typeof window !== 'undefined' && Array.isArray(window.GAME_IDS) && window.GAME_IDS.length)
      ? window.GAME_IDS : [];

  function myId() {
    let v = null;
    try { v = localStorage.getItem(ID_KEY); } catch (e) { return null; }
    if (!v) {
      v = (crypto && crypto.randomUUID) ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
          });
      try { localStorage.setItem(ID_KEY, v); } catch (e) {}
    }
    return v;
  }

  // ── local state in, local state out ────────────────────────────────────────
  function _snapshot() {
    const scores = {};
    gameIds().forEach(id => {
      const v = parseInt(localStorage.getItem('gg_hs_' + id) || '0', 10);
      if (v > 0) scores[id] = v;
    });
    let ach = [];
    try { ach = JSON.parse(localStorage.getItem('gg_achievements') || '[]'); } catch (e) {}
    return {
      name:         localStorage.getItem('gg_name') || '',
      avatar:       localStorage.getItem('gg_avatar') || '⭐',
      streak:       parseInt(localStorage.getItem('gg_streak') || '0', 10),
      total_games:  parseInt(localStorage.getItem('gg_total_games') || '0', 10),
      last_date:    localStorage.getItem('gg_last_date') || '',
      achievements: Array.isArray(ach) ? ach : [],
      lang:         (typeof currentLang !== 'undefined') ? currentLang : 'he',
      brain_score:  (typeof BrainScore !== 'undefined' && BrainScore.compute) ? BrainScore.compute() : 0,
      scores,
    };
  }

  function _merge(row) {
    // progress_get returns a single all-NULL row when the id is unknown, so
    // testing for a truthy object is not enough — check it actually has an id.
    if (!row || !row.id) return false;
    const num = k => parseInt(localStorage.getItem(k) || '0', 10);

    // Name and avatar only fill a blank. Someone who renamed themselves on this
    // device should not be renamed back by an older row.
    if (row.name   && !localStorage.getItem('gg_name'))   localStorage.setItem('gg_name', row.name);
    if (row.avatar && !localStorage.getItem('gg_avatar')) localStorage.setItem('gg_avatar', row.avatar);

    if ((row.streak      || 0) > num('gg_streak'))      localStorage.setItem('gg_streak', String(row.streak));
    if ((row.total_games || 0) > num('gg_total_games')) localStorage.setItem('gg_total_games', String(row.total_games));
    if ((row.last_date || '') > (localStorage.getItem('gg_last_date') || ''))
      localStorage.setItem('gg_last_date', row.last_date);

    Object.entries(row.scores || {}).forEach(([id, v]) => {
      if ((parseInt(v, 10) || 0) > num('gg_hs_' + id)) localStorage.setItem('gg_hs_' + id, String(v));
    });

    let local = [];
    try { local = JSON.parse(localStorage.getItem('gg_achievements') || '[]'); } catch (e) {}
    const union = new Set([...(Array.isArray(local) ? local : []), ...(row.achievements || [])]);
    localStorage.setItem('gg_achievements', JSON.stringify([...union]));

    _refreshUI();
    return true;
  }

  function _refreshUI() {
    try {
      if (typeof Retention !== 'undefined' && Retention.renderBar) Retention.renderBar();
      if (typeof refreshHSBadges === 'function') refreshHSBadges();
      if (typeof Profile !== 'undefined' && Profile.updateGreetingEl) Profile.updateGreetingEl();
      if (typeof BrainScore !== 'undefined' && BrainScore.renderWidget) {
        const slot = document.getElementById('brain-score-slot');
        if (slot) BrainScore.renderWidget(slot);
      }
    } catch (e) {}
  }

  // ── network ────────────────────────────────────────────────────────────────
  function push() {
    if (!_ready) return;
    clearTimeout(_pushTimer);
    // Debounced: finishing a level can fire several updates in a second.
    _pushTimer = setTimeout(async () => {
      try {
        const { error } = await _db.rpc('progress_put', { p_id: _id, p: _snapshot() });
        _dot(error ? 'err' : 'ok');
      } catch (e) { _dot('err'); }
    }, 1500);
  }

  async function pull() {
    if (!_ready) return false;
    try {
      const { data, error } = await _db.rpc('progress_get', { p_id: _id });
      if (error) { _dot('err'); return false; }
      const row = Array.isArray(data) ? data[0] : data;
      _dot('ok');
      return _merge(row);
    } catch (e) { _dot('err'); return false; }
  }

  // Show a code for another device to type in.
  async function createCode() {
    if (!_ready) return null;
    try {
      await _db.rpc('progress_put', { p_id: _id, p: _snapshot() });  // make sure it is saved first
      const { data, error } = await _db.rpc('pair_create', { p_id: _id });
      return error ? null : data;
    } catch (e) { return null; }
  }

  // Adopt another device's identity, then merge both sides together.
  async function useCode(code) {
    if (!_ready) return { ok: false, reason: 'offline' };
    const clean = String(code || '').trim().toUpperCase();
    if (clean.length !== 6) return { ok: false, reason: 'format' };
    try {
      const { data, error } = await _db.rpc('pair_claim', { p_code: clean });
      if (error || !data) return { ok: false, reason: 'bad_code' };

      // Push what is on THIS device under the new id before pulling, so a device
      // that already has progress contributes it instead of being overwritten.
      // progress_put is max-wins, so nothing can be lost by doing this.
      _id = data;
      try { localStorage.setItem(ID_KEY, _id); } catch (e) {}
      await _db.rpc('progress_put', { p_id: _id, p: _snapshot() });
      await pull();
      return { ok: true };
    } catch (e) { return { ok: false, reason: 'offline' }; }
  }

  // ── status dot ─────────────────────────────────────────────────────────────
  function _dot(state) {
    const el = document.getElementById('sync-dot');
    if (!el) return;
    el.style.background = state === 'ok' ? '#4ade80' : state === 'err' ? '#f87171' : '#fbbf24';
    el.style.boxShadow  = state === 'ok' ? '0 0 6px #4ade80' : 'none';
    el.title = state === 'ok' ? 'Synced' : state === 'err' ? 'Sync unavailable' : 'Syncing…';
  }

  async function init() {
    if (!configured()) return;                       // inert until set up
    if (typeof supabase === 'undefined') return;     // SDK blocked or offline
    try {
      _db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
      _id = myId();
      if (!_id) return;                              // localStorage unavailable
      _ready = true;
      if (typeof SyncUI !== 'undefined' && SyncUI.mount) SyncUI.mount();
      _dot('pending');
      await pull();
      push();
    } catch (e) { _dot('err'); }
  }

  return { init, push, pull, createCode, useCode, configured, myId, isReady: () => _ready };
})();
