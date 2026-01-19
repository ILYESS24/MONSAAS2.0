/**
 * Sign In Page - Aurion Studio
 * 
 * Optimisé pour la conversion avec bénéfices rappelés et friction minimale.
 */

import { SignIn as ClerkSignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Zap, Users } from "lucide-react";
import LavaLampBackground from "@/components/fabrica/LavaLampBackground";
import { SEO, seoConfigs } from "@/components/common/SEO";

const SignIn = () => {
  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center px-6 py-12 font-body">
      {/* SEO Component */}
      <SEO {...seoConfigs.signIn} />
      
      <LavaLampBackground />

      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="text-white text-3xl font-display font-bold mb-2 block">
            aurion<span className="text-sm align-super">®</span> Studio
          </Link>
          <p className="text-white/60 mb-4">Bon retour parmi nous ! 👋</p>
          
          {/* Trust Indicators */}
          <div className="flex justify-center gap-4 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-[#D4FF00]" />
              Connexion sécurisée
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-[#D4FF00]" />
              50K+ utilisateurs
            </span>
          </div>
        </div>

        {/* Clerk Sign In */}
        <ClerkSignIn
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "bg-neutral-900/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl",
              headerTitle: "text-white font-display text-xl",
              headerSubtitle: "text-white/60",
              socialButtonsBlockButton: "bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors",
              socialButtonsBlockButtonText: "text-white font-medium",
              dividerLine: "bg-white/20",
              dividerText: "text-white/40",
              formFieldLabel: "text-white/80",
              formFieldInput: "bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#D4FF00]/50 rounded-xl",
              formButtonPrimary: "bg-[#D4FF00] text-black hover:bg-[#E5FF4D] font-semibold rounded-xl",
              footerActionLink: "text-[#D4FF00] hover:text-[#E5FF4D]",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-white/60 hover:text-white",
            }
          }}
          signUpUrl="/sign-up"
          forceRedirectUrl="/dashboard"
        />

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-white/40 text-sm">
            Pas encore de compte ?{" "}
            <Link to="/sign-up" className="text-[#D4FF00] hover:underline font-medium">
              Créer un compte gratuitement
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
