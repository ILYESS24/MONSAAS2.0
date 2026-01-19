import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Navigation from "./Navigation";
import HeroTypography from "./HeroTypography";
import ServiceList from "./ServiceList";
import MissionStatement from "./MissionStatement";
import Footer from "./Footer";
import LavaLampBackground from "./LavaLampBackground";
import CustomCursor from "./CustomCursor";
import IntroAnimation from "./IntroAnimation";
import { WhatWeBelieve, Timeline, News, FAQ, Tools } from "./sections";

// Section wrapper for stacking/snap scroll animation
interface SectionWrapperProps {
  children: React.ReactNode;
  index: number;
  id: string;
}

const SectionWrapper = ({ children, index, id }: SectionWrapperProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 1, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);

  return (
    <motion.section
      ref={sectionRef}
      id={id}
      style={{
        y,
        opacity,
        scale,
        zIndex: index + 10,
      }}
      className="relative will-change-transform"
    >
      {children}
    </motion.section>
  );
};

// Enhanced Footer Section
const FooterSection = () => {
  return (
    <section className="relative bg-black py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          {/* Left: Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
              aurion<span className="text-lg align-super">®</span>
            </h2>
            <p className="font-body text-sm text-white/50 max-w-xs">
              Building the future of AI-powered business tools.
              <br />
              No hype. Just results.
            </p>
          </motion.div>

          {/* Right: Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex flex-wrap gap-6 text-sm font-body text-white/50"
          >
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
            <a href="/cookies" className="hover:text-white transition-colors">Cookies</a>
            <a href="/legal" className="hover:text-white transition-colors">Legal</a>
          </motion.div>
        </div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <span className="font-body text-xs text-white/40">
            © {new Date().getFullYear()} aurion® Studio. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            <a href="#" className="text-white/40 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </a>
            <a href="#" className="text-white/40 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="#" className="text-white/40 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const FabricaLanding = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [showIntro, setShowIntro] = useState(true);

  // Hide scroll indicator after first scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollIndicator(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  return (
    <>
      {/* Intro Animation */}
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}

      <div
        ref={containerRef}
        className="relative w-full bg-black cursor-none md:cursor-none overflow-x-hidden"
      >
      {/* Custom Cursor - follows mouse across all sections */}
      <CustomCursor />

      {/* Navigation - fixed across all sections */}
      <Navigation />

      {/* Hero Section - Full viewport */}
      <section className="relative min-h-screen h-screen w-full overflow-hidden">
        {/* Top Border Bar */}
        <div className="fixed top-0 left-0 right-0 h-2 md:h-3 bg-black z-[100]" />

        {/* Animated Background */}
        <LavaLampBackground />

        {/* Main Content */}
        <main className="relative z-10 h-full flex flex-col px-6 md:px-12 lg:px-16 pt-20 md:pt-24 pb-6 md:pb-8">
          {/* Hero Section */}
          <div className="flex-1 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-16">
            {/* Left: Hero Typography */}
            <div className="flex-1">
              <HeroTypography />
            </div>

            {/* Right: Services */}
            <div className="lg:self-start lg:mt-[15%]">
              <ServiceList />
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 lg:gap-16">
            {/* Left: Mission Statement */}
            <div className="order-2 lg:order-1 max-w-md">
              <MissionStatement />
            </div>

            {/* Right: Footer Links */}
            <div className="order-1 lg:order-2">
              <Footer />
            </div>
          </div>
        </main>

        {/* Scroll Indicator */}
        <AnimatePresence>
          {showScrollIndicator && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 1.5 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="flex flex-col items-center gap-2"
              >
                <span className="text-white/40 text-xs font-body tracking-wider uppercase">
                  Scroll to explore
                </span>
                <svg
                  className="w-5 h-5 text-white/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Stacking Sections with animations */}
      <SectionWrapper index={1} id="tools">
        <Tools />
      </SectionWrapper>

      <SectionWrapper index={2} id="what-we-believe">
        <WhatWeBelieve />
      </SectionWrapper>

      <SectionWrapper index={3} id="timeline">
        <Timeline />
      </SectionWrapper>

      <SectionWrapper index={4} id="news">
        <News />
      </SectionWrapper>

      <SectionWrapper index={5} id="faq">
        <FAQ />
      </SectionWrapper>

      <SectionWrapper index={6} id="footer">
        <FooterSection />
      </SectionWrapper>
    </div>
    </>
  );
};

export default FabricaLanding;
