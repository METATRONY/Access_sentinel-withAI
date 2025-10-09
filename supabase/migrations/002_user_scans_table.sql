-- Create user_scans table for storing individual page scan results
CREATE TABLE user_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    website_url TEXT NOT NULL,
    scan_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    categories JSONB NOT NULL DEFAULT '[]',
    total_cost DECIMAL(10,6) DEFAULT 0.00,
    images_analyzed INTEGER DEFAULT 0,
    text_analyzed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_scans_user_id ON user_scans(user_id);
CREATE INDEX idx_user_scans_scan_date ON user_scans(scan_date);
CREATE INDEX idx_user_scans_website_url ON user_scans(website_url);

-- Update usage_logs table to include more scan-specific fields
ALTER TABLE usage_logs ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE usage_logs ADD COLUMN IF NOT EXISTS analysis_type TEXT;
ALTER TABLE usage_logs ADD COLUMN IF NOT EXISTS cost DECIMAL(10,6) DEFAULT 0.00;
ALTER TABLE usage_logs ADD COLUMN IF NOT EXISTS images_analyzed INTEGER DEFAULT 0;
ALTER TABLE usage_logs ADD COLUMN IF NOT EXISTS text_analyzed INTEGER DEFAULT 0;
ALTER TABLE usage_logs ADD COLUMN IF NOT EXISTS blocked_content INTEGER DEFAULT 0;