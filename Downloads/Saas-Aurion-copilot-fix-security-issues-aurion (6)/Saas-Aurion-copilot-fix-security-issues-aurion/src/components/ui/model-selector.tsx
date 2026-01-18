 
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Sparkles, Zap, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { OPENROUTER_MODELS } from "@/services/ai-api";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  compact?: boolean;
}

const providerIcons: Record<string, React.ReactNode> = {
  OpenAI: <Sparkles size={14} className="text-green-500" />,
  Anthropic: <Brain size={14} className="text-orange-500" />,
  Google: <Zap size={14} className="text-blue-500" />,
  Meta: <Sparkles size={14} className="text-purple-500" />,
  Mistral: <Zap size={14} className="text-cyan-500" />,
  Cohere: <Brain size={14} className="text-pink-500" />,
  DeepSeek: <Sparkles size={14} className="text-indigo-500" />,
  Alibaba: <Zap size={14} className="text-red-500" />,
};

const providerColors: Record<string, string> = {
  OpenAI: 'bg-green-50 text-green-700 border-green-200',
  Anthropic: 'bg-orange-50 text-orange-700 border-orange-200',
  Google: 'bg-blue-50 text-blue-700 border-blue-200',
  Meta: 'bg-purple-50 text-purple-700 border-purple-200',
  Mistral: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Cohere: 'bg-pink-50 text-pink-700 border-pink-200',
  DeepSeek: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Alibaba: 'bg-red-50 text-red-700 border-red-200',
};

export function ModelSelector({ selectedModel, onModelChange, compact = false }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentModel = OPENROUTER_MODELS.find(m => m.id === selectedModel) || OPENROUTER_MODELS[1];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-full border transition-all",
          compact 
            ? "px-3 py-1.5 text-xs" 
            : "px-4 py-2 text-sm",
          providerColors[currentModel.provider] || 'bg-gray-50 text-gray-700 border-gray-200',
          "hover:shadow-md"
        )}
      >
        {providerIcons[currentModel.provider]}
        <span className="font-medium">{currentModel.name}</span>
        <ChevronDown 
          size={compact ? 12 : 14} 
          className={cn("transition-transform", isOpen && "rotate-180")} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-gray-100">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Modèles IA disponibles
                </h4>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {OPENROUTER_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      onModelChange(model.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left",
                      selectedModel === model.id && "bg-gray-50"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      providerColors[model.provider]?.split(' ')[0] || 'bg-gray-100'
                    )}>
                      {providerIcons[model.provider]}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{model.name}</p>
                      <p className="text-xs text-gray-500">{model.provider}</p>
                    </div>
                    
                    {selectedModel === model.id && (
                      <Check size={16} className="text-green-500" />
                    )}
                  </button>
                ))}
              </div>
              
              <div className="p-3 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  Powered by OpenRouter API
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

