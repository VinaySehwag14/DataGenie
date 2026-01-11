-- Add usage tracking to workspaces
ALTER TABLE workspaces 
ADD COLUMN IF NOT EXISTS daily_ai_usage_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_reset_date TIMESTAMPTZ DEFAULT NOW();
