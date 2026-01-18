// AURION SaaS Platform - Main Entry Point
console.log('🚀 Loading AURION SaaS Platform...');

// Simple React-like app without external dependencies
const root = document.getElementById('root');
if (root) {
  root.innerHTML = `
    <div style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 20px;
    ">
      <div style="font-size: 4rem; margin-bottom: 1rem;">🚀</div>
      <h1 style="font-size: 2.5rem; margin-bottom: 1rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
        AURION
      </h1>
      <p style="font-size: 1.2rem; opacity: 0.9; margin-bottom: 2rem;">
        Plateforme IA Tout-en-Un
      </p>
      <div style="
        background: rgba(255,255,255,0.1);
        padding: 20px;
        border-radius: 15px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
      ">
        <div style="margin-bottom: 1rem;">⏳ Chargement de l'application...</div>
        <div style="font-size: 0.9rem; opacity: 0.8;">
          🎯 Génération IA : Images • Vidéos • Code • Applications
        </div>
      </div>
    </div>
  `;

  console.log('✅ Basic AURION interface loaded - waiting for React...');
} else {
  console.error('❌ Root element not found');
}