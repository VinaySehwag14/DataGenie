-- Add subscription tracking to workspaces
ALTER TABLE workspaces 
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free', -- 'free', 'pro', 'enterprise'
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active', -- 'active', 'past_due', 'canceled'
ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT;
