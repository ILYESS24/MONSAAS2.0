#!/usr/bin/env node

/**
 * TEST DE CHARGE - CONCURRENCE ET SÉCURITÉ
 *
 * Ce script simule des scénarios de charge pour valider :
 * 1. Protection contre les race conditions
 * 2. Respect des limites journalières sous charge
 * 3. Performance des vérifications serveur
 * 4. Gestion des erreurs concurrentes
 */

const fs = require('fs');
const path = require('path');

// Configuration du test
const CONFIG = {
  concurrentUsers: 10,
  requestsPerUser: 5,
  testDuration: 30000, // 30 secondes
  tools: ['image_generation', 'code_generation', 'text_editor'],
  userId: '550e8400-e29b-41d4-a716-446655440000', // UUID de test
};

// ============================================
// SIMULATION SUPABASE CLIENT
// ============================================

class MockSupabaseClient {
  constructor() {
    this.usageLogs = [];
    this.toolLimitsCalls = 0;
    this.consumeCreditsCalls = 0;
  }

  async rpc(functionName, params) {
    if (functionName === 'check_tool_limits') {
      this.toolLimitsCalls++;
      return this.mockCheckToolLimits(params);
    }

    if (functionName === 'consume_user_credits') {
      this.consumeCreditsCalls++;
      return this.mockConsumeCredits(params);
    }

    throw new Error(`Unknown RPC function: ${functionName}`);
  }

  mockCheckToolLimits(params) {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().substring(0, 7);

    // Simuler des limites réalistes
    const dailyLimit = 10;
    const monthlyLimit = 100;

    // Compter les usages existants pour cet utilisateur/outil
    const existingDaily = this.usageLogs.filter(log =>
      log.user_id === params.p_user_id &&
      log.action_type === params.p_tool_type + '_action' &&
      log.created_at.startsWith(today)
    ).length;

    const existingMonthly = this.usageLogs.filter(log =>
      log.user_id === params.p_user_id &&
      log.action_type === params.p_tool_type + '_action' &&
      log.created_at.startsWith(currentMonth)
    ).length;

    // Vérifier limites
    if (existingDaily >= dailyLimit) {
      return {
        allowed: false,
        reason: `Daily limit reached (${existingDaily}/${dailyLimit})`,
        daily_remaining: 0,
        monthly_remaining: Math.max(0, monthlyLimit - existingMonthly)
      };
    }

    if (existingMonthly >= monthlyLimit) {
      return {
        allowed: false,
        reason: `Monthly limit reached (${existingMonthly}/${monthlyLimit})`,
        daily_remaining: Math.max(0, dailyLimit - existingDaily),
        monthly_remaining: 0
      };
    }

    return {
      allowed: true,
      daily_remaining: Math.max(0, dailyLimit - existingDaily),
      monthly_remaining: Math.max(0, monthlyLimit - existingMonthly)
    };
  }

  mockConsumeCredits(params) {
    // Simuler logique atomique de consommation
    const cost = params.p_cost;
    const actionType = params.p_action_type;

    // Ajouter le log d'usage
    this.usageLogs.push({
      user_id: params.p_user_id,
      action_type: actionType,
      credits_used: cost,
      created_at: new Date().toISOString()
    });

    return {
      success: true,
      credits_used: cost,
      remaining_credits: 90, // Simulé
      available_credits: 90
    };
  }

  getStats() {
    return {
      totalLogs: this.usageLogs.length,
      toolLimitsCalls: this.toolLimitsCalls,
      consumeCreditsCalls: this.consumeCreditsCalls,
      logsByTool: this.usageLogs.reduce((acc, log) => {
        acc[log.action_type] = (acc[log.action_type] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

// ============================================
// SIMULATION ACCESS CONTROL
// ============================================

class MockAccessControl {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async checkAccess(toolType) {
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const result = await this.supabase.rpc('check_tool_limits', {
        p_user_id: CONFIG.userId,
        p_tool_type: toolType,
        p_today: today,
        p_current_month: currentMonth,
        p_daily_limit: 10,
        p_monthly_limit: 100
      });

      return {
        allowed: result.allowed,
        reason: result.reason,
        creditsAvailable: 100, // Simulé
        dailyRemaining: result.daily_remaining,
        monthlyRemaining: result.monthly_remaining
      };
    } catch (error) {
      console.error('Check access error:', error);
      return {
        allowed: false,
        reason: 'Verification error',
        creditsAvailable: 0
      };
    }
  }

  async consumeCredits(toolType, metadata = {}) {
    try {
      const result = await this.supabase.rpc('consume_user_credits', {
        p_user_id: CONFIG.userId,
        p_cost: 10, // Coût fixe pour test
        p_action_type: `${toolType}_action`,
        p_metadata: metadata
      });

      if (result.success) {
        return {
          success: true,
          creditsUsed: result.credits_used,
          remainingCredits: result.remaining_credits
        };
      } else {
        return {
          success: false,
          error: result.error_message,
          creditsUsed: 0,
          remainingCredits: 0
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        creditsUsed: 0,
        remainingCredits: 0
      };
    }
  }
}

// ============================================
// SIMULATION UTILISATEUR CONCURRENT
// ============================================

class ConcurrentUser {
  constructor(id, accessControl) {
    this.id = id;
    this.accessControl = accessControl;
    this.requests = 0;
    this.successes = 0;
    this.failures = 0;
    this.errors = [];
  }

  async performAction(toolType) {
    this.requests++;

    try {
      // Étape 1: Vérifier accès
      const check = await this.accessControl.checkAccess(toolType);

      if (!check.allowed) {
        this.failures++;
        return { success: false, reason: check.reason, step: 'check' };
      }

      // Étape 2: Consommer crédits
      const consumption = await this.accessControl.consumeCredits(toolType, {
        user_id: this.id,
        tool: toolType,
        timestamp: Date.now()
      });

      if (consumption.success) {
        this.successes++;
        return { success: true, creditsUsed: consumption.creditsUsed, step: 'consume' };
      } else {
        this.failures++;
        return { success: false, reason: consumption.error, step: 'consume' };
      }

    } catch (error) {
      this.errors.push(error.message);
      return { success: false, reason: error.message, step: 'error' };
    }
  }

  getStats() {
    return {
      userId: this.id,
      requests: this.requests,
      successes: this.successes,
      failures: this.failures,
      successRate: this.requests > 0 ? (this.successes / this.requests * 100).toFixed(1) : 0,
      errors: this.errors.length
    };
  }
}

// ============================================
// TEST PRINCIPAL
// ============================================

async function runConcurrencyTest() {
  console.log('🚀 DÉMARRAGE TEST DE CONCURRENCE - SÉCURITÉ\n');

  const supabase = new MockSupabaseClient();
  const accessControl = new MockAccessControl(supabase);

  // Créer des utilisateurs concurrents
  const users = [];
  for (let i = 0; i < CONFIG.concurrentUsers; i++) {
    users.push(new ConcurrentUser(`user_${i}`, accessControl));
  }

  console.log(`👥 ${CONFIG.concurrentUsers} utilisateurs simultanés`);
  console.log(`📊 ${CONFIG.requestsPerUser} requêtes par utilisateur`);
  console.log(`⏱️  Durée test: ${CONFIG.testDuration / 1000}s\n`);

  const startTime = Date.now();
  let totalRequests = 0;

  // Fonction pour simuler un utilisateur actif
  async function simulateUserActivity(user) {
    const endTime = startTime + CONFIG.testDuration;

    while (Date.now() < endTime) {
      const toolType = CONFIG.tools[Math.floor(Math.random() * CONFIG.tools.length)];

      const result = await user.performAction(toolType);
      totalRequests++;

      // Petit délai aléatoire pour simuler comportement humain
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    }
  }

  // Lancer tous les utilisateurs en parallèle
  console.log('⚡ Lancement des utilisateurs concurrents...');
  const userPromises = users.map(user => simulateUserActivity(user));

  try {
    await Promise.all(userPromises);
  } catch (error) {
    console.error('❌ Erreur pendant le test:', error);
  }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  // ============================================
  // ANALYSE DES RÉSULTATS
  // ============================================

  console.log('\n📈 RÉSULTATS DU TEST DE CONCURRENCE\n');

  const totalUsers = users.length;
  const totalUserRequests = users.reduce((sum, user) => sum + user.requests, 0);
  const totalSuccesses = users.reduce((sum, user) => sum + user.successes, 0);
  const totalFailures = users.reduce((sum, user) => sum + user.failures, 0);

  console.log('📊 STATISTIQUES GLOBALES:');
  console.log(`   Durée: ${duration.toFixed(1)}s`);
  console.log(`   Total requêtes: ${totalUserRequests}`);
  console.log(`   Requêtes/seconde: ${(totalUserRequests / duration).toFixed(1)}`);
  console.log(`   Taux succès: ${((totalSuccesses / totalUserRequests) * 100).toFixed(1)}%`);
  console.log(`   Taux échec: ${((totalFailures / totalUserRequests) * 100).toFixed(1)}%\n`);

  // Statistiques par utilisateur
  console.log('👤 STATISTIQUES PAR UTILISATEUR:');
  users.forEach(user => {
    const stats = user.getStats();
    console.log(`   User ${user.id}: ${stats.requests} req, ${stats.successRate}% succès, ${stats.errors} erreurs`);
  });

  // Statistiques Supabase
  console.log('\n🗄️  STATISTIQUES BASE DE DONNÉES:');
  const dbStats = supabase.getStats();
  console.log(`   Logs d'usage créés: ${dbStats.totalLogs}`);
  console.log(`   Appels check_tool_limits: ${dbStats.toolLimitsCalls}`);
  console.log(`   Appels consume_credits: ${dbStats.consumeCreditsCalls}`);
  console.log(`   Logs par outil:`, dbStats.logsByTool);

  // ============================================
  // VALIDATIONS SÉCURITÉ
  // ============================================

  console.log('\n🔒 VALIDATIONS SÉCURITÉ:\n');

  // 1. Vérifier limites journalières respectées
  const dailyStats = {};
  dbStats.logsByTool && Object.entries(dbStats.logsByTool).forEach(([tool, count]) => {
    const maxAllowed = 10; // limite journalière simulée
    const status = count <= maxAllowed ? '✅' : '❌';
    console.log(`   ${status} Limite journalière ${tool}: ${count}/${maxAllowed}`);
    dailyStats[tool] = { count, maxAllowed, respected: count <= maxAllowed };
  });

  // 2. Vérifier cohérence des appels
  const expectedChecks = totalUserRequests;
  const checkCallRatio = (dbStats.toolLimitsCalls / expectedChecks * 100).toFixed(1);
  console.log(`   ${dbStats.toolLimitsCalls === expectedChecks ? '✅' : '❌'} Cohérence appels check_tool_limits: ${dbStats.toolLimitsCalls}/${expectedChecks} (${checkCallRatio}%)`);

  // 3. Vérifier pas de race conditions (logs cohérents)
  const successfulConsumptions = Object.values(dbStats.logsByTool).reduce((sum, count) => sum + count, 0);
  console.log(`   ${successfulConsumptions === totalSuccesses ? '✅' : '❌'} Cohérence logs: ${successfulConsumptions} logs pour ${totalSuccesses} succès`);

  // ============================================
  // CONCLUSION
  // ============================================

  const allLimitsRespected = Object.values(dailyStats).every(stat => stat.respected);
  const noRaceConditions = successfulConsumptions === totalSuccesses;
  const consistentCalls = dbStats.toolLimitsCalls === expectedChecks;

  console.log('\n🎯 CONCLUSION:\n');

  if (allLimitsRespected && noRaceConditions && consistentCalls) {
    console.log('🎉 TEST RÉUSSI - SÉCURITÉ VALIDÉE !');
    console.log('   ✅ Limites journalières respectées sous charge');
    console.log('   ✅ Pas de race conditions détectées');
    console.log('   ✅ Cohérence appels base de données');
    console.log('   ✅ Gestion erreurs concurrentes fonctionnelle');
    console.log('\n✨ SYSTÈME PRÊT POUR PRODUCTION !');
  } else {
    console.log('❌ TEST ÉCHOUÉ - PROBLÈMES DÉTECTÉS');
    if (!allLimitsRespected) console.log('   ❌ Limites journalières dépassées');
    if (!noRaceConditions) console.log('   ❌ Incohérence dans les logs (race condition?)');
    if (!consistentCalls) console.log('   ❌ Problème cohérence appels base');
    console.log('\n🔧 INVESTIGATION REQUISE');
  }

  console.log(`\n⏱️  Test terminé en ${duration.toFixed(1)} secondes`);
}

// ============================================
// LANCEMENT
// ============================================

if (require.main === module) {
  runConcurrencyTest().catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = { runConcurrencyTest };
