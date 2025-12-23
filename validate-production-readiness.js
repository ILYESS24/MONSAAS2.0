#!/usr/bin/env node

// ============================================
// VALIDATION FINALE - PRODUCTION READINESS
// Vérifie que toutes les corrections critiques sont en place
// ============================================

const fs = require('fs');
const path = require('path');

class ProductionValidator {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passed = [];
  }

  // ============================================
  // VALIDATIONS INDIVIDUELLES
  // ============================================

  validateSecurityHeaders() {
    console.log('🔒 Checking security headers...');

    try {
      const headersPath = path.join(__dirname, 'dist', '_headers');
      const headersContent = fs.readFileSync(headersPath, 'utf8');

      // HSTS obligatoire
      if (!headersContent.includes('Strict-Transport-Security:')) {
        this.issues.push('❌ HSTS header missing in dist/_headers');
      } else {
        this.passed.push('✅ HSTS header present');
      }

      // CSP obligatoire
      if (!headersContent.includes('Content-Security-Policy:')) {
        this.issues.push('❌ Content Security Policy missing in dist/_headers');
      } else {
        this.passed.push('✅ CSP header present');
      }

      // X-Frame-Options doit être DENY
      if (!headersContent.includes('X-Frame-Options: DENY')) {
        this.issues.push('❌ X-Frame-Options not set to DENY');
      } else {
        this.passed.push('✅ X-Frame-Options: DENY');
      }

    } catch (error) {
      this.issues.push('❌ Security headers file not found: dist/_headers');
    }
  }

  validateEnvironmentConfig() {
    console.log('🔧 Checking environment configuration...');

    try {
      const envPath = path.join(__dirname, 'src', 'config', 'env.ts');
      const envContent = fs.readFileSync(envPath, 'utf8');

      // Vérifier qu'aucune clé n'est hardcodée
      const hardcodedPatterns = [
        /FPSX[a-zA-Z0-9]+/, // Freepik
        /sk_test_[a-zA-Z0-9_]+/, // Stripe test
        /pk_test_[a-zA-Z0-9_]+/, // Stripe publishable test
        /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/ // JWT tokens
      ];

      let hasHardcodedKeys = false;
      hardcodedPatterns.forEach(pattern => {
        if (pattern.test(envContent)) {
          hasHardcodedKeys = true;
        }
      });

      if (hasHardcodedKeys) {
        this.issues.push('❌ Hardcoded API keys found in environment config');
      } else {
        this.passed.push('✅ No hardcoded keys in environment config');
      }

    } catch (error) {
      this.issues.push('❌ Environment config file not accessible');
    }
  }

  validateLoggingSystem() {
    console.log('📊 Checking logging system...');

    try {
      const loggerPath = path.join(__dirname, 'src', 'services', 'logger.ts');
      const loggerContent = fs.readFileSync(loggerPath, 'utf8');

      // Vérifier que le service logger existe
      if (!loggerContent.includes('export const logger')) {
        this.issues.push('❌ Logger service not properly exported');
      } else {
        this.passed.push('✅ Logger service implemented');
      }

      // Vérifier les imports du logger dans les fichiers modifiés
      const srcDir = path.join(__dirname, 'src');
      this.checkLoggerImports(srcDir);

    } catch (error) {
      this.issues.push('❌ Logger service file not found');
    }
  }

  checkLoggerImports(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && !file.startsWith('.')) {
        this.checkLoggerImports(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');

          // Si le fichier utilise logger. mais n'importe pas logger
          if (content.includes('logger.') && !content.includes("from '@/services/logger'")) {
            this.warnings.push(`⚠️  ${filePath}: uses logger but missing import`);
          }
        } catch (error) {
          // Ignore read errors
        }
      }
    }
  }

  validateGDPRCompliance() {
    console.log('🛡️ Checking GDPR compliance...');

    try {
      const gdprPath = path.join(__dirname, 'src', 'pages', 'settings', 'GDPRSettings.tsx');
      const gdprContent = fs.readFileSync(gdprPath, 'utf8');

      // Vérifier les fonctionnalités RGPD
      const requiredFeatures = [
        'handleDataExport',
        'handleAccountDeletion',
        'SUPPRIMER MON COMPTE'
      ];

      let gdprComplete = true;
      requiredFeatures.forEach(feature => {
        if (!gdprContent.includes(feature)) {
          gdprComplete = false;
        }
      });

      if (!gdprComplete) {
        this.issues.push('❌ GDPR compliance incomplete');
      } else {
        this.passed.push('✅ GDPR export and deletion implemented');
      }

    } catch (error) {
      this.issues.push('❌ GDPR settings page not found');
    }
  }

  validatePerformanceTests() {
    console.log('⚡ Checking performance tests...');

    try {
      const perfTestPath = path.join(__dirname, 'performance-test.js');
      const perfTestContent = fs.readFileSync(perfTestPath, 'utf8');

      // Vérifier que les tests existent
      if (!perfTestContent.includes('PerformanceTester')) {
        this.issues.push('❌ Performance tests not implemented');
      } else {
        this.passed.push('✅ Performance tests implemented');
      }

    } catch (error) {
      this.issues.push('❌ Performance test file not found');
    }
  }

  // ============================================
  // RAPPORT FINAL
  // ============================================

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 PRODUCTION READINESS VALIDATION REPORT');
    console.log('='.repeat(60));

    // Résumé
    const totalIssues = this.issues.length;
    const totalWarnings = this.warnings.length;
    const totalPassed = this.passed.length;

    console.log(`\n📊 SUMMARY:`);
    console.log(`   ✅ Passed: ${totalPassed}`);
    console.log(`   ⚠️  Warnings: ${totalWarnings}`);
    console.log(`   ❌ Issues: ${totalIssues}`);

    // Issues critiques
    if (this.issues.length > 0) {
      console.log(`\n🚨 CRITICAL ISSUES (${this.issues.length}):`);
      this.issues.forEach(issue => console.log(`   ${issue}`));
    }

    // Warnings
    if (this.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${this.warnings.length}):`);
      this.warnings.forEach(warning => console.log(`   ${warning}`));
    }

    // Validations réussies
    if (this.passed.length > 0) {
      console.log(`\n✅ PASSED VALIDATIONS (${this.passed.length}):`);
      this.passed.forEach(passed => console.log(`   ${passed}`));
    }

    // Verdict final
    console.log('\n' + '='.repeat(60));

    if (totalIssues === 0) {
      console.log('🎉 PRODUCTION READY! All critical validations passed.');
      console.log('🚀 Safe to deploy to production.');
    } else if (totalIssues <= 2) {
      console.log('⚠️  MOSTLY READY - Minor issues to fix before deployment.');
      console.log('🔧 Address the critical issues above.');
    } else {
      console.log('🚨 NOT PRODUCTION READY - Critical issues must be fixed.');
      console.log('🛑 DO NOT DEPLOY until all critical issues are resolved.');
    }

    console.log('='.repeat(60));

    return totalIssues === 0;
  }

  // ============================================
  // EXÉCUTION
  // ============================================

  async run() {
    console.log('🚀 Starting Production Readiness Validation...\n');

    this.validateSecurityHeaders();
    this.validateEnvironmentConfig();
    this.validateLoggingSystem();
    this.validateGDPRCompliance();
    this.validatePerformanceTests();

    return this.generateReport();
  }
}

// Exécuter la validation
const validator = new ProductionValidator();
validator.run().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Validation failed:', error);
  process.exit(1);
});
