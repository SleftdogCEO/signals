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
  subscription_status subscription_status DEFAULT 'trial',
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
  stripe_customer_id TEXT,

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
