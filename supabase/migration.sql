-- ============================================================
-- HOK EHBO Quiz — Volledige database setup
-- Uitvoeren in Supabase SQL Editor (eenmalig)
-- ============================================================

-- 1. TABELLEN
-- ============================================================

CREATE TABLE IF NOT EXISTS trainer_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  organisation text,
  role text NOT NULL DEFAULT 'trainer', -- 'trainer' | 'admin'
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid REFERENCES trainer_profiles(id) ON DELETE SET NULL, -- NULL = globale HOK quiz
  title text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Maximaal één globale quiz toegestaan
CREATE UNIQUE INDEX IF NOT EXISTS quizzes_one_global
  ON quizzes ((trainer_id IS NULL)) WHERE trainer_id IS NULL;

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer int NOT NULL,
  explanation text DEFAULT '',
  time_limit int DEFAULT 20,
  order_index int NOT NULL,
  video_topic text DEFAULT '',
  video_url text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id),
  trainer_id uuid REFERENCES trainer_profiles(id),
  join_code char(6) UNIQUE NOT NULL,
  status text DEFAULT 'lobby',
  current_question int DEFAULT -1,
  question_started_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  score int DEFAULT 0,
  joined_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id uuid REFERENCES game_players(id) ON DELETE CASCADE,
  question_index int NOT NULL,
  answer int NOT NULL,
  is_correct boolean,
  response_time_ms int,
  points_earned int DEFAULT 0,
  answered_at timestamptz DEFAULT now(),
  UNIQUE(session_id, player_id, question_index)
);

-- Trigger: updated_at bijhouden op questions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS questions_updated_at ON questions;
CREATE TRIGGER questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. RLS INSCHAKELEN
-- ============================================================

ALTER TABLE trainer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_answers ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES
-- ============================================================

-- trainer_profiles
DROP POLICY IF EXISTS "Users manage own profile" ON trainer_profiles;
CREATE POLICY "Users manage own profile" ON trainer_profiles
  FOR ALL USING (id = auth.uid());

-- quizzes: trainers lezen eigen + globale quiz
DROP POLICY IF EXISTS "Anyone reads global quiz" ON quizzes;
CREATE POLICY "Anyone reads global quiz" ON quizzes
  FOR SELECT USING (trainer_id IS NULL OR trainer_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage quizzes" ON quizzes;
CREATE POLICY "Admins manage quizzes" ON quizzes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM trainer_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- questions: iedereen leest, alleen admins schrijven
DROP POLICY IF EXISTS "Anyone reads questions" ON questions;
CREATE POLICY "Anyone reads questions" ON questions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage questions" ON questions;
CREATE POLICY "Admins manage questions" ON questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM trainer_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- game_sessions
DROP POLICY IF EXISTS "Trainers own sessions" ON game_sessions;
CREATE POLICY "Trainers own sessions" ON game_sessions
  FOR ALL USING (trainer_id = auth.uid());

DROP POLICY IF EXISTS "Anyone reads active sessions" ON game_sessions;
CREATE POLICY "Anyone reads active sessions" ON game_sessions
  FOR SELECT USING (status IN ('lobby', 'playing', 'results', 'finished'));

-- game_players
DROP POLICY IF EXISTS "Anyone inserts players" ON game_players;
CREATE POLICY "Anyone inserts players" ON game_players
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone reads players" ON game_players;
CREATE POLICY "Anyone reads players" ON game_players
  FOR SELECT USING (true);

-- game_answers
DROP POLICY IF EXISTS "Anyone submits answers" ON game_answers;
CREATE POLICY "Anyone submits answers" ON game_answers
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone reads answers" ON game_answers;
CREATE POLICY "Anyone reads answers" ON game_answers
  FOR SELECT USING (true);

-- 4. RPC SCORE UPDATE (security definer = anonieme spelers kunnen updaten)
-- ============================================================

CREATE OR REPLACE FUNCTION increment_player_score(p_player_id uuid, p_points int)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE game_players SET score = score + p_points WHERE id = p_player_id;
END;
$$;

-- 5. MASTER HOK QUIZ AANMAKEN + VRAGEN SEEDEN
-- ============================================================

DO $$
DECLARE
  v_quiz_id uuid;
BEGIN
  -- Globale HOK quiz aanmaken (als nog niet bestaat)
  INSERT INTO quizzes (trainer_id, title)
  VALUES (NULL, 'HOK EHBO Quiz – 29e druk 2026')
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_quiz_id FROM quizzes WHERE trainer_id IS NULL LIMIT 1;

  -- Vragen seeden (alleen als er nog geen zijn)
  IF NOT EXISTS (SELECT 1 FROM questions WHERE quiz_id = v_quiz_id) THEN
    INSERT INTO questions
      (quiz_id, question, options, correct_answer, explanation, time_limit, order_index, video_topic, video_url)
    VALUES
      (v_quiz_id,
       'Hoe diep moet je het borstbeen indrukken bij een volwassene tijdens reanimatie?',
       '["Minimaal 3 cm, maximaal 4 cm","Minimaal 5 cm, maximaal 6 cm","Minimaal 7 cm, maximaal 8 cm","Minimaal 2 cm, maximaal 3 cm"]',
       1, 'Bij volwassenen druk je het borstbeen ten minste 5 cm maar niet meer dan 6 cm naar beneden.', 20, 0, 'Reanimatie: hoe diep druk je?', ''),

      (v_quiz_id,
       'Hoe snel geef je borstcompressies bij reanimatie?',
       '["60–80 per minuut","80–100 per minuut","100–120 per minuut","120–140 per minuut"]',
       2, 'Het juiste tempo bij reanimatie is 100 tot 120 borstcompressies per minuut.', 20, 1, 'Reanimatie: het juiste tempo', ''),

      (v_quiz_id,
       'Wanneer leg je een bewusteloos slachtoffer NIET in de stabiele zijligging?',
       '["Als hij braakt","Als er wervelletsel mogelijk is","Als hij normaal ademt","Als hij blauw ziet"]',
       1, 'Bij mogelijk wervelletsel (val van hoogte, auto-ongeluk) leg je het slachtoffer niet in de zijligging.', 20, 2, 'Stabiele zijligging — wanneer wel, wanneer niet?', ''),

      (v_quiz_id,
       'Hoe lang koel je een brandwond met lauw stromend kraanwater?',
       '["2–5 minuten","10–20 minuten","30–40 minuten","1–2 minuten"]',
       1, 'Koel brandwonden 10–20 minuten met lauw zachtstromend kraanwater.', 20, 3, 'Brandwonden behandelen — koel & kalm', ''),

      (v_quiz_id,
       'Binnen hoeveel minuten na een circulatiestilstand moet een AED worden ingezet om de overlevingskans aanmerkelijk te vergroten?',
       '["2 minuten","4 minuten","6 minuten","10 minuten"]',
       2, 'De inzet van een AED binnen 6 minuten vergroot aanmerkelijk de overlevingskans.', 20, 4, 'AED: elke seconde telt', ''),

      (v_quiz_id,
       'Iemand verslikt zich en kan niet meer praten. Wat doe je als eerste?',
       '["Direct buikstoten geven","5 rugslagen geven","Onmiddellijk 112 bellen","De mond openen en kijken"]',
       1, 'Bij niet-effectief hoesten geef je eerst 5 rugslagen. Heeft dat geen effect? Dan geef je maximaal 5 buikstoten.', 20, 5, 'Verslikking — 5 rugslagen redden levens', ''),

      (v_quiz_id,
       'Hoe stel je vast of iemand bewusteloos is?',
       '["Kijk of de ogen open zijn","Schud aan de schouders en spreek luid aan","Controleer eerst de ademhaling","Meet de polsslag"]',
       1, 'Iemand is bewusteloos als hij niet reageert op schudden aan de schouders en aanspreken.', 20, 6, 'Is iemand bewusteloos? Zo check je het', ''),

      (v_quiz_id,
       'Wat is de JUISTE verhouding borstcompressies en beademingen bij volwassenen?',
       '["15 : 2","30 : 2","30 : 5","20 : 2"]',
       1, 'Bij reanimatie van volwassenen wissel je 30 borstcompressies af met 2 beademingen.', 20, 7, '30:2 — de gouden reanimatieregel', ''),

      (v_quiz_id,
       'Welke test gebruik je om een beroerte te herkennen?',
       '["De ABCDE-methodiek","De mond-spraak-arm test","De pupilreflex test","De bewustzijnstest"]',
       1, 'De mond-spraak-arm test: Mond (tanden laten zien), Spraak (een zin spreken), Arm (beide armen optillen).', 20, 8, 'Herken een beroerte in 3 stappen', ''),

      (v_quiz_id,
       'Iemand is bewusteloos met normale ademhaling. Wat doe je?',
       '["Direct reanimeren","In de stabiele zijligging leggen","Wachten tot hij bijkomt","Alleen 112 bellen"]',
       1, 'Bewusteloos + normale ademhaling = stabiele zijligging. Zo blijft de luchtweg vrij en kan vocht uit de mond lopen.', 20, 9, 'Bewusteloos maar ademt — wat nu?', '');
  END IF;
END $$;

-- 6. REALTIME INSCHAKELEN
-- ============================================================
-- Supabase Dashboard → Database → Replication → Enable for:
--   game_sessions, game_players, game_answers

-- 7. ADMIN ROL GEVEN (na eerste login uitvoeren)
-- ============================================================
-- UPDATE trainer_profiles
-- SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'jens_palsma@hotmail.com');

-- Auth redirect URLs toevoegen in Supabase Dashboard → Authentication:
--   http://localhost:3000/auth/callback
--   https://het-oranje-kruis-quiz.vercel.app/auth/callback
