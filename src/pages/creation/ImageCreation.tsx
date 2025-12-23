/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Sparkles, 
  Loader2, 
  ChevronDown, 
  ArrowRight,
  Video,
  Box,
  Link,
  History,
  Zap,
  Lock
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { generateImageWithFreepik } from "@/services/ai-api";
import { useGenerations } from "@/hooks/use-data";
import { Generation } from "@/types/database";
import { localStorageService } from "@/services/mock-data";
import { useUserPlan, useToolAccess } from "@/hooks/use-plan";
import { TOOL_COSTS } from "@/types/plans";

const SuggestionCard = ({ icon: Icon, title, onClick }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 md:p-6 w-full sm:w-48 md:w-64 h-28 md:h-40 bg-white/40 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm cursor-pointer hover:shadow-md hover:border-gray-200 transition-all"
  >
    <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2 md:mb-4 text-gray-400">
      <Icon size={20} className="md:w-6 md:h-6" strokeWidth={1.5} />
    </div>
    <h3 className="text-xs md:text-sm font-medium text-gray-600 text-center">{title}</h3>
  </motion.div>
);

const PromptPill = ({ label, onClick }: { label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-full text-[10px] md:text-xs text-gray-500 border border-gray-100 transition-colors flex items-center gap-1 whitespace-nowrap"
  >
    <Box size={10} className="text-gray-400 hidden sm:block" />
    {label}
  </button>
);

export default function ImageCreation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [prompt, setPrompt] = useState(location.state?.initialPrompt || "");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [selectedStyle, setSelectedStyle] = useState("Realistic");
  const [selectedModel, setSelectedModel] = useState("AURION 4.0");
  const [modelStatuses, setModelStatuses] = useState<Record<string, 'available' | 'rate_limited' | 'error'>>({
    "AURION 4.0": 'available',
    "Midjourney": 'available',
    "DALL-E": 'available',
    "Stable Diffusion": 'available'
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
        console.log('🔄 Rate limit error:', errorMessage);

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
    <div className="flex-1 flex flex-col h-full bg-white relative overflow-y-auto overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-gray-100 to-transparent opacity-50" />
        <div className="absolute -left-20 top-1/3 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-gray-50 rounded-full blur-[80px] md:blur-[100px] opacity-60" />
        <div className="absolute -right-20 bottom-1/3 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-gray-100 rounded-full blur-[100px] md:blur-[120px] opacity-40" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-4 md:p-8 pb-8 md:pb-12">
        
        {/* 3D Sphere */}
        <div className="mb-8 md:mb-12 relative">
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-gray-100 via-gray-300 to-gray-400 shadow-[inset_-6px_-6px_12px_rgba(0,0,0,0.1),6px_6px_20px_rgba(0,0,0,0.1)] md:shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.1),10px_10px_30px_rgba(0,0,0,0.1)] flex items-center justify-center animate-float">
             <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-white via-transparent to-transparent opacity-80" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold text-gray-900 mb-4 md:mb-6 tracking-tight text-center px-4">
          Creating Without Limits
        </h1>
        
        <p className="text-gray-500 text-center max-w-2xl mb-8 md:mb-16 leading-relaxed text-sm md:text-base px-4">
          Starting from an idea, sketch, or image, AURION is your studio for transforming concepts into photorealistic images, 3D models, and videos.
        </p>

        {/* Suggestion Cards */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-6 mb-8 md:mb-16 w-full max-w-3xl px-4">
          <SuggestionCard 
            icon={Box} 
            title="Help Me to Create 3D" 
            onClick={() => setPrompt("Create a 3D model of...")} 
          />
          <SuggestionCard 
            icon={Sparkles} 
            title="Product Design" 
            onClick={() => setPrompt("Product design for...")} 
          />
          <SuggestionCard 
            icon={Video} 
            title="Create Video" 
            onClick={() => navigate('/creation/video')} 
          />
        </div>

        {/* Prompt Input Area */}
        <div className="w-full max-w-3xl bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-3 md:p-4 transition-all hover:shadow-2xl mx-4">
          {/* Pills - Scrollable on mobile */}
          <div className="flex gap-2 mb-3 md:mb-4 px-1 md:px-2 overflow-x-auto no-scrollbar">
            <PromptPill label="Ninja cat eating ramen" onClick={() => setPrompt("Ninja cat eating ramen")} />
            <PromptPill label="Cyberpunk city" onClick={() => setPrompt("Cyberpunk city underwater")} />
            <PromptPill label="Sports car made of fruit" onClick={() => setPrompt("Sports car made of fruit")} />
            <PromptPill label="Castle illustration" onClick={() => setPrompt("Illustration of a castle")} />
          </div>

          <div className="relative">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="How can I help you today?..." 
              className="w-full min-h-[50px] md:min-h-[60px] bg-transparent border-none text-gray-800 placeholder:text-gray-400 text-base md:text-lg resize-none focus:ring-0 p-2"
            />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-2 pt-2 border-t border-gray-50">
              {/* Style/Model Selectors */}
              <div className="flex items-center gap-2 flex-wrap">
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-[10px] md:text-xs font-medium text-gray-600 transition-colors">
                  <Link size={12} />
                  <span className="hidden sm:inline">{selectedStyle}</span>
                  <ChevronDown size={10} />
                </button>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-[10px] md:text-xs font-medium text-gray-600 transition-colors">
                  <Sparkles size={12} />
                  <span className="hidden sm:inline">{selectedModel}</span>
                  {modelStatuses[selectedModel] === 'rate_limited' && (
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" title="Service temporairement indisponible" />
                  )}
                  {modelStatuses[selectedModel] === 'error' && (
                    <div className="w-2 h-2 bg-red-400 rounded-full" title="Service indisponible" />
                  )}
                  <ChevronDown size={10} />
                </button>
                <button className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-50 text-xs font-medium text-gray-500 transition-colors">
                  <History size={12} />
                  Prompt Library
                </button>
              </div>

              {/* Model Status Info */}
              {modelStatuses[selectedModel] === 'rate_limited' && (
                <div className="w-full sm:w-auto text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
                    {selectedModel} est temporairement indisponible. Essayez un autre modèle.
                  </div>
                </div>
              )}

              {modelStatuses[selectedModel] === 'error' && (
                <div className="w-full sm:w-auto text-xs text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-200">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                    {selectedModel} rencontre des problèmes. Veuillez réessayer plus tard.
                  </div>
                </div>
              )}

              {/* Generate Button with Credit Info */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {/* Credit Cost Badge */}
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 rounded-full">
                  <Zap size={10} className="text-purple-600" />
                  <span className="text-[10px] font-bold text-purple-600">{imageCost}</span>
                </div>
                {/* Limits Info */}
                {/* Limites journalières supprimées temporairement */}
                <span className="text-xs text-gray-300 hidden sm:block">{creditsRemaining} crédits</span>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !isAllowed}
                  aria-label="Generate Image"
                  className={cn(
                    "w-full sm:w-auto sm:px-4 h-10 rounded-full text-white flex items-center justify-center gap-2 transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed",
                    !isAllowed ? "bg-red-500" : "bg-black hover:bg-gray-800"
                  )}
                >
                  {isGenerating ? <Loader2 className="animate-spin w-4 h-4" /> : !isAllowed ? (
                    <>
                      <Lock size={14} />
                      <span className="text-sm font-medium">Limité</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-medium">Générer</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
