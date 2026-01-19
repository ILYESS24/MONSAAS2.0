import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  const [phase, setPhase] = useState<'text' | 'split' | 'done'>('text');
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    // Phase 1: Show text with animation
    const showTextTimer = setTimeout(() => {
      setTextVisible(true);
    }, 300);

    // Phase 2: Start split animation after text is shown (4.5 seconds total)
    const splitTimer = setTimeout(() => {
      setPhase('split');
    }, 4500);

    // Phase 3: Complete animation
    const completeTimer = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 5700);

    return () => {
      clearTimeout(showTextTimer);
      clearTimeout(splitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <>
          {/* Top half */}
          <motion.div
            className="fixed inset-0 z-[200] bg-black flex items-end justify-center overflow-hidden"
            initial={{ y: 0 }}
            animate={{ y: phase === 'split' ? "-100%" : 0 }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
            style={{ clipPath: "inset(0 0 50% 0)" }}
          >
            <div 
              className="text-center"
              style={{ transform: "translateY(50%)" }}
            >
              {/* Welcome text */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: textVisible ? 1 : 0, 
                  y: textVisible ? 0 : 20 
                }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                className="font-display text-white/60 text-[14px] sm:text-[18px] md:text-[22px] tracking-[0.3em] uppercase mb-4"
              >
                Welcome to
              </motion.p>
              
              {/* AURION - letter by letter animation */}
              <motion.div className="flex justify-center items-center">
                {"AURION".split("").map((letter, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ 
                      opacity: textVisible ? 1 : 0, 
                      y: textVisible ? 0 : 50 
                    }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.2 + 0.1 * index,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    className="font-display font-extrabold text-white text-[50px] sm:text-[80px] md:text-[120px] lg:text-[150px] xl:text-[180px] tracking-[-0.02em] leading-none"
                  >
                    {letter}
                  </motion.span>
                ))}
              </motion.div>
              
              {/* AI - appears after AURION */}
              <motion.div 
                className="flex justify-center items-center mt-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: textVisible ? 1 : 0, 
                  scale: textVisible ? 1 : 0.8 
                }}
                transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
              >
                <span className="font-display font-light text-white/80 text-[30px] sm:text-[50px] md:text-[70px] lg:text-[90px] xl:text-[100px] tracking-[0.3em] leading-none">
                  AI
                </span>
              </motion.div>
              
              {/* Slogan */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: textVisible ? 1 : 0, 
                  y: textVisible ? 0 : 20 
                }}
                transition={{ duration: 0.8, delay: 1.8, ease: "easeOut" }}
                className="font-display text-white/50 text-[12px] sm:text-[16px] md:text-[20px] tracking-[0.15em] mt-6 max-w-[600px] mx-auto px-4"
              >
                One Platform. Infinite Possibilities.
              </motion.p>
            </div>
          </motion.div>

          {/* Bottom half */}
          <motion.div
            className="fixed inset-0 z-[200] bg-black flex items-start justify-center overflow-hidden"
            initial={{ y: 0 }}
            animate={{ y: phase === 'split' ? "100%" : 0 }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
            style={{ clipPath: "inset(50% 0 0 0)" }}
          >
            <div 
              className="text-center"
              style={{ transform: "translateY(-50%)" }}
            >
              {/* Welcome text */}
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ 
                  opacity: textVisible ? 1 : 0, 
                  y: textVisible ? 0 : -20 
                }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                className="font-display text-white/60 text-[14px] sm:text-[18px] md:text-[22px] tracking-[0.3em] uppercase mb-4"
              >
                Welcome to
              </motion.p>
              
              {/* AURION - letter by letter animation */}
              <motion.div className="flex justify-center items-center">
                {"AURION".split("").map((letter, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ 
                      opacity: textVisible ? 1 : 0, 
                      y: textVisible ? 0 : -50 
                    }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.2 + 0.1 * index,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    className="font-display font-extrabold text-white text-[50px] sm:text-[80px] md:text-[120px] lg:text-[150px] xl:text-[180px] tracking-[-0.02em] leading-none"
                  >
                    {letter}
                  </motion.span>
                ))}
              </motion.div>
              
              {/* AI - appears after AURION */}
              <motion.div 
                className="flex justify-center items-center mt-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: textVisible ? 1 : 0, 
                  scale: textVisible ? 1 : 0.8 
                }}
                transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
              >
                <span className="font-display font-light text-white/80 text-[30px] sm:text-[50px] md:text-[70px] lg:text-[90px] xl:text-[100px] tracking-[0.3em] leading-none">
                  AI
                </span>
              </motion.div>
              
              {/* Slogan */}
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ 
                  opacity: textVisible ? 1 : 0, 
                  y: textVisible ? 0 : -20 
                }}
                transition={{ duration: 0.8, delay: 1.8, ease: "easeOut" }}
                className="font-display text-white/50 text-[12px] sm:text-[16px] md:text-[20px] tracking-[0.15em] mt-6 max-w-[600px] mx-auto px-4"
              >
                One Platform. Infinite Possibilities.
              </motion.p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default IntroAnimation;
