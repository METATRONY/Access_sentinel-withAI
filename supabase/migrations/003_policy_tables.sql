-- Create content_policies table
CREATE TABLE content_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policy_categories table for threshold rules
CREATE TABLE policy_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID REFERENCES content_policies(id) ON DELETE CASCADE,
    category_name TEXT NOT NULL,
    threshold_low INTEGER DEFAULT 0,
    threshold_medium INTEGER DEFAULT 50,
    threshold_high INTEGER DEFAULT 80,
    action_low TEXT DEFAULT 'ALLOW',
    action_medium TEXT DEFAULT 'BLUR',
    action_high TEXT DEFAULT 'BLOCK',
    weight DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policy_keywords table
CREATE TABLE policy_keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID REFERENCES content_policies(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    keyword_type TEXT NOT NULL CHECK (keyword_type IN ('BLACKLIST', 'WHITELIST')),
    category TEXT,
    is_regex BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policy_domains table
CREATE TABLE policy_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID REFERENCES content_policies(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    domain_type TEXT NOT NULL CHECK (domain_type IN ('BLACKLIST', 'WHITELIST')),
    action TEXT NOT NULL CHECK (action IN ('ALLOW', 'BLUR', 'BLOCK')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_content_policies_user_id ON content_policies(user_id);
CREATE INDEX idx_content_policies_is_active ON content_policies(is_active);
CREATE INDEX idx_policy_categories_policy_id ON policy_categories(policy_id);
CREATE INDEX idx_policy_keywords_policy_id ON policy_keywords(policy_id);
CREATE INDEX idx_policy_domains_policy_id ON policy_domains(policy_id);
