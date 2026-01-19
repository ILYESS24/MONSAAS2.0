-- CLEAN DATABASE - Remove all sample/mock data
-- Execute this in your Supabase SQL Editor to remove all fake data

-- Delete sample projects
DELETE FROM projects
WHERE name IN ('Aurion IDE', 'AI Assistant', 'Intelligent Canvas', 'Chat System', 'Text Editor');

-- Delete sample activities
DELETE FROM activities
WHERE user_name IN ('Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eva Brown');

-- Delete sample users
DELETE FROM users
WHERE email LIKE '%@example.com';

-- Optional: Reset auto-increment sequences
-- ALTER SEQUENCE projects_id_seq RESTART WITH 1;
-- ALTER SEQUENCE activities_id_seq RESTART WITH 1;

-- Verify the data is clean
SELECT
  (SELECT COUNT(*) FROM projects) as projects_count,
  (SELECT COUNT(*) FROM activities) as activities_count,
  (SELECT COUNT(*) FROM users) as users_count;