import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth, SignInButton, UserButton } from "@clerk/clerk-react";
import { isAuthConfigured } from "@/lib/env";

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

const Navigation = () => {
  // Get auth state with proper handling
  const authConfigured = isAuthConfigured();

  // Only use Clerk hooks when auth is configured
  const clerkAuth = authConfigured ? useAuth() : null;
  const isSignedIn = clerkAuth?.isSignedIn ?? false;
  const isLoaded = clerkAuth?.isLoaded ?? true;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0 }}
      className="fixed top-0 left-0 right-0 z-50 h-16 md:h-20 flex items-center justify-between px-6 md:px-12 lg:px-16"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <Link 
        to="/" 
        className="text-white text-base md:text-lg font-medium tracking-tight font-body"
        aria-label="aurion® - Home"
      >
        aurion<span className="text-[10px] md:text-xs align-super">®</span>
      </Link>

      {/* Desktop Navigation - Centered */}
      <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 gap-12 lg:gap-16">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
          >
            <motion.span
              className="text-white text-sm lg:text-base font-normal relative group font-body inline-block"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white group-hover:w-full transition-all duration-300" />
            </motion.span>
          </Link>
        ))}
      </div>

      {/* CTA Button */}
      <div className="flex items-center gap-4">
        {isLoaded ? (
          isSignedIn ? (
            <>
              <Link to="/dashboard">
                <motion.span
                  className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium font-body hover:bg-white/90 transition-colors z-50 inline-block"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Mon tableau de bord
                </motion.span>
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 ring-2 ring-white/20",
                  }
                }}
              />
            </>
          ) : (
            <SignInButton mode="modal">
              <motion.button
                className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium font-body hover:bg-white/90 transition-colors z-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Accéder à mon espace
              </motion.button>
            </SignInButton>
          )
        ) : (
          <Link to="/dashboard">
            <motion.span
              className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium font-body hover:bg-white/90 transition-colors z-50 inline-block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Accéder à mon espace
            </motion.span>
          </Link>
        )}
      </div>
    </motion.nav>
  );
};

export default Navigation;
