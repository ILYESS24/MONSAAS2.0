/**
 * IframePage Component
 * 
 * A reusable page layout for iframe-based tools.
 * This eliminates code duplication across all iframe pages.
 * 
 * Now includes subscription-based access control and quota enforcement.
 */

import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Crown, AlertCircle } from "lucide-react";
import { SecureIframe } from "./SecureIframe";
import { UpgradePrompt } from "./UpgradePrompt";
import { useSubscription } from "@/hooks/useSubscription";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription";

interface IframePageProps {
  title: string;
  src: string;
  brandName?: string;
  toolId?: string; // Used for subscription checking
}

export const IframePage: React.FC<IframePageProps> = ({
  title,
  src,
  brandName = "aurion®",
  toolId,
}) => {
  const navigate = useNavigate();
  const { currentPlan, checkToolAccess, getUsageInfo } = useSubscription();
  
  // Check tool access if toolId provided
  const accessCheck = toolId ? checkToolAccess(toolId) : { accessible: true };
  
  // Get relevant usage info based on tool
  const getToolUsage = () => {
    if (!toolId) return null;
    
    switch (toolId) {
      case 'aurion-chat':
        return getUsageInfo.chat;
      case 'agent-ai':
        return getUsageInfo.agentAI;
      case 'intelligent-canvas':
        return getUsageInfo.canvas;
      default:
        return null;
    }
  };
  
  const toolUsage = getToolUsage();
  
  // If tool is not accessible, show upgrade prompt
  if (!accessCheck.accessible) {
    return (
      <UpgradePrompt
        toolName={title}
        reason={accessCheck.reason}
        requiredPlan={accessCheck.upgradeRequired}
        currentPlan={currentPlan}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header with back button */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-between p-4 md:p-6 border-b border-white/10"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>

        <div className="text-white font-body text-center flex items-center gap-2">
          <span className="text-white text-base md:text-lg font-medium">{title}</span>
          <span className="text-white/60 ml-2 text-sm hidden sm:inline">{brandName}</span>
        </div>

        {/* Usage indicator and plan badge */}
        <div className="flex items-center gap-3">
          {/* Usage indicator for tools with quotas */}
          {toolUsage && toolUsage.max !== Infinity && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
              <div className="flex-1">
                <div className="h-1.5 w-16 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      toolUsage.percentage >= 80 ? 'bg-red-500' : 
                      toolUsage.percentage >= 50 ? 'bg-amber-500' : 'bg-[#D4FF00]'
                    }`}
                    style={{ width: `${Math.min(toolUsage.percentage, 100)}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-white/60">{toolUsage.formatted}</span>
            </div>
          )}
          
          {/* Plan badge */}
          <Link 
            to="/contact"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-xs"
          >
            <Crown className="w-3.5 h-3.5 text-[#D4FF00]" />
            <span className="text-white/70">{SUBSCRIPTION_PLANS[currentPlan].name}</span>
          </Link>
        </div>
      </motion.header>

      {/* Warning banner if approaching quota limit */}
      {toolUsage && toolUsage.percentage >= 80 && toolUsage.max !== Infinity && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-amber-400">
            <AlertCircle className="w-4 h-4" />
            <span>
              Vous approchez de votre limite ({toolUsage.formatted}). 
            </span>
            <Link to="/pricing" className="underline hover:no-underline font-medium">
              Augmenter mes quotas
            </Link>
          </div>
        </motion.div>
      )}

      {/* Secure iframe container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className={`${toolUsage && toolUsage.percentage >= 80 && toolUsage.max !== Infinity 
          ? 'h-[calc(100vh-105px)] md:h-[calc(100vh-121px)]' 
          : 'h-[calc(100vh-65px)] md:h-[calc(100vh-81px)]'
        }`}
      >
        <SecureIframe
          src={src}
          title={title}
          className="w-full h-full"
          sandbox={['allow-scripts', 'allow-same-origin', 'allow-forms', 'allow-popups']}
          allowClipboard={true}
        />
      </motion.div>
    </div>
  );
};

export default IframePage;
