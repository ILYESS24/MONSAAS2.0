/**
 * QuotaExceeded Component
 * 
 * Displays when users have exceeded their quota limits.
 * Shows current usage and prompts upgrade.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowUpRight, RefreshCw } from 'lucide-react';
import { 
  SubscriptionPlanId, 
  SUBSCRIPTION_PLANS, 
  useSubscriptionStore,
  formatLimit 
} from '@/lib/subscription';

interface QuotaExceededProps {
  toolName: string;
  quotaType: 'chat' | 'agentAI' | 'canvas' | 'workflows' | 'projects' | 'storage';
  currentUsage: number;
  maxAllowed: number;
  resetPeriod?: 'daily' | 'monthly' | 'none';
  nextReset?: string;
}

export const QuotaExceeded: React.FC<QuotaExceededProps> = ({
  toolName,
  quotaType,
  currentUsage,
  maxAllowed,
  resetPeriod = 'none',
  nextReset,
}) => {
  const currentPlan = useSubscriptionStore((s) => s.currentPlan);
  
  // Find the next plan that offers more
  const getNextPlan = (): SubscriptionPlanId => {
    const planOrder: SubscriptionPlanId[] = ['free', 'creator', 'pro', 'enterprise'];
    const currentIndex = planOrder.indexOf(currentPlan);
    
    for (let i = currentIndex + 1; i < planOrder.length; i++) {
      return planOrder[i];
    }
    
    return 'enterprise';
  };
  
  const nextPlan = getNextPlan();
  const nextPlanInfo = SUBSCRIPTION_PLANS[nextPlan];
  
  // Get the new limit in the upgraded plan
  const getUpgradedLimit = (): number | string => {
    const limits = nextPlanInfo.limits;
    switch (quotaType) {
      case 'chat':
        return limits.aurionChat.maxMessagesPerDay === Infinity ? 'Illimité' : limits.aurionChat.maxMessagesPerDay;
      case 'agentAI':
        return limits.agentAI.maxRequestsPerMonth === Infinity ? 'Illimité' : limits.agentAI.maxRequestsPerMonth;
      case 'canvas':
        return limits.intelligentCanvas.maxBoards === Infinity ? 'Illimité' : limits.intelligentCanvas.maxBoards;
      case 'workflows':
        return limits.workflow.maxWorkflows === Infinity ? 'Illimité' : limits.workflow.maxWorkflows;
      case 'projects':
        return limits.maxProjects === Infinity ? 'Illimité' : limits.maxProjects;
      case 'storage':
        return formatLimit(limits.maxStorageMB);
      default:
        return 'Plus';
    }
  };
  
  const quotaLabels: Record<string, string> = {
    chat: 'messages',
    agentAI: 'requêtes AI',
    canvas: 'boards',
    workflows: 'workflows',
    projects: 'projets',
    storage: 'Mo utilisés',
  };
  
  const resetLabels: Record<string, string> = {
    daily: 'Se réinitialise chaque jour',
    monthly: 'Se réinitialise chaque mois',
    none: '',
  };
  
  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 text-center"
      >
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
        </div>
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2">
          Quota dépassé
        </h1>
        
        <p className="text-white/60 mb-6">
          Vous avez atteint votre limite pour {toolName}.
        </p>
        
        {/* Usage Progress */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/40">Utilisation actuelle</span>
            <span className="text-sm font-medium text-white">
              {currentUsage} / {maxAllowed} {quotaLabels[quotaType]}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-red-500 rounded-full transition-all"
              style={{ width: '100%' }}
            />
          </div>
          
          {resetPeriod !== 'none' && (
            <p className="text-xs text-white/40 flex items-center gap-1 justify-center">
              <RefreshCw className="w-3 h-3" />
              {resetLabels[resetPeriod]}
              {nextReset && ` - Prochain reset: ${nextReset}`}
            </p>
          )}
        </div>
        
        {/* Upgrade Benefits */}
        <div className="text-left mb-6">
          <p className="text-sm text-white/60 mb-3">
            En passant à {nextPlanInfo.name}:
          </p>
          
          <div className="bg-gradient-to-r from-[#D4FF00]/10 to-green-500/10 border border-[#D4FF00]/30 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Nouvelle limite</span>
              {(() => {
                const upgradedLimit = getUpgradedLimit();
                return (
                  <span className="text-lg font-bold text-[#D4FF00]">
                    {upgradedLimit} {typeof upgradedLimit === 'number' ? quotaLabels[quotaType] : ''}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>
        
        {/* CTA Buttons */}
        <div className="space-y-3">
          <Link
            to="/contact"
            className="block w-full bg-[#D4FF00] text-black py-3 px-6 rounded-xl font-medium hover:bg-[#E5FF4D] transition-colors flex items-center justify-center gap-2"
          >
            Augmenter mes quotas
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          
          <Link
            to="/dashboard"
            className="block w-full bg-white/10 text-white py-3 px-6 rounded-xl font-medium hover:bg-white/20 transition-colors"
          >
            Retour au Dashboard
          </Link>
        </div>
        
        {/* Current Plan info */}
        <p className="text-xs text-white/40 mt-4">
          Plan actuel: {SUBSCRIPTION_PLANS[currentPlan].name} • €{SUBSCRIPTION_PLANS[currentPlan].price}/mois
        </p>
      </motion.div>
    </div>
  );
};

export default QuotaExceeded;
