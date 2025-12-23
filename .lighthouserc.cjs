module.exports = {
  ci: {
    collect: {
      // URLs à analyser
      url: [
        'https://0c114c34.aurion-saas.pages.dev/',
        'https://0c114c34.aurion-saas.pages.dev/dashboard',
        'https://0c114c34.aurion-saas.pages.dev/pricing'
      ],
      numberOfRuns: 3,
      startServerCommand: '',
      startServerReadyPattern: '',
      startServerReadyTimeout: 60000,
    },
    upload: {
      target: 'temporary-public-storage',
      githubToken: process.env.LHCI_GITHUB_TOKEN,
      githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN,
    },
    assert: {
      // Seuils de performance stricts pour un SaaS
      assertions: {
        // Performance - Score minimum 90
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.9 }],

        // Core Web Vitals - Valeurs critiques
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-input-delay': ['error', { maxNumericValue: 100 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],

        // Métriques de performance
        'speed-index': ['error', { maxNumericValue: 3000 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'max-potential-fid': ['error', { maxNumericValue: 130 }],

        // Taille du bundle optimisée
        'total-byte-weight': ['error', { maxNumericValue: 2000000 }], // 2MB max

        // Ressources critiques
        'mainthread-work-breakdown': ['error', {
          minScore: 0.9,
          maxLength: 5000
        }],

        // Images optimisées
        'uses-responsive-images': 'off', // Désactivé temporairement
        'uses-optimized-images': 'off', // Désactivé temporairement

        // Bonnes pratiques
        'uses-text-compression': 'on',
        'uses-rel-preconnect': 'on',
        'time-to-first-byte': ['error', { maxNumericValue: 600 }],
      }
    },
    server: {
      // Configuration du serveur pour les tests
      port: 9001,
      staticDistDir: './dist',
    },
    wizard: {
      // Configuration de l'assistant
    },
  },
};
