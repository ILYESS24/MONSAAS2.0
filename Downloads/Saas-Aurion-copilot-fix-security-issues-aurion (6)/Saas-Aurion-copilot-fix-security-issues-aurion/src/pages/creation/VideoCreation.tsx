/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Sparkles, 
  Loader2, 
  ChevronDown, 
  ArrowRight,
  Video,
  Film,
  Zap,
  Lock,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  ArrowLeft,
  Play,
  Clapperboard,
  Wand2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { 
  generateImageWithFreepik, 
  startVideoGeneration, 
  checkVideoStatus,
  VIDEO_MODELS,
  type VideoModelId,
  type VideoGenerationResult
} from "@/services/ai-api";
import { useGenerations } from "@/hooks/use-data";
import { Generation } from "@/types/database";
import { localStorageService } from "@/services/mock-data";
import { useUserPlan, useToolAccess } from "@/hooks/use-plan";
import { TOOL_COSTS } from "@/types/plans";

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
    {/* Subtle purple glow effect on hover */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500/20 to-indigo-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center mb-4 text-purple-400 group-hover:text-purple-300 group-hover:border-purple-400/30 transition-all">
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
  onSelect,
  disabled 
}: { 
  selectedModel: VideoModelId, 
  onSelect: (model: VideoModelId) => void,
  disabled?: boolean 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentModel = VIDEO_MODELS.find(m => m.id === selectedModel) || VIDEO_MODELS[0];
  
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
              className="absolute top-full left-0 mt-2 w-80 bg-[#1a1a1a]/95 backdrop-blur-xl rounded-xl border border-white/[0.1] shadow-2xl overflow-hidden z-20"
            >
              <div className="p-3 border-b border-white/[0.08]">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Modèles Vidéo</p>
              </div>
              <div className="py-1 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {VIDEO_MODELS.map((model) => {
                  const isSelected = model.id === selectedModel;
                  
                  return (
                    <button
                      key={model.id}
                      onClick={() => { onSelect(model.id); setIsOpen(false); }}
                      className={cn(
                        "w-full px-4 py-3 flex items-start gap-3 hover:bg-white/[0.05] transition-colors text-left",
                        isSelected && "bg-purple-500/10"
                      )}
                    >
                      <span className="text-lg">{model.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-medium", isSelected ? "text-purple-400" : "text-white/90")}>{model.name}</span>
                          {isSelected && <CheckCircle size={14} className="text-purple-400" />}
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

export default function VideoCreation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [prompt, setPrompt] = useState(location.state?.initialPrompt || "");
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>("");
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  
  const [selectedStyle, setSelectedStyle] = useState("Cinematic");
  const [selectedModel, setSelectedModel] = useState<VideoModelId>("kling-v2");
  const [duration, setDuration] = useState(5);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');

  const { refetch: refetchGenerations } = useGenerations();
  
  // Système de plan et crédits
  const { creditsRemaining } = useUserPlan();
  const { accessCheck, checkAndConsume, isAllowed } = useToolAccess('video_generation');
  const videoCost = TOOL_COSTS.video_generation;

  // Handle image upload
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({ title: "Erreur", description: "Veuillez sélectionner une image", variant: "destructive" });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setSourceImage(base64);
    };
    reader.readAsDataURL(file);
  }, [toast]);

  // Poll for video status
  useEffect(() => {
    if (!currentTaskId || !isGenerating) return;
    
    const pollInterval = setInterval(async () => {
      try {
        const status = await checkVideoStatus(currentTaskId, selectedModel);
        setGenerationStatus(`Status: ${status.status}`);
        
        if (status.status === 'completed' && status.video_url) {
          clearInterval(pollInterval);
          setIsGenerating(false);
          setCurrentTaskId(null);
          
          // Save generation
          const newGen: Generation = {
            id: crypto.randomUUID(),
            user_id: 'local',
            type: 'video',
            prompt: prompt.trim(),
            result_url: status.video_url,
            status: 'completed',
            metadata: { 
              style: selectedStyle, 
              model: selectedModel,
              duration,
              aspect_ratio: aspectRatio
            },
            created_at: new Date().toISOString(),
          };
          
          const existingGens = localStorageService.getGenerations();
          existingGens.unshift(newGen);
          localStorageService.saveGenerations(existingGens);
          refetchGenerations();
          
          toast({ 
            title: "Vidéo générée !", 
            description: `${creditsRemaining - videoCost} crédits restants.` 
          });
        } else if (status.status === 'failed') {
          clearInterval(pollInterval);
          setIsGenerating(false);
          setCurrentTaskId(null);
          toast({ 
            title: "Échec", 
            description: status.error || "La génération de vidéo a échoué", 
            variant: "destructive" 
          });
        }
      } catch (error) {
        // Continue polling on transient errors - logged for debugging
        // eslint-disable-next-line no-console
        if (import.meta.env.DEV) console.warn('[VideoCreation] Poll warning:', error);
      }
    }, 5000); // Poll every 5 seconds
    
    return () => clearInterval(pollInterval);
  }, [currentTaskId, isGenerating, selectedModel, prompt, selectedStyle, duration, aspectRatio, refetchGenerations, toast, creditsRemaining, videoCost]);

  const handleGenerate = useCallback(async () => {
    // Validation
    if (!sourceImage && !prompt.trim()) {
      toast({ 
        title: "Image requise", 
        description: "Uploadez une image ou générez-en une d'abord avec un prompt", 
        variant: "destructive" 
      });
      return;
    }

    // Check access
    if (!accessCheck?.allowed) {
      toast({
        title: "Accès refusé",
        description: accessCheck?.reason || "Accès non autorisé",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationStatus("Initialisation...");

    try {
      let imageForVideo = sourceImage;
      
      // If no source image, generate one first
      if (!imageForVideo && prompt.trim()) {
        setGenerationStatus("Génération de l'image source...");
        const imageResult = await generateImageWithFreepik({
          prompt: `Cinematic film still, ${prompt.trim()}, dramatic lighting, high quality`,
          styling: { style: 'photo' },
          image: { size: aspectRatio === '16:9' ? 'landscape_16_9' : aspectRatio === '9:16' ? 'portrait_9_16' : 'square_1_1' },
          num_images: 1,
        });
        
        if (imageResult.data?.[0]?.base64) {
          imageForVideo = `data:image/png;base64,${imageResult.data[0].base64}`;
        } else {
          throw new Error("Échec de la génération de l'image source");
        }
      }
      
      if (!imageForVideo) {
        throw new Error("Aucune image disponible pour la génération vidéo");
      }
      
      setGenerationStatus("Démarrage de la génération vidéo...");
      
      // Start video generation
      const result = await startVideoGeneration({
        image: imageForVideo,
        prompt: prompt.trim() || undefined,
        model: selectedModel,
        duration,
        aspect_ratio: aspectRatio,
      });
      
      if (result.taskId) {
        setCurrentTaskId(result.taskId);
        setGenerationStatus("Génération en cours...");
        
        // Consume credits after successful API call
        const consumeResult = await checkAndConsume({ prompt: prompt.trim(), model: selectedModel });
        if (!consumeResult.success) {
          toast({
            title: "Avertissement",
            description: "La vidéo est en cours de génération mais la consommation de crédits a échoué.",
            variant: "destructive",
          });
        }
      } else if (result.video_url) {
        // Video completed immediately (rare)
        setIsGenerating(false);
        
        const newGen: Generation = {
          id: crypto.randomUUID(),
          user_id: 'local',
          type: 'video',
          prompt: prompt.trim(),
          result_url: result.video_url,
          status: 'completed',
          metadata: { style: selectedStyle, model: selectedModel },
          created_at: new Date().toISOString(),
        };
        
        const existingGens = localStorageService.getGenerations();
        existingGens.unshift(newGen);
        localStorageService.saveGenerations(existingGens);
        refetchGenerations();
        
        const consumeResult = await checkAndConsume({ prompt: prompt.trim(), model: selectedModel });
        
        toast({ 
          title: "Vidéo générée !", 
          description: `${creditsRemaining - videoCost} crédits restants.` 
        });
        
        setPrompt("");
        setSourceImage(null);
      }
    } catch (err: any) {
      setIsGenerating(false);
      setCurrentTaskId(null);
      toast({ 
        title: "Erreur", 
        description: err.message || "La génération a échoué.", 
        variant: "destructive" 
      });
    }
  }, [sourceImage, prompt, toast, selectedModel, duration, aspectRatio, accessCheck, checkAndConsume, refetchGenerations, selectedStyle, creditsRemaining, videoCost]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] relative overflow-y-auto overflow-x-hidden">
      
      {/* Premium Dark Background with Purple Radial Gradient */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Central radial glow - purple tint for video */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.08)_0%,_rgba(79,70,229,0.04)_40%,_transparent_70%)]" />
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
            Bring Ideas to<br />
            <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Motion
            </span>
          </h1>
          
          <p className="text-gray-500 text-center max-w-xl mx-auto leading-relaxed text-sm md:text-base px-4">
            Transform your images into stunning cinematic videos. Upload an image or let AURION create one for you.
          </p>
        </motion.div>

        {/* Image Upload Section - Premium Glass Design */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="w-full max-w-3xl mb-8 px-4"
        >
          <label className={cn(
            "relative flex items-center justify-center gap-4 p-6 md:p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300",
            sourceImage 
              ? "border-purple-500/40 bg-purple-500/5" 
              : "border-white/[0.1] hover:border-purple-500/30 hover:bg-white/[0.02]",
            isGenerating && "pointer-events-none opacity-60"
          )}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isGenerating}
            />
            {sourceImage ? (
              <div className="flex items-center gap-4">
                <img src={sourceImage} alt="Source" className="w-16 h-16 object-cover rounded-xl border border-white/[0.1]" />
                <div>
                  <div className="flex items-center gap-2 text-purple-400 mb-1">
                    <CheckCircle size={16} />
                    <span className="text-sm font-medium">Image uploadée</span>
                  </div>
                  <p className="text-xs text-gray-500">Cliquez pour changer</p>
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); setSourceImage(null); }}
                  className="ml-4 p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-white/[0.05] border border-white/[0.1] rounded-xl flex items-center justify-center">
                  <Upload size={24} className="text-gray-500" />
                </div>
                <p className="text-sm text-gray-400 mb-1">Glissez une image ou cliquez pour uploader</p>
                <p className="text-xs text-gray-600">Optionnel - Utilisez un prompt pour générer l'image source</p>
              </div>
            )}
          </label>
        </motion.div>

        {/* Suggestion Cards Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 md:gap-5 mb-10 md:mb-14 w-full max-w-4xl px-4"
        >
          <SuggestionCard 
            icon={Film} 
            title="Cinematic Film" 
            description="Smooth camera movements"
            onClick={() => setPrompt("Smooth cinematic camera movement, dramatic lighting")} 
          />
          <SuggestionCard 
            icon={Clapperboard} 
            title="Product Showcase" 
            description="Professional animations"
            onClick={() => setPrompt("Rotating product showcase, professional studio lighting")} 
          />
          <SuggestionCard 
            icon={Play} 
            title="Social Media" 
            description="Dynamic short clips"
            onClick={() => setPrompt("Dynamic motion, engaging transitions, vertical format")} 
          />
          <SuggestionCard 
            icon={ImageIcon} 
            title="Create Image" 
            description="Switch to image mode"
            onClick={() => navigate('/creation')} 
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
                placeholder={sourceImage ? "Décrivez le mouvement souhaité..." : "Décrivez l'image et le mouvement souhaités..."} 
                className="w-full min-h-[80px] md:min-h-[100px] bg-transparent border-none text-white placeholder:text-gray-600 text-base md:text-lg resize-none focus:ring-0 focus:outline-none p-0"
              />
            </div>
            
            {/* Generation Status */}
            {isGenerating && generationStatus && (
              <div className="flex items-center gap-3 px-4 py-3 bg-purple-500/10 border border-purple-500/20 rounded-xl mb-4">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span className="text-sm text-purple-300">{generationStatus}</span>
              </div>
            )}
            
            {/* Bottom Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/[0.08]">
              
              {/* Left: Model & Aspect Ratio Selectors */}
              <div className="flex items-center gap-3 flex-wrap">
                <ModelSelector 
                  selectedModel={selectedModel}
                  onSelect={setSelectedModel}
                  disabled={isGenerating}
                />
                
                {/* Aspect Ratio Selector */}
                <button 
                  onClick={() => setAspectRatio(aspectRatio === '16:9' ? '9:16' : aspectRatio === '9:16' ? '1:1' : '16:9')}
                  disabled={isGenerating}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] text-sm font-medium text-gray-300 transition-all",
                    isGenerating && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <ImageIcon size={14} />
                  <span>{aspectRatio}</span>
                </button>
              </div>

              {/* Right: Credits & Generate */}
              <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                {/* Credits Display */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full">
                    <Zap size={12} className="text-purple-400" />
                    <span className="text-xs font-medium text-purple-400">{videoCost} crédits</span>
                  </div>
                  <span className="text-xs text-gray-600 hidden md:block">{creditsRemaining} restants</span>
                </div>
                
                {/* Generate Button */}
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !isAllowed || (!sourceImage && !prompt.trim())}
                  aria-label="Generate Video"
                  className={cn(
                    "px-6 h-11 rounded-xl font-medium flex items-center justify-center gap-2 transition-all",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    !isAllowed 
                      ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                      : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600"
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
