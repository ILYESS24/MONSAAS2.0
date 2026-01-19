import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { isAuthConfigured } from "@/lib/env";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

interface NavigationProps {
  variant?: "dark" | "light";
}

// Default button when auth is not configured - Always dark mode style
const DefaultAuthButton = ({ 
  isMobile, 
  onClose 
}: { 
  isMobile: boolean; 
  onClose?: () => void;
}) => {
  const buttonClass = isMobile 
    ? "bg-white text-black px-6 py-3 rounded-full text-base font-medium font-body"
    : "px-4 py-2 rounded-full text-sm font-medium font-body transition-colors z-50 bg-white text-black hover:bg-white/90";

  return (
    <Link to="/dashboard" onClick={onClose}>
      <motion.span
        className={buttonClass + (isMobile ? "" : " inline-block")}
        whileHover={!isMobile ? { scale: 1.05 } : undefined}
        whileTap={!isMobile ? { scale: 0.95 } : undefined}
      >
        Accéder à mon espace
      </motion.span>
    </Link>
  );
};

const Navigation = ({ variant = "dark" }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Check if auth is configured
  const authConfigured = isAuthConfigured();

  // Track scroll for background change
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Always use dark mode colors - white text on dark background
  const textColor = "text-white";
  const bgColor = scrolled ? "bg-black/90 backdrop-blur-lg shadow-sm" : "bg-transparent";

  // Render auth button - always use default when auth not configured
  const renderAuthButton = (isMobile = false) => {
    // For now, always render the default button since Clerk is not configured
    // When Clerk is properly set up, this can be enhanced to use Clerk components
    return (
      <DefaultAuthButton 
        isMobile={isMobile} 
        onClose={isMobile ? () => setIsMenuOpen(false) : undefined}
      />
    );
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 h-16 md:h-20 flex items-center justify-between px-6 md:px-12 lg:px-16 transition-all duration-500 ${bgColor}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Left side - Logo + Navigation */}
        <div className="flex items-center gap-8 lg:gap-12">
          {/* Logo */}
          <Link 
            to="/" 
            className={`text-base md:text-lg font-medium tracking-tight font-body transition-colors ${textColor}`}
            aria-label="aurion® - Home"
          >
            aurion<span className="text-[10px] md:text-xs align-super">®</span>
          </Link>

          {/* Desktop Navigation - Left aligned */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            {navItems.map((item, index) => (
              <Link
                key={item.name}
                to={item.href}
              >
                <motion.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                  className={`text-sm lg:text-base font-normal relative group font-body inline-block transition-colors ${textColor}`}
                  whileHover={{ y: -2 }}
                >
                  {item.name}
                  <motion.span 
                    className="absolute -bottom-1 left-0 h-[1px] bg-white"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right side - CTA + Mobile Menu */}
        <div className="flex items-center gap-4">
          {/* Desktop CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            {renderAuthButton(false)}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className={`md:hidden p-2 ${textColor}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl md:hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col items-center justify-center h-full gap-8"
            >
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 + index * 0.05 }}
                >
                  <Link
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white text-3xl font-display font-bold hover:text-white/70 transition-colors"
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.35 }}
                className="mt-8"
              >
                {renderAuthButton(true)}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
