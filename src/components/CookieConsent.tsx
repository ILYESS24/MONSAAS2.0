import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    necessary: true,
    preferences: false,
    analytics: false,
    advertising: false,
  });
  const [cookieSettings, setCookieSettings] = useState({
    preferences: true,
    analytics: true,
    advertising: false,
  });

  useEffect(() => {
    // Vérifier immédiatement si l'utilisateur a déjà vu le popup
    const hasSeenCookiePopup = localStorage.getItem('cookie-consent-seen');

    if (hasSeenCookiePopup) {
      // Si déjà vu, ne pas afficher et charger les paramètres sauvegardés
      const savedSettings = localStorage.getItem('cookie-settings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setCookieSettings(parsedSettings);
        } catch (error) {
          console.warn('Erreur lors du chargement des paramètres cookies:', error);
        }
      }
      return; // Ne pas afficher le popup
    }

    // Si pas encore vu, afficher après le délai
    const timer = setTimeout(() => {
      // Vérifier encore une fois au cas où l'utilisateur aurait accepté entre temps
      const stillNotSeen = !localStorage.getItem('cookie-consent-seen');
      if (stillNotSeen) {
        setIsVisible(true);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleCookie = (cookie: keyof typeof cookieSettings) => {
    setCookieSettings(prev => ({
      ...prev,
      [cookie]: !prev[cookie]
    }));
  };

  const handleAcceptAll = () => {
    const settings = {
      preferences: true,
      analytics: true,
      advertising: true,
    };
    setCookieSettings(settings);
    localStorage.setItem('cookie-consent-seen', 'true');
    localStorage.setItem('cookie-settings', JSON.stringify(settings));
    setIsVisible(false);
  };

  const handleSaveSettings = () => {
    localStorage.setItem('cookie-consent-seen', 'true');
    localStorage.setItem('cookie-settings', JSON.stringify(cookieSettings));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-4">
        <h3 className="text-lg font-semibold mb-3 text-black">Cookies Configuration</h3>
        <p className="text-sm text-gray-700 mb-4">
          We use our own cookies, as well as those of third parties, for individual as well as repeated sessions, in order to make the navigation of our website easy and safe for our users.
        </p>

        {/* Strictly necessary cookies */}
        <div className="mb-3">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('necessary')}>
            {expandedSections.necessary ? <ChevronUp className="w-4 h-4 text-black" /> : <ChevronDown className="w-4 h-4 text-black" />}
            <span className="text-sm font-semibold text-black flex-1 ml-2">Strictly necessary cookies</span>
            <span className="text-xs text-gray-600">Always active</span>
          </div>
          {expandedSections.necessary && (
            <p className="text-xs text-gray-600 mt-2 ml-6">
              Necessary cookies help make a website usable by enabling basic function like navigation and access to secure areas of the website. The website cannot function properly without these cookies.
            </p>
          )}
        </div>

        {/* Visitor preferences */}
        <div className="mb-3">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('preferences')}>
            {expandedSections.preferences ? <ChevronUp className="w-4 h-4 text-black" /> : <ChevronDown className="w-4 h-4 text-black" />}
            <span className="text-sm font-semibold text-black flex-1 ml-2">Visitor preferences</span>
            <div className="cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleCookie('preferences'); }}>
              <div className={`w-8 h-4 rounded-full transition-colors ${cookieSettings.preferences ? 'bg-black' : 'bg-gray-300'}`}>
                <div className={`w-3 h-3 bg-white rounded-full transition-transform mt-0.5 ${cookieSettings.preferences ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics cookies */}
        <div className="mb-3">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('analytics')}>
            {expandedSections.analytics ? <ChevronUp className="w-4 h-4 text-black" /> : <ChevronDown className="w-4 h-4 text-black" />}
            <span className="text-sm font-semibold text-black flex-1 ml-2">Analytics cookies</span>
            <div className="cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleCookie('analytics'); }}>
              <div className={`w-8 h-4 rounded-full transition-colors ${cookieSettings.analytics ? 'bg-black' : 'bg-gray-300'}`}>
                <div className={`w-3 h-3 bg-white rounded-full transition-transform mt-0.5 ${cookieSettings.analytics ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Advertising cookies */}
        <div className="mb-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('advertising')}>
            {expandedSections.advertising ? <ChevronUp className="w-4 h-4 text-black" /> : <ChevronDown className="w-4 h-4 text-black" />}
            <span className="text-sm font-semibold text-black flex-1 ml-2">Advertising cookies</span>
            <div className="cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleCookie('advertising'); }}>
              <div className={`w-8 h-4 rounded-full transition-colors ${cookieSettings.advertising ? 'bg-black' : 'bg-gray-300'}`}>
                <div className={`w-3 h-3 bg-white rounded-full transition-transform mt-0.5 ${cookieSettings.advertising ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleAcceptAll}
            className="flex-1 bg-black text-white py-2 px-3 rounded text-sm font-medium hover:bg-gray-800"
          >
            Accept All
          </button>
          <button
            onClick={handleSaveSettings}
            className="flex-1 text-black py-2 px-3 rounded text-sm underline hover:bg-gray-50"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
