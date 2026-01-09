-- Network Intelligence Tables Migration
-- Run this in Supabase SQL Editor or via CLI

-- Post categories for the feed
DO $$ BEGIN
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
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Reviews for software/services
DO $$ BEGIN
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
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Network posts (feed/forum content)
CREATE TABLE IF NOT EXISTS network_posts (
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
  is_ai_insight BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments on posts
CREATE TABLE IF NOT EXISTS network_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES network_posts(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES network_comments(id) ON DELETE CASCADE,

  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Upvotes tracking
CREATE TABLE IF NOT EXISTS network_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  post_id UUID REFERENCES network_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES network_comments(id) ON DELETE CASCADE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(provider_id, post_id),
  UNIQUE(provider_id, comment_id),
  CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Product/Service reviews
CREATE TABLE IF NOT EXISTS network_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,

  review_type review_type NOT NULL,
  product_name TEXT NOT NULL,
  vendor_name TEXT,

  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  ease_of_use INTEGER CHECK (ease_of_use >= 1 AND ease_of_use <= 5),
  value_for_money INTEGER CHECK (value_for_money >= 1 AND value_for_money <= 5),
  customer_support INTEGER CHECK (customer_support >= 1 AND customer_support <= 5),

  title TEXT NOT NULL,
  pros TEXT,
  cons TEXT,
  review_content TEXT NOT NULL,

  would_recommend BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market intelligence (AI-curated)
CREATE TABLE IF NOT EXISTS market_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  location TEXT,
  specialty TEXT,

  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  source_url TEXT,
  source_name TEXT,

  category TEXT NOT NULL,
  relevance_score INTEGER DEFAULT 50 CHECK (relevance_score >= 0 AND relevance_score <= 100),

  ai_generated BOOLEAN DEFAULT true,
  raw_data JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_category ON network_posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_provider ON network_posts(provider_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON network_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON network_posts(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_comments_post ON network_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_reviews_type ON network_reviews(review_type);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON network_reviews(product_name);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON network_reviews(overall_rating);
CREATE INDEX IF NOT EXISTS idx_intelligence_location ON market_intelligence(location);
CREATE INDEX IF NOT EXISTS idx_intelligence_category ON market_intelligence(category);

-- Enable RLS
ALTER TABLE network_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_intelligence ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can view posts" ON network_posts;
CREATE POLICY "Anyone can view posts" ON network_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Providers can create posts" ON network_posts;
CREATE POLICY "Providers can create posts" ON network_posts
  FOR INSERT WITH CHECK (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Providers can update own posts" ON network_posts;
CREATE POLICY "Providers can update own posts" ON network_posts
  FOR UPDATE USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Anyone can view comments" ON network_comments;
CREATE POLICY "Anyone can view comments" ON network_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Providers can create comments" ON network_comments;
CREATE POLICY "Providers can create comments" ON network_comments
  FOR INSERT WITH CHECK (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Providers can manage own upvotes" ON network_upvotes;
CREATE POLICY "Providers can manage own upvotes" ON network_upvotes
  FOR ALL USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Anyone can view reviews" ON network_reviews;
CREATE POLICY "Anyone can view reviews" ON network_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Providers can create reviews" ON network_reviews;
CREATE POLICY "Providers can create reviews" ON network_reviews
  FOR INSERT WITH CHECK (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Providers can update own reviews" ON network_reviews;
CREATE POLICY "Providers can update own reviews" ON network_reviews
  FOR UPDATE USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Anyone can view intelligence" ON market_intelligence;
CREATE POLICY "Anyone can view intelligence" ON market_intelligence FOR SELECT USING (true);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_network_posts_updated_at ON network_posts;
CREATE TRIGGER update_network_posts_updated_at
  BEFORE UPDATE ON network_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_network_comments_updated_at ON network_comments;
CREATE TRIGGER update_network_comments_updated_at
  BEFORE UPDATE ON network_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_network_reviews_updated_at ON network_reviews;
CREATE TRIGGER update_network_reviews_updated_at
  BEFORE UPDATE ON network_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Helper function
CREATE OR REPLACE FUNCTION increment_comment_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE network_posts
  SET comment_count = comment_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;
