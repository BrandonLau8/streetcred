-- Setup Demo User with Badges
-- Run this in Supabase SQL Editor after creating the user via Auth UI

-- STEP 1: Create user via Supabase Dashboard > Authentication > Users
-- Email: demo@streetcred.app
-- Password: Demo123!
-- Auto Confirm User: YES
-- Then copy the user_id and replace DEMO_USER_ID below

-- STEP 2: Set the demo user ID here
-- Replace with actual user ID from Supabase Auth
\set DEMO_USER_ID 'YOUR-USER-ID-HERE'

-- STEP 3: Create/Update profile for demo user
INSERT INTO profiles (user_id, username, full_name, points, created_at)
VALUES (
  :'DEMO_USER_ID',
  'demo@streetcred.app',
  'Demo User',
  150,  -- Give them some points
  NOW()
)
ON CONFLICT (user_id)
DO UPDATE SET
  username = 'demo@streetcred.app',
  full_name = 'Demo User',
  points = 150;

-- STEP 4: Check what badges are available
SELECT id, animal, location_name, image_url
FROM badges
ORDER BY location_name, animal
LIMIT 10;

-- STEP 5: Assign 4 badges to demo user
-- (Replace badge IDs with actual IDs from step 4)
INSERT INTO user_badges (user_id, badge_id, created_at)
SELECT
  :'DEMO_USER_ID',
  id,
  NOW()
FROM badges
WHERE animal IN ('pigeon', 'rat', 'squirrel', 'raccoon')
LIMIT 4
ON CONFLICT DO NOTHING;

-- STEP 6: Verify demo user setup
SELECT
  p.user_id,
  p.username,
  p.full_name,
  p.points,
  COUNT(ub.id) as badges_earned
FROM profiles p
LEFT JOIN user_badges ub ON p.user_id = ub.user_id
WHERE p.user_id = :'DEMO_USER_ID'
GROUP BY p.user_id, p.username, p.full_name, p.points;

-- STEP 7: View demo user's badges
SELECT
  ub.created_at as earned_at,
  b.animal,
  b.location_name,
  b.image_url
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
WHERE ub.user_id = :'DEMO_USER_ID'
ORDER BY ub.created_at DESC;

-- ALTERNATIVE: If you know specific badge IDs, use this instead:
/*
INSERT INTO user_badges (user_id, badge_id, created_at)
VALUES
  ('YOUR-USER-ID', 1, NOW()),  -- Replace with actual badge IDs
  ('YOUR-USER-ID', 2, NOW()),
  ('YOUR-USER-ID', 3, NOW()),
  ('YOUR-USER-ID', 4, NOW())
ON CONFLICT DO NOTHING;
*/

-- OPTIONAL: Add some demo reports to show activity
/*
INSERT INTO reports (user_id, lat, lon, description, created_at)
VALUES
  ('YOUR-USER-ID', 40.7580, -73.9855, 'Fire hydrant in good condition - Times Square', NOW() - INTERVAL '7 days'),
  ('YOUR-USER-ID', 40.7829, -73.9654, 'Broken streetlight - Central Park', NOW() - INTERVAL '5 days'),
  ('YOUR-USER-ID', 40.7282, -74.0776, 'New hydrant installed - Greenwich Village', NOW() - INTERVAL '2 days');
*/
