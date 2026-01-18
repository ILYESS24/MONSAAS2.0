/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Sparkles, 
  Loader2, 
  ChevronDown, 
  ArrowRight,
  Video,
  Image as ImageIcon,
  Palette,
  Wand2,
  Lightbulb,
  Zap,
  Lock,
  Check,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { generateImageWithFreepik, IMAGE_MODELS, type ImageModelId } from "@/services/ai-api";
import { useGenerations } from "@/hooks/use-data";
import { Generation } from "@/types/database";
import { localStorageService } from "@/services/mock-data";
import { useUserPlan, useToolAccess } from "@/hooks/use-plan";
import { TOOL_COSTS } from "@/types/plans";
import { logger } from "@/services/logger";

/**
 * Premium Dark Mode Suggestion Card
 * Modern glass morphism design with subtle glow
 */
const SuggestionCard = ({ icon: Icon, title, description, onClick }: { 
  icon: any; 
  title: string; 
  description?: string;
  onClick: () => void 
}) => (
  <motion.div 
    whileHover={{ y: -4, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="group relative flex flex-col items-start p-5 md:p-6 w-full sm:w-[200px] md:w-[240px] bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl cursor-pointer transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.15]"
  >
    {/* Subtle glow effect on hover */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    <div className="relative w-10 h-10 md:w-12 md:h-12 bg-white/[0.05] border border-white/[0.1] rounded-xl flex items-center justify-center mb-4 text-gray-400 group-hover:text-white group-hover:border-white/20 transition-all">
      <Icon size={20} className="md:w-5 md:h-5" strokeWidth={1.5} />
    </div>
    <h3 className="relative text-sm md:text-base font-medium text-white/90 mb-1">{title}</h3>
    {description && (
      <p className="relative text-xs text-gray-500 line-clamp-2">{description}</p>
    )}
  </motion.div>
);

/**
 * Model Selector Dropdown - Dark Mode Premium
 */
const ModelSelector = ({ 
  selectedModel, 
  onSelectModel,
  modelStatuses,
  disabled
}: { 
  selectedModel: ImageModelId, 
  onSelectModel: (model: ImageModelId) => void,
  modelStatuses: Record<string, 'available' | 'rate_limited' | 'error'>,
  disabled?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentModel = IMAGE_MODELS.find(m => m.id === selectedModel) || IMAGE_MODELS[0];

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] text-sm font-medium text-gray-300 transition-all",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className="text-base">{currentModel.icon}</span>
        <span className="hidden sm:inline">{currentModel.name}</span>
        {modelStatuses[selectedModel] === 'rate_limited' && (
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" title="Temporairement indisponible" />
        )}
        {modelStatuses[selectedModel] === 'error' && (
          <div className="w-2 h-2 bg-red-400 rounded-full" title="Indisponible" />
        )}
        <ChevronDown size={14} className={cn("text-gray-500 transition-transform", isOpen && "rotate-180")} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 w-72 bg-[#1a1a1a]/95 backdrop-blur-xl rounded-xl border border-white/[0.1] shadow-2xl overflow-hidden z-20"
            >
              <div className="p-3 border-b border-white/[0.08]">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Modèles d'Image</p>
              </div>
              <div className="py-1 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {IMAGE_MODELS.map((model) => {
                  const status = modelStatuses[model.id];
                  const isSelected = model.id === selectedModel;
                  
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        onSelectModel(model.id as ImageModelId);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full px-4 py-3 flex items-start gap-3 hover:bg-white/[0.05] transition-colors text-left",
                        isSelected && "bg-purple-500/10"
                      )}
                    >
                      <span className="text-lg">{model.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-medium", isSelected ? "text-purple-400" : "text-white/90")}>{model.name}</span>
                          {isSelected && <Check size={14} className="text-purple-400" />}
                          {status === 'rate_limited' && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded-full">
                              Limité
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{model.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ImageCreation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [prompt, setPrompt] = useState(location.state?.initialPrompt || "");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [selectedStyle, setSelectedStyle] = useState("Realistic");
  const [selectedModel, setSelectedModel] = useState<ImageModelId>("classic");
  const [modelStatuses, setModelStatuses] = useState<Record<string, 'available' | 'rate_limited' | 'error'>>(() => {
    const statuses: Record<string, 'available' | 'rate_limited' | 'error'> = {};
    IMAGE_MODELS.forEach(m => { statuses[m.id] = 'available'; });
    return statuses;
  });

  // Mettre à jour le statut des modèles
  const updateModelStatus = useCallback((model: string, status: 'available' | 'rate_limited' | 'error') => {
    setModelStatuses(prev => ({
      ...prev,
      [model]: status
    }));

    // Reset automatiquement après 5 minutes
    if (status !== 'available') {
      setTimeout(() => {
        setModelStatuses(prev => ({
          ...prev,
          [model]: 'available'
        }));
      }, 5 * 60 * 1000); // 5 minutes
    }
  }, []);

  const { refetch: refetchGenerations } = useGenerations();
  
  // Système de plan et crédits
  const { creditsRemaining } = useUserPlan();
  const { accessCheck, checkAndConsume, isAllowed } = useToolAccess('image_generation');
  const imageCost = TOOL_COSTS.image_generation;

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    // ✅ SÉCURITÉ CRITIQUE : D'abord vérifier l'accès SANS consommer
    if (!accessCheck?.allowed) {
      toast({
        title: "Accès refusé",
        description: accessCheck?.reason || "Accès non autorisé",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // 1. APPEL API en premier
      const apiResult = await generateImageWithFreepik({
        prompt: prompt.trim(),
        model: selectedModel,
        styling: { style: 'photo' },
        image: { size: 'square_1_1' },
        num_images: 1,
      });

      // 2. ✅ SUCCÈS API : Consommer les crédits APRÈS
      const consumeResult = await checkAndConsume({ prompt: prompt.trim(), model: selectedModel });
      if (!consumeResult.success) {
        // API a réussi mais débit impossible (rare) - rollback visuel
        toast({
          title: "Erreur système",
          description: "L'image a été générée mais la consommation de crédits a échoué. Contactez le support.",
          variant: "destructive",
        });
        return;
      }
      
      if (apiResult.data?.[0]?.base64) {
        const imageUrl = `data:image/png;base64,${apiResult.data[0].base64}`;
        
        const newGen: Generation = {
          id: crypto.randomUUID(),
          user_id: 'local',
          type: 'image',
          prompt: prompt.trim(),
          result_url: imageUrl,
          status: 'completed',
          metadata: { style: selectedStyle },
          created_at: new Date().toISOString(),
        };
        
        const existingGens = localStorageService.getGenerations();
        existingGens.unshift(newGen);
        localStorageService.saveGenerations(existingGens);
        refetchGenerations();
        
        toast({ 
          title: "Image générée !", 
          description: `${creditsRemaining - imageCost} crédits restants.` 
        });
      }
      setPrompt("");
    } catch (err: any) {
      const errorMessage = err?.message || 'Unknown error';

      // Gestion spécifique des erreurs de rate limiting
      if (errorMessage.includes('RATE_LIMIT') ||
          errorMessage.includes('rate limit') ||
          errorMessage.includes('overloaded') ||
          errorMessage.includes('Provider overloaded')) {

        // Marquer ce modèle comme rate limited
        updateModelStatus(selectedModel, 'rate_limited');

        toast({
          title: "Service temporairement indisponible",
          description: "Le fournisseur d'IA est surchargé. Essayez avec un autre modèle ou patientez quelques minutes.",
          variant: "destructive"
        });

        // Log pour monitoring
        logger.warn('Rate limit error', { errorMessage });

      } else if (errorMessage.includes('insufficient credits') ||
                 errorMessage.includes('crédits insuffisants')) {

        toast({
          title: "Crédits insuffisants",
          description: "Vous n'avez pas assez de crédits. Pensez à mettre à niveau votre plan.",
          variant: "destructive"
        });

      } else {
        // Erreur générique
        toast({
          title: "Erreur de génération",
          description: "Une erreur inattendue s'est produite. Veuillez réessayer.",
          variant: "destructive"
        });
      }
    } finally {
      setIsGenerating(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, toast, refetchGenerations, selectedStyle, selectedModel, checkAndConsume, creditsRemaining, imageCost]); // accessCheck values are derived from checkAndConsume

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] relative overflow-y-auto overflow-x-hidden">
      
      {/* Premium Dark Background with Radial Gradient */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Central radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(120,80,200,0.08)_0%,_transparent_70%)]" />
        {/* Subtle vignette effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(0,0,0,0.4)_100%)]" />
      </div>

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          <span>BACK</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-4 md:p-8 pb-8 md:pb-12">
        
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4 md:mb-6 tracking-tight leading-tight">
            Ready to Find<br />
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Your Next Big Idea?
            </span>
          </h1>
          
          <p className="text-gray-500 text-center max-w-xl mx-auto leading-relaxed text-sm md:text-base px-4">
            Start exploring with a prompt or let AURION guide you to the perfect creation.
          </p>
        </motion.div>

        {/* Suggestion Cards Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 md:gap-5 mb-10 md:mb-14 w-full max-w-4xl px-4"
        >
          <SuggestionCard 
            icon={Wand2} 
            title="AI-Powered Generation" 
            description="Create stunning visuals from text"
            onClick={() => setPrompt("Create a stunning visual of...")} 
          />
          <SuggestionCard 
            icon={Palette} 
            title="Style Transfer" 
            description="Transform any image with AI styles"
            onClick={() => setPrompt("Transform this image into...")} 
          />
          <SuggestionCard 
            icon={Lightbulb} 
            title="Concept Art" 
            description="Bring your ideas to life"
            onClick={() => setPrompt("Concept art for...")} 
          />
          <SuggestionCard 
            icon={Video} 
            title="Create Video" 
            description="Convert to motion"
            onClick={() => navigate('/creation/video')} 
          />
        </motion.div>

        {/* Prompt Input Area - Premium Dark Glass */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full max-w-3xl"
        >
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/[0.08] p-4 md:p-6 transition-all hover:border-white/[0.15]">
            
            {/* Input Area */}
            <div className="relative mb-4">
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to create..." 
                className="w-full min-h-[80px] md:min-h-[100px] bg-transparent border-none text-white placeholder:text-gray-600 text-base md:text-lg resize-none focus:ring-0 focus:outline-none p-0"
              />
            </div>
            
            {/* Bottom Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/[0.08]">
              
              {/* Left: Model Selector & Controls */}
              <div className="flex items-center gap-3 flex-wrap">
                <ModelSelector 
                  selectedModel={selectedModel}
                  onSelectModel={setSelectedModel}
                  modelStatuses={modelStatuses}
                  disabled={isGenerating}
                />
                
                {/* Style Badge */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-gray-400">
                  <Palette size={14} />
                  <span className="hidden sm:inline">{selectedStyle}</span>
                </div>
              </div>

              {/* Model Status Alerts */}
              {modelStatuses[selectedModel] === 'rate_limited' && (
                <div className="w-full sm:w-auto text-xs text-orange-400 bg-orange-500/10 px-3 py-2 rounded-lg border border-orange-500/20">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
                    Modèle temporairement indisponible
                  </div>
                </div>
              )}

              {/* Right: Credits & Generate */}
              <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                {/* Credits Display */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full">
                    <Zap size={12} className="text-purple-400" />
                    <span className="text-xs font-medium text-purple-400">{imageCost} crédits</span>
                  </div>
                  <span className="text-xs text-gray-600 hidden md:block">{creditsRemaining} restants</span>
                </div>
                
                {/* Generate Button */}
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !isAllowed || !prompt.trim()}
                  aria-label="Generate Image"
                  className={cn(
                    "px-6 h-11 rounded-xl font-medium flex items-center justify-center gap-2 transition-all",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    !isAllowed 
                      ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                      : "bg-white text-black hover:bg-gray-100"
                  )}
                >
                  {isGenerating ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : !isAllowed ? (
                    <>
                      <Lock size={14} />
                      <span>Limité</span>
                    </>
                  ) : (
                    <>
                      <span>Générer</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
