import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  const [phase, setPhase] = useState<"visible" | "splitting" | "done">("visible");

  useEffect(() => {
    // Show logo for 1.5 seconds
    const timer1 = setTimeout(() => {
      setPhase("splitting");
    }, 1500);

    // Complete animation after split
    const timer2 = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Top Half */}
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 bg-black flex items-end justify-center overflow-hidden"
            animate={phase === "splitting" ? { y: "-100%" } : { y: 0 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            {/* Top text clip */}
            <div className="relative h-full w-full flex items-end justify-center pb-0">
              <div 
                className="text-white font-display font-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[-0.03em]"
                style={{ 
                  clipPath: "inset(0 0 50% 0)",
                  transform: "translateY(50%)"
                }}
              >
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  aurion
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-white/60 ml-4"
                >
                  ai
                </motion.span>
              </div>
            </div>
          </motion.div>

          {/* Bottom Half */}
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-black flex items-start justify-center overflow-hidden"
            animate={phase === "splitting" ? { y: "100%" } : { y: 0 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            {/* Bottom text clip */}
            <div className="relative h-full w-full flex items-start justify-center pt-0">
              <div 
                className="text-white font-display font-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[-0.03em]"
                style={{ 
                  clipPath: "inset(50% 0 0 0)",
                  transform: "translateY(-50%)"
                }}
              >
                <motion.span
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  aurion
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-white/60 ml-4"
                >
                  ai
                </motion.span>
              </div>
            </div>
          </motion.div>

          {/* Center Line (splits) */}
          <motion.div
            className="absolute left-0 right-0 h-px bg-white/20"
            style={{ top: "50%" }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: phase === "splitting" ? 0 : 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          />

          {/* Decorative elements */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[400px] md:h-[400px] pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: phase === "splitting" ? 0 : 0.1, 
              scale: phase === "splitting" ? 1.5 : 1,
              rotate: 360
            }}
            transition={{ 
              opacity: { duration: 0.5 },
              scale: { duration: 0.8 },
              rotate: { duration: 20, repeat: Infinity, ease: "linear" }
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="none"
                stroke="white"
                strokeWidth="0.3"
              />
              <circle
                cx="50"
                cy="50"
                r="25"
                fill="none"
                stroke="white"
                strokeWidth="0.2"
              />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroAnimation;
