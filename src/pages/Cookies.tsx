/**
 * Cookies Policy Page - Aurion Studio
 * 
 * SEO: Politique cookies Aurion, gestion cookies SaaS, consentement RGPD
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Cookie, Settings, BarChart3, Target, Shield, Info } from "lucide-react";
import { SEO, seoConfigs } from "@/components/common/SEO";

const Cookies = () => {
  const lastUpdate = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  const cookieTypes = [
    {
      icon: Shield,
      name: "Cookies essentiels",
      required: true,
      description: "Indispensables au fonctionnement du site. Permettent la connexion, la navigation sécurisée et les fonctionnalités de base.",
      examples: ["Session utilisateur", "Préférences de sécurité", "Panier/checkout"],
      duration: "Session ou 1 an max",
    },
    {
      icon: Settings,
      name: "Cookies fonctionnels",
      required: false,
      description: "Mémorisent vos préférences pour améliorer votre expérience (langue, thème, paramètres d'affichage).",
      examples: ["Thème sombre/clair", "Langue préférée", "Derniers projets ouverts"],
      duration: "1 an",
    },
    {
      icon: BarChart3,
      name: "Cookies analytiques",
      required: false,
      description: "Nous aident à comprendre comment vous utilisez le site pour l'améliorer. Données anonymisées.",
      examples: ["Pages visitées", "Temps passé", "Actions réalisées"],
      duration: "2 ans max",
    },
    {
      icon: Target,
      name: "Cookies marketing",
      required: false,
      description: "Utilisés pour vous montrer des publicités pertinentes. Nous en utilisons très peu.",
      examples: ["Campagnes publicitaires", "Retargeting"],
      duration: "90 jours",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white px-6 md:px-12 lg:px-16 py-12">
      {/* SEO Component */}
      <SEO {...seoConfigs.cookies} />
      
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[#D4FF00]/10 rounded-xl">
            <Cookie className="w-8 h-8 text-[#D4FF00]" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">Politique des Cookies</h1>
            <p className="text-white/50">Dernière mise à jour : {lastUpdate}</p>
          </div>
        </div>

        {/* TL;DR Box */}
        <div className="bg-[#D4FF00]/10 border border-[#D4FF00]/20 rounded-2xl p-6 mb-8">
          <h2 className="font-semibold text-[#D4FF00] mb-2">🍪 En résumé</h2>
          <ul className="text-white/80 space-y-1 text-sm">
            <li>• Nous utilisons des cookies pour que le site fonctionne et pour l'améliorer</li>
            <li>• Seuls les cookies essentiels sont obligatoires</li>
            <li>• Vous pouvez gérer vos préférences à tout moment</li>
            <li>• Nous ne vendons jamais vos données à des tiers</li>
          </ul>
        </div>
        
        <div className="space-y-8 text-white/70 leading-relaxed">
          {/* Section 1 */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-5 h-5 text-[#D4FF00]" />
              <h2 className="text-xl font-semibold text-white">1. Qu'est-ce qu'un cookie ?</h2>
            </div>
            <p className="mb-3">
              Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, smartphone, tablette) 
              lorsque vous visitez un site web. Il permet au site de mémoriser certaines informations 
              pour améliorer votre expérience.
            </p>
            <p className="text-sm text-white/50">
              Les cookies ne peuvent pas contenir de virus et ne permettent pas d'accéder à votre appareil.
            </p>
          </section>
          
          {/* Section 2 - Types de cookies */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Types de cookies utilisés</h2>
            <div className="space-y-4">
              {cookieTypes.map((cookie, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${cookie.required ? 'bg-[#D4FF00]/20' : 'bg-white/10'}`}>
                      <cookie.icon className={`w-5 h-5 ${cookie.required ? 'text-[#D4FF00]' : 'text-white/60'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white">{cookie.name}</h3>
                        {cookie.required && (
                          <span className="text-xs bg-[#D4FF00]/20 text-[#D4FF00] px-2 py-0.5 rounded">
                            Requis
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/60 mb-3">{cookie.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-white/40">Exemples :</span>
                          <ul className="text-white/50 mt-1">
                            {cookie.examples.map((ex, i) => (
                              <li key={i}>• {ex}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-white/40">Durée :</span>
                          <p className="text-white/50 mt-1">{cookie.duration}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Section 3 */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-5 h-5 text-[#D4FF00]" />
              <h2 className="text-xl font-semibold text-white">3. Gérer vos préférences</h2>
            </div>
            <div className="space-y-4">
              <p>Vous avez plusieurs options pour contrôler les cookies :</p>
              
              <div className="bg-[#D4FF00]/10 rounded-xl p-4">
                <h4 className="font-medium text-white mb-2">Sur Aurion Studio</h4>
                <p className="text-sm text-white/60">
                  Cliquez sur le bouton "Gérer les cookies" en bas de page ou dans vos paramètres de compte 
                  pour modifier vos préférences à tout moment.
                </p>
                <button className="mt-3 px-4 py-2 bg-[#D4FF00] text-black text-sm font-medium rounded-lg hover:bg-[#E5FF4D] transition-colors">
                  Gérer mes cookies
                </button>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="font-medium text-white mb-2">Via votre navigateur</h4>
                <p className="text-sm text-white/60 mb-3">
                  La plupart des navigateurs permettent de bloquer ou supprimer les cookies :
                </p>
                <ul className="text-sm text-white/50 space-y-1">
                  <li>• <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-[#D4FF00] hover:underline">Chrome</a></li>
                  <li>• <a href="https://support.mozilla.org/fr/kb/protection-renforcee-contre-pistage-firefox-ordinateur" target="_blank" rel="noopener noreferrer" className="text-[#D4FF00] hover:underline">Firefox</a></li>
                  <li>• <a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[#D4FF00] hover:underline">Safari</a></li>
                  <li>• <a href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-[#D4FF00] hover:underline">Edge</a></li>
                </ul>
              </div>
              
              <p className="text-sm text-white/40">
                ⚠️ Note : Bloquer les cookies essentiels peut empêcher certaines fonctionnalités de marcher correctement.
              </p>
            </div>
          </section>
          
          {/* Section 4 */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">4. Services tiers utilisés</h2>
            <p className="mb-4">Nous utilisons les services suivants qui peuvent déposer des cookies :</p>
            <div className="grid gap-3">
              {[
                { name: "Clerk", purpose: "Authentification", policy: "https://clerk.com/privacy" },
                { name: "Stripe", purpose: "Paiements", policy: "https://stripe.com/fr/privacy" },
                { name: "Supabase", purpose: "Base de données", policy: "https://supabase.com/privacy" },
                { name: "Cloudflare", purpose: "CDN & Sécurité", policy: "https://www.cloudflare.com/privacypolicy/" },
              ].map((service, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3">
                  <div>
                    <span className="font-medium text-white">{service.name}</span>
                    <span className="text-white/40 text-sm ml-2">— {service.purpose}</span>
                  </div>
                  <a href={service.policy} target="_blank" rel="noopener noreferrer" className="text-xs text-[#D4FF00] hover:underline">
                    Politique
                  </a>
                </div>
              ))}
            </div>
          </section>
          
          {/* Section 5 */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">5. Durée de conservation</h2>
            <ul className="space-y-2">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#D4FF00] rounded-full" />
                <span><strong className="text-white">Cookies de session</strong> — Supprimés à la fermeture du navigateur</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#D4FF00] rounded-full" />
                <span><strong className="text-white">Cookies persistants</strong> — Conservés selon leur durée (13 mois max pour les analytics)</span>
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section className="bg-[#D4FF00]/10 border border-[#D4FF00]/20 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Questions ?</h2>
            <p>
              Pour toute question sur notre utilisation des cookies, contactez-nous :
            </p>
            <p className="mt-2">
              📧 <a href="mailto:privacy@aurion.studio" className="text-[#D4FF00] hover:underline">privacy@aurion.studio</a>
            </p>
          </section>

          {/* Footer */}
          <div className="text-center text-sm text-white/40 pt-8 border-t border-white/10">
            <p>
              <Link to="/privacy" className="hover:text-white">Confidentialité</Link>
              {" • "}
              <Link to="/terms" className="hover:text-white">CGU</Link>
              {" • "}
              <Link to="/legal" className="hover:text-white">Mentions légales</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cookies;
