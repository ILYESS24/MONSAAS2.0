"use client";

import * as React from "react";
import { useState } from "react";
import { Wrench, Download, Paperclip, ChevronDown, Send } from "lucide-react";

interface PromptInputProps {
  onSubmit?: (prompt: string) => void;
  onToolsClick?: () => void;
  onImportClick?: () => void;
  placeholder?: string;
  className?: string;
}

export function PromptInput({
  onSubmit,
  onToolsClick,
  onImportClick,
  placeholder = "Décrivez votre projet…",
  className = "",
}: PromptInputProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && onSubmit) {
      onSubmit(prompt.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <div className="relative">
        {/* Conteneur principal */}
        <div
          className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl shadow-blue-500/20"
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.2), 0 0 20px rgba(59, 130, 246, 0.1)",
          }}
        >
          {/* Barre d'actions supérieure */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/30">
            {/* Boutons à gauche */}
            <div className="flex items-center gap-2">
              <button
                onClick={onToolsClick}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              >
                <Wrench className="w-4 h-4" />
                <span className="hidden sm:inline">Tools</span>
              </button>

              <button
                onClick={onImportClick}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Import</span>
              </button>
            </div>

            {/* Boutons à droite */}
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded-lg transition-all duration-200">
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Sélecteur de modèle */}
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200">
                <span>GPT-4 Turbo</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Zone de saisie */}
          <form onSubmit={handleSubmit}>
            <div className="px-4 py-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full min-h-[120px] bg-transparent text-white placeholder-gray-500 text-left resize-none border-none outline-none text-base leading-relaxed"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 transparent' }}
              />
            </div>

            {/* Barre d'actions inférieure */}
            <div className="flex items-center justify-end px-4 py-3 border-t border-gray-700/30">
              <button
                type="submit"
                disabled={!prompt.trim()}
                className="flex items-center justify-center w-10 h-10 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
