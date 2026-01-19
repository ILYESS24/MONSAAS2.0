import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const WhatWeBelieve = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.3], [100, 0]);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen w-full bg-[#f5f5f5] relative flex items-center justify-center px-6 md:px-12 lg:px-24 py-20"
    >
      {/* Geometric grid lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/4 top-0 bottom-0 w-px bg-black/5" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black/5" />
        <div className="absolute left-3/4 top-0 bottom-0 w-px bg-black/5" />
      </div>

      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
        {/* Quote mark */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, amount: 0.3 }}
          className="flex-shrink-0"
        >
          <svg
            width="120"
            height="100"
            viewBox="0 0 120 100"
            className="text-black/10"
            fill="currentColor"
          >
            <path d="M0 60C0 26.8629 26.8629 0 60 0V30C43.4315 30 30 43.4315 30 60H0Z" />
            <path d="M60 60C60 26.8629 86.8629 0 120 0V30C103.431 30 90 43.4315 90 60H60Z" />
          </svg>
        </motion.div>

        {/* Content */}
        <div className="flex-1">
          {/* Section indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, amount: 0.3 }}
            className="flex items-center gap-3 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-black" />
            <span className="text-xs font-body tracking-[0.2em] uppercase text-black/60">
              10 • What We Believe
            </span>
          </motion.div>

          {/* Main quote */}
          <motion.h2
            style={{ opacity, y }}
            className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[0.95] tracking-[-0.02em] text-black"
          >
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, amount: 0.3 }}
              className="block"
            >
              WE DIDN'T BUILD THIS
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, amount: 0.3 }}
              className="block"
            >
              COMPANY TO CHASE
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, amount: 0.3 }}
              className="block"
            >
              TRENDS. WE BUILT IT TO
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, amount: 0.3 }}
              className="block"
            >
              SOLVE REAL PROBLEMS
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, amount: 0.3 }}
              className="block"
            >
              — CLEARLY, QUIETLY,
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, amount: 0.3 }}
              className="block text-black/40"
            >
              AND WITHOUT
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, amount: 0.3 }}
              className="block text-black/30"
            >
              WASTING YOUR TIME.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, amount: 0.3 }}
              className="block text-black/25"
            >
              AI CAN BE USEFUL, BUT
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, amount: 0.3 }}
              className="block text-black/20"
            >
              ONLY IF IT'S DONE
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, amount: 0.3 }}
              className="block text-black/15"
            >
              RIGHT.
            </motion.span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, amount: 0.3 }}
            className="mt-12 text-base md:text-lg text-black/60 font-body max-w-lg leading-relaxed"
          >
            We're here to make AI work in the real world —{" "}
            without noise, hype, or distractions.
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default WhatWeBelieve;
