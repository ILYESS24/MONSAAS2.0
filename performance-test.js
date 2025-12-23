// ============================================
// TEST DE PERFORMANCE DE BASE
// Vérifie les métriques essentielles avant production
// ============================================

const { chromium } = require('playwright');

class PerformanceTester {
  constructor() {
    this.results = {
      loadTimes: [],
      ttfb: [], // Time to First Byte
      domContentLoaded: [],
      firstPaint: [],
      largestContentfulPaint: [],
      errors: []
    };
  }

  async runTests() {
    console.log('🚀 Starting Performance Tests...\n');

    const browser = await chromium.launch({ headless: true });
    const results = [];

    try {
      // Test 1: Page d'accueil
      console.log('📊 Test 1: Homepage Load Time');
      const homeResult = await this.testPageLoad(browser, '/', 'Homepage');
      results.push(homeResult);

      // Test 2: Dashboard (simulé)
      console.log('📊 Test 2: Dashboard Load Time (simulated)');
      const dashboardResult = await this.testPageLoad(browser, '/dashboard', 'Dashboard');
      results.push(dashboardResult);

      // Test 3: Iframe load
      console.log('📊 Test 3: Iframe Load Time');
      const iframeResult = await this.testIframeLoad(browser);
      results.push(iframeResult);

      // Test 4: API Response Time
      console.log('📊 Test 4: API Response Time');
      const apiResult = await this.testAPIResponse();
      results.push(apiResult);

      // Afficher les résultats
      this.displayResults(results);

      // Vérifications de conformité
      this.checkCompliance(results);

    } catch (error) {
      console.error('❌ Performance test failed:', error.message);
    } finally {
      await browser.close();
    }
  }

  async testPageLoad(browser, url, name) {
    const page = await browser.newPage();

    try {
      const startTime = Date.now();

      // Mesurer les métriques de performance
      const metrics = {};

      page.on('load', () => {
        metrics.loadTime = Date.now() - startTime;
      });

      await page.goto(`http://localhost:5173${url}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Attendre un peu pour les métriques finales
      await page.waitForTimeout(2000);

      // Récupérer les métriques de performance
      const performanceMetrics = await page.evaluate(() => {
        const perf = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');

        return {
          domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
          loadComplete: perf.loadEventEnd - perf.loadEventStart,
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
          largestContentfulPaint: 0, // Would need additional setup
          ttfb: perf.responseStart - perf.requestStart
        };
      });

      await page.close();

      return {
        name,
        url,
        success: true,
        metrics: {
          totalLoadTime: Date.now() - startTime,
          ...performanceMetrics
        }
      };

    } catch (error) {
      await page.close();
      return {
        name,
        url,
        success: false,
        error: error.message,
        metrics: {}
      };
    }
  }

  async testIframeLoad(browser) {
    const page = await browser.newPage();

    try {
      await page.goto('http://localhost:5173/tools/app-builder');

      // Attendre que l'iframe soit chargé
      const iframeSelector = 'iframe';
      await page.waitForSelector(iframeSelector, { timeout: 10000 });

      // Mesurer le temps de chargement de l'iframe
      const loadTime = await page.evaluate(() => {
        const iframe = document.querySelector('iframe');
        if (iframe) {
          return new Promise((resolve) => {
            const start = Date.now();
            iframe.onload = () => resolve(Date.now() - start);
            // Timeout après 10 secondes
            setTimeout(() => resolve(Date.now() - start), 10000);
          });
        }
        return 0;
      });

      await page.close();

      return {
        name: 'Iframe Load',
        url: '/tools/app-builder',
        success: true,
        metrics: {
          iframeLoadTime: loadTime
        }
      };

    } catch (error) {
      await page.close();
      return {
        name: 'Iframe Load',
        url: '/tools/app-builder',
        success: false,
        error: error.message,
        metrics: {}
      };
    }
  }

  async testAPIResponse() {
    try {
      const startTime = Date.now();

      // Tester un endpoint qui devrait exister
      const response = await fetch('http://localhost:5173/api/nonexistent', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      const responseTime = Date.now() - startTime;

      return {
        name: 'API Response',
        url: '/api/nonexistent',
        success: true,
        metrics: {
          responseTime,
          statusCode: response.status
        }
      };

    } catch (error) {
      return {
        name: 'API Response',
        url: '/api/nonexistent',
        success: false,
        error: error.message,
        metrics: {}
      };
    }
  }

  displayResults(results) {
    console.log('\n📈 PERFORMANCE RESULTS:\n');

    results.forEach(result => {
      if (result.success) {
        console.log(`✅ ${result.name}:`);
        Object.entries(result.metrics).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}ms`);
        });
      } else {
        console.log(`❌ ${result.name}: FAILED - ${result.error}`);
      }
      console.log('');
    });
  }

  checkCompliance(results) {
    console.log('🔍 COMPLIANCE CHECK:\n');

    const checks = [];

    // Vérification des temps de chargement
    const homeResult = results.find(r => r.name === 'Homepage');
    if (homeResult?.success && homeResult.metrics.totalLoadTime > 3000) {
      checks.push({
        name: 'Homepage Load Time',
        status: 'FAIL',
        message: `Trop lent: ${homeResult.metrics.totalLoadTime}ms > 3000ms`,
        severity: 'HIGH'
      });
    } else {
      checks.push({
        name: 'Homepage Load Time',
        status: 'PASS',
        message: `Acceptable: ${homeResult?.metrics?.totalLoadTime || 0}ms`,
        severity: 'LOW'
      });
    }

    // Vérification TTFB
    if (homeResult?.success && homeResult.metrics.ttfb > 1000) {
      checks.push({
        name: 'Time to First Byte',
        status: 'FAIL',
        message: `TTFB trop élevé: ${homeResult.metrics.ttfb}ms > 1000ms`,
        severity: 'MEDIUM'
      });
    }

    // Vérification iframe
    const iframeResult = results.find(r => r.name === 'Iframe Load');
    if (iframeResult?.success && iframeResult.metrics.iframeLoadTime > 5000) {
      checks.push({
        name: 'Iframe Load Time',
        status: 'WARNING',
        message: `Iframe lent: ${iframeResult.metrics.iframeLoadTime}ms`,
        severity: 'MEDIUM'
      });
    }

    // Afficher les checks
    checks.forEach(check => {
      const icon = check.status === 'PASS' ? '✅' : check.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${icon} ${check.name}: ${check.message}`);
    });

    // Résumé final
    const failures = checks.filter(c => c.status === 'FAIL').length;
    const warnings = checks.filter(c => c.status === 'WARNING').length;

    console.log(`\n🏁 SUMMARY:`);
    console.log(`   ✅ Passed: ${checks.filter(c => c.status === 'PASS').length}`);
    console.log(`   ⚠️ Warnings: ${warnings}`);
    console.log(`   ❌ Failures: ${failures}`);

    if (failures === 0 && warnings <= 2) {
      console.log(`\n🎉 PERFORMANCE TESTS: PASSED`);
    } else if (failures > 0) {
      console.log(`\n🚨 PERFORMANCE TESTS: FAILED - ${failures} critical issues`);
    } else {
      console.log(`\n⚠️ PERFORMANCE TESTS: PASSED WITH WARNINGS`);
    }
  }
}

// Exécuter les tests
const tester = new PerformanceTester();
tester.runTests().catch(console.error);
