/**
 * About Page - Aurion Studio
 * 
 * SEO Keywords: plateforme SaaS, développement web, intelligence artificielle,
 * outils de productivité, automatisation workflow, équipe tech
 * 
 * Page optimisée pour la conversion avec storytelling et preuve sociale.
 */

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, Target, Zap, Globe, Award, TrendingUp, Shield, Clock } from "lucide-react";
import LavaLampBackground from "@/components/fabrica/LavaLampBackground";
import { SEO, seoConfigs } from "@/components/common/SEO";

const teamMembers = [
  {
    name: "Marie Laurent",
    role: "CEO & Co-fondatrice",
    expertise: "10+ ans en tech & stratégie produit",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
  },
  {
    name: "Thomas Dubois",
    role: "CTO & Co-fondateur",
    expertise: "Ex-Google, expert IA & scalabilité",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  },
  {
    name: "Sophie Martin",
    role: "Head of Design",
    expertise: "Ex-Figma, spécialiste UX/UI",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
  },
  {
    name: "Lucas Bernard",
    role: "Lead Engineer",
    expertise: "Full-stack, architecture cloud",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
  },
];

const values = [
  {
    icon: Target,
    title: "Résultats Mesurables",
    description: "Chaque fonctionnalité est conçue pour améliorer vos KPIs. Nos utilisateurs gagnent en moyenne 15h/semaine.",
    stat: "+15h",
    statLabel: "gagnées/semaine",
  },
  {
    icon: Zap,
    title: "Innovation Continue",
    description: "Nouvelles fonctionnalités IA chaque mois. Restez à la pointe sans effort avec nos mises à jour automatiques.",
    stat: "48+",
    statLabel: "nouvelles fonctionnalités/an",
  },
  {
    icon: Shield,
    title: "Sécurité Enterprise",
    description: "Chiffrement AES-256, conformité RGPD/SOC2, et audit de sécurité continu pour protéger vos données.",
    stat: "99.9%",
    statLabel: "uptime garanti",
  },
  {
    icon: Users,
    title: "Support Humain",
    description: "Une équipe dédiée qui répond en moins de 2h. Pas de bots, que des experts qui comprennent vos enjeux.",
    stat: "<2h",
    statLabel: "temps de réponse",
  },
];

const milestones = [
  { year: "2023", event: "Lancement d'Aurion Studio", description: "Première version avec 5 outils intégrés" },
  { year: "2024", event: "10 000 utilisateurs", description: "Croissance 300% en 6 mois" },
  { year: "2025", event: "Série A - 5M€", description: "Pour accélérer l'innovation IA" },
  { year: "2026", event: "50 000+ utilisateurs", description: "Leader européen des outils SaaS" },
];

const About = () => {
  return (
    <div className="relative min-h-screen bg-black text-white font-body">
      {/* SEO Component */}
      <SEO {...seoConfigs.about} />
      
      <LavaLampBackground />
      
      {/* SEO Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Aurion Studio",
        "description": "Plateforme SaaS tout-en-un pour développeurs et équipes : Code Editor, App Builder, Agent IA, Chat et Text Editor.",
        "url": "https://aurion.studio",
        "foundingDate": "2023",
        "founders": [{ "@type": "Person", "name": "Marie Laurent" }, { "@type": "Person", "name": "Thomas Dubois" }]
      })}} />
      
      <div className="relative z-10 px-6 md:px-12 lg:px-16 py-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </motion.div>

          {/* Hero Section - Conversion optimisée */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-[#D4FF00]/10 text-[#D4FF00] text-sm font-medium rounded-full mb-6">
              🚀 +50 000 développeurs nous font confiance
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
              On construit le futur du <span className="text-[#D4FF00]">développement</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/70 max-w-3xl leading-relaxed">
              Aurion Studio réunit <strong className="text-white">5 outils essentiels</strong> en une seule plateforme, 
              propulsée par l'IA. Fini les 10 abonnements différents. Fini la perte de temps entre les apps.
            </p>
          </motion.div>

          {/* Proof Section - Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20"
          >
            {[
              { value: "50K+", label: "Utilisateurs actifs" },
              { value: "4.9/5", label: "Note moyenne" },
              { value: "150+", label: "Pays" },
              { value: "99.9%", label: "Uptime" },
            ].map((stat, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#D4FF00] mb-1">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Mission - Storytelling avec bénéfices */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-display font-bold mb-6">Pourquoi Aurion existe</h2>
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 md:p-12">
              <p className="text-lg text-white/80 leading-relaxed mb-6">
                <span className="text-2xl">❌</span> <strong className="text-white">Le problème :</strong> En tant que développeurs, 
                on passait 30% de notre temps à jongler entre les outils. Un éditeur ici, un builder là, 
                un assistant IA ailleurs. C'était frustrant et coûteux.
              </p>
              <p className="text-lg text-white/80 leading-relaxed mb-6">
                <span className="text-2xl">💡</span> <strong className="text-white">Notre solution :</strong> On a créé 
                la plateforme qu'on aurait aimé avoir. Tous les outils dont un développeur a besoin, 
                <strong className="text-[#D4FF00]"> synchronisés</strong>, <strong className="text-[#D4FF00]">interconnectés</strong>, 
                et <strong className="text-[#D4FF00]">boostés par l'IA</strong>.
              </p>
              <p className="text-lg text-white/80 leading-relaxed">
                <span className="text-2xl">🎯</span> <strong className="text-white">Le résultat :</strong> Nos utilisateurs 
                livrent leurs projets <strong className="text-[#D4FF00]">2x plus vite</strong> tout en 
                réduisant leurs coûts d'outillage de <strong className="text-[#D4FF00]">60%</strong>.
              </p>
            </div>
          </motion.div>

          {/* Values - Avec données concrètes */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-display font-bold mb-4">Ce qui nous différencie</h2>
            <p className="text-white/60 mb-8 max-w-2xl">
              Des valeurs concrètes, pas du marketing creux. Voici ce qui compte vraiment pour nous — et nos utilisateurs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] hover:border-[#D4FF00]/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-[#D4FF00]/10 rounded-xl w-fit group-hover:bg-[#D4FF00]/20 transition-colors">
                      <value.icon className="w-6 h-6 text-[#D4FF00]" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#D4FF00]">{value.stat}</div>
                      <div className="text-xs text-white/40">{value.statLabel}</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-white/60">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Timeline - Notre histoire */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-display font-bold mb-8">Notre parcours</h2>
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-6 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-colors"
                >
                  <div className="text-2xl font-bold text-[#D4FF00] min-w-[60px]">{milestone.year}</div>
                  <div>
                    <h4 className="font-semibold text-white">{milestone.event}</h4>
                    <p className="text-sm text-white/60">{milestone.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Team - Crédibilité */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-display font-bold mb-4">L'équipe derrière Aurion</h2>
            <p className="text-white/60 mb-8 max-w-2xl">
              Des experts passionnés avec un objectif commun : rendre le développement plus simple et plus rapide.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="group"
                >
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/[0.07] hover:border-[#D4FF00]/30 transition-all">
                    <div className="aspect-square rounded-xl overflow-hidden mb-4">
                      <img
                        src={member.image}
                        alt={`${member.name} - ${member.role} chez Aurion Studio`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-semibold text-white">{member.name}</h3>
                    <p className="text-sm text-[#D4FF00]">{member.role}</p>
                    <p className="text-xs text-white/40 mt-1">{member.expertise}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section - Conversion finale */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-gradient-to-br from-[#D4FF00]/10 to-transparent border border-[#D4FF00]/20 rounded-3xl p-8 md:p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Prêt à rejoindre l'aventure ?
            </h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              Rejoignez les 50 000+ développeurs qui ont déjà transformé leur façon de travailler. 
              Essai gratuit, sans carte bancaire.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/sign-up"
                className="px-8 py-4 bg-[#D4FF00] text-black font-semibold rounded-xl hover:bg-[#E5FF4D] transition-colors"
              >
                Commencer Gratuitement →
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors border border-white/20"
              >
                Voir les Tarifs
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
