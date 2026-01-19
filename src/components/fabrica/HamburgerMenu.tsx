import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const menuItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Menu Button - Fixed position on left */}
      <div className="fixed left-6 md:left-12 lg:left-16 top-1/2 -translate-y-1/2 z-[60]">
        <button
          onClick={toggleMenu}
          className="flex items-center gap-3 group"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {/* Hamburger / X icon */}
          <div className="relative w-6 h-5 flex flex-col justify-center items-center">
            {/* Top line */}
            <motion.span
              animate={{
                rotate: isOpen ? 45 : 0,
                y: isOpen ? 0 : -4,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute w-6 h-[2px] bg-white origin-center"
            />
            {/* Bottom line */}
            <motion.span
              animate={{
                rotate: isOpen ? -45 : 0,
                y: isOpen ? 0 : 4,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute w-6 h-[2px] bg-white origin-center"
            />
          </div>

          {/* MENU text */}
          <motion.span
            className="text-white text-sm font-bold tracking-wider font-body uppercase"
            animate={{ opacity: isOpen ? 0 : 1 }}
            transition={{ duration: 0.2 }}
          >
            MENU
          </motion.span>
        </button>
      </div>

      {/* Full screen menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[55] bg-black/95 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            {/* Menu content */}
            <motion.nav
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="absolute right-6 md:right-12 lg:right-16 top-1/2 -translate-y-1/2 text-right"
              onClick={(e) => e.stopPropagation()}
            >
              <ul className="space-y-2">
                {menuItems.map((item, index) => (
                  <motion.li
                    key={item.name}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                  >
                    <Link
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className="text-white text-xl md:text-2xl font-bold font-body hover:text-white/70 transition-colors duration-200 inline-block"
                    >
                      {item.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HamburgerMenu;
