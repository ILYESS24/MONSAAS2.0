# 🔒 GUIDE SÉCURITÉ DÉVELOPPEUR - AURION SaaS

## Vue d'ensemble

Ce guide détaille l'architecture de sécurité renforcée d'AURION SaaS après l'audit et les corrections appliquées. L'application utilise maintenant un modèle **backend-first** avec validation serveur exclusive.

## 🏗️ Architecture Sécurité

### Modèle Backend-First

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes    │    │   Database      │
│   (React)       │◄──►│   (Cloudflare)  │◄──►│   (Supabase)    │
│                 │    │                 │    │                 │
│ • Affichage     │    │ • Validation    │    │ • Stockage      │
│ • UX            │    │ • Business      │    │ • Contraintes   │
│ • Feedback      │    │ • Sécurité      │    │ • Audit         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Règle absolue:** Le frontend n'a jamais le dernier mot sur la sécurité.

### Principes Clés

1. **Validation Serveur Exclusive**
   - Toutes les décisions de sécurité côté serveur
   - Frontend = interface uniquement

2. **Audit Trail Complet**
   - Chaque action tracée en base
   - Logs immuables et horodatés

3. **Défense en Profondeur**
   - Multiple couches de validation
   - Échec sécurisé par défaut

---

## 🔧 API Endpoints Sécurisés

### `/api/validate-tool-access` (POST)

**Endpoint critique** pour l'accès aux outils avec iframe.

#### Requête
```typescript
POST /api/validate-tool-access
Authorization: Bearer <clerk_jwt>
Content-Type: application/json

{
  "toolId": "image_generation",
  "reuseSession": true
}
```

#### Validation Serveur (obligatoire)
1. **Authentification Clerk** ✅ JWT validé
2. **Origine requête** ✅ Referer + Origin vérifiés
3. **Plan actif** ✅ Vérifié en base
4. **Permissions outil** ✅ Configuration plan respectée
5. **Limites journalières** ✅ Comptage atomique PostgreSQL
6. **Limites mensuelles** ✅ Comptage atomique PostgreSQL
7. **Crédits disponibles** ✅ Vérification atomique
8. **Consommation atomique** ✅ Transaction PostgreSQL

#### Réponse Succès
```typescript
{
  "success": true,
  "sessionId": "uuid",
  "toolId": "image_generation",
  "cost": 0, // 0 si session réutilisée
  "creditsConsumed": 10,
  "expiresAt": "2025-01-20T10:00:00Z",
  "iframeUrl": "https://tool.com?tool_id=image_generation&session_id=uuid",
  "sessionToken": "secure_token",
  "isReusedSession": false
}
```

#### Réponses Erreur
```typescript
// 402 - Crédits insuffisants
{
  "error": "Insufficient credits. 10 credits required, 5 available.",
  "reason": "insufficient_credits",
  "required": 10,
  "available": 5
}

// 403 - Plan non autorisé
{
  "error": "Tool not available in your plan",
  "reason": "plan_upgrade_required",
  "suggestedPlan": "pro"
}

// 429 - Limite atteinte
{
  "error": "Daily limit reached (10/10)",
  "reason": "daily_limit_reached",
  "used": 10,
  "limit": 10
}
```

### Gestion Sessions Iframe

#### Cookie HttpOnly
```javascript
// Cookie créé côté serveur (non accessible JS)
Set-Cookie: genim_session_image_generation=secure_token;
  HttpOnly; Path=/; Max-Age=86400; SameSite=Strict;
  Secure; // Production uniquement
```

#### Communication Sécurisée
```typescript
// postMessage validé côté iframe
window.parent.postMessage({
  type: 'GENIM_CONSUME',
  requestId: 'req_123',
  tool: 'image_generation',
  payload: { metadata: {...} }
}, '*');

// Réponse validée
{
  type: 'GENIM_RESPONSE',
  requestId: 'req_123',
  payload: {
    success: true,
    creditsUsed: 10,
    remainingCredits: 90
  }
}
```

---

## 🗄️ Base de Données Sécurisée

### Fonctions PostgreSQL Critiques

#### `consume_user_credits()` - Consommation Atomique
```sql
CREATE OR REPLACE FUNCTION public.consume_user_credits(
  p_user_id UUID, p_cost INTEGER, p_action_type TEXT
) RETURNS JSONB AS $$
DECLARE
  v_credits RECORD;
BEGIN
  -- VERROUILLAGE: Empêche race conditions
  SELECT * INTO v_credits
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE; -- ← CLÉ ANTI-RACE CONDITION

  -- Vérifications
  IF v_credits.total_credits - v_credits.used_credits < p_cost THEN
    RETURN jsonb_build_object('success', false, 'error_message', 'Insufficient credits');
  END IF;

  -- Mise à jour atomique
  UPDATE public.user_credits
  SET used_credits = used_credits + p_cost, updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log d'audit
  INSERT INTO usage_logs (user_id, action_type, credits_used, metadata)
  VALUES (p_user_id, p_action_type, p_cost, jsonb_build_object('timestamp', NOW()));

  RETURN jsonb_build_object('success', true, 'credits_used', p_cost);
END $$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### `check_tool_limits()` - Validation Limites
```sql
CREATE OR REPLACE FUNCTION public.check_tool_limits(
  p_user_id UUID, p_tool_type TEXT, p_today TEXT, p_current_month TEXT,
  p_daily_limit INTEGER, p_monthly_limit INTEGER
) RETURNS JSONB AS $$
-- Comptage précis avec verrouillage pour éviter dépassement sous charge
SELECT COUNT(*) INTO v_daily_used FROM usage_logs WHERE [conditions];
-- Logique anti-race condition similaire
```

### Tables Critiques

#### `user_credits` - Crédits Utilisateur
```sql
CREATE TABLE user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  total_credits INTEGER NOT NULL DEFAULT 100,
  used_credits INTEGER NOT NULL DEFAULT 0,
  bonus_credits INTEGER NOT NULL DEFAULT 0,
  CHECK (total_credits >= 0),
  CHECK (used_credits >= 0)
);
```

#### `usage_logs` - Audit Trail
```sql
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Politiques RLS (Row Level Security)

```sql
-- Utilisateur ne voit que ses propres données
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

-- Service role uniquement pour écritures système
CREATE POLICY "Service role manages credits" ON user_credits
  FOR ALL USING (auth.role() = 'service_role');
```

---

## 🔍 Monitoring & Alertes

### Service de Monitoring Sécurité

```typescript
import { securityMonitor } from '@/services/security-monitor';

// Log événement sécurité
await securityMonitor.logSecurityEvent({
  type: 'access_denied',
  severity: 'medium',
  userId: user.id,
  details: { tool: 'image_generation', reason: 'insufficient_credits' }
});

// Détection anomalies
const { anomalies, riskLevel } = await securityMonitor.detectAnomalies(userId);
if (riskLevel === 'high') {
  // Alerte sécurité
}
```

### Métriques à Monitorer

#### Métriques Temps Réel
- **Requêtes/seconde** par endpoint
- **Taux d'échec** authentification
- **Consommation crédits** par minute
- **Temps réponse** API critiques

#### Métriques Sécurité
- **Tentatives accès refusé** par utilisateur
- **Anomalies détectées** (race conditions, etc.)
- **Erreurs validation** par endpoint
- **Utilisation par IP** suspecte

#### Alertes Critiques
```typescript
// Alerte immédiate pour événements critiques
if (event.severity === 'critical') {
  // Notification Slack/PagerDuty
  // Email équipe sécurité
  // Log détaillé
}
```

---

## 🧪 Tests Sécurité Obligatoires

### Test Race Conditions

```javascript
// test-concurrency-load.cjs
describe('Race Condition Protection', () => {
  test('Multiple users cannot exceed daily limits', async () => {
    // Simuler 10 utilisateurs faisant 50 requêtes chacun
    const results = await runConcurrencyTest();

    // Vérifier limites respectées
    expect(results.allLimitsRespected).toBe(true);
  });
});
```

### Test Contournement

```typescript
describe('Security Bypass Prevention', () => {
  test('Cannot modify localStorage to bypass limits', async () => {
    // Tenter modification localStorage
    localStorage.setItem('user_plan', JSON.stringify({
      planId: 'enterprise',
      creditsUsedThisPeriod: 0
    }));

    // Tenter accès outil
    const result = await accessControl.checkAccess('image_generation');

    // Doit échouer malgré localStorage modifié
    expect(result.allowed).toBe(false);
  });
});
```

### Test Validation Serveur

```typescript
describe('Server Validation', () => {
  test('API rejects invalid requests', async () => {
    // Requête sans authentification
    const response = await fetch('/api/validate-tool-access', {
      method: 'POST',
      body: JSON.stringify({ toolId: 'image_generation' })
    });

    expect(response.status).toBe(401);
  });

  test('API validates credit consumption', async () => {
    // Simuler utilisateur avec 0 crédits
    const response = await authenticatedFetch('/api/validate-tool-access', {
      toolId: 'image_generation'
    });

    expect(response.status).toBe(402);
  });
});
```

---

## 🚨 Gestion Incidents Sécurité

### Procédure Détection

1. **Alerte Monitoring** → Event severity: high/critical
2. **Investigation Immédiate** → Logs détaillés
3. **Containment** → Blocage utilisateur si nécessaire
4. **Analyse Root Cause** → Code review + logs
5. **Correctif** → Déploiement urgent
6. **Post-Mortem** → Documentation + prévention

### Types d'Incidents Courants

#### Race Condition Crédits
```sql
-- Symptôme: Crédits négatifs ou dépassement limites
SELECT user_id, total_credits, used_credits
FROM user_credits
WHERE used_credits > total_credits;
```

**Cause:** Code sans SELECT FOR UPDATE
**Solution:** Implémenter verrouillage PostgreSQL

#### Contournement Frontend
```javascript
// Symptôme: Accès autorisé malgré crédit=0
// Cause: Validation localStorage uniquement
// Solution: Migration validation serveur
```

#### DoS par Requests Excessives
```sql
-- Monitoring: Comptage par IP/heure
SELECT ip_address, COUNT(*) as requests_per_hour
FROM usage_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address
HAVING COUNT(*) > 1000;
```

---

## 📚 Bonnes Pratiques Développement

### Règles d'Or

1. **Jamais de logique métier côté client**
2. **Toujours valider côté serveur**
3. **Logs détaillés pour audit**
4. **Échec sécurisé par défaut**
5. **Tests sécurité automatisés**

### Patterns Sécurisés

#### Accès Outil - Pattern Correct
```typescript
// ❌ MAUVAIS: Validation frontend uniquement
const canAccess = checkLocalCredits();
if (canAccess) {
  openTool();
}

// ✅ BON: Validation serveur uniquement
const response = await fetch('/api/validate-tool-access', {
  method: 'POST',
  headers: { Authorization: `Bearer ${jwt}` },
  body: JSON.stringify({ toolId })
});

if (response.ok) {
  const { iframeUrl, sessionToken } = await response.json();
  openIframe(iframeUrl, sessionToken);
} else {
  showError(await response.json());
}
```

#### Gestion Erreurs - Pattern Correct
```typescript
// ✅ BON: Erreur = refus accès
try {
  const result = await serverValidation();
  if (!result.allowed) {
    // Toujours refuser, même si erreur technique
    return { allowed: false, reason: 'Access denied' };
  }
} catch (error) {
  // Erreur technique = refus pour sécurité
  logger.error('Validation error:', error);
  return { allowed: false, reason: 'Validation system error' };
}
```

---

## 🔧 Déploiement Production

### Prérequis

1. **Fonction PostgreSQL déployée**
   ```sql
   -- Exécuter supabase-deploy-security.sql
   \i supabase-deploy-security.sql
   ```

2. **Variables environnement sécurisées**
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-key  # Cloudflare seulement
   ```

3. **Monitoring configuré**
   ```typescript
   // Initialiser monitoring au démarrage
   import { securityMonitor } from '@/services/security-monitor';
   ```

### Checklist Déploiement

- [ ] Fonction `check_tool_limits` déployée
- [ ] RLS activé sur toutes les tables
- [ ] Service role configuré Cloudflare
- [ ] Monitoring sécurité actif
- [ ] Tests de charge réussis
- [ ] Alertes configurées
- [ ] Documentation équipe à jour

---

## 📞 Support & Maintenance

### Contacts Équipe
- **Sécurité:** security@aurion-saas.com
- **Infra:** infra@aurion-saas.com
- **Dev:** dev@aurion-saas.com

### Maintenance Régulière
- **Audit logs** hebdomadaire
- **Tests sécurité** quotidiens
- **Monitoring métriques** temps réel
- **Mises à jour sécurité** mensuelles

### Mises à Jour Critiques
Toute modification touchant :
- Logique crédits
- Validation accès
- Authentification
- Sécurité base de données

**Doit être validée par équipe sécurité avant déploiement.**

---

*Ce guide est évolutif. Toute modification doit être documentée et validée par l'équipe sécurité.*
