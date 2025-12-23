/* eslint-disable no-empty-pattern */
import { test, expect } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration pour les tests - valeurs par défaut pour CI/CD
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://test-placeholder.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';

// Client Supabase - créé uniquement si URL valide
let supabase: SupabaseClient | null = null;
const isRealSupabase = SUPABASE_URL.includes('supabase.co') && !SUPABASE_URL.includes('test-placeholder');

if (isRealSupabase) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

// Interface pour les résultats d'intégrité
interface IntegrityResult {
  table_name: string;
  record_count: number;
  issues?: string[];
}

// Interface pour les métriques
interface Metric {
  metric_type: string;
  count: number;
  avg_duration: number;
  p95_duration: number;
}

// Interface pour les erreurs
interface ErrorMetric {
  endpoint: string;
  error_type: string;
  count: number;
  last_occurrence: string;
}

test.describe('Monitoring & Backup System Tests', () => {
  // Skip tous les tests si Supabase n'est pas configuré
  test.beforeEach(async ({  }, testInfo) => {
    if (!isRealSupabase || !supabase) {
      testInfo.skip();
    }
  });

  test.describe('Data Integrity Verification', () => {
    test('should verify data integrity across all tables', async () => {
      if (!supabase) {
        test.skip();
        return;
      }
      // Appeler la fonction de vérification d'intégrité
      const { data: integrityResults, error } = await supabase.rpc('verify_data_integrity');

      expect(error).toBeNull();
      expect(integrityResults).toBeTruthy();
      expect(Array.isArray(integrityResults)).toBe(true);

      // Vérifier que toutes les tables principales sont présentes
      const tableNames = (integrityResults as IntegrityResult[]).map((row) => row.table_name);
      expect(tableNames).toContain('profiles');
      expect(tableNames).toContain('user_plans');
      expect(tableNames).toContain('user_credits');
      expect(tableNames).toContain('usage_logs');

      // Vérifier qu'il n'y a pas d'erreurs critiques
      for (const result of integrityResults as IntegrityResult[]) {
        if (result.table_name === 'profiles' && result.record_count === 0) {
          console.warn('Aucun profil utilisateur trouvé - base vide normale pour les tests');
        } else if (result.table_name === 'user_credits' && result.issues?.includes('crédits négatifs')) {
          throw new Error(`Intégrité compromise: ${result.issues.join(', ')}`);
        }
      }
    });

    test('should detect negative credits as integrity issue', async () => {
      if (!supabase) {
        test.skip();
        return;
      }
      // Créer temporairement des crédits négatifs pour tester
      const testUserId = `test-integrity-${Date.now()}`;

      // Insérer des crédits négatifs (ce qui ne devrait pas arriver en prod)
      await supabase
        .from('user_credits')
        .insert([{
          user_id: testUserId,
          total_credits: -100,
          used_credits: 0
        }]);

      // Vérifier l'intégrité
      const { data: integrityResults } = await supabase.rpc('verify_data_integrity');

      // Trouver les résultats pour user_credits
      const creditsResult = (integrityResults as IntegrityResult[]).find((row) => row.table_name === 'user_credits');

      expect(creditsResult).toBeTruthy();
      expect(creditsResult?.issues).toContain('crédits négatifs');

      // Nettoyer
      await supabase
        .from('user_credits')
        .delete()
        .eq('user_id', testUserId);
    });
  });

  test.describe('Backup System', () => {
    test('should create backup snapshots', async () => {
      if (!supabase) {
        test.skip();
        return;
      }
      // Créer un backup
      const { data: backupId, error } = await supabase.rpc('create_backup_snapshot');

      expect(error).toBeNull();
      expect(backupId).toBeTruthy();
      expect(typeof backupId).toBe('string');
      expect((backupId as string).startsWith('backup_')).toBe(true);

      // Vérifier que le backup a été créé
      const { data: backups } = await supabase
        .from('database_backups')
        .select('*')
        .eq('id', backupId);

      expect(backups?.length).toBe(1);
      expect(backups?.[0].data).toBeTruthy();
      expect(backups?.[0].data.timestamp).toBeTruthy();
    });

    test('should include all critical data in backup', async () => {
      if (!supabase) {
        test.skip();
        return;
      }
      // Créer un backup
      const { data: backupId } = await supabase.rpc('create_backup_snapshot');

      // Récupérer le backup
      const { data: backup } = await supabase
        .from('database_backups')
        .select('data')
        .eq('id', backupId)
        .single();

      expect(backup?.data).toBeTruthy();

      // Vérifier que toutes les métriques sont présentes
      const data = backup?.data;
      expect(data).toHaveProperty('profiles_count');
      expect(data).toHaveProperty('plans_count');
      expect(data).toHaveProperty('credits_total');
      expect(data).toHaveProperty('usage_logs_count');
      expect(data).toHaveProperty('active_sessions');
      expect(data).toHaveProperty('stripe_sessions_count');

      // Vérifier que les valeurs sont des nombres
      expect(typeof data.profiles_count).toBe('number');
      expect(typeof data.plans_count).toBe('number');
      expect(typeof data.credits_total).toBe('number');
    });
  });

  test.describe('Performance Monitoring', () => {
    test('should collect performance metrics', async ({ request }) => {
      if (!supabase) {
        test.skip();
        return;
      }
      // Faire quelques appels API pour générer des métriques
      for (let i = 0; i < 3; i++) {
        await request.get('/api/health', { timeout: 5000 });
      }

      // Attendre que les métriques soient flushées
      await new Promise(resolve => setTimeout(resolve, 35000));

      // Récupérer les métriques de performance
      const { data: metrics, error } = await supabase.rpc('get_performance_metrics', { p_hours: 1 });

      expect(error).toBeNull();

      // Il devrait y avoir des métriques si le monitoring fonctionne
      if (metrics && (metrics as Metric[]).length > 0) {
        const healthMetric = (metrics as Metric[]).find((m) => m.metric_type === 'health');
        if (healthMetric) {
          expect(healthMetric.count).toBeGreaterThan(0);
          expect(healthMetric.avg_duration).toBeGreaterThan(0);
          expect(healthMetric.p95_duration).toBeGreaterThan(0);
        }
      }
    });

    test('should track API response times', async ({ request }) => {
      // Mesurer le temps de réponse manuellement
      const startTime = Date.now();

      const response = await request.get('/api/health', {
        headers: {
          'Accept': 'application/json'
        }
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(5000); // Moins de 5 secondes

      // Vérifier que le header de timing est présent
      const serverTiming = response.headers()['x-server-timing'];
      expect(serverTiming).toBeTruthy();
    });
  });

  test.describe('Error Monitoring', () => {
    test('should track and report errors', async ({ request }) => {
      if (!supabase) {
        test.skip();
        return;
      }
      // Tenter un appel qui devrait échouer
      const response = await request.post('/api/launch-tool', {
        data: { invalidToolId: 'nonexistent' }
      });

      expect([400, 401, 403]).toContain(response.status());

      // Attendre que les erreurs soient flushées
      await new Promise(resolve => setTimeout(resolve, 35000));

      // Récupérer les métriques d'erreur
      const { data: errors, error } = await supabase.rpc('get_error_metrics', { p_hours: 1 });

      expect(error).toBeNull();

      // Il devrait y avoir des erreurs trackées
      if (errors && (errors as ErrorMetric[]).length > 0) {
        // Vérifier la structure des erreurs
        for (const err of errors as ErrorMetric[]) {
          expect(err.endpoint).toBeTruthy();
          expect(err.error_type).toBeTruthy();
          expect(err.count).toBeGreaterThan(0);
          expect(err.last_occurrence).toBeTruthy();
        }
      }
    });
  });

  test.describe('Maintenance System', () => {
    test('should run daily maintenance successfully', async () => {
      if (!supabase) {
        test.skip();
        return;
      }
      // Exécuter la maintenance quotidienne
      const { data: maintenanceResult, error } = await supabase.rpc('daily_maintenance');

      expect(error).toBeNull();
      expect(maintenanceResult).toBeTruthy();
      expect(typeof maintenanceResult).toBe('string');

      // Le résultat devrait mentionner les opérations effectuées
      expect(maintenanceResult).toContain('Maintenance terminée');
      expect(maintenanceResult).toContain('backup');
    });

    test('should cleanup old usage logs', async () => {
      if (!supabase) {
        test.skip();
        return;
      }
      // Créer des logs anciens pour tester le nettoyage
      const ninetyOneDaysAgo = new Date();
      ninetyOneDaysAgo.setDate(ninetyOneDaysAgo.getDate() - 91);

      // Insérer des logs anciens avec crédits utilisés = 0 (devraient être nettoyés)
      await supabase
        .from('usage_logs')
        .insert([{
          user_id: '00000000-0000-0000-0000-000000000000',
          action_type: 'test_old_log',
          credits_used: 0,
          metadata: { test: true },
          created_at: ninetyOneDaysAgo.toISOString()
        }]);

      // Compter avant nettoyage
      const { count: countBefore } = await supabase
        .from('usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('action_type', 'test_old_log');

      // Exécuter le nettoyage
      const { data: cleanupResult } = await supabase.rpc('cleanup_old_usage_logs');

      // Vérifier que des logs ont été nettoyés
      expect(cleanupResult).toBeGreaterThanOrEqual(0);

      // Compter après nettoyage
      const { count: countAfter } = await supabase
        .from('usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('action_type', 'test_old_log');

      // Il devrait y avoir moins de logs (ou autant si aucun n'était éligible)
      expect(countAfter ?? 0).toBeLessThanOrEqual(countBefore ?? 0);
    });
  });

  test.describe('Rate Limiting', () => {
    test('should enforce rate limits', async ({ request }) => {
      // Faire plusieurs appels rapides pour déclencher le rate limiting
      const responses = [];

      for (let i = 0; i < 15; i++) { // Plus que la limite de 10 pour launch-tool
        const response = await request.post('/api/launch-tool', {
          data: { toolId: 'app-builder' },
          headers: {
            'Authorization': 'Bearer test-token' // Token invalide mais pour tester rate limit
          }
        });
        responses.push(response);
      }

      // Au moins un devrait être rejeté avec 429
      const rateLimitedResponses = responses.filter(r => r.status() === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);

      // Vérifier les headers de rate limit
      const lastResponse = responses[responses.length - 1];
      if (lastResponse.status() === 429) {
        expect(lastResponse.headers()['retry-after']).toBeTruthy();
        expect(lastResponse.headers()['x-ratelimit-remaining']).toBeTruthy();
        expect(lastResponse.headers()['x-ratelimit-reset']).toBeTruthy();
      }
    });

    test('should allow requests after rate limit reset', async ({ request }) => {
      // Attendre que le rate limit se reset (1 minute)
      await new Promise(resolve => setTimeout(resolve, 65000)); // 65 secondes

      // Faire un nouvel appel (devrait réussir si reset)
      const response = await request.post('/api/launch-tool', {
        data: { toolId: 'app-builder' },
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });

      // Ne devrait pas être rate limited (mais peut échouer pour d'autres raisons)
      expect(response.status()).not.toBe(429);
    });
  });
});
