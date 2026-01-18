# 🧪 AURION SaaS - Tests de Validation Complets

Ce document contient tous les tests à effectuer avant mise en production et pour valider que le système de crédits fonctionne correctement.

---

## 🎯 Tests Critiques (OBLIGATOIRES)

Ces tests doivent TOUS passer avant déploiement en production.

---

### ✅ Test 1: Auto-Initialisation des 100 Tokens

**Objectif**: Vérifier qu'un nouveau compte reçoit automatiquement 100 tokens

**Prérequis**: Base de données avec schéma déployé

**Étapes**:
```bash
1. Créer un nouveau compte via Clerk:
   - Email: test-tokens@example.com
   - Password: TestPassword123!

2. Attendre 3 secondes (trigger asynchrone)

3. Vérifier dans Supabase SQL Editor:

SELECT 
  p.email,
  c.total_credits,
  c.used_credits,
  c.bonus_credits,
  pl.plan_type,
  pl.status
FROM profiles p
LEFT JOIN user_credits c ON p.id = c.user_id
LEFT JOIN user_plans pl ON p.id = pl.user_id
WHERE p.email = 'test-tokens@example.com';
```

**Résultat Attendu**:
```
email                      | total_credits | used_credits | bonus_credits | plan_type | status
---------------------------|---------------|--------------|---------------|-----------|--------
test-tokens@example.com    | 100           | 0            | 0             | free      | active
```

**✅ PASS**: Exactement 100 crédits, 0 utilisés, plan free, status active  
**❌ FAIL**: Si crédits ≠ 100 ou profil inexistant → Vérifier trigger `handle_new_user()`

---

### ✅ Test 2: Consommation Dynamique des Crédits

**Objectif**: Vérifier que l'utilisation d'un outil consomme réellement des crédits

**Prérequis**: Compte avec 100 crédits

**Étapes**:
```bash
1. Se connecter avec le compte test

2. Vérifier crédits initiaux:
SELECT total_credits, used_credits 
FROM user_credits 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'test-tokens@example.com');
-- Devrait afficher: 100, 0

3. Lancer un outil coûtant 50 crédits (ex: app-builder)
   - Aller sur /tools/app-builder
   - Cliquer "Launch Tool"
   - Attendre chargement iframe

4. Vérifier crédits après utilisation:
SELECT total_credits, used_credits, (total_credits - used_credits) as remaining
FROM user_credits 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'test-tokens@example.com');
```

**Résultat Attendu**:
```
total_credits | used_credits | remaining
--------------|--------------|----------
100           | 50           | 50
```

**Vérification du Log**:
```sql
SELECT 
  action_type,
  credits_used,
  metadata,
  created_at
FROM usage_logs 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'test-tokens@example.com')
ORDER BY created_at DESC LIMIT 1;
```

**Résultat Attendu**:
```
action_type           | credits_used | metadata
----------------------|--------------|------------------------------------------
launch_tool_app-builder| 50           | {"tool_id": "app-builder", "action": "launch"}
```

**✅ PASS**: used_credits = 50, remaining = 50, log présent  
**❌ FAIL**: Si crédits non décomptés → Vérifier RPC `consume_user_credits()`

---

### ✅ Test 3: Blocage Total à Zéro Crédit

**Objectif**: Vérifier qu'un utilisateur sans crédit ne peut PAS utiliser les outils

**Prérequis**: Compte avec crédits épuisés

**Étapes**:
```bash
1. Épuiser les crédits artificiellement:

UPDATE user_credits 
SET used_credits = total_credits 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'test-tokens@example.com');

2. Vérifier état:
SELECT total_credits, used_credits, (total_credits - used_credits) as remaining
FROM user_credits 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'test-tokens@example.com');
-- Devrait afficher: 100, 100, 0

3. Tenter de lancer un outil depuis l'UI
```

**Résultat Attendu**:

**Frontend**:
- ✅ Modal "Credits Exhausted" s'affiche
- ✅ Message: "You have used all your free credits!"
- ✅ Bouton "View Plans & Upgrade" redirige vers /pricing
- ✅ Impossible de fermer le modal avec ESC
- ✅ Iframe ne se charge PAS

**Backend (vérifier dans Network DevTools)**:
```json
// Réponse de POST /api/validate-tool-access
{
  "error": "Insufficient credits",
  "code": "INSUFFICIENT_CREDITS",
  "message": "You do not have enough credits to use this tool",
  "required": 50,
  "available": 0,
  "upgrade_url": "/pricing"
}

// Status HTTP: 403 Forbidden
```

**✅ PASS**: Aucun moyen de lancer l'outil, modal bloquante, erreur 403  
**❌ FAIL**: Si outil se lance quand même → FAILLE CRITIQUE - Vérifier validate-tool-access.ts

---

### ✅ Test 4: Paiement Stripe → Déblocage Immédiat

**Objectif**: Vérifier que le paiement crédite les tokens et débloque l'accès

**Prérequis**: 
- Stripe configuré en mode test
- Webhook actif

**Étapes**:
```bash
1. Restaurer crédits à 0 pour le test:

UPDATE user_credits 
SET total_credits = 100, used_credits = 100 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'test-tokens@example.com');

2. Depuis l'UI, aller sur /pricing

3. Sélectionner le plan "Starter" ($9/mois)

4. Compléter le paiement avec carte test Stripe:
   - Numéro: 4242 4242 4242 4242
   - Date: 12/34
   - CVC: 123
   - ZIP: 12345

5. IMMÉDIATEMENT après paiement réussi (sans refresh), vérifier:

SELECT 
  c.total_credits,
  c.used_credits,
  (c.total_credits - c.used_credits) as remaining,
  pl.plan_type,
  pl.status,
  pl.stripe_subscription_id
FROM user_credits c
JOIN user_plans pl ON c.user_id = pl.user_id
WHERE c.user_id = (SELECT id FROM profiles WHERE email = 'test-tokens@example.com');
```

**Résultat Attendu**:
```
total_credits | used_credits | remaining | plan_type | status | stripe_subscription_id
--------------|--------------|-----------|-----------|--------|----------------------
1000          | 0            | 1000      | starter   | active | sub_xxxxx
```

**Vérification des Logs**:
```sql
SELECT 
  action_type,
  credits_used,
  metadata->>'credits_granted' as credits_granted,
  metadata->>'plan_type' as plan,
  created_at
FROM usage_logs 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'test-tokens@example.com')
AND action_type = 'plan_upgraded'
ORDER BY created_at DESC LIMIT 1;
```

**Résultat Attendu**:
```
action_type    | credits_used | credits_granted | plan    | created_at
---------------|--------------|-----------------|---------|-------------------
plan_upgraded  | 0            | 1000            | starter | 2024-12-26 15:30:00
```

**Test d'Accès Outil**:
```bash
6. Sans recharger la page, tenter de lancer un outil
7. Vérifier que l'outil se lance IMMÉDIATEMENT
8. Vérifier que les crédits sont décomptés normalement
```

**✅ PASS**: Crédits = 1000, plan = starter, outil accessible immédiatement  
**❌ FAIL**: Si crédits non crédités → Vérifier webhook Stripe + mapping Product IDs

---

### ✅ Test 5: Dashboard Temps Réel

**Objectif**: Vérifier que le dashboard affiche les données en temps réel

**Prérequis**: Compte avec crédits

**Étapes**:
```bash
1. Ouvrir le dashboard dans un navigateur
2. Noter le nombre de crédits affichés (ex: 1000)
3. Dans un autre onglet, lancer un outil
4. Revenir au dashboard SANS recharger
5. Attendre 5 secondes (polling interval)
```

**Résultat Attendu**:
- ✅ Les crédits diminuent automatiquement (ex: 1000 → 950)
- ✅ Le graphique d'utilisation se met à jour
- ✅ Les logs récents affichent la nouvelle action

**Si Temps Réel Non Implémenté**:
- ⚠️ Rafraîchir manuellement (F5) doit afficher les nouvelles valeurs

**✅ PASS**: Dashboard met à jour les données sans refresh manuel  
**❌ FAIL**: Si données obsolètes → Implémenter polling ou WebSocket

---

## 🔒 Tests de Sécurité

### 🛡️ Test 6: Protection Contre Race Conditions

**Objectif**: Vérifier qu'on ne peut pas débiter 2x en parallèle

**Étapes**:
```bash
# Utiliser un script pour lancer 2 requêtes simultanées

# script.sh
for i in {1..2}; do
  curl -X POST https://votre-domaine.com/api/validate-tool-access \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"toolId":"app-builder"}' &
done
wait

# Vérifier dans Supabase
SELECT used_credits FROM user_credits WHERE user_id = 'xxx';
```

**Résultat Attendu**:
- Une requête retourne 200 OK
- L'autre retourne 403 Insufficient Credits
- used_credits augmente de 50 (1 seule fois)

**✅ PASS**: Transaction atomique fonctionne  
**❌ FAIL**: Si both requests succeed → Problème dans consume_user_credits()

---

### 🛡️ Test 7: Manipulation Frontend (DevTools)

**Objectif**: Vérifier qu'on ne peut pas tricher via DevTools

**Étapes**:
```bash
1. Ouvrir DevTools (F12)
2. Console → localStorage / sessionStorage
3. Tenter de modifier:
   - localStorage.setItem('credits', '9999')
   - sessionStorage.setItem('userPlan', 'pro')

4. Lancer un outil
```

**Résultat Attendu**:
- ✅ Les valeurs client sont IGNORÉES
- ✅ Le serveur vérifie TOUJOURS les crédits en DB
- ✅ Pas de bypass possible

**✅ PASS**: Serveur ne fait confiance qu'à la DB  
**❌ FAIL**: Si modifications client fonctionnent → FAILLE CRITIQUE

---

### 🛡️ Test 8: Appels API Directs

**Objectif**: Vérifier qu'on ne peut pas appeler les endpoints sans auth

**Étapes**:
```bash
# Tester sans token
curl -X POST https://votre-domaine.com/api/validate-tool-access \
  -H "Content-Type: application/json" \
  -d '{"toolId":"app-builder"}'
```

**Résultat Attendu**:
```json
{
  "error": "Authentication required",
  "code": "AUTHENTICATION_FAILED"
}
// Status: 401 Unauthorized
```

**✅ PASS**: Requête non authentifiée rejetée  
**❌ FAIL**: Si 200 OK → Middleware auth.ts non appliqué

---

## 📊 Tests de Performance

### ⚡ Test 9: Latence API

**Objectif**: Vérifier que les endpoints répondent rapidement

**Étapes**:
```bash
# Utiliser curl avec temps de réponse
curl -X POST https://votre-domaine.com/api/validate-tool-access \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"toolId":"app-builder"}' \
  -w "\nTime: %{time_total}s\n"
```

**Résultat Attendu**:
- ✅ < 200ms pour validate-tool-access
- ✅ < 500ms pour generate-image
- ✅ < 100ms pour get user credits

**✅ PASS**: Latences acceptables  
**❌ FAIL**: Si > 1s → Vérifier indexes DB, optimiser requêtes

---

### ⚡ Test 10: Charge Concurrente

**Objectif**: Vérifier que le système tient la charge

**Étapes**:
```bash
# Utiliser Apache Bench ou wrk
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
  https://votre-domaine.com/api/validate-tool-access

# 100 requêtes, 10 concurrentes
```

**Résultat Attendu**:
- ✅ 95% des requêtes < 500ms
- ✅ 0% d'erreurs 500
- ✅ Rate limiting déclenché (429) pour excès

**✅ PASS**: Système stable sous charge  
**❌ FAIL**: Si timeouts ou 500 errors → Scaling Cloudflare/Supabase

---

## 🔧 Tests de Régression

### 🔄 Test 11: Reset Mensuel des Crédits

**Objectif**: Vérifier que les crédits se réinitialisent chaque mois

**Étapes**:
```bash
1. Simuler une période expirée:

UPDATE user_plans
SET current_period_end = NOW() - INTERVAL '1 day'
WHERE user_id = (SELECT id FROM profiles WHERE email = 'test-tokens@example.com');

2. Exécuter la fonction de reset:

SELECT reset_monthly_credits();

3. Vérifier:

SELECT 
  c.total_credits,
  c.used_credits,
  c.last_reset_date,
  pl.current_period_start,
  pl.current_period_end
FROM user_credits c
JOIN user_plans pl ON c.user_id = pl.user_id
WHERE c.user_id = (SELECT id FROM profiles WHERE email = 'test-tokens@example.com');
```

**Résultat Attendu**:
```
total_credits | used_credits | last_reset_date      | current_period_start | current_period_end
--------------|--------------|----------------------|----------------------|--------------------
1000          | 0            | 2024-12-26 16:00:00  | 2024-12-26 16:00:00  | 2025-01-26 16:00:00
```

**✅ PASS**: Crédits reset, période avancée de 30 jours  
**❌ FAIL**: Si used_credits ≠ 0 → Vérifier fonction reset_monthly_credits()

---

### 🔄 Test 12: Downgrade de Plan

**Objectif**: Vérifier qu'un downgrade ajuste correctement les crédits

**Étapes**:
```bash
1. Utilisateur avec plan Pro (25000 crédits)
2. Downgrade vers Starter (1000 crédits)
3. Vérifier que total_credits = 1000 (pas 25000)
```

**SQL de Test**:
```sql
-- Simuler downgrade
UPDATE user_plans
SET plan_type = 'starter', credits_monthly = 1000
WHERE user_id = 'xxx';

UPDATE user_credits
SET total_credits = 1000, used_credits = 0
WHERE user_id = 'xxx';
```

**✅ PASS**: Crédits ajustés au nouveau plan  
**❌ FAIL**: Si crédits anciens conservés → Webhook Stripe mal géré

---

## 📝 Tests d'Intégration E2E

### 🎬 Test 13: Parcours Complet Utilisateur

**Scénario**: De l'inscription au paiement

```bash
ÉTAPE 1: Inscription
1. Aller sur /signup
2. Créer compte: e2e-test@example.com
3. ✅ Redirection vers dashboard
4. ✅ Crédits affichés: 100

ÉTAPE 2: Utilisation Gratuite
5. Lancer 2 outils différents
6. ✅ Crédits: 100 → 50 → 0
7. ✅ Modal "Credits Exhausted" apparaît

ÉTAPE 3: Tentative d'Usage
8. Essayer de lancer un 3e outil
9. ✅ Bloqué avec message explicite

ÉTAPE 4: Upgrade
10. Cliquer "View Plans" → /pricing
11. Sélectionner "Starter" ($9/mois)
12. Payer avec 4242 4242 4242 4242
13. ✅ Redirection vers dashboard
14. ✅ Crédits affichés: 1000

ÉTAPE 5: Utilisation Payante
15. Lancer des outils normalement
16. ✅ Crédits décomptés dynamiquement
17. ✅ Dashboard mis à jour

ÉTAPE 6: Annulation
18. Aller sur Stripe Customer Portal
19. Annuler l'abonnement
20. ✅ Crédits conservés jusqu'à fin de période
21. ✅ Après période: retour à plan free (100 crédits)
```

**Durée**: ~10 minutes  
**✅ PASS**: Tout le parcours fluide sans erreur  
**❌ FAIL**: Si blocage à une étape → Noter étape exacte

---

## 🚨 Checklist Pré-Production

Avant de déployer en production, vérifier que:

- [ ] ✅ Test 1: Auto-initialisation 100 tokens → PASS
- [ ] ✅ Test 2: Consommation dynamique → PASS
- [ ] ✅ Test 3: Blocage à zéro crédit → PASS
- [ ] ✅ Test 4: Paiement Stripe → PASS
- [ ] ✅ Test 5: Dashboard temps réel → PASS
- [ ] ✅ Test 6: Protection race conditions → PASS
- [ ] ✅ Test 7: Manipulation frontend → PASS
- [ ] ✅ Test 8: Appels API directs → PASS
- [ ] ✅ Test 9: Latence API → PASS
- [ ] ✅ Test 10: Charge concurrente → PASS
- [ ] ✅ Test 11: Reset mensuel → PASS
- [ ] ✅ Test 12: Downgrade plan → PASS
- [ ] ✅ Test 13: Parcours E2E complet → PASS

---

## 📞 Reporting de Bugs

Si un test échoue, créer une issue GitHub avec:

```markdown
## Bug: [Titre du Test Échoué]

**Test**: Test X - [Nom]
**Statut**: ❌ FAIL

### Comportement Attendu
[Décrire résultat attendu]

### Comportement Observé
[Décrire ce qui se passe vraiment]

### Logs/Screenshots
```
[Coller logs Supabase, Network DevTools, etc.]
```

### Environnement
- URL: [staging/production]
- Navigateur: [Chrome/Firefox/Safari]
- User ID: [UUID du compte test]

### Étapes pour Reproduire
1. ...
2. ...
3. ...
```

---

**Dernière mise à jour**: 2024-12-26  
**Version Tests**: 1.0.0
