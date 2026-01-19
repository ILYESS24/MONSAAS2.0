/**
 * UpgradePrompt Component
 * 
 * Displays when users try to access features not available in their plan.
 * Shows what they're missing and prompts upgrade.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, ArrowUpRight, Zap, Shield, Crown, Rocket } from 'lucide-react';
import { SubscriptionPlanId, SUBSCRIPTION_PLANS } from '@/lib/subscription';

interface UpgradePromptProps {
  toolName: string;
  reason?: string;
  requiredPlan?: SubscriptionPlanId;
  currentPlan: SubscriptionPlanId;
}

const PLAN_ICONS: Record<SubscriptionPlanId, React.ElementType> = {
  free: Zap,
  creator: Shield,
  pro: Crown,
  enterprise: Rocket,
};

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  toolName,
  reason,
  requiredPlan = 'creator',
  currentPlan,
}) => {
  const targetPlan = SUBSCRIPTION_PLANS[requiredPlan];
  const Icon = PLAN_ICONS[requiredPlan];
  
  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 text-center"
      >
        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-red-400" />
        </div>
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2">
          Accès restreint
        </h1>
        
        <p className="text-white/60 mb-2">
          {toolName} n'est pas disponible dans votre plan actuel.
        </p>
        
        {reason && (
          <p className="text-sm text-white/40 mb-6">
            {reason}
          </p>
        )}
        
        {/* Current vs Required Plan */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-white/40">Votre plan actuel</span>
            <span className="text-white/60 font-medium">
              {SUBSCRIPTION_PLANS[currentPlan].name}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/40">Plan requis</span>
            <span className="text-[#D4FF00] font-medium flex items-center gap-2">
              <Icon className="w-4 h-4" />
              {targetPlan.name}
            </span>
          </div>
        </div>
        
        {/* Upgrade Benefits */}
        <div className="text-left mb-6">
          <p className="text-sm text-white/60 mb-3">
            En passant à {targetPlan.name}, vous débloquez :
          </p>
          <ul className="space-y-2">
            {targetPlan.id === 'creator' && (
              <>
                <li className="flex items-center gap-2 text-sm text-white/70">
                  <div className="w-1.5 h-1.5 bg-[#D4FF00] rounded-full" />
                  Code Editor avec édition + AI autocomplete
                </li>
                <li className="flex items-center gap-2 text-sm text-white/70">
                  <div className="w-1.5 h-1.5 bg-[#D4FF00] rounded-full" />
                  Agent AI (50 requêtes/mois)
                </li>
                <li className="flex items-center gap-2 text-sm text-white/70">
                  <div className="w-1.5 h-1.5 bg-[#D4FF00] rounded-full" />
                  App Builder (prototypes)
                </li>
              </>
            )}
            {targetPlan.id === 'pro' && (
              <>
                <li className="flex items-center gap-2 text-sm text-white/70">
                  <div className="w-1.5 h-1.5 bg-[#D4FF00] rounded-full" />
                  Workflow Automation
                </li>
                <li className="flex items-center gap-2 text-sm text-white/70">
                  <div className="w-1.5 h-1.5 bg-[#D4FF00] rounded-full" />
                  Monitoring Dashboard
                </li>
                <li className="flex items-center gap-2 text-sm text-white/70">
                  <div className="w-1.5 h-1.5 bg-[#D4FF00] rounded-full" />
                  Agent AI (500 requêtes/mois)
                </li>
              </>
            )}
            {targetPlan.id === 'enterprise' && (
              <>
                <li className="flex items-center gap-2 text-sm text-white/70">
                  <div className="w-1.5 h-1.5 bg-[#D4FF00] rounded-full" />
                  Agent AI illimité + fine-tuning
                </li>
                <li className="flex items-center gap-2 text-sm text-white/70">
                  <div className="w-1.5 h-1.5 bg-[#D4FF00] rounded-full" />
                  SSO / SAML / SCIM
                </li>
                <li className="flex items-center gap-2 text-sm text-white/70">
                  <div className="w-1.5 h-1.5 bg-[#D4FF00] rounded-full" />
                  Account Manager dédié
                </li>
              </>
            )}
          </ul>
        </div>
        
        {/* CTA Buttons */}
        <div className="space-y-3">
          <Link
            to="/contact"
            className="block w-full bg-[#D4FF00] text-black py-3 px-6 rounded-xl font-medium hover:bg-[#E5FF4D] transition-colors flex items-center justify-center gap-2"
          >
            Passer à {targetPlan.name}
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          
          <Link
            to="/dashboard"
            className="block w-full bg-white/10 text-white py-3 px-6 rounded-xl font-medium hover:bg-white/20 transition-colors"
          >
            Retour au Dashboard
          </Link>
        </div>
        
        {/* Price hint */}
        <p className="text-xs text-white/40 mt-4">
          À partir de €{targetPlan.price}/mois
        </p>
      </motion.div>
    </div>
  );
};

export default UpgradePrompt;
