-- Create reports table for user-submitted location reports
CREATE TABLE IF NOT EXISTS reports (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,  -- Optional image URL from Supabase Storage
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_created_at ON reports(created_at);

-- Composite index for user's recent reports
CREATE INDEX idx_reports_user_created ON reports(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view all reports (public data)
CREATE POLICY "Anyone can view reports"
ON reports FOR SELECT
TO public
USING (true);

-- Users can only insert their own reports
CREATE POLICY "Users can create their own reports"
ON reports FOR INSERT
TO public
WITH CHECK (true);

-- Users can update/delete only their own reports
CREATE POLICY "Users can update their own reports"
ON reports FOR UPDATE
TO public
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
ON reports FOR DELETE
TO public
USING (auth.uid() = user_id);

-- View for reports with user info
CREATE OR REPLACE VIEW reports_with_user_info AS
SELECT
    r.id,
    r.user_id,
    r.lat,
    r.lon,
    r.description,
    r.image_url,
    r.created_at,
    p.username,
    p.points as user_points
FROM reports r
JOIN profiles p ON r.user_id = p.user_id
ORDER BY r.created_at DESC;

-- Create storage bucket for report images (run this in Supabase Dashboard or via SQL)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('report_images', 'report_images', true)
-- ON CONFLICT DO NOTHING;

-- Storage policy for report images (allows public read, authenticated write)
-- CREATE POLICY "Anyone can view report images"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'report_images');

-- CREATE POLICY "Authenticated users can upload report images"
-- ON storage.objects FOR INSERT
-- TO public
-- WITH CHECK (bucket_id = 'report_images');
