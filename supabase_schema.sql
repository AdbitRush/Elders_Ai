-- Golden Games — user progress sync table
-- Run this once in your Supabase SQL editor (Dashboard → SQL Editor → New query)

CREATE TABLE IF NOT EXISTS user_progress (
  id            uuid        PRIMARY KEY,           -- = auth.uid() from anonymous sign-in
  name          text,
  avatar        text        DEFAULT '⭐',
  streak        int         DEFAULT 0,
  total_games   int         DEFAULT 0,
  last_date     text,                               -- 'YYYY-MM-DD'
  scores        jsonb       DEFAULT '{}',           -- { "memory": 5, "math": 3, ... }
  achievements  text[]      DEFAULT '{}',           -- ["first_game", "streak_7", ...]
  brain_score   int         DEFAULT 0,
  lang          text        DEFAULT 'he',
  updated_at    timestamptz DEFAULT now()
);

-- Row-level security: each user can only read/write their own row
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_row"
  ON user_progress FOR ALL
  TO authenticated
  USING  (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Optional: auto-update timestamp on upsert
CREATE OR REPLACE FUNCTION _set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE PROCEDURE _set_updated_at();
