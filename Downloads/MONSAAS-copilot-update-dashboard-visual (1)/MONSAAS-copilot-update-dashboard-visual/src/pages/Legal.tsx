/**
 * Legal Page - Aurion Studio
 * 
 * SEO: Mentions légales Aurion Studio, informations légales SaaS
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Building2, User, Server, Shield, Scale } from "lucide-react";
import { SEO, seoConfigs } from "@/components/common/SEO";

const Legal = () => {
  return (
    <div className="min-h-screen bg-black text-white px-6 md:px-12 lg:px-16 py-12">
      {/* SEO Component */}
      <SEO {...seoConfigs.legal} />
      
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-[#D4FF00]/10 rounded-xl">
            <Scale className="w-8 h-8 text-[#D4FF00]" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">Mentions Légales</h1>
            <p className="text-white/50">Informations réglementaires</p>
          </div>
        </div>
        
        <div className="space-y-8 text-white/70 leading-relaxed">
          {/* Éditeur */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-5 h-5 text-[#D4FF00]" />
              <h2 className="text-xl font-semibold text-white">1. Éditeur du site</h2>
            </div>
            <div className="pl-8 space-y-2">
              <p><strong className="text-white">Aurion Studio SAS</strong></p>
              <p>Société par actions simplifiée au capital de 10 000€</p>
              <p>RCS Paris B 123 456 789</p>
              <p>Siège social : 123 Avenue des Champs-Élysées, 75008 Paris, France</p>
              <p>N° TVA : FR12 345 678 901</p>
              <p>Email : <a href="mailto:legal@aurion.studio" className="text-[#D4FF00] hover:underline">legal@aurion.studio</a></p>
            </div>
          </section>
          
          {/* Directeur */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-[#D4FF00]" />
              <h2 className="text-xl font-semibold text-white">2. Directeur de la publication</h2>
            </div>
            <div className="pl-8">
              <p><strong className="text-white">Marie Laurent</strong>, Présidente</p>
              <p>Contact : <a href="mailto:direction@aurion.studio" className="text-[#D4FF00] hover:underline">direction@aurion.studio</a></p>
            </div>
          </section>
          
          {/* Hébergeur */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Server className="w-5 h-5 text-[#D4FF00]" />
              <h2 className="text-xl font-semibold text-white">3. Hébergement</h2>
            </div>
            <div className="pl-8 space-y-2">
              <p><strong className="text-white">Cloudflare, Inc.</strong></p>
              <p>101 Townsend St, San Francisco, CA 94107, USA</p>
              <p>Site web : <a href="https://www.cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-[#D4FF00] hover:underline">www.cloudflare.com</a></p>
              <p className="text-sm text-white/50 mt-2">
                Données utilisateurs hébergées sur Supabase (infrastructure AWS, région EU-West-1 - Irlande).
              </p>
            </div>
          </section>
          
          {/* Propriété intellectuelle */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-[#D4FF00]" />
              <h2 className="text-xl font-semibold text-white">4. Propriété intellectuelle</h2>
            </div>
            <div className="pl-8 space-y-3">
              <p>
                L'ensemble du contenu du site aurion.studio (textes, images, vidéos, logos, 
                icônes, sons, logiciels, bases de données) est protégé par le droit d'auteur 
                et la propriété intellectuelle, en France et à l'international.
              </p>
              <p>
                La marque <strong className="text-white">Aurion®</strong> et le logo associé sont des marques 
                déposées. Toute reproduction, représentation, modification ou exploitation 
                non expressément autorisée est strictement interdite.
              </p>
              <p className="text-sm text-white/50">
                Pour toute demande de licence ou partenariat : <a href="mailto:partnership@aurion.studio" className="text-[#D4FF00] hover:underline">partnership@aurion.studio</a>
              </p>
            </div>
          </section>
          
          {/* Données personnelles */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">5. Données personnelles & RGPD</h2>
            <div className="space-y-3">
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD) et à la 
                Loi Informatique et Libertés, vous disposez des droits suivants sur vos données :
              </p>
              <ul className="list-disc list-inside space-y-1 text-white/60">
                <li>Droit d'accès et de rectification</li>
                <li>Droit à l'effacement ("droit à l'oubli")</li>
                <li>Droit à la portabilité</li>
                <li>Droit d'opposition et de limitation</li>
              </ul>
              <p>
                Pour exercer ces droits : <a href="mailto:dpo@aurion.studio" className="text-[#D4FF00] hover:underline">dpo@aurion.studio</a>
              </p>
              <p className="mt-4">
                <Link to="/privacy" className="inline-flex items-center gap-2 text-[#D4FF00] hover:underline">
                  Consulter notre Politique de Confidentialité complète →
                </Link>
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center text-sm text-white/40 pt-8 border-t border-white/10">
            <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="mt-2">
              <Link to="/terms" className="hover:text-white">CGU</Link>
              {" • "}
              <Link to="/privacy" className="hover:text-white">Confidentialité</Link>
              {" • "}
              <Link to="/cookies" className="hover:text-white">Cookies</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;
