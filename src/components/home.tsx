import LandingPage from "./landing/LandingPage";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogoCloud } from "@/components/ui/logo-cloud-2";

function Home() {
  const [showPopup, setShowPopup] = useState(false);
  const [showMiniPopup, setShowMiniPopup] = useState(false);
  const [popupShown, setPopupShown] = useState(false);

  useEffect(() => {
    if (!popupShown) {
      const timer = setTimeout(() => {
        setShowPopup(true);
        setPopupShown(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [popupShown]);


  const closePopup = () => {
    setShowPopup(false);
    setShowMiniPopup(true);
  };

  const openPopup = () => {
    setShowMiniPopup(false);
    setShowPopup(true);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setShowPopup(false);
    setShowMiniPopup(true);
  };

  return (
    <div className="relative">
      <LandingPage />

      {/* Fullscreen Overlay Menu */}
      {showPopup && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 z-50 bg-black rounded-2xl md:rounded-3xl overflow-hidden">
          {/* Close button */}
          <button
            onClick={closePopup}
            className="absolute top-4 md:top-8 right-4 md:right-8 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 z-10"
            aria-label="Close menu"
          >
            <span className="text-2xl md:text-3xl font-light">×</span>
          </button>

          {/* Main content grid */}
          <div className="h-full grid grid-cols-1 lg:grid-cols-3 overflow-y-auto">
            {/* Left column - Navigation menu */}
            <div className="lg:col-span-2 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24">
              <nav className="space-y-4 md:space-y-6 lg:space-y-8">
                <div
                  onClick={() => scrollToSection('home')}
                  className="flex items-baseline cursor-pointer group"
                >
                  <span className="text-gray-500 text-xs md:text-sm mr-2 md:mr-4 font-mono">01</span>
                  <span className="text-white text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tight group-hover:text-blue-300 transition-colors duration-300" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Home
                  </span>
                </div>

                <Link
                  to="/features"
                  onClick={closePopup}
                  className="flex items-baseline cursor-pointer group"
                >
                  <span className="text-gray-500 text-xs md:text-sm mr-2 md:mr-4 font-mono">02</span>
                  <span className="text-white text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tight group-hover:text-blue-400 transition-colors duration-300" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Features
                  </span>
                </Link>

                <Link
                  to="/pricing"
                  onClick={closePopup}
                  className="flex items-baseline cursor-pointer group"
                >
                  <span className="text-gray-500 text-xs md:text-sm mr-2 md:mr-4 font-mono">03</span>
                  <span className="text-white text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tight group-hover:text-yellow-300 transition-colors duration-300" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Pricing
                  </span>
                </Link>

                <Link
                  to="/blog"
                  onClick={closePopup}
                  className="flex items-baseline cursor-pointer group"
                >
                  <span className="text-gray-500 text-xs md:text-sm mr-2 md:mr-4 font-mono">04</span>
                  <span className="text-white text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tight group-hover:text-green-300 transition-colors duration-300" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Blog
                  </span>
                </Link>

                <Link
                  to="/about"
                  onClick={closePopup}
                  className="flex items-baseline cursor-pointer group"
                >
                  <span className="text-gray-500 text-xs md:text-sm mr-2 md:mr-4 font-mono">05</span>
                  <span className="text-white text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tight group-hover:text-purple-300 transition-colors duration-300" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    About
                  </span>
                </Link>

              </nav>
            </div>

            {/* Right column - Social & Contact */}
            <div className="flex flex-col justify-start lg:justify-center px-6 pb-12 lg:px-12 lg:pb-0">
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-6 lg:gap-8">
                {/* Social Links */}
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-white text-xs md:text-sm uppercase tracking-wider font-medium mb-3 md:mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Follow Us
                  </h3>

                  <div className="space-y-2 md:space-y-3">
                    <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-300 text-xs md:text-sm uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Twitter
                    </a>
                    <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-300 text-xs md:text-sm uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      LinkedIn
                    </a>
                    <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-300 text-xs md:text-sm uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      GitHub
                    </a>
                    <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-300 text-xs md:text-sm uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Instagram
                    </a>
                  </div>
                </div>

                {/* Legal Policies */}
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-white text-xs md:text-sm uppercase tracking-wider font-medium mb-3 md:mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Legal
                  </h3>

                  <div className="space-y-2">
                    <Link to="/privacy" className="block text-gray-400 hover:text-white transition-colors duration-300 text-xs md:text-sm uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Privacy
                    </Link>
                    <Link to="/terms" className="block text-gray-400 hover:text-white transition-colors duration-300 text-xs md:text-sm uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Terms
                    </Link>
                    <Link to="/cookies" className="block text-gray-400 hover:text-white transition-colors duration-300 text-xs md:text-sm uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Cookies
                    </Link>
                    <Link to="/gdpr" className="block text-gray-400 hover:text-white transition-colors duration-300 text-xs md:text-sm uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      GDPR
                    </Link>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 md:space-y-4 col-span-2 lg:col-span-1">
                  <h3 className="text-white text-xs md:text-sm uppercase tracking-wider font-medium mb-3 md:mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Get In Touch
                  </h3>

                  <div className="space-y-2 font-mono text-xs md:text-sm">
                    <a href="mailto:hello@aurion-platform.com" className="block text-gray-400 hover:text-white transition-colors duration-300">
                      hello@aurion-platform.com
                    </a>
                    <a href="tel:+33123456789" className="block text-gray-400 hover:text-white transition-colors duration-300">
                      +33 1 23 45 67 89
                    </a>
                  </div>
                </div>

                {/* Logo Cloud - Hidden on mobile */}
                <div className="hidden lg:flex space-y-4 flex-col items-center col-span-2 lg:col-span-1">
                  <h3 className="text-white text-sm uppercase tracking-wider font-medium mb-6 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Trusted By
                  </h3>

                  <LogoCloud className="w-full max-w-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mini popup dot */}
      {showMiniPopup && (
        <button
          onClick={openPopup}
          className="fixed top-1/2 right-2 md:right-4 z-40 w-5 h-5 md:w-6 md:h-6 bg-black rounded-full shadow-lg hover:scale-110 transition-transform"
        />
      )}

    </div>
  );
}

export default Home;
