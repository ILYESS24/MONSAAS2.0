/**
 * Sign Up Page - Aurion Studio
 * 
 * Optimisé pour la conversion avec bénéfices immédiats et preuve sociale.
 */

import { SignUp as ClerkSignUp } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Zap, Shield, Clock } from "lucide-react";
import LavaLampBackground from "@/components/fabrica/LavaLampBackground";
import { SEO, seoConfigs } from "@/components/common/SEO";

const benefits = [
  "Accès immédiat aux 5 outils",
  "Aucune carte bancaire requise",
  "Projets et données sécurisées",
  "Support communautaire inclus",
];

const SignUp = () => {
  return (
    <div className="relative min-h-screen bg-black flex flex-col lg:flex-row items-center justify-center px-6 py-12 font-body">
      {/* SEO Component */}
      <SEO {...seoConfigs.signUp} />
      
      <LavaLampBackground />

      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
      </div>

      {/* Left Side - Benefits (hidden on mobile) */}
      <div className="hidden lg:block relative z-10 w-full max-w-md mr-12">
        <h1 className="text-4xl font-display font-bold text-white mb-4">
          Rejoignez <span className="text-[#D4FF00]">50 000+</span> développeurs
        </h1>
        <p className="text-white/60 text-lg mb-8">
          Créez votre compte en 30 secondes et commencez à développer plus vite dès aujourd'hui.
        </p>
        
        {/* Benefits List */}
        <div className="space-y-4 mb-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="p-1 bg-[#D4FF00]/20 rounded-full">
                <Check className="w-4 h-4 text-[#D4FF00]" />
              </div>
              <span className="text-white/80">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex -space-x-2">
              {[1,2,3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 border-2 border-black" />
              ))}
            </div>
            <div className="flex">
              {[1,2,3,4,5].map((i) => (
                <span key={i} className="text-[#D4FF00]">★</span>
              ))}
            </div>
          </div>
          <p className="text-sm text-white/60">
            "Aurion a changé ma façon de travailler. Je gagne au moins 10h/semaine."
          </p>
          <p className="text-xs text-white/40 mt-1">— Marc D., Développeur Full-stack</p>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="relative z-10 w-full max-w-md">
        {/* Mobile Header */}
        <div className="lg:hidden text-center mb-8">
          <Link to="/" className="text-white text-3xl font-display font-bold mb-2 block">
            aurion<span className="text-sm align-super">®</span> Studio
          </Link>
          <p className="text-white/60">Créez votre compte gratuit</p>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block text-center mb-6">
          <Link to="/" className="text-white text-2xl font-display font-bold mb-2 block">
            aurion<span className="text-sm align-super">®</span> Studio
          </Link>
          <div className="flex justify-center gap-4 text-xs text-white/40 mt-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#D4FF00]" />
              Setup en 30 sec
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-[#D4FF00]" />
              100% gratuit
            </span>
          </div>
        </div>

        {/* Clerk Sign Up */}
        <ClerkSignUp
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
          signInUrl="/sign-in"
          forceRedirectUrl="/dashboard"
        />

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-white/40 text-sm">
            Déjà un compte ?{" "}
            <Link to="/sign-in" className="text-[#D4FF00] hover:underline font-medium">
              Se connecter
            </Link>
          </p>
          <p className="text-white/30 text-xs mt-4">
            En créant un compte, vous acceptez nos{" "}
            <Link to="/terms" className="text-white/50 hover:text-white/70">CGU</Link>
            {" "}et notre{" "}
            <Link to="/privacy" className="text-white/50 hover:text-white/70">politique de confidentialité</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
