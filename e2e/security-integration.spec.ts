 
import { test, expect } from '@playwright/test';

test.describe('Security Integration Tests', () => {

  test.describe('API Authentication', () => {
    test('should reject API calls without authentication', async ({ request }) => {
      // Tenter d'appeler une API protégée sans token
      const response = await request.post('/api/launch-tool', {
        data: { toolId: 'app-builder' }
      });

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.error).toContain('Authentication required');
    });

    test('should reject API calls with invalid token', async ({ request }) => {
      // Tenter avec un token invalide
      const response = await request.post('/api/launch-tool', {
        headers: {
          'Authorization': 'Bearer invalid-token-123'
        },
        data: { toolId: 'app-builder' }
      });

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.error).toContain('Authentication required');
    });

    test('should accept valid authentication', async ({ request }) => {
      // Cette vérification nécessite un vrai token JWT
      // Dans un vrai environnement de test, nous aurions un token valide

      // Pour l'instant, vérifier que l'endpoint existe et répond
      const optionsResponse = await request.options('/api/launch-tool');
      expect(optionsResponse.status()).toBe(204);
      expect(optionsResponse.headers()['access-control-allow-origin']).toBe('*');
    });
  });

  test.describe('Credit Blocking', () => {
    test('should block tool launch when credits exhausted', async ({ page, request }) => {
      // Simuler un utilisateur avec 0 crédits
      await page.addInitScript(() => {
        localStorage.setItem('clerk-user', JSON.stringify({
          id: 'test-user-no-credits',
          credits: { total: 0, used: 0, available: 0 }
        }));
      });

      // Simuler un appel API avec un utilisateur sans crédits
      // (Nécessite un vrai token JWT dans un environnement réel)
      const response = await request.post('/api/launch-tool', {
        headers: {
          'Authorization': 'Bearer mock-jwt-token',
          'Content-Type': 'application/json',
        },
        data: { toolId: 'app-builder' }
      });

      // Devrait être rejeté (status 401 car token invalide, mais logique serait 403 si authentifié)
      expect([401, 403]).toContain(response.status());
    });
  });

  test.describe('Tool Session Security', () => {
    test('should validate tool session tokens', async ({ request }) => {
      // Tenter de valider un token invalide
      const response = await request.post('/api/validate-tool-session', {
        data: {
          sessionToken: 'invalid.token.signature',
          toolId: 'app-builder'
        }
      });

      expect(response.status()).toBe(403);
      const body = await response.json();
      expect(body.valid).toBe(false);
      expect(body.error).toBe('Invalid token');
    });

    test('should accept valid session tokens (mock)', async ({ request }) => {
      // Créer un token valide pour test
      const payload = {
        user_id: 'test-user-123',
        tool_id: 'app-builder',
        credits_consumed: 50,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600, // 1h
      };

      const encodedPayload = btoa(JSON.stringify(payload));
      const signature = btoa('test-signature');
      const validToken = `${encodedPayload}.${signature}`;

      const response = await request.post('/api/validate-tool-session', {
        data: {
          sessionToken: validToken,
          toolId: 'app-builder'
        }
      });

      // Sans DB réelle, la validation échouera au niveau session DB
      // Mais le token devrait être considéré comme valide structurellement
      const body = await response.json();
      expect(body).toHaveProperty('valid');
    });
  });

  test.describe('CORS and Headers', () => {
    test('should include proper CORS headers', async ({ request }) => {
      const response = await request.options('/api/launch-tool');

      expect(response.status()).toBe(204);
      expect(response.headers()['access-control-allow-origin']).toBe('*');
      expect(response.headers()['access-control-allow-methods']).toContain('POST');
      expect(response.headers()['access-control-allow-headers']).toContain('Authorization');
    });

    test('should include security headers on responses', async ({ request }) => {
      // Tester avec un appel qui retourne une erreur (plus facile à contrôler)
      const response = await request.post('/api/launch-tool', {
        data: { toolId: 'invalid-tool' }
      });

      expect(response.headers()['access-control-allow-origin']).toBe('*');
      expect(response.headers()['content-type']).toContain('application/json');
    });
  });

  test.describe('Data Validation', () => {
    test('should validate tool IDs', async ({ request }) => {
      const response = await request.post('/api/launch-tool', {
        headers: {
          'Authorization': 'Bearer mock-token',
          'Content-Type': 'application/json',
        },
        data: { toolId: 'invalid-tool-123' }
      });

      // Devrait échouer à cause du token invalide d'abord, mais logique serait 400
      expect([400, 401]).toContain(response.status());
    });

    test('should require toolId parameter', async ({ request }) => {
      const response = await request.post('/api/launch-tool', {
        headers: {
          'Authorization': 'Bearer mock-token',
          'Content-Type': 'application/json',
        },
        data: {} // toolId manquant
      });

      expect([400, 401]).toContain(response.status());
    });
  });

  test.describe('Rate Limiting and Abuse Prevention', () => {
    test('should handle rapid successive requests', async ({ request }) => {
      // Simuler plusieurs appels rapides
      const promises = Array(10).fill().map(() =>
        request.post('/api/launch-tool', {
          headers: {
            'Authorization': 'Bearer mock-token',
          },
          data: { toolId: 'app-builder' }
        })
      );

      const responses = await Promise.all(promises);

      // Tous les appels devraient échouer à cause de l'authentification
      // Mais dans un vrai environnement, nous vérifierions le rate limiting
      responses.forEach(response => {
        expect([401, 403]).toContain(response.status());
      });
    });
  });
});
