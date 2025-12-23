/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Sparkles, 
  Loader2, 
  ChevronDown, 
  ArrowRight,
  Video,
  Film,
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
    <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2 md:mb-4 text-gray-400 border-2 border-black/10">
      <Icon size={20} className="md:w-6 md:h-6" strokeWidth={1.5} />
    </div>
    <h3 className="text-xs md:text-sm font-medium text-gray-600 text-center">{title}</h3>
  </motion.div>
);

const PromptPill = ({ label, onClick }: { label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-full border-2 border-black/10 text-[10px] md:text-xs text-gray-500 border border-gray-100 transition-colors flex items-center gap-1 whitespace-nowrap"
  >
    <Film size={10} className="text-gray-400 hidden sm:block" />
    {label}
  </button>
);

export default function VideoCreation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [prompt, setPrompt] = useState(location.state?.initialPrompt || "");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [selectedStyle, setSelectedStyle] = useState("Cinematic");
  const [selectedModel, setSelectedModel] = useState("AURION Video 2.0");

  const { refetch: refetchGenerations } = useGenerations();
  
  // Système de plan et crédits
  const { creditsRemaining } = useUserPlan();
  const { accessCheck, checkAndConsume, isAllowed } = useToolAccess('video_generation');
  const videoCost = TOOL_COSTS.video_generation;

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
      // Generate a cinematic thumbnail as video preview
      const apiResult = await generateImageWithFreepik({
        prompt: `Cinematic film still, ${prompt.trim()}, dramatic lighting, 16:9 aspect ratio, movie scene`,
        styling: { style: 'photo' },
        image: { size: 'landscape_16_9' },
        num_images: 1,
      });

      // 2. ✅ SUCCÈS API : Consommer les crédits APRÈS
      const consumeResult = await checkAndConsume({ prompt: prompt.trim(), model: selectedModel });
      if (!consumeResult.success) {
        // API a réussi mais débit impossible (rare) - rollback visuel
        toast({
          title: "Erreur système",
          description: "La vidéo a été générée mais la consommation de crédits a échoué. Contactez le support.",
          variant: "destructive",
        });
        return;
      }

      if (apiResult.data?.[0]?.base64) {
        const imageUrl = `data:image/png;base64,${apiResult.data[0].base64}`;
        
        const newGen: Generation = {
          id: crypto.randomUUID(),
          user_id: 'local',
          type: 'video',
          prompt: prompt.trim(),
          result_url: imageUrl,
          status: 'completed',
          metadata: { style: selectedStyle, note: 'Video thumbnail preview' },
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
      }
      setPrompt("");
    } catch (err) {
      toast({ title: "Erreur", description: "La génération a échoué.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, toast, refetchGenerations, selectedStyle, selectedModel, checkAndConsume, creditsRemaining, videoCost]); // accessCheck values are derived from checkAndConsume

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative overflow-y-auto overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-purple-50 to-transparent opacity-50" />
        <div className="absolute -left-20 top-1/3 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-50 rounded-full blur-[80px] md:blur-[100px] opacity-60" />
        <div className="absolute -right-20 bottom-1/3 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-indigo-50 rounded-full blur-[100px] md:blur-[120px] opacity-40" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-4 md:p-8 pb-8 md:pb-12">
        
        {/* Video Icon Sphere */}
        <div className="mb-8 md:mb-12 relative">
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-purple-200 via-purple-400 to-indigo-500 shadow-[inset_-6px_-6px_12px_rgba(0,0,0,0.1),6px_6px_20px_rgba(0,0,0,0.15)] md:shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.1),10px_10px_30px_rgba(0,0,0,0.15)] flex items-center justify-center animate-float">
             <Video size={28} className="text-white md:w-10 md:h-10" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold text-gray-900 mb-4 md:mb-6 tracking-tight text-center px-4">
          Bring Ideas to Motion
        </h1>
        
        <p className="text-gray-500 text-center max-w-2xl mb-8 md:mb-16 leading-relaxed text-sm md:text-base px-4">
          Transform your concepts into stunning cinematic videos. Describe your vision and let AURION animate your imagination.
        </p>

        {/* Suggestion Cards */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-6 mb-8 md:mb-16 w-full max-w-3xl px-4">
          <SuggestionCard 
            icon={Film} 
            title="Cinematic Short Film" 
            onClick={() => setPrompt("A cinematic short film about...")} 
          />
          <SuggestionCard 
            icon={Sparkles} 
            title="Product Animation" 
            onClick={() => setPrompt("Product animation showcasing...")} 
          />
          <SuggestionCard 
            icon={Video} 
            title="Social Media Clip" 
            onClick={() => setPrompt("A viral social media clip featuring...")} 
          />
        </div>

        {/* Prompt Input Area */}
        <div className="w-full max-w-3xl bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-3 md:p-4 transition-all hover:shadow-2xl mx-4">
          {/* Pills */}
          <div className="flex gap-2 mb-3 md:mb-4 px-1 md:px-2 overflow-x-auto no-scrollbar">
            <PromptPill label="Drone flying over mountains" onClick={() => setPrompt("Drone flying over mountains at sunset")} />
            <PromptPill label="Futuristic city timelapse" onClick={() => setPrompt("Futuristic city timelapse")} />
            <PromptPill label="Ocean waves in slow motion" onClick={() => setPrompt("Ocean waves in slow motion")} />
          </div>

          <div className="relative">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the video you want to create..." 
              className="w-full min-h-[50px] md:min-h-[60px] bg-transparent border-none text-gray-800 placeholder:text-gray-400 text-base md:text-lg resize-none focus:ring-0 p-2"
            />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-2 pt-2 border-t border-gray-50">
              {/* Style/Model Selectors */}
              <div className="flex items-center gap-2 flex-wrap">
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-[10px] md:text-xs font-medium text-gray-600 transition-colors border-2 border-black/10">
                  <Link size={12} />
                  <span className="hidden sm:inline">{selectedStyle}</span>
                  <ChevronDown size={10} />
                </button>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-[10px] md:text-xs font-medium text-gray-600 transition-colors border-2 border-black/10">
                  <Sparkles size={12} />
                  <span className="hidden sm:inline">{selectedModel}</span>
                  <ChevronDown size={10} />
                </button>
                <button className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-50 text-xs font-medium text-gray-500 transition-colors border-2 border-black/10">
                  <History size={12} />
                  Prompt Library
                </button>
              </div>

              {/* Generate Button with Credit Info */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {/* Credit Cost Badge */}
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 rounded-full">
                  <Zap size={10} className="text-purple-600" />
                  <span className="text-[10px] font-bold text-purple-600">{videoCost}</span>
                </div>
                {/* Limits Info */}
                {/* Limites journalières supprimées temporairement */}
                <span className="text-xs text-gray-300 hidden sm:block">{creditsRemaining} crédits</span>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !isAllowed}
                  aria-label="Generate Video"
                  className={cn(
                    "w-full sm:w-auto sm:px-4 h-10 rounded-full text-white flex items-center justify-center gap-2 transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed",
                    !isAllowed 
                      ? "bg-red-500" 
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
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
