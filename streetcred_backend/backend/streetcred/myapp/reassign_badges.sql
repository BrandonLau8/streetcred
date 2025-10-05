-- Reassign badges for user a1f30266-3ffc-49d3-8ea5-fb3f78a79361 to different locations
-- Run this in Supabase SQL Editor

-- Milestone 5: Central Park
UPDATE user_badges
SET badge_id = 64
WHERE user_id = 'a1f30266-3ffc-49d3-8ea5-fb3f78a79361' AND milestone = 5;

-- Milestone 10: Greenwich Village
UPDATE user_badges
SET badge_id = 180
WHERE user_id = 'a1f30266-3ffc-49d3-8ea5-fb3f78a79361' AND milestone = 10;

-- Milestone 15: Chinatown
UPDATE user_badges
SET badge_id = 13
WHERE user_id = 'a1f30266-3ffc-49d3-8ea5-fb3f78a79361' AND milestone = 15;

-- Milestone 20: SoHo
UPDATE user_badges
SET badge_id = 109
WHERE user_id = 'a1f30266-3ffc-49d3-8ea5-fb3f78a79361' AND milestone = 20;

-- Milestone 25: Chelsea
UPDATE user_badges
SET badge_id = 24
WHERE user_id = 'a1f30266-3ffc-49d3-8ea5-fb3f78a79361' AND milestone = 25;

-- Milestone 30: Upper East Side
UPDATE user_badges
SET badge_id = 82
WHERE user_id = 'a1f30266-3ffc-49d3-8ea5-fb3f78a79361' AND milestone = 30;

-- Milestone 35: Harlem
UPDATE user_badges
SET badge_id = 37
WHERE user_id = 'a1f30266-3ffc-49d3-8ea5-fb3f78a79361' AND milestone = 35;

-- Milestone 40: East Village
UPDATE user_badges
SET badge_id = 135
WHERE user_id = 'a1f30266-3ffc-49d3-8ea5-fb3f78a79361' AND milestone = 40;

-- Milestone 45: Financial District
UPDATE user_badges
SET badge_id = 140
WHERE user_id = 'a1f30266-3ffc-49d3-8ea5-fb3f78a79361' AND milestone = 45;

-- Verify the changes
SELECT
    ub.milestone,
    b.location_name,
    b.animal,
    b.image_url
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
WHERE ub.user_id = 'a1f30266-3ffc-49d3-8ea5-fb3f78a79361'
ORDER BY ub.milestone;
