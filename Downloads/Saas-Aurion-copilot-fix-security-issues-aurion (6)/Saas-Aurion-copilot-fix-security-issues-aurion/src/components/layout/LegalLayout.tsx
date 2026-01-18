import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface LegalLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  lastUpdated?: string;
}

export function LegalLayout({ title, subtitle, children, lastUpdated }: LegalLayoutProps) {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Top Border Bar - black */}
      <div className="fixed top-0 left-0 right-0 h-2 md:h-3 bg-black z-[100]" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 md:h-20 flex items-center justify-between px-6 md:px-12 lg:px-16 bg-black/80 backdrop-blur-sm">
        <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Retour à l'accueil</span>
        </Link>
        <Link to="/" className="text-white text-lg font-medium tracking-tight">
          aurion<span className="text-xs align-super">®</span>
        </Link>
      </nav>

      {/* Header */}
      <header className="pt-20 md:pt-24 px-6 md:px-12 lg:px-16 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
          {lastUpdated && (
            <p className="text-sm text-gray-400 uppercase tracking-widest font-medium">
              Dernière mise à jour: {lastUpdated}
            </p>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="px-6 md:px-12 lg:px-16 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg prose-invert max-w-none">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-black/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} AURION. Tous droits réservés.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Conditions</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

