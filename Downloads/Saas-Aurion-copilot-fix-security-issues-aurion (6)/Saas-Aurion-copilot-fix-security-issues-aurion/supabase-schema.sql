-- ============================================
-- AURION SAAS - COMPLETE DATABASE SCHEMA
-- Production-ready schema with all tables, triggers, and RPC functions
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (synced with Clerk auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User plans table
CREATE TABLE IF NOT EXISTS public.user_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'starter', 'plus', 'pro', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'trial')) DEFAULT 'active',
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  credits_monthly INTEGER NOT NULL DEFAULT 100,
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  trial_ends_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, status) -- Only one active plan per user
);

-- User credits table
CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_credits INTEGER NOT NULL DEFAULT 100,
  used_credits INTEGER NOT NULL DEFAULT 0,
  bonus_credits INTEGER NOT NULL DEFAULT 0,
  last_reset_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT credits_non_negative CHECK (used_credits >= 0 AND total_credits >= 0)
);

-- Usage logs table
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tool sessions table (for iframe tool tokens)
CREATE TABLE IF NOT EXISTS public.tool_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  credits_consumed INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stripe sessions table
CREATE TABLE IF NOT EXISTS public.stripe_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL UNIQUE,
  plan_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled', 'expired')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan_type TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook failures table (for monitoring)
CREATE TABLE IF NOT EXISTS public.webhook_failures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_plans_user_id ON public.user_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_status ON public.user_plans(status);
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON public.usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action_type ON public.usage_logs(action_type); -- For analytics
CREATE INDEX IF NOT EXISTS idx_tool_sessions_user_id ON public.tool_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_sessions_token ON public.tool_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_user_id ON public.stripe_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_failures_created_at ON public.webhook_failures(created_at DESC); -- For monitoring
CREATE INDEX IF NOT EXISTS idx_webhook_failures_event_type ON public.webhook_failures(event_type); -- For filtering by event

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_plans_updated_at ON public.user_plans;
CREATE TRIGGER update_user_plans_updated_at
  BEFORE UPDATE ON public.user_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_credits_updated_at ON public.user_credits;
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CRITICAL: AUTO-INITIALIZE NEW USERS WITH 100 TOKENS
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create free plan with 100 credits/month
  INSERT INTO public.user_plans (user_id, plan_type, status, credits_monthly)
  VALUES (NEW.id, 'free', 'active', 100)
  ON CONFLICT DO NOTHING;

  -- Initialize credits with exactly 100 tokens
  INSERT INTO public.user_credits (user_id, total_credits, used_credits, bonus_credits)
  VALUES (NEW.id, 100, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Log the initialization
  INSERT INTO public.usage_logs (user_id, action_type, credits_used, metadata)
  VALUES (NEW.id, 'account_created', 0, jsonb_build_object(
    'initial_credits', 100,
    'plan', 'free',
    'source', 'signup'
  ));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- RPC FUNCTIONS
-- ============================================

-- Function to consume credits atomically (prevents race conditions)
CREATE OR REPLACE FUNCTION public.consume_user_credits(
  p_user_id UUID,
  p_cost INTEGER,
  p_action_type TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
  v_credits RECORD;
  v_available INTEGER;
  v_new_used INTEGER;
BEGIN
  -- Lock the row for update to prevent race conditions
  SELECT total_credits, used_credits, bonus_credits
  INTO v_credits
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Check if credits exist
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_message', 'User credits not found',
      'available_credits', 0
    );
  END IF;

  -- Calculate available credits (total - used)
  v_available := v_credits.total_credits - v_credits.used_credits;

  -- Check if user has enough credits
  IF v_available < p_cost THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_message', 'Insufficient credits',
      'required_credits', p_cost,
      'available_credits', v_available,
      'total_credits', v_credits.total_credits,
      'used_credits', v_credits.used_credits
    );
  END IF;

  -- Consume credits
  v_new_used := v_credits.used_credits + p_cost;
  
  UPDATE public.user_credits
  SET 
    used_credits = v_new_used,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log the usage
  INSERT INTO public.usage_logs (user_id, action_type, credits_used, metadata)
  VALUES (p_user_id, p_action_type, p_cost, p_metadata);

  -- Return success with updated credit info
  RETURN jsonb_build_object(
    'success', true,
    'credits_consumed', p_cost,
    'remaining_credits', v_available - p_cost,
    'total_credits', v_credits.total_credits,
    'used_credits', v_new_used
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits (bonus or purchase)
CREATE OR REPLACE FUNCTION public.add_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT DEFAULT 'bonus'
)
RETURNS JSONB AS $$
DECLARE
  v_new_total INTEGER;
BEGIN
  UPDATE public.user_credits
  SET 
    total_credits = total_credits + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING total_credits INTO v_new_total;

  -- Log the addition
  INSERT INTO public.usage_logs (user_id, action_type, credits_used, metadata)
  VALUES (p_user_id, 'credits_added', -p_amount, jsonb_build_object(
    'reason', p_reason,
    'amount_added', p_amount
  ));

  RETURN jsonb_build_object(
    'success', true,
    'credits_added', p_amount,
    'new_total', v_new_total
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly credits (to be called by cron)
CREATE OR REPLACE FUNCTION public.reset_monthly_credits()
RETURNS INTEGER AS $$
DECLARE
  v_reset_count INTEGER := 0;
BEGIN
  -- Reset credits for users whose period has ended
  UPDATE public.user_credits uc
  SET 
    used_credits = 0,
    total_credits = up.credits_monthly,
    last_reset_date = NOW(),
    updated_at = NOW()
  FROM public.user_plans up
  WHERE 
    uc.user_id = up.user_id
    AND up.status = 'active'
    AND up.current_period_end < NOW();
  
  GET DIAGNOSTICS v_reset_count = ROW_COUNT;

  -- Update plan periods
  UPDATE public.user_plans
  SET 
    current_period_start = current_period_end,
    current_period_end = current_period_end + INTERVAL '30 days',
    updated_at = NOW()
  WHERE 
    status = 'active'
    AND current_period_end < NOW();

  RETURN v_reset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies for user_plans
DROP POLICY IF EXISTS "Users can view own plan" ON public.user_plans;
CREATE POLICY "Users can view own plan" ON public.user_plans
  FOR SELECT USING (auth.uid() = user_id);

-- Policies for user_credits
DROP POLICY IF EXISTS "Users can view own credits" ON public.user_credits;
CREATE POLICY "Users can view own credits" ON public.user_credits
  FOR SELECT USING (auth.uid() = user_id);

-- Policies for usage_logs
DROP POLICY IF EXISTS "Users can view own usage logs" ON public.usage_logs;
CREATE POLICY "Users can view own usage logs" ON public.usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Policies for tool_sessions
DROP POLICY IF EXISTS "Users can view own tool sessions" ON public.tool_sessions;
CREATE POLICY "Users can view own tool sessions" ON public.tool_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Policies for stripe_sessions
DROP POLICY IF EXISTS "Users can view own stripe sessions" ON public.stripe_sessions;
CREATE POLICY "Users can view own stripe sessions" ON public.stripe_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Policies for user_subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.user_plans TO authenticated;
GRANT SELECT ON public.user_credits TO authenticated;
GRANT SELECT ON public.usage_logs TO authenticated;
GRANT SELECT ON public.tool_sessions TO authenticated;
GRANT SELECT ON public.stripe_sessions TO authenticated;
GRANT SELECT ON public.user_subscriptions TO authenticated;

-- Grant execute on RPC functions
GRANT EXECUTE ON FUNCTION public.consume_user_credits TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_user_credits TO authenticated;

-- ============================================
-- INITIAL DATA (OPTIONAL)
-- ============================================

-- You can add initial data here if needed

COMMENT ON TABLE public.profiles IS 'User profiles synced from Clerk authentication';
COMMENT ON TABLE public.user_plans IS 'User subscription plans and billing periods';
COMMENT ON TABLE public.user_credits IS 'User credit/token balances';
COMMENT ON TABLE public.usage_logs IS 'Audit log of all credit consumption and actions';
COMMENT ON TABLE public.tool_sessions IS 'Active tool sessions with JWT tokens for iframes';
COMMENT ON FUNCTION public.handle_new_user IS 'CRITICAL: Auto-initializes new users with 100 free tokens';
COMMENT ON FUNCTION public.consume_user_credits IS 'Atomically consumes user credits with race condition protection';
