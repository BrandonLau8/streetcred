-- Quick Demo User Setup
-- Replace YOUR-USER-ID-HERE with the actual user ID from Supabase Auth

DO $$
DECLARE
    demo_user_id UUID := 'YOUR-USER-ID-HERE';  -- PASTE USER ID HERE
BEGIN
    -- Create/Update profile for demo user
    INSERT INTO profiles (user_id, username, full_name, points, created_at)
    VALUES (
        demo_user_id,
        'demo@streetcred.app',
        'Demo User',
        150,
        NOW()
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
        username = 'demo@streetcred.app',
        full_name = 'Demo User',
        points = 150;

    -- Assign 4 badges to demo user WITH milestone
    INSERT INTO user_badges (user_id, badge_id, milestone, earned_at)
    SELECT
        demo_user_id,
        id,
        'first_report',  -- Add milestone value
        NOW()
    FROM badges
    WHERE animal IN ('pigeon', 'rat', 'squirrel', 'raccoon')
    LIMIT 4
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Demo user setup complete!';
END $$;

-- Verify demo user
SELECT
    p.user_id,
    p.username,
    p.full_name,
    p.points,
    COUNT(ub.id) as badges_earned
FROM profiles p
LEFT JOIN user_badges ub ON p.user_id = ub.user_id
WHERE p.username = 'demo@streetcred.app'
GROUP BY p.user_id, p.username, p.full_name, p.points;
