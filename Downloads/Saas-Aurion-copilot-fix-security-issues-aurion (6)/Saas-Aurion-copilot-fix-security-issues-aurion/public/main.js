// AURION SaaS Platform - Simple Loader
(function() {
    'use strict';

    console.log('🚀 Loading AURION SaaS Platform...');

    // Show loading screen
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
                    <div style="margin-bottom: 1rem;">⏳ Chargement de l'application React...</div>
                    <div style="font-size: 0.9rem; opacity: 0.8;">
                        🎯 Génération IA : Images • Vidéos • Code • Applications
                    </div>
                </div>
            </div>
        `;
    }

    // Try to load React app
    try {
        // This will be replaced by Vite during build
        import('/src/main.tsx').catch(function(error) {
            console.warn('React app not available, showing fallback interface:', error);

            // Fallback interface if React fails to load
            if (root) {
                root.innerHTML = `
                    <div style="
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 40px 20px;
                        text-align: center;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        min-height: 100vh;
                    ">
                        <div style="margin-bottom: 2rem;">
                            <h1 style="font-size: 3rem; margin-bottom: 1rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                                🚀 AURION
                            </h1>
                            <p style="font-size: 1.2rem; opacity: 0.9;">
                                Plateforme IA Tout-en-Un
                            </p>
                        </div>

                        <div style="
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                            gap: 20px;
                            margin: 2rem 0;
                        ">
                            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; backdrop-filter: blur(10px);">
                                <div style="font-size: 2rem; margin-bottom: 10px;">🎨</div>
                                <h3>Images IA</h3>
                                <p style="opacity: 0.8; font-size: 0.9rem;">Génération créative</p>
                            </div>
                            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; backdrop-filter: blur(10px);">
                                <div style="font-size: 2rem; margin-bottom: 10px;">🎬</div>
                                <h3>Vidéos IA</h3>
                                <p style="opacity: 0.8; font-size: 0.9rem;">Montage automatique</p>
                            </div>
                            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; backdrop-filter: blur(10px);">
                                <div style="font-size: 2rem; margin-bottom: 10px;">💻</div>
                                <h3>Code IA</h3>
                                <p style="opacity: 0.8; font-size: 0.9rem;">Applications complètes</p>
                            </div>
                            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; backdrop-filter: blur(10px);">
                                <div style="font-size: 2rem; margin-bottom: 10px;">🤖</div>
                                <h3>Agents IA</h3>
                                <p style="opacity: 0.8; font-size: 0.9rem;">Automatisation intelligente</p>
                            </div>
                        </div>

                        <div style="margin-top: 3rem;">
                            <button onclick="window.location.href='/dashboard'" style="
                                background: rgba(255,255,255,0.2);
                                color: white;
                                border: 2px solid rgba(255,255,255,0.3);
                                padding: 12px 24px;
                                border-radius: 25px;
                                font-size: 1.1rem;
                                cursor: pointer;
                                backdrop-filter: blur(10px);
                            ">
                                🎯 Accéder au Dashboard
                            </button>
                        </div>

                        <div style="margin-top: 2rem; opacity: 0.7;">
                            <p>✅ Déployé sur Cloudflare Pages • Interface de secours active</p>
                        </div>
                    </div>
                `;
            }
        });
    } catch (error) {
        console.error('Failed to load React app:', error);
    }

    console.log('✅ AURION basic interface loaded');
})();