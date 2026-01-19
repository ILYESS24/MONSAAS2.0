import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Start the split animation after a short delay
    const timer = setTimeout(() => {
      setIsAnimating(false);
      // Call onComplete after the split animation finishes
      setTimeout(onComplete, 1000);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isAnimating && (
        <>
          {/* Top half */}
          <motion.div
            className="fixed inset-0 z-[200] bg-black flex items-end justify-center overflow-hidden"
            initial={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            style={{ clipPath: "inset(0 0 50% 0)" }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display font-extrabold text-white text-[60px] sm:text-[100px] md:text-[140px] lg:text-[180px] xl:text-[200px] tracking-[-0.02em] leading-none"
              style={{ transform: "translateY(50%)" }}
            >
              aurion
            </motion.h1>
          </motion.div>

          {/* Bottom half */}
          <motion.div
            className="fixed inset-0 z-[200] bg-black flex items-start justify-center overflow-hidden"
            initial={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            style={{ clipPath: "inset(50% 0 0 0)" }}
          >
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display font-extrabold text-white text-[60px] sm:text-[100px] md:text-[140px] lg:text-[180px] xl:text-[200px] tracking-[-0.02em] leading-none"
              style={{ transform: "translateY(-50%)" }}
            >
              aurion
            </motion.h1>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default IntroAnimation;
