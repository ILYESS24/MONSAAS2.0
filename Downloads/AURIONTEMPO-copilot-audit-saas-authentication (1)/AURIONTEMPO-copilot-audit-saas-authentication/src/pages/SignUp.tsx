import { SignUp as ClerkSignUp } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import LavaLampBackground from "@/components/fabrica/LavaLampBackground";

const SignUp = () => {
  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center px-6 py-12 font-body">
      <LavaLampBackground />

      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
      </div>

      <div className="relative z-10 mb-8 text-center">
        <h1 className="text-white text-3xl font-display font-bold mb-2">
          aurion<span className="text-sm align-super">®</span> Studio
        </h1>
        <p className="text-white/60">Créez votre compte pour commencer</p>
      </div>

      <div className="relative z-10">
        <ClerkSignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-neutral-900/90 backdrop-blur-xl border border-white/10 shadow-2xl",
              headerTitle: "text-white font-display",
              headerSubtitle: "text-white/60",
              socialButtonsBlockButton: "bg-white/10 border-white/20 text-white hover:bg-white/20",
              socialButtonsBlockButtonText: "text-white",
              dividerLine: "bg-white/20",
              dividerText: "text-white/40",
              formFieldLabel: "text-white/80",
              formFieldInput: "bg-white/5 border-white/20 text-white placeholder:text-white/40",
              formButtonPrimary: "bg-white text-black hover:bg-white/90",
              footerActionLink: "text-white hover:text-white/80",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-white/60 hover:text-white",
            }
          }}
          signInUrl="/sign-in"
          forceRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
};

export default SignUp;
