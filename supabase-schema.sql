-- Sleft Health Network Database Schema
-- Run this in Supabase SQL Editor

-- Healthcare specialties enum for consistency
CREATE TYPE healthcare_specialty AS ENUM (
  'Primary Care',
  'Family Medicine',
  'Internal Medicine',
  'Pediatrics',
  'Orthopedic Surgery',
  'Physical Therapy',
  'Occupational Therapy',
  'Chiropractic',
  'Sports Medicine',
  'Pain Management',
  'Neurology',
  'Cardiology',
  'Dermatology',
  'Psychiatry',
  'Psychology',
  'Counseling',
  'Social Work',
  'Dentistry',
  'Orthodontics',
  'Oral Surgery',
  'Periodontics',
  'Optometry',
  'Ophthalmology',
  'OB/GYN',
  'Urology',
  'Gastroenterology',
  'Pulmonology',
  'Endocrinology',
  'Rheumatology',
  'Oncology',
  'Plastic Surgery',
  'ENT',
  'Podiatry',
  'Acupuncture',
  'Massage Therapy',
  'Nutrition/Dietetics',
  'Home Health',
  'Urgent Care',
  'Other'
);

-- Subscription status enum
CREATE TYPE subscription_status AS ENUM (
  'trial',
  'active',
  'canceled',
  'past_due'
);

-- Match status enum
CREATE TYPE match_status AS ENUM (
  'pending',
  'intro_sent',
  'connected',
  'declined'
);

-- Providers table
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Practice info
  practice_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  location TEXT NOT NULL, -- "City, State" format
  bio TEXT,

  -- What they want/give
  patients_i_want TEXT[] DEFAULT '{}', -- Specialties they want referrals FROM
  patients_i_refer TEXT[] DEFAULT '{}', -- Specialties they refer TO

  -- Contact info
  phone TEXT,
  email TEXT NOT NULL,
  website TEXT,

  -- Status
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Network membership
  network_opted_in BOOLEAN DEFAULT false,

  -- Subscription
  subscription_status subscription_status DEFAULT 'trial',
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_ends_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one provider per user
  UNIQUE(user_id)
);

-- Matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The two providers
  provider_a UUID REFERENCES providers(id) ON DELETE CASCADE,
  provider_b UUID REFERENCES providers(id) ON DELETE CASCADE,

  -- Who initiated (provider_a always initiates)
  initiated_by UUID REFERENCES providers(id),

  -- Match quality
  match_score INTEGER DEFAULT 0 CHECK (match_score >= 0 AND match_score <= 100),

  -- Status
  status match_status DEFAULT 'pending',

  -- Timestamps
  intro_sent_at TIMESTAMP WITH TIME ZONE,
  connected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate matches
  UNIQUE(provider_a, provider_b)
);

-- Indexes for performance
CREATE INDEX idx_providers_location ON providers(location);
CREATE INDEX idx_providers_specialty ON providers(specialty);
CREATE INDEX idx_providers_subscription ON providers(subscription_status);
CREATE INDEX idx_providers_network ON providers(network_opted_in) WHERE network_opted_in = true;
CREATE INDEX idx_providers_user_id ON providers(user_id);
CREATE INDEX idx_matches_provider_a ON matches(provider_a);
CREATE INDEX idx_matches_provider_b ON matches(provider_b);
CREATE INDEX idx_matches_status ON matches(status);

-- Row Level Security (RLS)
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Providers policies
CREATE POLICY "Users can view all active providers" ON providers
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can insert their own provider" ON providers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own provider" ON providers
  FOR UPDATE USING (auth.uid() = user_id);

-- Matches policies
CREATE POLICY "Users can view their own matches" ON matches
  FOR SELECT USING (
    provider_a IN (SELECT id FROM providers WHERE user_id = auth.uid())
    OR provider_b IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create matches from their provider" ON matches
  FOR INSERT WITH CHECK (
    provider_a IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update matches they're part of" ON matches
  FOR UPDATE USING (
    provider_a IN (SELECT id FROM providers WHERE user_id = auth.uid())
    OR provider_b IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_providers_updated_at
  BEFORE UPDATE ON providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate match score between two providers
CREATE OR REPLACE FUNCTION calculate_match_score(provider_a_id UUID, provider_b_id UUID)
RETURNS INTEGER AS $$
DECLARE
  a_record RECORD;
  b_record RECORD;
  score INTEGER := 0;
BEGIN
  SELECT * INTO a_record FROM providers WHERE id = provider_a_id;
  SELECT * INTO b_record FROM providers WHERE id = provider_b_id;

  -- Same location required
  IF a_record.location != b_record.location THEN
    RETURN 0;
  END IF;

  -- Same specialty = competitors = 0
  IF a_record.specialty = b_record.specialty THEN
    RETURN 0;
  END IF;

  -- A wants what B refers
  IF a_record.patients_i_want && b_record.patients_i_refer THEN
    score := score + 40;
  END IF;

  -- B wants what A refers
  IF b_record.patients_i_want && a_record.patients_i_refer THEN
    score := score + 40;
  END IF;

  -- Both active subscribers bonus
  IF a_record.subscription_status = 'active' AND b_record.subscription_status = 'active' THEN
    score := score + 20;
  END IF;

  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- NETWORK INTELLIGENCE TABLES
-- ============================================

-- Post categories for the feed
CREATE TYPE post_category AS ENUM (
  'software',
  'payment_processing',
  'marketing',
  'practice_management',
  'ai_tools',
  'patient_experience',
  'hiring',
  'insurance',
  'general',
  'announcement'
);

-- Reviews for software/services
CREATE TYPE review_type AS ENUM (
  'ehr_software',
  'practice_management',
  'payment_processing',
  'marketing_service',
  'billing_service',
  'telehealth',
  'scheduling',
  'patient_communication',
  'ai_tool',
  'other'
);

-- Network posts (feed/forum content)
CREATE TABLE network_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,

  -- Content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category post_category DEFAULT 'general',

  -- Engagement
  upvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,

  -- Visibility
  is_pinned BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_ai_insight BOOLEAN DEFAULT false, -- Curated by AI

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments on posts
CREATE TABLE network_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES network_posts(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES network_comments(id) ON DELETE CASCADE,

  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Upvotes tracking (prevent duplicate votes)
CREATE TABLE network_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  post_id UUID REFERENCES network_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES network_comments(id) ON DELETE CASCADE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One vote per provider per item
  UNIQUE(provider_id, post_id),
  UNIQUE(provider_id, comment_id),
  -- Must vote on either post or comment
  CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Product/Service reviews
CREATE TABLE network_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,

  -- What's being reviewed
  review_type review_type NOT NULL,
  product_name TEXT NOT NULL,
  vendor_name TEXT,

  -- Rating (1-5 stars)
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  ease_of_use INTEGER CHECK (ease_of_use >= 1 AND ease_of_use <= 5),
  value_for_money INTEGER CHECK (value_for_money >= 1 AND value_for_money <= 5),
  customer_support INTEGER CHECK (customer_support >= 1 AND customer_support <= 5),

  -- Content
  title TEXT NOT NULL,
  pros TEXT,
  cons TEXT,
  review_content TEXT NOT NULL,

  -- Would recommend
  would_recommend BOOLEAN DEFAULT true,

  -- Engagement
  helpful_count INTEGER DEFAULT 0,

  -- Verified purchase/use
  is_verified BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market intelligence (AI-curated from scraping)
CREATE TABLE market_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Location targeting
  location TEXT, -- "City, State" or NULL for national
  specialty TEXT, -- Specific specialty or NULL for all

  -- Content
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  source_url TEXT,
  source_name TEXT,

  -- Categorization
  category TEXT NOT NULL, -- 'competitor', 'regulation', 'trend', 'opportunity', 'news'
  relevance_score INTEGER DEFAULT 50 CHECK (relevance_score >= 0 AND relevance_score <= 100),

  -- AI metadata
  ai_generated BOOLEAN DEFAULT true,
  raw_data JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Indexes for network tables
CREATE INDEX idx_posts_category ON network_posts(category);
CREATE INDEX idx_posts_provider ON network_posts(provider_id);
CREATE INDEX idx_posts_created ON network_posts(created_at DESC);
CREATE INDEX idx_posts_featured ON network_posts(is_featured) WHERE is_featured = true;
CREATE INDEX idx_comments_post ON network_comments(post_id);
CREATE INDEX idx_reviews_type ON network_reviews(review_type);
CREATE INDEX idx_reviews_product ON network_reviews(product_name);
CREATE INDEX idx_reviews_rating ON network_reviews(overall_rating);
CREATE INDEX idx_intelligence_location ON market_intelligence(location);
CREATE INDEX idx_intelligence_category ON market_intelligence(category);

-- RLS for network tables
ALTER TABLE network_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_intelligence ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Anyone can view posts" ON network_posts
  FOR SELECT USING (true);

CREATE POLICY "Providers can create posts" ON network_posts
  FOR INSERT WITH CHECK (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

CREATE POLICY "Providers can update own posts" ON network_posts
  FOR UPDATE USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

-- Comments policies
CREATE POLICY "Anyone can view comments" ON network_comments
  FOR SELECT USING (true);

CREATE POLICY "Providers can create comments" ON network_comments
  FOR INSERT WITH CHECK (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

-- Upvotes policies
CREATE POLICY "Providers can manage own upvotes" ON network_upvotes
  FOR ALL USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON network_reviews
  FOR SELECT USING (true);

CREATE POLICY "Providers can create reviews" ON network_reviews
  FOR INSERT WITH CHECK (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

CREATE POLICY "Providers can update own reviews" ON network_reviews
  FOR UPDATE USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

-- Intelligence is read-only for all
CREATE POLICY "Anyone can view intelligence" ON market_intelligence
  FOR SELECT USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_network_posts_updated_at
  BEFORE UPDATE ON network_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_network_comments_updated_at
  BEFORE UPDATE ON network_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_network_reviews_updated_at
  BEFORE UPDATE ON network_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment comment count on a post
CREATE OR REPLACE FUNCTION increment_comment_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE network_posts
  SET comment_count = comment_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;
