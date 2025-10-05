-- Create user_badges table to track badge awards
CREATE TABLE IF NOT EXISTS user_badges (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    badge_id BIGINT REFERENCES badges(id) ON DELETE CASCADE,
    milestone INTEGER NOT NULL,
    earned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, milestone)  -- Prevent duplicate badges for same milestone
);

-- Add index for faster queries
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_milestone ON user_badges(milestone);

-- Enable RLS
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own badges"
ON user_badges FOR SELECT
TO public
USING (true);

CREATE POLICY "System can insert badges"
ON user_badges FOR INSERT
TO public
WITH CHECK (true);

-- Add points column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Add index on points for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles(points);

-- Optional: Create view for easy badge queries with user info
CREATE OR REPLACE VIEW user_badges_with_details AS
SELECT
    ub.id,
    ub.user_id,
    ub.milestone,
    ub.earned_at,
    b.animal,
    b.location_name,
    b.image_url,
    p.points as user_points,
    p.username
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
JOIN profiles p ON ub.user_id = p.user_id
ORDER BY ub.earned_at DESC;
