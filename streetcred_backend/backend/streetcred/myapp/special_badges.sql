-- Assign 1 badge per sponsor location for user a1f30266-3ffc-49d3-8ea5-fb3f78a79361
-- Run this in Supabase SQL Editor

-- Update existing badges to sponsor location badges OR insert new ones
-- Get the sponsor badges with row numbers
WITH sponsor_badges AS (
    SELECT
        id as badge_id,
        location_name,
        ROW_NUMBER() OVER (ORDER BY location_name) as rn
    FROM (
        SELECT DISTINCT ON (location_name)
            id,
            location_name
        FROM badges
        WHERE location_name IN (
            'Columbia University',
            'Capital One',
            'An Ai World',
            'BlackRock',
            'Comet Opik',
            'Echo Merit Systems'
        )
        ORDER BY location_name, id
    ) unique_sponsors
),
user_milestones AS (
    SELECT
        milestone,
        ROW_NUMBER() OVER (ORDER BY milestone) as rn
    FROM user_badges
    WHERE user_id = 'a1f30266-3ffc-49d3-8ea5-fb3f78a79361'
)
UPDATE user_badges ub
SET badge_id = sb.badge_id
FROM sponsor_badges sb
JOIN user_milestones um ON sb.rn = um.rn
WHERE ub.user_id = 'a1f30266-3ffc-49d3-8ea5-fb3f78a79361'
  AND ub.milestone = um.milestone;

-- Verify the inserted badges
SELECT
    ub.user_id,
    ub.milestone,
    b.location_name,
    b.animal,
    b.image_url
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
WHERE ub.user_id = 'a1f30266-3ffc-49d3-8ea5-fb3f78a79361'
ORDER BY ub.milestone;
