// AURION - Simple JavaScript App (no modules, no MIME issues)
(function() {
    'use strict';

    console.log('🚀 AURION loading...');

    // Simple DOM manipulation
    function createElement(tag, attrs, children) {
        const el = document.createElement(tag);

        if (attrs) {
            Object.keys(attrs).forEach(key => {
                if (key === 'style' && typeof attrs[key] === 'object') {
                    Object.assign(el.style, attrs[key]);
                } else if (key === 'textContent') {
                    el.textContent = attrs[key];
                } else {
                    el.setAttribute(key, attrs[key]);
                }
            });
        }

        if (children) {
            children.forEach(child => {
                if (typeof child === 'string') {
                    el.appendChild(document.createTextNode(child));
                } else if (child.nodeType) {
                    el.appendChild(child);
                }
            });
        }

        return el;
    }

    // Create the app
    function createApp() {
        const app = createElement('div', {
            style: {
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                maxWidth: '1000px',
                margin: '0 auto',
                padding: '20px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }
        }, [
            createElement('div', { style: { fontSize: '4rem', marginBottom: '20px' } }, '🚀'),
            createElement('h1', {
                style: {
                    fontSize: '3rem',
                    marginBottom: '10px',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }
            }, 'AURION'),
            createElement('p', {
                style: {
                    fontSize: '1.2rem',
                    opacity: '0.9',
                    marginBottom: '30px'
                }
            }, 'Plateforme IA Tout-en-Un'),

            createElement('div', {
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    width: '100%',
                    marginBottom: '30px'
                }
            }, [
                createElement('div', {
                    style: {
                        background: 'rgba(255,255,255,0.1)',
                        padding: '20px',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)'
                    }
                }, [
                    createElement('div', { style: { fontSize: '2rem', marginBottom: '10px' } }, '🎨'),
                    createElement('h3', null, 'Images IA'),
                    createElement('p', { style: { opacity: '0.8', fontSize: '0.9rem' } }, 'Génération créative')
                ]),

                createElement('div', {
                    style: {
                        background: 'rgba(255,255,255,0.1)',
                        padding: '20px',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)'
                    }
                }, [
                    createElement('div', { style: { fontSize: '2rem', marginBottom: '10px' } }, '🎬'),
                    createElement('h3', null, 'Vidéos IA'),
                    createElement('p', { style: { opacity: '0.8', fontSize: '0.9rem' } }, 'Montage automatique')
                ]),

                createElement('div', {
                    style: {
                        background: 'rgba(255,255,255,0.1)',
                        padding: '20px',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)'
                    }
                }, [
                    createElement('div', { style: { fontSize: '2rem', marginBottom: '10px' } }, '💻'),
                    createElement('h3', null, 'Code IA'),
                    createElement('p', { style: { opacity: '0.8', fontSize: '0.9rem' } }, 'Applications complètes')
                ]),

                createElement('div', {
                    style: {
                        background: 'rgba(255,255,255,0.1)',
                        padding: '20px',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)'
                    }
                }, [
                    createElement('div', { style: { fontSize: '2rem', marginBottom: '10px' } }, '🤖'),
                    createElement('h3', null, 'Agents IA'),
                    createElement('p', { style: { opacity: '0.8', fontSize: '0.9rem' } }, 'Automatisation intelligente')
                ])
            ]),

            createElement('div', {
                style: {
                    opacity: '0.8',
                    fontSize: '0.9rem'
                }
            }, `✅ Déployé avec succès • ${new Date().toLocaleDateString('fr-FR')}`)
        ]);

        return app;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        const root = document.getElementById('root');
        if (root) {
            root.appendChild(createApp());
            console.log('✅ AURION app loaded successfully!');
        } else {
            console.error('❌ Root element not found');
        }
    }

})();