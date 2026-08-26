-- ═══════════════════════════════════════════════════════════════════════════
-- Golden Games — cross-device progress sync
-- Run once: Supabase Dashboard → SQL Editor → New query → paste → Run
-- ═══════════════════════════════════════════════════════════════════════════
--
-- WHY THIS REPLACED THE PREVIOUS SCHEMA
--
-- The old version keyed rows on auth.uid() from signInAnonymously(). An
-- anonymous Supabase user is per-browser: open the site on a phone and you get
-- a NEW anonymous user, so a NEW row. It was a per-device backup that could
-- never move progress between devices, which is the only thing it was wanted
-- for.
--
-- THE MODEL HERE
--
-- Identity is a secret uuid the browser generates and keeps in localStorage.
-- There is no login, no email, no password — the audience is people in their
-- seventies and eighties, and a sign-up form is where they stop.
--
-- To move to a second device the player reads out a short code. The code maps
-- to the uuid for 30 minutes, then stops working.
--
-- WHY RPC FUNCTIONS AND NOT DIRECT TABLE ACCESS
--
-- With RLS and a permissive anon policy, PostgREST would happily answer
-- `select * from user_progress` with no filter and hand a stranger every row.
-- These functions are SECURITY DEFINER and take an exact id, so a caller can
-- only ever read the one row whose 122-bit uuid they already know. The table
-- itself grants nothing to anon, so there is no way to enumerate it.
--
-- WHAT IS STORED: a display name (first name, as typed), an avatar emoji, game
-- high scores, streak counters and achievement ids. No email, no password, no
-- IP, no date of birth, nothing that identifies a person.

-- ── progress ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_progress (
  id            uuid        PRIMARY KEY,   -- secret, generated in the browser
  name          text,
  avatar        text        DEFAULT '⭐',
  streak        int         DEFAULT 0,
  total_games   int         DEFAULT 0,
  last_date     text,                      -- 'YYYY-MM-DD'
  scores        jsonb       DEFAULT '{}',  -- { "memory": 5, "sudoku": 3, ... }
  achievements  text[]      DEFAULT '{}',
  brain_score   int         DEFAULT 0,
  lang          text        DEFAULT 'he',
  updated_at    timestamptz DEFAULT now()
);

-- ── pairing codes ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pair_codes (
  code        text        PRIMARY KEY,
  id          uuid        NOT NULL,
  expires_at  timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS pair_codes_expires_idx ON pair_codes (expires_at);

-- Locked down. Nothing below grants anon direct access to either table; all
-- access goes through the functions.
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE pair_codes    ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON user_progress FROM anon, authenticated;
REVOKE ALL ON pair_codes    FROM anon, authenticated;

-- ── merge two score maps, keeping the higher value for every game ──────────
-- `a || b` looked like the obvious way to combine them and is WRONG: jsonb
-- concatenation lets the right-hand side win on a duplicate key, so a device
-- pushing sudoku=3 would overwrite a stored sudoku=7. That is a silent loss of
-- the player's best score, which is the one thing sync must never do. Caught by
-- the test in this file's commit; keep it that way.
CREATE OR REPLACE FUNCTION _merge_scores(a jsonb, b jsonb)
RETURNS jsonb
LANGUAGE sql IMMUTABLE AS $$
  SELECT coalesce(jsonb_object_agg(k, v), '{}'::jsonb)
  FROM (
    SELECT k, max(v) AS v
    FROM (
      SELECT key AS k, (value #>> '{}')::numeric AS v
        FROM jsonb_each(coalesce(a, '{}'::jsonb))
       WHERE jsonb_typeof(value) = 'number'
      UNION ALL
      SELECT key, (value #>> '{}')::numeric
        FROM jsonb_each(coalesce(b, '{}'::jsonb))
       WHERE jsonb_typeof(value) = 'number'
    ) src
    GROUP BY k
  ) m;
$$;

-- ── read your own row ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION progress_get(p_id uuid)
RETURNS user_progress
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM user_progress WHERE id = p_id;
$$;

-- ── write your own row ─────────────────────────────────────────────────────
-- Every field is read out of the payload explicitly rather than merged
-- wholesale, so a caller cannot set columns that are not theirs to set, and
-- cannot store arbitrary extra keys. The size cap stops the table being used
-- as free file storage.
CREATE OR REPLACE FUNCTION progress_put(p_id uuid, p jsonb)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_id IS NULL THEN RAISE EXCEPTION 'id required'; END IF;
  IF length(p::text) > 20000 THEN RAISE EXCEPTION 'payload too large'; END IF;

  INSERT INTO user_progress AS u
        (id, name, avatar, streak, total_games, last_date,
         scores, achievements, brain_score, lang, updated_at)
  VALUES (p_id,
          left(coalesce(p->>'name', ''), 40),
          left(coalesce(p->>'avatar', '⭐'), 8),
          greatest(coalesce((p->>'streak')::int, 0), 0),
          greatest(coalesce((p->>'total_games')::int, 0), 0),
          left(coalesce(p->>'last_date', ''), 10),
          coalesce(p->'scores', '{}'::jsonb),
          coalesce(ARRAY(SELECT jsonb_array_elements_text(p->'achievements')), '{}'),
          greatest(coalesce((p->>'brain_score')::int, 0), 0),
          left(coalesce(p->>'lang', 'he'), 5),
          now())
  ON CONFLICT (id) DO UPDATE SET
    -- Highest value wins on every counter. Two devices used on the same day
    -- must not be able to erase each other's progress, and a device that has
    -- been offline for a week must not push stale zeros over good numbers.
    name         = coalesce(nullif(excluded.name, ''), u.name),
    avatar       = coalesce(nullif(excluded.avatar, ''), u.avatar),
    streak       = greatest(u.streak, excluded.streak),
    total_games  = greatest(u.total_games, excluded.total_games),
    last_date    = greatest(u.last_date, excluded.last_date),
    scores       = _merge_scores(u.scores, excluded.scores),
    achievements = ARRAY(SELECT DISTINCT unnest(u.achievements || excluded.achievements)),
    brain_score  = greatest(u.brain_score, excluded.brain_score),
    lang         = excluded.lang,
    updated_at   = now();
END; $$;

-- ── create a pairing code ──────────────────────────────────────────────────
-- Six characters from an alphabet with no O/0/I/1/L, because the code gets read
-- aloud or written on paper by someone who may not see it clearly.
CREATE OR REPLACE FUNCTION pair_create(p_id uuid)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  c text;
  i int;
BEGIN
  IF p_id IS NULL THEN RAISE EXCEPTION 'id required'; END IF;
  DELETE FROM pair_codes WHERE expires_at < now();   -- keep the table small

  LOOP
    c := '';
    FOR i IN 1..6 LOOP
      c := c || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM pair_codes WHERE code = c);
  END LOOP;

  INSERT INTO pair_codes (code, id, expires_at)
  VALUES (c, p_id, now() + interval '30 minutes');
  RETURN c;
END; $$;

-- ── redeem a pairing code ──────────────────────────────────────────────────
-- Returns the uuid, or null when the code is unknown or expired. The code is
-- NOT deleted on use: someone setting up a phone and a tablet in one sitting
-- should not have to generate it twice. It dies on its own after 30 minutes.
CREATE OR REPLACE FUNCTION pair_claim(p_code text)
RETURNS uuid
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM pair_codes
  WHERE code = upper(trim(p_code)) AND expires_at > now();
$$;

-- ── the only things anon may call ──────────────────────────────────────────
GRANT EXECUTE ON FUNCTION progress_get(uuid)        TO anon, authenticated;
GRANT EXECUTE ON FUNCTION progress_put(uuid, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION pair_create(uuid)         TO anon, authenticated;
GRANT EXECUTE ON FUNCTION pair_claim(text)          TO anon, authenticated;
