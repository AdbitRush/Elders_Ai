const Sync = (() => {
  const SUPABASE_URL = '';
  const SUPABASE_ANON_KEY = '';
  const ID_KEY = 'gg_sync_id';
  let _db = null, _id = null, _ready = false, _pushTimer = null;
  const configured = () => !!(SUPABASE_URL && SUPABASE_ANON_KEY);
  const gameIds = () => typeof window !== 'undefined' && Array.isArray(window.GAME_IDS) && window.GAME_IDS.length ? window.GAME_IDS : [];
  function myId() {
    let v = null;
    try {
      v = localStorage.getItem(ID_KEY);
    } catch (e) {
      return null;
    }
    if (!v) {
      v = crypto && crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : r & 3 | 8).toString(16);
      });
      try {
        localStorage.setItem(ID_KEY, v);
      } catch (e) {
      }
    }
    return v;
  }
  function _snapshot() {
    const scores = {};
    gameIds().forEach(id => {
      const v = parseInt(localStorage.getItem('gg_hs_' + id) || '0', 10);
      if (v > 0)
        scores[id] = v;
    });
    let ach = [];
    try {
      ach = JSON.parse(localStorage.getItem('gg_achievements') || '[]');
    } catch (e) {
    }
    return {
      avatar: localStorage.getItem('gg_avatar') || '\u2B50',
      streak: parseInt(localStorage.getItem('gg_streak') || '0', 10),
      total_games: parseInt(localStorage.getItem('gg_total_games') || '0', 10),
      last_date: localStorage.getItem('gg_last_date') || '',
      achievements: Array.isArray(ach) ? ach : [],
      lang: typeof currentLang !== 'undefined' ? currentLang : 'en',
      brain_score: typeof BrainScore !== 'undefined' && BrainScore.compute ? BrainScore.compute() : 0,
      scores
    };
  }
  function _merge(row) {
    if (!row || !row.id)
      return false;
    const num = k => parseInt(localStorage.getItem(k) || '0', 10);
    if (row.avatar && !localStorage.getItem('gg_avatar'))
      localStorage.setItem('gg_avatar', row.avatar);
    if ((row.streak || 0) > num('gg_streak'))
      localStorage.setItem('gg_streak', String(row.streak));
    if ((row.total_games || 0) > num('gg_total_games'))
      localStorage.setItem('gg_total_games', String(row.total_games));
    if ((row.last_date || '') > (localStorage.getItem('gg_last_date') || ''))
      localStorage.setItem('gg_last_date', row.last_date);
    Object.entries(row.scores || {}).forEach(([id, v]) => {
      if ((parseInt(v, 10) || 0) > num('gg_hs_' + id))
        localStorage.setItem('gg_hs_' + id, String(v));
    });
    let local = [];
    try {
      local = JSON.parse(localStorage.getItem('gg_achievements') || '[]');
    } catch (e) {
    }
    const union = new Set([
      ...Array.isArray(local) ? local : [],
      ...row.achievements || []
    ]);
    localStorage.setItem('gg_achievements', JSON.stringify([...union]));
    _refreshUI();
    return true;
  }
  function _refreshUI() {
    try {
      if (typeof Retention !== 'undefined' && Retention.renderBar)
        Retention.renderBar();
      if (typeof refreshHSBadges === 'function')
        refreshHSBadges();
      if (typeof Profile !== 'undefined' && Profile.updateGreetingEl)
        Profile.updateGreetingEl();
      if (typeof BrainScore !== 'undefined' && BrainScore.renderWidget) {
        const slot = document.getElementById('brain-score-slot');
        if (slot)
          BrainScore.renderWidget(slot);
      }
    } catch (e) {
    }
  }
  function push() {
    if (!_ready)
      return;
    clearTimeout(_pushTimer);
    _pushTimer = setTimeout(async () => {
      try {
        const {error} = await _db.rpc('progress_put', {
          p_id: _id,
          p: _snapshot()
        });
        _dot(error ? 'err' : 'ok');
      } catch (e) {
        _dot('err');
      }
    }, 1500);
  }
  async function pull() {
    if (!_ready)
      return false;
    try {
      const {data, error} = await _db.rpc('progress_get', { p_id: _id });
      if (error) {
        _dot('err');
        return false;
      }
      const row = Array.isArray(data) ? data[0] : data;
      _dot('ok');
      return _merge(row);
    } catch (e) {
      _dot('err');
      return false;
    }
  }
  async function createCode() {
    if (!_ready)
      return null;
    try {
      await _db.rpc('progress_put', {
        p_id: _id,
        p: _snapshot()
      });
      const {data, error} = await _db.rpc('pair_create', { p_id: _id });
      return error ? null : data;
    } catch (e) {
      return null;
    }
  }
  async function useCode(code) {
    if (!_ready)
      return {
        ok: false,
        reason: 'offline'
      };
    const clean = String(code || '').trim().toUpperCase();
    if (clean.length !== 6)
      return {
        ok: false,
        reason: 'format'
      };
    try {
      const {data, error} = await _db.rpc('pair_claim', { p_code: clean });
      if (error || !data)
        return {
          ok: false,
          reason: 'bad_code'
        };
      _id = data;
      try {
        localStorage.setItem(ID_KEY, _id);
      } catch (e) {
      }
      await _db.rpc('progress_put', {
        p_id: _id,
        p: _snapshot()
      });
      await pull();
      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        reason: 'offline'
      };
    }
  }
  function _dot(state) {
    const el = document.getElementById('sync-dot');
    if (!el)
      return;
    el.style.background = state === 'ok' ? '#4ade80' : state === 'err' ? '#f87171' : '#fbbf24';
    el.style.boxShadow = state === 'ok' ? '0 0 6px #4ade80' : 'none';
    el.title = state === 'ok' ? 'Synced' : state === 'err' ? 'Sync unavailable' : 'Syncing\u2026';
  }
  async function init() {
    if (!configured())
      return;
    if (typeof supabase === 'undefined')
      return;
    try {
      _db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
      _id = myId();
      if (!_id)
        return;
      _ready = true;
      if (typeof SyncUI !== 'undefined' && SyncUI.mount)
        SyncUI.mount();
      _dot('pending');
      await pull();
      push();
    } catch (e) {
      _dot('err');
    }
  }
  return {
    init,
    push,
    pull,
    createCode,
    useCode,
    configured,
    myId,
    isReady: () => _ready
  };
})();