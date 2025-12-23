-- ============================================
-- MIGRATION: AMÉLIORATION DES SESSIONS D'OUTILS
-- ============================================
-- 
-- Cette migration ajoute :
-- ✅ Colonne last_activity pour le suivi d'activité
-- ✅ Fonction de réutilisation de session
-- ✅ Fonction de nettoyage améliorée
-- ============================================

-- Ajouter la colonne last_activity
ALTER TABLE public.tool_sessions 
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Index pour la recherche de sessions actives récentes
CREATE INDEX IF NOT EXISTS idx_tool_sessions_last_activity 
ON public.tool_sessions(user_id, tool_id, is_active, created_at DESC)
WHERE is_active = true;

-- ============================================
-- FONCTION: Récupérer une session existante
-- ============================================

CREATE OR REPLACE FUNCTION get_reusable_session(
  p_user_id UUID,
  p_tool_id TEXT,
  p_max_age_hours INTEGER DEFAULT 2
)
RETURNS TABLE (
  id UUID,
  session_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  credits_consumed INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ts.id,
    ts.session_token,
    ts.expires_at,
    ts.credits_consumed,
    ts.created_at
  FROM public.tool_sessions ts
  WHERE ts.user_id = p_user_id
    AND ts.tool_id = p_tool_id
    AND ts.is_active = true
    AND ts.expires_at > NOW()
    AND ts.created_at > NOW() - (p_max_age_hours || ' hours')::INTERVAL
  ORDER BY ts.created_at DESC
  LIMIT 1;
END;
$$;

-- ============================================
-- FONCTION: Mettre à jour l'activité de session
-- ============================================

CREATE OR REPLACE FUNCTION update_session_activity(
  p_session_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.tool_sessions
  SET last_activity = NOW()
  WHERE id = p_session_id
    AND is_active = true
    AND expires_at > NOW();
    
  RETURN FOUND;
END;
$$;

-- ============================================
-- FONCTION: Nettoyage des sessions expirées
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS TABLE (
  cleaned_count INTEGER,
  credits_recovered INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cleaned INTEGER := 0;
  v_recovered INTEGER := 0;
  v_session RECORD;
BEGIN
  -- Trouver les sessions expirées mais encore actives
  FOR v_session IN
    SELECT ts.id, ts.user_id, ts.credits_consumed, ts.tool_id
    FROM public.tool_sessions ts
    WHERE ts.is_active = true
      AND ts.expires_at < NOW()
  LOOP
    -- Vérifier si la session a été utilisée
    IF NOT EXISTS (
      SELECT 1 FROM public.usage_logs ul
      WHERE ul.metadata->>'session_id' = v_session.id::TEXT
    ) THEN
      -- Session non utilisée - rembourser les crédits
      UPDATE public.user_credits
      SET used_credits = GREATEST(0, used_credits - v_session.credits_consumed),
          updated_at = NOW()
      WHERE user_id = v_session.user_id;
      
      v_recovered := v_recovered + v_session.credits_consumed;
      
      -- Logger le remboursement
      INSERT INTO public.usage_logs (user_id, action_type, credits_used, metadata)
      VALUES (
        v_session.user_id,
        'session_cleanup_refund',
        -v_session.credits_consumed,
        jsonb_build_object(
          'session_id', v_session.id,
          'tool_id', v_session.tool_id,
          'reason', 'session_expired_unused'
        )
      );
    END IF;
    
    -- Désactiver la session
    UPDATE public.tool_sessions
    SET is_active = false
    WHERE id = v_session.id;
    
    v_cleaned := v_cleaned + 1;
  END LOOP;
  
  cleaned_count := v_cleaned;
  credits_recovered := v_recovered;
  RETURN NEXT;
END;
$$;

-- ============================================
-- FONCTION: Invalider les sessions dupliquées
-- ============================================

CREATE OR REPLACE FUNCTION invalidate_duplicate_sessions(
  p_user_id UUID,
  p_tool_id TEXT,
  p_keep_session_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.tool_sessions
  SET is_active = false
  WHERE user_id = p_user_id
    AND tool_id = p_tool_id
    AND id != p_keep_session_id
    AND is_active = true;
    
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- ============================================
-- POLITIQUE RLS POUR TOOL_SESSIONS
-- ============================================

-- S'assurer que RLS est activé
ALTER TABLE public.tool_sessions ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs ne voient que leurs propres sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON public.tool_sessions;
CREATE POLICY "Users can view own sessions" ON public.tool_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Politique pour la création (via service role uniquement)
DROP POLICY IF EXISTS "Service role can manage sessions" ON public.tool_sessions;
CREATE POLICY "Service role can manage sessions" ON public.tool_sessions
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- TRIGGER: Mise à jour automatique de updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_tool_session_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.last_activity = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tool_sessions_update_trigger ON public.tool_sessions;
CREATE TRIGGER tool_sessions_update_trigger
  BEFORE UPDATE ON public.tool_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_tool_session_timestamp();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION get_reusable_session TO authenticated;
GRANT EXECUTE ON FUNCTION get_reusable_session TO service_role;
GRANT EXECUTE ON FUNCTION update_session_activity TO authenticated;
GRANT EXECUTE ON FUNCTION update_session_activity TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_expired_sessions TO service_role;
GRANT EXECUTE ON FUNCTION invalidate_duplicate_sessions TO service_role;

