import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IntroSplashProps {
  onComplete: () => void;
}

const IntroSplash = ({ onComplete }: IntroSplashProps) => {
  const [showSplash, setShowSplash] = useState(true);
  const [startSplit, setStartSplit] = useState(false);

  useEffect(() => {
    // Start split animation after 1.5 seconds
    const splitTimer = setTimeout(() => {
      setStartSplit(true);
    }, 1500);

    // Complete animation and hide splash
    const completeTimer = setTimeout(() => {
      setShowSplash(false);
      onComplete();
    }, 2300); // 1.5s display + 0.8s split animation

    return () => {
      clearTimeout(splitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {showSplash && (
        <div className="fixed inset-0 z-[9999] overflow-hidden">
          {/* Top Half */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: startSplit ? "-100%" : 0 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="absolute top-0 left-0 right-0 h-1/2 bg-black flex items-end justify-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-0 overflow-hidden"
            >
              <span className="text-white text-3xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight">
                AURION
              </span>
            </motion.div>
          </motion.div>

          {/* Bottom Half */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: startSplit ? "100%" : 0 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="absolute bottom-0 left-0 right-0 h-1/2 bg-black flex items-start justify-center"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-0 overflow-hidden"
            >
              <span className="text-white text-3xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight">
                AI
              </span>
            </motion.div>
          </motion.div>

          {/* Center line effect */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: startSplit ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/20 -translate-y-1/2"
          />
        </div>
      )}
    </AnimatePresence>
  );
};

export default IntroSplash;
