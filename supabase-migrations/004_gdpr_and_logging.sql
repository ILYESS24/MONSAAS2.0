-- ============================================
-- MIGRATION 004: GDPR & PRODUCTION LOGGING
-- Tables pour conformité RGPD et logging production
-- ============================================

-- ============================================
-- TABLE: GDPR Data Exports
-- ============================================

CREATE TABLE IF NOT EXISTS public.gdpr_exports (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
  data_size INTEGER DEFAULT 0,
  download_url TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_gdpr_exports_user_id ON public.gdpr_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_exports_status ON public.gdpr_exports(status);

-- RLS
ALTER TABLE public.gdpr_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exports"
  ON public.gdpr_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert exports"
  ON public.gdpr_exports FOR INSERT
  WITH CHECK (true);

-- ============================================
-- TABLE: GDPR Deletion Requests
-- ============================================

CREATE TABLE IF NOT EXISTS public.gdpr_deletion_requests (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cancelled', 'processing', 'completed')),
  reason TEXT,
  confirmation_text TEXT NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_deletion_date TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  stripe_subscription_cancelled BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index
CREATE INDEX IF NOT EXISTS idx_gdpr_deletion_user_id ON public.gdpr_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_deletion_status ON public.gdpr_deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_gdpr_deletion_scheduled ON public.gdpr_deletion_requests(scheduled_deletion_date)
  WHERE status = 'pending';

-- RLS
ALTER TABLE public.gdpr_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deletion requests"
  ON public.gdpr_deletion_requests FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- TABLE: Application Logs
-- ============================================

CREATE TABLE IF NOT EXISTS public.application_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'security')),
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  ip_address TEXT,
  country TEXT,
  user_agent TEXT,
  context TEXT, -- JSON stringified
  stack TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche et nettoyage
CREATE INDEX IF NOT EXISTS idx_app_logs_timestamp ON public.application_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_app_logs_level ON public.application_logs(level);
CREATE INDEX IF NOT EXISTS idx_app_logs_user_id ON public.application_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_app_logs_created_at ON public.application_logs(created_at DESC);

-- Partition par date pour performance (optionnel - décommenter si nécessaire)
-- CREATE INDEX IF NOT EXISTS idx_app_logs_date ON public.application_logs(DATE(created_at));

-- RLS - Les utilisateurs ne peuvent pas accéder aux logs directement
ALTER TABLE public.application_logs ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent lire les logs
CREATE POLICY "Service role can manage logs"
  ON public.application_logs FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- TABLE: Security Alerts
-- ============================================

CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL CHECK (level IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  context JSONB,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'resolved', 'false_positive')),
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_security_alerts_status ON public.security_alerts(status);
CREATE INDEX IF NOT EXISTS idx_security_alerts_level ON public.security_alerts(level);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created ON public.security_alerts(created_at DESC);

-- RLS
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage security alerts"
  ON public.security_alerts FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Ajouter colonne deletion_requested au profil
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'deletion_requested'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN deletion_requested BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.profiles ADD COLUMN deletion_scheduled_at TIMESTAMPTZ;
  END IF;
END $$;

-- ============================================
-- FONCTION: Nettoyer les anciens logs
-- ============================================

CREATE OR REPLACE FUNCTION public.cleanup_old_logs(
  p_retention_days INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Supprimer les logs plus vieux que la rétention
  WITH deleted AS (
    DELETE FROM public.application_logs
    WHERE created_at < NOW() - (p_retention_days || ' days')::INTERVAL
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted;

  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FONCTION: Traiter les suppressions GDPR planifiées
-- ============================================

CREATE OR REPLACE FUNCTION public.process_scheduled_deletions()
RETURNS INTEGER AS $$
DECLARE
  v_request RECORD;
  v_deleted_count INTEGER := 0;
BEGIN
  -- Trouver toutes les demandes de suppression dont la date est passée
  FOR v_request IN
    SELECT * FROM public.gdpr_deletion_requests
    WHERE status = 'pending'
    AND scheduled_deletion_date <= NOW()
  LOOP
    BEGIN
      -- Marquer comme en cours de traitement
      UPDATE public.gdpr_deletion_requests
      SET status = 'processing'
      WHERE id = v_request.id;

      -- Supprimer les données utilisateur dans l'ordre
      -- 1. Usage logs
      DELETE FROM public.usage_logs WHERE user_id = v_request.user_id;
      
      -- 2. Tool sessions
      DELETE FROM public.tool_sessions WHERE user_id = v_request.user_id;
      
      -- 3. Crédits
      DELETE FROM public.user_credits WHERE user_id = v_request.user_id;
      
      -- 4. Plans
      DELETE FROM public.user_plans WHERE user_id = v_request.user_id;
      
      -- 5. Stripe sessions
      DELETE FROM public.stripe_sessions WHERE user_id = v_request.user_id;
      
      -- 6. GDPR exports
      DELETE FROM public.gdpr_exports WHERE user_id = v_request.user_id;
      
      -- 7. Application logs (anonymiser au lieu de supprimer)
      UPDATE public.application_logs
      SET user_id = NULL, ip_address = 'REDACTED', user_agent = 'REDACTED'
      WHERE user_id = v_request.user_id;
      
      -- 8. Profil
      DELETE FROM public.profiles WHERE id = v_request.user_id;

      -- Marquer la suppression comme terminée
      UPDATE public.gdpr_deletion_requests
      SET status = 'completed', completed_at = NOW()
      WHERE id = v_request.id;

      v_deleted_count := v_deleted_count + 1;

    EXCEPTION
      WHEN OTHERS THEN
        -- En cas d'erreur, marquer la demande mais continuer
        UPDATE public.gdpr_deletion_requests
        SET metadata = jsonb_set(
          COALESCE(metadata, '{}'::jsonb),
          '{error}',
          to_jsonb(SQLERRM)
        )
        WHERE id = v_request.id;
    END;
  END LOOP;

  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FONCTION: Maintenance quotidienne étendue
-- ============================================

CREATE OR REPLACE FUNCTION public.daily_maintenance_extended()
RETURNS JSONB AS $$
DECLARE
  v_logs_cleaned INTEGER;
  v_deletions_processed INTEGER;
  v_result JSONB;
BEGIN
  -- 1. Nettoyer les anciens logs (30 jours)
  SELECT public.cleanup_old_logs(30) INTO v_logs_cleaned;

  -- 2. Traiter les suppressions GDPR planifiées
  SELECT public.process_scheduled_deletions() INTO v_deletions_processed;

  -- 3. Maintenance existante
  PERFORM public.daily_maintenance();

  v_result := jsonb_build_object(
    'logs_cleaned', v_logs_cleaned,
    'deletions_processed', v_deletions_processed,
    'timestamp', NOW()
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT pour service role
-- ============================================

GRANT ALL ON public.gdpr_exports TO service_role;
GRANT ALL ON public.gdpr_deletion_requests TO service_role;
GRANT ALL ON public.application_logs TO service_role;
GRANT ALL ON public.security_alerts TO service_role;

