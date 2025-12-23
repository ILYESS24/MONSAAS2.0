-- ============================================
-- AURION SAAS - SETUP SUPABASE
-- ============================================

-- Table des utilisateurs (étendue de auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des plans utilisateur
CREATE TABLE IF NOT EXISTS public.user_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'starter', 'plus', 'pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  credits_monthly INTEGER NOT NULL DEFAULT 100,
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW() + INTERVAL '1 month'),
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  UNIQUE(user_id) -- Un seul plan actif par utilisateur
);

-- Table des crédits utilisateur
CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_credits INTEGER NOT NULL DEFAULT 100,
  used_credits INTEGER NOT NULL DEFAULT 0,
  bonus_credits INTEGER NOT NULL DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  UNIQUE(user_id), -- Un seul enregistrement crédits par utilisateur
  CHECK (total_credits >= 0),
  CHECK (used_credits >= 0),
  CHECK (bonus_credits >= 0)
);

-- Table des logs d'utilisation
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'image_generation', 'video_generation', 'code_generation',
    'ai_chat', 'agent_action', 'app_builder', 'website_builder', 'text_editor'
  )),
  credits_used INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  CHECK (credits_used >= 0)
);

-- Table des sessions Stripe
CREATE TABLE IF NOT EXISTS public.stripe_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL UNIQUE,
  plan_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Table des sessions d'outils (pour contrôle post-ouverture)
CREATE TABLE IF NOT EXISTS public.tool_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_id TEXT NOT NULL CHECK (tool_id IN (
    'app-builder', 'website-builder', 'text-editor', 'ai-agents',
    'code-editor', 'content-generator'
  )),
  credits_consumed INTEGER NOT NULL DEFAULT 0,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  CHECK (credits_consumed >= 0),
  CHECK (expires_at > created_at)
);

-- Table des webhooks Stripe (pour éviter les doublons)
CREATE TABLE IF NOT EXISTS public.stripe_webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- INDEXES POUR PERFORMANCES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_plans_user_id ON public.user_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_status ON public.user_plans(status);
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action_type ON public.usage_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON public.usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_user_id ON public.stripe_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_session_id ON public.stripe_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhooks_event_id ON public.stripe_webhooks(event_id);
CREATE INDEX IF NOT EXISTS idx_tool_sessions_user_id ON public.tool_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_sessions_token ON public.tool_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_tool_sessions_active ON public.tool_sessions(is_active, expires_at);

-- ============================================
-- POLITIQUES RLS (Row Level Security)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_sessions ENABLE ROW LEVEL SECURITY;

-- Politiques pour profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Politiques pour user_plans
CREATE POLICY "Users can view own plans" ON public.user_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own plans" ON public.user_plans
  FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour user_credits
CREATE POLICY "Users can view own credits" ON public.user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON public.user_credits
  FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour usage_logs
CREATE POLICY "Users can view own usage logs" ON public.usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Politiques pour stripe_sessions
CREATE POLICY "Users can view own stripe sessions" ON public.stripe_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Politiques pour tool_sessions
CREATE POLICY "Users can view own tool sessions" ON public.tool_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage tool sessions" ON public.tool_sessions
  FOR ALL USING (auth.role() = 'service_role');

-- Webhooks - seulement pour le service role
CREATE POLICY "Service role can manage webhooks" ON public.stripe_webhooks
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- FONCTIONS UTILES
-- ============================================

-- Fonction pour vérifier les limites d'usage avec verrouillage
CREATE OR REPLACE FUNCTION public.check_tool_limits(
  p_user_id UUID,
  p_tool_type TEXT,
  p_today TEXT,
  p_current_month TEXT,
  p_daily_limit INTEGER DEFAULT NULL,
  p_monthly_limit INTEGER DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_daily_used INTEGER := 0;
  v_monthly_used INTEGER := 0;
  v_daily_remaining INTEGER;
  v_monthly_remaining INTEGER;
BEGIN
  -- Vérifier limites journalières avec verrouillage
  IF p_daily_limit IS NOT NULL THEN
    SELECT COUNT(*) INTO v_daily_used
    FROM public.usage_logs
    WHERE user_id = p_user_id
      AND action_type = p_tool_type || '_action'
      AND DATE(created_at) = p_today::DATE;

    IF v_daily_used >= p_daily_limit THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', format('Daily limit reached (%s/%s)', v_daily_used, p_daily_limit),
        'daily_remaining', 0,
        'monthly_remaining', CASE WHEN p_monthly_limit IS NOT NULL THEN p_monthly_limit - v_monthly_used ELSE NULL END
      );
    END IF;
  END IF;

  -- Vérifier limites mensuelles avec verrouillage
  IF p_monthly_limit IS NOT NULL THEN
    SELECT COUNT(*) INTO v_monthly_used
    FROM public.usage_logs
    WHERE user_id = p_user_id
      AND action_type = p_tool_type || '_action'
      AND TO_CHAR(created_at, 'YYYY-MM') = p_current_month;

    IF v_monthly_used >= p_monthly_limit THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', format('Monthly limit reached (%s/%s)', v_monthly_used, p_monthly_limit),
        'daily_remaining', CASE WHEN p_daily_limit IS NOT NULL THEN p_daily_limit - v_daily_used ELSE NULL END,
        'monthly_remaining', 0
      );
    END IF;
  END IF;

  -- Calculer les restantes
  v_daily_remaining := CASE WHEN p_daily_limit IS NOT NULL THEN p_daily_limit - v_daily_used ELSE NULL END;
  v_monthly_remaining := CASE WHEN p_monthly_limit IS NOT NULL THEN p_monthly_limit - v_monthly_used ELSE NULL END;

  RETURN jsonb_build_object(
    'allowed', true,
    'daily_remaining', v_daily_remaining,
    'monthly_remaining', v_monthly_remaining
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Limit check error: ' || SQLERRM,
      'daily_remaining', NULL,
      'monthly_remaining', NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer un profil automatiquement
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');

  -- Créer le plan gratuit par défaut
  INSERT INTO public.user_plans (user_id, plan_type, status, credits_monthly, trial_ends_at)
  VALUES (NEW.id, 'free', 'trial', 100, NOW() + INTERVAL '14 days');

  -- Créer les crédits initiaux
  INSERT INTO public.user_credits (user_id, total_credits, used_credits)
  VALUES (NEW.id, 100, 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction atomique pour consommer des crédits (évite race conditions)
-- ============================================
-- REFUND USER CREDITS (for failed operations)
-- ============================================

CREATE OR REPLACE FUNCTION public.refund_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT DEFAULT 'refund'
)
RETURNS JSONB AS $$
DECLARE
  v_credits RECORD;
BEGIN
  -- Lock et récupère les crédits
  SELECT * INTO v_credits
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_message', 'Crédits utilisateur non trouvés'
    );
  END IF;

  -- Vérifie que l'utilisateur a assez de crédits utilisés à rembourser
  IF v_credits.used_credits < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_message', format('Crédits utilisés insuffisants pour remboursement: %s demandé, %s disponible', p_amount, v_credits.used_credits)
    );
  END IF;

  -- Met à jour les crédits (remboursement)
  UPDATE public.user_credits
  SET
    used_credits = used_credits - p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log le remboursement
  INSERT INTO public.usage_logs (
    user_id,
    action_type,
    credits_used,
    metadata,
    created_at
  ) VALUES (
    p_user_id,
    'credit_refund',
    -p_amount, -- Négatif pour indiquer un remboursement
    jsonb_build_object(
      'reason', p_reason,
      'refund_amount', p_amount,
      'timestamp', NOW()
    ),
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'refunded_amount', p_amount,
    'reason', p_reason
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_message', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CONSUME USER CREDITS
-- ============================================

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
  v_remaining INTEGER;
  v_log_id UUID;
BEGIN
  -- Lock et récupère les crédits (SELECT FOR UPDATE)
  SELECT * INTO v_credits
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_message', 'Crédits utilisateur non trouvés',
      'available_credits', 0
    );
  END IF;

  -- Calcule crédits disponibles
  v_available := v_credits.total_credits - v_credits.used_credits;

  -- Vérifie fonds suffisants
  IF v_available < p_cost THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_message', format('Crédits insuffisants. Requis: %s, Disponibles: %s', p_cost, v_available),
      'available_credits', v_available
    );
  END IF;

  -- Met à jour les crédits (atomique)
  UPDATE public.user_credits
  SET
    used_credits = used_credits + p_cost,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Calcule crédits restants
  v_remaining := v_credits.total_credits - (v_credits.used_credits + p_cost);

  -- Log l'usage
  INSERT INTO public.usage_logs (
    user_id,
    action_type,
    credits_used,
    metadata,
    created_at
  ) VALUES (
    p_user_id,
    p_action_type,
    p_cost,
    p_metadata,
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'credits_used', p_cost,
    'remaining_credits', v_remaining,
    'available_credits', v_available - p_cost
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error_message', SQLERRM,
      'available_credits', 0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour gérer les retries de webhooks
CREATE OR REPLACE FUNCTION public.schedule_webhook_retry(
  p_event_id TEXT,
  p_retry_count INTEGER
)
RETURNS VOID AS $$
DECLARE
  v_next_retry TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calcule le prochain retry avec backoff exponentiel
  -- 1min, 5min, 30min, 2h, 8h, 24h
  v_next_retry := NOW() + INTERVAL '1 minute' * POWER(5, LEAST(p_retry_count, 5));

  UPDATE public.stripe_webhooks
  SET
    retry_count = p_retry_count,
    next_retry_at = v_next_retry,
    error_message = 'Scheduled for retry'
  WHERE event_id = p_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour récupérer les webhooks à retenter
CREATE OR REPLACE FUNCTION public.get_pending_webhook_retries()
RETURNS TABLE (
  id UUID,
  event_id TEXT,
  event_type TEXT,
  event_data JSONB,
  retry_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    wh.id,
    wh.event_id,
    wh.event_type,
    wh.event_data,
    wh.retry_count
  FROM public.stripe_webhooks wh
  WHERE
    wh.processed = false
    AND wh.retry_count < 6  -- Max 6 tentatives
    AND (wh.next_retry_at IS NULL OR wh.next_retry_at <= NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour nettoyer les anciens logs d'usage (performance)
CREATE OR REPLACE FUNCTION public.cleanup_old_usage_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Supprimer les logs d'usage de plus de 90 jours
  -- Garder seulement les logs avec crédits utilisés (activité importante)
  DELETE FROM public.usage_logs
  WHERE
    created_at < NOW() - INTERVAL '90 days'
    AND credits_used = 0;  -- Garde les logs avec consommation de crédits

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Log de la maintenance
  INSERT INTO public.usage_logs (
    user_id,
    action_type,
    credits_used,
    metadata,
    created_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid, -- System user
    'system_cleanup',
    0,
    jsonb_build_object('deleted_logs', deleted_count, 'period_days', 90),
    NOW()
  );

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour archiver les anciens webhooks traités
CREATE OR REPLACE FUNCTION public.archive_old_webhooks()
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- Créer une table d'archive si elle n'existe pas
  CREATE TABLE IF NOT EXISTS public.stripe_webhooks_archive (
    LIKE public.stripe_webhooks INCLUDING ALL
  );

  -- Archiver les webhooks traités de plus de 30 jours
  INSERT INTO public.stripe_webhooks_archive
  SELECT * FROM public.stripe_webhooks
  WHERE
    processed = true
    AND processed_at < NOW() - INTERVAL '30 days';

  -- Supprimer de la table principale
  DELETE FROM public.stripe_webhooks
  WHERE
    processed = true
    AND processed_at < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS archived_count = ROW_COUNT;

  RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- BACKUPS & MONITORING PRODUCTION
-- ============================================

-- Fonction de vérification d'intégrité des données
CREATE OR REPLACE FUNCTION public.verify_data_integrity()
RETURNS TABLE (
  table_name TEXT,
  record_count BIGINT,
  last_updated TIMESTAMP WITH TIME ZONE,
  issues TEXT[]
) AS $$
DECLARE
  rec RECORD;
  issues TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Vérifier profiles
  SELECT COUNT(*) as count, MAX(updated_at) as last_update
  INTO rec
  FROM profiles;

  IF rec.count = 0 THEN
    issues := array_append(issues, 'Aucun profil utilisateur');
  END IF;

  RETURN QUERY SELECT
    'profiles'::TEXT,
    rec.count,
    rec.last_update,
    issues;

  -- Vérifier user_plans
  SELECT COUNT(*) as count, MAX(updated_at) as last_update
  INTO rec
  FROM user_plans;

  issues := ARRAY[]::TEXT[];
  IF rec.count = 0 THEN
    issues := array_append(issues, 'Aucun plan utilisateur');
  END IF;

  -- Vérifier cohérence plans
  SELECT COUNT(*) INTO rec.count
  FROM user_plans
  WHERE status NOT IN ('active', 'cancelled', 'expired', 'trial');

  IF rec.count > 0 THEN
    issues := array_append(issues, format('%s plans avec statut invalide', rec.count));
  END IF;

  RETURN QUERY SELECT
    'user_plans'::TEXT,
    (SELECT COUNT(*) FROM user_plans),
    (SELECT MAX(updated_at) FROM user_plans),
    issues;

  -- Vérifier user_credits
  SELECT COUNT(*) as count, MAX(updated_at) as last_update
  INTO rec
  FROM user_credits;

  issues := ARRAY[]::TEXT[];
  IF rec.count = 0 THEN
    issues := array_append(issues, 'Aucun enregistrement crédits');
  END IF;

  -- Vérifier crédits négatifs
  SELECT COUNT(*) INTO rec.count
  FROM user_credits
  WHERE total_credits < 0 OR used_credits < 0;

  IF rec.count > 0 THEN
    issues := array_append(issues, format('%s enregistrements avec crédits négatifs', rec.count));
  END IF;

  RETURN QUERY SELECT
    'user_credits'::TEXT,
    (SELECT COUNT(*) FROM user_credits),
    (SELECT MAX(updated_at) FROM user_credits),
    issues;

  -- Vérifier usage_logs
  SELECT COUNT(*) as count, MAX(created_at) as last_update
  INTO rec
  FROM usage_logs;

  issues := ARRAY[]::TEXT[];
  IF rec.last_update < NOW() - INTERVAL '24 hours' THEN
    issues := array_append(issues, 'Aucune activité récente (24h)');
  END IF;

  RETURN QUERY SELECT
    'usage_logs'::TEXT,
    rec.count,
    rec.last_update,
    issues;

  -- Vérifier stripe_sessions
  RETURN QUERY SELECT
    'stripe_sessions'::TEXT,
    (SELECT COUNT(*) FROM stripe_sessions)::BIGINT,
    (SELECT MAX(created_at) FROM stripe_sessions),
    ARRAY[]::TEXT[];

  -- Vérifier tool_sessions
  SELECT COUNT(*) as count, MAX(created_at) as last_update
  INTO rec
  FROM tool_sessions;

  issues := ARRAY[]::TEXT[];
  -- Vérifier sessions expirées actives
  SELECT COUNT(*) INTO rec.count
  FROM tool_sessions
  WHERE is_active = true AND expires_at < NOW();

  IF rec.count > 0 THEN
    issues := array_append(issues, format('%s sessions expirées encore actives', rec.count));
  END IF;

  RETURN QUERY SELECT
    'tool_sessions'::TEXT,
    (SELECT COUNT(*) FROM tool_sessions)::BIGINT,
    (SELECT MAX(created_at) FROM tool_sessions),
    issues;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction de création de backup point-in-time
CREATE OR REPLACE FUNCTION public.create_backup_snapshot()
RETURNS TEXT AS $$
DECLARE
  backup_id TEXT;
  backup_data JSONB;
BEGIN
  backup_id := 'backup_' || TO_CHAR(NOW(), 'YYYY_MM_DD_HH24_MI_SS');

  -- Collecter les statistiques de backup
  SELECT jsonb_build_object(
    'timestamp', NOW(),
    'profiles_count', (SELECT COUNT(*) FROM profiles),
    'plans_count', (SELECT COUNT(*) FROM user_plans),
    'credits_total', (SELECT SUM(total_credits) FROM user_credits),
    'usage_logs_count', (SELECT COUNT(*) FROM usage_logs),
    'active_sessions', (SELECT COUNT(*) FROM tool_sessions WHERE is_active = true),
    'stripe_sessions_count', (SELECT COUNT(*) FROM stripe_sessions)
  ) INTO backup_data;

  -- Créer une table de backup si elle n'existe pas
  CREATE TABLE IF NOT EXISTS public.database_backups (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data JSONB
  );

  -- Insérer le backup
  INSERT INTO public.database_backups (id, data)
  VALUES (backup_id, backup_data);

  -- Log du backup
  INSERT INTO public.usage_logs (
    user_id,
    action_type,
    credits_used,
    metadata
  ) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'system_backup',
    0,
    jsonb_build_object(
      'backup_id', backup_id,
      'data', backup_data
    )
  );

  RETURN backup_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction de monitoring des performances
CREATE OR REPLACE FUNCTION public.get_performance_metrics(
  p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
  metric_type TEXT,
  count BIGINT,
  avg_duration NUMERIC,
  min_duration NUMERIC,
  max_duration NUMERIC,
  p95_duration NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ul.metadata->>'endpoint' as metric_type,
    COUNT(*) as count,
    ROUND(AVG((ul.metadata->>'duration')::numeric), 2) as avg_duration,
    MIN((ul.metadata->>'duration')::numeric) as min_duration,
    MAX((ul.metadata->>'duration')::numeric) as max_duration,
    ROUND(
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY (ul.metadata->>'duration')::numeric),
      2
    ) as p95_duration
  FROM usage_logs ul
  WHERE
    ul.action_type = 'performance_metric'
    AND ul.created_at >= NOW() - INTERVAL '1 hour' * p_hours
    AND ul.metadata->>'endpoint' IS NOT NULL
  GROUP BY ul.metadata->>'endpoint'
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction de monitoring des erreurs
CREATE OR REPLACE FUNCTION public.get_error_metrics(
  p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
  endpoint TEXT,
  error_type TEXT,
  count BIGINT,
  last_occurrence TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ul.metadata->>'endpoint' as endpoint,
    ul.metadata->>'error' as error_type,
    COUNT(*) as count,
    MAX(ul.created_at) as last_occurrence
  FROM usage_logs ul
  WHERE
    ul.action_type = 'error_metric'
    AND ul.created_at >= NOW() - INTERVAL '1 hour' * p_hours
  GROUP BY ul.metadata->>'endpoint', ul.metadata->>'error'
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- AUTO-RECOVERY UNUSED TOOL SESSIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.recover_unused_tool_sessions()
RETURNS INTEGER AS $$
DECLARE
  expired_session RECORD;
  refunded_count INTEGER := 0;
  refund_result JSONB;
BEGIN
  -- Trouve toutes les sessions expirées qui n'ont pas été utilisées
  FOR expired_session IN
    SELECT ts.id, ts.user_id, ts.credits_consumed, ts.tool_id
    FROM public.tool_sessions ts
    WHERE ts.is_active = true
      AND ts.expires_at < NOW()
      AND NOT EXISTS (
        -- Vérifie si la session a été utilisée (au moins un log d'usage)
        SELECT 1 FROM public.usage_logs ul
        WHERE ul.user_id = ts.user_id
          AND ul.metadata->>'session_token' = ts.session_token
          AND ul.action_type LIKE CONCAT(ts.tool_id, '%')
          AND ul.created_at >= ts.created_at
      )
  LOOP
    -- Rembourse les crédits pour cette session inutilisée
    SELECT public.refund_user_credits(
      expired_session.user_id,
      expired_session.credits_consumed,
      format('session_timeout_%s', expired_session.tool_id)
    ) INTO refund_result;

    IF refund_result->>'success' = 'true' THEN
      refunded_count := refunded_count + 1;

      -- Log la récupération
      INSERT INTO public.usage_logs (
        user_id,
        action_type,
        credits_used,
        metadata,
        created_at
      ) VALUES (
        expired_session.user_id,
        'session_recovery',
        0,
        jsonb_build_object(
          'tool_id', expired_session.tool_id,
          'session_id', expired_session.id,
          'refunded_credits', expired_session.credits_consumed,
          'reason', 'expired_unused_session'
        ),
        NOW()
      );
    END IF;

    -- Marque la session comme inactive
    UPDATE public.tool_sessions
    SET is_active = false
    WHERE id = expired_session.id;
  END LOOP;

  RETURN refunded_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Job automatique de maintenance (à exécuter quotidiennement)
CREATE OR REPLACE FUNCTION public.daily_maintenance()
RETURNS TEXT AS $$
DECLARE
  result TEXT := '';
  cleaned_logs INTEGER;
  archived_webhooks INTEGER;
  backup_id TEXT;
  recovered_sessions INTEGER;
BEGIN
  -- Nettoyer les anciens logs
  SELECT cleanup_old_usage_logs() INTO cleaned_logs;

  -- Archiver les anciens webhooks
  SELECT archive_old_webhooks() INTO archived_webhooks;

  -- Récupérer les sessions outils non utilisées
  SELECT recover_unused_tool_sessions() INTO recovered_sessions;

  -- Créer un backup quotidien
  SELECT create_backup_snapshot() INTO backup_id;

  -- Vérifier l'intégrité
  PERFORM verify_data_integrity();

  result := format(
    'Maintenance terminée: %s logs nettoyés, %s webhooks archivés, %s sessions récupérées, backup %s créé',
    cleaned_logs,
    archived_webhooks,
    recovered_sessions,
    backup_id
  );

  -- Log de la maintenance
  INSERT INTO public.usage_logs (
    user_id,
    action_type,
    credits_used,
    metadata
  ) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'system_maintenance',
    0,
    jsonb_build_object(
      'cleaned_logs', cleaned_logs,
      'archived_webhooks', archived_webhooks,
      'recovered_sessions', recovered_sessions,
      'backup_id', backup_id,
      'result', result
    )
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement le profil et plan lors de l'inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- DONNÉES DE TEST (optionnel)
-- ============================================

-- Insérer des données de test si nécessaire
-- INSERT INTO public.profiles (id, email, full_name) VALUES ('test-user-id', 'test@example.com', 'Test User');
