-- ==============================================================================
-- KNOWLY DATABASE SCHEMA (PostgreSQL / Supabase Compatible)
-- Production relational schema for personalized social quiz platform
-- ==============================================================================

-- 1. Enable uuid extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tests Table
CREATE TABLE IF NOT EXISTS tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  short_id VARCHAR(16) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  creator_name VARCHAR(100) NOT NULL DEFAULT 'Anonymous',
  creator_token VARCHAR(64) NOT NULL,
  theme VARCHAR(32) NOT NULL DEFAULT 'terracotta',
  status VARCHAR(20) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'closed')),
  questions_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  starts_count INTEGER NOT NULL DEFAULT 0,
  completions_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for instant public short_id lookup
CREATE INDEX IF NOT EXISTS idx_tests_short_id ON tests(short_id);
-- Index for creator queries via creator_token
CREATE INDEX IF NOT EXISTS idx_tests_creator_token ON tests(creator_token);

-- 3. Questions Table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  order_num INTEGER NOT NULL DEFAULT 1,
  text TEXT NOT NULL,
  type VARCHAR(32) NOT NULL DEFAULT 'multiple_choice' CHECK (type IN ('multiple_choice', 'yes_no')),
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_test_id ON questions(test_id, order_num);

-- 4. Question Options Table
CREATE TABLE IF NOT EXISTS question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  order_num INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);

-- 5. Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  participant_name VARCHAR(60) NOT NULL,
  participant_emoji VARCHAR(10) NOT NULL DEFAULT '🦊',
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  percentage INTEGER NOT NULL DEFAULT 0,
  result_tier_title VARCHAR(100) NOT NULL,
  result_tier_badge VARCHAR(60) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_test_id ON submissions(test_id, created_at DESC);

-- 6. Submission Answers Table
CREATE TABLE IF NOT EXISTS submission_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id UUID NOT NULL REFERENCES question_options(id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submission_answers_submission_id ON submission_answers(submission_id);
CREATE INDEX IF NOT EXISTS idx_submission_answers_question_id ON submission_answers(question_id);

-- 7. Row Level Security (RLS) Policies
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_answers ENABLE ROW LEVEL SECURITY;

-- Public can read published tests
CREATE POLICY "Public tests are viewable by short_id" ON tests
  FOR SELECT USING (status = 'published');

-- Public can read question content for active tests
CREATE POLICY "Public questions are viewable" ON questions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM tests WHERE tests.id = questions.test_id AND tests.status = 'published'
  ));

-- NOTE: Never expose is_correct in client-facing public option queries directly!
-- For Supabase client access, create a secure PostgreSQL view or RPC function:
CREATE OR REPLACE VIEW public_question_options AS
  SELECT id, question_id, text, order_num
  FROM question_options;
