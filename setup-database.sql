-- Aurion Studio Database Setup
-- Run this SQL in your Supabase SQL Editor
--
-- Note: If you get constraint errors, you may need to drop and recreate tables
-- Uncomment the DROP TABLE lines below if needed

-- Uncomment these lines if you need to reset the tables:
-- DROP TABLE IF EXISTS projects CASCADE;
-- DROP TABLE IF EXISTS activities CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS tasks CASCADE;

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('planning', 'in_progress', 'completed', 'on_hold')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  team_size INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Handle tasks table - check existing structure and adapt
DO $$
DECLARE
  col_record RECORD;
  available_columns TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Get all columns from tasks table
  FOR col_record IN
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'tasks'
    ORDER BY ordinal_position
  LOOP
    available_columns := available_columns || col_record.column_name;
  END LOOP;

  RAISE NOTICE 'Tasks table columns: %', array_to_string(available_columns, ', ');

  -- If table exists and has incompatible structure, we'll work with what we have
  -- For now, just ensure we have the columns we need
  IF NOT ('due_date' = ANY(available_columns)) THEN
    ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date DATE DEFAULT CURRENT_DATE;
  END IF;

  IF NOT ('status' = ANY(available_columns)) AND NOT ('task_status' = ANY(available_columns)) THEN
    ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_status TEXT DEFAULT 'pending' CHECK (task_status IN ('pending', 'in_progress', 'completed'));
  END IF;
END $$;

-- DELETE ALL SAMPLE DATA (to start with clean database)
DELETE FROM projects WHERE name IN ('Aurion IDE', 'AI Assistant', 'Intelligent Canvas', 'Chat System', 'Text Editor');
DELETE FROM activities WHERE user_name IN ('Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eva Brown');
DELETE FROM users WHERE email LIKE '%@example.com';

-- Reset sequences if needed
-- ALTER SEQUENCE projects_id_seq RESTART WITH 1;
-- ALTER SEQUENCE activities_id_seq RESTART WITH 1;

-- Check tasks table status (no insertion to avoid errors)
DO $$
DECLARE
  available_columns TEXT[];
  task_count INTEGER;
BEGIN
  -- Get all columns from tasks table
  SELECT array_agg(column_name ORDER BY ordinal_position)
  INTO available_columns
  FROM information_schema.columns
  WHERE table_name = 'tasks';

  RAISE NOTICE 'Available columns in tasks table: %', array_to_string(available_columns, ', ');

  -- Count existing tasks
  SELECT COUNT(*) INTO task_count FROM tasks;
  RAISE NOTICE 'Tasks table currently has % records', task_count;

  -- Show structure info for debugging
  RAISE NOTICE 'Tasks table structure detected successfully. The dashboard will work with existing data.';

END $$;

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (for demo purposes)
-- In production, you would want proper authentication-based policies
CREATE POLICY "Allow anonymous read access on projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access on activities" ON activities FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access on tasks" ON tasks FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- Create indexes for tasks table only if columns exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'due_date') THEN
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'status') THEN
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'task_status') THEN
    CREATE INDEX IF NOT EXISTS idx_tasks_task_status ON tasks(task_status);
  END IF;
END $$;