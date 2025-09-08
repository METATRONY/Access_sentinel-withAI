# Access Sentinel Database Documentation

## Overview
The Access Sentinel database uses PostgreSQL through Supabase, designed to support a freemium Chrome extension for AI content detection.

## Database Schema

### Users Table
Stores user account information and authentication data.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    google_id TEXT UNIQUE,
    apple_id TEXT UNIQUE,
    referral_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Primary key, auto-generated UUID
- `email`: User's email address (required, unique)
- `username`: Optional username
- `google_id`: Google OAuth identifier
- `apple_id`: Apple Sign-In identifier
- `referral_code`: Unique 6-character code for referral program
- `created_at/updated_at`: Timestamps for audit trail

### Subscriptions Table
Manages user subscription plans and payment information.

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'premium')),
    payment_processor_customer_id TEXT,
    payment_processor_subscription_id TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Business Logic:**
- Free tier: 10 queries/day, 100K tokens/month
- Premium tier: $2.99/month, 1M tokens/month
- `end_date` NULL for active subscriptions

### Usage Logs Table
Tracks API usage for quota enforcement and analytics.

```sql
CREATE TABLE usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    feature_used TEXT NOT NULL,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Features:**
- `image_check`: AI image analysis
- `fact_check`: Text fact verification
- Used for daily/monthly quota calculations

### Referrals Table
Manages referral program tracking and rewards.

```sql
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    reward_amount DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Status Values:**
- `pending`: Referral registered, no payment yet
- `completed`: Referred user subscribed, reward earned
- `expired`: Referral expired without conversion

### Scan Results Table
Stores AI analysis results for user history and improvement.

```sql
CREATE TABLE scan_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('text', 'image')),
    original_content TEXT NOT NULL,
    analysis_result TEXT NOT NULL,
    confidence_score DECIMAL(5,2),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Row Level Security (RLS)

All tables implement RLS policies to ensure users can only access their own data:

```sql
-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Similar policies for usage_logs, referrals, and scan_results
```

## Indexes for Performance

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_timestamp ON usage_logs(timestamp);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
```

## Common Queries

### Check Daily Usage
```sql
SELECT COUNT(*) as daily_queries
FROM usage_logs 
WHERE user_id = $1 
AND timestamp >= CURRENT_DATE;
```

### Get Monthly Token Usage
```sql
SELECT SUM(tokens_used) as monthly_tokens
FROM usage_logs 
WHERE user_id = $1 
AND timestamp >= DATE_TRUNC('month', CURRENT_DATE);
```

### Active Subscription Check
```sql
SELECT plan_type 
FROM subscriptions 
WHERE user_id = $1 
AND (end_date IS NULL OR end_date > NOW());
```