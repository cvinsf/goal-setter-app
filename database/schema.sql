-- Goal Setter App Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'paid'))
);

-- ============================================
-- Goals Table
-- ============================================
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,

  -- Core fields
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('yearly', 'monthly', 'weekly', 'daily')),

  -- Progress tracking (hybrid: checkbox + numeric)
  tracking_type TEXT DEFAULT 'checkbox' CHECK (tracking_type IN ('checkbox', 'numeric', 'hybrid')),
  is_completed BOOLEAN DEFAULT FALSE,
  current_value DECIMAL,
  target_value DECIMAL,
  unit TEXT, -- e.g., 'miles', 'dollars', 'hours', 'pages'

  -- Dates
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Consultation/Planning data
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_time_hours DECIMAL,
  resources_needed TEXT[],
  feasibility_notes TEXT
);

-- ============================================
-- Progress Logs Table
-- ============================================
CREATE TABLE IF NOT EXISTS progress_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  value DECIMAL NOT NULL,
  notes TEXT
);

-- ============================================
-- Notifications Table
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('weekly_summary', 'reminder', 'achievement')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- User API Keys Table (encrypted storage)
-- ============================================
CREATE TABLE IF NOT EXISTS user_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google')),
  encrypted_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_parent_id ON goals(parent_goal_id);
CREATE INDEX IF NOT EXISTS idx_goals_type ON goals(goal_type);
CREATE INDEX IF NOT EXISTS idx_goals_user_type ON goals(user_id, goal_type);
CREATE INDEX IF NOT EXISTS idx_progress_logs_goal_id ON progress_logs(goal_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================
-- Updated_at Trigger Function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to goals table
DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Goals policies
CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  USING (auth.uid() = user_id);

-- Progress logs policies
CREATE POLICY "Users can view own progress logs"
  ON progress_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM goals WHERE goals.id = progress_logs.goal_id AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own progress logs"
  ON progress_logs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM goals WHERE goals.id = progress_logs.goal_id AND goals.user_id = auth.uid()
  ));

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- API Keys policies
CREATE POLICY "Users can view own API keys"
  ON user_api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys"
  ON user_api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
  ON user_api_keys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
  ON user_api_keys FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Helper Functions
-- ============================================

-- Function to calculate goal progress percentage
CREATE OR REPLACE FUNCTION calculate_goal_progress(goal_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  goal_record RECORD;
  child_progress DECIMAL;
BEGIN
  SELECT * INTO goal_record FROM goals WHERE id = goal_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- If completed, return 100
  IF goal_record.is_completed THEN
    RETURN 100;
  END IF;

  -- If numeric tracking, calculate based on current/target
  IF goal_record.tracking_type IN ('numeric', 'hybrid') AND
     goal_record.target_value IS NOT NULL AND
     goal_record.target_value > 0 THEN
    RETURN LEAST(100, (COALESCE(goal_record.current_value, 0) / goal_record.target_value) * 100);
  END IF;

  -- If has children, calculate based on children completion
  SELECT AVG(CASE WHEN is_completed THEN 100 ELSE 0 END)
  INTO child_progress
  FROM goals
  WHERE parent_goal_id = goal_id;

  IF child_progress IS NOT NULL THEN
    RETURN child_progress;
  END IF;

  -- Default: checkbox tracking
  RETURN CASE WHEN goal_record.is_completed THEN 100 ELSE 0 END;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Sample Data for Testing (Optional)
-- ============================================
-- Uncomment to insert sample data

-- INSERT INTO users (id, email, subscription_tier) VALUES
--   ('00000000-0000-0000-0000-000000000001', 'demo@example.com', 'free');

-- INSERT INTO goals (user_id, title, goal_type, tracking_type, start_date, end_date) VALUES
--   ('00000000-0000-0000-0000-000000000001', 'Run a Marathon', 'yearly', 'checkbox', '2026-01-01', '2026-12-31');
