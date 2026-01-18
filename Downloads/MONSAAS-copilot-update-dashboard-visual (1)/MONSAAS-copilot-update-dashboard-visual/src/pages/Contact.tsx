/**
 * Contact Page - Aurion Studio
 * 
 * SEO Keywords: contact Aurion Studio, support technique, demande démo,
 * assistance développement, partenariat SaaS
 * 
 * Optimisé pour la conversion avec formulaire simplifié et réponse rapide.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, MapPin, Phone, Send, CheckCircle, MessageCircle, Clock, Zap, HeadphonesIcon } from "lucide-react";
import LavaLampBackground from "@/components/fabrica/LavaLampBackground";
import { SEO, seoConfigs } from "@/components/common/SEO";

const contactReasons = [
  { value: "", label: "Comment pouvons-nous vous aider ?" },
  { value: "demo", label: "🎯 Je veux une démo personnalisée" },
  { value: "enterprise", label: "🏢 Offre Enterprise / Sur-mesure" },
  { value: "partnership", label: "🤝 Opportunité de partenariat" },
  { value: "support", label: "🔧 Support technique" },
  { value: "feedback", label: "💡 Feedback / Suggestion" },
  { value: "other", label: "📝 Autre demande" },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
    setFormData({ name: "", email: "", company: "", subject: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="relative min-h-screen bg-black text-white font-body">
      {/* SEO Component */}
      <SEO {...seoConfigs.contact} />
      
      <LavaLampBackground />
      
      {/* SEO Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "Contact Aurion Studio",
        "description": "Contactez l'équipe Aurion Studio pour une démo, du support technique ou des questions commerciales.",
        "url": "https://aurion.studio/contact"
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

          {/* Header - Conversion optimisée */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-[#D4FF00]/10 text-[#D4FF00] text-sm font-medium rounded-full mb-6">
              💬 Réponse garantie sous 2h
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
              Parlons de votre <span className="text-[#D4FF00]">projet</span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl">
              Une question ? Besoin d'une démo personnalisée ? Notre équipe est là pour vous aider 
              à <strong className="text-white">tirer le maximum d'Aurion Studio</strong>.
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="grid grid-cols-3 gap-4 mb-12"
          >
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <Clock className="w-5 h-5 text-[#D4FF00] mx-auto mb-2" />
              <div className="text-sm font-medium">Temps de réponse</div>
              <div className="text-lg font-bold text-[#D4FF00]">&lt; 2h</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <Zap className="w-5 h-5 text-[#D4FF00] mx-auto mb-2" />
              <div className="text-sm font-medium">Taux satisfaction</div>
              <div className="text-lg font-bold text-[#D4FF00]">98%</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <HeadphonesIcon className="w-5 h-5 text-[#D4FF00] mx-auto mb-2" />
              <div className="text-sm font-medium">Support</div>
              <div className="text-lg font-bold text-[#D4FF00]">24/7</div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <h2 className="text-2xl font-semibold mb-2">Envoyez-nous un message</h2>
                <p className="text-white/50 text-sm mb-6">
                  Remplissez le formulaire et nous vous recontactons rapidement.
                </p>
                
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="p-4 bg-[#D4FF00]/20 rounded-full mb-4">
                      <CheckCircle className="w-12 h-12 text-[#D4FF00]" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Message envoyé ! 🎉</h3>
                    <p className="text-white/60">
                      Notre équipe vous répondra dans les 2 prochaines heures.<br />
                      Vérifiez aussi vos spams, au cas où !
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-2">Prénom & Nom *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4FF00]/50 transition-colors"
                          placeholder="Jean Dupont"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-2">Entreprise</label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4FF00]/50 transition-colors"
                          placeholder="Votre entreprise"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Email professionnel *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4FF00]/50 transition-colors"
                        placeholder="jean@entreprise.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Sujet *</label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4FF00]/50 transition-colors"
                      >
                        {contactReasons.map((reason) => (
                          <option key={reason.value} value={reason.value} className="bg-neutral-900">
                            {reason.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Votre message *</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4FF00]/50 transition-colors resize-none"
                        placeholder="Décrivez brièvement votre besoin ou votre question..."
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full bg-[#D4FF00] text-black py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#E5FF4D] transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Envoyer mon message
                    </motion.button>
                    <p className="text-xs text-white/40 text-center">
                      En soumettant ce formulaire, vous acceptez notre{" "}
                      <Link to="/privacy" className="text-[#D4FF00] hover:underline">politique de confidentialité</Link>.
                    </p>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-6"
            >
              {/* Quick Contact Options */}
              <div className="bg-gradient-to-br from-[#D4FF00]/10 to-transparent border border-[#D4FF00]/20 rounded-2xl p-6">
                <h3 className="font-semibold text-lg mb-4">⚡ Besoin d'une réponse rapide ?</h3>
                <p className="text-white/60 text-sm mb-4">
                  Pour les urgences ou questions simples, utilisez notre chat en direct.
                </p>
                <button className="w-full bg-[#D4FF00] text-black py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#E5FF4D] transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  Ouvrir le Chat en Direct
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#D4FF00]/10 rounded-xl">
                    <Mail className="w-6 h-6 text-[#D4FF00]" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-white/60">contact@aurion.studio</p>
                    <p className="text-white/60">support@aurion.studio</p>
                    <p className="text-xs text-white/40 mt-1">Réponse sous 2h en semaine</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#D4FF00]/10 rounded-xl">
                    <Phone className="w-6 h-6 text-[#D4FF00]" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Téléphone</h3>
                    <p className="text-white/60">+33 1 23 45 67 89</p>
                    <p className="text-xs text-white/40 mt-1">Lun-Ven, 9h-18h (heure de Paris)</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#D4FF00]/10 rounded-xl">
                    <MapPin className="w-6 h-6 text-[#D4FF00]" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Bureau</h3>
                    <p className="text-white/60">123 Avenue des Champs-Élysées</p>
                    <p className="text-white/60">75008 Paris, France</p>
                    <p className="text-xs text-white/40 mt-1">Sur rendez-vous uniquement</p>
                  </div>
                </div>
              </div>

              {/* FAQ Link */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-semibold mb-2">📚 Consultez notre FAQ</h3>
                <p className="text-white/60 text-sm mb-4">
                  80% des questions trouvent leur réponse dans notre centre d'aide.
                </p>
                <Link to="/contact" className="text-[#D4FF00] text-sm font-medium hover:underline">
                  Voir la FAQ →
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
