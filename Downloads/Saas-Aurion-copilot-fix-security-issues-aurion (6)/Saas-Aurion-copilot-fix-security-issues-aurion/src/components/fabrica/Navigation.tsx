import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useClerkSafe } from "@/hooks/use-clerk-safe";

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

const Navigation = () => {
  const { openSignIn, openSignUp, isSignedIn } = useClerkSafe();

  const handleGetStarted = () => {
    if (isSignedIn) {
      alert('🎯 Dashboard - Fonctionnalité complète bientôt disponible !');
      console.log('Redirection vers dashboard...');
    } else {
      alert('🚀 Inscription AURION\n\nCréez votre compte pour accéder à tous les outils IA :\n• Code Editor avec IA\n• Génération d\'images\n• Assistant d\'écriture\n• Créateur d\'apps\n• Agents automatisés\n\nRejoignez la révolution de la création assistée !');
      openSignUp();
    }
  };

  const handleSignIn = () => {
    alert('🔐 Connexion AURION\n\nConnectez-vous pour reprendre où vous en étiez avec vos projets IA !');
    openSignIn();
  };

  const handleNavClick = (name: string, href: string) => {
    const messages = {
      Home: '🏠 Retour à l\'accueil AURION',
      About: '📖 Découvrez l\'histoire et la mission d\'AURION',
      Blog: '📝 Actualités, tutoriels et insights sur l\'IA',
      Contact: '💬 Contactez notre équipe pour vos questions'
    };

    alert(`${messages[name as keyof typeof messages]}\n\nRedirection vers: ${href}`);
    console.log(`Navigation: ${name} -> ${href}`);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0 }}
      className="fixed top-0 left-0 right-0 z-50 h-16 md:h-20 flex items-center justify-between px-6 md:px-12 lg:px-16"
    >
      {/* Logo */}
      <button
        onClick={() => {
          alert('🏠 AURION Studio\n\nBienvenue sur la plateforme de création assistée par IA !\n\nDécouvrez nos outils :\n• Code Editor IA\n• Canvas Intelligent\n• Text Editor\n• App Builder\n• Agent AI');
          console.log('Logo clicked - Home');
        }}
        className="text-white text-base md:text-lg font-medium tracking-tight font-body bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity"
      >
        aurion<span className="text-[10px] md:text-xs align-super">®</span>
      </button>

      {/* Desktop Navigation - Centered */}
      <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 gap-12 lg:gap-16">
        {navItems.map((item) => (
          <motion.div
            key={item.name}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => handleNavClick(item.name, item.href)}
              className="text-white text-sm lg:text-base font-normal relative group font-body bg-transparent border-none cursor-pointer"
            >
              {item.name}
              {item.superscript && (
                <span className="text-[10px] align-super ml-0.5 text-white/50">
                  {item.superscript}
                </span>
              )}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white group-hover:w-full transition-all duration-300" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center gap-3">
        {!isSignedIn && (
          <>
            <motion.button
              onClick={openSignIn}
              className="text-white text-sm font-medium font-body hover:text-white/80 transition-colors z-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Connexion
            </motion.button>
            <div className="w-px h-4 bg-white/30"></div>
          </>
        )}
        <motion.button
          onClick={handleGetStarted}
          className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium font-body hover:bg-white/90 transition-colors z-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isSignedIn ? 'Dashboard' : 'Commencer'}
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default Navigation;