-- ============================================================================
-- LAALI AI Platform - Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. VOICE AGENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS voice_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  avatar_url TEXT,
  
  -- Configuration
  voice_id VARCHAR(100) DEFAULT 'default',
  language VARCHAR(10) DEFAULT 'en',
  personality TEXT, -- JSON string for personality traits
  
  -- Knowledge Base
  knowledge_base_id UUID, -- Reference to RAG knowledge base
  system_prompt TEXT,
  
  -- Settings
  is_active BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT false,
  
  -- Stats (denormalized for quick access)
  total_calls INTEGER DEFAULT 0,
  total_minutes DECIMAL(10, 2) DEFAULT 0,
  avg_rating DECIMAL(3, 2),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_call_at TIMESTAMPTZ
);

-- Index for faster queries
CREATE INDEX idx_voice_agents_user_id ON voice_agents(user_id);
CREATE INDEX idx_voice_agents_tenant_id ON voice_agents(tenant_id);
CREATE INDEX idx_voice_agents_is_active ON voice_agents(is_active);

-- ============================================================================
-- 2. CALLS TABLE (Call History & Analytics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES voice_agents(id) ON DELETE SET NULL,
  
  -- Call Info
  caller_phone VARCHAR(50),
  caller_name VARCHAR(255),
  direction VARCHAR(20) DEFAULT 'inbound', -- inbound, outbound
  
  -- Timing
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(50) DEFAULT 'completed', -- completed, missed, failed, escalated
  
  -- AI Analysis
  sentiment VARCHAR(20), -- positive, neutral, negative
  sentiment_score DECIMAL(3, 2), -- -1 to 1
  intent VARCHAR(255), -- detected intent
  summary TEXT, -- AI-generated summary
  
  -- Transcript
  transcript JSONB, -- Array of {role, content, timestamp}
  
  -- Recording
  recording_url TEXT,
  
  -- Metadata
  metadata JSONB, -- Any additional data
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX idx_calls_user_id ON calls(user_id);
CREATE INDEX idx_calls_tenant_id ON calls(tenant_id);
CREATE INDEX idx_calls_agent_id ON calls(agent_id);
CREATE INDEX idx_calls_started_at ON calls(started_at);
CREATE INDEX idx_calls_status ON calls(status);
CREATE INDEX idx_calls_sentiment ON calls(sentiment);

-- ============================================================================
-- 3. DATA CONNECTORS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS data_connectors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Connector Info
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- salesforce, hubspot, zendesk, google_sheets, notion, etc.
  description TEXT,
  icon_url TEXT,
  
  -- Connection
  status VARCHAR(50) DEFAULT 'connected', -- connected, disconnected, error, syncing
  credentials JSONB, -- Encrypted credentials (handle encryption separately)
  config JSONB, -- Connector-specific configuration
  
  -- Sync Info
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  sync_frequency VARCHAR(50) DEFAULT 'daily', -- realtime, hourly, daily, weekly
  records_synced INTEGER DEFAULT 0,
  
  -- Error Handling
  last_error TEXT,
  error_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_data_connectors_user_id ON data_connectors(user_id);
CREATE INDEX idx_data_connectors_tenant_id ON data_connectors(tenant_id);
CREATE INDEX idx_data_connectors_type ON data_connectors(type);
CREATE INDEX idx_data_connectors_status ON data_connectors(status);

-- ============================================================================
-- 4. INVOICES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Invoice Info
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Billing Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Amounts (in smallest currency unit, e.g., paise for INR)
  subtotal INTEGER NOT NULL,
  tax_amount INTEGER DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 18.00, -- GST rate
  discount_amount INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, paid, overdue, cancelled
  
  -- Payment
  payment_method VARCHAR(50), -- card, upi, bank_transfer
  payment_id VARCHAR(255), -- Stripe/Cashfree payment ID
  paid_at TIMESTAMPTZ,
  
  -- Details
  line_items JSONB, -- Array of {description, quantity, unit_price, amount}
  
  -- PDF
  pdf_url TEXT,
  
  -- GST (India-specific)
  gstin VARCHAR(15), -- Customer GSTIN
  billing_address JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  due_date DATE
);

-- Indexes
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);

-- ============================================================================
-- 5. API KEYS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Key Info
  name VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(10) NOT NULL, -- First 8 chars for identification (e.g., "laali_sk_")
  key_hash VARCHAR(255) NOT NULL, -- Hashed key (never store plain key)
  
  -- Permissions
  permissions JSONB DEFAULT '["read", "write"]'::jsonb, -- Array of permissions
  
  -- Usage
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  
  -- Limits
  rate_limit INTEGER DEFAULT 1000, -- Requests per minute
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_tenant_id ON api_keys(tenant_id);
CREATE INDEX idx_api_keys_key_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);

-- ============================================================================
-- 6. CHAT MESSAGES TABLE (LAALI Chat History)
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Conversation
  conversation_id UUID NOT NULL, -- Group messages by conversation
  
  -- Message
  role VARCHAR(20) NOT NULL, -- user, assistant
  content TEXT NOT NULL,
  
  -- Language
  language VARCHAR(10) DEFAULT 'auto',
  
  -- Feedback
  feedback VARCHAR(10), -- up, down, null
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- ============================================================================
-- 7. USAGE TRACKING TABLE (For billing)
-- ============================================================================
CREATE TABLE IF NOT EXISTS usage_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Usage Type
  type VARCHAR(50) NOT NULL, -- voice_minutes, api_calls, storage_mb, agents
  
  -- Amount
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(20) NOT NULL, -- minutes, calls, mb, count
  
  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Cost
  unit_cost DECIMAL(10, 4), -- Cost per unit
  total_cost DECIMAL(10, 2),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_usage_records_user_id ON usage_records(user_id);
CREATE INDEX idx_usage_records_tenant_id ON usage_records(tenant_id);
CREATE INDEX idx_usage_records_type ON usage_records(type);
CREATE INDEX idx_usage_records_period ON usage_records(period_start, period_end);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE voice_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VOICE AGENTS POLICIES
-- ============================================================================
CREATE POLICY "Users can view own agents" ON voice_agents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own agents" ON voice_agents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agents" ON voice_agents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own agents" ON voice_agents
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- CALLS POLICIES
-- ============================================================================
CREATE POLICY "Users can view own calls" ON calls
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own calls" ON calls
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- DATA CONNECTORS POLICIES
-- ============================================================================
CREATE POLICY "Users can view own connectors" ON data_connectors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own connectors" ON data_connectors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connectors" ON data_connectors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connectors" ON data_connectors
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- INVOICES POLICIES
-- ============================================================================
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

-- Only system can create/update invoices (via service role)

-- ============================================================================
-- API KEYS POLICIES
-- ============================================================================
CREATE POLICY "Users can view own api keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own api keys" ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own api keys" ON api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own api keys" ON api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- CHAT MESSAGES POLICIES
-- ============================================================================
CREATE POLICY "Users can view own chat messages" ON chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat message feedback" ON chat_messages
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- USAGE RECORDS POLICIES
-- ============================================================================
CREATE POLICY "Users can view own usage" ON usage_records
  FOR SELECT USING (auth.uid() = user_id);

-- Only system can create usage records (via service role)

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at
CREATE TRIGGER update_voice_agents_updated_at
    BEFORE UPDATE ON voice_agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_connectors_updated_at
    BEFORE UPDATE ON data_connectors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- Call analytics summary view
CREATE OR REPLACE VIEW call_analytics_summary AS
SELECT 
  user_id,
  tenant_id,
  DATE(started_at) as call_date,
  COUNT(*) as total_calls,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_calls,
  COUNT(CASE WHEN status = 'missed' THEN 1 END) as missed_calls,
  COUNT(CASE WHEN sentiment = 'positive' THEN 1 END) as positive_calls,
  COUNT(CASE WHEN sentiment = 'negative' THEN 1 END) as negative_calls,
  AVG(duration_seconds) as avg_duration,
  SUM(duration_seconds) as total_duration
FROM calls
GROUP BY user_id, tenant_id, DATE(started_at);

-- ============================================================================
-- SEED DATA (Optional - for testing)
-- ============================================================================

-- You can uncomment this to add sample data for testing
-- Make sure to replace 'YOUR_USER_ID' with an actual user ID

/*
-- Sample voice agent
INSERT INTO voice_agents (user_id, name, description, voice_id, language, is_active, is_published)
VALUES 
  ('YOUR_USER_ID', 'Support Agent', 'Handles customer support calls', 'shimmer', 'en', true, true),
  ('YOUR_USER_ID', 'Sales Agent', 'Handles sales inquiries', 'nova', 'hi', true, false);

-- Sample data connector
INSERT INTO data_connectors (user_id, name, type, status, records_synced)
VALUES 
  ('YOUR_USER_ID', 'My CRM', 'salesforce', 'connected', 1250),
  ('YOUR_USER_ID', 'Support Docs', 'notion', 'connected', 89);
*/

-- ============================================================================
-- DONE! 🎉
-- ============================================================================
-- Now run this SQL in your Supabase SQL Editor:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Paste this entire file
-- 3. Click "Run"
-- ============================================================================


-- ============================================================================
-- 8. PHONE NUMBERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS phone_numbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Phone Number Info
  phone_number VARCHAR(50) NOT NULL UNIQUE,
  provider VARCHAR(50) NOT NULL DEFAULT 'elyra', -- elyra (white-label), exotel, telnyx, twilio
  provider_sid VARCHAR(255), -- Provider's internal ID
  
  -- Type & Location
  number_type VARCHAR(20) NOT NULL DEFAULT 'local', -- local, toll_free, mobile, national
  country VARCHAR(5) NOT NULL DEFAULT 'IN', -- ISO country code
  region VARCHAR(100), -- State/city
  
  -- Display
  friendly_name VARCHAR(255),
  
  -- Configuration
  voice_url TEXT, -- Webhook URL for incoming calls
  sms_url TEXT,
  persona VARCHAR(100) DEFAULT 'aria', -- AI persona for this number
  language VARCHAR(10) DEFAULT 'hi',
  
  -- Assignment
  assigned_agent_id UUID REFERENCES voice_agents(id) ON DELETE SET NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, pending, suspended, released
  
  -- Billing
  monthly_cost DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(5) DEFAULT 'INR',
  setup_cost DECIMAL(10, 2) DEFAULT 0,
  
  -- Usage Stats
  total_calls INTEGER DEFAULT 0,
  total_minutes DECIMAL(10, 2) DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_call_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_phone_numbers_user_id ON phone_numbers(user_id);
CREATE INDEX idx_phone_numbers_tenant_id ON phone_numbers(tenant_id);
CREATE INDEX idx_phone_numbers_phone ON phone_numbers(phone_number);
CREATE INDEX idx_phone_numbers_country ON phone_numbers(country);
CREATE INDEX idx_phone_numbers_status ON phone_numbers(status);
CREATE INDEX idx_phone_numbers_assigned_agent ON phone_numbers(assigned_agent_id);

-- RLS Policies
ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;

-- Users can only see their own phone numbers
CREATE POLICY "phone_numbers_select" ON phone_numbers 
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert phone numbers for themselves
CREATE POLICY "phone_numbers_insert" ON phone_numbers 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own phone numbers
CREATE POLICY "phone_numbers_update" ON phone_numbers 
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own phone numbers
CREATE POLICY "phone_numbers_delete" ON phone_numbers 
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_phone_numbers_updated_at
  BEFORE UPDATE ON phone_numbers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
