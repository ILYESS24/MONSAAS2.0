import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Footer = () => {
  const handleFooterClick = (name: string, route: string) => {
    const messages = {
      privacy: '🔒 Politique de Confidentialité\n\nChez AURION, votre vie privée est notre priorité absolue.\n\nNous nous engageons à :\n• Ne jamais vendre vos données\n• Utiliser uniquement pour améliorer nos services\n• Sécuriser toutes vos informations\n• Respecter le RGPD',
      terms: '📋 Conditions d\'Utilisation\n\nDécouvrez nos règles pour une expérience optimale :\n• Utilisation responsable de l\'IA\n• Respect des droits d\'auteur\n• Conditions d\'abonnement\n• Support et assistance',
      cookies: '🍪 Politique des Cookies\n\nNous utilisons des cookies pour :\n• Améliorer votre expérience\n• Analyser l\'usage de nos services\n• Personnaliser le contenu\n• Sécuriser vos connexions',
      legal: '⚖️ Mentions Légales\n\nInformations légales sur AURION :\n• Société et siège social\n• Contact et support\n• Numéros d\'immatriculation\n• Conditions générales'
    };

    alert(`${messages[name as keyof typeof messages]}\n\nRedirection vers: ${route}`);
    console.log(`Footer: ${name} -> ${route}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
      className="flex flex-wrap items-center gap-3 md:gap-4 text-white/40 text-[10px] md:text-xs font-body"
    >
      <button
        onClick={() => handleFooterClick('privacy', '/privacy')}
        className="hover:text-white/60 transition-colors bg-transparent border-none cursor-pointer"
      >
        Confidentialité
      </button>
      <span className="text-white/20">|</span>
      <button
        onClick={() => handleFooterClick('terms', '/terms')}
        className="hover:text-white/60 transition-colors bg-transparent border-none cursor-pointer"
      >
        Conditions d'utilisation
      </button>
      <span className="text-white/20">|</span>
      <button
        onClick={() => handleFooterClick('cookies', '/cookies')}
        className="hover:text-white/60 transition-colors bg-transparent border-none cursor-pointer"
      >
        Politique des cookies
      </button>
      <span className="text-white/20">|</span>
      <button
        onClick={() => handleFooterClick('legal', '/legal')}
        className="hover:text-white/60 transition-colors bg-transparent border-none cursor-pointer"
      >
        Mentions légales
      </button>
    </motion.div>
  );
};

export default Footer;