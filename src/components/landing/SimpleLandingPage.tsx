import React from "react";
import { TOOL_URLS } from "@/types/plans";

const SimpleLandingPage: React.FC = () => {
  const handleToolClick = (toolKey: string) => {
    const url = TOOL_URLS[toolKey];
    if (url) {
      window.location.href = url; // Redirection directe vers l'outil
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">AURION - Outils IA</h1>
        <p className="text-center text-gray-400 mb-8">Cliquez sur un outil pour commencer</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => handleToolClick('app-builder')}
            className="bg-blue-600/20 hover:bg-blue-600/30 text-white font-semibold py-6 px-6 rounded-lg border border-blue-600/30 hover:border-blue-600/50 transition-all duration-200 cursor-pointer group"
          >
            <div className="text-2xl mb-2">🏗️</div>
            <div className="font-bold">Créateur d'Apps</div>
            <div className="text-sm text-gray-300 mt-1">Créez des applications mobiles et web</div>
            <div className="text-xs text-blue-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              Cliquer pour ouvrir →
            </div>
          </button>

          <button
            onClick={() => handleToolClick('website-builder')}
            className="bg-green-600/20 hover:bg-green-600/30 text-white font-semibold py-6 px-6 rounded-lg border border-green-600/30 hover:border-green-600/50 transition-all duration-200 cursor-pointer group"
          >
            <div className="text-2xl mb-2">🌐</div>
            <div className="font-bold">Créateur de Sites Web</div>
            <div className="text-sm text-gray-300 mt-1">Construisez des sites web professionnels</div>
            <div className="text-xs text-green-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              Cliquer pour ouvrir →
            </div>
          </button>

          <button
            onClick={() => handleToolClick('ai-agents')}
            className="bg-purple-600/20 hover:bg-purple-600/30 text-white font-semibold py-6 px-6 rounded-lg border border-purple-600/30 hover:border-purple-600/50 transition-all duration-200 cursor-pointer group"
          >
            <div className="text-2xl mb-2">🤖</div>
            <div className="font-bold">Agents IA</div>
            <div className="text-sm text-gray-300 mt-1">Créez et déployez des agents IA</div>
            <div className="text-xs text-purple-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              Cliquer pour ouvrir →
            </div>
          </button>

          <button
            onClick={() => handleToolClick('text-editor')}
            className="bg-red-600/20 hover:bg-red-600/30 text-white font-semibold py-6 px-6 rounded-lg border border-red-600/30 hover:border-red-600/50 transition-all duration-200 cursor-pointer group"
          >
            <div className="text-2xl mb-2">✏️</div>
            <div className="font-bold">Éditeur de Texte</div>
            <div className="text-sm text-gray-300 mt-1">Éditeur de texte avec IA intégrée</div>
            <div className="text-xs text-red-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              Cliquer pour ouvrir →
            </div>
          </button>

          <button
            onClick={() => handleToolClick('code-editor')}
            className="bg-yellow-600/20 hover:bg-yellow-600/30 text-white font-semibold py-6 px-6 rounded-lg border border-yellow-600/30 hover:border-yellow-600/50 transition-all duration-200 cursor-pointer group"
          >
            <div className="text-2xl mb-2">💻</div>
            <div className="font-bold">Éditeur de Code</div>
            <div className="text-sm text-gray-300 mt-1">Éditeur de code avec assistance IA</div>
            <div className="text-xs text-yellow-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              Cliquer pour ouvrir →
            </div>
          </button>

          <button
            onClick={() => handleToolClick('content-generator')}
            className="bg-pink-600/20 hover:bg-pink-600/30 text-white font-semibold py-6 px-6 rounded-lg border border-pink-600/30 hover:border-pink-600/50 transition-all duration-200 cursor-pointer group"
          >
            <div className="text-2xl mb-2">🎨</div>
            <div className="font-bold">Générateur de Contenu</div>
            <div className="text-sm text-gray-300 mt-1">Générez automatiquement du contenu créatif</div>
            <div className="text-xs text-pink-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              Cliquer pour ouvrir →
            </div>
          </button>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm">
            💡 Les outils s'ouvrent dans une nouvelle fenêtre pour une expérience optimale
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleLandingPage;
